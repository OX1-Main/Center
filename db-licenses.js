// =============================================================
// OX1 Segurity — Capa de datos de licencias (drop-in para OX1Dashboard)
// -------------------------------------------------------------
// Añade la gestión de licencias/dispositivos/eventos al panel SIN
// tocar db.js. Se carga DESPUÉS de db.js y script.js.
//
// Expone window.LIC con: load, createLicense, updateStatus, renew,
// setMaxDevices, blockDevice, deleteLicense y helpers.
//
// En modo demo (config.js sin rellenar) funciona en memoria.
// En modo real usa el mismo Supabase y las políticas RLS solo-admin
// del schema 01_licenses_schema.sql.
// =============================================================

(() => {
  'use strict';

  const real = window.supabase && typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('https://') && !/YOURPROJECT|YOUR_SUPABASE/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20;

  const supabase = real ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;

  // ---------- demo store ----------
  const M = { licenses: [], devices: [], events: [], offlineTokens: [] };
  const genId = () => 'lic-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const delay = () => wait(60);

  const DATA = { licenses: [], devices: [], events: [], offlineTokens: [] };

  function seedDemo() {
    if (M.licenses.length) return;
    const sales = (window.DB && DB.data && DB.data.sales) || [];
    sales.forEach((s, i) => {
      const lic = {
        id: genId(),
        sale_id: s.id,
        app_id: s.appId || null,
        key: 'OX1-DEMO-' + String(i).padStart(4, '0'),
        plan: s.plan || 'monthly',
        status: s.status === 'suspended' ? 'suspended' : 'active',
        max_devices: 1,
        grace_hours: 72,
        expires_at: s.endDate ? s.endDate + 'T00:00:00Z' : null,
        note: 'Modo demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const dev = {
        id: genId(),
        license_id: lic.id,
        device_id: 'device-demo-' + i,
        fingerprint: 'fp-demo-' + i,
        platform: 'web',
        name: 'Dispositivo demo ' + i,
        last_seen: new Date().toISOString(),
        first_seen: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      };
      const ev = {
        id: i + 1,
        license_id: lic.id,
        device_id: dev.device_id,
        event: 'activate',
        detail: {},
        ip: '127.0.0.1',
        created_at: new Date().toISOString()
      };
      M.licenses.push(lic);
      M.devices.push(dev);
      M.events.push(ev);
    });
    snap();
  }

  const snap = () => {
    DATA.licenses = M.licenses.map(x => ({ ...x }));
    DATA.devices = M.devices.map(x => ({ ...x }));
    DATA.events = M.events.map(x => ({ ...x }));
    DATA.offlineTokens = M.offlineTokens.map(x => ({ ...x }));
  };

  // ---------- helpers ----------
  const genKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const rnd = n => Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => chars[b % chars.length]).join('');
    return `OX1-${rnd(4)}-${rnd(4)}-${rnd(4)}-${rnd(4)}`;
  };

  const mapLic = r => ({ ...r });
  const mapDev = r => ({ ...r });
  const mapEv = r => ({ ...r });

  // ---------- load ----------
  async function load() {
    if (!real) { seedDemo(); return null; }
    const [licenses, devices, events, offlineTokens] = await Promise.all([
      supabase.from('licenses').select('*').order('created_at', { ascending: false }),
      supabase.from('devices').select('*').order('created_at'),
      supabase.from('license_events').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('offline_tokens').select('*').order('created_at', { ascending: false })
    ]);
    for (const r of [licenses, devices, events, offlineTokens]) if (r.error) return { error: r.error.message };
    DATA.licenses = (licenses.data || []).map(mapLic);
    DATA.devices = (devices.data || []).map(mapDev);
    DATA.events = (events.data || []).map(mapEv);
    DATA.offlineTokens = (offlineTokens.data || []).map(mapEv);
    return null;
  }

  // ---------- acciones ----------
  async function createLicense({ saleId, appId, key, plan, maxDevices, graceHours, expiresAt, note }) {
    const row = {
      sale_id: saleId || null,
      app_id: appId || null,
      key,
      plan: plan || 'monthly',
      status: 'active',
      max_devices: Math.max(1, maxDevices || 1),
      grace_hours: Math.max(1, graceHours || 72),
      expires_at: expiresAt || null,
      note: note || null
    };
    if (!real) {
      const r = { id: genId(), ...row, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      M.licenses.unshift(r);
      snap();
      await delay();
      return { data: r, error: null };
    }
    const res = await supabase.from('licenses').insert(row).select().single();
    if (!res.error && res.data) logOwn(res.data.id, 'renew', { note: 'Licencia creada desde el panel' });
    return res;
  }

  async function updateStatus(id, status) {
    if (!real) {
      const l = M.licenses.find(x => x.id === id);
      if (l) { l.status = status; l.updated_at = new Date().toISOString(); }
      snap();
      await delay();
      return { error: null };
    }
    const res = await supabase.from('licenses').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (!res.error) logOwn(id, status, { source: 'panel' });
    return res;
  }

  async function renew(id, expiresAt) {
    if (!real) {
      const l = M.licenses.find(x => x.id === id);
      if (l) { l.expires_at = expiresAt || null; l.status = 'active'; l.updated_at = new Date().toISOString(); }
      snap();
      await delay();
      return { error: null };
    }
    const res = await supabase.from('licenses').update({ expires_at: expiresAt || null, status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
    if (!res.error) logOwn(id, 'renew', { expires_at: expiresAt });
    return res;
  }

  // Renueva varias licencias de golpe: nueva fecha = (hoy o vencimiento
  // actual, el que sea mayor) + N días. Útil para el botón de renovación
  // masiva de licencias próximas a vencer.
  async function renewMany(ids, days) {
    const d = Math.max(1, parseInt(days, 10) || 30);
    const next = lic => {
      const base = lic.expires_at && new Date(lic.expires_at).getTime() > Date.now()
        ? new Date(lic.expires_at) : new Date();
      base.setDate(base.getDate() + d);
      return base.toISOString();
    };
    if (!real) {
      for (const id of ids) {
        const l = M.licenses.find(x => x.id === id);
        if (l) { l.expires_at = next(l); l.status = 'active'; l.updated_at = new Date().toISOString(); }
      }
      snap();
      await delay();
      return { error: null };
    }
    const res = await supabase.from('licenses').select('id, expires_at').in('id', ids);
    if (res.error) return res;
    for (const lic of res.data || []) {
      const n = next(lic);
      await supabase.from('licenses').update({ expires_at: n, status: 'active', updated_at: new Date().toISOString() }).eq('id', lic.id);
      logOwn(lic.id, 'renew', { expires_at: n, bulk: true });
    }
    return { error: null };
  }

  async function setMaxDevices(id, n) {
    const v = Math.max(1, parseInt(n, 10) || 1);
    if (!real) {
      const l = M.licenses.find(x => x.id === id);
      if (l) l.max_devices = v;
      snap();
      await delay();
      return { error: null };
    }
    return supabase.from('licenses').update({ max_devices: v, updated_at: new Date().toISOString() }).eq('id', id);
  }

  async function blockDevice(deviceRowId, blocked) {
    const status = blocked ? 'blocked' : 'active';
    if (!real) {
      const d = M.devices.find(x => x.id === deviceRowId);
      if (d) d.status = status;
      snap();
      await delay();
      return { error: null };
    }
    const d = DATA.devices.find(x => x.id === deviceRowId);
    const res = await supabase.from('devices').update({ status }).eq('id', deviceRowId);
    if (!res.error && d) logOwn(d.license_id, status === 'blocked' ? 'device_blocked' : 'device_unblocked', { device_id: d.device_id });
    return res;
  }

  async function deleteLicense(id) {
    if (!real) {
      M.licenses = M.licenses.filter(x => x.id !== id);
      M.devices = M.devices.filter(x => x.license_id !== id);
      M.events = M.events.filter(x => x.license_id !== id);
      snap();
      await delay();
      return { error: null };
    }
    return supabase.from('licenses').delete().eq('id', id);
  }

  // Log interno desde el panel (solo-acciones admin; las apps registran
  // sus propios eventos vía edge functions).
  async function logOwn(licenseId, event, detail) {
    try {
      await supabase.from('license_events').insert({ license_id: licenseId, event, detail: detail || {} });
    } catch {}
  }

  // -------------------------------------------------------------
  // TOKENS OFFLINE
  // -------------------------------------------------------------
  // La clave privada Ed25519 se guarda SOLO en este navegador (el del
  // admin). Con ella se firman los tokens que el cliente instala en su
  // app. Cada token emitido se registra en offline_tokens para poder
  // revocarlo y ver el histórico.
  //
  // El formato del token es idéntico al de tools/offline-license.py:
  //   { v:1, k: key, d: device_id, a: app_id, e: expires_at, sig }
  //   sig = Ed25519(firma de "k|d|a|e"), base64.
  // =============================================================

  const LS_PRIV = 'ox1_offline_priv';
  const LS_PUB = 'ox1_offline_pub';
  const te = new TextEncoder();

  function b64FromBytes(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function bytesFromB64(b64) {
    const bin = atob(b64.replace(/\s+/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function pemToDer(pem) {
    return bytesFromB64(pem.replace(/-----[^-]+-----/g, ''));
  }

  function derToPem(der, label) {
    const bytes = der instanceof Uint8Array ? der : new Uint8Array(der);
    let b64 = '';
    for (let i = 0; i < bytes.length; i += 48) {
      b64 += b64FromBytes(bytes.subarray(i, i + 48)) + '\n';
    }
    return '-----BEGIN ' + label + '-----\n' + b64 + '-----END ' + label + '-----';
  }

  function ed25519Supported() {
    return typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.sign && crypto.subtle.generateKey;
  }

  // Genera un par nuevo y lo guarda en localStorage.
  async function offlineGenKey() {
    if (!ed25519Supported()) throw new Error('WebCrypto Ed25519 no está disponible en este navegador.');
    const kp = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
    const privDer = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
    const pubRaw = await crypto.subtle.exportKey('raw', kp.publicKey);
    const privPem = derToPem(privDer, 'PRIVATE KEY');
    const pubB64 = b64FromBytes(new Uint8Array(pubRaw));
    localStorage.setItem(LS_PRIV, privPem);
    localStorage.setItem(LS_PUB, pubB64);
    return { privPem, pubB64 };
  }

  // Importa una clave existente (private.pem de offline-keygen.py) +
  // su pública (offline_public.txt). Valida que el par cuadre firmando
  // y verificando un mensaje de prueba.
  async function offlineImportKey(privPem, pubB64) {
    if (!ed25519Supported()) throw new Error('WebCrypto Ed25519 no está disponible en este navegador.');
    const priv = await crypto.subtle.importKey('pkcs8', pemToDer(privPem), { name: 'Ed25519' }, false, ['sign']);
    const pub = await crypto.subtle.importKey('raw', bytesFromB64(pubB64), { name: 'Ed25519' }, false, ['verify']);
    const test = te.encode('ox1-import-test');
    const sig = await crypto.subtle.sign('Ed25519', priv, test);
    const ok = await crypto.subtle.verify('Ed25519', pub, sig, test);
    if (!ok) throw new Error('La clave pública no corresponde a la privada.');
    localStorage.setItem(LS_PRIV, privPem.trim());
    localStorage.setItem(LS_PUB, pubB64.trim());
    return { pubB64: pubB64.trim() };
  }

  function offlineGetPublic() {
    return localStorage.getItem(LS_PUB) || null;
  }

  function offlineGetPrivate() {
    return localStorage.getItem(LS_PRIV) || null;
  }

  function offlineClearKey() {
    localStorage.removeItem(LS_PRIV);
    localStorage.removeItem(LS_PUB);
  }

  // Firma un token offline (payload { k, d, a, e }) con la clave
  // guardada en este navegador. Devuelve el token completo.
  async function offlineSign(payload) {
    const pem = offlineGetPrivate();
    if (!pem) throw new Error('No hay clave privada offline configurada.');
    if (!ed25519Supported()) throw new Error('WebCrypto Ed25519 no está disponible en este navegador.');
    const priv = await crypto.subtle.importKey('pkcs8', pemToDer(pem), { name: 'Ed25519' }, false, ['sign']);
    const canon = [payload.k, payload.d, payload.a || '', payload.e].join('|');
    const sig = await crypto.subtle.sign('Ed25519', priv, te.encode(canon));
    return { v: 1, k: payload.k, d: payload.d, a: payload.a || '', e: payload.e, sig: b64FromBytes(new Uint8Array(sig)) };
  }

  // ---------- persistencia (histórico / revocación) ----------
  async function saveOfflineToken({ licenseId, deviceId, token }) {
    const row = {
      license_id: licenseId,
      device_id: deviceId,
      token,
      sig: token.sig,
      expires_at: token.e,
      status: 'active'
    };
    if (!real) {
      const r = { id: genId(), ...row, created_at: new Date().toISOString() };
      M.offlineTokens.unshift(r);
      snap();
      await delay();
      return { data: r, error: null };
    }
    const res = await supabase.from('offline_tokens').insert(row).select().single();
    if (!res.error && res.data) logOwn(licenseId, 'offline_token', { device_id: deviceId, expires_at: token.e });
    return res;
  }

  async function revokeOfflineToken(id) {
    if (!real) {
      const t = M.offlineTokens.find(x => x.id === id);
      if (t) t.status = 'revoked';
      snap();
      await delay();
      return { error: null };
    }
    const t = DATA.offlineTokens.find(x => x.id === id);
    const res = await supabase.from('offline_tokens').update({ status: 'revoked' }).eq('id', id);
    if (!res.error && t) logOwn(t.license_id, 'offline_token_revoked', { device_id: t.device_id });
    return res;
  }

  const offlineTokensOf = licId => DATA.offlineTokens.filter(t => t.license_id === licId);

  // ---------- consultas para la vista ----------
  const devicesOf = licId => DATA.devices.filter(d => d.license_id === licId);
  const eventsOf = licId => DATA.events.filter(e => e.license_id === licId);
  const lastSeenOf = licId => {
    const ds = devicesOf(licId).filter(d => d.last_seen);
    if (!ds.length) return null;
    return new Date(Math.max(...ds.map(d => new Date(d.last_seen).getTime()))).toISOString();
  };

  // Alertas por licencia (para el panel). Tipos:
  //   expiring       -> vence en ≤7 días y está activa
  //   multi_device   -> 2+ dispositivos activos con la misma clave
  //   multi_ip       -> activaciones/latidos desde 3+ IPs distintas
  //   blocked_device -> hay un dispositivo bloqueado en esa clave
  function alerts() {
    const out = [];
    const week = 7 * 24 * 3600 * 1000;
    for (const lic of DATA.licenses) {
      if (lic.status === 'revoked') continue;
      const devs = devicesOf(lic.id);
      const evs = eventsOf(lic.id);
      const active = devs.filter(d => d.status === 'active').length;
      const blocked = devs.some(d => d.status === 'blocked');
      const ips = new Set(evs.map(e => e.ip).filter(Boolean));
      const exp = lic.expires_at ? new Date(lic.expires_at).getTime() : null;
      if (lic.status === 'active' && exp && exp - Date.now() < week) out.push({ id: lic.id, type: 'expiring' });
      if (active >= 2) out.push({ id: lic.id, type: 'multi_device' });
      if (ips.size >= 3) out.push({ id: lic.id, type: 'multi_ip' });
      if (blocked) out.push({ id: lic.id, type: 'blocked_device' });
    }
    return out;
  }

  window.LIC = {
    isConfigured: real,
    data: DATA,
    load,
    createLicense,
    updateStatus,
    renew,
    renewMany,
    setMaxDevices,
    blockDevice,
    deleteLicense,
    genKey,
    devicesOf,
    eventsOf,
    lastSeenOf,
    alerts,
    offlineGenKey,
    offlineImportKey,
    offlineGetPublic,
    offlineGetPrivate,
    offlineClearKey,
    offlineSign,
    saveOfflineToken,
    revokeOfflineToken,
    offlineTokensOf
  };
})();
// =============================================================
// My Services Panel — data layer
// Loaded AFTER config.js and the supabase-js UMD build.
//
// Two modes:
//  - REAL: config.js filled in -> authenticated against Supabase.
//  - DEMO: config.js still has placeholders -> runs on in-memory
//    data with no login, so the UI can be previewed and tested.
//
// No earnings/amounts are stored anywhere. Each project tracks a
// payment METHOD and a payment STATUS (paid/pending) so you can
// manage renewals without recording money.
// =============================================================

(() => {
  const real = window.supabase && SUPABASE_URL.startsWith('https://') && !/YOURPROJECT|YOUR_SUPABASE/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20;

  const supabase = real ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'sb-ox1-dashboard-token'
    }
  }) : null;

  // Único client compartido: el resto de módulos (p.ej. db-licenses.js)
  // reutiliza ESTE para no crear un segundo client con el mismo storage
  // de sesión (evita races de refresh/invalidación de token).
  window.__OX1_SUPABASE = supabase;

  const DEFAULT_PAYMENT_METHODS = ['PayPal', 'Bank transfer', 'Cash', 'Credit card'];

  // Demo in-memory store: persists across loadAll() so edits survive
  // the reload cycle. Starts empty (no test data).
  const M = { apps: [], clients: [], sales: [], stores: [], payments: [] };
  const resetStore = () => { M.apps = []; M.clients = []; M.sales = []; M.stores = []; M.payments = []; };
  const snap = () => {
    DATA.apps = M.apps.map(x => ({ ...x }));
    DATA.clients = M.clients.map(x => ({ ...x }));
    DATA.sales = M.sales.map(x => ({ ...x }));
    DATA.stores = M.stores.map(x => ({ ...x }));
    DATA.payments = M.payments.map(x => ({ ...x }));
  };

  const DATA = {
    apps: [],
    clients: [],
    sales: [],
    stores: [],
    payments: [],
    settings: { alertDays: 7, panelName: 'My Services', emailNotif: true, webhookNotif: true, paymentMethods: DEFAULT_PAYMENT_METHODS.slice(), lang: 'en' },
    profile: { id: 'demo-user', role: 'admin', display_name: 'Demo Admin', email: 'demo@myservices.app' }
  };

  const demoUser = { id: 'demo-user', email: 'demo@myservices.app', app_metadata: {}, user_metadata: {} };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const delay = () => wait(60);
  const genId = () => 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  // ---------- mapping (real rows -> app shape) ----------
  const mapApp = r => ({ id: r.id, name: r.name, type: r.type, version: r.version });
  const mapClient = r => ({ id: r.id, name: r.name, company: r.company, email: r.email, phone: r.phone, joined: r.joined });
  const mapSale = r => ({ id: r.id, appId: r.app_id, clientId: r.client_id, contract: r.contract, plan: r.plan, subscriptionTier: r.subscription_tier || 'free', startDate: r.start_date, endDate: r.end_date, status: r.status, page: r.page, db: r.db, apiKey: r.api_key, paymentMethod: r.payment_method || '—', paymentStatus: r.payment_status || 'pending', paidUntil: r.paid_until, nextDue: r.next_due, graceEnd: r.grace_end, trialEnd: r.trial_end, blockedSince: r.blocked_since, lastRemindedAt: r.last_reminded_at });
  const mapStore = r => ({ id: r.id, name: r.name, appId: r.app_id, platform: r.platform || 'web', ghPage: r.gh_page, wsRef: r.ws_ref, wsUrl: r.ws_url, wsStoreId: r.ws_store_id, saleId: r.sale_id, status: r.status, blockedReason: r.blocked_reason });
  const mapPayment = r => ({ id: r.id, saleId: r.sale_id, months: r.months, method: r.method, note: r.note, paidAt: r.paid_at });
  const mapSettings = r => ({ alertDays: r.alert_days, panelName: r.panel_name, emailNotif: r.email_notif, webhookNotif: r.webhook_notif, lang: r.lang || 'en', paymentMethods: Array.isArray(r.payment_methods) && r.payment_methods.length ? r.payment_methods : DEFAULT_PAYMENT_METHODS.slice() });

  // ---------- auth ----------
  async function getSession() {
    if (!real) return { data: { session: { user: demoUser, access_token: 'demo', expires_at: 4102444800 } }, error: null };
    return supabase.auth.getSession();
  }
  function onAuth(cb) {
    if (!real) { cb('INITIAL_SESSION', { user: demoUser }); return { data: { subscription: { unsubscribe() {} } } }; }
    return supabase.auth.onAuthStateChange(cb);
  }
  async function signIn(email, password) {
    if (!real) return { error: null };
    return supabase.auth.signInWithPassword({ email, password });
  }
  async function signOut(scope) {
    if (!real) return { error: null };
    // scope 'global' revoca TODAS las sesiones del usuario (todos los
    // dispositivos). 'local' (default) solo cierra este navegador.
    return supabase.auth.signOut({ scope: scope === 'global' ? 'global' : 'local' });
  }
  async function sendReset(email) {
    if (!real) return { error: null };
    return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
  }
  // Create account. Emails are auto-confirmed (no SMTP), so a successful
  // sign-up returns a usable session and the user is signed in.
  async function signUp(email, password, fullName) {
    if (!real) return { error: null, data: { user: demoUser, session: null } };
    return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  }
  // Change password, proving the current password (Secure password change).
  async function changePassword(currentPassword, newPassword) {
    if (!real) return { error: null };
    return supabase.auth.updateUser({ password: newPassword, current_password: currentPassword });
  }

  // ---------- master recovery key (supabase/recovery.sql) ----------
  async function setRecoveryKey(key) {
    if (!real) return { error: null, data: true };
    const { data, error } = await supabase.rpc('set_recovery_key', { p_key: key });
    if (error) return { error: error.message || 'Unable to set recovery key' };
    return { data, error: null };
  }
  async function hasRecoveryKey() {
    if (!real) return { data: false, error: null };
    const { data, error } = await supabase.rpc('has_recovery_key');
    if (error) return { data: false, error: error.message || 'Unable to check recovery key' };
    return { data: !!data, error: null };
  }
  // Recover a locked-out account: email + recovery key + new password.
  async function recoverAccount(email, key, newPassword) {
    if (!real) return { error: 'Recovery is only available with a real Supabase account.', data: null };
    const { data, error } = await supabase.rpc('recover_account', {
      p_email: email,
      p_key: key,
      p_new_password: newPassword
    });
    if (error) return { data: null, error: error.message || 'Recovery failed.' };
    return { data, error: null };
  }

  // ---------- MFA (TOTP / authenticator app) ----------
  const mfaErr = e => ({ error: e, data: null });
  async function mfaStatus() {
    if (!real) return { data: { status: 'unavailable' }, error: null };
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) return mfaErr(error);
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) return mfaErr(factors.error);
      const totp = (factors.data.all || []).find(f => f.factor_type === 'totp' && f.status === 'verified');
      return { data: { level: data.currentLevel, enabled: !!totp, factorId: totp ? totp.id : null }, error: null };
    } catch (e) { return mfaErr(e); }
  }
  async function mfaEnroll() {
    if (!real) return { error: { message: 'Unavailable in demo mode' } };
    return supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'My Services' });
  }
  async function mfaChallenge(factorId) {
    if (!real) return { error: { message: 'Unavailable in demo mode' } };
    return supabase.auth.mfa.challenge({ factorId });
  }
  async function mfaVerify(factorId, challengeId, code) {
    if (!real) return { error: { message: 'Unavailable in demo mode' } };
    return supabase.auth.mfa.verify({ factorId, challengeId, code });
  }
  async function mfaUnenroll(factorId) {
    if (!real) return { error: { message: 'Unavailable in demo mode' } };
    return supabase.auth.mfa.unenroll({ factorId });
  }
  // Complete an MFA sign-in: create the challenge and verify the code.
  async function mfaLogin(factorId, code) {
    if (!real) return { error: { message: 'Unavailable in demo mode' } };
    try {
      const ch = await supabase.auth.mfa.challenge({ factorId });
      if (ch.error) return mfaErr(ch.error);
      const v = await supabase.auth.mfa.verify({ factorId, challengeId: ch.data.id, code });
      if (v.error) return mfaErr(v.error);
      return { data: { session: v.data }, error: null };
    } catch (e) { return mfaErr(e); }
  }

  // ---------- load ----------
  async function loadAll() {
    if (!real) {
      snap();
      DATA.settings = { alertDays: 7, panelName: 'My Services', emailNotif: true, webhookNotif: true, paymentMethods: DEFAULT_PAYMENT_METHODS.slice(), lang: 'en' };
      DATA.profile = { id: 'demo-user', role: 'admin', display_name: 'Demo Admin', email: 'demo@myservices.app' };
      await delay();
      return null;
    }
    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) return { error: ue ? ue.message : 'Not authenticated' };
    const uid = user.id;
    const [apps, clients, sales, settings, profiles, stores, payments] = await Promise.all([
      supabase.from('apps').select('*').order('created_at'),
      supabase.from('clients').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('sales').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('settings').select('*').eq('user_id', uid).maybeSingle(),
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('stores').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('payments').select('*').eq('user_id', uid).order('paid_at', { ascending: false })
    ]);
    for (const r of [apps, clients, sales, stores, payments]) if (r.error) return { error: r.error.message };
    if (settings.error && settings.error.code !== 'PGRST116') return { error: settings.error.message };
    if (profiles.error && profiles.error.code !== 'PGRST116') return { error: profiles.error.message };
    DATA.apps = (apps.data || []).map(mapApp);
    DATA.clients = (clients.data || []).map(mapClient);
    DATA.sales = (sales.data || []).map(mapSale);
    DATA.stores = (stores.data || []).map(mapStore);
    DATA.payments = (payments.data || []).map(mapPayment);
    DATA.settings = settings.data ? mapSettings(settings.data) : { alertDays: 7, panelName: 'My Services', emailNotif: true, webhookNotif: true, paymentMethods: DEFAULT_PAYMENT_METHODS.slice(), lang: 'en' };
    DATA.profile = profiles.data
      ? { id: profiles.data.id, role: profiles.data.role, display_name: profiles.data.display_name, email: user.email }
      : { id: uid, role: 'staff', display_name: user.email, email: user.email };
    return null;
  }

  // ---------- apps ----------
  async function createApp(a) {
    if (!real) { const row = { id: genId(), ...a }; M.apps.push({ ...row }); snap(); await delay(); return { data: row, error: null }; }
    return supabase.from('apps').insert({ name: a.name, type: a.type, version: a.version }).select().single();
  }
  async function updateApp(id, a) {
    if (!real) { const i = M.apps.findIndex(x => x.id === id); if (i > -1) M.apps[i] = { ...M.apps[i], ...a }; snap(); await delay(); return { data: { id, ...a }, error: null }; }
    return supabase.from('apps').update({ name: a.name, type: a.type, version: a.version }).eq('id', id).select().single();
  }
  async function deleteApp(id) {
    if (!real) { const i = M.apps.findIndex(x => x.id === id); if (i > -1) M.apps.splice(i, 1); snap(); await delay(); return { error: null }; }
    return supabase.from('apps').delete().eq('id', id);
  }

  // ---------- clients ----------
  async function createClient(c) {
    const row = { name: c.name, company: c.company || null, email: c.email || null, phone: c.phone || null, joined: c.joined || null };
    if (!real) { const r = { id: genId(), ...row }; M.clients.push({ ...r }); snap(); await delay(); return { data: r, error: null }; }
    return supabase.from('clients').insert(row).select().single();
  }
  async function updateClient(id, c) {
    const row = { name: c.name, company: c.company || null, email: c.email || null, phone: c.phone || null, joined: c.joined || null };
    if (!real) { const i = M.clients.findIndex(x => x.id === id); if (i > -1) M.clients[i] = { ...M.clients[i], ...row }; snap(); await delay(); return { data: { id, ...row }, error: null }; }
    return supabase.from('clients').update(row).eq('id', id).select().single();
  }
  async function deleteClient(id) {
    if (!real) { const i = M.clients.findIndex(x => x.id === id); if (i > -1) M.clients.splice(i, 1); M.sales = M.sales.filter(s => s.clientId !== id); snap(); await delay(); return { error: null }; }
    return supabase.from('clients').delete().eq('id', id);
  }

  // ---------- sales (projects) ----------
  async function createSale(s) {
    const row = {
      app_id: s.appId, client_id: s.clientId, contract: s.contract, plan: s.plan,
      subscription_tier: s.subscriptionTier || 'free',
      start_date: s.startDate || null, end_date: s.endDate || null,
      next_due: s.nextDue || null, grace_end: s.graceEnd || null,
      paid_until: s.paidUntil || null, trial_end: s.trialEnd || null,
      blocked_since: s.blockedSince || null, last_reminded_at: s.lastRemindedAt || null,
      status: s.status || 'active', page: s.page || 'online', db: s.db || 'active', api_key: s.apiKey || genId(),
      payment_method: s.paymentMethod || '—', payment_status: s.paymentStatus || 'pending'
    };
    if (!real) {
      const r = { id: genId(), appId: s.appId, clientId: s.clientId, contract: s.contract, plan: s.plan, subscriptionTier: row.subscription_tier, startDate: s.startDate || null, endDate: s.endDate || null, status: row.status, page: row.page, db: row.db, apiKey: row.api_key, paymentMethod: row.payment_method, paymentStatus: row.payment_status, paidUntil: row.paid_until, nextDue: row.next_due, graceEnd: row.grace_end, trialEnd: row.trial_end, blockedSince: row.blocked_since, lastRemindedAt: row.last_reminded_at };
      M.sales.push({ ...r }); snap(); await delay(); return { data: r, error: null };
    }
    return supabase.from('sales').insert(row).select().single();
  }
  async function updateSale(id, s) {
    const row = {
      app_id: s.appId, client_id: s.clientId, contract: s.contract, plan: s.plan,
      subscription_tier: s.subscriptionTier || 'free',
      start_date: s.startDate || null, end_date: s.endDate || null,
      next_due: s.nextDue || null, grace_end: s.graceEnd || null,
      paid_until: s.paidUntil || null, trial_end: s.trialEnd || null,
      blocked_since: s.blockedSince || null, last_reminded_at: s.lastRemindedAt || null,
      status: s.status || 'active', page: s.page || 'online', db: s.db || 'active',
      payment_method: s.paymentMethod || '—', payment_status: s.paymentStatus || 'pending'
    };
    if (!real) { const i = M.sales.findIndex(x => x.id === id); if (i > -1) M.sales[i] = { ...M.sales[i], appId: row.app_id, clientId: row.client_id, startDate: row.start_date, endDate: row.end_date, page: row.page, db: row.db, status: row.status, paymentMethod: row.payment_method, paymentStatus: row.payment_status, paidUntil: row.paid_until, nextDue: row.next_due, graceEnd: row.grace_end, trialEnd: row.trial_end, blockedSince: row.blocked_since, lastRemindedAt: row.last_reminded_at }; snap(); await delay(); return { data: M.sales.find(x => x.id === id), error: null }; }
    return supabase.from('sales').update(row).eq('id', id).select().single();
  }
  async function deleteSale(id) {
    if (!real) { const i = M.sales.findIndex(x => x.id === id); if (i > -1) M.sales.splice(i, 1); snap(); await delay(); return { error: null }; }
    return supabase.from('sales').delete().eq('id', id);
  }

  // ---------- specialised ops ----------
  async function setBlock(sid, blocked) {
    const row = { status: blocked ? 'suspended' : 'active', page: blocked ? 'offline' : 'online', db: blocked ? 'inactive' : 'active' };
    if (!real) { const i = M.sales.findIndex(x => x.id === sid); if (i > -1) Object.assign(M.sales[i], row); snap(); await delay(); return { error: null }; }
    return supabase.from('sales').update(row).eq('id', sid);
  }

  // Registra un pago de N meses por adelantado. Avanza la suscripción
  // sobre el período ya pagado (base = paid_until si aún es futuro, si no
  // ahora). grace_end = next_due + 7 días. No se guarda dinero.
  async function addPayment(saleId, opt = {}) {
    const s = DATA.sales.find(x => x.id === saleId);
    if (!s) return { error: { message: 'Venta no encontrada' } };
    const months = Math.max(1, Math.round(opt.months) || 1);
    const method = opt.method || s.paymentMethod || '—';
    const note = opt.note || null;
    const isOne = s.plan === 'onetime';

    let paidUntilIso = null, graceEnd = null, endDate = null;
    if (!isOne) {
      const base = (s.paidUntil && new Date(s.paidUntil) > new Date()) ? new Date(s.paidUntil) : new Date();
      const pUntil = new Date(base);
      pUntil.setMonth(pUntil.getMonth() + months);
      paidUntilIso = pUntil.toISOString();
      graceEnd = new Date(pUntil.getTime() + 7 * 86400000).toISOString();
      endDate = paidUntilIso.slice(0, 10);
    }

    if (!real) {
      M.payments.push({ id: genId(), saleId, months, method, note, paidAt: new Date().toISOString() });
      const i = M.sales.findIndex(x => x.id === saleId);
      if (i > -1) Object.assign(M.sales[i], {
        paymentStatus: 'paid', paymentMethod: method,
        paidUntil: paidUntilIso, nextDue: paidUntilIso, graceEnd, endDate, lastRemindedAt: null
      });
      snap(); await delay(); return { error: null };
    }
    const ins = await supabase.from('payments').insert({ sale_id: saleId, months, method, note }).select().single();
    if (ins.error) return { error: ins.error };
    const upd = await supabase.from('sales').update(isOne
      ? { payment_status: 'paid', payment_method: method }
      : { payment_status: 'paid', payment_method: method, paid_until: paidUntilIso, next_due: paidUntilIso, grace_end: graceEnd, end_date: endDate, last_reminded_at: null })
      .eq('id', saleId);
    if (upd.error) return { error: upd.error };
    return { error: null };
  }

  // Marcado rápido "Paid" (botones de lista): = un pago de 1 período.
  async function markPaid(sid, method) {
    const s = DATA.sales.find(x => x.id === sid);
    const months = s && s.plan === 'annual' ? 12 : 1;
    return addPayment(sid, { months, method });
  }

  async function regenKey(sid, key) {
    if (!real) { const i = M.sales.findIndex(x => x.id === sid); if (i > -1) M.sales[i].apiKey = key; snap(); await delay(); return { error: null }; }
    return supabase.from('sales').update({ api_key: key }).eq('id', sid);
  }

  // ---------- stores (whatever registrada en el panel) ----------
  async function listStores() {
    return { data: DATA.stores, error: null };
  }
  async function saveStore(st) {
    const row = {
      name: st.name,
      app_id: st.appId || null,
      platform: st.platform || 'web',
      gh_page: st.ghPage || null,
      ws_ref: st.wsRef || null,
      ws_url: st.wsUrl || null,
      ws_store_id: st.wsStoreId != null ? st.wsStoreId : null,
      sale_id: st.saleId || null,
      status: st.status || 'active',
      blocked_reason: st.blockedReason || null
    };
    if (!real) {
      if (st.id) {
        const i = M.stores.findIndex(x => x.id === st.id);
        if (i > -1) { M.stores[i] = { ...M.stores[i], ...st, wsStoreId: row.ws_store_id, blockedReason: row.blocked_reason }; snap(); await delay(); return { data: M.stores[i], error: null }; }
      }
      const r = { id: genId(), ...st, wsStoreId: row.ws_store_id, blockedReason: row.blocked_reason };
      M.stores.push({ ...r }); snap(); await delay(); return { data: r, error: null };
    }
    if (st.id) return supabase.from('stores').update(row).eq('id', st.id).select().single();
    return supabase.from('stores').insert(row).select().single();
  }
  // Elimina el registro de la tienda y, si withSale=true, también su
  // suscripción (sales + pagos en cascada). Con withSale=false solo
  // se quita el registro, conservando la venta.
  async function deleteStore(id, withSale = false) {
    const st = DATA.stores.find(x => x.id === id);
    if (!real) {
      const i = M.stores.findIndex(x => x.id === id);
      if (i > -1) M.stores.splice(i, 1);
      if (withSale && st && st.saleId) {
        M.payments = M.payments.filter(p => p.saleId !== st.saleId);
        M.sales = M.sales.filter(x => x.id !== st.saleId);
      }
      snap(); await delay(); return { error: null };
    }
    if (withSale && st && st.saleId) {
      const del = await supabase.from('sales').delete().eq('id', st.saleId);
      if (del.error) return { error: del.error };
    }
    return supabase.from('stores').delete().eq('id', id);
  }
  // Bloquea/desbloquea una tienda al instante. NO toca el estado de la
  // base de datos compartida (hay otras tiendas en la misma DB).
  async function setStoreBlock(id, blocked, reason) {
    const st = DATA.stores.find(x => x.id === id);
    if (!real) {
      const i = M.stores.findIndex(x => x.id === id);
      if (i > -1) M.stores[i] = { ...M.stores[i], status: blocked ? 'blocked' : 'active', blockedReason: blocked ? (reason || '') : null };
      if (st && st.saleId) {
        const j = M.sales.findIndex(x => x.id === st.saleId);
        if (j > -1) M.sales[j] = { ...M.sales[j], status: blocked ? 'suspended' : 'active', page: blocked ? 'offline' : 'online', blockedSince: blocked ? new Date().toISOString() : null };
      }
      snap(); await delay(); return { error: null };
    }
    const errs = [];
    const r1 = await supabase.from('stores').update({ status: blocked ? 'blocked' : 'active', blocked_reason: blocked ? (reason || '') : null }).eq('id', id);
    if (r1.error) errs.push(r1.error.message);
    if (st && st.saleId) {
      const r2 = await supabase.from('sales').update({ status: blocked ? 'suspended' : 'active', page: blocked ? 'offline' : 'online', blocked_since: blocked ? new Date().toISOString() : null }).eq('id', st.saleId);
      if (r2.error) errs.push(r2.error.message);
    }
    return { error: errs.length ? errs.join('; ') : null };
  }

  async function saveSettings(s) {
    if (!real) { DATA.settings = { ...s, paymentMethods: (s.paymentMethods || []).slice() }; await delay(); return { error: null }; }
    const row = { alert_days: s.alertDays, panel_name: s.panelName, email_notif: s.emailNotif, webhook_notif: s.webhookNotif, lang: s.lang || 'en', payment_methods: s.paymentMethods || [] };
    return supabase.from('settings').upsert(row);
  }

  async function resetOwnData() {
    if (!real) {
      resetStore();
      snap();
      DATA.settings = { alertDays: 7, panelName: 'My Services', emailNotif: true, webhookNotif: true, paymentMethods: DEFAULT_PAYMENT_METHODS.slice(), lang: 'en' };
      await delay();
      return { error: null };
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };
    const uid = user.id;
    const errors = [];
    const a = await supabase.from('sales').delete().eq('user_id', uid); if (a.error) errors.push(a.error.message);
    const b = await supabase.from('clients').delete().eq('user_id', uid); if (b.error) errors.push(b.error.message);
    const c = await supabase.from('settings').upsert({ user_id: uid, alert_days: 7, panel_name: 'My Services', email_notif: true, webhook_notif: true, payment_methods: DEFAULT_PAYMENT_METHODS, lang: 'en' });
    if (c.error) errors.push(c.error.message);
    return { error: errors.length ? errors.join('; ') : null };
  }

  window.DB = {
    isConfigured: real,
    data: DATA,
    getSession, onAuth, signIn, signOut, sendReset,
    signUp, changePassword,
    setRecoveryKey, hasRecoveryKey, recoverAccount,
    mfaStatus, mfaEnroll, mfaChallenge, mfaVerify, mfaUnenroll, mfaLogin,
    loadAll,
    createApp, updateApp, deleteApp,
    createClient, updateClient, deleteClient,
    createSale, updateSale, deleteSale,
    setBlock, markPaid, addPayment, regenKey, saveSettings,
    listStores, saveStore, deleteStore, setStoreBlock,
    resetOwnData
  };
})();
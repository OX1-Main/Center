// =============================================================
// OX1 Segurity — Vista "Licencias" (drop-in para OX1Dashboard)
// -------------------------------------------------------------
// Añade una vista NUEVA "Licenses / Licencias" (la de API Keys
// queda intacta) con: resumen, tabla de licencias, detalle con
// dispositivos y eventos, y acciones (crear, suspender, reactivar,
// renovar, revocar, bloquear dispositivo, eliminar).
//
// Se carga DESPUÉS de i18n.js, db.js y script.js. No modifica esos
// archivos: extiende navGroups/viewTitles/renderView en caliente.
//
// Uso en index.html (ver INSTALL.md):
//   <script src="db-licenses.js"></script>
//   <script src="view-licenses.js"></script>
// =============================================================

(() => {
  'use strict';

  // -------------------------------------------------------------
  // 1. i18n extra
  // -------------------------------------------------------------
  if (window.I18N) Object.assign(window.I18N.es, {
    'Licenses': 'Licencias',
    'License management and device control.': 'Gestión de licencias y control de dispositivos.',
    'New license': 'Nueva licencia',
    'Expires': 'Vence',
    'Devices': 'Dispositivos',
    'Last seen': 'Última conexión',
    'Events': 'Eventos',
    'Suspend': 'Suspender',
    'Revoke': 'Revocar',
    'Renew': 'Renovar',
    'Renewal': 'Renovación',
    'Max devices': 'Máx. dispositivos',
    'Grace (hours)': 'Gracia (horas)',
    'Block device': 'Bloquear dispositivo',
    'Unblock device': 'Desbloquear dispositivo',
    'No licenses yet.': 'Aún no hay licencias.',
    'No devices yet.': 'Aún no hay dispositivos.',
    'Search licenses by key or client...': 'Buscar por clave o cliente...',
    'Suspended': 'Suspendida',
    'Revoked': 'Revocada',
    'Expired': 'Expirada',
    'Generate': 'Generar',
    'Select a project': 'Selecciona un proyecto',
    'Copy key': 'Copiar clave',
    'License created': 'Licencia creada',
    'License suspended': 'Licencia suspendida',
    'License reactivated': 'Licencia reactivada',
    'License revoked': 'Licencia revocada',
    'License renewed': 'Licencia renovada',
    'Device blocked': 'Dispositivo bloqueado',
    'Device unblocked': 'Dispositivo desbloqueado',
    'License deleted': 'Licencia eliminada',
    'No events yet.': 'Aún no hay eventos.',
    'Devices limit reached': 'Límite de dispositivos alcanzado',
    'Suspend this license?': '¿Suspender esta licencia? El cliente dejará de tener acceso en el próximo latido.',
    'Reactivate this license?': '¿Reactivar esta licencia? El cliente recuperará el acceso en el próximo latido.',
    'Revoke this license permanently?': '¿Revocar esta licencia PERMANENTEMENTE? Ningún dispositivo volverá a funcionar con esta clave.',
    'Delete this license and all its devices?': '¿Eliminar esta licencia y todos sus dispositivos? No se puede deshacer.',
    'This license was revoked permanently.': 'Esta licencia fue revocada permanentemente.',
    'When you suspend or revoke, the client app stops working on its next heartbeat.': 'Cuando suspendes o revocas, la app del cliente deja de funcionar en su próximo latido.',
    'Set the new expiration date. The license becomes active again.': 'Define la nueva fecha de vencimiento. La licencia vuelve a quedar activa.',
    'How many devices can use this key at the same time.': 'Cuántos dispositivos pueden usar esta clave a la vez.',
    'Create a license for a sold project. The client app uses this key to validate.': 'Crea una licencia para un proyecto vendido. La app del cliente usa esta clave para validar.',
    'Alerts': 'Alertas',
    'All': 'Todas',
    'Active': 'Activa',
    'Expiring soon': 'Vence pronto',
    'Multiple devices': 'Varios dispositivos',
    'Multiple IPs': 'Varias IPs',
    'Blocked device': 'Dispositivo bloqueado',
    'Renew selected': 'Renovar seleccionadas',
    'Renew expiring': 'Renovar vencidas pronto',
    'days': 'días',
    'selected': 'seleccionadas',
    'How many days to add to the selected licenses.': 'Cuántos días se suman a las licencias seleccionadas.',
    'Licenses renewed': 'Licencias renovadas',
    'Select licenses to renew or filter by status.': 'Selecciona licencias para renovar o filtra por estado.',
    'Renew +N days': 'Renovar +N días',
    'Select all': 'Seleccionar todo',
    'Select': 'Seleccionar',
    'Renew these licenses?': '¿Renovar estas licencias? Todas sumarán los días indicados y volverán a quedar activas.',
    'Client portal': 'Portal del cliente',
    'Copy portal link': 'Copiar enlace del portal',
    'Offline token': 'Token offline',
    'Generate offline token': 'Generar token offline',
    'Generate a token so the client can activate the product WITHOUT internet. The token is tied to ONE device and expires.': 'Emite un token firmado para que el cliente active el producto SIN internet. Va ligado a UN dispositivo y vence.',
    'Device ID': 'ID del dispositivo',
    'Paste the device ID the client reads from their app.': 'Pega el ID de dispositivo que el cliente lee en su app.',
    'Generate token': 'Generar token',
    'Copy token': 'Copiar token',
    'Token generated. Send this JSON to the client so they can activate:': 'Token generado. Envíale este JSON al cliente para que active su producto:',
    'Token copied': 'Token copiado',
    'Issued offline tokens': 'Tokens offline emitidos',
    'No offline tokens yet.': 'Aún no hay tokens offline.',
    'Revoke token': 'Revocar token',
    'Revoke this offline token? The device will be cut off on its next connection, even if the license stays active.': '¿Revocar este token offline? El dispositivo quedará cortado en su próxima conexión, aunque la licencia siga activa.',
    'Token revoked': 'Token revocado',
    'Private key offline': 'Clave privada offline',
    'Configure the Ed25519 private key used to sign offline tokens. It is stored only in this browser.': 'Configura la clave privada Ed25519 con la que se firman los tokens offline. Solo se guarda en este navegador.',
    'Generate new pair': 'Generar par nuevo',
    'Import existing key': 'Importar clave existente',
    'Private key (PEM)': 'Clave privada (PEM)',
    'Public key (base64)': 'Clave pública (base64)',
    'Save key': 'Guardar clave',
    'Key saved': 'Clave guardada',
    'Copy public key': 'Copiar clave pública',
    'Export private key': 'Exportar clave privada',
    'Offline public key (paste into the SDK as offline_public_key):': 'Clave pública offline (pégala en el SDK como offline_public_key):',
    'Ed25519 is not available in this browser.': 'Ed25519 no está disponible en este navegador.',
    'The pair does not match.': 'El par de claves no cuadra.',
    'The device will be blocked from the next heartbeat.': 'El dispositivo quedará bloqueado desde el próximo latido.'
  });

  // -------------------------------------------------------------
  // 2. Estilos extra
  // -------------------------------------------------------------
  const CSS = `
  .ox1-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px}
  .ox1-search{display:flex;gap:8px;align-items:center;margin-bottom:14px}
  .ox1-search input{flex:1}
  .ox1-key{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;background:#10131a;padding:2px 8px;border-radius:6px;border:1px solid #232a36}
  .ox1-detail-head{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px}
  .ox1-detail-head .info{flex:1;min-width:240px}
  .ox1-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .ox1-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:18px}
  .ox1-chip{background:#151922;border:1px solid #232a36;border-radius:10px;padding:10px 12px}
  .ox1-chip b{display:block;font-size:15px}
  .ox1-chip span{font-size:12px;color:#8a94a6}
  .ox1-dev{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid #232a36;border-radius:10px;margin-bottom:8px;background:#14171f}
  .ox1-dev .meta b{display:block;font-size:13px}
  .ox1-dev .meta span{font-size:12px;color:#8a94a6}
  .ox1-timeline{list-style:none;margin:0;padding:0}
  .ox1-timeline li{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #1d222d;font-size:13px}
  .ox1-timeline .ev-ico{flex:0 0 18px;display:flex;align-items:center;justify-content:center}
  .ox1-timeline .ev-t{color:#c6ccd8}
  .ox1-timeline .ev-d{margin-left:auto;text-align:right;color:#8a94a6;font-size:11px;white-space:nowrap}
  .ox1-modal-backdrop{position:fixed;inset:0;background:rgba(8,10,14,.7);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:48px 16px;z-index:60}
  .ox1-modal{background:#151922;border:1px solid #2a3341;border-radius:14px;max-width:560px;width:100%;max-height:86vh;overflow:auto;padding:20px}
  .ox1-modal h3{margin:0 0 4px}
  .ox1-modal .sub{color:#8a94a6;font-size:13px;margin-bottom:16px}
  .ox1-modal .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .ox1-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
  .ox1-empty{padding:32px;text-align:center;color:#8a94a6;font-size:14px}
  .ox1-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
  .ox1-chip-btn{background:#151922;border:1px solid #232a36;color:#c6ccd8;border-radius:999px;padding:5px 14px;font-size:12px;cursor:pointer}
  .ox1-chip-btn:hover{border-color:#3a4658}
  .ox1-chip-btn.active{background:#2b6bdb;border-color:#2b6bdb;color:#fff}
  .ox1-chip-btn.warn{color:#f59e0b}
  .ox1-alert-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:2px 8px;border-radius:999px;background:rgba(245,158,11,.15);color:#f59e0b;border:1px solid rgba(245,158,11,.35);margin-left:6px}
  .ox1-bulk{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#151922;border:1px solid #2a3341;border-radius:10px;padding:10px 12px;margin-bottom:12px}
  .ox1-bulk b{color:#f59e0b}
  .ox1-bulk input{width:80px}
  .ox1-bulk .hint{color:#8a94a6;font-size:12px;flex-basis:100%}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // -------------------------------------------------------------
  // 3. Registro en navegación y títulos
  // -------------------------------------------------------------
  if (Array.isArray(window.navGroups)) {
    const system = window.navGroups.find(g => g && g.heading === 'System');
    if (system && !system.items.some(i => i.id === 'licenses')) {
      system.items.push({ id: 'licenses', title: 'Licenses', icon: 'ShieldCheck' });
    }
  }
  if (window.viewTitles) window.viewTitles.licenses = 'Licenses';

  // -------------------------------------------------------------
  // 4. Envolver renderView para la vista nueva
  // -------------------------------------------------------------
  let licDetailId = null;
  let licFilter = 'all';
  let licSelected = new Set();
  let licAlertMap = {};
  const _renderView = window.renderView;
  window.renderView = function () {
    if (window.currentView === 'licenses') {
      const view = document.querySelector('#view');
      if (licDetailId) {
        const lic = (window.LIC.data.licenses || []).find(l => l.id === licDetailId);
        if (lic) { view.innerHTML = licDetailHtml(lic); view.scrollTop = 0; return; }
        licDetailId = null;
      }
      view.innerHTML = renderLicenses();
      view.scrollTop = 0;
      bindLicSearch();
      ensureLicData();
      return;
    }
    return _renderView();
  };

  // -------------------------------------------------------------
  // 5. Delegación de eventos
  // -------------------------------------------------------------
  document.addEventListener('click', onLicClick, false);

  function onLicClick(e) {
    const t = e.target.closest('[data-lic]');
    if (!t) return;
    const lic = t.dataset.lic;
    const licId = t.dataset.licId;
    if (lic === 'back') { licDetailId = null; renderView(); return; }
    if (lic === 'view') { licDetailId = licId; renderView(); return; }
    if (lic === 'new') openNewLicModal();
    if (lic === 'refresh') refreshLicData();
    if (lic === 'toggle') toggleStatus(licId);
    if (lic === 'renew') openRenewModal(licId);
    if (lic === 'devices') openDevicesModal(licId);
    if (lic === 'revoke') confirmRevoke(licId);
    if (lic === 'del') confirmDelLic(licId);
    if (lic === 'dev-toggle') toggleDevice(licId);
    if (lic === 'copy') copyLicKey(licId);
    if (lic === 'portal') copyPortalLink(licId);
    if (lic === 'offline') openOfflineModal(licId);
    if (lic === 'offline-revoke') confirmRevokeOfflineToken(licId);
    if (lic === 'offline-copy') copyOfflineToken(licId);
    if (lic === 'filter') { licFilter = t.dataset.filter || 'all'; licSelected.clear(); renderView(); return; }
    if (lic === 'sel') {
      if (licId) { licSelected.has(licId) ? licSelected.delete(licId) : licSelected.add(licId); }
      else if (t.checked) {
        $$('#ox1LicTable tbody tr').forEach(tr => { if (tr.style.display !== 'none') { const id = tr.dataset.rowId; if (id) licSelected.add(id); } });
      } else { licSelected.clear(); }
      licSyncSelection();
      return;
    }
    if (lic === 'clear-sel') { licSelected.clear(); renderView(); return; }
    if (lic === 'renew-many') { openRenewManyModal(); return; }
  }

  document.addEventListener('input', e => {
    if (e.target && e.target.id === 'ox1Search') {
      const q = e.target.value.toLowerCase();
      $$('#ox1LicTable tbody tr').forEach(tr => {
        tr.style.display = tr.dataset.search && tr.dataset.search.includes(q) ? '' : 'none';
      });
    }
  });

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  const fmtDT = ts => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString(state.lang === 'es' ? 'es' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  const statusBadge = status => {
    if (status === 'active') return '<span class="badge badge-green">' + icon('CheckCircle2', 'bic') + ' ' + t('Active') + '</span>';
    if (status === 'suspended') return '<span class="badge badge-amber">' + icon('Clock', 'bic') + ' ' + t('Suspended') + '</span>';
    if (status === 'revoked') return '<span class="badge badge-red">' + icon('ShieldOff', 'bic') + ' ' + t('Revoked') + '</span>';
    return '<span class="badge">' + icon('XCircle', 'bic') + ' ' + t('Expired') + '</span>';
  };

  const licSale = lic => (DB.data.sales || []).find(s => s.id === lic.sale_id);
  const licClient = lic => { const s = licSale(lic); return s ? (DB.data.clients || []).find(c => c.id === s.clientId) : null; };
  const licApp = lic => { const s = licSale(lic); return s ? (DB.data.apps || []).find(a => a.id === s.appId) : null; };

  function licSyncSelection() {
    const bulk = document.getElementById('ox1Bulk');
    if (bulk) bulk.style.display = licSelected.size ? 'flex' : 'none';
    const cnt = document.getElementById('ox1BulkCount');
    if (cnt) cnt.textContent = licSelected.size;
    $$('#ox1LicTable tbody tr').forEach(tr => {
      const cb = tr.querySelector('input[data-lic="sel"][data-lic-id]');
      if (cb) cb.checked = licSelected.has(tr.dataset.rowId);
    });
    const all = document.querySelector('#ox1LicTable thead input[data-lic="sel"]');
    if (all) {
      const vis = $$('#ox1LicTable tbody tr').filter(tr => tr.style.display !== 'none');
      all.checked = vis.length > 0 && vis.every(tr => licSelected.has(tr.dataset.rowId));
    }
  }

  function ensureLicData() {
    if (window.LIC && !window.LIC.data.licenses.length) {
      window.LIC.load().then(err => {
        if (!err && window.currentView === 'licenses') renderView();
      });
    }
  }

  async function refreshLicData() {
    const err = await window.LIC.load();
    if (err) toast(err.error, 'error');
    else renderView();
  }

  // -------------------------------------------------------------
  // Vista principal
  // -------------------------------------------------------------
  function renderLicenses() {
    const lic = window.LIC;
    if (!lic) return pageHead(t('Licenses'), t('License management and device control.')) + '<div class="card"><div class="ox1-empty">Módulo no cargado.</div></div>';

    const rows = lic.data.licenses || [];
    const alertList = lic.alerts();
    licAlertMap = {};
    alertList.forEach(a => { licAlertMap[a.id] = licAlertMap[a.id] || []; licAlertMap[a.id].push(a.type); });
    const alertIds = new Set(alertList.map(a => a.id));

    const q = (document.getElementById('ox1Search') && document.getElementById('ox1Search').value.toLowerCase()) || '';

    const kpi = (label, n, iconN, danger) => `<div class="kpi ${danger ? 'kpi-danger' : ''}">
      <div class="kpi-top"><span class="kpi-ico">${icon(iconN)}</span></div>
      <div class="kpi-value">${n}</div><div class="kpi-label">${label}</div></div>`;

    const summary = `<div class="ox1-summary">
      ${kpi(t('Alerts'), alertIds.size, 'AlertTriangle', alertIds.size > 0)}
      ${kpi(t('Active'), rows.filter(r => r.status === 'active').length, 'ShieldCheck')}
      ${kpi(t('Suspended'), rows.filter(r => r.status === 'suspended').length, 'Clock', true)}
      ${kpi(t('Revoked'), rows.filter(r => r.status === 'revoked').length, 'ShieldOff', true)}
      ${kpi(t('Expired'), rows.filter(r => r.status === 'expired').length, 'XCircle')}
    </div>`;

    const chip = (f, label, warn) => `<button class="ox1-chip-btn ${licFilter === f ? 'active' : ''} ${warn ? 'warn' : ''}" data-lic="filter" data-filter="${f}">${esc(label)}</button>`;
    const chips = `<div class="ox1-chips">
      ${chip('all', t('All'))}
      ${chip('alerts', t('Alerts'), true)}
      ${chip('active', t('Active'))}
      ${chip('suspended', t('Suspended'))}
      ${chip('revoked', t('Revoked'))}
      ${chip('expired', t('Expired'))}
    </div>`;

    const filtered = rows.filter(r => licFilter === 'all' ? true : licFilter === 'alerts' ? alertIds.has(r.id) : r.status === licFilter);

    const bulkVisible = licSelected.size > 0;
    const bulkBar = `<div class="ox1-bulk" id="ox1Bulk" ${bulkVisible ? '' : 'style="display:none"'}>
      <b id="ox1BulkCount">${licSelected.size}</b> ${t('selected')}
      <span>· ${t('Renew +N days')}</span>
      <input id="ox1RenewDays" type="number" min="1" max="365" value="30" aria-label="${t('days')}" />
      <button class="btn btn-primary btn-sm" data-lic="renew-many">${icon('RefreshCw', 'bic')} ${t('Renew selected')}</button>
      <button class="btn btn-ghost btn-sm" data-lic="clear-sel">${icon('X', 'bic')}</button>
      <span class="hint">${t('Select licenses to renew or filter by status.')}</span>
    </div>`;

    const body = filtered.length ? filtered.map(licRowHtml).join('') : '<tr><td colspan="9"><div class="ox1-empty">' + t('No licenses yet.') + '</div></td></tr>';

    return `
      ${pageHead(t('Licenses'), t('License management and device control.'), `
        <button class="btn btn-primary btn-sm" data-lic="new">${icon('Plus', 'bic')} ${t('New license')}</button>
        <button class="btn btn-ghost btn-sm" data-lic="refresh">${icon('RefreshCw', 'bic')}</button>
      `)}
      ${summary}
      ${chips}
      <div class="card">
        <div class="card-head"><h3>${t('Licenses')}</h3><p class="sale-sub">${t('When you suspend or revoke, the client app stops working on its next heartbeat.')}</p></div>
        <div class="ox1-search">${icon('Search')}<input id="ox1Search" type="search" value="${esc(q)}" placeholder="${t('Search licenses by key or client...')}" /></div>
        ${bulkBar}
        <div class="table-wrap"><table class="table" id="ox1LicTable">
          <thead><tr>
            <th><input type="checkbox" data-lic="sel" ${filtered.length && filtered.every(r => licSelected.has(r.id)) ? 'checked' : ''} aria-label="${t('Select all')}" /></th>
            <th>${t('Client')}</th><th>${t('Service')}</th><th>${t('Key')}</th><th>${t('Plan')}</th><th>${t('Expires')}</th><th>${t('Devices')}</th><th>${t('Status')}</th><th>${t('Last seen')}</th><th></th>
          </tr></thead>
          <tbody>${body}</tbody>
        </table></div>
      </div>`;
  }

  function licRowHtml(lic) {
    const client = licClient(lic);
    const app = licApp(lic);
    const devices = window.LIC.devicesOf(lic.id);
    const last = window.LIC.lastSeenOf(lic.id);
    const name = client ? client.name : '—';
    const search = [lic.key, name, (app && app.name) || ''].join(' ').toLowerCase();
    const devCell = `${devices.filter(d => d.status === 'active').length}/${lic.max_devices}`;
    const full = devices.filter(d => d.status === 'active').length >= lic.max_devices;
    const alerts = (licAlertMap[lic.id] || []).map(a =>
      a === 'expiring' ? t('Expiring soon') : a === 'multi_device' ? t('Multiple devices') : a === 'multi_ip' ? t('Multiple IPs') : t('Blocked device')
    );
    const alertBadge = alerts.length ? `<span class="ox1-alert-badge" title="${esc(alerts.join(' · '))}">${icon('AlertTriangle', 'bic')} ${alerts.length}</span>` : '';
    return `<tr data-search="${esc(search)}" data-row-id="${lic.id}">
      <td><input type="checkbox" data-lic="sel" data-lic-id="${lic.id}" ${licSelected.has(lic.id) ? 'checked' : ''} aria-label="${t('Select')}" /></td>
      <td><div class="cell-client"><div class="mini-avatar">${esc(name.charAt(0) || '?')}</div><div><div class="cell-name">${esc(name)}${alertBadge}</div><div class="sale-sub">${esc((client && client.company) || '')}</div></div></div></td>
      <td>${esc((app && app.name) || '—')}</td>
      <td><code class="ox1-key">${esc(lic.key)}</code></td>
      <td>${cap(lic.plan)}</td>
      <td>${lic.expires_at ? fmtDT(lic.expires_at) : '—'}</td>
      <td class="${full ? 'cell-warn' : ''}" title="${full ? t('Devices limit reached') : ''}">${devCell}</td>
      <td>${statusBadge(lic.status)}</td>
      <td>${fmtDT(last)}</td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-sm" data-lic="view" data-lic-id="${lic.id}" title="${t('Details')}">${icon('Eye', 'bic')}</button>
        <button class="btn btn-ghost btn-sm" data-lic="copy" data-lic-id="${lic.id}" title="${t('Copy key')}">${icon('Copy', 'bic')}</button>
      </td>
    </tr>`;
  }

  // -------------------------------------------------------------
  // Detalle
  // -------------------------------------------------------------
  function licDetailHtml(lic) {
    const client = licClient(lic);
    const app = licApp(lic);
    const devices = window.LIC.devicesOf(lic.id);
    const events = window.LIC.eventsOf(lic.id).slice(0, 100);

    const devicesHtml = devices.length ? devices.map(dev => `
      <div class="ox1-dev">
        <div class="meta"><b>${esc(dev.name || dev.platform || 'Dispositivo')}</b>
          <span>${esc(dev.device_id)} · ${esc(dev.platform || '')} · ${dev.last_ip || ''}</span></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge ${dev.status === 'blocked' ? 'badge-red' : 'badge-green'}">${dev.status === 'blocked' ? t('Blocked') : t('Active')}</span>
          <button class="btn btn-ghost btn-sm" data-lic="dev-toggle" data-lic-id="${dev.id}">${dev.status === 'blocked' ? t('Unblock device') : t('Block device')}</button>
        </div>
      </div>`).join('') : `<div class="ox1-empty">${t('No devices yet.')}</div>`;

    const eventsHtml = events.length ? `<ul class="ox1-timeline">${events.map(ev => {
      const ic = ev.event === 'activate' ? 'CheckCircle2' : ev.event === 'validate' ? 'Activity' : ev.event === 'device_blocked' || ev.event === 'device_unblocked' ? 'ShieldOff' : ev.event === 'device_limit' ? 'AlertTriangle' : ev.event === 'revoked' || ev.event === 'expired' || ev.event === 'suspended' ? 'XCircle' : ev.event === 'renew' ? 'RefreshCw' : 'Clock';
      return `<li><span class="ev-ico">${icon(ic, 'bic')}</span>
        <div><b>${esc(ev.event)}</b> ${ev.device_id ? '<span class="ev-t">· ' + esc(ev.device_id) + '</span>' : ''} ${ev.ip ? '<span class="ev-t">· ' + esc(ev.ip) + '</span>' : ''}</div>
        <div class="ev-d">${fmtDT(ev.created_at)}</div></li>`;
    }).join('')}</ul>` : `<div class="ox1-empty">${t('No events yet.')}</div>`;

    const acts = lic.status === 'suspended'
      ? `<button class="btn btn-ghost btn-sm" data-lic="toggle" data-lic-id="${lic.id}">${icon('Power', 'bic')} ${t('Reactivate')}</button>`
      : `<button class="btn btn-ghost btn-sm" data-lic="toggle" data-lic-id="${lic.id}">${icon('Power', 'bic')} ${t('Suspend')}</button>`;
    const portalBtn = window.OX1_PORTAL_URL
      ? `<button class="btn btn-ghost btn-sm" data-lic="portal" data-lic-id="${lic.id}" title="${t('Copy portal link')}">${icon('Link', 'bic')} ${t('Client portal')}</button>`
      : '';
    const offlineBtn = `<button class="btn btn-ghost btn-sm" data-lic="offline" data-lic-id="${lic.id}" title="${t('Generate offline token')}">${icon('WifiOff', 'bic')} ${t('Offline token')}</button>`;

    const offTokens = window.LIC.offlineTokensOf(lic.id);
    const offlineHtml = `<h3 style="margin:18px 0 10px">${t('Issued offline tokens')}</h3>` +
      (offTokens.length ? offTokens.map(tok => {
        const act = tok.status === 'active'
          ? `<button class="btn btn-danger btn-sm" data-lic="offline-revoke" data-lic-id="${tok.id}">${icon('ShieldOff', 'bic')} ${t('Revoke token')}</button>`
          : '<span class="badge badge-red">' + icon('ShieldOff', 'bic') + ' ' + t('Revoked') + '</span>';
        return `<div class="ox1-dev">
          <div class="meta"><b>${t('Device ID')}: ${esc(tok.device_id)}</b>
            <span>${t('Expires')}: ${fmtDT(tok.expires_at)} · ${tok.status}</span></div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="btn btn-ghost btn-sm" data-lic="offline-copy" data-lic-id="${tok.id}" title="${t('Copy token')}">${icon('Copy', 'bic')}</button>
            ${act}
          </div>
        </div>`;
      }).join('') : `<div class="ox1-empty">${t('No offline tokens yet.')}</div>`);

    return `
      ${pageHead(t('Licenses'), t('License management and device control.'), `<button class="btn btn-ghost btn-sm" data-lic="back">${icon('ArrowLeft', 'bic')} ${t('Back')}</button>`)}
      <div class="card">
        <div class="ox1-detail-head">
          <div class="info">
            <h3 style="margin:0 0 6px">${esc((client && client.name) || '—')} · ${esc((app && app.name) || '—')}</h3>
            <code class="ox1-key">${esc(lic.key)}</code>
            <div class="ox1-badges">${statusBadge(lic.status)}<span class="badge">${cap(lic.plan)}</span>${lic.status === 'revoked' ? `<span class="badge badge-red">${t('This license was revoked permanently.')}</span>` : ''}</div>
          </div>
          <div class="row-actions" style="gap:6px">
            ${acts}
            ${offlineBtn}
            ${portalBtn}
            <button class="btn btn-ghost btn-sm" data-lic="renew" data-lic-id="${lic.id}">${icon('RefreshCw', 'bic')} ${t('Renew')}</button>
            <button class="btn btn-ghost btn-sm" data-lic="devices" data-lic-id="${lic.id}">${icon('Users', 'bic')} ${t('Max devices')}</button>
            <button class="btn btn-danger btn-sm" data-lic="revoke" data-lic-id="${lic.id}">${icon('ShieldOff', 'bic')} ${t('Revoke')}</button>
            <button class="btn btn-danger btn-sm" data-lic="del" data-lic-id="${lic.id}">${icon('Trash2', 'bic')}</button>
          </div>
        </div>
        <div class="ox1-grid">
          <div class="ox1-chip"><span>${t('Expires')}</span><b>${lic.expires_at ? fmtDT(lic.expires_at) : '—'}</b></div>
          <div class="ox1-chip"><span>${t('Devices')}</span><b>${devices.length}/${lic.max_devices}</b></div>
          <div class="ox1-chip"><span>${t('Grace (hours)')}</span><b>${lic.grace_hours}</b></div>
          ${lic.note ? `<div class="ox1-chip"><span>${t('Note')}</span><b>${esc(lic.note)}</b></div>` : ''}
        </div>
        <h3 style="margin:4px 0 10px">${t('Devices')}</h3>
        ${devicesHtml}
        ${offlineHtml}
        <h3 style="margin:18px 0 10px">${t('Events')}</h3>
        ${eventsHtml}
      </div>`;
  }

  // -------------------------------------------------------------
  // Acciones de licencia
  // -------------------------------------------------------------
  async function toggleStatus(id) {
    const lic = (window.LIC.data.licenses || []).find(l => l.id === id);
    if (!lic) return;
    const suspending = lic.status !== 'suspended';
    openConfirm({
      title: suspending ? t('Suspend') : t('Reactivate'),
      message: suspending ? t('Suspend this license?') : t('Reactivate this license?'),
      confirmText: suspending ? t('Suspend') : t('Reactivate'),
      danger: suspending,
      onConfirm: async () => {
        const { error } = await window.LIC.updateStatus(id, suspending ? 'suspended' : 'active');
        if (error) toast(error.message, 'error');
        else {
          toast(suspending ? t('License suspended') : t('License reactivated'), suspending ? 'warn' : 'success');
          await refreshLicData();
        }
      }
    });
  }

  function confirmRevoke(id) {
    openConfirm({
      title: t('Revoke'),
      message: t('Revoke this license permanently?'),
      confirmText: t('Revoke'),
      danger: true,
      onConfirm: async () => {
        const { error } = await window.LIC.updateStatus(id, 'revoked');
        if (error) toast(error.message, 'error');
        else { toast(t('License revoked'), 'warn'); await refreshLicData(); }
      }
    });
  }

  function confirmDelLic(id) {
    openConfirm({
      title: t('Delete'),
      message: t('Delete this license and all its devices?'),
      confirmText: t('Delete'),
      danger: true,
      onConfirm: async () => {
        const { error } = await window.LIC.deleteLicense(id);
        if (error) toast(error.message, 'error');
        else { toast(t('License deleted'), 'success'); licDetailId = null; await refreshLicData(); }
      }
    });
  }

  async function toggleDevice(deviceRowId) {
    const d = (window.LIC.data.devices || []).find(x => x.id === deviceRowId);
    if (!d) return;
    const blocking = d.status !== 'blocked';
    const { error } = await window.LIC.blockDevice(deviceRowId, blocking);
    if (error) toast(error.message, 'error');
    else {
      toast(blocking ? t('Device blocked') : t('Device unblocked'), blocking ? 'warn' : 'success');
      await refreshLicData();
    }
  }

  function copyLicKey(id) {
    const lic = (window.LIC.data.licenses || []).find(l => l.id === id);
    if (!lic) return;
    (navigator.clipboard ? navigator.clipboard.writeText(lic.key) : Promise.reject())
      .then(() => toast(t('Key copied to clipboard'), 'success'))
      .catch(() => toast(t('Key copied'), 'success'));
  }

  function copyPortalLink(id) {
    const lic = (window.LIC.data.licenses || []).find(l => l.id === id);
    if (!lic || !window.OX1_PORTAL_URL) return;
    const url = window.OX1_PORTAL_URL.replace(/\/+$/, '') + '?key=' + encodeURIComponent(lic.key);
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
      .then(() => toast(t('Copy portal link') + ' ✓', 'success'))
      .catch(() => toast(url, 'success'));
  }

  // -------------------------------------------------------------
  // Modales (propios, no chocan con los del panel)
  // -------------------------------------------------------------
  function openLicModal(title, sub, bodyHtml, footHtml) {
    closeLicModal();
    const el = document.createElement('div');
    el.className = 'ox1-modal-backdrop';
    el.id = 'ox1Modal';
    el.innerHTML = `<div class="ox1-modal"><h3>${title}</h3><p class="sub">${sub}</p>${bodyHtml}<div class="ox1-modal-foot">${footHtml}</div></div>`;
    el.addEventListener('mousedown', e => { if (e.target === el) closeLicModal(); });
    document.body.appendChild(el);
    const first = el.querySelector('input, select, textarea');
    if (first) first.focus();
    const closeBtn = el.querySelector('[data-lic-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeLicModal);
  }

  function closeLicModal() {
    const el = document.getElementById('ox1Modal');
    if (el) el.remove();
  }

  function bindLicSearch() {
    const el = document.getElementById('ox1Search');
    if (el && el.value) {
      const q = el.value.toLowerCase();
      $$('#ox1LicTable tbody tr').forEach(tr => {
        tr.style.display = tr.dataset.search && tr.dataset.search.includes(q) ? '' : 'none';
      });
    }
  }

  // --- Nueva licencia ---
  function openNewLicModal() {
    const sales = (DB.data.sales || []).filter(s => (DB.data.apps || []).some(a => a.id === s.appId));
    const opts = sales.length
      ? sales.map(s => {
          const cl = (DB.data.clients || []).find(c => c.id === s.clientId);
          const ap = (DB.data.apps || []).find(a => a.id === s.appId);
          return `<option value="${s.id}">${esc(cl ? cl.name : '?')} · ${esc(ap ? ap.name : '?')} — ${esc(s.contract)}</option>`;
        }).join('')
      : '<option value="" disabled>' + t('Select a project') + '</option>';

    const key = window.LIC.genKey();
    openLicModal(
      t('New license'),
      t('Create a license for a sold project. The client app uses this key to validate.'),
      `
      <label class="field"><span>${t('Project')}</span><select id="nl-sale">${opts}</select></label>
      <label class="field"><span>${t('Key')}</span>
        <div style="display:flex;gap:8px"><input id="nl-key" value="${key}" readonly />
        <button class="btn btn-ghost" id="nl-gen" type="button">${icon('RefreshCw', 'bic')} ${t('Generate')}</button></div>
      </label>
      <div class="form-row">
        <label class="field"><span>${t('Plan')}</span>
          <select id="nl-plan"><option>monthly</option><option>annual</option><option>onetime</option></select></label>
        <label class="field"><span>${t('Max devices')}</span><input id="nl-max" type="number" min="1" max="50" value="1" /></label>
      </div>
      <div class="form-row">
        <label class="field"><span>${t('Grace (hours)')}</span><input id="nl-grace" type="number" min="1" max="720" value="72" /></label>
        <label class="field"><span>${t('Expires')}</span><input id="nl-exp" type="date" /></label>
      </div>
      <label class="field"><span>${t('Note')}</span><input id="nl-note" type="text" /></label>`,
      `<button class="btn btn-ghost" data-lic-close="1" type="button">${t('Cancel')}</button>
       <button class="btn btn-primary" id="nl-submit" type="button">${t('Create')}</button>`
    );

    const gen = document.getElementById('nl-gen');
    if (gen) gen.addEventListener('click', () => { document.getElementById('nl-key').value = window.LIC.genKey(); });

    const exp = document.getElementById('nl-exp');
    if (exp && !exp.value) {
      const d = new Date(); d.setDate(d.getDate() + 30);
      exp.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    document.getElementById('nl-submit').addEventListener('click', async () => {
      const saleId = document.getElementById('nl-sale').value;
      if (!saleId) { toast(t('Select a project'), 'warn'); return; }
      const sale = (DB.data.sales || []).find(s => s.id === saleId);
      const expires = document.getElementById('nl-exp').value;
      const { error } = await window.LIC.createLicense({
        saleId,
        appId: sale ? sale.appId : null,
        key: document.getElementById('nl-key').value.trim(),
        plan: document.getElementById('nl-plan').value,
        maxDevices: parseInt(document.getElementById('nl-max').value, 10) || 1,
        graceHours: parseInt(document.getElementById('nl-grace').value, 10) || 72,
        expiresAt: expires ? expires + 'T23:59:59Z' : null,
        note: document.getElementById('nl-note').value.trim() || null
      });
      if (error) { toast(error.message, 'error'); return; }
      closeLicModal();
      toast(t('License created'), 'success');
      await refreshLicData();
    });
  }

  // --- Renovar ---
  function openRenewModal(id) {
    const lic = (window.LIC.data.licenses || []).find(l => l.id === id);
    if (!lic) return;
    openLicModal(
      t('Renewal'),
      t('Set the new expiration date. The license becomes active again.'),
      `<label class="field"><span>${t('Expires')}</span><input id="rw-exp" type="date" /></label>
       <label class="field"><span>${t('Note')}</span><input id="rw-note" type="text" value="${esc(lic.note || '')}" /></label>`,
      `<button class="btn btn-ghost" data-lic-close="1" type="button">${t('Cancel')}</button>
       <button class="btn btn-primary" id="rw-submit" type="button">${t('Renew')}</button>`
    );
    const exp = document.getElementById('rw-exp');
    if (lic.expires_at) {
      const d = new Date(lic.expires_at);
      exp.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else {
      const d = new Date(); d.setDate(d.getDate() + 30);
      exp.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    document.getElementById('rw-submit').addEventListener('click', async () => {
      const v = document.getElementById('rw-exp').value;
      const { error } = await window.LIC.renew(id, v ? v + 'T23:59:59Z' : null);
      if (error) toast(error.message, 'error');
      else { closeLicModal(); toast(t('License renewed'), 'success'); await refreshLicData(); }
    });
  }

  // --- Renovar varias ---
  function openRenewManyModal() {
    if (!licSelected.size) return;
    openLicModal(
      t('Renew selected'),
      t('Renew these licenses?'),
      `<label class="field"><span>${t('Renew +N days')}</span>
        <div style="display:flex;gap:8px;align-items:center"><input id="rm-days" type="number" min="1" max="365" value="30" /><span>${t('days')}</span></div>
        <p class="hint" style="margin:8px 0 0;color:#8a94a6;font-size:12px">${t('How many days to add to the selected licenses.')}</p>
      </label>`,
      `<button class="btn btn-ghost" data-lic-close="1" type="button">${t('Cancel')}</button>
       <button class="btn btn-primary" id="rm-submit" type="button">${t('Renew')}</button>`
    );
    document.getElementById('rm-submit').addEventListener('click', async () => {
      const days = parseInt(document.getElementById('rm-days').value, 10) || 30;
      const ids = Array.from(licSelected);
      const { error } = await window.LIC.renewMany(ids, days);
      if (error) { toast(error.message, 'error'); return; }
      closeLicModal();
      licSelected.clear();
      toast(t('Licenses renewed'), 'success');
      await refreshLicData();
    });
  }

  // --- Max devices ---
  function openDevicesModal(id) {
    const lic = (window.LIC.data.licenses || []).find(l => l.id === id);
    if (!lic) return;
    openLicModal(
      t('Max devices'),
      t('How many devices can use this key at the same time.'),
      `<label class="field"><span>${t('Max devices')}</span><input id="dv-max" type="number" min="1" max="100" value="${lic.max_devices}" /></label>`,
      `<button class="btn btn-ghost" data-lic-close="1" type="button">${t('Cancel')}</button>
       <button class="btn btn-primary" id="dv-submit" type="button">${t('Save changes')}</button>`
    );
    document.getElementById('dv-submit').addEventListener('click', async () => {
      const { error } = await window.LIC.setMaxDevices(id, parseInt(document.getElementById('dv-max').value, 10) || 1);
      if (error) toast(error.message, 'error');
      else { closeLicModal(); toast(t('Settings saved'), 'success'); await refreshLicData(); }
    });
  }

  // --- Token offline (crear / configurar clave) ---
  function openOfflineModal(licId) {
    const lic = (window.LIC.data.licenses || []).find(l => l.id === licId);
    if (!lic) return;

    const hasKey = !!window.LIC.offlineGetPrivate();
    let body;
    if (!hasKey) {
      body = `
        <p class="sub">${t('Configure the Ed25519 private key used to sign offline tokens. It is stored only in this browser.')}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">
          <button class="btn btn-primary btn-sm" id="ot-genkey" type="button">${icon('Key', 'bic')} ${t('Generate new pair')}</button>
        </div>
        <hr style="border-color:#2a3341;margin:14px 0">
        <label class="field"><span>${t('Import existing key')}</span></label>
        <label class="field"><span>${t('Private key (PEM)')}</span><textarea id="ot-priv" rows="5" placeholder="-----BEGIN PRIVATE KEY-----" style="font-family:ui-monospace,monospace;font-size:11px"></textarea></label>
        <label class="field"><span>${t('Public key (base64)')}</span><input id="ot-pub" placeholder="base64 de offline_public.txt" /></label>`;
    } else {
      const pub = window.LIC.offlineGetPublic();
      body = `
        <label class="field"><span>${t('Device ID')}</span><input id="ot-dev" placeholder="uuid-del-dispositivo" /></label>
        <label class="field"><span>${t('Expires')}</span><input id="ot-exp" type="date" /></label>
        <div class="ox1-chip" style="margin-top:6px">
          <span>${t('Offline public key (paste into the SDK as offline_public_key):')}</span>
          <code class="ox1-key" style="word-break:break-all;display:block;margin-top:6px">${esc(pub || '')}</code>
        </div>`;
    }

    openLicModal(
      t('Generate offline token'),
      t('Generate a token so the client can activate the product WITHOUT internet. The token is tied to ONE device and expires.'),
      body,
      hasKey
        ? `<button class="btn btn-ghost" data-lic-close="1" type="button">${t('Cancel')}</button>
           <button class="btn btn-primary" id="ot-submit" type="button">${icon('WifiOff', 'bic')} ${t('Generate token')}</button>`
        : `<button class="btn btn-ghost" data-lic-close="1" type="button">${t('Cancel')}</button>
           <button class="btn btn-primary" id="ot-savekey" type="button">${t('Save key')}</button>`
    );

    if (hasKey) {
      const exp = document.getElementById('ot-exp');
      const d = new Date(); d.setDate(d.getDate() + 45);
      exp.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      document.getElementById('ot-submit').addEventListener('click', async () => {
        const device = document.getElementById('ot-dev').value.trim();
        const expv = document.getElementById('ot-exp').value;
        if (!device) { toast(t('Device ID'), 'warn'); return; }
        if (!expv) { toast(t('Expires'), 'warn'); return; }
        try {
          const token = await window.LIC.offlineSign({ k: lic.key, d: device, a: lic.app_id || '', e: expv + 'T23:59:59Z' });
          const { error } = await window.LIC.saveOfflineToken({ licenseId: lic.id, deviceId: device, token });
          if (error) { toast(error.message, 'error'); return; }
          showOfflineResult(licId, token);
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    } else {
      document.getElementById('ot-genkey').addEventListener('click', async () => {
        try {
          await window.LIC.offlineGenKey();
          toast(t('Key saved'), 'success');
          openOfflineModal(licId);
        } catch (err) { toast(err.message, 'error'); }
      });
      document.getElementById('ot-savekey').addEventListener('click', async () => {
        const priv = document.getElementById('ot-priv').value.trim();
        const pub = document.getElementById('ot-pub').value.trim();
        if (!priv || !pub) { toast(t('Private key (PEM)'), 'warn'); return; }
        try {
          await window.LIC.offlineImportKey(priv, pub);
          toast(t('Key saved'), 'success');
          openOfflineModal(licId);
        } catch (err) { toast(err.message, 'error'); }
      });
    }
  }

  // Resultado del token: JSON para copiar y enviar al cliente.
  function showOfflineResult(licId, token) {
    const json = JSON.stringify(token, null, 2);
    const modal = document.getElementById('ox1Modal');
    if (!modal) return;
    modal.innerHTML = `<div class="ox1-modal">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <h3>${t('Offline token')}</h3>
        <button class="btn btn-ghost btn-sm" id="ot-x" type="button">${icon('X', 'bic')}</button>
      </div>
      <p class="sub">${t('Token generated. Send this JSON to the client so they can activate:')}</p>
      <pre style="background:#10131a;border:1px solid #232a36;border-radius:10px;padding:12px;font-size:11px;overflow:auto;max-height:300px;white-space:pre-wrap;word-break:break-all">${esc(json)}</pre>
      <p class="hint" style="margin-top:10px;color:#f59e0b;font-size:12px">${t('The device will be blocked from the next heartbeat.')}</p>
      <div class="ox1-modal-foot">
        <button class="btn btn-ghost" id="ot-again" type="button">${icon('WifiOff', 'bic')} ${t('Offline token')}</button>
        <button class="btn btn-primary" id="ot-copy" type="button">${icon('Copy', 'bic')} ${t('Copy token')}</button>
      </div>
    </div>`;
    document.getElementById('ot-x').addEventListener('click', () => { closeLicModal(); refreshLicData(); });
    document.getElementById('ot-copy').addEventListener('click', () => {
      (navigator.clipboard ? navigator.clipboard.writeText(json) : Promise.reject())
        .then(() => toast(t('Token copied'), 'success'))
        .catch(() => {
          const ta = document.createElement('textarea');
          ta.value = json;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch {}
          ta.remove();
          toast(t('Token copied'), 'success');
        });
    });
    document.getElementById('ot-again').addEventListener('click', () => { closeLicModal(); openOfflineModal(licId); });
  }

  function confirmRevokeOfflineToken(tokenId) {
    const tok = (window.LIC.data.offlineTokens || []).find(t => t.id === tokenId);
    if (!tok) return;
    openConfirm({
      title: t('Revoke token'),
      message: t('Revoke this offline token? The device will be cut off on its next connection, even if the license stays active.'),
      confirmText: t('Revoke token'),
      danger: true,
      onConfirm: async () => {
        const { error } = await window.LIC.revokeOfflineToken(tokenId);
        if (error) toast(error.message, 'error');
        else { toast(t('Token revoked'), 'warn'); await refreshLicData(); }
      }
    });
  }

  function copyOfflineToken(tokenId) {
    const tok = (window.LIC.data.offlineTokens || []).find(t => t.id === tokenId);
    if (!tok || !tok.token) return;
    const json = JSON.stringify(tok.token, null, 2);
    (navigator.clipboard ? navigator.clipboard.writeText(json) : Promise.reject())
      .then(() => toast(t('Token copied'), 'success'))
      .catch(() => toast(json, 'success'));
  }
})();
// =============================================================
// OX1 — Vista "Tiendas" (drop-in para OX1Dashboard)
// -------------------------------------------------------------
// Registra cada tienda WhatShop vendida:
//   - GitHub de la página (gh_page)
//   - base de datos WhatShop (ws_ref / ws_url) + ws_store_id
//     (varias tiendas comparten UNA BD, separadas por id)
//   - suscripción ligada (sales) con programación de cobro:
//     * tier free  -> 14 días de prueba (trial_end)
//     * tier pagado -> paid_until / next_due / grace_end
//       (prórroga de 7 días; pasada -> bloqueo automático)
//   - bloqueo/desbloqueo INMEDIATO desde aquí.
//
// El bloqueo llega a la tienda al instante vía la RPC pública
// supabase/rpc/store_status (la página la consulta al abrir).
//
// Se carga DESPUÉS de i18n.js, db.js y script.js. No modifica
// esos archivos: extiende navGroups/viewTitles/renderView.
// =============================================================

(() => {
  'use strict';

  // -------------------------------------------------------------
  // 1. i18n extra
  // -------------------------------------------------------------
  if (window.I18N) Object.assign(window.I18N.es, {
    'Stores': 'Tiendas / Despliegues',
    'Register each store: its GitHub page + the shared WhatShop database (ref) and the store ID inside it. From here you control payments, subscription and blocking.': 'Registra las páginas web y aplicaciones de cada cliente (web, Android, PC): qué aplicación es (WhatShop, futuro…), nivel de suscripción, repositorio y base de datos. Desde aquí controlas pagos, suscripción y bloqueo.',
    'Register store': 'Registrar',
    'New store': 'Nueva aplicación',
    'Edit store': 'Editar aplicación',
    'Store': 'Sucursal',
    'Client': 'Cliente',
    'Aplicación': 'Aplicación',
    'Platform': 'Plataforma',
    'Web': 'Web',
    'Android': 'Android',
    'PC': 'PC',
    'Desktop': 'PC',
    'Database': 'Base de datos',
    'Store ID': 'ID de sucursal',
    'GitHub page': 'Página de GitHub',
    'Billing': 'Cobro',
    'Next due': 'Próximo pago',
    'Grace until': 'Prórroga hasta',
    'Trial until': 'Prueba hasta',
    'Trial': 'Prueba',
    'Trial over': 'Prueba vencida',
    'Grace': 'Prórroga',
    'Expired': 'Expirada',
    'No billing': 'Sin facturación',
    'Mark paid': 'Marcar pagado',
    'Block now': 'Bloquear ahora',
    'Unblock': 'Desbloquear',
    'Blocked': 'Bloqueada',
    'Online': 'En línea',
    'In grace': 'En prórroga',
    'Store registered': 'Aplicación registrada',
    'Store updated': 'Aplicación actualizada',
    'Store deleted': 'Aplicación eliminada',
    'Store blocked': 'Aplicación bloqueada — la página verá 404 de inmediato',
    'Store unblocked': 'Aplicación desbloqueada — la página vuelve a estar online',
    'Payment recorded': 'Pago registrado',
    'Total stores': 'Total',
    'Active sites': 'En línea',
    'No stores yet.': 'Aún no hay aplicaciones registradas.',
    'Create a client first to register a store.': 'Crea antes un cliente para poder registrar.',
    'Block this store? Visitors will see the 404 lock page immediately and the store admin will not be able to log in.': '¿Bloquear esta aplicación? Los visitantes verán la página 404 de inmediato y el admin no podrá entrar.',
    'Unblock this store? The page becomes visible again and the store admin can log in.': '¿Desbloquear esta aplicación? La página vuelve a verse y el admin podrá entrar.',
    'Delete this store? The linked sale is kept.': '¿Eliminar esta aplicación? La venta asociada se conserva.',
    'Free trial: 14 days from activation. Paid plans: 7 days of grace after the due date; if unpaid, the store is blocked automatically.': 'Prueba gratuita: 14 días desde la activación. Planes de pago: 7 días de prórroga tras la fecha de vencimiento; si no se paga, la aplicación se bloquea sola.',
    'Payment date': 'Fecha del pago',
    'Payment status': 'Estado del pago',
    'Paid': 'Pagado',
    'Pending': 'Pendiente',
    'Plan': 'Plan',
    'Subscription': 'Suscripción',
    'App': 'App',
    'Blocked sites': 'Bloqueadas',
    'Auto-blocked': 'Bloqueo automático: fuera de prueba/prórroga',
    'Name': 'Nombre',
    'Sucursal': 'Sucursal',
    'Test connection': 'Probar conexión',
    'Connection check': 'Comprobar el vínculo con la tienda antes de guardar',
    'Not registered': 'No registrada',
    'Subscriptions of {name}': 'Suscripciones de {name}',
    'This client has no subscriptions.': 'Este cliente no tiene suscripciones.',
    'Delete subscription': 'Eliminar suscripción',
    'Delete "{name}" and its subscription? This removes the sale, payments and the store registration.': '¿Eliminar "{name}" y su suscripción? Se quita la venta, los pagos y el registro de la tienda.',
    'Payment for {name}': 'Pago para {name}',
    'Months paid': 'Meses',
    'Add this payment': 'Guardar pago',
    'Fill Store ID and ref first.': 'Completa Store ID y ref antes de probar.',
    'Online — link works.': 'En línea: el vínculo funciona.',
    'Ref found — store not registered yet. It works anyway.': 'No registrada aún — la tienda necesita activarse desde el panel.',
    'Test failed': 'No responde.',
    'Not found': 'No encontrado',
    'No stores match the filter.': 'Ninguna tienda coincide con el filtro.',
    'All clients': 'Todos los clientes',
    'period': 'período',
    'Months': 'Meses adelantados',
    'Save': 'Guardar',
    'General': 'Datos generales',
    'Deployment': 'Despliegue',
    'New client…': 'Nuevo cliente…',
    'New client': 'Nuevo cliente',
    'Client name': 'Nombre del cliente',
    'Company': 'Empresa',
    'Link this project to a site': 'Vincular esta suscripción a una página',
    'Adds the deployment data (repo, database and subscription) to the existing project.': 'Añade los datos del despliegue (repo, base de datos y suscripción) a la suscripción ya existente.',
    'Link page to this project': 'Vincular página/comercio a esta suscripción',
    'No apps yet — create one first': 'Aún no hay aplicaciones — crea una primero',
    'This project has an attached store.': 'Esta suscripción ya tiene una tienda vinculada.'
  });

  // -------------------------------------------------------------
  // 2. Estilos extra (mínimos: reutiliza .table/.badge/.chip)
  // -------------------------------------------------------------
  const CSS = `
  .st-head{display:flex;align-items:center;gap:10px;min-width:0}
  .st-head .st-name{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .st-head .st-url{font-size:12px;color:#8a94a6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px}
  .st-db{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#8a94a6}
  .st-due{font-size:12px;color:#8a94a6}
  .st-due b{color:#c6ccd8}
  .st-due.past{color:#f87171}
  .st-due.warn{color:#f59e0b}
  .chip-row{display:flex;gap:6px;flex-wrap:wrap}
  .ox1s-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:18px}
  .ox1s-modal-backdrop{position:fixed;inset:0;background:radial-gradient(1200px 800px at 30% 10%,rgba(56,70,110,.45),rgba(8,10,14,.78) 55%),rgba(6,8,12,.72);backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:48px 16px;z-index:60}
  .ox1s-modal{background:linear-gradient(180deg,#181e28,#141821);border:1px solid #2e3a4d;border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.55);max-width:700px;width:100%;max-height:88vh;overflow:auto;padding:22px}
  .ox1s-modal h3{margin:0 0 4px}
  .ox1s-modal .sub{color:#8a94a6;font-size:13px;margin-bottom:16px}
  .ox1s-modal .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .ox1s-sec{border:1px solid #242d3a;border-radius:12px;padding:14px;margin-bottom:14px;background:rgba(255,255,255,.015)}
  .ox1s-sec-h{font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#7d8ca3;margin-bottom:12px}
  .ox1s-test-row{display:flex;gap:12px;align-items:flex-start;margin-top:4px}
  .ox1s-test-row .btn-sm{padding:6px 12px;font-size:12px;white-space:nowrap}
  .ox1s-no-pad{padding-top:24px}
  .btn-sm{font-size:12px;padding:6px 12px}
  .ox1s-modal-backdrop .ox1s-modal{overflow:auto}
  .ox1s-modal-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
  .ox1s-hint{color:#8a94a6;font-size:12px;margin-top:8px}
  .ox1s-hint.ox1s-ok{color:#3fae5a}
  .ox1s-hint.ox1s-bad{color:#e5484d}
  .ox1s-hint.ox1s-busy{color:#e4e7ee}
  .filter-bar-sel{background:#10141a;border:1px solid #2a3341;border-radius:8px;color:#e4e7ee;padding:7px 10px;font-size:13px}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // -------------------------------------------------------------
  // 3. Registro en navegación y títulos
  // -------------------------------------------------------------
  if (Array.isArray(window.navGroups)) {
    const mgmt = window.navGroups.find(g => g && g.heading === 'Management');
    if (mgmt && !mgmt.items.some(i => i.id === 'stores')) {
      mgmt.items.push({ id: 'stores', title: 'Stores', icon: 'Box' });
    }
  }
  if (window.viewTitles) window.viewTitles.stores = 'Stores';

  // -------------------------------------------------------------
  // 4. Envolver renderView
  // -------------------------------------------------------------
  const _renderView = window.renderView;
  window.renderView = function () {
    if (window.currentView === 'stores') {
      const view = document.querySelector('#view');
      view.innerHTML = renderStores();
      view.scrollTop = 0;
      return;
    }
    return _renderView();
  };

  // -------------------------------------------------------------
  // 5. Helpers
  // -------------------------------------------------------------
  const toIS = iso => (iso ? String(iso).slice(0, 10) : null);
  const stFilter = { client: 'all' };
  const saleFor = st => (DB.data.sales || []).find(s => s.id === st.saleId);
  const clientFor = st => { const s = saleFor(st); return s ? (DB.data.clients || []).find(c => c.id === s.clientId) : null; };

  // Estado mostrado en el panel (coincide con la RPC store_status).
  function storeState(st) {
    if (st.status === 'blocked') return { level: 'blocked', label: t('Blocked'), icon: 'ShieldOff' };
    const s = saleFor(st);
    if (!s) return { level: 'none', label: t('No billing'), icon: 'AlertTriangle' };
    if (s.status === 'suspended') return { level: 'blocked', label: t('Blocked'), icon: 'ShieldOff' };
    const now = Date.now();
    if (s.subscriptionTier === 'free') {
      const tr = new Date(s.trialEnd || 0).getTime();
      if (s.trialEnd && tr <= now) return { level: 'expired', label: t('Trial over'), icon: 'XCircle' };
      return { level: 'ok', label: t('Trial'), icon: 'Clock' };
    }
    const ge = new Date(s.graceEnd || 0).getTime();
    if (s.graceEnd && ge <= now) return { level: 'expired', label: t('Expired'), icon: 'XCircle' };
    const nd = new Date(s.nextDue || 0).getTime();
    if (s.nextDue && nd <= now) return { level: 'grace', label: t('Grace'), icon: 'Clock' };
    return { level: 'ok', label: s.paymentStatus === 'paid' ? t('Paid') : t('Pending'), icon: s.paymentStatus === 'paid' ? 'CheckCircle2' : 'Wallet' };
  }

  function newStoreSchedule(spec) {
    const out = {};
    if (spec.tier === 'free') {
      out.trialEnd = new Date(Date.now() + 14 * 86400000).toISOString();
      out.paidUntil = null; out.nextDue = null; out.graceEnd = null;
      out.paymentStatus = spec.paymentStatus || 'pending';
    } else if (spec.paymentStatus === 'paid' && spec.paymentDate) {
      const base = new Date(spec.paymentDate + 'T12:00:00');
      if (spec.plan === 'annual') base.setFullYear(base.getFullYear() + 1); else base.setMonth(base.getMonth() + 1);
      out.trialEnd = null;
      out.paidUntil = base.toISOString();
      out.nextDue = out.paidUntil;
      out.graceEnd = new Date(base.getTime() + 7 * 86400000).toISOString();
      out.paymentStatus = 'paid';
    } else {
      out.trialEnd = null;
      out.paidUntil = null; out.nextDue = null; out.graceEnd = null;
      out.paymentStatus = 'pending';
    }
    return out;
  }

  const stateBadge = st => {
    const m = {
      blocked: ['badge badge-red', 'ShieldOff', t('Blocked')],
      expired: ['badge badge-red', 'XCircle', '']
    };
    const s = storeState(st);
    if (s.level === 'blocked') return `<span class="${m.blocked[0]}">${icon('ShieldOff', 'bic')} ${m.blocked[2]}</span>`;
    if (s.level === 'expired') return `<span class="badge badge-red" title="${t('Auto-blocked')}">${icon('XCircle', 'bic')} ${s.label}</span>`;
    if (s.level === 'grace') return `<span class="badge badge-amber">${icon('Clock', 'bic')} ${s.label}</span>`;
    if (s.level === 'none') return `<span class="badge">${icon('AlertTriangle', 'bic')} ${s.label}</span>`;
    return `<span class="badge badge-green">${icon('CheckCircle2', 'bic')} ${s.label}</span>`;
  };

  const dueCell = st => {
    const s = saleFor(st);
    if (!s) return '<span class="muted">—</span>';
    if (s.subscriptionTier === 'free') {
      return `<span class="st-due ${s.trialEnd && new Date(s.trialEnd) <= new Date() ? 'past' : ''}">${t('Trial until')}<br><b>${fmtDate(toIS(s.trialEnd))}</b></span>`;
    }
    if (s.plan === 'onetime') return '<span class="muted">' + t('One-time') + '</span>';
    const nd = s.nextDue ? new Date(s.nextDue) : null;
    const ge = s.graceEnd ? new Date(s.graceEnd) : null;
    if (!nd) return '<span class="muted">—</span>';
    const ndPast = nd <= new Date();
    return `<span class="st-due ${ndPast ? (ge && ge > new Date() ? 'warn' : 'past') : ''}">${t('Next due')} <b>${fmtDate(toIS(s.nextDue))}</b><br>${t('Grace until')} ${fmtDate(toIS(s.graceEnd))}</span>`;
  };

  // -------------------------------------------------------------
  // 6. Vista principal
  // -------------------------------------------------------------
  function renderStores() {
    const list = DB.data.stores || [];
    const states = list.map(storeState);
    const per = {
      total: list.length,
      ok: states.filter(s => s.level === 'ok' || s.level === 'grace').length,
      blocked: states.filter(s => s.level === 'blocked').length,
      expired: states.filter(s => s.level === 'expired').length
    };

    const kpi = (label, n, ic, danger) => `<div class="kpi ${danger ? 'kpi-danger' : ''}">
      <div class="kpi-top"><span class="kpi-ico">${icon(ic)}</span></div>
      <div class="kpi-value">${n}</div><div class="kpi-label">${label}</div></div>`;

    const summary = `<div class="ox1s-summary">
      ${kpi(t('Total stores'), list.length, 'Box')}
      ${kpi(t('Active sites'), per.ok, 'ShieldCheck')}
      ${kpi(t('Blocked sites'), per.blocked + per.expired, 'ShieldOff', (per.blocked + per.expired) > 0)}
    </div>`;

    const hasClients = (DB.data.clients || []).length > 0;
    const filterOn = stFilter.client !== 'all';
    const body = list.length ? list.filter(st => !filterOn || stFilter.client === (clientFor(st) && clientFor(st).id)).map(storeRow).join('') : '';
    const emptyBody = list.length && !body
      ? `<tr><td colspan="7"><div class="ox1-empty">${t('No stores match the filter.')}</div></td></tr>`
      : `<tr><td colspan="7"><div class="ox1-empty">${t('No stores yet.')}</div></td></tr>`;
    const filterSel = hasClients ? `<select data-stf="client" class="filter-bar-sel">
      <option value="all">${t('All clients')}</option>
      ${(DB.data.clients || []).map(c => `<option value="${c.id}" ${stFilter.client === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
    </select>` : '';

    return `
      ${pageHead(t('Stores'), t('Register each store: its GitHub page + the shared WhatShop database (ref) and the store ID inside it. From here you control payments, subscription and blocking.'), `
        ${hasClients ? `<button class="btn btn-primary btn-sm" data-st="register">${icon('Plus', 'bic')} ${t('Register store')}</button>` : ''}
        <button class="btn btn-ghost btn-sm" data-st="refresh">${icon('RefreshCw', 'bic')}</button>
      `)}
      ${!hasClients ? `<div class="card"><div class="ox1-empty">${icon('AlertTriangle')} ${t('Create a client first to register a store.')}</div></div>` : ''}
      ${summary}
      <div class="card">
        <div class="card-head"><h3>${t('Stores')}</h3><div class="filter-bar">${filterSel}</div></div>
        <p class="sale-sub">${t('Free trial: 14 days from activation. Paid plans: 7 days of grace after the due date; if unpaid, the store is blocked automatically.')}</p>
        <div class="table-wrap"><table class="table">
          <thead><tr>
            <th>${t('Store')}</th><th>${t('App')}</th><th>${t('Client')}</th><th>${t('Subscription')}</th><th>${t('Billing')}</th><th>${t('Status')}</th><th></th>
          </tr></thead>
          <tbody>${body || emptyBody}</tbody>
        </table></div>
      </div>`;
  }

  const appFor = st => (DB.data.apps || []).find(a => a.id === st.appId);
  const platformTag = st => {
    const pl = st.platform || 'web';
    if (pl === 'android') return `<span class="chip">${t('Android')}</span>`;
    if (pl === 'pc') return `<span class="chip">${t('PC')}</span>`;
    return `<span class="chip">${icon('Globe', 'bic')} ${t('Web')}</span>`;
  };

  function storeRow(st) {
    const cl = clientFor(st);
    const s = saleFor(st);
    const stState = storeState(st);
    const app = appFor(st);
    const search = [st.name, (cl && cl.name) || '', (app && app.name) || '', st.wsRef || '', String(st.wsStoreId || '')].join(' ').toLowerCase();
    const isBlocked = stState.level === 'blocked' || stState.level === 'expired';
    const canPay = !!s;
    return `<tr data-st-search="${esc(search)}">
      <td>
        <div class="st-head">
          <div class="mini-avatar">${esc((st.name || '?').charAt(0).toUpperCase())}</div>
          <div style="min-width:0">
            <div class="st-name">${esc(st.name)}</div>
            ${st.ghPage ? `<a class="st-url" href="${esc(st.ghPage)}" target="_blank" rel="noopener">${icon('Link', 'bic')} ${esc(st.ghPage)}</a>` : '<div class="st-url muted">—</div>'}
            ${st.wsRef ? `<div class="st-db">${esc(st.wsRef)} · id ${st.wsStoreId != null ? st.wsStoreId : '—'}</div>` : ''}
          </div>
        </div>
      </td>
      <td><div class="chip-row">${platformTag(st)}${app ? `<span class="chip">${esc(app.name)}</span>` : ''}</div></td>
      <td>${cl ? esc(cl.name) : '<span class="muted">—</span>'}</td>
      <td>${s ? `${tierBadge(s.subscriptionTier)}<div class="sale-sub">${planLabel(s.plan)} · ${paymentStatusLabel(s)}</div>` : '<span class="muted">—</span>'}</td>
      <td>${dueCell(st)}</td>
      <td>${stateBadge(st)}</td>
      <td class="row-actions">
        ${canPay ? `<button class="btn btn-primary btn-sm" data-st="pay" data-st-id="${st.id}" title="${t('Add payment')}">${icon('Plus', 'bic')} ${t('Add payment')}</button>` : ''}
        ${isBlocked
          ? `<button class="btn btn-ghost btn-sm" data-st="unblock" data-st-id="${st.id}" title="${t('Unblock')}">${icon('Power', 'bic')} ${t('Unblock')}</button>`
          : `<button class="btn btn-danger btn-sm" data-st="block" data-st-id="${st.id}" title="${t('Block now')}">${icon('ShieldOff', 'bic')} ${t('Block now')}</button>`}
        <button class="btn btn-ghost btn-sm" data-st="edit" data-st-id="${st.id}" title="${t('Edit')}">${icon('Pencil', 'bic')}</button>
        ${s ? `<button class="btn btn-ghost btn-sm" data-st="view-sale" data-st-id="${st.id}" title="${t('Project')}">${icon('Eye', 'bic')}</button>` : ''}
        <button class="btn btn-ghost btn-sm icon-btn-danger" data-st="del" data-st-id="${st.id}" title="${t('Delete')}">${icon('Trash2', 'bic')}</button>
      </td>
    </tr>`;
  }

  // -------------------------------------------------------------
  // 7. Acciones
  // -------------------------------------------------------------
  function reloadStores() {
    return reloadAndRender();
  }

  async function storeMarkPaid(id) {
    const st = (DB.data.stores || []).find(x => x.id === id);
    const s = st && saleFor(st);
    if (!st || !s) return;
    const { error } = await DB.markPaid(s.id, s.paymentMethod);
    if (error) { toast(error.message, 'error'); return; }
    toast(t('Payment recorded'), 'success');
    await reloadStores();
  }

  function storeToggleBlock(id, blocked) {
    const st = (DB.data.stores || []).find(x => x.id === id);
    if (!st) return;
    openConfirm({
      title: blocked ? t('Block now') : t('Unblock'),
      message: blocked ? t('Block this store? Visitors will see the 404 lock page immediately and the store admin will not be able to log in.') : t('Unblock this store? The page becomes visible again and the store admin can log in.'),
      confirmText: blocked ? t('Block now') : t('Unblock'),
      danger: blocked,
      onConfirm: async () => {
        const { error } = await DB.setStoreBlock(id, blocked, blocked ? 'manual' : '');
        if (error) { toast(error.message, 'error'); return; }
        toast(blocked ? t('Store blocked') : t('Store unblocked'), blocked ? 'warn' : 'success');
        await reloadStores();
      }
    });
  }

  function confirmStoreDel(id) {
    const st = (DB.data.stores || []).find(x => x.id === id);
    if (!st) return;
    openConfirm({
      title: t('Delete'),
      message: t('Delete "{name}" and its subscription? This removes the sale, payments and the store registration.', { name: st.name }),
      confirmText: t('Delete'),
      danger: true,
      onConfirm: async () => {
        const { error } = await DB.deleteStore(id, true);
        if (error) { toast(error.message, 'error'); return; }
        toast(t('Store deleted'), 'success');
        await reloadStores();
      }
    });
  }

  // -------------------------------------------------------------
  // 8. Modal de registro/edición
  // -------------------------------------------------------------
  function closeModal() {
    const el = document.getElementById('ox1sModal');
    if (el) el.remove();
  }

  function openStoreModal(id, preselectClientId, preselectAppId, bindSale) {
    const st = id ? (DB.data.stores || []).find(x => x.id === id) : null;
    const s = st ? saleFor(st) : (bindSale || null);
    const isEdit = !!st;

    const clients = DB.data.clients || [];
    const apps = DB.data.apps || [];
    const wsApp = apps.find(a => /whatshop|what shop/i.test(a.name)) || apps[0];

    const clientOpts = clients.map(c => `<option value="${c.id}" ${(s && s.clientId === c.id) || (!s && preselectClientId === c.id) ? 'selected' : ''}>${esc(c.name)}${c.company ? ' · ' + esc(c.company) : ''}</option>`).join('');
    const appSelId = (st && st.appId) || (s && s.appId) || (preselectAppId && (apps.find(a => a.id === preselectAppId) ? preselectAppId : null)) || (wsApp && wsApp.id);
    const appOpts = apps.map(a => `<option value="${a.id}" ${a.id === appSelId ? 'selected' : ''}>${esc(a.name)}</option>`).join('');

    const tier = s ? s.subscriptionTier : 'free';
    const plan = s ? s.plan : 'monthly';
    const pay = s ? s.paymentStatus : 'pending';
    const payDate = s && s.paidUntil ? toIS(s.paidUntil).slice(0, 10) : '';
    const status = st ? st.status : 'active';
    const platform = (st && st.platform) || 'web';

    const newBox = `<div class="form-row" id="stm-new-box" style="display:none">
      <label class="field"><span>${t('New client')} *</span><input id="stm-newclient-name" placeholder="${t('Client name')}" /></label>
      <label class="field"><span>${t('Company')}</span><input id="stm-newclient-company" placeholder="${t('Company')}" /></label>
    </div>`;

    const title = bindSale ? t('Link this project to a site') : t(isEdit ? 'Edit store' : 'New store');
    const subtitle = bindSale
      ? t('Adds the deployment data (repo, database and subscription) to the existing project.')
      : t('Free trial: 14 days from activation. Paid plans: 7 days of grace after the due date; if unpaid, the store is blocked automatically.');

    openModal(
      title,
      subtitle,
      `
      <div class="ox1s-sec">
        <div class="ox1s-sec-h">1 · ${t('General')}</div>
        <div class="form-row">
          <label class="field"><span>${t('Sucursal')} *</span><input id="stm-name" type="text" placeholder="Sucursal del cliente" value="${esc((st && st.name) || (s && s.contract) || '')}" required /></label>
          <label class="field"><span>${t('Client')}</span><select id="stm-client" required>${clientOpts}<option value="__new__">${t('New client…')}</option></select></label>
        </div>
        ${newBox}
        <div class="form-row">
          <label class="field"><span>${t('Aplicación')}</span><select id="stm-app">${appOpts || (apps.length ? '' : `<option value="">${t('No apps yet — create one first')}</option>`)}</select></label>
          <label class="field"><span>${t('Platform')}</span><select id="stm-platform">
            <option value="web" ${platform === 'web' ? 'selected' : ''}>${t('Web')}</option>
            <option value="android" ${platform === 'android' ? 'selected' : ''}>${t('Android')}</option>
            <option value="pc" ${platform === 'pc' ? 'selected' : ''}>${t('PC')}</option>
          </select></label>
        </div>
      </div>

      <div class="ox1s-sec">
        <div class="ox1s-sec-h">2 · ${t('Deployment')}</div>
        <div class="form-row">
          <label class="field"><span>${t('GitHub page')}</span><input id="stm-gh" type="url" placeholder="https://usuario.github.io/mitienda" value="${esc((st && st.ghPage) || '')}" /></label>
          <label class="field"><span>${t('Database')} (ref) *</span><input id="stm-wsref" type="text" placeholder="qfxcnvnjbabikdikftsr" value="${esc((st && st.wsRef) || '')}" required /></label>
        </div>
        <div class="form-row">
          <label class="field"><span>${t('Database')} (url)</span><input id="stm-wsurl" type="url" placeholder="https://qfxcnvnjbabikdikftsr.supabase.co" value="${esc((st && st.wsUrl) || '')}" /></label>
          <label class="field"><span>${t('Store ID')} *</span><input id="stm-wsid" type="number" min="1" value="${st && st.wsStoreId != null ? st.wsStoreId : ''}" required /></label>
        </div>
        <div class="ox1s-test-row">
          <button class="btn btn-ghost btn-sm" id="stm-test" type="button">${icon('Wifi', 'bic')} ${t('Test connection')}</button>
          <div id="stm-testout" class="ox1s-hint" style="margin:auto 0"></div>
        </div>
      </div>

      <div class="ox1s-sec">
        <div class="ox1s-sec-h">3 · ${t('Subscription')}</div>
        <div class="form-row">
          <label class="field"><span>${t('Subscription')}</span><select id="stm-tier">
            ${['free', 'basico', 'profesional', 'empresarial'].map(x => `<option value="${x}" ${x === tier ? 'selected' : ''}>${tierLabel(x)}</option>`).join('')}
          </select></label>
          <label class="field"><span>${t('Plan')}</span><select id="stm-plan">
            <option value="monthly" ${plan === 'monthly' ? 'selected' : ''}>${t('Monthly')}</option>
            <option value="annual" ${plan === 'annual' ? 'selected' : ''}>${t('Annual')}</option>
            <option value="onetime" ${plan === 'onetime' ? 'selected' : ''}>${t('One-time')}</option>
          </select></label>
        </div>
        <div class="form-row">
          <label class="field"><span>${t('Payment status')}</span><select id="stm-pay">
            <option value="pending" ${pay === 'pending' ? 'selected' : ''}>${t('Pending')}</option>
            <option value="paid" ${pay === 'paid' ? 'selected' : ''}>${t('Paid')}</option>
          </select></label>
          <label class="field"><span>${t('Payment date')}</span><input id="stm-paydate" type="date" value="${payDate}" /></label>
        </div>
        <div class="form-row">
          <label class="field"><span>${t('Status')}</span><select id="stm-status">
            <option value="active" ${status !== 'blocked' ? 'selected' : ''}>${t('Active')}</option>
            <option value="blocked" ${status === 'blocked' ? 'selected' : ''}>${t('Blocked')}</option>
          </select></label>
          <div class="field ox1s-no-pad"><p class="ox1s-hint">${t('Payment date')}: el período pago empieza hoy (o la fecha que pongas). Prórroga de 7 días tras el vencimiento.</p></div>
        </div>
      </div>`,
      `<button class="btn btn-ghost" data-st="close-modal" type="button">${t('Cancel')}</button>
       <button class="btn btn-primary" id="stm-submit" type="button">${t('Save')}</button>`
    );

    document.getElementById('stm-submit').addEventListener('click', () => saveStoreSubmit(st, s));
    document.getElementById('stm-test').addEventListener('click', () => testConnection());
    document.getElementById('stm-client').addEventListener('change', () => {
      const box = document.getElementById('stm-new-box');
      if (box) box.style.display = document.getElementById('stm-client').value === '__new__' ? '' : 'none';
    });
  }

  function openModal(title, sub, body, foot) {
    closeModal();
    const el = document.createElement('div');
    el.className = 'ox1s-modal-backdrop';
    el.id = 'ox1sModal';
    el.innerHTML = `<div class="ox1s-modal"><h3>${title}</h3><p class="sub">${sub}</p>${body}<div class="ox1s-modal-foot">${foot}</div></div>`;
    el.addEventListener('mousedown', e => { if (e.target === el) closeModal(); });
    document.body.appendChild(el);
    const first = el.querySelector('input:not([type=hidden]), select, textarea');
    if (first) first.focus();
  }

  async function saveStoreSubmit(st, s) {
    const isEdit = !!st;
    const name = document.getElementById('stm-name').value.trim();
    let clientId = document.getElementById('stm-client').value;
    const appId = document.getElementById('stm-app').value || null;
    const platform = document.getElementById('stm-platform').value;
    const ghPage = document.getElementById('stm-gh').value.trim() || null;
    const wsIdNum = parseInt(document.getElementById('stm-wsid').value, 10);
    const wsRef = document.getElementById('stm-wsref').value.trim() || null;
    const wsUrl = document.getElementById('stm-wsurl').value.trim() || null;
    const tier = document.getElementById('stm-tier').value;
    const plan = document.getElementById('stm-plan').value;
    const pay = document.getElementById('stm-pay').value;
    const payDate = document.getElementById('stm-paydate').value || null;
    const status = document.getElementById('stm-status').value;

    if (!name) { toast(t('Name'), 'warn'); return; }
    if (clientId === '__new__') {
      const cn = document.getElementById('stm-newclient-name').value.trim();
      if (!cn) { toast(t('Client name'), 'warn'); return; }
      const cr = await DB.createClient({ name: cn, company: document.getElementById('stm-newclient-company').value.trim() || null });
      if (cr && cr.error) { toast(cr.error.message || cr.error, 'error'); return; }
      clientId = cr.data.id;
    }
    if (!clientId) { toast(t('Client'), 'warn'); return; }
    if (!(wsIdNum > 0)) { toast(t('Store ID'), 'warn'); return; }

    const sch = newStoreSchedule({ tier, plan, paymentStatus: pay, paymentDate: payDate });
    const today = new Date().toISOString().slice(0, 10);
    const salePayload = {
      appId,
      clientId,
      contract: name,
      plan,
      subscriptionTier: tier,
      startDate: s ? s.startDate : today,
      endDate: sch.nextDue ? toIS(sch.nextDue) : null,
      paymentStatus: sch.paymentStatus,
      paymentMethod: s ? s.paymentMethod : '—',
      paidUntil: sch.paidUntil,
      nextDue: sch.nextDue,
      graceEnd: sch.graceEnd,
      trialEnd: sch.trialEnd,
      status: status === 'blocked' ? 'suspended' : 'active',
      page: status === 'blocked' ? 'offline' : 'online',
      db: (s && s.db) || 'active'
    };

    let saleId = s ? s.id : null;
    let res;
    if (saleId) res = await DB.updateSale(saleId, salePayload);
    else res = await DB.createSale(salePayload);
    if (res && res.error) { toast(res.error.message || res.error, 'error'); return; }
    if (!saleId && res && res.data) saleId = res.data.id;

    const storePayload = {
      id: st ? st.id : null,
      name,
      appId,
      platform,
      ghPage,
      wsRef,
      wsUrl,
      wsStoreId: wsIdNum,
      saleId,
      status,
      blockedReason: st && st.blockedReason
    };
    const r2 = await DB.saveStore(storePayload);
    if (r2 && r2.error) { toast(r2.error.message || r2.error, 'error'); return; }

    closeModal();
    toast(t(isEdit ? 'Store updated' : 'Store registered'), 'success');
    await reloadStores();
  }

  // Prueba de conexión: llama a la RPC store_status del panel central
  // con los valores que se van a guardar, sin guardar nada.
  async function testConnection() {
    const ref = (document.getElementById('stm-wsref').value || '').trim();
    const sid = parseInt(document.getElementById('stm-wsid').value, 10);
    const out = document.getElementById('stm-testout');
    if (!ref || !(sid > 0)) { out.textContent = t('Fill Store ID and ref first.'); out.className = 'ox1s-hint ox1s-bad'; return; }
    out.textContent = '…';
    out.className = 'ox1s-hint ox1s-busy';
    try {
      const cfg = window.SUPABASE_CONFIG;
      if (!cfg || !cfg.url || !cfg.key) throw new Error('no config');
      const r = await fetch(`${cfg.url}/rest/v1/rpc/store_status`, {
        method: 'POST',
        headers: { 'apikey': cfg.key, 'Authorization': 'Bearer ' + cfg.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_ws_ref: ref, p_ws_store_id: sid })
      });
      const j = await r.json();
      if (j && j.online === true) {
        out.textContent = t('Online — link works.');
        out.className = 'ox1s-hint ox1s-ok';
      } else if (j && j.status === 'unregistered') {
        out.textContent = t('Not registered yet — the store needs activation from the panel.');
        out.className = 'ox1s-hint ox1s-bad';
      } else {
        out.textContent = t('Not registered');
        out.className = 'ox1s-hint ox1s-bad';
      }
    } catch (err) {
      out.textContent = t('Test failed');
      out.className = 'ox1s-hint ox1s-bad';
    }
  }

  // -------------------------------------------------------------
  // 8a. Registro/edición de tienda (disponible también desde Projects)
  // -------------------------------------------------------------
  window.openStoreModal = openStoreModal;
  window.linkStoreToSale = function (saleId) {
    const s = (DB.data.sales || []).find(x => x.id === saleId);
    if (!s) { toast(t('Not found'), 'warn'); return; }
    openStoreModal(null, s.clientId, s.appId, s);
  };

  // -------------------------------------------------------------
  // 8b. Pago (adelanto de meses)
  // -------------------------------------------------------------
  window.openPayment = function openPaymentOpen(saleId) {
    const s = (DB.data.sales || []).find(x => x.id === saleId);
    if (!s) { toast(t('Not found'), 'warn'); return; }
    const methods = (window.DEFAULT_PAYMENT_METHODS || ['—', 'Card', 'Transfer', 'Cash']).map(m => `<option>${esc(m)}</option>`).join('');
    openModal(
      t('Payment for {name}', { name: s.contract }),
      t('Goes ahead: the paid period moves from the date already paid.'),
      `
      <label class="field"><span>${t('Months')}</span><input id="pay-months" type="number" min="1" max="60" value="1" required /></label>
      <div class="form-row">
        <label class="field"><span>${t('Payment method')}</span><select id="pay-method">${methods}</select></label>
        <label class="field"><span>${t('Note')}</span><input id="pay-note" type="text" placeholder="" /></label>
      </div>
      <p class="ox1s-hint">1 ${t('month')} = 1 ${t('period')} del plan actual (${planLabel(s.plan)}). Si ya pagó hasta una fecha, se adelanta desde ahí.</p>`,
      `<button class="btn btn-ghost" data-st="close-modal" type="button">${t('Cancel')}</button>
       <button class="btn btn-primary" id="pay-submit" type="button">${t('Add this payment')}</button>`
    );
    document.getElementById('pay-submit').addEventListener('click', async () => {
      const months = parseInt(document.getElementById('pay-months').value, 10);
      if (!(months >= 1)) { toast(t('Months'), 'warn'); return; }
      const method = document.getElementById('pay-method').value;
      const note = document.getElementById('pay-note').value.trim() || null;
      const { error } = await DB.addPayment(saleId, { months, method, note });
      if (error) { toast(error.message || error, 'error'); return; }
      closeModal();
      toast(t('Payment recorded'), 'success');
      await reloadStores();
    });
  };

  // -------------------------------------------------------------
  // 8c. Suscripciones de un cliente
  // -------------------------------------------------------------
  function substabRow(st, cl, s) {
    const stState = storeState(st);
    const isBlocked = stState.level === 'blocked' || stState.level === 'expired';
    const payBtn = s ? `<button class="btn btn-sm btn-primary" data-csub="pay" data-id="${st.id}" type="button">${icon('Plus', 'bic')} ${t('Add payment')}</button>` : '';
    const blkBtn = isBlocked
      ? `<button class="btn btn-sm btn-ghost" data-csub="unblock" data-id="${st.id}" type="button">${icon('Power', 'bic')} ${t('Unblock')}</button>`
      : `<button class="btn btn-sm btn-danger" data-csub="block" data-id="${st.id}" type="button">${icon('ShieldOff', 'bic')} ${t('Block now')}</button>`;
    return `<tr>
      <td><div class="st-name">${esc(st.name)}</div></td>
      <td>${s ? `${tierBadge(s.subscriptionTier)} ${esc(planLabel(s.plan))}` : '<span class="muted">—</span>'}</td>
      <td>${dueCell(st)}</td>
      <td>${stateBadge(st)}</td>
      <td class="row-actions">
        ${payBtn}
        ${blkBtn}
        <button class="btn btn-sm btn-ghost" data-csub="edit" data-id="${st.id}" type="button">${icon('Pencil', 'bic')} ${t('Edit')}</button>
        <button class="btn btn-sm btn-ghost icon-btn-danger" data-csub="del" data-id="${st.id}" type="button">${icon('Trash2', 'bic')} ${t('Delete subscription')}</button>
      </td>
    </tr>`;
  }

  window.openClientSubs = function openClientSubs(clientId) {
    const cl = (DB.data.clients || []).find(c => c.id === clientId);
    if (!cl) { toast(t('Not found'), 'warn'); return; }
    const rows = (DB.data.stores || []).filter(st => {
      const s = saleFor(st);
      return s && s.clientId === clientId;
    });

    openModal(
      t('Subscriptions of {name}', { name: cl.name }),
      t('Free trial: 14 days from activation. Paid plans: 7 days of grace after the due date; if unpaid, the store is blocked automatically.'),
      `
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${t('Store')}</th><th>${t('Subscription')}</th><th>${t('Billing')}</th><th>${t('Status')}</th><th></th></tr></thead>
        <tbody>${rows.map(st => substabRow(st, cl, saleFor(st))).join('') || `<tr><td colspan="5"><div class="ox1-empty">${t('This client has no subscriptions.')}</div></td></tr>`}</tbody>
      </table></div>
      <div class="ox1s-modal-foot" style="justify-content:space-between">
        <button class="btn btn-ghost" data-st="close-modal" type="button">${t('Cancel')}</button>
        <button class="btn btn-primary" id="csub-register" type="button">${icon('Plus', 'bic')} ${t('Register store')}</button>
      </div>`,
      ''
    );

    document.getElementById('csub-register').addEventListener('click', () => { closeModal(); openStoreModal(null, clientId); });
    document.getElementById('ox1sModal').addEventListener('click', e => {
      const b = e.target.closest('[data-csub]');
      if (!b) return;
      const id = b.dataset.id;
      const act = b.dataset.csub;
      const st = (DB.data.stores || []).find(x => x.id === id);
      if (!st) return;
      if (act === 'pay') openPayment(st.saleId);
      else if (act === 'edit') { closeModal(); openStoreModal(id); }
      else if (act === 'block') DB.setStoreBlock(id, true, 'manual').then(async r => { if (r.error) toast(r.error, 'error'); else await reloadSubs(clientId); });
      else if (act === 'unblock') DB.setStoreBlock(id, false, '').then(async r => { if (r.error) toast(r.error, 'error'); else await reloadSubs(clientId); });
      else if (act === 'del') {
        openConfirm({
          title: t('Delete subscription'),
          message: t('Delete "{name}" and its subscription? This removes the sale, payments and the store registration.', { name: st.name }),
          confirmText: t('Delete'),
          danger: true,
          onConfirm: async () => {
            const { error } = await DB.deleteStore(id, true);
            if (error) { toast(error.message || error, 'error'); return; }
            toast(t('Store deleted'), 'success');
            await reloadSubs(clientId);
          }
        });
      }
    });
  };

  async function reloadSubs(clientId) {
    await reloadAndRender();
    window.openClientSubs(clientId);
  }

  // -------------------------------------------------------------
  // 9. Delegación de clicks
  // -------------------------------------------------------------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-st]');
    if (!t) return;
    const act = t.dataset.st;
    const id = t.dataset.stId;
    if (act === 'close-modal') { closeModal(); return; }
    if (act === 'refresh') { reloadStores(); return; }
    if (act === 'register') { openStoreModal(); return; }
    if (act === 'edit') { openStoreModal(id); return; }
    if (act === 'pay') { const s = saleFor((DB.data.stores || []).find(x => x.id === id)); if (s) openPayment(s.id); return; }
    if (act === 'block') { storeToggleBlock(id, true); return; }
    if (act === 'unblock') { storeToggleBlock(id, false); return; }
    if (act === 'del') { confirmStoreDel(id); return; }
    if (act === 'view-sale') { const st = (DB.data.stores || []).find(x => x.id === id); if (st && st.saleId) navigate('sale', st.saleId); }
  });

  document.addEventListener('change', e => {
    const el = e.target;
    if (!el || !el.dataset || !el.dataset.stf) return;
    stFilter[el.dataset.stf] = el.value;
    const view = document.querySelector('#view');
    if (view && window.currentView === 'stores') view.innerHTML = renderStores();
  });
})();
// =============================================================
// My Services Panel — Boot tracer
// Loaded FIRST. Records every step of the boot process (scripts,
// DB calls, overlay changes, network, JS errors) and — if the boot
// gets stuck — shows a live panel telling you exactly what hangs.
// Open it manually with ?trace in the URL.
// =============================================================
(() => {
  const t0 = Date.now();
  const since = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const log = [];
  const rec = (type, msg) => {
    const entry = { t: Date.now(), type, msg };
    log.push(entry);
    if (log.length > 400) log.shift();
    try { console.log('[trace:' + type + '] ' + since() + ' ' + msg); } catch (e) {}
    renderIfOpen();
    return entry;
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let panelEl = null;
  let panelTimer = null;
  let lastRendered = 0;

  function buildPanel() {
    const style = document.createElement('style');
    style.textContent = `
      #btPanel{position:fixed;inset:0;z-index:400;display:none;flex-direction:column;background:#09090b;color:#e4e4e7;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
      #btPanel.open{display:flex}
      #btHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid #27272a;background:#0f0f11}
      #btHead b{font-size:13px}
      #btHead button{padding:6px 12px;border:1px solid #3f3f46;border-radius:8px;background:transparent;color:#e4e4e7;cursor:pointer;font:inherit}
      #btHead button:hover{background:#27272a}
      #btLogs{flex:1;overflow:auto;padding:10px 14px}
      .bt-row{display:flex;gap:8px;padding:2px 0;border-bottom:1px solid #16161a}
      .bt-time{color:#71717a;flex-shrink:0}
      .bt-type{flex-shrink:0;min-width:52px;font-weight:700}
      .bt-type.info{color:#38bdf8}.bt-type.ok{color:#4ade80}.bt-type.fail{color:#f87171}.bt-type.db{color:#c084fc}.bt-type.net{color:#fbbf24}.bt-type.dom{color:#a3a3a3}
      .bt-msg{word-break:break-word;white-space:pre-wrap}
      #btEmpty{color:#71717a;padding:20px;text-align:center}`;
    document.head.appendChild(style);
    const el = document.createElement('div');
    el.id = 'btPanel';
    el.innerHTML = `<div id="btHead"><b>Boot trace</b><span id="btStatus"></span>
      <span><button id="btCopy" type="button">Copy</button> <button id="btClose" type="button">Close</button></span></div>
      <div id="btLogs"></div>`;
    document.body.appendChild(el);
    document.getElementById('btClose').addEventListener('click', () => { el.classList.remove('open'); });
    document.getElementById('btCopy').addEventListener('click', () => {
      const text = log.map(l => since2(l.t) + ' [' + l.type + '] ' + l.msg).join('\n');
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
    });
    panelEl = el;
  }
  const since2 = t => ((t - t0) / 1000).toFixed(1) + 's';

  function renderIfOpen() {
    if (!panelEl || !panelEl.classList.contains('open')) return;
    const now = Date.now();
    if (now - lastRendered < 200) return;
    lastRendered = now;
    const box = document.getElementById('btLogs');
    if (!box) return;
    box.innerHTML = log.length ? log.map(l =>
      `<div class="bt-row"><span class="bt-time">${since2(l.t)}</span><span class="bt-type ${l.type}">${l.type}</span><span class="bt-msg">${esc(l.msg)}</span></div>`).join('') : '<div id="btEmpty">No events yet…</div>';
    const st = document.getElementById('btStatus');
    if (st) st.textContent = log.length + ' events · ' + since() + ' elapsed';
    box.scrollTop = box.scrollHeight;
  }

  function showPanel(reason) {
    if (!panelEl) buildPanel();
    panelEl.classList.add('open');
    rec('info', reason ? 'Panel opened: ' + reason : 'Panel opened (manual).');
    renderIfOpen();
  }

  // ---------- script / resource load tracking ----------
  function watchResources() {
    const seen = new Set();
    const known = ['chart.js', 'supabase-js', 'config.js', 'diag.js', 'db.js', 'script.js', 'styles.css'];
    const tick = () => {
      let entries = [];
      try { entries = performance.getEntriesByType('resource') || []; } catch (e) {}
      for (const e of entries) {
        const url = String(e.name || '');
        const hit = known.find(k => url.includes(k));
        if (hit && !seen.has(url)) {
          seen.add(url);
          rec('info', hit + ' loaded in ' + Math.round(e.duration) + 'ms' + (e.responseStatus ? ' (HTTP ' + e.responseStatus + ')' : ''));
        }
      }
    };
    tick();
    setInterval(tick, 500);
  }

  // ---------- DB call instrumentation ----------
  function wrapDB() {
    if (window.__btWrapped) return;
    const DB = window.DB;
    if (!DB) return;
    window.__btWrapped = true;
    rec('info', 'window.DB detected → wrapping calls.');
    const names = ['getSession', 'onAuth', 'signIn', 'signOut', 'sendReset', 'signUp', 'changePassword',
      'mfaStatus', 'mfaEnroll', 'mfaChallenge', 'mfaVerify', 'mfaUnenroll', 'mfaLogin',
      'setRecoveryKey', 'hasRecoveryKey', 'recoverAccount',
      'loadAll',
      'createApp', 'updateApp', 'deleteApp', 'createClient', 'updateClient', 'deleteClient',
      'createSale', 'updateSale', 'deleteSale', 'setBlock', 'markPaid', 'regenKey',
      'saveSettings', 'resetOwnData'];
    for (const n of names) {
      if (typeof DB[n] !== 'function') continue;
      const orig = DB[n];
      DB[n] = async function (...args) {
        rec('db', n + '() started');
        const t = Date.now();
        try {
          const r = await orig.apply(this, args);
          rec('db', n + '() done in ' + (Date.now() - t) + 'ms');
          return r;
        } catch (e) {
          rec('fail', n + '() threw: ' + (e && e.message));
          throw e;
        }
      };
    }
  }

  // ---------- network instrumentation (proves demo touches no DB) ----------
  function wrapNetwork() {
    if (window.__btNet) return;
    window.__btNet = true;
    const of = window.fetch;
    if (typeof of === 'function') {
      window.fetch = function (...args) {
        const t = Date.now();
        const url = String(args[0] || '').slice(0, 90);
        rec('net', 'fetch ' + url);
        const p = of.apply(this, args);
        p.then(r => rec('net', 'fetch ' + url + ' → ' + r.status + ' in ' + (Date.now() - t) + 'ms'))
          .catch(e => rec('net', 'fetch ' + url + ' ERROR ' + (e && e.message)));
        return p;
      };
    }
    const OXHR = window.XMLHttpRequest;
    if (typeof OXHR === 'function') {
      window.XMLHttpRequest = function () {
        const x = new OXHR();
        const url = (u) => { x.__btUrl = String(u || '').slice(0, 90); };
        const op = x.open;
        x.open = function (m, u, ...rest) { url(u); return op.call(this, m, u, ...rest); };
        x.addEventListener('load', () => rec('net', 'XHR ' + (x.__btUrl || '?') + ' → ' + x.status));
        x.addEventListener('error', () => rec('net', 'XHR ' + (x.__btUrl || '?') + ' ERROR'));
        return x;
      };
    }
  }

  // ---------- DOM / overlay observation ----------
  function watchOverlay() {
    let prevHidden = null;
    let prevMsg = null;
    let visibleSince = 0;
    let sawShown = false;
    const overlay = () => document.getElementById('bootOverlay');
    const tick = () => {
      const o = overlay();
      if (!o) return;
      const hidden = o.hidden;
      if (hidden !== prevHidden) {
        prevHidden = hidden;
        rec('dom', 'bootOverlay ' + (hidden ? 'HIDDEN' : 'SHOWN'));
        if (hidden) {
          const nav = document.querySelectorAll('#nav .nav-item').length;
          if (sawShown || nav > 0) rec('ok', 'boot finished → overlay hidden, ' + nav + ' nav items.');
          sawShown = false;
          visibleSince = 0;
        } else {
          sawShown = true;
          visibleSince = Date.now();
        }
      }
      const msgEl = document.getElementById('bootMsg');
      const msg = msgEl ? msgEl.textContent : '';
      if (msg !== prevMsg) {
        prevMsg = msg;
        if (msg.trim()) rec('dom', 'bootMsg: "' + msg.trim().slice(0, 80) + '"');
      }
      if (visibleSince && Date.now() - visibleSince > 5000) {
        visibleSince = 0;
        showPanel('Boot has been "loading" for 5s+.');
      }
    };
    tick();
    setInterval(tick, 300);
    const mo = new MutationObserver(tick);
    const root = document.getElementById('bootOverlay');
    if (root) mo.observe(root, { attributes: true, attributeFilter: ['hidden'], subtree: true, childList: true });
  }

  // ---------- errors ----------
  window.addEventListener('error', e => { if (e && e.error) rec('fail', 'window error: ' + e.error.message + '\n' + (e.error.stack || '').split('\n').slice(0, 3).join('\n')); });
  window.addEventListener('unhandledrejection', e => { const r = e.reason || {}; rec('fail', 'unhandled rejection: ' + (r.message || r) + '\n' + (r.stack || '').split('\n').slice(0, 3).join('\n')); });

  // ---------- boot ----------
  rec('info', 'boottrace loaded. Waiting for scripts…');
  watchResources();
  wrapNetwork();
  watchOverlay();
  const dbPoll = setInterval(() => { if (window.DB) { wrapDB(); clearInterval(dbPoll); } }, 120);
  if (location.search.includes('trace') || location.hash.includes('trace')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(() => showPanel('manual'), 300));
    else setTimeout(() => showPanel('manual'), 300);
  }

  window.BOOTTRACE = {
    log,
    rec,
    showPanel,
    since: () => since()
  };
})();
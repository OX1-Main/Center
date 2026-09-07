// =============================================================
// My Services Panel — Self-diagnostic
// Run it: open the panel with ?diag in the URL, or press
// "Diagnose" on the boot/error screen.
// =============================================================
(() => {
  const t0 = Date.now();
  let lastError = null;
  const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r({ __timeout: true }), ms))]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const redact = s => { if (typeof s !== 'string' || s.length <= 6) return esc(s); return esc(s.slice(0, 4) + '…' + s.slice(-4)); };

  function report(lines, okCount) {
    const el = document.getElementById('diagReport');
    if (!el) return;
    el.innerHTML = lines.map(l => `
      <div class="diag-row ${l.ok ? 'ok' : 'fail'}">
        <span class="diag-badge">${l.ok ? 'OK' : 'FAIL'}</span>
        <div><div class="diag-label">${esc(l.label)}</div><div class="diag-detail">${l.detail || ''}</div></div>
      </div>`).join('');
    const head = document.getElementById('diagSummary');
    if (head) head.textContent = `${okCount}/${lines.length} checks passed` + (lastError ? ' — blocked by an error.' : '.');
    const btn = document.getElementById('diagRetry');
    if (btn) btn.style.display = 'inline-flex';
  }

  async function run() {
    const lines = [];
    let ok = 0;
    const add = (label, pass, detail) => { lines.push({ ok: !!pass, label, detail }); if (pass) ok++; };

    add('Browser', typeof window !== 'undefined' && !!document, `UA: ${navigator.userAgent.slice(0, 90)}`);
    add('localStorage available', (() => { try { localStorage.setItem('__d','1'); localStorage.removeItem('__d'); return true; } catch (e) { lastError = e; return false; } })(), 'Needed for Supabase sessions.');

    const cfg = (typeof window !== 'undefined' && window.SUPABASE_CONFIG) || null;
    const cfgUrl = cfg && typeof cfg.url === 'string' ? cfg.url : null;
    const cfgKey = cfg && typeof cfg.key === 'string' ? cfg.key : null;
    add('config.js loaded', !!cfgUrl && !!cfgKey, cfgUrl ? `URL: ${esc(cfgUrl)} · key: ${redact(cfgKey)}` : 'SUPABASE_URL / SUPABASE_ANON_KEY not defined');
    add('Config mode', true, (cfgUrl && !/YOURPROJECT|YOUR_SUPABASE/.test(cfgUrl)) ? 'REAL (Supabase) — DB ready.' : 'DEMO (placeholders) — runs with in-memory data, no DB needed. Fill config.js to go live.');
    add('Chart.js CDN loaded', typeof window.Chart !== 'undefined', typeof window.Chart === 'undefined' ? 'window.Chart missing — check internet / CDN.' : 'Charts will render.');
    add('supabase-js CDN loaded', typeof window.supabase !== 'undefined', typeof window.supabase === 'undefined' ? 'window.supabase missing — check internet / CDN.' : 'Supabase client available.');
    add('db.js loaded (window.DB)', typeof window.DB !== 'undefined' && !!window.DB, typeof window.DB === 'undefined' ? 'window.DB missing — db.js failed to run.' : 'Data layer ready.');
    add('Mode', typeof window.DB !== 'undefined' && window.DB.isConfigured === false, window.DB && window.DB.isConfigured ? 'REAL mode (using Supabase).' : 'DEMO mode (in-memory data, works offline).');

    if (window.DB) {
      const sess = await withTimeout(window.DB.getSession(), 8000);
      add('getSession() resolves', !!(sess && !sess.__timeout && !sess.error), sess && sess.__timeout ? 'Timed out after 8s — network/CORS issue.' : sess && sess.error ? `Error: ${esc(sess.error.message)}` : `Session: ${sess.data && sess.data.session && sess.data.session.user ? 'present' : 'none'}`);

      const loaded = await withTimeout(window.DB.loadAll(), 10000);
      const loadOk = !(loaded && loaded.__timeout) && !(loaded && loaded.error);
      add('loadAll() resolves', loadOk, loaded && loaded.__timeout ? 'Timed out after 10s — DB/network issue.' : loaded && loaded.error ? `Error: ${esc(loaded.error)}` : `Apps ${window.DB.data.apps.length} · Clients ${window.DB.data.clients.length} · Sales ${window.DB.data.sales.length}`);

      if (!(loaded && loaded.__timeout)) {
        add('Rendered view has content', document.getElementById('view') && document.getElementById('view').innerHTML.length > 50, document.getElementById('view') ? `View HTML: ${document.getElementById('view').innerHTML.length} chars` : '#view element missing');
        add('Navigation rendered', document.querySelectorAll('#nav .nav-item').length > 0, `${document.querySelectorAll('#nav .nav-item').length} nav items`);
        add('Boot overlay hidden', document.getElementById('bootOverlay') && document.getElementById('bootOverlay').hidden === true, document.getElementById('bootOverlay') && !document.getElementById('bootOverlay').hidden ? 'Overlay still visible — boot did not finish.' : '');
      }
    }

    const el = document.getElementById('diagOverlay');
    if (el) { el.hidden = false; el.style.display = 'flex'; }
    report(lines, ok);
  }

  function ensureDom() {
    if (document.getElementById('diagOverlay')) return;
    const style = document.createElement('style');
    style.textContent = `
      #diagOverlay{position:fixed;inset:0;z-index:300;display:none;align-items:flex-start;justify-content:center;background:var(--overlay-bg,#0009);padding:28px 16px;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--fg,#18181b)}
      .diag-card{width:100%;max-width:640px;background:var(--card,#fff);border:1px solid var(--border,#e4e4e7);border-radius:14px;box-shadow:0 25px 60px -15px rgba(0,0,0,.35);padding:22px;box-sizing:border-box}
      .diag-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
      .diag-head h2{margin:0;font-size:17px;font-weight:650;letter-spacing:-.01em}
      #diagSummary{font-size:13px;color:#71717a}
      .diag-row{display:flex;gap:10px;align-items:flex-start;padding:9px 4px;border-bottom:1px solid #f1f1f3;font-size:13px}
      .diag-row:last-child{border-bottom:none}
      .diag-badge{flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.05em;padding:3px 8px;border-radius:99px;margin-top:1px}
      .diag-row.ok .diag-badge{background:#dcfce7;color:#15803d}
      .diag-row.fail .diag-badge{background:#fee2e2;color:#b91c1c}
      .diag-label{font-weight:600}
      .diag-detail{color:#71717a;font-size:12px;margin-top:2px;word-break:break-word}
      .diag-actions{display:flex;gap:10px;margin-top:16px;justify-content:flex-end}
      .diag-actions button{padding:8px 14px;border-radius:8px;border:1px solid #e4e4e7;background:transparent;cursor:pointer;font-size:13px;font-weight:550}
      .diag-actions button.primary{background:#18181b;color:#fff;border-color:#18181b}
      .diag-actions button:hover{opacity:.85}
      @media (prefers-color-scheme: dark){
        .diag-card{background:#09090b;border-color:#27272a;color:#f4f4f5}
        #diagSummary{color:#a1a1aa}
        .diag-row{border-bottom-color:#1f1f23}
        .diag-row.ok .diag-badge{background:#14532d;color:#4ade80}
        .diag-row.fail .diag-badge{background:#7f1d1d;color:#fca5a5}
        .diag-detail{color:#a1a1aa}
        .diag-actions button{border-color:#27272a;color:#f4f4f5}
        .diag-actions button.primary{background:#fafafa;color:#09090b;border-color:#fafafa}
      }`;
    document.head.appendChild(style);
    const card = document.createElement('div');
    card.className = 'diag-card';
    card.innerHTML = `
      <div class="diag-head"><h2>Diagnostics</h2><span id="diagSummary"></span></div>
      <div id="diagReport"></div>
      <div class="diag-actions">
        <button id="diagRetry" style="display:none" type="button">Run again</button>
        <button class="primary" id="diagClose" type="button">Close</button>
      </div>`;
    const overlay = document.createElement('div');
    overlay.id = 'diagOverlay';
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.getElementById('diagClose').addEventListener('click', () => { overlay.style.display = 'none'; });
    document.getElementById('diagRetry').addEventListener('click', () => { document.getElementById('diagReport').innerHTML = '<div class="diag-detail">Running…</div>'; run(); });
  }

  window.DIAG = { run: () => { ensureDom(); run(); } };

  if (location.search.includes('diag') || location.hash.includes('diag')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(() => { ensureDom(); run(); }, 800));
    else setTimeout(() => { ensureDom(); run(); }, 800);
  }
})();
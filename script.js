// =============================================================
// My Services Panel — UI layer
// Data + auth come from db.js (Supabase) or demo mode.
// =============================================================

const ICONS = {
  BarChart3: '<path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>',
  DollarSign: '<line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
  TrendingUp: '<path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path>',
  TrendingDown: '<path d="M16 17h6v-6"></path><path d="m22 17-8.5-8.5-5 5L2 7"></path>',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
  ShieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
  ShieldOff: '<path d="m2 2 20 20"></path><path d="M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71"></path><path d="M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264"></path>',
  Power: '<path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 1 1-12.77.04"></path>',
  Key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path><path d="m21 2-9.6 9.6"></path><circle cx="7.5" cy="15.5" r="5.5"></circle>',
  RefreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path>',
  CheckCircle2: '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>',
  XCircle: '<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>',
  Clock: '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
  Database: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path>',
  Wifi: '<path d="M12 20h.01"></path><path d="M2 8.82a15 15 0 0 1 20 0"></path><path d="M5 12.859a10 10 0 0 1 14 0"></path><path d="M8.5 16.429a5 5 0 0 1 7 0"></path>',
  WifiOff: '<path d="M12 20h.01"></path><path d="M8.5 16.429a5 5 0 0 1 7 0"></path><path d="M5 12.859a10 10 0 0 1 5.17-2.69"></path><path d="M19 12.859a10 10 0 0 0-2.007-1.523"></path><path d="M2 8.82a15 15 0 0 1 4.177-2.643"></path><path d="M22 8.82a15 15 0 0 0-11.288-3.764"></path><path d="m2 2 20 20"></path>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
  Unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>',
  Plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
  ArrowRight: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
  Bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>',
  CalendarDays: '<path d="M8 2v3"></path><path d="M16 2v3"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M8 13h.01"></path><path d="M12 13h.01"></path><path d="M16 13h.01"></path><path d="M8 17h.01"></path><path d="M12 17h.01"></path><path d="M16 17h.01"></path>',
  Receipt: '<path d="M12 17V7"></path><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"></path><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"></path>',
  User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  Package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><path d="m7.5 4.27 9 5.15"></path>',
  Copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
  Wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>',
  Mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect>',
  Server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line>',
  Building2: '<path d="M10 12h4"></path><path d="M10 8h4"></path><path d="M14 21v-3a2 2 0 0 0-4 0v3"></path><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>',
  Search: '<path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle>',
  LayoutDashboard: '<rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect>',
  FolderKanban: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><path d="M8 10v4"></path><path d="M12 10v2"></path><path d="M16 10v6"></path>',
  Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle>',
  Settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle>',
  LogOut: '<path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>',
  Hash: '<line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line>',
  ChevronDown: '<path d="m6 9 6 6 6-6"></path>',
  ChevronRight: '<path d="m9 18 6-6-6-6"></path>',
  Inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
  Calendar: '<path d="M8 2v3"></path><path d="M16 2v3"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path>',
  Activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>',
  CreditCard: '<rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line>',
  Globe: '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>',
  Terminal: '<path d="M12 19h8"></path><path d="m4 17 6-6-6-6"></path>',
  Blocks: '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"></path><rect x="14" y="2" width="8" height="8" rx="1"></rect>',
  PanelLeftClose: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m16 15-3-3 3-3"></path>',
  PanelLeftOpen: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path>',
  Command: '<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>',
  X: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
  CircleDollarSign: '<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path>',
  Sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle>',
  ArrowUpRight: '<path d="M7 7h10v10"></path><path d="M7 17 17 7"></path>',
  ArrowDownRight: '<path d="m7 7 10 10"></path><path d="M17 7v10H7"></path>',
  Pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path>',
  Trash2: '<path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>',
  Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>',
  EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line>',
  ArrowLeft: '<path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>',
  LogIn: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line>',
  Loader2: '<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>',
  Save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>',
  UserPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line>',
  Box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>',
  FolderPlus: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><line x1="12" x2="12" y1="11" y2="17"></line><line x1="8" x2="16" y1="14" y2="14"></line>',
  Info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
  Phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>'
};

const icon = (name, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">${ICONS[name] || ''}</svg>`;

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);
const emailOk = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const isMobileMQ = () => (window.matchMedia ? window.matchMedia('(max-width: 767px)').matches : false);

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
const DAY = 86400000;
const now = new Date();
const TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const toDateOnly = iso => (iso ? String(iso).slice(0, 10) : null);
const daysUntil = isoStr => isoStr ? Math.round((parseISO(isoStr) - TODAY) / DAY) : null;
const fmtDate = isoStr => isoStr ? parseISO(isoStr).toLocaleDateString(state && state.lang === 'es' ? 'es' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const monthLong = (y, m) => new Date(y, m, 1).toLocaleDateString(state && state.lang === 'es' ? 'es' : 'en-US', { month: 'long', year: 'numeric' });

const defaultSettings = { alertDays: 7, panelName: 'My Services', emailNotif: true, webhookNotif: true, paymentMethods: ['PayPal', 'Bank transfer', 'Cash', 'Credit card'], lang: 'en' };
const SUBSCRIPTION_TIERS = ['free', 'basico', 'profesional', 'empresarial'];
const tierLabel = k => ({ free: 'Free', basico: 'Básico', profesional: 'Profesional', empresarial: 'Empresarial' }[k] || 'Free');
const tierBadge = k => `<span class="badge tier-${k || 'free'}">${tierLabel(k)}</span>`;
let state = { settings: Object.assign({}, defaultSettings), lang: 'en' };
let apps = [];
let clients = [];
let sales = [];
let profile = null;
let user = null;
let authed = false;
let bootStartedAt = 0;
let currentView = 'home';
let currentSaleId = null;
let calOffset = 0;
let currentForm = null;
let loginMode = 'signin';
let loginFactorId = null;
let authGuard = null;
let sessionHandling = null;
let bootFinished = false;

// ---------- i18n ----------
const t = (s, vars) => {
  let out = ((window.I18N && window.I18N[state.lang]) || {})[s] || s;
  if (vars) for (const k in vars) out = out.split('{' + k + '}').join(vars[k]);
  return out;
};

function applyLangUI() {
  const lang = state.lang;
  document.documentElement.lang = lang;
  document.title = t('My Services — Admin Panel');
  const lb = document.getElementById('langBtn');
  if (lb) lb.querySelector('.lang-label').innerHTML = lang === 'es'
    ? '<b>ES</b><small>Idioma que no entiende Bryan</small>'
    : '<b>EN</b><small>Idioma que sí entiende Bryan</small>';
  const sp = document.getElementById('searchPill');
  if (sp) sp.querySelector('span').textContent = t('Search clients, apps, projects...');
  const si = document.getElementById('searchInput');
  if (si) si.placeholder = t('Search clients, apps, projects...');
  const wb = document.getElementById('wsBtn');
  if (wb) wb.setAttribute('aria-label', t('Switch panel'));
  const doc = $('#loginView');
  if (doc) {
    doc.querySelector('.login-logo p').textContent = t('Admin panel');
    const nameL = $('#fieldFullName > span');
    if (nameL) nameL.textContent = t('Full name');
    const lbls = doc.querySelectorAll('#loginForm .field > span');
    if (lbls[0]) lbls[0].textContent = t('Email');
    if (lbls[1]) lbls[1].textContent = t('Password');
    const confL = $('#fieldConfirm > span');
    if (confL) confL.textContent = t('Confirm password');
    const ts = $('#tabSignin'); if (ts) ts.textContent = t('Sign in');
    const tu = $('#tabSignup'); if (tu) tu.textContent = t('Create account');
    doc.querySelector('#loginSubmit .btn-label').textContent = loginMode === 'signup' ? t('Create account') : t('Sign in');
    const ml = $('#mfaLabel'); if (ml) ml.textContent = t('Enter the {n}-digit code from your authenticator app', { n: 6 });
    const mf = $('#mfaSubmit'); if (mf) mf.textContent = t('Verify');
    const mb = $('#mfaBack'); if (mb) mb.textContent = t('Back');
    const rl = $('#recoveryLink'); if (rl) rl.textContent = t('Recover access with recovery key');
    doc.querySelector('.login-foot').textContent = t('Secured with Supabase Auth');
  }
  if (window.Chart && (currentView === 'home' || currentView === 'analytics')) drawCharts();
}

function setLang(lang) {
  if (!['en', 'es'].includes(lang)) lang = 'en';
  state.lang = lang;
  if (state.settings) state.settings.lang = lang;
  applyLangUI();
  renderAll();
  const sel = document.getElementById('setLang');
  if (sel) sel.value = lang;
  DB.saveSettings(state.settings);
}

const appById = id => apps.find(a => a.id === id) || { id: null, name: 'Unknown app', type: '', version: '' };
const clientById = id => clients.find(c => c.id === id) || { id: null, name: 'Unknown client', company: '', email: '', phone: '', joined: null };
const saleById = id => sales.find(s => s.id === id);
const effSale = idOrObj => typeof idOrObj === 'string' ? saleById(idOrObj) : idOrObj;
const salesEff = () => sales;

function syncData() {
  apps = DB.data.apps;
  clients = DB.data.clients;
  sales = DB.data.sales;
  state.settings = DB.data.settings;
  profile = DB.data.profile;
  state.lang = (state.settings && state.settings.lang) || 'en';
}

const paymentStatusLabel = s => (s.paymentStatus === 'paid' ? t('Paid') : t('Pending'));
const paymentStatusBadge = s => s.paymentStatus === 'paid'
  ? '<span class="badge badge-green">' + icon('CheckCircle2', 'bic') + ' ' + t('Paid') + '</span>'
  : '<span class="badge badge-amber">' + icon('Clock', 'bic') + ' ' + t('Pending') + '</span>';

function alertFor(s) {
  if (s.status === 'suspended') return { level: 'blocked', days: s.endDate ? daysUntil(s.endDate) : null };
  const days = s.endDate ? daysUntil(s.endDate) : null;
  if (s.paymentStatus === 'pending') {
    if (days !== null && days < 0) return { level: 'overdue', days };
    if (days !== null && days <= state.settings.alertDays) return { level: 'due', days };
  }
  return { level: 'ok', days };
}

function statusCounts() {
  const c = { active: 0, due: 0, overdue: 0, blocked: 0 };
  salesEff().forEach(s => c[alertFor(s).level]++);
  return c;
}

function alertList() {
  const list = [];
  const sev = { high: 0, med: 1, low: 2 };
  for (const s of salesEff()) {
    const cl = clientById(s.clientId);
    const ap = appById(s.appId);
    const a = alertFor(s);
    if (a.level === 'overdue') list.push({ severity: 'high', icon: 'XCircle', title: t('Payment overdue for {name}', { name: cl.name }), desc: t('{app} — overdue by {n} day(s). Mark it paid or block the service.', { app: ap.name, n: Math.abs(a.days) }), sid: s.id, actions: ['pay', 'block'] });
    else if (a.level === 'blocked') list.push({ severity: 'high', icon: 'ShieldOff', title: t('Service blocked for {name}', { name: cl.name }), desc: t('{app} — waiting for payment to reactivate.', { app: ap.name }), sid: s.id, actions: ['unblock'] });
    else if (a.level === 'due') list.push({ severity: 'med', icon: 'Clock', title: t('Payment due in {n} day{s}', { n: a.days, s: a.days === 1 ? '' : 's' }), desc: t('{app} · {name} — next due {date}.', { app: ap.name, name: cl.name, date: fmtDate(s.endDate) }), sid: s.id, actions: ['pay'] });
    if (s.page === 'offline' && s.status !== 'suspended') list.push({ severity: 'med', icon: 'WifiOff', title: t('Page offline: {app}', { app: ap.name }), desc: t('Client {name}.', { name: cl.name }), sid: s.id, actions: [] });
    if (s.page === 'review') list.push({ severity: 'low', icon: 'Clock', title: t('Page under review: {app}', { app: ap.name }), desc: t('Client {name}.', { name: cl.name }), sid: s.id, actions: [] });
    if (s.db === 'error') list.push({ severity: 'med', icon: 'AlertTriangle', title: t('Database error: {app}', { app: ap.name }), desc: t('Client {name}.', { name: cl.name }), sid: s.id, actions: [] });
  }
  return list.sort((x, y) => sev[x.severity] - sev[y.severity]);
}

function badgeFor(id) {
  if (id === 'alerts') { const n = alertList().length; return n ? n : null; }
  if (id === 'projects') { const n = salesEff().filter(s => s.status === 'suspended').length; return n ? n : null; }
  return null;
}

const navGroups = [
  { items: [
    { id: 'search', title: 'Search', icon: 'Search', shortcut: '\u2318K' },
    { id: 'home', title: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'analytics', title: 'Analytics', icon: 'BarChart3' },
    { id: 'projects', title: 'Projects', icon: 'FolderKanban' }
  ] },
  { heading: 'Management', items: [
    { id: 'clients', title: 'Clients', icon: 'Users' },
    { id: 'payments', title: 'Payments', icon: 'Wallet' },
    { id: 'calendar', title: 'Calendar', icon: 'CalendarDays' },
    { id: 'alerts', title: 'Alerts', icon: 'Bell' }
  ] },
  { heading: 'System', items: [
    { id: 'apikeys', title: 'API Keys', icon: 'Key' },
    { id: 'settings', title: 'Settings', icon: 'Settings' }
  ] }
];
const bottomItems = [{ id: 'logout', title: 'Sign out', icon: 'LogOut' }];
const viewTitles = { home: 'Dashboard', analytics: 'Analytics', projects: 'Projects', clients: 'Clients', payments: 'Payments', calendar: 'Calendar', alerts: 'Alerts', apikeys: 'API Keys', settings: 'Settings' };
let projFilter = { client: 'all', app: 'all', status: 'all' };

// Expuestos exprofeso: los módulos drop-in (p.ej. view-licenses.js)
// extienden la navegación y leen currentView desde aquí (getter vivo).
window.navGroups = navGroups;
window.viewTitles = viewTitles;
Object.defineProperty(window, 'currentView', { configurable: true, get: () => currentView });

function navItemHtml(item) {
  const badge = badgeFor(item.id);
  return `<div class="nav-item" data-id="${item.id}" data-title="${item.title}">
    <div class="nav-row" style="padding-left:10px">
      <div class="nav-label">${icon(item.icon)}<span>${t(item.title)}</span></div>
      <div class="nav-meta">
        ${item.shortcut ? `<kbd class="nav-kbd">${item.shortcut}</kbd>` : ''}
        ${badge ? `<span class="nav-badge">${badge}</span>` : ''}
      </div>
    </div>
  </div>`;
}

function renderNav() {
  $('#nav').innerHTML = navGroups.map(g => `
    <div class="nav-group">
      ${g.heading ? `<div class="nav-heading">${t(g.heading)}</div>` : ''}
      ${g.items.map(navItemHtml).join('')}
    </div>`).join('');
  $('#navBottom').innerHTML = bottomItems.map(navItemHtml).join('');
}

function setActiveNav(view) {
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.id === view));
}

function onNavClick(e) {
  const row = e.target.closest('.nav-row');
  if (!row) return;
  const item = row.closest('.nav-item');
  const id = item.dataset.id;
  if (item.classList.contains('has-children')) { item.classList.toggle('open'); return; }
  if (isMobileMQ()) $('#app').classList.remove('sidebar-collapsed');
  if (id === 'search') { openSearch(); return; }
  if (id === 'logout') { logout(); return; }
  navigate(id);
}

async function logout() {
  if (!DB.isConfigured) { toast(t('Demo mode — session kept'), 'warn'); return; }
  await DB.signOut();
  authed = false;
  user = null;
  toast(t('Signed out'), 'success');
  showLogin();
}

async function signOutEverywhere() {
  if (!DB.isConfigured) { toast(t('Demo mode — session kept'), 'warn'); return; }
  openConfirm({
    title: t('Sign out everywhere'),
    message: t('This revokes your session on every device. You will need to sign in again everywhere.'),
    confirmText: t('Sign out everywhere'),
    danger: true,
    onConfirm: async () => {
      const { error } = await DB.signOut('global');
      if (error) { toast(error.message || error, 'error'); return; }
      authed = false;
      user = null;
      toast(t('Signed out everywhere'), 'success');
      showLogin();
    }
  });
}

function navigate(view, saleId) {
  currentView = view;
  currentSaleId = saleId || null;
  setActiveNav(view);
  if (view === 'sale') {
    const s = currentSaleId ? saleById(currentSaleId) : null;
    $('#bcTitle').textContent = s ? s.contract : t('Project');
  } else {
    $('#bcTitle').textContent = t(viewTitles[view] || 'Dashboard');
  }
  renderView();
}

function statusBadge(s) {
  const a = alertFor(s);
  const map = {
    blocked: ['badge badge-red', 'ShieldOff', t('Blocked')],
    overdue: ['badge badge-red', 'XCircle', t('Payment overdue')],
    due: ['badge badge-amber', 'Clock', a.days === 0 ? t('Due today') : t('Due in {n}d', { n: a.days })],
    ok: ['badge badge-green', 'CheckCircle2', t('Active')]
  };
  const [cls, ic, label] = map[a.level];
  return `<span class="${cls}">${icon(ic, 'bic')} ${label}</span>`;
}

function chip(s, type) {
  const val = type === 'page' ? s.page : s.db;
  const good = (type === 'page' && val === 'online') || (type === 'db' && val === 'active');
  const warn = type === 'page' && val === 'review';
  const cls = good ? 'chip chip-green' : warn ? 'chip chip-amber' : 'chip chip-red';
  const ic = type === 'page' ? (val === 'online' ? 'Wifi' : val === 'review' ? 'Clock' : 'WifiOff') : (val === 'active' ? 'Database' : val === 'error' ? 'AlertTriangle' : 'Database');
  return `<span class="${cls}">${icon(ic, 'bic')} ${t(cap(val))}</span>`;
}

const switchEl = s => `<label class="switch ${s.status === 'active' ? '' : 'off'}" title="${s.status === 'active' ? t('Click to block this service (kill switch)') : t('Service blocked — click to reactivate')}">
  <input type="checkbox" data-action="block" data-sid="${s.id}" ${s.status === 'active' ? 'checked' : ''} /><span class="track"></span>
</label>`;

const planLabel = p => t({ monthly: 'Monthly', annual: 'Annual', onetime: 'One-time' }[p] || p);

function saleRow(s) {
  const cl = clientById(s.clientId);
  const days = s.endDate ? daysUntil(s.endDate) : null;
  const dueCell = s.plan === 'onetime' ? '<span class="muted">' + t('One-time') + '</span>' : `${fmtDate(s.endDate)}<br><span class="due-sub">${days < 0 ? t('overdue') : days === 0 ? t('today') : t('{n}d left', { n: days })}</span>`;
  return `
  <div class="sale-row">
    <div class="sale-client">
      <div class="mini-avatar">${esc(cl.name.charAt(0))}</div>
      <div><div class="sale-name">${esc(cl.name)}</div><div class="sale-sub">${esc(cl.company || '')}</div></div>
    </div>
    <div class="sale-contract">${tierBadge(s.subscriptionTier)} ${esc(s.contract)}<div class="sale-sub">${planLabel(s.plan)} · ${esc(s.paymentMethod || '—')} · ${paymentStatusLabel(s)}</div></div>
    <div class="sale-due">${dueCell}</div>
    <div class="sale-chips">${chip(s, 'page')} ${chip(s, 'db')}</div>
    <div class="sale-status">${statusBadge(s)}</div>
    <div class="sale-toggle">${switchEl(s)}</div>
    <div class="sale-actions">
      <button class="icon-btn" data-action="sale-view" data-sid="${s.id}" title="${t('View details')}">${icon('Eye')}</button>
      <button class="icon-btn" data-action="sale-edit" data-sid="${s.id}" title="${t('Edit')}">${icon('Pencil')}</button>
      <button class="icon-btn icon-btn-danger" data-action="sale-del" data-sid="${s.id}" title="${t('Delete')}">${icon('Trash2')}</button>
    </div>
  </div>`;
}

const pageHead = (title, sub, actions = '') => `
  <div class="page-head">
    <div><h1>${title}</h1><p>${sub}</p></div>
    <div class="page-actions">${actions}</div>
  </div>`;

const kpiCard = k => `<div class="kpi ${k.danger ? 'kpi-danger' : k.warn ? 'kpi-warn' : ''}">
  <div class="kpi-top"><span class="kpi-ico">${icon(k.icon)}</span>${k.trend ? `<span class="kpi-trend">${icon(k.trend === 'up' ? 'ArrowUpRight' : 'ArrowDownRight')}</span>` : ''}</div>
  <div class="kpi-value">${k.value}</div>
  <div class="kpi-label">${k.label}</div>
  <div class="kpi-sub">${k.sub}</div>
</div>`;

function renderDashboard() {
  const counts = statusCounts();
  const pending = salesEff().filter(s => s.paymentStatus === 'pending').length;
  const kpis = [
    { label: t('Active services'), value: counts.active, sub: t('Working normally'), icon: 'ShieldCheck' },
    { label: t('Pending payments'), value: pending, sub: t('Awaiting payment'), icon: 'Wallet', warn: pending > 0 },
    { label: t('Due soon'), value: counts.due, sub: t('Within {n} days', { n: state.settings.alertDays }), icon: 'Clock', warn: true },
    { label: t('Overdue'), value: counts.overdue, sub: t('Past due date'), icon: 'XCircle', danger: counts.overdue > 0 },
    { label: t('Blocked'), value: counts.blocked, sub: t('Kill switch off'), icon: 'ShieldOff', danger: true }
  ];
  return `
    ${pageHead(t('Dashboard'), t('Overview of your services and payment status.'))}
    <div class="kpi-grid">${kpis.map(kpiCard).join('')}</div>
    <div class="grid-2">
      <div class="card chart-card"><div class="card-head"><h3>${t('Service status')}</h3></div><div class="chart-wrap"><canvas id="statusChart"></canvas></div></div>
      <div class="card chart-card"><div class="card-head"><h3>${t('Services by app')}</h3></div><div class="chart-wrap"><canvas id="appChart"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-head"><h3>${t('Needs attention')}</h3><button class="btn btn-ghost btn-sm" data-action="nav" data-view="alerts">${t('View all')} ${icon('ArrowRight', 'bic')}</button></div>
      ${alertsTable(4)}
    </div>`;
}

function alertsTable(limit) {
  const list = alertList();
  const rows = list.slice(0, limit);
  if (!rows.length) return `<div class="empty">${icon('CheckCircle2')} ${t('All clear — no alerts right now.')}</div>`;
  return `<div class="alert-list">${rows.map(al => `
    <div class="alert-row sev-${al.severity}">
      <span class="alert-ico">${icon(al.icon)}</span>
      <div class="alert-body"><div class="alert-title">${esc(al.title)}</div><div class="alert-desc">${esc(al.desc)}</div></div>
      <div class="alert-actions">${al.actions.map(a => a === 'pay' ? `<button class="btn btn-primary btn-sm" data-action="pay" data-sid="${al.sid}">${t('Mark paid')}</button>` : a === 'block' ? `<button class="btn btn-ghost btn-sm" data-action="block-btn" data-sid="${al.sid}">${t('Block')}</button>` : `<button class="btn btn-ghost btn-sm" data-action="block-btn" data-sid="${al.sid}">${t('Reactivate')}</button>`).join('')}</div>
    </div>`).join('')}</div>`;
}

function drawCharts() {
  if (!window.Chart) return;
  const cs = getComputedStyle(document.documentElement);
  const fg = cs.getPropertyValue('--fg').trim() || '#18181b';
  const primary = cs.getPropertyValue('--primary').trim() || '#18181b';
  const withAlpha = (hex, a) => { const h = hex.replace('#', ''); const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return `rgba(${r},${g},${b},${a})`; };
  const grid = 'rgba(128,128,130,0.12)';
  const mk = (id, cfg) => { const el = document.getElementById(id); if (!el) return; if (window._charts && window._charts[id]) window._charts[id].destroy(); (window._charts = window._charts || {})[id] = new Chart(el, cfg); };

  const sc = document.getElementById('statusChart');
  if (sc) {
    const c = statusCounts();
    mk('statusChart', {
      type: 'doughnut',
      data: { labels: [t('Active'), t('Due soon'), t('Overdue'), t('Blocked')], datasets: [{ data: [c.active, c.due, c.overdue, c.blocked], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { color: fg, boxWidth: 12, boxHeight: 12, padding: 12 } } } }
    });
  }
  const ac = document.getElementById('appChart');
  if (ac) {
    const byApp = apps.map(a => { const inst = salesEff().filter(s => s.appId === a.id); return inst.filter(s => s.paymentStatus === 'paid').length; });
    mk('appChart', {
      type: 'bar',
      data: { labels: apps.map(a => a.name), datasets: [{ label: t('services'), data: byApp, backgroundColor: withAlpha(primary, 0.75), borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: fg }, grid: { color: grid } }, y: { beginAtZero: true, ticks: { color: fg, precision: 0 }, grid: { color: grid } } } }
    });
  }
}

function renderAnalytics() {
  const byClient = clients.map(c => {
    const inst = salesEff().filter(s => s.clientId === c.id);
    const paid = inst.filter(s => s.paymentStatus === 'paid').length;
    return { c, count: inst.length, paid };
  }).sort((a, b) => b.count - a.count);
  return `
    ${pageHead(t('Analytics'), t('Breakdown of your services by app and client.'))}
    <div class="grid-2">
      <div class="card chart-card"><div class="card-head"><h3>${t('Services by app')}</h3></div><div class="chart-wrap"><canvas id="appChart"></canvas></div></div>
      <div class="card chart-card"><div class="card-head"><h3>${t('Payment status by app')}</h3></div><div class="chart-wrap"><canvas id="statusChart"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-head"><h3>${t('Clients overview')}</h3></div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${t('Client')}</th><th>${t('Services')}</th><th>${t('Apps')}</th><th>${t('Paid')}</th></tr></thead>
        <tbody>${byClient.map(r => `
          <tr>
            <td><div class="cell-client"><div class="mini-avatar">${esc(r.c.name.charAt(0))}</div><div><div class="cell-name">${esc(r.c.name)}</div><div class="sale-sub">${esc(r.c.company || '')}</div></div></div></td>
            <td>${r.count}</td>
            <td>${r.count ? salesEff().filter(s => s.clientId === r.c.id).map(s => appById(s.appId).name).filter((v, i, a) => a.indexOf(v) === i).join(', ') : '—'}</td>
            <td>${r.count ? r.paid + ' / ' + r.count : '—'}</td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

function projFilterBar() {
  const f = projFilter;
  const sel = (pf, allLabel, opts) => `<select data-pf="${pf}"><option value="all">${allLabel}</option>${opts}</select>`;
  return `<div class="filter-bar">
    ${sel('client', t('All clients'), clients.map(c => `<option value="${c.id}" ${f.client === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join(''))}
    ${sel('app', t('All apps'), apps.map(a => `<option value="${a.id}" ${f.app === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join(''))}
    ${sel('status', t('All states'), `
      <option value="active" ${f.status === 'active' ? 'selected' : ''}>${t('Active')}</option>
      <option value="blocked" ${f.status === 'blocked' ? 'selected' : ''}>${t('Blocked')}</option>
      <option value="expired" ${f.status === 'expired' ? 'selected' : ''}>${t('Expired/overdue')}</option>
    `)}
  </div>`;
}

function projMatches(s) {
  const f = projFilter;
  if (f.client !== 'all' && s.clientId !== f.client) return false;
  if (f.app !== 'all' && s.appId !== f.app) return false;
  if (f.status === 'all') return true;
  if (f.status === 'active') return s.status === 'active';
  if (f.status === 'blocked') return s.status === 'suspended';
  if (f.status === 'expired') return s.paymentStatus === 'pending' && !!s.endDate && daysUntil(s.endDate) < 0;
  return true;
}

function renderProjects() {
  const isAdmin = profile && profile.role === 'admin';
  const appActions = isAdmin ? `<button class="btn btn-ghost btn-sm" data-action="app-new">${icon('Plus', 'bic')} ${t('New app')}</button>` : '';
  const filtering = projFilter.client !== 'all' || projFilter.app !== 'all' || projFilter.status !== 'all';
  const cards = apps.map(a => {
    const inst = salesEff().filter(s => s.appId === a.id && projMatches(s));
    const pending = inst.filter(s => s.paymentStatus === 'pending').length;
    const blocked = inst.filter(s => s.status === 'suspended').length;
    if (filtering && !inst.length) return '';
    return `
    <div class="card app-card">
      <div class="app-card-head">
        <div class="app-ico">${icon('Box')}</div>
        <div class="app-info"><h3>${esc(a.name)}</h3><p>${esc(a.type)} · ${esc(a.version || '—')}</p></div>
        <div class="app-stats"><span>${inst.length} ${inst.length === 1 ? t('instance') : t('instances')}</span><span>${pending} ${pending === 1 ? t('pending') : t('pendings')}</span>${blocked ? `<span class="badge badge-red">${blocked} ${t('blocked')}</span>` : ''}</div>
        ${isAdmin ? `<div class="app-actions">
          <button class="icon-btn" data-action="app-edit" data-id="${a.id}" title="${t('Edit app')}">${icon('Pencil')}</button>
          <button class="icon-btn icon-btn-danger" data-action="app-del" data-id="${a.id}" title="${t('Delete app')}">${icon('Trash2')}</button>
        </div>` : ''}
      </div>
      <div class="sale-list">${inst.length ? inst.map(saleRow).join('') : `<div class="empty">${t('No projects sold yet. Use "New project".')}</div>`}</div>
    </div>`;
  }).join('');
  return `${pageHead(t('Projects'), t('Manage the app catalog and every service you sell.'), `<button class="btn btn-primary btn-sm" data-action="sale-new">${icon('Plus', 'bic')} ${t('New project')}</button> ${appActions}`)}
    ${projFilterBar()}
    <div class="app-stack">${cards.length ? cards : `<div class="card"><div class="empty">${t('No apps in the catalog yet.')}${isAdmin ? ' ' + t('Create the first one.') : ' ' + t('Ask an admin to add them.')}</div></div>`}</div>`;
}

function renderSaleDetail(sid) {
  const s = saleById(sid);
  if (!s) return `${pageHead(t('Project'), t('Details'))}<div class="card"><div class="empty">${t('This project no longer exists.')}</div></div>`;
  const cl = clientById(s.clientId);
  const ap = appById(s.appId);
  const days = s.endDate ? daysUntil(s.endDate) : null;
  const dueStr = s.plan === 'onetime' ? t('One-time') : `${fmtDate(s.endDate)}<div class="due-sub">${days < 0 ? t('overdue') : days === 0 ? t('today') : t('{n}d left', { n: days })}</div>`;
  const pending = s.paymentStatus === 'pending';
  const pays = (DB.data.payments || []).filter(p => p.saleId === s.id).sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));
  const totalMonths = pays.reduce((n, p) => n + (p.months || 0), 0);
  const linked = (DB.data.stores || []).find(st => st.saleId === s.id);
  return `
    <button class="btn btn-ghost btn-sm detail-back" data-action="back">${icon('ArrowLeft', 'bic')} ${t('Back to projects')}</button>
    <div class="detail-hero">
      <div class="app-ico lg">${icon('Box')}</div>
      <div class="detail-hero-info">
        <div class="detail-tag">${esc(ap.name)} · ${esc(ap.version || '—')}</div>
        <h1>${esc(s.contract)}</h1>
        <p class="sale-sub">${planLabel(s.plan)} · ${esc(s.paymentMethod || '—')} · ${t('started {d}', { d: fmtDate(s.startDate) })}</p>
      </div>
      <div class="detail-hero-actions">
        ${statusBadge(s)}
        <button class="btn btn-ghost btn-sm" data-action="sale-edit" data-sid="${s.id}">${icon('Pencil', 'bic')} ${t('Edit')}</button>
        <button class="btn btn-danger btn-sm" data-action="sale-del" data-sid="${s.id}">${icon('Trash2', 'bic')} ${t('Delete')}</button>
      </div>
    </div>
    <div class="grid-2">
      <div class="card detail-card">
        <div class="card-head"><h3>${t('Client')}</h3><button class="btn btn-ghost btn-sm" data-action="client-edit" data-id="${cl.id || ''}" ${cl.id ? '' : 'hidden'}>${icon('Pencil', 'bic')} ${t('Edit')}</button></div>
        <div class="detail-client">
          <div class="mini-avatar lg">${esc(cl.name.charAt(0))}</div>
          <div><div class="detail-name">${esc(cl.name)}</div><div class="sale-sub">${esc(cl.company || '')}</div></div>
        </div>
        <div class="detail-rows">
          <div>${icon('Mail', 'bic')} ${esc(cl.email || '—')}</div>
          <div>${icon('Phone', 'bic')} ${esc(cl.phone || '—')}</div>
          <div>${icon('CalendarDays', 'bic')} ${t('Client since {d}', { d: fmtDate(cl.joined) })}</div>
          <div>${icon('Package', 'bic')} ${t('{n} service(s)', { n: salesEff().filter(x => x.clientId === cl.id).length })}</div>
        </div>
      </div>
      <div class="card detail-card">
        <div class="card-head"><h3>${t('Contract')}</h3>
          ${linked
            ? `<span class="pill-muted">${icon('Box', 'bic')} ${esc(linked.name)}</span><button class="btn btn-ghost btn-sm" data-action="store-edit-modal" data-id="${linked.id}">${icon('Pencil', 'bic')} ${t('Edit linked store')}</button>`
            : (window.openStoreModal ? `<button class="btn btn-ghost btn-sm" data-action="link-store" data-sid="${s.id}">${icon('Box', 'bic')} ${t('Link store')}</button>` : '')}
          ${pending && s.plan !== 'onetime' ? `<button class="btn btn-primary btn-sm" data-action="pay" data-sid="${s.id}">${icon('CheckCircle2', 'bic')} ${t('Mark paid')}</button>` : ''}
        </div>
        <div class="detail-grid">
          <div><span class="detail-label">${t('Plan')}</span><span>${planLabel(s.plan)}</span></div>
          <div><span class="detail-label">${t('Subscription')}</span><span>${tierBadge(s.subscriptionTier)}</span></div>
          <div><span class="detail-label">${t('Payment')}</span><span>${paymentStatusBadge(s)}</span></div>
          <div><span class="detail-label">${t('Method')}</span><span>${esc(s.paymentMethod || '—')}</span></div>
          <div><span class="detail-label">${t('Start date')}</span><span>${fmtDate(s.startDate)}</span></div>
          <div><span class="detail-label">${t('Next due')}</span><span>${dueStr}</span></div>
        </div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card detail-card">
        <div class="card-head"><h3>${t('Status')}</h3></div>
        <div class="detail-rows">
          <div><span class="detail-label">${t('Store')}</span>${linked ? `<button class="btn btn-ghost btn-sm" data-action="store-edit-modal" data-id="${linked.id}">${esc(linked.name)}</button>` : `<span class="muted">—</span>`}</div>
          <div><span class="detail-label">${t('Web page')}</span>${chip(s, 'page')}</div>
          <div><span class="detail-label">${t('Database')}</span>${chip(s, 'db')}</div>
        </div>
        <div class="detail-block">
          <div>
            <div class="detail-name">${t('Kill switch')}</div>
            <p class="sale-sub">${s.status === 'suspended' ? t('Blocked — page offline, DB paused, key revoked.') : t('Service active — page online, DB running.')}</p>
          </div>
          ${switchEl(s)}
        </div>
      </div>
      <div class="card detail-card">
        <div class="card-head"><h3>${t('License key')}</h3>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-action="copy" data-sid="${s.id}">${icon('Copy', 'bic')} ${t('Copy')}</button>
            <button class="btn btn-ghost btn-sm" data-action="regen" data-sid="${s.id}">${icon('RefreshCw', 'bic')} ${t('Regenerate')}</button>
          </div>
        </div>
        <code class="keycode detail-key ${s.status === 'suspended' ? 'revoked' : ''}">${esc(s.apiKey || '—')}</code>
        <p class="sale-sub">${t('Client apps use this key to verify the license. It is revoked automatically when the service is blocked.')}</p>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>${t('Payments')}</h3>
        <div class="row-actions">
          <span class="pill-muted">${totalMonths} ${totalMonths === 1 ? t('month') : t('months')}</span>
          <button class="btn btn-primary btn-sm" data-action="add-payment" data-sid="${s.id}">${icon('Plus', 'bic')} ${t('Add payment')}</button>
        </div>
      </div>
      <div class="detail-rows">
        <div><span class="detail-label">${t('Payment status')}</span>${paymentStatusBadge(s)}</div>
        <div><span class="detail-label">${t('Payment method')}</span><span>${esc(s.paymentMethod || '—')}</span></div>
        <div><span class="detail-label">${t('Paid until')}</span><span>${fmtDate(toDateOnly(s.paidUntil))}</span></div>
      </div>
      ${pays.length ? `<div class="table-wrap"><table class="table">
        <thead><tr><th>${t('Date')}</th><th>${t('Months paid')}</th><th>${t('Method')}</th><th>${t('Note')}</th></tr></thead>
        <tbody>${pays.map(p => `<tr>
          <td>${fmtDate(toDateOnly(p.paidAt))}</td>
          <td>${p.months} ${p.months === 1 ? t('month') : t('months')}</td>
          <td>${esc(p.method)}</td>
          <td class="muted">${esc(p.note || '—')}</td>
        </tr>`).join('')}</tbody>
      </table></div>` : `<p class="sale-sub">${t('No payments recorded yet.')}</p>`}
      <p class="sale-sub">${t('Add a payment to move the next due date forward by the paid months.')}</p>
    </div>`;
}

function renderClients() {
  const cards = clients.map(c => {
    const inst = salesEff().filter(s => s.clientId === c.id);
    const pending = inst.filter(s => s.paymentStatus === 'pending').length;
    const status = inst.length ? statusBadge(inst[0]) : '';
    return `
    <div class="card client-card">
      <div class="client-head">
        <div class="mini-avatar lg">${esc(c.name.charAt(0))}</div>
        <div class="client-id"><h3>${esc(c.name)}</h3><p>${esc(c.company || '')}</p></div>
      </div>
      <div class="client-meta">
        <div>${icon('Mail', 'bic')} ${esc(c.email || '—')}</div>
        <div>${icon('Wallet', 'bic')} ${pending} ${pending === 1 ? t('pending payment') : t('pending payments')}</div>
        <div>${icon('Package', 'bic')} ${inst.length} ${inst.length === 1 ? t('service') : t('services')}</div>
        <div>${icon('CalendarDays', 'bic')} ${t('Client since {d}', { d: fmtDate(c.joined) })}</div>
      </div>
      <div class="client-sales">${inst.map(s => `
        <div class="cs-row">
          <div class="cs-info"><span class="cs-name">${esc(appById(s.appId).name)}</span><span class="sale-sub">${esc(s.contract)}</span></div>
          ${statusBadge(s)}
          <label class="switch ${s.status === 'active' ? '' : 'off'}" title="${t('Kill switch')}"><input type="checkbox" data-action="block" data-sid="${s.id}" ${s.status === 'active' ? 'checked' : ''} /><span class="track"></span></label>
        </div>`).join('') || `<div class="empty">${t('No services.')}</div>`}</div>
      <div class="client-actions">
        <button class="btn btn-ghost btn-sm" data-action="client-subs" data-id="${c.id}">${icon('Box', 'bic')} ${t('Subscriptions')}</button>
        <button class="btn btn-ghost btn-sm" data-action="client-edit" data-id="${c.id}">${icon('Pencil', 'bic')} ${t('Edit client')}</button>
      </div>
    </div>`;
  }).join('');
  return `${pageHead(t('Clients'), t('Each client with their contracted services and payment status.'), `<button class="btn btn-primary btn-sm" data-action="client-new">${icon('User', 'bic')} ${t('New client')}</button>`)}
    <div class="client-grid">${cards.length ? cards : `<div class="card"><div class="empty">${t('No clients yet.')}</div></div>`}</div>`;
}

function renderPayments() {
  const rows = salesEff().slice().sort((a, b) => (a.endDate || '').localeCompare(b.endDate || ''));
  const pending = rows.filter(s => s.paymentStatus === 'pending').length;
  return `
    ${pageHead(t('Payments'), t('Payment status and next due date for every project.'), `<span class="pill-muted">${icon('Wallet', 'bic')} ${pending} ${t('pending')}</span>`)}
    <div class="card">
      <div class="card-head"><h3>${t('Payments')}</h3></div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${t('Service')}</th><th>${t('Client')}</th><th>${t('Method')}</th><th>${t('Status')}</th><th>${t('Next due')}</th><th></th></tr></thead>
        <tbody>${rows.length ? rows.map(s => { const cl = clientById(s.clientId); const days = s.endDate ? daysUntil(s.endDate) : null; return `
          <tr>
            <td><div class="cell-name">${esc(appById(s.appId).name)}</div><div class="sale-sub">${esc(s.contract)}</div></td>
            <td>${esc(cl.name)}</td>
            <td>${esc(s.paymentMethod || '—')}</td>
            <td>${paymentStatusBadge(s)}</td>
            <td>${s.plan === 'onetime' ? `<span class="muted">${t('One-time')}</span>` : s.endDate ? fmtDate(s.endDate) + `<div class="sale-sub">${days === null ? '' : days < 0 ? `<span class="txt-red">${t('overdue')}</span>` : days === 0 ? t('today') : t('{n}d left', { n: days })}</div>` : '—'}</td>
            <td class="row-actions">${s.paymentStatus === 'pending' ? `<button class="btn btn-primary btn-sm" data-action="pay" data-sid="${s.id}">${t('Mark paid')}</button>` : `<span class="muted">${t('Paid')}</span>`}</td>
          </tr>`; }).join('') : '<tr><td colspan="6"><div class="empty">' + t('No projects yet.') + '</div></td></tr>'}</tbody>
      </table></div>
    </div>`;
}
function renderCalendar() {
  return `
    ${pageHead(t('Calendar'), t('Payment due dates on your schedule.'))}
    <div class="card cal-card">
      <div class="cal-head">
        <button class="btn btn-ghost btn-sm" data-action="cal-prev">${icon('ChevronRight', 'bic flip')}</button>
        <h3 id="calTitle"></h3>
        <button class="btn btn-ghost btn-sm" data-action="cal-next">${icon('ChevronRight', 'bic')}</button>
      </div>
      <div class="cal-grid" id="calGrid"></div>
      <div class="cal-legend">
        <span><i class="dot d-green"></i> ${t('Active')}</span>
        <span><i class="dot d-amber"></i> ${t('Due soon')}</span>
        <span><i class="dot d-red"></i> ${t('Overdue / blocked')}</span>
      </div>
    </div>`;
}

function drawCalendar() {
  const ref = new Date(TODAY.getFullYear(), TODAY.getMonth() + calOffset, 1);
  const y = ref.getFullYear(), m = ref.getMonth();
  const monthName = monthLong(y, m);
  $('#calTitle').textContent = monthName;
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const events = {};
  for (const s of salesEff()) {
    if (!s.endDate) continue;
    const d = parseISO(s.endDate);
    if (d.getFullYear() === y && d.getMonth() === m) {
      const lvl = alertFor(s).level;
      (events[d.getDate()] = events[d.getDate()] || []).push({ s, lvl });
    }
  }
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push('<div class="cal-cell blank"></div>');
  for (let day = 1; day <= daysInMonth; day++) {
    const evs = events[day] || [];
    const isToday = y === TODAY.getFullYear() && m === TODAY.getMonth() && day === TODAY.getDate();
    const dots = evs.map(e => { const c = e.lvl === 'blocked' || e.lvl === 'overdue' ? 'd-red' : e.lvl === 'due' ? 'd-amber' : 'd-green'; return `<i class="dot ${c}" title="${esc(e.s.contract)} · ${esc(e.s.paymentMethod || '—')}"></i>`; }).join('');
    cells.push(`<div class="cal-cell ${isToday ? 'today' : ''}">${evs.length ? `<div class="cal-cell-h">${day}<div class="cal-dots">${dots}</div></div><div class="cal-ev">${evs.map(e => `<div class="cal-ev-row">${esc(e.s.contract.split('—')[0].trim())}</div>`).join('')}</div>` : `<div class="cal-day">${day}</div>`}</div>`);
  }
  $('#calGrid').innerHTML = cells.join('');
}

function renderAlerts() {
  const list = alertList();
  return `
    ${pageHead(t('Alerts'), t('Payment reminders, overdue services and technical issues.'), `<span class="pill-muted">${icon('Bell', 'bic')} ${list.length} ${t('active')}</span>`)}
    <div class="alert-list">${list.length ? list.map(al => `
      <div class="alert-row sev-${al.severity}">
        <span class="alert-ico">${icon(al.icon)}</span>
        <div class="alert-body"><div class="alert-title">${esc(al.title)}</div><div class="alert-desc">${esc(al.desc)}</div></div>
<div class="alert-actions">${al.actions.map(a => a === 'pay' ? `<button class="btn btn-primary btn-sm" data-action="pay" data-sid="${al.sid}">${t('Mark paid')}</button>` : a === 'block' ? `<button class="btn btn-ghost btn-sm" data-action="block-btn" data-sid="${al.sid}">${t('Block')}</button>` : `<button class="btn btn-ghost btn-sm" data-action="block-btn" data-sid="${al.sid}">${t('Reactivate')}</button>`).join('')}</div>
      </div>`).join('') : `<div class="empty">${icon('CheckCircle2')} ${t('All clear — no alerts right now.')}</div>`}</div>`;
}

function renderApiKeys() {
  const rows = salesEff().map(s => {
    const cl = clientById(s.clientId);
    const blocked = s.status === 'suspended';
    return `
    <tr>
      <td><div class="cell-client"><div class="mini-avatar">${esc(cl.name.charAt(0))}</div><div><div class="cell-name">${esc(cl.name)}</div><div class="sale-sub">${esc(cl.company || '')}</div></div></div></td>
      <td>${esc(appById(s.appId).name)}</td>
      <td><code class="keycode ${blocked ? 'revoked' : ''}">${esc(s.apiKey || '—')}</code></td>
      <td><span class="badge ${blocked ? 'badge-red' : 'badge-green'}">${blocked ? t('Revoked') : t('Active')}</span></td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-sm" data-action="copy" data-sid="${s.id}">${icon('Copy', 'bic')} ${t('Copy')}</button>
        <button class="btn btn-ghost btn-sm" data-action="regen" data-sid="${s.id}">${icon('RefreshCw', 'bic')} ${t('Regenerate')}</button>
      </td>
    </tr>`;
  }).join('');
  return `
    ${pageHead(t('API Keys'), t('License keys that client apps use to verify their service is active. Revoked when you block a service.'))}
    <div class="card">
      <div class="card-head"><h3>${t('License keys')}</h3><p class="sale-sub">${t('Client apps ping your license endpoint with this key — when revoked, the app stops working.')}</p></div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>${t('Client')}</th><th>${t('Service')}</th><th>${t('Key')}</th><th>${t('Status')}</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
}

function renderSettings() {
  const togg = (id, label, val) => `
    <label class="switch-row"><span>${label}</span>
      <span class="switch"><input type="checkbox" id="${id}" ${val ? 'checked' : ''} /><span class="track"></span></span>
    </label>`;
  const isAdmin = profile && profile.role === 'admin';
  const methods = (state.settings.paymentMethods || []).slice();
  return `
    ${pageHead(t('Settings'), t('Panel configuration, payment options, account and data.'))}
    <div class="settings-stack">
      <div class="card settings-card">
        <h3>${t('General')}</h3>
        <label class="field"><span>${t('Panel name')}</span><input id="setName" type="text" value="${esc(state.settings.panelName)}" /></label>
        <label class="field"><span>${t('Payment reminder (days before due)')}</span><input id="setDays" type="number" min="1" max="60" value="${state.settings.alertDays}" /></label>
        <label class="field"><span>${t('Language')}</span>
          <select id="setLang">
            <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
            <option value="es" ${state.lang === 'es' ? 'selected' : ''}>Español</option>
          </select>
        </label>
      </div>
      <div class="card settings-card">
        <h3>${t('Payment options')}</h3>
        <p class="sale-sub">${t('Payment methods you can assign to a project. Add your own options as you go.')}</p>
        <div class="pay-options" id="payOptions">
          ${methods.map((m, i) => `
            <div class="pay-option">
              <span class="pay-ico">${icon('CreditCard', 'bic')}</span>
              <span class="pay-name">${esc(m)}</span>
              <button class="icon-btn icon-btn-danger" data-action="pm-del" data-index="${i}" type="button" title="${t('Remove option')}">${icon('Trash2')}</button>
            </div>`).join('') || `<div class="empty">${t('No payment options yet. Add one below.')}</div>`}
        </div>
        <div class="pay-add">
          <input id="pmNew" type="text" placeholder="e.g. Nequi, Zelle, Crypto…" />
          <button class="btn btn-ghost" data-action="pm-add" type="button">${icon('Plus', 'bic')} ${t('Add')}</button>
        </div>
      </div>
      <div class="card settings-card">
        <h3>${t('Notifications')}</h3>
        ${togg('setEmail', t('Email reminders'), state.settings.emailNotif)}
        ${togg('setWeb', t('Webhook alerts'), state.settings.webhookNotif)}
      </div>
      <div class="card settings-card">
        <h3>${t('Account')}</h3>
        <p class="sale-sub">${t('Signed in as')} <strong>${esc(profile ? profile.email || '' : '')}</strong> · <span class="badge ${isAdmin ? 'badge-green' : 'badge-amber'}">${isAdmin ? t('Admin') : t('Staff')}</span></p>
        <div class="mfa-row">
          <button class="btn btn-ghost" data-action="change-password">${icon('Lock', 'bic')} ${t('Change password')}</button>
          <button class="btn btn-ghost" data-action="signout-global">${icon('ShieldOff', 'bic')} ${t('Sign out everywhere')}</button>
        </div>
        <p class="sale-sub">${t('Signing out everywhere revokes your session on every device. Changing your password also revokes the other sessions.')}</p>
        ${isAdmin ? `<p class="sale-sub">${t('To change roles, use Supabase (Auth > Users):')} <code class="keycode">update profiles set role='admin' where id='&lt;user-id&gt;';</code></p>` : `<p class="sale-sub">${t('Admins manage the app catalog and user roles. Ask an admin if you need access.')}</p>`}
      </div>
      <div class="card settings-card">
        <h3>${t('Security')}</h3>
        <div class="detail-rows">
          <div><span class="detail-label">${t('HTTPS / HSTS')}</span><span class="muted">${t('GitHub Pages cannot send header. Enable HSTS via your CDN/domain (Cloudflare) — see supabase/SECURITY.md.')}</span></div>
          <div><span class="detail-label">${t('CSRF')}</span><span class="badge badge-green">${t('PKCE + bearer tokens, no cookies: classic CSRF does not apply.')}</span></div>
          <div><span class="detail-label">${t('Session rotation')}</span><span class="muted">${t('Auto refresh with token rotation. Global sign-out revokes all sessions.')}</span></div>
          <div><span class="detail-label">${t('Link expiry')}</span><span class="muted">${t('Password/link tokens expire (set TTL in Supabase Auth, default 1h).')}</span></div>
        </div>
      </div>
      <div class="card settings-card">
        <h3>${t('Recovery key')}</h3>
        <div id="recoveryCard"></div>
      </div>
      <div class="card settings-card">
        <h3>${t('Two-factor authentication')}</h3>
        <div id="mfaCard"></div>
      </div>
      <div class="card settings-card danger-card">
        <h3>${t('Danger zone')}</h3>
        <p>${t('Delete all your clients and projects from this account. This cannot be undone.')}</p>
        <button class="btn btn-danger" data-action="reset-data">${t('Reset my data')}</button>
      </div>
      <div class="settings-save"><button class="btn btn-primary" data-action="save-settings">${t('Save settings')}</button></div>
    </div>`;
}

function renderView() {
  const view = $('#view');
  if (currentView === 'home') view.innerHTML = renderDashboard();
  else if (currentView === 'analytics') view.innerHTML = renderAnalytics();
  else if (currentView === 'projects') view.innerHTML = renderProjects();
  else if (currentView === 'sale') view.innerHTML = renderSaleDetail(currentSaleId);
  else if (currentView === 'clients') view.innerHTML = renderClients();
  else if (currentView === 'payments') view.innerHTML = renderPayments();
  else if (currentView === 'calendar') view.innerHTML = renderCalendar();
  else if (currentView === 'alerts') view.innerHTML = renderAlerts();
  else if (currentView === 'apikeys') view.innerHTML = renderApiKeys();
  else if (currentView === 'settings') view.innerHTML = renderSettings();
  view.scrollTop = 0;
  if (currentView === 'calendar') drawCalendar();
  else if (currentView === 'home' || currentView === 'analytics') ensureCharts().then(drawCharts).catch(() => {});
  else if (currentView === 'settings') { refreshMfaCard(); refreshRecoveryCard(); }
}

// chart.js se carga bajo demanda (solo Dashboard/Analytics) para que el
// arranque no baje el CDN de ~190KB en cada apertura del panel.
function ensureCharts() {
  if (window.Chart) return Promise.resolve(window.Chart);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    s.onload = () => resolve(window.Chart);
    s.onerror = () => reject(new Error('chart.js'));
    document.head.appendChild(s);
  });
}

function renderAll() {
  renderNav();
  setActiveNav(currentView);
  renderView();
}

async function reloadAndRender() {
  const err = await DB.loadAll();
  syncData();
  if (err) { toast(err.error, 'error'); return; }
  renderAll();
}

function onViewClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const { action } = t.dataset;
  if (action === 'nav') navigate(t.dataset.view);
  else if (action === 'back') navigate('projects');
  else if (action === 'pay') markPaid(t.dataset.sid);
  else if (action === 'block-btn') { const s = saleById(t.dataset.sid); if (s && s.status === 'suspended') setBlock(s.id, false); else confirmBlock(s.id); }
  else if (action === 'copy') copyKey(t.dataset.sid);
  else if (action === 'regen') regenKey(t.dataset.sid);
  else if (action === 'cal-prev') { calOffset--; drawCalendar(); }
  else if (action === 'cal-next') { calOffset++; drawCalendar(); }
  else if (action === 'save-settings') saveSettings();
  else if (action === 'reset-data') confirmReset();
  else if (action === 'pm-add') addPaymentOption();
  else if (action === 'pm-del') removePaymentOption(Number(t.dataset.index));
  else if (action === 'change-password') openChangePassword();
  else if (action === 'signout-global') signOutEverywhere();
  else if (action === 'recovery-set') openRecoverySetup();
  else if (action === 'mfa-setup') openMfaSetup();
  else if (action === 'mfa-disable') confirmMfaDisable();
  else if (action === 'sale-new') openForm('sale');
  else if (action === 'sale-view') navigate('sale', t.dataset.sid);
  else if (action === 'sale-edit') openForm('sale', saleById(t.dataset.sid));
  else if (action === 'sale-del') confirmDeleteSale(t.dataset.sid);
  else if (action === 'app-new') openForm('app');
  else if (action === 'app-edit') openForm('app', appById(t.dataset.id));
  else if (action === 'app-del') confirmDeleteApp(t.dataset.id);
  else if (action === 'client-edit') openForm('client', clientById(t.dataset.id));
  else if (action === 'client-new') openForm('client');
  else if (action === 'client-subs') { if (window.openClientSubs) window.openClientSubs(t.dataset.id); }
  else if (action === 'link-store') { if (window.linkStoreToSale) window.linkStoreToSale(t.dataset.sid); }
  else if (action === 'store-edit-modal') { if (window.openStoreModal) window.openStoreModal(t.dataset.id); }
  else if (action === 'add-payment') { const sid = t.dataset.sid; if (window.openPayment) window.openPayment(sid); else markPaid(sid); }
}

function onViewChange(e) {
  const tEl = e.target;
  if (tEl.id === 'setLang') { setLang(tEl.value); return; }
  if (tEl.dataset && tEl.dataset.pf) { projFilter[tEl.dataset.pf] = tEl.value; renderView(); return; }
  if (tEl.dataset && tEl.dataset.action === 'block') {
    const sid = tEl.dataset.sid;
    if (!tEl.checked) confirmBlock(sid, tEl); else setBlock(sid, false);
  }
}

function confirmBlock(sid, cbEl) {
  const s = effSale(sid);
  const cl = clientById(s.clientId);
  openConfirm({
    title: t('Block service'),
    message: t('{client} \'{app}\' ({contract}) will stop working. The page goes offline, the database is paused and the license key is revoked until you reactivate it.', { client: esc(cl.name), app: esc(appById(s.appId).name), contract: esc(s.contract) }),
    confirmText: t('Block service'),
    danger: true,
    onConfirm: () => setBlock(sid, true),
    onCancel: () => { if (cbEl) cbEl.checked = true; }
  });
}

async function setBlock(sid, blocked) {
  const { error } = await DB.setBlock(sid, blocked);
  if (error) { toast(error.message, 'error'); return; }
  const cl = clientById(effSale(sid).clientId);
  toast(blocked ? t('Service blocked for {name}', { name: cl.name }) : t('Service reactivated for {name}', { name: cl.name }), blocked ? 'warn' : 'success');
  await reloadAndRender();
}

async function markPaid(sid) {
  const s = effSale(sid);
  if (!s) return;
  const { error } = await DB.markPaid(sid, s.paymentMethod);
  if (error) { toast(error.message, 'error'); return; }
  const nextDue = s.endDate;
  toast(nextDue ? t('Marked paid — next due {date}', { date: fmtDate(nextDue) }) : t('Marked paid'), 'success');
  await reloadAndRender();
}

function copyKey(sid) {
  const s = saleById(sid);
  const key = s ? (s.apiKey || '') : '';
  (navigator.clipboard ? navigator.clipboard.writeText(key) : Promise.reject()).then(() => toast(t('Key copied to clipboard'), 'success')).catch(() => { const ta = document.createElement('textarea'); ta.value = key; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(t('Key copied'), 'success'); });
}

async function regenKey(sid) {
  const s = saleById(sid);
  if (!s) return;
  const chars = 'abcdef0123456789';
  let rnd = '';
  for (let i = 0; i < 8; i++) rnd += chars[Math.floor(Math.random() * chars.length)];
  const key = `${(s.apiKey || 'sv').split('-')[0]}-${rnd}`;
  const { error } = await DB.regenKey(sid, key);
  if (error) { toast(error.message, 'error'); return; }
  toast(t('License key regenerated'), 'success');
  await reloadAndRender();
}

async function saveSettings() {
  state.settings.panelName = $('#setName').value.trim() || 'My Services';
  state.settings.alertDays = Math.max(1, Math.min(60, parseInt($('#setDays').value, 10) || 7));
  state.settings.emailNotif = $('#setEmail').checked;
  state.settings.webhookNotif = $('#setWeb').checked;
  const sel = $('#setLang');
  if (sel) state.settings.lang = sel.value;
  const { error } = await DB.saveSettings(state.settings);
  if (error) { toast(error.message, 'error'); return; }
  applySettingsToChrome();
  toast(t('Settings saved'), 'success');
  renderAll();
}

function addPaymentOption() {
  const input = $('#pmNew');
  const val = (input.value || '').trim();
  if (!val) { input.focus(); return; }
  const list = (state.settings.paymentMethods || []).slice();
  if (list.some(m => m.toLowerCase() === val.toLowerCase())) { toast(t('That option already exists'), 'warn'); return; }
  list.push(val);
  state.settings.paymentMethods = list;
  renderView();
  const box = $('#payOptions');
  if (box) { box.scrollTop = box.scrollHeight; toast(t('Payment option added — remember to save'), 'success'); }
}

function removePaymentOption(index) {
  const list = (state.settings.paymentMethods || []).slice();
  if (index < 0 || index >= list.length) return;
  list.splice(index, 1);
  state.settings.paymentMethods = list;
  renderView();
  toast(t('Payment option removed — remember to save'), 'success');
}

function confirmReset() {
  openConfirm({
    title: t('Reset my data'),
    message: t('This deletes all your clients and projects. This cannot be undone.'),
    confirmText: t('Reset'),
    danger: true,
    onConfirm: async () => {
      const { error } = await DB.resetOwnData();
      if (error) toast(error.message, 'error');
      else { toast(t('Data reset'), 'success'); await reloadAndRender(); }
    }
  });
}

function confirmDeleteSale(sid) {
  const s = saleById(sid);
  if (!s) return;
  const cl = clientById(s.clientId);
  openConfirm({
    title: t('Delete project'),
    message: t('Delete "{contract}" for {name}? This cannot be undone.', { contract: esc(s.contract), name: esc(cl.name) }),
    confirmText: t('Delete'),
    danger: true,
    onConfirm: async () => {
      const { error } = await DB.deleteSale(sid);
      if (error) toast(error.message, 'error');
      else { toast(t('Project deleted'), 'success'); navigate('projects'); await reloadAndRender(); }
    }
  });
}

function confirmDeleteApp(id) {
  const a = appById(id);
  if (!a.id) return;
  const used = salesEff().filter(s => s.appId === id).length;
  openConfirm({
    title: t('Delete app'),
    message: used ? t('Delete "{name}"? {used} project(s) reference it and will lose the app link.', { name: esc(a.name), used }) : t('No projects reference it.'),
    confirmText: t('Delete'),
    danger: true,
    onConfirm: async () => {
      const { error } = await DB.deleteApp(id);
      if (error) toast(error.message, 'error');
      else { toast(t('App deleted'), 'success'); await reloadAndRender(); }
    }
  });
}
function openForm(type, data) {
  const isEdit = !!data;
  let html;
  if (type === 'app') html = appFormHtml(data, isEdit);
  else if (type === 'client') html = clientFormHtml(data, isEdit);
  else html = saleFormHtml(data, isEdit);
  currentForm = { type, data: data || null };
  $('#formRoot').innerHTML = html;
  $('#formRoot').hidden = false;
  $('#formBackdrop').hidden = false;
  document.body.classList.add('form-open');
  const first = $('#formRoot').querySelector('input:not([type="hidden"]), select');
  if (first) first.focus();
}

function closeForm() {
  $('#formRoot').hidden = true;
  $('#formRoot').innerHTML = '';
  $('#formBackdrop').hidden = true;
  document.body.classList.remove('form-open');
  currentForm = null;
}

function appFormHtml(data, isEdit) {
  const a = data || {};
  const types = ['Web app', 'SaaS', 'Desktop app', 'Web widget', 'Mobile app'];
  return `
    <div class="form-head"><h3>${isEdit ? t('Edit app') : t('New app')}</h3><button class="form-x" data-form="close" type="button" aria-label="${t('Close')}">${icon('X')}</button></div>
    <div class="form-body">
      <label class="field"><span>${t('Name')}</span><input id="f-name" type="text" value="${esc(a.name || '')}" required placeholder="${t('e.g. Inventory Manager')}" /><span class="field-error" id="f-name-err"></span></label>
      <div class="form-row">
        <label class="field"><span>${t('Type')}</span><select id="f-type">${types.map(ty => `<option ${ty === a.type ? 'selected' : ''}>${t(ty)}</option>`).join('')}</select></label>
        <label class="field"><span>${t('Version')}</span><input id="f-version" type="text" value="${esc(a.version || '')}" placeholder="e.g. v3.2" /></label>
      </div>
      <div class="form-error" id="f-error" role="alert" hidden></div>
    </div>
    <div class="form-foot">
      <button class="btn btn-ghost" data-form="close" type="button">${t('Cancel')}</button>
      <button class="btn btn-primary" id="f-submit" type="button">${isEdit ? t('Save changes') : t('Create app')}</button>
    </div>`;
}

function clientFormHtml(data, isEdit) {
  const c = data || {};
  return `
    <div class="form-head"><h3>${isEdit ? t('Edit client') : t('New client')}</h3><button class="form-x" data-form="close" type="button" aria-label="${t('Close')}">${icon('X')}</button></div>
    <div class="form-body">
      <label class="field"><span>${t('Name')}</span><input id="f-name" type="text" value="${esc(c.name || '')}" required placeholder="${t('Full name')}" /><span class="field-error" id="f-name-err"></span></label>
      <div class="form-row">
        <label class="field"><span>${t('Company')}</span><input id="f-company" type="text" value="${esc(c.company || '')}" /></label>
        <label class="field"><span>${t('Email')}</span><input id="f-email" type="email" value="${esc(c.email || '')}" /><span class="field-error" id="f-email-err"></span></label>
      </div>
      <div class="form-row">
        <label class="field"><span>${t('Phone')}</span><input id="f-phone" type="text" value="${esc(c.phone || '')}" /></label>
        <label class="field"><span>${t('Client since')}</span><input id="f-joined" type="date" value="${c.joined || ''}" /></label>
      </div>
      <div class="form-error" id="f-error" role="alert" hidden></div>
    </div>
    <div class="form-foot">
      <button class="btn btn-ghost" data-form="close" type="button">${t('Cancel')}</button>
      <button class="btn btn-primary" id="f-submit" type="button">${isEdit ? t('Save changes') : t('Create client')}</button>
    </div>`;
}

function saleFormHtml(data, isEdit) {
  const s = data || {};
  const appOpts = apps.map(a => `<option value="${a.id}" ${a.id === s.appId ? 'selected' : ''}>${esc(a.name)}</option>`).join('');
  const clientOpts = clients.map(c => `<option value="${c.id}" ${c.id === s.clientId ? 'selected' : ''}>${esc(c.name)}${c.company ? ' · ' + esc(c.company) : ''}</option>`).join('');
  const methods = (state.settings.paymentMethods || []).slice();
  const methodOpts = methods.map(m => `<option value="${esc(m)}" ${m === s.paymentMethod ? 'selected' : ''}>${esc(m)}</option>`).join('');
  return `
    <div class="form-head"><h3>${isEdit ? t('Edit project') : t('New project')}</h3><button class="form-x" data-form="close" type="button" aria-label="${t('Close')}">${icon('X')}</button></div>
    <div class="form-body">
      <label class="field"><span>${t('Application')}</span>
        <select id="f-app" required>${appOpts ? appOpts : `<option value="">${t('No apps yet — create one first')}</option>`}</select>
        <span class="field-error" id="f-app-err"></span>
      </label>
      <label class="field"><span>${t('Client')}</span>
        <select id="f-client">${clientOpts || `<option value="">${t('No clients yet')}</option>`}</select>
        <span class="field-error" id="f-client-err"></span>
      </label>
      <label class="switch-row"><span>${t('New client?')}</span><span class="switch"><input type="checkbox" id="f-newclient" /><span class="track"></span></span></label>
      <div id="f-newclient-fields" hidden>
        <label class="field"><span>${t('Client name')}</span><input id="f-cname" type="text" placeholder="${t('Full name')}" /><span class="field-error" id="f-cname-err"></span></label>
        <div class="form-row">
          <label class="field"><span>${t('Company')}</span><input id="f-ccompany" type="text" /></label>
          <label class="field"><span>${t('Email')}</span><input id="f-cemail" type="email" /><span class="field-error" id="f-cemail-err"></span></label>
        </div>
      </div>
      <label class="field"><span>${t('Contract')}</span><input id="f-contract" type="text" value="${esc(s.contract || '')}" required placeholder="${t('e.g. Retail Store — Enterprise')}" /><span class="field-error" id="f-contract-err"></span></label>
      <div class="form-row">
        <label class="field"><span>${t('Plan')}</span><select id="f-plan">${['monthly', 'annual', 'onetime'].map(p => `<option value="${p}" ${p === s.plan ? 'selected' : ''}>${t(cap(p))}</option>`).join('')}</select></label>
        <label class="field"><span>${t('Payment method')}</span><select id="f-pmethod">${methodOpts || '<option value="">—</option>'}</select></label>
      </div>
      <div class="form-row">
        <label class="field"><span>${t('Subscription')}</span><select id="f-sus">${SUBSCRIPTION_TIERS.map(x => `<option value="${x}" ${x === (s.subscriptionTier || 'free') ? 'selected' : ''}>${tierLabel(x)}</option>`).join('')}</select></label>
        <label class="field"><span>${t('Payment status')}</span><select id="f-pstatus">${['pending', 'paid'].map(v => `<option value="${v}" ${v === s.paymentStatus ? 'selected' : ''}>${t(cap(v))}</option>`).join('')}</select></label>
      </div>
      <div class="form-row">
        <label class="field"><span>${t('Start date')}</span><input id="f-start" type="date" value="${s.startDate || ''}" /></label>
        <label class="field"><span>${t('Next due')}</span><input id="f-end" type="date" value="${s.endDate || ''}" /><span class="field-error" id="f-end-err"></span></label>
      </div>
      <div class="form-row">
        <label class="field"><span>${t('Page')}</span><select id="f-page">${['online', 'offline', 'review'].map(v => `<option value="${v}" ${v === s.page ? 'selected' : ''}>${t(cap(v))}</option>`).join('')}</select></label>
        <label class="field"><span>${t('Database')}</span><select id="f-db">${['active', 'inactive', 'error'].map(v => `<option value="${v}" ${v === s.db ? 'selected' : ''}>${t(cap(v))}</option>`).join('')}</select></label>
      </div>
      <div class="form-error" id="f-error" role="alert" hidden></div>
    </div>
    <div class="form-foot">
      <button class="btn btn-ghost" data-form="close" type="button">${t('Cancel')}</button>
      <button class="btn btn-primary" id="f-submit" type="button">${isEdit ? t('Save changes') : t('Create project')}</button>
    </div>`;
}

function clearFieldErrors() {
  $$('#formRoot .field-error').forEach(el => el.textContent = '');
}

function showFormErrors(errBox) {
  showErr(errBox, t('Check the highlighted fields.'));
}

async function submitForm() {
  if (!currentForm) return;
  const type = currentForm.type;
  const isEdit = !!currentForm.data;
  const btn = document.getElementById('f-submit');
  const errBox = document.getElementById('f-error');
  hideErr(errBox);
  clearFieldErrors();
  const errors = {};
  const setErr = (id, msg) => { errors[id] = msg; const el = document.getElementById(id); if (el) el.textContent = msg; };

  let payload = null;
  if (type === 'app') {
    const name = ($('#f-name').value || '').trim();
    if (!name) setErr('f-name-err', t('Name is required.'));
    if (Object.keys(errors).length) return showFormErrors(errBox);
    payload = { name, type: $('#f-type').value, version: ($('#f-version').value || '').trim() };
  } else if (type === 'client') {
    const name = ($('#f-name').value || '').trim();
    const email = ($('#f-email').value || '').trim();
    if (!name) setErr('f-name-err', t('Name is required.'));
    if (email && !emailOk(email)) setErr('f-email-err', t('Enter a valid email.'));
    if (Object.keys(errors).length) return showFormErrors(errBox);
    payload = { name, company: ($('#f-company').value || '').trim(), email, phone: ($('#f-phone').value || '').trim(), joined: $('#f-joined').value || null };
  } else {
    const appId = $('#f-app').value;
    const contract = ($('#f-contract').value || '').trim();
    const plan = $('#f-plan').value;
    const startDate = $('#f-start').value || null;
    const endDate = $('#f-end').value || null;
    const paymentMethod = $('#f-pmethod').value || '—';
    const paymentStatus = $('#f-pstatus').value || 'pending';
    const newClient = $('#f-newclient').checked;
    const cname = ($('#f-cname').value || '').trim();
    const cemail = ($('#f-cemail').value || '').trim();
    let clientId = newClient ? null : $('#f-client').value;
    if (!appId) setErr('f-app-err', t('Select an application.'));
    if (!contract) setErr('f-contract-err', t('Contract name is required.'));
    if (plan !== 'onetime' && !endDate) setErr('f-end-err', t('Next due date is required.'));
    if (newClient) { if (!cname) setErr('f-cname-err', t('Client name is required.')); if (cemail && !emailOk(cemail)) setErr('f-cemail-err', t('Enter a valid email.')); }
    else if (!clientId) setErr('f-client-err', t('Select a client or check "New client?".'));
    if (Object.keys(errors).length) return showFormErrors(errBox);
    payload = { appId, contract, plan, subscriptionTier: ($('#f-sus').value || 'free'), paymentMethod, paymentStatus, startDate, endDate, page: $('#f-page').value, db: $('#f-db').value };
    if (newClient) payload._newClient = { name: cname, company: ($('#f-ccompany').value || '').trim(), email: cemail, phone: '' };
    else payload.clientId = clientId;
  }

  setBtnLoading(btn, true);
  try {
    if (type === 'sale') {
      if (payload._newClient) {
        const { data: cdata, error: cerr } = await DB.createClient(payload._newClient);
        if (cerr) throw new Error(cerr.message);
        payload.clientId = cdata.id;
      }
      delete payload._newClient;
      const { error } = isEdit ? await DB.updateSale(currentForm.data.id, payload) : await DB.createSale(payload);
      if (error) throw new Error(error.message);
    } else if (type === 'app') {
      const { error } = isEdit ? await DB.updateApp(currentForm.data.id, payload) : await DB.createApp(payload);
      if (error) throw new Error(error.message);
    } else {
      const { error } = isEdit ? await DB.updateClient(currentForm.data.id, payload) : await DB.createClient(payload);
      if (error) throw new Error(error.message);
    }
    closeForm();
    toast(type === 'sale' ? (isEdit ? t('Project updated') : t('Project created')) : type === 'app' ? t('App saved') : t('Client saved'), 'success');
    await reloadAndRender();
  } catch (e) {
    showErr(errBox, e.message);
    setBtnLoading(btn, false);
  }
}

function onFormClick(e) {
  const c = e.target.closest('[data-form]');
  if (c) { if (c.dataset.form === 'close') closeForm(); return; }
  if (e.target.closest('#f-submit')) { submitForm(); return; }
}

function onFormChange(e) {
  const id = e.target.id;
  if (id === 'f-newclient') {
    const on = e.target.checked;
    $('#f-newclient-fields').hidden = !on;
    const cs = $('#f-client');
    if (cs) cs.disabled = on;
  }
  if (id === 'f-plan' || id === 'f-start') {
    const plan = $('#f-plan'), start = $('#f-start'), end = $('#f-end');
    if (plan && start && end && !end.value && plan.value !== 'onetime' && start.value) {
      const d = parseISO(start.value);
      if (plan.value === 'annual') d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
      end.value = iso(d);
    }
  }
}

function onFormBlur(e) {
  const el = e.target;
  const errEl = document.getElementById(el.id + '-err');
  if (!errEl || !errEl.classList.contains('field-error')) return;
  const v = (el.value || '').trim();
  let msg = '';
  if (el.required && !v) msg = t('Required');
  else if (el.type === 'email' && v && !emailOk(v)) msg = t('Enter a valid email.');
  errEl.textContent = msg;
}

function setBtnLoading(btn, on) {
  if (!btn) return;
  if (on) {
    if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
    btn.classList.add('is-loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('is-loading');
    btn.disabled = false;
    if (btn.dataset.label) { btn.innerHTML = btn.dataset.label; delete btn.dataset.label; }
  }
}

// ---------- search ----------
function openSearch() {
  $('#searchOverlay').classList.add('open');
  $('#searchResults').innerHTML = searchEmpty();
  const input = $('#searchInput');
  input.value = '';
  input.focus();
}
function closeSearch() { $('#searchOverlay').classList.remove('open'); }
const searchEmpty = () => `<div class="search-empty">${icon('Command')}<p>${t('Type a command or search clients, apps, projects...')}</p></div>`;

function renderSearchResults(q) {
  const box = $('#searchResults');
  if (!q.trim()) { box.innerHTML = searchEmpty(); return; }
  const ql = q.toLowerCase();
  const results = [];
  clients.forEach(c => { if ((c.name + ' ' + c.company + ' ' + c.email).toLowerCase().includes(ql)) results.push({ icon: 'User', title: c.name, sub: `${c.company} · ${c.email}`, view: 'clients' }); });
  apps.forEach(a => { if ((a.name + ' ' + a.type).toLowerCase().includes(ql)) results.push({ icon: 'Package', title: a.name, sub: `${a.type} · ${a.version}`, view: 'projects' }); });
  salesEff().forEach(s => { const cl = clientById(s.clientId); const ap = appById(s.appId); if ((s.contract + ' ' + cl.name + ' ' + cl.company).toLowerCase().includes(ql)) results.push({ icon: 'Wallet', title: s.contract, sub: `${ap.name} · ${cl.name}`, view: 'sale', saleId: s.id }); });
  if (!results.length) { box.innerHTML = `<div class="search-empty">${icon('Search')}<p>${t('No results for "{q}".', { q: esc(q) })}</p></div>`; return; }
  box.innerHTML = results.slice(0, 10).map(r => `
    <div class="search-result" data-view="${r.view}" ${r.saleId ? `data-sale="${r.saleId}"` : ''}>
      <span class="sri">${icon(r.icon)}</span>
      <div><div class="cell-name">${esc(r.title)}</div><div class="sale-sub">${esc(r.sub)}</div></div>
    </div>`).join('');
}

// ---------- modal ----------
function openModal(html) {
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal-backdrop"><div class="modal-card modal-card-lg">${html}</div></div>`;
  root.style.display = 'flex';
  root.querySelector('.modal-backdrop').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
}
function openConfirm({ title, message, confirmText = t('Confirm'), danger = false, onConfirm, onCancel }) {
  const root = $('#modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-icon ${danger ? 'danger' : ''}">${icon(danger ? 'ShieldOff' : 'ShieldCheck')}</div>
        <h3 class="modal-title">${title}</h3>
        <p class="modal-message">${message}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-modal="cancel">${t('Cancel')}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-modal="ok">${confirmText}</button>
        </div>
      </div>
    </div>`;
  root.style.display = 'flex';
  root.querySelector('[data-modal="cancel"]').addEventListener('click', () => { closeModal(); if (onCancel) onCancel(); });
  root.querySelector('[data-modal="ok"]').addEventListener('click', () => { closeModal(); if (onConfirm) onConfirm(); });
  root.querySelector('.modal-backdrop').addEventListener('click', e => { if (e.target === e.currentTarget) { closeModal(); if (onCancel) onCancel(); } });
}
function closeModal() { const root = $('#modalRoot'); root.style.display = 'none'; root.innerHTML = ''; }

function toast(msg, type = 'success') {
  const root = $('#toastRoot');
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  const ic = type === 'success' ? 'CheckCircle2' : type === 'warn' ? 'AlertTriangle' : 'XCircle';
  el.innerHTML = icon(ic) + `<span>${msg}</span>`;
  root.appendChild(el);
  setTimeout(() => { el.classList.add('toast-out'); setTimeout(() => el.remove(), 300); }, 3500);
}

const showErr = (el, msg) => { if (!el) return; el.textContent = msg; el.hidden = false; };
const hideErr = el => { if (!el) return; el.textContent = ''; el.hidden = true; };

// ---------- auth / boot ----------
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]).catch(() => null);
function showLogin() {
  hideMfaStep();
  setLoginMode('signin');
  hideBoot();
  $('#loginView').hidden = false;
  const p = document.querySelector('.preview');
  if (p) p.style.display = 'none';
}
function showApp() {
  $('#loginView').hidden = true;
  const p = document.querySelector('.preview');
  if (p) { p.hidden = false; p.style.display = 'block'; }
}
function showBoot(msg) {
  const o = $('#bootOverlay');
  o.hidden = false;
  $('#bootMsg').textContent = msg || t('Connecting…');
}
function hideBoot() { $('#bootOverlay').hidden = true; }
function bootErrorButtons(extra) {
  const diagOk = !!(window.DIAG && typeof window.DIAG.run === 'function');
  return `<div class="boot-actions">
    ${extra || ''}
    <button class="btn btn-ghost btn-sm" id="bootDiag" type="button"${diagOk ? '' : ' style="display:none"'} >${t('Diagnose')}</button>
  </div>`;
}

function wireBootButtons(extraFn) {
  const diag = document.getElementById('bootDiag');
  if (diag) diag.addEventListener('click', () => { if (window.DIAG && window.DIAG.run) window.DIAG.run(); });
  if (extraFn) {
    const extra = document.getElementById('bootRetry');
    if (extra) extra.addEventListener('click', extraFn);
  }
}

function showBootError(msg) {
  $('#bootMsg').innerHTML = `${esc(msg)} ${bootErrorButtons(`<button class="btn btn-primary btn-sm" id="bootRetry" type="button">${t('Retry')}</button>`)}`;
  wireBootButtons(() => { showBoot(t('Loading your data…')); afterAuth(); });
}

function bootFatal(msg) {
  if (!$('#bootOverlay').hidden || !authed) {
    const o = $('#bootOverlay');
    o.hidden = false;
    $('#bootMsg').innerHTML = `${esc(msg)} ${bootErrorButtons(`<button class="btn btn-primary btn-sm" id="bootRetry" type="button">${t('Retry')}</button>`)}`;
    wireBootButtons(() => window.location.reload());
  }
}

function setLoginMode(mode) {
  loginMode = mode === 'signup' ? 'signup' : 'signin';
  const si = $('#tabSignin');
  const su = $('#tabSignup');
  if (si) si.classList.toggle('active', loginMode === 'signin');
  if (su) su.classList.toggle('active', loginMode === 'signup');
  $('#fieldFullName').hidden = loginMode !== 'signup';
  $('#fieldConfirm').hidden = loginMode !== 'signup';
  $('#pwMeter').hidden = loginMode !== 'signup';
  const lbl = $('#loginSubmit .btn-label');
  if (lbl) lbl.textContent = loginMode === 'signup' ? t('Create account') : t('Sign in');
  hideErr($('#loginError'));
  $('#loginPassword').value = '';
  if (loginMode === 'signup') $('#pwLabel').textContent = '';
}

// Live password strength (0-4). Mirrors the dashboard policy:
// >=10 chars, upper+lower, a digit and a symbol.
function pwStrength(p) {
  let s = 0;
  if (p.length >= 10) s++;
  if (p.length >= 12) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.max(1, Math.min(s, 4));
}
function updatePwMeter() {
  const meter = $('#pwMeter');
  if (!meter || loginMode !== 'signup') { if (meter) meter.hidden = true; return; }
  const v = $('#loginPassword').value;
  meter.hidden = false;
  const s = pwStrength(v);
  const labels = [t('Weak'), t('Fair'), t('Good'), t('Strong')];
  const bar = $('#pwBar');
  bar.className = 'pw-bar pw-' + Math.min(s - 1, 3);
  bar.style.width = (s === 1 ? 20 : s * 25) + '%';
  $('#pwLabel').textContent = v ? labels[s - 1] : '';
}

// ---------- login MFA step ----------
function showMfaStep() {
  $('#loginForm').hidden = true;
  $('#loginTabs').hidden = true;
  $('#mfaStep').hidden = false;
  $('#mfaCode').value = '';
  hideErr($('#mfaError'));
  setTimeout(() => { const c = $('#mfaCode'); if (c) c.focus(); }, 60);
}
function hideMfaStep() {
  $('#mfaStep').hidden = true;
  $('#loginTabs').hidden = false;
  $('#loginForm').hidden = false;
}
async function showMfaIfNeeded() {
  const st = await DB.mfaStatus();
  if (!st.error && st.data && st.data.enabled && st.data.factorId) {
    loginFactorId = st.data.factorId;
    showMfaStep();
    return true;
  }
  return false;
}
async function onMfaSubmit() {
  const code = $('#mfaCode').value.trim();
  const errEl = $('#mfaError');
  hideErr(errEl);
  if (!/^\d{6}$/.test(code)) { showErr(errEl, t('Enter a code from your authenticator app.')); return; }
  setBtnLoading($('#mfaSubmit'), true);
  const { error } = await DB.mfaLogin(loginFactorId, code);
  setBtnLoading($('#mfaSubmit'), false);
  if (error) {
    $('#mfaCode').value = '';
    if (/invalid.*token|token.*invalid|code.*invalid|mfa.*invalid/i.test(error.message || '')) showErr(errEl, t('Invalid code. Try again.'));
    else showErr(errEl, error.message || t('Something went wrong. Try again.'));
    return;
  }
  hideMfaStep();
  await startAuth();
}

// ---------- master recovery key ----------
// Login screen: regain access with the personal recovery key.
function openRecovery() {
  if (!DB.isConfigured) {
    toast(t('Recovery key is only available with a real Supabase account.'), 'warn');
    return;
  }
  openModal(`
    <h3 class="modal-title">${t('Recover access')}</h3>
    <p class="sale-sub">${t('Enter the email of the account and your personal recovery key, then choose a new password.')}</p>
    <label class="field"><span>${t('Email')}</span><input id="recEmail" type="email" autocomplete="email" /></label>
    <label class="field"><span>${t('Recovery key')}</span><input id="recKey" type="password" autocomplete="off" /></label>
    <label class="field"><span>${t('New password')}</span><input id="recPass" type="password" autocomplete="new-password" /></label>
    <label class="field"><span>${t('Confirm password')}</span><input id="recPass2" type="password" autocomplete="new-password" /></label>
    <div class="login-error" id="recError" role="alert" hidden></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="recCancel" type="button">${t('Cancel')}</button>
      <button class="btn btn-primary" id="recOk" type="button">${t('Recover access')}</button>
    </div>`);
  $('#recCancel').addEventListener('click', closeModal);
  $('#recOk').addEventListener('click', async () => {
    const email = $('#recEmail').value.trim();
    const key = $('#recKey').value;
    const p1 = $('#recPass').value;
    const p2 = $('#recPass2').value;
    const err = $('#recError');
    hideErr(err);
    if (!email || !key || !p1) { showErr(err, t('Enter your email, recovery key and new password.')); return; }
    if (!emailOk(email)) { showErr(err, t('Enter a valid email address.')); return; }
    if (pwStrength(p1) < 3) { showErr(err, t('Password must be at least {n} characters with upper, lower, number and symbol.', { n: 10 })); return; }
    if (p1 !== p2) { showErr(err, t('Passwords do not match.')); return; }
    setBtnLoading($('#recOk'), true);
    const { error } = await DB.recoverAccount(email, key, p1);
    setBtnLoading($('#recOk'), false);
    if (error) {
      const m = error.message || '';
      if (/no_recovery_key|no recovery/i.test(m)) showErr(err, t('This account has no recovery key set. Ask the provider to reset it.'));
      else if (/invalid_key|invalid key/i.test(m)) showErr(err, t('Invalid recovery key.'));
      else if (/locked_out|too many|many attempt/i.test(m)) showErr(err, t('Too many failed attempts. Try again in 15 minutes.'));
      else if (/weak_password/i.test(m)) showErr(err, t('Password must be at least {n} characters with upper, lower, number and symbol.', { n: 10 }));
      else showErr(err, m);
      return;
    }
    closeModal();
    toast(t('Password reset — sign in with your new password.'), 'success');
  });
}

// Settings > Account: set / change the master recovery key.
function openRecoverySetup() {
  if (!DB.isConfigured) {
    toast(t('Recovery key is only available with a real Supabase account.'), 'warn');
    return;
  }
  openModal(`
    <h3 class="modal-title">${t('Set up recovery key')}</h3>
    <p class="sale-sub">${t('Your personal recovery key lets you regain access if you lose your password or authenticator. Store it somewhere safe — it cannot be recovered.')}</p>
    <label class="field"><span>${t('New recovery key')}</span><input id="recSetKey" type="password" autocomplete="off" /></label>
    <label class="field"><span>${t('Confirm recovery key')}</span><input id="recSetKey2" type="password" autocomplete="off" /></label>
    <div class="login-error" id="recSetError" role="alert" hidden></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="recSetCancel" type="button">${t('Cancel')}</button>
      <button class="btn btn-primary" id="recSetOk" type="button">${t('Save recovery key')}</button>
    </div>`);
  $('#recSetCancel').addEventListener('click', closeModal);
  $('#recSetOk').addEventListener('click', async () => {
    const key = $('#recSetKey').value;
    const k2 = $('#recSetKey2').value;
    const err = $('#recSetError');
    hideErr(err);
    if (!key || key !== k2) { showErr(err, t('Recovery keys do not match.')); return; }
    if (key.length < 12) { showErr(err, t('Recovery key must be at least 12 characters.')); return; }
    setBtnLoading($('#recSetOk'), true);
    const { error } = await DB.setRecoveryKey(key);
    setBtnLoading($('#recSetOk'), false);
    if (error) { showErr(err, error.message || t('Something went wrong. Try again.')); return; }
    closeModal();
    toast(t('Recovery key saved.'), 'success');
    refreshRecoveryCard();
  });
}

function recoveryCardHTML(set) {
  if (!DB.isConfigured) {
    return `<p class="sale-sub">${t('Recovery key is only available with a real Supabase account.')}</p>`;
  }
  if (set) {
    return `<div class="mfa-row">
      <div class="mfa-info">
        <span class="badge badge-green">${icon('Key', 'bic')} ${t('Recovery key set')}</span>
        <p class="sale-sub">${t('Keep it secret — anyone with it can reset the password.')}</p>
      </div>
      <button class="btn btn-ghost" data-action="recovery-set">${t('Change recovery key')}</button>
    </div>`;
  }
  return `<p class="sale-sub">${t('Set a personal recovery key to regain access if you lose your password or authenticator.')}</p>
    <button class="btn btn-ghost" data-action="recovery-set">${icon('Key', 'bic')} ${t('Set up recovery key')}</button>`;
}

async function refreshRecoveryCard() {
  const card = $('#recoveryCard');
  if (!card) return;
  card.innerHTML = '';
  const { data } = await DB.hasRecoveryKey();
  card.innerHTML = recoveryCardHTML(!!data);
}

// Route a fresh (possibly AAL1) session: if the user has MFA enabled we
// ask for the authenticator code before entering the app.
// Deduplicated: signing in fires both the direct call from onLoginSubmit
// and the SIGNED_IN auth listener, so only one flow may run at a time.
async function handleNewSession() {
  if (sessionHandling) return sessionHandling;
  const run = (async () => {
    if (!DB.isConfigured) { await afterAuth(); return; }
    const st = await withTimeout(DB.mfaStatus(), 6000);
    if (st && !st.error && st.data && st.data.enabled && st.data.factorId && st.data.level !== 'aal2') {
      loginFactorId = st.data.factorId;
      showMfaStep();
      return;
    }
    await afterAuth();
  })().finally(() => { sessionHandling = null; });
  sessionHandling = run;
  return run;
}
function startAuth() {
  if (authGuard) return authGuard;
  authGuard = afterAuth().finally(() => { authGuard = null; });
  return authGuard;
}

async function onLoginSubmit(e) {
  e.preventDefault();
  const email = $('#loginEmail').value.trim();
  const pass = $('#loginPassword').value;
  const errEl = $('#loginError');
  hideErr(errEl);
  if (!email || !pass) { showErr(errEl, t('Enter your email and password.')); return; }
  if (!emailOk(email)) { showErr(errEl, t('Enter a valid email address.')); return; }

  if (loginMode === 'signup') {
    const name = $('#signupName').value.trim();
    const confirm = $('#signupConfirm').value;
    if (!name) { showErr(errEl, t('Enter a full name.')); return; }
    if (pwStrength(pass) < 3) { showErr(errEl, t('Password must be at least {n} characters with upper, lower, number and symbol.', { n: 10 })); return; }
    if (pass !== confirm) { showErr(errEl, t('Passwords do not match.')); return; }
    setBtnLoading($('#loginSubmit'), true);
    const { data, error } = await DB.signUp(email, pass, name);
    setBtnLoading($('#loginSubmit'), false);
    if (error) {
      const m = (error.message || '');
      if (/already.*register|user.*exist/i.test(m)) showErr(errEl, t('That email is already in use. Try signing in.'));
      else showErr(errEl, m);
      return;
    }
    if (data && data.session && data.session.user) {
      user = data.session.user;
      toast(t('Account created — welcome!'), 'success');
      await handleNewSession();
    } else if (data && data.session === null) {
      if (!DB.isConfigured) { toast(t('Demo mode — accounts are not stored. Use Sign in to enter.'), 'warn'); return; }
      const si = await DB.signIn(email, pass);
      if (si.error) showErr(errEl, si.error.message || t('Something went wrong. Try again.'));
      else await handleNewSession();
    }
    return;
  }

  // sign in
  setBtnLoading($('#loginSubmit'), true);
  const { data, error } = await DB.signIn(email, pass);
  setBtnLoading($('#loginSubmit'), false);
  if (error) {
    const m = (error.message || '');
    if (error.code === 'mfa_verification_required' || /mfa|verification required/i.test(m)) {
      if (await showMfaIfNeeded()) return;
      showErr(errEl, m || t('Something went wrong. Try again.'));
      return;
    }
    if (/confirm.*email|email.*confirm/i.test(m)) showErr(errEl, t('Your email is not confirmed yet. Check your inbox.'));
    else if (/invalid login/i.test(m)) showErr(errEl, t('Incorrect email or password.'));
    else showErr(errEl, m);
    $('#loginPassword').value = '';
    return;
  }
  if (data && data.session && data.session.user) user = data.session.user;
  await handleNewSession();
}

// ---------- change password (Settings > Account) ----------
function openChangePassword() {
  if (!DB.isConfigured) {
    toast(t('Password change is only available with a real Supabase account.'), 'warn');
    return;
  }
  openModal(`
    <h3 class="modal-title">${t('Change password')}</h3>
    <label class="field"><span>${t('Current password')}</span><input id="cpCurrent" type="password" autocomplete="current-password" /></label>
    <label class="field"><span>${t('New password')}</span><input id="cpNew" type="password" autocomplete="new-password" /></label>
    <label class="field"><span>${t('Confirm password')}</span><input id="cpConfirm" type="password" autocomplete="new-password" /></label>
    <p class="sale-sub">${t('A strong password includes upper and lower case, a number and a symbol.')}</p>
    <div class="login-error" id="cpError" role="alert" hidden></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cpCancel" type="button">${t('Cancel')}</button>
      <button class="btn btn-primary" id="cpOk" type="button">${t('Change password')}</button>
    </div>`);
  $('#cpCancel').addEventListener('click', closeModal);
  $('#cpOk').addEventListener('click', async () => {
    const cur = $('#cpCurrent').value;
    const nw = $('#cpNew').value;
    const cf = $('#cpConfirm').value;
    const err = $('#cpError');
    hideErr(err);
    if (!cur || !nw) { showErr(err, t('Enter your email and password.')); return; }
    if (pwStrength(nw) < 3) { showErr(err, t('Password must be at least {n} characters with upper, lower, number and symbol.', { n: 10 })); return; }
    if (nw !== cf) { showErr(err, t('Passwords do not match.')); return; }
    setBtnLoading($('#cpOk'), true);
    const { error } = await DB.changePassword(cur, nw);
    setBtnLoading($('#cpOk'), false);
    if (error) {
      if (/reauthentication|current_password|password.*match/i.test(error.message || '')) showErr(err, t('Wrong current password.'));
      else showErr(err, error.message || t('Something went wrong. Try again.'));
      return;
    }
    closeModal();
    toast(t('Password changed.'), 'success');
  });
}

// ---------- MFA settings card ----------
function mfaCardHTML(st) {
  if (!DB.isConfigured) {
    return `<p class="sale-sub">${t('Two-factor authentication is only available with a real Supabase account.')}</p>`;
  }
  if (st.error) return `<p class="sale-sub">${esc(st.error.message || t('Something went wrong. Try again.'))}</p>`;
  if (st.data.enabled) {
    return `<div class="mfa-row">
      <div class="mfa-info">
        <span class="badge badge-green">${icon('ShieldCheck', 'bic')} ${t('Enabled')}</span>
        <p class="sale-sub">${t('If you lose your authenticator app, an admin can remove it from Supabase (Auth > Users).')}</p>
      </div>
      <button class="btn btn-danger btn-sm" data-action="mfa-disable">${t('Disable')}</button>
    </div>`;
  }
  return `<p class="sale-sub">${t('Protect your account with an authenticator app such as Google Authenticator.')}</p>
    <button class="btn btn-ghost" data-action="mfa-setup">${icon('ShieldCheck', 'bic')} ${t('Set up authenticator')}</button>`;
}

async function refreshMfaCard() {
  const card = $('#mfaCard');
  if (!card) return;
  card.innerHTML = '';
  const st = await DB.mfaStatus();
  card.innerHTML = mfaCardHTML(st);
}

// Enrollment modal: QR + code verification
async function openMfaSetup() {
  if (!DB.isConfigured) {
    toast(t('Two-factor authentication is only available with a real Supabase account.'), 'warn');
    return;
  }
  const { data, error } = await DB.mfaEnroll();
  if (error) { toast(error.message || t('Something went wrong. Try again.'), 'error'); return; }
  openModal(`
    <h3 class="modal-title">${t('Set up authenticator')}</h3>
    <p class="sale-sub">${t('Scan this QR code with your authenticator app, then enter the 6-digit code to enable it.')}</p>
    <div class="mfa-qr"><img src="${esc(data.totp.qr_code)}" alt="QR" /></div>
    <label class="field"><span>${t('Authenticator app')}</span><input id="mfaSetupCode" type="text" inputmode="numeric" maxlength="6" placeholder="000000" /></label>
    <div class="login-error" id="mfaSetupError" role="alert" hidden></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="mfaSetupCancel" type="button">${t('Cancel')}</button>
      <button class="btn btn-primary" id="mfaSetupOk" type="button">${t('Verify & enable')}</button>
    </div>`);
  $('#mfaSetupCancel').addEventListener('click', closeModal);
  $('#mfaSetupOk').addEventListener('click', async () => {
    const code = $('#mfaSetupCode').value.trim();
    const err = $('#mfaSetupError');
    hideErr(err);
    if (!/^\d{6}$/.test(code)) { showErr(err, t('Enter a code from your authenticator app.')); return; }
    setBtnLoading($('#mfaSetupOk'), true);
    const ch = await DB.mfaChallenge(data.id);
    if (ch.error) { setBtnLoading($('#mfaSetupOk'), false); showErr(err, ch.error.message || t('Something went wrong. Try again.')); return; }
    const v = await DB.mfaVerify(data.id, ch.data.id, code);
    setBtnLoading($('#mfaSetupOk'), false);
    if (v.error) {
      if (/invalid.*token|token.*invalid|code.*invalid|mfa.*invalid/i.test(v.error.message || '')) showErr(err, t('Invalid code. Try again.'));
      else showErr(err, v.error.message || t('Something went wrong. Try again.'));
      return;
    }
    closeModal();
    toast(t('MFA enabled'), 'success');
    refreshMfaCard();
  });
}

async function confirmMfaDisable() {
  const st = await DB.mfaStatus();
  if (!st.data || !st.data.factorId) return;
  openConfirm({
    title: t('Two-factor authentication'),
    message: t('Disable two-factor authentication? You will only need your password on the next sign-in.'),
    confirmText: t('Disable'),
    danger: true,
    onConfirm: async () => {
      const { error } = await DB.mfaUnenroll(st.data.factorId);
      if (error) { toast(error.message || t('Something went wrong. Try again.'), 'error'); return; }
      toast(t('MFA disabled'), 'success');
      refreshMfaCard();
    }
  });
}

async function afterAuth() {
  authed = true;
  bootStartedAt = Date.now();
  bootFinished = false;
  showBoot(t('Loading your data…'));
  let done = false;
  const watchdog = setTimeout(() => { if (!done) bootFatal(t('Loading timed out. Check your connection and retry.')); }, 8000);
  try {
    const loadPromise = DB.loadAll();
    const tmo = new Promise((_, rej) => setTimeout(() => rej(new Error(t('Timed out while loading data.'))), 6000));
    const err = await Promise.race([loadPromise, tmo]);
    done = true;
    clearTimeout(watchdog);
    if (err) throw new Error(err.error);
    bootStartedAt = 0;
    try {
      syncData();
      applySettingsToChrome();
      applyLangUI();
      showApp();
      initChrome();
      renderNav();
      setActiveNav(currentView);
      renderView();
      hideBoot();
      bootFinished = true;
    } catch (uiErr) {
      showApp();
      hideBoot();
      toast(`${t('Failed to render the panel')}: ${uiErr.message}`, 'error');
    }
    return;
  } catch (e) {
    authed = false;
    showBootError(t('Failed while "loadAll": {msg}', { msg: e.message }));
  } finally {
    done = true;
    clearTimeout(watchdog);
  }
}

async function boot() {
  showBoot(t('Connecting…'));
  if (!DB.isConfigured) console.info('Demo mode — using in-memory demo data (fill config.js for Supabase).');
  const gs = await withTimeout(DB.getSession(), 6000);
  const session = (gs && gs.data && gs.data.session) || null;
  if (session && session.user) { user = session.user; await afterAuth(); }
  else showLogin();
  DB.onAuth((ev, sess) => {
    if ((ev === 'SIGNED_IN' || ev === 'TOKEN_REFRESHED' || ev === 'INITIAL_SESSION') && sess && sess.user) {
      if (!authed) { user = sess.user; handleNewSession(); }
    } else if (ev === 'SIGNED_OUT') {
      authed = false;
      user = null;
      hideMfaStep();
      setLoginMode('signin');
      showLogin();
    }
  });
}

function applySettingsToChrome() {
  const s = state.settings;
  $('#wsName').textContent = s.panelName;
  $('#wsAvatar').textContent = s.panelName.charAt(0).toUpperCase();
  $('#bcWorkspace').textContent = s.panelName;
  const em = profile ? (profile.email || '') : '';
  $('#topUserEmail').textContent = em;
  const role = profile && profile.role === 'admin' ? t('Admin') : t('Staff');
  $('#topUserRole').textContent = role;
  $('#wsRole').textContent = role + ' ' + t('panel');
  $('#topAvatar').textContent = em.charAt(0).toUpperCase();
}

function initChrome() {
  $('#wsChevron').innerHTML = icon('ChevronDown');
  document.querySelector('.search-header > svg').outerHTML = icon('Search');
  document.querySelector('#searchPill svg').outerHTML = icon('Search');
  updateCollapseIcon();
  const lb = document.getElementById('langBtn');
  if (lb) lb.querySelector('svg').outerHTML = icon('Globe');
}

// Sidebar icon depends on screen size: on desktop the drawer is "open" when
// the sidebar is visible; on phones the drawer is open when sidebar-collapsed.
function updateCollapseIcon() {
  const app = $('#app');
  if (!app) return;
  const open = isMobileMQ() ? app.classList.contains('sidebar-collapsed') : !app.classList.contains('sidebar-collapsed');
  $('#collapseIcon').innerHTML = icon(open ? 'PanelLeftClose' : 'PanelLeftOpen');
}

function initWorkspace() {
  const dropdown = $('#wsDropdown');
  const close = () => { dropdown.classList.remove('open'); $('#wsBackdrop').style.display = 'none'; };
  const render = () => {
    const role = profile && profile.role === 'admin' ? t('Admin') : t('Staff');
    const em = profile ? (profile.email || t('Account')) : t('Account');
    dropdown.innerHTML = `<div class="ws-opt current">${esc(em)} · ${role}</div>
      <div class="ws-divider"></div>
      <div class="ws-create" id="wsSignout"><span class="plus">${icon('LogOut', 'bic')}</span> ${t('Sign out')}</div>`;
  };
  $('#wsBtn').addEventListener('click', e => { e.stopPropagation(); dropdown.classList.contains('open') ? close() : (render(), dropdown.classList.add('open'), $('#wsBackdrop').style.display = 'block'); });
  $('#wsBackdrop').addEventListener('click', close);
  dropdown.addEventListener('click', e => {
    if (e.target.closest('#wsSignout')) { close(); logout(); }
    else close();
  });
  render();
}

function init() {
  $('#loginForm').addEventListener('submit', onLoginSubmit);
  $('#tabSignin').addEventListener('click', () => setLoginMode('signin'));
  $('#tabSignup').addEventListener('click', () => setLoginMode('signup'));
  $('#loginPassword').addEventListener('input', updatePwMeter);
  $('#mfaSubmit').addEventListener('click', onMfaSubmit);
  $('#mfaBack').addEventListener('click', () => { hideMfaStep(); $('#loginPassword').value = ''; });
  $('#mfaCode').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); onMfaSubmit(); } });
  const recLink = document.getElementById('recoveryLink');
  if (recLink) recLink.addEventListener('click', openRecovery);
  $('#nav').addEventListener('click', onNavClick);
  $('#navBottom').addEventListener('click', onNavClick);
  $('#view').addEventListener('click', onViewClick);
  $('#view').addEventListener('change', onViewChange);
  $('#formRoot').addEventListener('click', onFormClick);
  $('#formRoot').addEventListener('change', onFormChange);
  $('#formRoot').addEventListener('focusout', onFormBlur);
  $('#formBackdrop').addEventListener('click', closeForm);

  $('#collapseBtn').addEventListener('click', () => {
    const app = $('#app');
    app.classList.toggle('sidebar-collapsed');
    updateCollapseIcon();
    if (currentView === 'home' || currentView === 'analytics') setTimeout(() => ensureCharts().then(drawCharts).catch(() => {}), 350);
  });
  $('#sidebarBackdrop').addEventListener('click', () => $('#app').classList.remove('sidebar-collapsed'));

  $('#searchPill').addEventListener('click', openSearch);
  $('#overlayBackdrop').addEventListener('click', closeSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  $('#searchEsc').addEventListener('click', closeSearch);
  const lb = document.getElementById('langBtn');
  if (lb) lb.addEventListener('click', () => setLang(state.lang === 'es' ? 'en' : 'es'));
  $('#searchInput').addEventListener('input', e => renderSearchResults(e.target.value));
  $('#searchOverlay').addEventListener('click', e => {
    const r = e.target.closest('.search-result');
    if (r) {
      if (r.dataset.sale) navigate('sale', r.dataset.sale); else navigate(r.dataset.view);
      closeSearch();
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape') { closeSearch(); closeModal(); closeForm(); }
  });

  const mm = q => (window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {}, removeEventListener() {} });
  const mq = mm('(max-width: 767px)');
  // Phones: drawer starts closed (no class → hidden). Desktop: sidebar visible.
  mq.addEventListener('change', e => { $('#app').classList.remove('sidebar-collapsed'); updateCollapseIcon(); });

  const themeMq = mm('(prefers-color-scheme: dark)');
  themeMq.addEventListener('change', () => { if (currentView === 'home' || currentView === 'analytics') ensureCharts().then(drawCharts).catch(() => {}); });

  initWorkspace();
  boot();
}

window.addEventListener('error', e => { if (e && e.error) bootFatal(e.error.message || t('Unexpected error')); });
window.addEventListener('unhandledrejection', e => bootFatal((e.reason && (e.reason.message || e.reason)) || t('Unhandled error')));

setInterval(() => {
  if (bootFinished) return;
  const o = document.getElementById('bootOverlay');
  if (o && !o.hidden && bootStartedAt && Date.now() - bootStartedAt > 10000) {
    bootFatal(t('Boot did not finish. Press Diagnose to see exactly what is failing.'));
  }
}, 3000);

setInterval(() => {
  if (bootFinished) return;
  const o = document.getElementById('bootOverlay');
  if (o && !o.hidden && bootStartedAt && Date.now() - bootStartedAt > 20000) {
    hideBoot();
    bootStartedAt = 0;
    if (window.BOOTTRACE && window.BOOTTRACE.showPanel) window.BOOTTRACE.showPanel('Boot never finished — opening trace instead of blocking.');
    else toast(t('Boot did not finish. Press Ctrl+Shift+T (or open with ?trace) for details.'), 'error');
  }
}, 3000);

init();
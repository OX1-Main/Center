// =============================================================
// My Services Panel — Supabase config
// Fill in your project URL and anon key (Settings > API in Supabase).
// The anon key (publishable) is public by design — Row Level Security
// protects your data. NEVER put the service_role / secret key here.
// =============================================================
const SUPABASE_URL = 'https://wufzqynbhvfbzlmqnvgw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MLdr8wFcc2vG9npNtUg38g_Dg_uxodE';
window.SUPABASE_CONFIG = { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
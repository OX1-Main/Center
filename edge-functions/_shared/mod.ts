// =============================================================
// OX1 Segurity — utilidades compartidas de las edge functions
// Firmado HMAC, veredictos, rate-limit y cliente Supabase.
//
// IMPORTANTE: estas funciones corren SOLO en el servidor (Deno).
// Usan service_role internamente. NUNCA se exponen a las apps.
// =============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

// El secreto se lee de forma perezosa para que las pruebas puedan
// inyectarlo con Deno.env.set() antes de llamar a firmar/verificar.
function secret(): string {
  return Deno.env.get("OX1_LICENSE_SECRET") || "";
}

// FAIL-CLOSED: si el secreto no está configurado (o es trivialmente
// corto), las edge functions deben negar el servicio en vez de firmar
// con una clave vacía (que cualquiera podría forjar). Cada handler
// llama a secretReady() al arrancar.
export function secretReady(): boolean {
  return secret().length >= 16;
}

// -------------------------------------------------------------
// Cliente Supabase con service_role (bypass RLS, solo servidor)
// -------------------------------------------------------------
export function sb() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Falta SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

// -------------------------------------------------------------
// HMAC-SHA256 sobre la cadena canónica
//   canon = key + "|" + device_id + "|" + issued_at
// La app NO necesita verificar la firma: el servidor siempre
// revalida contra la base de datos en cada latido. La firma
// protege al server-gate y evita tokens fabricados.
// -------------------------------------------------------------
async function hmacKey() {
  if (!secretReady()) throw new Error("OX1_LICENSE_SECRET no configurado");
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signVerdict(key: string, deviceId: string, issuedAt: string): Promise<string> {
  const canon = `${key}|${deviceId}|${issuedAt}`;
  const k = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(canon));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyVerdict(
  key: string,
  deviceId: string,
  issuedAt: string,
  sig: string,
): Promise<boolean> {
  try {
    const canon = `${key}|${deviceId}|${issuedAt}`;
    const k = await hmacKey();
    const bytes = new Uint8Array(sig.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
    return await crypto.subtle.verify("HMAC", k, bytes, new TextEncoder().encode(canon));
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// Construye la respuesta que las apps entienden
// -------------------------------------------------------------
export function ok(body: unknown, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, data: body }), {
    status,
    headers: corsHeaders(),
  });
}

export function fail(code: string, message: string, status = 200): Response {
  return new Response(JSON.stringify({ ok: false, error: code, message }), {
    status,
    headers: corsHeaders(),
  });
}

export function rateLimited(): Response {
  return fail("rate_limited", "Demasiadas peticiones. Espera un momento.", 429);
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
}

export function handleOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  return null;
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

// -------------------------------------------------------------
// Rate-limit en memoria (primera línea; refuerza si hace falta)
// -------------------------------------------------------------
const hits = new Map<string, { n: number; t: number }>();
const WINDOW_MS = 60_000;
const MAX_HITS = 25;

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  cur.n += 1;
  if (cur.n > MAX_HITS) {
    return false;
  }
  return true;
}

// -------------------------------------------------------------
// Carga una licencia con su venta y la valida.
// Devuelve { license, sale } o { error, reason }
// -------------------------------------------------------------
export async function loadLicense(key: string) {
  const client = sb();
  const { data: license, error } = await client
    .from("licenses")
    .select("*, sale:sales(*)")
    .eq("key", key)
    .maybeSingle();
  if (error) return { error };
  if (!license) return { reason: "invalid_key", message: "Clave de licencia no válida." };
  return { license };
}

// Devuelve el motivo por el que una licencia NO debe dar acceso, o null si todo ok.
export function licenseBlockReason(license: {
  status: string;
  plan: string;
  expires_at: string | null;
  sale: { payment_status: string; status: string } | null;
}): { reason: string; message: string } | null {
  if (license.status === "revoked") return { reason: "revoked", message: "Licencia revocada por el proveedor." };
  if (license.status === "suspended") return { reason: "suspended", message: "Suscripción suspendida. Contacta al proveedor." };
  if (license.status === "expired") return { reason: "expired", message: "Suscripción vencida. Renueva tu plan." };
  if (license.plan !== "onetime" && license.expires_at && new Date(license.expires_at).getTime() < Date.now()) {
    return { reason: "expired", message: "Suscripción vencida. Renueva tu plan." };
  }
  if (!license.sale) return { reason: "not_paid", message: "Sin servicio asociado." };
  if (license.sale.payment_status !== "paid") return { reason: "not_paid", message: "Pago pendiente." };
  if (license.sale.status !== "active") return { reason: "suspended", message: "Suscripción suspendida. Contacta al proveedor." };
  return null;
}

export function logEvent(licenseId: string, event: string, body: Record<string, unknown>, ip: string) {
  const client = sb();
  void client.from("license_events").insert({
    license_id: licenseId,
    device_id: (body.device_id as string) || null,
    event,
    detail: {
      platform: body.platform || null,
      name: body.name || null,
      fingerprint: body.fingerprint || null,
    },
    ip: ip === "unknown" ? null : ip,
    user_agent: null,
  }).then(() => {}, () => {});
}

// -------------------------------------------------------------
// Revocación de tokens offline desde el panel.
// Si el dispositivo presenta un token offline (su sig) y ese token
// fue marcado como 'revoked' en offline_tokens, se bloquea el acceso
// AUNQUE la licencia siga activa. Devuelve el motivo ('revoked') o null.
// (Si la tabla no existe aún, no bloquea: es una mejora opcional.)
// -------------------------------------------------------------
export async function offlineTokenBlocked(licenseId: string, sig: unknown): Promise<string | null> {
  if (!sig) return null;
  try {
    const client = sb();
    const { data } = await client
      .from("offline_tokens")
      .select("status")
      .eq("license_id", licenseId)
      .eq("sig", String(sig))
      .maybeSingle();
    if (data && data.status === "revoked") {
      return "revoked";
    }
  } catch {
    // noop
  }
  return null;
}
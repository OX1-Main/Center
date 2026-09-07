// =============================================================
// ox1-devices — self-service del cliente (portal)
// POST { key, device_id?, action? }
//   action = "list"        (por defecto) -> devuelve los dispositivos
//   action = "deactivate"  { key, device_id } -> elimina ese dispositivo
//
// La clave de licencia ES la credencial: el cliente legítimo la
// conoce. Solo permite listar dispositivos y desactivar uno concreto
// de SU clave (nunca leer claves ajenas). Hay rate-limit por clave.
// =============================================================

import {
  clientIp,
  fail,
  handleOptions,
  loadLicense,
  logEvent,
  ok,
  rateLimit,
  readBody,
  secretReady,
  sb,
} from "../_shared/mod.ts";

// Rate-limit adicional por clave (además del de IP).
const keyHits = new Map<string, number[]>();
const KEY_WINDOW_MS = 60_000;
const KEY_MAX = 5;

function keyRateLimit(key: string): boolean {
  const now = Date.now();
  const hits = (keyHits.get(key) || []).filter(t => now - t < KEY_WINDOW_MS);
  if (hits.length >= KEY_MAX) {
    keyHits.set(key, hits);
    return false;
  }
  hits.push(now);
  keyHits.set(key, hits);
  return true;
}

Deno.serve(async (req: Request) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (!secretReady()) {
    return fail("server_error", "Servicio mal configurado. Contacta al administrador.", 500);
  }

  const ip = clientIp(req);
  if (!rateLimit(ip)) {
    return fail("rate_limited", "Demasiadas peticiones. Espera un momento.", 429);
  }

  const body = await readBody(req);
  const key = String(body.key || "").trim().toUpperCase();
  const deviceId = String(body.device_id || "").trim();
  if (!key) return fail("bad_request", "Falta key.");
  if (key.length > 40) return fail("bad_request", "key inválida.");
  if (deviceId.length > 128) return fail("bad_request", "device_id inválido.");

  if (!keyRateLimit(key)) {
    return fail("rate_limited", "Demasiadas consultas para esta clave. Espera un minuto.", 429);
  }

  const loaded = await loadLicense(key);
  if (loaded.error) return fail("server_error", "No se pudo consultar la licencia.");
  if (loaded.reason) return fail("invalid_key", "Clave de licencia no válida.");
  const license = loaded.license;

  const client = sb();
  const devicesQuery = () =>
    client
      .from("devices")
      .select("id, device_id, name, platform, last_seen, first_seen, last_ip, status, created_at")
      .eq("license_id", license.id)
      .order("last_seen", { ascending: false });

  if (body.action === "deactivate") {
    if (!deviceId) return fail("bad_request", "Falta device_id.");
    const { data: dev, error: devErr } = await devicesQuery().eq("device_id", deviceId).maybeSingle();
    if (devErr) return fail("server_error", "No se pudo consultar el dispositivo.");
    if (!dev) return fail("bad_request", "Dispositivo no encontrado.");
    const { error: delErr } = await client.from("devices").delete().eq("id", dev.id);
    if (delErr) return fail("server_error", "No se pudo eliminar el dispositivo.");
    logEvent(license.id, "device_self_removed", { device_id: deviceId }, ip);
  }

  const { data: devices, error: listErr } = await devicesQuery();
  if (listErr) return fail("server_error", "No se pudo listar los dispositivos.");

  return ok({
    devices: devices || [],
    plan: license.plan,
    expires_at: license.expires_at,
    status: license.status,
  });
});
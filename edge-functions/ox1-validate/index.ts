// =============================================================
// ox1-validate — latido de las apps (heartbeat)
// POST { key, device_id, sig?, issued_at?, fingerprint?, platform?, name? }
// Verifica firma (si viene), estado, vencimiento y dispositivo.
// Devuelve un veredicto fresco firmado.
// =============================================================

import {
  clientIp,
  fail,
  handleOptions,
  loadLicense,
  licenseBlockReason,
  logEvent,
  offlineTokenBlocked,
  ok,
  rateLimit,
  readBody,
  secretReady,
  signVerdict,
  verifyVerdict,
  sb,
} from "../_shared/mod.ts";

// Antigüedad máxima aceptada para un veredicto firmado presentado por
// el cliente (defense-in-depth contra replay de tokens viejos).
const MAX_VERDICT_AGE_MS = 48 * 60 * 60 * 1000;

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

  if (!key || !deviceId) {
    return fail("bad_request", "Faltan key o device_id.");
  }
  if (key.length > 40) return fail("bad_request", "key inválida.");
  if (deviceId.length > 128) return fail("bad_request", "device_id inválido.");

  // Si el cliente presenta un veredicto firmado, validamos la firma
  // para descartar tokens fabricados a mano, y exigimos que sea fresco.
  if (body.sig && body.issued_at) {
    const valid = await verifyVerdict(key, deviceId, String(body.issued_at), String(body.sig));
    if (!valid) return fail("signature_invalid", "Veredicto no válido.");
    const issuedMs = new Date(String(body.issued_at)).getTime();
    if (isNaN(issuedMs) || Date.now() - issuedMs > MAX_VERDICT_AGE_MS) {
      return fail("signature_invalid", "Veredicto vencido.");
    }
  }

  const loaded = await loadLicense(key);
  if (loaded.error) return fail("server_error", "No se pudo validar la licencia.");
  if (loaded.reason) return fail(loaded.reason, loaded.message);
  const { license } = loaded;

  const blocked = licenseBlockReason(license);
  if (blocked) {
    logEvent(license.id, blocked.reason, body, ip);
    return fail(blocked.reason, blocked.message);
  }

  // Token offline revocado desde el panel: bloquea aunque la licencia
  // esté activa (el dashboard "cortó el servicio" de ese dispositivo).
  const offlineBlocked = await offlineTokenBlocked(license.id, body.offline_token);
  if (offlineBlocked) {
    logEvent(license.id, offlineBlocked, body, ip);
    return fail(offlineBlocked, "El permiso offline fue revocado por el proveedor.");
  }

  const client = sb();

  const { data: device, error: devErr } = await client
    .from("devices")
    .select("*")
    .eq("license_id", license.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (devErr) return fail("server_error", "No se pudo validar el dispositivo.");
  if (!device) {
    // El dispositivo no existe: la app debe reactivarse.
    return fail("not_activated", "Dispositivo no registrado. Ejecuta la activación.");
  }
  if (device.status === "blocked") {
    logEvent(license.id, "device_blocked", body, ip);
    return fail("device_blocked", "Este dispositivo fue bloqueado por el proveedor.");
  }

  await client.from("devices").update({
    last_seen: new Date().toISOString(),
    last_ip: ip === "unknown" ? undefined : ip,
    name: (body.name as string) || device.name,
  }).eq("id", device.id);

  // Log de latido espaciado (no registrar cada segundo)
  const { data: last } = await client
    .from("license_events")
    .select("created_at")
    .eq("license_id", license.id)
    .eq("device_id", deviceId)
    .eq("event", "validate")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!last || Date.now() - new Date(last.created_at).getTime() > 30 * 60 * 1000) {
    logEvent(license.id, "validate", body, ip);
  }

  const issuedAt = new Date().toISOString();
  const sig = await signVerdict(license.key, deviceId, issuedAt);
  return ok({
    allowed: true,
    plan: license.plan,
    expires_at: license.expires_at,
    max_devices: license.max_devices,
    grace_hours: license.grace_hours,
    device_id: deviceId,
    issued_at: issuedAt,
    sig,
  });
});
// =============================================================
// ox1-activate — registra un dispositivo en una licencia
// POST { key, app_id, device_id, fingerprint?, platform?, name? }
// Devuelve un veredicto firmado que la app guarda en caché.
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
  sb,
} from "../_shared/mod.ts";

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
  const appId = String(body.app_id || "").trim();

  if (!key || !deviceId) {
    return fail("bad_request", "Faltan key o device_id.");
  }
  if (key.length > 40) return fail("bad_request", "key inválida.");
  if (deviceId.length > 128) return fail("bad_request", "device_id inválido.");

  const loaded = await loadLicense(key);
  if (loaded.error) return fail("server_error", "No se pudo validar la licencia.");
  if (loaded.reason) return fail(loaded.reason, loaded.message);
  const { license } = loaded;

  const blocked = licenseBlockReason(license);
  if (blocked) {
    logEvent(license.id, blocked.reason === "expired" ? "expired" : blocked.reason === "suspended" ? "suspended" : "revoked", body, ip);
    return fail(blocked.reason, blocked.message);
  }

  // Token offline revocado desde el panel: bloquea aunque la licencia
  // esté activa (el dashboard "cortó el servicio" de ese dispositivo).
  const offlineBlocked = await offlineTokenBlocked(license.id, body.offline_token);
  if (offlineBlocked) {
    logEvent(license.id, offlineBlocked, body, ip);
    return fail(offlineBlocked, "El permiso offline fue revocado por el proveedor.");
  }

  // Si la licencia tiene app_id fijado, el cliente DEBE enviarlo y coincidir.
  // (Sin esto, un cliente que omita app_id podría usar la clave en cualquier app.)
  if (license.app_id && appId !== license.app_id) {
    logEvent(license.id, "app_mismatch", body, ip);
    return fail("app_mismatch", "Esta clave no corresponde a esta aplicación.");
  }

  const client = sb();

  // ¿El dispositivo ya está registrado?
  const { data: existing } = await client
    .from("devices")
    .select("*")
    .eq("license_id", license.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "blocked") {
      logEvent(license.id, "device_blocked", body, ip);
      return fail("device_blocked", "Este dispositivo fue bloqueado por el proveedor.");
    }
    await client.from("devices").update({
      last_seen: new Date().toISOString(),
      last_ip: ip === "unknown" ? undefined : ip,
      name: (body.name as string) || existing.name,
      platform: (body.platform as string) || existing.platform,
    }).eq("id", existing.id);

    logEvent(license.id, "validate", body, ip);
    return verdict(license, deviceId);
  }

  // Dispositivo nuevo: comprobar límite de dispositivos
  const { count } = await client
    .from("devices")
    .select("id", { count: "exact", head: true })
    .eq("license_id", license.id)
    .eq("status", "active");

  if ((count ?? 0) >= license.max_devices) {
    logEvent(license.id, "device_limit", { ...body, count }, ip);
    return fail("device_limit", "Se alcanzó el límite de dispositivos para esta clave.");
  }

  await client.from("devices").insert({
    license_id: license.id,
    device_id: deviceId,
    fingerprint: (body.fingerprint as string) || null,
    platform: (body.platform as string) || null,
    name: (body.name as string) || null,
    last_ip: ip === "unknown" ? null : ip,
  });

  logEvent(license.id, "activate", body, ip);
  return verdict(license, deviceId);
});

async function verdict(license: any, deviceId: string) {
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
}
// =============================================================
// ox1-deactivate — desvincula un dispositivo de una licencia
// POST { key, device_id }
// El SDK lo llama cuando el usuario cierra sesión o desinstala.
// También sirve para liberar un hueco de max_devices.
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

  const loaded = await loadLicense(key);
  if (loaded.error) return fail("server_error", "No se pudo validar la licencia.");
  if (loaded.reason) return fail(loaded.reason, loaded.message);
  const { license } = loaded;

  const client = sb();

  const { data: device, error } = await client
    .from("devices")
    .select("*")
    .eq("license_id", license.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) return fail("server_error", "No se pudo desvincular el dispositivo.");

  if (device) {
    await client.from("devices").delete().eq("id", device.id);
  }

  logEvent(license.id, "deactivate", body, ip);
  return ok({ deactivated: true });
});
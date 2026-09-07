# Edge Functions — despliegue en el Supabase CENTRAL

Estas 4 funciones (ox1-activate · ox1-validate · ox1-deactivate · ox1-devices)
son **la autoridad** de licencias: las apps OX1 (web/APK/Flutter/Python/Electron)
las consultan para validar su clave, y aquí se decide si siguen activas o se
bloquean.

Se despliegan **una sola vez** en el proyecto central
(`wufzqynbhvfbzlmqnvgw`). Antes debes haber aplicado
`supabase/0_INSTALL_CENTRAL.sql` (crea `licenses`, `devices`, `license_events`,
`offline_tokens`, `sales`, `apps`).

## Requisitos

- Supabase CLI instalado: `npm i -g supabase`
- Haber ejecutado ya `0_INSTALL_CENTRAL.sql` en SQL Editor

## Desplegar

```bash
cd edge-functions
supabase login
supabase link --project-ref wufzqynbhvfbzlmqnvgw
supabase secrets set OX1_LICENSE_SECRET=pon-aqui-un-secreto-largo-aleatorio
supabase functions deploy ox1-activate ox1-validate ox1-deactivate ox1-devices
```

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` las inyecta Supabase solo; no hay
> que configurarlas. **Fail-closed:** si `OX1_LICENSE_SECRET` no está, las
> funciones responden `server_error` (500) en vez de firmar con clave vacía.

## Genera un secreto seguro

```bash
openssl rand -hex 32
```

## URLs que usan las apps

```
https://wufzqynbhvfbzlmqnvgw.supabase.co/functions/v1/ox1-activate
https://wufzqynbhvfbzlmqnvgw.supabase.co/functions/v1/ox1-validate
https://wufzqynbhvfbzlmqnvgw.supabase.co/functions/v1/ox1-deactivate
https://wufzqynbhvfbzlmqnvgw.supabase.co/functions/v1/ox1-devices
```

Estas 4 URLs + la `appId` de "OX1 WhatShop" son lo que configurarás en el
`config.js` de cada tienda WhatShop vendida (ver OX1WhatShop).

## Probar en local

```bash
cd edge-functions
supabase functions serve ox1-activate ox1-validate ox1-deactivate
```

Sirve en `http://127.0.0.1:54321/functions/v1/ox1-*`.

## Seguridad

- `OX1_LICENSE_SECRET` = secreto HMAC. Se guarda solo en Supabase Secrets, nunca
  en ninguna app ni en este repo.
- `service_role` solo vive en el servidor (Supabase lo inyecta a las funciones).
- Rate-limit en memoria por IP (25/min) y por clave en ox1-devices (5/min).
- RLS en las tablas de licencias = solo-admin; el anon key no puede leerlas.

# Seguridad del panel OX1

El panel corre como static site en GitHub Pages y se autentica contra
Supabase Auth con el flujo **PKCE** y **tokens bearer** (sin cookies).
Esta página resume lo que está activo por defecto y lo que hay que
configurar según el domino/despliegue.

## 1. HSTS y HTTPS
- El tráfico ya es HTTPS (GitHub Pages forzado).
- **HSTS** requiere cabecera `Strict-Transport-Security`, que GitHub
  Pages **no** puede enviar.
- Para activarlo: pon un dominio propio detrás de un CDN (Cloudflare,
  por defecto manda HSTS) o un proxy, y añade la cabecera:
  ```
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ```
- O activa "Always Use HTTPS" + HSTS en tu panel CDN. Luego recarga con
  dominios locales (ej. `localhost`) para evitar enredar desarrollo.

## 2. CSRF
- El panel usa **tokens bearer** (Authorization header) + **PKCE**, no
  cookies de sesión. Todo endpoint muta solo mediante `Authorization:
  Bearer <jwt>` decodificado por RLS (`auth.uid()`).
- Sin cookies automáticas, el vector clásico de CSRF **no aplica**.
- GitHub Pages envía CSP/referrer seguros de forma predeterminada; no
  confíes en el valor de `Referer` para autorizar.

## 3. Restablecer todas las sesiones (revocación)
- **Un dispositivo**: botón "Sign out" (revoca el token de ese browser).
- **Todos los dispositivos**: botón "Sign out everywhere" en Ajustes →
  Cuenta → `supabase.auth.signOut({ scope: 'global' })`. Revoca todas
  las sesiones del usuario.
- **Por seguridad extra** (cambio de contraseña, sospecha de robo):
  1. En Supabase → Authentication → Users → edita al usuario → "Revoke all sessions".
  2. Cambia la contraseña (el nuevo token invalida el anterior que los
     JWT de refresh reutilizan).

## 4. Caducidad de enlaces y tokens
- Supabase Auth emite tokens de "reset/password" y de confirmación con
  TTL. Valores recomendados:
  - **Access token TTL**: 3600 s (1 h) — default.
  - **Refresh token reutilization interval**: 10 s — default.
  - **Verification/secure links**: caducan en 1 h (o configúralo).
- Los **refresh tokens rotan** en cada uso (autoRefreshToken). Si rotan,
  el token anterior se marca usado y no puede reutilizarse (protege
  contra replay).
- Verifica en Supabase → Authentication → Providers → "Secure email
  change / password reset" que el TTL esté en horas, no días.

## Resumen de estado
| Control | Estado |
|---|---|
| HTTPS | ✔ GitHub Pages (sin HSTS) — instalar HSTS vía CDN |
| HSTS | ✘ requiere CDN/dominio propio |
| CSRF | ✔ mitigado (PKCE + bearer, sin cookies) |
| Revocar dispositivo | ✔ `signOut` local |
| Revocar todos | ✔ `signOut({scope:'global'})` + "Sign out everywhere" |
| Token rotation | ✔ autoRefreshToken + rotación JWT |
| Caducidad enlaces | ✔ TTL de Supabase Auth (revisar en panel) |
| service_role | ✔ nunca en el navegador (solo edge functions) |

## Claves JS (config.js)
- Solo la **anon publishable key** (`sb_publishable_...`) está en el
  navegador. RLS restringe cada fila a su `auth.uid()`.
- La `service_role` / secret solo vive en edge functions y en el panel
  de Supabase. Si alguna vez se filtra, rota la clave YA.
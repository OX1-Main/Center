# Supabase setup

This panel is a static SPA: the browser talks to Supabase directly through the
anon key, and **Row Level Security (RLS)** is what protects each user's data.
Never put the `service_role` key in `config.js`.

## 1. Create the project

1. Go to https://supabase.com and create a project (free tier is fine).
2. In **Project Settings > API**, copy the **Project URL** and the **anon / public key**.

## 2. Apply the schema

1. In the Supabase dashboard open **SQL Editor**.
2. Paste the contents of `supabase/0_INSTALL_CENTRAL.sql` and run it. This ONE file
   applies everything in order:
   - Panel tables with RLS: `profiles`, `apps`, `clients`, `sales`, `settings`.
   - Auth hardening: `MAILER_AUTOCONFIRM`, `SITE_URL=https://ox1-main.github.io/Center`,
     allow-list of redirects.
   - **Master recovery key** (`recover_account`, `set_recovery_key`, `has_recovery_key`)
     with brute-force lockout.
   - Seed catalog (incl. **OX1 WhatShop**).
   - **License tables** (OX1 Segurity): `licenses`, `devices`, `license_events`,
     `offline_tokens`, plus expire/gen-key helpers.
   - `profiles.role` defaults to `staff`; a trigger creates a profile row when a
     user is created, and the **first user ever becomes `admin`** automatically.

## 3. Users & security

There is **no email service**: sign-ups are auto-confirmed and there is no
"forgot password" link. Security relies on a strong password policy plus
**two-factor authentication (TOTP)** via Google Authenticator.

1. **Project Settings > Authentication > Providers** — keep **Email** enabled.
   Disable any providers you don't want.
2. **Authentication > Sign In / Up** — set:
   - **Allow new users to sign up**: ON (this panel has a "Create account" tab).
   - **Confirm email**: OFF is fine (emails are auto-confirmed via SQL).
   - **Secure password change**: ON (lets users change password only by
     proving their current password — the panel uses this).
3. **Authentication > Password Protection**:
   - **Password strength**: enable all rules (min length **10**, plus
     uppercase, lowercase, number and symbol). The login screen shows a
     live strength meter to match.
4. **Authentication > Bot and Abuse Protection** (Attack Protection): leave the
   default rate limits / lockout on. TOTP MFA is free and enabled on all
   projects by default — no extra setup needed for authenticator apps.
5. The first account you create becomes **admin**. Later accounts are **staff**
   (manage only their own clients/sales; only admins edit the app catalog and
   roles). To promote someone:

   ```sql
   update profiles set role = 'admin' where id = '<user-id-from-users-list>';
   ```

### Master recovery key (solo tú)

Además del login (email+password+MFA), el panel incluye una **clave maestra de
recuperación** que solo tú conoces. Se guarda **hasheada bcrypt** en
`profiles.recovery_key_hash` — nadie, ni desde la DB, puede leerla.

1. Crea tu primera cuenta (será admin) desde la pantalla de login.
2. Entra a **Settings → Account → Recovery key** y define tu clave (mínimo 12
   caracteres).
3. Si pierdes contraseña/autenticador: en el login pulsa **"Recover access with
   recovery key"**, pon tu correo + tu clave + una contraseña nueva.
   `recover_account()` la verifica y resetea. Está protegida contra fuerza bruta
   (5 fallos = 15 min bloqueo).

## 3b. Edge functions de licencias (OX1)

La parte servidor de la validación anti-piratería. Se despliegan **una vez** en
este proyecto. Sigue `../edge-functions/README.md`:

```bash
cd edge-functions
supabase login
supabase link --project-ref wufzqynbhvfbzlmqnvgw
supabase secrets set OX1_LICENSE_SECRET=<secreto-largo-aleatorio>
supabase functions deploy ox1-activate ox1-validate ox1-deactivate ox1-devices
```

## 4. Configure the panel

1. Copy `config.example.js` to `config.js` (already created) and fill it in:

   ```js
   const SUPABASE_URL = 'https://YOURPROJECT.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

2. `config.js` is ignored by git on purpose — but the anon key is safe to commit
   if you prefer (RLS is the real protection). Only ever put the **anon /
   public** key here; never the `service_role` key.

## 5. Deploy (GitHub Pages)

1. Push the repo to GitHub.
2. **Settings > Pages > Build and deployment**: Source → **Deploy from a branch**,
   branch `main`, folder `/` (root).
3. Every push to `main` redeploys automatically.

## How login + permissions work

- `db.js` checks whether `config.js` still has placeholders. If yes, the app runs
  in **demo mode** (in-memory data, auto-logged-in admin) — great for previews
  and tests. Fill `config.js` to switch to real Supabase.
- Authentication uses Supabase Auth (email + password) with a persisted session.
  Sign-up is in-app ("Create account" tab); users can change their password from
  Settings > Account by proving the current password.
- **Two-factor authentication**: users can enroll a TOTP factor (Google
  Authenticator) from Settings > Account. After that, every sign-in asks for the
  6-digit code from the authenticator app.
- RLS policies only ever let the current user read/write their own rows. `apps`
  is readable by every authenticated user but writable only by admins.

## Extra

- **Account recovery**: because there is no email, a forgotten password or a lost
  authenticator can only be resolved by an admin: in the dashboard go to
  **Authentication > Users**, reset the user's password, and — if the phone is
  lost — delete their MFA factor:
  ```sql
  delete from auth.mfa_factors where user_id = '<user-id>' and status = 'verified';
  ```
- **Roles**: change them any time via the SQL above; the panel shows the role on
  the Settings screen.
- **Payment options**: on the Settings screen, "Payment options" lets you add or
  remove the payment methods you can assign to a project (PayPal, bank transfer,
  cash…). Options are stored per user in `settings.payment_methods`.
- **Language**: the globe button in the top bar toggles English/Spanish. Your
  choice is stored in `settings.lang`. You can also switch it from Settings.
- **Frontend hardening**: `index.html` ships a Content-Security-Policy meta tag
  (only self + jsDelivr scripts + your Supabase endpoint) and `no-referrer`;
  `server.py` sends `X-Content-Type-Options`, `X-Frame-Options` and
  `Referrer-Policy` headers. Keep those in place when you deploy.
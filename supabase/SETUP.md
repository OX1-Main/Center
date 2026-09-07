# Supabase setup

This panel is a static SPA: the browser talks to Supabase directly through the
anon key, and **Row Level Security (RLS)** is what protects each user's data.
Never put the `service_role` key in `config.js`.

## 1. Create the project

1. Go to https://supabase.com and create a project (free tier is fine).
2. In **Project Settings > API**, copy the **Project URL** and the **anon / public key**.

## 2. Apply the schema

1. In the Supabase dashboard open **SQL Editor**.
2. Paste the contents of `supabase/schema.sql` and run it.
   - Creates tables: `profiles`, `apps`, `clients`, `sales`, `settings`.
   - Enables RLS on every table. The anonymous role has **no** privileges on
     any panel table, and each user can read/write only their own rows.
   - `profiles.role` defaults to `staff`; a trigger creates a profile row when a
     user is created, and the **first user ever becomes `admin`** automatically.
   - Projects track a **payment method** and a **payment status** (paid/pending).
     No amounts or earnings are stored anywhere.
3. Paste the contents of `supabase/auth.sql` and run it.
   - Auto-confirms emails (no SMTP configured), sets the site URL and the
     allowed redirect list. Some auth settings can only be changed in the
     dashboard — see the security checklist below.
4. *(Optional)* Paste `supabase/seed.sql` for 4 demo apps in the catalog.

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
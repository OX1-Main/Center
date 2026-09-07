-- =============================================================
-- My Services Panel — Auth hardening (best-effort via SQL)
-- Run in: Supabase Dashboard > SQL Editor, AFTER schema.sql.
--
-- Some auth settings can only be changed in the dashboard (password
-- policy, lockout, rate limits, custom SMTP). Those are covered in
-- SETUP.md. This file applies everything that is settable via SQL.
-- =============================================================

-- No confirmation emails: the project has no SMTP configured, so
-- emails are auto-confirmed and sign-ups get a session immediately.
update auth.config
set MAILER_AUTOCONFIRM = 'true';

-- Where the panel is hosted (used as the base URL for auth redirects).
-- GitHub Pages URL for the O1-Main/Center repo.
update auth.config
set SITE_URL = 'https://ox1-main.github.io/Center';

-- Only these redirect targets are allowed after auth actions
-- (defends against open-redirect abuse).
update auth.config
set URI_ALLOW_LIST = '["https://ox1-main.github.io/Center","http://localhost:8137","http://localhost:3000"]';
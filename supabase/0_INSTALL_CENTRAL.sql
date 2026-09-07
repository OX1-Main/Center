-- =============================================================
-- OX1 Dashboard CENTRAL — instalación completa (una sola pasada)
-- Pega TODO este archivo en: Supabase Dashboard > SQL Editor > Run.
--
-- Incluye (en orden):
--   1. schema.sql        -> tablas del panel (profiles/apps/clients/sales/settings) + RLS
--   2. auth.sql          -> SITE_URL (https://ox1-main.github.io/Center) + allow-list
--   3. recovery.sql      -> clave maestra de recuperación (bcrypt) + rate-limit
--   4. seed.sql          -> catálogo de apps de ejemplo (opcional, fácil de borrar)
--   5. 01_licenses_schema.sql + 03_offline_tokens.sql (OX1 Segurity)
--
-- Después de esto:
--   - Crea tu PRIMERA cuenta desde la pantalla de login del panel:
--     será ADMIN automáticamente (trigger handle_new_user).
--   - Entra a Settings > Account > Recovery key y define tu CLAVE MAESTRA.
--   - En la vista "Licenses" crea las licencias para cada WhatShop vendida.
-- =============================================================

-- -------------------------------------------------------------
-- 1. PANEL SCHEMA (public.schema.sql)
-- -------------------------------------------------------------
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

revoke all on table public.profiles, public.apps, public.clients, public.sales, public.settings from anon;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  display_name text,
  recovery_key_hash text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles) then
    insert into public.profiles (id, role, display_name)
    values (new.id, 'admin', coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  else
    insert into public.profiles (id, role, display_name)
    values (new.id, 'staff', coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'Web app',
  version text,
  created_at timestamptz not null default now()
);

alter table public.apps enable row level security;

create policy "apps_select_authed"
  on public.apps for select
  using (auth.role() = 'authenticated');

create policy "apps_insert_admin"
  on public.apps for insert
  with check (public.is_admin());

create policy "apps_update_admin"
  on public.apps for update
  using (public.is_admin());

create policy "apps_delete_admin"
  on public.apps for delete
  using (public.is_admin());

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  joined date,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "clients_select_own"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "clients_insert_own"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "clients_update_own"
  on public.clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "clients_delete_own"
  on public.clients for delete
  using (auth.uid() = user_id);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  app_id uuid references public.apps (id) on delete set null,
  client_id uuid references public.clients (id) on delete cascade,
  contract text not null,
  plan text not null default 'monthly' check (plan in ('monthly', 'annual', 'onetime')),
  payment_method text,
  payment_status text not null default 'pending' check (payment_status in ('paid', 'pending')),
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('active', 'suspended')),
  page text not null default 'online' check (page in ('online', 'offline', 'review')),
  db text not null default 'active' check (db in ('active', 'inactive', 'error')),
  api_key text,
  created_at timestamptz not null default now()
);

alter table public.sales enable row level security;

create policy "sales_select_own"
  on public.sales for select
  using (auth.uid() = user_id);

create policy "sales_insert_own"
  on public.sales for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.clients c
      where c.id = client_id and c.user_id = auth.uid()
    )
  );

create policy "sales_update_own"
  on public.sales for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.clients c
      where c.id = client_id and c.user_id = auth.uid()
    )
  );

create policy "sales_delete_own"
  on public.sales for delete
  using (auth.uid() = user_id);

create table if not exists public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  alert_days int not null default 7,
  panel_name text not null default 'My Services',
  email_notif boolean not null default true,
  webhook_notif boolean not null default true,
  lang text not null default 'en' check (lang in ('en', 'es')),
  payment_methods jsonb not null default '["PayPal","Bank transfer","Cash","Credit card"]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings_select_own"
  on public.settings for select
  using (auth.uid() = user_id);

create policy "settings_insert_own"
  on public.settings for insert
  with check (auth.uid() = user_id);

create policy "settings_update_own"
  on public.settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -------------------------------------------------------------
-- 2. AUTH HARDENING (public.auth.sql)
-- -------------------------------------------------------------
update auth.config
set MAILER_AUTOCONFIRM = 'true';

update auth.config
set SITE_URL = 'https://ox1-main.github.io/Center';

update auth.config
set URI_ALLOW_LIST = '["https://ox1-main.github.io/Center","http://localhost:8137","http://localhost:3000"]';

-- -------------------------------------------------------------
-- 3. MASTER RECOVERY KEY (public.recovery.sql)
--    Define tu clave en Settings > Account > Recovery key tras
--    crear tu primera cuenta (admin).
-- -------------------------------------------------------------
alter table public.profiles
  add column if not exists recovery_key_hash text;

create table if not exists public.recovery_attempts (
  email        text primary key,
  failures     int not null default 0,
  last_fail    timestamptz not null default now(),
  locked_until timestamptz
);

alter table public.recovery_attempts enable row level security;
revoke all on table public.recovery_attempts from anon, authenticated;
grant select on table public.recovery_attempts to authenticated;

drop policy if exists "recovery_attempts_rpc_only" on public.recovery_attempts;
create policy "recovery_attempts_rpc_only" on public.recovery_attempts
  for all using (public.is_admin());

create or replace function public.recovery_key_matches(p_hash text, p_key text)
returns boolean
language sql immutable
as $$
  select p_hash is not null and p_hash <> '' and p_hash = crypt(p_key, p_hash);
$$;

create or replace function public.set_recovery_key(p_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_key is null or length(p_key) < 12 then
    raise exception 'key_too_short';
  end if;

  update public.profiles
     set recovery_key_hash = crypt(p_key, gen_salt('bf', 10))
   where id = v_uid;

  if not found then
    raise exception 'profile_not_found';
  end if;

  return true;
end;
$$;

create or replace function public.has_recovery_key()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(recovery_key_hash <> '', false)
    from public.profiles
   where id = auth.uid();
$$;

create or replace function public.recover_account(
  p_email text,
  p_key text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid  uuid;
  v_hash text;
  v_lock timestamptz;
  v_fail int;
begin
  if p_email is null or p_key is null or p_new_password is null then
    raise exception 'bad_request';
  end if;
  if char_length(p_new_password) < 10 then
    raise exception 'weak_password';
  end if;

  select u.id, pr.recovery_key_hash, ra.locked_until, ra.failures
    into v_uid, v_hash, v_lock, v_fail
    from public.profiles pr
    join auth.users u on u.id = pr.id
    left join public.recovery_attempts ra
           on lower(ra.email) = lower(u.email)
   where lower(u.email) = lower(p_email)
   limit 1;

  if v_uid is null or v_hash is null or v_hash = '' then
    raise exception 'no_recovery_key';
  end if;

  if v_lock is not null and v_lock > now() then
    raise exception 'locked_out';
  end if;

  if not public.recovery_key_matches(v_hash, p_key) then
    insert into public.recovery_attempts (email, failures, last_fail, locked_until)
    values (lower(p_email), 1, now(), null)
    on conflict (email) do update
      set failures  = public.recovery_attempts.failures + 1,
          last_fail = now(),
          locked_until = case
            when public.recovery_attempts.failures + 1 >= 5
              then now() + interval '15 minutes'
            else null
          end;
    raise exception 'invalid_key';
  end if;

  update auth.users
     set encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
         updated_at = now()
   where id = v_uid;

  delete from public.recovery_attempts where lower(email) = lower(p_email);

  return true;
end;
$$;

revoke all on function public.recovery_key_matches(text, text) from public;
revoke all on function public.set_recovery_key(text) from public;
revoke all on function public.has_recovery_key() from public;
revoke all on function public.recover_account(text, text, text) from public;

grant execute on function public.set_recovery_key(text) to authenticated;
grant execute on function public.has_recovery_key() to authenticated;
grant execute on function public.recover_account(text, text, text) to anon, authenticated;
grant execute on function public.recovery_key_matches(text, text) to authenticated;

-- -------------------------------------------------------------
-- 4. SEED (catálogo de apps de ejemplo)
-- -------------------------------------------------------------
insert into public.apps (name, type, version) values
  ('OX1 WhatShop',       'Web app',      'v1.0'),
  ('Retail Store App',   'Web app',      'v3.2'),
  ('Inventory Manager',  'SaaS',         'v5.0'),
  ('Point of Sale',      'Desktop app',  'v2.4'),
  ('Booking Widget',     'Web widget',   'v1.8')
on conflict do nothing;

-- -------------------------------------------------------------
-- 5. LICENSES (OX1 Segurity 01 + offline tokens)
--    Depende de sales/apps ya existentes (se crean arriba).
-- -------------------------------------------------------------
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references public.sales (id) on delete cascade,
  app_id uuid references public.apps (id) on delete set null,
  key text not null unique,
  plan text not null default 'monthly',
  status text not null default 'active'
    check (status in ('active', 'suspended', 'revoked', 'expired')),
  max_devices int not null default 1 check (max_devices >= 1),
  grace_hours int not null default 72 check (grace_hours >= 1),
  expires_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses (id) on delete cascade,
  device_id text not null,
  fingerprint text,
  platform text,
  name text,
  last_ip inet,
  last_seen timestamptz not null default now(),
  first_seen timestamptz not null default now(),
  status text not null default 'active'
    check (status in ('active', 'blocked')),
  created_at timestamptz not null default now(),
  unique (license_id, device_id)
);

create table if not exists public.license_events (
  id bigint generated always as identity primary key,
  license_id uuid not null references public.licenses (id) on delete cascade,
  device_id text,
  event text not null,
  detail jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists license_events_license_idx
  on public.license_events (license_id, created_at desc);
create index if not exists devices_license_idx
  on public.devices (license_id, status);
create index if not exists licenses_status_idx
  on public.licenses (status);
create index if not exists licenses_key_idx
  on public.licenses (key);

alter table public.licenses enable row level security;
alter table public.devices enable row level security;
alter table public.license_events enable row level security;

revoke all on table public.licenses, public.devices, public.license_events from anon;
revoke all on table public.licenses, public.devices, public.license_events from authenticated;
grant select, insert, update, delete on table public.licenses, public.devices, public.license_events to authenticated;
grant usage on sequence public.license_events_id_seq to authenticated;

drop policy if exists "licenses_admin_all" on public.licenses;
create policy "licenses_admin_all"
  on public.licenses for all
  using (public.is_admin());

drop policy if exists "devices_admin_all" on public.devices;
create policy "devices_admin_all"
  on public.devices for all
  using (public.is_admin());

drop policy if exists "license_events_admin_all" on public.license_events;
create policy "license_events_admin_all"
  on public.license_events for all
  using (public.is_admin());

create or replace function public.expire_licenses()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  with updated as (
    update public.licenses
       set status = 'expired', updated_at = now()
     where status = 'active'
       and plan <> 'onetime'
       and expires_at is not null
       and expires_at < now()
     returning id
  )
  insert into public.license_events (license_id, event, detail)
    select id, 'expired', '{}'::jsonb from updated;
  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function public.gen_license_key()
returns text
language plpgsql
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  block text;
  out_key text := 'OX1';
begin
  for b in 1..4 loop
    block := '';
    for i in 1..4 loop
      block := block || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    out_key := out_key || '-' || block;
  end loop;
  return out_key;
end;
$$;

-- Offline tokens (03_offline_tokens.sql): tokens Ed25519 firmados
-- desde el panel; revocables y con vencimiento corto.
create table if not exists public.offline_tokens (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses (id) on delete cascade,
  device_id text not null,
  token jsonb not null,
  sig text not null unique,
  expires_at timestamptz not null,
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  created_at timestamptz not null default now()
);

alter table public.offline_tokens enable row level security;
revoke all on table public.offline_tokens from anon;
revoke all on table public.offline_tokens from authenticated;
grant select, insert, update, delete on table public.offline_tokens to authenticated;

drop policy if exists "offline_tokens_admin_all" on public.offline_tokens;
create policy "offline_tokens_admin_all"
  on public.offline_tokens for all
  using (public.is_admin());

create index if not exists offline_tokens_license_idx
  on public.offline_tokens (license_id, created_at desc);
create index if not exists offline_tokens_sig_idx
  on public.offline_tokens (sig);

-- =============================================================
-- FIN. Verificación rápida:
--   select * from public.apps order by created_at;   -- 5 apps
--   select proname from pg_proc where proname ~ 'recover|license|gen_key';
--   (*count('public'), count(*) should include the new functions*)
-- =============================================================
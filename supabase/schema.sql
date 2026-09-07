-- =============================================================
-- My Services Panel — Supabase schema
-- Run in: Supabase Dashboard > SQL Editor
-- Order: this file, then seed.sql (optional demo apps)
-- =============================================================

-- Grants (roles anon/authenticated access public schema)
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- -------------------------------------------------------------
-- Helper: is the current user an admin? (checks profiles.role)
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- profiles (one row per auth user; role admin/staff)
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Own profile only: previously ANY authenticated user could SELECT every
-- profile row (leaked names/roles of all users). Now each user sees only
-- their own row.
drop policy if exists "profiles_select_authed" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- Auto-create a profile row whenever an auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- First user to sign up becomes admin; everyone else starts as staff.
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

-- -------------------------------------------------------------
-- apps (shared catalog; only admins can write)
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- clients (owned by each user)
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- sales (each sale = one app instance sold to one client, owned)
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- settings (one row per user; payment_methods = the payment
-- options you can assign to a project, expandable any time)
-- -------------------------------------------------------------
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

-- Defense in depth: strip ALL privileges on the panel tables from the
-- anonymous role. RLS already blocks anon reads/writes; this removes the
-- underlying grants so even an RLS mistake can't leak panel data.
-- (Va DESPUÉS de crear las tablas: revoke sobre una tabla inexistente
-- aborta el script en una base nueva.)
revoke all on table public.profiles, public.apps, public.clients, public.sales, public.settings from anon;
-- =============================================================
-- OX1 Dashboard — Master recovery key
-- Run AFTER schema.sql (supabase/schema.sql) and auth.sql.
--
-- A personal recovery key lets YOU regain access to the admin
-- account if you lose your password / authenticator app. The key
-- is stored hashed (bcrypt, salted); nobody — not even the DB — can
-- read it. Only the holder of the key can recover.
--
-- Set the key once from Settings > Account inside the panel
-- (it writes public.set_recovery_key). To recover, use
-- "Recover access" on the login screen.
-- =============================================================

-- 1. Column on profiles: the bcrypt hash of the recovery key.
alter table public.profiles
  add column if not exists recovery_key_hash text;

-- 2. Brute-force protection: per-email attempt log + lockout.
create table if not exists public.recovery_attempts (
  email        text primary key,
  failures     int not null default 0,
  last_fail    timestamptz not null default now(),
  locked_until timestamptz
);

-- Defense in depth: strip default grants (panel schema grants them
-- to anon/authenticated on every new table), then allow the RPCs
-- only. Direct reads/writes are blocked by RLS.
alter table public.recovery_attempts enable row level security;
revoke all on table public.recovery_attempts from anon, authenticated;
grant select on table public.recovery_attempts to authenticated;

drop policy if exists "recovery_attempts_rpc_only" on public.recovery_attempts;
create policy "recovery_attempts_rpc_only" on public.recovery_attempts
  for all using (public.is_admin());

-- 3. Helper: does the given key match the stored bcrypt hash?
create or replace function public.recovery_key_matches(p_hash text, p_key text)
returns boolean
language sql immutable
as $$
  select p_hash is not null and p_hash <> '' and p_hash = crypt(p_key, p_hash);
$$;

-- 4. RPC: set / change your OWN recovery key (authenticated only).
--    Returns true on success. Raise 'key_too_short' if < 12 chars.
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

-- 5. RPC: has the current user configured a recovery key yet?
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

-- 6. RPC: recover access. Looks up the profile by email (longin
--    address), verifies the recovery key (bcrypt) and, if correct,
--    resets the Supabase Auth password to the new one.
--
--    Can be called BEFORE signing in, so the anon role may execute
--    it. Safe because the key is required AND attempts are
--    rate-limited (5 fails -> 15 min lockout).
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

  -- Find the profile + its recovery hash by email, plus the lock.
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

  -- Lockout active?
  if v_lock is not null and v_lock > now() then
    raise exception 'locked_out';
  end if;

  -- Wrong key -> count the failure and lock after 5 attempts.
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

  -- Good key: reset the password and clear the failure log.
  update auth.users
     set encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
         updated_at = now()
   where id = v_uid;

  delete from public.recovery_attempts where lower(email) = lower(p_email);

  return true;
end;
$$;

-- 7. Grants
revoke all on function public.recovery_key_matches(text, text) from public;
revoke all on function public.set_recovery_key(text) from public;
revoke all on function public.has_recovery_key() from public;
revoke all on function public.recover_account(text, text, text) from public;

grant execute on function public.set_recovery_key(text) to authenticated;
grant execute on function public.has_recovery_key() to authenticated;
-- Recover must work for a locked-out user (before login):
grant execute on function public.recover_account(text, text, text) to anon, authenticated;
-- Internal helper: no direct external calls needed, but harmless
-- to leave for the panel to double-check status.
grant execute on function public.recovery_key_matches(text, text) to authenticated;
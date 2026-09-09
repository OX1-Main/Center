-- =============================================================
-- OX1 — 05. Credenciales del admin de tienda
-- -------------------------------------------------------------
-- Añade a public.stores el usuario + hash (SHA-256 hex) de la
-- contraseña del panel admin de cada tienda WhatShop, y la RPC
-- store_admin_login que valida usuario/contraseña contra el
-- registro CENTRAL y el estado online (pago / registro).
-- El hash lo calcula el cliente (misma función hashPin del store).
-- Idempotente. Aplicar vía SQL editor o Management API.
-- =============================================================

alter table public.stores
  add column if not exists admin_user text,
  add column if not exists admin_pass_hash text;

-- Login del admin de tienda.
-- Devuelve:
--   ok     : credenciales correctas
--   online : true si la tienda paga/registrada y no bloqueada
--   status : active | blocked | expired | unregistered | unauthorized
--   reason : motivo (bloqueo manual, tienda no registrada, ...)
--   name   : nombre de la tienda
create or replace function public.store_admin_login(
  p_ws_ref text,
  p_ws_store_id bigint,
  p_user text,
  p_pass_hash text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  st public.stores%rowtype;
  s  public.sales%rowtype;
  v_online boolean;
  v_status text;
  v_reason text;
begin
  select * into st
  from public.stores
  where ws_ref = p_ws_ref
    and ws_store_id = p_ws_store_id
  order by created_at desc
  limit 1;

  if not found or st.id is null then
    return json_build_object(
      'ok', false, 'online', false, 'status', 'unregistered',
      'reason', 'Tienda no registrada', 'name', '');
  end if;

  if st.admin_user is null or st.admin_pass_hash is null
     or p_user is null or p_pass_hash is null
     or st.admin_user <> p_user
     or st.admin_pass_hash <> p_pass_hash
  then
    return json_build_object(
      'ok', false, 'online', false, 'status', 'unauthorized',
      'reason', 'Usuario o contraseña incorrectos', 'name', st.name);
  end if;

  select * into s from public.sales where id = st.sale_id;

  v_online := (st.status = 'active')
    and (s.id is null or s.status is distinct from 'suspended')
    and case when s.id is null or s.subscription_tier = 'free'
           then (s.id is null or s.trial_end is null or s.trial_end > now())
           else (s.grace_end is null or s.grace_end > now()) end;

  v_status := case
    when st.status = 'blocked' then 'blocked'
    when s.id is null then 'unregistered'
    when s.status = 'suspended' then 'blocked'
    when s.subscription_tier = 'free'
       and s.trial_end is not null and s.trial_end <= now() then 'expired'
    when s.grace_end is not null and s.grace_end <= now() then 'expired'
    else 'active' end;

  v_reason := coalesce(st.blocked_reason, '');

  return json_build_object(
    'ok', true, 'online', v_online, 'status', v_status,
    'reason', v_reason, 'name', st.name,
    'tier', coalesce(s.subscription_tier, 'free'));
end;
$$;

revoke all on function public.store_admin_login(text, bigint, text, text) from public;
grant execute on function public.store_admin_login(text, bigint, text, text) to anon, authenticated;
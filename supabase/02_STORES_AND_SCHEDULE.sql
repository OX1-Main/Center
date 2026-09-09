-- =============================================================
-- OX1 Dashboard CENTRAL — registro de tiendas WhatShop
-- + programación de pagos/suscripción.
-- Idempotente. Ejecutar DESPUÉS de 0_INSTALL_CENTRAL.sql
--
--   * sales: columnas de programación (paid_until, next_due,
--     grace_end = 7 días de prórroga, trial_end = 14 días free,
--     blocked_since, last_reminded_at).
--   * stores: registro de cada sucursal WhatShop (página GitHub,
--     BD whatshop compartida, store_id dentro de esa BD, venta
--     asociada, estado).
-- =============================================================

-- ---------- 1. Programación de cobros en sales ----------
alter table public.sales add column if not exists paid_until timestamptz;
alter table public.sales add column if not exists next_due timestamptz;
alter table public.sales add column if not exists grace_end timestamptz;
alter table public.sales add column if not exists trial_end timestamptz;
alter table public.sales add column if not exists blocked_since timestamptz;
alter table public.sales add column if not exists last_reminded_at timestamptz;

-- ---------- 2. Registro de tiendas ----------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  gh_page text,
  ws_ref text,
  ws_url text,
  ws_store_id bigint,
  sale_id uuid references public.sales (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'blocked', 'expired')),
  blocked_reason text,
  created_at timestamptz not null default now()
);

alter table public.stores enable row level security;
revoke all on table public.stores from anon;

drop policy if exists "stores_select_own" on public.stores;
create policy "stores_select_own"
  on public.stores for select
  using (auth.uid() = user_id);

drop policy if exists "stores_insert_own" on public.stores;
create policy "stores_insert_own"
  on public.stores for insert
  with check (auth.uid() = user_id);

drop policy if exists "stores_update_own" on public.stores;
create policy "stores_update_own"
  on public.stores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "stores_delete_own" on public.stores;
create policy "stores_delete_own"
  on public.stores for delete
  using (auth.uid() = user_id);

-- ---------- 3. Festo de cobro calculado por venta ----------
-- Devuelve: pending | paid | grace | expired
--   pending : falta cobrar el periodo actual
--   paid    : al día
--   grace   : vencida dentro de los 7 días de prórroga
--   expired : fuera de prórroga -> bloqueo automático
create or replace function public.sale_payment_state(s public.sales)
returns text
language sql
stable
as $$
  select case
    when s.status = 'suspended' then 'blocked'
    when s.payment_status = 'paid' and (s.grace_end is null or s.grace_end > now()) then 'paid'
    when s.grace_end is not null and s.grace_end <= now() then 'expired'
    when s.next_due is not null and s.next_due <= now() and s.grace_end > now() then 'grace'
    when s.payment_status = 'pending' and s.next_due is not null and s.next_due <= now() then 'grace'
    else 'pending'
  end;
$$;

grant execute on function public.sale_payment_state(public.sales) to authenticated;

-- ---------- 4. Estado público de una tienda (lectura por el gate) ----------
-- La página de la tienda (ox1-gate.js) llama a ESTA función con su
-- ws_ref + ws_store_id (config.js de su repositorio) y recibe si debe
-- seguir online o bloquearse. Así el bloqueo desde el dashboard es
-- INMEDIATO (sin esperar sincronizaciones/edge functions).
--
-- Devuelve:
--   online  : false si la tienda está bloqueada/manualmente, expirada
--             (fuera de prórroga), en trial free vencido o sin registrar.
--   status  : active | blocked | expired | unregistered
--   tier    : free | basico | profesional | empresarial
--   trial_end / grace_end / next_due : referencias de tiempo (para avisos)
--   reason  : motivo de bloqueo manual, si existe.
create or replace function public.store_status(p_ws_ref text, p_ws_store_id bigint)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v json;
begin
  select json_build_object(
    'online',
      (st.status = 'active')
      and (s.status is distinct from 'suspended')
      and case when s.subscription_tier = 'free'
             then (s.trial_end is null or s.trial_end > now())
             else (s.grace_end is null or s.grace_end > now()) end,
    'status', case
      when st.status = 'blocked' then 'blocked'
      when s.status = 'suspended' then 'blocked'
      when s.subscription_tier = 'free'
         and s.trial_end is not null and s.trial_end <= now() then 'expired'
      when s.grace_end is not null and s.grace_end <= now() then 'expired'
      else 'active' end,
    'tier', coalesce(s.subscription_tier, 'free'),
    'plan', coalesce(s.plan, 'monthly'),
    'next_due', s.next_due,
    'grace_end', s.grace_end,
    'trial_end', s.trial_end,
    'reason', coalesce(st.blocked_reason, ''),
    'name', st.name
  )
  into v
  from public.stores st
  left join public.sales s on s.id = st.sale_id
  where st.ws_ref = p_ws_ref
    and st.ws_store_id = p_ws_store_id
  order by st.created_at desc
  limit 1;
  return coalesce(v, json_build_object(
    'online', false, 'status', 'unregistered', 'tier', 'free',
    'plan', 'monthly', 'next_due', null, 'grace_end', null,
    'trial_end', null, 'reason', 'Tienda no registrada', 'name', ''
  ));
end;
$$;

revoke all on function public.store_status(text, bigint) from public;
grant execute on function public.store_status(text, bigint) to anon, authenticated;
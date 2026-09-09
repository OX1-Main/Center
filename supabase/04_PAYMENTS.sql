-- =============================================================
-- OX1 — 04. Pagos adelantados (ledger de cada suscripción)
-- -------------------------------------------------------------
-- Permite registrar pagos de N meses por adelantado (ej. cliente
-- paga 2 meses) y acumularlos: cada pago avanza paid_until /
-- next_due sobre el período ya pagado, y grace_end = +7 días.
-- Idempotente. Aplicar vía SQL editor o Management API.
-- =============================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sale_id uuid not null references public.sales (id) on delete cascade,
  months integer not null default 1 check (months between 1 and 60),
  method text not null default '—',
  note text,
  paid_at timestamptz not null default now()
);

alter table public.payments enable row level security;
revoke all on table public.payments from anon;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = user_id);

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments for insert
  with check (auth.uid() = user_id);

drop policy if exists "payments_delete_own" on public.payments;
create policy "payments_delete_own"
  on public.payments for delete
  using (auth.uid() = user_id);
-- =============================================================
-- OX1 — 03. Registro de aplicaciones: sucursales por cliente
-- -------------------------------------------------------------
-- Extiende public.stores para el "registro de la aplicación":
--  - a qué aplicación corresponde (public.apps: WhatShop, futuro...)
--  - plataforma de la instalación: web / android / pc
-- El bloqueo se hace por sucursal (gh_page + ws_ref + ws_store_id)
-- y su venta/suscripción vinculada (sales -> subscription).
-- Idempotente. Aplicar vía SQL editor o Management API.
-- =============================================================

alter table public.stores
  add column if not exists app_id uuid references public.apps (id) on delete set null,
  add column if not exists platform text not null default 'web'
    check (platform in ('web', 'android', 'pc'));
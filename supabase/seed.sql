-- =============================================================
-- My Services Panel — seed (global app catalog)
-- Run AFTER schema.sql. Only inserts the shared app templates.
-- No clients/projects/sales are seeded: the panel starts empty.
-- Payment options live in each user's settings and can be added
-- from Settings > Payment options.
-- =============================================================

insert into public.apps (name, type, version) values
  ('Retail Store App',  'Web app',      'v3.2'),
  ('Inventory Manager', 'SaaS',         'v5.0'),
  ('Point of Sale',     'Desktop app',  'v2.4'),
  ('Booking Widget',    'Web widget',   'v1.8')
on conflict do nothing;
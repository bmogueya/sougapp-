-- =============================================================================
-- 06_products_schema.sql
-- Table des produits (catalogue de chaque marchand).
-- Remplace les produits "mockés" en dur dans l'app mobile.
-- Nécessite public.is_admin() (défini dans 05_security_hardening.sql).
-- =============================================================================

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null default 0.00,
  image_url text,
  is_available boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_products_merchant on public.products (merchant_id);

alter table public.products enable row level security;

-- -----------------------------------------------------------------------------
-- Policies (idempotentes)
-- -----------------------------------------------------------------------------
drop policy if exists "products_public_read"     on public.products;
drop policy if exists "products_owner_manage"    on public.products;
drop policy if exists "products_admin_all"       on public.products;

-- Lecture publique : produits disponibles d'un marchand actif.
create policy "products_public_read" on public.products
  for select using (
    is_available = true
    and merchant_id in (select id from public.merchants where status = 'active')
  );

-- Le marchand gère le catalogue de SES boutiques.
create policy "products_owner_manage" on public.products
  for all using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  ) with check (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

-- Admin / dispatcher : accès total.
create policy "products_admin_all" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- SEED (optionnel) : donne un catalogue de démo à chaque marchand ACTIF
-- qui n'a encore aucun produit, pour que l'app soit utilisable immédiatement.
-- Ré-exécutable sans doublon grâce au WHERE NOT EXISTS.
-- -----------------------------------------------------------------------------
insert into public.products (merchant_id, name, description, price)
select m.id, p.name, p.description, p.price
from public.merchants m
cross join (values
  ('Burger Classique',      'Steak haché, salade, tomate, oignon, sauce maison', 150.00),
  ('Burger Double Cheese',  'Double steak, double fromage, bacon',               220.00),
  ('Frites Maison',         'Pommes de terre fraîches coupées à la main',         50.00),
  ('Pizza Margherita',      'Sauce tomate, mozzarella, basilic frais',           250.00),
  ('Tacos Viande Hachée',   'Viande hachée, frites, sauce fromagère',            180.00),
  ('Coca-Cola 33cl',        'Boisson rafraîchissante',                            30.00)
) as p(name, description, price)
where m.status = 'active'
  and not exists (select 1 from public.products x where x.merchant_id = m.id);

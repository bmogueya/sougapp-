-- =============================================================================
-- 11_products_schema.sql
-- Tables pour le catalogue des produits et les catégories (Merchant Panel)
-- =============================================================================

-- 1. Table CATEGORIES
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text,
  module_id text references public.modules(id), -- Chaque catégorie appartient à un module (ex: Fast Food)
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Tout le monde peut lire les categories actives" on public.categories
  for select using (is_active = true);

create policy "Admins et marchands peuvent tout faire sur les categories" on public.categories
  for all using (public.is_admin() or auth.uid() in (select id from public.profiles where role = 'merchant'));


-- 2. Table PRODUCTS
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references auth.users(id) not null, -- Le marchand propriétaire
  category_id uuid references public.categories(id) not null,
  module_id text references public.modules(id) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  discount_price decimal(10,2),
  image_url text,
  in_stock boolean not null default true,
  stock_quantity integer default -1, -- -1 = illimité
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

-- L'app client peut lire les produits actifs
create policy "Tout le monde peut lire les produits actifs" on public.products
  for select using (is_active = true);

-- Un marchand peut lire, modifier, insérer et supprimer SES propres produits
create policy "Le marchand gere ses propres produits" on public.products
  for all using (auth.uid() = merchant_id) with check (auth.uid() = merchant_id);

-- Un admin peut lire et modifier tous les produits
create policy "Admin peut gerer tous les produits" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

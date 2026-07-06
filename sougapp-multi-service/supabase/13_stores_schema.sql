-- =============================================================================
-- 13_stores_schema.sql
-- Table pour la gestion des Boutiques / Restaurants (Merchant Stores)
-- =============================================================================

create table if not exists public.stores (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) not null, -- Le profil (merchant) propriétaire
  module_id text references public.modules(id) not null, -- Ex: Food, Pharmacy
  name text not null,
  description text,
  logo_url text,
  cover_url text,
  address text,
  latitude double precision,
  longitude double precision,
  phone text,
  is_open boolean not null default true,
  opening_time time,
  closing_time time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: En production, un marchand pourrait avoir plusieurs magasins,
-- mais pour commencer, nous associerons un owner_id = un magasin unique
create unique index idx_stores_owner_id on public.stores(owner_id);

alter table public.stores enable row level security;

-- L'app client peut lire tous les magasins ouverts et actifs
create policy "Tout le monde peut lire les magasins" on public.stores
  for select using (true);

-- Le marchand peut gérer son magasin
create policy "Le marchand gere son magasin" on public.stores
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Les admins peuvent gérer tous les magasins
create policy "Admin gere tous les magasins" on public.stores
  for all using (public.is_admin()) with check (public.is_admin());

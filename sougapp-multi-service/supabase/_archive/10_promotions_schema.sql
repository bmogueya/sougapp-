-- =============================================================================
-- 10_promotions_schema.sql
-- Tables pour le système de Promotions (Bannières & Coupons)
-- =============================================================================

-- 1. Table BANNERS
create table if not exists public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text not null,
  module_id text references public.modules(id), -- Peut être null si bannière globale
  is_active boolean not null default true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  link_url text, -- Lien externe ou interne (ex: /merchant/123)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.banners enable row level security;

-- L'app client peut lire les bannières actives
create policy "Tout le monde peut voir les bannières actives" on public.banners
  for select using (is_active = true and (start_date is null or start_date <= now()) and (end_date is null or end_date >= now()));

-- Super admin peut tout faire sur les bannières
create policy "Super admin peut tout faire sur les bannières" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());


-- 2. Table COUPONS
create type discount_type as enum ('amount', 'percentage');

create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type discount_type not null default 'percentage',
  discount_value decimal(10,2) not null,
  min_purchase decimal(10,2) default 0,
  max_discount decimal(10,2), -- Utile pour les pourcentages (ex: -50% jusqu'à max 1000 MRU)
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean not null default true,
  usage_limit integer, -- Nombre max d'utilisations au total
  used_count integer default 0,
  module_id text references public.modules(id), -- Null si global
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coupons enable row level security;

-- L'app client peut lire les coupons actifs (utile pour valider un code)
create policy "Tout le monde peut lire les coupons" on public.coupons
  for select using (is_active = true);

-- Super admin peut tout faire sur les coupons
create policy "Super admin peut tout faire sur les coupons" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

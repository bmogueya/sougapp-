-- =============================================================================
-- 00_canonical_schema.sql  —  SCHÉMA CANONIQUE UNIQUE de SougApp
-- =============================================================================
-- Ce fichier est LA source de vérité du schéma. Il a été régénéré à partir des
-- requêtes réelles du code de l'application (src/**), pas des anciens fichiers
-- de migration, car ceux-ci (01→13) avaient divergé sur 3 générations et ne
-- correspondaient plus au code (modèle `merchants` obsolète, `orders.store_id`
-- absent, `products`/`orders` incompatibles, policies `USING (true)`).
--
-- ➤ Il REMPLACE : schema.sql, 01→13, _apply_hardening_bundle.sql
--   (archivez-les dans supabase/_archive/ pour éviter toute confusion).
--
-- Propriétés :
--   • IDEMPOTENT   : ré-exécutable sans erreur (IF NOT EXISTS / DROP … IF EXISTS
--                    / gardes DO pour les types / ON CONFLICT pour les seeds).
--   • SUPERSET     : quand le code interroge une table de deux façons
--                    (ex: products.merchant_id ET products.store_id), les DEUX
--                    colonnes existent pour ne rien casser. Voir "DETTE" en bas.
--   • SÉCURISÉ     : plus aucune policy `USING (true)`. Accès par rôle réel
--                    via les helpers SECURITY DEFINER get_my_role()/is_admin().
--
-- À exécuter dans le SQL Editor du projet Supabase SougApp
-- (lhmgzyjfstpzwtxsqiit) en une seule fois.
-- =============================================================================

-- 0. Extension pour uuid_generate_v4()
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. TYPES (enums) — gardés idempotents via bloc DO
-- =============================================================================
do $$ begin
  create type user_role as enum ('super_admin', 'dispatcher', 'merchant', 'driver', 'customer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('order_payment', 'commission', 'payout', 'refund', 'deposit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_status as enum ('pending', 'completed', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('amount', 'percentage');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- 2. PROFILES (extension de auth.users)
-- =============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role user_role not null default 'customer',
  first_name text,
  last_name text,
  phone text unique,
  avatar_url text,
  zone_id integer,   -- zone d'affectation (livreurs) ; lu par Drivers.tsx
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
-- si la table préexiste sans la colonne
alter table public.profiles add column if not exists zone_id integer;
alter table public.profiles enable row level security;

-- -----------------------------------------------------------------------------
-- Helpers SECURITY DEFINER : contournent la RLS de profiles => pas de récursion.
-- -----------------------------------------------------------------------------
create or replace function public.get_my_role()
  returns text language sql security definer stable set search_path = public as $$
  select role::text from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
  returns boolean language sql security definer stable set search_path = public as $$
  select coalesce(
    (select role in ('super_admin', 'dispatcher') from public.profiles where id = auth.uid()),
    false);
$$;

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

drop policy if exists profiles_admin_all   on public.profiles;
drop policy if exists profiles_select_own  on public.profiles;
drop policy if exists profiles_update_own  on public.profiles;
create policy profiles_admin_all  on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- =============================================================================
-- 3. ZONES  (id = serial, le code utilise id:number)
-- =============================================================================
create table if not exists public.zones (
  id serial primary key,
  name text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.zones enable row level security;

drop policy if exists zones_public_read on public.zones;
drop policy if exists zones_admin_all   on public.zones;
create policy zones_public_read on public.zones for select using (status = 'active');
create policy zones_admin_all   on public.zones for all
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- 4. MODULES  (id = text : 'food', 'grocery', …)
-- =============================================================================
create table if not exists public.modules (
  id text primary key,
  name text not null,
  description text,
  is_active boolean not null default false,
  icon_name text,
  theme_color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.modules enable row level security;

drop policy if exists modules_public_read on public.modules;
drop policy if exists modules_admin_all   on public.modules;
create policy modules_public_read on public.modules for select using (is_active = true);
create policy modules_admin_all   on public.modules for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.modules (id, name, description, is_active, icon_name, theme_color) values
  ('food',     'Food Delivery',    'Livraison de repas depuis les restaurants', true,  'Utensils',     'bg-orange-500'),
  ('grocery',  'Grocery',          'Épicerie et supermarchés',                  true,  'ShoppingBag',  'bg-green-500'),
  ('pharmacy', 'Pharmacy',         'Produits pharmaceutiques et parapharmacie', true,  'Pill',         'bg-blue-500'),
  ('parcel',   'Parcel Delivery',  'Livraison de colis de point A à B',         false, 'Package',      'bg-purple-500'),
  ('taxi',     'Taxi & Transport', 'Réservation de VTC et taxis',               false, 'CarFront',     'bg-yellow-500'),
  ('booking',  'Booking',          'Réservation de services et professionnels', false, 'CalendarDays', 'bg-indigo-500')
on conflict (id) do nothing;

-- =============================================================================
-- 5. STORES  (boutiques / restaurants — remplace l'ancienne table `merchants`)
--    owner_id -> profiles(id)  (la contrainte se nomme stores_owner_id_fkey,
--    requise par la jointure `profiles!stores_owner_id_fkey` de Merchants.tsx).
-- =============================================================================
create table if not exists public.stores (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  module_id text references public.modules(id),
  name text not null,
  description text,
  logo text,           -- le code lit `logo` (Search.tsx, client/Profile.tsx)
  cover_url text,
  address text,
  latitude double precision,
  longitude double precision,
  phone text,
  is_open boolean not null default true,
  opening_time time,
  closing_time time,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
-- un magasin par propriétaire (MerchantSettings suppose .single())
create unique index if not exists idx_stores_owner on public.stores (owner_id);
create index if not exists idx_stores_module on public.stores (module_id);
alter table public.stores enable row level security;

drop policy if exists stores_public_read   on public.stores;
drop policy if exists stores_owner_manage   on public.stores;
drop policy if exists stores_admin_all       on public.stores;
create policy stores_public_read on public.stores for select using (is_open = true);
create policy stores_owner_manage on public.stores for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy stores_admin_all on public.stores for all
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- 6. CATEGORIES  (superset : store_id + sort_order pour le client ;
--    module_id pour le panel marchand)
-- =============================================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.stores(id) on delete cascade,
  module_id text references public.modules(id),
  name text not null,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_categories_store on public.categories (store_id);
alter table public.categories enable row level security;

drop policy if exists categories_public_read     on public.categories;
drop policy if exists categories_merchant_manage on public.categories;
drop policy if exists categories_admin_all       on public.categories;
create policy categories_public_read on public.categories for select using (is_active = true);
-- Marchand : gère les catégories (le panel ne relie pas encore par store_id — voir DETTE)
create policy categories_merchant_manage on public.categories for all
  using (public.get_my_role() = 'merchant') with check (public.get_my_role() = 'merchant');
create policy categories_admin_all on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- 7. PRODUCTS  (superset : merchant_id [panel marchand] + store_id [client])
-- =============================================================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.stores(id) on delete cascade,
  merchant_id uuid references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  module_id text references public.modules(id),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  discount_price numeric(10,2),
  image_url text,
  in_stock boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_products_store    on public.products (store_id);
create index if not exists idx_products_merchant on public.products (merchant_id);
create index if not exists idx_products_category on public.products (category_id);
alter table public.products enable row level security;

drop policy if exists products_public_read  on public.products;
drop policy if exists products_owner_manage  on public.products;
drop policy if exists products_admin_all      on public.products;
create policy products_public_read on public.products for select using (is_active = true);
-- Le marchand gère SES produits (le panel filtre merchant_id = auth.uid()).
create policy products_owner_manage on public.products for all
  using (merchant_id = auth.uid()) with check (merchant_id = auth.uid());
create policy products_admin_all on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- 8. ORDERS  (modèle `store_id` du code ; merchant_id conservé pour la page
--    admin Orders.tsx — voir DETTE. status = union de toutes les valeurs
--    utilisées dans le code.)
-- =============================================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  merchant_id uuid references public.profiles(id) on delete set null,
  driver_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in (
    'pending', 'accepted', 'preparing', 'ready', 'ready_for_delivery',
    'delivering', 'on_the_way', 'delivered', 'completed', 'cancelled', 'failed'
  )),
  total_amount numeric(12,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  delivery_address text,
  payment_method text not null default 'cash'
    check (payment_method in ('cash', 'bankily', 'sedad', 'masrivi')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_orders_customer on public.orders (customer_id);
create index if not exists idx_orders_store    on public.orders (store_id);
create index if not exists idx_orders_driver   on public.orders (driver_id);
create index if not exists idx_orders_status   on public.orders (status);
alter table public.orders enable row level security;

drop policy if exists orders_admin_all       on public.orders;
drop policy if exists orders_customer_select on public.orders;
drop policy if exists orders_customer_insert on public.orders;
drop policy if exists orders_store_select    on public.orders;
drop policy if exists orders_store_update    on public.orders;
drop policy if exists orders_driver_select   on public.orders;
drop policy if exists orders_driver_update   on public.orders;
create policy orders_admin_all on public.orders for all
  using (public.is_admin()) with check (public.is_admin());
create policy orders_customer_select on public.orders for select using (auth.uid() = customer_id);
create policy orders_customer_insert on public.orders for insert with check (auth.uid() = customer_id);
-- Marchand : commandes de SES boutiques
create policy orders_store_select on public.orders for select using (
  store_id in (select id from public.stores where owner_id = auth.uid()));
create policy orders_store_update on public.orders for update using (
  store_id in (select id from public.stores where owner_id = auth.uid())
) with check (
  store_id in (select id from public.stores where owner_id = auth.uid()));
-- Livreur : courses prêtes non assignées + les siennes
create policy orders_driver_select on public.orders for select using (
  public.get_my_role() = 'driver'
  and (driver_id = auth.uid() or (driver_id is null and status = 'ready_for_delivery')));
create policy orders_driver_update on public.orders for update using (
  public.get_my_role() = 'driver'
  and (driver_id = auth.uid() or (driver_id is null and status = 'ready_for_delivery'))
) with check (public.get_my_role() = 'driver' and driver_id = auth.uid());

-- =============================================================================
-- 9. ORDER_ITEMS  (pas encore utilisé par le front, inclus pour l'intégrité)
-- =============================================================================
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_order_items_order on public.order_items (order_id);
alter table public.order_items enable row level security;

drop policy if exists order_items_admin_all       on public.order_items;
drop policy if exists order_items_select_visible  on public.order_items;
drop policy if exists order_items_customer_insert  on public.order_items;
create policy order_items_admin_all on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());
-- Visible uniquement pour les commandes que la RLS de `orders` laisse voir.
create policy order_items_select_visible on public.order_items for select using (
  order_id in (select id from public.orders));
create policy order_items_customer_insert on public.order_items for insert with check (
  order_id in (select id from public.orders where customer_id = auth.uid()));

-- =============================================================================
-- 10. WALLETS + TRANSACTIONS  (portefeuilles MRU)
-- =============================================================================
create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade unique,
  balance numeric(12,2) not null default 0,
  currency text not null default 'MRU',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.wallets enable row level security;

drop policy if exists wallets_select_own on public.wallets;
drop policy if exists wallets_admin_all  on public.wallets;
create policy wallets_select_own on public.wallets for select using (profile_id = auth.uid());
create policy wallets_admin_all  on public.wallets for all
  using (public.is_admin()) with check (public.is_admin());

-- Portefeuille auto pour chaque nouveau profil
create or replace function public.handle_new_wallet()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.wallets (profile_id, balance) values (new.id, 0)
  on conflict (profile_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles for each row execute procedure public.handle_new_wallet();

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  amount numeric(12,2) not null,
  type transaction_type not null,
  status transaction_status not null default 'pending',
  reference_id uuid,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_transactions_wallet on public.transactions (wallet_id);
alter table public.transactions enable row level security;

drop policy if exists transactions_select_own on public.transactions;
drop policy if exists transactions_admin_all  on public.transactions;
create policy transactions_select_own on public.transactions for select using (
  wallet_id in (select id from public.wallets where profile_id = auth.uid()));
create policy transactions_admin_all on public.transactions for all
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- 11. PROMOTIONS : BANNERS + COUPONS
-- =============================================================================
create table if not exists public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text not null,
  module_id text references public.modules(id),
  is_active boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  link_url text,
  created_at timestamptz not null default timezone('utc', now())
);
alter table public.banners enable row level security;

drop policy if exists banners_public_read on public.banners;
drop policy if exists banners_admin_all   on public.banners;
create policy banners_public_read on public.banners for select using (
  is_active = true
  and (start_date is null or start_date <= now())
  and (end_date   is null or end_date   >= now()));
create policy banners_admin_all on public.banners for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type discount_type not null default 'percentage',
  discount_value numeric(10,2) not null,
  min_purchase numeric(10,2) default 0,
  max_discount numeric(10,2),
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  usage_limit integer,
  used_count integer not null default 0,
  module_id text references public.modules(id),
  created_at timestamptz not null default timezone('utc', now())
);
alter table public.coupons enable row level security;

drop policy if exists coupons_public_read on public.coupons;
drop policy if exists coupons_admin_all   on public.coupons;
create policy coupons_public_read on public.coupons for select using (is_active = true);
create policy coupons_admin_all on public.coupons for all
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- 12. REALTIME  (orders + stores) — idempotent
-- =============================================================================
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.stores;
exception when duplicate_object then null; end $$;

-- =============================================================================
-- FIN. Après exécution : vérifier avec les Security Advisors du dashboard.
-- =============================================================================

-- Migration : Base Scheme for SougApp (Utilisateurs & Marchands)

-- 1. Table Profiles (Extends auth.users)
create type user_role as enum ('super_admin', 'dispatcher', 'merchant', 'driver', 'customer');

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role user_role not null default 'customer',
  first_name text,
  last_name text,
  phone text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Super Admin can do everything
create policy "Super admins can do all on profiles" on public.profiles
  for all using (
    auth.uid() in (select id from public.profiles where role = 'super_admin')
  );

-- Users can read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);


-- 2. Table Merchants (Boutiques, Restaurants, etc.)
create table public.merchants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete restrict not null,
  name text not null,
  description text,
  logo_url text,
  cover_url text,
  address text,
  zone_id integer, -- To link to a Zone table later
  status text check (status in ('active', 'inactive', 'pending')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.merchants enable row level security;

-- Policies for merchants
create policy "Super admins can do all on merchants" on public.merchants
  for all using (
    auth.uid() in (select id from public.profiles where role = 'super_admin')
  );

create policy "Merchants can read their own store" on public.merchants
  for select using (owner_id = auth.uid());

-- Function to handle user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create a profile entry when a new auth.user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- 3. Table Zones (Nouakchott, Nouadhibou, etc.)
create table public.zones (
  id serial primary key,
  name text not null unique,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.zones enable row level security;

-- Policies for zones
create policy "Anyone can read active zones" on public.zones
  for select using (status = 'active');

create policy "Super admins can do all on zones" on public.zones
  for all using (
    auth.uid() in (select id from public.profiles where role = 'super_admin')
  );

-- Link Merchants to Zones (if not already done via the previous schema)
-- We can add a foreign key constraint to merchants if we alter it:
alter table public.merchants 
  add constraint fk_zone foreign key (zone_id) references public.zones (id) on delete set null;
-- 4. Cartographie et coordonnées
-- Ajout des colonnes de latitude et longitude à la table merchants

alter table public.merchants
  add column latitude numeric(10, 8),
  add column longitude numeric(11, 8);

-- Exemple de données (A titre illustratif, on peut mettre à jour les démos)
-- update public.merchants set latitude = 18.0735, longitude = -15.9582 where id = 1; -- Nouakchott
-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'ready', 'delivering', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_address TEXT,
    delivery_lat FLOAT,
    delivery_lng FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS)
-- Les clients peuvent voir et créer leurs propres commandes
CREATE POLICY "Les clients peuvent lire leurs commandes" 
ON public.orders FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Les clients peuvent créer des commandes" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Les marchands peuvent voir et modifier les commandes qui leur sont assignées
CREATE POLICY "Les marchands peuvent lire leurs commandes" 
ON public.orders FOR SELECT 
USING (true); -- Note: Dans un environnement de prod strict, on vérifierait le merchant_id lié au user actuel.

CREATE POLICY "Les marchands peuvent modifier leurs commandes" 
ON public.orders FOR UPDATE 
USING (true); 

-- Les livreurs peuvent voir toutes les commandes "ready" et celles qui leur sont assignées
CREATE POLICY "Les livreurs peuvent lire les commandes" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Les livreurs peuvent modifier les commandes (assignation)" 
ON public.orders FOR UPDATE 
USING (true);

-- Active le realtime sur la table orders
alter publication supabase_realtime add table public.orders;
-- Table pour stocker les produits d'une commande
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (simplifiées pour le MVP)
CREATE POLICY "Tout le monde peut lire les items de commande" 
ON public.order_items FOR SELECT 
USING (true);

CREATE POLICY "Les clients peuvent ajouter des items de commande" 
ON public.order_items FOR INSERT 
WITH CHECK (true);
-- =============================================================================
-- 05_security_hardening.sql
-- Durcissement de la sécurité (RLS) pour SougApp.
--
-- Corrige :
--   * la récursion infinie des policies "super_admin" (qui interrogeaient
--     public.profiles depuis une policy de public.profiles) ;
--   * les policies `USING (true)` sur orders / order_items qui laissaient
--     TOUT utilisateur authentifié lire et modifier TOUTES les commandes.
--
-- Script IDEMPOTENT : peut être ré-exécuté sans erreur (DROP IF EXISTS).
-- À lancer APRÈS schema.sql, 01, 02, 03, 04.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Fonctions helper (SECURITY DEFINER => contournent la RLS de profiles,
--    donc pas de récursion). `stable` + search_path figé pour la sécurité.
-- -----------------------------------------------------------------------------
create or replace function public.get_my_role()
  returns text
  language sql
  security definer
  stable
  set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public
as $$
  select coalesce(
    (select role in ('super_admin', 'dispatcher')
       from public.profiles where id = auth.uid()),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- 1. PROFILES
-- -----------------------------------------------------------------------------
drop policy if exists "Super admins can do all on profiles" on public.profiles;
drop policy if exists "Users can view own profile"          on public.profiles;
drop policy if exists "Users can update own profile"         on public.profiles;

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. MERCHANTS
-- -----------------------------------------------------------------------------
drop policy if exists "Super admins can do all on merchants" on public.merchants;
drop policy if exists "Merchants can read their own store"    on public.merchants;

create policy "merchants_admin_all" on public.merchants
  for all using (public.is_admin()) with check (public.is_admin());

-- Tout le monde peut consulter les marchands ACTIFS (vitrine client).
create policy "merchants_public_read_active" on public.merchants
  for select using (status = 'active');

-- Le propriétaire gère sa boutique.
create policy "merchants_owner_manage" on public.merchants
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 3. ZONES
-- -----------------------------------------------------------------------------
drop policy if exists "Anyone can read active zones"     on public.zones;
drop policy if exists "Super admins can do all on zones" on public.zones;

create policy "zones_public_read_active" on public.zones
  for select using (status = 'active');

create policy "zones_admin_all" on public.zones
  for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. ORDERS  (remplace les policies USING (true))
-- -----------------------------------------------------------------------------
drop policy if exists "Les clients peuvent lire leurs commandes"                     on public.orders;
drop policy if exists "Les clients peuvent créer des commandes"                      on public.orders;
drop policy if exists "Les marchands peuvent lire leurs commandes"                   on public.orders;
drop policy if exists "Les marchands peuvent modifier leurs commandes"               on public.orders;
drop policy if exists "Les livreurs peuvent lire les commandes"                      on public.orders;
drop policy if exists "Les livreurs peuvent modifier les commandes (assignation)"    on public.orders;

-- Admin / dispatcher : accès total.
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- Client : voit et crée uniquement SES commandes.
create policy "orders_customer_select" on public.orders
  for select using (auth.uid() = customer_id);

create policy "orders_customer_insert" on public.orders
  for insert with check (auth.uid() = customer_id);

-- Marchand : voit et met à jour les commandes de SES boutiques.
create policy "orders_merchant_select" on public.orders
  for select using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "orders_merchant_update" on public.orders
  for update using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  ) with check (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

-- Livreur : voit les courses prêtes non assignées + les siennes.
create policy "orders_driver_select" on public.orders
  for select using (
    public.get_my_role() = 'driver'
    and (driver_id = auth.uid() or (status = 'ready' and driver_id is null))
  );

-- Livreur : peut réclamer une course prête (en s'assignant) ou MAJ les siennes.
create policy "orders_driver_update" on public.orders
  for update using (
    public.get_my_role() = 'driver'
    and (driver_id = auth.uid() or (status = 'ready' and driver_id is null))
  ) with check (
    public.get_my_role() = 'driver'
    and driver_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- 5. ORDER_ITEMS  (visibilité alignée sur celle des commandes)
-- -----------------------------------------------------------------------------
drop policy if exists "Tout le monde peut lire les items de commande"  on public.order_items;
drop policy if exists "Les clients peuvent ajouter des items de commande" on public.order_items;

create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- On ne voit que les items des commandes qu'on a le droit de voir
-- (la sous-requête est elle-même filtrée par la RLS de public.orders).
create policy "order_items_select_visible" on public.order_items
  for select using (
    order_id in (select id from public.orders)
  );

-- Le client n'ajoute des items qu'à SES propres commandes.
create policy "order_items_customer_insert" on public.order_items
  for insert with check (
    order_id in (select id from public.orders where customer_id = auth.uid())
  );
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
-- =============================================================================
-- 07_orders_payment.sql
-- Ajoute le mode de paiement et les frais de livraison aux commandes.
--
-- NOTE : seul le paiement "cash" (à la livraison) est réglé automatiquement.
-- Les modes mobile-money (Bankily / Sedad / Masrivi) sont enregistrés comme
-- INTENTION de paiement ; l'intégration réelle des passerelles (initiation,
-- webhook signé, réconciliation) reste à faire et nécessite l'onboarding
-- provider. Voir l'agent "ahmedou-paiements".
-- =============================================================================

alter table public.orders
  add column if not exists payment_method text not null default 'cash'
    check (payment_method in ('cash', 'bankily', 'sedad', 'masrivi')),
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  add column if not exists delivery_fee decimal(10,2) not null default 0.00;
-- =============================================================================
-- 08_modules_schema.sql
-- Table pour la gestion dynamique des Modules (Food, Grocery, Taxi, etc.)
-- =============================================================================

create table if not exists public.modules (
  id text primary key,
  name text not null,
  description text,
  is_active boolean not null default false,
  icon_name text,
  theme_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.modules enable row level security;

-- -----------------------------------------------------------------------------
-- Policies
-- -----------------------------------------------------------------------------
drop policy if exists "Tout le monde peut voir les modules actifs" on public.modules;
drop policy if exists "Super admin peut tout faire sur les modules" on public.modules;

-- L'app client peut lire les modules actifs
create policy "Tout le monde peut voir les modules actifs" on public.modules
  for select using (is_active = true);

-- Seul le super admin peut configurer les modules (ajouter/modifier/désactiver)
create policy "Super admin peut tout faire sur les modules" on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- SEED INITIAL (Insertion des 6 modules de base s'ils n'existent pas)
-- -----------------------------------------------------------------------------
insert into public.modules (id, name, description, is_active, icon_name, theme_color)
values
  ('food', 'Food Delivery', 'Livraison de repas depuis les restaurants', true, 'Utensils', 'bg-orange-500'),
  ('grocery', 'Grocery', 'Épicerie et supermarchés', true, 'ShoppingBag', 'bg-green-500'),
  ('pharmacy', 'Pharmacy', 'Produits pharmaceutiques et parapharmacie', true, 'Pill', 'bg-blue-500'),
  ('parcel', 'Parcel Delivery', 'Livraison de colis de point A à B', false, 'Package', 'bg-purple-500'),
  ('taxi', 'Taxi & Transport', 'Réservation de VTC et taxis', false, 'CarFront', 'bg-yellow-500'),
  ('booking', 'Booking', 'Réservation de services et professionnels', false, 'CalendarDays', 'bg-indigo-500')
on conflict (id) do nothing;
-- =============================================================================
-- 09_finance_schema.sql
-- Tables pour le système de portefeuilles (Wallets) et Transactions
-- =============================================================================

create type transaction_type as enum ('order_payment', 'commission', 'payout', 'refund', 'deposit');
create type transaction_status as enum ('pending', 'completed', 'failed');

-- 1. Table WALLETS (Portefeuilles)
create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  balance decimal(12,2) not null default 0.00,
  currency text not null default 'MRU',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (profile_id)
);

alter table public.wallets enable row level security;

-- L'utilisateur peut voir son propre portefeuille
create policy "wallets_select_own" on public.wallets
  for select using (profile_id = auth.uid());

-- Super admin peut tout voir et gérer
create policy "wallets_admin_all" on public.wallets
  for all using (public.is_admin()) with check (public.is_admin());


-- 2. Table TRANSACTIONS (Historique financier)
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  amount decimal(12,2) not null,
  type transaction_type not null,
  status transaction_status not null default 'pending',
  reference_id uuid, -- Peut pointer vers un order_id ou être null
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

-- L'utilisateur peut voir ses propres transactions via son wallet
create policy "transactions_select_own" on public.transactions
  for select using (
    wallet_id in (select id from public.wallets where profile_id = auth.uid())
  );

-- Super admin peut tout voir et créer des payouts
create policy "transactions_admin_all" on public.transactions
  for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Fonction / Trigger : Création automatique d'un Wallet pour chaque nouveau profil
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_wallet() 
returns trigger as $$
begin
  insert into public.wallets (profile_id, balance)
  values (new.id, 0.00);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_wallet();
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
-- =============================================================================
-- 12_orders_schema.sql
-- Tables pour le cycle de vie des Commandes (Order Service)
-- =============================================================================

-- 1. Enumération des statuts de commande
create type order_status as enum (
  'pending',        -- En attente d'acceptation par le marchand
  'accepted',       -- Acceptée par le marchand
  'preparing',      -- En cours de préparation
  'ready',          -- Prête à être récupérée par le livreur
  'on_the_way',     -- Récupérée par le livreur, en route vers le client
  'delivered',      -- Livrée avec succès
  'cancelled',      -- Annulée
  'failed'          -- Échouée (ex: client absent)
);

-- 2. Table ORDERS
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references auth.users(id) not null,
  merchant_id uuid references auth.users(id) not null,
  driver_id uuid references auth.users(id), -- Peut être null si non assigné
  module_id text references public.modules(id) not null,
  
  status order_status not null default 'pending',
  
  -- Détails financiers
  subtotal decimal(12,2) not null,
  delivery_fee decimal(10,2) not null default 0,
  discount_amount decimal(10,2) not null default 0,
  total_amount decimal(12,2) not null,
  
  -- Adresses (simulées par du texte ou JSON pour l'instant)
  delivery_address text not null,
  delivery_latitude double precision,
  delivery_longitude double precision,
  
  -- Notes
  customer_note text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- Politiques de sécurité (RLS) pour Orders
create policy "Le client voit ses commandes" on public.orders
  for select using (auth.uid() = customer_id);

create policy "Le marchand voit et modifie les commandes de sa boutique" on public.orders
  for all using (auth.uid() = merchant_id) with check (auth.uid() = merchant_id);

create policy "Le livreur voit et modifie ses livraisons" on public.orders
  for all using (auth.uid() = driver_id) with check (auth.uid() = driver_id);

create policy "Admins voient toutes les commandes" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());


-- 3. Table ORDER_ITEMS (Le contenu du panier)
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  
  quantity integer not null check (quantity > 0),
  unit_price decimal(10,2) not null, -- Le prix au moment de l'achat
  total_price decimal(12,2) not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;

-- Politiques pour Order Items (Héritent logiciellement de la table Orders, mais on simplifie ici)
create policy "Les items de commande sont lisibles par les impliqués" on public.order_items
  for select using (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id 
      and (orders.customer_id = auth.uid() or orders.merchant_id = auth.uid() or orders.driver_id = auth.uid() or public.is_admin())
    )
  );

-- Seul le système (ou admin) devrait insérer des items, ou le client lors du checkout.
-- Pour simplifier, on laisse l'accès large aux impliqués.
create policy "Modifications items autorisées" on public.order_items
  for all using (true) with check (true);
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

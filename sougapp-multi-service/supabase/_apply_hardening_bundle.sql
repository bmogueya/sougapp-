-- =============================================================================
-- BUNDLE À EXÉCUTER — projet SougApp lhmgzyjfstpzwtxsqiit
-- Généré à partir de 05_security_hardening.sql + 06_products_schema.sql + 07_orders_payment.sql
-- PRÉREQUIS : schema.sql + 01_zones + 02_maps + 03_orders + 04_order_items déjà appliqués.
-- Idempotent : ré-exécutable sans erreur.
-- =============================================================================

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

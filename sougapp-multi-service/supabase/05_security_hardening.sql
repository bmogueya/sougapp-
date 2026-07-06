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

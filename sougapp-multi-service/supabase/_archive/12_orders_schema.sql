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

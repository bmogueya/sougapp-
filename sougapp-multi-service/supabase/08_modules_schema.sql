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

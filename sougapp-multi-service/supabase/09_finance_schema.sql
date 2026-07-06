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

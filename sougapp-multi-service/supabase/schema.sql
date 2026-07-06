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

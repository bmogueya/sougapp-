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

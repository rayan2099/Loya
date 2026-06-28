create extension if not exists pgcrypto;

do $$ begin
  create type public.business_type as enum ('coffee', 'restaurant', 'retail', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.reward_type as enum ('lottery_win', 'stamp_reward');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  logo_url text,
  primary_color text not null default '#0F0F0F',
  secondary_color text not null default '#D4AF37',
  business_type public.business_type not null default 'coffee',
  win_probability integer not null default 20 check (win_probability between 1 and 100),
  stamps_required integer not null default 5 check (stamps_required between 1 and 50),
  reward_ar text not null default 'مكافأة مجانية',
  reward_en text not null default 'Free Reward',
  cashier_pin_hash text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  phone text not null,
  name text not null,
  stamps integer not null default 0 check (stamps >= 0),
  total_scans integer not null default 0 check (total_scans >= 0),
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  won boolean not null,
  reward_claimed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  scan_id uuid not null references public.scans(id) on delete cascade,
  type public.reward_type not null,
  claimed boolean not null default false,
  claim_code text not null unique,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  check (claim_code ~ '^[WS][A-Z2-9]{5}$')
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists businesses_slug_idx on public.businesses(slug);
create index if not exists customers_business_phone_idx on public.customers(business_id, phone);
create index if not exists scans_business_created_idx on public.scans(business_id, created_at desc);
create index if not exists rewards_business_claimed_idx on public.rewards(business_id, claimed, created_at desc);
create index if not exists rewards_claim_code_idx on public.rewards(claim_code);

create or replace function public.generate_claim_code(prefix text)
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text := prefix;
  i integer;
begin
  for i in 1..5 loop
    candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;
  return candidate;
end;
$$;

alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.scans enable row level security;
alter table public.rewards enable row level security;

drop policy if exists "Owners can manage their businesses" on public.businesses;
create policy "Owners can manage their businesses"
on public.businesses
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Public can read active businesses by slug" on public.businesses;
create policy "Public can read active businesses by slug"
on public.businesses
for select
using (is_active = true);

drop policy if exists "Owners can read customers" on public.customers;
create policy "Owners can read customers"
on public.customers
for select
using (
  exists (
    select 1 from public.businesses b
    where b.id = customers.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can read scans" on public.scans;
create policy "Owners can read scans"
on public.scans
for select
using (
  exists (
    select 1 from public.businesses b
    where b.id = scans.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can manage rewards" on public.rewards;
create policy "Owners can manage rewards"
on public.rewards
for all
using (
  exists (
    select 1 from public.businesses b
    where b.id = rewards.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses b
    where b.id = rewards.business_id
      and b.owner_id = auth.uid()
  )
);

-- Customer scan writes should happen through a server endpoint or Edge Function
-- using the service role key. Do not expose direct anonymous inserts for scans,
-- customers, or rewards; win decisions must stay server-side.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  sku text not null,
  name text not null,
  category text,
  quantity integer not null default 0,
  reorder_point integer not null default 0,
  location text,
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  delta integer not null,
  reason text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.offline_sync_queue (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  operation jsonb not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.offline_sync_queue enable row level security;
alter table public.notification_subscriptions enable row level security;
alter table public.checkout_sessions enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "items_select_own" on public.items for select using (auth.uid() = owner_id);
create policy "items_insert_own" on public.items for insert with check (auth.uid() = owner_id);
create policy "items_update_own" on public.items for update using (auth.uid() = owner_id);
create policy "items_delete_own" on public.items for delete using (auth.uid() = owner_id);

create policy "stock_movements_select_own" on public.stock_movements for select using (auth.uid() = owner_id);
create policy "stock_movements_insert_own" on public.stock_movements for insert with check (auth.uid() = owner_id);

create policy "offline_sync_queue_select_own" on public.offline_sync_queue for select using (auth.uid() = owner_id);
create policy "offline_sync_queue_insert_own" on public.offline_sync_queue for insert with check (auth.uid() = owner_id);
create policy "offline_sync_queue_update_own" on public.offline_sync_queue for update using (auth.uid() = owner_id);

create policy "notification_subscriptions_select_own" on public.notification_subscriptions for select using (auth.uid() = owner_id);
create policy "notification_subscriptions_insert_own" on public.notification_subscriptions for insert with check (auth.uid() = owner_id);
create policy "notification_subscriptions_delete_own" on public.notification_subscriptions for delete using (auth.uid() = owner_id);

create policy "checkout_sessions_select_own" on public.checkout_sessions for select using (auth.uid() = owner_id);
create policy "checkout_sessions_insert_own" on public.checkout_sessions for insert with check (auth.uid() = owner_id);

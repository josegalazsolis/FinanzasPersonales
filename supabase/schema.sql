-- ============================================================
-- Finanzas Personales — Schema SQL (PRO-6)
-- Ejecutar completo en Supabase SQL Editor
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLAS
-- ============================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('cuenta_corriente', 'tarjeta_credito')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  color      text not null default '#6B7280',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.expenses (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  account_id         uuid not null references public.accounts(id) on delete cascade,
  category_id        uuid not null references public.categories(id),
  date               date not null,
  merchant           text not null,
  amount             numeric(14, 2) not null,
  currency           text not null check (currency in ('CLP', 'USD', 'EUR', 'JPY')),
  amount_clp         numeric(14, 2) not null,
  exchange_rate_used numeric(14, 6) not null default 1,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.exchange_rates (
  id            uuid primary key default uuid_generate_v4(),
  from_currency text not null,
  to_currency   text not null default 'CLP',
  rate          numeric(14, 6) not null,
  fetched_at    timestamptz not null default now()
);

-- ============================================================
-- TRIGGER: updated_at automático en expenses
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.expenses;
create trigger set_updated_at
  before update on public.expenses
  for each row execute function public.handle_updated_at();

-- ============================================================
-- FUNCIÓN: handle_new_user
-- Crea perfil y 8 categorías por defecto al registrar
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.categories (user_id, name, color) values
    (new.id, 'Alimentación',    '#EF4444'),
    (new.id, 'Transporte',      '#F97316'),
    (new.id, 'Vivienda',        '#EAB308'),
    (new.id, 'Salud',           '#22C55E'),
    (new.id, 'Entretenimiento', '#3B82F6'),
    (new.id, 'Ropa',            '#A855F7'),
    (new.id, 'Educación',       '#06B6D4'),
    (new.id, 'Otros',           '#6B7280');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.accounts      enable row level security;
alter table public.categories    enable row level security;
alter table public.expenses      enable row level security;
alter table public.exchange_rates enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- accounts
create policy "accounts_select_own" on public.accounts
  for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts
  for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts
  for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts
  for delete using (auth.uid() = user_id);

-- categories
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- expenses
create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

-- exchange_rates: lectura para todos los autenticados (la app escribe via API route)
create policy "exchange_rates_select" on public.exchange_rates
  for select using (auth.role() = 'authenticated');
create policy "exchange_rates_insert" on public.exchange_rates
  for insert with check (auth.role() = 'authenticated');

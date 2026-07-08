-- Money for Life — Supabase schema
-- Jalankan seluruh isi file ini di Supabase Dashboard > SQL Editor.

create extension if not exists "pgcrypto";

-- ========== CATEGORIES ==========
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#10B981',
  icon text not null default 'circle',
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- ========== TRANSACTIONS ==========
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- ========== BUDGETS ==========
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric(14, 2) not null check (amount >= 0),
  month date not null,
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- ========== DEFAULT CATEGORIES ON SIGNUP ==========
-- Otomatis membuat kategori dasar setiap kali user baru mendaftar,
-- supaya user langsung bisa mencatat transaksi tanpa setup manual.
create or replace function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, color, icon) values
    (new.id, 'Gaji', 'income', '#10B981', 'wallet'),
    (new.id, 'Bonus & Lainnya', 'income', '#059669', 'gift'),
    (new.id, 'Makanan & Minuman', 'expense', '#F59E0B', 'utensils'),
    (new.id, 'Transportasi', 'expense', '#3B82F6', 'car'),
    (new.id, 'Belanja', 'expense', '#EC4899', 'shopping-bag'),
    (new.id, 'Tagihan & Utilitas', 'expense', '#8B5CF6', 'receipt'),
    (new.id, 'Hiburan', 'expense', '#EF4444', 'popcorn'),
    (new.id, 'Kesehatan', 'expense', '#14B8A6', 'heart-pulse'),
    (new.id, 'Lainnya', 'expense', '#6B7280', 'more-horizontal');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute procedure public.handle_new_user_categories();

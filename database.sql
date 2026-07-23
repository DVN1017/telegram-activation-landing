-- Schema SQL pour la table des demandes d'activation
-- Utiliser cette table avec Supabase ou PostgreSQL standard.

create table public.activation_requests (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  fullname text,
  phone text,
  country text,
  email text,
  service text,
  price numeric,
  payment_reference text,
  payment_status text default 'pending',
  status text default 'waiting'
);

create index if not exists idx_activation_requests_status on public.activation_requests (status);
create index if not exists idx_activation_requests_payment_status on public.activation_requests (payment_status);
create index if not exists idx_activation_requests_order_number on public.activation_requests (order_number);

alter table public.activation_requests enable row level security;

drop policy if exists "anon_insert_activation_requests" on public.activation_requests;
create policy "anon_insert_activation_requests"
on public.activation_requests
for insert
to anon
with check (true);

drop policy if exists "anon_select_activation_requests" on public.activation_requests;
create policy "anon_select_activation_requests"
on public.activation_requests
for select
to anon
using (true);

drop policy if exists "anon_update_activation_requests" on public.activation_requests;
create policy "anon_update_activation_requests"
on public.activation_requests
for update
to anon
using (true)
with check (true);

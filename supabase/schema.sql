-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

-- Table holding each signature.
create table if not exists public.names (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 40),
  created_at timestamptz not null default now()
);

-- Row Level Security: locked down by default, opened selectively below.
alter table public.names enable row level security;

-- Anyone (including unauthenticated visitors) can read the wall.
create policy "Public read access"
  on public.names
  for select
  to anon
  using (true);

-- Anyone (including unauthenticated visitors) can sign the wall.
create policy "Public insert access"
  on public.names
  for insert
  to anon
  with check (true);

-- Broadcast new rows over Supabase Realtime so every open tab updates
-- instantly, with no polling or refresh.
alter publication supabase_realtime add table public.names;

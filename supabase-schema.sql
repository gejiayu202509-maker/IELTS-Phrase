-- IELTS Phrase v6 · Supabase schema
-- Run this whole file once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mastered_phrases (
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase_key text not null,
  topic_id text not null,
  item_id integer not null,
  mastered_at timestamptz not null default now(),
  primary key (user_id, phrase_key)
);

create table if not exists public.test_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  completed_at timestamptz not null default now(),
  nickname_snapshot text,
  mode text not null check (mode in ('phrase','sentence')),
  modules text[] not null default '{}',
  module_ids text[] not null default '{}',
  correct_count integer not null check (correct_count >= 0),
  total_count integer not null check (total_count > 0),
  rate integer not null check (rate between 0 and 100),
  wrong_items jsonb not null default '[]'::jsonb,
  review_log jsonb not null default '[]'::jsonb,
  keep_forever boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists public.test_record_tombstones (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  deleted_at timestamptz not null default now(),
  primary key (user_id, client_id)
);

create index if not exists test_records_user_completed_idx
  on public.test_records (user_id, completed_at desc);
create index if not exists test_records_expiry_idx
  on public.test_records (expires_at)
  where keep_forever = false;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists test_records_set_updated_at on public.test_records;
create trigger test_records_set_updated_at
before update on public.test_records
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nickname)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), split_part(coalesce(new.email, 'student'), '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.mastered_phrases enable row level security;
alter table public.test_records enable row level security;
alter table public.test_record_tombstones enable row level security;

-- Re-running this file is safe: recreate policies cleanly.
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "mastered_select_own" on public.mastered_phrases;
drop policy if exists "mastered_insert_own" on public.mastered_phrases;
drop policy if exists "mastered_update_own" on public.mastered_phrases;
drop policy if exists "mastered_delete_own" on public.mastered_phrases;
drop policy if exists "tests_select_own" on public.test_records;
drop policy if exists "tests_insert_own" on public.test_records;
drop policy if exists "tests_update_own" on public.test_records;
drop policy if exists "tests_delete_own" on public.test_records;
drop policy if exists "test_tombstones_select_own" on public.test_record_tombstones;
drop policy if exists "test_tombstones_insert_own" on public.test_record_tombstones;
drop policy if exists "test_tombstones_update_own" on public.test_record_tombstones;
drop policy if exists "test_tombstones_delete_own" on public.test_record_tombstones;

create policy "profiles_select_own" on public.profiles
for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "mastered_select_own" on public.mastered_phrases
for select to authenticated using ((select auth.uid()) = user_id);
create policy "mastered_insert_own" on public.mastered_phrases
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "mastered_update_own" on public.mastered_phrases
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "mastered_delete_own" on public.mastered_phrases
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "tests_select_own" on public.test_records
for select to authenticated using ((select auth.uid()) = user_id);
create policy "tests_insert_own" on public.test_records
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tests_update_own" on public.test_records
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tests_delete_own" on public.test_records
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "test_tombstones_select_own" on public.test_record_tombstones
for select to authenticated using ((select auth.uid()) = user_id);
create policy "test_tombstones_insert_own" on public.test_record_tombstones
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "test_tombstones_update_own" on public.test_record_tombstones
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "test_tombstones_delete_own" on public.test_record_tombstones
for delete to authenticated using ((select auth.uid()) = user_id);


-- Least-privilege Data API grants. RLS still decides which rows are accessible.
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.mastered_phrases to authenticated;
grant select, insert, update, delete on public.test_records to authenticated;
grant select, insert, update, delete on public.test_record_tombstones to authenticated;

revoke all on public.profiles from anon;
revoke all on public.mastered_phrases from anon;
revoke all on public.test_records from anon;
revoke all on public.test_record_tombstones from anon;

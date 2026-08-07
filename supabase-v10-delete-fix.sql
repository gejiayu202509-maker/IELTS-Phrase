-- IELTS Phrase v10: durable cross-device history deletion
-- Run this once in Supabase > SQL Editor > New query > Run.

create table if not exists public.test_record_tombstones (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  deleted_at timestamptz not null default now(),
  primary key (user_id, client_id)
);

alter table public.test_record_tombstones enable row level security;

drop policy if exists "test_tombstones_select_own" on public.test_record_tombstones;
drop policy if exists "test_tombstones_insert_own" on public.test_record_tombstones;
drop policy if exists "test_tombstones_update_own" on public.test_record_tombstones;
drop policy if exists "test_tombstones_delete_own" on public.test_record_tombstones;

create policy "test_tombstones_select_own" on public.test_record_tombstones
for select to authenticated using ((select auth.uid()) = user_id);
create policy "test_tombstones_insert_own" on public.test_record_tombstones
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "test_tombstones_update_own" on public.test_record_tombstones
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "test_tombstones_delete_own" on public.test_record_tombstones
for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.test_record_tombstones to authenticated;
revoke all on public.test_record_tombstones from anon;

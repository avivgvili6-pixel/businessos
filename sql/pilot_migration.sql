-- ─────────────────────────────────────────────────────────────
-- Selano Pilot Migration · adds waitlist + cap system
-- Run this ONCE in Supabase SQL Editor.
-- Safe to re-run: everything is idempotent (if not exists / on conflict).
-- ─────────────────────────────────────────────────────────────

-- 1. Add pilot columns to profiles
alter table profiles add column if not exists status text default 'active' not null;
alter table profiles add column if not exists waitlist_position int;
alter table profiles add column if not exists waitlisted_at timestamptz;
alter table profiles add column if not exists released_at timestamptz;

create index if not exists profiles_status_idx on profiles(status);
create index if not exists profiles_waitlist_pos_idx on profiles(waitlist_position);

-- 2. Single-row pilot settings table (holds the cap)
create table if not exists pilot_settings (
  id int primary key default 1,
  active_cap int default 30 not null,
  updated_at timestamptz default now()
);

insert into pilot_settings (id, active_cap) values (1, 30)
on conflict (id) do nothing;

-- 3. Trigger: on new profile INSERT, decide active vs waitlisted atomically
create or replace function assign_pilot_status()
returns trigger
language plpgsql
security definer
as $$
declare
  current_active int;
  current_cap int;
  next_pos int;
begin
  -- Skip if status was explicitly set (e.g. admin inserting)
  if new.status is not null and new.status = 'active' and tg_op = 'INSERT' then
    -- allow explicit 'active' from admin — only auto-assign when default
    null;
  end if;

  select active_cap into current_cap from pilot_settings where id = 1;
  select count(*) into current_active from profiles where status = 'active';

  if current_active < current_cap then
    new.status := 'active';
    new.waitlist_position := null;
  else
    new.status := 'waitlisted';
    select coalesce(max(waitlist_position), 0) + 1 into next_pos from profiles
      where status = 'waitlisted';
    new.waitlist_position := next_pos;
    new.waitlisted_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists set_pilot_status on profiles;
create trigger set_pilot_status
  before insert on profiles
  for each row
  execute function assign_pilot_status();

-- 4. Convenient view for the admin dashboard
create or replace view pilot_stats as
select
  (select active_cap from pilot_settings where id = 1) as active_cap,
  (select count(*) from profiles where status = 'active') as active_count,
  (select count(*) from profiles where status = 'waitlisted') as waitlist_count;

-- 5. Grants so RLS-authenticated users can read pilot_settings + pilot_stats
grant select on pilot_settings to anon, authenticated;
grant select on pilot_stats to anon, authenticated;

-- Admin-only write to pilot_settings (relies on the existing admin policy pattern)
alter table pilot_settings enable row level security;
drop policy if exists "read pilot settings" on pilot_settings;
create policy "read pilot settings" on pilot_settings
  for select using (true);
drop policy if exists "admin writes pilot settings" on pilot_settings;
create policy "admin writes pilot settings" on pilot_settings
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- Done. To verify:
--   select * from pilot_stats;
-- Expected: active_cap=30, active_count=<current>, waitlist_count=0
-- ─────────────────────────────────────────────────────────────

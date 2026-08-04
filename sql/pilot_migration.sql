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
set search_path = public
as $$
declare
  current_active int;
  current_cap int;
  next_pos int;
begin
  -- FAIL-SAFE: any error here defaults to active so signup never breaks
  begin
    select active_cap into current_cap from pilot_settings where id = 1;
    if current_cap is null then current_cap := 30; end if;
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
  exception when others then
    new.status := 'active';
    new.waitlist_position := null;
  end;
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
-- pilot_settings is just config — no RLS needed (readable by everyone via grants)
alter table pilot_settings disable row level security;

-- ─────────────────────────────────────────────────────────────
-- Done. To verify:
--   select * from pilot_stats;
-- Expected: active_cap=30, active_count=<current>, waitlist_count=0
-- ─────────────────────────────────────────────────────────────

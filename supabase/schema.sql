-- =====================================================================
-- Holistic Fitness OS - Database Schema
-- Paste this ENTIRE file into Supabase SQL Editor and click Run.
-- Creates 14 tables + Row Level Security policies + storage bucket.
-- Safe to re-run: uses IF NOT EXISTS everywhere.
-- =====================================================================

-- ─── Extension helpers ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. PROFILES - extends auth.users with app-specific fields
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  age int,
  sex text default 'male',
  height_cm int default 175,
  weight_kg numeric default 75,
  activity text default 'moderate',
  experience text default 'בינוני',
  goal_key text default 'recomp',
  diet_key text default 'balanced',
  constraints text,
  one_rms jsonb default '{}'::jsonb,
  role text default 'member' check (role in ('member','coach','admin')),
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  is_admin boolean := (new.email = 'avivgvili6@gmail.com' or new.email = 'israelgrip@gmail.com');
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when is_admin then 'admin' else 'member' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 2. PLANS - active workout plan per user
-- =====================================================================
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  program_id text,
  split text,
  days int default 3,
  weeks int default 12,
  current_week int default 1,
  started_at timestamptz default now(),
  cycle int default 1,
  difficulty_by_week jsonb default '{}'::jsonb,
  sessions jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamptz default now()
);
create index if not exists plans_user_idx on public.plans(user_id);

-- =====================================================================
-- 3. WORKOUT_LOGS
-- =====================================================================
create table if not exists public.workout_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz default now(),
  session_name text,
  exercises jsonb default '[]'::jsonb,
  plan_id uuid references public.plans(id) on delete set null,
  plan_week int,
  created_at timestamptz default now()
);
create index if not exists workout_logs_user_idx on public.workout_logs(user_id, date desc);

-- =====================================================================
-- 4. MEAL_LOGS
-- =====================================================================
create table if not exists public.meal_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date default current_date,
  food_id text,
  name text,
  grams numeric,
  kcal numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  created_at timestamptz default now()
);
create index if not exists meal_logs_user_idx on public.meal_logs(user_id, date);

-- =====================================================================
-- 5. MOOD_CHECKINS
-- =====================================================================
create table if not exists public.mood_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz default now(),
  mood int,
  energy int,
  stress int,
  sleep_hours numeric,
  note text,
  created_at timestamptz default now()
);
create index if not exists mood_user_idx on public.mood_checkins(user_id, date desc);

-- =====================================================================
-- 6. HABITS
-- =====================================================================
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  streak int default 0,
  done_today boolean default false,
  last_done date,
  created_at timestamptz default now()
);
create index if not exists habits_user_idx on public.habits(user_id);

-- =====================================================================
-- 7. BLOOD_TESTS
-- =====================================================================
create table if not exists public.blood_tests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date default current_date,
  values jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists blood_user_idx on public.blood_tests(user_id, date desc);

-- =====================================================================
-- 8. CUSTOM_FOODS
-- =====================================================================
create table if not exists public.custom_foods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cat text,
  kcal numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  barcode text,
  created_at timestamptz default now()
);
create index if not exists foods_user_idx on public.custom_foods(user_id);

-- =====================================================================
-- 9. REHAB_PROGRAMS
-- =====================================================================
create table if not exists public.rehab_programs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null,
  started_at timestamptz default now(),
  pain_log jsonb default '[]'::jsonb,
  sessions jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
create index if not exists rehab_user_idx on public.rehab_programs(user_id);

-- =====================================================================
-- 10. MEASUREMENTS
-- =====================================================================
create table if not exists public.measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date default current_date,
  weight numeric,
  body_fat numeric,
  waist numeric,
  chest numeric,
  hips numeric,
  arms numeric,
  thighs numeric,
  note text,
  created_at timestamptz default now()
);
create index if not exists measurements_user_idx on public.measurements(user_id, date desc);

-- =====================================================================
-- 11. PROGRESS_PHOTOS - metadata; actual image lives in Storage
-- =====================================================================
create table if not exists public.progress_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz default now(),
  angle text check (angle in ('front','side','back')),
  storage_path text not null,
  note text,
  created_at timestamptz default now()
);
create index if not exists photos_user_idx on public.progress_photos(user_id, date desc);

-- =====================================================================
-- 12. PERSONAL_RECORDS
-- =====================================================================
create table if not exists public.personal_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null,
  weight numeric,
  reps int,
  date date default current_date,
  note text,
  created_at timestamptz default now()
);
create index if not exists pr_user_idx on public.personal_records(user_id, date desc);

-- =====================================================================
-- 13. GOALS
-- =====================================================================
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  kind text,
  direction text,
  metric jsonb default '{}'::jsonb,
  deadline_weeks int default 12,
  why text,
  barriers jsonb default '[]'::jsonb,
  weekly_actions jsonb default '[]'::jsonb,
  checkins jsonb default '[]'::jsonb,
  status text default 'active' check (status in ('active','archived','completed')),
  start_date timestamptz default now(),
  created_at timestamptz default now()
);
create index if not exists goals_user_idx on public.goals(user_id, status);

-- =====================================================================
-- 14. PERSONAL_TRAINING_REQUESTS - can be anonymous (user_id null)
-- =====================================================================
create table if not exists public.personal_training_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text not null,
  age int,
  level text,
  goals jsonb default '[]'::jsonb,
  injuries text,
  current_activity text,
  format text,
  frequency text,
  time_pref jsonb default '[]'::jsonb,
  why_now text,
  notes text,
  status text default 'new' check (status in ('new','contacted','scheduled','declined')),
  submitted_at timestamptz default now()
);
create index if not exists ptr_status_idx on public.personal_training_requests(status, submitted_at desc);

-- =====================================================================
-- HELPER FUNCTION: is_admin() for policies
-- =====================================================================
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- =====================================================================
-- ROW LEVEL SECURITY - enable on all tables
-- =====================================================================
alter table public.profiles                  enable row level security;
alter table public.plans                     enable row level security;
alter table public.workout_logs              enable row level security;
alter table public.meal_logs                 enable row level security;
alter table public.mood_checkins             enable row level security;
alter table public.habits                    enable row level security;
alter table public.blood_tests               enable row level security;
alter table public.custom_foods              enable row level security;
alter table public.rehab_programs            enable row level security;
alter table public.measurements              enable row level security;
alter table public.progress_photos           enable row level security;
alter table public.personal_records          enable row level security;
alter table public.goals                     enable row level security;
alter table public.personal_training_requests enable row level security;

-- ─── Generic policies: user owns their rows, admin sees all ──────────
-- profiles: user sees own + admin sees all; users can update own
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Reusable pattern for the rest of the tables (owner all + admin read)
do $$
declare tbl text;
begin
  for tbl in select unnest(array[
    'plans','workout_logs','meal_logs','mood_checkins','habits','blood_tests',
    'custom_foods','rehab_programs','measurements','progress_photos',
    'personal_records','goals'
  ]) loop
    execute format('drop policy if exists "%1$s_owner_all" on public.%1$s;', tbl);
    execute format('create policy "%1$s_owner_all" on public.%1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id);', tbl);
    execute format('drop policy if exists "%1$s_admin_read" on public.%1$s;', tbl);
    execute format('create policy "%1$s_admin_read" on public.%1$s for select using (public.is_admin());', tbl);
  end loop;
end$$;

-- personal_training_requests: anyone can INSERT (public form), owner/admin read
drop policy if exists "ptr_insert_anyone" on public.personal_training_requests;
create policy "ptr_insert_anyone" on public.personal_training_requests
  for insert with check (true);
drop policy if exists "ptr_read_owner_admin" on public.personal_training_requests;
create policy "ptr_read_owner_admin" on public.personal_training_requests
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "ptr_update_admin" on public.personal_training_requests;
create policy "ptr_update_admin" on public.personal_training_requests
  for update using (public.is_admin());

-- =====================================================================
-- STORAGE BUCKET for progress photos - private, owner+admin access
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

-- Storage policies: user uploads to their own folder (user_id/xxx.jpg)
drop policy if exists "photos_own_read" on storage.objects;
create policy "photos_own_read" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
drop policy if exists "photos_own_write" on storage.objects;
create policy "photos_own_write" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
drop policy if exists "photos_own_delete" on storage.objects;
create policy "photos_own_delete" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================================
-- DONE! Schema ready.
-- Next: create the admin user via Auth → Users → Add user with email
--   avivgvili6@gmail.com OR israelgrip@gmail.com
-- The trigger will auto-set role=admin for those emails.
-- =====================================================================

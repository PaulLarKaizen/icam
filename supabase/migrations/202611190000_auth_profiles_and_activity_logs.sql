-- ICAM Foundation: User Profiles (M01) & Server-Side Activity Logs (M13)

create extension if not exists "pgcrypto";

do $$ begin
  create type public.icam_role as enum (
    'student',
    'faculty',
    'custodian',
    'coordinator',
    'admin'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role public.icam_role not null default 'student',
  school_department text not null default 'SMLS',
  student_or_employee_id text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.user_profiles(id) on delete restrict,
  actor_role public.icam_role not null,
  module_code text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created_at
  on public.activity_logs (created_at desc);

alter table public.user_profiles enable row level security;
alter table public.activity_logs enable row level security;

create policy "Users can read own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Custodians coordinators and admins can read activity logs"
  on public.activity_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid()
        and up.is_active = true
        and up.role in ('custodian', 'coordinator', 'admin')
    )
  );
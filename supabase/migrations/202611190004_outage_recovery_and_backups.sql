-- ICAM MVP-2 (Issue #7): Outage Paper Recovery (M14) & Backup Snapshots (M15)
-- Excludes chemical OCR per docs/mvp-requirements.md

create table if not exists public.outage_recovery_logs (
  id uuid primary key default gen_random_uuid(),
  outage_reference text not null unique check (char_length(trim(outage_reference)) > 0),
  form_type text not null check (form_type in ('F-VPA-012', 'F-VPA-011 Rev.1')),
  incident_occurred_at timestamptz not null,
  borrower_name text not null default '',
  course_activity text not null default '',
  ocr_raw_text text not null default '',
  verified_summary text not null check (char_length(trim(verified_summary)) > 0),
  linked_requisition_id uuid references public.requisitions(id) on delete set null,
  human_verified boolean not null default false check (human_verified = true),
  reconciliation_status text not null default 'Reconciled' check (
    reconciliation_status in ('Reconciled', 'Needs Follow-up')
  ),
  recorded_by uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists idx_outage_recovery_created_at
  on public.outage_recovery_logs (created_at desc);

create table if not exists public.backup_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_code text not null unique default (
    'BKP-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4))
  ),
  snapshot_type text not null check (snapshot_type in ('export', 'restore_check')),
  table_counts jsonb not null default '{}'::jsonb,
  notes text not null default '',
  created_by uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists idx_backup_snapshots_created_at
  on public.backup_snapshots (created_at desc);

alter table public.outage_recovery_logs enable row level security;
alter table public.backup_snapshots enable row level security;

create policy "Custodians coordinators and admins can read outage recovery logs"
  on public.outage_recovery_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid()
        and up.is_active = true
        and up.role in ('custodian', 'coordinator', 'admin')
    )
  );

create policy "Admins can read backup snapshots"
  on public.backup_snapshots for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid()
        and up.is_active = true
        and up.role = 'admin'
    )
  );
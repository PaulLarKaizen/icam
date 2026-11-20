create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.icam_profiles (
  user_id uuid primary key references auth.users (id) on delete restrict,
  display_name text,
  account_status text not null default 'pending'
    check (account_status in ('pending', 'active', 'inactive')),
  activated_at timestamptz,
  activated_by uuid references public.icam_profiles (user_id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint icam_profiles_active_requires_activation
    check (account_status <> 'active' or activated_at is not null)
);

create table public.icam_roles (
  role_code text primary key,
  role_name text not null unique,
  description text not null,
  created_at timestamptz not null default pg_catalog.now()
);

create table public.icam_permissions (
  permission_code text primary key,
  description text not null,
  created_at timestamptz not null default pg_catalog.now()
);

create table public.icam_role_permissions (
  role_code text not null references public.icam_roles (role_code) on delete cascade,
  permission_code text not null references public.icam_permissions (permission_code) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  primary key (role_code, permission_code)
);

create table public.icam_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.icam_profiles (user_id) on delete restrict,
  role_code text not null references public.icam_roles (role_code) on delete restrict,
  assigned_by uuid references public.icam_profiles (user_id) on delete set null,
  assigned_at timestamptz not null default pg_catalog.now(),
  assignment_reason text not null check (pg_catalog.length(pg_catalog.btrim(assignment_reason)) > 0),
  revoked_by uuid references public.icam_profiles (user_id) on delete set null,
  revoked_at timestamptz,
  revocation_reason text,
  constraint icam_user_roles_revocation_consistency
    check (
      (revoked_at is null and revoked_by is null and revocation_reason is null)
      or
      (revoked_at is not null and revoked_by is not null)
    )
);

create unique index icam_user_roles_one_active_assignment
  on public.icam_user_roles (user_id, role_code)
  where revoked_at is null;

create index icam_user_roles_user_id_idx
  on public.icam_user_roles (user_id);

create index icam_user_roles_role_code_idx
  on public.icam_user_roles (role_code);

create or replace function private.is_active_icam_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.icam_profiles p
    where p.user_id = (select auth.uid())
      and p.account_status = 'active'
  );
$$;

create or replace function private.has_icam_permission(p_permission_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.icam_profiles p
    join public.icam_user_roles ur
      on ur.user_id = p.user_id
     and ur.revoked_at is null
    join public.icam_role_permissions rp
      on rp.role_code = ur.role_code
    where p.user_id = (select auth.uid())
      and p.account_status = 'active'
      and rp.permission_code = p_permission_code
  );
$$;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.icam_profiles (user_id, display_name, account_status)
  values (
    new.id,
    nullif(
      pg_catalog.coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name'
      ),
      ''
    ),
    'pending'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.is_active_icam_user() from public, anon;
revoke all on function private.has_icam_permission(text) from public, anon;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;

grant execute on function private.is_active_icam_user() to authenticated;
grant execute on function private.has_icam_permission(text) to authenticated;

create trigger on_auth_user_created_icam_profile
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create trigger set_icam_profiles_updated_at
  before update on public.icam_profiles
  for each row execute function private.set_updated_at();

insert into public.icam_roles (role_code, role_name, description) values
  ('student_borrower', 'Student / Borrower', 'Views permitted request status and retrieves assigned approved requests.'),
  ('faculty', 'Faculty', 'Submits advance requisitions and views relevant availability and request status.'),
  ('laboratory_custodian', 'Laboratory Custodian', 'Reviews requests, manages in-scope inventory, confirms physical issue and return, and reviews F-VPA-012 processing.'),
  ('program_laboratory_coordinator', 'Program / Laboratory Coordinator', 'Provides operational oversight and clarifies departmental procedures; custodian permissions require a separate explicit role assignment.'),
  ('icam_application_administrator', 'ICAM Application Administrator', 'Manages ICAM account activation, role assignments, configuration, and authorized application administration.'),
  ('designated_technical_administrator', 'Designated Technical Administrator', 'Manages deployment, protected exports, backup verification, and controlled restoration in a separate recovery environment.')
on conflict (role_code) do nothing;

insert into public.icam_permissions (permission_code, description) values
  ('requests.read_assigned', 'Read requests assigned to the authenticated student or borrower.'),
  ('qr.generate_assigned', 'Generate a retrieval QR for an assigned approved request.'),
  ('availability.read', 'Read system-recorded availability for in-scope resources.'),
  ('requisitions.create', 'Create faculty requisitions.'),
  ('requisitions.read_own', 'Read requisitions created by the authenticated faculty member.'),
  ('requisitions.cancel_own', 'Request cancellation of an own requisition subject to workflow rules.'),
  ('inventory.read', 'Read authorized in-scope inventory records.'),
  ('inventory.manage', 'Maintain authorized in-scope inventory records.'),
  ('inventory.adjust', 'Record reasoned and auditable inventory adjustments.'),
  ('requisitions.read_pending', 'Read requests awaiting custodian review.'),
  ('requisitions.review', 'Approve or reject requisitions.'),
  ('reservations.manage', 'Create, release, and reconcile approved reservations under workflow rules.'),
  ('qr.retrieve', 'Retrieve an approved request through its transaction QR.'),
  ('issuance.confirm', 'Confirm actual physical release after custodian verification.'),
  ('returns.inspect', 'Record full or partial returns and condition inspection.'),
  ('documents.fvpa012.generate', 'Generate and prepopulate F-VPA-012 from approved ICAM records.'),
  ('documents.fvpa012.scan', 'Link completed F-VPA-012 scans to their source transaction.'),
  ('documents.fvpa012.review', 'Review and correct OCR candidate fields from F-VPA-012.'),
  ('documents.fvpa012.reprint', 'Reprint an existing linked F-VPA-012 record.'),
  ('activity_logs.read_operational', 'Read Activity Logs for authorized operational oversight.'),
  ('reports.read_operational', 'Read authorized operational reports.'),
  ('recovery.paper_reconcile', 'Submit and reconcile authorized paper transactions after service restoration.'),
  ('oversight.read', 'Read coordinator-level operational oversight information.'),
  ('users.read', 'Read user profile and role-assignment information for administration.'),
  ('users.manage_activation', 'Activate or deactivate ICAM user profiles.'),
  ('users.assign_roles', 'Assign or revoke ordinary ICAM operational roles.'),
  ('users.assign_technical_roles', 'Assign or revoke the separately controlled technical-administrator role. Not granted by default.'),
  ('configuration.manage', 'Manage authorized ICAM application configuration.'),
  ('reference_data.manage', 'Manage approved application reference data.'),
  ('backups.export', 'Create protected database exports.'),
  ('backups.verify', 'Verify backup integrity and restoration evidence.'),
  ('backups.restore_separate_environment', 'Restore a database copy in a separate controlled recovery environment.'),
  ('deployment.manage', 'Manage protected deployment configuration.'),
  ('recovery.database_restore', 'Perform designated technical database-recovery operations.')
on conflict (permission_code) do nothing;

insert into public.icam_role_permissions (role_code, permission_code)
select 'student_borrower', permission_code
from public.icam_permissions
where permission_code in ('requests.read_assigned', 'qr.generate_assigned')
on conflict do nothing;

insert into public.icam_role_permissions (role_code, permission_code)
select 'faculty', permission_code
from public.icam_permissions
where permission_code in (
  'availability.read',
  'requisitions.create',
  'requisitions.read_own',
  'requisitions.cancel_own'
)
on conflict do nothing;

insert into public.icam_role_permissions (role_code, permission_code)
select 'laboratory_custodian', permission_code
from public.icam_permissions
where permission_code in (
  'inventory.read',
  'inventory.manage',
  'inventory.adjust',
  'requisitions.read_pending',
  'requisitions.review',
  'reservations.manage',
  'qr.retrieve',
  'issuance.confirm',
  'returns.inspect',
  'documents.fvpa012.generate',
  'documents.fvpa012.scan',
  'documents.fvpa012.review',
  'documents.fvpa012.reprint',
  'activity_logs.read_operational',
  'reports.read_operational',
  'recovery.paper_reconcile'
)
on conflict do nothing;

insert into public.icam_role_permissions (role_code, permission_code)
select 'program_laboratory_coordinator', permission_code
from public.icam_permissions
where permission_code in ('oversight.read', 'reports.read_operational')
on conflict do nothing;

insert into public.icam_role_permissions (role_code, permission_code)
select 'icam_application_administrator', permission_code
from public.icam_permissions
where permission_code in (
  'users.read',
  'users.manage_activation',
  'users.assign_roles',
  'configuration.manage',
  'reference_data.manage',
  'reports.read_operational',
  'activity_logs.read_operational'
)
on conflict do nothing;

insert into public.icam_role_permissions (role_code, permission_code)
select 'designated_technical_administrator', permission_code
from public.icam_permissions
where permission_code in (
  'backups.export',
  'backups.verify',
  'backups.restore_separate_environment',
  'deployment.manage',
  'recovery.database_restore'
)
on conflict do nothing;

alter table public.icam_profiles enable row level security;
alter table public.icam_roles enable row level security;
alter table public.icam_permissions enable row level security;
alter table public.icam_role_permissions enable row level security;
alter table public.icam_user_roles enable row level security;

revoke all on table
  public.icam_profiles,
  public.icam_roles,
  public.icam_permissions,
  public.icam_role_permissions,
  public.icam_user_roles
from anon, authenticated;

grant select on table
  public.icam_profiles,
  public.icam_roles,
  public.icam_permissions,
  public.icam_role_permissions,
  public.icam_user_roles
to authenticated;

grant update (display_name, account_status, activated_at, activated_by)
  on public.icam_profiles to authenticated;

grant insert (user_id, role_code, assigned_by, assignment_reason)
  on public.icam_user_roles to authenticated;

grant update (revoked_by, revoked_at, revocation_reason)
  on public.icam_user_roles to authenticated;

create policy "Active users can read the role catalogue"
  on public.icam_roles
  for select to authenticated
  using (private.is_active_icam_user());

create policy "Active users can read the permission catalogue"
  on public.icam_permissions
  for select to authenticated
  using (private.is_active_icam_user());

create policy "Active users can read the role permission catalogue"
  on public.icam_role_permissions
  for select to authenticated
  using (private.is_active_icam_user());

create policy "Users can read their own profile and admins can read all profiles"
  on public.icam_profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_icam_permission('users.read')
  );

create policy "Application administrators can update account activation"
  on public.icam_profiles
  for update to authenticated
  using (private.has_icam_permission('users.manage_activation'))
  with check (
    private.has_icam_permission('users.manage_activation')
    and (
      account_status <> 'active'
      or activated_by = (select auth.uid())
      or activated_by is not null
    )
  );

create policy "Users can read their own role assignments and admins can read all"
  on public.icam_user_roles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_icam_permission('users.read')
  );

create policy "Application administrators can assign ordinary roles"
  on public.icam_user_roles
  for insert to authenticated
  with check (
    private.has_icam_permission('users.assign_roles')
    and assigned_by = (select auth.uid())
    and (
      role_code <> 'designated_technical_administrator'
      or private.has_icam_permission('users.assign_technical_roles')
    )
  );

create policy "Application administrators can revoke active role assignments"
  on public.icam_user_roles
  for update to authenticated
  using (
    private.has_icam_permission('users.assign_roles')
    and revoked_at is null
  )
  with check (
    private.has_icam_permission('users.assign_roles')
    and revoked_at is not null
    and revoked_by = (select auth.uid())
  );

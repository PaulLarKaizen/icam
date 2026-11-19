-- ICAM MVP-2 (Issue #5): Digital Requisition & Atomic Stock Reservation (M06 & M07)

do $$ begin
  create type public.requisition_status as enum (
    'Submitted',
    'Approved',
    'Rejected',
    'Cancelled',
    'Issued',
    'Completed'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.requisitions (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default (
    'REQ-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  requester_id uuid not null references public.user_profiles(id) on delete restrict,
  borrower_name text not null check (char_length(trim(borrower_name)) > 0),
  borrower_student_id text not null default '',
  school_department text not null default 'SMLS',
  course_year_section text not null check (char_length(trim(course_year_section)) > 0),
  course_activity text not null check (char_length(trim(course_activity)) > 0),
  needed_at timestamptz not null,
  expected_return_at timestamptz not null,
  is_late_request boolean not null default false,
  late_request_reason text not null default '',
  status public.requisition_status not null default 'Submitted',
  reviewer_id uuid references public.user_profiles(id) on delete restrict,
  reviewed_at timestamptz,
  decision_remarks text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requisitions_return_after_needed check (expected_return_at > needed_at)
);

create table if not exists public.requisition_items (
  id uuid primary key default gen_random_uuid(),
  requisition_id uuid not null references public.requisitions(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  requested_qty integer not null check (requested_qty > 0),
  approved_qty integer not null default 0 check (approved_qty >= 0 and approved_qty <= requested_qty),
  assigned_serials text[] not null default '{}',
  remarks text not null default '',
  created_at timestamptz not null default now(),
  constraint requisition_items_unique_item_per_req unique (requisition_id, item_id)
);

create index if not exists idx_requisitions_status_submitted
  on public.requisitions (status, submitted_at desc);

create index if not exists idx_requisitions_requester
  on public.requisitions (requester_id, submitted_at desc);

-- Atomic approval & stock reservation function (prevents duplicate decisions & over-reservation)
create or replace function public.approve_requisition(
  p_requisition_id uuid,
  p_reviewer_id uuid,
  p_item_decisions jsonb default null,
  p_remarks text default ''
)
returns void
language plpgsql
as $$
declare
  v_req public.requisitions%rowtype;
  v_line public.requisition_items%rowtype;
  v_item public.inventory_items%rowtype;
  v_approved_qty integer;
  v_total_approved integer := 0;
  v_asset_ids uuid[];
  v_serials text[];
begin
  -- Lock the requisition row to prevent concurrent or duplicate approval
  select *
  into v_req
  from public.requisitions
  where id = p_requisition_id
  for update;

  if not found then
    raise exception 'Requisition not found.';
  end if;

  if v_req.status <> 'Submitted' then
    raise exception 'Only Submitted requisitions can be approved (current status: %).', v_req.status;
  end if;

  for v_line in
    select *
    from public.requisition_items
    where requisition_id = p_requisition_id
    order by created_at asc
    for update
  loop
    v_approved_qty := v_line.requested_qty;

    if p_item_decisions is not null then
      select coalesce((elem->>'approvedQty')::integer, v_line.requested_qty)
      into v_approved_qty
      from jsonb_array_elements(p_item_decisions) as elem
      where (elem->>'requisitionItemId')::uuid = v_line.id
      limit 1;
    end if;

    if v_approved_qty < 0 or v_approved_qty > v_line.requested_qty then
      raise exception 'Approved quantity (%) must be between 0 and requested quantity (%).',
        v_approved_qty, v_line.requested_qty;
    end if;

    v_total_approved := v_total_approved + v_approved_qty;

    -- Lock the parent inventory item row
    select *
    into v_item
    from public.inventory_items
    where id = v_line.item_id
    for update;

    if not found or not v_item.is_active then
      raise exception 'Inventory item % is inactive or missing.', v_line.item_id;
    end if;

    if v_approved_qty = 0 then
      update public.requisition_items
      set approved_qty = 0,
          assigned_serials = '{}'
      where id = v_line.id;
      continue;
    end if;

    if v_item.tracking_mode = 'quantity' then
      if v_item.available_qty < v_approved_qty then
        raise exception 'Insufficient available stock for "%" (available: %, requested: %).',
          v_item.name, v_item.available_qty, v_approved_qty;
      end if;

      update public.inventory_items
      set reserved_qty = reserved_qty + v_approved_qty,
          updated_at = now()
      where id = v_item.id;

      update public.requisition_items
      set approved_qty = v_approved_qty,
          assigned_serials = '{}'
      where id = v_line.id;
    else
      -- Lock specific available serialized units for this item
      select array_agg(id), array_agg(serial_number)
      into v_asset_ids, v_serials
      from (
        select id, serial_number
        from public.inventory_assets
        where item_id = v_item.id
          and availability_status = 'Available'
          and condition_issue = 'NONE'
        order by serial_number asc
        limit v_approved_qty
        for update
      ) locked_assets;

      if coalesce(array_length(v_asset_ids, 1), 0) < v_approved_qty then
        raise exception 'Insufficient available serialized units for "%" (available: %, requested: %).',
          v_item.name, coalesce(array_length(v_asset_ids, 1), 0), v_approved_qty;
      end if;

      -- Trigger trg_sync_serialized_item_counts updates parent reserved_qty automatically
      update public.inventory_assets
      set availability_status = 'Reserved',
          updated_at = now()
      where id = any(v_asset_ids);

      update public.requisition_items
      set approved_qty = v_approved_qty,
          assigned_serials = coalesce(v_serials, '{}')
      where id = v_line.id;
    end if;
  end loop;

  if v_total_approved <= 0 then
    raise exception 'At least one item must have an approved quantity greater than zero.';
  end if;

  update public.requisitions
  set status = 'Approved',
      reviewer_id = p_reviewer_id,
      reviewed_at = now(),
      decision_remarks = coalesce(p_remarks, ''),
      updated_at = now()
  where id = p_requisition_id;
end;
$$;

-- Atomic reject / cancel function (releases reservations if cancelling an Approved request)
create or replace function public.reject_or_cancel_requisition(
  p_requisition_id uuid,
  p_actor_id uuid,
  p_new_status text,
  p_remarks text default ''
)
returns void
language plpgsql
as $$
declare
  v_req public.requisitions%rowtype;
  v_line public.requisition_items%rowtype;
  v_item public.inventory_items%rowtype;
begin
  if p_new_status not in ('Rejected', 'Cancelled') then
    raise exception 'Target status must be Rejected or Cancelled.';
  end if;

  select *
  into v_req
  from public.requisitions
  where id = p_requisition_id
  for update;

  if not found then
    raise exception 'Requisition not found.';
  end if;

  if p_new_status = 'Rejected' and v_req.status <> 'Submitted' then
    raise exception 'Only Submitted requisitions can be rejected.';
  end if;

  if p_new_status = 'Cancelled' and v_req.status not in ('Submitted', 'Approved') then
    raise exception 'Only Submitted or Approved requisitions can be cancelled.';
  end if;

  -- Release reserved inventory if the requisition was already Approved
  if v_req.status = 'Approved' then
    for v_line in
      select *
      from public.requisition_items
      where requisition_id = p_requisition_id
        and approved_qty > 0
      for update
    loop
      select *
      into v_item
      from public.inventory_items
      where id = v_line.item_id
      for update;

      if v_item.tracking_mode = 'quantity' then
        update public.inventory_items
        set reserved_qty = greatest(0, reserved_qty - v_line.approved_qty),
            updated_at = now()
        where id = v_item.id;
      else
        update public.inventory_assets
        set availability_status = 'Available',
            updated_at = now()
        where item_id = v_item.id
          and serial_number = any(v_line.assigned_serials)
          and availability_status = 'Reserved';
      end if;
    end loop;
  end if;

  update public.requisitions
  set status = p_new_status::public.requisition_status,
      reviewer_id = p_actor_id,
      reviewed_at = now(),
      decision_remarks = coalesce(p_remarks, ''),
      updated_at = now()
  where id = p_requisition_id;
end;
$$;

alter table public.requisitions enable row level security;
alter table public.requisition_items enable row level security;

create policy "Authenticated users can read requisitions"
  on public.requisitions for select
  to authenticated
  using (true);

create policy "Authenticated users can read requisition items"
  on public.requisition_items for select
  to authenticated
  using (true);
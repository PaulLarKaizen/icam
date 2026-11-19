-- ICAM MVP-2 (Issue #6): QR Retrieval, Issuance, Returns & Liability Clearance (M08-M11)

alter type public.asset_condition_issue add value if not exists 'LOST';

do $$ begin
  create type public.borrowing_status as enum (
    'Issued',
    'Returned',
    'Liability Pending',
    'Cleared'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.student_id_custody_status as enum (
    'Held',
    'Returned',
    'Retained'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.liability_clearance_status as enum (
    'Unresolved',
    'Cleared'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.liability_replacement_mode as enum (
    'Payment at the cashier',
    'Replace the item'
  );
exception when duplicate_object then null;
end $$;

-- Add transaction-specific QR retrieval token to requisitions (M08)
alter table public.requisitions
  add column if not exists qr_token text not null unique default (
    'ICAM-QR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  );

-- Physical Issuance & Return Custody Record (M09 & M10)
create table if not exists public.borrowing_transactions (
  id uuid primary key default gen_random_uuid(),
  requisition_id uuid not null unique references public.requisitions(id) on delete restrict,
  issued_by uuid not null references public.user_profiles(id) on delete restrict,
  received_by_name text not null check (char_length(trim(received_by_name)) > 0),
  received_by_student_id text not null default '',
  faculty_signature_verified boolean not null default false,
  borrower_signature_verified boolean not null default false,
  student_id_status public.student_id_custody_status not null default 'Held',
  pre_release_notes text not null default '',
  issued_at timestamptz not null default now(),
  returned_at timestamptz,
  inspected_by uuid references public.user_profiles(id) on delete restrict,
  return_notes text not null default '',
  status public.borrowing_status not null default 'Issued',
  updated_at timestamptz not null default now()
);

create table if not exists public.borrowing_transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.borrowing_transactions(id) on delete cascade,
  requisition_item_id uuid not null references public.requisition_items(id) on delete restrict,
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  issued_qty integer not null check (issued_qty > 0),
  issued_serials text[] not null default '{}',
  returned_good_qty integer not null default 0 check (returned_good_qty >= 0),
  damaged_qty integer not null default 0 check (damaged_qty >= 0),
  lost_qty integer not null default 0 check (lost_qty >= 0),
  damaged_serials text[] not null default '{}',
  lost_serials text[] not null default '{}',
  condition_notes text not null default '',
  created_at timestamptz not null default now()
);

-- Agreement of Liability Form F-VPA-011 Rev.1 (M11)
create table if not exists public.liability_cases (
  id uuid primary key default gen_random_uuid(),
  case_code text not null unique default (
    'LIA-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  transaction_id uuid not null unique references public.borrowing_transactions(id) on delete restrict,
  requisition_id uuid not null references public.requisitions(id) on delete restrict,
  liable_person_name text not null check (char_length(trim(liable_person_name)) > 0),
  liable_person_role text not null default 'student',
  liable_person_id_number text not null default '',
  school_department text not null default 'SMLS',
  replacement_mode public.liability_replacement_mode,
  proof_reference text not null default '',
  acknowledged_by_liable boolean not null default false,
  attested_by_faculty boolean not null default false,
  clearance_status public.liability_clearance_status not null default 'Unresolved',
  clearance_notes text not null default '',
  recorded_by uuid not null references public.user_profiles(id) on delete restrict,
  cleared_by uuid references public.user_profiles(id) on delete restrict,
  cleared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.liability_case_items (
  id uuid primary key default gen_random_uuid(),
  liability_case_id uuid not null references public.liability_cases(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  incident_remark text not null check (incident_remark in ('Lost', 'Broken', 'Others')),
  affected_serials text[] not null default '{}',
  notes text not null default ''
);

create index if not exists idx_borrowing_transactions_status
  on public.borrowing_transactions (status, issued_at desc);

create index if not exists idx_liability_cases_status
  on public.liability_cases (clearance_status, created_at desc);

-- Atomic Physical Issuance RPC (M09): verifies collateral/signatures and deducts on_hand_qty
create or replace function public.issue_requisition(
  p_requisition_id uuid,
  p_custodian_id uuid,
  p_received_by_name text,
  p_received_by_student_id text default '',
  p_faculty_sig_verified boolean default false,
  p_borrower_sig_verified boolean default false,
  p_student_id_held boolean default false,
  p_notes text default ''
)
returns uuid
language plpgsql
as $$
declare
  v_req public.requisitions%rowtype;
  v_line public.requisition_items%rowtype;
  v_item public.inventory_items%rowtype;
  v_tx_id uuid;
  v_issued_lines integer := 0;
begin
  if not p_student_id_held then
    raise exception 'Physical Student ID collateral must be collected and marked Held before release.';
  end if;

  if not p_faculty_sig_verified or not p_borrower_sig_verified then
    raise exception 'Both Faculty In-charge and Borrower wet-ink signatures on F-VPA-012 must be verified before release.';
  end if;

  select *
  into v_req
  from public.requisitions
  where id = p_requisition_id
  for update;

  if not found then
    raise exception 'Requisition not found.';
  end if;

  if v_req.status <> 'Approved' then
    raise exception 'Only Approved requisitions can be issued (current status: %).', v_req.status;
  end if;

  insert into public.borrowing_transactions (
    requisition_id,
    issued_by,
    received_by_name,
    received_by_student_id,
    faculty_signature_verified,
    borrower_signature_verified,
    student_id_status,
    pre_release_notes,
    status
  )
  values (
    p_requisition_id,
    p_custodian_id,
    trim(p_received_by_name),
    coalesce(trim(p_received_by_student_id), ''),
    true,
    true,
    'Held',
    coalesce(p_notes, ''),
    'Issued'
  )
  returning id into v_tx_id;

  for v_line in
    select *
    from public.requisition_items
    where requisition_id = p_requisition_id
      and approved_qty > 0
    order by created_at asc
    for update
  loop
    v_issued_lines := v_issued_lines + 1;

    select *
    into v_item
    from public.inventory_items
    where id = v_line.item_id
    for update;

    if v_item.tracking_mode = 'quantity' then
      if v_item.on_hand_qty < v_line.approved_qty or v_item.reserved_qty < v_line.approved_qty then
        raise exception 'Stock inconsistency detected for "%". Cannot release.', v_item.name;
      end if;

      -- Convert reservation into physical deduction from on_hand_qty
      update public.inventory_items
      set on_hand_qty = on_hand_qty - v_line.approved_qty,
          reserved_qty = reserved_qty - v_line.approved_qty,
          updated_at = now()
      where id = v_item.id;
    else
      -- Transition reserved serialized assets to Issued (trigger updates parent counts)
      update public.inventory_assets
      set availability_status = 'Issued',
          updated_at = now()
      where item_id = v_item.id
        and serial_number = any(v_line.assigned_serials)
        and availability_status = 'Reserved';
    end if;

    insert into public.borrowing_transaction_items (
      transaction_id,
      requisition_item_id,
      item_id,
      issued_qty,
      issued_serials
    )
    values (
      v_tx_id,
      v_line.id,
      v_line.item_id,
      v_line.approved_qty,
      v_line.assigned_serials
    );
  end loop;

  if v_issued_lines = 0 then
    raise exception 'Requisition has no approved items to release.';
  end if;

  update public.requisitions
  set status = 'Issued',
      updated_at = now()
  where id = p_requisition_id;

  return v_tx_id;
end;
$$;

-- Atomic Return Inspection RPC (M10): reconciles returns and opens Liability Case if damaged/lost
create or replace function public.inspect_borrowing_return(
  p_transaction_id uuid,
  p_custodian_id uuid,
  p_item_inspections jsonb,
  p_return_notes text default ''
)
returns uuid
language plpgsql
as $$
declare
  v_tx public.borrowing_transactions%rowtype;
  v_req public.requisitions%rowtype;
  v_tx_item public.borrowing_transaction_items%rowtype;
  v_item public.inventory_items%rowtype;
  v_insp jsonb;
  v_good integer;
  v_damaged integer;
  v_lost integer;
  v_damaged_serials text[];
  v_lost_serials text[];
  v_good_serials text[];
  v_notes text;
  v_total_incidents integer := 0;
  v_liability_id uuid := null;
begin
  select *
  into v_tx
  from public.borrowing_transactions
  where id = p_transaction_id
  for update;

  if not found then
    raise exception 'Borrowing transaction not found.';
  end if;

  if v_tx.status <> 'Issued' then
    raise exception 'Only active Issued transactions can be inspected (current status: %).', v_tx.status;
  end if;

  select *
  into v_req
  from public.requisitions
  where id = v_tx.requisition_id
  for update;

  for v_tx_item in
    select *
    from public.borrowing_transaction_items
    where transaction_id = p_transaction_id
    for update
  loop
    select elem
    into v_insp
    from jsonb_array_elements(p_item_inspections) as elem
    where (elem->>'transactionItemId')::uuid = v_tx_item.id
    limit 1;

    if v_insp is null then
      raise exception 'Missing inspection entry for transaction item %.', v_tx_item.id;
    end if;

    v_good := coalesce((v_insp->>'returnedGoodQty')::integer, 0);
    v_damaged := coalesce((v_insp->>'damagedQty')::integer, 0);
    v_lost := coalesce((v_insp->>'lostQty')::integer, 0);
    v_notes := coalesce(v_insp->>'conditionNotes', '');

    if v_good < 0 or v_damaged < 0 or v_lost < 0 or (v_good + v_damaged + v_lost) <> v_tx_item.issued_qty then
      raise exception 'Returned good (%) + damaged (%) + lost (%) must equal issued quantity (%).',
        v_good, v_damaged, v_lost, v_tx_item.issued_qty;
    end if;

    select coalesce(array_agg(x), '{}')
    into v_damaged_serials
    from jsonb_array_elements_text(coalesce(v_insp->'damagedSerials', '[]'::jsonb)) as x;

    select coalesce(array_agg(x), '{}')
    into v_lost_serials
    from jsonb_array_elements_text(coalesce(v_insp->'lostSerials', '[]'::jsonb)) as x;

    select *
    into v_item
    from public.inventory_items
    where id = v_tx_item.item_id
    for update;

    if v_item.tracking_mode = 'quantity' then
      -- Restore good returned units to on_hand_qty; record damaged units in defective_qty
      update public.inventory_items
      set on_hand_qty = on_hand_qty + v_good,
          defective_qty = defective_qty + v_damaged,
          updated_at = now()
      where id = v_item.id;
    else
      if array_length(v_damaged_serials, 1) is distinct from (case when v_damaged = 0 then null else v_damaged end) then
        raise exception 'Exact damaged serial numbers (%) must match damaged count (%) for "%".',
          coalesce(array_length(v_damaged_serials, 1), 0), v_damaged, v_item.name;
      end if;

      if array_length(v_lost_serials, 1) is distinct from (case when v_lost = 0 then null else v_lost end) then
        raise exception 'Exact lost serial numbers (%) must match lost count (%) for "%".',
          coalesce(array_length(v_lost_serials, 1), 0), v_lost, v_item.name;
      end if;

      if array_length(v_damaged_serials, 1) > 0 then
        update public.inventory_assets
        set availability_status = 'Unavailable',
            condition_issue = 'DEFECTIVE',
            updated_at = now()
        where item_id = v_item.id
          and serial_number = any(v_damaged_serials);
      end if;

      if array_length(v_lost_serials, 1) > 0 then
        update public.inventory_assets
        set availability_status = 'Unavailable',
            condition_issue = 'LOST',
            updated_at = now()
        where item_id = v_item.id
          and serial_number = any(v_lost_serials);
      end if;

      select coalesce(array_agg(s), '{}')
      into v_good_serials
      from unnest(v_tx_item.issued_serials) as s
      where not (s = any(v_damaged_serials))
        and not (s = any(v_lost_serials));

      if array_length(v_good_serials, 1) > 0 then
        update public.inventory_assets
        set availability_status = 'Available',
            condition_issue = 'NONE',
            updated_at = now()
        where item_id = v_item.id
          and serial_number = any(v_good_serials);
      end if;
    end if;

    update public.borrowing_transaction_items
    set returned_good_qty = v_good,
        damaged_qty = v_damaged,
        lost_qty = v_lost,
        damaged_serials = v_damaged_serials,
        lost_serials = v_lost_serials,
        condition_notes = v_notes
    where id = v_tx_item.id;

    if (v_damaged + v_lost) > 0 then
      if v_liability_id is null then
        insert into public.liability_cases (
          transaction_id,
          requisition_id,
          liable_person_name,
          liable_person_role,
          liable_person_id_number,
          school_department,
          recorded_by
        )
        values (
          p_transaction_id,
          v_req.id,
          v_tx.received_by_name,
          'student',
          v_tx.received_by_student_id,
          v_req.school_department,
          p_custodian_id
        )
        returning id into v_liability_id;
      end if;

      if v_damaged > 0 then
        insert into public.liability_case_items (
          liability_case_id,
          item_id,
          quantity,
          incident_remark,
          affected_serials,
          notes
        )
        values (
          v_liability_id,
          v_tx_item.item_id,
          v_damaged,
          'Broken',
          v_damaged_serials,
          v_notes
        );
      end if;

      if v_lost > 0 then
        insert into public.liability_case_items (
          liability_case_id,
          item_id,
          quantity,
          incident_remark,
          affected_serials,
          notes
        )
        values (
          v_liability_id,
          v_tx_item.item_id,
          v_lost,
          'Lost',
          v_lost_serials,
          v_notes
        );
      end if;

      v_total_incidents := v_total_incidents + v_damaged + v_lost;
    end if;
  end loop;

  if v_total_incidents = 0 then
    update public.borrowing_transactions
    set status = 'Returned',
        student_id_status = 'Returned',
        returned_at = now(),
        inspected_by = p_custodian_id,
        return_notes = coalesce(p_return_notes, ''),
        updated_at = now()
    where id = p_transaction_id;

    update public.requisitions
    set status = 'Completed',
        updated_at = now()
    where id = v_req.id;
  else
    -- Retain Student ID until F-VPA-011 Rev.1 liability case is settled and cleared
    update public.borrowing_transactions
    set status = 'Liability Pending',
        student_id_status = 'Retained',
        returned_at = now(),
        inspected_by = p_custodian_id,
        return_notes = coalesce(p_return_notes, ''),
        updated_at = now()
    where id = p_transaction_id;
  end if;

  return v_liability_id;
end;
$$;

-- Atomic Liability Clearance RPC (M11 - F-VPA-011 Rev.1)
create or replace function public.clear_liability_case(
  p_liability_id uuid,
  p_custodian_id uuid,
  p_replacement_mode text,
  p_proof_reference text,
  p_acknowledged_by_liable boolean default false,
  p_attested_by_faculty boolean default false,
  p_restock_replaced boolean default false,
  p_clearance_notes text default ''
)
returns void
language plpgsql
as $$
declare
  v_case public.liability_cases%rowtype;
  v_line public.liability_case_items%rowtype;
  v_item public.inventory_items%rowtype;
begin
  if not p_acknowledged_by_liable then
    raise exception 'Liable person wet-ink acknowledgement on F-VPA-011 Rev.1 must be verified before clearance.';
  end if;

  select *
  into v_case
  from public.liability_cases
  where id = p_liability_id
  for update;

  if not found then
    raise exception 'Liability case not found.';
  end if;

  if v_case.clearance_status <> 'Unresolved' then
    raise exception 'Liability case is already cleared.';
  end if;

  -- If replacement item was physically provided and verified, restock usable quantity items
  if p_replacement_mode = 'Replace the item' and p_restock_replaced then
    for v_line in
      select *
      from public.liability_case_items
      where liability_case_id = p_liability_id
    loop
      select *
      into v_item
      from public.inventory_items
      where id = v_line.item_id
      for update;

      if v_item.tracking_mode = 'quantity' then
        update public.inventory_items
        set on_hand_qty = on_hand_qty + v_line.quantity,
            defective_qty = case
              when v_line.incident_remark = 'Broken' then greatest(0, defective_qty - v_line.quantity)
              else defective_qty
            end,
            updated_at = now()
        where id = v_item.id;
      end if;
    end loop;
  end if;

  update public.liability_cases
  set replacement_mode = p_replacement_mode::public.liability_replacement_mode,
      proof_reference = trim(p_proof_reference),
      acknowledged_by_liable = p_acknowledged_by_liable,
      attested_by_faculty = p_attested_by_faculty,
      clearance_status = 'Cleared',
      clearance_notes = coalesce(p_clearance_notes, ''),
      cleared_by = p_custodian_id,
      cleared_at = now(),
      updated_at = now()
  where id = p_liability_id;

  -- Release retained Student ID and complete the borrowing & requisition records
  update public.borrowing_transactions
  set status = 'Cleared',
      student_id_status = 'Returned',
      updated_at = now()
  where id = v_case.transaction_id;

  update public.requisitions
  set status = 'Completed',
      updated_at = now()
  where id = v_case.requisition_id;
end;
$$;

alter table public.borrowing_transactions enable row level security;
alter table public.borrowing_transaction_items enable row level security;
alter table public.liability_cases enable row level security;
alter table public.liability_case_items enable row level security;

create policy "Authenticated users can read borrowing transactions"
  on public.borrowing_transactions for select to authenticated using (true);

create policy "Authenticated users can read borrowing transaction items"
  on public.borrowing_transaction_items for select to authenticated using (true);

create policy "Authenticated users can read liability cases"
  on public.liability_cases for select to authenticated using (true);

create policy "Authenticated users can read liability case items"
  on public.liability_case_items for select to authenticated using (true);
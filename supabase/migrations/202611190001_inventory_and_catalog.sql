-- ICAM MVP-2 (Issue #4): Hybrid Inventory & Catalog Schema
-- Excludes chemical inventory per docs/mvp-requirements.md

create extension if not exists "pgcrypto";

do $$ begin
  create type public.inventory_tracking_mode as enum ('quantity', 'serialized');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.asset_condition_issue as enum (
    'NONE',
    'DEFECTIVE',
    'FOR DEMONSTRATION ONLY',
    'FO REPAIR'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.asset_availability_status as enum (
    'Available',
    'Reserved',
    'Issued',
    'Unavailable'
  );
exception when duplicate_object then null;
end $$;

-- Master catalog & stock table (supports both bulk quantity items and serialized parent items)
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  category text not null check (category in ('Equipment', 'Apparatus', 'Material')),
  tracking_mode public.inventory_tracking_mode not null,
  specification text not null default '',
  unit text not null default 'pcs',
  location text not null default '',
  on_hand_qty integer not null default 0 check (on_hand_qty >= 0),
  reserved_qty integer not null default 0 check (reserved_qty >= 0),
  available_qty integer generated always as (on_hand_qty - reserved_qty) stored,
  defective_qty integer not null default 0 check (defective_qty >= 0),
  defective_notes text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_items_reserved_lte_on_hand check (reserved_qty <= on_hand_qty)
);

-- Individual units for serialized equipment (e.g., Microscopes MLS 001 - MLS 059)
create table if not exists public.inventory_assets (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  serial_number text not null unique check (char_length(trim(serial_number)) > 0),
  calibration text not null default '-',
  condition_issue public.asset_condition_issue not null default 'NONE',
  availability_status public.asset_availability_status not null default 'Available',
  location text not null default 'MT LAB 3',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint serialized_defective_must_be_unavailable check (
    condition_issue = 'NONE' or availability_status = 'Unavailable'
  )
);

create index if not exists idx_inventory_items_search
  on public.inventory_items (is_active, category, tracking_mode, name);

create index if not exists idx_inventory_assets_item_status
  on public.inventory_assets (item_id, availability_status);

-- Keep serialized parent counts automatically synchronized with inventory_assets
create or replace function public.sync_serialized_item_counts()
returns trigger
language plpgsql
as $$
declare
  target_item_id uuid;
begin
  target_item_id := coalesce(new.item_id, old.item_id);

  update public.inventory_items
  set
    on_hand_qty = (
      select count(*)
      from public.inventory_assets
      where item_id = target_item_id
        and availability_status in ('Available', 'Reserved')
    ),
    reserved_qty = (
      select count(*)
      from public.inventory_assets
      where item_id = target_item_id
        and availability_status = 'Reserved'
    ),
    defective_qty = (
      select count(*)
      from public.inventory_assets
      where item_id = target_item_id
        and condition_issue <> 'NONE'
    ),
    updated_at = now()
  where id = target_item_id
    and tracking_mode = 'serialized';

  return null;
end;
$$;

drop trigger if exists trg_sync_serialized_item_counts on public.inventory_assets;
create trigger trg_sync_serialized_item_counts
after insert or update or delete on public.inventory_assets
for each row execute function public.sync_serialized_item_counts();

-- Enable Row Level Security (mutations go through validated Nitro server handlers)
alter table public.inventory_items enable row level security;
alter table public.inventory_assets enable row level security;

create policy "Authenticated users can read active inventory items"
  on public.inventory_items for select
  to authenticated
  using (true);

create policy "Authenticated users can read inventory assets"
  on public.inventory_assets for select
  to authenticated
  using (true);
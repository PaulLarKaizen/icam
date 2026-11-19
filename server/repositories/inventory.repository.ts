import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import type {
  CreateInventoryItemInput,
  InventoryAsset,
  InventoryCatalogQuery,
  InventoryItem,
  UpdateInventoryStockInput,
} from "~~/shared/types/inventory";

function mapAssetRow(row: Record<string, any>): InventoryAsset {
  return {
    id: row.id,
    itemId: row.item_id,
    serialNumber: row.serial_number,
    calibration: row.calibration,
    conditionIssue: row.condition_issue,
    availabilityStatus: row.availability_status,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapItemRow(row: Record<string, any>): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    trackingMode: row.tracking_mode,
    specification: row.specification,
    unit: row.unit,
    location: row.location,
    onHandQty: row.on_hand_qty,
    reservedQty: row.reserved_qty,
    availableQty: row.available_qty,
    defectiveQty: row.defective_qty,
    defectiveNotes: row.defective_notes,
    isActive: row.is_active,
    assets: Array.isArray(row.inventory_assets)
      ? row.inventory_assets.map(mapAssetRow)
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listInventoryItems(
  event: H3Event,
  query: InventoryCatalogQuery,
  includeInactive = false,
): Promise<InventoryItem[]> {
  const client = serverSupabaseServiceRole<any>(event);

  let builder = client
    .from("inventory_items")
    .select("*, inventory_assets(*)")
    .order("name", { ascending: true });

  if (!includeInactive) {
    builder = builder.eq("is_active", true);
  }

  if (query.category) {
    builder = builder.eq("category", query.category);
  }

  if (query.trackingMode) {
    builder = builder.eq("tracking_mode", query.trackingMode);
  }

  if (query.availableOnly) {
    builder = builder.gt("available_qty", 0);
  }

  if (query.search) {
    const escaped = query.search.replace(/[%_]/g, "\\$&");
    builder = builder.or(
      `name.ilike.%${escaped}%,specification.ilike.%${escaped}%,location.ilike.%${escaped}%`,
    );
  }

  const { data, error } = await builder;
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch inventory: ${error.message}`,
    });
  }

  return (data ?? []).map(mapItemRow);
}

export async function getInventoryItemById(
  event: H3Event,
  id: string,
): Promise<InventoryItem | null> {
  const client = serverSupabaseServiceRole<any>(event);
  const { data, error } = await client
    .from("inventory_items")
    .select("*, inventory_assets(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load inventory item: ${error.message}`,
    });
  }

  return data ? mapItemRow(data) : null;
}

export async function createInventoryItem(
  event: H3Event,
  input: CreateInventoryItemInput,
): Promise<InventoryItem> {
  const client = serverSupabaseServiceRole<any>(event);

  // Serialized parent counts are derived from inventory_assets triggers
  const initialOnHand =
    input.trackingMode === "serialized" ? 0 : (input.onHandQty ?? 0);
  const initialDefective =
    input.trackingMode === "serialized" ? 0 : (input.defectiveQty ?? 0);

  const { data, error } = await client
    .from("inventory_items")
    .insert({
      name: input.name,
      category: input.category,
      tracking_mode: input.trackingMode,
      specification: input.specification ?? "",
      unit: input.unit,
      location: input.location,
      on_hand_qty: initialOnHand,
      defective_qty: initialDefective,
      defective_notes: input.defectiveNotes ?? "",
    })
    .select("*, inventory_assets(*)")
    .single();

  if (error || !data) {
    throw createError({
      statusCode: 400,
      statusMessage: error?.message ?? "Failed to create inventory item.",
    });
  }

  return mapItemRow(data);
}

export async function updateInventoryItemStock(
  event: H3Event,
  id: string,
  input: UpdateInventoryStockInput,
): Promise<InventoryItem> {
  const existing = await getInventoryItemById(event, id);
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: "Inventory item not found.",
    });
  }

  if (existing.trackingMode === "serialized" && input.onHandQty !== undefined) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Serialized equipment quantities are managed via individual asset units.",
    });
  }

  if (input.onHandQty !== undefined && input.onHandQty < existing.reservedQty) {
    throw createError({
      statusCode: 400,
      statusMessage: `On-hand quantity (${input.onHandQty}) cannot be lower than currently reserved quantity (${existing.reservedQty}).`,
    });
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.onHandQty !== undefined)
    updatePayload.on_hand_qty = input.onHandQty;
  if (input.defectiveQty !== undefined)
    updatePayload.defective_qty = input.defectiveQty;
  if (input.defectiveNotes !== undefined)
    updatePayload.defective_notes = input.defectiveNotes;
  if (input.location !== undefined) updatePayload.location = input.location;
  if (input.isActive !== undefined) updatePayload.is_active = input.isActive;

  const client = serverSupabaseServiceRole<any>(event);
  const { data, error } = await client
    .from("inventory_items")
    .update(updatePayload)
    .eq("id", id)
    .select("*, inventory_assets(*)")
    .single();

  if (error || !data) {
    throw createError({
      statusCode: 400,
      statusMessage: error?.message ?? "Failed to update inventory item.",
    });
  }

  return mapItemRow(data);
}

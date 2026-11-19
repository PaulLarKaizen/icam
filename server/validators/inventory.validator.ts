import { z } from "zod";
import type {
  CreateInventoryItemInput,
  InventoryCatalogQuery,
  UpdateInventoryStockInput,
} from "~~/shared/types/inventory";

const createInventoryItemSchema = z
  .object({
    name: z.string().trim().min(1, "Item name is required").max(160),
    category: z.enum(["Equipment", "Apparatus", "Material"]),
    trackingMode: z.enum(["quantity", "serialized"]),
    specification: z.string().trim().max(160).optional().default(""),
    unit: z.string().trim().min(1, "Unit is required").max(32),
    location: z.string().trim().min(1, "Location is required").max(80),
    onHandQty: z
      .number()
      .int()
      .min(0, "On-hand quantity cannot be negative")
      .optional()
      .default(0),
    defectiveQty: z
      .number()
      .int()
      .min(0, "Defective quantity cannot be negative")
      .optional()
      .default(0),
    defectiveNotes: z.string().trim().max(500).optional().default(""),
  })
  .strict();

const updateInventoryStockSchema = z
  .object({
    onHandQty: z
      .number()
      .int()
      .min(0, "On-hand quantity cannot be negative")
      .optional(),
    defectiveQty: z
      .number()
      .int()
      .min(0, "Defective quantity cannot be negative")
      .optional(),
    defectiveNotes: z.string().trim().max(500).optional(),
    location: z.string().trim().min(1).max(80).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  });

const catalogQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.enum(["Equipment", "Apparatus", "Material", ""]).optional(),
  trackingMode: z.enum(["quantity", "serialized", ""]).optional(),
  availableOnly: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .optional()
    .transform((val) => val === true || val === "true"),
});

export function validateCreateInventoryItem(
  payload: unknown,
): CreateInventoryItemInput {
  const parsed = createInventoryItemSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid inventory item payload.",
    });
  }
  return parsed.data;
}

export function validateUpdateInventoryStock(
  payload: unknown,
): UpdateInventoryStockInput {
  const parsed = updateInventoryStockSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid inventory update payload.",
    });
  }
  return parsed.data;
}

export function validateCatalogQuery(
  rawQuery: Record<string, unknown>,
): InventoryCatalogQuery {
  const parsed = catalogQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid catalog search parameters.",
    });
  }
  return parsed.data;
}

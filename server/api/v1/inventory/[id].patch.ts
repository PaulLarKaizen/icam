import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { INVENTORY_MANAGE_ROLES } from "~~/server/policies/inventory.policy";
import { validateUpdateInventoryStock } from "~~/server/validators/inventory.validator";
import { updateInventoryItemStock } from "~~/server/repositories/inventory.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(
    user,
    INVENTORY_MANAGE_ROLES,
    "Only custodians and coordinators can modify inventory.",
  );

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Item ID is required.",
    });
  }

  const body = await readBody(event);
  const input = validateUpdateInventoryStock(body);
  const updated = await updateInventoryItemStock(event, id, input);

  await recordActivityLog(event, {
    actor: user,
    moduleCode: "M04",
    action: "inventory.item.updated",
    entityType: "inventory_item",
    entityId: updated.id,
    summary: `Updated stock/details for ${updated.name} (On-hand: ${updated.onHandQty}, Available: ${updated.availableQty}).`,
    metadata: { changes: input },
  });

  return { item: updated };
});

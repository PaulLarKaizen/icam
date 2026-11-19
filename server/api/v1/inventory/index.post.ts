import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { INVENTORY_MANAGE_ROLES } from "~~/server/policies/inventory.policy";
import { validateCreateInventoryItem } from "~~/server/validators/inventory.validator";
import { createInventoryItem } from "~~/server/repositories/inventory.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(
    user,
    INVENTORY_MANAGE_ROLES,
    "Only custodians and coordinators can add inventory items.",
  );

  const body = await readBody(event);
  const input = validateCreateInventoryItem(body);
  const created = await createInventoryItem(event, input);

  await recordActivityLog(event, {
    actor: user,
    moduleCode: "M04",
    action: "inventory.item.created",
    entityType: "inventory_item",
    entityId: created.id,
    summary: `Added ${created.name} (${created.trackingMode}) with on-hand qty ${created.onHandQty}.`,
    metadata: {
      name: created.name,
      category: created.category,
      trackingMode: created.trackingMode,
      onHandQty: created.onHandQty,
    },
  });

  setResponseStatus(event, 201);
  return { item: created };
});

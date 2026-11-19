import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { INVENTORY_VIEW_ROLES } from "~~/server/policies/inventory.policy";
import { getInventoryItemById } from "~~/server/repositories/inventory.repository";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, INVENTORY_VIEW_ROLES);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Item ID is required.",
    });
  }

  const item = await getInventoryItemById(event, id);
  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: "Inventory item not found.",
    });
  }

  return { item };
});

import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { INVENTORY_VIEW_ROLES } from "~~/server/policies/inventory.policy";
import { validateCatalogQuery } from "~~/server/validators/inventory.validator";
import { listInventoryItems } from "~~/server/repositories/inventory.repository";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, INVENTORY_VIEW_ROLES);

  const query = validateCatalogQuery(getQuery(event));
  const items = await listInventoryItems(event, query, false);

  return { items };
});

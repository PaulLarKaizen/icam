import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { REQUISITION_VIEW_ROLES } from "~~/server/policies/requisition.policy";
import { listRequisitions } from "~~/server/repositories/requisition.repository";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, REQUISITION_VIEW_ROLES);

  const requisitions = await listRequisitions(event, user);
  return { requisitions };
});

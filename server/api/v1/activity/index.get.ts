import { ACTIVITY_LOG_VIEW_ROLES } from "~~/server/policies/resilience.policy";
import { listActivityLogs } from "~~/server/repositories/resilience.repository";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { requireUser } from "~~/server/utils/auth/require-user";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, ACTIVITY_LOG_VIEW_ROLES);

  const query = getQuery(event);
  const moduleCode =
    typeof query.module === "string" ? query.module : undefined;
  const limit = query.limit ? Number(query.limit) : 100;
  const logs = await listActivityLogs(event, moduleCode, limit);
  return { logs };
});

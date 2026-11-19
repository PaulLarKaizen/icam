import { OUTAGE_RECOVERY_VIEW_ROLES } from "~~/server/policies/resilience.policy";
import { listOutageRecoveryLogs } from "~~/server/repositories/resilience.repository";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { requireUser } from "~~/server/utils/auth/require-user";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, OUTAGE_RECOVERY_VIEW_ROLES);

  const records = await listOutageRecoveryLogs(event);
  return { records };
});

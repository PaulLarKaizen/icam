import { OUTAGE_RECOVERY_MANAGE_ROLES } from "~~/server/policies/resilience.policy";
import { createOutageRecoveryLog } from "~~/server/repositories/resilience.repository";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { requireUser } from "~~/server/utils/auth/require-user";
import { validateCreateOutageRecovery } from "~~/server/validators/resilience.validator";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, OUTAGE_RECOVERY_MANAGE_ROLES);

  const body = await readBody(event);
  const input = validateCreateOutageRecovery(body);
  const record = await createOutageRecoveryLog(event, user, input);
  return { record };
});

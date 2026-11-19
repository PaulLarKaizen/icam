import { BACKUP_ADMIN_ROLES } from "~~/server/policies/resilience.policy";
import { verifyBackupBundle } from "~~/server/repositories/resilience.repository";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { requireUser } from "~~/server/utils/auth/require-user";
import { validateRestoreBundle } from "~~/server/validators/resilience.validator";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, BACKUP_ADMIN_ROLES);

  const body = await readBody(event);
  const bundle = validateRestoreBundle(body);
  const snapshot = await verifyBackupBundle(event, user, bundle);
  return { snapshot };
});

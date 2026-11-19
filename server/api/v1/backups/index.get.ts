import { BACKUP_ADMIN_ROLES } from "~~/server/policies/resilience.policy";
import { listBackupSnapshots } from "~~/server/repositories/resilience.repository";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { requireUser } from "~~/server/utils/auth/require-user";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, BACKUP_ADMIN_ROLES);

  const snapshots = await listBackupSnapshots(event);
  return { snapshots };
});

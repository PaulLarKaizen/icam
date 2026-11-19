import { BACKUP_ADMIN_ROLES } from "~~/server/policies/resilience.policy";
import { createBackupExport } from "~~/server/repositories/resilience.repository";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { requireUser } from "~~/server/utils/auth/require-user";
import { validateBackupExportNotes } from "~~/server/validators/resilience.validator";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(user, BACKUP_ADMIN_ROLES);

  const body = await readBody(event).catch(() => ({}));
  const { notes } = validateBackupExportNotes(body);
  const bundle = await createBackupExport(event, user, notes);
  return { bundle };
});

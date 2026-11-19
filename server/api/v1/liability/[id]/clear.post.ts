import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { COUNTER_OPERATIONS_ROLES } from "~~/server/policies/borrowing.policy";
import { validateClearLiabilityCase } from "~~/server/validators/borrowing.validator";
import { clearLiabilityCase } from "~~/server/repositories/borrowing.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(
    user,
    COUNTER_OPERATIONS_ROLES,
    "Only custodians and coordinators can certify liability clearance.",
  );

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Liability case ID is required.",
    });
  }

  const body = await readBody(event);
  const input = validateClearLiabilityCase(body);
  const updated = await clearLiabilityCase(event, user, id, input);

  await recordActivityLog(event, {
    actor: user,
    moduleCode: "M11",
    action: "liability.cleared",
    entityType: "liability_case",
    entityId: updated.id,
    summary: `Cleared liability case ${updated.caseCode} (${updated.replacementMode}, Ref: ${updated.proofReference}) and released Student ID.`,
    metadata: {
      caseCode: updated.caseCode,
      replacementMode: updated.replacementMode,
      proofReference: updated.proofReference,
    },
  });

  return { liabilityCase: updated };
});

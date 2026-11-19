import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { COUNTER_OPERATIONS_ROLES } from "~~/server/policies/borrowing.policy";
import { validateInspectBorrowingReturn } from "~~/server/validators/borrowing.validator";
import { inspectBorrowingReturn } from "~~/server/repositories/borrowing.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(
    user,
    COUNTER_OPERATIONS_ROLES,
    "Only custodians and coordinators can inspect returned laboratory items.",
  );

  const transactionId = getRouterParam(event, "transactionId");
  if (!transactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Transaction ID is required.",
    });
  }

  const body = await readBody(event);
  const input = validateInspectBorrowingReturn(body);
  const { transaction, liabilityCaseId } = await inspectBorrowingReturn(
    event,
    user,
    transactionId,
    input,
  );

  await recordActivityLog(event, {
    actor: user,
    moduleCode: liabilityCaseId ? "M11" : "M10",
    action: liabilityCaseId
      ? "borrowing.returned_with_liability"
      : "borrowing.returned_clean",
    entityType: "borrowing_transaction",
    entityId: transaction.id,
    summary: liabilityCaseId
      ? `Inspected return for ${transaction.referenceCode}: damage/loss recorded; Student ID retained.`
      : `Inspected clean return for ${transaction.referenceCode}; Student ID returned.`,
    metadata: {
      referenceCode: transaction.referenceCode,
      status: transaction.status,
      studentIdStatus: transaction.studentIdStatus,
      liabilityCaseId,
    },
  });

  return { transaction, liabilityCaseId };
});

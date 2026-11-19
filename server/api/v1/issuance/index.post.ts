import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { COUNTER_OPERATIONS_ROLES } from "~~/server/policies/borrowing.policy";
import { validateIssueRequisition } from "~~/server/validators/borrowing.validator";
import { issueRequisition } from "~~/server/repositories/borrowing.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(
    user,
    COUNTER_OPERATIONS_ROLES,
    "Only custodians and coordinators can physically release laboratory items.",
  );

  const body = await readBody(event);
  const input = validateIssueRequisition(body);
  const transaction = await issueRequisition(event, user, input);

  await recordActivityLog(event, {
    actor: user,
    moduleCode: "M09",
    action: "borrowing.issued",
    entityType: "borrowing_transaction",
    entityId: transaction.id,
    summary: `Issued items for ${transaction.referenceCode} to ${transaction.receivedByName} (Student ID: Held).`,
    metadata: {
      requisitionId: transaction.requisitionId,
      referenceCode: transaction.referenceCode,
      receivedByName: transaction.receivedByName,
      studentIdStatus: transaction.studentIdStatus,
    },
  });

  setResponseStatus(event, 201);
  return { transaction };
});

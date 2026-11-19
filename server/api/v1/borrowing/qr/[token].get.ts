import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { COUNTER_OPERATIONS_ROLES } from "~~/server/policies/borrowing.policy";
import { lookupRequisitionByQrOrRef } from "~~/server/repositories/borrowing.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(
    user,
    COUNTER_OPERATIONS_ROLES,
    "Only custodians and coordinators can retrieve counter QR transactions.",
  );

  const token = getRouterParam(event, "token");
  if (!token || !token.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "QR token or reference code is required.",
    });
  }

  const requisition = await lookupRequisitionByQrOrRef(
    event,
    decodeURIComponent(token),
  );
  if (!requisition) {
    throw createError({
      statusCode: 404,
      statusMessage: "No requisition matched that QR token or reference code.",
    });
  }

  await recordActivityLog(event, {
    actor: user,
    moduleCode: "M08",
    action: "borrowing.qr_retrieved",
    entityType: "requisition",
    entityId: requisition.id,
    summary: `Retrieved requisition ${requisition.referenceCode} at counter via QR/reference lookup.`,
    metadata: {
      referenceCode: requisition.referenceCode,
      status: requisition.status,
    },
  });

  return { requisition };
});

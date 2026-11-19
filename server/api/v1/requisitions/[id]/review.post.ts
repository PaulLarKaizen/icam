import { requireUser } from "~~/server/utils/auth/require-user";
import { REQUISITION_REVIEW_ROLES } from "~~/server/policies/requisition.policy";
import { validateReviewRequisition } from "~~/server/validators/requisition.validator";
import {
  getRequisitionById,
  reviewRequisition,
} from "~~/server/repositories/requisition.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Requisition ID is required.",
    });
  }

  const body = await readBody(event);
  const input = validateReviewRequisition(body);

  const existing = await getRequisitionById(event, id);
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: "Requisition not found.",
    });
  }

  const isReviewerRole = REQUISITION_REVIEW_ROLES.includes(user.role);
  const isFacultyCancellingOwnSubmitted =
    input.decision === "cancel" &&
    existing.requesterId === user.id &&
    existing.status === "Submitted";

  if (!isReviewerRole && !isFacultyCancellingOwnSubmitted) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Only custodians and coordinators can approve or reject requisitions.",
    });
  }

  const updated = await reviewRequisition(event, user, id, input);

  await recordActivityLog(event, {
    actor: user,
    moduleCode: input.decision === "approve" ? "M07" : "M06",
    action: `requisition.${updated.status.toLowerCase()}`,
    entityType: "requisition",
    entityId: updated.id,
    summary: `Marked requisition ${updated.referenceCode} as ${updated.status}.`,
    metadata: {
      referenceCode: updated.referenceCode,
      decision: input.decision,
      remarks: updated.decisionRemarks,
    },
  });

  return { requisition: updated };
});

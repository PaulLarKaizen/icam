import { requireUser } from "~~/server/utils/auth/require-user";
import { requireRole } from "~~/server/utils/auth/require-permission";
import { REQUISITION_SUBMIT_ROLES } from "~~/server/policies/requisition.policy";
import { validateCreateRequisition } from "~~/server/validators/requisition.validator";
import { createRequisition } from "~~/server/repositories/requisition.repository";
import { recordActivityLog } from "~~/server/services/activity-log";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  requireRole(
    user,
    REQUISITION_SUBMIT_ROLES,
    "Only faculty members and coordinators can submit digital requisitions.",
  );

  const body = await readBody(event);
  const input = validateCreateRequisition(body);
  const created = await createRequisition(event, user, input);

  await recordActivityLog(event, {
    actor: user,
    moduleCode: "M06",
    action: "requisition.submitted",
    entityType: "requisition",
    entityId: created.id,
    summary: `Submitted requisition ${created.referenceCode} for ${created.courseActivity} (${created.items.length} item(s), late=${created.isLateRequest}).`,
    metadata: {
      referenceCode: created.referenceCode,
      borrowerName: created.borrowerName,
      isLateRequest: created.isLateRequest,
      itemCount: created.items.length,
    },
  });

  setResponseStatus(event, 201);
  return { requisition: created };
});

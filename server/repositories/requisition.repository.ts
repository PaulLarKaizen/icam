import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { DEFAULT_ADVANCE_NOTICE_HOURS } from "~~/shared/constants/requisition";
import type { AuthenticatedIcamUser } from "~~/shared/types/auth";
import type {
  CreateRequisitionInput,
  RequisitionLineItem,
  RequisitionRecord,
  ReviewRequisitionInput,
} from "~~/shared/types/requisition";

const REQUISITION_SELECT = `
  *,
  requester:user_profiles!requisitions_requester_id_fkey(full_name),
  reviewer:user_profiles!requisitions_reviewer_id_fkey(full_name),
  requisition_items(
    *,
    inventory_items(name, specification, unit, tracking_mode)
  )
`;

function mapLineItem(row: Record<string, any>): RequisitionLineItem {
  return {
    id: row.id,
    requisitionId: row.requisition_id,
    itemId: row.item_id,
    itemName: row.inventory_items?.name,
    itemSpecification: row.inventory_items?.specification,
    itemUnit: row.inventory_items?.unit,
    trackingMode: row.inventory_items?.tracking_mode,
    requestedQty: row.requested_qty,
    approvedQty: row.approved_qty,
    assignedSerials: Array.isArray(row.assigned_serials)
      ? row.assigned_serials
      : [],
    remarks: row.remarks ?? "",
  };
}

function mapRequisitionRow(row: Record<string, any>): RequisitionRecord {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    qrToken: row.qr_token ?? "",
    requesterId: row.requester_id,
    requesterName: row.requester?.full_name ?? "",
    borrowerName: row.borrower_name,
    borrowerStudentId: row.borrower_student_id ?? "",
    schoolDepartment: row.school_department ?? "SMLS",
    courseYearSection: row.course_year_section,
    courseActivity: row.course_activity,
    neededAt: row.needed_at,
    expectedReturnAt: row.expected_return_at,
    isLateRequest: Boolean(row.is_late_request),
    lateRequestReason: row.late_request_reason ?? "",
    status: row.status,
    reviewerId: row.reviewer_id ?? null,
    reviewerName: row.reviewer?.full_name ?? null,
    reviewedAt: row.reviewed_at ?? null,
    decisionRemarks: row.decision_remarks ?? "",
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    items: Array.isArray(row.requisition_items)
      ? row.requisition_items.map(mapLineItem)
      : [],
  };
}

export async function listRequisitions(
  event: H3Event,
  user: AuthenticatedIcamUser,
): Promise<RequisitionRecord[]> {
  if (user.role === "student" && !user.studentOrEmployeeId.trim()) {
    return [];
  }

  const client = serverSupabaseServiceRole<any>(event);
  let builder = client
    .from("requisitions")
    .select(REQUISITION_SELECT)
    .order("submitted_at", { ascending: false });

  if (user.role === "faculty") {
    builder = builder.eq("requester_id", user.id);
  } else if (user.role === "student") {
    builder = builder.eq(
      "borrower_student_id",
      user.studentOrEmployeeId.trim(),
    );
  }

  const { data, error } = await builder;
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load requisitions: ${error.message}`,
    });
  }

  return (data ?? []).map(mapRequisitionRow);
}

export async function getRequisitionById(
  event: H3Event,
  id: string,
): Promise<RequisitionRecord | null> {
  const client = serverSupabaseServiceRole<any>(event);
  const { data, error } = await client
    .from("requisitions")
    .select(REQUISITION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load requisition: ${error.message}`,
    });
  }

  return data ? mapRequisitionRow(data) : null;
}

export async function createRequisition(
  event: H3Event,
  user: AuthenticatedIcamUser,
  input: CreateRequisitionInput,
): Promise<RequisitionRecord> {
  const client = serverSupabaseServiceRole<any>(event);

  // Verify all requested items exist and are active
  const itemIds = input.items.map((item) => item.itemId);
  const { data: catalogItems, error: itemsError } = await client
    .from("inventory_items")
    .select("id, name, is_active")
    .in("id", itemIds);

  if (itemsError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to verify catalog items: ${itemsError.message}`,
    });
  }

  const activeIds = new Set(
    (catalogItems ?? [])
      .filter((item) => item.is_active)
      .map((item) => item.id),
  );
  for (const line of input.items) {
    if (!activeIds.has(line.itemId)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "One or more selected inventory items are inactive or do not exist.",
      });
    }
  }

  // Server-authoritative submission timestamp & late-request flag
  const submittedAt = new Date();
  const leadTimeMs = new Date(input.neededAt).getTime() - submittedAt.getTime();
  const isLateRequest =
    leadTimeMs < DEFAULT_ADVANCE_NOTICE_HOURS * 60 * 60 * 1000;

  const { data: insertedReq, error: reqError } = await client
    .from("requisitions")
    .insert({
      requester_id: user.id,
      borrower_name: input.borrowerName,
      borrower_student_id: input.borrowerStudentId ?? "",
      school_department: input.schoolDepartment ?? "SMLS",
      course_year_section: input.courseYearSection,
      course_activity: input.courseActivity,
      needed_at: input.neededAt,
      expected_return_at: input.expectedReturnAt,
      is_late_request: isLateRequest,
      late_request_reason: input.lateRequestReason ?? "",
      status: "Submitted",
      submitted_at: submittedAt.toISOString(),
    })
    .select("id")
    .single();

  if (reqError || !insertedReq) {
    throw createError({
      statusCode: 400,
      statusMessage: reqError?.message ?? "Failed to submit requisition.",
    });
  }

  const lineRows = input.items.map((line) => ({
    requisition_id: insertedReq.id,
    item_id: line.itemId,
    requested_qty: line.requestedQty,
    remarks: line.remarks ?? "",
  }));

  const { error: lineError } = await client
    .from("requisition_items")
    .insert(lineRows);
  if (lineError) {
    await client.from("requisitions").delete().eq("id", insertedReq.id);
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to save requisition line items: ${lineError.message}`,
    });
  }

  const created = await getRequisitionById(event, insertedReq.id);
  if (!created) {
    throw createError({
      statusCode: 500,
      statusMessage: "Requisition created but could not be reloaded.",
    });
  }

  return created;
}

export async function reviewRequisition(
  event: H3Event,
  user: AuthenticatedIcamUser,
  requisitionId: string,
  input: ReviewRequisitionInput,
): Promise<RequisitionRecord> {
  const client = serverSupabaseServiceRole<any>(event);

  if (input.decision === "approve") {
    const { error } = await client.rpc("approve_requisition", {
      p_requisition_id: requisitionId,
      p_reviewer_id: user.id,
      p_item_decisions: input.itemDecisions ?? null,
      p_remarks: input.remarks ?? "",
    });

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }
  } else {
    const targetStatus = input.decision === "reject" ? "Rejected" : "Cancelled";
    const { error } = await client.rpc("reject_or_cancel_requisition", {
      p_requisition_id: requisitionId,
      p_actor_id: user.id,
      p_new_status: targetStatus,
      p_remarks: input.remarks ?? "",
    });

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }
  }

  const updated = await getRequisitionById(event, requisitionId);
  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: "Requisition not found after update.",
    });
  }

  return updated;
}

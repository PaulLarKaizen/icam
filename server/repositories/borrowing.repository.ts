import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { AuthenticatedIcamUser } from "~~/shared/types/auth";
import type {
  BorrowingTransaction,
  BorrowingTransactionItem,
  ClearLiabilityCaseInput,
  InspectBorrowingReturnInput,
  IssueRequisitionInput,
  LiabilityCase,
  LiabilityCaseItem,
} from "~~/shared/types/borrowing";
import type { RequisitionRecord } from "~~/shared/types/requisition";

const BORROWING_SELECT = `
  *,
  requisition:requisitions!inner(
    reference_code,
    course_activity,
    course_year_section,
    requester_id,
    requester:user_profiles!requisitions_requester_id_fkey(full_name)
  ),
  issuer:user_profiles!borrowing_transactions_issued_by_fkey(full_name),
  borrowing_transaction_items(
    *,
    inventory_items(name, specification, unit, tracking_mode)
  )
`;

const LIABILITY_SELECT = `
  *,
  requisition:requisitions!inner(
    reference_code,
    requester_id
  ),
  liability_case_items(
    *,
    inventory_items(name, specification, unit)
  )
`;

function mapBorrowingItem(row: Record<string, any>): BorrowingTransactionItem {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    requisitionItemId: row.requisition_item_id,
    itemId: row.item_id,
    itemName: row.inventory_items?.name,
    itemSpecification: row.inventory_items?.specification,
    itemUnit: row.inventory_items?.unit,
    trackingMode: row.inventory_items?.tracking_mode,
    issuedQty: row.issued_qty,
    issuedSerials: Array.isArray(row.issued_serials) ? row.issued_serials : [],
    returnedGoodQty: row.returned_good_qty,
    damagedQty: row.damaged_qty,
    lostQty: row.lost_qty,
    damagedSerials: Array.isArray(row.damaged_serials)
      ? row.damaged_serials
      : [],
    lostSerials: Array.isArray(row.lost_serials) ? row.lost_serials : [],
    conditionNotes: row.condition_notes ?? "",
  };
}

function mapBorrowingRow(row: Record<string, any>): BorrowingTransaction {
  return {
    id: row.id,
    requisitionId: row.requisition_id,
    referenceCode: row.requisition?.reference_code,
    courseActivity: row.requisition?.course_activity,
    courseYearSection: row.requisition?.course_year_section,
    requesterName: row.requisition?.requester?.full_name ?? "",
    issuedBy: row.issued_by,
    issuedByName: row.issuer?.full_name ?? "",
    receivedByName: row.received_by_name,
    receivedByStudentId: row.received_by_student_id ?? "",
    facultySignatureVerified: Boolean(row.faculty_signature_verified),
    borrowerSignatureVerified: Boolean(row.borrower_signature_verified),
    studentIdStatus: row.student_id_status,
    preReleaseNotes: row.pre_release_notes ?? "",
    issuedAt: row.issued_at,
    returnedAt: row.returned_at ?? null,
    inspectedBy: row.inspected_by ?? null,
    returnNotes: row.return_notes ?? "",
    status: row.status,
    items: Array.isArray(row.borrowing_transaction_items)
      ? row.borrowing_transaction_items.map(mapBorrowingItem)
      : [],
  };
}

function mapLiabilityItem(row: Record<string, any>): LiabilityCaseItem {
  return {
    id: row.id,
    liabilityCaseId: row.liability_case_id,
    itemId: row.item_id,
    itemName: row.inventory_items?.name,
    itemSpecification: row.inventory_items?.specification,
    itemUnit: row.inventory_items?.unit,
    quantity: row.quantity,
    incidentRemark: row.incident_remark,
    affectedSerials: Array.isArray(row.affected_serials)
      ? row.affected_serials
      : [],
    notes: row.notes ?? "",
  };
}

function mapLiabilityRow(row: Record<string, any>): LiabilityCase {
  return {
    id: row.id,
    caseCode: row.case_code,
    transactionId: row.transaction_id,
    requisitionId: row.requisition_id,
    referenceCode: row.requisition?.reference_code,
    liablePersonName: row.liable_person_name,
    liablePersonRole: row.liable_person_role,
    liablePersonIdNumber: row.liable_person_id_number ?? "",
    schoolDepartment: row.school_department ?? "SMLS",
    replacementMode: row.replacement_mode ?? null,
    proofReference: row.proof_reference ?? "",
    acknowledgedByLiable: Boolean(row.acknowledged_by_liable),
    attestedByFaculty: Boolean(row.attested_by_faculty),
    clearanceStatus: row.clearance_status,
    clearanceNotes: row.clearance_notes ?? "",
    recordedBy: row.recorded_by,
    clearedBy: row.cleared_by ?? null,
    clearedAt: row.cleared_at ?? null,
    createdAt: row.created_at,
    items: Array.isArray(row.liability_case_items)
      ? row.liability_case_items.map(mapLiabilityItem)
      : [],
  };
}

export async function lookupRequisitionByQrOrRef(
  event: H3Event,
  tokenOrRef: string,
): Promise<RequisitionRecord | null> {
  const cleaned = tokenOrRef.trim();
  if (!cleaned) return null;

  const client = serverSupabaseServiceRole<any>(event);
  const { data, error } = await client
    .from("requisitions")
    .select(
      `
      *,
      requester:user_profiles!requisitions_requester_id_fkey(full_name),
      reviewer:user_profiles!requisitions_reviewer_id_fkey(full_name),
      requisition_items(
        *,
        inventory_items(name, specification, unit, tracking_mode)
      )
    `,
    )
    .or(`qr_token.eq.${cleaned},reference_code.eq.${cleaned}`)
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to retrieve requisition by QR/reference: ${error.message}`,
    });
  }

  if (!data) return null;

  return {
    id: data.id,
    referenceCode: data.reference_code,
    qrToken: data.qr_token ?? "",
    requesterId: data.requester_id,
    requesterName: data.requester?.full_name ?? "",
    borrowerName: data.borrower_name,
    borrowerStudentId: data.borrower_student_id ?? "",
    schoolDepartment: data.school_department ?? "SMLS",
    courseYearSection: data.course_year_section,
    courseActivity: data.course_activity,
    neededAt: data.needed_at,
    expectedReturnAt: data.expected_return_at,
    isLateRequest: Boolean(data.is_late_request),
    lateRequestReason: data.late_request_reason ?? "",
    status: data.status,
    reviewerId: data.reviewer_id ?? null,
    reviewerName: data.reviewer?.full_name ?? null,
    reviewedAt: data.reviewed_at ?? null,
    decisionRemarks: data.decision_remarks ?? "",
    submittedAt: data.submitted_at,
    updatedAt: data.updated_at,
    items: Array.isArray(data.requisition_items)
      ? data.requisition_items.map((row: Record<string, any>) => ({
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
        }))
      : [],
  };
}

export async function listBorrowingTransactions(
  event: H3Event,
  user: AuthenticatedIcamUser,
): Promise<BorrowingTransaction[]> {
  if (user.role === "student" && !user.studentOrEmployeeId.trim()) {
    return [];
  }

  const client = serverSupabaseServiceRole<any>(event);
  let builder = client
    .from("borrowing_transactions")
    .select(BORROWING_SELECT)
    .order("issued_at", { ascending: false });

  if (user.role === "faculty") {
    builder = builder.eq("requisition.requester_id", user.id);
  } else if (user.role === "student") {
    builder = builder.eq(
      "received_by_student_id",
      user.studentOrEmployeeId.trim(),
    );
  }

  const { data, error } = await builder;
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load borrowing transactions: ${error.message}`,
    });
  }

  return (data ?? []).map(mapBorrowingRow);
}

export async function getBorrowingTransactionById(
  event: H3Event,
  id: string,
): Promise<BorrowingTransaction | null> {
  const client = serverSupabaseServiceRole<any>(event);
  const { data, error } = await client
    .from("borrowing_transactions")
    .select(BORROWING_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load borrowing transaction: ${error.message}`,
    });
  }

  return data ? mapBorrowingRow(data) : null;
}

export async function issueRequisition(
  event: H3Event,
  custodian: AuthenticatedIcamUser,
  input: IssueRequisitionInput,
): Promise<BorrowingTransaction> {
  const client = serverSupabaseServiceRole<any>(event);
  const { data: txId, error } = await client.rpc("issue_requisition", {
    p_requisition_id: input.requisitionId,
    p_custodian_id: custodian.id,
    p_received_by_name: input.receivedByName,
    p_received_by_student_id: input.receivedByStudentId ?? "",
    p_faculty_sig_verified: input.facultySignatureVerified,
    p_borrower_sig_verified: input.borrowerSignatureVerified,
    p_student_id_held: input.studentIdHeld,
    p_notes: input.preReleaseNotes ?? "",
  });

  if (error || !txId) {
    throw createError({
      statusCode: 400,
      statusMessage: error?.message ?? "Failed to issue laboratory items.",
    });
  }

  const created = await getBorrowingTransactionById(event, txId as string);
  if (!created) {
    throw createError({
      statusCode: 500,
      statusMessage: "Transaction recorded but could not be reloaded.",
    });
  }

  return created;
}

export async function inspectBorrowingReturn(
  event: H3Event,
  custodian: AuthenticatedIcamUser,
  transactionId: string,
  input: InspectBorrowingReturnInput,
): Promise<{
  transaction: BorrowingTransaction;
  liabilityCaseId: string | null;
}> {
  const client = serverSupabaseServiceRole<any>(event);
  const { data: liabilityId, error } = await client.rpc(
    "inspect_borrowing_return",
    {
      p_transaction_id: transactionId,
      p_custodian_id: custodian.id,
      p_item_inspections: input.itemInspections,
      p_return_notes: input.returnNotes ?? "",
    },
  );

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  const updated = await getBorrowingTransactionById(event, transactionId);
  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: "Borrowing transaction not found after return inspection.",
    });
  }

  return {
    transaction: updated,
    liabilityCaseId: (liabilityId as string | null) ?? null,
  };
}

export async function listLiabilityCases(
  event: H3Event,
  user: AuthenticatedIcamUser,
): Promise<LiabilityCase[]> {
  if (user.role === "student" && !user.studentOrEmployeeId.trim()) {
    return [];
  }

  const client = serverSupabaseServiceRole<any>(event);
  let builder = client
    .from("liability_cases")
    .select(LIABILITY_SELECT)
    .order("created_at", { ascending: false });

  if (user.role === "faculty") {
    builder = builder.eq("requisition.requester_id", user.id);
  } else if (user.role === "student") {
    builder = builder.eq(
      "liable_person_id_number",
      user.studentOrEmployeeId.trim(),
    );
  }

  const { data, error } = await builder;
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load liability cases: ${error.message}`,
    });
  }

  return (data ?? []).map(mapLiabilityRow);
}

export async function getLiabilityCaseById(
  event: H3Event,
  id: string,
): Promise<LiabilityCase | null> {
  const client = serverSupabaseServiceRole<any>(event);
  const { data, error } = await client
    .from("liability_cases")
    .select(LIABILITY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load liability case: ${error.message}`,
    });
  }

  return data ? mapLiabilityRow(data) : null;
}

export async function clearLiabilityCase(
  event: H3Event,
  custodian: AuthenticatedIcamUser,
  liabilityId: string,
  input: ClearLiabilityCaseInput,
): Promise<LiabilityCase> {
  const client = serverSupabaseServiceRole<any>(event);
  const { error } = await client.rpc("clear_liability_case", {
    p_liability_id: liabilityId,
    p_custodian_id: custodian.id,
    p_replacement_mode: input.replacementMode,
    p_proof_reference: input.proofReference,
    p_acknowledged_by_liable: input.acknowledgedByLiable,
    p_attested_by_faculty: input.attestedByFaculty,
    p_restock_replaced: input.restockReplaced ?? false,
    p_clearance_notes: input.clearanceNotes ?? "",
  });

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  const updated = await getLiabilityCaseById(event, liabilityId);
  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: "Liability case not found after clearance.",
    });
  }

  return updated;
}

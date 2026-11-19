export type RequisitionStatus =
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Issued"
  | "Completed";

export interface RequisitionLineItem {
  id: string;
  requisitionId: string;
  itemId: string;
  itemName?: string;
  itemSpecification?: string;
  itemUnit?: string;
  trackingMode?: "quantity" | "serialized";
  requestedQty: number;
  approvedQty: number;
  assignedSerials: string[];
  remarks: string;
}

export interface RequisitionRecord {
  id: string;
  referenceCode: string;
  qrToken: string;
  requesterId: string;
  requesterName?: string;
  borrowerName: string;
  borrowerStudentId: string;
  schoolDepartment: string;
  courseYearSection: string;
  courseActivity: string;
  neededAt: string;
  expectedReturnAt: string;
  isLateRequest: boolean;
  lateRequestReason: string;
  status: RequisitionStatus;
  reviewerId: string | null;
  reviewerName?: string | null;
  reviewedAt: string | null;
  decisionRemarks: string;
  submittedAt: string;
  updatedAt: string;
  items: RequisitionLineItem[];
}

export interface CreateRequisitionItemInput {
  itemId: string;
  requestedQty: number;
  remarks?: string;
}

export interface CreateRequisitionInput {
  borrowerName: string;
  borrowerStudentId?: string;
  schoolDepartment?: string;
  courseYearSection: string;
  courseActivity: string;
  neededAt: string;
  expectedReturnAt: string;
  lateRequestReason?: string;
  items: CreateRequisitionItemInput[];
}

export interface ApproveRequisitionItemDecision {
  requisitionItemId: string;
  approvedQty: number;
}

export interface ReviewRequisitionInput {
  decision: "approve" | "reject" | "cancel";
  remarks?: string;
  itemDecisions?: ApproveRequisitionItemDecision[];
}

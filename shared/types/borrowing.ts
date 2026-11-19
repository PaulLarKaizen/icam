export type BorrowingStatus =
  | "Issued"
  | "Returned"
  | "Liability Pending"
  | "Cleared";

export type StudentIdCustodyStatus = "Held" | "Returned" | "Retained";

export type LiabilityClearanceStatus = "Unresolved" | "Cleared";

export type LiabilityReplacementMode =
  | "Payment at the cashier"
  | "Replace the item";

export interface BorrowingTransactionItem {
  id: string;
  transactionId: string;
  requisitionItemId: string;
  itemId: string;
  itemName?: string;
  itemSpecification?: string;
  itemUnit?: string;
  trackingMode?: "quantity" | "serialized";
  issuedQty: number;
  issuedSerials: string[];
  returnedGoodQty: number;
  damagedQty: number;
  lostQty: number;
  damagedSerials: string[];
  lostSerials: string[];
  conditionNotes: string;
}

export interface BorrowingTransaction {
  id: string;
  requisitionId: string;
  referenceCode?: string;
  courseActivity?: string;
  courseYearSection?: string;
  requesterName?: string;
  issuedBy: string;
  issuedByName?: string;
  receivedByName: string;
  receivedByStudentId: string;
  facultySignatureVerified: boolean;
  borrowerSignatureVerified: boolean;
  studentIdStatus: StudentIdCustodyStatus;
  preReleaseNotes: string;
  issuedAt: string;
  returnedAt: string | null;
  inspectedBy: string | null;
  returnNotes: string;
  status: BorrowingStatus;
  items: BorrowingTransactionItem[];
}

export interface LiabilityCaseItem {
  id: string;
  liabilityCaseId: string;
  itemId: string;
  itemName?: string;
  itemSpecification?: string;
  itemUnit?: string;
  quantity: number;
  incidentRemark: "Lost" | "Broken" | "Others";
  affectedSerials: string[];
  notes: string;
}

export interface LiabilityCase {
  id: string;
  caseCode: string;
  transactionId: string;
  requisitionId: string;
  referenceCode?: string;
  liablePersonName: string;
  liablePersonRole: string;
  liablePersonIdNumber: string;
  schoolDepartment: string;
  replacementMode: LiabilityReplacementMode | null;
  proofReference: string;
  acknowledgedByLiable: boolean;
  attestedByFaculty: boolean;
  clearanceStatus: LiabilityClearanceStatus;
  clearanceNotes: string;
  recordedBy: string;
  clearedBy: string | null;
  clearedAt: string | null;
  createdAt: string;
  items: LiabilityCaseItem[];
}

export interface IssueRequisitionInput {
  requisitionId: string;
  receivedByName: string;
  receivedByStudentId?: string;
  facultySignatureVerified: boolean;
  borrowerSignatureVerified: boolean;
  studentIdHeld: boolean;
  preReleaseNotes?: string;
}

export interface InspectReturnLineInput {
  transactionItemId: string;
  returnedGoodQty: number;
  damagedQty: number;
  lostQty: number;
  damagedSerials?: string[];
  lostSerials?: string[];
  conditionNotes?: string;
}

export interface InspectBorrowingReturnInput {
  itemInspections: InspectReturnLineInput[];
  returnNotes?: string;
}

export interface ClearLiabilityCaseInput {
  replacementMode: LiabilityReplacementMode;
  proofReference: string;
  acknowledgedByLiable: boolean;
  attestedByFaculty: boolean;
  restockReplaced?: boolean;
  clearanceNotes?: string;
}

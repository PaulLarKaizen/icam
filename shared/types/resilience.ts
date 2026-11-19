import type { IcamRole } from "./auth";

export interface ActivityLogRecord {
  id: string;
  actorId: string;
  actorName?: string;
  actorRole: IcamRole;
  moduleCode: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type OutageFormType = "F-VPA-012" | "F-VPA-011 Rev.1";

export type OutageReconciliationStatus = "Reconciled" | "Needs Follow-up";

export interface OutageRecoveryRecord {
  id: string;
  outageReference: string;
  formType: OutageFormType;
  incidentOccurredAt: string;
  borrowerName: string;
  courseActivity: string;
  ocrRawText: string;
  verifiedSummary: string;
  linkedRequisitionId: string | null;
  linkedReferenceCode?: string | null;
  humanVerified: boolean;
  reconciliationStatus: OutageReconciliationStatus;
  recordedBy: string;
  recordedByName?: string;
  createdAt: string;
}

export interface CreateOutageRecoveryInput {
  outageReference: string;
  formType: OutageFormType;
  incidentOccurredAt: string;
  borrowerName?: string;
  courseActivity?: string;
  ocrRawText?: string;
  verifiedSummary: string;
  linkedRequisitionId?: string | null;
  humanVerified: boolean;
  reconciliationStatus?: OutageReconciliationStatus;
}

export interface BackupSnapshotRecord {
  id: string;
  snapshotCode: string;
  snapshotType: "export" | "restore_check";
  tableCounts: Record<string, number>;
  notes: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface BackupExportBundle {
  snapshot: BackupSnapshotRecord;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

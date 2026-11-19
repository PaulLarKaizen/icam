import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { AuthenticatedIcamUser } from "~~/shared/types/auth";
import type {
  ActivityLogRecord,
  BackupExportBundle,
  BackupSnapshotRecord,
  CreateOutageRecoveryInput,
  OutageRecoveryRecord,
} from "~~/shared/types/resilience";
import { recordActivityLog } from "../services/activity-log";

const BACKUP_TABLES = [
  "user_profiles",
  "inventory_items",
  "inventory_assets",
  "requisitions",
  "requisition_items",
  "borrowing_transactions",
  "borrowing_transaction_items",
  "liability_cases",
  "liability_case_items",
  "outage_recovery_logs",
  "activity_logs",
] as const;

export async function listActivityLogs(
  event: H3Event,
  moduleCode?: string,
  limit = 100,
): Promise<ActivityLogRecord[]> {
  const client = serverSupabaseServiceRole<any>(event);

  let query = client
    .from("activity_logs")
    .select(
      `
      id,
      actor_id,
      actor_role,
      module_code,
      action,
      entity_type,
      entity_id,
      summary,
      metadata,
      created_at,
      actor:user_profiles!activity_logs_actor_id_fkey (full_name, email)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 250));

  if (moduleCode && moduleCode.trim()) {
    query = query.eq("module_code", moduleCode.trim().toUpperCase());
  }

  const { data, error } = await query;

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load activity logs: ${error.message}`,
    });
  }

  return (data ?? []).map((row: Record<string, any>) => ({
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor?.full_name || row.actor?.email || "System User",
    actorRole: row.actor_role,
    moduleCode: row.module_code,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  }));
}

export async function listOutageRecoveryLogs(
  event: H3Event,
): Promise<OutageRecoveryRecord[]> {
  const client = serverSupabaseServiceRole<any>(event);

  const { data, error } = await client
    .from("outage_recovery_logs")
    .select(
      `
      id,
      outage_reference,
      form_type,
      incident_occurred_at,
      borrower_name,
      course_activity,
      ocr_raw_text,
      verified_summary,
      linked_requisition_id,
      human_verified,
      reconciliation_status,
      recorded_by,
      created_at,
      recorder:user_profiles!outage_recovery_logs_recorded_by_fkey (full_name),
      requisition:requisitions!outage_recovery_logs_linked_requisition_id_fkey (reference_code)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load outage recovery logs: ${error.message}`,
    });
  }

  return (data ?? []).map((row: Record<string, any>) => ({
    id: row.id,
    outageReference: row.outage_reference,
    formType: row.form_type,
    incidentOccurredAt: row.incident_occurred_at,
    borrowerName: row.borrower_name ?? "",
    courseActivity: row.course_activity ?? "",
    ocrRawText: row.ocr_raw_text ?? "",
    verifiedSummary: row.verified_summary,
    linkedRequisitionId: row.linked_requisition_id ?? null,
    linkedReferenceCode: row.requisition?.reference_code ?? null,
    humanVerified: Boolean(row.human_verified),
    reconciliationStatus: row.reconciliation_status,
    recordedBy: row.recorded_by,
    recordedByName: row.recorder?.full_name ?? "",
    createdAt: row.created_at,
  }));
}

export async function createOutageRecoveryLog(
  event: H3Event,
  actor: AuthenticatedIcamUser,
  input: CreateOutageRecoveryInput,
): Promise<OutageRecoveryRecord> {
  const client = serverSupabaseServiceRole<any>(event);

  const { data, error } = await client
    .from("outage_recovery_logs")
    .insert({
      outage_reference: input.outageReference,
      form_type: input.formType,
      incident_occurred_at: input.incidentOccurredAt,
      borrower_name: input.borrowerName ?? "",
      course_activity: input.courseActivity ?? "",
      ocr_raw_text: input.ocrRawText ?? "",
      verified_summary: input.verifiedSummary,
      linked_requisition_id: input.linkedRequisitionId ?? null,
      human_verified: true,
      reconciliation_status: input.reconciliationStatus ?? "Reconciled",
      recorded_by: actor.id,
    })
    .select(
      `
      id,
      outage_reference,
      form_type,
      incident_occurred_at,
      borrower_name,
      course_activity,
      ocr_raw_text,
      verified_summary,
      linked_requisition_id,
      human_verified,
      reconciliation_status,
      recorded_by,
      created_at
    `,
    )
    .single();

  if (error || !data) {
    throw createError({
      statusCode: error?.code === "23505" ? 409 : 400,
      statusMessage:
        error?.code === "23505"
          ? `Outage Reference "${input.outageReference}" has already been logged.`
          : (error?.message ?? "Failed to save outage recovery record."),
    });
  }

  await recordActivityLog(event, {
    actor,
    moduleCode: "M14",
    action: "OUTAGE_RECOVERY_RECONCILED",
    entityType: "outage_recovery_log",
    entityId: data.id,
    summary: `Reconciled paper outage form ${data.form_type} (${data.outage_reference})`,
    metadata: {
      outageReference: data.outage_reference,
      formType: data.form_type,
      reconciliationStatus: data.reconciliation_status,
    },
  });

  return {
    id: data.id,
    outageReference: data.outage_reference,
    formType: data.form_type,
    incidentOccurredAt: data.incident_occurred_at,
    borrowerName: data.borrower_name ?? "",
    courseActivity: data.course_activity ?? "",
    ocrRawText: data.ocr_raw_text ?? "",
    verifiedSummary: data.verified_summary,
    linkedRequisitionId: data.linked_requisition_id ?? null,
    linkedReferenceCode: null,
    humanVerified: Boolean(data.human_verified),
    reconciliationStatus: data.reconciliation_status,
    recordedBy: data.recorded_by,
    recordedByName: actor.fullName,
    createdAt: data.created_at,
  };
}

export async function listBackupSnapshots(
  event: H3Event,
): Promise<BackupSnapshotRecord[]> {
  const client = serverSupabaseServiceRole<any>(event);

  const { data, error } = await client
    .from("backup_snapshots")
    .select(
      `
      id,
      snapshot_code,
      snapshot_type,
      table_counts,
      notes,
      created_by,
      created_at,
      creator:user_profiles!backup_snapshots_created_by_fkey (full_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load backup snapshots: ${error.message}`,
    });
  }

  return (data ?? []).map((row: Record<string, any>) => ({
    id: row.id,
    snapshotCode: row.snapshot_code,
    snapshotType: row.snapshot_type,
    tableCounts: row.table_counts ?? {},
    notes: row.notes ?? "",
    createdBy: row.created_by,
    createdByName: row.creator?.full_name ?? "",
    createdAt: row.created_at,
  }));
}

export async function createBackupExport(
  event: H3Event,
  actor: AuthenticatedIcamUser,
  notes: string,
): Promise<BackupExportBundle> {
  const client = serverSupabaseServiceRole<any>(event);
  const tables: Record<string, unknown[]> = {};
  const tableCounts: Record<string, number> = {};

  for (const tableName of BACKUP_TABLES) {
    const { data, error } = await client.from(tableName).select("*");
    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Backup export failed on table "${tableName}": ${error.message}`,
      });
    }
    const rows = data ?? [];
    tables[tableName] = rows;
    tableCounts[tableName] = rows.length;
  }

  const { data: snapRow, error: snapError } = await client
    .from("backup_snapshots")
    .insert({
      snapshot_type: "export",
      table_counts: tableCounts,
      notes,
      created_by: actor.id,
    })
    .select(
      "id, snapshot_code, snapshot_type, table_counts, notes, created_by, created_at",
    )
    .single();

  if (snapError || !snapRow) {
    throw createError({
      statusCode: 500,
      statusMessage:
        snapError?.message ?? "Failed to record backup snapshot metadata.",
    });
  }

  await recordActivityLog(event, {
    actor,
    moduleCode: "M15",
    action: "BACKUP_SNAPSHOT_EXPORTED",
    entityType: "backup_snapshot",
    entityId: snapRow.id,
    summary: `Exported ICAM backup snapshot ${snapRow.snapshot_code}`,
    metadata: {
      snapshotCode: snapRow.snapshot_code,
      tableCounts,
    },
  });

  return {
    snapshot: {
      id: snapRow.id,
      snapshotCode: snapRow.snapshot_code,
      snapshotType: snapRow.snapshot_type,
      tableCounts: snapRow.table_counts ?? {},
      notes: snapRow.notes ?? "",
      createdBy: snapRow.created_by,
      createdByName: actor.fullName,
      createdAt: snapRow.created_at,
    },
    exportedAt: snapRow.created_at,
    tables,
  };
}

export async function verifyBackupBundle(
  event: H3Event,
  actor: AuthenticatedIcamUser,
  bundle: {
    snapshotCode: string;
    exportedAt: string;
    tables: Record<string, unknown[]>;
  },
): Promise<BackupSnapshotRecord> {
  const client = serverSupabaseServiceRole<any>(event);

  const tableCounts: Record<string, number> = {};
  for (const [key, rows] of Object.entries(bundle.tables)) {
    tableCounts[key] = Array.isArray(rows) ? rows.length : 0;
  }

  const missingTables = BACKUP_TABLES.filter((t) => !(t in bundle.tables));
  const verificationNote =
    missingTables.length === 0
      ? `Verified backup bundle ${bundle.snapshotCode} (all ${BACKUP_TABLES.length} core tables present).`
      : `Verified backup bundle ${bundle.snapshotCode} (missing tables: ${missingTables.join(", ")}).`;

  const { data: snapRow, error } = await client
    .from("backup_snapshots")
    .insert({
      snapshot_type: "restore_check",
      table_counts: tableCounts,
      notes: verificationNote,
      created_by: actor.id,
    })
    .select(
      "id, snapshot_code, snapshot_type, table_counts, notes, created_by, created_at",
    )
    .single();

  if (error || !snapRow) {
    throw createError({
      statusCode: 500,
      statusMessage:
        error?.message ?? "Failed to record backup verification check.",
    });
  }

  await recordActivityLog(event, {
    actor,
    moduleCode: "M15",
    action: "BACKUP_BUNDLE_VERIFIED",
    entityType: "backup_snapshot",
    entityId: snapRow.id,
    summary: verificationNote,
    metadata: {
      verifiedSnapshotCode: bundle.snapshotCode,
      tableCounts,
    },
  });

  return {
    id: snapRow.id,
    snapshotCode: snapRow.snapshot_code,
    snapshotType: snapRow.snapshot_type,
    tableCounts: snapRow.table_counts ?? {},
    notes: snapRow.notes ?? "",
    createdBy: snapRow.created_by,
    createdByName: actor.fullName,
    createdAt: snapRow.created_at,
  };
}

import { z } from "zod";
import type { CreateOutageRecoveryInput } from "~~/shared/types/resilience";

const createOutageRecoverySchema = z
  .object({
    outageReference: z
      .string()
      .trim()
      .min(1, "Outage Reference ID is required")
      .max(80),
    formType: z.enum(["F-VPA-012", "F-VPA-011 Rev.1"]),
    incidentOccurredAt: z
      .string()
      .datetime({
        offset: true,
        message: "Valid outage transaction date/time is required",
      }),
    borrowerName: z.string().trim().max(140).optional().default(""),
    courseActivity: z.string().trim().max(180).optional().default(""),
    ocrRawText: z.string().max(10000).optional().default(""),
    verifiedSummary: z
      .string()
      .trim()
      .min(1, "Human-verified transaction summary is required")
      .max(1000),
    linkedRequisitionId: z.string().uuid().nullable().optional().default(null),
    humanVerified: z.literal(true, {
      error:
        "Mandatory human verification of OCR/paper details is required before saving.",
    }),
    reconciliationStatus: z
      .enum(["Reconciled", "Needs Follow-up"])
      .optional()
      .default("Reconciled"),
  })
  .strict();

const createBackupExportSchema = z
  .object({
    notes: z.string().trim().max(300).optional().default(""),
  })
  .strict();

const validateRestoreBundleSchema = z
  .object({
    snapshotCode: z.string().trim().min(1, "Snapshot code is required").max(80),
    exportedAt: z.string().datetime({ offset: true }),
    tables: z.record(z.string(), z.array(z.unknown())),
  })
  .strict();

export function validateCreateOutageRecovery(
  payload: unknown,
): CreateOutageRecoveryInput {
  const parsed = createOutageRecoverySchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid outage recovery payload.",
    });
  }
  return parsed.data;
}

export function validateBackupExportNotes(payload: unknown): { notes: string } {
  const parsed = createBackupExportSchema.safeParse(payload ?? {});
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid backup export request.",
    });
  }
  return parsed.data;
}

export function validateRestoreBundle(payload: unknown) {
  const parsed = validateRestoreBundleSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid backup snapshot structure.",
    });
  }
  return parsed.data;
}

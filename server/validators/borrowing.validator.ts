import { z } from "zod";
import type {
  ClearLiabilityCaseInput,
  InspectBorrowingReturnInput,
  IssueRequisitionInput,
} from "~~/shared/types/borrowing";

const issueRequisitionSchema = z
  .object({
    requisitionId: z.string().uuid("Valid requisition ID is required"),
    receivedByName: z
      .string()
      .trim()
      .min(1, "Borrower / group leader name is required")
      .max(140),
    receivedByStudentId: z.string().trim().max(40).optional().default(""),
    facultySignatureVerified: z.literal(true, {
      error:
        "Faculty In-charge wet-ink signature on F-VPA-012 must be verified before release.",
    }),
    borrowerSignatureVerified: z.literal(true, {
      error:
        "Borrower wet-ink signature on F-VPA-012 must be verified before release.",
    }),
    studentIdHeld: z.literal(true, {
      error:
        "Physical Student ID collateral must be collected and held before release.",
    }),
    preReleaseNotes: z.string().trim().max(500).optional().default(""),
  })
  .strict();

const inspectBorrowingReturnSchema = z
  .object({
    itemInspections: z
      .array(
        z.object({
          transactionItemId: z.string().uuid(),
          returnedGoodQty: z.number().int().min(0),
          damagedQty: z.number().int().min(0),
          lostQty: z.number().int().min(0),
          damagedSerials: z
            .array(z.string().trim().min(1))
            .optional()
            .default([]),
          lostSerials: z.array(z.string().trim().min(1)).optional().default([]),
          conditionNotes: z.string().trim().max(300).optional().default(""),
        }),
      )
      .min(1, "At least one inspected item line is required"),
    returnNotes: z.string().trim().max(500).optional().default(""),
  })
  .strict();

const clearLiabilityCaseSchema = z
  .object({
    replacementMode: z.enum(["Payment at the cashier", "Replace the item"]),
    proofReference: z
      .string()
      .trim()
      .min(
        1,
        "Official Receipt (OR) number or replacement verification reference is required",
      )
      .max(140),
    acknowledgedByLiable: z.literal(true, {
      error:
        "Liable person wet-ink acknowledgement on F-VPA-011 Rev.1 is required.",
    }),
    attestedByFaculty: z.boolean().optional().default(false),
    restockReplaced: z.boolean().optional().default(false),
    clearanceNotes: z.string().trim().max(500).optional().default(""),
  })
  .strict();

export function validateIssueRequisition(
  payload: unknown,
): IssueRequisitionInput {
  const parsed = issueRequisitionSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid issuance payload.",
    });
  }
  return parsed.data;
}

export function validateInspectBorrowingReturn(
  payload: unknown,
): InspectBorrowingReturnInput {
  const parsed = inspectBorrowingReturnSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid return inspection payload.",
    });
  }
  return parsed.data;
}

export function validateClearLiabilityCase(
  payload: unknown,
): ClearLiabilityCaseInput {
  const parsed = clearLiabilityCaseSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ??
        "Invalid liability clearance payload.",
    });
  }
  return parsed.data;
}

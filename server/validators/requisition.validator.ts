import { z } from "zod";
import type {
  CreateRequisitionInput,
  ReviewRequisitionInput,
} from "~~/shared/types/requisition";

const createRequisitionSchema = z
  .object({
    borrowerName: z
      .string()
      .trim()
      .min(1, "Designated borrower / group leader is required")
      .max(140),
    borrowerStudentId: z.string().trim().max(40).optional().default(""),
    schoolDepartment: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .optional()
      .default("SMLS"),
    courseYearSection: z
      .string()
      .trim()
      .min(1, "Course, year & section is required")
      .max(100),
    courseActivity: z
      .string()
      .trim()
      .min(1, "Course / laboratory activity is required")
      .max(180),
    neededAt: z
      .string()
      .datetime({
        offset: true,
        message: "Valid needed date & time is required",
      }),
    expectedReturnAt: z
      .string()
      .datetime({
        offset: true,
        message: "Valid expected return date & time is required",
      }),
    lateRequestReason: z.string().trim().max(400).optional().default(""),
    items: z
      .array(
        z.object({
          itemId: z.string().uuid("Invalid inventory item ID"),
          requestedQty: z
            .number()
            .int()
            .min(1, "Requested quantity must be at least 1"),
          remarks: z.string().trim().max(240).optional().default(""),
        }),
      )
      .min(1, "At least one laboratory item must be requested")
      .refine(
        (items) => new Set(items.map((i) => i.itemId)).size === items.length,
        {
          message:
            "Duplicate items in the same requisition must be combined into one line.",
        },
      ),
  })
  .strict()
  .refine(
    (data) =>
      new Date(data.expectedReturnAt).getTime() >
      new Date(data.neededAt).getTime(),
    {
      message: "Expected return date/time must be after the needed date/time.",
    },
  );

const reviewRequisitionSchema = z
  .object({
    decision: z.enum(["approve", "reject", "cancel"]),
    remarks: z.string().trim().max(500).optional().default(""),
    itemDecisions: z
      .array(
        z.object({
          requisitionItemId: z.string().uuid(),
          approvedQty: z.number().int().min(0),
        }),
      )
      .optional(),
  })
  .strict();

export function validateCreateRequisition(
  payload: unknown,
): CreateRequisitionInput {
  const parsed = createRequisitionSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ?? "Invalid requisition request.",
    });
  }
  return parsed.data;
}

export function validateReviewRequisition(
  payload: unknown,
): ReviewRequisitionInput {
  const parsed = reviewRequisitionSchema.safeParse(payload);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsed.error.issues[0]?.message ??
        "Invalid requisition review decision.",
    });
  }
  return parsed.data;
}

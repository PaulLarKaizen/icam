import { describe, expect, it } from "vitest";
import {
  validateCreateRequisition,
  validateReviewRequisition,
} from "../../server/validators/requisition.validator";

describe("requisition.validator", () => {
  const validItemId = "11111111-1111-4111-8111-111111111111";

  it("accepts a valid faculty requisition payload", () => {
    const result = validateCreateRequisition({
      borrowerName: "Juan Dela Cruz",
      borrowerStudentId: "2023-00123",
      courseYearSection: "BSMLS 3-A",
      courseActivity: "Hematology Blood Smear Lab",
      neededAt: "2026-11-25T08:00:00+08:00",
      expectedReturnAt: "2026-11-25T11:00:00+08:00",
      items: [{ itemId: validItemId, requestedQty: 5 }],
    });

    expect(result.borrowerName).toBe("Juan Dela Cruz");
    expect(result.items).toHaveLength(1);
  });

  it("rejects requisitions where return time is not after needed time", () => {
    expect(() =>
      validateCreateRequisition({
        borrowerName: "Juan Dela Cruz",
        courseYearSection: "BSMLS 3-A",
        courseActivity: "Microbiology Lab",
        neededAt: "2026-11-25T11:00:00+08:00",
        expectedReturnAt: "2026-11-25T10:00:00+08:00",
        items: [{ itemId: validItemId, requestedQty: 2 }],
      }),
    ).toThrow();
  });

  it("rejects requisitions with zero or negative item quantities", () => {
    expect(() =>
      validateCreateRequisition({
        borrowerName: "Juan Dela Cruz",
        courseYearSection: "BSMLS 3-A",
        courseActivity: "Microbiology Lab",
        neededAt: "2026-11-25T08:00:00+08:00",
        expectedReturnAt: "2026-11-25T10:00:00+08:00",
        items: [{ itemId: validItemId, requestedQty: 0 }],
      }),
    ).toThrow();
  });

  it("validates custodian approve/reject decisions", () => {
    const decision = validateReviewRequisition({
      decision: "approve",
      remarks: "Approved for MT LAB 3",
    });
    expect(decision.decision).toBe("approve");
  });
});

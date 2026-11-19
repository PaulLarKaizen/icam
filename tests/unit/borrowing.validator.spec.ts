import { describe, expect, it } from "vitest";
import {
  validateClearLiabilityCase,
  validateInspectBorrowingReturn,
  validateIssueRequisition,
} from "../../server/validators/borrowing.validator";

describe("borrowing.validator", () => {
  const validUuid = "22222222-2222-4222-8222-222222222222";

  it("requires Student ID collateral and wet-ink signatures before issuance", () => {
    expect(() =>
      validateIssueRequisition({
        requisitionId: validUuid,
        receivedByName: "Maria Santos",
        facultySignatureVerified: true,
        borrowerSignatureVerified: true,
        studentIdHeld: false,
      }),
    ).toThrow();

    const valid = validateIssueRequisition({
      requisitionId: validUuid,
      receivedByName: "Maria Santos",
      receivedByStudentId: "2023-00456",
      facultySignatureVerified: true,
      borrowerSignatureVerified: true,
      studentIdHeld: true,
    });
    expect(valid.studentIdHeld).toBe(true);
  });

  it("validates return inspection line items", () => {
    const valid = validateInspectBorrowingReturn({
      itemInspections: [
        {
          transactionItemId: validUuid,
          returnedGoodQty: 4,
          damagedQty: 1,
          lostQty: 0,
          conditionNotes: "1 beaker chipped on rim",
        },
      ],
      returnNotes: "Opened F-VPA-011 for 1 chipped beaker",
    });
    expect(valid.itemInspections[0]?.damagedQty).toBe(1);
  });

  it("requires Official Receipt or replacement reference and acknowledgement for liability clearance", () => {
    expect(() =>
      validateClearLiabilityCase({
        replacementMode: "Payment at the cashier",
        proofReference: "",
        acknowledgedByLiable: true,
        attestedByFaculty: true,
      }),
    ).toThrow();

    const valid = validateClearLiabilityCase({
      replacementMode: "Payment at the cashier",
      proofReference: "SDCA-OR-2026-8841",
      acknowledgedByLiable: true,
      attestedByFaculty: true,
    });
    expect(valid.proofReference).toBe("SDCA-OR-2026-8841");
  });
});

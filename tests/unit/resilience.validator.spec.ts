import { describe, expect, it } from "vitest";
import {
  validateCreateOutageRecovery,
  validateRestoreBundle,
} from "../../server/validators/resilience.validator";

describe("resilience.validator", () => {
  it("enforces mandatory human verification for outage paper recovery", () => {
    expect(() =>
      validateCreateOutageRecovery({
        outageReference: "OUT-20261119-001",
        formType: "F-VPA-012",
        incidentOccurredAt: "2026-11-19T09:00:00+08:00",
        verifiedSummary:
          "Issued 2 compound microscopes during campus ISP outage",
        humanVerified: false,
      }),
    ).toThrow();

    const valid = validateCreateOutageRecovery({
      outageReference: "OUT-20261119-001",
      formType: "F-VPA-012",
      incidentOccurredAt: "2026-11-19T09:00:00+08:00",
      borrowerName: "Ana Reyes",
      courseActivity: "Parasitology Lab",
      verifiedSummary: "Issued 2 compound microscopes during campus ISP outage",
      humanVerified: true,
    });
    expect(valid.outageReference).toBe("OUT-20261119-001");
  });

  it("validates backup snapshot bundle integrity structure", () => {
    const bundle = validateRestoreBundle({
      snapshotCode: "BKP-20261119-100000-ABCD",
      exportedAt: "2026-11-19T10:00:00+08:00",
      tables: {
        inventory_items: [],
        requisitions: [],
      },
    });
    expect(bundle.snapshotCode).toBe("BKP-20261119-100000-ABCD");
  });
});

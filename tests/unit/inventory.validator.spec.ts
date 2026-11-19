import { describe, expect, it } from "vitest";
import {
  validateCreateInventoryItem,
  validateUpdateInventoryStock,
} from "../../server/validators/inventory.validator";

describe("inventory.validator", () => {
  it("accepts a valid bulk quantity item", () => {
    const result = validateCreateInventoryItem({
      name: "Beaker",
      category: "Apparatus",
      trackingMode: "quantity",
      specification: "250 mL",
      unit: "pcs",
      location: "C1",
      onHandQty: 24,
    });

    expect(result.name).toBe("Beaker");
    expect(result.onHandQty).toBe(24);
  });

  it("rejects negative on-hand quantities", () => {
    expect(() =>
      validateCreateInventoryItem({
        name: "Graduated Cylinder",
        category: "Apparatus",
        trackingMode: "quantity",
        unit: "pcs",
        location: "C2",
        onHandQty: -3,
      }),
    ).toThrow();
  });

  it("rejects empty stock updates", () => {
    expect(() => validateUpdateInventoryStock({})).toThrow();
  });

  it("rejects negative stock updates", () => {
    expect(() => validateUpdateInventoryStock({ onHandQty: -1 })).toThrow();
  });
});

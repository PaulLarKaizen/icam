export type InventoryTrackingMode = "quantity" | "serialized";

export type InventoryCategory = "Equipment" | "Apparatus" | "Material";

export type AssetConditionIssue =
  | "NONE"
  | "DEFECTIVE"
  | "FOR DEMONSTRATION ONLY"
  | "FO REPAIR"
  | "LOST";

export type AssetAvailabilityStatus =
  | "Available"
  | "Reserved"
  | "Issued"
  | "Unavailable";

export interface InventoryAsset {
  id: string;
  itemId: string;
  serialNumber: string;
  calibration: string;
  conditionIssue: AssetConditionIssue;
  availabilityStatus: AssetAvailabilityStatus;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  trackingMode: InventoryTrackingMode;
  specification: string;
  unit: string;
  location: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  defectiveQty: number;
  defectiveNotes: string;
  isActive: boolean;
  assets?: InventoryAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryCatalogQuery {
  search?: string;
  category?: InventoryCategory | "";
  trackingMode?: InventoryTrackingMode | "";
  availableOnly?: boolean;
}

export interface CreateInventoryItemInput {
  name: string;
  category: InventoryCategory;
  trackingMode: InventoryTrackingMode;
  specification?: string;
  unit: string;
  location: string;
  onHandQty?: number;
  defectiveQty?: number;
  defectiveNotes?: string;
}

export interface UpdateInventoryStockInput {
  onHandQty?: number;
  defectiveQty?: number;
  defectiveNotes?: string;
  location?: string;
  isActive?: boolean;
}

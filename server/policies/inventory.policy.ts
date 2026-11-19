import type { IcamRole } from "~~/shared/types/auth";

export const INVENTORY_VIEW_ROLES: readonly IcamRole[] = [
  "student",
  "faculty",
  "custodian",
  "coordinator",
  "admin",
];

export const INVENTORY_MANAGE_ROLES: readonly IcamRole[] = [
  "custodian",
  "coordinator",
];

export function canManageInventory(role: IcamRole): boolean {
  return INVENTORY_MANAGE_ROLES.includes(role);
}

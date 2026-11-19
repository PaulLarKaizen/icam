import type { IcamRole } from "~~/shared/types/auth";

export const BORROWING_VIEW_ROLES: readonly IcamRole[] = [
  "student",
  "faculty",
  "custodian",
  "coordinator",
  "admin",
];

export const COUNTER_OPERATIONS_ROLES: readonly IcamRole[] = [
  "custodian",
  "coordinator",
];

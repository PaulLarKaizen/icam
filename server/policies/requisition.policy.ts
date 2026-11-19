import type { IcamRole } from "~~/shared/types/auth";

export const REQUISITION_VIEW_ROLES: readonly IcamRole[] = [
  "student",
  "faculty",
  "custodian",
  "coordinator",
  "admin",
];

export const REQUISITION_SUBMIT_ROLES: readonly IcamRole[] = [
  "faculty",
  "coordinator",
];

export const REQUISITION_REVIEW_ROLES: readonly IcamRole[] = [
  "custodian",
  "coordinator",
];

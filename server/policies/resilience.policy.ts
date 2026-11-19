import type { IcamRole } from "~~/shared/types/auth";

export const ACTIVITY_LOG_VIEW_ROLES: readonly IcamRole[] = [
  "custodian",
  "coordinator",
  "admin",
];

export const OUTAGE_RECOVERY_VIEW_ROLES: readonly IcamRole[] = [
  "custodian",
  "coordinator",
  "admin",
];

export const OUTAGE_RECOVERY_MANAGE_ROLES: readonly IcamRole[] = [
  "custodian",
  "coordinator",
];

export const BACKUP_ADMIN_ROLES: readonly IcamRole[] = ["admin"];

export interface IcamRolePermissionRow {
  role_code: string
  permission_code: string
}

export const ICAM_ALLOWED_GOOGLE_HOSTED_DOMAIN: string
export function isVerifiedIcamGoogleIdentity(appMetadata: Record<string, unknown> | null | undefined): boolean
export function hasIcamPermission(
  roleCodes: string[],
  rolePermissionRows: IcamRolePermissionRow[],
  requiredPermission: string,
): boolean

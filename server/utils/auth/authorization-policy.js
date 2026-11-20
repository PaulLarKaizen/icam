export const ICAM_ALLOWED_GOOGLE_HOSTED_DOMAIN = 'sdca.edu.ph'

/**
 * `app_metadata` is only written by the server-side Supabase Auth Admin API
 * after the Google ID token has been cryptographically verified.
 */
export function isVerifiedIcamGoogleIdentity(appMetadata) {
  const verifiedAt = Date.parse(String(appMetadata?.icam_identity_verified_at ?? ''))
  return (
    appMetadata?.icam_google_hd === ICAM_ALLOWED_GOOGLE_HOSTED_DOMAIN &&
    typeof appMetadata?.icam_google_sub === 'string' &&
    appMetadata.icam_google_sub.trim().length > 0 &&
    Number.isFinite(verifiedAt)
  )
}

/**
 * Permission rows are queried only for the user's active role assignments.
 * This helper intentionally does not infer permissions from role names.
 */
export function hasIcamPermission(roleCodes, rolePermissionRows, requiredPermission) {
  if (!Array.isArray(roleCodes) || roleCodes.length === 0 || !requiredPermission) {
    return false
  }

  const assignedRoles = new Set(roleCodes)
  return Array.isArray(rolePermissionRows) && rolePermissionRows.some((row) => (
    assignedRoles.has(row.role_code) && row.permission_code === requiredPermission
  ))
}

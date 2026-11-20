import type { H3Event } from 'h3'
import { hasIcamPermission } from './authorization-policy.js'
import { requireIcamUser } from './require-user'

export async function requireIcamPermission(event: H3Event, permissionCode: string) {
  if (typeof permissionCode !== 'string' || !permissionCode.trim()) {
    throw createError({ statusCode: 500, statusMessage: 'A permission code is required by this route.' })
  }

  const context = await requireIcamUser(event)
  const { data: permissionRows, error: permissionError } = await context.supabase
    .from('icam_role_permissions')
    .select('role_code, permission_code')
    .in('role_code', context.roleCodes)
    .eq('permission_code', permissionCode)

  if (permissionError) {
    throw createError({ statusCode: 503, statusMessage: 'ICAM permissions could not be checked.' })
  }

  if (!hasIcamPermission(context.roleCodes, permissionRows || [], permissionCode)) {
    throw createError({ statusCode: 403, statusMessage: 'You do not have permission to perform this action.' })
  }

  return context
}

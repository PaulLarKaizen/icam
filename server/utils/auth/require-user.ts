import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { isVerifiedIcamGoogleIdentity } from './authorization-policy.js'

export async function requireIcamUser(event: H3Event) {
  const supabase = await serverSupabaseClient(event)
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    if (!authError || authError.name === 'AuthSessionMissingError' || authError.status === 401) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication is required.' })
    }

    throw createError({ statusCode: 503, statusMessage: 'Authentication could not be verified.' })
  }

  const user = authData.user
  if (!isVerifiedIcamGoogleIdentity(user.app_metadata)) {
    throw createError({ statusCode: 403, statusMessage: 'This Google identity is not verified for ICAM.' })
  }

  const { data: profile, error: profileError } = await supabase
    .from('icam_profiles')
    .select('user_id, display_name, account_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw createError({ statusCode: 503, statusMessage: 'The ICAM account profile could not be checked.' })
  }
  if (!profile || profile.account_status !== 'active') {
    throw createError({ statusCode: 403, statusMessage: 'The ICAM account is not active.' })
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from('icam_user_roles')
    .select('role_code')
    .eq('user_id', user.id)
    .is('revoked_at', null)

  if (assignmentsError) {
    throw createError({ statusCode: 503, statusMessage: 'ICAM role assignments could not be checked.' })
  }

  const roleCodes = [...new Set((assignments || []).map((assignment) => assignment.role_code))]
  if (roleCodes.length === 0) {
    throw createError({ statusCode: 403, statusMessage: 'No ICAM role has been assigned to this account.' })
  }

  return {
    supabase,
    user,
    profile,
    roleCodes,
  }
}

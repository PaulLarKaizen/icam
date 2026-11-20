import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { verifyGoogleIdToken } from '../../../utils/auth/google-token.js'
import { createGoogleNonceHash } from '../../../utils/auth/oauth-state.js'
import {
  ICAM_OAUTH_STATE_COOKIE,
  openOAuthState,
} from '../../../utils/auth/oauth-state.js'

function redirectToLogin(event: H3Event, errorCode: string) {
  deleteCookie(event, ICAM_OAUTH_STATE_COOKIE, { path: '/' })
  return sendRedirect(event, `/login?error=${encodeURIComponent(errorCode)}`, 302)
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const oauthError = typeof query.error === 'string' ? query.error : ''

  if (oauthError) {
    return redirectToLogin(event, oauthError === 'access_denied' ? 'oauth-cancelled' : 'oauth-failed')
  }

  const stateSecret = String(config.authStateSecret || '')
  const stateCookie = getCookie(event, ICAM_OAUTH_STATE_COOKIE)
  const oauthState = openOAuthState(stateCookie, stateSecret)
  const returnedState = typeof query.state === 'string' ? query.state : ''
  const code = typeof query.code === 'string' ? query.code : ''

  if (!oauthState || !returnedState || !constantTimeEqual(oauthState.state, returnedState)) {
    return redirectToLogin(event, 'oauth-state-invalid')
  }

  deleteCookie(event, ICAM_OAUTH_STATE_COOKIE, { path: '/' })

  if (!code) {
    return redirectToLogin(event, 'oauth-code-missing')
  }

  const clientId = String(config.googleClientId || '').trim()
  const clientSecret = String(config.googleClientSecret || '')
  const redirectUri = String(config.googleRedirectUri || '').trim()

  if (!clientId || !clientSecret || !redirectUri) {
    return redirectToLogin(event, 'oauth-not-configured')
  }

  let tokenData: Record<string, unknown>
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    tokenData = await tokenResponse.json() as Record<string, unknown>
    if (!tokenResponse.ok || typeof tokenData.id_token !== 'string') {
      return redirectToLogin(event, 'google-token-exchange-failed')
    }
  } catch {
    return redirectToLogin(event, 'google-token-exchange-failed')
  }

  const idToken = typeof tokenData.id_token === 'string' ? tokenData.id_token : ''
  if (!idToken) {
    return redirectToLogin(event, 'google-token-exchange-failed')
  }

  let googleIdentity: Awaited<ReturnType<typeof verifyGoogleIdToken>>
  try {
    googleIdentity = await verifyGoogleIdToken(idToken, {
      audience: clientId,
      expectedNonce: createGoogleNonceHash(oauthState.nonce),
    })
  } catch {
    return redirectToLogin(event, 'google-identity-invalid')
  }

  const supabase = await serverSupabaseClient(event)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    nonce: oauthState.nonce,
    access_token: typeof tokenData.access_token === 'string' ? tokenData.access_token : undefined,
  })

  if (signInError || !signInData.user) {
    return redirectToLogin(event, 'supabase-google-sign-in-failed')
  }

  try {
    // app_metadata is not user-editable. Only this server callback writes the verified Google identity.
    const admin = serverSupabaseServiceRole(event)
    const appMetadata = {
      ...(signInData.user.app_metadata || {}),
      icam_google_hd: googleIdentity.hostedDomain,
      icam_google_sub: googleIdentity.sub,
      icam_identity_verified_at: new Date().toISOString(),
    }

    const { error: metadataError } = await admin.auth.admin.updateUserById(
      signInData.user.id,
      { app_metadata: appMetadata },
    )

    if (metadataError) {
      throw metadataError
    }

    // Refresh the Supabase JWT so the verified, server-written app_metadata is present for RLS.
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshed.session) {
      throw refreshError || new Error('Supabase session refresh failed.')
    }

    const { data: profile, error: profileError } = await supabase
      .from('icam_profiles')
      .select('user_id, account_status')
      .eq('user_id', signInData.user.id)
      .maybeSingle()

    if (profileError || !profile) {
      throw profileError || new Error('The ICAM account profile was not created.')
    }

    if (profile.account_status !== 'active') {
      return sendRedirect(event, '/auth/pending', 302)
    }

    const { data: assignments, error: assignmentsError } = await supabase
      .from('icam_user_roles')
      .select('role_code')
      .eq('user_id', signInData.user.id)
      .is('revoked_at', null)

    if (assignmentsError) {
      throw assignmentsError
    }

    if (!assignments?.length) {
      return sendRedirect(event, '/auth/pending', 302)
    }

    return sendRedirect(event, '/portal', 302)
  } catch {
    await supabase.auth.signOut()
    return redirectToLogin(event, 'icam-session-setup-failed')
  }
})

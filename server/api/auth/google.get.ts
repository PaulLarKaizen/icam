import { createOAuthState, createGoogleNonceHash, sealOAuthState, ICAM_OAUTH_STATE_COOKIE } from '../../utils/auth/oauth-state.js'

const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const clientId = String(config.googleClientId || '').trim()
  const redirectUri = String(config.googleRedirectUri || '').trim()
  const siteUrl = String(config.public.siteUrl || '').trim()
  const stateSecret = String(config.authStateSecret || '')

  if (!clientId || !redirectUri || !siteUrl || stateSecret.length < 32) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Google sign-in is not configured for this environment.',
    })
  }

  const expectedRedirectUri = new URL('/api/auth/google/callback', siteUrl).toString()
  if (redirectUri !== expectedRedirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The Google OAuth callback URL does not match the configured ICAM site URL.',
    })
  }

  const oauthState = createOAuthState()
  const sealedState = sealOAuthState(oauthState, stateSecret)
  const isSecure = new URL(siteUrl).protocol === 'https:'

  setCookie(event, ICAM_OAUTH_STATE_COOKIE, sealedState, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  })

  const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_ENDPOINT)
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: oauthState.state,
    nonce: createGoogleNonceHash(oauthState.nonce),
    // This is only a Google account-picker hint. The signed `hd` claim is verified in the callback.
    hd: 'sdca.edu.ph',
  }).toString()

  return sendRedirect(event, authorizationUrl.toString(), 302)
})

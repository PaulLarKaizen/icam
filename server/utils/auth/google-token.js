import { createPublicKey, verify } from 'node:crypto'

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs'
const ALLOWED_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com'])
const MAX_TOKEN_LENGTH = 16_384
let cachedJwks = null
let cachedJwksExpiresAt = 0

function decodeBase64UrlJson(segment) {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error('Invalid Google ID token encoding.')
  }

  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'))
  } catch {
    throw new Error('Invalid Google ID token payload.')
  }
}

async function fetchGoogleJwks(fetchImpl, nowMs, forceRefresh = false) {
  const canUseCache = fetchImpl === globalThis.fetch
  if (canUseCache && !forceRefresh && cachedJwks && nowMs < cachedJwksExpiresAt) {
    return cachedJwks
  }

  const response = await fetchImpl(GOOGLE_JWKS_URL, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Google signing keys are temporarily unavailable.')
  }

  const document = await response.json()
  if (!Array.isArray(document?.keys) || document.keys.length === 0) {
    throw new Error('Google returned an invalid signing-key set.')
  }

  if (canUseCache) {
    const cacheControl = response.headers?.get?.('cache-control') || ''
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 300)
    cachedJwks = document
    cachedJwksExpiresAt = nowMs + Math.max(30, Math.min(maxAge, 3600)) * 1000
  }

  return document
}

function verifySignature(signingInput, signature, jwk) {
  if (!jwk || jwk.kty !== 'RSA' || jwk.use && jwk.use !== 'sig') {
    return false
  }

  try {
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' })
    return verify('RSA-SHA256', Buffer.from(signingInput), publicKey, signature)
  } catch {
    return false
  }
}

/**
 * Verifies a Google OpenID Connect ID token and the ICAM-specific claims.
 * The expected nonce is the SHA-256 hex value supplied in the Google request.
 *
 * `fetchImpl` and `nowSeconds` are injectable to make token validation testable.
 */
export async function verifyGoogleIdToken(
  token,
  {
    audience,
    expectedNonce,
    requiredHostedDomain = 'sdca.edu.ph',
    fetchImpl = globalThis.fetch,
    nowSeconds = Math.floor(Date.now() / 1000),
  } = {},
) {
  if (typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH) {
    throw new Error('Google did not return a usable ID token.')
  }
  if (typeof audience !== 'string' || !audience.trim()) {
    throw new Error('Google OAuth client ID is not configured.')
  }
  if (typeof expectedNonce !== 'string' || !expectedNonce) {
    throw new Error('OAuth nonce is missing.')
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Google returned a malformed ID token.')
  }

  const header = decodeBase64UrlJson(parts[0])
  const claims = decodeBase64UrlJson(parts[1])
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    throw new Error('Google ID token uses an unsupported signing key.')
  }

  let jwks = await fetchGoogleJwks(fetchImpl, nowSeconds * 1000)
  let signingKey = jwks.keys.find((key) => key.kid === header.kid)
  if (!signingKey) {
    jwks = await fetchGoogleJwks(fetchImpl, nowSeconds * 1000, true)
    signingKey = jwks.keys.find((key) => key.kid === header.kid)
  }

  const signature = Buffer.from(parts[2], 'base64url')
  if (!signingKey || !verifySignature(`${parts[0]}.${parts[1]}`, signature, signingKey)) {
    throw new Error('Google ID token signature is invalid.')
  }

  if (!ALLOWED_ISSUERS.has(claims.iss)) {
    throw new Error('Google ID token issuer is invalid.')
  }

  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (!audiences.includes(audience)) {
    throw new Error('Google ID token audience is invalid.')
  }
  if (Array.isArray(claims.aud) && claims.azp !== audience) {
    throw new Error('Google ID token authorized party is invalid.')
  }
  if (claims.azp && claims.azp !== audience) {
    throw new Error('Google ID token authorized party is invalid.')
  }

  if (!Number.isFinite(claims.exp) || claims.exp <= nowSeconds) {
    throw new Error('Google ID token has expired.')
  }
  if (!Number.isFinite(claims.iat) || claims.iat > nowSeconds + 300) {
    throw new Error('Google ID token issued-at time is invalid.')
  }
  if (claims.nonce !== expectedNonce) {
    throw new Error('Google ID token nonce is invalid.')
  }
  if (claims.hd !== requiredHostedDomain) {
    throw new Error('Only verified SDCA hosted-domain accounts may sign in.')
  }
  if (claims.email_verified !== true || typeof claims.email !== 'string' || !claims.email.trim()) {
    throw new Error('Google did not verify the account email address.')
  }
  if (typeof claims.sub !== 'string' || !claims.sub.trim()) {
    throw new Error('Google ID token subject is missing.')
  }

  return {
    sub: claims.sub,
    email: claims.email.trim().toLowerCase(),
    hostedDomain: claims.hd,
    emailVerified: claims.email_verified,
    name: typeof claims.name === 'string' ? claims.name : null,
    picture: typeof claims.picture === 'string' ? claims.picture : null,
  }
}

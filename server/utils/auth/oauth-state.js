import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const ICAM_OAUTH_STATE_COOKIE = 'icam_google_oauth_state'
export const ICAM_OAUTH_STATE_TTL_SECONDS = 10 * 60

export function createOAuthState() {
  return {
    state: randomBytes(32).toString('base64url'),
    nonce: randomBytes(32).toString('base64url'),
    createdAt: Date.now(),
  }
}

function sign(encodedPayload, secret) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

export function sealOAuthState(payload, secret) {
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('NUXT_AUTH_STATE_SECRET must contain at least 32 characters.')
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encodedPayload}.${sign(encodedPayload, secret)}`
}

export function openOAuthState(value, secret, now = Date.now()) {
  if (typeof secret !== 'string' || secret.length < 32 || typeof value !== 'string') {
    return null
  }

  const [encodedPayload, signature, extra] = value.split('.')
  if (!encodedPayload || !signature || extra !== undefined) {
    return null
  }

  const expected = Buffer.from(sign(encodedPayload, secret))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null
  }

  let payload
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (
    typeof payload?.state !== 'string' ||
    typeof payload?.nonce !== 'string' ||
    !Number.isFinite(payload?.createdAt) ||
    payload.createdAt > now + 60_000 ||
    now - payload.createdAt > ICAM_OAUTH_STATE_TTL_SECONDS * 1000
  ) {
    return null
  }

  return payload
}

export function createGoogleNonceHash(nonce) {
  return createHash('sha256').update(nonce).digest('hex')
}

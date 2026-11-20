import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync, sign } from 'node:crypto'
import { verifyGoogleIdToken } from '../../../server/utils/auth/google-token.js'

const NOW = 1_800_000_000
const AUDIENCE = 'icam-web-client.apps.googleusercontent.com'
const NONCE = 'hashed-oauth-nonce'
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'icam-test-key', alg: 'RS256', use: 'sig' }

function makeToken(overrides = {}, signingKey = privateKey) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'icam-test-key' })).toString('base64url')
  const claims = {
    iss: 'https://accounts.google.com',
    aud: AUDIENCE,
    sub: 'google-subject-123',
    email: 'person@sdca.edu.ph',
    email_verified: true,
    hd: 'sdca.edu.ph',
    iat: NOW - 10,
    exp: NOW + 1800,
    nonce: NONCE,
    ...overrides,
  }
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url')
  const signingInput = `${header}.${payload}`
  const signature = sign('RSA-SHA256', Buffer.from(signingInput), signingKey).toString('base64url')
  return `${signingInput}.${signature}`
}

function fakeFetch() {
  return async () => new Response(JSON.stringify({ keys: [jwk] }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
  })
}

const verify = (token) => verifyGoogleIdToken(token, {
  audience: AUDIENCE,
  expectedNonce: NONCE,
  fetchImpl: fakeFetch(),
  nowSeconds: NOW,
})

test('accepts a correctly signed SDCA Google ID token', async () => {
  const identity = await verify(makeToken())
  assert.equal(identity.sub, 'google-subject-123')
  assert.equal(identity.email, 'person@sdca.edu.ph')
  assert.equal(identity.hostedDomain, 'sdca.edu.ph')
  assert.equal(identity.emailVerified, true)
})

test('rejects a different Google hosted domain even if the email looks institutional', async () => {
  await assert.rejects(verify(makeToken({ hd: 'gmail.com' })), /hosted-domain/)
})

test('rejects an ID token issued for another OAuth client', async () => {
  await assert.rejects(verify(makeToken({ aud: 'another-client-id' })), /audience/)
})

test('rejects expired ID tokens', async () => {
  await assert.rejects(verify(makeToken({ exp: NOW - 1 })), /expired/)
})

test('rejects a token with a mismatched nonce', async () => {
  await assert.rejects(verify(makeToken({ nonce: 'different-nonce' })), /nonce/)
})

test('rejects unverified Google email addresses', async () => {
  await assert.rejects(verify(makeToken({ email_verified: false })), /verify/)
})

test('rejects a token signed by an unknown private key', async () => {
  const other = generateKeyPairSync('rsa', { modulusLength: 2048 })
  await assert.rejects(verify(makeToken({}, other.privateKey)), /signature/)
})

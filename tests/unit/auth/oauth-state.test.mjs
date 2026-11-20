import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createGoogleNonceHash,
  createOAuthState,
  openOAuthState,
  sealOAuthState,
} from '../../../server/utils/auth/oauth-state.js'

const SECRET = 'test-secret-that-is-at-least-thirty-two-characters-long'
const NOW = 1_800_000_000_000

test('seals and opens one-time OAuth state payloads', () => {
  const state = createOAuthState()
  const sealed = sealOAuthState(state, SECRET)
  assert.deepEqual(openOAuthState(sealed, SECRET, state.createdAt), state)
})

test('rejects a tampered OAuth state cookie', () => {
  const state = createOAuthState()
  const sealed = sealOAuthState(state, SECRET)
  assert.equal(openOAuthState(`${sealed}x`, SECRET, state.createdAt), null)
})

test('rejects expired OAuth state payloads', () => {
  const state = { state: 'state-value', nonce: 'nonce-value', createdAt: NOW - 700_000 }
  assert.equal(openOAuthState(sealOAuthState(state, SECRET), SECRET, NOW), null)
})

test('hashes the nonce as SHA-256 hex for the Google request', () => {
  assert.match(createGoogleNonceHash('test-nonce'), /^[a-f0-9]{64}$/)
})

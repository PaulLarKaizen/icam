import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hasIcamPermission,
  isVerifiedIcamGoogleIdentity,
} from '../../../server/utils/auth/authorization-policy.js'

const trustedMetadata = {
  icam_google_hd: 'sdca.edu.ph',
  icam_google_sub: 'google-subject-123',
  icam_identity_verified_at: '2026-11-20T09:00:00.000Z',
}

test('accepts only server-recorded verified SDCA Google identity metadata', () => {
  assert.equal(isVerifiedIcamGoogleIdentity(trustedMetadata), true)
  assert.equal(isVerifiedIcamGoogleIdentity({ ...trustedMetadata, icam_google_hd: 'gmail.com' }), false)
  assert.equal(isVerifiedIcamGoogleIdentity({ ...trustedMetadata, icam_google_sub: '' }), false)
  assert.equal(isVerifiedIcamGoogleIdentity({ ...trustedMetadata, icam_identity_verified_at: 'invalid' }), false)
  assert.equal(isVerifiedIcamGoogleIdentity({}), false)
})

test('checks permissions through explicit single-role assignments', () => {
  const rows = [
    { role_code: 'faculty', permission_code: 'requisitions.create' },
    { role_code: 'faculty', permission_code: 'availability.read' },
  ]
  assert.equal(hasIcamPermission(['faculty'], rows, 'requisitions.create'), true)
  assert.equal(hasIcamPermission(['faculty'], rows, 'inventory.manage'), false)
})

test('supports permissions supplied by multiple explicitly assigned roles', () => {
  const rows = [
    { role_code: 'program_laboratory_coordinator', permission_code: 'oversight.read' },
    { role_code: 'laboratory_custodian', permission_code: 'inventory.manage' },
  ]
  assert.equal(hasIcamPermission(['program_laboratory_coordinator', 'laboratory_custodian'], rows, 'inventory.manage'), true)
  assert.equal(hasIcamPermission(['program_laboratory_coordinator'], rows, 'inventory.manage'), false)
})

test('rejects users with no explicit roles or no matching permission', () => {
  const rows = [{ role_code: 'faculty', permission_code: 'requisitions.create' }]
  assert.equal(hasIcamPermission([], rows, 'requisitions.create'), false)
  assert.equal(hasIcamPermission(['faculty'], rows, 'inventory.manage'), false)
})

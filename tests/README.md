# ICAM Tests

Run the focused authentication unit suite with:

```bash
npm run test:auth
```

The tests use Node.js built-in `node:test` and generated local RSA keys. They cover Google ID-token signature and claim validation, wrong hosted domains and audiences, expiry, nonce handling, OAuth state-cookie integrity/expiry, server-recorded institutional identity metadata, and single-/multi-role permission mapping. They do not contact Google or require OAuth secrets.

Live OAuth callback, real-user activation, per-user RLS, and protected-endpoint integration tests still require a configured Google client, the ICAM-DEV Supabase Google provider, and controlled test accounts. Vitest/Playwright are not installed or configured by this Issue #2 increment.

# Server Authorization Utilities

Use these helpers explicitly in each protected Nitro API handler:

- `requireIcamUser(event)` validates the current Supabase user with Auth, checks the server-written Google identity marker, requires an active `icam_profiles` row, and loads all active explicit role assignments.
- `requireIcamPermission(event, permissionCode)` calls `requireIcamUser()` and checks that one of the user's currently assigned roles grants the requested permission in `icam_role_permissions`.

Return 401 for a missing/invalid Supabase session. Return 403 for an identity that is not verified for SDCA, a pending/inactive profile, no assigned role, or an insufficient permission. Do not use client middleware as authorization and do not trust `user_metadata` for access decisions.

The service-role client is limited to the Google callback operation that writes verified identity claims to Supabase `app_metadata`. Keep its secret key server-only.

Example:

```ts
export default defineEventHandler(async (event) => {
  const { user } = await requireIcamPermission(event, 'inventory.manage')
  // Perform the authorized server-side operation.
  return { success: true, actorId: user.id }
})
```

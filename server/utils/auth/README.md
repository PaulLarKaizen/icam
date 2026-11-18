# Server Authorization Utilities

Reusable authentication and permission helpers will be defined in this directory.

- `require-user.ts` will resolve and require a valid Supabase-authenticated server user.
- `require-permission.ts` will require an authorized permission for the requested operation.

These helpers must be called explicitly by protected Nitro handlers. They must not depend on global authentication middleware to provide authorization.

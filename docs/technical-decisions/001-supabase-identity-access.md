# Supabase foundation — ICAM development

**Project:** \`ICAM-DEV\`  
**Project ref:** \`ghsdtjsfdurzdxgnlerm\`  
**Organization:** \`SDCA-ICAM\`  
**Region:** Singapore (\`ap-southeast-1\`)  
**Plan quote at creation:** Free, USD $0/month for the project at the time it was created  
**Status at setup:** \`ACTIVE_HEALTHY\`  
**Repository issue:** [#2 — Database/Security](https://github.com/PaulLarKaizen/icam/issues/2)  
**Implementation branch:** \`feature/backend/icam-2-supabase-foundation\`

## Scope of this foundation

This first schema increment implements the identity, activation, role-assignment, permission-catalogue, and RLS foundation. It does not yet implement inventory, requisition, reservation, issuance, return, document, OCR, or audit-event business tables.

The schema was derived from the November 19, 2026 FINAL CONCEPT PAPER, Section XXX (Database Design) and Section XXXI (User Roles), together with GitHub Issue #2. The exact application authorization matrix remains subject to continued requirements traceability under Issue #3.

## Database objects

| Object | Purpose |
|---|---|
| \`public.icam_profiles\` | One ICAM profile per Supabase Auth user; account status defaults to \`pending\`. |
| \`public.icam_roles\` | The six documented ICAM roles. |
| \`public.icam_permissions\` | Stable permission catalogue used by Nitro authorization checks. |
| \`public.icam_role_permissions\` | Initial role-to-permission mapping derived from the documented role responsibilities. |
| \`public.icam_user_roles\` | Explicit, multi-role user assignments with assignment and revocation history. |

### Roles seeded

- \`student_borrower\`
- \`faculty\`
- \`laboratory_custodian\`
- \`program_laboratory_coordinator\`
- \`icam_application_administrator\`
- \`designated_technical_administrator\`

The Coordinator role does not automatically grant Custodian permissions. A person with both duties must receive both explicit assignments. The Application Administrator and Designated Technical Administrator are separate roles. Assignment of the technical-administrator role is deliberately restricted by RLS and is not granted to the ordinary application-administrator role.

## Security model

- Every \`public.icam_*\` table has Row Level Security enabled.
- No anonymous (\`anon\`) table access is granted.
- Authenticated users can read only their own profile and role assignments, except for authorized application administrators with the relevant permissions.
- Role and permission catalogues are readable only to active ICAM users.
- Ordinary users cannot insert or delete user profiles, roles, permissions, or role-permission links.
- Role assignment and revocation are permission-gated and attributed to an actor.
- Role revocation is soft/history-preserving; active assignments are unique per user and role.
- The \`private\` schema contains helper functions and is not intended as a Data API schema.
- Security-definer helpers use an empty search path and fully qualified object names. Execution is revoked from \`PUBLIC\` and \`anon\`; only the required authenticated execution grants are added.
- Supabase Auth user creation triggers a profile with \`account_status = 'pending'\`. User metadata is used only for a display-name convenience field; it is not used for authorization. No role is automatically assigned.

## Current verification

The hosted database was checked immediately after applying the migrations:

- Five ICAM tables exist in \`public\`.
- RLS is enabled on all five tables.
- Six role definitions and 34 permission definitions are seeded.
- Thirty-six role-permission links are seeded.
- Eight RLS policies are present.
- The security advisor returned no lints at the time of verification.
- With no authenticated request context, the helper checks returned \`false\` for active-user and permission status.

No real SDCA user has been provisioned, activated, or assigned a role yet. End-to-end sign-in and per-user policy tests therefore remain pending.

## Important next implementation steps

1. Install and configure the pinned \`@nuxtjs/supabase\` module in the Nuxt 4 app; update \`package-lock.json\` through npm and verify the build.
2. Use the publishable key only in the browser-safe runtime configuration. Never place a Supabase secret/service-role key in a \`NUXT_PUBLIC_*\` variable or client bundle.
3. Implement reusable Nitro helpers that validate the Supabase session, load the ICAM profile, require \`account_status = 'active'\`, and enforce permission codes for each protected endpoint.
4. Complete server-side Google hosted-domain (\`hd\`) verification using a cryptographically verified Google ID token. An email suffix alone, a user-editable metadata field, or a provider's \`hd\` request hint is not proof of institutional eligibility.
5. Configure Google OAuth only after the authorized SDCA credentials and IT approval are available. Add exact local and deployment redirect URLs.
6. Complete the role/action matrix against the approved project roles and acceptance criteria in Issue #3; amend the seeded mappings through a new migration if required.
7. Bootstrap the first application administrator through a documented, controlled database-owner procedure only after the intended account has signed in and its identity is verified. Do not hard-code a user UUID or grant admin roles automatically.
8. Add tests for unauthenticated 401, pending/inactive 403, active no-role 403, single-role and multi-role permission behavior, wrong-domain identity, role revocation, and unauthorized row access.
9. Keep all future schema changes in timestamped migrations under \`supabase/migrations/\`; do not modify the applied migration history.

## Local Nuxt environment variables

Use the current Nuxt Supabase module names:

\`\`\`dotenv
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SUPABASE_URL=https://ghsdtjsfdurzdxgnlerm.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your publishable key>
\`\`\`

The publishable key is intended for browser use with RLS enabled. A Supabase secret key is privileged and must remain server-only; do not add it unless a specific server-only operation requires it and its use has been reviewed.

## Migration history

- \`20261120083841_icam_identity_access_foundation.sql\`
- \`20261120083915_icam_fix_profile_trigger_coalesce.sql\`

These correspond to the migration versions recorded in the hosted development database.

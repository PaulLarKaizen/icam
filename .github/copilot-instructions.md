# ICAM Copilot Instructions

## Project constraints

- Use Nuxt 4, Vue 3, TypeScript, and Nitro conventions.
- Use Supabase PostgreSQL as the only authoritative database.
- Use the official `@nuxtjs/supabase` integration and supported server utilities.
- Do not use Express, MongoDB, or Mongoose.
- Do not create a separate backend repository.
- Keep secrets out of source control.
- Do not invent institutional policies, users, inventory records, or database schemas.
- Do not implement business workflows or fake authentication until explicitly approved.

## Architecture

- Feature code belongs under `app/features/` in the five ICAM categories.
- Module-specific types belong inside their feature directories.
- Shared frontend/backend types belong in `shared/types/`.
- Versioned Nitro routes belong under `server/api/v1/`.
- Protected API handlers must explicitly enforce authentication and authorization.
- Reusable server authorization helpers belong under `server/utils/auth/`.
- Authorization policies belong under `server/policies/`.
- Global server middleware is limited to request-context responsibilities.
- Activity records must be written server-side only for successful controlled operations.

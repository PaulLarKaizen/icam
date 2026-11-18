# Server Services

Services will coordinate controlled application operations and cross-cutting concerns.

## Activity Log consistency

The actual transaction system is not implemented yet. When implemented, a successful controlled database operation and its corresponding audit record must use a database transaction or an equivalent all-or-nothing consistency mechanism.

Logging must be server-side, associated with an authenticated and authorized operation, and must not be driven by client middleware or placeholder activity.

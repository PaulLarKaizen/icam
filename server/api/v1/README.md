# ICAM API v1

This directory contains versioned Nitro API routes.

Protected handlers must explicitly:

1. Authenticate the caller with server-side utilities.
2. Enforce the required authorization policy.
3. Validate input.
4. Execute a controlled repository/service operation.
5. Record a corresponding Activity Log audit record only when the operation succeeds.

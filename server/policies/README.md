# Server Authorization Policies

Policy modules will contain reusable resource and action authorization decisions.

Policies must not authenticate users or implement database mutations. Protected API handlers should combine server authentication utilities with policy checks.

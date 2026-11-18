# Server Request-Context Middleware

Global Nitro server middleware in this directory is limited to request-context responsibilities such as request metadata or observability context.

Do not place global authentication or authorization decisions here. Protected API handlers must explicitly require a user and enforce permissions.

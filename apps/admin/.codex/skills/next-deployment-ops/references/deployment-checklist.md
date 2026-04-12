# Deployment Checklist

## Build And Runtime

- Confirm the intended Node and Next versions.
- Check whether middleware, route handlers, or server actions require runtime-specific behavior.
- Ensure local development assumptions do not leak into production config.

## Configuration

- Keep `.env` variants aligned and documented.
- Distinguish public and server-only environment variables carefully.
- Fail early when required variables are missing.

## Operability

- Provide health and error visibility.
- Ensure production logs can identify route and environment context.
- Review caching expectations for stale content or auth-sensitive data.

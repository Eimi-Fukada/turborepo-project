# Error Surface Patterns

## Route-Level Handling

- Use `loading.tsx` when the route may legitimately wait.
- Use `error.tsx` when the route can fail independently.
- Use empty states for valid but missing data, not for failures.

## Logging

- Log enough context to understand which route or feature failed.
- Keep secrets, raw tokens, and personal data out of logs.
- Distinguish expected user errors from operational failures.

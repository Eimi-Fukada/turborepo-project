# Auth Routing Patterns

## Good Defaults

- Keep auth utility routes explicit, such as login and forbidden pages.
- Avoid mixing permission checks into unrelated presentation components.
- Redirect early when user identity is missing.
- Treat permission cookies or tokens as untrusted input until validated.

## Review Questions

- Does the new route belong in the public allowlist?
- Does middleware protect the route family?
- Does the server validate permissions again for data access?
- Does the route return a coherent 403, redirect, or empty state?

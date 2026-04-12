---
name: next-auth-routing-guard
description: Design and review authentication, authorization, redirects, and protected routing in Next.js App Router projects. Use when Codex needs to update middleware, route guards, login redirects, permission checks, protected layouts, cookie-based auth flows, or private-route SEO behavior.
---

# Next Auth Routing Guard

Treat route access as a server concern first.

## Core Workflow

1. Identify public, authenticated, and permission-scoped routes.
2. Keep coarse access checks in `middleware.ts`.
3. Re-check authorization where protected data is fetched or mutated.
4. Ensure redirects, forbidden states, and noindex behavior are coherent.
5. Verify route additions do not bypass existing permission models.

## Defaults

- Middleware handles routing-level gating.
- Server-side data access handles record-level authorization.
- Login, 403, and other auth utility routes remain explicit and easy to audit.
- Private routes should not be accidentally indexable.

## Use The Bundled Script

Run `scripts/route_guard_audit.py` to inventory route files and compare them with middleware allowlist patterns.

Read [auth-routing-patterns.md](./references/auth-routing-patterns.md) before changing route guards.

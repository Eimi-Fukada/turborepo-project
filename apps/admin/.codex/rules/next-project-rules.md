# Next Project Rules

Apply these rules to all Next.js work in this project unless the task explicitly requires an exception.

## Architecture

- Default to App Router and React Server Components.
- Add `"use client"` only when browser APIs, event handlers, or client-only libraries are required.
- Keep interactive logic in leaf components instead of promoting whole pages to client components.
- Fetch initial page data on the server unless the source is truly browser-only.

## SSR And Hydration

- Treat server render as the source of truth for first paint.
- Do not depend on `window`, `document`, `localStorage`, random values, or current time during server rendering.
- Split browser-only UI into client islands.
- Add `loading.tsx`, `error.tsx`, and `not-found.tsx` when route behavior would otherwise be ambiguous.

## SEO

- Every public route must define route-appropriate metadata.
- Private admin, login, and account routes must opt out of indexing with `robots`.
- Do not hide SEO-critical headings or copy behind client-only effects.
- Prefer canonical URLs whenever duplicate access paths are possible.

## Auth And Routing

- Enforce coarse auth and redirect behavior in `middleware.ts`.
- Re-check authorization in server-side data access and mutations.
- Keep route additions aligned with whitelist, permission, and redirect logic.
- Never expose sensitive admin content in prerendered HTML for unauthenticated users.

## Mobile And Accessibility

- Build mobile-first and verify narrow screens before desktop polish.
- Give tables, filters, modals, and sticky actions an explicit small-screen strategy.
- Preserve semantic headings, keyboard access, visible focus, and usable touch targets.
- Validate empty, loading, error, and form states on mobile widths.

## Performance

- Minimize client bundle cost by keeping data and computation on the server where possible.
- Dynamically import heavy client-only dependencies when they do not need to block first paint.
- Avoid unnecessary global providers.
- Reuse framework-native caching and image/font optimization before inventing custom layers.

## Delivery

- Document unusual rendering, cache, auth, or deployment decisions near the code.
- Prefer deterministic environment-variable usage and fail early on missing required config.
- Add observability for important async failures, route failures, and degraded user flows.

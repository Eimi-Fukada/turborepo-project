---
name: next-app-router-builder
description: Build, refactor, and review production-grade Next.js App Router applications. Use when Codex needs to create or modify Next.js 14/15 features, pages, layouts, route handlers, server actions, metadata, middleware, or UI flows with strong defaults for server-side rendering, SEO, performance, accessibility, and mobile-first responsiveness.
---

# Next App Router Builder

Prefer App Router patterns and default to React Server Components.

## Work From The Current App First

Inspect the target project's existing routing, providers, middleware, styling system, and data flow before editing.

For this repository:

- Preserve the App Router structure under `app/`.
- Keep `middleware.ts` authorization behavior aligned with route changes.
- Preserve Ant Design SSR wiring through `app/providers/root-provider.tsx`.
- Treat `app/layout.tsx` metadata as the global SEO baseline.

## Default Architecture

- Start on the server. Only add `"use client"` when browser APIs, event handlers, local interactive state, or client-only libraries are required.
- Keep data fetching close to the server component or route handler that owns it.
- Pass serialized data into client components instead of moving the whole page to the client.
- Split interactive islands from server-rendered shells.
- Prefer route segments, nested layouts, `loading.tsx`, `error.tsx`, and `not-found.tsx` over monolithic pages.

## Server Rendering Rules

- Prefer server components for pages, layouts, data-backed sections, and SEO-relevant content.
- Use client components for charts, rich tables, drag-and-drop, browser storage, or imperative UI libraries.
- If a page starts as a client component, check whether only a leaf actually needs client execution.
- Avoid fetching the same data in both server and client unless there is a clear revalidation strategy.
- When auth or permissions affect the initial render, enforce them on the server, in middleware, or both.
- Use streaming and suspense intentionally when the first meaningful content can render before secondary data resolves.

Read [rendering-and-data.md](./references/rendering-and-data.md) when you need a deeper rendering or caching decision.

## SEO Rules

- Always decide whether the route is crawlable, partially crawlable, or intentionally private before adding metadata.
- Use the Metadata API in layouts and pages for `title`, `description`, canonical URLs, Open Graph, robots, and alternates when relevant.
- Ensure meaningful server-rendered headings and copy exist for indexable routes.
- Avoid hiding critical SEO text behind client-only rendering.
- Add structured data only when it matches the actual page content and business type.
- For private admin screens, prefer `robots` settings that prevent indexing and make sure no sensitive content is exposed in HTML.

Read [seo-and-mobile-checklist.md](./references/seo-and-mobile-checklist.md) before shipping a public-facing route.

## Mobile And Responsive Rules

- Design mobile-first and verify the default layout at narrow widths before polishing desktop.
- Avoid fixed heights that break when browser chrome changes on mobile.
- Use responsive spacing, typography, and grid behavior instead of desktop-only assumptions.
- Ensure tap targets, drawer behavior, sticky actions, and form inputs work on touch devices.
- Treat large tables and dense admin panels as responsive problems to solve explicitly with stacking, horizontal scroll, or alternate compact layouts.
- Test loading, empty, error, and validation states on small screens.

## Performance And Robustness

- Keep the client bundle small by pushing data logic and heavy computation to the server where possible.
- Use dynamic import only when it meaningfully reduces initial client cost.
- Be careful with global providers; add them only when the state must span route boundaries.
- Preserve font loading, image optimization, and cache semantics already used by the app.
- Add `loading.tsx`, `error.tsx`, and skeletons when asynchronous work would otherwise create a blank screen.

## Implementation Workflow

1. Inspect the route, layout, provider, and middleware boundaries that the change touches.
2. Decide what must render on the server and what must remain interactive on the client.
3. Add or update metadata, canonical rules, and robots behavior for the route.
4. Implement the UI with mobile-first layout behavior and accessible semantics.
5. Re-check auth, redirects, suspense, loading, and empty states.
6. Validate build-impacting concerns such as type safety, lint issues, and obvious hydration mismatches.

## Output Expectations

When making substantive Next.js changes, explain:

- Why the chosen boundary is server or client.
- How SSR, SEO, and mobile behavior were handled.
- Any tradeoff, especially for auth-gated or highly interactive pages.

## Avoid

- Adding `"use client"` at the page level by default.
- Putting secrets, permission-only data, or private admin details into client-rendered HTML unnecessarily.
- Relying on client-side effects for content that should exist in the initial response.
- Treating SEO as only `<title>` and `description`.
- Shipping desktop-first layouts without checking narrow-width behavior.

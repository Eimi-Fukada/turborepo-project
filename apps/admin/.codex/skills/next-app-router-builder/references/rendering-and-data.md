# Rendering And Data

Use this reference when deciding how a Next.js feature should render and where its data should live.

## Pick The Boundary

- Use a server component when the route needs first-load data, SEO-visible content, secure data access, or a smaller client bundle.
- Use a client component when the code needs event handlers, browser APIs, animation state, uncontrolled third-party widgets, or local optimistic interaction.
- Start with a server page plus small client islands. Escalate to a client page only if most of the screen is truly browser-driven.

## Data Fetching

- Fetch on the server for initial page content, permission-gated data, and content that should appear without hydration.
- Fetch on the client for user-triggered refreshes, highly transient local state, or browser-only sources.
- Avoid duplicate fetch paths unless you intentionally hydrate server data into a client cache.

## App Router Patterns

- Put shared chrome and section-level data in layouts when it benefits multiple child routes.
- Use route-level `loading.tsx` when server work may delay the first meaningful render.
- Use `notFound()` for missing entities instead of ad hoc empty pages.
- Use route handlers for HTTP APIs that belong to the app surface.
- Use server actions only when the mutation model is simple and the team is comfortable with them.

## Auth And Permissions

- Enforce coarse routing rules in `middleware.ts`.
- Enforce data-level authorization again on the server where the data is fetched or mutated.
- Redirect unauthenticated users before rendering private content when possible.

## Hydration Safety

- Do not render different markup on server and client unless you intentionally suppress or isolate the mismatch.
- Gate browser-only logic behind client components.
- Keep time-, window-, and storage-dependent rendering out of server components.

## Caching And Revalidation

- Choose explicit cache semantics when data freshness matters.
- Prefer predictable behavior over clever caching.
- Document unusual cache or revalidation decisions in the code when they are easy to misunderstand.

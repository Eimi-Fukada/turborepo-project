# Route SEO Policy

## Public Routes

- Should be indexable unless there is a clear business reason not to.
- Should have specific metadata and meaningful server-rendered headings.
- Should avoid client-only rendering for critical explanatory copy.

## Semi-Public Routes

- Examples include gated previews, partner pages, or search surfaces.
- Decide robots behavior explicitly instead of inheriting defaults.
- Check whether canonical rules or duplicate paths need special handling.

## Private Routes

- Examples include admin dashboards, login, profile, settings, and internal tools.
- Should usually set restrictive robots behavior.
- Should not expose sensitive content in initial HTML.

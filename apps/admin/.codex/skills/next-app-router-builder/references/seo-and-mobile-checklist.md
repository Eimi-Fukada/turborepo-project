# SEO And Mobile Checklist

Use this checklist before shipping a Next.js route.

## SEO

- Decide whether the route is public, semi-public, or private.
- Set metadata with a route-appropriate title and description.
- Add canonical handling when duplicate URLs are possible.
- Set `robots` intentionally, especially for login, dashboard, and account areas.
- Ensure the primary heading and key copy exist in server-rendered HTML for public pages.
- Ensure social preview metadata matches the route purpose when the page is shareable.
- Avoid indexing pages that expose internal navigation labels, account details, or admin data.

## Mobile

- Start at narrow width and scale up.
- Verify no critical action is hidden below an awkward fold created by sticky headers or browser chrome.
- Ensure buttons and links have comfortable touch targets.
- Check forms, validation messages, and modal or drawer flows on small screens.
- Give dense tables an explicit small-screen strategy.
- Verify loading, error, and empty states remain readable and usable on mobile.

## Accessibility

- Use semantic headings and landmark structure.
- Preserve visible focus styles.
- Ensure color contrast survives all responsive states.
- Keep interactive controls reachable without hover.

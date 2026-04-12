---
name: next-seo-auditor
description: Audit, implement, and refine SEO behavior in Next.js App Router projects. Use when Codex needs to add or review metadata, robots rules, canonical handling, Open Graph tags, structured data, sitemap behavior, crawl boundaries, or SEO-related server-rendering decisions for public or private routes.
---

# Next SEO Auditor

Treat SEO as part of route architecture, not post-processing.

## Core Workflow

1. Classify each route as public, semi-public, or private.
2. Inspect whether the route renders meaningful content on the server.
3. Add or review route metadata through the Metadata API.
4. Set `robots`, canonical, and sharing behavior intentionally.
5. Check whether auth-gated or internal content is accidentally crawlable.

## Defaults

- Public routes should have meaningful `title`, `description`, and server-rendered headings.
- Private routes should default to noindex behavior.
- Prefer metadata in the closest layout or page that owns the route intent.
- Avoid duplicate metadata logic across nested segments unless the hierarchy truly differs.

## Use The Bundled Script

Run `scripts/metadata_audit.py` when you need a quick route inventory showing where metadata is present, missing, or likely incomplete.

## Review Focus

- Missing metadata on public routes
- Missing `robots` on private routes
- SEO-critical content rendered only after hydration
- Duplicate or ambiguous route ownership for metadata

Read [route-seo-policy.md](./references/route-seo-policy.md) for route classification guidance.

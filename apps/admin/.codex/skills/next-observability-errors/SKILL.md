---
name: next-observability-errors
description: Improve error handling, logging, and operational visibility in Next.js App Router projects. Use when Codex needs to add error boundaries, instrument async failures, improve loading and error surfaces, standardize logging context, or make route, mutation, and background failures easier to diagnose in development and production.
---

# Next Observability Errors

Make failures visible, actionable, and scoped.

## Core Workflow

1. Identify user-visible failure points and internal failure points.
2. Add route-appropriate loading, error, and empty states.
3. Ensure server and client logs carry enough route or feature context.
4. Capture failures near the async boundary where they occur.
5. Avoid leaking sensitive data in logs or error UI.

## Defaults

- Prefer route-level `error.tsx` and explicit fallbacks over generic crashes.
- Include enough context in logs to identify route, feature, or request intent.
- Keep user-facing error copy safe and concise while preserving internal diagnostics elsewhere.
- Treat auth, network, and mutation failures as first-class states.

Read [error-surface-patterns.md](./references/error-surface-patterns.md) before refactoring failure handling.

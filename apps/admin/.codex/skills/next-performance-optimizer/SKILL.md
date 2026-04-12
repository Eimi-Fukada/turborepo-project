---
name: next-performance-optimizer
description: Optimize Next.js App Router applications for rendering performance, bundle size, hydration safety, and responsive delivery. Use when Codex needs to reduce client JavaScript, review server/client boundaries, add streaming or suspense, audit hydration risks, or identify heavy dependencies and slow route patterns.
---

# Next Performance Optimizer

Favor architecture fixes over micro-optimizations.

## Core Workflow

1. Inspect whether the route starts on the server and only opts into the client when needed.
2. Look for oversized client boundaries, duplicate fetches, and heavy browser-only dependencies.
3. Isolate interactive islands and defer non-critical client code.
4. Review loading, suspense, and cache behavior.
5. Audit hydration risks and narrow-screen behavior before treating the work as complete.

## Use The Bundled Scripts

- Run `scripts/client_boundary_audit.py` to list files that use `"use client"`.
- Run `scripts/hydration_risk_audit.py` to flag browser-only APIs, random values, and time-based rendering patterns.

## Defaults

- Push data work to server components or route handlers first.
- Prefer route-level streaming over a blank initial shell.
- Dynamic import only when it materially improves startup cost.
- Treat large UI libraries, charts, editors, and 3D code as client-island candidates.

Read [performance-review-guide.md](./references/performance-review-guide.md) when a change spans multiple routes.

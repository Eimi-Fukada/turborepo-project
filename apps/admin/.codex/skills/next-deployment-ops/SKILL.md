---
name: next-deployment-ops
description: Prepare, review, and harden Next.js projects for deployment and runtime operations. Use when Codex needs to validate environment variables, build assumptions, output mode, cache strategy, runtime constraints, health checks, monitoring hooks, CI delivery concerns, or production-readiness for a Next.js application.
---

# Next Deployment Ops

Treat deployment as part of application design.

## Core Workflow

1. Inventory environment variables and fail-fast requirements.
2. Check build and runtime assumptions for the current target platform.
3. Review cache, image, font, and static asset expectations.
4. Confirm health, logging, and monitoring surfaces exist for production issues.
5. Document operational tradeoffs and safe defaults.

## Defaults

- Required environment variables should be explicit and validated.
- Runtime-sensitive decisions should be documented close to config.
- CI should verify type safety and buildability before deployment.
- Production behavior should not depend on development-only defaults.

## Use The Bundled Script

Run `scripts/env_deploy_audit.py` to compare `.env*` files, detect variable drift, and list environment names referenced in code.

Read [deployment-checklist.md](./references/deployment-checklist.md) before proposing production rollout changes.

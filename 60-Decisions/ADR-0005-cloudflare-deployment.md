---
status: accepted-target
date: 2026-08-18
decision: Cloudflare is the intended deployment target, with a backend choice still open until the P0 persistence boundary is implemented.
---

# ADR-0005: Cloudflare deployment boundary

## Context

The owner plans to deploy the learning app to Cloudflare. Pages is a suitable home for a phone-first static/PWA frontend, and Pages Functions/Workers can provide server-side routes. Authentication, learner isolation, review-event idempotency, migrations, backups, and secrets still require an explicit backend design.

## Decision

- Target Cloudflare Pages for the reproducible frontend build.
- Before persistence code is written, choose one path: Supabase Auth/Postgres/RLS behind Pages, or Cloudflare Pages Functions/Workers + D1 with equivalent server-side authorization.
- Keep a data-adapter interface so the unchosen path can be evaluated without rewriting study logic.
- Require preview isolation, HTTPS, no-secret/no-private-cache checks, health endpoint, deployment evidence, and reversible rollback before production.
- Treat push notifications as Phase 2 and opt-in; the first Cloudflare release needs only the installable PWA shell and in-app due indicators.

## Consequences

This keeps deployment practical without pretending that Pages alone provides accounts or private data isolation. The backend decision remains a deliberate implementation checkpoint rather than an accidental vendor lock-in. No Cloudflare account, binding, or production data is created by this planning pass.

## Evidence

Cloudflare's official docs cover static Pages deployment, Pages Functions, and Wrangler configuration; links and retrieval context are indexed in `50-Evidence/EVIDENCE_INDEX.md`.

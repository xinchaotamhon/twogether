---
status: accepted-for-implementation
date: 2026-08-20
decision_owner: hiep
scope: Supabase schema, RLS boundary, and optional browser client
---

# ADR-0008 — Supabase foundation before owner provisioning

## Context

The local P0 has a synchronous learner-scoped adapter, but no remote persistence. The owner wants a zero-cost personal deployment with two named learners, shared cards, private review history, and no secrets in Git. A real Supabase project and credentials are not yet authorized or available in this workspace.

## Decision

Add an additive Supabase/Postgres migration and an optional browser client path. The local adapter remains the default when Vite Supabase variables are absent. The database owns learner scope, RLS, review-event idempotency, and optimistic state conflict checks. The client continues to run the pinned FSRS scheduler and submits the resulting next state through one security-definer transaction.

## Alternatives considered

- Keep only local storage: safe for the preview, but cannot support cross-device history or real account authentication.
- MongoDB: rejected by ADR-0007 because it adds a separate authorization/API boundary for this small two-learner MVP.
- Cloudflare Worker/D1 now: reversible later, but would duplicate Auth/RLS and exceed the current implementation budget.

## Consequences and risks

- No remote behavior is claimed until the owner provisions a project, seeds only reviewed content, and runs two-account RLS checks.
- The database validates scope, idempotency, and state hashes; it does not independently recompute FSRS. A later server scheduler would be a separate decision.
- The public browser key is safe only with RLS enabled. Service-role keys remain owner-console secrets.
- Free-tier quotas and inactivity pauses remain time-sensitive; no paid upgrade is authorized.

## Focused gate and cumulative gates

- Focused gate: `backend.supabase-contract` checks migration/RLS/function/env invariants and secret hygiene.
- Cumulative smoke: every existing required smoke gate plus the focused gate.
- Owner-only operational gate after provisioning: two Auth sessions, positive own-row access, negative cross-learner access, one idempotent review write, and rollback/export evidence.

## Rollback

Unset the two Vite variables and return to the local adapter. Do not drop tables or delete review events. If a migration must be reverted, use an additive corrective migration after an owner-approved backup.

## Evidence

`50-Evidence/supabase-foundation-2026-08-20.md`

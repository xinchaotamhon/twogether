# ADR-0006 — Managed-data path with a local P0 adapter

- Status: accepted for P0 implementation
- Date: 2026-08-18
- Decision owner: Hiệp (project owner)
- Scope: study-slice persistence boundary; no remote account or deployment creation

## Context

The P0 needs review-event persistence and two-learner isolation, while the repository has no backend project, credentials, migrations, or authorized deployment. The study loop should still be runnable locally and remain reversible before real learner history exists.

## Decision

Use the managed-data path for the production boundary: Cloudflare Pages for the frontend plus Supabase Auth/Postgres/RLS for authentication, shared content, and learner-scoped state. Keep the UI and scheduler behind a small data-adapter interface.

For this local P0 slice, implement a clearly labeled local development adapter backed by browser storage. It must use the same learner-scoped contracts, append review events with idempotency keys, and reject cross-account reads/writes. It is not a substitute for server-side RLS and must not be presented as production authentication or synchronization.

## Assumptions and objections

- Assumption: Supabase reduces custom password/session/RLS implementation enough to keep the first release small.
- Objection: a local adapter can only simulate isolation; the production gate must exercise real RLS with two accounts before release.
- Objection: vendor choice can add cost and lock-in; the adapter boundary and schema contract keep a later Cloudflare-native Worker/D1 evaluation possible.

## Alternatives considered

- Cloudflare Workers/D1: viable and closer to the hosting target, but requires implementing password hashing, sessions, authorization, migrations, and idempotent writes before the study loop is proven.
- No persistence: simpler prototype, but it would not test the review-event and account-isolation contracts required by P0.

## Cost and authorization

The local adapter has no external cost. Supabase usage, secrets, project creation, and any remote data write require owner approval and a separate deployment decision. No credentials belong in this repository.

## Focused gate and cumulative gates

Focused P0 gates cover local adapter account isolation, duplicate-event idempotency, scheduler transitions, repair cap, and answer-before-reveal. Before production, the same contracts must pass positive and negative Supabase RLS tests plus the Cloudflare deployment smoke checks. All existing smoke gates remain required.

## Rollback

Remove the local adapter integration and return to Git checkpoint `2ed4510`; preserve the evidence and this decision record. If Supabase is later connected, rollback selects the prior frontend version and uses reversible migrations without deleting review events.

## Evidence

`50-Evidence/baseline-2026-08-18.md` records the pre-implementation checkpoint and green foundation gates.

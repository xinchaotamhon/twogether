# ADR-0015 — Proposed device pairing and server-derived streak

- Status: proposed; not authorized for remote activation
- Date: 2026-08-31
- Decision owner: pending Hiệp identity choice

## Current truth

The runtime is local-only. `.env.local` does not activate Supabase. Review history, qualified runs and streak live in browser storage; another browser does not receive them. The existing Supabase foundation maps learners from JWT email and permits learner-owned writes to `streaks`, so it does not meet the requested no-email picker or server-authoritative streak.

## Proposed decision

Keep daily use login-free after one-time device enrollment. Each browser profile receives a Supabase anonymous Auth UID, then an already enrolled device creates a strong, short-lived, one-use pairing link/QR. The database stores only the token hash and maps the claimed Auth UID to one learner through `learner_devices`. RLS derives learner identity from `auth.uid()`; the browser never chooses an arbitrary learner ID.

Use append-only review events and immutable `daily_qualifications` as source truth. Derive current/best streak on the server; clients cannot write a streak counter. An IndexedDB outbox keeps stable idempotency keys through reload/retry. Conflicting offline reviews of the same card fail visibly and reload server state; full multi-device offline FSRS merge is out of P0.

## Required Human choice and limitation

Cryptography cannot distinguish Hiệp from Hoàng when both use the same browser session and neither supplies email, PIN, passkey, OS profile, or another factor. Recommended P0: one learner per browser/OS profile; shared physical machines use two browser profiles. If both learners must share one browser while blocking each other, a passkey/PIN is required. Supabase passkey support is currently experimental and still needs an existing confirmed account for registration, so it is not selected now.

## Gate, authorization, cost, and rollback

Before activation: anonymous-unpaired denial, two-learner RLS denial, invite expiry/reuse/revocation, idempotent retry, explicit conflict, outbox reload, timezone boundaries, stale streak reset, direct streak-write denial, local import dry-run and backup. Free tier and USD 0 remain required. Activation needs a new Human identity decision and owner-operated Supabase migration/RLS test. Rollback returns read authority to the local adapter while preserving remote events and local exports; never drop review history to repair sync.


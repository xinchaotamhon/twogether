# ADR-0015 — Device pairing and server-derived streak

- Status: accepted for implementation; remote migration remains owner-operated
- Date: 2026-09-01
- Decision owner: Hiệp authorized the simplest no-daily-login path on 2026-09-01

## Current truth

The runtime is local-only. `.env.local` does not activate Supabase. Review history, qualified runs and streak live in browser storage; another browser does not receive them. The existing Supabase foundation maps learners from JWT email and permits learner-owned writes to `streaks`, so it does not meet the requested no-email picker or server-authoritative streak.

## Proposed decision

Keep daily use login-free after one-time device enrollment. Each browser profile receives a Supabase anonymous Auth UID, then an already enrolled device creates a strong, short-lived, one-use pairing link/QR. The database stores only the token hash and maps the claimed Auth UID to one learner through `learner_devices`. RLS derives learner identity from `auth.uid()`; the browser never chooses an arbitrary learner ID.

Use append-only review events and immutable `daily_qualifications` as source truth. Derive current/best streak on the server; clients cannot write a streak counter. The first activation is online-first: a review is only shown as saved after the server confirms it. Stable idempotency keys make retry safe, and the untouched local snapshot remains the rollback/import source. A durable offline outbox and full multi-device offline FSRS merge remain P1 because ordering two offline reviews of the same card is ambiguous.

## Required Human choice and limitation

Cryptography cannot distinguish Hiệp from Hoàng when both use the same browser session and neither supplies email, PIN, passkey, OS profile, or another factor. Recommended P0: one learner per browser/OS profile; shared physical machines use two browser profiles. If both learners must share one browser while blocking each other, a passkey/PIN is required. Supabase passkey support is currently experimental and still needs an existing confirmed account for registration, so it is not selected now.

## Gate, authorization, cost, and rollback

Before activation: anonymous-unpaired denial, two-learner RLS denial, invite expiry/reuse/revocation, idempotent retry, explicit conflict, timezone boundaries, stale streak reset, direct streak-write denial, and idempotent local import with backup. Free tier and USD 0 remain required. The repository may prepare the migration and UI, but the owner must enable anonymous Auth and run the migration in the intended Supabase project. Rollback uses `VITE_SYNC_MODE=local` and preserves both remote events and local data; never drop review history to repair sync.

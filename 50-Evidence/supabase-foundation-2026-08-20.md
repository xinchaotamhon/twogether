---
evidence_id: supabase-foundation-2026-08-20
recorded_at: 2026-08-20
status: implementation-ready-owner-provisioning-pending
owner: hiep
---

# Supabase foundation evidence

## Scope

This change adds an implementation-ready Supabase boundary without creating a remote project or storing credentials. It includes:

- `supabase/migrations/202608200001_initial.sql`: shared nodes/cards, provenance/revisions, learner-scoped state, review events, preferences, sessions, streaks, private notes, allowlist mapping, RLS, and the idempotent `record_review` transaction.
- `supabase/seed.sql`: four project-owned fixture nodes, three edges, and 12 published fixture cards only.
- `.env.example`: browser-safe URL/key names; no service-role key.
- `src/supabaseClient.ts` and `src/supabaseAdapter.ts`: optional production path. The app stays on local preview mode unless both Vite variables are configured.
- `supabase/README.md`: owner-only provisioning and rollback steps.

## Explicit boundary

No Supabase project was created, no Auth users were created, and no email/password/key was requested or stored. The real RLS test remains an owner-only operational gate requiring two authenticated sessions after provisioning. Draft English/React cards are deliberately excluded from the seed.

## Verification

- Focused command: `node tools/check_supabase_contract.mjs` — validates schema/RLS/function markers, fixture-only seed, env boundary, and secret hygiene.
- Cumulative smoke command: `tools/run_gates.py --tier smoke` — final run `20260820T160059Z-7e8c38d1` passed 11/11, including `backend.supabase-contract` and all older required gates on the same artifact.
- `npm run build` passed after adding the optional client; the local unit suite remains 7/7 and the browser gate remains 4/4.
- Local tests continue to cover the local adapter and scheduler. A remote RLS result must not be claimed from local tests.

## Owner provisioning checklist

1. Create a Supabase Free project while signed in as Hiệp.
2. Apply the migration, create exactly two Auth users, and insert their real emails into `allowed_learners` in the Supabase console only.
3. Run `supabase/seed.sql`.
4. Set the project URL and publishable/anon key in the local/Cloudflare environment.
5. Test Hiệp and Hoàng sessions: own read/write succeeds, cross-learner read/write fails, duplicate idempotency key produces one event, and a stale state hash is rejected.

## Rollback

Unset `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to return to the local adapter. Preserve the database and review events; do not delete history to repair a conflict.

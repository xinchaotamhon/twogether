# Paired sync and transfer answers — 2026-09-01

## Implemented locally

- All 80 English Core cards now have a worked `transfer_answer` behind `Xem lời giải gợi ý`, visible only after the mandatory attempt and main reveal. The old secondary-question UI is inactive. The 25-term structured glossary remains touch/keyboard accessible.
- `202609010001_device_pairing_sync.sql` adds anonymous Auth device membership, hashed/expiring/one-use pairing invites, run attempts, immutable daily qualifications, server-derived streak, idempotent `record_review_v2`, local-history import and direct streak-write denial.
- The app creates or resumes an anonymous session, requires a one-time pairing code, never asks for daily email/PIN, and can generate a ten-minute code for another device. One browser profile maps to one learner.
- Existing local learning data is backed up under a versioned browser key before one-time import. Local data is never deleted after an import attempt. Remote review is online-first; full multi-device offline merge remains out of scope.
- `supabase/seed.sql` now contains exactly the owner-approved 80-card English Core set, transfer examples and glossary references; historical fixtures and React drafts are absent.

## Remote truth and blocker

- No migration or seed was applied to the owner project in this run.
- A read-only OpenAPI probe using the configured browser values failed at DNS resolution (`No such host is known`). No URL/key value was printed or changed.
- Therefore remote RLS, anonymous Auth, import, two-device conflict and streak behavior are not claimed as live. The safe runtime fallback remains `VITE_SYNC_MODE=local` or the in-app local fallback.

## Verification

- Static device-sync safety contract passed: RLS identity mapping, token hashing, idempotency, server-derived streak, local backup and exact seed.
- Transfer/glossary contract passed.
- Unit tests 26/26, Playwright 12/12, production build, and cumulative receipt `20260901T052017Z-936f280c` passed.

Remote activation requires a valid resolvable Supabase URL, Anonymous Sign-Ins, owner-operated migrations/seed/bootstrap codes and real two-identity negative RLS tests. Rollback sets `VITE_SYNC_MODE=local` and preserves both local and remote histories.

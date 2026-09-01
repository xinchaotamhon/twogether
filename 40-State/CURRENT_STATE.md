---
last_verified: 2026-09-01
verified_by: Codex transfer/coursebook/sync implementation
status: active — local learning verified; remote Supabase activation blocked by unresolved configured host
---

# Current State

## Verified facts

- Twogether is a phone-first React/TypeScript/Vite PWA for Hiệp and Hoàng. The core loop remains open recall → required `Đã thử` → reveal → only `Nhớ`/`Quên`, mapped to FSRS `Good`/`Again`, with bounded repair.
- Hiệp's exact 80-card English Generative Core v1 remains the published backbone in ten decks × eight. The 12 historical fixture cards/decks remain absent from active study while their old events/states survive local migration.
- Every English Core card now receives a worked `transfer_answer` after reveal. It is collapsed behind `Xem lời giải gợi ý` and described as one valid approach, not the only answer. The old secondary-question UI is inactive. The 25-term structured glossary remains active before and after reveal.
- Three subagents visually inspected all 176 pages of the owner-provided Empower A2 Students' Book in three ranges. `content/drafts/empower-a2-coursebook-final-review-v1.json` contains 81 newly worded, source-page-linked cards with transfer answers and English Core prerequisites.
- Empower A2 is a durable learning branch, not an exam-only deck. Exam urgency may change priority, but accepted cards continue through FSRS. The UI checkbox means `Đánh dấu cần bỏ/sửa`; a Human click merges only unflagged cards into `Empower A2 · Học bền vững`.
- The 81 coursebook cards remain `review` until that click. No AI card is falsely marked Human-approved. Each card anchors to an existing English Core node rather than creating an isolated exam tree.
- The DAG map remains lazy React Flow with pan/zoom/pinch/fit/minimap, multi-parent relations, virtual universal root and accessible table.
- Supabase cloud code now exists: anonymous session, one-time hashed/expiring device pairing, `auth.uid()` membership RLS, idempotent FSRS review RPC, server-validated collection runs, immutable daily qualifications, server-derived streak and one-time local-history import with retained backup.
- Daily cloud use needs no email or PIN. Security limitation remains: one browser/OS profile maps to one learner; a shared physical device needs two browser profiles unless a PIN/passkey is added later.
- `supabase/seed.sql` contains exactly the owner-approved 80 English Core cards, not fixtures or React drafts. Migration/bootstrap instructions live in `supabase/README.md`.
- Remote activation is not verified. A read-only probe using `.env.local` failed before HTTP because the configured host did not resolve. No migration, seed or account setting was changed in this run.
- Safe fallback remains local mode. Existing local review state and streak inputs were not deleted. Cloud import also keeps a versioned local backup.
- Verification: 26/26 unit tests, production build, 12/12 Playwright/Chrome tests and cumulative receipt `20260901T052017Z-936f280c` with 14/14 required gates.
- Budget remains USD 0/month; Cloudflare Pages Free + Supabase Free only, no paid upgrade authorized.

## Blockers

- Correct/confirm a resolvable `VITE_SUPABASE_URL`. Do not print or commit private environment values.
- Then the owner must enable Anonymous Sign-Ins, apply timestamped migrations, run the exact seed and bootstrap-code SQL, and perform real Hiệp-vs-Hoàng negative RLS tests before cloud authority is claimed.
- Hiệp must review the 81 Empower cards in the UI. Flag weak cards and merge the remainder. A later AI can use the stable IDs/page provenance to revise only flagged cards.
- Full offline multi-device FSRS merge is not implemented; online review confirmation is required in cloud mode because ordering simultaneous offline reviews is ambiguous.
- Ten React cards in the source packet remain draft history. React Generative Core still needs a separate source/review/publish cycle.

## Evidence

Read `50-Evidence/paired-sync-and-transfer-answers-2026-09-01.md`, `50-Evidence/empower-a2-coursebook-review-2026-09-01.md`, ADR-0015, ADR-0016 and ADR-0017. Green tests prove artifact contracts, not language mastery or live remote security.

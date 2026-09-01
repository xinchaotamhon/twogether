---
last_verified: 2026-09-01
verified_by: Codex beginner-core/map-home implementation with fresh-agent audits
status: active — map-first local learning verified; beginner and coursebook packets await Human review; remote schema absent
---

# Current State

## Verified facts

- Twogether is a phone-first React/TypeScript/Vite PWA for Hiệp and Hoàng. The core loop remains open recall → required `Đã thử` → reveal → only `Nhớ`/`Quên`, mapped to FSRS `Good`/`Again`, with bounded repair.
- Hiệp's exact 80-card English Generative Core v1 remains the published backbone with stable IDs. The 12 historical fixture cards/decks remain absent from active study while their old events/states survive local migration.
- `content/drafts/english-core-beginner-revision-v2.json` is a second-review packet: 80 beginner rewrites plus 9 new bridge cards, grouped 8/9/9/9/9/9/9/9/9/9 by actual learning need. It is still `review`; no AI review was promoted to Human approval.
- The `Thẻ` screen lets Hiệp flag weak beginner cards and apply only accepted revisions. A flagged rewrite keeps the published v1 card and FSRS history; a flagged new bridge remains outside the collection.
- Durable authoring preferences now live in `docs/CONTENT_STYLE_HIEP_HOANG.md`. The contract assumes first exposure, starts with plain Vietnamese/examples, requires worked model answers, pairs every transfer prompt with its answer and forbids self-prerequisites or fixed card quotas.
- Every English Core card now receives a worked `transfer_answer` after reveal. It is collapsed behind `Xem lời giải gợi ý` and described as one valid approach, not the only answer. The old secondary-question UI is inactive. The 25-term structured glossary remains active before and after reveal.
- Three subagents visually inspected all 176 pages of the owner-provided Empower A2 Students' Book in three ranges. `content/drafts/empower-a2-coursebook-final-review-v1.json` contains 81 newly worded, source-page-linked cards with transfer answers and English Core prerequisites.
- Empower A2 is a durable learning branch, not an exam-only deck. Exam urgency may change priority, but accepted cards continue through FSRS. The UI checkbox means `Đánh dấu cần bỏ/sửa`; a Human click merges only unflagged cards into `Empower A2 · Học bền vững`.
- The 81 coursebook cards remain `review` until that click. No AI card is falsely marked Human-approved. Each card anchors to an existing English Core node rather than creating an isolated exam tree.
- The knowledge tree is now the default full-screen home. Its visual skeleton grows upward from `Bản chất chung` through a domain node (`Tiếng Anh`) to modules; `part_of` owns layout while prerequisite edges remain dashed overlays. React Flow still supplies pan/zoom/pinch/fit/minimap and the accessible table remains in parity.
- Collection checkboxes form a per-learner focus list; `Học bộ này` starts one real collection so FSRS and one-collection-per-day streak semantics stay honest. Graph CRUD moved under `Thẻ`.
- Supabase cloud code now exists: anonymous session, one-time hashed/expiring device pairing, `auth.uid()` membership RLS, idempotent FSRS review RPC, server-validated collection runs, immutable daily qualifications, server-derived streak and one-time local-history import with retained backup.
- Daily cloud use needs no email or PIN. Security limitation remains: one browser/OS profile maps to one learner; a shared physical device needs two browser profiles unless a PIN/passkey is added later.
- `supabase/seed.sql` contains exactly the owner-approved 80 English Core cards, not fixtures or React drafts. Migration/bootstrap instructions live in `supabase/README.md`.
- Remote activation is not verified. A read-only probe now resolves the configured Supabase host and `/auth/v1/health` accepts the public browser key. REST probes for `profiles` and `concept_nodes` return `404`, showing that the application schema has not been applied. No migration, seed or account setting was changed in this run.
- Safe fallback remains local mode. Existing local review state and streak inputs were not deleted. Cloud import also keeps a versioned local backup.
- Verification: 29/29 unit tests, production build, dependency audit with 0 vulnerabilities, 15/15 Playwright/Chrome tests and cumulative receipt `20260901T114856Z-6186d2d3` with 15/15 required smoke gates.
- Budget remains USD 0/month; Cloudflare Pages Free + Supabase Free only, no paid upgrade authorized.

## Blockers

- The owner must explicitly authorize enabling Anonymous Sign-Ins and applying timestamped migrations, seed and bootstrap SQL. Then real Hiệp-vs-Hoàng negative RLS/conflict tests must pass before cloud authority is claimed.
- Hiệp must second-review the 89 beginner Core candidates. Flag weak cards and apply only the remainder; until then the exact approved v1 backbone stays active.
- Hiệp must review the 81 Empower cards in the UI. Flag weak cards and merge the remainder. A later AI can use the stable IDs/page provenance to revise only flagged cards.
- Full offline multi-device FSRS merge is not implemented; online review confirmation is required in cloud mode because ordering simultaneous offline reviews is ambiguous.
- Ten React cards in the source packet remain draft history. React Generative Core still needs a separate source/review/publish cycle.

## Evidence

Read `50-Evidence/beginner-core-map-home-2026-09-01.md`, the paired-sync/coursebook evidence, and ADR-0015 through ADR-0018. Green tests prove artifact contracts, not language mastery, Human content approval or live remote security.

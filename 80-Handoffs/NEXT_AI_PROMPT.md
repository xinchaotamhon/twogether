---
last_verified: 2026-09-01
verified_by: Codex beginner-core/map-home implementation with fresh-agent audits
status: active
---

# Next AI Handoff

Continue Twogether from the repository, not chat memory. Read `START_HERE.md` and its full order first. Hiệp owns the project; Hoàng is the second learner.

## Current baseline

- English Core v1: exactly 80 owner-approved published cards with stable IDs. Immutable source and approval manifest remain under `content/drafts/` and `content/reviews/`; eight-card v1 packaging is not a future quota.
- Beginner Core v2: `content/drafts/english-core-beginner-revision-v2.json` contains 80 rewrites plus 9 bridge cards and remains second-review only. In `Thẻ`, a flagged rewrite retains the published v1 card/history; a flagged bridge remains unpublished. Read `docs/CONTENT_STYLE_HIEP_HOANG.md` before touching content.
- Study contract: open recall, mandatory attempt, main reveal, only `Nhớ`/`Quên`, FSRS, bounded repair. Never convert this to multiple choice or endless repetition.
- Active support: structured glossary plus one worked `transfer_answer` for every core card after reveal. Do not restore the secondary-question preview. Transfer wording is AI-authored at owner request and must not be described as line-by-line Human-reviewed.
- Empower A2: source PDF fingerprint and full inspection evidence are in `50-Evidence/empower-a2-coursebook-review-2026-09-01.md`. The review packet has 81 cards. It is long-term learning, not a disposable exam deck. Checkboxes flag cards to exclude/fix; the merge action takes only unflagged cards.
- Coursebook cards anchor to existing English Core nodes via prerequisites. Preserve stable IDs and page provenance when revising a flagged card.
- Supabase implementation is present but not remotely verified. The configured host now resolves and Auth health accepts the public key, but `profiles` and `concept_nodes` return `404`; the application schema is absent. Do not claim live sync until owner-authorized provisioning and real RLS/conflict tests pass.
- Cloud identity is anonymous device pairing: one browser profile → one learner. Never sign out an anonymous device as a routine learner-switch action; pair another device first. No service-role key belongs in React or `VITE_*`.
- `supabase/seed.sql` is the exact 80-card approved core. Run migrations in timestamp order, then seed, then `bootstrap_pairing_codes.sql` only after backup and owner confirmation.
- Local fallback and local backups are deliberate rollback paths. Never clear localStorage or delete remote events to repair sync.
- Map is the default full-screen home. It grows upward from the universal root through domain nodes such as English; `part_of` is the visual skeleton and `prerequisite` is an overlay. Focus checkboxes do not merge collections into one run. React Flow viewport and accessible table remain required.
- Latest verification: unit 29/29, browser 15/15, production build and dependency audit pass; cumulative receipt `20260901T114856Z-6186d2d3` passed 15/15.
- The zero-cost personal deployment constraint remains absolute. Do not spend money or enable a paid Supabase/Cloudflare add-on without a new explicit owner decision.

## Next bounded work

1. Let Hiệp second-review Beginner Core v2 and Empower A2 separately. Revise flagged cards only; never automatically approve either packet.
2. At action time, obtain owner confirmation before enabling Anonymous Sign-Ins or applying SQL in the remote dashboard. Apply migrations/seed/bootstrap in the documented order.
3. Pair one browser profile for Hiệp and one for Hoàng. Run real negative RLS tests: unpaired denial, cross-learner denial, invite expiry/reuse, idempotent review retry, same-card conflict, direct streak-write denial, qualification idempotency and Asia/Ho_Chi_Minh date boundaries.
4. Run a seven-day map-first learning pilot and update `docs/CONTENT_STYLE_HIEP_HOANG.md` whenever Human feedback reveals a reusable content rule.
5. After the durable English branch is in use, build React as a separate domain branch from authoritative React sources and a new Human approval manifest.

## Do not do

- Do not call Empower A2 an exam-only or temporary deck.
- Do not describe Beginner Core v2 or its fresh-agent audits as Human approval.
- Do not restore a fixed eight-card quota or detach a transfer answer from its transfer prompt.
- Do not silently publish all 81 AI cards or mark them Human-reviewed.
- Do not reintroduce scaffold questions after the owner's correction.
- Do not claim cross-device sync from static SQL checks alone.
- Do not spend money, request notification permission on load, expose environment values, erase review history, or weaken RLS for convenience.

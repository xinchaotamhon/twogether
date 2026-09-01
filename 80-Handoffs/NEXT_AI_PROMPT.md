---
last_verified: 2026-09-01
verified_by: Codex transfer/coursebook/sync implementation
status: active
---

# Next AI Handoff

Continue Twogether from the repository, not chat memory. Read `START_HERE.md` and its full order first. Hiệp owns the project; Hoàng is the second learner.

## Current baseline

- English Core v1: exactly 80 owner-approved published cards, ten decks × eight. Immutable source and approval manifest remain under `content/drafts/` and `content/reviews/`.
- Study contract: open recall, mandatory attempt, main reveal, only `Nhớ`/`Quên`, FSRS, bounded repair. Never convert this to multiple choice or endless repetition.
- Active support: structured glossary plus one worked `transfer_answer` for every core card after reveal. Do not restore the secondary-question preview. Transfer wording is AI-authored at owner request and must not be described as line-by-line Human-reviewed.
- Empower A2: source PDF fingerprint and full inspection evidence are in `50-Evidence/empower-a2-coursebook-review-2026-09-01.md`. The review packet has 81 cards. It is long-term learning, not a disposable exam deck. Checkboxes flag cards to exclude/fix; the merge action takes only unflagged cards.
- Coursebook cards anchor to existing English Core nodes via prerequisites. Preserve stable IDs and page provenance when revising a flagged card.
- Supabase implementation is present but not remotely verified. ADR-0015 is accepted. The configured host failed DNS resolution; do not claim live sync until the URL resolves and real RLS tests pass.
- Cloud identity is anonymous device pairing: one browser profile → one learner. Never sign out an anonymous device as a routine learner-switch action; pair another device first. No service-role key belongs in React or `VITE_*`.
- `supabase/seed.sql` is the exact 80-card approved core. Run migrations in timestamp order, then seed, then `bootstrap_pairing_codes.sql` only after backup and owner confirmation.
- Local fallback and local backups are deliberate rollback paths. Never clear localStorage or delete remote events to repair sync.
- Map remains a DAG with React Flow viewport and accessible table. Do not force multi-parent knowledge into one irreversible tree parent.
- Latest verification: unit 26/26, browser 12/12, production build, cumulative `20260901T052017Z-936f280c` 14/14.
- The zero-cost personal deployment constraint remains absolute. Do not spend money or enable a paid Supabase/Cloudflare add-on without a new explicit owner decision.

## Next bounded work

1. Help Hiệp correct/confirm the Supabase project URL without exposing it. Re-run a read-only reachability probe.
2. At action time, obtain owner confirmation before enabling Anonymous Sign-Ins or applying SQL in the remote dashboard. Apply migrations/seed/bootstrap in the documented order.
3. Pair one browser profile for Hiệp and one for Hoàng. Run real negative RLS tests: unpaired denial, cross-learner denial, invite expiry/reuse, idempotent review retry, same-card conflict, direct streak-write denial, qualification idempotency and Asia/Ho_Chi_Minh date boundaries.
4. In the card library, let Hiệp flag weak Empower cards and merge the rest. Revise flagged cards only; do not automatically approve the whole packet.
5. After the durable English branch is in use, build React as a separate principle trunk from authoritative React sources and a new Human approval manifest.

## Do not do

- Do not call Empower A2 an exam-only or temporary deck.
- Do not silently publish all 81 AI cards or mark them Human-reviewed.
- Do not reintroduce scaffold questions after the owner's correction.
- Do not claim cross-device sync from static SQL checks alone.
- Do not spend money, request notification permission on load, expose environment values, erase review history, or weaken RLS for convenience.

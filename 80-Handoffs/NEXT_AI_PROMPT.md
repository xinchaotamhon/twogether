---
last_verified: 2026-09-01
verified_by: Codex owner-approved v2/fullscreen-direct-map implementation
status: active
---

# Next AI Handoff

Continue from the repository, not chat memory. Read `START_HERE.md` and its full order first. Hiệp owns the project; Hoàng is the second learner.

## Current baseline

- English Core v2 is official: exactly 89 owner-approved published cards in ten variable-size decks. The 80 stable IDs preserve prior FSRS state; nine `core-en-bridge-*` IDs are new. The Human manifest is `content/reviews/english-generative-core-v2-owner-approval-2026-09-01.json` and the immutable source review packet is `content/drafts/english-core-beginner-revision-v2.json`.
- Read `docs/CONTENT_STYLE_HIEP_HOANG.md` before touching content. Assume first exposure, use plain Vietnamese before labels, require open recall, provide a worked answer matching each transfer prompt and keep glossary explanations available on demand.
- Study behavior is mandatory attempt → reveal → only `Nhớ`/`Quên` → FSRS → bounded repair. Never replace it with multiple choice or endless same-card repetition.
- The default home and study surface is one React Flow tree with no sidebar, deck checkboxes or `Tiếp tục` page. A studyable node opens the flashcard loop in a scrollable overlay; closing it preserves the map. Extra collections sharing a root receive virtual collection nodes. Preserve bottom-root growth, pan/zoom/pinch/fit/minimap, dashed prerequisite overlays and the screen-reader table.
- The `Thẻ` screen provides CRUD. English Core v2 is shown once as official content; editing creates a draft without erasing review history. The obsolete Beginner Core second-review panel is not part of the active UI.
- Empower A2 remains an 81-card long-term Human review packet. Checkboxes flag weak cards to exclude/fix; never silently publish it or call it exam-only.
- Supabase code is present, but live authority is not yet proven. `CONNECT_SUPABASE.bat` assembles ordered migrations + exact 89-card seed + pairing bootstrap, copies SQL to clipboard and opens the relevant dashboard pages. The owner must sign in, enable anonymous sign-ins and run it.
- Cloud identity is anonymous device pairing: one browser profile → one learner. Never put a service-role key in React or `VITE_*`; never sign out or clear a paired anonymous profile casually.
- Existing local history and cloud-import backup are rollback paths. Never erase review events, FSRS state, streak inputs or localStorage to repair a deployment.
- Previous published checkpoint: commit `516b677`. The inline-study artifact passed 29/29 unit, 14/14 Chrome, production build, dependency audit and cumulative receipt `20260901T142935Z-3cb2e09a` (15/15); consult current state/evidence for its publication commit.
- The zero-cost personal deployment constraint remains absolute. Do not spend money or enable paid Supabase/Cloudflare features without a new explicit owner decision.

## Next bounded work

1. Have the owner run `CONNECT_SUPABASE.bat`; keep pairing codes outside chat and repository.
2. Pair separate browser profiles for Hiệp and Hoàng and run real RLS/conflict/date-boundary tests before claiming cross-device sync live.
3. Deploy the verified commit to Cloudflare with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and cloud mode, then test one real review and streak update on each profile.
4. Continue Human review of Empower A2. Later build React as a separate domain branch from authoritative React sources and a new approval manifest.

## Do not do

- Do not revert to 80 published cards, fixed eight-card decks, a separate study page, a focus sidebar, collection checkboxes or a vertically scrolling map home.
- Do not detach transfer answers from their prompts or hide unexplained technical terms.
- Do not claim Supabase is live from static checks alone, weaken RLS, expose environment values/pairing codes, or overwrite remote history.
- Do not spend money, request notification permission on load, or describe AI review as Human approval.

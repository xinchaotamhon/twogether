---
last_verified: 2026-08-31
verified_by: Codex learning-support/map implementation and sync design review
status: active
---

# Next AI Handoff

You are continuing Twogether. Read `START_HERE.md` and its entire read order before editing. The owner is Hiệp; the second learner is Hoàng. Do not rely on chat history.

## Current baseline

- Twogether is a phone-first React/TypeScript/Vite PWA. Daily entry is only the Hiệp/Hoàng picker: no email, password, or PIN.
- Core study is open recall → mandatory “Đã thử” → reveal → only `Nhớ`/`Quên`, backed by FSRS and a bounded repair queue.
- Hiệp approved all 80 English Generative Core v1 cards on 2026-08-26. Read `content/reviews/english-generative-core-v1-owner-approval-2026-08-26.json` and ADR-0012.
- `content/drafts/core-curriculum-drafts-v2.json` remains the immutable draft/provenance packet: 80 English plus 10 unchanged React drafts. `src/approvedCurriculum.ts` derives only the exact approved English IDs as published runtime content with reviewer `hiep`.
- Runtime study contains ten English decks × eight cards. The old 12 fixture cards/two decks are hidden from active shelf/map, while v1→v2 migrations preserve legacy card states, review events, runs, streak inputs, local cards/revisions, and learner-created collections.
- The DAG map is rendered by lazy `@xyflow/react@12.11.5`: pan, wheel/pinch zoom, `+`/`−`/fit controls, and minimap. Project code still owns deterministic layout, multi-parent edges, virtual root, progress, cycle validation, and the accessible table. Do not make the canvas authoritative or force future nodes into one parent.
- `content/drafts/english-core-support-v1.json` has exactly 80 AI-draft support records. The card library has an explicit browser-local preview switch; support adds a secondary question/answer and structured glossary before the mandatory main attempt. It remains `ai_draft_unreviewed` until Hiệp approves exact wording.
- `src/glossary.ts` has 25 reusable terms, including finite/non-finite verbs. CRUD, packet round-trip, and `202608310001_card_support.sql` preserve optional support fields, but the migration does not approve or activate the packet.
- Current local verification: 25/25 unit tests, production build, 11/11 Chrome tests, audit 0, and final cumulative receipt `20260831T154931Z-083172f9` passed 12/12.
- English Core v1 is the level-1–3 backbone, not all English. Read `docs/CURRICULUM_EXPANSION_ROADMAP.md` for IPA/pronunciation, vocabulary, comparison, React, and future-domain rules.
- localStorage is still persistence authority. It survives deploy/migration on one browser but does not sync across browsers. `.env.local` Supabase values do not activate remote sync. ADR-0015 proposes anonymous device identities, one-use pairing, membership RLS, an IndexedDB outbox, and server-derived streak, but is not authorized for remote activation.
- The zero-cost personal deployment constraint remains: USD 0/month, Cloudflare Pages Free + Supabase Free only, no paid add-on or silent upgrade.

## Execute next

1. Ask Hiệp to use the support preview during the seven-day pilot and report any scaffold that leaks the main answer or glossary entry that remains unclear. Do not convert preview use into approval.
2. Revise an approved main card only through a new draft revision; never erase review history or mutate the raw source packet.
3. After pilot evidence, propose one bounded English branch. Keep it draft until Hiệp explicitly accepts/revises/rejects it.
4. Before cross-device work, obtain the required Human identity choice: recommended one learner per browser/OS profile; otherwise a PIN/passkey/login factor is unavoidable for a shared browser. Then implement ADR-0015 additively with backup, dry-run, real two-identity RLS, conflict, idempotency, timezone, and rollback gates.
5. If Hiệp asks for React, build a separate subject trunk using official React principles; preserve the existing ten React drafts as history until Human review.

## Do not do

- Do not restore the 12 legacy fixtures to active study or delete their history.
- Do not bulk-publish future AI content.
- Do not mark the 80 support records Human-reviewed merely because the preview is enabled.
- Do not turn the core path into multiple choice.
- Do not hard-reset mature cards on `Quên` or create endless repair loops.
- Do not claim secure cross-browser isolation without authenticated identity and real RLS evidence.
- Do not request notifications on page load.
- Do not spend money. Preserve/export data and report a free-tier limit rather than silently upgrading.

## Definition of done for this release

Ten owner-approved decks are live; support remains explicit preview; a browser holding v1 data migrates without clearing storage; learner histories remain separate; the zoomable DAG and accessible table work; PWA cache updates; focused and cumulative gates pass; and the release is ready for owner-operated Cloudflare deployment. Learning mastery, support wording quality, and remote sync are not claimed by green tests.

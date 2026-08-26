---
last_verified: 2026-08-26
verified_by: Codex owner-approved English Core publication
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
- The DAG map derives visual depth from edges, attaches parentless subject branches to the virtual universal root, expands horizontally, and keeps an accessible table. Do not force future nodes into one parent.
- Current local verification: 20/20 unit tests, production build, 10/10 Chrome tests, and `tools/check_published_english_core.py` pass.
- English Core v1 is the level-1–3 backbone, not all English. Read `docs/CURRICULUM_EXPANSION_ROADMAP.md` for IPA/pronunciation, vocabulary, comparison, React, and future-domain rules.
- localStorage is still persistence authority. It survives deploy/migration on one browser but does not sync across browsers. `.env.local` Supabase values do not activate remote sync.
- The zero-cost personal deployment constraint remains: USD 0/month, Cloudflare Pages Free + Supabase Free only, no paid add-on or silent upgrade.

## Execute next

1. Support the seven-day pilot and capture observed wording/transfer/workload failures.
2. Revise an approved card only through a new draft revision; never erase review history or mutate the raw source packet.
3. After pilot evidence, propose one bounded branch. Keep it draft until Hiệp explicitly accepts/revises/rejects it.
4. If Hiệp asks for cross-device sync, first record identity/privacy assumptions and implement one-time pairing/recovery plus real Supabase RLS/export/rollback gates. Choosing a visible profile alone is not secure authentication.
5. If Hiệp asks for React, build a separate subject trunk using official React principles; preserve the existing ten React drafts as history until Human review.

## Do not do

- Do not restore the 12 legacy fixtures to active study or delete their history.
- Do not bulk-publish future AI content.
- Do not turn the core path into multiple choice.
- Do not hard-reset mature cards on `Quên` or create endless repair loops.
- Do not claim secure cross-browser isolation without authenticated identity and real RLS evidence.
- Do not request notifications on page load.
- Do not spend money. Preserve/export data and report a free-tier limit rather than silently upgrading.

## Definition of done for this release

Ten owner-approved decks are live; a browser holding v1 data migrates without clearing storage; learner histories remain separate; the dynamic DAG and accessible table work; PWA cache updates; focused and cumulative gates pass; and the release is pushed for owner-operated Cloudflare deployment. Learning mastery and remote sync are not claimed by green tests.

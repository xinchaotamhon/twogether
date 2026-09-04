# Next AI Handoff

Continue from the repository, not chat memory. Read `START_HERE.md` and its full order first. Hiệp owns the project; Hoàng is the second learner.

## Current baseline

- ADR-0021 is active. The default `VITE_STUDY_MODE=session` must not initialize Supabase, call FSRS, write durable reviews/runs or calculate/show streak. Only wrong-card IDs live in learner/deck-scoped `sessionStorage`; refresh in one tab survives and closing the tab clears them.
- Do not delete the dormant durable code or history. `VITE_STUDY_MODE=fsrs` explicitly restores it later; cloud still needs an additive seed/migration for the 74 approved Empower cards and any newly approved vocabulary, owner activation, plus real two-profile RLS/conflict tests. The existing prepared seed is the older 89-Core checkpoint.
- Home is one full-screen bottom-root tree. The renderer uses a deterministic spanning-tree projection for readable branching while preserving the complete DAG as overlays/data and an accessible table.
- Activating a studyable node opens a centered, fixed-height flip card above a darkened/blurred map. Preserve previous/next, swipe/drag, arbitrary range jump and shuffle. There is no separate `Tiếp tục` page, sidebar, checkbox list, scrollable card or black toast.
- The mandatory boundary remains prompt → `Đã thử` → reveal → only `Nhớ`/`Quên`. The back face has `Đáp án & vì sao` plus `Tình huống mới` with a worked answer.
- Read `docs/CONTENT_STYLE_HIEP_HOANG.md` before touching content. Preserve precise keywords and make known terms clickable in prompt, answer, explanation, transfer prompt and transfer answer. Keep prose concise. Do not display `Dễ nhầm`, but do not erase its source field.
- A transfer prompt must use a genuinely different analogous situation. Thirty audited Core failures are corrected by `content/revisions/english-core-transfer-novelty-v3.json`; Empower has one paired directions correction. These apply to base cards before workspace edits, never as a historical support overlay on the current study card.
- `content/revisions/empower-a2-glossary-v1.json` covers all 238 declared source terms; `english-core-terminology-v1.json` adds 33 Core labels. Preserve exact glossary resolution, whole-word boundaries and the separate review status of the seven vocabulary cards.
- English Core v2 remains exactly 89 owner-approved cards. Empower A2 adds 74 owner-scope-approved non-vocabulary cards attached to seven existing Core branches. Only seven `coursebook-a2-vocab-*` cards remain draft and individually reviewable in `Thẻ`. Total current English study content is 163 cards plus seven vocabulary drafts.
- The Empower source packet and 2026-09-04 approval manifest are inseparable provenance. Never claim its original review records were edited or that vocabulary was silently approved.
- Notifications remain off. The zero-cost personal deployment constraint remains absolute. Do not spend money or enable paid Supabase/Cloudflare features without a new explicit owner decision.

## Next bounded work

1. Let Hiệp deploy and study the 163 cards; capture concrete wording/content failures from real use.
2. Approve suitable vocabulary cards individually in `Thẻ`; revise unsuitable items through drafts.
3. Reactivate durable FSRS/Supabase/streak only after a new explicit Hiệp request; then apply `supabase/README.md` and complete the remote security gates.
4. Expand pronunciation, vocabulary and comparison as connected English branches based on real learning need. Build React later as a separate domain branch with authoritative source and approval records.

## Do not do

- Do not turn session judgments into permanent progress, claim cross-device persistence, or clear old local/cloud history.
- Do not revert to the horizontal module strip, a right-side study panel, a scrollable card, a separate study page or a visible misconception block.
- Do not remove technical terms to make cards easier; attach compact glossary help.
- Do not detach transfer answers from their exact new prompts or call repeated scenarios “transfer.”
- Do not publish the seven vocabulary cards without Human action, spend money, request notification permission on load, expose environment values or weaken learner isolation.

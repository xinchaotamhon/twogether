---
evidence_id: core-curriculum-2026-08-18
recorded_at: 2026-08-18
status: draft
owner: hiep
---

# Core curriculum starter evidence

## Scope

`content/drafts/core-curriculum-drafts-v1.json` contains a bounded starter bundle of 30 provenance-aware cards: 20 English and 10 React. The cards are organized as a DAG and use the ladder `principle → mechanism → boundary → transfer` so another AI can add branches without losing the learning intent.

This is not an exhaustive inventory of the English language or the React ecosystem. It is the generative backbone for the first review and pilot. Vocabulary, collocations, pronunciation cases, React APIs, and implementation details should be added as prerequisite-linked branches after recall data shows a need.

## Provenance and review

- The conceptual spine is the owner-pasted Claude capture plus the project-owned synthesis in `content/sources/core-curriculum-synthesis-v1.md`.
- No raw private chat, password, token, or share-link contents are stored here.
- Every card has `source_refs`, `prerequisite_node_ids`, a misconception, and a transfer prompt.
- All 30 cards remain `draft`; AI pre-review is not Human sign-off.
- Do not load this bundle into the runtime until Hiệp or Hoàng records accept/revise/reject decisions.

## Verification contract

The smoke gate `content.core-curriculum-contract` validates JSON shape, card counts, required provenance fields, unpublished status, and DAG acyclicity. Cumulative smoke run `20260818T160750Z-dc5f8f07` passed 10/10, including this gate. Run it again after any content change.

## Open decisions

Human review should set the learner level, daily time budget, and the first branch priorities. The next AI should update this evidence packet with those decisions rather than silently expanding the bundle.

# ADR-0021 — Temporary session study and completed English tree

- Status: accepted
- Date: 2026-09-04
- Decision owner: Hiệp
- Scope: active study persistence, map layout, card interaction, English coursebook publication

## Context

Hiệp asked to pause Supabase, FSRS and streak while the study experience is refined. The current right-side scrolling panel obscures the tree, places the card away from the visual center and lets a fixed black toast cover the grading controls. The English map also exposes the ten Core modules as one wide horizontal rank rather than a tree. The 81-card Empower packet currently asks Hiệp to review every knowledge card even though he now wants Human review only for new-vocabulary material.

## Decision

- The default build uses `VITE_STUDY_MODE=session`. It does not initialize Supabase, write FSRS events, calculate streak or qualify a persistent run. Existing local/cloud code and history remain untouched for a later opt-in `fsrs` mode.
- The temporary session stores only forgotten card IDs in `sessionStorage`, scoped by learner and collection. `Nhớ` removes the card from that list; `Quên` adds it. At the end of a pass, a bounded repair round contains only those forgotten IDs; repeating it until the list is empty never creates durable progress or a streak. Closing the browser tab/window clears the temporary list.
- Study is a centered modal over a darkened and blurred tree. One bounded card frame flips from question to answer; its back separates explanation and transfer into in-card pages, so the document and card do not scroll.
- The deck supports previous/next, direct range navigation, swipe/drag and a shuffle action. Shuffle changes order only, never content or grading.
- The visual projection chooses one deterministic parent from the complete prerequisite DAG to form a recognizable bottom-root branching tree. Every non-selected relation remains rendered and remains present in the accessible table/data model.
- The 74 non-vocabulary cards in the immutable Empower A2 packet are published under Hiệp's explicit scope approval and grouped by their existing English Core node. The seven `Vocabulary Focus` cards remain drafts for individual Human review and are visible as a pending vocabulary branch.
- Important existing terminology is preserved. Known glossary terms become clickable inside the question, main answer, explanation, transfer prompt and transfer answer. The visible `Dễ nhầm` section is removed without deleting its source field.
- Runtime transfer overrides are versioned for Core cards whose transfer task repeated the main task too closely. The immutable approved packet is not overwritten.

## Alternatives considered

- Delete Supabase/FSRS code: rejected because pausing is temporary and deleting it would make rollback costly.
- Continue using the right-side scroll panel: rejected because it conflicts with the requested focused flashcard interaction.
- Flatten all Empower cards into one deck: rejected because cards already have legitimate Core-node anchors.
- Auto-publish the seven vocabulary-focus cards: rejected because Hiệp explicitly retained Human review for new words.

## Consequences and risks

Session mode intentionally has no cross-tab/device persistence, streak or spaced schedule. Old FSRS history remains on disk but is neither read as active progress nor modified. A browser refresh keeps `sessionStorage`; closing the tab/window clears it. The map is a tree-like projection of a DAG, not a claim that each concept has only one true parent.

## Focused gate and cumulative gates

Tests must prove: session mode bypasses Supabase/FSRS/streak; only forgotten IDs enter `sessionStorage`; flip/navigation/swipe/shuffle work without page/card scrolling; the study card is centered with a backdrop; no `Dễ nhầm` or black overlay appears; glossary terms are clickable in every requested content region; the visual layout branches across multiple ranks; 74 Empower knowledge cards are published and seven vocabulary cards remain drafts.

All applicable older content, map, accessibility, PWA, build and smoke gates remain required. Supabase contract checks remain as dormant rollback capability, not evidence that cloud mode is active.

## Rollback

Set `VITE_STUDY_MODE=fsrs` with local durability and restore the previous study presentation from commit `aa939fd` if needed. Cloud reactivation additionally requires an additive content migration for Empower/approved vocabulary and the real security gates; its old seed alone is insufficient. Never clear or rewrite existing localStorage/Supabase review history during rollback.

## Evidence

See `50-Evidence/session-study-english-tree-2026-09-04.md`.

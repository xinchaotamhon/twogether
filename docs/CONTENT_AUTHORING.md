# Flashcard Authoring Contract

The audience-specific wording and feedback rules are owned by `docs/CONTENT_STYLE_HIEP_HOANG.md`. Read both documents before authoring. In particular, assume the learner may be meeting the concept for the first time; plain-language mechanism comes before terminology.

## One card, one retrieval target

Write a prompt that demands an answer, not recognition. Avoid “Which of these…?”, yes/no prompts without explanation, and prompts whose answer is copied verbatim from the question. Keep one main idea per card; split a large explanation into a bundle.

## Required fields

```json
{
  "id": "stable-card-id",
  "node_id": "concept-node-id",
  "card_type": "mechanism",
  "prompt": "Why does ...? Explain in your own words.",
  "model_answer": "A concise answer that exposes the mechanism.",
  "explanation": "Why the answer works.",
  "misconception": "The most likely wrong-but-plausible idea.",
  "transfer_prompt": "Apply the idea to a new situation.",
  "scaffold_prompt": "Optional question that clarifies what the main prompt asks.",
  "scaffold_answer": "Optional explanation of the requested operation, not the main answer.",
  "glossary_refs": ["stable-term-id"],
  "prerequisite_node_ids": [],
  "source_refs": ["source-id-or-url"],
  "status": "draft",
  "author": "hiep",
  "reviewer": null
}
```

`card_type` is one of `core_recall`, `mechanism`, `contrast`, `boundary`, `application`, or `production`. `status` is `draft`, `review`, `published`, or `archived`. A published card needs a source reference and Human review for claims that are not purely project-local.

`scaffold_prompt` and `scaffold_answer` are optional but must appear together. They help the learner understand the task without revealing `model_answer`; opening them never counts as an attempt and never changes FSRS. `glossary_refs` contains stable IDs from the structured glossary, not prose copied into every card. New glossary entries need a Vietnamese meaning, explanation, example, why-it-matters note, provenance, and review status.

## Authoring checklist

- Can the learner attempt without seeing choices?
- Is the expected answer bounded enough for honest self-grading?
- Does the answer explain why, not only what?
- Is there a nearest confusion, boundary, counterexample, or transfer prompt?
- Is the card appropriate for the node’s prerequisites?
- Are English examples natural, concise, and not dependent on a private context?
- Is the source/license/provenance recorded and the uncertainty visible?
- If support is present, can the learner read both scaffold answers and still need to retrieve the main answer?
- Do all glossary IDs resolve to structured terms instead of unexplained jargon?

## Principle cards

For a principle, prefer a four-card bundle: state it, explain its mechanism, identify where it fails, and use it in a novel case. The app may schedule each card independently while the map reports the bundle’s transfer status.

Four cards is a shape, not a quota. There is no fixed eight-card collection rule: add entry or bridge cards when a beginner needs them, and split overloaded concepts instead of padding or compressing to a cosmetic count.

## Importing external material

Capture the source separately, hash it, and write a transformation note. Do not paste an entire external conversation into `START_HERE.md` or project Markdown. Owner-pasted captures for English and React are summarized under `content/sources/`; their derived cards remain in `content/drafts/` until Human review. See `CLAUDE_SOURCE_STATUS.md`.

## Active English publication

`content/drafts/english-core-beginner-revision-v2.json` is the immutable beginner-first source/review packet. Hiệp approved its exact 89 English IDs on 2026-09-01 in `content/reviews/english-generative-core-v2-owner-approval-2026-09-01.json`; `src/approvedCurriculum.ts` derives the ten published variable-size collections with reviewer `hiep`. The earlier 80-card packet and approval remain historical provenance, not runtime authority. The ten React cards remain draft history.

The immutable Empower A2 packet remains `review` provenance. Hiệp's 2026-09-04 scope manifest publishes exactly its 74 non-vocabulary IDs through `src/empowerCurriculum.ts`; seven `coursebook-a2-vocab-*` records remain draft and enter the tree one at a time only after Human approval. A scope approval is valid only when it fingerprints the source file and locks both included and excluded counts.

Editing an approved runtime card must create a new local draft revision. Do not rewrite the source packet, delete its published version, reset FSRS state, or erase review events. Future pronunciation, vocabulary, comparison, React, or other-subject branches follow `docs/CURRICULUM_EXPANSION_ROADMAP.md` and require their own bounded Human approval.

The published 89-card packet includes matching worked transfer answers and glossary references. Older support packets remain provenance; do not restore a duplicate preview layer or treat visibility as Human approval for future changes.

Preserve precise keywords and attach glossary IDs instead of erasing them. A transfer prompt must vary the concrete situation while testing the same mechanism; its answer must respond to that new prompt. Keep `misconception` in authored data, but the current study surface intentionally does not render a `Dễ nhầm` section.

# Flashcard Authoring Contract

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
  "prerequisite_node_ids": [],
  "source_refs": ["source-id-or-url"],
  "status": "draft",
  "author": "hiep",
  "reviewer": null
}
```

`card_type` is one of `core_recall`, `mechanism`, `contrast`, `boundary`, `application`, or `production`. `status` is `draft`, `review`, `published`, or `archived`. A published card needs a source reference and Human review for claims that are not purely project-local.

## Authoring checklist

- Can the learner attempt without seeing choices?
- Is the expected answer bounded enough for honest self-grading?
- Does the answer explain why, not only what?
- Is there a nearest confusion, boundary, counterexample, or transfer prompt?
- Is the card appropriate for the node’s prerequisites?
- Are English examples natural, concise, and not dependent on a private context?
- Is the source/license/provenance recorded and the uncertainty visible?

## Principle cards

For a principle, prefer a four-card bundle: state it, explain its mechanism, identify where it fails, and use it in a novel case. The app may schedule each card independently while the map reports the bundle’s transfer status.

## Importing external material

Capture the source separately, hash it, and write a transformation note. Do not paste an entire external conversation into `START_HERE.md`. The two Claude links are not yet captured; see `CLAUDE_SOURCE_STATUS.md`.

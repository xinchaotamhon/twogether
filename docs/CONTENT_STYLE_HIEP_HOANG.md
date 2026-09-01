# Content Style for Hiệp and Hoàng

This document owns the durable content preferences for Twogether. Every AI must read it before creating or revising cards. Update this document when Human feedback reveals a reusable rule; do not fix only the visible card and leave the failure pattern undocumented.

## Audience and outcome

- Assume either learner may meet a concept for the first time. English Core is a teachable path, not merely a recall deck for someone who already read the source conversation.
- A first encounter may begin with an observable example and an honest attempt, then the revealed answer acts as a compact lesson. Never require unexplained prior terminology just to understand the question.
- The target is: notice the pattern, explain the mechanism in plain language, recognize a boundary, and use it in a fresh situation.

## Wording contract

1. Start in simple Vietnamese and with a concrete English example. Introduce the technical label only after its job is understandable.
2. A model answer has two layers: a short plain-language answer first, then the precise grammar label when useful.
3. One card has one bounded retrieval target. Split a card when a beginner must learn several new mechanisms before answering it.
4. Every essential technical term must have a clickable glossary entry. A glossary may support comprehension; it must not silently replace the teaching sequence.
5. Use natural, everyday English. An intentionally unusual sentence must be marked as a counterexample or diagnostic, not presented as the normal model.
6. A model answer demonstrates an answer the learner can imitate. A grading rubric alone is not a model answer.
7. The learner's wording need not match the model. The model is one sound route, not the only accepted sentence.

## Main answer and transfer answer are separate

- `model_answer` answers the main `prompt`.
- `transfer_prompt` is always displayed before `transfer_answer`.
- `transfer_answer` must answer that exact transfer prompt, use the same people/objects/context unless the prompt asks for a change, and explain why the example works.
- Never render a transfer answer immediately under the main prompt without its transfer prompt. That makes a correct answer appear unrelated.
- Transfer help remains behind the attempt/reveal boundary and never creates a review event.

## Learning sequence and knowledge connections

- Connect a new card to earlier knowledge a true beginner can already use. Do not list the card's own node as its prerequisite.
- The first card of a branch supplies an observable entry point; later cards may name and recombine the mechanism.
- Keep DAG multi-parent relationships when they are real, but distinguish `part_of` navigation from `prerequisite` learning order.
- An integration card is recommended only after its prerequisite branches have been introduced; it must not be the first explanation of all its terms.

## Collection size

There is no fixed number of cards per collection. Eight cards was a v1 packaging choice, not a product rule. Use the smallest set that honestly covers the applicable ladder:

```text
entry/example -> core idea -> mechanism -> contrast/boundary -> guided transfer -> independent production
```

A small idea may need fewer cards. A dense idea may need more. Split by learning target and sustainable workload, not by a cosmetic count.

## Human feedback loop

When Hiệp says content is unsuitable:

1. Preserve the reported example and classify the reusable failure pattern.
2. Create a versioned draft revision; never rewrite immutable source or erase FSRS/review history.
3. Update this document when the correction generalizes to future cards.
4. Add a deterministic checker or browser regression when software can detect the failure.
5. Ask at least two independent review stances before the next Human approval: a fresh beginner and a skeptical language/content reviewer.
6. Publication still requires Hiệp's explicit approval. AI review, local visibility, and passing tests are not Human approval.

## Accepted corrections — 2026-09-01

- English Core must teach Hoàng even though he never read the source discussion.
- Do not describe the published ten collections as a permanent `8 cards per deck` structure.
- The card-library preview must show `Thử chuyển sang tình huống mới` before `Lời giải chuyển giao`; the two screenshots with `My friend sent an email` and `My sister finished the report yesterday` exposed this routing failure.
- Present-perfect duration such as `for two years` must not be mislabeled as experience.
- Avoid unnatural default examples such as bare `Please close a door` without a context that makes an arbitrary door meaningful.
- A generated reason such as `because he felt ill` must be labeled as one invented example, not information contained in the prompt.
- Model answers for integration/production cards must show a worked answer, not only state a rubric.


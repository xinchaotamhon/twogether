# Knowledge Map and Prerequisite DAG

## Why a DAG, not a strict tree

A strict tree forces every concept to have exactly one parent. English and principle knowledge often reuse foundations, so the data model uses a directed acyclic graph (DAG) and the UI renders a comfortable tree-like map for a selected root. A card may belong to one primary node while referencing several prerequisite or related nodes.

The graph is a navigation and sequencing aid, not an ontological claim. Cycles are rejected for `prerequisite` edges; non-prerequisite relations may be many-to-many.

## Node model

- `root`: the learner’s north-star domain (for example, “English” or “Principles”).
- `trunk`: foundational mechanism or vocabulary.
- `branch`: a coherent subdomain.
- `leaf`: a concrete application or production skill.

Each node has a stable ID, title, short purpose, epistemic status, source references, and a Human maintainer. A node’s progress is derived from its cards, not manually typed as a confidence claim.

## Edge types

- `prerequisite`: learn A before B; must remain acyclic.
- `part_of`: taxonomy/navigation only.
- `contrasts_with`: common confusion to test.
- `applies_to`: transfer context.
- `example_of`: concrete instantiation.

## Principle learning ladder

For every principle worth retaining, author at least one card at each applicable rung:

```text
principle -> mechanism -> boundary/counterexample -> novel transfer
```

“I remember the sentence” is weaker than “I can explain the mechanism and choose it in a new situation.” A branch can show `introduced`, `in repair`, `stable`, or `transfer-tested`; it should not unlock only because a learner clicked through every card.

## Unlock and progress rules

- A node is recommended when its prerequisites are introduced or when the learner explicitly chooses to preview it.
- A prerequisite is considered durable only when its due cards have healthy predicted recall and at least one transfer card has been attempted; exact thresholds are configuration, not universal truth.
- Never hide the full map behind a game lock. Show why a branch is recommended and allow deliberate preview.
- Render the active path on mobile as a vertical map; provide a keyboard-accessible list/table alternative for the same graph.

## Universal-root tree presentation (P0)

The data model remains a DAG: a concept may have several legitimate prerequisites, and the exact edge list is still available in the accessible table. The runtime map adds a virtual UI-only root named “Bản chất chung” so English, React, and future domains can appear as first-level branches of one memory framework without inventing a false database parent.

Actual nodes are grouped by their existing kind, then projected into deterministic centered layers. A lazy-loaded React Flow viewport renders the projection with drag-to-pan, wheel/pinch zoom, `+`/`−`/fit controls, and a minimap; cards cannot be dragged, connected, or deleted on the canvas. Solid links show `part_of`; dashed links show `prerequisite`. A node owning a collection is a real button: activating it opens the flashcard loop in an overlay while the tree stays in place. Extra collections sharing a knowledge root receive virtual collection nodes so no deck becomes unreachable.

React Flow is presentation only. Stable node/edge IDs, multi-parent relations, cycle rejection, progress calculation, and the exact accessible table remain project-owned. The virtual root aggregates the whole collection and is never persisted as a published node or learning card. A heavier automatic layout engine is deferred until a 40–100 node gate demonstrates real overlap or crossing problems.

## Map-first home and upward growth

The default home projection places the virtual universal root at the bottom and lets domain roots grow upward. `part_of` edges form the readable visual skeleton; `prerequisite` edges remain dashed learning-order overlays and do not silently become taxonomy parents. There is no separate study page or multi-collection focus list: one node starts one real collection, and the flashcard panel can be closed without losing the map position. The number of cards in a collection is not fixed.

# ADR-0018 — Beginner-first core and map-first home

- Status: accepted
- Date: 2026-09-01
- Decision owner: Hiệp
- Scope: content revision workflow, collection sizing, home navigation and knowledge-map presentation

## Context

Human review found that English Core v1 can look like a review deck for someone who already knows its terminology. Hoàng has not read the source discussion and must be able to learn from the beginning. The card-library preview also displayed a transfer answer without its transfer prompt, making correct examples appear unrelated to the main question. The current app opens on Study and places the universal root above the map, while the long-term product needs many domains to grow upward from one visible root.

## Decision

- Preserve approved v1 and its FSRS history. Build a versioned beginner-facing revision for a second Human approval instead of silently rewriting published cards.
- Store durable audience and wording preferences in `docs/CONTENT_STYLE_HIEP_HOANG.md`; add a regression contract for reusable feedback.
- Collection size is variable. A collection contains as many cards as its learning ladder needs, not exactly eight.
- Make the knowledge map the default home. Render the virtual universal root at the bottom, domain branches above it, and keep the underlying graph a DAG.
- Use `part_of` for the visible tree skeleton and render `prerequisite` as a dashed overlay. A node remains single in the view even when it has multiple legitimate parents.
- Selecting several collections creates a per-learner focus list only. A study run still belongs to exactly one real collection, preserving FSRS, run completion and streak semantics.
- Move graph authoring out of the home canvas; card/graph management remains under the library.

## Alternatives considered

- Rewrite the 80 approved cards in place: rejected because it would blur Human approval and content history.
- Keep Study as home and Map as a secondary tab: rejected because the map is the product's main mental model and future expansion surface.
- Merge every checked collection into one study run: rejected because it obscures prerequisites and breaks the meaning of completing one collection for streak.
- Force the DAG into a strict tree: rejected because shared foundations and cross-domain transfer can have multiple legitimate parents.
- Add a new automatic-layout dependency immediately: deferred; React Flow plus a deterministic project-owned layout is enough for the current scale.

## Consequences and risks

- The home screen becomes more visual and needs a list/table alternative, keyboard behavior and mobile bottom-sheet checks.
- A content revision may contain more than 80 cards. Stable replaced-card IDs and new bridge-card IDs must be explicit so learner history is preserved correctly.
- A focus-list preference is learner-private and must not become shared content. Local fallback remains safe; later cloud sync belongs behind learner-scoped RLS.
- The beginner revision remains review-only until Hiệp approves it for publication.

## Focused gate and cumulative gates

- Add `content.personal-style-contract` for beginner language, answer routing, variable collection size, self-prerequisite rejection and review status.
- Add layout unit tests for bottom-root direction, deterministic single-node multi-parent projection and prerequisite overlays.
- Extend Playwright with default-map landing, transfer-prompt/answer pairing and collection focus-list behavior.
- Run all existing cumulative gates on the same production artifact.

## Rollback

Restore Study as the default view and ignore the new focus-list key. Keep all node/card/collection IDs, review events, learner states and run records. The revision packet can remain review-only without affecting published v1.

## Evidence

Human screenshots dated 2026-09-01, fresh-learner audits under ignored `tmp/`, and the final dated evidence packet for this change.


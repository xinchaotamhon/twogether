# ADR-0020 — Inline study on the knowledge map

- Status: accepted
- Date: 2026-09-01
- Decision owner: Hiệp
- Scope: primary navigation, map/deck projection and study presentation

## Context

The separate `Tiếp tục` page duplicated navigation: learners chose a deck on the tree, then left the tree to study. The bottom-centered legend also collided with the fixed bottom navigation. Hiệp requested one map surface where selecting a knowledge/deck card opens its flashcards directly.

## Decision

- Remove `study` from primary view state and remove the `Tiếp tục` navigation item.
- Selecting a collection node starts the same one-collection run and opens `StudyView` in a scrollable overlay inside the map viewport. Closing the overlay preserves the map and does not grade, reset or delete anything.
- Keep one visible collection per existing knowledge root; give additional or unrooted collections virtual leaf nodes so every deck remains reachable without a sidebar.
- Anchor the legend top-left and mastery summary top-right. Bottom navigation owns the bottom strip.

## Alternatives considered

- Keep a separate study page: rejected as unnecessary context switching.
- Expand the card permanently below the tree: rejected because it reintroduces page scrolling and shrinks the map.
- Use a modal that replaces the whole screen: rejected because the tree should remain visible as the memory context on larger screens.

## Consequences and risks

The study panel has its own scroll region on phone and desktop. FSRS, review events, repair queue, streak qualification and collection-run semantics are unchanged. Map nodes outside the current viewport still require panning, while the accessible table retains a keyboard route.

## Focused gate and cumulative gates

Playwright must prove: no `nav-study`, node click opens the inline panel, closing returns to the map, phone page itself does not scroll, and legend/navigation boxes do not intersect. All older smoke gates remain required.

## Rollback

Restore commit `516b677`. Do not roll back or delete learner events, FSRS state, runs or daily qualifications.

## Evidence

See `50-Evidence/inline-map-study-2026-09-01.md`.

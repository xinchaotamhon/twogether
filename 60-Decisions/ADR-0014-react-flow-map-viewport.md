# ADR-0014 — React Flow as the knowledge-map viewport

- Status: accepted and implemented
- Date: 2026-08-31
- Decision owner: Hiệp, confirmed by instruction to continue after the proposal on 2026-08-31

## Context and baseline

The custom SVG map preserves the DAG and looks like connected cards, but it has only horizontal scrolling. Extending it with pinch zoom, pan, fit-view, focus auto-pan, minimap and correct DAG interaction semantics would create a second viewport library inside the project. Baseline production JS is 357,694 bytes before this change.

## Proposal

Adopt `@xyflow/react@12.11.5` (MIT) only as a lazy-loaded map renderer. Keep the project-owned DAG, virtual universal root, progress projection, node visual language, cycle validation, detail panel and exact accessible table. Nodes are read-only: no drag, connect, delete, or edit through the canvas. Use built-in pan, wheel/pinch zoom, controls, fit-view and minimap.

Measured production output after implementation: main JS 395.70 kB (114.21 kB gzip); the map stays in a separate 188.71 kB lazy chunk (62.18 kB gzip), plus 15.87 kB map CSS (2.67 kB gzip). Dependency audit reports zero known vulnerabilities at verification time.

React Flow does not own layout or data. The existing deterministic layer projection remains the P0 layout. ELK/Cytoscape are not adopted; revisit a layout engine only if a 40–100 node gate proves overlap/crossing makes the current projection unusable.

## Alternatives, cost, and rollback

Continuing the SVG viewport adds no dependency but duplicates complex interaction/accessibility work. Cytoscape is less suited to rich HTML learning cards; ELK is a layout engine rather than a viewport and adds premature complexity. The package is MIT and 1,213,198 bytes unpacked; the production map chunk and audit must be measured after build.

Rollback lazy-loads the prior SVG renderer or reverts this presentation layer. No concept node, edge, card, learner state, or review event changes.

## Gates

Verify node/edge parity, multi-parent preservation, fit/zoom/pan on phone and desktop, focus/click detail selection, disabled editing interactions, accessible table parity, production chunk size, dependency audit, browser gate, and all cumulative gates.

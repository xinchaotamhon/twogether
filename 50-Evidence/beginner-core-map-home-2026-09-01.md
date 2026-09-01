# Beginner Core v2 and map-first home evidence

- Date: 2026-09-01
- Owner direction: make English Core teachable to Hoàng without the source discussion; remove fixed deck quotas; remember content preferences; make the upward-growing knowledge tree the home; use fresh independent review before the second Human review.
- Decision: `60-Decisions/ADR-0018-beginner-core-and-map-first-home.md`
- Publication boundary: review-only; Hiệp has not yet approved the 89-card revision packet.

## Content result

- `content/drafts/english-core-beginner-revision-v2.json` contains 89 review candidates: rewrites for all 80 stable approved IDs plus 9 new beginner bridge IDs.
- Collection sizes are `8, 9, 9, 9, 9, 9, 9, 9, 9, 9`. This demonstrates that eight was a v1 packaging choice rather than an authoring quota.
- Rewrites retain `revision_of` and stable IDs so accepted wording changes do not reset FSRS. New bridges use new IDs. No candidate names its own node as a prerequisite.
- The card-library review panel keeps v1 active until Hiệp acts. Flagging a rewrite keeps the published v1 card in its collection; flagging a new bridge excludes that bridge. Applying accepted candidates never marks the source packet itself as Human-reviewed.
- The preview now renders `transfer_prompt` before `transfer_answer`. This fixes the screenshot failure where “My friend sent an email” and “My sister finished the report yesterday” appeared to answer unrelated main prompts.
- `docs/CONTENT_STYLE_HIEP_HOANG.md` records reusable beginner-first rules, plain-language-before-labels, worked model answers, transfer routing, glossary expectations, prerequisite rules, variable collection size and the Human feedback loop. `START_HERE.md` routes every future AI through it.

## Independent review

Three fresh-agent stances reviewed the work before this implementation was finalized:

1. A novice audit covered cards 01–40 and identified terminology/support alignment issues, a mislabeled present-perfect duration example and unnatural default wording.
2. A separate novice audit covered cards 41–80 and identified self-prerequisites, rubric-only model answers and an invented reason that needed to be labeled as an example.
3. A map/product critic recommended map-first navigation, single-collection runs behind a multi-selection focus list, `part_of` as the layout skeleton, prerequisite overlays, root-bottom direction and an accessible list/table.

Their corrections were consolidated into the versioned packet and durable style rules. These are AI audits, not Human sign-off.

## Map and interaction result

- The app opens on the knowledge tree after choosing Hiệp or Hoàng.
- A virtual `Bản chất chung` root sits at the bottom. A virtual `Tiếng Anh` domain connects it to the ten current Core modules; a future `core-react-*` graph projects as a separate `React` domain rather than mixing into English.
- `part_of` edges determine visible rank. `prerequisite` edges are dashed overlays and cannot duplicate or silently move a node. Multi-parent DAG semantics remain in project data.
- React Flow provides drag/pan, wheel/pinch zoom, explicit +/- controls, fit view and minimap. The initial zoom favors readable nodes; the learner can zoom out for the whole canopy.
- Collection checkboxes store a learner-local focus list. `Học bộ này` always starts exactly one collection, preserving FSRS and honest one-collection streak qualification.
- Graph authoring moved to `Thẻ`; the home tree remains a learning/navigation surface. An accessible table mirrors nodes, purposes, progress and prerequisite connections.
- Chrome mobile coverage uses a 390×844 viewport and verifies that the detail panel stacks below the zoomable canvas while bottom navigation remains usable.

## Remote persistence probe

A safe read-only probe used configured browser-safe environment values without printing them:

- URL is HTTPS, uses the Supabase host, resolves in DNS and `/auth/v1/health` accepts the public key.
- REST requests for `profiles` and `concept_nodes` return `404`.
- Inference: the project is reachable, but Twogether migrations/seed have not been applied. This does not prove sync, RLS or learner isolation.
- No remote setting, table, seed, account or credential was changed. Owner confirmation remains required before Anonymous Sign-Ins or SQL execution. Rollback remains `VITE_SYNC_MODE=local` with local history retained.

## Verification

- Beginner content checker: 89/89 structure, all 80 stable IDs, 9 bridge IDs, variable sizes, transfer routing, no self-prerequisites and durable style-memory link — pass.
- Unit tests: 29/29 pass across 12 files, including bottom-root layout, prerequisite overlays and single projection for multi-parent nodes.
- Production build: pass with separate map, card-library, Supabase and FSRS chunks; no chunk exceeds 500 kB.
- Playwright 1.62.1 against installed Google Chrome: 15/15 pass, including map-first landing, phone stacking, focus-list semantics, beginner review/flag/apply, transfer routing, authoring, learner isolation, migration and PWA shell.
- Browser gate now chooses an unused preview port and runs three workers, preventing a stale server or machine contention from producing misleading results.
- Dependency audit: 0 vulnerabilities.
- Final cumulative receipt: `20260901T114856Z-6186d2d3` — 15/15 required smoke gates passed on the same implementation.

Green software gates do not establish language mastery, Human content approval or live remote security. Those require Hiệp's second review, real study evidence and owner-authorized two-learner Supabase tests.

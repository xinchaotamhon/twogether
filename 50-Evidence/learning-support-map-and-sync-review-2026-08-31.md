# Learning support, map viewport, and sync design review — 2026-08-31

## Outcome

- Added optional `scaffold_prompt`, `scaffold_answer`, and `glossary_refs` across card types, CRUD, content packet round-trip, and the additive Supabase content schema.
- Added an explicit browser-local preview for exactly 80 AI-draft English Core support records. The packet remains `ai_draft_unreviewed`; no support wording is claimed as Human-approved.
- Added a structured 25-term glossary with Vietnamese explanations, examples, and why-it-matters notes, including finite and non-finite verbs.
- Replaced the static map presentation with a lazy-loaded read-only `@xyflow/react@12.11.5` viewport. The project still owns the DAG, layout, cycle rules, progress, stable IDs, and accessible table.
- Corrected stale-streak derivation: a chain whose latest qualification is older than yesterday now has `currentDays = 0` while retaining `bestDays`.
- Recorded ADR-0015 for future one-time device pairing, learner membership RLS, event-derived streak, and IndexedDB outbox. No Supabase project, remote migration, credential, or persistence-authority switch was performed.

## External repository review

- Skola: AGPL-3.0; behavior-level sync-status ideas only, no copied code.
- ZettleCards and Linguist Card: no repository license observed; behavior/schema ideas only, no copied code or assets.
- paulgreg/flashcard: MIT, but its persistence/identity architecture does not meet Twogether's FSRS and per-learner RLS boundaries; no code adopted.
- `jKrieger/FlashCardLearning`: supplied URL returned 404, so it was not evaluated.

## Map dependency and bundle evidence

- Adopted dependency: `@xyflow/react@12.11.5`, MIT.
- Production main JS: 395.70 kB (114.21 kB gzip).
- Lazy map JS: 188.71 kB (62.18 kB gzip).
- Lazy map CSS: 15.87 kB (2.67 kB gzip).
- Human visual inspection used the local production preview at desktop 1440×900 and phone 390×844. Both showed the full DAG, solid/dashed relations, bottom navigation, zoom controls, and readable node detail path; the phone starts fit-to-view and supports zooming into a branch.

## Verification

- `npm test -- --reporter=dot`: 25/25 tests passed across 10 files.
- `npm run build`: passed.
- `npm run test:e2e`: 11/11 Playwright tests passed on the production preview.
- `npm audit --audit-level=moderate`: 0 vulnerabilities reported.
- Final cumulative smoke receipt after documentation/handoff updates: `20260831T154931Z-083172f9`, 12/12 passed, including the new `content.learning-support-contract` and every older required gate.

## Authorization boundary and rollback

Hiệp authorized continuing local implementation and safe inspection. This did not authorize publishing AI support as Human-reviewed or activating remote sync. Support rollback disables/removes the overlay without touching approved card IDs or reviews. Map rollback replaces only the renderer. Sync rollback remains local authority with all local and any future remote events preserved.

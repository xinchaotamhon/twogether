---
date: 2026-08-26
owner: hiep
status: verified-local-release
decision: ADR-0012
baseline_commit: edacdd6
gate_receipt: 20260826T012122Z-c82afaf6
---

# English Core v1 — owner publication and local migration evidence

## Authorization and scope

Hiệp explicitly approved all 80 English Generative Core v1 cards for study on 2026-08-26 and asked that the 12 old fixture cards be arranged away cleanly. The exact card and collection IDs are frozen in `content/reviews/english-generative-core-v1-owner-approval-2026-08-26.json`.

This authorization publishes only the 80 English cards. The ten React cards preserved in the source packet remain draft. It does not authorize remote persistence, paid services, notifications, or future AI-generated branches.

## Result

- Runtime content: 80 published cards, reviewer `hiep`.
- Shelf: ten published decks, eight unique cards per deck.
- Active graph: ten English nodes and their approved DAG edges; no legacy fixture nodes.
- Source integrity: `content/drafts/core-curriculum-drafts-v2.json` remains draft/provenance and is not mutated into a fake Human-reviewed source.
- Legacy visibility: the 12 fixture cards and two fixture collections are absent from active study/map.
- Legacy preservation: learner card states, review events, runs, daily qualification/streak inputs, local cards, revisions, and learner-created collections survive v1→v2 migration.
- Browser selection: a saved legacy collection ID safely falls back to the first current collection.
- PWA update: shell cache changed from v1 to `twogether-shell-v2`.
- DAG rendering: parentless subject entry nodes attach to the virtual universal root; depth derives from structural edges and wide levels scroll instead of overlapping.

## Focused verification

- `python tools/check_published_english_core.py`: pass.
- Unit tests: 8 files, 20/20 tests pass.
- Production TypeScript/Vite build: pass; 45 modules transformed.
- Playwright with installed Chrome: 10/10 tests pass, including v1 workspace migration, ten-deck shelf, profile isolation, answer-before-reveal, dynamic map/table parity, and PWA cache.
- Cumulative gate receipt: `20260826T012122Z-c82afaf6`, 11/11 required gates pass.

## Known boundary

localStorage migration protects the same browser. It does not synchronize progress to a different browser/device and cannot recover data after the user clears site storage. Supabase remains a future option; secure cross-device isolation requires identity/pairing and real RLS/rollback evidence. A visible Hiệp/Hoàng picker alone is not authentication.

English Core v1 is claimed complete only as a principle/transfer backbone. It is not an exhaustive English curriculum. Pronunciation/IPA feedback, vocabulary breadth, comparison constructions, register/dialect, fluent production, and React expansion are routed in `docs/CURRICULUM_EXPANSION_ROADMAP.md`.

## Rollback

Revert the release commit to return to the previous runtime. The migration deliberately retains legacy states/events and does not rewrite the immutable source packet. Before any future remote-persistence switch, export local data and test restoration; do not use “clear localStorage” as a migration or rollback procedure.

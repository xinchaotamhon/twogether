# Next AI handoff: P0 collections and authoring

Read `START_HERE.md` first, then `60-Decisions/ADR-0010-local-collections-streak-authoring.md`, `40-State/P0_COLLECTIONS_STATE.md`, `docs/COLLECTIONS_AND_AUTHORING.md`, and the evidence packet. Preserve the original learner isolation, answer-before-reveal, two-outcome FSRS, bounded repair, provenance, accessible map, PWA, and zero-cost gates.

Current source of truth:

- `src/collections.ts`: collection many-to-many, scoped due cards, run snapshot/qualification, cycle helper.
- `src/streak.ts`: local-date qualification and streak projection.
- `src/localWorkspace.ts`: local P0 workspace key, runs, cards, revisions, qualification events.
- `src/contentPacket.ts`: versioned AI packet contract; imports are draft-only.
- `src/graphWorkspace.ts`: persisted local draft graph additions.
- `src/App.tsx`: deck shelf, study run, streak/progress, map insertion, and card library UI.

P0 deliberately leaves Supabase/RLS and real identity for P1. Before adding remote CRUD, write an additive ADR with assumptions, privacy objection, cost, gate, authorization, and rollback; use server-side roles and two-account negative tests. Never store passwords, tokens, private chat, review state, or notes in a content packet.

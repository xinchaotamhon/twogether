---
last_verified: 2026-08-26
verified_by: Codex English Core publication migration
status: active
---

# Collections and Authoring State

The active local shelf has ten published English Generative Core v1 collections, each containing eight unique owner-approved cards. Completing the required attempt for every unique due card in any one selected collection may qualify that learner’s local day/streak once.

`content/drafts/core-curriculum-drafts-v2.json` remains immutable provenance. The exact approved IDs are recorded in the 2026-08-26 owner manifest and derived into runtime by `src/approvedCurriculum.ts`; editing a published card creates a local draft revision.

Workspace version 2 replaces the two legacy fixture collection definitions with the canonical ten while preserving daily qualifications, completed/active runs, learner-created collections, local card drafts, and revisions. Learner data version 2 adds states for the 80 new cards without deleting fixture card states or review events.

The 12 fixture cards are therefore historical data only: they are not visible on the shelf, due queue, or map, but an old review event/run can still be audited.

localStorage remains browser-local. Multi-device sync is a future Supabase/identity decision, not part of this collection publication.

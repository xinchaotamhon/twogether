# Collections, streak, graph growth, and AI authoring

## Active temporary behavior — 2026-09-04

The map is now the only study entry surface. Activating a studyable branch opens one centered flip card over the dimmed tree. The learner can move backward/forward, drag/swipe, jump by range and shuffle. Only forgotten card IDs are kept in learner/deck-scoped `sessionStorage`; current builds do not schedule FSRS, qualify runs or show streak/progress. The durable behavior below remains implemented behind `VITE_STUDY_MODE=fsrs`.

English currently contains 89 Core cards and 74 Empower knowledge cards in published study. Seven Empower vocabulary cards remain the only coursebook items requiring individual review. The active `Thẻ` view says this explicitly and can approve a vocabulary card into its pending tree branch.

## Domain contract

`src/collections.ts` owns collection-scoped due selection, run-plan snapshots, honest completion, and prerequisite cycle detection. `src/streak.ts` converts a qualified run into at most one event per learner/local date and derives current/best streak. `src/localWorkspace.ts` persists P0 workspace data separately from FSRS review state. `src/contentPacket.ts` defines `twogether.card-packet.v1`; validation rejects missing provenance or private raw content and import forces `draft`.

## How a learner uses it

In durable FSRS mode, after selecting Hiệp or Hoàng, the learner chooses a deck from its tree node. The queue is fixed for that run, so editing a deck cannot silently change the denominator mid-session. An attempt is required before reveal, and only `Nhớ` and `Quên` are visible outcomes. Completing the finite run updates the streak once for that local day; a second deck the same day does not add another day.

The durable `Tiến độ` view shows the streak; it is hidden in current session mode. `Thẻ` remains available for authoring. It can create/edit a draft, publish it with an explicit local-human action, archive it without deleting history, and import/export an AI packet. The packet is content-only: it never carries learner progress, private notes, or review events.

The same view exposes English Generative Core v2 as ten approved, variable-size slices containing the exact 89 approved cards. The old 12 fixtures remain hidden without deleting their history. “Đưa vào chỉnh sửa” creates a local draft revision and never mutates the immutable approved packet or resets review state.

The library also exposes the separate 80-record support packet as an explicit browser-local preview. Preview overlays optional `scaffold_prompt`, `scaffold_answer`, and `glossary_refs` during study and preserves them in CRUD/import/export. It does not promote `ai_draft_unreviewed` support to Human-approved content and does not affect the scheduler.

The map is a presentation of the global DAG. A draft node may attach to an existing node with `part_of` or `prerequisite`; prerequisite cycles are rejected before the addition is stored. The lazy React Flow viewport provides pan/zoom/fit without owning node position as domain truth, and the accessible table lists the same graph for keyboard and screen-reader users.

## P1 boundary

Do not infer production authorization from the picker. When cloud sync is requested, add collections/membership, revision workflow, run/qualification events, cycle-safe mutation RPCs, roles, and negative two-account RLS tests as an additive Supabase migration. Keep the zero-dollar constraint and preserve local export as rollback.

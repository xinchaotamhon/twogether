# Collections, streak, graph growth, and AI authoring

## Domain contract

`src/collections.ts` owns collection-scoped due selection, run-plan snapshots, honest completion, and prerequisite cycle detection. `src/streak.ts` converts a qualified run into at most one event per learner/local date and derives current/best streak. `src/localWorkspace.ts` persists P0 workspace data separately from FSRS review state. `src/contentPacket.ts` defines `twogether.card-packet.v1`; validation rejects missing provenance or private raw content and import forces `draft`.

## How a learner uses it

After selecting Hiệp or Hoàng, the learner chooses any deck in the deck shelf. The queue is fixed for that run, so editing a deck cannot silently change the denominator mid-session. An attempt is required before reveal, and only `Nhớ` and `Quên` are visible outcomes. Completing the finite run updates the streak once for that local day; a second deck the same day does not add another day.

The `Tiến độ` view shows the streak and opens `Thẻ`. The authoring view can create/edit a draft, publish it with an explicit local-human action, archive it without deleting history, and import/export an AI packet. The packet is content-only: it never carries learner progress, private notes, or review events.

The same view exposes English Generative Core v1 as ten approved slices containing the exact 80 approved cards. Those cards are the active due queue and participate in FSRS and honest streak qualification; the old 12 fixtures remain hidden without deleting their history. The beginner v2 panel is a separate second-review surface with variable collection sizes. “Đưa vào chỉnh sửa” creates a local draft revision and never mutates the immutable approved packet or resets review state.

The library also exposes the separate 80-record support packet as an explicit browser-local preview. Preview overlays optional `scaffold_prompt`, `scaffold_answer`, and `glossary_refs` during study and preserves them in CRUD/import/export. It does not promote `ai_draft_unreviewed` support to Human-approved content and does not affect the scheduler.

The map is a presentation of the global DAG. A draft node may attach to an existing node with `part_of` or `prerequisite`; prerequisite cycles are rejected before the addition is stored. The lazy React Flow viewport provides pan/zoom/fit without owning node position as domain truth, and the accessible table lists the same graph for keyboard and screen-reader users.

## P1 boundary

Do not infer production authorization from the picker. When cloud sync is requested, add collections/membership, revision workflow, run/qualification events, cycle-safe mutation RPCs, roles, and negative two-account RLS tests as an additive Supabase migration. Keep the zero-dollar constraint and preserve local export as rollback.

# ADR-0012: Publish English Core v1 and migrate existing local learners without data loss

- Status: accepted
- Date: 2026-08-26
- Decision owner: Hiệp
- Scope: published study content, local content-version migration, legacy fixtures, PWA cache version

## Context

English Generative Core v1 was deployed as 80 review-only drafts. The study shelf intentionally continued to show the two original fixture collections (12 and 6 cards), so redeployment could look stale even when the latest JavaScript was loaded. Existing browsers also persist workspace collections and learner FSRS state under localStorage keys that survive frontend deployments.

On 2026-08-26 Hiệp explicitly approved all 80 English cards for study and requested that the 12 older fixture cards be arranged compactly. The active local product has no remote sync; therefore any migration must preserve both learners' review events, per-card states, runs, streak qualifications, local card revisions, user-created collections, and graph additions.

Baseline: commit `edacdd6`; 18/18 unit tests passed and production build passed before this change. `THU_BAN_MOI.bat` existed locally as an uncommitted owner-requested helper.

## Decision

- Record the approval in `content/reviews/english-generative-core-v1-owner-approval-2026-08-26.json`.
- Derive 80 runtime cards, ten English nodes, their DAG edges, and ten collections from the immutable v2 draft packet plus approval manifest. Runtime values become `published` with reviewer `hiep`; the source packet remains draft provenance and is not rewritten.
- Replace the two built-in fixture collections on the default shelf with the ten approved eight-card collections. Keep user-created collections.
- Treat the 12 fixture cards/nodes as legacy: exclude them from active runtime content and the map, but never delete their historical learner states, review events, completed runs, or streak qualifications from localStorage.
- Add content-version migrations to both learner state and workspace state. Existing v1 stores gain missing FSRS state for 80 cards, retain old keys/history, swap only built-in collection definitions, and persist the migration automatically.
- If a learner's saved selected collection points to a removed fixture, fall back to the first approved collection without clearing any data.
- Bump the PWA shell cache name so installed clients discard the old shell on activation. Content migration, not cache deletion, is the authoritative upgrade path.
- Keep the 80-card management/review area, but label it as approved and currently in study rather than draft-only.

## Alternatives considered

- Ask learners to clear site data: rejected because it would destroy local progress, streaks, edits, and history.
- Keep the two fixtures beside ten new collections: rejected because the shelf becomes noisy and the fixtures duplicate early English concepts.
- Delete legacy learner state: rejected because historical review events are evidence and may be needed for audit/export.
- Copy the entire 80-card packet into a second published JSON: rejected because it duplicates content and invites drift; the approval manifest plus deterministic derivation is smaller and traceable.

## Consequences and risks

- Both learners see 80 new cards as unseen, correctly receiving fresh FSRS state. Workload remains controlled because each selected collection contains eight cards.
- Old fixture progress no longer appears in active-card mastery denominators, but remains stored and recoverable.
- “Approved” means the owner authorized study; it does not mean the curriculum contains every English fact or that field learning value is proven.
- A malformed legacy store falls back only under the pre-existing recovery behavior; valid stores are migrated additively.

## Focused gate and cumulative gates

- Unit: exact 80 published runtime cards, ten collections, v1→v2 learner/workspace migrations preserve old history and custom content, legacy fixtures absent from active shelf/map.
- Browser: an existing v1 localStorage fixture automatically shows ten new collections, eight cards per selected collection, no legacy collection, preserved review event/streak evidence, and approved library copy.
- Bump and verify the service-worker cache name; run production build and every enabled cumulative gate.

## Rollback

Revert the runtime derivation, collection definitions, migration code, UI copy, and service-worker cache name. Do not remove localStorage keys or old/new card states. A rollback frontend may ignore additive v2 state, but no review event, run, streak qualification, local revision, or graph addition is deleted.

## Evidence

- Final evidence owner: `50-Evidence/english-core-published-migration-2026-08-26.md`

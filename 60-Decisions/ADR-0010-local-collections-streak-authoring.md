# ADR-0010: Local collections, honest streak qualification, and card authoring

Date: 2026-08-22  
Status: accepted for P0 local pilot; Supabase/RLS remains P1

## Context

Twogether must help Hiệp and Hoàng learn from principles outward, choose any deck, keep a motivating streak, grow a shared knowledge DAG, and author cards without losing review history. The current P0 intentionally has no production identity or remote sync; profile selection is a shared-device UX boundary, not authentication.

## Decision

- A collection is a many-to-many playlist of card IDs. The same card can appear in several collections while each learner keeps one FSRS state for that card.
- A run snapshots unique due card IDs. A run is qualified only after every required card has a confirmed attempt and the bounded repair queue is empty. `Nhớ`/`Quên` still control FSRS; qualification is not a mastery claim.
- A daily qualification is unique per learner and local calendar date. The streak projection is derived from immutable qualification events, so repeated decks or repair clicks cannot farm a streak.
- Local card authoring saves revisions as draft by default, allows an explicit local-human publish action, and archives instead of destructive deletion. AI packets are schema-versioned and always import as draft with provenance.
- The knowledge map remains a DAG. New local nodes are persisted as draft additions; prerequisite edges use cycle validation, while layout is derived from graph data and remains accessible through the table alternative.
- P0 stores workspace content, run plans, and qualification events separately from the existing learner review store. This keeps the existing review adapter contract stable and leaves a clean migration seam for Supabase.

## Alternatives rejected

- Counting `completedReviews` or every grade as a streak: repair loops and duplicate writes would inflate motivation metrics.
- Making a card belong to exactly one deck: it would duplicate principle cards and split FSRS state.
- Hard-deleting published cards or replacing their IDs: review history and provenance would become unverifiable.
- Treating the profile picker as production authorization: it cannot protect data across devices or satisfy RLS.

## Cost and authorization

The P0 implementation adds no dependency and uses localStorage only. It is within the owner-authorized local prototype scope. Supabase schema/RLS, roles, identity, and multi-device sync are deliberately not changed here and require a separate authorization/identity ADR.

## Gates

Focused Vitest covers collection scope, shared membership, run qualification, timezone-aware idempotent streaks, DAG cycle checks, and card-packet validation. Existing answer-before-reveal, learner isolation, map parity, PWA, provenance, free-tier, and Supabase contract gates remain mandatory. The smoke receipt for this change is recorded in the accompanying evidence packet.

## Rollback

Disable the new collection/authoring navigation and return to the single fixture queue. The existing review key and adapter remain intact. Delete only the P0 workspace key after exporting its JSON packet if the owner explicitly requests a reset; qualification events can be rebuilt from that key without touching FSRS review history.

# P0 collections and authoring state

Verified: 2026-08-22

The local pilot now has two published fixture collections (`English foundations` and `English · mechanism lab`) with shared card membership, a persisted run plan per learner/deck, timezone-aware daily qualification, and a derived streak. The study queue is scoped to the selected deck; a run requires an attempt for every unique required card and keeps the existing bounded repair loop.

The `Thẻ` view supports local draft/edit/archive, explicit local-human publish, and versioned `twogether.card-packet.v1` import/export. Imported AI content is draft-only and retains source references. The map supports adding a draft branch with `part_of` or `prerequisite`; the prerequisite helper rejects cycles and the accessible table remains the parity view.

Known P0 limits:

- Profile selection is not production authentication.
- Local authoring is not server authorization; Supabase CRUD/RLS and multi-device sync are P1.
- The fixture content remains the owner-reviewed baseline; newly authored or AI-imported cards remain draft until explicitly published.
- Notifications remain disabled until opt-in and a tested HTTPS delivery path.

Next handoff: read `60-Decisions/ADR-0010-local-collections-streak-authoring.md`, `docs/COLLECTIONS_AND_AUTHORING.md`, and `50-Evidence/p0-collections-streak-authoring-2026-08-22.md` before changing deck semantics, streak policy, or content workflow.

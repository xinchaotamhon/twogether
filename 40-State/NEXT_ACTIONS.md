---
last_verified: 2026-08-18
verified_by: Codex P0 implementation pass
status: active
---

# Next Actions

1. **Human-review the captured source drafts** — verify the English taxonomy ambiguity, React public-vs-internal boundaries, examples, learner level, and card wording before importing any draft into the runtime; rollback: delete only derived drafts and retain the external raw attachment hashes.
2. **Connect the selected Supabase path** — implement Supabase Auth/Postgres/RLS behind the existing adapter, with additive migrations, preview/production separation, positive/negative RLS tests, idempotent review writes, and `/health`; gate: ADR-0007 plus architecture deployment checklist; rollback: local adapter or previous frontend plus reversible migration.
3. **Add browser interaction gates** — keyboard/focus/reveal-order/map-list parity and PWA installability checks with Playwright or equivalent; gate: same-artifact browser smoke plus existing 6/6 cumulative gates; rollback: keep the accessible list path and remove only the unproven enhancement.
4. **Replace fixture cards through provenance workflow** — after source capture, derive drafts, Human-review them, and keep the fixture clearly labeled until replacement is accepted.
5. **Run a real seven-day pilot** — Hiệp and Hoàng record retention, transfer attempts, workload, and friction; gate: Human-observable pilot report; rollback: disable optional gamification/notifications without deleting learning history.

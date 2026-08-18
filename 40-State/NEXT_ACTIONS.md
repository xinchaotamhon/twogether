---
last_verified: 2026-08-18
verified_by: Codex zero-cost handoff review
status: active
---

# Next Actions

1. **Human-review the 30-card core plus 10 owner-source drafts** — use `50-Evidence/core-curriculum-2026-08-18.md`, `50-Evidence/draft-review-2026-08-18.md`, and the Luna prompt to record accept/revise/reject, learner level, and daily time budget before importing any draft into the runtime; rollback: delete only derived drafts and retain the external raw attachment hashes.
2. **Run the new core-curriculum contract and cumulative smoke suite** — keep the exact 20 English + 10 React count, provenance, draft status, and DAG invariant; gate: `content.core-curriculum-contract` plus every older required gate.
3. **Connect the selected Supabase Free path** — recheck current quota, then implement Auth/Postgres/RLS behind the existing adapter, with additive migrations, preview/production separation, positive/negative RLS tests, idempotent review writes, and `/health`; gate: ADR-0007, zero-cost contract, and architecture deployment checklist; rollback: local adapter or previous frontend plus reversible migration. No payment or upgrade is authorized; owner login is required only at provisioning/credential steps.
4. **Replace fixture cards through provenance workflow** — after Human sign-off, derive approved cards/nodes, update the runtime source, and keep unresolved claims in `review`; gate: provenance, content/schema, browser, and all cumulative smoke gates.
5. **Run a real seven-day pilot** — Hiệp and Hoàng record retention, transfer attempts, workload, and friction; gate: Human-observable pilot report; rollback: disable optional gamification/notifications without deleting learning history.

---
last_verified: 2026-08-20
verified_by: Codex zero-cost handoff review
status: active
---

# Next Actions

1. **Human-review the 30-card core plus 10 owner-source drafts** — use `50-Evidence/core-curriculum-2026-08-18.md`, `50-Evidence/draft-review-2026-08-18.md`, and the Luna prompt to record accept/revise/reject, learner level, and daily time budget before importing any draft into the runtime; rollback: delete only derived drafts and retain the external raw attachment hashes.
2. **Run the new core-curriculum contract and cumulative smoke suite** — keep the exact 20 English + 10 React count, provenance, draft status, and DAG invariant; gate: `content.core-curriculum-contract` plus every older required gate.
3. **Owner-provision the selected Supabase Free path** — the migration, fixture-only seed, optional client, and contract gate are ready in `supabase/`; create the project and two Auth users, insert the two real email mappings only in Supabase, set Vite/Cloudflare variables, then run positive/negative RLS tests, idempotent review, conflict, and `/health` checks; gate: ADR-0007, ADR-0008, zero-cost contract, and architecture deployment checklist; rollback: unset the two Vite variables and return to the local adapter. No payment or upgrade is authorized.
4. **Replace fixture cards through provenance workflow** — after Human sign-off, derive approved cards/nodes, update the runtime source, and keep unresolved claims in `review`; gate: provenance, content/schema, browser, and all cumulative smoke gates.
5. **Run a real seven-day pilot** — Hiệp and Hoàng record retention, transfer attempts, workload, and friction; gate: Human-observable pilot report; rollback: disable optional gamification/notifications without deleting learning history.

---
standard_version: 1.2.0
vault_version: schema5-decision-quality-query-receipt-v23
vault_commit: 5fa63555b955fc1434dad74b0d40ba684cbb402e
vault_remote: not recorded; pinned local Vault source only
source_path_at_adoption: 20-First-Party/project-standard/START_HERE.md
standard_subpath: 20-First-Party/project-standard
standard_entry_sha256: 9fab7284e3e676a942e53ea93efed41ba340b96afb63e8b25e72017d37161f9f
adopted_at: 2026-08-18
status: active
routine_continuation_requires_vault: false
---

# Standard Adoption

## Applied

- Establish a local `START_HERE.md`, volatile state, evidence, decisions, gates, provenance, and rollback route.
- Preserve raw inputs; keep one owner for each fact; distinguish source, observation, inference, preference, and decision.
- Require cumulative gates and preserve reproducible failures instead of hiding them.
- Treat capability as separate from authority and keep Human evaluation for outcomes software cannot prove.

## Specialized

- “Active recall” is a product invariant: the answer stays hidden until the learner attempts.
- “Consequential data integrity” becomes per-user RLS, append-only review events, idempotency keys, and conflict-visible sync.
- “Breadth/depth/balance” becomes principle-first depth for the initial two-learner scope; the map must still support later breadth without erasing transfer practice.
- “Human field evidence” means Hiệp and Hoàng can complete a real study week and report whether recall and transfer improved, not merely that the UI rendered.

## Waived

- No global Vault resource is adopted automatically. UI and scheduler pointers remain candidates until a project-local task gate and Human review establish value.
- Push notification delivery is deferred from MVP; the compensating control is an in-app due queue and visible install/reminder settings.

## Continuation Contract

Routine continuation reads this project only. The pinned source above is provenance and upgrade context, not a runtime dependency.

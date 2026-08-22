# ADR-0009 — Universal-root interactive knowledge tree

- Status: accepted for P0 map UX
- Date: 2026-08-22
- Decision owner: Hiệp
- Scope: map presentation and navigation only; the prerequisite data model remains the source of truth.

## Context

Hiệp wants to study many domains while remembering them as branches that can be traced back to one useful root. On a phone, the old scattered map did not make the branch relationship or the selected concept’s meaning clear. The existing data model is intentionally a DAG because a concept may have more than one legitimate prerequisite.

## Decision

Render a UI-only virtual root called “Bản chất chung”. Existing domain root nodes become first-level “Bộ kiến thức” branches below it. Existing node kinds continue to determine the derived layers: trunk, branch, and leaf. A node can be selected by pointer hover, keyboard focus, or tap; the detail panel then shows its purpose, card count, stability summary, and prerequisite labels.

Keep the exact DAG edges and the keyboard-accessible table. The virtual root aggregates all cards for orientation but is not stored as a concept node, is not a published flashcard, and must not be treated as a claim that English, React, or another domain has one literal subject-matter parent.

## Alternatives considered

- Force every concept into one database parent: rejected because it would destroy valid shared prerequisites and violate the DAG contract.
- Keep the old visual canvas: rejected because mobile users could not reliably discover branches or inspect a selected branch’s meaning.
- Rewrite the schema into a strict tree: deferred and unnecessary; the presentation layer solves the orientation problem without a migration.

## Consequences, cost, and authorization

- No database migration or credential change is required.
- Future domains appear automatically as additional root-level branches when their nodes are added.
- The tree’s visual connectors are a layer-based orientation aid; the accessible table and edge list remain the exact relationship view.
- The change stays within the owner-authorized P0 UI scope and costs USD 0.
- The virtual root’s aggregate progress is useful for motivation but must not be interpreted as a new card or as proof of learning.

## Verification and rollback

The browser contract must assert that the removed study/map copy stays absent, the universal root is visible, hover/focus/tap changes the detail panel, and the accessible table remains available. Run focused unit tests, the production build, the Playwright gate, and the cumulative smoke suite.

Rollback is a normal revert of the implementation and this ADR; the previous map presentation remains recoverable from the prior commit. No user data is deleted by this decision.

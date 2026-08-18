# ADR-0002 — Render a prerequisite DAG as a learning map

- Status: accepted for P0
- Date: 2026-08-18
- Decision owner: Hiệp (project owner)

## Context

The owner wants foundational English and principles to grow into branches. A strict tree cannot represent a concept reused by several foundations and would imply a false taxonomy.

## Decision

Store a DAG with typed edges, reject cycles only for prerequisites, and render a selected root as a tree-like map with an accessible list alternative. Add a principle ladder from statement to mechanism to boundary to transfer.

## Consequences

The data model is slightly more complex than nested decks, but prerequisite reuse and future content growth remain possible. Progress must be derived from review state and transfer attempts, not from opening a branch.

## Gate and rollback

Test cycle rejection, multi-parent rendering, mobile layout, keyboard list parity, and prerequisite explanation. If graph UX proves confusing, keep the DAG data and temporarily show a flat, filtered queue; do not delete edges.

# Project Instructions

1. Read `START_HERE.md` and follow its full read order before editing.
2. Use the `prepare-project-work` skill when available.
3. Prefer codebase-memory graph tools for code discovery and impact tracing once source code exists; use text search only for literals/configuration.
4. Treat this repository as the temporary project's memory, not as an AI identity or an authority to expand scope.
5. Do not mutate raw source imports. Keep provenance, transformation, and review status next to derived cards.
6. Never store passwords, tokens, push subscription secrets, or raw private chat in Markdown, fixtures, or prompts.
7. Keep shared card content separate from per-learner review state. Enforce this at the database policy boundary, not only in the UI.
8. Core review must require an attempt before revealing the answer. A typed answer is optional; silence, speaking aloud, or writing privately are valid attempts, but the learner must self-grade honestly.
9. Use only the two visible outcomes `Nhớ` and `Quên` in the MVP. Map them to FSRS `Good` and `Again`; do not pretend `Quên` means “hard but correct”.
10. Keep the repair loop bounded and observable. Do not use endless same-card repetition to manufacture a green streak or completion metric.
11. Treat the knowledge map as a DAG. Do not force a card into one irreversible parent when it has multiple legitimate prerequisites.
12. Run focused gates plus all applicable older gates after each behavior change. Do not rewrite expected results to make a gate pass.
13. Keep notifications disabled until the learner opts in from a deliberate user gesture and the server delivery path is tested over HTTPS.
14. Do not claim the Claude share links are understood until `docs/CLAUDE_SOURCE_STATUS.md` is updated with captured source evidence.
15. Before consequential architecture, privacy, account, network, deployment, or irreversible data changes, state assumptions, objections, alternatives, cost, gate, authorization, and rollback in an ADR or decision packet.

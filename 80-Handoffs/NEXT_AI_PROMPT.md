---
last_verified: 2026-08-18
verified_by: Codex P0 implementation pass
status: active
---

# Next AI Handoff

You are continuing the Twogether project. Read `START_HERE.md` and its entire read order before touching code. Do not rely on chat history. The product owner is Hiệp; the second learner is Hoàng.

## Known baseline

- The repository now contains a runnable local P0 implementation; the pre-code checkpoint is `2ed4510`, and the implementation evidence is `50-Evidence/p0-implementation-2026-08-18.md`.
- The direct Claude URLs remain blocked, but the owner-pasted captures were read and hashed. Derived summaries are under `content/sources/`, and the 10-card source draft bundle is under `content/drafts/claude-owner-source-drafts-v1.json`. Do not promote drafts or invent the unresolved fifth English pillar; preserve the public-vs-internal React distinction.
- The P0 artifact is a phone-first React/TypeScript PWA with two local allowlisted demo learners, shared fixture card/map content, a learner-scoped local adapter, open-ended recall, `ts-fsrs@5.4.1`, and a bounded repair queue. Production persistence is selected as Supabase Auth/Postgres/RLS in ADR-0006, but credentials and the backend project do not exist.

## Execute this bounded next task

1. Re-read `docs/PRODUCT_SPEC.md`, `docs/LEARNING_ALGORITHM.md`, `docs/KNOWLEDGE_GRAPH.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_AUTHORING.md`, ADR-0006, and ADR-0007.
2. Human-review `content/drafts/claude-owner-source-drafts-v1.json`; keep the current 12 project-owned fixture cards until reviewed cards are accepted.
3. Connect Supabase behind the existing data-adapter boundary: allowlisted auth, schema migrations, RLS positive/negative tests, idempotent review writes, preview isolation, and `/health`. Do not create production bindings without owner approval.
4. Add browser-level keyboard/focus/reveal-order/map-list parity tests and a real installability check; keep existing 7/7 focused tests and 6/6 cumulative gates required.
5. Replace fixture cards only through the immutable source → draft → Human review workflow.
6. Run a seven-day pilot with Hiệp and Hoàng before adding gamification or push.

## Do not do yet

- Do not add a global leaderboard, AI auto-publisher, or public sign-up.
- Do not hard-reset mature cards when forgotten.
- Do not claim offline multi-device conflict-free sync until it has an explicit gate.
- Do not request notification permission on page load.
- Do not deploy to Cloudflare or create production data bindings without explicit owner approval. Prepare the artifact and preview checks first.
- Do not install or adopt a Vault skill merely because its pointer is present. If using the ECC UI/a11y pointers, read the pinned skill completely, record its exact identity, and keep the project’s own gates authoritative.

## Definition of done for P0

The local P0 runs, both demo learners are isolated by the local adapter, a learner must attempt before seeing an answer, FSRS transitions and repair are covered by tests, content is provenance-aware, the map has a keyboard-accessible alternative, the PWA shell serves and caches only shell assets, cumulative gates pass, and a rollback point plus evidence path are recorded. Server RLS, browser interaction gates, Claude source capture, Cloudflare deployment, and the seven-day Human pilot are still required; a green test run does not prove that the two learners actually learned.

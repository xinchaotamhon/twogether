---
last_verified: 2026-08-18
verified_by: Codex inception pass
status: active
---

# Next AI Handoff

You are continuing the Twogether project. Read `START_HERE.md` and its entire read order before touching code. Do not rely on chat history. The product owner is Hiệp; the second learner is Hoàng.

## Known baseline

- The repository contains project memory and contracts but no application implementation yet.
- The two Claude source URLs are recorded in `docs/CLAUDE_SOURCE_STATUS.md`; their content was not captured in this runtime. If you can access them, capture provenance first. If not, ask the owner to paste/export them. Do not invent the missing four-group English taxonomy or principle layer.
- The recommended P0 is a phone-first React/TypeScript PWA with two allowlisted accounts, shared card/map content, RLS-isolated learner state, open-ended recall, FSRS-6, and a bounded repair queue. The exact package versions and backend credentials are not selected.

## Execute this bounded next task

1. Re-read `docs/PRODUCT_SPEC.md`, `docs/LEARNING_ALGORITHM.md`, `docs/KNOWLEDGE_GRAPH.md`, `docs/ARCHITECTURE.md`, and `docs/CONTENT_AUTHORING.md`.
2. Establish a clean Git checkpoint and record the baseline command/output in `50-Evidence/` before adding dependencies.
3. If source capture is available, import it as immutable provenance and create only `draft` cards first. Otherwise use a tiny project-owned fixture with clearly labeled placeholder concepts; do not present it as Claude-derived.
4. Scaffold the smallest runnable app: login for the two allowlisted users, one shared node, a handful of reviewed fixture cards, study flow, review-event persistence, and a map/list view.
5. Implement the scheduler adapter behind a pure interface. Pin `ts-fsrs`, map `Nhớ` to `Good` and `Quên` to `Again`, and write deterministic tests for new/learning/review/lapse, repair cap, timezone, and duplicate-event behavior.
6. Enforce RLS and test both positive and cross-account negative cases. Never trust a learner ID sent by the browser.
7. Add PWA manifest/service-worker shell support and keyboard/focus/reduced-motion gates. Defer push notifications behind a disabled feature flag.
8. Make the app deployable to Cloudflare without deploying it yet: choose exactly one backend path (Supabase Auth/Postgres/RLS or Cloudflare Pages Functions/Workers + D1), keep the data-adapter boundary, add preview/production environment separation, and ensure no secret or private API response enters the static build or service-worker cache. Add `/health`, CSP/CORS, no-secret, manifest, and cross-account deployment smoke checks. Keep Git-connected reproducible configuration; do not use an untracked direct upload as the only release source.
9. Run `python tools/run_gates.py --tier smoke` and focused tests on the same artifact. Preserve failures; update `40-State`, `50-Evidence`, and this handoff only when the facts change.

## Do not do yet

- Do not add a global leaderboard, AI auto-publisher, or public sign-up.
- Do not hard-reset mature cards when forgotten.
- Do not claim offline multi-device conflict-free sync until it has an explicit gate.
- Do not request notification permission on page load.
- Do not deploy to Cloudflare or create production data bindings without explicit owner approval. Prepare the artifact and preview checks first.
- Do not install or adopt a Vault skill merely because its pointer is present. If using the ECC UI/a11y pointers, read the pinned skill completely, record its exact identity, and keep the project’s own gates authoritative.

## Definition of done for P0

The app runs locally, both accounts are isolated, a learner must attempt before seeing an answer, FSRS transitions and repair are covered by tests, content is provenance-aware, the map has a keyboard-accessible alternative, the PWA shell installs/caches safely, cumulative gates pass, and a rollback point plus evidence path are recorded. A green test run does not prove that the two learners actually learned; schedule the seven-day Human pilot next.

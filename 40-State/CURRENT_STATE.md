---
last_verified: 2026-08-25
verified_by: Codex English Generative Core v1 implementation; remote sync remains optional
status: active — P0 local study slice implemented
---

# Current State

## Verified facts

- The project directory was empty before this inception pass and had no Git metadata or application code.
- The project foundation and product/learning contracts are now documented locally.
- The owner wants two learners (Hiệp and Hoàng), English-first learning, a principle layer, self-authored cards, a branching map, open-ended recall, progress/motivation, and a possible PWA. The entry UX is deliberately just a Hiệp/Hoàng profile picker; no email, password, or PIN is required.
- FSRS-6 with an initial 0.90 desired retention and a bounded repair loop is the recorded recommendation.
- Vault discovery found UI/accessibility pointers, but none is adopted or field-proven.
- Cloudflare is the intended deployment target. No Pages project, Worker, D1/Supabase project, credentials, or production deployment exists yet; the target is recorded as a constraint only.
- A runnable React/TypeScript/Vite P0 now exists with a local adapter, 12 explicitly project-owned fixture cards, open-ended study flow, FSRS adapter, bounded repair queue, map/list view, progress view, and PWA shell.
- The study screen now keeps only learning-critical copy: the learner switch is avatar-only, the local/fixture/session labels are hidden, and the private attempt textarea says “Viết thứ gì đó vào đây”.
- The map presentation now adds a virtual “Bản chất chung” root, lays domain nodes out as trunk/branch/leaf layers, and shows selected-branch details on hover, focus, or tap while preserving the exact prerequisite DAG and accessible table.
- Human visual review rejected the first stacked layer-card rendering as too sparse and card-like. The current map uses a real SVG graph stage with curved/typed connectors, centered nodes, aggregate descendant progress, a compact legend, and a mobile-safe scroll treatment; no new dependency or asset was added.
- The active P0 persistence path is the local adapter with a simple Hiệp/Hoàng profile picker. Supabase Auth/Postgres/RLS remains a future sync option only; the current app does not show email login even when `.env.local` exists.
- The owner-set deployment budget is USD 0/month: Cloudflare Pages Free + Supabase Free; no paid upgrade or add-on is authorized.
- English Generative Core v1 now exists as `content/drafts/core-curriculum-drafts-v2.json`: exactly 80 English draft cards in ten modules of eight, plus the 10 React draft cards preserved unchanged as JSON values from v1. Academic/owner-source qualifications are under `content/sources/`; ADR-0011 owns the decision.
- The `Thẻ` view exposes one eight-card English module at a time for review/editing. Static curriculum drafts are absent from published collections, due selection, FSRS learner state, and streak qualification. They are not study content until a Human explicitly revises/reviews/publishes a local copy.
- Focused curriculum validation, 18/18 unit tests, production build, and 9/9 Playwright/Chrome checks pass on the current artifact. The final cumulative receipt is owned by `50-Evidence/english-generative-core-v1-2026-08-25.md`.

## Blockers

- The direct Claude share URLs remain unverified, but the owner supplied and Codex read three hashed captures: English and React on 2026-08-18 plus a fuller English capture on 2026-08-25. Raw bytes remain outside Git; derived summaries live under `content/sources/`.
- React/Vite/ts-fsrs dependencies are installed locally, but no backend project, account, deployment, or notification service is installed or authorized.
- No real Supabase RLS test exists yet; local adapter and browser checks are not evidence of server authorization. This is acceptable for the current profile-only P0 because remote sync is not active.
- The active 90-card curriculum packet has not received Human accept/revise/reject decisions. Structural validation and AI content review are not Human approval.
- Supabase schema/RLS migration, fixture-only seed, future adapter, and contract gate now exist locally; final cumulative smoke run `20260822T094710Z-43bdbf75` passes 11/11. No remote project, Auth user, or credential has been created.

## Unknowns

- Learner current level, daily time budget, preferred English module order, and which examples need simplification after real use.
- Whether both learners want shared editing or an owner/reviewer role.
- Which offline depth is worth the sync complexity after the first real week.
- Remote sync is not part of the active P0. A future identity choice and owner-run RLS results are intentionally deferred.

## Evidence

See `50-Evidence/EVIDENCE_INDEX.md`, `50-Evidence/p0-implementation-2026-08-18.md`, and `50-Evidence/english-generative-core-v1-2026-08-25.md`. Green gates prove packet/app invariants, not that Hiệp or Hoàng learned; Human module review and a real study week are still required.

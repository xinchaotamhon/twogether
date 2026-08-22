---
last_verified: 2026-08-22
verified_by: Codex study-copy and interactive-tree refinement; remote sync remains optional
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
- The active P0 persistence path is the local adapter with a simple Hiệp/Hoàng profile picker. Supabase Auth/Postgres/RLS remains a future sync option only; the current app does not show email login even when `.env.local` exists.
- The owner-set deployment budget is USD 0/month: Cloudflare Pages Free + Supabase Free; no paid upgrade or add-on is authorized.
- A provenance-aware principle-ladder starter exists outside the runtime: 20 English cards + 10 React cards, 12 DAG nodes, all `draft`; see `content/drafts/core-curriculum-drafts-v1.json` and `50-Evidence/core-curriculum-2026-08-18.md`.
- Focused tests pass 7/7, production build passes, Playwright browser checks pass 5/5, and final cumulative smoke run `20260822T091307Z-7d00f9e9` passes 11/11, including the profile-picker regression and core-curriculum contract. The production preview serves `/`, the manifest, and service worker. Dependency install reported 0 vulnerabilities; a later advisory-endpoint recheck remains recorded separately.

## Blockers

- The direct Claude share URLs remain blocked, but the owner supplied and Codex read two hashed pasted-text captures. Derived summaries live under `content/sources/`; 10 source-derived cards are draft-only and are not in the P0 runtime.
- React/Vite/ts-fsrs dependencies are installed locally, but no backend project, account, deployment, or notification service is installed or authorized.
- No real Supabase RLS test exists yet; local adapter and browser checks are not evidence of server authorization. This is acceptable for the current profile-only P0 because remote sync is not active.
- The 40 draft cards (30 core starter + 10 owner-source drafts) have not received Human accept/revise/reject decisions and are not published to the runtime.
- Supabase schema/RLS migration, fixture-only seed, future adapter, and contract gate now exist locally; final cumulative smoke run `20260822T091307Z-7d00f9e9` passes 11/11. No remote project, Auth user, or credential has been created.

## Unknowns

- Exact fifth English pillar (the pasted segment mentions five but enumerates four), learner current level, daily time budget, and desired English/React ordering.
- Whether both learners want shared editing or an owner/reviewer role.
- Which offline depth is worth the sync complexity after the first real week.
- Remote sync is not part of the active P0. A future identity choice and owner-run RLS results are intentionally deferred.

## Evidence

See `50-Evidence/EVIDENCE_INDEX.md` and `50-Evidence/p0-implementation-2026-08-18.md` for source status, gate receipts, build/test output, and preview checks. This state is not a product-value verdict; a real study week is still required.

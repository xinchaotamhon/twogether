---
last_verified: 2026-08-31
verified_by: Codex support/map implementation and cross-device design review
status: active — English Core v1 published locally; optional support preview available; remote sync inactive
---

# Current State

## Verified facts

- Twogether is a phone-first React/TypeScript/Vite PWA for Hiệp and Hoàng. Entry remains a simple profile picker with no email, password, or PIN.
- The core learning loop requires an honest attempt before reveal, exposes only `Nhớ`/`Quên`, maps them to FSRS `Good`/`Again`, and bounds same-session repair.
- Hiệp explicitly approved all 80 English Generative Core v1 cards on 2026-08-26. The approval manifest is `content/reviews/english-generative-core-v1-owner-approval-2026-08-26.json`; ADR-0012 owns publication and migration.
- The runtime now exposes exactly ten published English decks of eight cards. The immutable source packet remains draft/provenance under `content/drafts/core-curriculum-drafts-v2.json`; runtime publication is derived in `src/approvedCurriculum.ts` with reviewer `hiep`.
- The 12 legacy fixture cards and two fixture decks are absent from the active study shelf and knowledge map. Browser migration preserves their learner card states, review events, completed runs, daily qualifications/streak inputs, local cards, revisions, and user-created collections.
- Existing localStorage keys are migrated in place to content/workspace version 2, so a redeploy does not require clearing browser data. PWA shell cache is `twogether-shell-v2`.
- The map remains a DAG. A lazy-loaded React Flow viewport now provides drag-to-pan, wheel/pinch zoom, `+`/`−`/fit controls, and a minimap while preserving the project-owned deterministic layout, virtual “Bản chất chung” root, multi-parent edges, progress projection, and accessible table.
- Every approved English card has an AI-draft support record with a secondary question, its separate answer, and structured glossary references. It is opt-in per browser and remains `ai_draft_unreviewed`; using the preview does not approve wording or affect FSRS.
- The glossary currently defines 25 reusable English mechanism terms, including `finite-verb` and `non-finite-verb`, with Vietnamese meaning, explanation, example, and why-it-matters detail.
- English Core v1 is a complete principle backbone for levels 1–3 (backbone, mechanism/boundary, transfer), not all English. Pronunciation/IPA, vocabulary breadth, comparison constructions, fluent feedback, register, and dialect remain explicit growth branches in `docs/CURRICULUM_EXPANSION_ROADMAP.md`.
- The current persistence authority is still localStorage. It survives deploys on the same browser but does not follow Hiệp/Hoàng to another browser/device.
- `.env.local` may contain Supabase browser values, but the app still uses the local adapter. Remote sync is not active merely because those values exist; secure cross-device identity needs a separate decision and real RLS tests.
- Focused verification currently passes: 25/25 unit tests, production build, 11/11 Playwright/Chrome tests, dependency audit with 0 reported vulnerabilities, and final cumulative receipt `20260831T154931Z-083172f9` with 12/12 required gates.
- The owner-set deployment budget remains USD 0/month. Cloudflare Pages Free + Supabase Free are the only authorized production direction; no paid upgrade is authorized.

## Blockers

- Cross-browser/device progress is not implemented. A plain Hiệp/Hoàng picker cannot securely prove identity; the recommended future compromise is one-time device pairing/recovery while keeping daily entry simple.
- Hiệp must choose whether each learner can use a separate browser/OS profile. Without that separation, email, PIN, passkey, or another factor is required to stop one person selecting the other profile; a name picker alone cannot provide cryptographic isolation.
- The Supabase seed/adapter foundation is not evidence that remote schema, RLS, migrations, or identity work in the owner’s actual project. Do not switch persistence authority without export, two-identity RLS, conflict, and rollback gates.
- No seven-day learning pilot has tested wording, workload, recall honesty, transfer, or which branch should be expanded first.
- The 80 support records and 25 glossary entries have machine validation but no Human wording sign-off; they must not be silently promoted to approved content.
- Ten React cards in the v2 source packet remain draft history. React Generative Core must be designed/reviewed as a separate subject trunk after the English pilot; it is not published by the English approval.
- Direct Claude share URLs remain unverified; three hashed owner-provided captures and derived summaries are the actual source evidence.

## Unknowns

- Which of pronunciation/IPA, comparison, or vocabulary should be the first post-pilot English branch.
- Which examples Hiệp or Hoàng will find unnatural or too difficult during real use.
- Whether cross-device sync is worth one-time pairing/recovery complexity.

## Evidence

See `50-Evidence/EVIDENCE_INDEX.md`, `50-Evidence/english-generative-core-v1-2026-08-25.md`, ADR-0012, and the 2026-08-26 publication evidence. Green gates prove artifact invariants; they do not prove that either learner has mastered English.

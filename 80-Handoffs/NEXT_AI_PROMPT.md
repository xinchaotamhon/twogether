---
last_verified: 2026-08-18
verified_by: Codex smoke 10/10 and browser 4/4 pass
status: active
---

# Next AI Handoff

You are continuing the Twogether project. Read `START_HERE.md` and its entire read order before touching code. Do not rely on chat history. The product owner is Hiệp; the second learner is Hoàng.

## Known baseline

- The repository now contains a runnable local P0 implementation; the pre-code checkpoint is `2ed4510`, and the implementation evidence is `50-Evidence/p0-implementation-2026-08-18.md`.
- The direct Claude URLs remain blocked, but the owner-pasted captures were read and hashed. Derived summaries are under `content/sources/`, and the 10-card source draft bundle is under `content/drafts/claude-owner-source-drafts-v1.json`. Codex pre-reviewed the bundle in `50-Evidence/draft-review-2026-08-18.md`; Human approval is still pending. Do not promote drafts or invent the unresolved fifth English pillar; preserve the public-vs-internal React distinction.
- A bounded principle-ladder starter is now in `content/drafts/core-curriculum-drafts-v1.json`: exactly 20 English cards and 10 React cards, all `draft`, attached to a DAG. The rationale is `content/sources/core-curriculum-synthesis-v1.md`, the review evidence is `50-Evidence/core-curriculum-2026-08-18.md`, and the continuation prompt for Luna is `80-Handoffs/PROMPT_FOR_LUNA_CORE_CONTENT.md`. This is a generative backbone, not an exhaustive inventory of every English or React fact.
- The P0 artifact is a phone-first React/TypeScript PWA with two local allowlisted demo learners, shared fixture card/map content, a learner-scoped local adapter, open-ended recall, `ts-fsrs@5.4.1`, and a bounded repair queue. Production persistence is selected as Supabase Auth/Postgres/RLS in ADR-0006, but credentials and the backend project do not exist.
- The owner requires a zero-cost personal deployment: Cloudflare Pages Free + Supabase Free, using `*.pages.dev`. `monthly_budget_usd: 0` and `paid_upgrade_authorized: false` are durable constraints in ADR-0007. Do not enable Pro, paid add-ons, custom-domain purchases, paid SMTP/SMS/push, or any metered service without a new explicit owner decision.

## Execute this bounded next task

1. Human-review the 30-card core starter and the 10-card owner-source bundle; record accept/revise/reject per card in dated evidence. Keep the current 12 project-owned fixture cards until reviewed cards are accepted.
2. Ask Hiệp for learner level and daily time budget before expanding branches; use the ladder principle → mechanism → boundary → transfer.
3. Connect Supabase Free behind the existing data-adapter boundary: allowlisted auth, schema migrations, RLS positive/negative tests, idempotent review writes, preview isolation, and `/health`. Recheck current Free quotas immediately before provisioning. Do not add a payment method, accept a paid upgrade, or create production bindings without owner approval.
4. After Human approval, replace fixture cards only through the immutable source → draft → Human review workflow.
5. Run a seven-day pilot with Hiệp and Hoàng before adding gamification or push.

The browser contract is implemented in `e2e/p0.spec.ts` and covered by `browser.p0-contract`. The cumulative suite also includes `content.core-curriculum-contract`; rerun it after content changes and keep every required gate enabled when connecting Supabase.

## Do not do yet

- Do not add a global leaderboard, AI auto-publisher, or public sign-up.
- Do not hard-reset mature cards when forgotten.
- Do not claim offline multi-device conflict-free sync until it has an explicit gate.
- Do not request notification permission on page load.
- Do not deploy to Cloudflare or create production data bindings without explicit owner approval. Prepare the artifact and preview checks first.
- Do not spend money. If a free quota or inactivity pause blocks progress, preserve/export data and report the exact limitation; do not silently upgrade.
- Do not install or adopt a Vault skill merely because its pointer is present. If using the ECC UI/a11y pointers, read the pinned skill completely, record its exact identity, and keep the project’s own gates authoritative.

## Definition of done for P0

The local P0 runs, both demo learners are isolated by the local adapter, a learner must attempt before seeing an answer, FSRS transitions and repair are covered by tests, content is provenance-aware, the map has a keyboard-accessible alternative, the PWA shell serves and caches only shell assets, cumulative gates pass, and a rollback point plus evidence path are recorded. Server RLS, browser interaction gates, Human review of the 40 draft cards, zero-cost Cloudflare deployment, and the seven-day Human pilot are still required; a green test run does not prove that the two learners actually learned.

Supabase login is not needed to review or author these cards. It is needed only when the owner chooses to create/connect the remote Free project and its credentials. Cloudflare deployment can remain an owner-operated step after the artifact and preview checks pass.

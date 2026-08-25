---
last_verified: 2026-08-25
verified_by: Codex English Generative Core v1 implementation; remote sync remains optional
status: active
---

# Next AI Handoff

You are continuing the Twogether project. Read `START_HERE.md` and its entire read order before touching code. Do not rely on chat history. The product owner is Hiệp; the second learner is Hoàng.

## Known baseline

- The repository now contains a runnable local P0 implementation; the pre-code checkpoint is `2ed4510`, and the implementation evidence is `50-Evidence/p0-implementation-2026-08-18.md`.
- Three owner captures were read and hashed; raw bytes remain outside Git. The fuller 2026-08-25 English capture resolves the fifth pillar as high-frequency vocabulary/chunks. The direct Claude URLs themselves remain unverified. Read `docs/CLAUDE_SOURCE_STATUS.md`, `content/sources/claude-english-owner-capture-2026-08-25.md`, and the source manifest before making source claims.
- The active packet is `content/drafts/core-curriculum-drafts-v2.json`: exactly 80 English drafts in ten eight-card modules plus the 10 React cards preserved unchanged from v1. Read ADR-0011, `content/sources/core-curriculum-synthesis-v2.md`, and `content/sources/english-generative-core-sources-v1.md`. The old Luna expansion prompt is superseded.
- `src/curriculumDrafts.ts` and the `Thẻ` view expose the English packet for review only. No static curriculum ID is in a published collection, due queue, FSRS state, or streak. “Đưa vào chỉnh sửa” fills the local editor; Human correction and explicit publication are still required.
- The P0 artifact is a phone-first React/TypeScript PWA with two local learner profiles, shared fixture card/map content, a learner-scoped local adapter, open-ended recall, `ts-fsrs@5.4.1`, and a bounded repair queue. The entry flow is always a simple Hiệp/Hoàng picker: no email, password, PIN, or Supabase Auth screen. Supabase schema/client files remain a future sync path and are not active just because `.env.local` exists.
- The owner requires a zero-cost personal deployment: Cloudflare Pages Free + Supabase Free, using `*.pages.dev`. `monthly_budget_usd: 0` and `paid_upgrade_authorized: false` are durable constraints in ADR-0007. Do not enable Pro, paid add-ons, custom-domain purchases, paid SMTP/SMS/push, or any metered service without a new explicit owner decision.
- Supabase foundation code is now in `supabase/migrations/202608200001_initial.sql`, `supabase/seed.sql`, `src/supabaseClient.ts`, and `src/supabaseAdapter.ts`; setup and rollback are in `supabase/README.md`, with evidence in `50-Evidence/supabase-foundation-2026-08-20.md`. Final cumulative smoke run `20260822T094710Z-43bdbf75` passes 11/11, including the 5-test browser contract. No remote project or Auth user is required for the current profile-only flow; no remote sync is active.

## Execute this bounded next task

1. Ask Hiệp to review one English module (eight cards) in the `Thẻ` view and record accept/revise/reject; do not ask for all 80 at once.
2. Revise unclear examples through the CRUD/provenance workflow, then explicitly publish only accepted local revisions. Never bulk-promote the static packet.
3. Run a seven-day pilot after the first useful module is live; use recall honesty and transfer failures to choose the next branch.
4. Keep Supabase inactive for the current profile-only product. Remote sync needs a later identity/privacy decision and real two-account RLS evidence.

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

The local P0 runs, both learners are isolated by the local adapter, a learner must attempt before reveal, FSRS/repair are covered, the map has a keyboard alternative, and PWA shell checks pass. English Core v1 is visible as ten review-only slices and excluded from study until explicit Human publication. Human review of 80 English + 10 React drafts, owner-operated zero-cost Cloudflare deployment, and the seven-day pilot remain outstanding. Server RLS is a future sync gate; green tests do not prove learning.

Supabase login is intentionally not part of the current product. The owner can review cards by choosing Hiệp or Hoàng. Cloudflare deployment can remain an owner-operated step after the artifact and preview checks pass; remote sync requires a later explicit decision.

---
status: accepted-for-v1
date: 2026-08-18
decision_owner: hiep
scope: production persistence and account boundary
monthly_budget_usd: 0
paid_upgrade_authorized: false
---

# ADR-0007: Supabase over MongoDB for v1

## Context

The P0 already has a local adapter. Production needs exactly two allowlisted learners, shared card/map content, learner-private FSRS state and notes, append-only review events, idempotent writes, and database-enforced isolation. The frontend is intended for Cloudflare Pages, so the database must not require credentials in the browser.

## Decision

Keep the managed-data path: Cloudflare Pages frontend plus Supabase Auth/Postgres/RLS. Do not switch v1 to MongoDB. The existing adapter boundary remains, so a later backend change is possible before substantial learner history exists.

## Why

- Supabase Auth and Postgres RLS directly model the core boundary: shared rows are readable by both learners while private rows are filtered by the authenticated identity. Supabase documents combining Auth JWTs with RLS policies and explicitly warns that service-role keys bypass RLS and must stay server-side.
- The app's data is relational at its security boundary: users, shared nodes, prerequisite edges, cards, revisions, learner-card states, and review events need constraints, joins, unique idempotency keys, and migrations. PostgreSQL gives these primitives without a custom authorization service.
- MongoDB Atlas can store this data, but the supported design would require a Worker or other server API to own authentication, sessions, document-level authorization, migrations, and idempotency. MongoDB's older Atlas App Services/Data API route is documented as end-of-life, so it is not a safe v1 foundation for a new app.

## Assumptions, objections, and alternatives

- Assumption: two learners and moderate card/event volume do not require MongoDB's document model or sync capabilities.
- Objection: Supabase is a vendor dependency and its hosted plan/cost must be checked before production; keep exports and an adapter boundary.
- Alternative: Workers + D1 remains viable if owner prefers Cloudflare-only infrastructure, but it moves password hashing, session security, RLS-equivalent checks, migrations, and backup responsibility into project code.
- Alternative: MongoDB Atlas becomes reasonable only if a future requirement demonstrates document-heavy workloads and the project is willing to operate a dedicated API/auth boundary; this is out of v1.

## Cost and authorization

The v1 infrastructure budget is **USD 0 per month**. Use Cloudflare Pages Free plus one Supabase Free project, keep the free `*.pages.dev` address, and do not enable a paid custom domain, Supabase Pro/add-on, paid SMTP/SMS, or another metered service without a new explicit owner decision.

The free-tier facts checked on 2026-08-18 are sufficient for the two-learner pilot: Supabase Free documents two free projects, 500 MB database per project, 50,000 MAU, 5 GB egress, and 1 GB file storage; free projects may pause after one week of inactivity. Cloudflare documents free/unlimited static asset requests and up to 100,000 Workers/Pages Function requests per day if Functions are later needed. These quotas are time-sensitive and must be rechecked before deployment.

No remote project, secret, payment method, or data binding is created by this decision. Owner approval is required before creating production resources, adding secrets, writing learner data, or accepting any non-zero charge. If a free quota is reached, prefer a visible temporary service restriction and export/cleanup plan over silently upgrading.

## Gate

Before production: migrations apply from a clean database; two real accounts pass positive and cross-account negative RLS tests; review writes are idempotent; preview and production are isolated; service-role credentials are absent from the build; `/health`, PWA, CSP/CORS, rollback, current free-tier quota review, and the zero-cost contract pass with the existing smoke gates.

## Rollback

Keep the local adapter and return to the pre-remote checkpoint if the Supabase integration is unsafe. Preserve review-event contracts and never delete learner history to change providers.

## Evidence

- Supabase RLS and Auth: <https://supabase.com/docs/guides/database/postgres/row-level-security>, <https://supabase.com/docs/guides/auth>
- Supabase frontend security: <https://supabase.com/docs/guides/database/secure-data>
- MongoDB Atlas authorization: <https://www.mongodb.com/docs/atlas/architecture/current/auth/>
- MongoDB App Services/Data API end-of-life notice: <https://www.mongodb.com/docs/atlas/app-services/data-api/generated-endpoints/>
- Supabase pricing/billing: <https://supabase.com/pricing>, <https://supabase.com/docs/guides/platform/billing-on-supabase>
- Cloudflare Pages/Functions pricing: <https://developers.cloudflare.com/pages/functions/pricing/>

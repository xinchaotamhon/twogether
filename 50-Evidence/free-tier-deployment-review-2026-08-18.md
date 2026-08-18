# Free-tier deployment review — 2026-08-18

## Decision

The owner requires a zero-cost personal deployment for Hiệp and Hoàng. The selected v1 path is Cloudflare Pages Free + Supabase Free, using the free `*.pages.dev` address. No paid upgrade, add-on, domain purchase, SMTP/SMS/push service, or non-zero charge is authorized.

## Current official limits checked

- Supabase Free: two free projects; 500 MB database per project; 50,000 MAU; 5 GB egress; 1 GB file storage; free projects may pause after one week of inactivity.
- Cloudflare Pages: static asset requests are free and unlimited; Pages Functions share the Workers Free quota, currently 100,000 requests per day.
- The two-learner text-card workload is inferred to be far below these quotas, but this must be verified from real usage and the official pages rechecked before provisioning.

## Sources

- <https://supabase.com/pricing>
- <https://supabase.com/docs/guides/platform/billing-on-supabase>
- <https://supabase.com/docs/guides/platform/cost-control>
- <https://developers.cloudflare.com/pages/functions/pricing/>
- <https://developers.cloudflare.com/pages/platform/limits/>

## Gate and rollback

The `deployment.free-tier-contract` smoke gate protects `monthly_budget_usd: 0` and `paid_upgrade_authorized: false`. If free-tier limits block the pilot, preserve/export learner data, report the exact limitation, and remain on the local adapter until the owner makes a new decision.

Observed after the handoff update: cumulative smoke gates passed 8/8 with receipt `20260818T152027Z-b1895bbd`; project-memory audit reported no errors or warnings across 33 Markdown files.

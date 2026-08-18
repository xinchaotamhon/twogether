# Evidence Index

## Inception evidence — 2026-08-18

- `docs/CLAUDE_SOURCE_STATUS.md` records the two supplied URLs and the observed Cloudflare access failure.
- Vault `guide --json` and `status` were read before selecting architecture. The active dataset identity was `dcff75332effdc6e284a367618a46473fc099e562bc5e16ae13bd0db3794cbc5`; the Vault remained candidate/unverified and did not authorize project bootstrap.
- Vault query receipts: `q:8588a94aef69166e`, `q:01fd68445690546f`, `q:059898a6ad345267`, `q:7f19758d961e1052`, `q:4e3f2afb74088652`, `q:96ee414857ca8c07`, `q:7ef461504218e880`, `q:f0b820ffb6f827f9`.
- Selected UI pointers remain candidates: `skill.ecc-frontend-design-direction`, `skill.ecc-frontend-a11y`; Hallmark was read as an archived alternative and was not adopted.

## External primary sources consulted

- FSRS implementation and API: <https://github.com/open-spaced-repetition/ts-fsrs>
- FSRS model notes: <https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm>
- Anki FSRS guidance, retention, relearning, and backlog policy: <https://docs.ankiweb.net/deck-options>
- Retrieval-practice evidence: <https://pubmed.ncbi.nlm.nih.gov/38838277/> and <https://pmc.ncbi.nlm.nih.gov/articles/PMC12372469/>
- Leaderboard review: <https://onlinelibrary.wiley.com/doi/full/10.1111/jcal.13077>
- Gamification meta-analysis: <https://link.springer.com/article/10.1007/s11423-023-10337-7>
- Web Push and iOS Home Screen web apps: <https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers>
- Notifications permissions and mobile service-worker behavior: <https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API>
- Cloudflare Pages static deployment and preview builds: <https://developers.cloudflare.com/pages/framework-guides/deploy-anything/>
- Cloudflare Pages Functions for server-side routes/auth: <https://developers.cloudflare.com/pages/functions/>
- Wrangler configuration as Worker deployment source of truth: <https://developers.cloudflare.com/workers/wrangler/configuration/>
- React state snapshots and render purity: <https://react.dev/learn/state-as-a-snapshot>, <https://react.dev/learn/keeping-components-pure>
- React state identity/keys and Hook call-order rules: <https://react.dev/learn/preserving-and-resetting-state>, <https://react.dev/reference/rules/rules-of-hooks>
- Supabase Auth/RLS/security: <https://supabase.com/docs/guides/auth>, <https://supabase.com/docs/guides/database/postgres/row-level-security>, <https://supabase.com/docs/guides/database/secure-data>
- MongoDB Atlas authorization and App Services/Data API end-of-life: <https://www.mongodb.com/docs/atlas/architecture/current/auth/>, <https://www.mongodb.com/docs/atlas/app-services/data-api/generated-endpoints/>

Raw logs and future screenshots belong under dated evidence subfolders; do not replace this index with a chat summary.

## P0 implementation evidence — 2026-08-18

- `50-Evidence/p0-implementation-2026-08-18.md` records the local P0 artifact, focused test/build/audit results, preview HTTP checks, and known limits.
- Smoke gate receipts: `20260818T113106Z-9f60086f` (baseline) and `20260818T115414Z-97ae183e` (P0 artifact, 6/6 pass).
- `10-Resources/RESOURCE_ADOPTIONS.json` records `ts-fsrs@5.4.1` as adopted for the P0 scheduler adapter after focused gates; field retention/transfer value remains unproven.
- Owner-pasted source attachment hashes: English `9361901e173589bf8de726ecf9cf9ccfc58c5e025bb2851c119c53b9950764da` and React `3b10d1df1491e0eabab13b9be6c3ec9fa3f442a57338d32b0425174600618245`; machine-readable provenance is `content/sources/source_manifest.json`, with derived summaries and draft cards under `content/sources/` and `content/drafts/`.
- `50-Evidence/source-capture-and-backend-review-2026-08-18.md` records the source transformation, Supabase-vs-MongoDB decision, current verification commands, and the npm advisory endpoint limitation.
- `50-Evidence/free-tier-deployment-review-2026-08-18.md` records the owner-set USD 0/month constraint, official free-tier limits checked on 2026-08-18, authorization boundary, and rollback.

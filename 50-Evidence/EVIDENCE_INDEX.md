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
- `50-Evidence/draft-review-2026-08-18.md` records the Codex AI pre-review of the 10 owner-source draft cards; Human approval is still pending and no draft was promoted.
- `50-Evidence/browser-gate-2026-08-18.md` records the Playwright/Chrome production-preview contract: 4/4 pass; cumulative smoke receipt `20260818T160750Z-dc5f8f07` passed 10/10 after adding the core curriculum contract.
- `50-Evidence/core-curriculum-2026-08-18.md` records the 20 English + 10 React principle-ladder starter cards; all remain draft pending Human review.
- `50-Evidence/supabase-foundation-2026-08-20.md` records the migration/RLS/client boundary, owner-only provisioning gate, and final cumulative smoke run `20260820T160059Z-7e8c38d1` (11/11); no project or credentials were created here.

## UI refinement evidence — 2026-08-22

- src/App.tsx removes implementation-facing study labels and implements the virtual universal root plus hover/focus/tap branch detail.
- src/styles.css adds the phone-first tree layers, selected-node state, horizontal mobile branch scrolling, and detail panel styling.
- e2e/p0.spec.ts locks the removed copy, the new textarea placeholder, universal-root visibility, branch selection, and the accessible table parity.
- Unit tests and production build passed before the final cumulative smoke receipt is recorded below.
- Cumulative receipt: 20260822T094710Z-43bdbf75 passed 11/11, including the updated 5-test browser contract.

## Human visual review and graph refinement — 2026-08-22

- Human screenshot review rejected the first sparse, left-aligned layer-card layout.
- The replacement in src/App.tsx uses a UI-only universal root, descendant progress aggregation, an SVG-backed graph stage, solid part_of links, dashed prerequisite links, and keyboard/tap/hover selection.
- The replacement in src/styles.css keeps the existing Twogether paper/coral/blue visual language while giving the map a centered hierarchy, progress meters, compact legend, and mobile overflow behavior.
- A local CLOVER pathfinding image was inspected as conceptual inspiration only; no repository, image asset, diagram library, or dependency was added.
- e2e/p0.spec.ts now asserts the graph stage and four connector paths for the current fixture in addition to branch selection and accessible table parity.
- Final cumulative receipt: 20260822T094710Z-43bdbf75 passed 11/11, including the updated graph connector contract.

## English Generative Core v1 — 2026-08-25

- `50-Evidence/english-generative-core-v1-2026-08-25.md` records owner authorization, the fuller English capture hash, the 80-English + 10-unchanged-React contract, content qualifications, review-only UI boundary, focused tests, cumulative receipt, Human gate, and rollback.
- `60-Decisions/ADR-0011-english-generative-core-v1.md` owns the ten-module decision and explicitly keeps Supabase, identity, scheduling, streak, notification, deployment, and publication behavior outside scope.
- The active content path is `content/drafts/core-curriculum-drafts-v2.json`; the v1 packet and old Luna prompt are retained as superseded history.

## Owner-approved English Core publication — 2026-08-26

- `50-Evidence/english-core-published-migration-2026-08-26.md` records Hiệp's exact 80-card approval, ten published decks, v1→v2 localStorage migrations, hidden legacy fixtures with preserved history, PWA cache bump, dynamic DAG layout, focused checks, rollback, and cross-browser boundary.
- `content/reviews/english-generative-core-v1-owner-approval-2026-08-26.json` is the machine-readable Human approval manifest; ADR-0012 owns the publication/migration decision.
- Final cumulative receipt `20260826T012122Z-c82afaf6` passed 11/11, including the exact publication checker and 10-test Chrome contract.

## Learning support, zoomable map, and sync design — 2026-08-31

- `50-Evidence/learning-support-map-and-sync-review-2026-08-31.md` records the 80-record AI-draft support overlay, 25-term structured glossary, React Flow map viewport, stale-streak correction, external repo/license review, and the still-proposed cross-device pairing design.
- ADR-0013 accepts the scaffold/glossary shell while keeping exact support wording unreviewed; ADR-0014 accepts the lazy `@xyflow/react@12.11.5` renderer; ADR-0015 keeps remote pairing/RLS/streak activation behind a separate Human identity choice.
- Final cumulative receipt `20260831T154931Z-083172f9` passed 12/12; 25/25 unit tests, 11/11 Chrome tests, production build, and dependency audit also passed.

## Transfer answers, paired-sync implementation, and Empower A2 — 2026-09-01

- `50-Evidence/paired-sync-and-transfer-answers-2026-09-01.md` records the 80 worked transfer answers, anonymous device-pairing implementation, server-derived streak design, exact 80-card Supabase seed, safe local import and unresolved remote DNS blocker.
- `50-Evidence/empower-a2-coursebook-review-2026-09-01.md` records visual inspection of 176/176 coursebook pages, the 81-card review packet, Human checkbox/merge boundary and durable English Core anchoring.
- ADR-0016 replaces active secondary questions with worked transfer answers. ADR-0017 records Empower A2 as a long-term FSRS branch, not a disposable exam deck.
- Final cumulative receipt `20260901T052017Z-936f280c` passed 14/14; unit tests 26/26, Playwright/Chrome 12/12 and production build passed.

# P0 implementation evidence — 2026-08-18

## Scope

Local P0 study slice from the handoff. No remote account, Supabase project, Cloudflare deployment, push subscription, or production data binding was created.

## Implemented artifact

- React + TypeScript + Vite phone-first SPA/PWA.
- Two allowlisted local demo learners with separate browser storage state.
- 12 project-owned fixture cards with provenance; none claim to come from Claude.
- Required attempt before reveal, optional bounded hint, model answer, mechanism, misconception, transfer cue, and visible `Nhớ`/`Quên` outcomes.
- `ts-fsrs@5.4.1` adapter with 0.90 desired retention, preserved `learning_steps`, append-only local review events, idempotency keys, and mature-card lapse history.
- Bounded repair policy: 2 intervening cards and at most 3 repair appearances in one session.
- DAG-like map with visual rendering and keyboard/table alternative.
- Installable shell assets: manifest, icons, service worker shell cache only; push remains disabled.
- Local development adapter boundary recorded in `60-Decisions/ADR-0006-persistence-path.md`; production path selected as Supabase Auth/Postgres/RLS but not connected.

## Observed gates

```text
npm test -- --run
Test Files 3 passed (3)
Tests 7 passed (7)

npm run build
vite v7.3.6 ... built successfully

python tools/run_gates.py --tier smoke
[PASS] foundation.start-here-exists
[PASS] foundation.memory-routing
[PASS] foundation.standard-adoption
[PASS] foundation.resource-records
[PASS] content.flashcard-contract
[PASS] app.p0-artifact-contract
Gate run 20260818T115414Z-97ae183e: pass

After final code and project-memory updates, the cumulative smoke receipt was `20260818T120011Z-87403451: pass`; the memory audit scanned 28 Markdown files with no errors. The codebase knowledge graph was refreshed with 427 nodes and 512 edges.

npm audit --audit-level=high
found 0 vulnerabilities

Preview HTTP checks
/ 200
/manifest.webmanifest 200
/sw.js 200
```

## Known limits

- Local browser storage simulates the adapter contract; it is not server-side RLS. Supabase positive/negative authorization tests remain required.
- No Playwright/browser interaction gate has been added yet; the static accessibility hooks and preview response checks are not a substitute for keyboard/focus Human review.
- The two Claude sources remain blocked/unavailable and no source-derived cards are allowed.
- Cloudflare deployment and the seven-day Human pilot are still pending owner-approved follow-up work.

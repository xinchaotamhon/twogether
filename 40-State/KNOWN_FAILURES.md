---
last_verified: 2026-08-18
verified_by: Codex read-only inception pass
status: active
---

# Known Failures and Risks

## CF-001 — Claude snapshot blocked by security verification

- Symptom: public share shell loads, but the snapshot API/browser returns a Cloudflare challenge instead of conversation JSON.
- Impact: source-derived English groups and principle cards cannot be validated.
- Reproduction: open either URL from `docs/CLAUDE_SOURCE_STATUS.md` in the current non-authenticated runtime.
- Root cause: access condition/rate-limiting is unknown; do not claim a deeper cause.
- Disposition: direct URL failure remains contained; owner-pasted captures now unblock draft derivation, while raw attachments remain outside the repository.
- Regression gate: `source.provenance-not-invented` (content gate to add when imports exist).

## R-002 — Same-session “repeat until remembered” can become brute-force cramming

- Risk: immediate repetitions may inflate completion and weaken spacing.
- Control: interleave 2–4 cards, cap repair appearances, label unresolved cards, and return successful recalls to FSRS history.
- Revisit trigger: real study-week retention and learner burden evidence.

## R-003 — Sibling leaderboard can turn learning into social comparison

- Risk: rank rewards volume, not transfer or durable recall, and a missed day can shame a learner.
- Control: default cooperative goal, personal mastery, opt-in comparison only after Human review; never reset knowledge state with streak.
- Revisit trigger: both learners report that the comparison improves rather than harms practice.

## ENV-001 — Windows npm wrapper resolves to a missing user-prefix CLI

- Symptom: the `npm` shim resolves its prefix to `C:\Users\vhiep\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js`, which is unavailable in this runtime.
- Impact: plain `npm test`/`npm run build` cannot be used for verification here; the project itself is unaffected.
- Workaround: invoke the bundled CLI explicitly through `C:\Program Files\nodejs\node.exe` and `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`.
- Disposition: contained; do not change global user configuration from the project. Cloudflare's clean build environment should use its own npm installation.
- Evidence: `50-Evidence/source-capture-and-backend-review-2026-08-18.md`.

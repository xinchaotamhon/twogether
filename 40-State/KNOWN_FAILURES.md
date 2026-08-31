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

## GATE-001 — Generic secret scan rejected Supabase dependency prose

- Symptom: the first post-Supabase smoke run failed `app.p0-artifact-contract` because the bundled dependency contained the ordinary word “secret”.
- Impact: the artifact gate was too broad and produced a false failure; no credential was found in the bundle.
- Root cause: the scan treated generic vocabulary as a secret indicator instead of matching secret-bearing names or bearer values.
- Disposition: fixed by narrowing the regex in `tools/check_app_artifact.py`; the next cumulative run passed 11/11.
- Regression gate: `app.p0-artifact-contract` remains required and now checks the narrower, actionable patterns.

## R-004 — Browser-local history does not synchronize

- Risk: a learner opening Twogether in a different browser/device sees different review history and streak.
- Control: keep the UI truthful; do not claim sync from `.env.local`. ADR-0015 proposes one-time device pairing, RLS membership, idempotent event outbox, and server-derived streak.
- Required choice: one learner per browser/OS profile, or add a PIN/passkey/login factor for a shared browser.

## R-005 — AI scaffold wording is not Human-approved

- Risk: a secondary answer may accidentally reveal the main retrieval target or a glossary definition may be misleading.
- Control: all 80 records retain `ai_draft_unreviewed`; preview is explicit and browser-local, while card IDs, main answers, and FSRS remain unchanged.
- Revisit trigger: Hiệp approves the exact packet or reports revisions from real study.

## EXT-001 — One requested reference repository is unavailable

- Symptom: `https://github.com/jKrieger/FlashCardLearning` returned 404 on 2026-08-31.
- Control: no claims, code, or license assumptions were taken from it. Revisit only with an exact accessible repository identity.

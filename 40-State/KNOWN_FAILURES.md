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
- Disposition: contained; request an owner export or an authenticated future capture.
- Regression gate: `source.provenance-not-invented` (content gate to add when imports exist).

## R-002 — Same-session “repeat until remembered” can become brute-force cramming

- Risk: immediate repetitions may inflate completion and weaken spacing.
- Control: interleave 2–4 cards, cap repair appearances, label unresolved cards, and return successful recalls to FSRS history.
- Revisit trigger: real study-week retention and learner burden evidence.

## R-003 — Sibling leaderboard can turn learning into social comparison

- Risk: rank rewards volume, not transfer or durable recall, and a missed day can shame a learner.
- Control: default cooperative goal, personal mastery, opt-in comparison only after Human review; never reset knowledge state with streak.
- Revisit trigger: both learners report that the comparison improves rather than harms practice.

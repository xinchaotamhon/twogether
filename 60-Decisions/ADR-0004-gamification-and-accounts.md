# ADR-0004 — Private accounts with cooperative motivation by default

- Status: accepted for P0
- Date: 2026-08-18
- Decision owner: Hiệp (project owner)

## Decision

Use two allowlisted accounts with RLS-isolated review state. Show personal mastery, a forgiving consistency calendar, and a cooperative sibling goal. Do not ship a zero-sum leaderboard in P0. Any later opt-in comparison must be bounded, tie-safe, and based on durable/transfer evidence rather than raw card volume.

## Reason

The reviewed education literature indicates gamification can improve motivation but has limited direct competency evidence; leaderboard effects depend on design and can intensify social comparison. The project’s accepted outcome is learning, so activity proxies must remain secondary.

## Gate and rollback

Test cross-account read/write denial, private-note isolation, pause/rest behavior, and score invariants. Hide the motivation layer behind a feature flag if learner feedback shows pressure or proxy gaming; preserve all review data.

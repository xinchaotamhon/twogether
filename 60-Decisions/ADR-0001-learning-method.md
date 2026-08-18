# ADR-0001 — Open-ended retrieval with FSRS-6 and bounded repair

- Status: accepted for P0
- Date: 2026-08-18
- Decision owner: Hiệp (project owner)

## Context

The desired behavior is “try to remember first; when forgotten, repair until a real recall succeeds; when remembered, space future reviews.” Multiple-choice would reward recognition and make it hard to tell whether a learner can produce an explanation.

## Decision

Use open-ended prompts, a required attempt before reveal, two honest buttons (`Nhớ`/`Quên`), FSRS-6 under the hood, and a bounded same-session repair queue. Preserve mature-card review history rather than hard-resetting after a lapse.

## Alternatives rejected

- Fixed expanding intervals: simple but ignores individual memory history and lapse evidence.
- Full four-button FSRS UI: more expressive but adds grading ambiguity for two beginners; keep the scheduler extensible while exposing two buttons initially.
- Blind hard reset on lapse: matches “from the beginning” literally but throws away useful history and can create unnecessary workload.

## Gate and rollback

Focused tests must cover new/learning/review/lapse transitions, honest mapping, repair cap, timezone, duplicate event, and restore. Roll back the scheduler adapter without deleting review events.

## Evidence

See `docs/LEARNING_ALGORITHM.md` and the FSRS/Anki sources in `50-Evidence/EVIDENCE_INDEX.md`.

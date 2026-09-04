# Learning Algorithm Decision

## Temporary session override — 2026-09-04

`VITE_STUDY_MODE=session` is currently the default. It does not call the FSRS scheduler, persist review/run events, calculate streak or initialize Supabase. `Quên` adds the current card ID to `twogether.session.forgotten.<learner>.<collection>` and `Nhớ` removes it; this list survives refresh in the same tab only. After one pass, `Ôn lại … câu Quên` creates a finite pass over only that list; remembered cards leave the next repair pass. Free navigation and shuffle are exploration controls and never manufacture completion. The FSRS design below is retained intact for explicit later reactivation with `VITE_STUDY_MODE=fsrs`.

## Decision

Use FSRS-6 through the TypeScript `ts-fsrs` scheduler once its exact package version and lockfile are pinned. Set an initial desired retention of `0.90`, keep the value configurable per learner, and record review events so parameters can be revisited only after enough history. The official Anki guidance describes 90% as a workload/retention balance and warns that workload rises sharply above 90–97% ([Anki deck options](https://docs.ankiweb.net/deck-options)); FSRS models difficulty, stability, and retrievability ([FSRS algorithm](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)).

The UI intentionally exposes two honest outcomes:

- `Nhớ` → FSRS `Good` (the learner recalled the answer, even if effortful).
- `Quên` → FSRS `Again` (the learner did not recall it; never use `Hard` to mean forgotten).

The official TypeScript package is a scheduler toolkit, supports browser-compatible module formats, and documents applying a final rating only after the answer attempt ([ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)). It is a candidate until the project pins and gates it.

## State transition

```text
new -> attempt -> reveal -> Nhớ -> FSRS learning/review
new -> attempt -> reveal -> Quên -> repair queue -> successful Nhớ -> FSRS
review -> Quên -> repair queue -> successful Nhớ -> FSRS using review history
```

The repair queue is not a second scheduler. It is a user-facing containment loop so the learner can recover the idea now:

- Reinsert a failed card after 2–4 intervening cards, not immediately.
- Cap same-session repair appearances (default 3) and show “tạm dừng để não nghỉ” rather than looping forever.
- After a successful recall, schedule normally with the card’s existing FSRS state. Do not hard-reset a mature card to day zero; that destroys evidence and can create unnecessary workload.
- A card still failed at the cap remains due soon and is labeled `cần củng cố`, never marked complete.

Glossary dialogs and the collapsed worked transfer answer are comprehension scaffolds, not review outcomes. Opening or closing them does not create a review event, advance the run, qualify a streak, or alter FSRS state. The learner must still confirm an attempt before the main answer appears.

This is a deliberate compromise with the request to review from the beginning: the learner sees the concept again until one honest recall succeeds, while the scheduler retains history. Anki’s documented learning-step behavior also sends `Again` back to the first step and recommends short same-day steps under FSRS ([learning/relearning steps](https://docs.ankiweb.net/deck-options)).

## Queue policy

- Reviews due today come before new cards.
- Start with at most 5 new cards per learner per day and a configurable review cap; raise only when a real week shows the workload is sustainable.
- If overdue reviews accumulate, pause new-card introduction until the backlog is manageable.
- Randomize within a concept branch enough to prevent rote order, but keep prerequisites and repair cards visible.
- Store timezone-aware due timestamps and the original event timestamp; never silently reinterpret a missed day.

## What the algorithm cannot prove

FSRS predicts recall from review history. It cannot prove conceptual understanding, pronunciation, transfer, honesty of self-grading, or that a principle map is correct. Those need card design and Human field checks.

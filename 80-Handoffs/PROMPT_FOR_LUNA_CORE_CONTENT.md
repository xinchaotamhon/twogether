# Superseded prompt for Luna — core curriculum expansion

Status: superseded on 2026-08-25 by `content/drafts/core-curriculum-drafts-v2.json` and `ADR-0011`. Do not execute the old 20-English-card expansion task. Continue from `START_HERE.md`, review the active ten modules one at a time, and keep all 80 English + 10 React cards draft until Human decisions are recorded.

You are continuing the Twogether project. Read `START_HERE.md` and its entire read order before editing. The owner is Hiệp; the second learner is Hoàng.

## Owner intent

The learner wants “học một hiểu mười”: study the generative principle first, then derive mechanisms, boundaries, and finally accumulate branch/exception knowledge. Do not turn this into a vocabulary dump or a list of React APIs. The core study interaction is open recall, an attempt before reveal, self-grade with only `Nhớ`/`Quên`, and FSRS scheduling.

## Current content

- Owner-pasted source provenance: `content/sources/source_manifest.json`.
- Source summaries: `content/sources/claude-english-owner-capture-2026-08-18.md` and `content/sources/claude-react-owner-capture-2026-08-18.md`.
- Existing 10-card source bundle: `content/drafts/claude-owner-source-drafts-v1.json`.
- New 30-card core starter: `content/drafts/core-curriculum-drafts-v1.json`.
- Curriculum rationale: `content/sources/core-curriculum-synthesis-v1.md`.

## Required behavior

1. Keep all new cards as `draft` until Hiệp or Hoàng gives Human approval. AI pre-review is not Human sign-off.
2. Preserve `source_refs`, node IDs, prerequisites, misconception, boundary/transfer cue, author, and reviewer fields.
3. For every principle, keep the order `principle → mechanism → boundary → transfer` where applicable.
4. Reject cards that ask for recognition, have multiple unrelated retrieval targets, or hide an unbounded essay behind a binary grade.
5. Separate public React behavior from Fiber/reconciler implementation explanations. Mark version-sensitive internals explicitly.
6. Separate productive English rules from lexicalized exceptions and fixed collocations. Never imply that every phrase is derivable.
7. Do not replace the 12 P0 fixture cards or publish source cards until Human review is recorded.
8. After any content/schema change, run the existing smoke gates plus the core-curriculum gate. Do not weaken an older gate to make the new cards pass.

## Next bounded task

Review the 30-card starter with the owner, record accept/revise/reject per card in a dated evidence packet, then promote only accepted cards through `draft → review → published`. Ask one high-leverage question if needed: learner level and daily time budget determine whether examples should be beginner, intermediate, or programmer-technical. Do not implement the full infinite branch set; build the next prerequisite bundle only after the first week of real recall data.

## Definition of done

The core file remains provenance-aware, all cards are schema-valid, counts are 20 English + 10 React, every card is still draft or has explicit Human review, cumulative gates pass, and the evidence packet makes it possible for another AI to continue without chat history.

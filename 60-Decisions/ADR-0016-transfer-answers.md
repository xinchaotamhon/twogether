# ADR-0016 — Worked answers for transfer prompts

- Status: accepted for implementation; exact AI wording remains visibly attributable
- Date: 2026-09-01
- Decision owner: Hiệp

## Context and decision

The learner can understand the main explanation yet still be unsure how to answer `THỬ CHUYỂN SANG TÌNH HUỐNG MỚI`. A secondary question does not solve that problem. Each of the 80 English Core cards therefore receives an optional `transfer_answer`: one worked example shown only after the learner has confirmed an attempt and revealed the main answer.

The transfer answer is collapsed behind `Xem lời giải gợi ý`. It is explicitly described as one valid approach, not the only correct wording. Opening it never grades the card and never changes FSRS. Glossary chips remain available before and after reveal.

## Provenance, objection, and alternative

The 80 answers live in `content/drafts/english-core-transfer-answers-v1.json`, derived from the owner-approved English Core packet. They are AI-authored at the owner's request and carry `owner_requested_visible_draft`; this does not falsely claim line-by-line Human review. The main risk is passive reading, so the answer stays behind a deliberate disclosure after the required attempt. Always-visible answers and multiple-choice transfer were rejected because they weaken retrieval and generation.

## Gates and rollback

The contract checks exact 80-card coverage, unique IDs, non-empty answers, glossary resolution, attempt-before-reveal, and absence of the old secondary-question control in the active study UI. Rollback hides only `transfer_answer`; card IDs, approved content, reviews, glossary and FSRS state remain unchanged.

# ADR-0013 — Scaffold questions and a structured glossary

- Status: superseded in part by ADR-0016; glossary remains accepted, secondary questions are inactive
- Date: 2026-08-31
- Decision owner: Hiệp approved continued implementation on 2026-08-31; exact support wording still awaits Human review

## Context and accepted outcome

Some English Core prompts use terms or wording that can block understanding before recall begins. The learner needs a secondary question and its own answer to clarify the task, plus definitions for terms such as `finite` and `non-finite`, without turning the helper into a shortcut to the main answer.

## Proposal

Add optional `scaffold_prompt`, `scaffold_answer`, and `glossary_refs` fields to `Card`. The study order is main prompt → optional scaffold prompt → optional scaffold answer → confirmed attempt → main answer → only `Nhớ` or `Quên`. Opening support never changes FSRS.

Glossary terms use stable IDs in a shared registry and open through keyboard/touch accessible dialog controls. Card packets and CRUD preserve the optional fields. AI-generated support stays in a provenance-bearing review packet and is not merged into the published 80-card runtime until explicit Human approval.

## Objection, alternative, and cost

The strongest objection is that a secondary answer can reveal the retrieval target. Each support answer must explain the operation requested by the prompt, not supply `model_answer`. A generic hint was rejected because it cannot resolve card-specific wording. Runtime cost is local only and USD 0.

## Gates and rollback

Focused tests cover support packet cardinality/references, packet round-trip, scaffold-before-main-reveal, glossary keyboard/dialog behavior, and legacy cards without support. Cumulative gates remain required. Rollback removes the optional UI and support overlay without changing card IDs, review events, or the approved source packet.

## Supersession note — 2026-09-01

Hiệp clarified that the missing support is not a second question. It is a worked answer for `THỬ CHUYỂN SANG TÌNH HUỐNG MỚI`. The runtime no longer renders the scaffold question/answer fields. Their old provenance packet remains historical evidence only; the structured glossary remains active.

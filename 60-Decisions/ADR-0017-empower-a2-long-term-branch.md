# ADR-0017 — Empower A2 as a durable learning branch

- Status: accepted for review-first implementation
- Date: 2026-09-01
- Decision owner: Hiệp

## Decision

The Empower A2 coursebook is not a disposable exam-cram deck. It becomes a durable branch of the learner's English knowledge: FSRS continues scheduling accepted cards after the exam, while exam relevance only changes which cards should be learned first.

Three AI agents visually inspected all 176 PDF pages in ranges 1–60, 61–120 and 121–176. The combined packet contains 81 newly worded cards covering grammar, vocabulary, pronunciation and functional language. Every card retains PDF-page provenance, a generative prompt, explanation, misconception, transfer task and worked transfer answer. The packet does not copy long textbook passages or exercise answers.

## Review and graph placement

AI output remains `review`, not Human-approved. In the card library, the checkbox means `Đánh dấu cần bỏ/sửa`; default is unflagged. A deliberate Human click merges only unflagged cards. Each candidate anchors to the existing English Core node of its first valid prerequisite instead of creating an isolated exam tree, so course topics reinforce the generative core and remain available for long-term review.

## Objection, gate, and rollback

Eighty-one cards at once can overload a learner. The collection may contain all approved cards, but the FSRS due policy and future exam-priority slicing must limit daily load rather than deleting durable knowledge. Gates require 176-page inspection evidence, 81 unique review cards, non-empty source pages/transfer answers, no automatic publication, and browser proof that flagged cards are excluded from merge. Rollback removes the review panel or collection while preserving the source packet and any existing review history by stable card ID.

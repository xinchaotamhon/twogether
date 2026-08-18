# Start Here — Twogether Learning Project

Twogether is a private, two-learner flashcard PWA for Hiệp and Hoàng. Its purpose is durable understanding: recall an idea without choices, explain the mechanism, notice its boundary, and transfer it to a new example. Activity, XP, streaks, and card counts are supporting signals only.

This file is stable navigation. Do not put current test totals, temporary blockers, active versions, or session conclusions here.

## Read order

1. [Project principles](00-Governance/PROJECT_PRINCIPLES.md)
2. [Information policy](00-Governance/INFORMATION_POLICY.md)
3. [Standard adoption](00-Governance/STANDARD_ADOPTION.md)
4. [Product contract](docs/PRODUCT_SPEC.md)
5. [Learning algorithm](docs/LEARNING_ALGORITHM.md)
6. [Knowledge graph](docs/KNOWLEDGE_GRAPH.md)
7. [Architecture](docs/ARCHITECTURE.md)
8. [Card authoring contract](docs/CONTENT_AUTHORING.md)
9. [Claude source status](docs/CLAUDE_SOURCE_STATUS.md)
10. [Adopted resources](10-Resources/RESOURCE_ADOPTIONS.json)
11. [Resource workflow](10-Resources/README.md)
12. [Current state](40-State/CURRENT_STATE.md)
13. [Known failures](40-State/KNOWN_FAILURES.md)
14. [Resource candidates](40-State/RESOURCE_CANDIDATES.json)
15. [Next actions](40-State/NEXT_ACTIONS.md)
16. [Evidence index](50-Evidence/EVIDENCE_INDEX.md)
17. [Gate registry](gates/gates.json)
18. [ADR template](60-Decisions/ADR_TEMPLATE.md)
19. [Next AI handoff](80-Handoffs/NEXT_AI_PROMPT.md)

Routine continuation is self-contained here; the Vault is only needed to discover or adopt a new resource or deliberately upgrade the owner standard. If sources conflict, prefer reproducible runtime evidence, current code/schema, accepted decisions, then current state; treat chat and memory as leads.

## Stable boundaries

- Two named accounts are separate learners. Review state, streaks, preferences, and private notes never cross accounts unless a future feature explicitly says so.
- Card content is shared project knowledge; each learner owns a separate review history.
- The default study interaction is open-ended recall followed by self-grading. Do not turn the core path into multiple-choice.
- A concept map is a prerequisite DAG rendered as a tree-like map. It is a learning aid, not a claim that English or principles have one perfect taxonomy.
- FSRS-6 schedules durable reviews. A lapse enters a short repair loop, then returns to FSRS; it does not erase history by blindly resetting a card.
- PWA/offline shell is part of the MVP. Push notifications are opt-in Phase 2, after the study loop works and HTTPS/backend delivery is verified.
- Never claim the two Claude share URLs were read unless their text is actually captured and checked. Their current status is owned by `docs/CLAUDE_SOURCE_STATUS.md`.

## When adding a flashcard

Read `docs/CONTENT_AUTHORING.md`. For the current principle-first curriculum, also read `content/sources/core-curriculum-synthesis-v1.md`, `content/drafts/core-curriculum-drafts-v1.json`, and `80-Handoffs/PROMPT_FOR_LUNA_CORE_CONTENT.md`. Place each card in the content source format, assign a concept node and prerequisites, include a model answer plus a boundary or transfer cue, and run the content/schema gates. Do not invent missing source material. Preserve provenance and mark uncertain claims for Human review; the core starter is 20 English + 10 React draft cards, not an exhaustive claim about either subject.

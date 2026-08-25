# ADR-0011: English Generative Core v1 as an 80-card reviewed draft curriculum

- Status: accepted
- Date: 2026-08-25
- Decision owner: Hiệp
- Scope: English curriculum source, review-only integration, knowledge DAG, and content gates

## Context

The existing core bundle contains 20 English and 10 React draft cards. It is a useful starter but omits noun reference, clause expansion, information flow, a sufficiently bounded sound/listening model, and an integration/production path. Several English cards also preserve oversimplifications from the first owner capture: a `3 × 4 = 12 tenses` taxonomy is treated too literally, `past simple` is described too narrowly, `go → goes` is placed too close to lexical irregularity, and stress timing needs a clearer evidence boundary.

On 2026-08-25 the owner supplied a fuller `claude.md` capture and explicitly authorized an English Generative Core v1 of 80 cards following the accepted ten-module plan. The raw capture remains outside the repository; only its hash and a non-verbatim derived summary may be stored.

Baseline before this decision:

- Git `main` and `origin/main` both pointed to `b0e7b3e` with a clean working tree.
- Unit tests passed 16/16 and the production build passed.
- Cumulative smoke run `20260825T142006Z-f8f456ff` passed 11/11.
- The runtime used the local Hiệp/Hoàng picker; Supabase was inactive even though `.env.local` contained the two public Vite configuration variables.

## Decision

- Preserve the 10 React starter cards unchanged and replace the English starter contract with exactly 80 English draft cards.
- Preserve stable IDs `core-en-01` through `core-en-20` while revising their content; add `core-en-21` through `core-en-80`.
- Divide English Core v1 into ten reviewable collections of eight cards each:
  1. Meaning → Clause
  2. Verb Architecture
  3. Negation & Questions
  4. Time, Aspect & Modality
  5. Noun & Reference
  6. Expanding the Clause
  7. Information Flow
  8. Sound & Listening
  9. Lexicon as a Network
  10. Integration & Production
- Each collection contains the same balanced card-family sequence: one core recall, two mechanism cards, one contrast, one boundary, one application, one production, and one integrating production/transfer card.
- Keep every new or revised curriculum card, node, and collection at `draft`; AI generation is not Human approval. Integrate the ten collections into the local card-review library, but do not expose them as study decks until their cards are explicitly reviewed and published.
- Keep the concept model as a DAG with multiple legitimate prerequisites. The active learning map may preview draft curriculum nodes, but draft status must remain visible and progress must not imply mastery.
- Store the fuller owner capture as provenance only: raw bytes remain outside Git, a SHA-256 and byte count enter `source_manifest.json`, and a non-verbatim derived summary resolves the previously unknown fifth pillar as high-frequency vocabulary/chunks.
- Use a project-owned source synthesis to qualify the owner-source claims with academic grammar, speech-rhythm, vocabulary-coverage, phrasal-verb, collocation, retrieval, and spacing evidence.
- Do not activate Supabase, change identity, publish cards, deploy, add notifications, or alter FSRS/repair/streak semantics in this change.

## Alternatives considered

- **Append 80 cards to the existing 20 English cards:** rejected because it would create 100 English cards with duplicated retrieval targets and preserve known inaccuracies.
- **Publish all 80 immediately because the owner authorized creation:** rejected because creation authority is not a claim that every model answer has received Human semantic review.
- **Keep the bundle only as a JSON file:** rejected because the owner needs an in-app, eight-card-at-a-time review path and another AI needs a deterministic integration contract.
- **Turn the ten collections into active study decks immediately:** rejected because draft cards have no learner state and could bypass provenance/Human review.
- **Model English as a strict tree:** rejected because tense, auxiliaries, reference, information flow, sound, and lexical patterns have multiple legitimate dependencies.

## Consequences and risks

- The source bundle grows substantially, so deterministic checks must protect exact counts, IDs, collection membership, one-target card structure, source references, draft status, and DAG acyclicity.
- Academic descriptions are still models, not the language itself. Cards must name boundaries and avoid treating a pedagogical grid, rhythm class, frequency threshold, or phrasal-verb pattern as universal.
- A large draft library can overwhelm review. The UI therefore defaults to one eight-card collection at a time rather than rendering all 80 as an undifferentiated list.
- Existing local card revisions override the static draft with the same stable ID. Rollback must not delete learner-created revisions or review history.

## Focused gate and cumulative gates

- Extend `content.core-curriculum-contract` to require exactly 80 English + 10 React drafts, ten English collections of eight unique cards, stable English IDs, balanced card families, provenance, non-empty boundaries/transfers, and an acyclic graph.
- Extend `content.owner-source-capture` for the third immutable-outside-repository capture and its derived summary.
- Extend the browser contract to prove ten review collections are visible, a collection shows eight cards, drafts are not added to the study shelf, and answer-before-reveal remains intact.
- Run unit tests, production build, every enabled cumulative smoke gate, project-memory audit, and `git diff --check` on the same final artifact.

## Rollback

Revert the curriculum source, source-manifest addition, review-library integration, gate changes, and documentation to the pre-change commit. Static curriculum removal must not clear `twogether.workspace.p0.v1`, learner review storage, local card revisions, streak events, or graph additions. The 2026-08-25 raw owner capture remains outside the repository regardless of rollback.

## Evidence

- Baseline cumulative receipt: `20260825T142006Z-f8f456ff`
- Baseline unit result: 16/16 passed
- Baseline production build: passed
- Final evidence owner: `50-Evidence/english-generative-core-v1-2026-08-25.md`

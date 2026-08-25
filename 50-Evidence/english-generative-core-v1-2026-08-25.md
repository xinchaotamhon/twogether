# English Generative Core v1 — implementation evidence

- Date: 2026-08-25
- Owner authorization: Hiệp explicitly approved “English Generative Core v1 80 thẻ” and asked Codex to continue implementation with delegated help where useful.
- Decision: `60-Decisions/ADR-0011-english-generative-core-v1.md`
- Active packet: `content/drafts/core-curriculum-drafts-v2.json`
- Promotion status: all curriculum content remains `draft`; no Human semantic sign-off is claimed.

## Baseline and scope

Before the change, `main` and `origin/main` pointed to `b0e7b3e`; unit tests passed 16/16, production build passed, and cumulative receipt `20260825T142006Z-f8f456ff` passed 11/11. The active app was the local Hiệp/Hoàng picker. Supabase was not activated and is still outside this curriculum scope.

ADR-0011 replaced the bounded 20-English-card starter contract with ten reviewable English modules of eight cards. The ten React starter cards, their five nodes, and four edges were preserved unchanged as JSON values from v1. The older v1 packet remains historical provenance.

## Source and content controls

- Fuller owner English capture manifest: SHA-256 `ee9768a5d65003e078e1f3a7f56f2f94e2acad29d15e1bd2abd3415627658c1d`; raw bytes remain outside Git.
- Non-verbatim capture: `content/sources/claude-english-owner-capture-2026-08-25.md`.
- Academic/source boundary map: `content/sources/english-generative-core-sources-v1.md`.
- Curriculum synthesis: `content/sources/core-curriculum-synthesis-v2.md`.
- Exact packet contract: 80 English + 10 React cards; English IDs `core-en-01..80`; 10 collections × 8; family order `core_recall, mechanism, mechanism, contrast, boundary, application, production, production`; all cards/nodes/collections draft; DAG acyclic.

The English review corrected or bounded the earlier simplifications: a 12-cell pedagogical grid is not the language ontology; tense/aspect/modality and future constructions are separated; past morphology has remoteness uses; `go→goes` is distinguished from lexical irregularity such as `have→has`; rhythm labels are heuristics; vocabulary coverage has no magical 800–1000/80% promise; and phrasal verbs/collocations retain conventional boundaries.

Codex read all 80 English prompts and model answers grouped by module after generation and made four final wording/analysis corrections: finite `be` is no longer mislabeled as an auxiliary in copular examples, speech segmentation wording was repaired, and the frequency/coverage answer was clarified. This is AI quality review, not Human approval.

## Runtime boundary

`src/curriculumDrafts.ts` validates and exposes only the English draft modules to the `Thẻ` review area. The packet is not merged into `COLLECTION_FIXTURES`, `listCollections`, due-card selection, FSRS state, or streak qualification. “Đưa vào chỉnh sửa” fills the existing local CRUD editor; the learner must still save/review/publish explicitly. Unit and browser tests lock this boundary.

## Verification before cumulative run

- `python tools/check_english_core_v1.py`: pass.
- Unit tests: 18/18 pass across 7 files, including the new two-test draft/study boundary.
- Production build: pass; 45 modules transformed.
- Playwright against production preview in real Chrome: 9/9 pass, including ten visible module tabs, eight cards per selected module, edit handoff, and absence from the study shelf.
- Supabase, identity, FSRS, repair, streak, PWA notification policy, and deployment behavior were not changed.

FINAL_CUMULATIVE_RECEIPT: `20260825T152811Z-76a211fa` — 11/11 required gates passed, including the updated owner-source capture, 80-card curriculum contract, unchanged Supabase/deployment contracts, and 9-test browser gate.

## Human gate and rollback

A green automated result does not establish pedagogical fit or learning. Hiệp should review one eight-card module at a time and record accept/revise/reject. Rollback removes the static packet/review UI/gate/docs without deleting `twogether.workspace.p0.v1`, learner review history, local card revisions, streak events, or graph additions.

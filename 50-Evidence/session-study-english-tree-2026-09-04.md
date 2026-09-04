# Session-only study and completed English tree — 2026-09-04

## Authorized outcome

Hiệp requested a reversible temporary study mode with Supabase, FSRS and streak inactive; centered non-scrolling flip cards; free deck navigation and shuffle; a genuinely branching bottom-root tree; glossary help throughout all visible card regions; removal of the visible misconception block; and immediate publication of non-vocabulary English knowledge while retaining review for new vocabulary.

## Baseline

- Checkpoint: `aa939fd`.
- Unit tests: 29/29 passed on 2026-09-04.
- Production build passed on 2026-09-04.
- Screenshot `C:/Users/vhiep/OneDrive/Pictures/Screenshots/Screenshot 2026-09-03 094908.png` showed the right-aligned scrolling study panel and a fixed black toast covering grading controls.

## Content boundary

- Immutable source: `content/drafts/empower-a2-coursebook-final-review-v1.json`.
- SHA-256: `d6488abe34c4416e32ca1cd3ce9a16e97765d22a8cbdc5e31349c4dcf41e1af5`.
- Owner-approved non-vocabulary scope: 74 cards.
- Vocabulary-focus cards retained as draft: 7 cards.
- The source packet is not edited; publication is derived through the approval record.

## Earlier implementation checkpoint

- Runtime defaults to `VITE_STUDY_MODE=session`; the app bypasses Supabase client creation, FSRS scheduling, run qualification and streak rendering. Only learner/deck-scoped forgotten IDs use `sessionStorage`. A completed pass offers a finite repair pass over exactly those IDs.
- Study is one centered, fixed-height question/answer frame over a darkened and blurred map. Previous/next, pointer drag/swipe, arbitrary range jump, shuffle, answer/back flip, two answer tabs and return-to-question are implemented. The fixed black toast is absent.
- Known glossary terms remain in source wording and open in-place explanations from prompt, model answer, mechanism explanation, transfer prompt and transfer answer wherever those terms occur. The visible misconception region is absent while its data remains preserved.
- The tree projection uses a deterministic spanning skeleton from the full DAG. Visual inspection at 1440×900 confirmed one bottom root with multiple upward branches, fitted zoom controls, no sidebar, and study centered over the map. Visual inspection at 390×844 confirmed the question and transfer faces remain inside one screen without face/document scrolling.
- English runtime: 89 Core + 74 Empower knowledge = 163 published cards. Seven Empower vocabulary cards remain draft. Six repeated Core transfer scenarios use the versioned novelty override.
- The card library exposes edit/archive controls for all 74 published Empower cards and any individually approved vocabulary; pending vocabulary remains only in its seven-item review panel.
- The service-worker shell cache is `twogether-shell-v3`, forcing deployed clients to discard the old shell cache while preserving private data outside it.

## Earlier checkpoint verification

- Unit: 31/31 passed across 12 files.
- Production build: passed; Vite reports a non-blocking main-chunk size warning because the source-linked coursebook content is bundled eagerly.
- Browser/installed Chrome: 16/16 passed, including answer-before-reveal, glossary dialogs, wrong-only repair round, learner separation, no local FSRS writes, direct tree study, centered non-scrolling desktop/phone cards, drag, jump, shuffle, vocabulary-only review and PWA cache.
- Dependency audit: 0 vulnerabilities.
- Final cumulative smoke receipt: `20260904T035308Z-e1d2a45c`, 16/16 required gates passed. Browser receipt inside it: 16/16 tests passed.
- `git diff --check`: passed; Windows line-ending notices are informational.

An earlier cumulative run failed only because the publication checker still expected the intentionally superseded cache name `twogether-shell-v2`; the checker was corrected to v3 and the complete cumulative run then passed. No expected product result was weakened.

## Remaining truth boundary

This artifact does not prove live Supabase/RLS, cross-device progress, durable spacing, streak behavior or language mastery because Hiệp explicitly disabled those runtime paths for now. Reactivation requires `VITE_STUDY_MODE=fsrs` and the older remote security gates. Session wrong-card data disappears when its tab/window closes by design.

## Fresh audit and continuation corrections

- Two independent agents reviewed code and beginner/content UX. Code review found no default-session blocker and identified dormant-mode/migration risks; the terminology-writing agent then stopped at its usage limit without writing a partial file. The main agent completed the glossary locally; this is AI-authored support, not an additional Human language review.
- Expanded the novelty revision to 30 exact Core IDs and added one Empower school-to-library transfer-answer correction. Raw approved/source packets retain their original hashes and review state.
- Added all 238 unique declared Empower glossary labels plus 33 supplemental Core labels, preserving original 25 Core definitions. Exact source-label coverage is checked; unknown declared labels now throw instead of disappearing. Whole-word matching and longest-label priority have rendering tests.
- Removed the historical v1 support overlay from active study. Paired audited revisions now enter through base cards before workspace overrides, so v2 answers and Human edits remain authoritative in both study and library.
- Repaired the dormant local adapter's missing state for newly published vocabulary, preserved mapped glossary refs on vocabulary approval, retired only the superseded system collection ID, and removed invalid/stale IDs from temporary wrong-card lists.
- Expanded browser checks to prove no Supabase requests in session mode, completion of the wrong-only repair pass, vocabulary glossary preservation, and longest-Core content fitting at 360×640 and 1366×768. The smaller viewport exposed an overly high initial fit zoom; lowering it makes distant branches reachable without page scrolling.
- Intermediate browser failures were test setup errors (missing JSON import attributes; asking for a session-status element after the finished screen replaced it) and the real small-phone map-fit defect above. Assertions now inspect the actual stored wrong list and use supported JSON imports; the learning invariant was not weakened.

### Final continuation verification

- `npm test`: 40/40 passed in 15 files.
- `npm run test:e2e`: 19/19 passed in installed Chrome, including longest-Core content on 360×640 and 1366×768.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `python tools/run_gates.py --tier smoke`: receipt `20260904T091348Z-3ca7d59c`, 16/16 required gates passed, including a fresh build and all 19 Chrome tests on that artifact.
- Production builds pass with the known non-blocking content-chunk warning (~197 kB gzip for the eagerly bundled main content/UI chunk).
- `python tools/audit_project_memory.py .`: no errors; `git diff --check`: no whitespace errors.
- Visual inspection of `test-results/session-map-1366.png` and `test-results/session-transfer-360.png` confirmed the bottom-root branching overview, unobscured legend, centered frame and readable in-frame transfer content. The browser gate regenerates these ignored local screenshots.

Cloud was neither activated nor changed. Future cloud reactivation additionally requires the additive Empower/vocabulary content migration described in `supabase/README.md`; merely toggling an environment variable cannot make the old cloud seed current.

# Empower A2 long-term learning review — 2026-09-01

## Source inspection

- Owner-provided source: `D:/book/English/CourseBook/D_Empower_2nd_A2_Students_Book.pdf`.
- PDF facts observed locally: 176 A4 pages, AES encrypted, printing allowed, text copy disabled.
- SHA-256: `a2c3fb113bdd9368bc6b9687e2b4cad61b64226dc773a6fdf4fa60f0f24d3d93`.
- Three subagents visually inspected page ranges 1–60, 61–120 and 121–176 using rendered pages/contact sheets with targeted checks of Grammar, Vocabulary, Pronunciation, Functional Language and Review/Focus material. All 176 pages were reported inspected; no unreadable page was reported.
- Temporary render images were not adopted as project content. The consolidated unit analysis and card-level page provenance are retained in `content/drafts/empower-a2-coursebook-final-review-v1.json`.

## Derived content and Human boundary

- 81 unique cards were synthesized in new wording. No long textbook passage, exercise prompt, or answer key was copied.
- Every card has prompt, model answer, mechanism explanation, misconception, transfer prompt, worked transfer answer, source pages and English Core prerequisites.
- The packet remains `review` with `ai_draft_owner_review_required`; this evidence does not claim Human wording approval.
- The UI checkbox means `Đánh dấu cần bỏ/sửa`. Only unflagged cards are merged after a deliberate owner click. Merged cards use stable IDs and form `Empower A2 · Học bền vững`; the exam affects priority, not retention lifetime.
- Cards anchor to existing English Core nodes through prerequisite mapping rather than forming an isolated exam tree.

## Verification

- Coursebook packet contract passed: 176-page fingerprint, 81 unique review-only cards, source pages, transfer answers and graph anchors.
- Unit tests: 26/26 pass.
- Production build: pass with separate card-library, map, FSRS and Supabase chunks.
- Playwright/Chrome: 12/12 pass, including flag-one/merge-rest behavior.
- Cumulative smoke receipt: `20260901T052017Z-936f280c`, 14/14 pass.

Green gates prove artifact behavior and provenance, not that the cards are pedagogically perfect or that either learner has mastered the book.

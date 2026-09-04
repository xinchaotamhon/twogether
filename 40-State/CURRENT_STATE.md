---
last_verified: 2026-09-04
verified_by: Codex session-study and completed-English integration
status: active — session-only study; durable cloud path dormant
---

# Current State

## Active product behavior

- Twogether remains a phone-first React/TypeScript/Vite PWA for Hiệp and Hoàng. The mandatory learning boundary is open recall → `Đã thử` → reveal → only `Nhớ`/`Quên`.
- The deployment now defaults to `VITE_STUDY_MODE=session`. It does not initialize Supabase, call FSRS, persist review/run events, calculate streak or show `Tiến độ`. Existing local/cloud history and the durable implementation remain untouched behind `VITE_STUDY_MODE=fsrs`.
- `Quên` adds a card ID to `twogether.session.forgotten.<learner>.<collection>`; `Nhớ` removes it. At the end of a pass, `Ôn lại … câu Quên` starts a finite repair pass containing only those IDs. This is `sessionStorage`: refresh in the same tab survives, closing the tab/window clears it, and nothing follows another device.
- The tree is the full-screen home. Its visual skeleton branches upward from one bottom root using a deterministic spanning-tree projection of the full DAG. Non-selected legitimate relations remain overlays and remain in the accessible table.
- A deck node opens one centered, fixed-height flip card above a darkened/blurred tree. There is no `Tiếp tục` page, sidebar, checkbox list, card/body scroll or fixed black toast. Previous/next, swipe/drag, range jump and shuffle are available.
- The answer face has `Đáp án & vì sao` and `Tình huống mới`. Known keywords remain intact and clickable in prompt, answer, explanation, transfer prompt and transfer answer. `Dễ nhầm` is hidden but its authored field is preserved.
- `Thẻ` keeps CRUD available for the 74 published Empower cards and any approved vocabulary, so a problem found during study can become a local draft/edit/archive without mutating its source packet.

## Content authority

- English Core v2 remains exactly 89 owner-approved cards in ten variable-size collections. Eighty stable IDs preserve old FSRS state for later durable-mode use; nine bridge IDs remain fresh.
- Empower A2 retains its immutable 81-card, 176-page source packet. Hiệp's fingerprinted 2026-09-04 scope approval publishes exactly 74 non-vocabulary cards into seven existing English principle branches. Seven `coursebook-a2-vocab-*` cards remain draft and appear in the only advance-review panel.
- Total built-in English content is therefore 163 published/studyable cards plus seven vocabulary-review drafts. This is a completed teachable backbone and coursebook layer, not a claim to contain all English.
- Thirty audited Core transfer tasks now use paired runtime revisions with a new analogous situation. One Empower directions answer now matches its school-to-library prompt. These revisions apply at the base-card boundary; historical v1 support cannot overwrite v2 answers or Human edits. Immutable source/approval packets remain unchanged.
- All 238 unique declared Empower terms resolve to structured Vietnamese glossary support, alongside the 25 original Core entries and 33 supplemental Core labels. Precise grammar terms are discovered across all five card regions; everyday vocabulary is linked when declared for that card. Whole-word matching prevents partial-word links. These definitions are AI-authored support, not approval of vocabulary cards.
- Durable content preferences are in `docs/CONTENT_STYLE_HIEP_HOANG.md`; future AIs must preserve technical terms, attach glossary help, keep prose compact and vary transfer situations.

## Dormant cloud path and rollback

- Supabase migrations, device pairing, RLS, idempotent review writes, server-derived streak and import logic remain in the repository but are not active or claimed live in session mode.
- Later reactivation is explicit: deploy with `VITE_STUDY_MODE=fsrs`, choose `VITE_SYNC_MODE=local` for same-browser durable data. Cloud first needs an additive content migration for the 74 Empower cards and approved vocabulary, then `CONNECT_SUPABASE.bat` and real two-profile security tests; its current seed still contains only the older 89-Core checkpoint.
- Never clear localStorage, delete Supabase events or mutate old FSRS state when switching modes.
- Budget remains USD 0/month; Cloudflare Free + Supabase Free only, with no paid upgrade authorized.

## Immediate Human path

1. Deploy and study the 163 published cards in session mode.
2. In `Thẻ`, approve only vocabulary cards that are suitable; each approval makes the pending vocabulary deck studyable.
3. Record confusing wording during real use as a versioned correction; do not change immutable source packets.
4. Reactivate FSRS/Supabase/streak only when Hiệp explicitly wants durable cross-device progress again.

## Evidence boundary

Read `60-Decisions/ADR-0021-session-study-and-english-tree.md` and `50-Evidence/session-study-english-tree-2026-09-04.md`. Green local/static tests prove the current artifact contract, not live remote Supabase security or language mastery.

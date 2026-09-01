# Twogether

Phone-first learning PWA for Hiệp and Hoàng: open-ended recall, required attempt before reveal, `Nhớ`/`Quên`, FSRS scheduling, bounded repair, durable streak motivation, a zoomable knowledge DAG and learner-authored cards.

## Run locally

```text
npm install
npm run dev
```

With `VITE_SYNC_MODE=local`, choose Hiệp or Hoàng and use the browser-local fallback. With valid Supabase browser values and cloud mode, each browser profile pairs once to one learner; daily use needs no email or PIN. Do not sign out an anonymous device casually because it has no email recovery.

## Learning content

- English Generative Core v1 remains live as the exact 80-card owner-approved backbone. A beginner-first v2 review packet rewrites those 80 stable IDs and adds 9 bridge cards; it is not published until Hiệp completes the second review in `Thẻ`.
- The default home is the full knowledge tree: universal root at the bottom, domain branches such as English/React above it, pan/zoom/minimap controls, and per-learner collection focus checkboxes.
- Every core card includes glossary help and a worked answer for its transfer task after the mandatory attempt.
- Empower A2 adds 81 long-term learning candidates derived from visual inspection of all 176 coursebook pages. In **Thẻ**, mark weak cards with `Đánh dấu cần bỏ/sửa`; `Gộp … thẻ đạt yêu cầu` takes only unflagged cards into **Empower A2 · Học bền vững**. Until that click, they remain AI draft/review content.
- The exam changes what should be prioritized first, not whether accepted knowledge remains in FSRS afterward.

## Cross-device persistence

The repository includes additive Supabase migrations for anonymous device pairing, learner-membership RLS, idempotent review events, server-validated collection completion, immutable daily qualifications and server-derived streak. Existing local history is backed up and imported only when remote history is empty; the local copy is never deleted.

Remote sync is not currently proven live. The configured Supabase host now resolves and its Auth health endpoint accepts the public key, but the application tables return `404`, so migrations/seed/bootstrap and real two-learner RLS tests are still pending owner authorization. Follow [Supabase setup](supabase/README.md). Set `VITE_SYNC_MODE=local` for safe rollback. Never commit a service-role key, password or pairing code.

## Verification

```text
npm test
npm run build
npm run test:e2e
python tools/run_gates.py --tier smoke
```

Latest verified baseline: 26 unit tests, 12 Chrome tests and 14 cumulative gates pass (`20260901T052017Z-936f280c`). Read `START_HERE.md`, `40-State/CURRENT_STATE.md` and `80-Handoffs/NEXT_AI_PROMPT.md` before changing architecture or content authority.

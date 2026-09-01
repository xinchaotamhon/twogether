# Twogether

Phone-first learning PWA for Hiệp and Hoàng: open-ended recall, required attempt before reveal, `Nhớ`/`Quên`, FSRS scheduling, bounded repair, durable streak motivation, a zoomable knowledge DAG and learner-authored cards.

## Run locally

```text
npm install
npm run dev
```

With `VITE_SYNC_MODE=local`, choose Hiệp or Hoàng and use the browser-local fallback. To activate shared Supabase history on Windows, double-click `CONNECT_SUPABASE.bat`, complete the two dashboard actions it shows, then pair one browser profile per learner. Daily use needs no email or PIN.

## Learning content

- English Generative Core v2 is live as exactly 89 owner-approved cards: 80 beginner-first rewrites retain stable IDs/history and nine bridge cards start fresh.
- The default home is a true one-screen knowledge tree: universal root at the bottom, domain branches above it, no sidebar or checkboxes, and one-click module-to-deck study with pan/zoom/minimap controls.
- Every core card includes glossary help and a worked answer for its transfer task after the mandatory attempt.
- Empower A2 adds 81 long-term learning candidates derived from visual inspection of all 176 coursebook pages. In **Thẻ**, mark weak cards with `Đánh dấu cần bỏ/sửa`; `Gộp … thẻ đạt yêu cầu` takes only unflagged cards into **Empower A2 · Học bền vững**. Until that click, they remain AI draft/review content.
- The exam changes what should be prioritized first, not whether accepted knowledge remains in FSRS afterward.

## Cross-device persistence

The repository includes additive Supabase migrations for anonymous device pairing, learner-membership RLS, idempotent review events, server-validated collection completion, immutable daily qualifications and server-derived streak. Existing local history is backed up and imported only when remote history is empty; the local copy is never deleted.

Remote sync is not claimed live until the owner runs `CONNECT_SUPABASE.bat`, enables anonymous sign-in, executes the prepared SQL and completes real two-profile RLS tests. Follow [Supabase setup](supabase/README.md). Set `VITE_SYNC_MODE=local` for safe rollback. Never commit a service-role key, password or pairing code.

## Verification

```text
npm test
npm run build
npm run test:e2e
python tools/run_gates.py --tier smoke
```

Latest verified baseline: 29 unit tests and 14 Chrome tests pass; the current cumulative receipt is recorded in `40-State/CURRENT_STATE.md` and the latest evidence file. Read `START_HERE.md`, current state and handoff before changing architecture or content authority.

# Twogether

Phone-first learning PWA for Hiệp and Hoàng: open-ended recall, required attempt before reveal, `Nhớ`/`Quên`, a zoomable knowledge DAG and learner-authored cards. The current default is a deliberately temporary session-only study mode; the preserved FSRS/Supabase/streak path can be restored later.

## Run locally

```text
npm install
npm run dev
```

With `VITE_STUDY_MODE=session` (also the fallback when the variable is absent), choose Hiệp or Hoàng and study without Supabase, FSRS or streak. Only IDs marked `Quên` are retained in `sessionStorage`: refresh in the same tab keeps them; closing the tab clears them. Set `VITE_STUDY_MODE=fsrs` later to restore the preserved durable path, then follow [Supabase setup](supabase/README.md).

## Learning content

- English Generative Core v2 is live as exactly 89 owner-approved cards: 80 beginner-first rewrites retain stable IDs/history and nine bridge cards start fresh.
- The default home is a true one-screen knowledge tree: universal root at the bottom, domain branches above it, no sidebar or checkboxes, and one-click module-to-deck study with pan/zoom/minimap controls.
- Every core card includes glossary help and a worked answer for its transfer task after the mandatory attempt.
- Empower A2 adds 81 source-linked cards derived from visual inspection of all 176 coursebook pages. Hiệp approved the 74 non-vocabulary cards as a scope on 2026-09-04; they now enter seven English branches. Only seven `Vocabulary Focus` cards stay in **Thẻ** for one-by-one review.
- The exam changes what should be prioritized first, not whether accepted knowledge remains in FSRS afterward.

## Cross-device persistence

The repository includes additive Supabase migrations for anonymous device pairing, learner-membership RLS, idempotent review events, server-validated collection completion, immutable daily qualifications and server-derived streak. Existing local history is backed up and imported only when remote history is empty; the local copy is never deleted.

Remote sync is dormant while session mode is active and is not claimed live. Before restoring cloud, add an additive content migration for approved Empower/vocabulary cards (the prepared seed still contains only the older 89-Core checkpoint), then follow the activation/pairing and real two-profile RLS gates in [Supabase setup](supabase/README.md). `VITE_STUDY_MODE=fsrs` with `VITE_SYNC_MODE=local` is the same-browser durable fallback. Never commit a service-role key, password or pairing code.

## Verification

```text
npm test
npm run build
npm run test:e2e
python tools/run_gates.py --tier smoke
```

The current verification counts and cumulative receipt are owned by the latest evidence file linked from `40-State/CURRENT_STATE.md`. Read `START_HERE.md`, current state and handoff before changing architecture or content authority.

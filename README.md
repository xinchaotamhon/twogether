# Twogether

Phone-first learning PWA for Hiệp and Hoàng. The P0 keeps the study loop small and honest: open-ended recall, optional secondary-question/glossary help, an attempt before the main reveal, `Nhớ`/`Quên`, FSRS scheduling, a bounded repair queue, a zoomable prerequisite DAG, and learner-scoped local state.

## Run locally

```text
npm install
npm run dev
```

Choose either learner on the first screen. The local preview stores each learner's review history under a separate browser key. It is not production authentication or server synchronization.

## Two learner profiles

The app always opens with a simple learner picker: choose **Hiệp** or **Hoàng** and start studying. There is no email, password, PIN, or login screen in the current P0. Review history remains separate inside the browser for the selected profile. Cloudflare can host this static PWA without a backend.

## Supabase (optional future sync)

The Supabase schema, RLS policies, seed, and adapter are kept as a future sync path, but `.env.local` does not turn on a login screen. Do not create Auth users or add learner emails for the current profile-only P0. If cloud synchronization is requested later, record a separate product decision for the identity flow before enabling remote review state. Never commit a service-role key or learner password.

## Gates

```text
npm test
npm run build
npm run test:e2e
```

The project smoke registry also checks project memory, card provenance, the PWA shell, accessibility hooks, and no-secret artifact rules. See `START_HERE.md` for the full continuation order and `80-Handoffs/NEXT_AI_PROMPT.md` for the bounded next task.

English Generative Core v1 is live as ten owner-approved decks of eight cards. Its immutable draft/provenance packet remains under `content/drafts/`, while the exact approval manifest under `content/reviews/` drives runtime publication. Existing browsers migrate without clearing localStorage: the 12 old fixture cards disappear from active study/map, but review events, card states, streak inputs, runs, local drafts, revisions, and learner-created collections are preserved. Read `START_HERE.md` and `docs/CURRICULUM_EXPANSION_ROADMAP.md` before adding pronunciation, vocabulary, comparison, React, or another subject.

The card library contains an explicit browser-local preview for 80 AI-draft secondary questions and a structured glossary. Preview does not approve that wording and never changes FSRS. The map uses a lazy React Flow viewport for pan, wheel/pinch zoom, and fit controls while keeping the DAG data and keyboard-accessible table project-owned. Cross-device history/streak sync is still inactive; read ADR-0015 before any Supabase activation.

If this Windows profile's `npm` shim points at a missing user-prefix installation, run the same scripts through the installed Node CLI shown in `50-Evidence/source-capture-and-backend-review-2026-08-18.md`; do not put that machine-specific workaround into deployment configuration.

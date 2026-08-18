# Twogether

Phone-first learning PWA for Hiệp and Hoàng. The P0 keeps the study loop small and honest: open-ended recall, an attempt before reveal, `Nhớ`/`Quên`, FSRS scheduling, a bounded repair queue, a prerequisite map, and learner-scoped local demo state.

## Run locally

```text
npm install
npm run dev
```

Choose either learner on the first screen. The local preview stores each learner's review history under a separate browser key. It is not production authentication or server synchronization.

## Gates

```text
npm test -- --run
npm run build
```

The project smoke registry also checks project memory, card provenance, the PWA shell, accessibility hooks, and no-secret artifact rules. See `START_HERE.md` for the full continuation order and `80-Handoffs/NEXT_AI_PROMPT.md` for the bounded next task.

The 12 cards under `content/cards.json` remain explicitly project-owned fixtures. The owner-pasted Claude captures are summarized under `content/sources/`, with 10 derived cards held safely in `content/drafts/` for Human review; they are not loaded into the runtime yet. The separate principle-first starter at `content/drafts/core-curriculum-drafts-v1.json` contains 20 English + 10 React draft cards, linked as a prerequisite DAG. It is a bounded backbone for review, not an exhaustive claim that every English or React topic has been covered. Continue it with `80-Handoffs/PROMPT_FOR_LUNA_CORE_CONTENT.md` and read `START_HERE.md` first.

If this Windows profile's `npm` shim points at a missing user-prefix installation, run the same scripts through the installed Node CLI shown in `50-Evidence/source-capture-and-backend-review-2026-08-18.md`; do not put that machine-specific workaround into deployment configuration.

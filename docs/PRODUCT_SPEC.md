# Product Contract

## Intended outcome

Hiệp and Hoàng should build durable English understanding from first principles, then expand into branches. A successful first slice lets either learner answer a fresh prompt in their own words, explain why, identify a boundary or counterexample, and apply the idea to a new situation more reliably after a week—not merely finish a lesson or recognize a choice.

The owner-pasted Claude captures now supply two draft source layers: English foundations and React principles. Their direct share URLs remain inaccessible to this runtime, so the app must use the hashed owner captures and keep derived cards in `draft`/`review` until Human approval. See `docs/CLAUDE_SOURCE_STATUS.md`.

## MVP scope

- Two allowlisted accounts: Hiệp and Hoàng.
- Shared concept map and card content; isolated review state, streak, settings, and private notes.
- Open-ended prompt → optional card-specific scaffold/glossary → learner attempt → reveal model answer/explanation → `Nhớ` or `Quên`.
- FSRS-6 scheduling with a same-session repair loop for `Quên`.
- Add/edit/archive cards with provenance, concept node, prerequisites, card type, model answer, misconception, and transfer cue.
- Map view showing trunk, branches, prerequisites, due cards, and durable mastery.
- Home view led by the full-screen knowledge map, with today’s due/focus collections, a calm progress signal, and a personal or cooperative goal.
- Installable PWA shell, responsive phone-first UI, offline read-only shell and safe local queue for the current session.

## Explicit non-goals for MVP

- No multiple-choice as the core assessment.
- No public registration, social feed, chat, or global leaderboard.
- No AI-generated card publication without Human review.
- No promise that a perfect “tree” captures the whole English language or all principles.
- No push notifications until the opt-in, HTTPS, server delivery, and unsubscribe path are tested.
- No automatic scoring of nuanced free-text answers; self-grade remains explicit unless a later reviewed evaluator is added.
- Cloudflare deployment is a target constraint, not part of this local planning pass. The first release must pass the deployment and no-secret gates described in `docs/ARCHITECTURE.md`; custom domains and push delivery can follow after the study loop is proven.

## Study loop

1. Select a due card from the learner’s queue, prioritizing overdue reviews before new cards.
2. Show the prompt and concept breadcrumb. If the learner is blocked by the wording, allow an optional card-specific secondary question, its separate answer, and clickable glossary terms; none may reveal the main answer or count as an attempt.
3. Require an attempt action (`Đã thử`) before reveal. The attempt may be mental, spoken, typed, or written privately; the app records only the attempt kind by default.
4. Reveal a concise model answer, why it works, a common misconception, and an example or counterexample.
5. Learner presses `Nhớ` or `Quên`.
6. `Quên` moves to the repair queue and is shown again after intervening cards, with a bounded cap per session. `Nhớ` passes the result to FSRS.
7. Show the next due interval in plain language, never as a promise of certainty.

## Card families

Each important concept should be represented by a small bundle, not one overloaded card:

- Core recall: “Explain X in your own words.”
- Mechanism: “Why does X produce Y?”
- Contrast: “How is X different from its nearest confusion?”
- Boundary: “When would X fail or not apply?”
- Application: “Given this new situation, what would you do and why?”
- Production: “Use the idea to produce a sentence, explanation, or action.”

The author may choose fewer cards for a tiny concept, but must not hide a definition-only card behind a mastery percentage.

## Progress and motivation

The primary progress signal is durable mastery by concept and branch: cards with sufficient FSRS stability and current predicted recall, plus recent transfer-card performance. Supporting signals are due queue completion, study minutes, and a consistency calendar.

Use a personal streak with a forgiving rest/recovery state. For siblings, default to a cooperative weekly goal (both contribute to growing the same map). If an opt-in comparison is later added, rank consistency or mastery bands with a tie-safe display, never raw total cards or repeated repair attempts. Never reset learning progress because a streak broke.

## Acceptance evidence

- Machine-verifiable: account isolation, scheduler transitions, idempotent review writes, map prerequisites, keyboard/focus behavior, schema and PWA manifest.
- Human-observable: answer-first effort, comprehensible feedback, perceived usefulness, motivation without shame, and ability to explain/apply a fresh prompt.
- Mixed: weekly retention/transfer review paired with a short Human reflection by each learner.

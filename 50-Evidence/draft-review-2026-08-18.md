# Draft review packet — owner-pasted source cards — 2026-08-18

- Bundle: `content/drafts/claude-owner-source-drafts-v1.json`
- Review type: Codex AI pre-review
- Status: `needs_human_review`; this packet is not Human approval and does not promote any card
- Raw attachments: remain outside the repository; provenance is owned by `content/sources/source_manifest.json`

## Structural result

- 10 cards and 10 draft nodes are present.
- Every card has a stable ID, node, card type, prompt, model answer, explanation, misconception, transfer cue, prerequisite list, source reference, `draft` status, author, and null reviewer.
- The unresolved fifth English pillar is not invented.
- React cards separate public rules from implementation explanations; Fiber is explicitly framed as an internal mechanism.

## Card-by-card pre-review

| Card | Preliminary disposition | Human check before promotion |
| --- | --- | --- |
| `claude-en-root-01` | Keep as draft | Confirm “gốc/cành lá” wording and whether `play → played` / `go → went` is suitable for the learner level. |
| `claude-en-tense-01` | Keep as draft | Confirm the two-axis explanation is bounded enough and does not imply every tense use is mechanically predictable. |
| `claude-en-past-01` | Keep as draft | Confirm the regular/irregular distinction and add a learner-appropriate counterexample if needed. |
| `claude-en-phonology-01` | Keep as draft with caution | Check the stress-timing/schwa claim, remove any overgeneralization about Vietnamese, and keep shadowing as a practice suggestion rather than a guaranteed outcome. |
| `claude-en-lexical-01` | Keep as draft | Confirm collocation/phrasal-verb examples and choose concrete examples before publishing. |
| `claude-react-root-01` | Keep as draft | Confirm the snapshot wording matches the intended React version and public learning goal. |
| `claude-react-reconcile-01` | Keep as draft with caution | Separate stable public behavior from implementation heuristics; verify the key/reorder example against the selected React documentation. |
| `claude-react-purity-01` | Keep as draft | Confirm the event-handler/effect boundary and the `Date.now` example are understandable at the chosen level. |
| `claude-react-hooks-01` | Keep as draft | Keep call-order as the public invariant; do not require learners to know internal storage details. |
| `claude-react-fiber-01` | Keep as draft with caution | Mark Fiber, interruptibility, and double buffering as implementation context that may change; do not make them a prerequisite for ordinary React work. |

## Required owner decision

Hiệp or Hoàng must confirm learner level, acceptable examples, public-vs-internal React scope, and whether each card is ready for `review`/`published`. Until that happens, keep the fixture cards in the P0 runtime and keep this bundle unchanged as a draft source artifact.

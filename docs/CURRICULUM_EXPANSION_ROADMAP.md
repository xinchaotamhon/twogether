---
last_verified: 2026-09-04
verified_by: Codex session-study and Empower integration
status: active design — future cards still require Human approval
---

# Curriculum Expansion Roadmap

## Honest completeness claim

English Generative Core v2 is a complete **foundation backbone**, not “all of English”. Its 89 approved beginner-first cards cover ten connected mechanisms: meaning-to-clause, verb architecture, negation/questions, time/aspect/modality, noun/reference, clause expansion, information flow, sound/listening, lexicon networks, and integrated production.

That is enough to support “học 1 hiểu 10” at the principle level: a new construction should have a place to attach and a mechanism to compare against. It is not enough to claim complete vocabulary, pronunciation feedback, idiom/register knowledge, genre/pragmatics, dialect variation, or fluent production. Those are growing branches and feedback loops, not a finite checklist.

Use this maturity ladder when describing coverage:

1. **Backbone** — the generative principles and their prerequisites exist.
2. **Mechanisms and boundaries** — the learner can explain why a form works and when the rule fails.
3. **Transfer** — the learner can produce or diagnose a fresh example.
4. **Fluency and feedback** — recall works under listening/speaking pressure and errors create targeted repairs.
5. **Breadth** — vocabulary, constructions, registers, accents, and domains expand over real use.

English Core v2 deliberately targets levels 1–3. A seven-day pilot must decide which level-4/5 branch comes next.

Current English runtime coverage is 163 published cards: 89 owner-approved English Core cards plus 74 owner-scope-approved, source-linked Empower A2 knowledge cards. Seven Empower vocabulary cards remain in review. This increases teachable examples and coursebook coverage; it does not change the honest claim that the Core is a backbone rather than “all English.”

## How the knowledge DAG grows

- “Bản chất chung” is a virtual universal root. Every subject with no prerequisite parent becomes an entry branch automatically.
- A node may have several prerequisites. Never force one irreversible parent merely to make the picture look like a tree.
- Layout depth is derived from prerequisite/part-of edges, not from a fixed `root/trunk/branch/leaf` label. Adding or moving an edge may therefore reposition a whole branch without changing card history.
- Cross-subject analogy uses `applies_to` or `contrasts_with`; it must not create a fake prerequisite. React does not require English, even though both may share general ideas such as state, identity, boundary, and transformation.
- New AI-generated content enters as draft with source references. Human approval publishes a version; editing it later creates a new draft revision and never erases review events. A Human may approve an exact, fingerprinted scope (as with the 74 non-vocabulary Empower cards), but exclusions and counts must remain machine-checkable.

## Pronunciation and IPA: integrate first, isolate only the minimum

Do not begin by memorizing the entire IPA chart as detached symbols. IPA is a compact label for a sound distinction; hearing and producing the distinction is the learning target. The International Phonetic Association’s official chart separates consonants, vowels, and suprasegmentals, which supports three related but distinct branches: segment identity, word/syllable realization, and prominence/intonation.

Recommended first branch: **English Sound & Word Form v1**, anchored to `Sound & Listening` and cross-linked to `Lexicon as a Network`.

- Minimal-pair listening: hear A/B, retrieve the word/meaning, then reveal IPA and audio provenance.
- Articulation mechanism: place/manner/voicing for a small high-impact set of contrasts relevant to Hiệp/Hoàng.
- Vowel map: mouth position and a known word anchor; IPA remains the label, not the answer by itself.
- Stress, reduction, linking, segmentation, and intonation: use short audio/context prompts, because isolated phonemes do not explain connected speech.
- Word cards use several retrieval views from one lexeme record: meaning → word, audio → word/meaning, context → production, and pronunciation diagnosis. Do not duplicate the lexical truth into unrelated cards.

Future lexeme data should hold `lemma`, `senses`, `word_family`, `collocations`, `register`, `dialect`, `ipa_variants`, `audio_refs`, and example provenance. Audio is never embedded or generated without a traceable source/license.

## Vocabulary: learn a network, not a bilingual list

Add vocabulary in small frequency/use-driven batches after the core pilot. Each word should attach to:

- a meaning/sense node;
- a word family or construction;
- one or more collocations/chunks;
- pronunciation variants and audio;
- at least one fresh production context.

Spaced retrieval remains appropriate, but mere repeated exposure is not enough. Research reviews of adult L2 vocabulary training support retrieval plus spacing while noting that optimal spacing and repetition count depend on the task. Therefore keep FSRS per card, use bounded same-session repair after `Quên`, and use varied contexts rather than grinding the same cue indefinitely.

## Comparative and superlative branch

Recommended bounded deck: **Comparison as a Scale v1**, 12–16 cards after Human review. It should attach primarily to `Meaning → Clause`, `Noun & Reference`, `Expanding the Clause`, `Information Flow`, and `Lexicon as a Network`.

The generative core is not “add `-er`/`-est`”:

1. A gradable property creates a scale: height, speed, cost, interest.
2. A comparative locates one referent relative to a comparison standard: `A is taller than B`.
3. A superlative selects an extreme member inside a contextually defined set: `A is the tallest in the group`.
4. English chooses a form strategy (`-er/-est`, `more/most`, or a lexical irregular such as `better/best`). This choice is partly phonological/lexical, not a universal meaning rule.
5. Determiners and complements finish the construction (`the`, `than`, `in/of`), while discourse determines what comparison set is understood.

Card families should include form choice, `than` and comparison-set boundaries, irregulars, equality/inequality (`as…as`, `less/least`), changing degree (`bigger and bigger`), correlated change (`the more…, the more…`), error diagnosis, and fresh production. British Council’s reference confirms these common constructions; examples in Twogether should still be newly authored and source-traceable.

## React as the next subject trunk

After the English pilot is stable, build **React Generative Core v1** as a separate entry branch under “Bản chất chung”. Preserve the existing ten React draft cards as source history; expand/review them rather than auto-publishing them.

Suggested principle order, based on current official React documentation:

1. UI as a function/projection of data and state.
2. Component boundaries and composition.
3. Props and one-way data flow.
4. Minimal state and a single owner/source of truth.
5. Render/commit and component purity.
6. Events versus Effects; Effects synchronize with external systems.
7. State identity, position, keys, preservation, and reset.
8. Reducers/context for scaling state transitions and ownership.
9. Refs and escape hatches.
10. Integration: model a real screen, diagnose state/effect bugs, and transfer the principles into code.

React cards should ask for predictions, explanations, bug diagnosis, state ownership decisions, and small code production—not API trivia or multiple choice. The official React docs emphasize minimal state, one-way data flow, state ownership, purity, and Effects as external synchronization; these form the trunk from which hooks and library details can grow.

## Cross-browser progress and identity

The safe fallback adapter remains `localStorage`: it survives a deploy in one browser but does not follow the learner elsewhere. The Supabase adapter and pairing schema are implemented; remote authority still requires owner dashboard activation and real two-profile RLS tests.

The current temporary session mode is intentionally even shorter-lived: only wrong-card IDs use `sessionStorage`, refresh in the same tab preserves them, and closing the tab clears them. It is not cross-browser persistence and does not use FSRS or streak. This temporary override ends only when Hiệp explicitly switches the deployment to `VITE_STUDY_MODE=fsrs`.

Supabase provides shared content plus per-learner remote progress only after remote activation and security gates. Choosing “Hiệp” or “Hoàng” alone is not secure authentication; anyone with the URL could impersonate either learner. The implemented compromise keeps daily use simple:

- a browser profile signs in anonymously and pairs once to Hiệp or Hoàng with an expiring one-use code;
- a paired device can generate another short-lived code for a new phone/profile;
- the browser stores only a revocable session, and Supabase RLS scopes progress to the authenticated identity;
- export/rollback is tested before remote sync becomes authoritative.

If the owner refuses every form of pairing/recovery, cross-browser sync can only be treated as low-privacy family data, not a securely isolated account system. `.env.local` containing a Supabase URL/key does not activate this path by itself.

## Promotion gates for every future branch

1. Source capture/provenance is recorded; raw private chat remains outside Git.
2. AI draft passes schema, uniqueness, natural-language, DAG, and misconception/boundary checks.
3. Hiệp explicitly accepts/revises/rejects the bounded deck.
4. Runtime publication has a versioned manifest and a migration that preserves learner history.
5. Unit, build, Chrome, accessibility/map, and cumulative gates pass.
6. A short pilot supplies observed failures before expanding breadth.

## Sources consulted

- International Phonetic Association, official chart archive: <https://www.internationalphoneticassociation.org/content/ipa-chart-archive>
- British Council, comparative and superlative adjectives: <https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives>
- React, “Thinking in React”: <https://react.dev/learn/thinking-in-react>
- React, “Sharing State Between Components”: <https://react.dev/learn/sharing-state-between-components>
- React, “Synchronizing with Effects”: <https://react.dev/learn/synchronizing-with-effects>
- React, “Preserving and Resetting State”: <https://react.dev/learn/preserving-and-resetting-state>
- Cambridge review of adult second-language vocabulary training: <https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/review-of-laboratory-studies-of-adult-second-language-vocabulary-training/18F0A5D1FFC829CE05931B2EEE83124A>

---
last_verified: 2026-08-31
verified_by: Codex support/map implementation and cross-device design review
status: active
---

# Next Actions

1. **Human-review the support preview while learning** — enable “Dùng thử lớp hỗ trợ” in `Thẻ`, note any secondary answer that leaks the main answer or any glossary explanation that remains unclear, then explicitly approve or request revisions. Preview is browser-local and does not affect FSRS.
2. **Deploy and run a seven-day English Core pilot** — Hiệp and Hoàng complete any one deck per day for streak qualification and record confusing prompts, dishonest self-grades, weak transfer, or excessive workload. Existing local history must survive deploy without clearing storage.
3. **Choose one bounded English branch from observed need** — likely `Comparison as a Scale v1` (12–16 cards), `English Sound & Word Form v1`, or a small high-frequency lexicon batch. Read `docs/CURRICULUM_EXPANSION_ROADMAP.md`; do not publish an AI-generated branch without a new Human approval manifest.
4. **Decide the cross-device identity rule before Supabase activation** — recommended: one learner per browser/OS profile, then one-time short-lived device pairing. If one browser must securely hold both learners, choose a PIN/passkey/login factor. ADR-0015 remains proposed until this Human choice, backup/dry-run, and real RLS/conflict gates pass.
5. **Build React only after the English pilot is stable** — use the existing ten React drafts as source history and expand them into a separate React Generative Core trunk based on official React principles. Do not mix English review state with React content publication.

Do not spend money, request notification permission, erase local history, or weaken learner isolation to accelerate any step.

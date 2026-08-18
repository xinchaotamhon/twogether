---
last_verified: 2026-08-18
verified_by: Codex inception pass
status: active
---

# Next Actions

1. **Capture source content** — one owner-approved export/paste for each Claude URL; gate: provenance and transformation manifest; rollback: keep the original capture untouched and discard only derived drafts.
2. **Build the P0 study slice** — two-account auth, one shared node, 12 reviewed cards, open-ended review, FSRS transitions, and per-user state; gate: cumulative smoke + scheduler/RLS focused tests; rollback: revert the release and preserve review events.
3. **Prepare the Cloudflare artifact** — choose one backend path (Supabase or Workers/D1), add environment/secrets boundaries, Git-connected Pages/Worker config, preview isolation, `/health`, no-secret scan, and deployment smoke tests; gate: every item in the Cloudflare section of `docs/ARCHITECTURE.md`; rollback: previous deployment plus reversible migration.
4. **Run a real seven-day pilot** — Hiệp and Hoàng record retention, transfer attempts, workload, and friction; gate: Human-observable pilot report; rollback: disable optional gamification/notifications without deleting learning history.

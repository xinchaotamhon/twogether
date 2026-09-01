---
last_verified: 2026-09-01
verified_by: Codex owner-approved v2/fullscreen-direct-map implementation
status: active — local behavior verified; remote Supabase activation awaits owner dashboard gestures
---

# Current State

## Verified facts

- Twogether is a phone-first React/TypeScript/Vite PWA for Hiệp and Hoàng. The study loop remains open recall → required `Đã thử` → reveal → only `Nhớ`/`Quên`, mapped to FSRS `Good`/`Again`, with bounded repair.
- Hiệp explicitly approved all 89 cards in `content/drafts/english-core-beginner-revision-v2.json`. The separate Human approval manifest is `content/reviews/english-generative-core-v2-owner-approval-2026-09-01.json`; the source review packet remains immutable provenance.
- English Core v2 is now the official runtime backbone: 80 rewritten cards retain stable IDs and therefore retain existing per-learner FSRS state; nine bridge cards use new IDs and start fresh. The ten collection sizes are 8/9/9/9/9/9/9/9/9/9. Historical 12-card fixtures remain absent from active study without erasing old events.
- Durable authoring preferences live in `docs/CONTENT_STYLE_HIEP_HOANG.md`. Content assumes first exposure, begins with plain Vietnamese and examples, pairs every transfer task with its matching worked answer, explains glossary terms on demand and never imposes a fixed card quota.
- The map is the fixed-height home workspace on desktop and phone. There is no sidebar, focus checkbox or vertical page scroll. A collection-root node contains a real button; one click starts exactly that deck. The tree still grows upward from `Bản chất chung`, uses `part_of` for layout and dashed prerequisite overlays, and retains a screen-reader table.
- The `Thẻ` screen shows English Core v2 once as the official editable curriculum; its obsolete second-review panel and duplicate support banner are no longer rendered. Editing creates a local draft and does not erase the published card or review history.
- Empower A2 remains a separate 81-card long-term review packet derived from visual inspection of all 176 pages. Its checkbox means `Đánh dấu cần bỏ/sửa`; only a Human merge action publishes unflagged cards.
- Supabase cloud implementation includes anonymous session, hashed expiring device pairing, `auth.uid()` membership RLS, idempotent FSRS review RPC, server-validated collection completion, immutable daily qualification, server-derived streak and safe one-time local import.
- `supabase/seed.sql` is regenerated from the exact owner-approved 89-card v2 manifest. `CONNECT_SUPABASE.bat` safely prepares ordered migration/seed/bootstrap SQL from the existing `.env.local`, copies it to the clipboard and opens Auth Providers plus SQL Editor without printing keys.
- Remote activation is not yet claimed: the current Codex browser is not signed into the owner's Supabase dashboard. The owner must enable Anonymous Sign-Ins and run the prepared SQL, then real cross-learner RLS/conflict checks must pass.
- Safe rollback is `VITE_SYNC_MODE=local`; local FSRS, runs and streak inputs remain preserved. Never clear localStorage or delete remote review events to repair sync.
- Verification after this change: 29/29 unit tests, 14/14 Playwright/Chrome tests, production build, dependency audit with 0 vulnerabilities and cumulative smoke receipt `20260901T140031Z-89014eb6` (15/15) pass.
- Budget remains USD 0/month; Cloudflare Free + Supabase Free only, with no paid upgrade authorized.

## Remaining gates

- Owner dashboard gesture: run `CONNECT_SUPABASE.bat`, sign in to Supabase, enable anonymous sign-ins and run the clipboard SQL once. Keep returned pairing codes private.
- Pair one browser profile for Hiệp and one for Hoàng, then run real negative RLS tests: unpaired denial, cross-learner denial, invite expiry/reuse, idempotent retry, same-card conflict and direct streak-write denial.
- Hiệp still reviews the 81 Empower cards. Ten React cards remain source history only; React Generative Core needs its own source/review/approval cycle.

## Evidence

Read `50-Evidence/owner-approved-v2-fullscreen-map-and-supabase-activation-2026-09-01.md`, ADR-0019, the paired-sync evidence and the Empower coursebook evidence. Green local/static gates prove the artifact contract, not live remote RLS until owner activation and two-profile tests occur.

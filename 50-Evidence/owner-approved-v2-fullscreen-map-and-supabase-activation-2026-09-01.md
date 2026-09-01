# Owner-approved English Core v2, fullscreen direct-study map, and Supabase activation path — 2026-09-01

## Authorized outcome

Hiệp explicitly approved the complete 89-card Beginner Core v2 packet, requested the knowledge tree to occupy the home screen without a sidebar or page scrolling, requested one-click node-to-deck learning instead of collection checkboxes, and requested a concrete Supabase connection path.

## Artifact changes

- A separate Human approval manifest names the exact 89 card IDs and ten collection IDs. The AI review packet remains immutable provenance.
- Runtime content and the idempotent Supabase seed now use the approved v2 cards. Eighty stable IDs preserve existing FSRS history; nine bridges initialize normally.
- React Flow collection-root nodes contain real buttons and directly start one collection. The sidebar/focus-list state was removed. A visually hidden table preserves a screen-reader route.
- The map shell is fixed to one viewport on desktop and phone. Pan, zoom, pinch, fit and minimap remain available inside the canvas.
- The active card library no longer renders the obsolete Beginner Core review panel or duplicate support banner; it shows the official 89-card curriculum once and retains draft CRUD.
- `CONNECT_SUPABASE.bat` and its PowerShell helper validate existing browser-safe environment variables without printing them, assemble timestamped migrations + seed + pairing bootstrap, copy SQL to clipboard and open the exact dashboard pages.

## Safety boundary and rollback

The current Codex browser has no authenticated Supabase owner session, so it cannot safely enable Auth settings or execute privileged schema SQL. Those two Human dashboard gestures remain explicit. No service-role key, database password, anon key or pairing code is committed or printed. Roll back frontend authority with `VITE_SYNC_MODE=local`; never delete review/event history.

## Verification

- Publication checker: exact 89 cards and ten collections pass.
- Unit: 29/29 pass.
- Production build: pass.
- Playwright/Chrome: 14/14 pass, including direct node-to-study and phone no-page-scroll checks.
- Dependency audit: 0 vulnerabilities.
- Cumulative smoke receipt: `20260901T140031Z-89014eb6`, 15/15 required gates passed.

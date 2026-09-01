# Inline flashcard study on the map — 2026-09-01

## Outcome

- Removed the `Tiếp tục` primary navigation item and separate study page.
- A deck node starts the unchanged one-collection study run in a scrollable panel over the map. Closing it preserves the map.
- Extra collections sharing a root or lacking one receive virtual collection nodes, so removing the shelf does not make them unreachable.
- Moved the instruction legend from the bottom center to the top-left; the bottom navigation no longer covers it.

## Focused evidence

- Unit and production build checks preserve FSRS, content and storage contracts.
- Playwright covers inline open/close, no study navigation, direct deck choice, legacy collection migration, Empower collection reachability, phone no-page-scroll and legend/navigation non-overlap.
- Browser visual inspection covered a normal desktop viewport and 390×844 phone viewport. Both showed the map behind the study panel and a readable, internally scrollable card.

## Safety and rollback

No card content, learner event, FSRS state, run or daily qualification was deleted or reset. Rollback is commit `516b677`.

## Supabase status clarified

A read-only probe using the configured browser-safe values returned HTTP 200 for `/auth/v1/health` and HTTP 404 for `/rest/v1/cards?select=id&limit=1`. Therefore project reachability and the anon key are valid, but the application schema has not been run. Cross-device FSRS/streak is not live yet.

## Final gates

- Unit tests: 29/29 passed.
- Playwright/Chrome: 14/14 passed.
- Production build passed.
- Dependency audit reported 0 vulnerabilities.
- Cumulative smoke receipt `20260901T142935Z-3cb2e09a` passed 15/15.

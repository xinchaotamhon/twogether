# ADR-0019 — Publish Beginner Core v2, direct-study fullscreen map, and owner-run Supabase activation

- Date: 2026-09-01
- Status: accepted
- Owner authorization: Hiệp explicitly approved all 89 Beginner Core v2 cards, requested a fullscreen home map with direct node-to-study navigation, and requested that Supabase be connected rather than left deferred.

## Assumptions and objections

- The 80 rewritten cards keep their stable IDs, so their per-learner FSRS history must survive the content-version change. The nine bridge cards have new IDs and correctly begin with fresh state.
- Removing the visible deck sidebar must not remove keyboard or screen-reader access. Studyable nodes therefore contain real buttons and the map retains a visually hidden table fallback.
- An anon browser key cannot create trusted tables, policies, RPCs, or pairing codes. Pretending that the frontend alone can finish database activation would be unsafe and false.
- The current Codex browser is not authenticated to the owner's Supabase dashboard, and no management token or database password is stored in the repository.

## Decision

1. Publish exactly the 89 IDs and 10 collections named by the owner approval manifest. Keep the review packet immutable as provenance.
2. Make the map the fixed-height home workspace. Remove the selection sidebar and collection checkboxes. Clicking a collection-root node starts that collection immediately.
3. Regenerate the idempotent Supabase seed from the approved v2 packet.
4. Provide `CONNECT_SUPABASE.bat`, which validates the existing local environment without printing secrets, assembles the ordered migrations/seed/bootstrap SQL, copies it to the clipboard, and opens the exact Auth Providers and SQL Editor pages. The owner performs the two privileged dashboard gestures: enabling anonymous sign-in and running the SQL.

## Alternatives rejected

- Keep v2 in a review-only panel: rejected because the owner approved the entire set.
- Keep a sidebar or multi-deck checkbox list: rejected because the requested interaction is one node click to study one deck.
- Put a service-role key in the app or repository: rejected because it would expose all learner data and bypass RLS.
- Require email or PIN login: rejected because the household flow is device pairing followed by choosing Hiệp or Hoàng only where permitted.

## Cost, gates, and rollback

- Cost: Supabase Free and Cloudflare Free remain sufficient for two learners under normal personal use; a paused free project may require manual resume.
- Gates: exact 89-card manifest, seed generation, unit tests, production build, browser direct-study/fullscreen checks, cumulative smoke gates, and dependency audit.
- Frontend rollback: deploy commit `125381b` or set `VITE_SYNC_MODE=local`.
- Database rollback: do not delete learner review/event rows. The migration and seed are idempotent; disable cloud mode in the frontend if activation fails, then diagnose before any schema reversal.

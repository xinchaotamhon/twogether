# Supabase setup for Twogether

The current P0 intentionally uses a simple shared-device profile picker. The home screen chooses **Hiệp** or **Hoàng**; there is no email, password, PIN, or Supabase Auth login. Review state is stored by the local adapter in the browser. `.env.local` does not activate remote mode in this release.

The files in this folder preserve a future, owner-operated Supabase sync path. Do not provision it just to use the current profile-only app, and do not put credentials in this repository or in an AI prompt. Do not put their passwords in this repository or in a prompt; a service-role key may not be placed in React or a `VITE_*` variable.

## Future owner-only provisioning

Only continue this section after Hiệp explicitly chooses cloud synchronization and records the identity UX as a new decision:

1. Create a Supabase Free project while signed in as the owner.
2. Apply `supabase/migrations/202608200001_initial.sql` in the SQL Editor or with the Supabase CLI.
3. The existing schema assumes authenticated learner identities for server-side RLS. Do not create Auth users or email mappings for the current P0 unless the owner re-enables that path.
4. Run `supabase/seed.sql` to load the 12 published project-owned fixture cards and their four-node map. If fixtures change, regenerate it with `node tools/generate_supabase_seed.mjs`. Never seed the 30-card or 10-card draft bundles before Human review.
5. Keep only the public project URL and publishable/anon key in local or hosting environment configuration. A service-role key may not be placed in React or a `VITE_*` variable.
6. Run the focused Supabase contract and real positive/negative RLS checks only after the remote identity flow has been deliberately restored.

## Rollback

Keep the local adapter as the active fallback. If a future remote pilot is unsafe, remove the remote integration, redeploy the profile-only frontend, and preserve any remote review events. Do not delete review history to repair a scheduler conflict.

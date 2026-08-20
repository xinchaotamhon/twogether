# Supabase setup for Twogether

The application remains local until both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. This repository contains the schema and client path, but it does not contain a project ID, learner email, password, access token, or service-role key.

## Owner-only provisioning

1. Create a Supabase Free project while signed in as the owner.
2. Apply `supabase/migrations/202608200001_initial.sql` in the SQL Editor or with the Supabase CLI.
3. Create exactly two Auth users (email + password) for Hiệp and Hoàng. Do not put their passwords in this repository or in a prompt.
4. In the SQL Editor, insert the two email-to-learner mappings. Use the real emails only in Supabase:

```sql
insert into public.allowed_learners (email, learner_id, display_name)
values
  ('HIỆP_EMAIL_HERE', 'hiep', 'Hiệp'),
  ('HOÀNG_EMAIL_HERE', 'hoang', 'Hoàng');
```

5. Run `supabase/seed.sql` to load the 12 published project-owned fixture cards and their four-node map. If fixtures change, regenerate it with `node tools/generate_supabase_seed.mjs`. Never seed the 30-card or 10-card draft bundles before Human review.
6. Create `.env.local` from `.env.example` with the project URL and publishable/anon key. The key may be exposed to the browser; a service-role key may not.
7. Run the focused Supabase contract and local tests. The real RLS positive/negative checks require the owner’s project and two Auth sessions, so they are deliberately not claimed by local CI.

## Rollback

Keep the local adapter as the fallback. If the first remote pilot is unsafe, unset both Vite variables, redeploy the previous frontend, and preserve the Supabase review events. Do not delete review history to repair a scheduler conflict.

# Supabase setup for Twogether

Twogether uses Supabase Free as the shared source of truth for review events, FSRS state and streak. Daily use has no email or PIN: every browser profile signs in anonymously once and is paired to exactly one learner. A shared computer should use two browser profiles, one for Hiệp and one for Hoàng.

Never put a service-role key, learner password or pairing code in this repository. The browser needs only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SYNC_MODE=cloud`.

## The simple mental model

There are only three pieces:

1. **Cloudflare** serves the website files. It does not own the FSRS history.
2. **Supabase** stores the shared cards plus separate Hiệp and Hoàng review events, FSRS state and streak qualifications.
3. **A paired browser profile** proves which learner's rows that device may read/write. The public anon key only identifies the Supabase project; it is not a password and RLS still rejects another learner's rows.

Pairing happens once per browser profile. After pairing, normal learning needs no email, PIN or repeated code. A new phone/browser profile needs a new one-use pairing code. Using the same physical computer for both learners requires two browser profiles under the current security model.

## Owner-operated activation

The simplest path on Windows is to double-click `CONNECT_SUPABASE.bat` in the project root. It checks the existing `.env.local` without printing its values, assembles the SQL in the required order, copies it to the clipboard and opens the two exact dashboard pages. Then:

1. In Auth Providers, enable **Allow anonymous sign-ins** and save.
2. In SQL Editor, press `Ctrl+V` and **Run** once. Existing projects must be backed up first; repair the schema only with additive migrations.
3. The combined SQL runs every timestamped migration, the exact 89-card owner-approved v2 seed, and the pairing bootstrap.
4. Copy the returned code for Hiệp and the returned code for Hoàng; plaintext codes are not stored and expire after 24 hours. Do not paste these codes into chat or commit them.
5. Open the deployed PWA in Hiệp's browser profile and enter Hiệp's code. Repeat with Hoàng's code in Hoàng's browser profile.
6. A paired device can create a 10-minute, one-use code from its avatar to pair another phone or browser profile.

On first pairing, the app keeps a local backup and imports that learner's existing local FSRS/history only if the remote history is empty. It never deletes the local copy after import. Review writes are online-first and idempotent; the UI reports success only after the server confirms the event.

## Authority and limitations

- RLS resolves `auth.uid()` through `learner_devices`; a browser cannot select an arbitrary learner ID.
- Review events and daily qualifications are source truth. The client cannot write a streak counter.
- A run qualifies a day only after every required card was attempted and the bounded repair loop ended.
- Two devices reviewing the same card at the same time produce an explicit state conflict; the app reloads the accepted server state. Full offline multi-device merge is deliberately outside this release.
- An anonymous session cannot be recovered after signing out or clearing browser data. Pair a replacement device before clearing data, or use a fresh owner bootstrap code.

## Rollback

Set `VITE_SYNC_MODE=local` and redeploy. This returns runtime authority to the preserved browser data without deleting remote events. Do not drop tables or delete review history to repair a conflict.

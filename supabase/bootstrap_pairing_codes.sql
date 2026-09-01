-- Run once in Supabase SQL Editor after 202609010001_device_pairing_sync.sql.
-- Copy the two returned codes immediately. Only their hashes are stored.
-- Each code expires after 24 hours and can pair exactly one browser profile.

with generated as (
  select learner_id,
         upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)) as pairing_code
  from (values ('hiep'::text), ('hoang'::text)) as learners(learner_id)
), inserted as (
  insert into public.device_pairing_invites(learner_id, token_hash, expires_at)
  select learner_id,
         encode(digest(pairing_code, 'sha256'), 'hex'),
         now() + interval '24 hours'
  from generated
  returning learner_id
)
select generated.learner_id, generated.pairing_code, now() + interval '24 hours' as expires_at
from generated
join inserted using (learner_id)
order by generated.learner_id;

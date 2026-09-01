-- Device-paired, no-daily-login sync for Twogether.
-- Apply after 202608200001_initial.sql and content migrations.

create extension if not exists pgcrypto;

alter table public.cards add column if not exists transfer_answer text;

create table if not exists public.learner_devices (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  label text,
  paired_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists learner_devices_learner_idx
  on public.learner_devices(learner_id) where revoked_at is null;

create table if not exists public.device_pairing_invites (
  id uuid primary key default gen_random_uuid(),
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by_auth_user_id uuid references auth.users(id) on delete set null,
  claimed_by_auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.learner_devices enable row level security;
alter table public.device_pairing_invites enable row level security;

drop policy if exists learner_devices_own_select on public.learner_devices;
create policy learner_devices_own_select on public.learner_devices
  for select to authenticated
  using (auth_user_id = (select auth.uid()) and revoked_at is null);

-- Pairing invites are intentionally RPC-only. No direct table policy is added.

create or replace function public.current_learner_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ld.learner_id
  from public.learner_devices as ld
  where ld.auth_user_id = (select auth.uid())
    and ld.revoked_at is null
  limit 1;
$$;

revoke all on function public.current_learner_id() from public;
grant execute on function public.current_learner_id() to authenticated;

create or replace function public.claim_device_pairing(p_code text, p_label text default null)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  invite public.device_pairing_invites%rowtype;
  existing_learner text;
  normalized_code text;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  normalized_code := upper(regexp_replace(coalesce(p_code, ''), '[^A-Z0-9]', '', 'g'));
  if length(normalized_code) < 8 then raise exception 'invalid_pairing_code'; end if;

  select learner_id into existing_learner
  from public.learner_devices
  where auth_user_id = auth.uid() and revoked_at is null;
  if existing_learner is not null then return existing_learner; end if;

  select * into invite
  from public.device_pairing_invites
  where token_hash = encode(digest(normalized_code, 'sha256'), 'hex')
    and used_at is null
    and expires_at > now()
  for update;
  if not found then raise exception 'pairing_code_invalid_expired_or_used'; end if;

  insert into public.learner_devices(auth_user_id, learner_id, label)
  values (auth.uid(), invite.learner_id, nullif(btrim(p_label), ''));

  update public.device_pairing_invites
  set used_at = now(), claimed_by_auth_user_id = auth.uid()
  where id = invite.id;

  return invite.learner_id;
end;
$$;

create or replace function public.create_device_pairing(p_label text default null)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  learner text;
  code text;
begin
  learner := public.current_learner_id();
  if learner is null then raise exception 'device_not_paired'; end if;

  loop
    code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    begin
      insert into public.device_pairing_invites(
        learner_id, token_hash, expires_at, created_by_auth_user_id
      ) values (
        learner,
        encode(digest(code, 'sha256'), 'hex'),
        now() + interval '10 minutes',
        auth.uid()
      );
      exit;
    exception when unique_violation then
      -- Generate another code; the plaintext code is never stored.
    end;
  end loop;

  return code;
end;
$$;

revoke all on function public.claim_device_pairing(text, text) from public;
revoke all on function public.create_device_pairing(text) from public;
grant execute on function public.claim_device_pairing(text, text) to authenticated;
grant execute on function public.create_device_pairing(text) to authenticated;

create table if not exists public.collection_runs (
  run_id text primary key,
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  collection_id text not null,
  required_card_ids text[] not null,
  timezone text not null default 'Asia/Ho_Chi_Minh',
  status text not null default 'active' check (status in ('active', 'qualified', 'ended_incomplete')),
  created_at timestamptz not null,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.collection_run_attempts (
  run_id text not null references public.collection_runs(run_id) on delete cascade,
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  card_id text not null references public.cards(id) on delete restrict,
  first_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count > 0),
  primary key (run_id, card_id)
);

create table if not exists public.daily_qualifications (
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  study_date date not null,
  timezone text not null,
  collection_id text not null,
  run_id text not null,
  qualified_at_client timestamptz not null,
  received_at timestamptz not null default now(),
  primary key (learner_id, study_date),
  unique (learner_id, run_id)
);

create table if not exists public.local_imports (
  learner_id text primary key check (learner_id in ('hiep', 'hoang')),
  import_key text not null,
  imported_at timestamptz not null default now(),
  state_count integer not null,
  event_count integer not null,
  qualification_count integer not null
);

alter table public.review_events add column if not exists run_id text;
alter table public.collection_runs enable row level security;
alter table public.collection_run_attempts enable row level security;
alter table public.daily_qualifications enable row level security;
alter table public.local_imports enable row level security;

drop policy if exists collection_runs_own_select on public.collection_runs;
create policy collection_runs_own_select on public.collection_runs
  for select to authenticated using (learner_id = public.current_learner_id());
drop policy if exists collection_run_attempts_own_select on public.collection_run_attempts;
create policy collection_run_attempts_own_select on public.collection_run_attempts
  for select to authenticated using (learner_id = public.current_learner_id());
drop policy if exists daily_qualifications_own_select on public.daily_qualifications;
create policy daily_qualifications_own_select on public.daily_qualifications
  for select to authenticated using (learner_id = public.current_learner_id());
drop policy if exists local_imports_own_select on public.local_imports;
create policy local_imports_own_select on public.local_imports
  for select to authenticated using (learner_id = public.current_learner_id());

-- A browser may read its own projection but never write a streak counter.
drop policy if exists streaks_own_all on public.streaks;
drop policy if exists streaks_own_select on public.streaks;
create policy streaks_own_select on public.streaks
  for select to authenticated using (learner_id = public.current_learner_id());
revoke insert, update, delete on table public.streaks from authenticated;

create or replace function public.start_collection_run(
  p_run_id text,
  p_collection_id text,
  p_required_card_ids text[],
  p_created_at timestamptz,
  p_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare learner text;
begin
  learner := public.current_learner_id();
  if learner is null then raise exception 'device_not_paired'; end if;
  if p_run_id is null or btrim(p_run_id) = '' then raise exception 'invalid_run_id'; end if;
  if not exists (select 1 from pg_timezone_names where name = p_timezone) then raise exception 'invalid_timezone'; end if;
  if exists (
    select 1 from unnest(coalesce(p_required_card_ids, '{}')) as requested(card_id)
    where not exists (select 1 from public.cards c where c.id = requested.card_id and c.status = 'published')
  ) then raise exception 'run_contains_unpublished_card'; end if;

  insert into public.collection_runs(
    run_id, learner_id, collection_id, required_card_ids, timezone, created_at
  ) values (
    p_run_id, learner, p_collection_id, coalesce(p_required_card_ids, '{}'), p_timezone, p_created_at
  )
  on conflict (run_id) do nothing;

  if not exists (
    select 1 from public.collection_runs
    where run_id = p_run_id and learner_id = learner
      and collection_id = p_collection_id and required_card_ids = coalesce(p_required_card_ids, '{}')
  ) then raise exception 'run_id_conflict'; end if;
end;
$$;

create or replace function public.record_review_v2(
  p_card_id text,
  p_rating text,
  p_attempt_kind text,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_old_state_hash text,
  p_new_fsrs jsonb,
  p_new_state_hash text,
  p_review_count integer,
  p_app_version text,
  p_run_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  learner text;
  current_state public.learner_card_states%rowtype;
  existing_event public.review_events%rowtype;
  inserted_event public.review_events%rowtype;
begin
  learner := public.current_learner_id();
  if learner is null then raise exception 'device_not_paired'; end if;
  if p_rating not in ('Again', 'Good') then raise exception 'invalid_rating'; end if;
  if p_attempt_kind not in ('mental', 'spoken', 'typed', 'written') then raise exception 'invalid_attempt_kind'; end if;
  if not exists (select 1 from public.cards c where c.id = p_card_id and c.status = 'published') then raise exception 'card_not_published'; end if;
  if p_run_id is not null and not exists (
    select 1 from public.collection_runs r
    where r.run_id = p_run_id and r.learner_id = learner and r.status = 'active'
      and p_card_id = any(r.required_card_ids)
  ) then raise exception 'invalid_run_for_card'; end if;

  select * into existing_event from public.review_events
  where learner_id = learner and idempotency_key = p_idempotency_key;
  if found then return jsonb_build_object('duplicate', true, 'event', to_jsonb(existing_event)); end if;

  select * into current_state from public.learner_card_states
  where learner_id = learner and card_id = p_card_id for update;
  if not found then raise exception 'missing_state'; end if;
  if current_state.state_hash <> p_old_state_hash then raise exception 'review_conflict'; end if;

  update public.learner_card_states
  set fsrs = p_new_fsrs, state_hash = p_new_state_hash,
      review_count = p_review_count, last_rating = p_rating,
      last_reviewed_at = p_occurred_at, updated_at = now()
  where learner_id = learner and card_id = p_card_id;

  insert into public.review_events(
    learner_id, card_id, idempotency_key, old_state_hash, new_state_hash,
    rating, attempt_kind, occurred_at, app_version, run_id
  ) values (
    learner, p_card_id, p_idempotency_key, p_old_state_hash, p_new_state_hash,
    p_rating, p_attempt_kind, p_occurred_at, p_app_version, p_run_id
  ) returning * into inserted_event;

  if p_run_id is not null then
    insert into public.collection_run_attempts(run_id, learner_id, card_id, first_attempt_at, last_attempt_at)
    values (p_run_id, learner, p_card_id, p_occurred_at, p_occurred_at)
    on conflict (run_id, card_id) do update
      set last_attempt_at = excluded.last_attempt_at,
          attempt_count = public.collection_run_attempts.attempt_count + 1;
  end if;

  return jsonb_build_object('duplicate', false, 'event', to_jsonb(inserted_event));
end;
$$;

create or replace function public.get_my_streak()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  learner text;
  dates date[];
  current_run integer := 0;
  best_run integer := 0;
  trailing_run integer := 0;
  i integer;
  today_local date;
  learner_timezone text;
begin
  learner := public.current_learner_id();
  if learner is null then raise exception 'device_not_paired'; end if;
  select coalesce(max(timezone), 'Asia/Ho_Chi_Minh') into learner_timezone
  from public.learner_preferences where learner_id = learner;
  today_local := (now() at time zone learner_timezone)::date;
  select array_agg(study_date order by study_date) into dates
  from public.daily_qualifications where learner_id = learner;
  if dates is null or cardinality(dates) = 0 then
    return jsonb_build_object('currentDays', 0, 'bestDays', 0, 'lastQualifiedDate', null);
  end if;
  for i in 1..cardinality(dates) loop
    if i = 1 or dates[i] <> dates[i - 1] + 1 then current_run := 1;
    else current_run := current_run + 1; end if;
    best_run := greatest(best_run, current_run);
  end loop;
  trailing_run := current_run;
  if dates[cardinality(dates)] < today_local - 1 or dates[cardinality(dates)] > today_local then trailing_run := 0; end if;
  return jsonb_build_object(
    'currentDays', trailing_run,
    'bestDays', best_run,
    'lastQualifiedDate', dates[cardinality(dates)]::text
  );
end;
$$;

create or replace function public.finalize_collection_run(
  p_run_id text,
  p_completed_at timestamptz,
  p_timezone text,
  p_repair_complete boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  learner text;
  run public.collection_runs%rowtype;
  local_study_date date;
begin
  learner := public.current_learner_id();
  if learner is null then raise exception 'device_not_paired'; end if;
  if not exists (select 1 from pg_timezone_names where name = p_timezone) then raise exception 'invalid_timezone'; end if;
  if p_completed_at > now() + interval '5 minutes' or p_completed_at < now() - interval '7 days' then raise exception 'completed_at_out_of_range'; end if;
  if not coalesce(p_repair_complete, false) then raise exception 'repair_not_complete'; end if;

  select * into run from public.collection_runs
  where run_id = p_run_id and learner_id = learner for update;
  if not found then raise exception 'run_not_found'; end if;
  if run.status = 'qualified' then return public.get_my_streak(); end if;
  if cardinality(run.required_card_ids) = 0 then raise exception 'empty_run_cannot_qualify'; end if;
  if exists (
    select 1 from unnest(run.required_card_ids) as required(card_id)
    where not exists (
      select 1 from public.collection_run_attempts a
      where a.run_id = run.run_id and a.learner_id = learner and a.card_id = required.card_id
    )
  ) then raise exception 'run_incomplete'; end if;

  local_study_date := (p_completed_at at time zone p_timezone)::date;
  insert into public.daily_qualifications(
    learner_id, study_date, timezone, collection_id, run_id, qualified_at_client
  ) values (
    learner, local_study_date, p_timezone, run.collection_id, run.run_id, p_completed_at
  ) on conflict do nothing;
  update public.collection_runs
  set status = 'qualified', completed_at = p_completed_at, updated_at = now()
  where run_id = run.run_id;
  return public.get_my_streak();
end;
$$;

create or replace function public.import_local_learning_state(
  p_import_key text,
  p_states jsonb,
  p_events jsonb,
  p_qualifications jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  learner text;
  item jsonb;
  states_count integer := 0;
  events_count integer := 0;
  qualifications_count integer := 0;
begin
  learner := public.current_learner_id();
  if learner is null then raise exception 'device_not_paired'; end if;
  if exists (select 1 from public.local_imports where learner_id = learner and import_key = p_import_key) then
    return jsonb_build_object('duplicate', true);
  end if;
  if exists (select 1 from public.review_events where learner_id = learner) then raise exception 'remote_history_not_empty'; end if;
  if jsonb_typeof(p_states) <> 'array' or jsonb_typeof(p_events) <> 'array' or jsonb_typeof(p_qualifications) <> 'array' then
    raise exception 'invalid_import_payload';
  end if;

  for item in select * from jsonb_array_elements(p_states) loop
    if not exists (select 1 from public.cards c where c.id = item->>'cardId' and c.status = 'published') then continue; end if;
    insert into public.learner_card_states(
      learner_id, card_id, fsrs, state_hash, review_count, last_rating, last_reviewed_at
    ) values (
      learner, item->>'cardId', item->'fsrs', item->>'stateHash',
      greatest(0, coalesce((item->>'reviewCount')::integer, 0)),
      nullif(item->>'lastRating', ''), nullif(item->>'lastReviewedAt', '')::timestamptz
    ) on conflict (learner_id, card_id) do update set
      fsrs = excluded.fsrs, state_hash = excluded.state_hash,
      review_count = excluded.review_count, last_rating = excluded.last_rating,
      last_reviewed_at = excluded.last_reviewed_at, updated_at = now();
    states_count := states_count + 1;
  end loop;

  for item in select * from jsonb_array_elements(p_events) loop
    if not exists (select 1 from public.cards c where c.id = item->>'cardId' and c.status = 'published') then continue; end if;
    if item->>'rating' not in ('Again', 'Good') or item->>'attemptKind' not in ('mental', 'spoken', 'typed', 'written') then continue; end if;
    insert into public.review_events(
      learner_id, card_id, idempotency_key, old_state_hash, new_state_hash,
      rating, attempt_kind, occurred_at, app_version
    ) values (
      learner, item->>'cardId', item->>'idempotencyKey', item->>'oldStateHash', item->>'newStateHash',
      item->>'rating', item->>'attemptKind', (item->>'occurredAt')::timestamptz,
      coalesce(nullif(item->>'appVersion', ''), 'local-import')
    ) on conflict (learner_id, idempotency_key) do nothing;
    events_count := events_count + 1;
  end loop;

  for item in select * from jsonb_array_elements(p_qualifications) loop
    if item->>'learnerId' <> learner then continue; end if;
    insert into public.daily_qualifications(
      learner_id, study_date, timezone, collection_id, run_id, qualified_at_client
    ) values (
      learner, (item->>'localDate')::date, item->>'timezone',
      item->>'collectionId', item->>'runId', (item->>'qualifiedAt')::timestamptz
    ) on conflict do nothing;
    qualifications_count := qualifications_count + 1;
  end loop;

  insert into public.local_imports(
    learner_id, import_key, state_count, event_count, qualification_count
  ) values (learner, p_import_key, states_count, events_count, qualifications_count);
  return jsonb_build_object(
    'duplicate', false,
    'stateCount', states_count,
    'eventCount', events_count,
    'qualificationCount', qualifications_count
  );
end;
$$;

revoke all on function public.start_collection_run(text, text, text[], timestamptz, text) from public;
revoke all on function public.record_review_v2(text, text, text, timestamptz, text, text, jsonb, text, integer, text, text) from public;
revoke all on function public.get_my_streak() from public;
revoke all on function public.finalize_collection_run(text, timestamptz, text, boolean) from public;
revoke all on function public.import_local_learning_state(text, jsonb, jsonb, jsonb) from public;
grant execute on function public.start_collection_run(text, text, text[], timestamptz, text) to authenticated;
grant execute on function public.record_review_v2(text, text, text, timestamptz, text, text, jsonb, text, integer, text, text) to authenticated;
grant execute on function public.get_my_streak() to authenticated;
grant execute on function public.finalize_collection_run(text, timestamptz, text, boolean) to authenticated;
grant execute on function public.import_local_learning_state(text, jsonb, jsonb, jsonb) to authenticated;

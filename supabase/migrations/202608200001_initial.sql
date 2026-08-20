-- Twogether production foundation.
-- Apply this migration only to a new/empty Supabase project.
-- No learner email, password, token, or service-role key belongs in this file.

create extension if not exists pgcrypto;

create table if not exists public.allowed_learners (
  email text primary key check (position('@' in email) > 1),
  learner_id text not null unique check (learner_id in ('hiep', 'hoang')),
  display_name text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- The allowlist is read only by security-definer functions. Never expose it
-- through a broad authenticated select policy.
revoke all on table public.allowed_learners from anon, authenticated;

create or replace function public.current_learner_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select al.learner_id
  from public.allowed_learners as al
  where al.enabled
    and lower(al.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

revoke all on function public.current_learner_id() from public;
grant execute on function public.current_learner_id() to authenticated;

create table if not exists public.concept_nodes (
  id text primary key,
  kind text not null check (kind in ('root', 'trunk', 'branch', 'leaf')),
  title text not null,
  purpose text not null,
  status text not null check (status in ('draft', 'review', 'published', 'archived', 'fixture')),
  source_refs text[] not null default '{}',
  maintainer text check (maintainer in ('hiep', 'hoang')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.concept_edges (
  from_node_id text not null references public.concept_nodes(id) on delete restrict,
  to_node_id text not null references public.concept_nodes(id) on delete restrict,
  edge_type text not null check (edge_type in ('prerequisite', 'part_of', 'contrasts_with', 'applies_to', 'example_of')),
  created_at timestamptz not null default now(),
  primary key (from_node_id, to_node_id, edge_type),
  check (from_node_id <> to_node_id)
);

create table if not exists public.cards (
  id text primary key,
  node_id text not null references public.concept_nodes(id) on delete restrict,
  card_type text not null check (card_type in ('core_recall', 'mechanism', 'contrast', 'boundary', 'application', 'production')),
  prompt text not null,
  model_answer text not null,
  explanation text not null,
  misconception text not null,
  transfer_prompt text not null,
  prerequisite_node_ids text[] not null default '{}',
  source_refs text[] not null default '{}',
  status text not null check (status in ('draft', 'review', 'published', 'archived')),
  author text not null,
  reviewer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.card_sources (
  source_ref text primary key,
  card_id text references public.cards(id) on delete cascade,
  source_kind text not null,
  source_sha256 text,
  transformation_note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.card_revisions (
  id uuid primary key default gen_random_uuid(),
  card_id text not null references public.cards(id) on delete cascade,
  revision jsonb not null,
  status text not null check (status in ('draft', 'review', 'published', 'archived')),
  author_learner_id text check (author_learner_id in ('hiep', 'hoang')),
  reviewer_learner_id text check (reviewer_learner_id in ('hiep', 'hoang')),
  created_at timestamptz not null default now()
);

create table if not exists public.learner_card_states (
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  card_id text not null references public.cards(id) on delete restrict,
  fsrs jsonb not null,
  state_hash text not null,
  review_count integer not null default 0 check (review_count >= 0),
  last_rating text check (last_rating in ('Again', 'Good')),
  last_reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id, card_id)
);

create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  card_id text not null references public.cards(id) on delete restrict,
  idempotency_key text not null,
  old_state_hash text not null,
  new_state_hash text not null,
  rating text not null check (rating in ('Again', 'Good')),
  attempt_kind text not null check (attempt_kind in ('mental', 'spoken', 'typed', 'written')),
  occurred_at timestamptz not null,
  app_version text not null,
  created_at timestamptz not null default now(),
  unique (learner_id, idempotency_key)
);

create table if not exists public.learner_preferences (
  learner_id text primary key check (learner_id in ('hiep', 'hoang')),
  daily_goal_minutes integer not null default 15 check (daily_goal_minutes between 1 and 180),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  updated_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  completed_reviews integer not null default 0 check (completed_reviews >= 0),
  app_version text not null
);

create table if not exists public.streaks (
  learner_id text primary key check (learner_id in ('hiep', 'hoang')),
  current_days integer not null default 0 check (current_days >= 0),
  best_days integer not null default 0 check (best_days >= 0),
  last_study_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.private_notes (
  learner_id text not null check (learner_id in ('hiep', 'hoang')),
  card_id text not null references public.cards(id) on delete cascade,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (learner_id, card_id)
);

create index if not exists cards_status_idx on public.cards(status);
create index if not exists cards_node_idx on public.cards(node_id);
create index if not exists review_events_learner_occurred_idx on public.review_events(learner_id, occurred_at desc);

-- Shared content is readable only after authentication and publication.
alter table public.concept_nodes enable row level security;
alter table public.concept_edges enable row level security;
alter table public.cards enable row level security;
alter table public.card_sources enable row level security;
alter table public.card_revisions enable row level security;

create policy concept_nodes_published_select on public.concept_nodes
  for select to authenticated using (status in ('published', 'fixture'));

create policy concept_edges_authenticated_select on public.concept_edges
  for select to authenticated using (
    exists (select 1 from public.concept_nodes n where n.id = from_node_id and n.status in ('published', 'fixture'))
    and exists (select 1 from public.concept_nodes n where n.id = to_node_id and n.status in ('published', 'fixture'))
  );

create policy cards_published_select on public.cards
  for select to authenticated using (status = 'published');

create policy card_sources_published_select on public.card_sources
  for select to authenticated using (
    card_id is null or exists (select 1 from public.cards c where c.id = card_id and c.status = 'published')
  );

create policy card_revisions_published_select on public.card_revisions
  for select to authenticated using (
    exists (select 1 from public.cards c where c.id = card_id and c.status = 'published')
  );

-- Learner-owned data is visible only through the authenticated allowlist mapping.
alter table public.learner_card_states enable row level security;
alter table public.review_events enable row level security;
alter table public.learner_preferences enable row level security;
alter table public.study_sessions enable row level security;
alter table public.streaks enable row level security;
alter table public.private_notes enable row level security;

create policy learner_card_states_own_select on public.learner_card_states
  for select to authenticated using (learner_id = public.current_learner_id());
create policy learner_card_states_own_insert on public.learner_card_states
  for insert to authenticated with check (learner_id = public.current_learner_id());
create policy learner_card_states_own_update on public.learner_card_states
  for update to authenticated using (learner_id = public.current_learner_id()) with check (learner_id = public.current_learner_id());

create policy review_events_own_select on public.review_events
  for select to authenticated using (learner_id = public.current_learner_id());

create policy learner_preferences_own_all on public.learner_preferences
  for all to authenticated using (learner_id = public.current_learner_id()) with check (learner_id = public.current_learner_id());
create policy study_sessions_own_all on public.study_sessions
  for all to authenticated using (learner_id = public.current_learner_id()) with check (learner_id = public.current_learner_id());
create policy streaks_own_all on public.streaks
  for all to authenticated using (learner_id = public.current_learner_id()) with check (learner_id = public.current_learner_id());
create policy private_notes_own_all on public.private_notes
  for all to authenticated using (learner_id = public.current_learner_id()) with check (learner_id = public.current_learner_id());

-- Review writes go through one transactional function. The client supplies the
-- already-tested FSRS next state, while this function owns learner scope,
-- optimistic concurrency, and idempotency.
create or replace function public.record_review(
  p_card_id text,
  p_rating text,
  p_attempt_kind text,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_old_state_hash text,
  p_new_fsrs jsonb,
  p_new_state_hash text,
  p_review_count integer,
  p_app_version text
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
  if learner is null then raise exception 'not_allowlisted'; end if;
  if p_rating not in ('Again', 'Good') then raise exception 'invalid_rating'; end if;
  if p_attempt_kind not in ('mental', 'spoken', 'typed', 'written') then raise exception 'invalid_attempt_kind'; end if;
  if not exists (select 1 from public.cards c where c.id = p_card_id and c.status = 'published') then
    raise exception 'card_not_published';
  end if;

  select * into existing_event
  from public.review_events
  where learner_id = learner and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('duplicate', true, 'event', to_jsonb(existing_event));
  end if;

  select * into current_state
  from public.learner_card_states
  where learner_id = learner and card_id = p_card_id
  for update;
  if not found then raise exception 'missing_state'; end if;
  if current_state.state_hash <> p_old_state_hash then raise exception 'review_conflict'; end if;

  update public.learner_card_states
  set fsrs = p_new_fsrs,
      state_hash = p_new_state_hash,
      review_count = p_review_count,
      last_rating = p_rating,
      last_reviewed_at = p_occurred_at,
      updated_at = now()
  where learner_id = learner and card_id = p_card_id;

  insert into public.review_events (
    learner_id, card_id, idempotency_key, old_state_hash, new_state_hash,
    rating, attempt_kind, occurred_at, app_version
  ) values (
    learner, p_card_id, p_idempotency_key, p_old_state_hash, p_new_state_hash,
    p_rating, p_attempt_kind, p_occurred_at, p_app_version
  ) returning * into inserted_event;

  return jsonb_build_object('duplicate', false, 'event', to_jsonb(inserted_event));
end;
$$;

revoke all on function public.record_review(text, text, text, timestamptz, text, text, jsonb, text, integer, text) from public;
grant execute on function public.record_review(text, text, text, timestamptz, text, text, jsonb, text, integer, text) to authenticated;

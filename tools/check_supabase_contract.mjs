import { readFile } from "node:fs/promises";

const migration = await readFile("supabase/migrations/202608200001_initial.sql", "utf8");
const envExample = await readFile(".env.example", "utf8");
const setup = await readFile("supabase/README.md", "utf8");
const seed = await readFile("supabase/seed.sql", "utf8");

const required = [
  "create table if not exists public.allowed_learners",
  "create or replace function public.current_learner_id()",
  "create table if not exists public.cards",
  "create table if not exists public.learner_card_states",
  "create table if not exists public.review_events",
  "alter table public.cards enable row level security",
  "alter table public.learner_card_states enable row level security",
  "create policy learner_card_states_own_select",
  "create policy review_events_own_select",
  "create or replace function public.record_review(",
  "unique (learner_id, idempotency_key)",
  "raise exception 'review_conflict'",
  "grant execute on function public.record_review",
];

for (const marker of required) {
  if (!migration.includes(marker)) throw new Error(`missing migration invariant: ${marker}`);
}

if (!envExample.includes("VITE_SUPABASE_URL") || !envExample.includes("VITE_SUPABASE_ANON_KEY")) {
  throw new Error(".env.example must document both browser-safe Supabase variables");
}

if (/supabase[_-]service[_-]role|sb_secret|password\s*=|access[_-]?token\s*=/.test(envExample.toLowerCase())) {
  throw new Error(".env.example contains a forbidden secret-looking value");
}

if (!setup.includes("Do not put their passwords") || !setup.includes("service-role key may not")) {
  throw new Error("setup guide must keep passwords and service-role keys outside the repository");
}

if (!seed.includes("fixture-recall-01") || !seed.includes("fixture-transfer-03") || seed.includes("core-en-01") || seed.includes("core-react-01")) {
  throw new Error("seed must contain only the published fixture set, never draft curriculum cards");
}

console.log("Supabase contract: migration, RLS, idempotent review RPC, env boundary, and secret hygiene present");

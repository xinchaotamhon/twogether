-- Optional comprehension support for published and locally authored cards.
-- Applying this migration does not activate remote sync or approve any draft content.

alter table public.cards add column if not exists scaffold_prompt text;
alter table public.cards add column if not exists scaffold_answer text;
alter table public.cards add column if not exists glossary_refs text[] not null default '{}';

alter table public.cards drop constraint if exists cards_scaffold_pair_check;
alter table public.cards add constraint cards_scaffold_pair_check check (
  (scaffold_prompt is null and scaffold_answer is null)
  or (length(btrim(scaffold_prompt)) > 0 and length(btrim(scaffold_answer)) > 0)
);

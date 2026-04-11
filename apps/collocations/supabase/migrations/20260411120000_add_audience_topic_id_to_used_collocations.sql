alter table public.used_collocations
  add column if not exists audience_topic_id text;


-- Set legacy note for the current rows
update public.used_collocations
set audience_topic_id = '__legacy_global__'
where audience_topic_id is null;

alter table public.used_collocations
  alter column audience_topic_id set not null;

alter table public.used_collocations
  drop constraint if exists used_collocations_collocation_id_key;

create unique index if not exists used_collocations_audience_topic_id_collocation_id_key
  on public.used_collocations (audience_topic_id, collocation_id);

create index if not exists used_collocations_audience_topic_id_idx
  on public.used_collocations (audience_topic_id);

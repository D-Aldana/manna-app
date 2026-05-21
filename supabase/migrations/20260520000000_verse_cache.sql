create table if not exists verse_cache (
  source_id text not null,
  osis_ref text not null,
  verse_text text not null,
  fetched_at timestamptz not null default now(),
  primary key (source_id, osis_ref)
);

alter table verse_cache enable row level security;

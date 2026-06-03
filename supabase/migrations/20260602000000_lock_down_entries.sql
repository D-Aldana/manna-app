-- Codify the entries table (originally created via the dashboard) and lock it down.
-- Enabling RLS with no policies blocks all access via the publishable key;
-- a follow-up migration adds user scoping + policies.
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  input text not null,
  verse_text text,
  verse_ref text,
  commentary text,
  prayer text
);

alter table entries enable row level security;

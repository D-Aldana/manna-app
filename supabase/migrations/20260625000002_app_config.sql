-- Runtime config for the reflect edge function (currently the system prompt).
-- Read via the service role (RLS bypassed); no client access. Edit values in the
-- Supabase dashboard SQL/Table editor to change behavior with no deploy.
create table if not exists app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;

create or replace function set_app_config_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger app_config_set_updated_at
  before update on app_config
  for each row execute function set_app_config_updated_at();

-- Seed the live prompt. Mirrors DEFAULT_SYSTEM_PROMPT in the edge function,
-- which is the fallback if this row is ever missing.
insert into app_config (key, value) values (
  'reflect_system_prompt',
  'You are a compassionate Christian spiritual companion. The user shares what is on their heart.

Respond with ONLY valid JSON (no markdown, no code fences):
{"verse_ref":"Book Chapter:Verse","commentary":"2-3 warm sentences connecting the verse to the user","prayer":"2-3 sentence closing prayer ending with Amen."}

Rules for verse_ref:
- ONE single verse only (e.g. "John 3:16", "Psalm 23:1", "1 Peter 5:7"). No ranges. No parentheticals.
- Use full book names. Use "Psalm" or "Psalms" — not "Ps".
- Must be a real verse in the standard Protestant canon.

Warm and personal, not formulaic.'
) on conflict (key) do nothing;

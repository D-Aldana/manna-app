-- User feedback / contact messages. Written only by the feedback edge function
-- (service role); RLS is enabled with no policies so the anon/publishable key
-- cannot read or write it directly.
--
-- Unlike `entries`, the message is stored in plaintext: it is intentionally
-- addressed to the maintainer, who needs to read it in the dashboard.
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message text not null,
  user_id uuid,
  platform text
);

alter table feedback enable row level security;

-- Per-bucket (IP / user) fixed-window rate limiter for the reflect edge function.
create table if not exists rate_limit (
  bucket text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (bucket, window_start)
);

alter table rate_limit enable row level security;

-- Atomically bump the current window's counter for a bucket and return the total.
-- Window is aligned to p_window_seconds so old rows fall out of relevance; they
-- can be swept later with a cron (delete where window_start < now() - interval).
create or replace function bump_rate_limit(p_bucket text, p_window_seconds integer)
returns integer
language plpgsql
as $$
declare
  w timestamptz;
  c integer;
begin
  w := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into rate_limit (bucket, window_start, count)
  values (p_bucket, w, 1)
  on conflict (bucket, window_start)
  do update set count = rate_limit.count + 1
  returning count into c;
  return c;
end;
$$;

-- These counters are only ever bumped by the edge function (service role).
-- Without this, any client could call them directly to trip the breakers for
-- everyone. Lock both down (increment_usage_counter shipped in the prior,
-- already-applied migration, so its revoke lives here).
revoke all on function bump_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function bump_rate_limit(text, integer) to service_role;

revoke all on function increment_usage_counter() from public, anon, authenticated;
grant execute on function increment_usage_counter() to service_role;

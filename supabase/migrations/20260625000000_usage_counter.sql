-- Global daily call counter for the reflect edge function (cost circuit breaker).
create table if not exists usage_counter (
  day date primary key,
  count integer not null default 0
);

alter table usage_counter enable row level security;

-- Atomically bump today's counter and return the new total.
create or replace function increment_usage_counter()
returns integer
language plpgsql
as $$
declare
  new_count integer;
begin
  insert into usage_counter (day, count)
  values (current_date, 1)
  on conflict (day)
  do update set count = usage_counter.count + 1
  returning count into new_count;
  return new_count;
end;
$$;

-- Scope entries to the authenticated (anonymous) user.
-- Nullable because pre-existing rows have no owner; auth.uid() is null in
-- migration context, so a NOT NULL constraint can't be applied here.
alter table entries add column if not exists user_id uuid default auth.uid();

create policy "Users read own entries"
  on entries for select to authenticated
  using (user_id = auth.uid());

create policy "Users insert own entries"
  on entries for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users update own entries"
  on entries for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users delete own entries"
  on entries for delete to authenticated
  using (user_id = auth.uid());

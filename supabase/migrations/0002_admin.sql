-- Admin allow-list. RLS on with no policies: only the service role (and is_admin below) can read it.
create table admins (
  email text primary key check (email = lower(email))
);
alter table admins enable row level security;

-- True when the signed-in user's email is in `admins` (case-insensitive).
create or replace function is_admin() returns boolean
language sql security definer set search_path = public stable
as $$ select exists (select 1 from admins where email = lower(auth.jwt() ->> 'email')) $$;
revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;

-- Lead follow-up.
create type lead_status as enum ('new', 'contacted', 'negotiating', 'won', 'lost');
alter table enquiries
  add column status lead_status not null default 'new',
  add column owner text;

create policy "admins read enquiries" on enquiries for select to authenticated using (is_admin());
create policy "admins update enquiries" on enquiries for update to authenticated
  using (is_admin()) with check (is_admin());

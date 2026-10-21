create type event_region as enum ('asia_pacific', 'europe', 'middle_east_africa', 'americas');
create type event_category as enum ('exhibition', 'conference', 'exhibition_conference');
create type event_status as enum ('pending', 'approved', 'hidden');

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  start_date date,
  end_date date,
  dates_confirmed boolean not null default false,
  date_note text, -- rough period shown while dates are unconfirmed, e.g. 'September 2027'
  city text not null,
  country text not null,
  region event_region not null,
  venue text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  organiser text,
  category event_category not null,
  description text, -- our own words, facts only
  website_url text,
  source_url text,
  last_checked date,
  status event_status not null default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  constraint events_dates_order check (end_date is null or start_date is null or end_date >= start_date),
  constraint events_confirmed_needs_start check (not dates_confirmed or start_date is not null),
  constraint events_approved_complete check (
    status <> 'approved'
    or (website_url is not null and source_url is not null and last_checked is not null
        and latitude is not null and longitude is not null)
  ),
  -- Links are rendered as hrefs, so only http(s) is allowed (blocks javascript: URLs).
  constraint events_urls_http check (
    (website_url is null or website_url ~* '^https?://') and (source_url is null or source_url ~* '^https?://')
  )
);

create index events_status_start on events (status, start_date);

alter table events enable row level security;
create policy "public reads approved events" on events for select to anon, authenticated
  using (status = 'approved');
create policy "admins manage events" on events for all to authenticated
  using (is_admin()) with check (is_admin());

-- Our own events, pinned first.
insert into events (slug, name, date_note, city, country, region, category, latitude, longitude,
                    description, website_url, source_url, last_checked, status, featured)
values
  ('maritime-expo-asia-2027', 'Maritime Expo Asia 2027', 'September 2027', 'Sibu', 'Malaysia', 'asia_pacific',
   'exhibition', 2.2873, 111.8305,
   'The main exhibition for shipbuilding, marine services, technology and training, held in Sarawak''s shipbuilding capital. Dates and venue to be announced.',
   'https://maritimeexpoasia.com', 'https://maritimeexpoasia.com', current_date, 'approved', true),
  ('sarawak-maritime-industry-summit-2027', 'Sarawak Maritime Industry Summit 2027', 'Late March 2027', 'Sibu', 'Malaysia',
   'asia_pacific', 'exhibition_conference', 2.2873, 111.8305,
   'Road to Maritime Expo Asia 2027: industry talks, an open forum, a tabletop exhibition and the SAMIN Installation Night, hosted by the Sarawak Association of Marine Industries. Exact date and venue to be announced.',
   'https://maritimeexpoasia.com/summit-2027', 'https://maritimeexpoasia.com/summit-2027', current_date, 'approved', true);

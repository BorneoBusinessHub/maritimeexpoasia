-- Three tiers: our anchor event, events we co-host, and events we only list.
create type event_tier as enum ('anchor', 'cohosted', 'listed');
alter table events add column tier event_tier not null default 'listed';

update events set tier = 'anchor' where slug = 'maritime-expo-asia-2027';
update events set tier = 'cohosted' where slug = 'sarawak-maritime-industry-summit-2027';

alter table events drop column featured;

-- At most one anchor event.
create unique index events_one_anchor on events (tier) where tier = 'anchor';

-- Partner leads, and which event a lead came from.
alter type enquiry_type add value if not exists 'cohost';
alter type enquiry_type add value if not exists 'listing';
alter table enquiries
  add column event_slug text references events (slug) on update cascade on delete set null;

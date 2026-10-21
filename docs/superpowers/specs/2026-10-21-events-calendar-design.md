# Maritime Events Calendar (design spec)

Date: 2026-10-21. Status: approved in brainstorming, awaiting owner review of this file.
Builds on: `docs/07-future-features.md` (Feature 1) and `2026-10-21-platform-direction-design.md`.

## 1. Goal and understanding

**Goal:** a calendar and map of major maritime exhibitions and conferences around the world, so people return to maritimeexpoasia.com all year. Maritime Expo Asia 2027 and the Sarawak Maritime Industry Summit 2027 are pinned at the top.

**Owner decisions**
- Requested now by name (CLAUDE.md allows building it); this moves it ahead of the earlier "after September 2027" slot.
- Global scope, filterable by region.
- First version is hand-curated from official sources. Automated sources are added one at a time later.

**Honesty rules (CLAUDE.md):** no invented dates. Every event carries an official link and a last-checked date. When an organiser has not published dates, the page says "Dates to be announced". Descriptions are our own words; no copied text or logos; facts only, with a link back.

## 2. Data

Table `events`:
`id`, `slug` (unique), `name`, `start_date`, `end_date` (nullable), `dates_confirmed` (bool), `city`, `country`, `region` (enum: `asia_pacific`, `europe`, `middle_east_africa`, `americas`), `venue` (nullable), `latitude`, `longitude`, `organiser` (nullable), `category` (enum: `exhibition`, `conference`, `exhibition_conference`), `description` (short, our own words), `website_url`, `source_url`, `last_checked` (date), `status` (enum: `pending`, `approved`, `hidden`), `featured` (bool, pinned).

Constraints
- `end_date >= start_date` when both set.
- `dates_confirmed` true requires `start_date`; false means the page shows "Dates to be announced" and the event sorts last.
- `approved` requires `website_url`, `source_url`, `last_checked`, and coordinates.

Access (RLS): anonymous and signed-in users read only `status = 'approved'`; admins (`is_admin()` from the platform plan) read and write all.

## 3. Public pages

- `/events`: list view with filters region, category, month; featured events first; view toggle List | Map. Filters live in the URL query so a filtered view can be shared.
- Map view: Leaflet with OpenStreetMap tiles (free, no API key); one pin per approved event; pin popup links to the event page. New dependency: `leaflet`.
- `/events/[slug]`: facts, our short description, official-site button, "last checked" date, "Add to calendar" (`.ics` download, only when dates are confirmed).
- Header nav gets "Events"; `sitemap.ts` lists approved events. Pages are cached with tag `events` and refreshed when an admin saves.
- Empty state: if no approved events exist, `/events` shows "Events calendar coming soon" instead of an empty grid.

## 4. Admin

`/admin/events` (existing admin shell): list with status filter, add/edit form, status select, "mark checked today" button, delete. Saving a `featured` event does not remove the pinned own-events; those two are ordinary rows with `featured = true`.

## 5. First data load

About 30 to 40 major events across the four regions, each verified on the organiser's official site by the implementer, with `source_url` and `last_checked` set. Candidate list (names only; every date and venue must be verified before entry): Sarawak/own events, SMM, Nor-Shipping, Marintec China, Sea Asia, Singapore Maritime Week, Europort, Posidonia, Offshore Northern Seas, Seatrade Cruise Global, Marine Money Week, Indo Marine, Asia Pacific Maritime, plus others found in research. Entries that cannot be verified are left out, not guessed. Coordinates are city-level, entered by hand.

## 6. Testing

- RLS: anonymous cannot read `pending` or `hidden`; non-admin cannot insert or update.
- Constraints: approving without `source_url`, `last_checked` or coordinates fails; `end_date` before `start_date` fails.
- `.ics` output has the right dates and `UID`, and no download link when `dates_confirmed` is false.
- Filter logic: region, category and month combine; unconfirmed-date events sort last.
- Pre-launch check: no event without an official link is public.

## 7. Out of scope here

Automated sources (iCal, structured data, scraping), weekly email digest, "I'm attending", organiser self-submission, geocoding service, user accounts for visitors. Each is its own request and spec.

## 8. Order of work

1. Platform plan Task 1 (Supabase project, live site) and Task 3 (admin auth and RLS).
2. Events plan (to be written after this spec is approved): table and RLS, public pages and map, admin pages, data load.

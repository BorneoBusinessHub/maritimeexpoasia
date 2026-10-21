# Event hub restructure (design spec)

Date: 2026-10-22. Status: approved in brainstorming, awaiting owner review of this file.
Builds on: `2026-10-21-platform-direction-design.md`, `2026-10-21-events-calendar-design.md` (branch `feat/events-calendar`).

## 1. Goal and understanding

**Goal:** turn maritimeexpoasia.com from a single-event site into a maritime events platform with three tiers:

1. **Anchor event:** Maritime Expo Asia 2027. The face of the site.
2. **Co-hosted events:** events run with other organisations (today: Sarawak Maritime Industry Summit 2027, hosted by SAMIN, co-organised by MarineX International). Each gets a full page on our site with register, exhibit and sponsor forms.
3. **Listed events:** other maritime events published in the calendar, linking to their official sites (already built).

**Owner decisions**
- Expect 1 to 3 co-hosted events a year; each is built in code on a shared template when the owner asks. No admin page builder, no partner logins.
- Structure A (one event hub) chosen over separate sections or a minimal change.
- Organisations can ask to co-host or to be listed; these become new lead types.

**Assumptions:** the owner's team adds and approves all events in `/admin`. Leads from a co-hosted event's forms come to us, tagged with the event. The content rules in `CLAUDE.md` still apply to every page (no VIP names, no prices, `[TBC]` hidden, no invented facts).

## 2. Pages and addresses

| Address | Content |
|---|---|
| `/` | Hub. Anchor hero (Maritime Expo Asia 2027, Sibu, September 2027, buttons "Register your interest" and "About the Expo"). "Co-hosted events": cards for upcoming `cohosted` events. "Upcoming maritime events": next 6 upcoming approved events of any tier except the anchor, link "Full calendar". "Partner with us" teaser linking to `/partner`. Register-interest form (tagged to the anchor). |
| `/maritime-expo-asia-2027` | The anchor's page: today's home content (hero, Why Sibu, Who should attend, Road to September, register form tagged to the anchor). Future booking and programme pages live under this path. |
| `/events` | Calendar (unchanged behaviour). Pinned order: anchor, then co-hosted, then listed. Badges: "Our event" (anchor), "Co-hosted" (co-hosted). Cards link to each event's page (see `eventHref`). |
| `/events/sarawak-maritime-industry-summit-2027` | Today's Summit page, rebuilt on the co-hosted template. Forms tagged to this event. |
| `/events/<slug>` | Generic page for listed events (unchanged). |
| `/partner` | "Partner with us". Two forms: **Co-host an event with us**, **List your event** (extra fields: event name, dates as free text, city and country, official website). Copy says every listing is checked against the official website before it is published. No prices. |
| `/contact`, `/privacy` | Unchanged. |

**Redirects (permanent):** `/summit-2027` to `/events/sarawak-maritime-industry-summit-2027`; `/events/maritime-expo-asia-2027` to `/maritime-expo-asia-2027`.

**Navigation:** wordmark to `/`; links "Expo 2027" (`/maritime-expo-asia-2027`), "Events" (`/events`), "Partner with us" (`/partner`), "Contact". Mobile menu adds "Register interest" (`/#register`) as today.

**Footer:** one line describing the platform (anchor exhibition, co-hosted events, worldwide calendar). Host credits (SAMIN, MarineX) move to each co-hosted event page; the legal entity line stays `[TBC: BBH PLT or MarineX International]`.

**Co-hosted template** (`components/cohosted/`): hero (eyebrow, title, tagline, date and venue card, up to three buttons), "Hosted by" credit block, and an enquiry section. The Summit page keeps its existing sections (programme, topics, tabletop, sponsors) as page-specific content between those parts.

**Event links:** `eventHref(event)` returns the custom path for the anchor (`/maritime-expo-asia-2027`) and `/events/<slug>` for everything else (co-hosted pages are static routes under `/events`, which take priority over `[slug]`).

## 3. Data and leads

**events**
- Add enum `event_tier` (`anchor`, `cohosted`, `listed`) and column `tier` not null default `listed`.
- Migrate: `maritime-expo-asia-2027` becomes `anchor`, `sarawak-maritime-industry-summit-2027` becomes `cohosted`; then drop `featured`.
- Unique partial index so at most one row has `tier = 'anchor'`.
- Sorting: tier order (anchor, cohosted, listed), then confirmed dates ascending, then unconfirmed by name.

**enquiries**
- Add values `cohost` and `listing` to `enquiry_type`.
- Add column `event_slug text references events(slug) on update cascade on delete set null`, nullable. Contact and partner forms leave it empty.
- `EnquiryForm` takes an optional `event` prop sent as a hidden field. The server action checks it against the approved events (or leaves it null) before insert, so a tampered value cannot break the insert or tag a lead to a hidden event.
- Listing requests never create events. The team adds the event in `/admin/events` after checking the official site.

**Admin:** the event form's "featured" checkbox becomes a "Tier" select. Leads admin (not yet built) will filter by event later; for now `event_slug` is visible in the database and in CSV export when that page is built.

## 4. Testing

- Unit (`lib/events.ts`): `sortEvents` by tier then date; `eventHref` for anchor, co-hosted and listed; `tierBadge` labels.
- Database (role simulation now, node tests once the service key is set): only one anchor allowed; `event_slug` must match an existing event; new enquiry types accepted.
- Server action: unknown or hidden `event` value is stored as null, not rejected.
- Redirects: `/summit-2027` and `/events/maritime-expo-asia-2027` return 308 to the new paths.
- Build, lint, typecheck, content-rule grep; visual check of `/`, `/maritime-expo-asia-2027`, the Summit page and `/partner` at 375px and desktop width.

## 5. Out of scope

Partner logins and dashboards, sharing leads with co-hosts (CSV export covers it), paid or featured listings, automatic event creation from listing requests, a leads admin page (platform plan Task 4).

## 6. Dependencies

Built on `feat/events-calendar`. Still pending there and unaffected by this work: service role key in `.env.local`, admin email and Supabase Auth redirect URLs, owner approval of the 30 pending events, final review of that branch.

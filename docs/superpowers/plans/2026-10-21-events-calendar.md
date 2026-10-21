# Maritime Events Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/events` (list + map + event pages + `.ics`), an `/admin/events` editor, and a verified first load of 30 to 40 major maritime events worldwide, with Maritime Expo Asia 2027 and the March Summit pinned first.

**Architecture:** One `events` table guarded by RLS (`approved` rows public, admins everything). Pure logic (filters, sorting, date formatting, `.ics`, slug, error text) lives in `lib/events.ts` and is unit-tested. Public pages stay static: the approved list is a `'use cache'` read tagged `events`, filtered client-side from the URL, refreshed with `updateTag('events')` when an admin saves.

**Tech Stack:** Next.js 16.4 (App Router, `cacheComponents: true`), Supabase (Postgres, RLS), `leaflet` + OpenStreetMap tiles, `node --test` (Node 24, `.ts` run directly).

**Spec:** `docs/superpowers/specs/2026-10-21-events-calendar-design.md`

## Prerequisites (from `docs/superpowers/plans/2026-10-21-proof-engine-slice-1.md`)

Task 1 (Supabase project live, `.env.local`, `npm test` works, git identity set) and Task 3 (admin auth) must be done. This plan consumes:
- `tests/supabase.ts`: `anon()`, `service()`, `signedInAs(email: string, admin: boolean): Promise<{ client: SupabaseClient; cleanup(): Promise<void> }>`
- SQL `is_admin() returns boolean`; table `admins`
- `lib/supabase/server.ts`: `createClient(): Promise<SupabaseClient>`; `lib/admin.ts`: `requireAdmin(): Promise<{ email: string }>`
- `app/admin/layout.tsx` (nav shell), `components/ui.tsx` (`Section`, `Bezel`, `Eyebrow`, `H2`, `PageHeader`, `Button`), `components/Reveal.tsx`

If any are missing, stop and finish that task first.

## Global Constraints

- Read the relevant file in `node_modules/next/dist/docs/` before using a Next API (see `AGENTS.md`). With Cache Components, `generateStaticParams` must return at least one param (empty array is a build error).
- Region values exactly: `asia_pacific`, `europe`, `middle_east_africa`, `americas`. Category values exactly: `exhibition`, `conference`, `exhibition_conference`. Status values exactly: `pending`, `approved`, `hidden`.
- Unconfirmed dates show exactly `Dates to be announced`. Empty calendar shows exactly `Events calendar coming soon`.
- Never invent dates. Every event has an official `website_url`, a `source_url` and `last_checked`. Descriptions are our own words (facts only); no copied text, logos or images.
- Only new dependencies: `leaflet` (runtime), `@types/leaflet` (dev). Map attribution text: `© OpenStreetMap contributors`.
- "Today" is computed in `Asia/Kuching`. Public pages are cached with tag `events`; every admin save calls `updateTag('events')`.
- Admin code uses the signed-in user's Supabase client (RLS decides). The service role key is never used outside `tests/` and `app/actions.ts`.
- British spelling in copy. `CLAUDE.md` content rules apply (no VIP names, prices, invented numbers).
- Plan deviation from spec (small, additive): `events.date_note text` (nullable) shows a rough period such as `September 2027` when dates are unconfirmed, so our own events do not read "Dates to be announced" on a site that says September 2027. `start_date` is nullable (needed for unconfirmed events).

## Review Focus

1. All-day `.ics` events: `DTEND` is exclusive, so a 12 to 14 June event must import as three days, and a single-day or month-end/year-end event must still end the next day. (Task 2 tests.)
2. Event names or venues containing `, ; \ < > & "` or newlines must be escaped in `.ics` and must show as literal text, never HTML, in map popups. (Task 2 `.ics` test; Task 4 manual check with a hostile name.)
3. Month filter edge cases: an event crossing a month boundary appears in both months; an unconfirmed-date event never appears under a month filter but does appear (last) with no month filter. (Task 2 tests.)
4. Events that ended must disappear on the right day for the Sarawak audience, not UTC: at 01:00 on 1 April in Sarawak an event ending 31 March is hidden. (Task 2 `todayInKuching` and `filterEvents` tests.)
5. Admin mistakes must produce a readable message, not a 500: duplicate slug, approving an incomplete event, end before start, and an empty approved list must not break the build. (Task 2 `describeEventError`, `staticSlugs`; Task 6 manual check.)

---

### Task 1: Schema, RLS and own-event seed

**Files:**
- Create: `supabase/migrations/0004_events.sql` (use the next free number if taken), `tests/events-fixture.ts`, `tests/events-rls.test.ts`

**Interfaces:**
- Produces SQL: enums `event_region`, `event_category`, `event_status`; table `events(id uuid pk default gen_random_uuid(), slug text unique not null, name text not null, start_date date, end_date date, dates_confirmed boolean not null default false, date_note text, city text not null, country text not null, region event_region not null, venue text, latitude double precision, longitude double precision, organiser text, category event_category not null, description text, website_url text, source_url text, last_checked date, status event_status not null default 'pending', featured boolean not null default false, created_at timestamptz default now())`.
- Named check constraints (Task 2 maps these names to messages): `events_dates_order` (`end_date >= start_date` when both set), `events_confirmed_needs_start` (`not dates_confirmed or start_date is not null`), `events_approved_complete` (`status <> 'approved'` or website_url, source_url, last_checked, latitude, longitude all non-null).
- RLS: anon and authenticated select where `status = 'approved'`; `is_admin()` all. Index on `(status, start_date)`.
- Seed (status `approved`, `featured` true, `dates_confirmed` false, `last_checked` = migration date): `maritime-expo-asia-2027` (`date_note` `September 2027`, Sibu, Malaysia, `asia_pacific`, `exhibition`, `website_url` and `source_url` `https://maritimeexpoasia.com`) and `sarawak-maritime-industry-summit-2027` (`date_note` `Late March 2027`, `exhibition_conference`, `https://maritimeexpoasia.com/summit-2027`). Coordinates of Sibu (about 2.29, 111.83; confirm on a map). Descriptions use only facts from `docs/01-event-facts.md`.
- Test helper: `eventRow(over?: Record<string, unknown>): Record<string, unknown>` returning a valid approved row with slug `test-<random>`; tests delete rows whose slug starts with `test-` in `after`.

- [ ] **Step 1: Write failing tests** in `tests/events-rls.test.ts`:
  - `anon sees only approved`: service inserts one approved, one pending, one hidden `test-` row; `anon().from("events").select("slug").like("slug","test-%")` returns exactly the approved slug.
  - `non-admin cannot insert`: `signedInAs(..., false)` insert → `error` not null.
  - `approved without source_url fails`: admin insert `eventRow({ source_url: null })` → `error.message` contains `events_approved_complete`.
  - `approved without coordinates fails` (same constraint); `pending without coordinates succeeds`.
  - `end before start fails`: contains `events_dates_order`.
  - `confirmed dates need start`: `dates_confirmed: true, start_date: null` → contains `events_confirmed_needs_start`.
  - `own events are seeded`: anon select `featured = true` includes both seeded slugs.
- [ ] **Step 2: Run** `npm test` → FAIL (relation "events" does not exist).
- [ ] **Step 3: Write and apply the migration** with `apply_migration`; run `get_advisors` (security) → no RLS warning for `events`.
- [ ] **Step 4: Run** `npm test` → all pass.
- [ ] **Step 5: Commit** `feat: events table, RLS and own-event seed`.

---

### Task 2: Pure event logic

**Files:**
- Create: `lib/events.ts`, `tests/events-lib.test.ts`

**Interfaces:**
- Produces (all exported from `lib/events.ts`):
  - `REGIONS`, `CATEGORIES`, `STATUSES` (`as const` tuples) and types `Region`, `Category`, `EventStatus`.
  - `type MaritimeEvent = { id: string; slug: string; name: string; start_date: string | null; end_date: string | null; dates_confirmed: boolean; date_note: string | null; city: string; country: string; region: Region; venue: string | null; latitude: number | null; longitude: number | null; organiser: string | null; category: Category; description: string | null; website_url: string; source_url: string; last_checked: string; status: EventStatus; featured: boolean }` (dates are `YYYY-MM-DD` strings).
  - `type Filters = { region?: Region; category?: Category; month?: string }` (`month` is `YYYY-MM`).
  - `parseFilters(params: URLSearchParams): Filters`: invalid region, category or month values are dropped.
  - `todayInKuching(now?: Date): string`
  - `filterEvents(events: MaritimeEvent[], filters: Filters, today: string): MaritimeEvent[]`
  - `sortEvents(events: MaritimeEvent[]): MaritimeEvent[]`: featured first; then confirmed by `start_date` ascending, ties by name; unconfirmed last, by name.
  - `formatDates(e: MaritimeEvent): string`
  - `toIcs(e: MaritimeEvent, now?: Date): string | null`
  - `slugify(name: string): string`
  - `staticSlugs(events: { slug: string }[]): { slug: string }[]`
  - `describeEventError(err: { code?: string; message?: string }): string`

- [ ] **Step 1: Write failing tests** in `tests/events-lib.test.ts` (local helper `ev(over)` builds a valid event):
  - `todayInKuching`: `2027-03-31T17:00:00Z` → `2027-04-01`; `2027-03-31T15:59:00Z` → `2027-03-31`.
  - `filterEvents` with today `2027-06-15`: event ending `2027-06-14` hidden; single-day event on `2027-06-15` shown; single-day `2027-06-14` hidden; unconfirmed event shown.
  - month `2027-06`: `2027-05-30`→`2027-06-02` shown; `2027-06-28`→`2027-07-02` shown; start `2027-07-01` hidden; unconfirmed hidden. Region and category filters combine with month.
  - `parseFilters`: `region=mars`, `month=2027-13`, `month=June`, `category=` all dropped; valid values kept.
  - `sortEvents`: featured first even when later; confirmed ascending; unconfirmed last.
  - `formatDates`: `12–14 Jun 2027`; `28 Jun – 2 Jul 2027`; `31 Dec 2027 – 2 Jan 2028`; single `5 Oct 2027`; unconfirmed with `date_note` `September 2027` → `September 2027`; unconfirmed without note → `Dates to be announced`.
  - `toIcs` (fixed `now` `2027-01-01T00:00:00Z`): 12–14 Jun contains `DTSTART;VALUE=DATE:20270612\r\n` and `DTEND;VALUE=DATE:20270615\r\n`; single `2027-02-28` → `DTEND` `20270301`; single `2027-12-31` → `20280101`; name `A, B; C\D` → `SUMMARY:A\, B\; C\\D`; `UID:<slug>@maritimeexpoasia.com`; contains `URL:` official site; every line at most 75 octets (long description folded with a leading space); unconfirmed → `null`.
  - `slugify`: `SMM Hamburg 2026!` → `smm-hamburg-2026`; `  Nor-Shipping  ` → `nor-shipping`; `Marintec China (Shanghai)` → `marintec-china-shanghai`; `Ünïcode Expo` → `unicode-expo`; `!!!` → ``.
  - `staticSlugs([])` → `[{slug:"none"}]`; `[{slug:"a"}]` → `[{slug:"a"}]`.
  - `describeEventError`: message containing `events_dates_order` → `End date cannot be before the start date.`; `events_confirmed_needs_start` → `Dates marked confirmed need a start date.`; `events_approved_complete` → `An approved event needs an official website, a source URL, a last-checked date and coordinates.`; code `23505` → `That slug is already used by another event.`; anything else → `Could not save the event. Please try again.`
- [ ] **Step 2: Run** `npm test` → FAIL (module not found).
- [ ] **Step 3: Implement `lib/events.ts`.** Use fixed English month abbreviations (not locale APIs). `todayInKuching` via `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuching" })`. `.ics`: CRLF line endings, `PRODID:-//Maritime Expo Asia//Events//EN`, `DTSTAMP` in UTC, escape `\` `;` `,` and newlines per RFC 5545, fold at 75 octets (count UTF-8 bytes), `DTEND` = (`end_date ?? start_date`) + 1 day computed in UTC.
- [ ] **Step 4: Run** `npm test` → all pass.
- [ ] **Step 5: Commit** `feat: events logic (filters, sorting, ics, errors)`.

---

### Task 3: Public data and the list page

**Files:**
- Create: `lib/supabase/public.ts`, `lib/events-data.ts`, `app/events/page.tsx`, `components/events/EventsExplorer.tsx`, `components/events/EventCard.tsx`
- Modify: `app/globals.css` only if needed

**Interfaces:**
- Consumes: `lib/events.ts` (Task 2), `components/ui.tsx`.
- Produces:
  - `publicClient(): SupabaseClient` in `lib/supabase/public.ts` (anon key from `SUPABASE_ANON_KEY`, `auth: { persistSession: false }`, no cookies).
  - `getApprovedEvents(): Promise<MaritimeEvent[]>` and `getApprovedEvent(slug: string): Promise<MaritimeEvent | null>` in `lib/events-data.ts`; both `'use cache'` with `cacheTag('events')` and `cacheLife('hours')`; they throw on a database error (never return an empty list for an error).
  - `<EventsExplorer events={MaritimeEvent[]} />` (client): reads `region`, `category`, `month`, `view` (`list` | `map`, default `list`) from `useSearchParams`; writes with `router.replace(?…, { scroll: false })`; filters with `filterEvents(events, filters, todayInKuching())` then `sortEvents`; month options are the current month plus the next 18; map branch is added in Task 4.
  - `<EventCard event={MaritimeEvent} />`: name (links to `/events/<slug>`), `formatDates`, `city, country`, category label, an `Our event` badge when `featured`, external `Official website` link (`target="_blank" rel="noopener noreferrer"`).

- [ ] **Step 1: Read** `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` (`use cache`, `cacheTag`, `cacheLife`).
- [ ] **Step 2: Implement** the files above. `app/events/page.tsx` uses `PageHeader` (eyebrow `Events`, title `Maritime Events Calendar`, one sentence on what the page lists), fetches `getApprovedEvents()`, renders `<Suspense fallback={null}><EventsExplorer .../></Suspense>` so the page stays static. Empty list → `Events calendar coming soon`; filters matching nothing → `No events match these filters.` with a clear-filters link.
- [ ] **Step 3: Run** `npm run lint` and `npm run build` → pass; `/events` listed as static (`○`).
- [ ] **Step 4: Manual check** (`npm run dev`, clear `.next` if styles look stale): the two own events show first with `September 2027` / `Late March 2027`; changing a filter updates the URL and survives reload; at 375px width nothing overflows.
- [ ] **Step 5: Commit** `feat: events list page with filters`.

---

### Task 4: Map view

**Files:**
- Create: `components/events/EventMap.tsx`
- Modify: `components/events/EventsExplorer.tsx`, `package.json`

**Interfaces:**
- Consumes: `MaritimeEvent` (Task 2), `EventsExplorer` (Task 3).
- Produces: `<EventMap events={MaritimeEvent[]} />` (client). Loaded only when `view=map` via `next/dynamic` with `ssr: false`, imported inside the client `EventsExplorer`. Uses the same already-filtered events as the list.

- [ ] **Step 1: `npm i leaflet` and `npm i -D @types/leaflet`.**
- [ ] **Step 2: Implement `EventMap`** with plain Leaflet inside `useEffect` (create the map on mount, `map.remove()` on unmount). Tiles `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with attribution `© OpenStreetMap contributors`. One `circleMarker` per event with coordinates (amber `#b45309` when featured, navy `#1f4e79` otherwise), so no marker image assets are needed. Popup content is built from DOM nodes (`textContent`, anchor `href` property), never an HTML string. Fit to markers (`padding [40,40]`, `maxZoom 5`); with no markers call `setView([20, 100], 2)`. Import `leaflet/dist/leaflet.css` in this file.
- [ ] **Step 3: Add the List | Map toggle** to `EventsExplorer` (writes `view`).
- [ ] **Step 4: Run** `npm run lint` and `npm run build` → pass.
- [ ] **Step 5: Manual check (Review Focus 2):** with the service client insert an approved `test-` event named `<img src=x onerror=alert(1)> & "Co"` at any coordinates; its popup shows the name as literal text and no alert fires; delete the row afterwards. Map view shows both own events at Sibu; map filters follow the list filters.
- [ ] **Step 6: Commit** `feat: events map view`.

---

### Task 5: Event page and `.ics` download

**Files:**
- Create: `app/events/[slug]/page.tsx`, `app/events/[slug]/ics/route.ts`

**Interfaces:**
- Consumes: `getApprovedEvent`, `getApprovedEvents` (Task 3); `toIcs`, `formatDates`, `staticSlugs` (Task 2).
- Produces: `GET /events/<slug>` and `GET /events/<slug>/ics`.

- [ ] **Step 1: Read** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` and `route.md` (params are a `Promise`; route handler context signature).
- [ ] **Step 2: Implement the page.** `generateStaticParams` returns `staticSlugs(await getApprovedEvents())`; unknown or non-approved slug → `notFound()`; `generateMetadata` uses name and description. Content: facts list (dates via `formatDates`, location, organiser, category), our description, `Visit official website` button, `Add to calendar` button only when `dates_confirmed && start_date`, `Last checked: <D Mon YYYY>`, back link to `/events`.
- [ ] **Step 3: Implement the route.** Unknown, non-approved or unconfirmed event → 404 response. Otherwise `toIcs(event)` with headers `Content-Type: text/calendar; charset=utf-8` and `Content-Disposition: attachment; filename="<slug>.ics"`.
- [ ] **Step 4: Run** `npm run lint` and `npm run build` → pass (both own events prerender).
- [ ] **Step 5: Manual check:** `/events/does-not-exist` is 404; `/events/maritime-expo-asia-2027/ics` is 404 (dates unconfirmed); insert an approved `test-` event with dates, open its `/ics`, import into a calendar app and confirm the span; set it `hidden` through SQL plus an admin save (Task 6) and confirm both URLs 404; delete the row.
- [ ] **Step 6: Commit** `feat: event pages and ics download`.

---

### Task 6: Admin events page

**Files:**
- Create: `app/admin/events/page.tsx`, `app/admin/events/actions.ts`, `components/admin/EventForm.tsx`
- Modify: `app/admin/layout.tsx` (add `Events` nav link)

**Interfaces:**
- Consumes: `requireAdmin`, `createClient` (platform plan Task 3); `slugify`, `describeEventError`, `todayInKuching` (Task 2).
- Produces (all `'use server'`, each calls `requireAdmin()` first and `updateTag('events')` after success):
  - `type EventInput = Omit<MaritimeEvent, "id" | "status"> & { id?: string; status: EventStatus }`
  - `saveEvent(input: EventInput): Promise<{ id?: string; error?: string }>`: blank slug becomes `slugify(name)`; errors go through `describeEventError`.
  - `setEventStatus(id: string, status: EventStatus): Promise<{ error?: string }>`
  - `markChecked(id: string): Promise<{ error?: string }>`: sets `last_checked` to `todayInKuching()`.
  - `deleteEvent(id: string): Promise<{ error?: string }>`

- [ ] **Step 1: Implement the actions and page.** List all events with a `?status=` filter, status chip, `Mark checked today`, status select and delete (confirm dialog); `?edit=<id>` or `?new=1` shows `EventForm` with every column. Errors appear above the form as text. Keep the admin page `robots: noindex` (inherited from the admin layout).
- [ ] **Step 2: Run** `npm run lint` and `npm run build` → pass.
- [ ] **Step 3: Manual check (Review Focus 5), signed in as admin:** (a) save a new event with blank slug → slug derived; (b) save another with the same name → `That slug is already used by another event.`; (c) approve an event with no source URL → the approved-complete message; (d) set end before start → the dates-order message; (e) set confirmed dates with no start date → the needs-start message; (f) after saving, the change shows on `/events` after one reload; (g) signed in as a non-admin, `/admin/events` redirects to login. Delete the test events.
- [ ] **Step 4: Commit** `feat: admin events editor`.

---

### Task 7: Site integration

**Files:**
- Modify: `components/Nav.tsx` (`LINKS` gets `{ href: "/events", label: "Events" }` between `March Summit` and `Contact`), `app/sitemap.ts`

**Interfaces:**
- Consumes: `getApprovedEvents` (Task 3).
- Produces: `sitemap()` returning `Promise<MetadataRoute.Sitemap>` that adds `/events` and `/events/<slug>` (with `lastModified` from `last_checked`) to the existing four routes.

- [ ] **Step 1: Implement** the two edits.
- [ ] **Step 2: Run** `npm run lint` and `npm run build` → pass.
- [ ] **Step 3: Manual check:** `/sitemap.xml` contains `/events` and both own-event URLs; the nav shows `Events` and its active state works on `/events` and `/events/<slug>`; mobile menu includes the link.
- [ ] **Step 4: Commit** `feat: events in nav and sitemap`.

---

### Task 8: Verified first data load and release checks

**Files:**
- Create: `supabase/seed/events.sql`, `docs/events-verification.md`, `tests/events-seed.test.ts`

**Interfaces:**
- Consumes: the schema from Task 1.
- Produces: 30 to 40 rows inserted with status `pending`; a table in `docs/events-verification.md` with columns event, official site, exact date text seen, date of check, notes.

- [ ] **Step 1: Write the failing test** `tests/events-seed.test.ts` (service client, rows where `featured = false` and `slug` not starting `test-`): count is at least 30; every row has `website_url` and `source_url` starting `https://`, `last_checked` equal to or after the migration date, latitude within -90..90 and longitude within -180..180, not both 0; slugs unique; every row with `dates_confirmed = true` has `start_date`; all four regions have at least 3 events.
- [ ] **Step 2: Run** `npm test` → FAIL (count below 30).
- [ ] **Step 3: Research and write `events.sql`.** For each event open the organiser's official site (built-in browser or `WebFetch`), copy the dates exactly as published into the verification table, and fill the row. Start from these candidates (names only; each date and venue must come from the official site) and add others until 30 or more: SMM (Hamburg), Nor-Shipping (Oslo), Marintec China (Shanghai), Sea Asia (Singapore), Singapore Maritime Week, Europort (Rotterdam), Posidonia (Athens), Offshore Northern Seas (Stavanger), Seatrade Cruise Global (Miami), Marine Money Week (New York), Indo Marine (Jakarta), Asia Pacific Maritime (Singapore). Rules: dates not yet published → `dates_confirmed false`, `date_note` null; event not found, cancelled or not maritime → leave out; description is one or two sentences in our own words; coordinates are city-level; no copied text, logos or images; `region` follows the venue country.
- [ ] **Step 4: Apply** `events.sql` with `execute_sql` (status `pending`), then run `npm test` → all pass.
- [ ] **Step 5: Owner review.** Ask the owner to open `/admin/events?status=pending` and `docs/events-verification.md`, and confirm. Only after a clear yes run: `update events set status = 'approved' where status = 'pending' and slug not like 'test-%'` (constraints will reject any incomplete row; list those back to the owner instead of forcing them).
- [ ] **Step 6: Release checks:** `npm test`, `npm run lint`, `npm run build` all pass; content grep from the platform plan (`awang|johari|uggah|premier|RM ?[0-9]|borneo|BIMW|\[TBC`) finds nothing in `app/` or `components/` other than the footer entity; Review Focus 1 to 5 each verified once on the deployed preview (import an `.ics`, hostile-name popup, month boundary filter, an ended event hidden, duplicate-slug message); `/events` has no event without an official link.
- [ ] **Step 7: Commit** `feat: verified first events load` (SQL, verification doc, test), then deploy and confirm `/events` and one event page on the live URL.

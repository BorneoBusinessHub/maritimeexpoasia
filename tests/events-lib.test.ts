import assert from "node:assert/strict";
import test from "node:test";
import {
  describeEventError,
  filterEvents,
  formatDate,
  formatDates,
  parseFilters,
  slugify,
  sortEvents,
  staticSlugs,
  todayInKuching,
  toIcs,
  type MaritimeEvent,
} from "../lib/events.ts";

let n = 0;
function ev(over: Partial<MaritimeEvent> = {}): MaritimeEvent {
  n += 1;
  return {
    id: `id-${n}`,
    slug: `event-${n}`,
    name: `Event ${n}`,
    start_date: "2027-06-12",
    end_date: "2027-06-14",
    dates_confirmed: true,
    date_note: null,
    city: "Singapore",
    country: "Singapore",
    region: "asia_pacific",
    venue: null,
    latitude: 1.35,
    longitude: 103.82,
    organiser: null,
    category: "exhibition",
    description: null,
    website_url: "https://example.org",
    source_url: "https://example.org/dates",
    last_checked: "2026-10-21",
    status: "approved",
    featured: false,
    ...over,
  };
}
const unconfirmed = (over: Partial<MaritimeEvent> = {}) =>
  ev({ start_date: null, end_date: null, dates_confirmed: false, ...over });

test("todayInKuching uses Sarawak time, not UTC", () => {
  assert.equal(todayInKuching(new Date("2027-03-31T17:00:00Z")), "2027-04-01");
  assert.equal(todayInKuching(new Date("2027-03-31T15:59:00Z")), "2027-03-31");
});

test("filterEvents hides ended events and keeps today's", () => {
  const today = "2027-06-15";
  const ended = ev({ start_date: "2027-06-10", end_date: "2027-06-14" });
  const lastDay = ev({ start_date: "2027-06-15", end_date: null });
  const yesterday = ev({ start_date: "2027-06-14", end_date: null });
  const tbc = unconfirmed();
  const out = filterEvents([ended, lastDay, yesterday, tbc], {}, today);
  assert.deepEqual(out.map((e) => e.id).sort(), [lastDay.id, tbc.id].sort());
});

test("filterEvents month filter overlaps boundaries and drops unconfirmed", () => {
  const today = "2027-01-01";
  const intoJune = ev({ start_date: "2027-05-30", end_date: "2027-06-02" });
  const outOfJune = ev({ start_date: "2027-06-28", end_date: "2027-07-02" });
  const july = ev({ start_date: "2027-07-01", end_date: "2027-07-03" });
  const tbc = unconfirmed();
  const out = filterEvents([intoJune, outOfJune, july, tbc], { month: "2027-06" }, today);
  assert.deepEqual(out.map((e) => e.id).sort(), [intoJune.id, outOfJune.id].sort());
  const may = filterEvents([intoJune, outOfJune, july, tbc], { month: "2027-05" }, today);
  assert.deepEqual(may.map((e) => e.id), [intoJune.id]);
});

test("filterEvents combines region, category and month", () => {
  const today = "2027-01-01";
  const a = ev({ region: "europe", category: "conference" });
  const b = ev({ region: "europe", category: "exhibition" });
  const c = ev({ region: "asia_pacific", category: "conference" });
  assert.deepEqual(
    filterEvents([a, b, c], { region: "europe", category: "conference", month: "2027-06" }, today).map((e) => e.id),
    [a.id],
  );
});

test("parseFilters drops invalid values and keeps valid ones", () => {
  assert.deepEqual(parseFilters(new URLSearchParams("region=mars&month=2027-13&category=")), {});
  assert.deepEqual(parseFilters(new URLSearchParams("month=June")), {});
  assert.deepEqual(parseFilters(new URLSearchParams("region=europe&category=conference&month=2027-06")), {
    region: "europe",
    category: "conference",
    month: "2027-06",
  });
});

test("sortEvents puts featured first, then dates ascending, unconfirmed last", () => {
  const late = ev({ start_date: "2027-09-01", end_date: null, name: "Late" });
  const early = ev({ start_date: "2027-02-01", end_date: null, name: "Early" });
  const tie2 = ev({ start_date: "2027-02-01", end_date: null, name: "Zed" });
  const tbc = unconfirmed({ name: "Aaa TBC" });
  const pinned = ev({ start_date: "2028-01-01", end_date: null, name: "Pinned", featured: true });
  assert.deepEqual(
    sortEvents([late, tbc, tie2, pinned, early]).map((e) => e.name),
    ["Pinned", "Early", "Zed", "Late", "Aaa TBC"],
  );
});

test("formatDates handles ranges, year change, single day and unconfirmed", () => {
  assert.equal(formatDates(ev({ start_date: "2027-06-12", end_date: "2027-06-14" })), "12–14 Jun 2027");
  assert.equal(formatDates(ev({ start_date: "2027-06-28", end_date: "2027-07-02" })), "28 Jun – 2 Jul 2027");
  assert.equal(formatDates(ev({ start_date: "2027-12-31", end_date: "2028-01-02" })), "31 Dec 2027 – 2 Jan 2028");
  assert.equal(formatDates(ev({ start_date: "2027-10-05", end_date: null })), "5 Oct 2027");
  assert.equal(formatDates(unconfirmed({ date_note: "September 2027" })), "September 2027");
  assert.equal(formatDates(unconfirmed()), "Dates to be announced");
});

test("formatDate writes a single date in words", () => {
  assert.equal(formatDate("2026-10-21"), "21 Oct 2026");
  assert.equal(formatDate("2027-01-05"), "5 Jan 2027");
});

test("toIcs makes all-day events with an exclusive DTEND", () => {
  const now = new Date("2027-01-01T00:00:00Z");
  const ics = toIcs(ev({ slug: "smm", start_date: "2027-06-12", end_date: "2027-06-14" }), now)!;
  assert.match(ics, /DTSTART;VALUE=DATE:20270612\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20270615\r\n/);
  assert.match(ics, /UID:smm@maritimeexpoasia\.com\r\n/);
  assert.match(ics, /URL:https:\/\/example\.org\r\n/);
  assert.match(ics, /DTSTAMP:20270101T000000Z\r\n/);
  assert.match(toIcs(ev({ start_date: "2027-02-28", end_date: null }), now)!, /DTEND;VALUE=DATE:20270301\r\n/);
  assert.match(toIcs(ev({ start_date: "2027-12-31", end_date: null }), now)!, /DTEND;VALUE=DATE:20280101\r\n/);
});

test("toIcs escapes text and folds lines to 75 octets", () => {
  const now = new Date("2027-01-01T00:00:00Z");
  const ics = toIcs(ev({ name: "A, B; C\\D", description: "é".repeat(120) + "\nsecond line" }), now)!;
  assert.match(ics, /SUMMARY:A\\, B\\; C\\\\D\r\n/);
  assert.match(ics, /\\n/);
  for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75, `line too long: ${line}`);
});

test("toIcs returns null when dates are unconfirmed", () => {
  assert.equal(toIcs(unconfirmed()), null);
});

test("slugify makes safe url names", () => {
  assert.equal(slugify("SMM Hamburg 2026!"), "smm-hamburg-2026");
  assert.equal(slugify("  Nor-Shipping  "), "nor-shipping");
  assert.equal(slugify("Marintec China (Shanghai)"), "marintec-china-shanghai");
  assert.equal(slugify("Ünïcode Expo"), "unicode-expo");
  assert.equal(slugify("!!!"), "");
});

test("staticSlugs never returns an empty list", () => {
  assert.deepEqual(staticSlugs([]), [{ slug: "none" }]);
  assert.deepEqual(staticSlugs([{ slug: "a" }]), [{ slug: "a" }]);
});

test("describeEventError turns database errors into readable text", () => {
  assert.equal(
    describeEventError({ message: 'violates check constraint "events_dates_order"' }),
    "End date cannot be before the start date.",
  );
  assert.equal(
    describeEventError({ message: 'violates check constraint "events_confirmed_needs_start"' }),
    "Dates marked confirmed need a start date.",
  );
  assert.equal(
    describeEventError({ message: 'violates check constraint "events_approved_complete"' }),
    "An approved event needs an official website, a source URL, a last-checked date and coordinates.",
  );
  assert.equal(describeEventError({ code: "23505", message: "duplicate key" }), "That slug is already used by another event.");
  assert.equal(describeEventError({ message: "boom" }), "Could not save the event. Please try again.");
});

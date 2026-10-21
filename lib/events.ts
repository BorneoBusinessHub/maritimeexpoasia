// Pure event logic. No framework or database imports, so it runs under `node --test` as well as in Next.
// Dates are plain YYYY-MM-DD strings (all-day events, no time zones except "today" in Sarawak).

export const REGIONS = ["asia_pacific", "europe", "middle_east_africa", "americas"] as const;
export const CATEGORIES = ["exhibition", "conference", "exhibition_conference"] as const;
export const STATUSES = ["pending", "approved", "hidden"] as const;
export type Region = (typeof REGIONS)[number];
export type Category = (typeof CATEGORIES)[number];
export type EventStatus = (typeof STATUSES)[number];

export type MaritimeEvent = {
  id: string;
  slug: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  dates_confirmed: boolean;
  date_note: string | null;
  city: string;
  country: string;
  region: Region;
  venue: string | null;
  latitude: number | null;
  longitude: number | null;
  organiser: string | null;
  category: Category;
  description: string | null;
  website_url: string;
  source_url: string;
  last_checked: string;
  status: EventStatus;
  featured: boolean;
};

export type Filters = { region?: Region; category?: Category; month?: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseFilters(params: URLSearchParams): Filters {
  const filters: Filters = {};
  const region = params.get("region");
  const category = params.get("category");
  const month = params.get("month");
  if (region && (REGIONS as readonly string[]).includes(region)) filters.region = region as Region;
  if (category && (CATEGORIES as readonly string[]).includes(category)) filters.category = category as Category;
  if (month && MONTH_RE.test(month)) filters.month = month;
  return filters;
}

// "Today" for a Sarawak audience, as YYYY-MM-DD.
export function todayInKuching(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuching",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// An event has usable dates only when confirmed and a start date exists.
function hasDates(e: MaritimeEvent): e is MaritimeEvent & { start_date: string } {
  return e.dates_confirmed && e.start_date !== null;
}

export function filterEvents(events: MaritimeEvent[], filters: Filters, today: string): MaritimeEvent[] {
  return events.filter((e) => {
    if (filters.region && e.region !== filters.region) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (hasDates(e)) {
      const end = e.end_date ?? e.start_date;
      if (end < today) return false;
      if (filters.month) {
        // String compare works for YYYY-MM-DD: overlap with the month.
        if (e.start_date > `${filters.month}-31` || end < `${filters.month}-01`) return false;
      }
    } else if (filters.month) {
      return false;
    }
    return true;
  });
}

export function sortEvents(events: MaritimeEvent[]): MaritimeEvent[] {
  return [...events].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const aDated = hasDates(a);
    const bDated = hasDates(b);
    if (aDated !== bDated) return aDated ? -1 : 1;
    if (aDated && bDated && a.start_date !== b.start_date) return a.start_date! < b.start_date! ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m: MONTHS[m - 1], d };
}

export function formatDates(e: MaritimeEvent): string {
  if (!hasDates(e)) return e.date_note ?? "Dates to be announced";
  const s = parts(e.start_date);
  if (!e.end_date || e.end_date === e.start_date) return `${s.d} ${s.m} ${s.y}`;
  const t = parts(e.end_date);
  if (s.y !== t.y) return `${s.d} ${s.m} ${s.y} – ${t.d} ${t.m} ${t.y}`;
  if (s.m !== t.m) return `${s.d} ${s.m} – ${t.d} ${t.m} ${t.y}`;
  return `${s.d}–${t.d} ${t.m} ${t.y}`;
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}

// RFC 5545: lines are at most 75 octets; continuation lines start with one space.
function icsFold(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const size = Buffer.byteLength(ch);
    if (bytes + size > limit) {
      out.push(current);
      current = " ";
      bytes = 1;
      limit = 75;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n");
}

function compact(date: string): string {
  return date.replace(/-/g, "");
}

// All-day DTEND is exclusive, so it is the last day plus one.
function nextDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

export function toIcs(e: MaritimeEvent, now: Date = new Date()): string | null {
  if (!hasDates(e)) return null;
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const location = [e.venue, e.city, e.country].filter(Boolean).join(", ");
  const description = [e.description, `Official site: ${e.website_url}`].filter(Boolean).join("\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maritime Expo Asia//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@maritimeexpoasia.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(e.start_date)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(e.end_date ?? e.start_date))}`,
    `SUMMARY:${icsEscape(e.name)}`,
    `LOCATION:${icsEscape(location)}`,
    `URL:${e.website_url}`,
    `DESCRIPTION:${icsEscape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(icsFold).join("\r\n") + "\r\n";
}

export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// With Cache Components, generateStaticParams may not return an empty list.
export function staticSlugs(events: { slug: string }[]): { slug: string }[] {
  return events.length ? events.map((e) => ({ slug: e.slug })) : [{ slug: "none" }];
}

export function describeEventError(err: { code?: string; message?: string }): string {
  const message = err.message ?? "";
  if (message.includes("events_dates_order")) return "End date cannot be before the start date.";
  if (message.includes("events_confirmed_needs_start")) return "Dates marked confirmed need a start date.";
  if (message.includes("events_approved_complete"))
    return "An approved event needs an official website, a source URL, a last-checked date and coordinates.";
  if (err.code === "23505") return "That slug is already used by another event.";
  return "Could not save the event. Please try again.";
}

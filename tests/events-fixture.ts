import { randomUUID } from "node:crypto";

// A valid approved event row for tests. Slugs start with `test-` so cleanup can find them.
export function eventRow(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: `test-${randomUUID().slice(0, 8)}`,
    name: "Test Event",
    start_date: "2027-06-12",
    end_date: "2027-06-14",
    dates_confirmed: true,
    city: "Singapore",
    country: "Singapore",
    region: "asia_pacific",
    latitude: 1.35,
    longitude: 103.82,
    category: "exhibition",
    website_url: "https://example.org",
    source_url: "https://example.org/dates",
    last_checked: "2026-10-21",
    status: "approved",
    tier: "listed",
    ...over,
  };
}

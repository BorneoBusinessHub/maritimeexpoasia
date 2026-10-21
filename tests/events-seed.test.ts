import assert from "node:assert/strict";
import test from "node:test";
import { service } from "./supabase.ts";

// The first data load: events other than our own two. Rows are pending until the owner approves them,
// so this reads with the service key.
async function loaded() {
  const { data, error } = await service()
    .from("events")
    .select("slug,region,dates_confirmed,start_date,website_url,source_url,last_checked,latitude,longitude")
    .eq("featured", false)
    .not("slug", "like", "test-%");
  assert.equal(error, null);
  return data ?? [];
}

test("at least 30 events are loaded", async () => {
  assert.ok((await loaded()).length >= 30);
});

test("every event has https links, a recent check date and sane coordinates", async () => {
  for (const e of await loaded()) {
    assert.match(e.website_url, /^https:\/\//, e.slug);
    assert.match(e.source_url, /^https:\/\//, e.slug);
    assert.ok(e.last_checked >= "2026-10-21", e.slug);
    assert.ok(e.latitude >= -90 && e.latitude <= 90, e.slug);
    assert.ok(e.longitude >= -180 && e.longitude <= 180, e.slug);
    assert.ok(!(e.latitude === 0 && e.longitude === 0), e.slug);
  }
});

test("confirmed dates always have a start date", async () => {
  for (const e of await loaded()) if (e.dates_confirmed) assert.ok(e.start_date, e.slug);
});

test("every region has at least 3 events", async () => {
  const rows = await loaded();
  for (const r of ["asia_pacific", "europe", "middle_east_africa", "americas"]) {
    assert.ok(rows.filter((e) => e.region === r).length >= 3, r);
  }
});

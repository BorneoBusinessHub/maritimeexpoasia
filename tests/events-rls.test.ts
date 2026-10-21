import assert from "node:assert/strict";
import { after, test } from "node:test";
import { eventRow } from "./events-fixture.ts";
import { anon, service, signedInAs } from "./supabase.ts";

const cleanups: Array<() => Promise<void>> = [];
after(async () => {
  await service().from("events").delete().like("slug", "test-%");
  for (const c of cleanups) await c();
});

async function admin() {
  const u = await signedInAs(`events-admin-${Date.now()}@maritimeexpoasia.com`, true);
  cleanups.push(u.cleanup);
  return u.client;
}

test("anon sees only approved events", async () => {
  const approved = eventRow();
  const pending = eventRow({ status: "pending" });
  const hidden = eventRow({ status: "hidden" });
  const { error } = await service().from("events").insert([approved, pending, hidden]);
  assert.equal(error, null);
  const { data } = await anon().from("events").select("slug").like("slug", "test-%");
  assert.deepEqual(data?.map((r) => r.slug), [approved.slug]);
});

test("non-admin cannot insert events", async () => {
  const u = await signedInAs(`events-user-${Date.now()}@maritimeexpoasia.com`, false);
  cleanups.push(u.cleanup);
  const { error } = await u.client.from("events").insert(eventRow());
  assert.notEqual(error, null);
});

test("approved without source_url fails", async () => {
  const { error } = await (await admin()).from("events").insert(eventRow({ source_url: null }));
  assert.match(error?.message ?? "", /events_approved_complete/);
});

test("approved without coordinates fails but pending succeeds", async () => {
  const c = await admin();
  const bad = await c.from("events").insert(eventRow({ latitude: null, longitude: null }));
  assert.match(bad.error?.message ?? "", /events_approved_complete/);
  const ok = await c.from("events").insert(eventRow({ latitude: null, longitude: null, status: "pending" }));
  assert.equal(ok.error, null);
});

test("end before start fails", async () => {
  const { error } = await (await admin())
    .from("events")
    .insert(eventRow({ start_date: "2027-06-14", end_date: "2027-06-12" }));
  assert.match(error?.message ?? "", /events_dates_order/);
});

test("confirmed dates need a start date", async () => {
  const { error } = await (await admin())
    .from("events")
    .insert(eventRow({ dates_confirmed: true, start_date: null, end_date: null }));
  assert.match(error?.message ?? "", /events_confirmed_needs_start/);
});

test("website and source links must be http(s)", async () => {
  const { error } = await (await admin()).from("events").insert(eventRow({ website_url: "javascript:alert(1)" }));
  assert.match(error?.message ?? "", /events_urls_http/);
});

test("own events are seeded with their tiers", async () => {
  const { data } = await anon().from("events").select("slug,tier").in("tier", ["anchor", "cohosted"]);
  const tiers = Object.fromEntries((data ?? []).map((r) => [r.slug, r.tier]));
  assert.equal(tiers["maritime-expo-asia-2027"], "anchor");
  assert.equal(tiers["sarawak-maritime-industry-summit-2027"], "cohosted");
});

test("a second anchor is rejected", async () => {
  const { error } = await (await admin()).from("events").insert(eventRow({ tier: "anchor" }));
  assert.match(error?.message ?? "", /events_one_anchor/);
});

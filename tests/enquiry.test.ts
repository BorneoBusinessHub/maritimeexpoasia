import assert from "node:assert/strict";
import test from "node:test";
import { pickEventSlug, resolveEventSlug, shouldRetryUntagged } from "../lib/enquiry.ts";

const approved = [{ slug: "smm" }, { slug: "maritime-expo-asia-2027" }];

test("pickEventSlug keeps a slug that matches an approved event", () => {
  assert.equal(pickEventSlug("smm", approved), "smm");
});

test("pickEventSlug drops empty, unknown or altered values instead of failing", () => {
  assert.equal(pickEventSlug("", approved), null);
  assert.equal(pickEventSlug("no-such-event", approved), null);
  assert.equal(pickEventSlug("SMM ", approved), null);
  assert.equal(pickEventSlug("smm", []), null);
});

test("resolveEventSlug never lets a failed event lookup lose the lead", async () => {
  assert.equal(await resolveEventSlug("smm", async () => approved), "smm");
  assert.equal(
    await resolveEventSlug("smm", async () => {
      throw new Error("events query failed");
    }),
    null,
  );
  assert.equal(await resolveEventSlug("", async () => approved), null);
});

test("shouldRetryUntagged only for a foreign-key failure on the event tag", () => {
  assert.equal(shouldRetryUntagged(409, '{"code":"23503","message":"violates foreign key constraint \\"enquiries_event_slug_fkey\\""}'), true);
  assert.equal(shouldRetryUntagged(409, '{"code":"23505"}'), false);
  assert.equal(shouldRetryUntagged(500, ""), false);
});

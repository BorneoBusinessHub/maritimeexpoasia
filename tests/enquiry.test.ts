import assert from "node:assert/strict";
import test from "node:test";
import { pickEventSlug } from "../lib/enquiry.ts";

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

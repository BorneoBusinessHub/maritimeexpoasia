import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { anon, service, signedInAs } from "./supabase.ts";

const svc = () => service();
let enquiryId: string;
const cleanups: Array<() => Promise<void>> = [];

before(async () => {
  const { data, error } = await svc()
    .from("enquiries")
    .insert({ type: "contact", name: "RLS test", email: "rls-test@example.org", consent: true })
    .select("id")
    .single();
  if (error) throw error;
  enquiryId = data.id;
});

after(async () => {
  await svc().from("enquiries").delete().eq("id", enquiryId);
  for (const c of cleanups) await c();
});

test("non-admin user reads no enquiries", async () => {
  const u = await signedInAs("nonadmin+test@maritimeexpoasia.com", false);
  cleanups.push(u.cleanup);
  const { data } = await u.client.from("enquiries").select("id");
  assert.deepEqual(data, []);
});

test("admin reads enquiries and sees the default status", async () => {
  const u = await signedInAs("admin+test@maritimeexpoasia.com", true);
  cleanups.push(u.cleanup);
  const { data, error } = await u.client.from("enquiries").select("id,status").eq("id", enquiryId);
  assert.equal(error, null);
  assert.equal(data?.length, 1);
  assert.equal(data?.[0].status, "new");
});

test("admin check ignores email case", async () => {
  const u = await signedInAs("Admin+Case@maritimeexpoasia.com", false);
  cleanups.push(u.cleanup);
  await svc().from("admins").insert({ email: "admin+case@maritimeexpoasia.com" });
  cleanups.push(async () => void (await svc().from("admins").delete().eq("email", "admin+case@maritimeexpoasia.com")));
  const { data } = await u.client.from("enquiries").select("id").eq("id", enquiryId);
  assert.equal(data?.length, 1);
});

test("anon cannot read admins or enquiries", async () => {
  assert.deepEqual((await anon().from("admins").select("email")).data, []);
  assert.deepEqual((await anon().from("enquiries").select("id")).data, []);
});

# Proof Engine Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the Phase 1 site live, then add an email-login `/admin` with lead follow-up (status, owner, WhatsApp link, CSV) and owner-controlled proof content (partner logos, shipyard directory, public stats) that shows only when published with consent.

**Architecture:** Public pages stay static; proof sections read Supabase through `'use cache'` functions tagged per table and refreshed with `updateTag` after admin saves. `/admin` uses the signed-in user's Supabase session (anon key + cookies), so Postgres RLS (`is_admin()`) is the only gatekeeper; the service role key stays limited to the public form insert in `app/actions.ts`.

**Tech Stack:** Next.js 16.4 (App Router, `cacheComponents: true`, `proxy.ts` not middleware), Supabase (Postgres, Auth magic link, Storage), `@supabase/supabase-js` + `@supabase/ssr`, Resend REST API, Vercel. Tests: Node 24 built-in `node --test` running `.ts` files directly.

**Spec:** `docs/superpowers/specs/2026-10-21-platform-direction-design.md`

## Global Constraints

- Read `node_modules/next/dist/docs/` before using any Next API; this Next version differs from training data (see `AGENTS.md`).
- Content rules in `CLAUDE.md` apply to every public string: no VIP names or titles, no prices, no speakers, no invented numbers, `[TBC]` items hidden.
- Numbers come only from real records; the owner approves each before it is public. Logos and directory entries need written consent: `published` cannot be true while `consent_at` is null.
- Only new runtime dependencies allowed: `@supabase/supabase-js`, `@supabase/ssr`.
- Service role key never reaches a client component or `/admin` code.
- Supabase region: Singapore (`ap-southeast-1`). Project name: `maritimeexpoasia`.
- Lead status values exactly: `new`, `contacted`, `negotiating`, `won`, `lost` (default `new`).
- Partner kinds exactly: `exhibitor`, `sponsor`, `supporter`.
- Tests needing a database run against the Supabase project with `node --env-file=.env.local --test`; each test deletes the rows and users it creates.

## Review Focus

1. A lead types `=HYPERLINK(...)` or `+60...` into a form field, then an admin opens the CSV export in Excel: the cell must show as text, not run as a formula. (Task 2 test `csv neutralises formulas`.)
2. Phones arrive as `012-345 6789`, `+65 9123 4567`, `60123456789`, empty, or junk: the WhatsApp link must be right or absent, never a broken `wa.me/` link. (Task 2 tests.)
3. Anyone can request a magic link, so a signed-in non-admin must see no leads and change nothing. (Task 3 test `non-admin user reads no enquiries`; Task 4 test `non-admin cannot update status`.)
4. An admin ticks "published" on a partner or shipyard with no consent date: the save must fail with a clear message, not silently publish. (Task 5 test `publish without consent fails` for both tables; Task 6 shows the DB error text.)
5. Nothing published yet: proof sections must render nothing, not an empty heading or "0 shipyards". (Task 6 Step 5 manual check with empty tables.)

---

### Task 1: Provision Supabase and Vercel, put Phase 1 live

**Files:**
- Modify: `components/EnquiryForm.tsx` (attendee list order), `app/page.tsx` (register section line), `package.json` (test script), `tsconfig.json`
- Create: `.env.local` (not committed), `tests/env.test.ts`

**Interfaces:**
- Produces: env vars `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `NOTIFY_EMAIL`; npm script `test`.

- [ ] **Step 1: Owner sets git identity; commit the Phase 1 work and spec** (blocked until owner runs `git config --global user.email ...` and `user.name`). Commit message: `Phase 1 site and platform direction spec`.
- [ ] **Step 2: Create Supabase project** `maritimeexpoasia` in `ap-southeast-1` via Supabase MCP (`get_cost` → `confirm_cost` → `create_project`, owner approves cost). Apply `supabase/migrations/0001_enquiries.sql` with `apply_migration`.
- [ ] **Step 3: Write `.env.local`** from `get_project_url` / `get_publishable_keys`; owner pastes service role key, `RESEND_API_KEY`, `NOTIFY_EMAIL`. Add `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.example`.
- [ ] **Step 4: Test harness.** `package.json`: `"test": "node --env-file=.env.local --test tests/"`. `tsconfig.json`: `"allowImportingTsExtensions": true`. Write `tests/env.test.ts`:

```ts
test("anon cannot read enquiries", async () => {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/enquiries?select=id`, { headers: { apikey: process.env.SUPABASE_ANON_KEY! } });
  assert.deepEqual(await r.json(), []);
});
```

- [ ] **Step 5: Run** `npm test`. Expected: 1 pass.
- [ ] **Step 6: Form copy.** `ATTENDEE_TYPES` order: `Shipyard`, `Buyer`, then the rest. Home register line: `Shipyards and buyers: register now to meet suppliers in September.`
- [ ] **Step 7: Manual smoke** `npm run dev`, submit the home form → row in `enquiries` (`execute_sql select type,email from enquiries`), email arrives at `NOTIFY_EMAIL`. Delete the test row.
- [ ] **Step 8: Deploy.** Create Vercel project from the repo, set env vars (Production + Preview), deploy; submit form on the preview URL → row appears.
- [ ] **Step 9: Domain + Resend DNS.** Add `maritimeexpoasia.com` in Vercel and the sender domain in Resend; owner adds the DNS records both show. Verified when Vercel shows "Valid Configuration" and Resend shows "Verified".
- [ ] **Step 10: Commit** `tests/`, `package.json`, `tsconfig.json`, `.env.example`, form and home changes: `feat: go live setup, shipyard/buyer emphasis`.

---

### Task 2: Lead helpers (WhatsApp link, CSV) and WhatsApp link in notice email

**Files:**
- Create: `lib/whatsapp.ts`, `lib/csv.ts`, `tests/whatsapp.test.ts`, `tests/csv.test.ts`
- Modify: `app/actions.ts` (`notify`)

**Interfaces:**
- Produces: `waLink(phone: string | null): string | null`; `toCsv(rows: Record<string, unknown>[], columns: string[]): string`.

- [ ] **Step 1: Write failing tests** (import from `../lib/whatsapp.ts`, `../lib/csv.ts`):

```ts
// whatsapp
assert.equal(waLink("012-345 6789"), "https://wa.me/60123456789");   // MY local 0 → 60
assert.equal(waLink("+65 9123 4567"), "https://wa.me/6591234567");
assert.equal(waLink("60123456789"), "https://wa.me/60123456789");
assert.equal(waLink(""), null);
assert.equal(waLink("call me"), null);
assert.equal(waLink("12345"), null);                                // < 8 digits
// csv
assert.equal(toCsv([{ a: "x,y", b: 'say "hi"' }], ["a", "b"]), 'a,b\r\n"x,y","say ""hi"""\r\n');
assert.equal(toCsv([{ a: "=HYPERLINK(1)" }], ["a"]), "a\r\n'=HYPERLINK(1)\r\n");   // test name: csv neutralises formulas
assert.equal(toCsv([{ a: "+60123" }, { a: null }], ["a"]), "a\r\n'+60123\r\n\r\n");
assert.equal(toCsv([{ d: { tables: "2" } }], ["d"]), 'd\r\n"{""tables"":""2""}"\r\n'); // objects → JSON
```

- [ ] **Step 2: Run** `npm test` → FAIL (module not found).
- [ ] **Step 3: Implement** `waLink` (strip non-digits; leading `0` → prefix `60`; reject < 8 digits) and `toCsv` (header row, CRLF, quote when value has `,` `"` `\r` `\n`, prefix `'` when value starts with `=`,`+`,`-`,`@`, objects via `JSON.stringify`).
- [ ] **Step 4: Run** `npm test` → all pass.
- [ ] **Step 5: Notice email.** In `notify`, add line `WhatsApp: <waLink(phone)>` when not null, and a link `Open in admin: https://maritimeexpoasia.com/admin/leads`.
- [ ] **Step 6: Commit** `feat: whatsapp link and csv helpers`.

---

### Task 3: Admin auth and RLS foundation

**Files:**
- Create: `supabase/migrations/0002_admin.sql`, `lib/supabase/server.ts`, `lib/supabase/browser.ts`, `lib/admin.ts`, `proxy.ts`, `app/admin/login/page.tsx`, `app/admin/auth/callback/route.ts`, `app/admin/layout.tsx`, `app/admin/page.tsx`, `tests/supabase.ts`, `tests/admin-rls.test.ts`
- Modify: `package.json` (deps)

**Interfaces:**
- Consumes: env from Task 1.
- Produces:
  - SQL: table `admins(email text primary key)`; function `is_admin() returns boolean` (security definer, `exists(select 1 from admins where email = auth.jwt()->>'email')`); `enquiries.status lead_status not null default 'new'`, `enquiries.owner text`; policies on `enquiries`: admin select, admin update.
  - `createClient(): Promise<SupabaseClient>` in `lib/supabase/server.ts` (`@supabase/ssr` `createServerClient` with `cookies()`).
  - `requireAdmin(): Promise<{ email: string }>` in `lib/admin.ts`: redirects to `/admin/login` if no user or `is_admin()` rpc is false.
  - Test helpers in `tests/supabase.ts`: `anon()`, `service()`, `signedInAs(email: string, admin: boolean): Promise<{ client: SupabaseClient; cleanup(): Promise<void> }>` (creates user with password via service admin API, inserts into `admins` when `admin`, signs in with password).

- [ ] **Step 1:** `npm i @supabase/supabase-js @supabase/ssr`.
- [ ] **Step 2: Write failing tests** `tests/admin-rls.test.ts` (seed one enquiry with `service()`, delete in `after`):
  - `non-admin user reads no enquiries`: `signedInAs("nonadmin+test@maritimeexpoasia.com", false)` select → `[]`.
  - `admin reads enquiries`: admin select → length ≥ 1, row has `status === "new"`.
  - `anon cannot read admins`: `anon().from("admins").select()` → `[]`.
- [ ] **Step 3: Run** `npm test` → FAIL (no `status` column / no policy).
- [ ] **Step 4: Write and apply `0002_admin.sql`** (`create type lead_status as enum ('new','contacted','negotiating','won','lost')`; RLS on `admins` with no policies; seed owner email `hii.ruhiik@gmail.com` only after owner confirms it is the admin login).
- [ ] **Step 5: Run** `npm test` → pass.
- [ ] **Step 6: Auth flow.** Read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`. `proxy.ts` refreshes the Supabase session for `/admin/:path*` only. Login page: email field → `signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: <origin>/admin/auth/callback } })`; message "Check your email". Callback route exchanges the code and redirects to `/admin/leads`. `app/admin/layout.tsx` calls `requireAdmin()` (login page sits outside the guard, e.g. route group), shows nav Leads / Partners / Shipyards / Stats and sign-out. `app/admin/page.tsx` redirects to `/admin/leads`. Add `robots: { index: false }` metadata on the admin layout.
- [ ] **Step 7: Supabase Auth settings:** Site URL `https://maritimeexpoasia.com`; redirect URLs include `http://localhost:3000/admin/auth/callback` and the Vercel preview pattern; SMTP set to Resend so login emails come from the domain.
- [ ] **Step 8: Manual check:** owner email → link → lands on `/admin/leads`; a non-admin email gets no email (shouldCreateUser false); visiting `/admin/leads` signed out → `/admin/login`.
- [ ] **Step 9: `npm run build`** passes (public routes still `○ Static`). Commit `feat: admin auth and RLS`.

---

### Task 4: Leads page (list, filter, status/owner, CSV)

**Files:**
- Create: `app/admin/leads/page.tsx`, `app/admin/leads/actions.ts`, `app/admin/leads/export/route.ts`, `tests/leads.test.ts`
- Modify: `lib/enquiry.ts`

**Interfaces:**
- Consumes: `createClient`, `requireAdmin` (Task 3); `waLink`, `toCsv` (Task 2).
- Produces: in `lib/enquiry.ts`, `LEAD_STATUSES = ["new","contacted","negotiating","won","lost"] as const` and `type LeadStatus`; `updateLead(id: string, patch: { status?: LeadStatus; owner?: string | null }): Promise<{ error?: string }>`; `GET /admin/leads/export?status=&type=` → `text/csv`, filename `leads-YYYY-MM-DD.csv`.

- [ ] **Step 1: Write failing tests** `tests/leads.test.ts`:
  - `admin can update status`: admin client update `status: "contacted"` → re-select shows `contacted`.
  - `non-admin cannot update status`: non-admin update → re-select with `service()` still `new`.
  - `invalid status rejected`: admin update `status: "maybe"` → `error` not null.
- [ ] **Step 2: Run** → FAIL only if Task 3 policies are wrong; if all pass, the tests pin Task 3's update policy (keep them).
- [ ] **Step 3: Page.** Server component, newest first, filters `status` and `type` from search params; columns: date, type, name, company, email, phone (with WhatsApp link from `waLink`, `target="_blank"`), details, message, status select, owner input. Status/owner changes call `updateLead`, which calls `revalidatePath('/admin/leads')` on success. Mobile: card list below `sm`.
- [ ] **Step 4: Export route.** Calls `requireAdmin()`, same filters, columns `created_at,type,name,company,role,email,phone,status,owner,details,message`, returns `toCsv` output with `Content-Disposition: attachment`.
- [ ] **Step 5: Run** `npm test` → pass. Manual: change a status in the browser, export CSV, open in Excel, formula test row shows as text.
- [ ] **Step 6: Commit** `feat: admin leads page and csv export`.

---

### Task 5: Proof content tables and storage

**Files:**
- Create: `supabase/migrations/0003_proof.sql`, `tests/proof-rls.test.ts`

**Interfaces:**
- Produces SQL:
  - `partners(id uuid pk, name text not null, kind partner_kind not null, logo_path text, url text, sort int not null default 0, published bool not null default false, consent_at date, created_at timestamptz default now())`
  - `shipyards(id uuid pk, name text not null, location text, description text, url text, sort int not null default 0, published bool not null default false, consent_at date, created_at timestamptz default now())`
  - Both: `check (not published or consent_at is not null)`.
  - `stats(key text pk, label text not null, value text not null, sort int not null default 0, published bool not null default false)`.
  - Policies (all three): anon + authenticated select where `published`; admin (`is_admin()`) all.
  - Storage bucket `logos`: public, `file_size_limit` 1 MB, `allowed_mime_types` `image/png,image/jpeg,image/webp,image/svg+xml`; insert/update/delete only `is_admin()`.

- [ ] **Step 1: Write failing tests** `tests/proof-rls.test.ts`:
  - `publish without consent fails` for `partners` and `shipyards` (admin insert `published: true, consent_at: null` → error code `23514`).
  - `anon sees only published`: service inserts one published (with consent) and one unpublished per table → anon select by name returns only the published one.
  - `non-admin cannot insert partner`: non-admin insert → error.
- [ ] **Step 2: Run** → FAIL (tables missing).
- [ ] **Step 3: Write and apply `0003_proof.sql`.**
- [ ] **Step 4: Run** `npm test` → pass. Run Supabase `get_advisors` (security) → no RLS warnings on new tables.
- [ ] **Step 5: Commit** `feat: proof content tables and logos bucket`.

---

### Task 6: Proof admin pages and public sections

**Files:**
- Create: `lib/proof.ts`, `components/ProofSections.tsx`, `app/admin/partners/page.tsx`, `app/admin/shipyards/page.tsx`, `app/admin/stats/page.tsx`, `app/admin/proof-actions.ts`
- Modify: `app/page.tsx`, `app/summit-2027/page.tsx`

**Interfaces:**
- Consumes: Task 3 clients/guard, Task 5 tables.
- Produces:
  - `lib/proof.ts` (public, anon client without cookies): `getPartners(): Promise<Partner[]>` (`'use cache'`, `cacheTag('partners')`), `getShipyards()` (`cacheTag('shipyards')`), `getStats()` (`cacheTag('stats')`); each returns published rows ordered by `sort, name`.
  - `proof-actions.ts`: `saveRow(table: 'partners'|'shipyards'|'stats', row): Promise<{ error?: string }>`, `deleteRow(table, id)`, `uploadLogo(form: FormData): Promise<{ path?: string; error?: string }>`; each mutating action calls `updateTag(table)` after success and returns the Postgres error message on failure.
  - Components: `<StatsStrip/>`, `<PartnerLogos kind?/>` (groups "Supported by" = `supporter`, then sponsors, exhibitors), `<ShipyardList/>`; each returns `null` when its list is empty.

- [ ] **Step 1: Read** `node_modules/next/dist/docs/01-app/01-getting-started/09-revalidating.md` (`cacheTag`, `updateTag`).
- [ ] **Step 2: Admin pages.** One list + add/edit form per table; fields per Task 5 columns; `published` checkbox; `consent_at` date input with hint "Date written consent received"; logo file input on partners (rejects non-image / >1 MB with a message before upload). Show returned error text above the form.
- [ ] **Step 3: Public sections.** Home: `<StatsStrip/>` under hero, `<ShipyardList/>` titled "Shipyards you will meet" after "Who should come", `<PartnerLogos/>` before the register form. Summit: `<PartnerLogos/>` before the enquiry form. Wrap each in `<Suspense fallback={null}>` so pages stay prerendered.
- [ ] **Step 4: `npm run build`** → `/` and `/summit-2027` still `○` (or `◐` partial prerender); no build error.
- [ ] **Step 5: Manual check (Review Focus 5 and 4):** empty tables → home and summit show no proof headings. Add a shipyard with published ticked and no consent date → error shown, nothing public. Add consent date → appears on home within one reload. Unpublish → disappears. Upload a 2 MB file → rejected.
- [ ] **Step 6: Content grep** (from Task 1 Phase 1 check) still clean; `npm test` all pass; `npm run lint` clean.
- [ ] **Step 7: Commit** `feat: proof sections and admin content pages`; deploy; repeat Step 5 on production with one real approved entry or leave tables empty.

# Platform direction: the "proof engine" (design spec)

Date: 2026-10-21. Status: approved in brainstorming, awaiting owner review of this file.

## 1. Goal and understanding

**Success by end of 2027:** sell exhibitor booths and sponsorships for Maritime Expo Asia 2027 (September, Sibu).

**How deals close:** relationships and WhatsApp. Sales staff send site links; the site is a sales tool, not a self-serve shop.

**Main barrier:** first edition, no track record. Prospects ask "is it worth it? who will be there?"

**Proof the owner can obtain and publish:** SAMIN member shipyard list, March Summit evidence (photos, real attendance, attending companies), government and agency support, confirmed exhibitor and sponsor logos.

**Assumptions:** small sales team (1 to 3); links are opened on phones from WhatsApp; Events Calendar and Ship Render Tool do not directly sell booths, so they move after September 2027.

**Positioning chosen:** every public page answers "is it worth it?" with real, owner-approved proof. Rejected: industry hub first (too slow for Sept 2027), brochure + CRM only (does not address the main barrier).

## 2. Roadmap (paced to the sales calendar)

| When | Ships | Proof it gives sales |
|---|---|---|
| Now to mid-Nov 2026 | Phase 1 site (built). Changes: interest form stresses "I am a shipyard / buyer"; hidden-until-confirmed "Supported by" and partner logo sections | Starts the buyer list |
| Dec 2026 to Feb 2027 | SAMIN shipyard directory (consented entries only); prospectus download behind a lead form; paid Summit delegate registration (needed for BESarawak application) | "These are the shipyards you will meet"; a formal document to send |
| March 2027 (Summit) | QR check-in for real attendance and companies; professional photography | First real data |
| Apr to May 2027 | Summit recap page (photos, real counts, attending companies, quotes only with written consent); September booth enquiry with floor plan PDF | Main proof for September sales |
| Jun to Sep 2027 | September visitor (buyer) registration; public real registration counts; simple business-matching appointment requests | "Buyers are already registering" |
| After Sep 2027 | Events Calendar, Ship Render Tool (`docs/07-future-features.md`) | 365-day traffic |

Each row is its own spec and plan when the owner asks for it (CLAUDE.md: one feature at a time).

**Proof rules:** numbers come only from real records; the owner approves each before it is public; logos, quotes and directory entries need written consent; `[TBC]` items stay hidden.

## 3. Architecture

**Stack (unchanged):** Next.js on Vercel, Supabase (Postgres, Auth, Storage), Resend. Extends the Phase 1 code; no rewrite.

**Tables**
- `enquiries` (exists): add `status` (`new`, `contacted`, `negotiating`, `won`, `lost`, default `new`) and `owner` (admin email, nullable).
- `partners`: name, kind (`exhibitor`, `sponsor`, `supporter`), logo_path, url, published, consent_at.
- `shipyards`: name, location, description (our own words), url, published, consent_at. `published` cannot be true while `consent_at` is null (check constraint).
- `stats`: key, label, value, published. Values entered from real records only.
- `admins`: email.

**Access (RLS)**
- Anonymous: read `partners`, `shipyards`, `stats` where `published = true`. No access to `enquiries` or `admins`.
- Admins (signed-in email listed in `admins`): full read and write.
- Form inserts stay server-side.
- Storage: `logos` public bucket. A private bucket is reserved for the later Ship Render Tool (GA drawings are confidential).

**/admin**
- Sign-in: Supabase Auth email magic link; only emails in `admins` get in.
- Pages: Leads (list, filter, change status and owner, WhatsApp `wa.me` link, CSV export); Partners (logo upload, publish toggle); Shipyards; Stats.
- Saves revalidate public pages at once; no redeploy.

**Lead notification:** email includes a WhatsApp one-tap link built from the submitted phone number.

## 4. Testing
- RLS tests: anonymous client cannot read `enquiries`, `admins`, or unpublished rows; non-admin signed-in user cannot write.
- Form submit test: 4 types, missing consent rejected, honeypot dropped.
- `shipyards` constraint test: publish without consent fails.
- Pre-launch content grep: VIP names, prices (`RM`), `[TBC` outside the footer, BIMW.

## 5. Out of scope here
Self-serve booth booking and payment for September, buyer-supplier matching algorithm, Chinese language, Events Calendar, Ship Render Tool. Each needs its own request and spec.

## 6. First implementation slice (proposed)
1. Commit Phase 1 (blocked on git identity).
2. Supabase project + `enquiries` migration; deploy to Vercel; domain and Resend DNS.
3. `status`/`owner` columns + `/admin` Leads page + WhatsApp link in the notice email.
4. `partners`, `shipyards`, `stats` tables, admin pages and the hidden-until-published public sections.

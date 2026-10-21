# Maritime Expo Asia website (maritimeexpoasia.com)

## What this site is
The platform for **Maritime Expo Asia 2027** (official name of the September 2027 maritime exhibition, Sibu, Sarawak). It also promotes a smaller warm-up event in March 2027, the **Sarawak Maritime Industry Summit 2027**, hosted by SAMIN (Sarawak Association of Marine Industries) and co-organised by MarineX International. SAMIN does not own the domain; its event is promoted here.

The site is meant to run 365 days a year: capture leads (sponsors, exhibitors, delegates, buyers), then grow into the September exhibition site.

## Audience
Shipyard owners, marine suppliers and technology providers, sponsors, government agencies, training bodies, buyers. Mostly Sarawak and Malaysia, some ASEAN. Language: English first. Add Chinese (Simplified) later if asked.

## Phases
1. Now to mid-Nov 2026: a simple site. Home page = Maritime Expo Asia 2027 "coming September 2027" with a register-interest form. Sub-page `/summit-2027` = the March event.
2. Dec 2026 to Feb 2027: add registration and payment, sponsor and exhibitor prospectus, SAMIN member directory.
3. After March 2027: March page becomes a past event; September exhibitor booking, programme and buyer matching go live.
4. Later, to keep people coming back all year (see `docs/07-future-features.md`): a **Maritime Events Calendar** that collects major maritime events and locations, and a **Ship Render Tool** (upload a General Arrangement and ship registry details to get a professional render). These are NOT to be built until the owner asks for one by name. Design the base site so they can be added (backend, database, file storage, accounts).

## Rules (important)
- The owner builds one feature at a time and will say which. Do not start features that were not asked for.
- Uploaded ship drawings are confidential: never publish them, store them privately.
- Use only facts in `docs/`. Anything marked `[TBC]` is NOT confirmed: do not show it as fact on the public site. Show "To be announced" instead.
- **Do not publish VIP names or titles** until the VIP has accepted in writing. Use "Guest of honour to be announced". Titles are kept in `docs/03-vips-and-titles.md` for letters and later use.
- Do not show prices, budgets, targets or sponsorship amounts. Use "Enquire for details".
- Never invent speakers, sponsors, exhibitors, testimonials, statistics or dates.
- Do not copy another event's text or logo. Do not use the Borneo International Maritime Week name or branding.
- Keep the legal entity name in the footer as `[TBC: BBH PLT or MarineX International]` until the owner decides.

## Where things are
- `docs/01-event-facts.md` facts for both events
- `docs/02-programme.md` programme and forum topics
- `docs/03-vips-and-titles.md` VIP titles (internal, not for publishing yet)
- `docs/04-sponsors-exhibitors.md` sponsor, exhibitor, door gift, invitees
- `docs/05-brand-and-tone.md` look, tone, wording
- `docs/06-site-map.md` pages, sections, forms
- `docs/07-future-features.md` events calendar and ship render tool (backlog, build only when asked)
- `content/` ready-to-use page text
- `assets/` logos and photos (to be added)

## Technical (owner to confirm)
- Stack: `[TBC]` (suggest: static or Next.js site, fast, mobile first, deployed on Vercel or Netlify)
- Forms: register interest, sponsor enquiry, exhibitor enquiry, contact. Store submissions in a database or Google Sheet; send an email notice. `[TBC]`
- Must be mobile first, fast, accessible, with basic SEO (title, description, Open Graph image).

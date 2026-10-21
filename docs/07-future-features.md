# Future features (backlog: do NOT build until the owner asks for one by name)

The owner will build these one at a time. Read this file only to design the base site so these can be added later without a rebuild (database, user accounts, file storage, an admin area).

Goal of both features: give people a reason to come back to maritimeexpoasia.com all year, so the site works as a 365-day platform and feeds leads to the September exhibition.

---

## Feature 1: Maritime Events Calendar (with locations)

### What
A calendar and map of large maritime events worldwide (and a Sarawak/Malaysia/ASEAN focus first): exhibitions, conferences, trade shows. Each event shows name, dates, city and country, a link to the official site, and a pin on a map. Maritime Expo Asia 2027 and the March Summit are pinned at the top.

### Why
People bookmark and return to a trusted industry calendar. It builds traffic, search ranking and an email list.

### How data comes in (the owner wants it automatic)
1. A scheduled job (daily or weekly) collects events from allowed sources, saves them in a database, and the site reads from the database.
2. Preferred sources, in this order: official event websites that publish calendar feeds or structured data (iCal/ICS, schema.org Event markup); event organisers' public APIs; industry association calendars that allow reuse; a manual list the owner or an editor keeps up to date.
3. Where scraping is the only option, check each site's terms and robots.txt first. Store only facts (name, dates, place, link), write our own short description, never copy text or logos. Always link back to the official site.
4. Every new or changed event goes into a review queue ("pending") for a human to approve before it shows publicly. This avoids wrong dates and bad data.
5. Geocode the location to coordinates for the map.

### Screens
- Month and list view, filter by region, type and month
- Map view
- Event page (facts, official link, "add to my calendar" .ics, "I'm attending" optional)
- Weekly email "maritime events this month" for subscribers `[later]`
- Admin: review queue, edit, add event manually, mark source status

### Data fields
id, name, start_date, end_date, city, country, latitude, longitude, venue, organiser, website_url, category, source_url, last_checked, status (pending/approved/hidden), featured

### Risks
- Wrong or stale dates: use the review queue; show "last checked".
- Copyright and terms of service: facts only, link out.
- Maintenance: broken sources need an alert.

### Build order
MVP: manual list plus the data model and the calendar and map pages. Then add one automated source at a time. Last: the email digest.

---

## Feature 2: Ship Render Tool (upload a General Arrangement and Ship Registry, get a professional render)

### What
A user uploads a vessel's **General Arrangement (GA)** drawing and **ship registry** details (name, type, length, beam, draft, tonnage, flag, year built, etc.). The tool produces a polished, professional image of the vessel (and, in a later stage, a rotatable 3D view) that a shipyard or owner can use in a brochure, proposal or on the site.

### Why
Shipyards and owners need good-looking vessel visuals for sales and marketing. It gives them a reason to register and upload, which makes them leads.

### Honest scope: what is realistic
- A GA is a **2D drawing**. A truly accurate 3D model needs hull form data (lines plan or offsets), which a GA usually does not contain. So full automatic, dimensionally accurate 3D from a GA alone is not reliable.
- Realistic stages:
  1. **Stage 1, concept render (build first):** read the GA (views, main dimensions, superstructure layout) and the registry data, then generate a high-quality **concept image** using an image-generation model, guided by the drawing and the specs. Output: a few angles and a livery colour option. Always label it **"Concept illustration, not to scale, not for construction or classification."**
  2. **Stage 2, parametric 3D (later):** build a simple parametric hull and superstructure from the main dimensions and vessel type, show it in the browser with an interactive 3D viewer (e.g. three.js), let the user pick colours and see it from all sides. Accuracy is approximate.
  3. **Stage 3, assisted accurate 3D (only if needed):** the shipyard supplies the lines plan or a 3D model (e.g. OBJ/GLB/STEP); the tool only renders and lights it. 
- Do not promise engineering accuracy. This is a marketing visual tool.

### Flow
1. User signs up (name, company, email) so we keep the lead.
2. Upload GA (PDF, PNG, JPG, DWG-exported PDF) and fill a short form from the ship registry.
3. The tool checks the file, extracts the data, shows what it understood, and asks the user to correct it.
4. Generate renders; user previews and downloads (low-resolution free; high-resolution with a watermark or after registering `[TBC]`).

### Inputs
GA file; registry fields: vessel name, type, flag, IMO or official number, year built, LOA, beam, depth, draft, gross tonnage, number of decks, propulsion, colour scheme, optional logo.

### Rules and risks
- **Confidentiality:** GAs belong to shipyards and owners. Store uploads privately, per user, encrypted; never show them publicly; delete on request; add terms and a privacy notice; do not use uploads to train anything. State this clearly on the page.
- **Disclaimers:** concept only, not for construction, class or regulatory use.
- **Accuracy:** show the extracted dimensions to the user for confirmation before rendering.
- **Cost:** image and 3D generation costs money per render; add per-user limits and a queue. `[TBC pricing: free sample, then paid or lead-gated]`
- **Abuse:** limit file types and sizes; scan uploads.

### Screens
Landing page for the tool, upload and form, processing status, result gallery, 3D viewer (stage 2), download, account page with past renders.

### Build order
Stage 1 as a pilot with 3 to 5 real vessels from Sibu shipyards (the owner's contacts), then decide on stage 2.

---

## Notes for the base site (so these can be added later)
- Use a framework and host that can run backend code, a database and file storage (suggest Next.js on Vercel with Postgres/Supabase and object storage). `[TBC]`
- User accounts (email sign-in) are needed for Feature 2 and optional for Feature 1.
- Keep an admin area in mind from the start.

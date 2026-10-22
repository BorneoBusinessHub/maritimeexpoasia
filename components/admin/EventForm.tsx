"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveEvent, type EventInput } from "@/app/admin/(protected)/events/actions";
import { CATEGORY_LABELS, REGION_LABELS } from "@/components/events/labels";
import { CATEGORIES, REGIONS, STATUSES, todayInKuching, type MaritimeEvent } from "@/lib/events";

const input =
  "w-full rounded-2xl bg-white px-4 py-2.5 text-base text-ink ring-1 ring-ink/15 focus:outline-none focus:ring-2 focus:ring-navy";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

const text = (f: FormData, k: string) => String(f.get(k) ?? "");
const num = (f: FormData, k: string) => (text(f, k).trim() === "" ? null : Number(text(f, k)));

export default function EventForm({ event }: { event?: MaritimeEvent }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(form: FormData) {
    const value: EventInput = {
      id: event?.id,
      slug: text(form, "slug"),
      name: text(form, "name"),
      start_date: text(form, "start_date") || null,
      end_date: text(form, "end_date") || null,
      dates_confirmed: form.get("dates_confirmed") === "on",
      date_note: text(form, "date_note") || null,
      city: text(form, "city").trim(),
      country: text(form, "country").trim(),
      region: text(form, "region") as EventInput["region"],
      venue: text(form, "venue") || null,
      latitude: num(form, "latitude"),
      longitude: num(form, "longitude"),
      organiser: text(form, "organiser") || null,
      category: text(form, "category") as EventInput["category"],
      description: text(form, "description") || null,
      website_url: text(form, "website_url"),
      source_url: text(form, "source_url"),
      last_checked: text(form, "last_checked"),
      status: text(form, "status") as EventInput["status"],
      tier: text(form, "tier") as EventInput["tier"],
    };
    start(async () => {
      const result = await saveEvent(value);
      setError(result.error ?? "");
      if (!result.error) router.push("/admin/events");
    });
  }

  return (
    <form action={submit} className="space-y-5 rounded-[2rem] bg-white p-6 ring-1 ring-ink/10 sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-deep">{event ? "Edit event" : "New event"}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name *">
          <input name="name" required defaultValue={event?.name} className={input} />
        </Field>
        <Field label="Slug" hint="Used in the web address. Leave blank to make it from the name.">
          <input name="slug" defaultValue={event?.slug} className={input} />
        </Field>
        <Field label="Start date">
          <input name="start_date" type="date" defaultValue={event?.start_date ?? ""} className={input} />
        </Field>
        <Field label="End date" hint="Leave blank for a one-day event.">
          <input name="end_date" type="date" defaultValue={event?.end_date ?? ""} className={input} />
        </Field>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input name="dates_confirmed" type="checkbox" defaultChecked={event?.dates_confirmed} className="size-4 accent-navy" />
          Dates confirmed on the official website (needs a start date)
        </label>
        <Field label="Rough period" hint="Shown while dates are not confirmed, e.g. September 2027. Otherwise the page says Dates to be announced.">
          <input name="date_note" defaultValue={event?.date_note ?? ""} className={input} />
        </Field>
        <Field label="Venue">
          <input name="venue" defaultValue={event?.venue ?? ""} className={input} />
        </Field>
        <Field label="City *">
          <input name="city" required defaultValue={event?.city} className={input} />
        </Field>
        <Field label="Country *">
          <input name="country" required defaultValue={event?.country} className={input} />
        </Field>
        <Field label="Region *">
          <select name="region" defaultValue={event?.region ?? "asia_pacific"} className={input}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type *">
          <select name="category" defaultValue={event?.category ?? "exhibition"} className={input}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Latitude" hint="City level is enough.">
          <input name="latitude" type="number" step="any" min={-90} max={90} defaultValue={event?.latitude ?? ""} className={input} />
        </Field>
        <Field label="Longitude">
          <input name="longitude" type="number" step="any" min={-180} max={180} defaultValue={event?.longitude ?? ""} className={input} />
        </Field>
        <Field label="Organiser">
          <input name="organiser" defaultValue={event?.organiser ?? ""} className={input} />
        </Field>
        <Field label="Official website *">
          <input name="website_url" type="url" defaultValue={event?.website_url} className={input} />
        </Field>
        <Field label="Source page for the dates *" hint="The page where you read the dates.">
          <input name="source_url" type="url" defaultValue={event?.source_url} className={input} />
        </Field>
        <Field label="Last checked *">
          <input name="last_checked" type="date" defaultValue={event?.last_checked ?? todayInKuching()} className={input} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={event?.status ?? "pending"} className={input}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Tier" hint="Only one event can be the anchor. Co-hosted events also need a page built for them.">
          <select name="tier" defaultValue={event?.tier ?? "listed"} className={input}>
            <option value="anchor">Our event (anchor)</option>
            <option value="cohosted">Co-hosted</option>
            <option value="listed">Listed</option>
          </select>
        </Field>
      </div>
      <Field label="Description" hint="Your own words, facts only. Do not copy text from the organiser.">
        <textarea name="description" rows={4} defaultValue={event?.description ?? ""} className={input} />
      </Field>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button disabled={pending} className="rounded-full bg-deep px-6 py-2.5 font-semibold text-white hover:bg-navy disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
        <Link href="/admin/events" className="rounded-full px-6 py-2.5 font-medium ring-1 ring-ink/20">
          Cancel
        </Link>
      </div>
    </form>
  );
}

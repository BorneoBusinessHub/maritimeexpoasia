"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitEnquiry, type FormState } from "@/app/actions";
import { IconBadge, pill } from "@/components/pill";
import type { EnquiryType } from "@/lib/enquiry";

const LABELS: Record<EnquiryType, string> = {
  interest: "Register interest",
  exhibitor: "Exhibit",
  sponsor: "Sponsor",
  contact: "Contact",
  cohost: "Co-host an event",
  listing: "List your event",
};

const ATTENDEE_TYPES = ["Shipyard", "Buyer", "Supplier", "Technology provider", "Government", "Training", "Other"];

const input =
  "w-full rounded-2xl bg-paper px-4 py-3 text-base text-ink ring-1 ring-ink/10 transition-shadow duration-500 ease-fluid placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-navy";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">{label}</span>
      {children}
    </label>
  );
}

export default function EnquiryForm({
  types,
  defaultType = types[0],
  event,
}: {
  types: EnquiryType[];
  defaultType?: EnquiryType;
  /** Slug of the event this form belongs to; the lead is tagged with it. */
  event?: string;
}) {
  const [type, setType] = useState<EnquiryType>(types.includes(defaultType) ? defaultType : types[0]);
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, { ok: false, message: "" });

  if (state.ok) {
    return (
      <p role="status" className="rounded-2xl bg-pale/60 p-8 font-display text-2xl font-semibold text-deep">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="type" value={type} />
      {event && <input type="hidden" name="event" value={event} />}

      {types.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">Enquiry type</legend>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <label
                key={t}
                className="cursor-pointer rounded-full px-5 py-2 text-sm font-medium text-ink ring-1 ring-ink/15 transition-all duration-500 ease-fluid hover:ring-ink/30 has-checked:bg-deep has-checked:text-white has-checked:ring-deep has-focus-visible:ring-2 has-focus-visible:ring-navy"
              >
                <input type="radio" className="sr-only" checked={type === t} onChange={() => setType(t)} />
                {LABELS[t]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name *">
          <input name="name" required autoComplete="name" className={input} />
        </Field>
        <Field label="Company">
          <input name="company" autoComplete="organization" className={input} />
        </Field>
        <Field label="Role">
          <input name="role" autoComplete="organization-title" className={input} />
        </Field>
        <Field label="Email *">
          <input name="email" type="email" required autoComplete="email" className={input} />
        </Field>
        <Field label="Phone / WhatsApp">
          <input name="phone" type="tel" autoComplete="tel" className={input} />
        </Field>

        {type === "interest" && (
          <Field label="Organisation type">
            <select name="attendee_type" className={input} defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              {ATTENDEE_TYPES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
        )}
        {type === "exhibitor" && (
          <Field label="Number of tables">
            <input name="tables" type="number" min={1} max={10} defaultValue={1} className={input} />
          </Field>
        )}
        {type === "sponsor" && (
          <Field label="Area of support">
            <select name="support" className={input} defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              <option>Door gifts</option>
              <option>Session sponsorship</option>
              <option>Other</option>
            </select>
          </Field>
        )}
      </div>

      {type === "listing" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Event name *">
            <input name="event_name" required className={input} />
          </Field>
          <Field label="Event dates">
            <input name="event_dates" placeholder="e.g. 12–14 May 2027" className={input} />
          </Field>
          <Field label="City and country">
            <input name="event_location" className={input} />
          </Field>
          <Field label="Official website">
            <input name="event_website" type="url" placeholder="https://" className={input} />
          </Field>
        </div>
      )}

      {type === "exhibitor" && (
        <Field label="Products and services">
          <textarea name="products" rows={3} className={input} />
        </Field>
      )}

      <Field label="Message">
        <textarea name="message" rows={4} className={input} />
      </Field>

      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm text-ink/80">
        <input name="consent" type="checkbox" required className="mt-1 size-4 accent-navy" />
        <span>
          I consent to Maritime Expo Asia using my details to contact me about its events, as described in the{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            privacy notice
          </Link>
          .
        </span>
      </label>

      {state.message && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <button disabled={pending} className={`${pill("primary")} disabled:opacity-60`}>
        {pending ? "Submitting…" : "Submit"}
        <IconBadge />
      </button>
    </form>
  );
}

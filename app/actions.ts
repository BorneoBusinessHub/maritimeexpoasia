"use server";

import { ENQUIRY_TYPES, type EnquiryType } from "@/lib/enquiry";

export type FormState = { ok: boolean; message: string };

// Extra fields per form, saved in the `details` jsonb column.
const DETAIL_FIELDS: Record<EnquiryType, string[]> = {
  interest: ["attendee_type"],
  exhibitor: ["products", "tables"],
  sponsor: ["support"],
  contact: [],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(form: FormData, key: string, max = 2000) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

export async function submitEnquiry(_prev: FormState, form: FormData): Promise<FormState> {
  // Honeypot: real people never see this field. Pretend success so bots learn nothing.
  if (field(form, "website")) return { ok: true, message: "Thank you. Your details have been received and our team will be in touch." };

  const type = field(form, "type") as EnquiryType;
  if (!ENQUIRY_TYPES.includes(type)) return { ok: false, message: "Unknown form." };

  const row = {
    type,
    name: field(form, "name", 200),
    company: field(form, "company", 200) || null,
    role: field(form, "role", 200) || null,
    email: field(form, "email", 200),
    phone: field(form, "phone", 50) || null,
    message: field(form, "message") || null,
    details: Object.fromEntries(DETAIL_FIELDS[type].map((k) => [k, field(form, k, 500)])),
    consent: form.get("consent") === "on",
  };

  if (!row.name) return { ok: false, message: "Please enter your name." };
  if (!EMAIL_RE.test(row.email)) return { ok: false, message: "Please enter a valid email address." };
  if (!row.consent) return { ok: false, message: "Please tick the consent box to continue." };

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/enquiries`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    console.error("enquiry insert failed", res.status, await res.text());
    return { ok: false, message: "Sorry, we could not submit your enquiry. Please try again shortly." };
  }

  // Row is saved first, so a failed email never loses the lead.
  await notify(row).catch((e) => console.error("notify failed", e));
  return { ok: true, message: "Thank you. Your details have been received and our team will be in touch." };
}

async function notify(row: Record<string, unknown>) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) return;
  const lines = Object.entries(row).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v ?? ""}`);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM ?? "Maritime Expo Asia <noreply@maritimeexpoasia.com>",
      to: process.env.NOTIFY_EMAIL.split(","),
      reply_to: row.email,
      subject: `New ${row.type} enquiry: ${row.name}${row.company ? ` (${row.company})` : ""}`,
      text: lines.join("\n"),
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status} ${await res.text()}`);
}

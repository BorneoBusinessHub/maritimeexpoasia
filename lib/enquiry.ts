export const ENQUIRY_TYPES = ["interest", "exhibitor", "sponsor", "contact", "cohost", "listing"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

// The form's hidden `event` value is only trusted when it names an approved event; anything else
// (empty, tampered, or an event since hidden) leaves the lead untagged instead of failing the form.
export function pickEventSlug(raw: string, approved: { slug: string }[]): string | null {
  return raw && approved.some((e) => e.slug === raw) ? raw : null;
}

// Tagging must never cost a lead: if the event list cannot be read, the lead is saved untagged.
export async function resolveEventSlug(raw: string, load: () => Promise<{ slug: string }[]>): Promise<string | null> {
  if (!raw) return null;
  try {
    return pickEventSlug(raw, await load());
  } catch {
    return null;
  }
}

// The insert failed only because the tagged event no longer exists (deleted after the list was cached).
export function shouldRetryUntagged(status: number, body: string): boolean {
  return status === 409 && body.includes("23503");
}

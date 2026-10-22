export const ENQUIRY_TYPES = ["interest", "exhibitor", "sponsor", "contact", "cohost", "listing"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

// The form's hidden `event` value is only trusted when it names an approved event; anything else
// (empty, tampered, or an event since hidden) leaves the lead untagged instead of failing the form.
export function pickEventSlug(raw: string, approved: { slug: string }[]): string | null {
  return raw && approved.some((e) => e.slug === raw) ? raw : null;
}

export const ENQUIRY_TYPES = ["interest", "exhibitor", "sponsor", "contact"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

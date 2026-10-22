"use client";

import { useSearchParams } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import type { EnquiryType } from "@/lib/enquiry";

// Picks the starting form tab from ?type=... so hero buttons can open the right form.
export default function UrlEnquiryForm({ types, event }: { types: EnquiryType[]; event?: string }) {
  const type = useSearchParams().get("type") as EnquiryType;
  return <EnquiryForm key={type} types={types} defaultType={type} event={event} />;
}

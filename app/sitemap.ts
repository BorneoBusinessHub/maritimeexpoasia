import type { MetadataRoute } from "next";
import { getApprovedEvents } from "@/lib/events-data";

const BASE = "https://maritimeexpoasia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getApprovedEvents();
  return [
    ...["", "/summit-2027", "/events", "/contact", "/privacy"].map((p) => ({ url: BASE + p })),
    ...events.map((e) => ({ url: `${BASE}/events/${e.slug}`, lastModified: e.last_checked })),
  ];
}

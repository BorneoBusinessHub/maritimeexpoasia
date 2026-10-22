import type { MetadataRoute } from "next";
import { getApprovedEvents } from "@/lib/events-data";
import { eventHref } from "@/lib/events";

const BASE = "https://maritimeexpoasia.com";
const PAGES = [
  "",
  "/maritime-expo-asia-2027",
  "/events",
  "/events/sarawak-maritime-industry-summit-2027",
  "/partner",
  "/contact",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getApprovedEvents();
  const eventUrls = events
    .map((e) => ({ path: eventHref(e), lastModified: e.last_checked }))
    .filter((e) => !PAGES.includes(e.path));
  return [
    ...PAGES.map((p) => ({ url: BASE + p })),
    ...eventUrls.map((e) => ({ url: BASE + e.path, lastModified: e.lastModified })),
  ];
}

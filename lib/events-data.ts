import { cacheLife, cacheTag } from "next/cache";
import type { MaritimeEvent } from "@/lib/events";
import { publicClient } from "@/lib/supabase/public";

const COLUMNS =
  "id,slug,name,start_date,end_date,dates_confirmed,date_note,city,country,region,venue,latitude,longitude,organiser,category,description,website_url,source_url,last_checked,status,featured";

// Cached with the `events` tag; admin saves call updateTag("events"). Database errors throw,
// so a failed read can never be cached or shown as an empty calendar.
export async function getApprovedEvents(): Promise<MaritimeEvent[]> {
  "use cache";
  cacheTag("events");
  cacheLife("hours");
  const { data, error } = await publicClient().from("events").select(COLUMNS).eq("status", "approved");
  if (error) throw new Error(`events query failed: ${error.message}`);
  return (data ?? []) as MaritimeEvent[];
}

export async function getApprovedEvent(slug: string): Promise<MaritimeEvent | null> {
  "use cache";
  cacheTag("events");
  cacheLife("hours");
  const { data, error } = await publicClient().from("events").select(COLUMNS).eq("status", "approved").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`event query failed: ${error.message}`);
  return (data as MaritimeEvent | null) ?? null;
}

"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { describeEventError, slugify, todayInKuching, type EventStatus, type MaritimeEvent } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

export type EventInput = Omit<MaritimeEvent, "id" | "status"> & { id?: string; status: EventStatus };
type Result = { error?: string };

// Each action checks admin first, runs as the signed-in user (RLS enforces it again), then refreshes public pages.
export async function saveEvent(input: EventInput): Promise<Result & { id?: string }> {
  await requireAdmin();
  const { id, ...fields } = input;
  const row = {
    ...fields,
    slug: input.slug.trim() || slugify(input.name),
    name: input.name.trim(),
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    date_note: input.date_note?.trim() || null,
    venue: input.venue?.trim() || null,
    organiser: input.organiser?.trim() || null,
    description: input.description?.trim() || null,
    website_url: input.website_url?.trim() || null,
    source_url: input.source_url?.trim() || null,
    last_checked: input.last_checked || null,
  };
  const supabase = await createClient();
  const query = id
    ? supabase.from("events").update(row).eq("id", id).select("id").single()
    : supabase.from("events").insert(row).select("id").single();
  const { data, error } = await query;
  if (error) return { error: describeEventError(error) };
  updateTag("events");
  return { id: data.id };
}

async function patch(id: string, values: Record<string, unknown>): Promise<Result> {
  await requireAdmin();
  const { error } = await (await createClient()).from("events").update(values).eq("id", id);
  if (error) return { error: describeEventError(error) };
  updateTag("events");
  return {};
}

export async function setEventStatus(id: string, status: EventStatus): Promise<Result> {
  return patch(id, { status });
}

export async function markChecked(id: string): Promise<Result> {
  return patch(id, { last_checked: todayInKuching() });
}

export async function deleteEvent(id: string): Promise<Result> {
  await requireAdmin();
  const { error } = await (await createClient()).from("events").delete().eq("id", id);
  if (error) return { error: describeEventError(error) };
  updateTag("events");
  return {};
}

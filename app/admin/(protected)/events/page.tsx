import Link from "next/link";
import EventForm from "@/components/admin/EventForm";
import EventRowActions from "@/components/admin/EventRowActions";
import { STATUSES, formatDate, formatDates, type EventStatus, type MaritimeEvent } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

const CHIP: Record<EventStatus, string> = {
  approved: "bg-emerald-100 text-emerald-900",
  pending: "bg-amber-100 text-amber-900",
  hidden: "bg-ink/10 text-ink/70",
};

export default async function AdminEvents({ searchParams }: PageProps<"/admin/events">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const edit = typeof sp.edit === "string" ? sp.edit : "";
  const creating = sp.new === "1";

  const supabase = await createClient();
  let query = supabase.from("events").select("*").order("start_date", { ascending: true, nullsFirst: false }).order("name");
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  const events = (data ?? []) as MaritimeEvent[];
  const editing = events.find((e) => e.id === edit);

  if (creating || editing) return <EventForm key={editing?.id ?? "new"} event={editing} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-deep">Events</h1>
        <Link href="/admin/events?new=1" className="rounded-full bg-deep px-6 py-2.5 font-semibold text-white hover:bg-navy">
          Add event
        </Link>
      </div>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Filter by status">
        {["", ...STATUSES].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/admin/events?status=${s}` : "/admin/events"}
            aria-current={status === s ? "page" : undefined}
            className="rounded-full px-4 py-1.5 ring-1 ring-ink/15 aria-[current=page]:bg-deep aria-[current=page]:text-white"
          >
            {s || "all"}
          </Link>
        ))}
      </nav>
      {error && <p className="mt-6 text-red-700">Could not load events: {error.message}</p>}
      {events.length === 0 && !error && <p className="mt-6 text-ink/70">No events yet.</p>}
      <ul className="mt-6 space-y-3">
        {events.map((e) => (
          <li key={e.id} className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold text-deep">{e.name}</p>
                <p className="text-sm text-ink/70">
                  {formatDates(e)} · {e.city}, {e.country} · checked {formatDate(e.last_checked)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CHIP[e.status]}`}>{e.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href={`/admin/events?edit=${e.id}`} className="rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-ink/20 hover:bg-paper">
                Edit
              </Link>
              <EventRowActions id={e.id} status={e.status} name={e.name} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

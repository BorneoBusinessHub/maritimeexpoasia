"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import {
  CATEGORIES,
  REGIONS,
  filterEvents,
  parseFilters,
  sortEvents,
  todayInKuching,
  type MaritimeEvent,
} from "@/lib/events";
import EventCard from "./EventCard";
import { CATEGORY_LABELS, REGION_LABELS } from "./labels";

const select =
  "w-full rounded-2xl bg-white px-4 py-3 text-base text-ink ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-navy";
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The current month plus the next 18, as YYYY-MM.
function monthOptions(today: string) {
  let [y, m] = today.split("-").map(Number);
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < 19; i++) {
    out.push({ value: `${y}-${String(m).padStart(2, "0")}`, label: `${MONTH_NAMES[m - 1]} ${y}` });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

const subscribe = () => () => {};

// Leaflet touches `window`, so the map loads in the browser only, and only when the Map view is chosen.
const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => <div className="h-[28rem] w-full rounded-[2rem] bg-pale sm:h-[34rem]" />,
});

export default function EventsExplorer({ events }: { events: MaritimeEvent[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // Real date in the browser; build-time date for the prerendered HTML. No hydration mismatch.
  const today = useSyncExternalStore(subscribe, () => todayInKuching(), () => todayInKuching());

  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString())), [params]);
  const visible = useMemo(() => sortEvents(filterEvents(events, filters, today)), [events, filters, today]);
  const months = useMemo(() => monthOptions(today), [today]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  const view = params.get("view") === "map" ? "map" : "list";

  if (events.length === 0) {
    return <p className="text-lg text-ink/80">Events calendar coming soon</p>;
  }

  return (
    <div>
      <div role="group" aria-label="View" className="mb-6 inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setParam("view", v === "map" ? "map" : "")}
            className="rounded-full px-5 py-2 text-sm font-semibold capitalize text-ink/70 transition-colors duration-500 ease-fluid aria-pressed:bg-deep aria-pressed:text-white"
          >
            {v}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">Region</span>
          <select className={select} value={filters.region ?? ""} onChange={(e) => setParam("region", e.target.value)}>
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">Type</span>
          <select className={select} value={filters.category ?? ""} onChange={(e) => setParam("category", e.target.value)}>
            <option value="">All types</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">Month</span>
          <select className={select} value={filters.month ?? ""} onChange={(e) => setParam("month", e.target.value)}>
            <option value="">Any month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-lg text-ink/80">
          No events match these filters.{" "}
          <Link href={pathname} className="underline underline-offset-4">
            Clear filters
          </Link>
        </p>
      ) : view === "map" ? (
        <div className="mt-10">
          <EventMap events={visible} />
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => (
            <li key={e.id}>
              <EventCard event={e} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

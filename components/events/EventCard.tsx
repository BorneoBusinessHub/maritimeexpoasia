import Link from "next/link";
import { ArrowIcon } from "@/components/pill";
import { Bezel } from "@/components/ui";
import { eventHref, formatDates, tierBadge, type MaritimeEvent } from "@/lib/events";
import { CATEGORY_LABELS } from "./labels";

export default function EventCard({ event }: { event: MaritimeEvent }) {
  const badge = tierBadge(event.tier);
  return (
    <Bezel className="h-full" innerClassName="flex h-full flex-col justify-between gap-6 p-6 sm:p-7">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
          <span className="text-amber">{CATEGORY_LABELS[event.category]}</span>
          {badge && <span className="rounded-full bg-deep px-2.5 py-1 text-white">{badge}</span>}
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-deep">
          <Link href={eventHref(event)} className="hover:underline">
            {event.name}
          </Link>
        </h3>
        <p className="mt-2 font-medium text-ink">{formatDates(event)}</p>
        <p className="text-ink/70">
          {event.city}, {event.country}
        </p>
      </div>
      <a
        href={event.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy"
      >
        Official website <ArrowIcon />
      </a>
    </Bezel>
  );
}

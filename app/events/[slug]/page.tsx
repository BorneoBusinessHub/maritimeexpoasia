import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, REGION_LABELS } from "@/components/events/labels";
import { Bezel, Button, PageHeader, Section } from "@/components/ui";
import { getApprovedEvent, getApprovedEvents } from "@/lib/events-data";
import { formatDate, formatDates, staticSlugs, tierBadge } from "@/lib/events";

export async function generateStaticParams() {
  // Anchor and co-hosted events have their own pages; this generic page is for listed events.
  return staticSlugs((await getApprovedEvents()).filter((e) => e.tier === "listed"));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getApprovedEvent(slug);
  if (!e) return { title: "Event not found" };
  return {
    title: e.name,
    description: e.description ?? `${e.name}, ${formatDates(e)}, ${e.city}, ${e.country}.`,
  };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const e = await getApprovedEvent(slug);
  if (!e) notFound();

  const place = [e.venue, `${e.city}, ${e.country}`].filter(Boolean).join(", ");
  const facts: [string, string][] = [
    ["Dates", formatDates(e)],
    ["Location", place],
    ["Region", REGION_LABELS[e.region]],
    ["Type", CATEGORY_LABELS[e.category]],
  ];
  if (e.organiser) facts.push(["Organiser", e.organiser]);

  return (
    <>
      <PageHeader eyebrow={tierBadge(e.tier) ?? "Event"} title={e.name}>
        {formatDates(e)} · {e.city}, {e.country}
      </PageHeader>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            {e.description && <p className="max-w-prose text-lg text-ink/80">{e.description}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={e.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-amber px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#9a4506]"
              >
                Visit official website
              </a>
              {e.dates_confirmed && e.start_date && (
                <Button href={`/events/${e.slug}/ics`} variant="light">
                  Add to calendar
                </Button>
              )}
            </div>
            <p className="mt-6 text-sm text-ink/60">
              Last checked: {formatDate(e.last_checked)}. Always confirm dates on the official website.
            </p>
            <p className="mt-6">
              <Link href="/events" className="underline underline-offset-4">
                Back to all events
              </Link>
            </p>
          </div>
          <Bezel>
            <dl className="divide-y divide-ink/10 p-6 sm:p-8">
              {facts.map(([label, value]) => (
                <div key={label} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber">{label}</dt>
                  <dd className="mt-1 font-medium text-deep">{value}</dd>
                </div>
              ))}
            </dl>
          </Bezel>
        </div>
      </Section>
    </>
  );
}

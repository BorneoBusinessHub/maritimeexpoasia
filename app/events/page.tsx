import type { Metadata } from "next";
import { Suspense } from "react";
import EventsExplorer from "@/components/events/EventsExplorer";
import { PageHeader, Section } from "@/components/ui";
import { getApprovedEvents } from "@/lib/events-data";

export const metadata: Metadata = {
  title: "Maritime Events Calendar",
  description:
    "Major maritime exhibitions and conferences around the world, with dates, locations and links to the official websites.",
};

export default async function EventsPage() {
  const events = await getApprovedEvents();
  return (
    <>
      <PageHeader eyebrow="Events" title="Maritime Events Calendar">
        Major maritime exhibitions and conferences around the world, with dates, locations and links to each
        organiser&apos;s official website.
      </PageHeader>
      <Section>
        <Suspense fallback={null}>
          <EventsExplorer events={events} />
        </Suspense>
      </Section>
    </>
  );
}

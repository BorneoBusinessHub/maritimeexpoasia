import type { Metadata } from "next";
import { Suspense } from "react";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import UrlEnquiryForm from "@/components/UrlEnquiryForm";
import { Bezel, Button, Eyebrow, PageHeader, Section } from "@/components/ui";
import type { EnquiryType } from "@/lib/enquiry";

export const metadata: Metadata = {
  title: "Partner with us",
  description: "Co-host a maritime event with Maritime Expo Asia, or send us your event for our maritime events calendar.",
};

const FORM_TYPES: EnquiryType[] = ["cohost", "listing"];

export default function Partner() {
  return (
    <>
      <PageHeader eyebrow="Partner with us" title="Partner with us">
        Co-host a maritime event with us, or list your event in our maritime events calendar.
      </PageHeader>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal>
            <Bezel className="h-full" innerClassName="flex h-full flex-col justify-between gap-8 p-7 sm:p-10">
              <div>
                <Eyebrow>Co-host an event</Eyebrow>
                <p className="mt-6 text-lg text-ink/80">
                  We co-host maritime events with industry associations and organisers, starting with the Sarawak
                  Maritime Industry Summit 2027 with SAMIN.
                </p>
              </div>
              <Button href="?type=cohost#enquire" variant="light">
                Talk to us about co-hosting
              </Button>
            </Bezel>
          </Reveal>
          <Reveal delay={100}>
            <Bezel className="h-full" innerClassName="flex h-full flex-col justify-between gap-8 p-7 sm:p-10">
              <div>
                <Eyebrow>List your event</Eyebrow>
                <p className="mt-6 text-lg text-ink/80">
                  Send us your event. Every listing is checked against the official website before it is published.
                </p>
              </div>
              <Button href="?type=listing#enquire" variant="light">
                Send us your event
              </Button>
            </Bezel>
          </Reveal>
        </div>
      </Section>

      <Section id="enquire" tone="white">
        <Reveal className="max-w-3xl">
          <Bezel>
            <div className="p-6 sm:p-9">
              <Suspense fallback={<EnquiryForm types={FORM_TYPES} />}>
                <UrlEnquiryForm types={FORM_TYPES} />
              </Suspense>
            </div>
          </Bezel>
        </Reveal>
      </Section>
    </>
  );
}

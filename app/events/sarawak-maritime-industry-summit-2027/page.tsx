import type { Metadata } from "next";
import CohostedHero from "@/components/cohosted/CohostedHero";
import HostedBy from "@/components/cohosted/HostedBy";
import Timetable from "@/components/programme/Timetable";
import SpeakerGrid from "@/components/programme/SpeakerGrid";
import { Suspense } from "react";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import UrlEnquiryForm from "@/components/UrlEnquiryForm";
import { Bezel, Eyebrow, H2, Section } from "@/components/ui";
import type { EnquiryType } from "@/lib/enquiry";
import { confirmedSpeakers, timetableByDay } from "@/lib/programme";
import { summit2027 } from "@/lib/programmes/summit-2027";
import dryDock from "@/public/photos/vessel-dry-dock.jpg";

export const metadata: Metadata = {
  title: "Sarawak Maritime Industry Summit 2027",
  description:
    "Sarawak Maritime Industry Summit 2027, Road to Maritime Expo Asia 2027. Late March 2027 in Sibu. Industry talks, forum, tabletop exhibition and the SAMIN Installation Night.",
};

// Programme from docs/02-programme.md. No times, VIP names or speakers until confirmed.
const DAYS = [
  {
    day: "Day 0",
    name: "Welcome",
    text: "Delegate registration, exhibitor set-up and a welcome dinner for invited guests and speakers.",
    span: "md:col-span-5",
  },
  {
    day: "Day 1",
    name: "Industry Day",
    text: "Officially opened by the guest of honour (to be announced). The morning Industry Talk seminar is followed by an interactive afternoon forum, with a panel of speakers taking questions from the floor. The tabletop exhibition runs throughout the day. The evening closes with the SAMIN Installation Night and the launch of the SAMIN member book.",
    span: "md:col-span-7 md:row-span-2",
    featured: true,
  },
  {
    day: "Day 2",
    name: "Government Day",
    text: "Sessions with Sarawak state and federal agencies on the maritime industry. Detailed programme to be announced.",
    span: "md:col-span-5",
  },
];

const TOPICS = [
  "The future of Sarawak's maritime and shipbuilding industry",
  "From traditional shipyard to smart shipyard",
  "Where are the next maritime opportunities?",
  "Talent and TVET: filling the skills gap in shipyards",
];

const FORM_TYPES: EnquiryType[] = ["interest", "exhibitor", "sponsor"];
const EVENT = "sarawak-maritime-industry-summit-2027";

export default function Summit() {
  const hasTimetable = timetableByDay(summit2027).length > 0;
  const hasSpeakers = confirmedSpeakers(summit2027).length > 0;
  return (
    <>
      <CohostedHero
        eyebrow="Road to Maritime Expo Asia 2027"
        title={
          <>
            Sarawak Maritime Industry <span className="text-glow">Summit 2027</span>
          </>
        }
        when="Late March 2027"
        whenNote="Exact date to be announced"
        where="Sibu, Sarawak"
        whereNote="Venue to be announced"
        actions={[
          { href: "?type=interest#enquire", label: "Register your interest", primary: true },
          { href: "?type=exhibitor#enquire", label: "Exhibit" },
          { href: "?type=sponsor#enquire", label: "Sponsor" },
        ]}
        image={dryDock}
        imageAlt="A ship on a dry dock beside a crane"
      />
      <HostedBy
        credit="Hosted by the Sarawak Association of Marine Industries (SAMIN), co-organised by MarineX International."
        note="Part of the road to Maritime Expo Asia 2027."
      />

      <Section>
        <Reveal>
          <Eyebrow>Programme</Eyebrow>
        </Reveal>
        <Reveal delay={100} className="mt-6">
          <H2>Programme at a glance.</H2>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-12">
          {DAYS.map((d, i) => (
            <Reveal key={d.day} delay={i * 80} className={d.span}>
              <Bezel className="h-full" innerClassName={`flex h-full flex-col justify-between gap-10 p-7 sm:p-9 ${d.featured ? "!bg-deep text-white" : ""}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${d.featured ? "text-glow" : "text-amber"}`}>{d.day}</span>
                <div>
                  <h3 className="font-display text-3xl font-semibold tracking-tight">{d.name}</h3>
                  <p className={`mt-3 ${d.featured ? "text-pale" : "text-ink/80"}`}>{d.text}</p>
                </div>
              </Bezel>
            </Reveal>
          ))}
        </div>
        {!hasTimetable && (
          <Reveal delay={200}>
            <p className="mt-8 text-ink/70">Detailed timetable to be announced.</p>
          </Reveal>
        )}
      </Section>

      <Timetable programme={summit2027} />

      <Section tone="white">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Reveal>
              <Eyebrow>Topics</Eyebrow>
            </Reveal>
            <Reveal delay={100} className="mt-6">
              <H2>Key discussion themes.</H2>
            </Reveal>
            <Reveal delay={200}>
              {!hasSpeakers && <p className="mt-6 text-ink/70">Speakers will be announced once confirmed.</p>}
            </Reveal>
          </div>
          <ol className="divide-y divide-ink/10 border-y border-ink/10">
            {TOPICS.map((t, i) => (
              <li key={t}>
                <Reveal delay={i * 80} className="flex gap-6 py-7">
                  <span className="font-display text-sm font-semibold text-amber">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-deep">{t}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <SpeakerGrid programme={summit2027} />

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal>
            <Bezel className="h-full" innerClassName="p-7 sm:p-10">
              <Eyebrow>Tabletop exhibition</Eyebrow>
              <p className="mt-6 text-lg text-ink/80">
                Each space includes a table, backdrop space and power in the foyer, open throughout Day 1. Suited to
                suppliers of marine engines, electronics, software, coatings, safety equipment, finance and logistics
                services.
              </p>
              <p className="mt-5 font-display text-xl font-semibold text-deep">Limited tabletop spaces. Enquire for details.</p>
            </Bezel>
          </Reveal>
          <Reveal delay={100}>
            <Bezel className="h-full" innerClassName="p-7 sm:p-10">
              <Eyebrow>Sponsors</Eyebrow>
              <p className="mt-6 text-lg text-ink/80">
                We welcome sponsorship enquiries, including door gift sponsorship. Door gift sponsors are acknowledged
                on the gift or in the programme.
              </p>
              <p className="mt-5 font-display text-xl font-semibold text-deep">Enquire for details.</p>
            </Bezel>
          </Reveal>
        </div>
      </Section>

      <Section id="enquire" tone="dark">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Reveal>
              <Eyebrow dark>Take part</Eyebrow>
            </Reveal>
            <Reveal delay={100} className="mt-6">
              <H2 dark>Register, exhibit or sponsor.</H2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-md text-lg text-pale">
                For shipyard owners and operators, marine suppliers and technology providers, buyers, government
                agencies and training institutions from Sarawak, Malaysia and the wider region.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-8 max-w-md text-sm text-pale/70">
                Hosted by the Sarawak Association of Marine Industries (SAMIN) and co-organised by MarineX
                International. The Summit leads up to Maritime Expo Asia 2027 in September.
              </p>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <Bezel dark>
              <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 text-ink sm:p-9">
                <Suspense fallback={<EnquiryForm types={FORM_TYPES} event={EVENT} />}>
                  <UrlEnquiryForm types={FORM_TYPES} event={EVENT} />
                </Suspense>
              </div>
            </Bezel>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

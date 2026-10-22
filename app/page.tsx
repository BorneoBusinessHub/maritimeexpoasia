import Image from "next/image";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import EventCard from "@/components/events/EventCard";
import { Bezel, Button, Eyebrow, Glows, H2, Section, Waves } from "@/components/ui";
import { getHomeEvents } from "@/lib/events-data";
import aerial from "@/public/photos/offshore-vessel-aerial.jpg";

// The hub: our anchor exhibition first, then co-hosted events, the next events in the calendar,
// partnering, and the register-interest form. Sections with nothing to show are left out.
export default async function Home() {
  const { cohosted, upcoming } = await getHomeEvents();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-deep text-white">
        {/* Decorative stock photo, tinted so the headline stays readable */}
        <Image src={aerial} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-deep via-deep/80 to-deep/25" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-deep to-transparent" />
        <Glows />
        <Waves />
        <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-4 pb-28 pt-40 sm:px-8">
          <Reveal>
            <Eyebrow dark>Sibu, Sarawak · September 2027</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-7 max-w-4xl font-display text-[clamp(3rem,8.5vw,7rem)] font-semibold leading-[0.94] tracking-tight">
              Maritime Expo Asia <span className="text-glow">2027</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-7 max-w-xl text-xl text-pale">
              The meeting point for shipyards, suppliers and buyers, in Sarawak&apos;s shipbuilding capital.
            </p>
          </Reveal>
          <Reveal delay={300} className="mt-10 flex flex-wrap gap-3">
            <Button href="#register">Register your interest</Button>
            <Button href="/maritime-expo-asia-2027" variant="onDark">
              About the Expo
            </Button>
          </Reveal>
        </div>
      </section>

      {cohosted.length > 0 && (
        <Section>
          <Reveal>
            <Eyebrow>Co-hosted events</Eyebrow>
          </Reveal>
          <Reveal delay={100} className="mt-6 max-w-3xl">
            <H2>Events we run with industry partners.</H2>
          </Reveal>
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cohosted.map((e, i) => (
              <li key={e.id} className="h-full">
                <Reveal delay={i * 80} className="h-full">
                  <EventCard event={e} />
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section tone="white">
          <Reveal>
            <Eyebrow>Maritime events calendar</Eyebrow>
          </Reveal>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <Reveal delay={100} className="max-w-3xl">
              <H2>Upcoming maritime events.</H2>
            </Reveal>
            <Reveal delay={150}>
              <Button href="/events" variant="light">
                Full calendar
              </Button>
            </Reveal>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e, i) => (
              <li key={e.id} className="h-full">
                <Reveal delay={i * 60} className="h-full">
                  <EventCard event={e} />
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section>
        <Reveal>
          <Bezel innerClassName="flex flex-col gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Partner with us</Eyebrow>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-deep sm:text-4xl">
                Co-host a maritime event with us, or list your event in our calendar.
              </h2>
            </div>
            <Button href="/partner" variant="light">
              Partner with us
            </Button>
          </Bezel>
        </Reveal>
      </Section>

      <Section id="register" tone="dark">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Reveal>
              <Eyebrow dark>Stay informed</Eyebrow>
            </Reveal>
            <Reveal delay={100} className="mt-6">
              <H2 dark>Register your interest.</H2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-md text-lg text-pale">
                Shipyards and buyers can register now to meet suppliers in September. Suppliers, sponsors and partners
                will receive dates, exhibiting and sponsorship details as soon as they are confirmed.
              </p>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <Bezel dark>
              <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 text-ink sm:p-9">
                <EnquiryForm types={["interest"]} event="maritime-expo-asia-2027" />
              </div>
            </Bezel>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

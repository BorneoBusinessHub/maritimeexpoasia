import Image from "next/image";
import Link from "next/link";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import { ArrowIcon } from "@/components/pill";
import { Bezel, Button, Eyebrow, Glows, H2, Photo, Section, Waves } from "@/components/ui";
import aerial from "@/public/photos/offshore-vessel-aerial.jpg";
import dryDock from "@/public/photos/vessel-dry-dock.jpg";
import welder from "@/public/photos/shipyard-welder.jpg";

// Copy from content/home.md. Spans make a 6-column bento; they collapse to one column on phones.
const AUDIENCE = [
  { title: "Shipyard owners and operators", span: "md:col-span-4", featured: true },
  { title: "Marine suppliers and technology providers", span: "md:col-span-2" },
  { title: "Buyers and project owners", span: "md:col-span-2" },
  { title: "Government agencies and training institutions", span: "md:col-span-4" },
];

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-deep text-white">
        {/* Decorative stock photo, tinted so the headline stays readable */}
        <Image src={aerial} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-deep via-deep/80 to-deep/25" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-deep to-transparent" />
        <Glows />
        <Waves />
        <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-14 px-4 pb-28 pt-40 sm:px-8 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <Reveal>
              <Eyebrow dark>Sibu, Sarawak · September 2027</Eyebrow>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-7 font-display text-[clamp(3rem,8.5vw,7rem)] font-semibold leading-[0.94] tracking-tight">
                Maritime Expo Asia <span className="text-glow">2027</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-7 max-w-xl text-xl text-pale">
                The meeting point for shipyards, suppliers and buyers, in Sarawak&apos;s shipbuilding capital.
              </p>
            </Reveal>
            <Reveal delay={300} className="mt-10">
              <Button href="#register">Register your interest</Button>
            </Reveal>
          </div>

          <Reveal delay={400}>
            <Bezel dark innerClassName="p-7 sm:p-9">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-glow">Road to September</p>
              <ol className="mt-6 space-y-8">
                <li>
                  <p className="text-sm text-pale">March 2027</p>
                  <p className="mt-1 font-display text-2xl font-semibold leading-tight">Sarawak Maritime Industry Summit</p>
                  <p className="mt-2 text-[15px] text-pale/80">
                    Industry talks, an open forum, a tabletop exhibition and the SAMIN Installation Night.
                  </p>
                  <Link href="/summit-2027" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors duration-500 ease-fluid hover:decoration-white">
                    Summit details <ArrowIcon />
                  </Link>
                </li>
                <li className="border-t border-white/10 pt-8">
                  <p className="text-sm text-pale">September 2027</p>
                  <p className="mt-1 font-display text-2xl font-semibold leading-tight">Maritime Expo Asia 2027</p>
                  <p className="mt-2 text-[15px] text-pale/80">
                    The main exhibition for shipbuilding, marine services, technology and training. Dates and venue to
                    be announced.
                  </p>
                </li>
              </ol>
            </Bezel>
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <Eyebrow>Why Sibu</Eyebrow>
            </Reveal>
            <Reveal delay={100} className="mt-6">
              <H2>At the centre of Sarawak&apos;s shipbuilding industry.</H2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-lg text-lg text-ink/80">
                Sibu, on the Rejang river, is known as Sarawak&apos;s shipbuilding capital. Maritime Expo Asia 2027
                brings shipbuilders, marine service providers, technology suppliers and training institutions together
                in the city, under one roof.
              </p>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <Bezel>
              <Photo src={dryDock} alt="A ship on a dry dock beside a crane" caption="Illustrative stock photo" />
            </Bezel>
          </Reveal>
        </div>
      </Section>

      <Section tone="white">
        <Reveal>
          <Eyebrow>Who should attend</Eyebrow>
        </Reveal>
        <Reveal delay={100} className="mt-6 max-w-3xl">
          <H2>The maritime supply chain, in one place.</H2>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {AUDIENCE.map((a, i) => (
            <Reveal key={a.title} delay={i * 80} className={a.span}>
              <Bezel className="h-full" innerClassName={`relative overflow-hidden ${a.featured ? "!bg-deep text-white" : ""}`}>
                {a.featured && (
                  <>
                    <Image src={welder} alt="" fill placeholder="blur" sizes="(min-width: 768px) 66vw, 100vw" className="object-cover object-[50%_27%] opacity-80" />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep via-deep/45 to-transparent" />
                  </>
                )}
                <div className="relative flex min-h-56 flex-col justify-between p-7 md:min-h-72">
                  <span className={`font-display text-sm font-semibold ${a.featured ? "text-glow" : "text-amber"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{a.title}</p>
                </div>
              </Bezel>
            </Reveal>
          ))}
        </div>
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
                <EnquiryForm types={["interest"]} />
              </div>
            </Bezel>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

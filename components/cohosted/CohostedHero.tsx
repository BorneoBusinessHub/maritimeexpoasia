import Image, { type StaticImageData } from "next/image";
import Reveal from "@/components/Reveal";
import { Bezel, Button, Eyebrow, Glows, Waves } from "@/components/ui";

type Action = { href: string; label: string; primary?: boolean };

// Hero for a co-hosted event page: title and actions on the left, a date and venue card on the right.
export default function CohostedHero({
  eyebrow,
  title,
  when,
  whenNote,
  where,
  whereNote,
  actions,
  image,
  imageAlt = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  when: string;
  whenNote?: string;
  where: string;
  whereNote?: string;
  actions: Action[];
  image?: StaticImageData;
  imageAlt?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-deep text-white">
      <Glows />
      <Waves />
      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-14 px-4 pb-28 pt-40 sm:px-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <Reveal>
            <Eyebrow dark>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-7 font-display text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[0.96] tracking-tight">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={200} className="mt-10 flex flex-wrap gap-3">
            {actions.map((a) => (
              <Button key={a.href} href={a.href} variant={a.primary ? "primary" : "onDark"}>
                {a.label}
              </Button>
            ))}
          </Reveal>
        </div>

        <Reveal delay={300}>
          <Bezel dark innerClassName="overflow-hidden">
            {image && (
              <div className="relative h-44 sm:h-52">
                <Image src={image} alt={imageAlt} fill priority placeholder="blur" sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep/80 to-transparent" />
                <p className="absolute bottom-3 left-4 rounded-full bg-deep/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  Illustrative stock photo
                </p>
              </div>
            )}
            <dl className="space-y-6 p-7 sm:p-9">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-glow">When</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{when}</dd>
                {whenNote && <dd className="text-[15px] text-pale/80">{whenNote}</dd>}
              </div>
              <div className="border-t border-white/10 pt-6">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-glow">Where</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{where}</dd>
                {whereNote && <dd className="text-[15px] text-pale/80">{whereNote}</dd>}
              </div>
            </dl>
          </Bezel>
        </Reveal>
      </div>
    </section>
  );
}

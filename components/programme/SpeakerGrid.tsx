import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Bezel, Eyebrow, H2, Section } from "@/components/ui";
import { confirmedSpeakers, type Programme } from "@/lib/programme";

// Confirmed speakers only (see lib/programme.ts). Renders nothing when there are none, so the page never shows
// an empty "Speakers" heading or an unconfirmed name.
export default function SpeakerGrid({ programme }: { programme: Programme }) {
  const speakers = confirmedSpeakers(programme);
  if (speakers.length === 0) return null;
  return (
    <Section>
      <Reveal>
        <Eyebrow>Speakers</Eyebrow>
      </Reveal>
      <Reveal delay={100} className="mt-6">
        <H2>Speakers.</H2>
      </Reveal>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {speakers.map((s, i) => (
          <li key={s.id}>
            <Reveal delay={i * 60} className="h-full">
              <Bezel className="h-full" innerClassName="flex h-full flex-col gap-4 p-6 sm:p-7">
                {s.photo && <Image src={s.photo} alt={s.name} className="size-24 rounded-full object-cover" />}
                <div>
                  <p className="font-display text-xl font-semibold leading-tight text-deep">{s.name}</p>
                  <p className="mt-1 text-sm text-ink/70">
                    {s.title}, {s.organisation}
                  </p>
                </div>
                {s.bio && <p className="text-[15px] text-ink/80">{s.bio}</p>}
              </Bezel>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

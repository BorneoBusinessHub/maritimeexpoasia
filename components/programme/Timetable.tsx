import Reveal from "@/components/Reveal";
import { Bezel, Eyebrow, H2, Section } from "@/components/ui";
import { timetableByDay, type Programme, type SessionKind } from "@/lib/programme";

const KIND_LABELS: Record<SessionKind, string> = {
  registration: "Registration",
  talk: "Talk",
  forum: "Forum",
  panel: "Panel",
  session: "Session",
  meal: "Meal",
  ceremony: "Ceremony",
  break: "Break",
  exhibition: "Exhibition",
};

// Confirmed sessions only (see lib/programme.ts). Renders nothing when there are none, so the page never
// shows an empty timetable.
export default function Timetable({ programme }: { programme: Programme }) {
  const days = timetableByDay(programme);
  if (days.length === 0) return null;
  return (
    <Section tone="white">
      <Reveal>
        <Eyebrow>Timetable</Eyebrow>
      </Reveal>
      <Reveal delay={100} className="mt-6">
        <H2>Timetable.</H2>
      </Reveal>
      <div className="mt-12 space-y-4">
        {days.map((d, i) => (
          <Reveal key={d.day} delay={i * 80}>
            <Bezel innerClassName="p-6 sm:p-9">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-deep">
                Day {d.day} · {d.label}
              </h3>
              <ol className="mt-6 divide-y divide-ink/10">
                {d.sessions.map((s) => (
                  <li key={`${s.start}-${s.title}`} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <p className="font-display text-lg font-semibold text-amber">
                      {s.start}
                      {s.end ? `–${s.end}` : ""}
                    </p>
                    <div>
                      <p className="font-semibold text-deep">
                        {s.title}{" "}
                        <span className="ml-1 rounded-full bg-navy/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy align-middle">
                          {KIND_LABELS[s.kind]}
                        </span>
                      </p>
                      {s.speakers.length > 0 && (
                        <p className="mt-1 text-sm text-ink/70">{s.speakers.map((p) => p.name).join(", ")}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Bezel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { IconBadge, pill, type PillVariant } from "@/components/pill";

export function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ring-1 ${
        dark ? "bg-white/10 text-pale ring-white/20" : "bg-navy/5 text-navy ring-navy/15"
      }`}
    >
      {children}
    </span>
  );
}

export function H2({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2
      className={`font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl ${
        dark ? "text-white" : "text-deep"
      }`}
    >
      {children}
    </h2>
  );
}

const TONE = {
  paper: "bg-paper",
  white: "bg-white",
  dark: "relative isolate overflow-hidden bg-deep text-white",
};

export function Section({
  id,
  tone = "paper",
  children,
}: {
  id?: string;
  tone?: keyof typeof TONE;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-4 ${TONE[tone]}`}>
      {tone === "dark" && <Glows />}
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">{children}</div>
    </section>
  );
}

// Nested shell and core with concentric radii, like a glass plate in a tray.
export function Bezel({
  children,
  dark,
  className = "",
  innerClassName = "",
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] p-1.5 ring-1 ${dark ? "bg-white/5 ring-white/10" : "bg-ink/[0.04] ring-ink/[0.06]"} ${className}`}
    >
      <div
        className={`h-full rounded-[calc(2rem-0.375rem)] ${
          dark
            ? "bg-white/[0.07] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
            : "bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_48px_-28px_rgba(12,39,64,0.25)]"
        } ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: PillVariant;
}) {
  return (
    <Link href={href} className={pill(variant)}>
      {children}
      <IconBadge />
    </Link>
  );
}

// Decorative light behind dark sections.
export function Glows() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_85%_15%,rgba(91,141,184,0.38),transparent),radial-gradient(40%_40%_at_8%_95%,rgba(180,83,9,0.22),transparent)]"
    />
  );
}

// Thin wave lines, a quiet maritime motif.
export function Waves() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full text-white sm:h-56">
      {[0, 22, 44, 66].map((y, i) => (
        <path key={y} d={`M0 ${90 + y} C 240 ${30 + y}, 480 ${150 + y}, 720 ${90 + y} S 1200 ${30 + y}, 1440 ${90 + y}`} fill="none" stroke="currentColor" strokeOpacity={0.12 - i * 0.025} strokeWidth="1" />
      ))}
    </svg>
  );
}

// Stock photo inside a Bezel core. Alt text stays generic: these are not photos of Sibu.
// Credits in docs/photo-credits.md. Replace with owned photos when available (docs/05-brand-and-tone.md).
export function Photo({
  src,
  alt,
  caption,
  className = "aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]",
  position = "object-center",
}: {
  src: StaticImageData;
  alt: string;
  caption?: string;
  className?: string;
  position?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-pale ${className}`}>
      <Image src={src} alt={alt} fill placeholder="blur" sizes="(min-width: 1024px) 40vw, 100vw" className={`object-cover ${position}`} />
      {caption && (
        <p className="absolute bottom-4 left-4 rounded-full bg-deep/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {caption}
        </p>
      )}
    </div>
  );
}

// Dark band with title, used at the top of plain pages.
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-deep text-white">
      <Glows />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-40 sm:px-8 sm:pb-28">
        <Reveal>
          <Eyebrow dark>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-none tracking-tight sm:text-7xl">{title}</h1>
        </Reveal>
        {children && (
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-lg text-pale">{children}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

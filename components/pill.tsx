// Button-in-button pill: label plus a nested circular arrow. Shared by links and the form submit.
export type PillVariant = "primary" | "onDark" | "light";

const BASE =
  "group inline-flex items-center gap-4 rounded-full py-2 pl-6 pr-2 text-[15px] font-semibold transition-all duration-700 ease-fluid active:scale-[0.98]";

const VARIANT: Record<PillVariant, string> = {
  primary: "bg-amber text-white hover:bg-[#9a4506]",
  onDark: "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20",
  light: "bg-deep text-white hover:bg-navy",
};

export function pill(variant: PillVariant = "primary") {
  return `${BASE} ${VARIANT[variant]}`;
}

export function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 14 14 6M7 6h7v7" />
    </svg>
  );
}

export function IconBadge() {
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-fluid group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105">
      <ArrowIcon />
    </span>
  );
}

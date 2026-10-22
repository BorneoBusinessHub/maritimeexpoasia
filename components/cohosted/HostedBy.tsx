// Credit strip under a co-hosted event's hero: who hosts it and how we are involved.
export default function HostedBy({ credit, note }: { credit: string; note?: string }) {
  return (
    <div className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-5 sm:px-8">
        <span className="rounded-full bg-deep px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          Co-hosted event
        </span>
        <p className="text-sm text-ink/80">
          {credit}
          {note && <span className="text-ink/60"> {note}</span>}
        </p>
      </div>
    </div>
  );
}

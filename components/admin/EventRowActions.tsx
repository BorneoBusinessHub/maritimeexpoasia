"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEvent, markChecked, setEventStatus } from "@/app/admin/(protected)/events/actions";
import { STATUSES, type EventStatus } from "@/lib/events";

const button = "rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-ink/20 hover:bg-paper disabled:opacity-50";

export default function EventRowActions({ id, status, name }: { id: string; status: EventStatus; name: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function run(action: () => Promise<{ error?: string }>) {
    start(async () => {
      const result = await action();
      setError(result.error ?? "");
      if (!result.error) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={`Status of ${name}`}
        value={status}
        disabled={pending}
        onChange={(e) => run(() => setEventStatus(id, e.target.value as EventStatus))}
        className="rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-ink/20"
      >
        {STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <button className={button} disabled={pending} onClick={() => run(() => markChecked(id))}>
        Mark checked today
      </button>
      <button
        className={`${button} text-red-700`}
        disabled={pending}
        onClick={() => confirm(`Delete "${name}"? This cannot be undone.`) && run(() => deleteEvent(id))}
      >
        Delete
      </button>
      {error && (
        <p role="alert" className="w-full text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

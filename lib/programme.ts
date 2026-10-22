// Timetable and speaker content for an event. Pure logic: nothing here touches React or the database.
//
// Publishing rule (CLAUDE.md): only items with `confirmed: true` are ever shown. A speaker is confirmed once they
// have accepted in writing; a session is confirmed once its slot and title are agreed. Draft times in
// docs/02-programme.md must NOT be entered as confirmed.
import type { StaticImageData } from "next/image";

export type SessionKind = "registration" | "talk" | "forum" | "panel" | "session" | "meal" | "ceremony" | "break" | "exhibition";

export type Speaker = {
  id: string;
  name: string;
  title: string;
  organisation: string;
  bio?: string;
  /** Only with permission to publish the photo. */
  photo?: StaticImageData;
  confirmed: boolean;
};

export type Session = {
  day: number;
  /** 24-hour HH:MM, zero-padded. */
  start: string;
  end?: string;
  title: string;
  kind: SessionKind;
  speakerIds?: string[];
  confirmed: boolean;
};

export type Programme = {
  days: { day: number; label: string }[];
  sessions: Session[];
  speakers: Speaker[];
};

export type TimetableDay = {
  day: number;
  label: string;
  sessions: (Session & { speakers: Speaker[] })[];
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function confirmedSpeakers(p: Programme): Speaker[] {
  return p.speakers.filter((s) => s.confirmed);
}

// Confirmed sessions grouped by day (ascending) and sorted by start time. A session is kept even if one of its
// speakers is unconfirmed or unknown; that speaker is simply not shown.
export function timetableByDay(p: Programme): TimetableDay[] {
  const shown = new Map(confirmedSpeakers(p).map((s) => [s.id, s]));
  const days = new Map<number, TimetableDay>();
  for (const s of p.sessions.filter((x) => x.confirmed)) {
    const label = p.days.find((d) => d.day === s.day)?.label ?? `Day ${s.day}`;
    const day = days.get(s.day) ?? { day: s.day, label, sessions: [] };
    day.sessions.push({ ...s, speakers: (s.speakerIds ?? []).flatMap((id) => shown.get(id) ?? []) });
    days.set(s.day, day);
  }
  return [...days.values()]
    .sort((a, b) => a.day - b.day)
    .map((d) => ({ ...d, sessions: d.sessions.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0)) }));
}

// Mistakes in a content file, as readable lines. A test runs this over every real programme file.
export function programmeProblems(p: Programme): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of p.speakers) {
    if (seen.has(s.id)) out.push(`duplicate speaker id "${s.id}"`);
    seen.add(s.id);
    if (!s.name.trim()) out.push(`speaker "${s.id}" has no name`);
  }
  const dayNumbers = new Set(p.days.map((d) => d.day));
  for (const s of p.sessions) {
    const label = `session "${s.title || "(untitled)"}" on day ${s.day}`;
    if (!s.title.trim()) out.push(`${label} has no title`);
    if (!TIME_RE.test(s.start)) out.push(`${label} has start time "${s.start}" (use HH:MM, zero-padded)`);
    if (s.end !== undefined && !TIME_RE.test(s.end)) out.push(`${label} has end time "${s.end}" (use HH:MM, zero-padded)`);
    if (s.end !== undefined && TIME_RE.test(s.start) && TIME_RE.test(s.end) && s.end < s.start) out.push(`${label} ends before it starts`);
    for (const id of s.speakerIds ?? []) if (!seen.has(id)) out.push(`${label} lists unknown speaker "${id}"`);
    if (!dayNumbers.has(s.day)) out.push(`${label}: day ${s.day} is not defined in days`);
  }
  return out;
}

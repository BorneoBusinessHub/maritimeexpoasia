import assert from "node:assert/strict";
import test from "node:test";
import {
  confirmedSpeakers,
  programmeProblems,
  timetableByDay,
  type Programme,
  type Session,
  type Speaker,
} from "../lib/programme.ts";
import { summit2027 } from "../lib/programmes/summit-2027.ts";

const speaker = (over: Partial<Speaker> = {}): Speaker => ({
  id: "ada",
  name: "Ada Example",
  title: "Managing Director",
  organisation: "Example Shipyard",
  confirmed: true,
  ...over,
});
const session = (over: Partial<Session> = {}): Session => ({
  day: 1,
  start: "09:30",
  title: "Industry Talk",
  kind: "talk",
  confirmed: true,
  ...over,
});
const programme = (over: Partial<Programme> = {}): Programme => ({
  days: [
    { day: 0, label: "Welcome" },
    { day: 1, label: "Industry Day" },
  ],
  sessions: [],
  speakers: [],
  ...over,
});

test("only confirmed speakers are listed, in the order given", () => {
  const p = programme({
    speakers: [speaker({ id: "a", name: "A" }), speaker({ id: "b", name: "B", confirmed: false }), speaker({ id: "c", name: "C" })],
  });
  assert.deepEqual(confirmedSpeakers(p).map((s) => s.name), ["A", "C"]);
});

test("unconfirmed sessions never reach the timetable", () => {
  const p = programme({ sessions: [session({ title: "Draft", confirmed: false }), session({ title: "Real" })] });
  assert.deepEqual(timetableByDay(p).flatMap((d) => d.sessions.map((s) => s.title)), ["Real"]);
});

test("timetable groups by day ascending and sorts sessions by start time", () => {
  const p = programme({
    sessions: [
      session({ day: 1, start: "14:00", title: "Forum" }),
      session({ day: 0, start: "19:00", title: "Welcome dinner", kind: "meal" }),
      session({ day: 1, start: "09:30", title: "Industry Talk" }),
    ],
  });
  const days = timetableByDay(p);
  assert.deepEqual(days.map((d) => d.day), [0, 1]);
  assert.deepEqual(days[1].sessions.map((s) => s.title), ["Industry Talk", "Forum"]);
  assert.equal(days[1].label, "Industry Day");
});

test("a day with no confirmed sessions is left out and a missing label falls back to Day N", () => {
  const p = programme({ days: [], sessions: [session({ day: 2 }), session({ day: 5, confirmed: false })] });
  const days = timetableByDay(p);
  assert.deepEqual(days.map((d) => d.label), ["Day 2"]);
});

test("a session keeps its place but never shows an unconfirmed or unknown speaker", () => {
  const p = programme({
    speakers: [speaker({ id: "ada" }), speaker({ id: "bob", name: "Bob", confirmed: false })],
    sessions: [session({ speakerIds: ["ada", "bob", "nobody"] })],
  });
  const [day] = timetableByDay(p);
  assert.equal(day.sessions.length, 1);
  assert.deepEqual(day.sessions[0].speakers.map((s) => s.name), ["Ada Example"]);
});

test("an empty programme gives empty results", () => {
  assert.deepEqual(timetableByDay(programme()), []);
  assert.deepEqual(confirmedSpeakers(programme()), []);
});

test("programmeProblems finds content mistakes", () => {
  const p = programme({
    speakers: [speaker({ id: "ada" }), speaker({ id: "ada", name: "Duplicate" }), speaker({ id: "x", name: "  " })],
    sessions: [
      session({ start: "9:30" }),
      session({ start: "10:00", end: "09:00" }),
      session({ title: "" }),
      session({ speakerIds: ["ghost"] }),
      session({ day: 7 }),
    ],
  });
  const problems = programmeProblems(p).join("\n");
  assert.match(problems, /duplicate speaker id "ada"/);
  assert.match(problems, /speaker "x" has no name/);
  assert.match(problems, /start time "9:30"/);
  assert.match(problems, /ends before it starts/);
  assert.match(problems, /has no title/);
  assert.match(problems, /unknown speaker "ghost"/);
  assert.match(problems, /day 7 is not defined/);
  assert.deepEqual(programmeProblems(programme({ speakers: [speaker()], sessions: [session()] })), []);
});

test("the Summit 2027 content file is valid and publishes nothing unconfirmed", () => {
  assert.deepEqual(programmeProblems(summit2027), []);
  for (const s of confirmedSpeakers(summit2027)) assert.ok(s.confirmed);
  for (const d of timetableByDay(summit2027)) for (const s of d.sessions) assert.ok(s.confirmed);
});

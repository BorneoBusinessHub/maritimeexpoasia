import type { Programme } from "../programme.ts";

// Sarawak Maritime Industry Summit 2027: confirmed timetable and speakers.
//
// Nothing is confirmed yet, so both lists are empty and the page shows "to be announced". Add an entry only when
// it is confirmed (CLAUDE.md): a speaker only after they have accepted in writing, a session only when its slot
// and title are agreed. Do NOT copy the draft times from docs/02-programme.md until they are confirmed.
//
// Example speaker: { id: "jane-doe", name: "Jane Doe", title: "Managing Director", organisation: "Example Sdn Bhd", confirmed: true }
// Example session: { day: 1, start: "09:30", end: "12:30", title: "Industry Talk", kind: "talk", speakerIds: ["jane-doe"], confirmed: true }
export const summit2027: Programme = {
  days: [
    { day: 0, label: "Welcome" },
    { day: 1, label: "Industry Day" },
    { day: 2, label: "Government Day" },
  ],
  sessions: [],
  speakers: [],
};

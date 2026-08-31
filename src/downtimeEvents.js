// downtimeEvents.js — F17 step 2: the downtime-event data structure the
// Career Mode overhaul's between-call life-sim layer runs on, plus a
// template set of real events. Data-driven per the standing architecture
// goal (new events are addable here, no new code paths) — same spirit as
// conditions.js/drugs.js/achievements.js.
//
// Shape of an event:
//   id      unique key
//   art     an EVENT_ART key (src/assets.js) — falls back to a generic
//           illustration if the art isn't wired up yet
//   title   short heading
//   text    the narrative beat, shown once
//   choices []: { label, effects: {moraleAll, fatigueAll, money}, resultText }
//     - moraleAll/fatigueAll are DELTAS applied to every current roster
//       member (clamped 0-100 by the caller, same as bumpRoster already does
//       for the passive per-call drift) — station life affects the whole
//       crew, not just the player, which is the honest way to model "your
//       partner had a bad day too."
//     - money is a delta on g.money (F4's economy) — some choices cost or
//       earn a little, most are 0.
//
// §1.4 update: relationship tracking now exists (src/relationships.js,
// g.relationships) — the paragraph above described the gap before that
// batch. An event MAY optionally carry `relId` (a key into g.relationships)
// plus `friendshipDelta`/`romanceDelta` on individual choices' `effects`;
// App.jsx's resolveDowntime applies them only when both the event and a
// matching relationship entry exist, so every event without `relId` (all of
// them except old_patrol_partner, below) is completely unaffected. This is
// the first, and so far only, wired consumer — see App.jsx's campaignIntro
// (where partner_patrol is created) and its downtime-event render (where
// this event's title/text branch on the relationship's current tone).
//
// `campaignOnly: true` restricts an event to Zero-To-Hero saves
// (`g.learningMode==="zth"`) — for beats that only make sense for that
// character (the Northwood University PATROL program), not a generic
// career-mode crew. This is the one-line filter CLAUDE.md's F17 note had
// flagged as not-yet-needed; it's needed now that campaign-specific events
// exist. `art` on these three points at an EVENT_ART key that doesn't exist
// yet (no spec written) — App.jsx's render already falls back to
// `PLACEHOLDERS.generic` for any unrecognized key, so this is not a broken
// reference, just unspecced art, same as several other declared-but-unwired
// asset categories noted in the F16 batch.
import { clampMorale } from "./campaign/index.js";

export const DOWNTIME_EVENTS = [
  {
    id: "promotion_ceremony", art: "promotion",
    title: "Someone made rank.",
    text: "The chief calls the crew together in the bay. One of the medics you've worked with for years just made captain. There's cake. There's also a shift schedule that needs covering while everyone celebrates.",
    choices: [
      { label: "Join the celebration", effects: { moraleAll: 8, fatigueAll: 2, money: 0 },
        resultText: "Good morale for the whole house — this kind of thing matters more than people admit." },
      { label: "Congratulate them and get back to checking the rig", effects: { moraleAll: 2, fatigueAll: -2, money: 0 },
        resultText: "Efficient. The rig is squared away early, but you missed most of the moment." },
    ],
  },
  {
    id: "equipment_failure", art: "equipment_failure",
    title: "The monitor won't power on.",
    text: "Pre-shift check and the cardiac monitor on your rig is dead — battery, not the unit itself, but there's no spare charged and ready.",
    choices: [
      { label: "Swap monitors with a rig that's out of service", effects: { moraleAll: -2, fatigueAll: 3, money: 0 },
        resultText: "Took twenty minutes and some paperwork, but the rig is mission-capable." },
      { label: "Requisition a new battery out of pocket, sort it out later", effects: { moraleAll: 1, fatigueAll: 1, money: -15 },
        resultText: "Fixed fast. The reimbursement paperwork is somebody else's problem for now." },
    ],
  },
  {
    // §1.5's "morale-weighted argument odds" — the literal case the design
    // doc names. moraleWeight is optional and unset on every other event
    // here (uniform, unaffected by morale) — see rollDowntimeEvent below for
    // what it does.
    id: "crew_argument", art: "argument", moraleWeight: 1.5,
    title: "Words in the kitchen.",
    text: "Two crew members are having it out over whose turn it was to restock the trauma bag. It's not really about the trauma bag.",
    choices: [
      { label: "Let them sort it out themselves", effects: { moraleAll: -4, fatigueAll: 0, money: 0 },
        resultText: "It cooled off on its own, but it left a mark on the house mood." },
      { label: "Step in and mediate", effects: { moraleAll: 3, fatigueAll: 2, money: 0 },
        resultText: "Took some doing, but everyone's talking again — and actually restocking the bag." },
    ],
  },
  {
    id: "storm_prep", art: "storm",
    title: "A storm's rolling in.",
    text: "Dispatch puts out an advisory — severe weather expected tonight, and every unit is asked to top off fuel and double-check flashlights and cold-weather gear before it hits.",
    choices: [
      { label: "Take the extra time to prep properly", effects: { moraleAll: -1, fatigueAll: 4, money: 0 },
        resultText: "Thorough. Everyone's tired, but the rig is ready for whatever the night brings." },
      { label: "Quick check and call it done", effects: { moraleAll: 1, fatigueAll: 1, money: 0 },
        resultText: "Faster, looser. Probably fine." },
    ],
  },
  {
    id: "birthday", art: "birthday",
    title: "Someone's birthday snuck up on the house.",
    text: "It's one of the rookies' birthdays and nobody remembered until this morning. Someone's already talking about a food run.",
    choices: [
      { label: "Chip in for something nice", effects: { moraleAll: 6, fatigueAll: 0, money: -10 },
        resultText: "A good house looks after its own — the rookie won't forget this." },
      { label: "Sign the card and leave it at that", effects: { moraleAll: 1, fatigueAll: 0, money: 0 },
        resultText: "Simple and cheap. Nobody's upset, nobody's thrilled." },
    ],
  },
  {
    id: "station_inspection", art: "station_inspection",
    title: "Surprise inspection.",
    text: "A battalion chief walks in unannounced to check rig readiness, expiration dates, and general station order.",
    choices: [
      { label: "Scramble to get everything squared away", effects: { moraleAll: -3, fatigueAll: 5, money: 0 },
        resultText: "Passed clean, but it cost the crew a stressful hour they didn't expect to spend." },
      { label: "Let the chief see the station as it actually runs day to day", effects: { moraleAll: 2, fatigueAll: 0, money: 0 },
        resultText: "A few notes, nothing serious. Honesty reads better than a scramble, most days." },
    ],
  },
  {
    id: "training_day", art: "training_day",
    title: "Mandatory skills day.",
    text: "Today's a training day — refreshers on extrication and airway skills the whole house has to sit through.",
    // §1.5.3: "reputation grows by... doing training" — reputationDelta on
    // the choice that actually engages with it, 0 on the one that coasts.
    choices: [
      { label: "Actually engage with it", effects: { moraleAll: 1, fatigueAll: 3, money: 0, reputationDelta: 3 },
        resultText: "Tiring, but everyone's a little sharper for it." },
      { label: "Coast through the mandatory hours", effects: { moraleAll: 2, fatigueAll: 1, money: 0, reputationDelta: 0 },
        resultText: "Nobody's worse off, but nobody's better either." },
    ],
  },
  {
    id: "old_patrol_partner", art: "patrol_visit", campaignOnly: true, relId: "partner_patrol",
    title: "Someone from PATROL stopped by.",
    text: "Your old partner from the Northwood PATROL program is at the station, out of uniform, just passing through campus. \"Heard you're actually doing this now. Figured I'd see it for myself.\"",
    // §1.4.1's own worked example: "supporting a partner after a tough call
    // raises friendship; ignoring them lowers it" — realized directly on
    // this event's two existing choices. romanceDelta is the slow, kind-and-
    // thoughtful trickle §1.4.2 asks for (+1 on the option that's actually
    // present with them; 0 on the brush-off).
    choices: [
      { label: "Take a real break and catch up", effects: { moraleAll: 5, fatigueAll: -3, money: 0, friendshipDelta: 6, romanceDelta: 1 },
        resultText: "Good to be reminded why you started. You come back to the rig lighter than you left it." },
      { label: "Keep it short — there's a rig to check", effects: { moraleAll: 1, fatigueAll: 0, money: 0, friendshipDelta: -3, romanceDelta: 0 },
        resultText: "Polite, brief, professional. Something about it feels like a missed chance." },
    ],
  },
  {
    id: "thank_you_letter", art: "thank_you_letter", campaignOnly: true,
    title: "A letter came for you.",
    text: "Addressed to \"the PATROL responder who helped me\" — a patient from a call weeks back wrote in. No fanfare, just a few sentences saying it mattered.",
    choices: [
      { label: "Read it out loud to the crew", effects: { moraleAll: 6, fatigueAll: 0, money: 0 },
        resultText: "The whole house needed that more than they'd say out loud." },
      { label: "Keep it, read it alone later", effects: { moraleAll: 2, fatigueAll: 0, money: 0 },
        resultText: "You'll come back to this one on a worse day than today." },
    ],
  },
  {
    id: "new_rig_delivery", art: "equipment_failure",
    title: "The new rig showed up.",
    text: "A brand-new ambulance rolls into the bay to replace the one that's been dying by inches for a year. Everyone wants to be the first to take it out.",
    choices: [
      { label: "Do the full inventory and setup right", effects: { moraleAll: 3, fatigueAll: 4, money: 0 },
        resultText: "Every bag's where it should be, every drawer labeled. Boring work, but the next crew on it will thank you." },
      { label: "Grab the keys and go", effects: { moraleAll: 5, fatigueAll: 0, money: 0 },
        resultText: "Fun first shift. Somebody else gets to find out where things actually got put away." },
    ],
  },
  {
    id: "media_ridealong", art: "reporter",
    title: "A reporter wants a ride-along.",
    text: "The local news called ahead — a reporter's shadowing a unit for a piece on EMS staffing shortages, and today it's yours.",
    choices: [
      { label: "Let them ride and answer questions honestly", effects: { moraleAll: 1, fatigueAll: 2, money: 0 },
        resultText: "The piece airs a few weeks later, mostly fair. A couple of quotes get taken out of context, same as always." },
      { label: "Keep it professional and minimal", effects: { moraleAll: 0, fatigueAll: 1, money: 0 },
        resultText: "Polite, guarded, forgettable television. Nobody on the crew ends up regretting anything they said." },
    ],
  },
  {
    id: "rookie_nerves", art: "training_day",
    title: "The new hire is spiraling.",
    text: "A rookie who started two weeks ago is visibly rattled after a rough call — hands shaking, replaying it out loud to anyone who'll listen.",
    choices: [
      { label: "Sit with them and actually talk it through", effects: { moraleAll: 5, fatigueAll: 1, money: 0 },
        resultText: "Not glamorous, but this is half of what keeps people in this job past year one." },
      { label: "Tell them it gets easier and get back to work", effects: { moraleAll: -1, fatigueAll: 0, money: 0 },
        resultText: "True, probably. Doesn't land the way you meant it to, though." },
    ],
  },
  {
    id: "holiday_shift", art: "birthday",
    title: "Nobody wanted the holiday shift.",
    text: "It's a major holiday and the house is running skeleton crew — everyone who could trade out of today, did.",
    choices: [
      { label: "Cook something for whoever's stuck here", effects: { moraleAll: 7, fatigueAll: 1, money: -8 },
        resultText: "Not the same as being home, but it's something. The house remembers who did this." },
      { label: "Keep your head down and get through it", effects: { moraleAll: -2, fatigueAll: -1, money: 0 },
        resultText: "Quiet, uneventful, a little lonely. Tomorrow's a normal day again." },
    ],
  },
  {
    id: "supply_audit", art: "station_inspection",
    title: "Quarterly supply audit.",
    text: "Someone from logistics is going bin by bin through every rig's inventory, cross-checking against what's actually billed.",
    choices: [
      { label: "Walk them through it yourself", effects: { moraleAll: -1, fatigueAll: 3, money: 0 },
        resultText: "Tedious, but it turns up two expired epi kits nobody caught — worth catching before a call, not after." },
      { label: "Let them do their thing and stay out of the way", effects: { moraleAll: 1, fatigueAll: 0, money: 0 },
        resultText: "Faster for you. The audit takes a little longer without anyone to point it in the right direction." },
    ],
  },
  {
    id: "cisd_pediatric", art: "cisd_debrief", campaignOnly: true,
    title: "Critical incident stress debriefing.",
    text: "The department has scheduled a formal CISD session following last week's pediatric call. Attendance is voluntary but strongly encouraged — a counselor and a peer-support team member are both present.",
    choices: [
      { label: "Go, and actually talk", effects: { moraleAll: 4, fatigueAll: 2, money: 0 },
        resultText: "Hard hour. Worth it — the ones who skip these tend to carry it longer, not less." },
      { label: "Sit in the back and say nothing", effects: { moraleAll: -2, fatigueAll: 1, money: 0 },
        resultText: "You showed up, which counts for something. But you're carrying the same weight out the door you brought in." },
    ],
  },
  {
    // Chapter 4 (EMT School, design doc §4.2): "a single optional Ch.4 'ED
    // observation shift' downtime event — narrated, low-mechanical-weight,
    // maybe one knowledge tick." knowledgeDelta is a new, optional effects
    // field (App.jsx's resolveDowntime applies it the same way
    // reputationDelta/friendshipDelta already are — additive, 0 everywhere
    // else) — the first event to use it.
    id: "ed_observation_shift", art: "station_inspection", campaignOnly: true,
    title: "An ED observation shift opens up.",
    text: "*Placeholder — the EMT program offers a few open observation slots in the local ED. Not a rotation like paramedic school will have, just a chance to watch.*",
    choices: [
      { label: "Take the slot", effects: { moraleAll: 0, fatigueAll: 2, money: 0, knowledgeDelta: 1 },
        resultText: "*Placeholder — a shift spent watching, not doing. Small, but real, exposure to what's coming later.*" },
      { label: "Skip it — you've got other things going on", effects: { moraleAll: 0, fatigueAll: 0, money: 0, knowledgeDelta: 0 },
        resultText: "No harm done. The slot goes to someone else." },
    ],
  },
];

// Rolls ONE eligible event (or null), avoiding immediate repeats via
// `excludeId` — the caller (App.jsx's station screen) passes the last event
// shown this shift so the same beat can't fire twice in a row. `isCampaign`
// (default false) gates `campaignOnly` events in or out — a non-campaign
// career save should never draw "your old PATROL partner," since it has no
// PATROL partner.
//
// `morale` (default 50, the same neutral midpoint clampMorale's own 0-100
// range centers on) biases the pick via each event's optional moraleWeight:
// a positive moraleWeight makes an event MORE likely the further morale
// falls below 50, a negative one makes it more likely the further morale
// rises above it, and an event with no moraleWeight keeps its old uniform
// odds regardless of morale (weight multiplier stays exactly 1). This is
// purely additive over the previous uniform-random behavior — callers that
// don't pass morale get the old distribution back (moraleFactor = 0).
export function rollDowntimeEvent(excludeId, isCampaign = false, morale = 50) {
  const pool = DOWNTIME_EVENTS.filter(e => e.id !== excludeId && (!e.campaignOnly || isCampaign));
  if (!pool.length) return null;
  const moraleFactor = (50 - clampMorale(morale)) / 50; // +1 at morale 0, 0 at 50, -1 at morale 100
  const weights = pool.map(e => Math.max(0.1, 1 + (e.moraleWeight || 0) * moraleFactor));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

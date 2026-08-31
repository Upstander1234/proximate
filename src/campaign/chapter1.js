// campaign/chapter1.js — Chapter 1: "Boots on the Ground." Structural
// content, station-roster/dispatch mechanics, and Chapter 1's own dialogue
// (the only chapter whose dialogue lives in a data file today — see
// campaign/index.js's own note on why the rest of the campaign isn't
// migrated yet). No JSX/React import here, consistent with every other
// campaign/*.js file — App.jsx resolves speaker keys/context at render time.

// A small, easier pool than the general Layperson-completable library —
// Chapter 1's whole point is familiarization before EMR school, not
// difficulty. Reused, already-shipped low-acuity scenarios only.
// minorSprain lives in FREQUENT_FLYER_SCENARIOS below, not here — see that
// section's own comment. "vasovagalSyncope" was removed from an earlier
// draft of this pool: it was never a real scenario key (only a physiology
// CONDITION of the same name, already the one benignFaint itself uses) —
// drawing that slot would have handed scenOf() an undefined scenario and
// crashed the kit screen. The pool is 3 real scenarios, not 4/5.
export const CH1_CALL_POOL = ["benignFaint", "chronicBackPain", "testicularTorsion"];
export const CH1_CALLS_PER_SHIFT = 3;
export const CH1_FREQUENT_FLYER_CHANCE = 1 / 3;

// One slot in the shift's 3-call queue has a 1/3 chance of becoming the
// recurring frequent-flyer patient instead of an ordinary CH1_CALL_POOL
// draw (see FREQUENT_FLYER_* below for what that can resolve to).
export function seedCh1Queue(g) {
  const queue = [...CH1_CALL_POOL].sort(() => Math.random() - .5).slice(0, CH1_CALLS_PER_SHIFT);
  if (Math.random() < CH1_FREQUENT_FLYER_CHANCE) {
    const idx = Math.floor(Math.random() * queue.length);
    queue[idx] = pickFrequentFlyerScenario(g);
  }
  return queue;
}

// EMS/ALS arrival timing for Chapter 1's own Layperson-scope calls: "roughly
// 2 minutes give or take one minute randomly" — a uniform 1-3 minute draw.
export function ch1EmsArrivalSeconds() {
  return Math.round((1 + Math.random() * 2) * 60);
}

// The three simultaneous PATROL units on any given shift — the player's own
// assignment (Layperson crew, on foot) is only one of three. Fixed,
// recurring, INTERACTABLE identities (§7/§8 below), not anonymous flavor —
// two possible crews per vehicle, rotating which one is on duty a given
// shift (see patrolShiftRoster() below). Names are drawn per save (see
// CH1_NAME_SLOTS), not hardcoded — only `role`/`gender`/a stable `relId`
// live here.
// Two more 2-person on-foot patrol duos, Layperson level (not EMR), added
// alongside the bike/cart EMR units — real, named, talkable station-mates
// rather than the fluctuating background number laypersonVolunteerCount()
// already tracks. One identity (station_foot2b) is fixed nonbinary rather
// than drawn at random: CH1_STATION_ROSTER's genders are hardcoded per
// identity, not rolled per save, so a random draw could easily never
// surface a nonbinary NPC across many playthroughs — a fixed assignment
// makes it a real, guaranteed-reachable outcome instead of a merely
// supported one. drawNameByGender("nonbinary")/initializeCampaignNames
// (names.js/core.js) already resolve this gender tag correctly; no new
// draw machinery was needed.
export const CH1_STATION_ROSTER = {
  bikeEmrs: [
    { relId: "station_bikeEmr1", role: "bikeEmr", gender: "female" },
    { relId: "station_bikeEmr2", role: "bikeEmr", gender: "male" },
  ],
  cartCrews: [
    [{ relId: "station_cart1a", role: "cartCrew", gender: "female" }, { relId: "station_cart1b", role: "cartCrew", gender: "male" }],
    [{ relId: "station_cart2a", role: "cartCrew", gender: "female" }, { relId: "station_cart2b", role: "cartCrew", gender: "male" }],
  ],
  footPatrols: [
    [{ relId: "station_foot1a", role: "footPatrol", gender: "male" }, { relId: "station_foot1b", role: "footPatrol", gender: "female" }],
    [{ relId: "station_foot2a", role: "footPatrol", gender: "female" }, { relId: "station_foot2b", role: "footPatrol", gender: "nonbinary" }],
  ],
};
// The name-generation registry this chapter contributes to campaign/index.js's
// merged CAMPAIGN_NAME_SLOTS (see core.js's initializeCampaignNames).
export const CH1_NAME_SLOTS = {
  station_bikeEmr1: { gender: "female" },
  station_bikeEmr2: { gender: "male" },
  station_cart1a: { gender: "female" },
  station_cart1b: { gender: "male" },
  station_cart2a: { gender: "female" },
  station_cart2b: { gender: "male" },
  station_foot1a: { gender: "male" },
  station_foot1b: { gender: "female" },
  station_foot2a: { gender: "female" },
  station_foot2b: { gender: "nonbinary" },
};
// Which bike EMR, cart crew, and foot-patrol duo are on duty THIS shift — a
// simple, deterministic rotation (alternating by shift count) rather than a
// fully random draw, so the player sees every crew across a handful of
// shifts.
export function patrolShiftRoster(shiftIdx) {
  const i = shiftIdx ?? 0;
  return {
    bikeEmr: CH1_STATION_ROSTER.bikeEmrs[i % CH1_STATION_ROSTER.bikeEmrs.length],
    cartCrew: CH1_STATION_ROSTER.cartCrews[i % CH1_STATION_ROSTER.cartCrews.length],
    footPatrol: CH1_STATION_ROSTER.footPatrols[i % CH1_STATION_ROSTER.footPatrols.length],
  };
}

export function laypersonVolunteerCount(dayOfWeek) {
  const weekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  const base = weekend ? 5 : 2;
  return base + Math.floor(Math.random() * 3);
}

// ─── The recurring "frequent flyer" — a single named patient, GLOBAL, not
// Chapter-1-scoped ──────────────────────────────────────────────────────
export const FREQUENT_FLYER_SCENARIOS = ["minorSprain", "frequentFlyerIntoxicated", "frequentFlyerCannabis"];
export const FREQUENT_FLYER_OD_SCENARIO = "od";

export function frequentFlyerOdChance(encounters) {
  const n = encounters ?? 0;
  if (n < 5) return 0;
  if (n < 10) return 0.05;
  return 0.20;
}
export function pickFrequentFlyerScenario(g) {
  const encounters = g?.frequentFlyerEncounters ?? 0;
  if (Math.random() < frequentFlyerOdChance(encounters)) return FREQUENT_FLYER_OD_SCENARIO;
  return FREQUENT_FLYER_SCENARIOS[Math.floor(Math.random() * FREQUENT_FLYER_SCENARIOS.length)];
}

export const FREQUENT_FLYER_GENERAL_CHANCE = 1 / 8;
export function maybeInjectFrequentFlyer(queue, g) {
  if (!queue?.length || Math.random() >= FREQUENT_FLYER_GENERAL_CHANCE) return queue;
  const idx = Math.floor(Math.random() * queue.length);
  return queue.map((k, i) => (i === idx ? pickFrequentFlyerScenario(g) : k));
}

// ─── Chapter 1 dialogue ─────────────────────────────────────────────────
export const CH1_DIALOGUE = {
  gearup: [
    { text: () => "You clip the radio to your belt and thumb the volume up until dispatch chatter cuts through clean." },
    { text: () => "The bag's stocked. You checked it twice, then checked the zipper a third time out of pure nerves." },
    { text: () => "The laminated badge on your chest still smells like the laminator. NORTHWOOD PATROL, and under it, your name, like it's actually supposed to be there." },
    { speaker: "partnerFirst", text: () => "You're doing the zipper thing again." },
    { speaker: "partnerFirst", text: () => "It's fine. Everyone does the zipper thing their first real week. I did it for a month." },
    { text: () => "Two weeks ago you didn't know CPR. Now you've got a radio with your name on the roster." },
    { speaker: "partnerFirst", text: (ctx) => `${ctx.bikeEmrName}'s already staged the bike. ${ctx.cartName1} and ${ctx.cartName2} are arguing about who takes the cart first, again. Dispatch doesn't wait for anyone to finish being nervous.` },
    { text: (ctx) => `Somewhere out past the quad, maybe ${ctx.volunteers} volunteers are walking their own loops tonight. You won't see most of them. Tonight it's you, on foot, with your partner, and whatever the radio decides to hand you.` },
    { speaker: "partnerFirst", text: () => "Oh, heads up. Dispatch has favorites. You'll figure out who after your third or fourth 'unconscious person, corner of the quad.' Same corner, weirdly." },
  ],
  supervisorTalk: [
    { speaker: "supFirst", text: () => "Not bad out there tonight. You're steadier than you were a month ago — I mean that, not just performance-review filler." },
    { speaker: "supFirst", text: () => "You didn't freeze on that last one. A lot of people freeze the first time something actually looks bad, even something small. You didn't." },
    { speaker: "supFirst", text: () => "I've been doing this long enough to know who sticks around and who's burned out in eight weeks. You're not giving me burnout energy. Yet." },
    { speaker: "supFirst", text: () => "So — I'll say this once and let you get back to your night." },
    { speaker: "supFirst", text: () => "PATROL will put you through EMR school if you want it. Fully covered — call it recruitment, not charity. Real cert, real scope, real drugs in your bag instead of just gauze and a stubborn attitude." },
    { speaker: "supFirst", text: () => "No pressure either way. The offer doesn't expire, and nobody's going to think less of you for walking the quad exactly as you are for another few months." },
  ],
  partnerTalk: [
    { speaker: "raiserFirst", text: (ctx) => (ctx.sponsorshipAccepted
      ? "Heard the sponsorship talk finally happened. Good. You should take it."
      : "Heard the sponsorship talk happened. Whenever you're ready — no rush from me either.") },
    { speaker: "raiserFirst", text: () => "You've settled into this faster than most people do." },
    { speaker: "raiserFirst", text: () => "I remember my first real shift. I dropped an entire bag of trauma dressings into a puddle. In front of the patient." },
    { speaker: "raiserFirst", text: () => "So here's the actual question, since apparently everyone's asking you questions tonight: are you doing this, or are you just doing this for now?" },
    { text: () => "(EMR school. Gain real scope, real skills. Or keep walking the quad as you are. No wrong answer here.)" },
  ],
  frequentFlyerRecognition: [
    { text: (ctx) => `Dispatch again: "${ctx.name}? Yeah — figures. Same as last time, probably."` },
  ],
};

// ─── Station NPCs — "talk to whoever's here" (a repeatable, real
// relationship-tracked chat, distinct from the one-shot scripted tutorial
// interludes elsewhere in the station phase). The base layer is shared PER
// ROLE (bikeEmr / cartCrew / footPatrol): `firstMeeting` fires once per
// relationship (createRelationship gate), `banter` is a pool picked at
// random on every later talk. Layered on top, `perCharacter[relId]` gives
// each of the ten fixed identities (see CH1_STATION_ROSTER) a few real,
// distinct lines of their own, mixed into the same banter pool once
// friendship crosses CH1_PER_CHARACTER_FRIENDSHIP_THRESHOLD (App.jsx's
// ch1StationTalkTarget reads this the same way it already reads the
// role-generic banter list; see that call site for the mixing logic). Every
// line here is pronoun-neutral by construction (no he/she/they used) so
// station_foot2b's nonbinary gender needs no special-casing. ─────────────
export const CH1_PER_CHARACTER_FRIENDSHIP_THRESHOLD = 20;
export const CH1_STATION_NPC_DIALOGUE = {
  bikeEmr: {
    firstMeeting: [
      { speaker: "npcFirst", text: () => "Hey — you're the new foot patrol, right? Word travels fast around here." },
      { speaker: "npcFirst", text: () => "Bike's faster than it looks. First month I kept overshooting every call by half a block." },
      { speaker: "npcFirst", text: () => "Anyway. Good to have you out here. Radio if you need a hand — I'm usually not far." },
    ],
    banter: [
      { speaker: "npcFirst", text: () => "Quiet one so far tonight. Don't jinx it." },
      { speaker: "npcFirst", text: () => "Tires needed air again. This bike hates me personally, I'm convinced." },
      { speaker: "npcFirst", text: () => "How's the bag treating you? Mine still smells like the box it came in." },
      { speaker: "npcFirst", text: () => "You get used to the radio chatter eventually. First week it never stops sounding urgent." },
    ],
  },
  cartCrew: {
    firstMeeting: [
      { speaker: "npcFirst", text: () => "Oh, you're on foot tonight? Rough. The cart's not much better, honestly, we just complain less." },
      { speaker: "npcFirst", text: () => "Welcome to PATROL. Ignore anyone who tells you the cart has AC. It does not." },
      { speaker: "npcFirst", text: () => "Let us know if you need backup with anything — that's kind of the whole point of having three units out here." },
    ],
    banter: [
      { speaker: "npcFirst", text: () => "We lost the argument over who drives again. It's a whole thing." },
      { speaker: "npcFirst", text: () => "Cart's running fine tonight, which honestly makes us nervous." },
      { speaker: "npcFirst", text: () => "You holding up okay out there on foot? Some nights that's the better deal, weirdly." },
      { speaker: "npcFirst", text: () => "Anything good come through dispatch yet, or is it all the usual quiet stuff?" },
    ],
  },
  footPatrol: {
    firstMeeting: [
      { speaker: "npcFirst", text: () => "Another set of boots on the ground, good. We can always use more of those." },
      { speaker: "npcFirst", text: () => "We just walk the loop, mostly. Nothing fancy, but somebody has to notice when a night's going sideways." },
      { speaker: "npcFirst", text: () => "Stick close to the paths near the dorms after dark. That's where most of the real calls start." },
    ],
    banter: [
      { speaker: "npcFirst", text: () => "Third lap of the quad tonight. My feet are filing a complaint." },
      { speaker: "npcFirst", text: () => "Somebody left a bike locked to the wrong rail again. Not our problem, but it bugs me." },
      { speaker: "npcFirst", text: () => "Radio's been quiet. Either a slow night or the calm before a bad one." },
      { speaker: "npcFirst", text: () => "You get a good read on people fast doing this. Comes in handy." },
    ],
  },
};

// Real, distinct lines per fixed identity, mixed into the shared role
// banter pool above once friendship crosses the threshold. Each entry
// intentionally references its role-generic pair-mate by name (via
// App.jsx's ctx substitution, matching the existing partnerName/
// supervisorName pattern) rather than introducing a second lookup
// mechanism.
export const CH1_STATION_NPC_PER_CHARACTER = {
  // The veteran bike EMR: rides an e-bike, so the years show up as
  // knowledge and pace, not physical wear.
  station_bikeEmr1: [
    { speaker: "npcFirst", text: () => "Fourteen years on this bike, well, this GENERATION of bike. The motor does the suffering these days. My knees have never been happier." },
    { speaker: "npcFirst", text: () => "You get faster at reading a scene before you even dismount. That comes with mileage, not talent, and the throttle helps with the mileage part." },
    { speaker: "npcFirst", text: () => "Ask me sometime about the raccoon in the quad. Actually, don't. It still haunts me." },
  ],
  // The newer bike EMR: still a little green, still enthusiastic about it.
  station_bikeEmr2: [
    { speaker: "npcFirst", text: () => "I switched over from campus security about six months ago. Best call I've made. The e-bike helps, I'd never survive this on a regular one." },
    { speaker: "npcFirst", text: () => "Every shift still feels a little like the first one. Does that wear off eventually?" },
    { speaker: "npcFirst", text: () => "I keep a spare charger cable and a granola bar in my bag at all times. Priorities." },
  ],
  station_cart1a: [
    { speaker: "npcFirst", text: (ctx) => `We've run this cart together two years now. ${ctx.cart1bName || "my partner"} still can't parallel park it.` },
    { speaker: "npcFirst", text: () => "See what I deal with out here every shift." },
  ],
  station_cart1b: [
    { speaker: "npcFirst", text: () => "That's slander, for the record. I can park it. I choose not to, out of respect for the curb." },
    { speaker: "npcFirst", text: () => "Two years and counting. Somebody has to keep this crew honest." },
  ],
  // The calm mentor half of the second cart pair.
  station_cart2a: [
    { speaker: "npcFirst", text: () => "First month's the hardest. After that your hands stop shaking before you even touch the patient." },
    { speaker: "npcFirst", text: (ctx) => `That means ${ctx.cart2bName || "my partner"} still cares. Worry the day it stops.` },
  ],
  // The still-a-little-anxious half of the second cart pair.
  station_cart2b: [
    { speaker: "npcFirst", text: () => "Mine still shake a little, honestly. Getting better though." },
    { speaker: "npcFirst", text: () => "I trust this crew more than I trust myself most nights. That helps." },
  ],
  // Retired-professional foot-patrol volunteers.
  station_foot1a: [
    { speaker: "npcFirst", text: () => "Twenty years teaching before this. Kids and patients aren't that different, honestly. Both groups ignore you until something's on fire." },
  ],
  station_foot1b: [
    { speaker: "npcFirst", text: () => "We just walk the loop, mostly. Somebody's twisted an ankle, somebody needs directions, somebody just needs a person to notice they're having a bad day." },
  ],
  // Community-college students building hours toward EMR school.
  station_foot2a: [
    { speaker: "npcFirst", text: () => "We're trying to log enough hours to apply for EMR school in the spring." },
  ],
  station_foot2b: [
    { speaker: "npcFirst", text: () => "Mostly we hand out water bottles and point freshmen at the health center. Not glamorous, but it counts." },
  ],
};

// ─── Background dispatch — a real per-unit availability state machine
// (App.jsx §8/§9 of the follow-up plan): other station NPCs get sent to
// their own calls, are unavailable to talk to while gone, and come back on
// a believable timer computed from the game's own real map/travel-time
// math (scope.js's travelTimes()-style machinery), not an invented number.
// This file only supplies the FLAVOR data — the timing/state machine itself
// lives in App.jsx, next to the sim-clock tick effect it hooks into.
export const BACKGROUND_CALL_TYPES = [
  { id: "bikeScrape", text: "a bike-vs-pedestrian scrape near the library", band: [6, 12] },
  { id: "dininghallFaint", text: "a fainting spell in the dining hall", band: [8, 15] },
  { id: "dormFalseAlarm", text: "a false alarm at the dorms", band: [4, 9] },
  { id: "quadAnkle", text: "a twisted ankle on the quad stairs", band: [7, 13] },
  { id: "partyNoise", text: "a noise complaint that turned into a wellness check", band: [10, 18] },
];
// A subset of the above resolve into a short narrated vignette instead of
// just the plain "back at the rack" log line — at most one per shift.
export const BACKGROUND_CALL_VIGNETTES = {
  bikeScrape: [
    "Turns out it was minor — a skinned knee and a bent wheel, more embarrassed than hurt.",
    "Both riders were laughing about it by the time the report got written up.",
  ],
  dininghallFaint: [
    "Low blood sugar, skipped dinner for a study session. A juice box and twenty minutes fixed it.",
    "She was back at her table before the tray even got cleared.",
  ],
  quadAnkle: [
    "A real rolled ankle, not a fracture — splinted, iced, and sent off with a friend for support.",
  ],
};

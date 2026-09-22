// campaign/core.js — shared campaign mechanics/data used by more than one
// chapter (or by non-chapter files like scope.js/downtimeEvents.js). Split
// out of the old single campaign.js so dialogue/chapter content can live in
// its own small files (see campaign/index.js for the full folder map).
// Data-only, same convention the old file already established: plain
// exported tables plus small pure helpers, consumed directly by App.jsx.
import { drawNameByGender } from "../names.js";

// The four personal-attribute self-reflection prompts (design doc §2.3,
// "Who Are You?"). Each stat starts at 10 (set in App.jsx's blank()). Every
// option carries a PRIMARY delta (+5, to the scene's own theme) and a
// SECONDARY delta (+1, to a different stat) — per the doc, so even a player
// who consistently avoids one theme still picks up small secondary bleed
// into it. `flavor` is the one-line reflection the doc gives for Prompt 1's
// options only — carried as an optional field rather than invented for the
// other three prompts, which the doc doesn't give flavor lines for.
export const REFLECTION_PROMPTS = [
  {
    id: "highschool",
    scene: "Back in high school, I was mostly known for…",
    options: [
      { label: "Being the one who could outrun everyone and never got tired.", primary: "fitness", secondary: "confidence",
        flavor: "You remember the feeling of wind in your face and the respect of your teammates." },
      { label: "Spending lunch in the library, learning things that weren't even in the curriculum.", primary: "knowledge", secondary: "ambition",
        flavor: "You were always curious, and it felt good to know the answers." },
      { label: "Being the person people came to when they needed a laugh or a shoulder.", primary: "confidence", secondary: "knowledge",
        flavor: "You learned early how to read a room and connect with others." },
      { label: "Bouncing between ideas, starting clubs, dreaming big.", primary: "ambition", secondary: "fitness",
        flavor: "You couldn't sit still—there was always a new horizon." },
    ],
  },
  {
    id: "sunday",
    scene: "On a lazy Sunday, you'll most likely find me…",
    options: [
      { label: "Going for a hike, hitting the gym, or playing pick-up basketball.", primary: "fitness", secondary: "confidence" },
      { label: "Curled up with a good book or watching a documentary.", primary: "knowledge", secondary: "ambition" },
      { label: "Hanging out with friends, just seeing where the day goes.", primary: "confidence", secondary: "knowledge" },
      { label: "Planning next week's schedule or sketching out a project.", primary: "ambition", secondary: "fitness" },
    ],
  },
  {
    id: "stress",
    scene: "When things get stressful, I tend to…",
    options: [
      { label: "Go for a run to clear my head.", primary: "fitness", secondary: "knowledge" },
      { label: "Break down the problem step-by-step until it makes sense.", primary: "knowledge", secondary: "confidence" },
      { label: "Talk it out with someone close.", primary: "confidence", secondary: "ambition" },
      { label: "Channel the energy into achieving something else.", primary: "ambition", secondary: "fitness" },
    ],
  },
  {
    id: "superpower",
    scene: "If I could have any superpower, it would be…",
    options: [
      { label: "Infinite stamina—never tired, always ready.", primary: "fitness", secondary: "ambition" },
      { label: "A perfect memory—absorb everything I read instantly.", primary: "knowledge", secondary: "confidence" },
      { label: "The ability to make anyone feel at ease with a few words.", primary: "confidence", secondary: "fitness" },
      { label: "The drive to turn any idea into reality.", primary: "ambition", secondary: "knowledge" },
    ],
  },
];
export const REFLECTION_PRIMARY_DELTA = 5;
export const REFLECTION_SECONDARY_DELTA = 1;

// ─── Stat mechanics (design doc §1.3.1/§1.3.3) — all campaign-only ─────────
export const FATIGUE_MAX = 100;
export function clampFatigue(v) { return Math.max(0, Math.min(FATIGUE_MAX, Math.round(v))); }

// Medical Simulation (sandbox) mode has no campaign progression, so every stat
// is treated as the best it can be. These values sit at or past each stat's own
// ceiling: fitness 20 is where fitnessCostMult bottoms out and the bag cap
// lifts, and confidence + knowledge of 60 is where campaignFumbleChance hits
// its 1% floor.
export const SIM_MAX_STATS = { fitness: 20, confidence: 30, knowledge: 30, ambition: 20 };
// A stat as the game should read it right now: maxed in Medical Simulation,
// the stored campaign value everywhere else.
export function statFor(s, name) {
  return s && s.gmode === "sandbox" ? SIM_MAX_STATS[name] : (s?.[name] ?? 10);
}
// Fitness after fatigue, for stamina: no fatigue in Medical Simulation.
export function staminaFitness(s) {
  return s && s.gmode === "sandbox" ? SIM_MAX_STATS.fitness : effectiveFitness(s?.fitness, s?.fatigue);
}

export function effectiveFitness(fitness, fatigue) {
  const f = fitness ?? 10, fat = fatigue ?? 0;
  let ef = f * (1 - fat / 200);
  if (fat > 80) ef *= 1 - (fat - 80) / 100;
  return Math.max(0, ef);
}

export function fitnessCostMult(effFitness) {
  const ef = Math.max(0.1, effFitness ?? 10);
  return Math.max(0.5, Math.min(2, 10 / ef));
}

export const PHYSICAL_ACTION_IDS = new Set([
  "cpr", "tq", "cCollar", "splint", "traction", "pelvicBinder", "directPressure", "pack",
]);
export const FATIGUE_PER_PHYSICAL_ACTION = 4;

export function campaignFumbleChance(confidence, knowledge) {
  const c = confidence ?? 10, k = knowledge ?? 10;
  const raw = 0.15 - (c + k - 20) * 0.004;
  return Math.max(0.01, Math.min(0.15, raw));
}

export const CAMPAIGN_BAG_CAP_BASE = 2;
export const CAMPAIGN_BAG_CAP_FITNESS_THRESHOLD = 20;
export function campaignBagCap(fitness, defaultCap) {
  if ((fitness ?? 10) >= CAMPAIGN_BAG_CAP_FITNESS_THRESHOLD) return defaultCap;
  return Math.min(CAMPAIGN_BAG_CAP_BASE, defaultCap);
}

export function betweenCallRecovery(fitness) {
  return 10 + Math.round((fitness ?? 10) * 0.3);
}

// ─── §1.5 Fatigue, Morale, and Reputation ──────────────────────────────────
export function endOfShiftFatigueGain(callCount, anyFatality) {
  return 5 + Math.max(0, (callCount ?? 0) - 3) + (anyFatality ? 2 : 0);
}
export const FATIGUE_WARN_THRESHOLD = 80;
export const FATIGUE_STUMBLE_THRESHOLD = 100;
export const FATIGUE_STUMBLE_CHANCE = 0.10;

// ── Arrival-time choice (Ch.1 debut, then recurring every zth shift) ───────
export const ARRIVAL_TIME_OPTIONS = [
  { id: "very_early", reputationDelta: 3, moraleDelta: 2, fatigueDelta: 4 },
  { id: "a_bit_early", reputationDelta: 1, moraleDelta: 1, fatigueDelta: 3 },
  { id: "on_time", reputationDelta: 0, moraleDelta: 0, fatigueDelta: 0 },
  { id: "a_bit_late", reputationDelta: -2, moraleDelta: -1, fatigueDelta: -3 },
];
export function arrivalTimeDeltas(optionId) {
  return ARRIVAL_TIME_OPTIONS.find(o => o.id === optionId) || ARRIVAL_TIME_OPTIONS[2];
}

export function clampMorale(v) { return Math.max(0, Math.min(100, Math.round(v))); }
export function clampReputation(v) { return Math.max(-100, Math.min(100, Math.round(v))); }

export const REPUTATION_SUSPENSION_THRESHOLD = -20;
export function needsRemedialTraining(reputation) {
  return (reputation ?? 0) <= REPUTATION_SUSPENSION_THRESHOLD;
}

export function callOutcomeDeltas(result, scopeViolated) {
  const died = !!result?.died, correct = !!result?.correct;
  const base = died ? { reputationDelta: -4, moraleDelta: -8 }
    : correct ? { reputationDelta: 3, moraleDelta: 2 }
    : { reputationDelta: 1, moraleDelta: -3 };
  return scopeViolated ? { ...base, reputationDelta: base.reputationDelta - 2 } : base;
}

// ─── Campaign NPC names — everyone except Jason is drawn, not hardcoded ───
// Per explicit direction: no recurring campaign character has a fixed,
// hardcoded name except Jason (the ParamedicStories persona,
// campaignLaptop's video skit — the one deliberate, in-fiction fixed
// character). Every other named NPC across every chapter file is declared
// as a "slot" ({gender} or {genders: [...]} for a role with more than one
// possible identity) rather than a literal name. `initializeCampaignNames`
// draws one real name per slot via drawNameByGender, once, at campaign
// start, and the result is persisted in g.campaignNames for the rest of the
// save — the same idiom App.jsx's own `frequentFlyerName` already
// established for a different recurring character. `slots` is the merged
// registry every chapter file contributes to (see campaign/index.js).
export function initializeCampaignNames(slots) {
  const names = {};
  for (const [id, spec] of Object.entries(slots || {})) {
    const genders = spec.genders || [spec.gender || "male"];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    names[id] = { name: drawNameByGender(gender).name, gender };
  }
  return names;
}

// Small render-time helpers: resolve a cast-table entry's real name/gender
// from g.campaignNames by its slotId (usually the entry's own relId, or a
// standalone slot key for entries with no relationship). Falls back to the
// slotId itself (name) / "male" (gender) if campaignNames hasn't been
// seeded yet (shouldn't happen in real play — campaignCustomize always
// seeds it before any chapter that reads a name — but keeps this from ever
// rendering `undefined` or handing createRelationship a missing gender).
export function campaignName(g, slotId) {
  return g?.campaignNames?.[slotId]?.name || slotId;
}
export function campaignGender(g, slotId) {
  return g?.campaignNames?.[slotId]?.gender || "male";
}

// ─── §1.6.2.1 Money — the real backbone of the certification ladder ───────
export const STARTING_MONEY = 250;
export const TUITION = { emr: 0, emt: 1300, aemt: 2400, paramedic: 9500 };
export const OPTIONAL_CERT_COST = { acls: 150, pals: 200 };
export const OPTIONAL_CERT_SCORE = { acls: 8, pals: 6 };

export function canEnroll(money, tier) {
  return (money ?? 0) >= (TUITION[tier] ?? 0);
}

// ── Debt/loans ──────────────────────────────────────────────────────────
export function takeLoan(money, debt, borrowAmount) {
  const amt = Math.max(0, borrowAmount || 0);
  return { money: (money ?? 0) + amt, debt: (debt ?? 0) + amt };
}

export const DEBT_DEDUCTION_RATE = 0.15;
export const MORTGAGE_DEDUCTION_RATE = 0.10;

export function recurringDeduction(paycheck, balance, rate) {
  const bal = balance ?? 0;
  if (bal <= 0) return { paycheckAfterDeduction: paycheck, balanceAfter: 0 };
  const taken = paycheck * rate;
  return { paycheckAfterDeduction: paycheck - taken, balanceAfter: Math.max(0, bal - taken) };
}

// ── Employer tuition assistance / scholarships (§1.6.2.1) ──────────────────
export const SCHOLARSHIP_MIN_TENURE_CALLS = 15;
export const SCHOLARSHIP_MIN_REPUTATION = 15;

export function scholarshipEligible(employer, tenureCalls, reputation) {
  return !!employer && employer !== "volunteer_fire"
    && (tenureCalls ?? 0) >= SCHOLARSHIP_MIN_TENURE_CALLS
    && (reputation ?? 0) >= SCHOLARSHIP_MIN_REPUTATION;
}

export function scholarshipCoverage(reputation) {
  return Math.max(30, Math.min(100, 30 + (reputation ?? 0) * 0.7));
}

export function serviceCommitmentPayback(monthsRemaining, totalMonths, tuitionCovered) {
  if (!totalMonths) return 0;
  return tuitionCovered * Math.max(0, Math.min(1, monthsRemaining / totalMonths));
}

// ── Employer pay (§1.6.6) ──────────────────────────────────────────────────
export const JOB_SHIFT_PAY = { pso: 80, ift: 120, county911: 170, fire911: 240, event: 145 };
export const EVENT_SHIFT_FREQUENCY_FACTOR = 0.6;

// ── Off-duty housing/lifestyle (§1.6.2.2) ───────────────────────────────────
export const HOUSING_TIERS = {
  dorm: { cost: 0, recurring: 0, fatigueRecoveryBonus: 0 },
  shared_apt: { cost: 600, recurring: 60, fatigueRecoveryBonus: 0.15 },
  solo_apt: { cost: 1800, recurring: 140, fatigueRecoveryBonus: 0.25 },
  house: { cost: 8000, recurring: null, fatigueRecoveryBonus: 0.35 },
};
export const LIFESTYLE_PURCHASES = {
  vehicle: { costMin: 2500, costMax: 6000 },
  pet: { costMin: 50, costMax: 150 },
  homeGym: { cost: 400 },
  studyDesk: { cost: 350 },
};

// ─── §1.6.8.1 Paramedic admission — a probability, not a flat gate ─────────
export function paramedicApplicationFloor(calls911, aemtCalls, iftCalls, eventCalls) {
  return (calls911 ?? 0) + (aemtCalls ?? 0) + 0.5 * ((iftCalls ?? 0) + (eventCalls ?? 0));
}
export const PARAMEDIC_APPLICATION_FLOOR_MIN = 15;

export function callScore(emrCalls, iftCalls, eventCalls, calls911, aemtCalls) {
  return Math.min(emrCalls ?? 0, 60) * 0.02
    + Math.min(iftCalls ?? 0, 40) * 0.15
    + Math.min(eventCalls ?? 0, 30) * 0.2
    + Math.min(calls911 ?? 0, 40) * 0.5
    + Math.min(aemtCalls ?? 0, 40) * 1.1;
}

export function optionalCertScore(certifications) {
  const set = certifications || new Set();
  let total = 0;
  for (const key of Object.keys(OPTIONAL_CERT_SCORE)) if (set.has(key)) total += OPTIONAL_CERT_SCORE[key];
  return total;
}

export function advocateBonus(primaryFriendship, secondaryFriendships) {
  const primary = (primaryFriendship != null && primaryFriendship >= 40)
    ? (primaryFriendship - 40) * 0.4 : 0;
  const strongSecondary = (secondaryFriendships || []).filter(f => (f ?? 0) >= 60).length;
  return primary + Math.min(15, 5 * strongSecondary);
}

export function paramedicAdmissionChance({
  reputation, certLevel, emrCalls, iftCalls, eventCalls, calls911, aemtCalls,
  certifications, entranceExamScore, primaryAdvocateFriendship, secondaryAdvocateFriendships,
}) {
  const raw = 0.5
    + (reputation ?? 0) * 0.25
    + (certLevel === "aemt" ? 35 : 0)
    + Math.min(45, callScore(emrCalls, iftCalls, eventCalls, calls911, aemtCalls))
    + optionalCertScore(certifications)
    + (entranceExamScore ?? 0) * 0.2
    + advocateBonus(primaryAdvocateFriendship, secondaryAdvocateFriendships);
  return Math.max(0.5, Math.min(97, raw));
}

// ─── §1.6.6 911/fire entrance exams ─────────────────────────────────────────
export function nine11EntranceScore(baseRoll, emrCalls, iftCalls, eventCalls, reputation) {
  return (baseRoll ?? 0)
    + Math.min(emrCalls ?? 0, 40) * 0.5
    + Math.min(iftCalls ?? 0, 20) * 1
    + Math.min(eventCalls ?? 0, 10) * 1
    + (reputation ?? 0) * 0.5;
}
export const NINE11_HIRE_IMMEDIATE = 75;
export const NINE11_HIRE_CONDITIONAL = 45;

export function fireEntranceScore(reputation, examComponent) {
  return 50 + (reputation ?? 0) * 0.6 + (examComponent ?? 0);
}

// ─── §1.6.10 generic exam scoring — reused by EMR/EMT/AEMT/Paramedic ───────
export function examFieldScore(scenarioResults) {
  const arr = scenarioResults || [];
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
export function examCombinedScore(fieldScore, writtenCorrect, writtenTotal, fieldWeight) {
  const writtenPct = writtenTotal ? (writtenCorrect / writtenTotal) * 100 : 0;
  return fieldScore * fieldWeight + writtenPct * (1 - fieldWeight);
}
export const EXAM_FIELD_WEIGHT = { emr: 0.70, emt: 0.70, aemt: 0.65, paramedic: 0.55 };
export const EXAM_PASS_THRESHOLD = { emr: 70, emt: 85, aemt: 82, paramedic: 88 };

export function examPass(combinedScore, tier) {
  return combinedScore >= (EXAM_PASS_THRESHOLD[tier] ?? 70);
}

export function examFailurePenalty(attemptNumber) {
  const n = attemptNumber ?? 1;
  return { reputationDelta: -3 - n, knowledgeDelta: -1, remediationShiftsSkipped: n };
}

// ─── Exam-roll placeholders, shared by every certification tier (§1.6.10) ──
export function rollExamFieldScore(n, confidence, knowledge) {
  const c = confidence ?? 10, k = knowledge ?? 10;
  const scores = [];
  for (let i = 0; i < (n ?? 5); i++) {
    const base = 58 + (c - 10) * 1.3 + (k - 10) * 1.6;
    scores.push(Math.max(0, Math.min(100, base + (Math.random() * 24 - 12))));
  }
  return scores;
}
export function rollWrittenQuiz(total, knowledge) {
  const k = knowledge ?? 10;
  const pPerQuestion = Math.max(0.35, Math.min(0.95, 0.55 + (k - 10) * 0.02));
  let correct = 0;
  for (let i = 0; i < (total ?? 5); i++) if (Math.random() < pPerQuestion) correct++;
  return { correct, total: total ?? 5 };
}
export const EXAM_WRITTEN_QUESTIONS = { emr: 5, emt: 5, aemt: 5, paramedic: 8 };
export const EXAM_FIELD_SCENARIOS = { emr: 5, emt: 5, aemt: 5, paramedic: 6 };

// ─── Chapter 7 — AEMT: the advocate draw (§1.6.8.3) ────────────────────────
// Pool of paramedic-program advocate CANDIDATES this playthrough could
// plausibly have a relationship with. `eligible(g)` is the per-playthrough
// filter. Names are no longer literal — `genders` lists which gender(s) a
// role's drawn identity can be (a role with two possible genders draws one
// at campaign start, same as any other slot); `job_supervisor`'s identity
// is resolved at the App.jsx call site instead, since it already lives
// per-employer.
export const ADVOCATE_POOL = [
  { role: "ER physician", relationshipId: "advocate_er", eligible: () => true, genders: ["female", "male"] },
  { role: "Fire chief", relationshipId: "fire_chief", eligible: (g) => g.chapter3Path === "fire", genders: ["female"] },
  { role: "Job supervisor", relationshipId: "job_supervisor", eligible: (g) => (g.jobs || []).length > 0, genders: [] },
  { role: "Course instructor", relationshipId: "instructor", eligible: () => true, genders: ["female"] },
];
export const ADVOCATE_FRIENDSHIP_FLOOR = 40;
// advocate_er has no other owning chapter file to declare its slot in
// (fire_chief/instructor/job_supervisor are already registered by
// chapter3.js/chapter2.js/chapter5.js — redeclaring the same key here would
// be harmless, since a slot registry is deduplicated by key before the
// single draw happens, but there's no need to).
export const ADVOCATE_NAME_SLOTS = { advocate_er: { genders: ["female", "male"] } };

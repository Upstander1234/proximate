// ─── San Diego County EMS Treatment Protocols (S-1xx series) ──────────────
// Converted directly off the county's own current treatment-protocol PDFs
// (src/protocols/Raw Protocol Sources/San Diego County Protocols/) — the
// S-120 through S-150 numbering, all dated 2024-2026. Each rule below is
// commented with the protocol number/section it comes from.
//
// NOTE ON THE SOURCE FOLDER: it contains TWO overlapping numbering schemes
// for the same topics — a current S-1xx series (S-120..S-145A, S-150,
// S-100, S-104A) whose own cross-references and addenda (S-127A "ECPR
// Decision Algorithm" pairs with S-127; S-145A "COWS Score" pairs with
// S-145) confirm it is the live numbering, and an OLDER, superseded S-16x
// series (S-160..S-178) covering the identical topics under the county's
// previous protocol-book numbering. Only the current S-1xx series was used
// here; the S-16x duplicates were read as PDFs but deliberately not
// converted from, since they describe the same clinical content a session
// out of date. Purely administrative/destination/legal protocols with no
// field-treatable, physiology-gated step of their own (S-100 Patient
// Management Standards — disposition-only, no drug/procedure step; S-104A
// Spinal Motion Restriction Algorithm; S-402 Determination of Death; S-407
// Triage to Appropriate Facility; S-412 Refusal of Care; S-413 MCI Triage
// Annex D; S-414 DNR/EOL; S-415 Base Hospital Contact; S-421 Sexual Assault
// Destination; S-422 Patient Restraints; T-460/T-460A Trauma Center
// Criteria; P-403 Physician on Scene; P-405 Communications Failure; A-475
// Air Medical Utilization) were read for context but produce no rules,
// exactly as this project's LA County file already treats its own
// non-clinical TP numbers.
//
// A DELIBERATE, COUNTY-SPECIFIC SAFETY DIFFERENCE FROM LA COUNTY'S FILE,
// STATED UP FRONT: San Diego's own CPR/Arrhythmias protocol (S-127,
// footnote 2 under Pulseless Electrical Activity) says plainly "Naloxone
// is not authorized in cardiac arrest." LA County's file DOES fire
// naloxone in arrest (its own `arrestNaloxone` rule). This file
// deliberately has NO arrest-gated naloxone rule at all — every naloxone
// rule below is explicitly gated `!pulseless(ctx)`, matching this
// county's own real, stated contraindication rather than reusing another
// county's rule shape blind.
//
// A SECOND REAL, COUNTY-SPECIFIC DIFFERENCE: this county's own med list
// (P-115, already converted into scopes/sanDiegoCounty.js) does not
// authorize olanzapine at any level — confirmed by re-checking that file
// before writing this one. LA's TP 1209 agitation algorithm offers both
// olanzapine (moderate agitation) and midazolam (severe); San Diego's own
// text (S-135, S-136, S-142) only ever gives midazolam for severe
// agitation/combativeness, with no moderate-tier drug step at all. This
// file's own agitation rule below reflects that — no olanzapine rule
// exists here, and the midazolam rule only fires at the SEVERE threshold.
//
// A THIRD DIFFERENCE, STATED HONESTLY: some of San Diego's own dosing
// (250 mL boluses in S-126/S-127/S-144; 1 gm/10 mL push-dose-epinephrine
// mixing instructions the game has no equivalent syringe-prep mechanic
// for) don't line up with this engine's fixed per-drug dose granularity
// (`saline` is 500 mL/administration, `pushEpi` is one fixed push-dose
// unit). Every rule below that reuses a drug at a coarser granularity than
// the protocol's own stated dose says so in its own comment, matching the
// precedent already established in this project's LA County file for the
// identical class of approximation (e.g. that file's own amiodarone/
// amiodarone2 and lidocaine dose-rounding notes).
//
// TASK-CAP POLICY, STATED ONCE HERE RATHER THAN RE-DERIVED PER RULE: where
// this county's own text gives an explicit total dose count ("MR x2",
// "max 3 doses", "max 450 mg" against a known per-dose amount), that exact
// total is used, converted into however many administrations of this
// engine's one fixed-dose drug entry it takes to reach it. Where the text
// uses open-ended "MR" phrasing with no stated total — a bolus or push
// meant to be titrated to a physiologic endpoint (SBP, in almost every
// case) rather than a fixed count — a conservative default ceiling is used
// instead of leaving the rule uncapped: 2 administrations (1 L) for a
// "MR to maintain SBP" saline bolus with no stated total, and 6
// administrations for an open-ended, explicitly-titrated push-dose
// epinephrine drip (roughly 18 minutes of q3min dosing). Leaving a
// crew-directed dose uncapped is a real, previously-documented safety gap
// in this engine's own crew-direction layer (`evaluateProtocol`'s own
// `running` set only excludes a task CURRENTLY in progress, not one
// already completed, so an unbounded rule would keep re-offering the same
// drug indefinitely) — every rule below has an explicit numeric ceiling
// for exactly this reason, matching this project's LA County file's own
// documented discipline on the same point.
//
// A rule that targets a BHO- or BHPO-gated step (a Base Hospital order
// explicitly required before the standing-order ceiling can be exceeded —
// e.g. a third synchronized cardioversion, or buprenorphine for opioid
// withdrawal) is capped at the STANDING-ORDER-authorized count only; the
// BHO-gated escalation beyond that is left for a human decision, not
// auto-fired, matching this file's own general principle that it directs
// crew TOWARD an intervention and never substitutes for a physician order.

import {
  pulseless, apnoeic, lowSpo2, hypoxic, soiledAir,
  noVitals, notMonitored, noLeads, altered,
} from "./engine.js";

// ── Shared predicates ──────────────────────────────────────────────────
const SHOCK = (ctx) => ctx.v.sbp > 0 && ctx.v.sbp < 90;
const HAS_IV = (ctx) => (ctx.s.ivSites || []).length > 0;
const doseCount = (ctx, id) => (ctx.s.doses || []).filter((d) => d.id === id).length;
const gaveDose = (ctx, id) => doseCount(ctx, id) > 0;

// S-127's rhythm strings are real, already-classified engine state
// (cardiovascular.js) — "svt", "afib", "flutter", "VT" (monomorphic),
// "torsades" (polymorphic), "chb" (third-degree block) are all distinct
// values this engine assigns on its own. Unlike this project's LA County
// file (which folds flutter into the afib bucket for lack of a separate
// engine string), this engine DOES track "flutter" as its own state — S127's own "ATRIAL FIBRILLATION / FLUTTER" section treats both identically,
// so both are read together below.
const SHOCKABLE = (ctx) => pulseless(ctx) && ["VF", "VT", "torsades"].includes(ctx.v.rhythm);
const NONSHOCKABLE_ARREST = (ctx) => pulseless(ctx) && !SHOCKABLE(ctx);
const TACHY_SVT = (ctx) => ctx.v.rhythm === "svt";
const TACHY_AFIB_FLUTTER = (ctx) => ctx.v.rhythm === "afib" || ctx.v.rhythm === "flutter";
const TACHY_WCT_REGULAR = (ctx) => ctx.v.rhythm === "VT";
// Torsades (polymorphic VT) has no separately-treated STABLE branch in
// this county's own text — S-127 only ever addresses it under the
// pulseless VF/VT bucket (SHOCKABLE, below), which the arrest rules
// already cover; no dedicated const is needed for a non-arrest case this
// protocol's own source text never describes.
// S-127's own repeated "SBP<90 mmHg and exhibiting signs/symptoms of
// inadequate perfusion (ALOC, pallor, diaphoresis, chest pain, dyspnea)"
// definition of "unstable" — this engine has no pallor/diaphoresis field,
// so plain hypotension (SHOCK) is used as the objective, measurable core
// of that definition, the same simplification this project's LA County
// file already makes for an equivalent qualitative criterion.
const UNSTABLE = SHOCK;

// S-131/S-127(PEA)/S-139(crush): "suspected hyperkalemia (e.g., peaked
// T-waves or widened QRS complex)" is the SAME real ECG finding across all
// three protocols, published as `v.qrsWidth` (patient.js's vitals()) —
// 0.12s is the standard wide-QRS cutoff. `v.k` is also published directly.
// All three protocols key their calcium/bicarb/albuterol bundle off the
// ECG FINDING itself, not a confirmed lab potassium, so WIDE_QRS is
// included as its own trigger, not just k>=6 — a real, deliberate,
// stated county practice (an ECG-driven standing order, not a
// lab-gated one), also matching S-134's separate TCA-widened-QRS
// indication for sodium bicarbonate (see the sodiumBicarb rule below).
const WIDE_QRS = (ctx) => ctx.v.qrsWidth > 0.12;
const SEVERE_HYPERK = (ctx) => ctx.v.k >= 6.0 || WIDE_QRS(ctx);

// S-123 step 6/S-144: <60 mg/dL is the county's own hypoglycemia cutoff.
const HYPOGLYCEMIC = (ctx) => ctx.v.glu > 0 && ctx.v.glu < 60;
// S-123: "≥350 mg/dL or reads 'high'" — this county's own severe-
// hyperglycemia cutoff (distinct from other counties' own numbers).
const SEVERE_HYPERGLYCEMIC = (ctx) => ctx.v.glu >= 350;
const AWAKE = (ctx) => ctx.v._cons === "awake";
// S-130's own stated cutoff (86F/30C) below which epinephrine dosing in
// arrest is limited to a single dose and antiarrhythmics/further
// defibrillation attempts are noted as unreliable. No dedicated rule
// exists for the general <35C hypothermia diagnosis itself — S-130's own
// cold-exposure BLS/ALS steps (warming, dry dressings) have no
// drug/procedure task to gate on beyond the already-covered
// warmBlanket-shaped baseline this file doesn't need a temperature
// threshold to trigger.
const SEVERELY_HYPOTHERMIC = (ctx) => ctx.v.temp > 0 && ctx.v.temp < 30;
// A standard clinical heat-stroke threshold (104F/40C) — not stated
// numerically in S-130's own text (which only narrates the presentation:
// "rapid cooling... avoid shivering"), so this is the same class of
// externally-anchored, not-invented number this project's own
// HYPOTHERMIC constant already uses one line above.
const HEAT_STROKE = (ctx) => ctx.v.temp >= 40;
// S-136/S-131: `v.edema` is the same real pulmonary-fluid-status field
// several already-shipped conditions in this engine drive (CHF, sepsis) —
// reused here as the "rales" signal both protocols gate several steps on.
const RALES = (ctx) => ctx.v.edema >= 0.3;
const WHEEZING = (ctx) => ctx.v.bronch >= 0.3;
const BRADYCARDIC = (ctx) => ctx.v.hr > 0 && ctx.v.hr < 60;
const TENSION_PTX = (ctx) => ctx.v.ptx === "tptx";
const OPEN_PTX = (ctx) => ctx.v.ptx === "ptx";
// S-141: reused by every other protocol's own "treat pain per S-141"
// cross-reference rather than re-derived per protocol.
const GENERIC_PAIN = (ctx) => ctx.v.pain >= 4;
// S-135/S-136/S-142: `v.agitation` (patient.js) is a real, already-live
// 0-1 severity this engine composes from sympathetic tone, hypoxia, and a
// condition-declared burden (see this project's own physiology-queue
// history, items 51/52) — published directly on vitals(), no activePat()
// reach-through needed. 0.65 matches the severe-agitation threshold this
// project's own LA County file already uses for the identical field.
const AGITATED_SEVERE = (ctx) => ctx.v.agitation >= 0.65;

// `ctx.v` has no pregnancy/seizure/structural-injury fields — those live
// on the real Patient object, reached through ctx.s._roster the same way
// physiology.js's own activePatient(s) does. Real, live state, not a
// reconstruction — the same idiom this project's LA County file already
// established for the identical need.
function activePat(ctx) {
  const roster = ctx.s._roster;
  if (!roster || !roster.length) return null;
  return (roster.find((e) => e.id === ctx.s.activePatientId) || roster[0]).patient || null;
}
function newbornPat(ctx) {
  return ctx.s._roster?.find((e) => e.id === "newborn")?.patient || null;
}
// S-133's own "≥20 weeks gestation or up to 6 weeks postpartum" window
// isn't tracked precisely by this engine (only "has an established
// pregnancy object" is) — the same stated simplification LA's file uses.
const PREGNANT = (ctx) => !!activePat(ctx)?._pregnancy;
const DELIVERED = (ctx) => !!activePat(ctx)?._pregnancy?.delivered;
const ACTIVE_SEIZURE = (ctx) => !!activePat(ctx)?.seizing;
// S-133 preeclampsia: only the objective, symptom-independent branch
// ("SBP≥160 on two consecutive readings") is representable — the
// headache/vision-change/RUQ-pain symptom branch has no matching field in
// this engine, the same documented gap LA's own eclampsia rule states.
const SEVERE_PREECLAMPSIA = (ctx) => PREGNANT(ctx) && ctx.v.sbp >= 160;
// S-139/S-144: real, already-live structural fields (neuro.js) this file
// reaches the same way LA's own Trauma/Stroke rules do.
const SUSPECTED_TBI = (ctx) => (activePat(ctx)?.brainInjury ?? 0) > 0;
const ACTIVE_HEMORRHAGE = (ctx) => (activePat(ctx)?.activeBleedRate ?? 0) > 0;
const SHOCK_INDEX_HIGH = (ctx) => ctx.v.hr > 0 && ctx.v.sbp > 0 && ctx.v.hr >= ctx.v.sbp;
// S-144: real, already-live stroke-exam fields (queue-item-34 work) — the
// same real threshold `actions.js`'s own `strokeScreen` action uses for a
// positive facial-droop/arm-drift finding.
const STROKE_SUSPECTED = (ctx) => (activePat(ctx)?.strokeWeakness ?? 0) >= 0.4 || !!activePat(ctx)?.strokeAphasia;

// S-133 neonatal resuscitation — the newborn is a SEPARATE roster patient,
// not necessarily whichever one `ctx.v` currently reports on. Reads the
// raw Patient property, matching `scenarios.js`'s own newborn actions and
// LA County's own identical `t.neoAction` crewFn wiring.
const NEWBORN_UNSTIMULATED = (ctx) => { const nb = newbornPat(ctx); return !!nb && !nb._neo?.stimulated && !nb._neo?.ppv; };
const NEWBORN_NEEDS_PPV = (ctx) => { const nb = newbornPat(ctx); return !!nb && nb.hr > 0 && nb.hr < 100 && !nb._neo?.ppv; };
const NEWBORN_NEEDS_CPR = (ctx) => { const nb = newbornPat(ctx); return !!nb && nb.hr > 0 && nb.hr < 60 && !!nb._neo?.ppv && !nb._neo?.compressions; };

// S-150's own SEVERE tier — "severe respiratory distress, respiratory
// arrest, cyanosis... seizures, unconsciousness" — the same real,
// objective signals this project's LA County file already uses for the
// identical clinical picture. MILD/MODERATE (miosis, rhinorrhea,
// increasing salivation) has no representable signal in this engine — no
// secretions/pupil-diameter mechanism exists — so only SEVERE gets an
// automatic rule; mild/moderate DuoDote stays manual-only.
const NERVE_AGENT_SEVERE = (ctx) => apnoeic(ctx) || ACTIVE_SEIZURE(ctx) || (ctx.v.spo2 > 0 && ctx.v.spo2 < 90);

// S-143: "history suggestive of infection with ≥2 of the following" — the
// infection-history half is not representable (no infection-source
// signal exists in this engine), so this counts only the 5 objective
// vital-sign criteria the protocol itself lists, an honest, imperfect
// proxy for the full clinical picture, same class of approximation as
// this file's other vital-sign-only triggers.
const SEPSIS_CRITERIA = (ctx) => {
  let n = 0;
  if (ctx.v.temp >= 38.0 || (ctx.v.temp > 0 && ctx.v.temp < 36.0)) n++;
  if (ctx.v.hr >= 90) n++;
  if (ctx.v.rr >= 20 || (ctx.v.etco2 > 0 && ctx.v.etco2 < 25)) n++;
  if (altered(ctx)) n++;
  if (SHOCK(ctx)) n++;
  return n >= 2;
};

export default {
  id: "san_diego_county", name: "San Diego County Protocols",
  rules: [
    // ── Immediate life threats — outrank every protocol-specific step ──
    { id: "airway", when: soiledAir, task: "suction", note: "clear the soiled airway first" },
    { id: "cpr", when: pulseless, task: "cpr", note: "no pulse — compressions" },
    { id: "vent", when: apnoeic, task: "bvm", note: "inadequate breathing — bag them" },
    // S-139: "if SpO2<90% or hypoventilation despite high-flow O2, assist
    // ventilations with BVM" — a second, TBI-relevant hypoxia trigger for
    // the same bvm task, not gated by the apnoeic rate check above.
    { id: "ventHypoxic", when: (ctx) => hypoxic(ctx) && !apnoeic(ctx), task: "bvm", note: "SpO2 under 90 despite O2 — assist ventilations" },

    // ── S-100's own <94% abnormal-vitals threshold; baseline ALS steps
    //    common to nearly every protocol ("O2 saturation PRN", "Monitor/
    //    ECG") ──
    { id: "o2", when: (ctx) => !apnoeic(ctx) && lowSpo2(ctx), task: "o2", note: "SpO2 under 94 — high-flow oxygen" },
    { id: "monitor", when: notMonitored, task: "monitor", note: "get them on the monitor" },
    { id: "leads", when: noLeads, task: "leads", note: "leads on, twelve-lead" },
    { id: "vitals", when: noVitals, task: "vitals", note: "full set of vitals" },
    // A narrow, concrete IV trigger (the hypoglycemia D10 line needs a real
    // line) rather than a blanket "any patient gets IV" guess — the same
    // discipline LA's own file states for its equivalent rule.
    { id: "iv", when: (ctx) => HYPOGLYCEMIC(ctx) && !HAS_IV(ctx), task: "iv", note: "line for dextrose" },

    // ── S-123/S-134/S-145, opioid toxicity — naloxone. Deliberately
    //    NEVER gated on pulseless(ctx): S-127's own footnote says naloxone
    //    is not authorized in cardiac arrest, unlike this project's LA
    //    County file. Both bullets (RR<12 alone; RR<12 OR SpO2<96 OR
    //    EtCO2>=40, the ALS "respiratory depression" tier) collapse to one
    //    rule since this engine has no route distinction to key a second
    //    rule off. 4 doses is a conservative titration ceiling absent a
    //    stated protocol total (this protocol's own text is explicitly
    //    open-ended, "titrate IV dose to effect") — matching the exact
    //    convention LA's own file already uses for the same drug. ──
    { id: "opioidNaloxone", when: (ctx) => !pulseless(ctx) && ((ctx.v.rr > 0 && ctx.v.rr < 12) || (ctx.v.spo2 > 0 && ctx.v.spo2 < 96) || (ctx.v.etco2 >= 40)) && doseCount(ctx, "naloxone_iv") < 4, task: "naloxoneArrest", note: "suspected opioid toxicity — naloxone" },

    // ── S-123, Altered Neurologic Function ──
    { id: "glucoseCheck", when: (ctx) => altered(ctx) && !ctx.s.done?.gluc, task: "glucoseCheck", note: "rule out hypoglycemia" },
    { id: "oralGlucose", when: (ctx) => HYPOGLYCEMIC(ctx) && AWAKE(ctx), task: "oralGlucose", note: "glucose <60, awake — oral glucose" },
    { id: "dextrose", when: (ctx) => HYPOGLYCEMIC(ctx) && HAS_IV(ctx), task: "dextrose", note: "glucose <60 — D10 IV" },
    { id: "glucagonIM", when: (ctx) => HYPOGLYCEMIC(ctx) && !AWAKE(ctx) && !HAS_IV(ctx), task: "glucagonIM", note: "glucose <60, no line, not awake — glucagon IM" },
    // S-123: "500 mL fluid bolus IV/IO if BS≥350... if no rales MR x1" — 2
    // administrations (1 L) total.
    { id: "salineHyperglycemic", when: (ctx) => SEVERE_HYPERGLYCEMIC(ctx) && !RALES(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "glucose >=350 — rapid saline infusion" },
    // Status epilepticus / any active seizure — S-123's own "actively
    // seizing >=5 min" duration isn't tracked; ACTIVE_SEIZURE is used as
    // the practical, real, live proxy (same simplification LA's own
    // eclampsia rule uses for an identical duration criterion). "MR x1 in
    // 5 min" — 2 doses total.
    { id: "seizureMidazolam", when: (ctx) => ACTIVE_SEIZURE(ctx) && doseCount(ctx, "midazolam") < 2, task: "midazolamSeizure", note: "active seizure — midazolam" },

    // ── S-141, Pain Management (cross-referenced by nearly every other
    //    protocol). Only fentanyl is crew-directable in this engine —
    //    S-141's own ketamine and morphine steps have no matching TASKS
    //    entry (this engine's crew-direction task list only has a single
    //    opioid-analgesic task), a real, honest gap rather than a guess at
    //    a task id that doesn't exist. "Max 200 mcg" at 50 mcg/dose = 4
    //    administrations. ──
    { id: "painFentanyl", when: (ctx) => GENERIC_PAIN(ctx) && !SHOCK(ctx), task: "fentanylPain", note: "moderate/severe pain — fentanyl" },

    // ── S-122, Allergic Reaction / Anaphylaxis; shared with S-136's own
    //    identical epinephrine step for severe asthma/allergic reaction
    //    unresponsive to nebulized treatment (same drug, same dose, same
    //    trigger shape — one rule serves both protocols' text). "MR x2
    //    q5 min" — 3 doses total. ──
    { id: "anaphEpi", when: (ctx) => WHEEZING(ctx) && (SHOCK(ctx) || lowSpo2(ctx)) && doseCount(ctx, "epiIM") < 3, task: "epiIM", note: "wheezing with shock/hypoxia — epinephrine IM" },
    { id: "anaphDiphen", when: (ctx) => WHEEZING(ctx) && (SHOCK(ctx) || lowSpo2(ctx)) && gaveDose(ctx, "epiIM") && !gaveDose(ctx, "diphen"), task: "diphenhydramine", note: "after epinephrine — diphenhydramine" },
    { id: "anaphAlbuterol", when: (ctx) => WHEEZING(ctx) && doseCount(ctx, "albuterol") < 3, task: "albuterolNeb", note: "respiratory involvement — nebulized albuterol" },
    // S-122 severe/refractory anaphylaxis: 500 mL "MR to maintain SBP≥90"
    // (no stated total — this file's own default 2-dose/1 L ceiling),
    // then push-dose epi once fluid alone isn't holding pressure.
    { id: "anaphSaline", when: (ctx) => WHEEZING(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "severe anaphylaxis — fluid" },
    { id: "anaphPushEpi", when: (ctx) => WHEEZING(ctx) && SHOCK(ctx) && gaveDose(ctx, "saline") && doseCount(ctx, "pushEpi") < 6, task: "pushEpi", note: "anaphylaxis refractory to fluid — push-dose epi" },

    // ── S-126, Discomfort/Pain of Suspected Cardiac Origin — also serves
    //    S-136's own identical CHF nitro tiers (same drug family, same
    //    threshold shape). S-136's own SBP>=150 tier calls for a real
    //    0.8 mg dose this engine has no drugs.js entry for yet — see
    //    CLAUDE.md's physiology queue item 64, which explicitly found
    //    that building a second nitro entry isn't safely calibrated yet.
    //    Reuses the single 0.4 mg entry for both tiers rather than guess
    //    at an uncalibrated drug id. BLS's own "max 3 doses" figure (for
    //    the patient's OWN prescribed NTG) is reused as the ALS cap too,
    //    since the ALS bullet itself gives no explicit total. ──
    { id: "cardiacAspirin", when: (ctx) => GENERIC_PAIN(ctx) && doseCount(ctx, "aspirin") < 1, task: "aspirinTask", note: "chest pain — aspirin" },
    { id: "cardiacNitro", when: (ctx) => ctx.v.sbp >= 100 && (RALES(ctx) || GENERIC_PAIN(ctx)) && doseCount(ctx, "nitro") < 3, task: "nitroTask", note: "SBP >=100 — nitroglycerin" },
    // "Discomfort/pain of suspected cardiac origin with associated shock":
    // 250 mL bolus (granularity note above) — capped at a single
    // administration since this engine's smallest fluid unit (500 mL) is
    // already double the protocol's own stated volume.
    { id: "cardiacSaline", when: (ctx) => GENERIC_PAIN(ctx) && SHOCK(ctx) && !RALES(ctx) && doseCount(ctx, "saline") < 1, task: "salineBolus", note: "cardiac chest pain with shock — fluid" },
    { id: "cardiacPushEpi", when: (ctx) => GENERIC_PAIN(ctx) && SHOCK(ctx) && (gaveDose(ctx, "saline") || RALES(ctx)) && doseCount(ctx, "pushEpi") < 6, task: "pushEpi", note: "refractory to fluid or rales present — push-dose epi" },

    // ── S-127, CPR / Arrhythmias ──
    // Unstable bradycardia: "Atropine 1mg IV/IO, MR q3-5min to max 3mg."
    { id: "bradyAtropine", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && doseCount(ctx, "atropine") < 3, task: "atropineTask", note: "unstable bradycardia — atropine" },
    { id: "bradyMidazolamPrePacing", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && gaveDose(ctx, "atropine") && doseCount(ctx, "midazolam") < 1, task: "midazolamSeizure", note: "unresponsive to atropine, pre-pacing — sedation" },
    // "Rhythm unresponsive to atropine... external cardiac pacing." Third-
    // degree block ("chb") is real, distinct engine state where atropine
    // is footnoted as unlikely to help, so it's included alongside
    // "exhausted the atropine ceiling."
    { id: "bradyPacing", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && (ctx.v.rhythm === "chb" || doseCount(ctx, "atropine") >= 3) && doseCount(ctx, "pacing") < 1, task: "pacingTask", note: "unresponsive to atropine — transcutaneous pacing" },
    { id: "bradySaline", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && (gaveDose(ctx, "atropine") || gaveDose(ctx, "pacing")) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "still hypotensive after atropine/pacing — fluid" },
    { id: "bradyPushEpi", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && (gaveDose(ctx, "atropine") || gaveDose(ctx, "pacing")) && doseCount(ctx, "pushEpi") < 6, task: "pushEpi", note: "still hypotensive after atropine/pacing/fluid — push-dose epi" },

    // SVT, stable: "Adenosine 6mg... 12mg... MR x1" — this engine's single
    // adenosine entry (12mg) stands in for both the 6mg and 12mg doses; 2
    // administrations matches the real "6 then 12" two-dose sequence.
    { id: "svtAdenosine", when: (ctx) => TACHY_SVT(ctx) && !UNSTABLE(ctx) && doseCount(ctx, "adenosine") < 2, task: "adenosineTask", note: "stable SVT — adenosine" },
    { id: "svtSaline", when: (ctx) => TACHY_SVT(ctx) && SHOCK(ctx) && !RALES(ctx) && doseCount(ctx, "saline") < 1, task: "salineBolus", note: "SVT, SBP <90 — fluid" },
    // SVT/AFib-flutter(rate>=180)/VT, unstable: sedation then synchronized
    // cardioversion. "MR x2, MR BHO" — 2 standing-order-authorized shocks;
    // a third requires a Base Hospital order and is left manual.
    { id: "cardiovertMidazolam", when: (ctx) => ((TACHY_SVT(ctx) || (TACHY_AFIB_FLUTTER(ctx) && ctx.v.hr >= 180) || TACHY_WCT_REGULAR(ctx)) && UNSTABLE(ctx)) && doseCount(ctx, "midazolam") < 1, task: "midazolamSeizure", note: "unstable tachycardia — pre-cardioversion sedation" },
    { id: "cardiovertNow", when: (ctx) => ((TACHY_SVT(ctx) || (TACHY_AFIB_FLUTTER(ctx) && ctx.v.hr >= 180) || TACHY_WCT_REGULAR(ctx)) && UNSTABLE(ctx)) && doseCount(ctx, "cardiovert") < 2, task: "cardiovertTask", note: "unstable tachycardia — synchronized cardioversion" },
    { id: "postCardiovertSaline", when: (ctx) => gaveDose(ctx, "cardiovert") && SHOCK(ctx) && !RALES(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "post-cardioversion, still hypotensive — fluid" },

    // VT, stable: "Amiodarone 150mg in 100mL over 10min, MR x1 in 10min" —
    // this is the SAME 150mg dose as the arrest-repeat entry (amiodarone2,
    // not the 300mg arrest-bolus entry), reused here since it matches the
    // real stated dose. Lidocaine is the protocol's own listed
    // alternative; amiodarone is used as the automatic default (the
    // first-listed option) the same way this file treats every other
    // "OR" choice between two clinically-equivalent options, leaving
    // lidocaine available for manual ordering.
    { id: "vtStableAmiodarone", when: (ctx) => TACHY_WCT_REGULAR(ctx) && !UNSTABLE(ctx) && doseCount(ctx, "amiodarone2") < 2, task: "amiodaroneRepeat", note: "stable VT — amiodarone" },
    { id: "vtStableSaline", when: (ctx) => TACHY_WCT_REGULAR(ctx) && SHOCK(ctx) && !RALES(ctx) && doseCount(ctx, "saline") < 1, task: "salineBolus", note: "VT, SBP <90 — fluid" },

    // VF/pulseless VT and torsades — defibrillation, epi after 2nd shock,
    // amiodarone after 3 attempts. Neither shockable nor non-shockable
    // arrest epi fires if the arrest is a suspected hemorrhagic trauma
    // (S-139's traumatic-arrest algorithm: "Do not administer epinephrine
    // if suspected hemorrhagic etiology") — a real, enforceable exclusion
    // on the automatic recommendation itself, not just a narrated
    // restriction. Epinephrine is limited to a single dose below 30C/86F
    // (S-130's own stated cutoff); otherwise a 4-dose conservative
    // ceiling (roughly 12-20 min at q3-5min) is used, since the protocol
    // itself gives no stated total.
    { id: "arrestPads", when: (ctx) => SHOCKABLE(ctx) && !ctx.s.done?.pads, task: "applyPads", note: "shockable rhythm — pads on" },
    { id: "arrestDefib", when: SHOCKABLE, task: "defibrillate", note: "shockable rhythm — defibrillate" },
    { id: "ivArrest", when: (ctx) => pulseless(ctx) && !HAS_IV(ctx), task: "iv", note: "arrest — vascular access" },
    { id: "epiVF", when: (ctx) => SHOCKABLE(ctx) && !ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "defib") >= 2 && doseCount(ctx, "epiIV") < (SEVERELY_HYPOTHERMIC(ctx) ? 1 : 4), task: "epiArrest", note: "post-shock x2 — epinephrine" },
    { id: "vfAmiodarone", when: (ctx) => SHOCKABLE(ctx) && doseCount(ctx, "defib") >= 3 && doseCount(ctx, "amiodarone") < 1, task: "amiodarone", note: "persistent VF/VT after 3 shocks — amiodarone" },
    { id: "vfAmiodaroneRepeat", when: (ctx) => SHOCKABLE(ctx) && doseCount(ctx, "defib") >= 3 && gaveDose(ctx, "amiodarone") && doseCount(ctx, "amiodarone2") < 1, task: "amiodaroneRepeat", note: "refractory VF/VT — amiodarone repeat, 150mg" },

    // PEA/Asystole
    { id: "epiNonshockable", when: (ctx) => NONSHOCKABLE_ARREST(ctx) && !ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "epiIV") < (SEVERELY_HYPOTHERMIC(ctx) ? 1 : 4), task: "epiArrest", note: "asystole/PEA — epinephrine" },
    // Suspected hyperkalemia bundle — shared, identically-worded trigger
    // across S-127 (PEA), S-131 (Hemodialysis Patient), and S-139 (crush
    // injury on extrication): CaCl2, NaHCO3, continuous nebulized
    // albuterol. Also the real trigger for S-134's own TCA-widened-QRS
    // sodium bicarbonate step, since WIDE_QRS is a superset signal real
    // sodium-channel-blocker toxicity and ischemia also produce — the
    // same reasoning this project's LA County file already documents for
    // the identical ambiguity (calcium may fire for a wide-QRS TCA
    // patient that a stricter reading of S-134 alone wouldn't call for;
    // this county's own hyperkalemia-ECG standing order is written to
    // fire on the ECG finding alone, not a confirmed lab potassium, so
    // this is a faithful reading of the source text, not a guess).
    { id: "hyperkCalcium", when: (ctx) => SEVERE_HYPERK(ctx) && doseCount(ctx, "calcium") < 1, task: "calciumChloride", note: "suspected hyperkalemia — calcium" },
    { id: "hyperkBicarb", when: (ctx) => SEVERE_HYPERK(ctx) && doseCount(ctx, "bicarb") < 1, task: "sodiumBicarb", note: "suspected hyperkalemia / wide QRS — bicarb" },
    { id: "hyperkAlbuterol", when: (ctx) => SEVERE_HYPERK(ctx) && doseCount(ctx, "albuterol") < 3, task: "albuterolNeb", note: "suspected hyperkalemia — continuous albuterol" },
    // PEA suspected hypovolemia: "1,000 mL fluid bolus IV/IO, MR x2" —
    // three 1000 mL boluses = 6 administrations of this engine's 500 mL
    // entry.
    { id: "peaHypovolemiaSaline", when: (ctx) => NONSHOCKABLE_ARREST(ctx) && doseCount(ctx, "saline") < 6, task: "salineBolus", note: "PEA, suspected hypovolemia — fluid" },
    // S-139's traumatic-arrest algorithm: "1,000 mL fluid bolus IV/IO,"
    // unconditional, no repeat stated — 2 administrations.
    { id: "traumaticArrestSaline", when: (ctx) => pulseless(ctx) && ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "traumatic arrest — fluid" },

    // ROSC: S-127's own "SBP<90 mmHg" fluid/push-dose-epi steps for a
    // post-arrest patient are NOT given a dedicated rule here — `pat.
    // roscOccurred` (mortality.js) exists but is deliberately debrief-only
    // state a provider must not be able to read during play (see this
    // project's own physiology.js header comment on outcomeReport(s)), so
    // a crew-direction rule cannot honestly key off "was this patient just
    // resuscitated." The shockSaline/shockPushEpi rules below (S-138)
    // already fire for exactly this case on the same real, available
    // signal (a pulse is present, SBP<90) — no separate rule is needed or
    // would be distinguishable from it.

    // ── S-129, Envenomation Injuries — no drug/procedure step beyond the
    //    generic pain-management and IV rules already covered above. ──

    // ── S-130, Environmental Exposure ──
    { id: "heatSaline", when: (ctx) => HEAT_STROKE(ctx) && !RALES(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "heat exhaustion/heat stroke — fluid" },
    { id: "drowningCpap", when: (ctx) => lowSpo2(ctx) && !apnoeic(ctx) && doseCount(ctx, "cpap") < 1, task: "cpapTask", note: "drowning with respiratory distress — CPAP" },

    // ── S-131, Hemodialysis Patient — the hyperkalemia bundle above
    //    already covers "suspected hyperkalemia (e.g., peaked T-waves or
    //    widened QRS)" for both dialysis and non-dialysis patients, per
    //    the shared SEVERE_HYPERK trigger. "Fluid overload with rales" —
    //    treat CHF per S-136 — is covered by that protocol's own nitro/
    //    CPAP rules below, gated on RALES the same way. ──

    // ── S-133, Obstetrical Emergencies / Newborn Deliveries ──
    { id: "leftTilt", when: (ctx) => PREGNANT(ctx) && !DELIVERED(ctx), task: "leftTilt", note: "pregnant patient — displace the uterus left" },
    { id: "preeclampsiaMagnesium", when: (ctx) => PREGNANT(ctx) && (SEVERE_PREECLAMPSIA(ctx) || ACTIVE_SEIZURE(ctx)) && doseCount(ctx, "magnesium") < 1, task: "magnesiumSulfate", note: "severe preeclampsia/eclampsia — magnesium sulfate" },
    { id: "postpartumFundalMassage", when: (ctx) => DELIVERED(ctx) && SHOCK(ctx), task: "fundalMassage", note: "postpartum hemorrhage — fundal massage" },
    // "500 mL fluid bolus IV/IO, MR x2 q10min" — 3 administrations.
    { id: "postpartumSaline", when: (ctx) => DELIVERED(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 3, task: "salineBolus", note: "postpartum hemorrhage — fluid" },
    // "If estimated blood loss ≥500mL and within 3 hours of delivery" —
    // EBL isn't tracked; ongoing shock in a delivered mother is used as
    // the real, available proxy for significant postpartum hemorrhage.
    { id: "postpartumTxa", when: (ctx) => DELIVERED(ctx) && SHOCK(ctx) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "significant postpartum hemorrhage — TXA" },
    { id: "newbornDry", when: NEWBORN_UNSTIMULATED, task: "newbornDry", note: "newborn — dry, warm, stimulate" },
    { id: "newbornPpv", when: NEWBORN_NEEDS_PPV, task: "newbornPpv", note: "newborn HR <100 — bag with BVM" },
    { id: "newbornCpr", when: NEWBORN_NEEDS_CPR, task: "newbornCompressions", note: "newborn HR <60 despite PPV — compressions" },
    // Newborn epinephrine and newborn-scaled fluid boluses are
    // deliberately NOT implemented — reusing this engine's adult-dosed
    // epiArrest (1 mg) or saline (500 mL) entries for a ~3 kg newborn
    // would be a real, dangerous dose-scale mismatch, not a defensible
    // approximation (this project's own physiology queue, item 65,
    // already documents this exact gap and why it wasn't guessed at).

    // ── S-134, Poisoning / Overdose — naloxone and the hyperkalemia-ECG
    //    bicarb rule are already covered above and reused here. Activated
    //    charcoal, buprenorphine, ketamine, and morphine have no matching
    //    TASKS entry in this engine's crew-direction layer — real, honest
    //    gaps, not guesses at task ids that don't exist. Organophosphate
    //    atropine, beta-blocker glucagon, calcium-channel-blocker calcium,
    //    and cyanide hydroxocobalamin all have NO representable
    //    toxicology-specific trigger (no poison-class signal exists in
    //    this engine distinct from generic shock/bradycardia), so none of
    //    them get an automatic rule here — each drug/task still exists
    //    for manual crew ordering. ──

    // ── S-135, Existing Devices and Medications; S-136, Respiratory
    //    Distress; S-142, Psychiatric/Behavioral Emergencies — all three
    //    share the identical "severely agitated/combative, requiring
    //    restraint or with potential for airway compromise" midazolam
    //    step. "MR x1 in 5-10 min" — 2 administrations. ──
    { id: "agitationMidazolam", when: (ctx) => AGITATED_SEVERE(ctx) && doseCount(ctx, "midazolam") < 2, task: "midazolamAgitation", note: "severe agitation — midazolam" },
    { id: "agitationSaline", when: (ctx) => AGITATED_SEVERE(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "severe agitation, poor perfusion — fluid" },

    // ── S-136, Respiratory Distress ──
    { id: "chfCpap", when: (ctx) => RALES(ctx) && !apnoeic(ctx) && doseCount(ctx, "cpap") < 1, task: "cpapTask", note: "CHF/pulmonary edema — CPAP" },
    { id: "asthmaCpap", when: (ctx) => WHEEZING(ctx) && lowSpo2(ctx) && !apnoeic(ctx) && doseCount(ctx, "cpap") < 1, task: "cpapTask", note: "non-cardiac respiratory distress — CPAP" },

    // ── S-138, Shock — hypovolemic and distributive shock both follow the
    //    identical algorithm in this protocol's own text. "MR to maintain
    //    SBP≥90" — no stated total, this file's default 2-dose ceiling. ──
    { id: "shockSaline", when: (ctx) => !pulseless(ctx) && SHOCK(ctx) && !GENERIC_PAIN(ctx) && !DELIVERED(ctx) && !SEPSIS_CRITERIA(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "shock — fluid" },
    { id: "shockPushEpi", when: (ctx) => !pulseless(ctx) && SHOCK(ctx) && gaveDose(ctx, "saline") && doseCount(ctx, "pushEpi") < 6, task: "pushEpi", note: "shock refractory to fluid — push-dose epi" },

    // ── S-139, Trauma ──
    // "500 mL fluid bolus IV/IO, MR x3 q15min to maintain SBP≥90" — 4
    // administrations, an explicit total this county's own text gives
    // (also covers the crush-injury bundle's own 1,000 mL pre-release
    // target, since 4 administrations/2 L comfortably exceeds it — no
    // separate crush-specific saline rule is needed).
    { id: "traumaSaline", when: (ctx) => !pulseless(ctx) && (SHOCK(ctx) || SHOCK_INDEX_HIGH(ctx)) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "trauma, SBP <90 or signs of shock — fluid" },
    { id: "traumaTxa", when: (ctx) => ACTIVE_HEMORRHAGE(ctx) && (SHOCK(ctx) || SHOCK_INDEX_HIGH(ctx)) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "trauma-associated hemorrhage — TXA" },
    { id: "traumaNeedleD", when: (ctx) => TENSION_PTX(ctx) && SHOCK(ctx) && doseCount(ctx, "needleD") < 1, task: "needleDecompTask", note: "tension pneumothorax, SBP <90 — needle decompression" },
    { id: "traumaChestSeal", when: (ctx) => OPEN_PTX(ctx), task: "chestSealTask", note: "open chest wound — vented chest seal" },
    { id: "tbiHighFlowO2", when: (ctx) => SUSPECTED_TBI(ctx) && !apnoeic(ctx) && lowSpo2(ctx), task: "o2", note: "suspected TBI — high-flow oxygen" },
    { id: "tbiSaline", when: (ctx) => SUSPECTED_TBI(ctx) && ctx.v.sbp < 120 && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "suspected TBI — protect cerebral perfusion pressure" },

    // ── S-143, Sepsis ──
    // First 500 mL is unconditional once criteria met; up to 2 more if no
    // rales or still hypotensive — 3 administrations total.
    { id: "sepsisSaline", when: (ctx) => SEPSIS_CRITERIA(ctx) && doseCount(ctx, "saline") < 3, task: "salineBolus", note: "suspected sepsis — fluid" },
    { id: "sepsisPushEpi", when: (ctx) => SEPSIS_CRITERIA(ctx) && SHOCK(ctx) && gaveDose(ctx, "saline") && doseCount(ctx, "pushEpi") < 6, task: "pushEpi", note: "septic shock refractory to fluid — push-dose epi" },

    // ── S-144, Stroke and Transient Ischemic Attack — a real, permissive-
    //    hypertension target (SBP≥120), distinct from every other
    //    protocol's SBP≥90 shock target, so a dedicated rule rather than
    //    folding into the generic shockSaline rule above. No stated
    //    total; this file's default 2-dose ceiling. ──
    { id: "strokeSaline", when: (ctx) => STROKE_SUSPECTED(ctx) && ctx.v.sbp < 120 && !RALES(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "suspected stroke, SBP <120 — fluid" },

    // ── S-145, Opioid Withdrawal / Opioid Use Disorder — the buprenorphine
    //    standing order requires a COWS score (not representable in this
    //    engine) and Base Hospital contact before administration, so it is
    //    left entirely manual/BH-gated, matching this file's own stated
    //    principle for BHO-required steps. The opioid-OD naloxone rule
    //    above already covers this protocol's own respiratory-depression
    //    cross-reference to S-134. ──

    // ── S-150, CHEMPACK Deployment and Autoinjector Use ──
    // "DuoDote... x3 in rapid succession" for the SEVERE tier, matching
    // the protocol's own stated cumulative maximum of 3 doses.
    { id: "nerveAgentDuodote", when: (ctx) => NERVE_AGENT_SEVERE(ctx) && doseCount(ctx, "duodote") < 3, task: "duodoteTask", note: "severe nerve-agent exposure — DuoDote" },
    // Seizures from nerve-agent exposure fall back to this file's own
    // seizureMidazolam rule above (S-150's own text: "if no diazepam
    // autoinjector available, treat per S-123") — no diazepam-autoinjector
    // task exists in this engine's TASKS list, so this is the honest,
    // real fallback rather than a guessed task id.
  ],
};

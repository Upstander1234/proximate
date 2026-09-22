// ─── NASEMSO National Model EMS Clinical Guidelines (March 2022, Version 3.0) ──
// Converted directly off the source PDF
// (src/protocols/Raw Protocol Sources/National Protocol/
// National_Model_EMS_Clinical_Guidelines -- national protocols.pdf) — all 407
// pages read start to finish. Unlike San Diego County's or LA County's own
// files, this is not a county protocol book with TP/S-number cross-references
// — it is a NATIONAL CONSENSUS document organized into named guideline
// chapters (Universal Care, Cardiovascular, General Medical, Resuscitation,
// Pediatric-Specific, OB/GYN, Respiratory, Trauma, Toxins and Environmental),
// each cited below by its own guideline name and PDF page range rather than a
// protocol number, since this document has none.
//
// PURELY ADMINISTRATIVE / NON-FIELD-TREATABLE GUIDELINES — read in full for
// context, produce NO rules here, matching this project's own established
// precedent for LA County's and San Diego County's non-clinical protocol
// numbers: Functional Needs (p.19), Patient Refusals (p.23), Abuse and
// Maltreatment (p.55), End-of-Life Care/Hospice Care (p.78 — real drug
// guidance exists in this guideline's own text, but every dose is gated on
// "patient enrolled in hospice," a status this engine has no field to
// represent; auto-firing morphine/lorazepam based on nothing but symptoms
// would be actively wrong for a non-hospice patient with the same
// presentation, so this guideline is deliberately left to produce no
// automatic rule), Determination of Death/Withholding Resuscitative Efforts
// (p.130), DNR Status/Advance Directives/Healthcare POA Status (p.133),
// Termination of Resuscitative Efforts (p.136), Brief Resolved Unexplained
// Event & Acute Events in Infants (p.144 — pure assessment/transport
// guideline, no drug/procedure step of its own), Mechanical Ventilation
// Invasive (p.198 — ventilator-setting guidance only, no new task),
// Tracheostomy Management (p.203 — this engine has no tracheostomy-state
// field, the same gap this project's own CLAUDE.md queue item 60 already
// documents), Blast Injuries (p.215 — defers entirely to General Trauma/
// Burns/Head Injury/Spinal Care), Facial/Dental Trauma (p.230 — pain/nausea
// already covered generically, no facial-trauma-specific task exists), High
// Threat Considerations/Active Shooter Scenario (p.238 — tactical/scene-
// safety guidance, not a physiology-gated treatment step), Spinal Care
// (p.241 — a physical-restraint decision guideline; the `cspine` task exists
// for a player/crew action but has no clean physiology signal to
// auto-trigger on), Trauma Mass Casualty Incident (p.249 — triage
// methodology, not treatment), Radiation Exposure (p.271 — defers to
// Nausea-Vomiting/Seizures guidelines already covered generically; potassium
// iodide has no drugs.js/gear.js entry), Topical Chemical Burn (p.275 —
// decontamination/irrigation only), Airway Respiratory Irritants (p.308 —
// toxidrome description; every real treatment step it names is already
// covered by the shared bronchospasm/CPAP/O2 rules below), Riot Control
// Agents (p.317 — explicitly defers to Respiratory/Bronchospasm/Topical
// Chemical Burn guidelines), Dive (SCUBA) Injury/Accidents (p.337 —
// positioning guidance only, no drug/procedure task), Altitude Illness
// (p.341 — every named drug, dexamethasone/acetazolamide/nifedipine-ER/
// tadalafil/sildenafil, has no matching TASKS entry, and this engine has no
// "at high altitude" signal to gate on regardless), Conducted Electrical
// Weapon Injury/TASER (p.345 — defers to the Agitation guideline's own
// already-covered rules), Electrical Injuries (p.348) and Lightning/
// Lightning Strike Injury (p.352) (both defer entirely to the General
// Trauma/Burns/Cardiac Arrest/Pain rules already built below). Appendices
// (p.357-407: author list, documentation standard, medication list,
// abbreviations, burn charts, neuro-assessment reference, abnormal-vitals
// reference, GRADE methodology, the ACS-COT field-triage guideline) are
// reference material, not a protocol of their own, and produce no rules.
//
// A DELIBERATE, DOCUMENT-WIDE PEDIATRIC-DOSING EXCLUSION, STATED ONCE HERE.
// This guideline gives extensive, genuinely weight-based pediatric dosing
// for nearly every drug (e.g., adenosine 0.1 mg/kg then 0.2 mg/kg; atropine
// 0.02 mg/kg; naloxone 0.1 mg/kg) — far more than LA County's or San Diego
// County's own files, neither of which leaned on pediatric dosing this
// heavily. This engine's crew-direction tasks are each a SINGLE fixed adult
// dose (adenosineTask is always 12 mg; naloxoneArrest is always the
// naloxone_iv entry's own fixed concentration) — there is no lighter,
// weight-scaled alternative task for any of them. Auto-firing a fixed adult
// dose into a small child would be a real, dangerous dose-scale mismatch,
// not a defensible approximation — the same caution this project's own
// CLAUDE.md history already applies to neonatal epinephrine/saline (queue
// item 65) is applied here across the whole file: every rule below that
// fires a fixed adult-calibrated drug dose is gated `!PEDIATRIC(ctx)`, using
// this guideline's OWN stated pediatric-population definition (p.13: "the
// pediatric population is generally defined by those patients who weigh up
// to 40 kg or up to 14 years of age, whichever comes first"). A pediatric
// patient's care under this protocol stays fully manual — reachable by a
// player/crew order, just never auto-suggested at a mismatched dose — rather
// than silently disabled. Procedure-only rules with no dose-scale risk
// (CPAP, needle decompression, cardioversion/defibrillation, the newborn
// resuscitation ladder) are NOT gated this way.
//
// GRANULARITY MISMATCHES, noted once rather than per rule, matching the
// precedent already established in this project's San Diego County file:
// epiIM's fixed 0.5 mg stands in for this guideline's own weight-tiered
// 0.3 mg (adult)/0.15 mg (pediatric) anaphylaxis dose; magnesiumSulfate's
// fixed 4 g stands in for the 1-2 g (torsades)/2 g (severe bronchospasm)/
// 4 g (eclampsia prophylaxis, an exact match) range depending on
// indication; hydroxocobalamin, calcium chloride, and sodium bicarbonate are
// each single fixed-dose engine entries standing in for a real mg/kg range.
//
// REAL GAPS FOUND, NOT GUESSED PAST (re-checked against data/drugs.js on
// 2026-09-21). drugs.js now has ipratropium, diltiazem, metoprolol,
// dexamethasone, morphine, ketamine, norepinephrine, ketorolac, IV
// acetaminophen and nitrous oxide, each wired below with its own task.
// (vasopressin/phenylephrine exist but this guideline gives no step for them.)
// Named by this guideline but absent from drugs.js entirely: activated
// charcoal, acetylcysteine, verapamil, procainamide, systemic lidocaine for
// VT (the `lidocaineIO` task is for IO pain, a different purpose),
// prednisone/methylprednisolone/hydrocortisone, pralidoxime chloride,
// hydromorphone, sodium thiosulfate, potassium iodide, droperidol/
// haloperidol/ziprasidone, labetalol/hydralazine/nifedipine (severe
// pre-eclampsia). `olanzapineOdt`/`midazolamAgitation`/`ketamineSedation`
// are the only agitation tasks. Norepinephrine now stands in for the shock
// vasopressor; `pushEpi` remains for anaphylaxis.
//
// ASSESSMENT-DEVICE GAPS: Universal Care (p.14) also names temperature as
// baseline monitoring, and this engine has no thermometer device or task, so
// no rule can attach one. Pulse oximetry, BP cuff, waveform capnography, ECG
// leads/12-lead, pads, blood glucose, serial vitals (q5 min critical / q15
// min stable / after each drug), vascular access and tourniquet application
// ARE covered above.
//
// TASK-CAP POLICY, stated once rather than per rule, matching this
// project's own established discipline (see the LA County and San Diego
// County files' own identical notes): every crew-directed dose below has an
// explicit numeric ceiling — `evaluateProtocol`'s own `running` set only
// excludes a task CURRENTLY in progress, not a completed one, so a rule
// with no cap would keep re-offering the same drug indefinitely. Where this
// guideline gives an explicit total ("maximum total dose of 3 mg," "up to
// 4 mg") that number is converted into however many administrations of this
// engine's one fixed-dose entry it takes to reach it. Where the guideline
// is genuinely open-ended ("titrate until adequate respiratory effort,"
// "repeat at this dose with unlimited frequency for ongoing respiratory
// distress"), a conservative default is used and the choice is documented
// at that rule.

import {
  pulseless, apnoeic, hypoxic, lowSpo2, soiledAir,
  noVitals, notMonitored, noLeads, altered,
} from "./engine.js";

// ── Shared predicates ──────────────────────────────────────────────────
const SHOCK = (ctx) => ctx.v.sbp > 0 && ctx.v.sbp < 90;
const HAS_IV = (ctx) => (ctx.s.ivSites || []).length > 0;
const doseCount = (ctx, id) => (ctx.s.doses || []).filter((d) => d.id === id).length;
const gaveDose = (ctx, id) => doseCount(ctx, id) > 0;

// `ctx.v` has no pregnancy/seizure/structural-injury/toxicology field — those
// live on the real Patient object, reached through ctx.s._roster the same
// way this project's LA County and San Diego County files already do.
function activePat(ctx) {
  const roster = ctx.s._roster;
  if (!roster || !roster.length) return null;
  return (roster.find((e) => e.id === ctx.s.activePatientId) || roster[0]).patient || null;
}
function newbornPat(ctx) {
  return ctx.s._roster?.find((e) => e.id === "newborn")?.patient || null;
}

// The document's own pediatric-population definition (p.13), used to gate
// every fixed-adult-dose rule in this file — see the header comment above
// for why. Defaults to "adult" when age/weight can't be determined (most
// scenarios in this engine are constructed as adults with no roster patient
// object at all), so this never silently disables the whole file.
const PATIENT_AGE = (ctx) => activePat(ctx)?.ageProfile?.age;
const PATIENT_WEIGHT = (ctx) => activePat(ctx)?.ageProfile?.weight;
const PEDIATRIC = (ctx) => {
  const age = PATIENT_AGE(ctx);
  const wt = PATIENT_WEIGHT(ctx);
  return (age != null && age < 14) || (wt != null && wt < 40);
};
const ADULT = (ctx) => !PEDIATRIC(ctx);

// Real, already-classified engine rhythm states (cardiovascular.js).
// "torsades" (polymorphic VT) is folded into the shockable-arrest bucket
// per this guideline's own Cardiac Arrest chapter, which treats it
// identically to VF/pulseless VT — it has no separately-treated stable
// branch in this guideline's own Tachycardia chapter either (torsades is
// only addressed there under the "irregular wide complex" heading, whose
// own drug step, magnesium, already has a dedicated rule below keyed
// directly to the rhythm string).
const SHOCKABLE = (ctx) => pulseless(ctx) && ["VF", "VT", "torsades"].includes(ctx.v.rhythm);
const NONSHOCKABLE_ARREST = (ctx) => pulseless(ctx) && !SHOCKABLE(ctx);
const TACHY_SVT = (ctx) => ctx.v.rhythm === "svt";
const TACHY_AFIB_FLUTTER = (ctx) => ctx.v.rhythm === "afib" || ctx.v.rhythm === "flutter";
const TACHY_WCT_REGULAR = (ctx) => ctx.v.rhythm === "VT";
const TORSADES = (ctx) => ctx.v.rhythm === "torsades";
// This guideline's own repeated "hemodynamically unstable" qualifier
// (hypotension, ALOC, signs of shock) has no pallor/diaphoresis field in
// this engine, so plain hypotension is used as the objective, measurable
// core of "unstable" — the same simplification this project's other
// protocol files already make for the identical qualitative criterion.
const UNSTABLE = SHOCK;

// p.123/p.131 (crush)/p.256 (TCA): "suspected hyperkalemia (e.g., peaked
// T-waves or widened QRS)" and TCA/sodium-channel-blocker "widened QRS
// (100 msec or greater)" are the SAME real ECG finding, published as
// `v.qrsWidth` (patient.js's vitals()) — 0.12 s is the standard wide-QRS
// cutoff used throughout this project's other protocol files; kept at 0.12
// rather than this guideline's own slightly looser 0.10 s TCA-specific
// figure, for internal consistency with the shared hyperkalemia bundle
// this same signal also drives (see the SEVERE_HYPERK bundle below, whose
// own comment documents this exact reuse).
const WIDE_QRS = (ctx) => ctx.v.qrsWidth > 0.12;
const SEVERE_HYPERK = (ctx) => ctx.v.k >= 6.0 || WIDE_QRS(ctx);

// p.84/p.11: <60 mg/dL is this guideline's own hypoglycemia cutoff
// (repeated identically in Universal Care, Hypoglycemia, and every
// guideline that cross-references it).
const HYPOGLYCEMIC = (ctx) => ctx.v.glu > 0 && ctx.v.glu < 60;
// p.81: "glucose greater than 250 mg/dL with symptoms of dehydration,
// vomiting, abdominal pain, or altered level of consciousness" — this
// guideline's own hyperglycemia-fluid trigger, distinct from (and lower
// than) San Diego County's own 350 mg/dL "severe" threshold; used here
// exactly as this document states it.
const HYPERGLYCEMIC_SYMPTOMATIC = (ctx) => ctx.v.glu >= 250;
const AWAKE = (ctx) => ctx.v._cons === "awake";
// p.130 (crush)/p.377 (Cardiac Arrest): this guideline's own stated cutoff
// (30C/86F) below which epinephrine dosing in arrest is limited, and
// further antiarrhythmic/defibrillation attempts are described as
// unreliable until the patient is rewarmed above it.
const SEVERELY_HYPOTHERMIC = (ctx) => ctx.v.temp > 0 && ctx.v.temp < 30;
// p.320: "Patient core temperature is usually greater than 104F" for heat
// stroke — a real, cited clinical threshold (40C), not invented.
const HEAT_STROKE = (ctx) => ctx.v.temp >= 40;
const RALES = (ctx) => ctx.v.edema >= 0.3;
const WHEEZING = (ctx) => ctx.v.bronch >= 0.3;
const BRADYCARDIC = (ctx) => ctx.v.hr > 0 && ctx.v.hr < 60;
const TENSION_PTX = (ctx) => ctx.v.ptx === "tptx";
const OPEN_PTX = (ctx) => ctx.v.ptx === "ptx";
// p.93 (Pain Management), reused by nearly every other guideline's own
// "treat pain per the Pain Management Guideline" cross-reference.
const GENERIC_PAIN = (ctx) => ctx.v.pain >= 4;
// p.59-65 (Agitated or Violent Patient/Behavioral Emergency): this
// guideline's own text explicitly states its drug list is "not intended to
// indicate a hierarchy/preference" between midazolam and olanzapine — but
// also explicitly warns that CONCURRENT IM/IV benzodiazepine + IM
// olanzapine is associated with fatalities, so exactly one of the two must
// be picked per patient, not both. A severity split (moderate->olanzapine,
// severe->midazolam) is used to satisfy that real safety constraint,
// reusing the same two thresholds and the same real, already-composed
// `v.agitation` field this project's LA County file already established
// for the identical pair of drugs — not this document's own invention, but
// the only way to honor both this guideline's own drug menu and its own
// stated contraindication at once.
const AGITATED_MODERATE = (ctx) => ctx.v.agitation >= 0.3 && ctx.v.agitation < 0.65;
const AGITATED_SEVERE = (ctx) => ctx.v.agitation >= 0.65;

const PREGNANT = (ctx) => !!activePat(ctx)?._pregnancy;
const DELIVERED = (ctx) => !!activePat(ctx)?._pregnancy?.delivered;
const ACTIVE_SEIZURE = (ctx) => !!activePat(ctx)?.seizing;
// p.171: severe pre-eclampsia's own objective criterion is "SBP greater
// than 160 or DBP greater than 110," read directly rather than SBP alone.
const SEVERE_PREECLAMPSIA = (ctx) => PREGNANT(ctx) && (ctx.v.sbp >= 160 || ctx.v.dbp >= 110);
// p.172-173: magnesium toxicity's real, already-modeled progression
// (pk.js's own `pat.magToxicity`, 0-1) — a genuinely new consumer this
// engine's other protocol files don't yet reach: this guideline's own
// magnesium-toxicity treatment step (calcium gluconate/chloride) now has a
// real, live signal to gate on rather than being manual-only.
const MAG_TOXICITY = (ctx) => (activePat(ctx)?.magToxicity ?? 0) > 0.5;
const SUSPECTED_TBI = (ctx) => (activePat(ctx)?.brainInjury ?? 0) > 0;
const ACTIVE_HEMORRHAGE = (ctx) => (activePat(ctx)?.activeBleedRate ?? 0) > 0;
const SHOCK_INDEX_HIGH = (ctx) => ctx.v.hr > 0 && ctx.v.sbp > 0 && ctx.v.hr >= ctx.v.sbp;
// p.299-302: this engine's own real, previously-invisible pulse-ox
// blindspot mechanism (`pat.cohb`, patient.js — the displayed spo2 is
// inflated by the carboxyhemoglobin fraction) is exactly the mechanism
// this guideline's own Carbon Monoxide chapter warns about ("pulse
// oximetry may appear to be normal... CO oximeter devices may yield
// inaccurate low/normal results"). Used below to fire high-flow oxygen
// REGARDLESS of the (falsely reassuring) displayed SpO2 — a real, genuine
// capability this file has that San Diego's/LA's own files don't reach,
// since this engine's carbon-monoxide condition postdates those files.
const CO_POISONING = (ctx) => (activePat(ctx)?.cohb ?? 0) > 0.1;

// p.159-164 (Neonatal Resuscitation) — the newborn is a SEPARATE roster
// patient, matching this project's other protocol files' own identical
// `t.neoAction` crewFn wiring.
const NEWBORN_UNSTIMULATED = (ctx) => { const nb = newbornPat(ctx); return !!nb && !nb._neo?.stimulated && !nb._neo?.ppv; };
const NEWBORN_NEEDS_PPV = (ctx) => { const nb = newbornPat(ctx); return !!nb && nb.hr > 0 && nb.hr < 100 && !nb._neo?.ppv; };
const NEWBORN_NEEDS_CPR = (ctx) => { const nb = newbornPat(ctx); return !!nb && nb.hr > 0 && nb.hr < 60 && !!nb._neo?.ppv && !nb._neo?.compressions; };

// p.266: this guideline's own SEVERE tier ("unconsciousness, convulsions,
// apnea or severe respiratory distress requiring assisted ventilation,
// flaccid paralysis") — the same real, objective signals this project's
// other protocol files already use for the identical clinical picture.
// MILD/MODERATE (miosis, rhinorrhea, muscle fasciculations) has no
// representable signal in this engine (no secretions/pupil-diameter
// mechanism), so only SEVERE gets an automatic rule; mild/moderate DuoDote
// stays manual-only.
const NERVE_AGENT_SEVERE = (ctx) => apnoeic(ctx) || ACTIVE_SEIZURE(ctx) || (ctx.v.spo2 > 0 && ctx.v.spo2 < 90);

// ── Assessment/monitoring cadence helpers (Universal Care p.9-18, plus each
//    chapter's own "reassess vital signs" / "vital signs before and after
//    medication" step). The Universal Care Guideline requires an initial
//    full set, monitoring of critical patients "frequently," and (p.14)
//    "at least two sets of pertinent vital signs" for stable patients; the
//    Shock/Sepsis chapter's own quality measure (p.5700) gives q15 minutes
//    for stable patients. Seconds on the call clock (ctx.s.t). ──
const VITALS_EVERY_CRITICAL = 300;
const VITALS_EVERY_STABLE = 900;
const lastVitalsAt = (ctx) => ctx.s.vitals?.HR?.at ?? -Infinity;
const CRITICAL = (ctx) => SHOCK(ctx) || pulseless(ctx) || hypoxic(ctx) || altered(ctx) || apnoeic(ctx);
// Drugs whose effect must be re-measured (p.4689: "vital signs before and
// after medication administration"); airway/CPR/O2 support doses excluded.
const REASSESS_DRUGS = new Set([
  "naloxone_iv", "epiIM", "albuterol", "nebEpi", "nitro", "fentanyl", "atropine",
  "adenosine", "saline", "salineMinor", "d10", "glucagon", "oralGlucose", "midazolam",
  "magnesium", "ondansetron", "diphen", "pushEpi", "calcium", "bicarb", "txa",
]);
const DRUG_SINCE_VITALS = (ctx) => {
  const last = lastVitalsAt(ctx);
  return (ctx.s.doses || []).some((d) => REASSESS_DRUGS.has(d.id) && (d.at ?? 0) > last);
};
const lastDoseAt = (ctx, id) => (ctx.s.doses || []).reduce((m, d) => (d.id === id ? Math.max(m, d.at ?? 0) : m), -Infinity);
const since = (ctx, id, secs) => ctx.s.t - lastDoseAt(ctx, id) >= secs;
const OVER_65 = (ctx) => (PATIENT_AGE(ctx) ?? 0) > 65;
const OPIOID_SAFE = (ctx) => !SHOCK(ctx) && ctx.v.rr >= 12 && !(ctx.v.spo2 > 0 && ctx.v.spo2 < 94);
const TQ_PLACED = (ctx) => Object.keys(ctx.s.done || {}).some((k) => k.startsWith("tq@"));
const LOW_GLUCOSE_TREATED = (ctx) => ["d10", "oralGlucose", "glucagon"].some((id) => gaveDose(ctx, id));
const CARDIAC_COMPLAINT = (ctx) => GENERIC_PAIN(ctx) || BRADYCARDIC(ctx) || ctx.v.hr > 100 || ["svt", "afib", "flutter", "VT"].includes(ctx.v.rhythm);

export default {
  id: "national", name: "NASEMSO National Model EMS Clinical Guidelines",
  rules: [
    // ── Universal Care Guideline (p.9-18) — immediate life threats and
    //    baseline ALS steps every other guideline cross-references. ──
    { id: "airway", when: soiledAir, task: "suction", note: "clear the soiled airway first" },
    { id: "cpr", when: pulseless, task: "cpr", note: "no pulse — compressions" },
    { id: "vent", when: apnoeic, task: "bvm", note: "inadequate breathing — bag them" },
    { id: "ventHypoxic", when: (ctx) => hypoxic(ctx) && !apnoeic(ctx), task: "bvm", note: "SpO2 under 90 despite O2 — assist ventilations" },
    // p.14: "administer oxygen with a target of achieving 94-98% saturation"
    // — this guideline's own repeated general threshold.
    { id: "o2", when: (ctx) => !apnoeic(ctx) && lowSpo2(ctx), task: "o2", note: "hypoxic — high-flow oxygen" },
    // p.299-302: fires REGARDLESS of the (falsely-normal) displayed SpO2 —
    // see CO_POISONING's own comment above.
    { id: "coOxygen", when: (ctx) => CO_POISONING(ctx) && !apnoeic(ctx), task: "o2", note: "suspected CO poisoning — high-flow O2 despite a normal-looking pulse ox" },
    { id: "monitor", when: notMonitored, task: "monitor", note: "get them on the monitor" },
    { id: "leads", when: noLeads, task: "leads", note: "leads on, twelve-lead" },

    // ── Universal Care baseline devices (p.14-15: "pulse oximetry," "12-lead
    //    EKG... promptly in patients with cardiac..." complaints, blood
    //    pressure as part of "an initial full set of vital signs"). Each of
    //    these attaches the actual device, not just a reading, so a later
    //    "monitor" task has something to read. Critical patients first. ──
    { id: "pulseOx", when: (ctx) => !ctx.s.devices?.pulseox, task: "attachPulseOx", note: "continuous pulse oximetry" },
    { id: "bpCuff", when: (ctx) => !ctx.s.devices?.bpcuff, task: "attachBpCuff", note: "cuff on, baseline blood pressure" },
    // p.14 (Universal Care): "consider waveform capnography for patients with
    // respiratory complaints (essential for critical patients...)"; p.6228:
    // EtCO2 to monitor CPR effectiveness; p.6551: post-arrest EtCO2 35-45.
    { id: "capnography", when: (ctx) => !ctx.s.devices?.capno && (CRITICAL(ctx) || lowSpo2(ctx) || WHEEZING(ctx) || RALES(ctx)), task: "attachCapno", note: "critical or respiratory patient — waveform capnography" },
    // p.1500: "acquire a 12-lead EKG within 10 minutes" for cardiac
    // presentations — reuses the same leads task/doneKey as the baseline.
    { id: "ecg12Cardiac", when: (ctx) => CARDIAC_COMPLAINT(ctx) && !ctx.s.done?.ecgAcquire, task: "leads", note: "cardiac complaint — twelve-lead within ten minutes" },
    // Pads go on any unstable tachy/brady patient (pacing/cardioversion
    // pathways, p.35-42) not just an arrested one.
    { id: "unstablePads", when: (ctx) => SHOCK(ctx) && (BRADYCARDIC(ctx) || ctx.v.hr > 150) && !ctx.s.done?.pads, task: "applyPads", note: "unstable rhythm — pads on before it worsens" },

    { id: "vitals", when: noVitals, task: "vitals", note: "full set of vitals" },

    // ── Serial vitals (p.14 "critical patients should have pertinent vital
    //    signs frequently monitored"; p.5700 "reassessment q 15 minutes"). ──
    { id: "vitalsCritical", when: (ctx) => !noVitals(ctx) && CRITICAL(ctx) && ctx.s.t - lastVitalsAt(ctx) >= VITALS_EVERY_CRITICAL, task: "vitals", note: "critical patient — repeat vitals" },
    { id: "vitalsStable", when: (ctx) => !noVitals(ctx) && ctx.s.t - lastVitalsAt(ctx) >= VITALS_EVERY_STABLE, task: "vitals", note: "stable — routine repeat vitals" },
    { id: "vitalsAfterDrug", when: (ctx) => !noVitals(ctx) && DRUG_SINCE_VITALS(ctx), task: "vitals", note: "reassess after medication" },

    // ── Vascular access for anything that may need a drug or fluid. Each
    //    treatment chapter's own IV/IO step, gathered here so access is
    //    already in place when the drug rule fires. ──
    { id: "ivCritical", when: (ctx) => !HAS_IV(ctx) && !pulseless(ctx) && (SHOCK(ctx) || ACTIVE_SEIZURE(ctx) || ACTIVE_HEMORRHAGE(ctx) || (GENERIC_PAIN(ctx) && ctx.v.hr > 0) || (BRADYCARDIC(ctx) && SHOCK(ctx)) || TACHY_SVT(ctx) || TACHY_WCT_REGULAR(ctx) || (apnoeic(ctx) && ctx.v.hr > 0)), task: "iv", note: "may need drugs or fluid — vascular access" },

    // ── Blood glucose (p.393-394: "check blood glucose in patients with
    //    AMS or suspected stroke"; p.4393: repeat if hypoglycemia treated
    //    and mental status hasn't improved; p.5247 seizure; p.6562 post-arrest). ──
    { id: "glucoseSeizure", when: (ctx) => ACTIVE_SEIZURE(ctx) && !ctx.s.done?.gluc, task: "glucoseCheck", note: "seizing — rule out hypoglycemia" },
    { id: "glucoseRecheck", when: (ctx) => LOW_GLUCOSE_TREATED(ctx) && altered(ctx) && ctx.s.t - (ctx.s.vitals?.Glu?.at ?? -Infinity) >= 300, task: "glucoseCheck", note: "still altered after sugar — recheck glucose" },

    // ── Drug tasks added once drugs.js/gear.js caught up with this
    //    guideline's own text (all adult-gated, capped, IV-gated where the
    //    guideline's route is IV). ──
    // Respiratory Distress p.10163: "Ipratropium 0.5 mg nebulized... up to 3
    // doses in conjunction with albuterol" (not for pediatric bronchiolitis, p.7884).
    { id: "bronchospasmIpratropium", when: (ctx) => WHEEZING(ctx) && ADULT(ctx) && gaveDose(ctx, "albuterol") && doseCount(ctx, "ipratropium") < 3, task: "ipratropiumNeb", note: "bronchospasm — ipratropium with the albuterol" },
    // p.10175-10181: steroids "should be administered in the prehospital
    // setting"; IV dexamethasone (0.6 mg/kg, max 16 mg — the 10 mg entry) for the critically ill.
    { id: "bronchospasmDexamethasone", when: (ctx) => WHEEZING(ctx) && lowSpo2(ctx) && ADULT(ctx) && HAS_IV(ctx) && doseCount(ctx, "dexamethasone") < 1, task: "dexamethasoneTask", note: "bronchospasm — steroid" },
    // Tachycardia with a Pulse p.2083-2115. Stable irregular narrow (A-fib/
    // flutter): diltiazem 0.25 mg/kg, second dose 0.35 mg/kg after 15 minutes;
    // over 65, initial max 10 mg (the fixed 20 mg entry overshoots, so
    // metoprolol 5 mg q5 min x3 is used instead). Metoprolol needs SBP >120
    // (p.2235); beta-blocker plus CCB together is a hazard (p.2259) so each
    // rule excludes the other. Regular narrow (SVT) escalates to diltiazem
    // only after all three adenosine doses fail (p.2083).
    { id: "afibDiltiazem", when: (ctx) => (TACHY_AFIB_FLUTTER(ctx) || (TACHY_SVT(ctx) && doseCount(ctx, "adenosine") >= 3)) && !UNSTABLE(ctx) && ctx.v.sbp >= 100 && ADULT(ctx) && !OVER_65(ctx) && HAS_IV(ctx) && !gaveDose(ctx, "metoprolol") && doseCount(ctx, "diltiazem") < 2 && since(ctx, "diltiazem", 900), task: "diltiazemTask", note: "stable rapid rhythm — diltiazem" },
    { id: "afibMetoprolol", when: (ctx) => (TACHY_AFIB_FLUTTER(ctx) || (TACHY_SVT(ctx) && doseCount(ctx, "adenosine") >= 3)) && !UNSTABLE(ctx) && ctx.v.sbp > 120 && ADULT(ctx) && OVER_65(ctx) && HAS_IV(ctx) && !gaveDose(ctx, "diltiazem") && doseCount(ctx, "metoprolol") < 3 && since(ctx, "metoprolol", 300), task: "metoprololTask", note: "stable rapid rhythm, over 65 — metoprolol" },
    // Pain Management p.93: mild/adjunct non-opioids (acetaminophen 1 g IV
    // max, ketorolac 15 mg IV — not in hypotension, p.4868, or coagulopathy/
    // bleeding — nitrous oxide, not in pneumothorax); moderate-severe opioids
    // (morphine 0.1 mg/kg — the 4 mg entry; repeat after 5 minutes, p.4851;
    // "with caution" for GCS <15, p.4865). Chest pain keeps its own nitro-then-
    // fentanyl ladder above (morphine "with caution" in NSTEMI, p.1544), so
    // opioids here skip anyone already given fentanyl and any STEMI rhythm.
    { id: "painAcetaminophen", when: (ctx) => GENERIC_PAIN(ctx) && ADULT(ctx) && HAS_IV(ctx) && !SHOCK(ctx) && doseCount(ctx, "acetaminophenIV") < 1, task: "acetaminophenTask", note: "pain — non-opioid adjunct" },
    { id: "painNitrous", when: (ctx) => GENERIC_PAIN(ctx) && ADULT(ctx) && !SHOCK(ctx) && ctx.v.ptx !== "tptx" && ctx.v.ptx !== "ptx" && doseCount(ctx, "nitrous") < 2, task: "nitrousTask", note: "pain — nitrous oxide" },
    { id: "painKetorolac", when: (ctx) => ctx.v.pain >= 4 && ctx.v.pain < 7 && ADULT(ctx) && HAS_IV(ctx) && !SHOCK(ctx) && ctx.v.sbp >= 100 && !ACTIVE_HEMORRHAGE(ctx) && !(ctx.v.coag < 70) && ctx.v.rhythm !== "stemi" && doseCount(ctx, "ketorolac") < 1, task: "ketorolacTask", note: "moderate pain — ketorolac" },
    { id: "painMorphine", when: (ctx) => ctx.v.pain >= 7 && ADULT(ctx) && HAS_IV(ctx) && OPIOID_SAFE(ctx) && ctx.v.rhythm !== "stemi" && !gaveDose(ctx, "fentanyl") && doseCount(ctx, "morphine") < 3 && since(ctx, "morphine", 300), task: "morphinePain", note: "severe pain — morphine" },
    // Agitation p.3050: ketamine is the option "for high violence risk" — used
    // as the step after midazolam has failed to settle severe agitation.
    { id: "agitationKetamine", when: (ctx) => AGITATED_SEVERE(ctx) && ADULT(ctx) && HAS_IV(ctx) && gaveDose(ctx, "midazolam") && !apnoeic(ctx) && doseCount(ctx, "ketamine") < 1, task: "ketamineSedation", note: "severe agitation despite midazolam — ketamine" },

    // ── Hemorrhage control (Trauma chapters p.7319-7322, p.11164, p.12066:
    //    "apply a commercial tourniquet 2-3 inches proximal to the wound"). ──
    { id: "tourniquet", when: (ctx) => ACTIVE_HEMORRHAGE(ctx) && !TQ_PLACED(ctx), task: "tq", note: "life-threatening bleeding — tourniquet/pressure" },
    { id: "iv", when: (ctx) => HYPOGLYCEMIC(ctx) && !HAS_IV(ctx), task: "iv", note: "line for dextrose" },
    // p.71 (Altered Mental Status): "check blood glucose" for AMS, deferred
    // by nearly every other guideline in this document.
    { id: "glucoseCheck", when: (ctx) => altered(ctx) && !ctx.s.done?.gluc, task: "glucoseCheck", note: "rule out hypoglycemia" },
    // p.48-50 (Suspected Stroke/TIA): a real stroke screen, gated on
    // altered mental status once hypoglycemia is excluded (the guideline's
    // own explicit exclusion criterion) — not gated on STROKE_SUSPECTED
    // itself, which would be circular (assessing to confirm what's already
    // known).
    { id: "strokeScreen", when: (ctx) => altered(ctx) && !HYPOGLYCEMIC(ctx), task: "assessStroke", note: "altered — run a stroke screen" },

    // ── Chest Pain/ACS/STEMI (p.31-34) ──
    { id: "cardiacAspirin", when: (ctx) => GENERIC_PAIN(ctx) && doseCount(ctx, "aspirin") < 1, task: "aspirinTask", note: "chest pain of suspected cardiac origin — aspirin" },
    // p.32: "0.4 mg SL, can repeat q 3-5 minutes if SBP greater than 100" —
    // no stated total; a conservative default of 3 is used.
    { id: "cardiacNitro", when: (ctx) => ctx.v.sbp >= 100 && GENERIC_PAIN(ctx) && doseCount(ctx, "nitro") < 3, task: "nitroTask", note: "SBP >=100 — nitroglycerin" },
    { id: "cardiacFentanyl", when: (ctx) => GENERIC_PAIN(ctx) && !SHOCK(ctx) && gaveDose(ctx, "nitro") && !gaveDose(ctx, "morphine") && doseCount(ctx, "fentanyl") < 4, task: "fentanylPain", note: "pain unresponsive to nitrates — fentanyl" },

    // ── Bradycardia (p.35-38) — also reused below by Beta Blocker and
    //    Calcium Channel Blocker Poisoning/Overdose, which name the exact
    //    same drug ladder (atropine -> calcium -> glucagon -> pacing ->
    //    vasopressor) for the identical clinical picture. "Atropine 1 mg IV
    //    q 3-5 min (maximum total dose of 3 mg)." ──
    { id: "bradyAtropine", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && ADULT(ctx) && doseCount(ctx, "atropine") < 3, task: "atropineTask", note: "unstable bradycardia — atropine" },
    // p.296 (CCB overdose): "calcium gluconate/chloride" as a second-line
    // agent once atropine alone hasn't resolved instability — a real,
    // literature-anchored countering mechanism (this engine's own
    // `calciumChannel` receptor term), not just a hyperkalemia-bundle
    // reuse.
    { id: "bradyCalcium", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && ADULT(ctx) && gaveDose(ctx, "atropine") && doseCount(ctx, "calcium") < 1, task: "calciumChloride", note: "refractory to atropine — calcium" },
    // p.195 (beta blocker)/p.198 (CCB): "Glucagon 5 mg IVP, then 1 mg q 5
    // minutes... may require 5-15 mg to see effect" — glucagon's own real
    // beta1-receptor bypass mechanism (drugs.js), a genuine second-line
    // agent distinct from atropine's vagal-block mechanism.
    { id: "bradyGlucagon", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && ADULT(ctx) && gaveDose(ctx, "atropine") && doseCount(ctx, "glucagon") < 2, task: "glucagonIM", note: "refractory bradycardia — glucagon" },
    { id: "bradyMidazolamPrePacing", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && ADULT(ctx) && (gaveDose(ctx, "atropine") || ctx.v.rhythm === "chb") && doseCount(ctx, "midazolam") < 1, task: "midazolamSeizure", note: "pre-pacing sedation" },
    { id: "bradyPacing", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && (ctx.v.rhythm === "chb" || doseCount(ctx, "atropine") >= 3) && doseCount(ctx, "pacing") < 1, task: "pacingTask", note: "refractory to atropine — transcutaneous pacing" },
    { id: "bradySaline", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && (gaveDose(ctx, "atropine") || gaveDose(ctx, "pacing")) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "still hypotensive — fluid" },
    { id: "bradyPushEpi", when: (ctx) => BRADYCARDIC(ctx) && SHOCK(ctx) && (gaveDose(ctx, "atropine") || gaveDose(ctx, "pacing")) && doseCount(ctx, "pushEpi") < 6, task: "pushEpi", note: "still hypotensive — push-dose epinephrine (stands in for norepinephrine/epinephrine drip)" },

    // ── Tachycardia with a Pulse (p.42-47) ──
    { id: "svtAdenosine", when: (ctx) => TACHY_SVT(ctx) && !UNSTABLE(ctx) && ADULT(ctx) && doseCount(ctx, "adenosine") < 3, task: "adenosineTask", note: "stable SVT — adenosine (6mg, then two 12mg doses)" },
    { id: "svtSaline", when: (ctx) => TACHY_SVT(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 1, task: "salineBolus", note: "SVT with hypotension — fluid" },
    // Unstable narrow/wide, regular/irregular — a single synchronized-
    // cardioversion ladder with pre-treatment sedation, matching this
    // guideline's own repeated "deliver a synchronized shock... for
    // responsive patients, consider sedation" line across all four
    // unstable-tachycardia branches.
    { id: "cardiovertMidazolam", when: (ctx) => ((TACHY_SVT(ctx) || TACHY_AFIB_FLUTTER(ctx) || TACHY_WCT_REGULAR(ctx) || TORSADES(ctx)) && UNSTABLE(ctx)) && doseCount(ctx, "midazolam") < 1, task: "midazolamSeizure", note: "unstable tachycardia — pre-cardioversion sedation" },
    { id: "cardiovertNow", when: (ctx) => ((TACHY_SVT(ctx) || TACHY_AFIB_FLUTTER(ctx) || TACHY_WCT_REGULAR(ctx) || TORSADES(ctx)) && UNSTABLE(ctx)) && doseCount(ctx, "cardiovert") < 3, task: "cardiovertTask", note: "unstable tachycardia — synchronized cardioversion" },
    { id: "postCardiovertSaline", when: (ctx) => gaveDose(ctx, "cardiovert") && SHOCK(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "post-cardioversion, still hypotensive — fluid" },
    // p.44: "Regular Wide Complex Tachycardia - Stable: Amiodarone 150mg
    // over 10 min, may repeat once."
    { id: "vtStableAmiodarone", when: (ctx) => TACHY_WCT_REGULAR(ctx) && !UNSTABLE(ctx) && ADULT(ctx) && doseCount(ctx, "amiodarone2") < 2, task: "amiodaroneRepeat", note: "stable regular wide-complex tachycardia — amiodarone" },
    { id: "vtStableSaline", when: (ctx) => TACHY_WCT_REGULAR(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 1, task: "salineBolus", note: "wide-complex tachycardia with hypotension — fluid" },
    // p.44: "Irregular Wide Complex Tachycardia - Stable: If torsades, give
    // magnesium 1-2g IV over 10 minutes."
    { id: "torsadesMagnesium", when: (ctx) => TORSADES(ctx) && doseCount(ctx, "magnesium") < 1, task: "magnesiumSulfate", note: "torsades — magnesium sulfate" },
    { id: "torsadesAmiodarone", when: (ctx) => TORSADES(ctx) && !UNSTABLE(ctx) && ADULT(ctx) && gaveDose(ctx, "magnesium") && doseCount(ctx, "amiodarone2") < 2, task: "amiodaroneRepeat", note: "torsades unresolved by magnesium — amiodarone" },

    // ── Abdominal Pain (p.51-54)/Back Pain (p.75-77)/Sickle Cell Pain
    //    Crisis (p.114-116) — all three defer entirely to Pain Management/
    //    Nausea-Vomiting/Shock, already covered by the generic rules in
    //    this file. Sickle Cell's own "10 mL/kg normal saline bolus (up to
    //    1L)" is the one distinct numeric target. ──
    { id: "sickleCellSaline", when: (ctx) => GENERIC_PAIN(ctx) && ctx.v.spo2 > 0 && ctx.v.spo2 < 94 && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "hypoxic pain crisis — fluid" },

    // ── Agitated or Violent Patient/Behavioral Emergency (p.59-65) —
    //    see AGITATED_MODERATE/AGITATED_SEVERE's own comment for why the
    //    severity split exists. "Midazolam 5mg IV/IM/IN" and "Olanzapine
    //    10mg IM/ODT" are both real exact-dose matches for this engine's
    //    fixed tasks. ──
    { id: "agitationOlanzapine", when: (ctx) => AGITATED_MODERATE(ctx) && ADULT(ctx) && doseCount(ctx, "olanzapine") < 1, task: "olanzapineOdt", note: "moderate agitation — olanzapine" },
    { id: "agitationMidazolam", when: (ctx) => AGITATED_SEVERE(ctx) && doseCount(ctx, "midazolam") < 2, task: "midazolamAgitation", note: "severe agitation — midazolam" },
    { id: "agitationSaline", when: (ctx) => (AGITATED_MODERATE(ctx) || AGITATED_SEVERE(ctx)) && SHOCK(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "agitation with poor perfusion — fluid" },

    // ── Anaphylaxis and Allergic Reaction (p.66-70) ──
    // p.67: "Adult (25kg or more) 0.3mg IM... may be repeated q5-15min" —
    // no stated total, a conservative default of 3 is used.
    { id: "anaphEpi", when: (ctx) => WHEEZING(ctx) && (SHOCK(ctx) || lowSpo2(ctx)) && ADULT(ctx) && doseCount(ctx, "epiIM") < 3, task: "epiIM", note: "anaphylaxis with respiratory/circulatory compromise — epinephrine IM" },
    { id: "anaphAlbuterol", when: (ctx) => WHEEZING(ctx) && doseCount(ctx, "albuterol") < 6, task: "albuterolNeb", note: "respiratory involvement — nebulized albuterol" },
    { id: "anaphDiphen", when: (ctx) => WHEEZING(ctx) && gaveDose(ctx, "epiIM") && !gaveDose(ctx, "diphen") && ADULT(ctx), task: "diphenhydramine", note: "urticaria/pruritus after epinephrine — diphenhydramine" },
    // p.67: "20 mL/kg isotonic fluid rapidly (over 15min), repeat as
    // needed" — a real large-volume target; capped at 4 (2L) as a
    // reasonable middle ground given the same guideline's own "at least
    // 60 mL/kg" figure for when to escalate to an epinephrine drip.
    { id: "anaphSaline", when: (ctx) => WHEEZING(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "hypoperfusion — fluid" },
    { id: "anaphPushEpi", when: (ctx) => WHEEZING(ctx) && SHOCK(ctx) && gaveDose(ctx, "epiIM") && gaveDose(ctx, "saline") && doseCount(ctx, "pushEpi") < 6, task: "pushEpi", note: "cardiovascular collapse despite IM epinephrine and fluid — push-dose epinephrine" },

    // ── Hyperglycemia (p.81-83) ──
    // p.81: "500 mL bolus... if no rales MR x1" per the county-style
    // phrasing this document doesn't use verbatim, but "20 mL/kg at
    // 1000mL/hr" implies roughly 3 administrations for a 70kg reference.
    { id: "hyperglycemiaSaline", when: (ctx) => HYPERGLYCEMIC_SYMPTOMATIC(ctx) && (altered(ctx) || SHOCK(ctx)) && !RALES(ctx) && doseCount(ctx, "saline") < 3, task: "salineBolus", note: "symptomatic hyperglycemia — fluid" },
    // p.82: the hyperkalemia bundle (calcium/bicarb/albuterol), the exact
    // same shared trigger this file's SEVERE_HYPERK predicate already
    // serves for the Cardiac Arrest, Beta Blocker/CCB Overdose, and Crush
    // Injury chapters — see the hyperkCalcium/hyperkBicarb/hyperkAlbuterol
    // rules under Cardiac Arrest below, reused here rather than duplicated.

    // ── Hypoglycemia (p.84-88) ──
    { id: "oralGlucose", when: (ctx) => HYPOGLYCEMIC(ctx) && AWAKE(ctx), task: "oralGlucose", note: "glucose <60, awake — oral glucose" },
    { id: "dextrose", when: (ctx) => HYPOGLYCEMIC(ctx) && !AWAKE(ctx) && HAS_IV(ctx), task: "dextrose", note: "glucose <60, unconscious — D10 IV" },
    { id: "glucagonHypoglycemia", when: (ctx) => HYPOGLYCEMIC(ctx) && !AWAKE(ctx) && !HAS_IV(ctx), task: "glucagonIM", note: "glucose <60, no line — glucagon IM" },

    // ── Nausea-Vomiting (p.89-92) — `ctx.s.vomited` is the real, available
    //    event signal (this engine has no continuous "nauseated" field);
    //    ondansetron 4mg matches the engine's fixed dose exactly. ──
    { id: "nauseaOndansetron", when: (ctx) => !!ctx.s.vomited && doseCount(ctx, "ondansetron") < 1, task: "ondansetron", note: "vomiting — ondansetron" },

    // ── Seizures (p.101-106) — "more than two doses of benzodiazepines
    //    associated with high-risk of airway compromise" is used directly
    //    as the real, stated cap rather than a guessed default. ──
    { id: "seizureMidazolam", when: (ctx) => ACTIVE_SEIZURE(ctx) && doseCount(ctx, "midazolam") < 2, task: "midazolamSeizure", note: "active seizure — midazolam" },

    // ── Shock (p.107-113) ──
    // p.108: "Fluid goal of up to 30 mL/kg of isotonic fluid by
    // administering rapid, predetermined boluses (e.g., 500 mL)" — a real
    // stated target, roughly 4 administrations for a 70kg reference.
    { id: "shockSaline", when: (ctx) => !pulseless(ctx) && SHOCK(ctx) && !GENERIC_PAIN(ctx) && !DELIVERED(ctx) && !WHEEZING(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "shock — fluid" },
    { id: "shockNorepi", when: (ctx) => !pulseless(ctx) && SHOCK(ctx) && gaveDose(ctx, "saline") && doseCount(ctx, "norepi") < 6, task: "norepiTask", note: "shock unresponsive to fluid — norepinephrine (p.5614: preferred pressor, esp. septic/neurogenic)" },

    // ── Cardiac Arrest (VF/VT/Asystole/PEA) (p.117-125) ──
    { id: "arrestPads", when: (ctx) => SHOCKABLE(ctx) && !ctx.s.done?.pads, task: "applyPads", note: "shockable rhythm — pads on" },
    { id: "arrestDefib", when: SHOCKABLE, task: "defibrillate", note: "shockable rhythm — defibrillate" },
    { id: "ivArrest", when: (ctx) => pulseless(ctx) && !HAS_IV(ctx), task: "iv", note: "arrest — vascular access" },
    // p.121: "Administer epinephrine (0.1mg/kg, max 1mg) IV/IO during the
    // first or second round of compressions" — no stated total repeat
    // count; a conservative default of 4 is used, matching this project's
    // other protocol files' identical convention for this same gap. Never
    // fires against a suspected hemorrhagic-trauma arrest — this
    // guideline's own General Trauma Management chapter frames fluid/
    // hemorrhage control as the actual priority there, the same
    // "epinephrine is not the right lever for a bled-out patient"
    // reasoning this project's other protocol files already document.
    { id: "epiVF", when: (ctx) => SHOCKABLE(ctx) && !ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "defib") >= 2 && doseCount(ctx, "epiIV") < (SEVERELY_HYPOTHERMIC(ctx) ? 1 : 4), task: "epiArrest", note: "post-shock x2 — epinephrine" },
    { id: "epiNonshockable", when: (ctx) => NONSHOCKABLE_ARREST(ctx) && !ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "epiIV") < (SEVERELY_HYPOTHERMIC(ctx) ? 1 : 4), task: "epiArrest", note: "asystole/PEA — epinephrine" },
    // p.119: "Amiodarone 5mg/kg IV, max 300mg... for VF/pulseless VT
    // unresponsive to CPR, defibrillation, and a vasopressor" — the arrest-
    // dose amiodarone entry (300mg), not the repeat entry.
    { id: "vfAmiodarone", when: (ctx) => SHOCKABLE(ctx) && gaveDose(ctx, "epiIV") && doseCount(ctx, "amiodarone") < 1, task: "amiodarone", note: "refractory VF/VT — amiodarone" },
    { id: "vfAmiodaroneRepeat", when: (ctx) => SHOCKABLE(ctx) && gaveDose(ctx, "amiodarone") && doseCount(ctx, "amiodarone2") < 1, task: "amiodaroneRepeat", note: "still refractory — amiodarone repeat" },
    // p.119: "For torsades, give magnesium sulfate 2g IV" — during arrest
    // specifically (the stable-torsades rule above already covers the
    // non-arrest case with an identical trigger, so this fires the same
    // task; doseCount is shared, so it will not double-dose).
    { id: "arrestTorsadesMagnesium", when: (ctx) => SHOCKABLE(ctx) && ctx.v.rhythm === "torsades" && doseCount(ctx, "magnesium") < 1, task: "magnesiumSulfate", note: "torsades in arrest — magnesium sulfate" },
    // p.119-120: the dialysis/hyperkalemia bundle — shared, identically-
    // worded trigger reused by Hyperglycemia (p.82) and Crush Injury/Crush
    // Syndrome (p.222-223) below, the same "one bundle, several callers"
    // pattern this project's other protocol files already establish. Also
    // the real trigger for this chapter's own TCA-overdose sodium
    // bicarbonate step (p.256), since WIDE_QRS is a superset signal real
    // sodium-channel-blocker toxicity, ischemia, and hyperkalemia all
    // produce.
    { id: "hyperkCalcium", when: (ctx) => SEVERE_HYPERK(ctx) && doseCount(ctx, "calcium") < 2, task: "calciumChloride", note: "suspected hyperkalemia — calcium (\"can repeat the dose if no response\")" },
    { id: "hyperkBicarb", when: (ctx) => SEVERE_HYPERK(ctx) && doseCount(ctx, "bicarb") < 2, task: "sodiumBicarb", note: "suspected hyperkalemia / wide QRS (incl. TCA overdose) — bicarb (\"can be repeated as needed to narrow QRS\")" },
    { id: "hyperkAlbuterol", when: (ctx) => SEVERE_HYPERK(ctx) && doseCount(ctx, "albuterol") < 6, task: "albuterolNeb", note: "suspected hyperkalemia — continuous albuterol" },
    // p.120: "Hypovolemia: normal saline 2L IV" — 4 administrations.
    { id: "arrestHypovolemiaSaline", when: (ctx) => NONSHOCKABLE_ARREST(ctx) && !ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "PEA/asystole, suspected hypovolemia — fluid" },
    // p.120/p.141-142 (Traumatic Cardiac Arrest): "1,000 mL bolus" for a
    // hemorrhaging trauma arrest specifically — 2 administrations, deliberately
    // separate from the non-hemorrhagic 4-administration rule above.
    { id: "traumaticArrestSaline", when: (ctx) => pulseless(ctx) && ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "traumatic arrest with hemorrhage — fluid" },
    { id: "traumaticArrestTxa", when: (ctx) => pulseless(ctx) && ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "traumatic arrest — adjunctive TXA" },
    { id: "traumaticArrestNeedleD", when: (ctx) => pulseless(ctx) && TENSION_PTX(ctx) && doseCount(ctx, "needleD") < 2, task: "needleDecompTask", note: "traumatic arrest — bilateral chest decompression" },
    // p.126-129 (Adult Post-ROSC Care): SBP<90/MAP<65 defers to the Shock
    // Guideline's own already-built rules (shockSaline/shockNorepi, gated
    // on plain hypotension, not pulselessness) — `pat.roscOccurred`
    // (mortality.js) exists but is deliberately debrief-only state a
    // provider must not be able to read during play (see this project's
    // own physiology.js header comment on outcomeReport(s)), so a
    // crew-direction rule cannot honestly key off "was this patient just
    // resuscitated" — matching the identical reasoning already on record
    // in this project's San Diego County file.

    // ── Neonatal Resuscitation (p.159-164) ──
    { id: "newbornDry", when: NEWBORN_UNSTIMULATED, task: "newbornDry", note: "newborn — dry, warm, stimulate" },
    { id: "newbornPpv", when: NEWBORN_NEEDS_PPV, task: "newbornPpv", note: "newborn HR <100 — bag with BVM" },
    { id: "newbornCpr", when: NEWBORN_NEEDS_CPR, task: "newbornCompressions", note: "newborn HR <60 despite PPV — compressions" },
    // Newborn epinephrine (0.01 mg/kg) and newborn-scaled fluid (20 mL/kg)
    // are deliberately NOT implemented — reusing this engine's adult-dosed
    // epiArrest (1mg) or saline (500mL) for a ~3kg newborn would be a real,
    // dangerous dose-scale mismatch, matching this project's own
    // physiology-queue precedent (item 65) and San Diego County's own
    // identical exclusion.

    // ── Eclampsia/Pre-Eclampsia (p.171-174) ──
    { id: "leftTilt", when: (ctx) => PREGNANT(ctx) && !DELIVERED(ctx), task: "leftTilt", note: "pregnant patient — displace the uterus left" },
    // p.172: "Magnesium sulfate: 4g IV over 5-10 min" for seizure
    // prophylaxis — an exact match for this engine's fixed 4g dose.
    { id: "preeclampsiaMagnesium", when: (ctx) => PREGNANT(ctx) && (SEVERE_PREECLAMPSIA(ctx) || ACTIVE_SEIZURE(ctx)) && doseCount(ctx, "magnesium") < 1, task: "magnesiumSulfate", note: "severe pre-eclampsia/eclampsia — magnesium sulfate" },
    // p.173: "Give calcium gluconate 3g IV or calcium chloride 1g IV in
    // cases of pending respiratory arrest" — a real, mechanism-backed
    // reversal of this engine's own live magnesium-toxicity field.
    { id: "magToxicityCalcium", when: (ctx) => MAG_TOXICITY(ctx) && doseCount(ctx, "calcium") < 1, task: "calciumChloride", note: "magnesium toxicity — calcium" },
    { id: "seizureMidazolamMagRefractory", when: (ctx) => PREGNANT(ctx) && ACTIVE_SEIZURE(ctx) && gaveDose(ctx, "magnesium") && doseCount(ctx, "midazolam") < 2, task: "midazolamSeizure", note: "eclamptic seizure not responding to magnesium — benzodiazepine" },

    // ── Obstetrical and Gynecological Conditions (p.175-177) ──
    // p.177: "crystalloid 1-2 liters IV wide open" for a hemorrhaging
    // (non-postpartum) OB/GYN patient in shock — up to 4 administrations.
    { id: "obgynSaline", when: (ctx) => PREGNANT(ctx) && !DELIVERED(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "obstetric hemorrhage/shock — fluid" },
    // Postpartum hemorrhage — this guideline's own Childbirth chapter
    // (p.165-170) does not itemize a separate PPH drug ladder the way LA/
    // San Diego's own files do, but this engine's fundal-massage/TXA
    // mechanisms are real and general enough to reuse honestly for the
    // delivered-and-hemorrhaging case.
    { id: "postpartumFundalMassage", when: (ctx) => DELIVERED(ctx) && SHOCK(ctx), task: "fundalMassage", note: "postpartum hemorrhage — fundal massage" },
    { id: "postpartumSaline", when: (ctx) => DELIVERED(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "postpartum hemorrhage — fluid" },
    { id: "postpartumTxa", when: (ctx) => DELIVERED(ctx) && SHOCK(ctx) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "significant postpartum hemorrhage — TXA" },

    // ── Respiratory Distress (includes Bronchospasm, Pulmonary Edema)
    //    (p.190-197) ──
    // p.191: "albuterol 5mg nebulized... repeat at this dose with unlimited
    // frequency for ongoing respiratory distress" — a real, stated
    // open-ended cadence; 6 is used as this file's own generous-but-bounded
    // default for that specific phrase.
    { id: "bronchospasmAlbuterol", when: (ctx) => WHEEZING(ctx) && doseCount(ctx, "albuterol") < 6, task: "albuterolNeb", note: "bronchospasm — albuterol" },
    // p.192: "Magnesium sulfate (40mg/kg IV, max 2g)... for severe
    // bronchoconstriction and concern for impending respiratory failure."
    { id: "bronchospasmMagnesium", when: (ctx) => WHEEZING(ctx) && lowSpo2(ctx) && ADULT(ctx) && gaveDose(ctx, "albuterol") && doseCount(ctx, "magnesium") < 1, task: "magnesiumSulfate", note: "severe bronchoconstriction, impending failure — magnesium sulfate" },
    // p.192: "Epinephrine (0.01mg/kg, max 0.3mg IM) should ONLY be
    // administered for impending respiratory failure... when there are no
    // clinical signs of improvement" — deliberately gated as the last
    // resort in this ladder.
    { id: "bronchospasmEpi", when: (ctx) => WHEEZING(ctx) && lowSpo2(ctx) && ADULT(ctx) && gaveDose(ctx, "magnesium") && doseCount(ctx, "epiIM") < 1, task: "epiIM", note: "impending respiratory failure, no improvement with above — epinephrine IM" },
    { id: "asthmaCpap", when: (ctx) => WHEEZING(ctx) && lowSpo2(ctx) && !apnoeic(ctx) && doseCount(ctx, "cpap") < 1, task: "cpapTask", note: "severe respiratory distress — CPAP" },
    // p.191: SBP<100 -> 250-500mL fluid; SBP<160 -> nitro 0.4mg (repeat
    // q5min for SBP>100); SBP>=160 -> a 0.8mg tier this engine has no
    // second nitro entry for (CLAUDE.md's own physiology queue item 64
    // already found the existing single nitro entry is not safely
    // calibrated to be doubled blind) — both SBP tiers reuse the same
    // fixed 0.4mg task rather than guess at an uncalibrated nitro2 entry.
    { id: "chfSalineLow", when: (ctx) => RALES(ctx) && ctx.v.sbp > 0 && ctx.v.sbp < 100 && doseCount(ctx, "saline") < 1, task: "salineBolus", note: "pulmonary edema with SBP <100 — fluid" },
    { id: "chfNitro", when: (ctx) => RALES(ctx) && ctx.v.sbp >= 100 && doseCount(ctx, "nitro") < 3, task: "nitroTask", note: "pulmonary edema, SBP >=100 — nitroglycerin" },
    { id: "chfCpap", when: (ctx) => RALES(ctx) && !apnoeic(ctx) && doseCount(ctx, "cpap") < 1, task: "cpapTask", note: "pulmonary edema — CPAP" },

    // ── General Trauma Management (p.208-214) ──
    // p.209-210: "500mL bolus, repeat as needed for persistent shock...
    // total of 2L crystalloid" — 4 administrations.
    { id: "traumaSaline", when: (ctx) => !pulseless(ctx) && (SHOCK(ctx) || SHOCK_INDEX_HIGH(ctx)) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "trauma, SBP <90 or signs of shock — fluid" },
    { id: "traumaTxa", when: (ctx) => ACTIVE_HEMORRHAGE(ctx) && (SHOCK(ctx) || SHOCK_INDEX_HIGH(ctx)) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "trauma-associated hemorrhagic shock — TXA within 3h of injury" },
    { id: "traumaNeedleD", when: (ctx) => TENSION_PTX(ctx) && doseCount(ctx, "needleD") < 2, task: "needleDecompTask", note: "tension pneumothorax — needle decompression" },
    { id: "traumaChestSeal", when: OPEN_PTX, task: "chestSealTask", note: "open chest wound — vented chest seal" },

    // ── Head Injury (p.233-237) — a real, permissive-hypotension target
    //    (SBP>=110), distinct from every other guideline's SBP>=90 shock
    //    target: "Do not wait until after the patient is already
    //    hypotensive — prevent hypotension." ──
    { id: "tbiHighFlowO2", when: (ctx) => SUSPECTED_TBI(ctx) && !apnoeic(ctx), task: "o2", note: "head injury — high-flow oxygen as a precaution against deterioration" },
    { id: "tbiSaline", when: (ctx) => SUSPECTED_TBI(ctx) && ctx.v.sbp < 110 && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "head injury — protect cerebral perfusion pressure (target SBP >=110)" },

    // ── Crush Injury/Crush Syndrome (p.222-224) — the hyperkalemia bundle
    //    above (hyperkCalcium/hyperkBicarb/hyperkAlbuterol) already serves
    //    this chapter's own identically-worded ECG-driven trigger; "1,000
    //    mL prior to release, then 500-1,000 mL/hr post-extrication" is
    //    already covered by the general traumaSaline rule above. ──

    // ── Acetylcholinesterase Inhibitors Exposure (p.260-270) ──
    // p.266: severe exposure, adult/adolescent — "three auto-injectors
    // (1800mg pralidoxime, 6mg atropine)," matching DuoDote's own
    // 2.1mg-atropine/600mg-pralidoxime combination task exactly at 3
    // administrations.
    { id: "nerveAgentDuodote", when: (ctx) => NERVE_AGENT_SEVERE(ctx) && doseCount(ctx, "duodote") < 3, task: "duodoteTask", note: "severe nerve-agent/organophosphate exposure — DuoDote" },
    // Seizures secondary to AChEI exposure fall back to the shared
    // seizureMidazolam rule above.

    // ── Beta Blocker Poisoning/Overdose (p.287-290) / Calcium Channel
    //    Blocker Poisoning/Overdose (p.295-298) — the shared bradycardia
    //    ladder above (bradyAtropine/bradyCalcium/bradyGlucagon/
    //    bradyPacing/bradySaline/bradyPushEpi) already serves both
    //    chapters' own identical drug sequence for symptomatic
    //    bradycardia/hypotension; the shared hyperkBicarb rule already
    //    serves both chapters' own identical "widened QRS (100msec or
    //    greater)... sodium bicarbonate" step. ──

    // ── Opioid Poisoning/Overdose (p.303-307) — deliberately NEVER gated
    //    on pulseless(ctx): "naloxone has no benefit in the treatment of
    //    cardiac arrest. Do not delay other interventions." No stated total
    //    ceiling beyond "titrated until adequate respiratory effort" — 4
    //    administrations is used as this file's own conservative default,
    //    matching this project's other protocol files' identical
    //    convention for the same drug. ──
    { id: "opioidNaloxone", when: (ctx) => !pulseless(ctx) && ((ctx.v.rr > 0 && ctx.v.rr < 12) || (ctx.v.spo2 > 0 && ctx.v.spo2 < 94)) && doseCount(ctx, "naloxone_iv") < 4, task: "naloxoneArrest", note: "respiratory depression, suspected opioid overdose — naloxone" },

    // ── Hyperthermia/Heat Exposure (p.320-325) ──
    // p.321: "If core temperature is greater than 104F (40C) or if altered
    // mental status is present, begin active cooling."
    { id: "heatActiveCooling", when: (ctx) => (HEAT_STROKE(ctx) || (altered(ctx) && ctx.v.temp >= 38)) && doseCount(ctx, "activeCooling") < 1, task: "activeCoolingTask", note: "heat stroke — active cooling" },
    // p.322: "20 mL/kg boluses" for heat stroke — 2 administrations.
    { id: "heatSaline", when: (ctx) => HEAT_STROKE(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "heat stroke — fluid" },

    // ── Hypothermia/Cold Exposure (p.326-332) ──
    { id: "coldWarmBlanket", when: (ctx) => ctx.v.temp > 0 && ctx.v.temp < 35 && doseCount(ctx, "warm") < 1, task: "warmBlanket", note: "hypothermia — active warming" },
    { id: "coldSaline", when: (ctx) => ctx.v.temp > 0 && ctx.v.temp < 32 && SHOCK(ctx) && doseCount(ctx, "saline") < 3, task: "salineBolus", note: "moderate/severe hypothermia with hypotension — warmed fluid" },
    // Epinephrine dosing in a hypothermic arrest is already limited to a
    // single dose below 30C via the SEVERELY_HYPOTHERMIC gate already built
    // into epiVF/epiNonshockable above — matching this guideline's own
    // p.377 cutoff.

    // ── Drowning (p.333-336) ──
    { id: "drowningCpap", when: (ctx) => lowSpo2(ctx) && !apnoeic(ctx) && doseCount(ctx, "cpap") < 1, task: "cpapTask", note: "drowning with respiratory distress — CPAP" },
  ],
};

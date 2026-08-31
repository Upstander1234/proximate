// ─── LA County DHS Treatment Protocols (Ref. No. 1200 series) ─────────────
// Built incrementally, batch by batch, straight off the county's own
// numbered treatment-protocol PDFs — each rule below is commented with the
// TP number and step it comes from so a later batch can find the source
// text again rather than re-deriving it. This is ONE flat, priority-ordered
// rules list (see engine.js's own header comment: list order IS priority
// order), so rules from different TP numbers are interleaved by clinical
// urgency, not grouped by protocol number — airway/breathing/circulation
// life threats always sit ahead of a specific TP's own treatment steps,
// exactly as TP 1200.1's own "Using the Treatment Protocols" section
// instructs ("prioritize interventions based on your judgment").
//
// Batch 1 covers: TP 1200 (table of contents / provider impressions — no
// rules of its own, it's a routing index), TP 1200.1 (general instructions
// — no rules), TP 1200.4 (BLS upgrade thresholds — supplied the `lowSpo2`
// abnormal-vitals cutoff now in engine.js), TP 1201 (Assessment — no
// concrete field-directable steps), TP 1202/1202-P (General Medical — the
// generic ABC + monitor + IV + nausea steps every other protocol builds
// on), and TP 1203 (Diabetic Emergencies — the first protocol in this file
// with a real, branching field-treatment algorithm).
//
// Batch 2 covers: TP 1204 (Fever/Sepsis), TP 1205 (GI/GU Emergencies),
// TP 1206 (Medical Device Malfunction — almost entirely a routing protocol;
// its concrete steps are the same ABC/O2/IV/saline/nausea/glucose baseline
// already covered below, so it adds no new rules of its own), TP 1207
// (Shock/Hypotension), TP 1210 (Cardiac Arrest — batch 2 implemented
// through step 21 of a source text cut off mid-step-22; batch 5, below,
// completed it with the rest of the text, steps 22-27), and the subset of
// TP 1209 (Behavioral/Psychiatric Crisis) that had a real,
// ground-truth signal to fire on at the time. TP 1209's core trigger — an
// agitated/uncooperative patient — had NO live representation anywhere in
// this engine (grepped patient.js: no agitation-shaped field existed), so
// the sedation-administration steps (olanzapine, midazolam-for-agitation)
// could not be wired to a real predicate without inventing one. RESOLVED,
// queue items 51/52, a later batch: pat.agitation (neuro.js) is now a real,
// general 0-1 severity, composed from sympathetic tone, hypoxia, and a
// condition-declared pat.agitationBurden (excitedDelirium's own real
// consumer), lowered by real pharmacologic treatment (pat.sedationDepth/
// pat.antipsychoticEffect) — TP 1209's own olanzapine/midazolam rules now
// fire on it for real; see the agitationOlanzapine/agitationMidazolam rules
// further down this file. What TP 1209 already reused a real signal for
// before that fix (glucose-check-on-altered-mental-status, hyperthermia
// cooling) is unchanged, covered by rules below shared with other TPs.
//
// Batch 3 covers: TP 1217-P (Pregnancy Complication — preeclampsia/
// eclampsia, postpartum hemorrhage, and the leftward-tilt positioning
// mechanic that traumaPregnant's own condition comment already named as
// missing), TP 1218/1218-P (Pregnancy Labor — no new rules; its own
// concrete steps are the generic ABC/monitor/IV baseline already covered,
// and its one prescriptive step, "opiate/ketorolac contraindicated," is a
// restriction with no rule-engine consumer — this file only ever directs
// crew TOWARD an intervention, never blocks the player from giving one),
// TP 1219/1219-P (Allergy/Anaphylaxis), TP 1220/1220-P (Burns — no new
// rules; no burn-severity/TBSA field exists anywhere in this engine, so
// its steps beyond the generic ABC/shock/warming/saline baseline already
// covered below aren't representable — see the CLAUDE.md queue entry filed
// this batch), TP 1221/1221-P (Electrocution — likewise no new rules, same
// reasoning: no electrical-injury field, reuses the generic baseline plus
// the arrest/dysrhythmia rules already in this file), TP 1222/1222-P
// (Hyperthermia, Environmental), TP 1223/1223-P (Hypothermia/Cold Injury),
// TP 1224/1224-P (Stings/Venomous Bites — no new rules; no
// antivenom/envenomation-severity mechanism exists, see the CLAUDE.md
// queue entry), and TP 1225/1225-P (Submersion — no new rules of its own;
// composes entirely from the arrest, hypothermia and generic
// poor-perfusion rules already in this file, exactly as its own text
// directs: "treat per TP 1210," "treat in conjunction with...").
//
// Batch 4 (final) covers: TP 1226/1226-P (ENT/Dental — no new rules; every
// concrete step beyond direct pressure/positioning, which have no
// drug/procedure mapping, is the generic ABC/IV/nausea baseline already
// covered), TP 1228/1228-P (Eye Problem — no new rules, same reasoning:
// globe-injury shielding and saline irrigation have no eye-specific
// mechanism to hook, and the generic baseline covers vascular access/
// nausea), TP 1229/1229-P (ALOC — no new rules; this protocol is a
// differential-routing index whose every concrete step, glucose check,
// poor-perfusion saline, is already generic and fires regardless of which
// protocol is selected), TP 1230/1230-P (Dizziness/Vertigo — no new rules,
// same reasoning as ALOC), TP 1231/1231-P (Seizure — the general,
// non-pregnancy-specific analog of TP 1217-P's eclampsia midazolam rule),
// TP 1232/1232-P (Stroke/CVA/TIA — QUEUE ITEM 62, RESOLVED a later session:
// a real `strokeScreenCrew` rule now directs the crew-assignable FAST/
// Cincinnati stroke screen, `gear.js`'s `assessStroke` — mLAPSS/LAMS
// destination-routing scoring itself remains a documentation/dispatch
// consequence, not a drug or procedure, so still has no separate task of
// its own beyond running the screen that feeds it), TP 1233/1233-P (Syncope — no new
// rules, fully covered by the generic saline/monitor baseline), TP 1234/
// 1234-P (Airway Obstruction — CPAP is new; nebulized epinephrine for
// stridor remains a real gap (queue item 60, still open) — the dedicated
// angioedema signal filed alongside it as queue item 61 was RESOLVED in a
// later session (see the ANAPHYLAXIS helper below and CLAUDE.md section 3's
// newest entry), TP
// 1235-P (BRUE — no new rules, pediatric-only differential-routing
// protocol, same reasoning as ALOC), and TP 1236/1236-P (Inhalation Injury
// — implemented through step 11 of the source text as received; the
// source was cut off mid-step-12 at the time). CPAP (new, shared by TP
// 1236's own step 14) is the one genuinely new mechanism this batch adds,
// reusing the real, already-shipped `cpap` procedure. [TP 1236's own
// remaining steps, 12-18, were completed in a later batch — see this
// file's own newer entries below; the source text turned out to have no
// further steps beyond 18, so this protocol is now COMPLETE, not still
// truncated as this paragraph originally said.]
//
// Batch 5 covers: TP 1210's complete text (steps 1-27, received in full —
// the earlier truncation at step 22 is resolved). Two real fixes to
// earlier batches' own approximations, both made possible by finally
// having the complete text: amiodarone's repeat dose is now a real, new
// 150mg drugs.js entry (`amiodarone2`) instead of a second administration
// of the flat 300mg entry, which had been overshooting the protocol's own
// 450mg ceiling by 150mg (this resolves CLAUDE.md's queue item 53 — see
// its own entry there for what was believed missing before this batch);
// and naloxone for suspected arrest-related opioid toxicity is now real
// (`SUSPECTED_OPIOID`, reading the live `respDriveSuppression` field),
// reusing the existing `naloxone_iv` entry at a conservative cumulative
// dose rather than inventing a third naloxone tier in the same batch.
//
// A genuine, previously-undiscovered systemic gap was found while adding
// these two rules and is NOT fixed in this batch — see the CLAUDE.md queue
// entry filed this batch: crew-directed doses (TASKS' `dose` field, given
// via App.jsx's `crewFn`) call `giveDose()` directly and never check the
// drug's own declared `max` the way the player's own manual dosing action
// does (`App.jsx`'s `s.given[id]` counter) — every `doseCount(ctx,...)`
// cap written throughout this file (and there are many) is currently the
// ONLY thing preventing a protocol rule from directing unlimited repeat
// administrations of a capped drug. Every rule in this file was written
// with an explicit cap where the source text gives one, so this file
// itself is not exposed by the gap — but it means any FUTURE rule that
// forgets one is silently unsafe, and the batch-1 `oralGlucose`/
// `glucagonIM` rules predate this discovery and have no cap at all (no
// numeric ceiling was ever given in the TP 1203 text received, which was
// itself truncated — see that section's own comment).
//
// Batch 6 covers: TP 1211 (Cardiac Chest Pain), TP 1212/1212-P (Cardiac
// Dysrhythmia — Bradycardia), TP 1213/1213-P (Cardiac Dysrhythmia —
// Tachycardia), and TP 1214 (Pulmonary Edema/CHF — adult only, no -P
// variant received). Tachycardia is the largest single rule cluster this
// file has — SVT, regular monomorphic WCT, and irregular/polymorphic WCT
// each get real, distinct rhythm-string-gated treatment (`rhythm==="svt"`/
// `"VT"`/`"torsades"`, all real, already-classified engine states), rather
// than one generic "tachycardia" rule, because the protocol itself treats
// them as genuinely different algorithms and this engine already has the
// real signal to tell them apart. Atrial fibrillation deliberately gets NO
// treatment rule — the protocol's own text withholds a standing-order
// field treatment for afib and requires base contact instead ("CONTACT
// BASE for treatment guidance"), so no rule is the CORRECT and honest
// implementation here, not a gap. Irregular WCT (torsades/polymorphic VT)
// is treated with defibrillation (unsynchronized), not synchronized
// cardioversion — the protocol's OWN footnote ⓼ says polymorphic VT
// "cannot be synchronized reliably" and AHA recommends immediate
// unsynchronized shock, overriding the body text's less precise
// "synchronized cardioversion" language for this one specific rhythm; see
// that rule's own comment. Six new drug/procedure tasks this batch:
// aspirin, nitro, fentanyl (the one crew-directable pain-management drug,
// picked over morphine as functionally interchangeable per the protocol's
// own text), atropine, transcutaneous pacing, adenosine, and synchronized
// cardioversion — all real, already-shipped drugs.js/procedures.js
// mechanisms, none invented for this batch.
//
// Batch 7 covers: TP 1215/1215-P (Childbirth, Mother — no new rules; every
// concrete step (positioning, fundal massage, poor-perfusion saline) reuses
// the SAME rules TP 1217/1217-P already built in batch 3, and the actual
// delivery mechanic itself lives in the physiology engine's own
// condition/roster machinery, not in a crew-directable action), TP 1216-P
// (Newborn/Neonate Resuscitation — the first protocol this file directs
// treatment for a patient OTHER than whichever one is "active": the
// newborn is a real, separate roster entry (id "newborn") with its own
// bespoke `_neo` vigour state machine, not a drug/procedure `dose` — a new
// `t.neoAction` crewFn branch in App.jsx was needed, mirroring the exact
// mechanism the `pph` scenario's own player-facing nbDry/nbBag/nbComp
// actions already use, generalized so ANY scenario spawning a newborn gets
// the same crew-directable treatment), and TP 1217/1217-P's own new step
// 22 (tranexamic acid for postpartum hemorrhage, added to the protocol
// since this file's batch-3 implementation — reuses the real, already-
// shipped `txa` drug entry). Newborn epinephrine (step 14) and newborn-
// scaled IV fluids (step 15) are deliberately NOT implemented this batch —
// reusing the adult `epiIV`(1mg)/`saline`(500mL) entries for a ~3kg
// newborn would be a real, dangerous dose-scale mismatch (0.01mg/kg
// epinephrine for a 3kg newborn is ~0.03mg, roughly 1/33rd of the adult
// entry's fixed dose), not a defensible approximation — see the CLAUDE.md
// queue entry filed this batch.
//
// Batch 8 covers: TP 1237/1237-P (Respiratory Distress — one genuinely new
// mechanism, needle decompression for real tension pneumothorax via the
// already-published `ptx==="tptx"` state; epinephrine for bronchospasm
// deteriorating despite albuterol reuses the existing `epiIM` task under a
// new trigger; CPAP/albuterol/O2/saline/monitor all reuse rules already in
// this file), TP 1238/1238-P (Carbon Monoxide Exposure — no new rules; its
// every concrete step, O2, monitor, IV, ALOC/poor-perfusion/trauma cross-
// refs, is already generic, and CO exposure itself has no representable
// signal — no carboxyhemoglobin mechanism exists in this engine, the same
// standing gap already on record from the Burns/Inhalation-Injury batch),
// and TP 1239/1239-P (Dystonic Reaction — no automatic rule; no
// extrapyramidal/dystonic-muscle-spasm signal exists anywhere in this
// engine, and the protocol itself requires base contact to CONFIRM the
// impression before treating, the same "diagnosis needs a human, not a
// vital sign" shape as TP 1229/1232's assessment-only sections — see the
// CLAUDE.md queue entry filed this batch. `diphenhydramine`, the task this
// protocol would use, already exists from batch 3's Allergy work and
// remains available for manual crew ordering).
//
// Batch 9 covers: TP 1240/1240-P (HAZMAT — DuoDote for nerve-agent
// exposure with real, objective SEVERE-tier signals (apnea, seizure,
// spo2<90); the mild/moderate tiers have no automatic rule, since their
// real clinical criteria — miosis, rhinorrhea, salivation — have no
// representable signal in this engine, see the CLAUDE.md queue entry filed
// this batch. Organophosphate-exposure atropine reuses TP 1212's own
// `bradyAtropine` rule/task outright rather than duplicating a near-
// identical trigger — same drug, same mechanism, a real but minor dose-
// amount approximation already noted in-code. Cyanide-exposure
// hydroxocobalamin has no automatic rule (no cyanide-specific signal
// exists), kept available for manual ordering. Radiologic-exposure steps
// are pure scene/logistics decisions with no drug or procedure to direct
// a crew member toward), TP 1241/1241-P (Overdose/Poisoning/Ingestion —
// naloxone for a PULSED, apneic/hypoventilating opioid-toxic patient,
// generalizing TP 1210's own pulseless-gated `arrestNaloxone` rule to a
// non-arrest context; calcium for suspected calcium-channel/beta-blocker
// overdose reuses the existing `calciumChloride` task under a real
// bradycardia+hypotension trigger, per the protocol's own footnote ❸;
// tricyclic-overdose bicarbonate has no automatic rule — its real trigger,
// wide QRS on the 12-lead, is the same already-filed `qrsWidth`-not-
// published gap from an earlier batch [RESOLVED, later batch: qrsWidth is
// now published in vitals() and this step has a real `odBicarb` rule — see
// the WIDE_QRS/SEVERE_HYPERK comment near this file's own predicate
// definitions]), and TP 1242/1242-P (Crush Injury/
// Syndrome — calcium/bicarb/albuterol for ECG-evidence-of-hyperkalemia
// reuse the exact same `SEVERE_HYPERK` signal TP 1210/1212 already use,
// generalized to fire regardless of rhythm, since crush-syndrome
// hyperkalemia doesn't wait for bradycardia to become dangerous; TXA
// reuses the existing `txaTask` under a real trigger — a tourniquet
// already applied (`s.done`'s own `tq@<limb>` keys) plus ongoing poor
// perfusion. Prophylactic pre-extrication fluid/medication timing and
// tourniquet-before-extrication are genuine scene-sequencing decisions
// with no physiologic trigger to gate them on, so they're not automated).
//
// Batch 10 covers: TP 1236/1236-P's remaining text (steps 12-18, see that
// section's own updated comment — the protocol is now complete, no longer
// truncated) and TP 1243/1243-P (Traumatic Arrest — needed almost no new
// rules: shockable-rhythm defibrillation reuses TP 1210's own SHOCKABLE-
// gated rules outright (the real rhythm signal doesn't care whether the
// arrest is medical or traumatic), needle thoracostomy reuses the existing
// TENSION_PTX-gated rule (this engine's `ptx` field has no left/right
// distinction, so "bilateral" decompression isn't separately
// representable — the single existing rule is the honest ceiling), and
// vascular access reuses the existing `ivArrest` rule. The one new rule is
// a higher-volume saline cap specific to this protocol's own stated 2L
// target (double TP 1210's own 1L arrest-saline target) — see that rule's
// own comment for a real inconsistency this surfaced and filed rather than
// silently patched. Tourniquet placement (step 2) deliberately has NO
// automatic rule — hemorrhage in this engine is a whole-body blood-volume
// signal, not per-limb, so there's no honest way to pick WHICH limb needs
// one; the existing `tq` task remains manual-only. SMR, termination-of-
// resuscitation, and the blunt-vs-penetrating transport-prioritization
// distinction are scene/transport decisions with nothing to direct a crew
// member toward.
//
// Batch 11 covers: TP 1244/1244-P (Traumatic Injury — the field-guide-wide
// cross-reference target of nearly every other trauma-adjacent protocol
// already in this file, and the largest single-protocol batch since the
// original cardiac-arrest implementation). Two genuinely new mechanisms:
// high-flow O2 and a real, more aggressive saline allowance for suspected
// TBI both key off `pat.brainInjury` (a real, already-live structural-
// injury field this file had never read before), and a vented chest seal
// for a simple/open pneumothorax reuses an ALREADY-SHIPPED but previously
// crew-undirectable mechanism (`pat.chestSealApplied`, which
// conditions.js's own tension-progression check already reads to stop a
// simple pneumothorax from becoming a tension one — a real consumer that
// simply had no task pointing at it until this batch). TXA is scoped to
// genuine active hemorrhage (`pat.activeBleedRate`), not bare shock, per
// this file's own now-more-careful reading of what TXA is actually FOR —
// unlike TP 1217/1242's own TXA rules, which stay correctly scoped by
// their own contexts (postpartum, tourniquet-already-placed) without
// needing this same additional gate.
//
// QUEUE ITEM 69, RESOLVED (a later session): TP 1244's own footnote ❻/❽
// describes PERMISSIVE HYPOTENSION — a deliberately SMALLER, more
// conservative 250mL bolus for suspected internal hemorrhage in blunt/
// penetrating multi-system trauma, because aggressive fluid dilutes
// clotting factors and worsens bleeding (an already-measured, real
// mechanism in THIS engine — see this document's own physiology history
// on saline's `fx:{coag:-6}` accelerating hemorrhage). This file's own
// generic `saline_shock`/`saline_gigu` rules used to fire for ANY
// hypotensive/poor-perfusion patient regardless of cause, giving a full
// 500mL bolus to a multi-system trauma patient exactly like they would to
// a septic or cardiogenic-shock one — the OPPOSITE of what this
// protocol's own footnote says is correct. Fixed with two real pieces,
// both needed together: `salineMinor` (drugs.js), a genuine 250mL
// fx-scaled fluid entry distinct from `saline`'s own 500mL, and
// `traumaMinorSaline` (below), gated on the SAME `ACTIVE_HEMORRHAGE`
// signal `traumaTxa` already used for TXA — `saline_shock`/`saline_gigu`
// now explicitly exclude `ACTIVE_HEMORRHAGE` so the two rules cannot both
// fire and double the fluid this protocol's own footnote warns against.
// TP 1244's own OPPOSITE case — isolated head injury wants MORE aggressive
// fluid to protect cerebral perfusion — was already represented for real
// (`tbiSaline`, below); both directions are now real.
//
// Everything else (neuro beyond seizure/stroke/ALOC, toxicology beyond
// opioid/CCB-BB/nerve-agent/organophosphate overdose) is not yet
// implemented — no further source text has arrived for those TPs.

import {
  pulseless, apnoeic, lowSpo2, soiledAir,
  noVitals, notMonitored, noLeads, altered,
} from "./engine.js";

// TP 1204 footnote/TP 1207 ❶: this engine has no dedicated "poor perfusion"
// (cap refill / skin signs) field — `_lactate` (metabolic.js, published by
// vitals()) is the one real, already-computed physiologic signal for
// inadequate tissue perfusion, so it stands in for MCG 1355's clinical
// exam findings here. >4 mmol/L is the same severe-perfusion-deficit cutoff
// already used elsewhere in this engine (e.g. the renal/hepatic
// oxygen-debt work), not a number invented for this file.
const POOR_PERFUSION = (ctx) => ctx.v._lactate > 4;
// TP 1200.3's own PI guideline table: "Hypotension ... For SBP <90mmHg."
// Also TP 1207's own Shock/Hypotension entry criterion.
const SHOCK = (ctx) => ctx.v.sbp > 0 && ctx.v.sbp < 90;
const HAS_IV = (ctx) => (ctx.s.ivSites || []).length > 0;
const doseCount = (ctx, id) => (ctx.s.doses || []).filter((d) => d.id === id).length;
const gaveDose = (ctx, id) => doseCount(ctx, id) > 0;
// TP 1210 step 8: shockable rhythms are VF and pulseless VT; torsades is
// treated the same way in this engine's own already-shipped defibrillation
// mechanics (see arrhythmiaEfficacy.mjs's identical rhythm list).
const SHOCKABLE = (ctx) => pulseless(ctx) && ["VF", "VT", "torsades"].includes(ctx.v.rhythm);
const NONSHOCKABLE_ARREST = (ctx) => pulseless(ctx) && !SHOCKABLE(ctx);
// QUEUE ITEM 54, RESOLVED: pat.qrsWidth (cardiovascular.js's
// updateConduction) was a real, live quantity computed every tick from
// hyperkalaemia/Na-channel-block/ischemia/hypermagnesaemia but never
// published in vitals() — so "suspected hyperkalemia" below could only be
// approximated on serum potassium alone, even though the actual real-world
// finding a paramedic acts on is the ECG (peaked T waves widening into a
// wide QRS), not a lab value this engine's own patients don't carry a
// prehospital assay for. Now published (patient.js's vitals()) as
// `v.qrsWidth`, in seconds — 0.12s is the standard wide-QRS cutoff (300ms
// on a 25mm/s strip = 3 small boxes; corresponds to the ECG-widening onset
// this engine's own qrs formula reaches once effK exceeds ~5.5-6, so this
// threshold is consistent with, not looser than, the potassium one it now
// supplements).
const WIDE_QRS = (ctx) => ctx.v.qrsWidth > 0.12;
// TP 1210 step 16 / TP 1209 footnote 10: "suspected hyperkalemia." No PI
// text in either batch gives a numeric cutoff, so this reuses the severe-
// hyperkalemia threshold this engine's own hyperkalemiaMissedDialysis
// condition and CLAUDE.md's own documented ECG-progression work already
// treat as the dangerous band (peaked T waves onward) — now ALSO fires on
// a real wide-QRS ECG finding alone, per the above, since a paramedic in
// the field suspects hyperkalemia FROM the ECG morphology, not from a
// potassium level they cannot measure on scene. This is the correct
// direction to extend it: WIDE_QRS is a superset trigger (real
// sodium-channel-blocker/TCA toxicity and severe ischemia also widen QRS,
// both of which calcium/bicarb are separately indicated for), never a
// narrower one, so this cannot suppress an existing potassium-driven
// firing, only add cases the old proxy structurally could not see.
const SEVERE_HYPERK = (ctx) => ctx.v.k >= 6.0 || WIDE_QRS(ctx);

// TP 1203 step 7: glucose <60 mg/dL is the county's own hypoglycemia
// threshold (TP 1200.3's own PI guideline table: "Hypoglycemia ... For
// glucose <60mg/dL"). Kept local rather than promoted to engine.js since
// it's this county's own specific cutoff, not a universal one.
const HYPOGLYCEMIC = (ctx) => ctx.v.glu > 0 && ctx.v.glu < 60;
// TP 1203 step 8: >400 mg/dL (or a glucometer reading "HIGH") is where the
// protocol calls for a full-liter rapid saline infusion rather than just
// documenting Hyperglycemia — the county's own severe-hyperglycemia cutoff.
const SEVERE_HYPERGLYCEMIC = (ctx) => ctx.v.glu >= 400;
// TP 1203 step 7: oral glucose/glucopaste is only for a patient who is
// "awake and alert" — giving PO glucose to an obtunded patient is an
// aspiration risk, the same reasoning drugs.js's own oralGlucose.hold()
// already encodes for the player-facing action. A crew-directed dose isn't
// gated through that hold() check, so the rule itself has to encode it.
const AWAKE = (ctx) => ctx.v._cons === "awake";

// ── Batch 3 helpers ─────────────────────────────────────────────────────
// `ctx.v` (physio(patient)'s published vitals) has no pregnancy/seizure
// fields — those live on the real Patient object itself
// (pat._pregnancy, pat.seizing), reached through ctx.s._roster the same
// way physiology.js's own activePatient(s) does. This is real, live state,
// not a reconstruction — same object every crew-task handler and the
// player's own actions read and mutate.
function activePat(ctx) {
  const roster = ctx.s._roster;
  if (!roster || !roster.length) return null;
  return (roster.find((e) => e.id === ctx.s.activePatientId) || roster[0]).patient || null;
}
// TP 1217-P footnote ❽: "≥20 weeks pregnant to 6 weeks postpartum." This
// engine has no gestational-age-at-postpartum tracking once delivered, so
// PREGNANT is a simplification (any patient with an established pregnancy
// object, which every already-shipped pregnancy condition seeds at or
// past viable gestation) rather than a precise week-by-week window.
const PREGNANT = (ctx) => !!activePat(ctx)?._pregnancy;
const DELIVERED = (ctx) => !!activePat(ctx)?._pregnancy?.delivered;
// TP 1217-P step 18/footnote ⓬: eclampsia IS a seizure in a pregnant
// patient by definition (footnote ❿), so pat.seizing — already a real,
// live field (neuro.js's seizure-drive mechanism) — is the honest signal,
// not an invented "eclampsia" flag. `seizing` isn't published to vitals();
// activePat(ctx) reaches it directly, same as the pregnancy fields above.
const ACTIVE_SEIZURE = (ctx) => !!activePat(ctx)?.seizing;
// TP 1217-P step 15: the symptom-gated lower threshold ("SBP>=140 AND
// severe headache/blurred vision/upper abdominal pain") can't be
// represented — no headache/vision/abdominal-pain-specific field exists,
// only a whole-body pain scalar unrelated to the symptom this criterion
// actually names. Implemented as the OTHER, symptom-independent branch the
// protocol itself gives ("SBP>=160 or DBP>=110mmHg, regardless of
// symptoms"), which is real and objectively measurable. See the CLAUDE.md
// queue entry filed this batch if a headache/visual-disturbance signal is
// ever built.
const SEVERE_PREECLAMPSIA = (ctx) => PREGNANT(ctx) && (ctx.v.sbp >= 160 || ctx.v.dbp >= 110);
// TP 1219 step 8 / step 9 footnote ❷: `bronch` (broncho, respiratory.js) is
// the same real airway-smooth-muscle-tone field the asthma/COPD rules
// already read elsewhere in this engine — reused here as the wheezing
// signal, not invented for this protocol.
const WHEEZING = (ctx) => ctx.v.bronch >= 0.3;
// TP 1219 footnote ❶: "angioedema, respiratory compromise, or poor
// perfusion" is the real trigger for epinephrine. QUEUE ITEM 61 closed
// half of the proxy gap this comment used to describe in full: v.angioedema
// (patient.js/conditions.js, published to vitals()) is now a real localized
// airway-swelling signal, distinct from the whole-body `edema` field this
// file's own TP 1214 CHF rule deliberately does NOT reuse for this purpose
// (see that rule's own comment) — so a hives-and-tongue-swelling patient
// with normal SBP and SpO2 now matches on the real finding, not just via
// the wheeze+shock/hypoxia route below. The wheeze+shock/hypoxia clause
// stays for the respiratory-compromise/poor-perfusion legs of the same
// footnote, which still have no dedicated non-proxy signal: a wheezing
// asthma patient who is ALSO hypoxic without any allergic trigger would
// still match on that clause alone — this engine has no way to distinguish
// "wheezing from anaphylaxis" from "wheezing from severe asthma" by signal,
// only by which scenario authored the underlying condition.
const ANAPHYLAXIS = (ctx) => (ctx.v.angioedema ?? 0) >= 0.2 || (WHEEZING(ctx) && (SHOCK(ctx) || lowSpo2(ctx)));
// TP 1223 step 4 / TP 1225 step 7: <35C is the standard clinical
// hypothermia cutoff, not a number invented for this file.
const HYPOTHERMIC = (ctx) => ctx.v.temp > 0 && ctx.v.temp < 35;
// TP 1210 step 26 footnote ⓲: "pinpoint pupils... but hypoxia during
// cardiac arrest can cause mydriasis instead" — this engine has no
// pupil-diameter mechanism at all (a documented, standing limitation, same
// as AAA's pulsatile mass), so neither sign is representable. The real,
// live, mechanism-grounded signal instead is `pat.respDriveSuppression`
// (pk.js, recomputed every tick from opioid receptor occupancy) — not
// published to vitals(), reached via activePat(ctx) like the pregnancy/
// seizure fields above. A genuine ground-truth proxy for "this patient IS
// opioid-toxic," the same category of signal SHOCK/POOR_PERFUSION already
// are elsewhere in this file, not a guess.
const SUSPECTED_OPIOID = (ctx) => (activePat(ctx)?.respDriveSuppression ?? 0) >= 0.3;

// ── Batch 6 helpers ─────────────────────────────────────────────────────
// TP 1213/1213-P: `rhythm` is real, already-classified engine state
// (cardiovascular.js), not derived here — "svt", "VT" (monomorphic) and
// "torsades" (polymorphic) are all real, distinct string values the engine
// already assigns, the exact distinctions TP 1213's own algorithm branches
// on. `flutter` is folded into the afib bucket (no separate guidance is
// given for it in the received text, and mechanistically both are
// rate-related atrial rhythms in this engine).
const TACHY_SVT = (ctx) => ctx.v.rhythm === "svt";
const TACHY_WCT_REGULAR = (ctx) => ctx.v.rhythm === "VT";
const TACHY_WCT_IRREGULAR = (ctx) => ctx.v.rhythm === "torsades";
// TP 1213 step 5/12/17/19's "poor perfusion WITH ALOC" footnote ❺ — a
// stricter gate than plain SHOCK, since several branches treat "poor
// perfusion, alert" and "poor perfusion, ALOC" differently (alert gets a
// drug tried first; ALOC goes straight to cardioversion).
const POOR_PERF_ALOC = (ctx) => SHOCK(ctx) && !AWAKE(ctx);
// The shared trigger for synchronized cardioversion across BOTH SVT (step
// 12, poor perfusion + ALOC) and regular monomorphic WCT (step 16, poor
// perfusion + (ALOC OR adenosine already tried)) — one const so the
// cardioversion rule and the pre-cardioversion sedation rule below can't
// drift out of sync with each other.
const CARDIOVERT_NOW = (ctx) =>
  (TACHY_SVT(ctx) && POOR_PERF_ALOC(ctx)) ||
  (TACHY_WCT_REGULAR(ctx) && SHOCK(ctx) && (!AWAKE(ctx) || gaveDose(ctx, "adenosine")));
// TP 1212 step 8: atropine is skipped in favor of immediate pacing once
// HR<=40 in a 2nd-degree-type-II/3rd-degree block (footnote ❸: "atropine
// is unlikely to produce clinical improvement"). This engine only
// classifies third-degree block as its own distinct rhythm string ("chb");
// second-degree type II has no separate rhythm value (see queue entry
// filed this batch), so the protocol's own explicit numeric fallback
// (HR<=40) is used as the practical trigger for both cases — real,
// objectively measurable, and it's the same number the protocol itself
// gives as the alternative to naming the rhythm.
const PACE_NOW = (ctx) => ctx.v.hr > 0 && ctx.v.hr <= 40;
const BRADYCARDIC = (ctx) => ctx.v.hr > 0 && ctx.v.hr < 60;

// ── Batch 7 helpers ─────────────────────────────────────────────────────
// TP 1216-P: the newborn is a SEPARATE roster patient (physiology.js's
// multi-patient roster, `s._roster`), not necessarily the one `ctx.v` is
// currently reporting on — the same real object `App.jsx`'s new
// `t.neoAction` crewFn branch and the `pph` scenario's own player-facing
// newborn actions already read (`s._roster.find(e=>e.id==="newborn")`).
// Reads the raw Patient property (`.hr`), not the noisier vitals()
// reading, matching the exact idiom `scenarios.js`'s own newborn actions
// already use for the identical field.
function newbornPat(ctx) {
  return ctx.s._roster?.find((e) => e.id === "newborn")?.patient || null;
}
// Step 2: dry/warm/stimulate is the FIRST, most important intervention —
// fires as soon as a newborn exists and hasn't had it done yet, before
// checking heart rate at all (matching the protocol's own step order).
const NEWBORN_UNSTIMULATED = (ctx) => { const nb = newbornPat(ctx); return !!nb && !nb._neo?.stimulated && !nb._neo?.ppv; };
// Step 10: BMV once HR<100 (the protocol's own explicit numeric trigger,
// footnote ❺) and PPV hasn't already started.
const NEWBORN_NEEDS_PPV = (ctx) => { const nb = newbornPat(ctx); return !!nb && nb.hr > 0 && nb.hr < 100 && !nb._neo?.ppv; };
// Step 13: compressions once HR<60 DESPITE ongoing PPV — the same real
// safety ordering the crewFn branch itself also enforces defensively
// (compressions without ventilation first is refused there too, so this
// gate is belt-and-suspenders, not the only thing preventing the wrong
// order).
const NEWBORN_NEEDS_CPR = (ctx) => { const nb = newbornPat(ctx); return !!nb && nb.hr > 0 && nb.hr < 60 && !!nb._neo?.ppv && !nb._neo?.compressions; };
// Step 14: epinephrine once HR<60 DESPITE ongoing compressions (real NRP
// text: "if HR remains <60 despite 60 sec of effective PPV and chest
// compressions"). This engine has no compression-duration timer to check
// the literal "60 sec" against (the same practical compromise
// NEWBORN_NEEDS_CPR already makes for its own timer-free trigger) — the
// real, objective, already-available signal is HR still <60 with
// compressions already running, which is what's checked here.
const NEWBORN_NEEDS_EPI = (ctx) => { const nb = newbornPat(ctx); return !!nb && nb.hr > 0 && nb.hr < 60 && !!nb._neo?.compressions && !nb._neo?.epi; };
// TP 1217/1217-P step 22: "SBP<90, OR HR>SBP, OR EBL>500mL" — the third
// criterion (estimated blood loss) has no representable field (this
// engine tracks current total blood volume, not a running loss estimate
// against a baseline), so only the first two, both real and objectively
// measurable, are implemented. The "within 3 hours post-delivery" window
// is not separately gated — DELIVERED(ctx) alone is used, since nothing
// in this engine tracks time-since-delivery on the mother's own pregnancy
// object (only the newborn's `_neo.deliveredAt` does, a different patient
// object from the one this rule reads).
const SHOCK_INDEX_HIGH = (ctx) => ctx.v.hr > 0 && ctx.v.sbp > 0 && ctx.v.hr > ctx.v.sbp;

// ── Batch 8 helper ──────────────────────────────────────────────────────
// TP 1237 step 18: `pat.ptx` (patient.js) is a real, already-published
// vitals() field, and cardiovascular.js's own tension-physiology term
// (`if (pat.ptx === "tptx") itp += 18`) confirms "tptx" is the real,
// already-meaningful string for TENSION pneumothorax specifically —
// distinct from a simple, non-tension pneumothorax, which this rule
// deliberately does NOT trigger decompression for (needle decompression
// for a non-tension PTX is not indicated).
const TENSION_PTX = (ctx) => ctx.v.ptx === "tptx";

// ── Batch 9 helper ──────────────────────────────────────────────────────
// TP 1240's own footnote ❶/❷: SEVERE nerve-agent exposure is "severe
// respiratory distress, respiratory arrest, cyanosis... seizures,
// unconsciousness" — apnoea, an active seizure, and spo2<90 are all real,
// objective, already-available signals for exactly that tier. MILD/
// MODERATE (miosis, rhinorrhea, increased salivation) has no representable
// signal — no secretions/pupil-diameter mechanism exists in this engine —
// so only SEVERE gets an automatic rule; see the CLAUDE.md queue entry
// filed this batch.
const NERVE_AGENT_SEVERE = (ctx) => apnoeic(ctx) || ACTIVE_SEIZURE(ctx) || (ctx.v.spo2 > 0 && ctx.v.spo2 < 90);
// TP 1242 step 15 / footnote ❾: "within 3 hours of injury, uncontrolled
// extremity hemorrhage despite pressure and tourniquets" — a tourniquet
// having actually been applied (`s.done`'s own `tq@<limb>` keys, the same
// ones the `tq` TASKS entry stamps) plus ongoing poor perfusion is the
// real, available signal for "tourniquet placed and it isn't controlling
// this."
const TOURNIQUET_APPLIED = (ctx) => Object.keys(ctx.s.done || {}).some((k) => k.startsWith("tq@"));

// ── Batch 11 helpers ────────────────────────────────────────────────────
// TP 1244 footnote ❾/⓫: "traumatic brain injury presents with altered
// mental status after head injury" — `pat.brainInjury` (neuro.js) is a
// real, live, already-verified structural-injury accumulator (0 = none,
// nonzero = genuine damage accruing) this file had never read before.
// Reached via activePat(ctx) like the pregnancy/seizure/opioid fields
// above, since it isn't published to vitals().
const SUSPECTED_TBI = (ctx) => (activePat(ctx)?.brainInjury ?? 0) > 0;
// TP 1244 footnote ❺: a simple/open pneumothorax (`ptx==="ptx"`) is real,
// distinct engine state from tension (`"tptx"`) — the SAME field
// `TENSION_PTX` above reads, one severity step earlier. This is the real
// trigger for the chest-seal step, not tension itself (needle
// decompression, not a dressing, is the tension-pneumothorax treatment —
// already correctly separate, `respDistressNeedleD`).
const OPEN_PTX = (ctx) => ctx.v.ptx === "ptx";
// TP 1244 step 16/footnote ❼: TXA is for genuine active hemorrhage, not
// bare hypotension of any cause — `pat.activeBleedRate` (the same
// mass-conserving hemorrhage signal every trauma condition in this engine
// already uses) is the real, specific signal, deliberately narrower than
// plain SHOCK/SHOCK_INDEX_HIGH alone (a septic or cardiogenic-shock
// patient with no active bleed should not get an antifibrinolytic).
const ACTIVE_HEMORRHAGE = (ctx) => (activePat(ctx)?.activeBleedRate ?? 0) > 0;
// TP 1244 steps 18/25/26 (pain management, both multi-system trauma and
// isolated extremity injury): a real, general pain>=4 trigger, reusing
// TP 1211's own threshold rather than inventing a second one.
const GENERIC_PAIN = (ctx) => ctx.v.pain >= 4;

export default {
  id: "la_county", name: "LA County Protocols",
  rules: [
    // ── Immediate life threats — outrank every protocol-specific step ──
    { id: "airway", when: soiledAir, task: "suction", note: "clear the soiled airway first" },
    { id: "cpr", when: pulseless, task: "cpr", note: "no pulse — compressions" },
    { id: "vent", when: apnoeic, task: "bvm", note: "inadequate breathing — bag them" },

    // ── TP 1202/1202-P, General Medical, steps 1-7 (the ABC/monitoring
    //    baseline every other LA County protocol builds on) ──
    // Step 3: "Administer Oxygen prn" — gated on the county's own <94%
    // abnormal-vitals threshold (TP 1200.4), not the more severe <90%
    // `hypoxic` several other rules use, and only once ventilation itself
    // is adequate (apnoeic already owns the airway above).
    { id: "o2", when: (ctx) => !apnoeic(ctx) && lowSpo2(ctx), task: "o2", note: "SpO2 under 94 — high-flow oxygen" },
    // Step 5: "Initiate cardiac monitoring prn"
    { id: "monitor", when: notMonitored, task: "monitor", note: "get them on the monitor" },
    { id: "leads", when: noLeads, task: "leads", note: "leads on, twelve-lead" },
    // Step 7: "Establish vascular access prn" — TP 1203 needs a real IV
    // for dextrose, so this fires for that concrete case now; a broader
    // "prn" IV rule waits for a protocol that states its own criteria
    // (Shock/Hypotension, Cardiac Chest Pain, etc.) rather than guessing.
    { id: "iv", when: (ctx) => HYPOGLYCEMIC(ctx) && !HAS_IV(ctx), task: "iv", note: "line for dextrose" },
    { id: "vitals", when: noVitals, task: "vitals", note: "full set of vitals" },

    // ── TP 1203/1203-P, Diabetic Emergencies ──
    // Step 6: "Check blood glucose" — the real-world trigger for pulling
    // the glucometer is an unclear altered mental status (TP 1200.3's own
    // "ALOC – Not Hypoglycemia or Seizure" guideline: rule hypoglycemia out
    // first), not a blind check on every patient.
    { id: "glucoseCheck", when: (ctx) => altered(ctx) && !ctx.s.done?.gluc, task: "glucoseCheck", note: "rule out hypoglycemia" },
    // Step 7: oral glucose if awake and alert...
    { id: "oralGlucose", when: (ctx) => HYPOGLYCEMIC(ctx) && AWAKE(ctx), task: "oralGlucose", note: "glucose <60, awake — oral glucose" },
    // ...OR Dextrose 10% IV/IO if a line is in...
    { id: "dextrose", when: (ctx) => HYPOGLYCEMIC(ctx) && HAS_IV(ctx), task: "dextrose", note: "glucose <60 — D10 IV" },
    // ...OR, per the protocol's own fallback, Glucagon IM if venous access
    // cannot be obtained and the patient isn't awake enough for PO glucose.
    { id: "glucagonIM", when: (ctx) => HYPOGLYCEMIC(ctx) && !AWAKE(ctx) && !HAS_IV(ctx), task: "glucagonIM", note: "glucose <60, no line, not awake — glucagon IM" },
    // Step 8: severe/HIGH hyperglycemia gets a rapid 1L saline infusion.
    // QUEUE ITEM 68's audit (CLAUDE.md): this rule had NO doseCount gate at
    // all — a real, more severe defect than the wrong-number caps found
    // elsewhere in this file, since `evaluateProtocol` re-recommends a rule
    // every time its own `when` still reads true and the task isn't
    // CURRENTLY running (engine.js's own `running` set only excludes tasks
    // in progress, not ones already completed) — so as long as glucose
    // stayed >=400, this rule would keep re-offering `salineBolus`
    // indefinitely, with nothing capping the total volume delivered. Fixed
    // to the same "1L = 2 administrations of the 500mL `saline` entry"
    // basis every sibling saline rule in this file now uses.
    { id: "salineBolus", when: (ctx) => SEVERE_HYPERGLYCEMIC(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "glucose >=400 — rapid saline infusion" },

    // ── TP 1202/1203, nausea/vomiting step (both protocols share the
    //    identical "Ondansetron 4mg ODT/IV/IM" line) ──
    // No live "nauseated" signal exists in this engine yet — `s.vomited`
    // is the one real, already-tracked proxy (they've already vomited, so
    // an antiemetic is indicated), rather than inventing a field.
    { id: "ondansetron", when: (ctx) => !!ctx.s.vomited, task: "ondansetron", note: "vomiting — ondansetron" },

    // ── TP 1210, Cardiac Arrest — outranks the routine ABC/monitor block
    //    above for a pulseless patient. `cpr`/`vent` (top of file) already
    //    cover steps 3-4; this is the rest of steps 6-19, exactly as far as
    //    the source text went (cut off mid-step-22 — see the header note). ──
    // Step 8: defibrillate immediately once a shockable rhythm is confirmed.
    // Pads have to be on before a shock can be delivered.
    { id: "arrestPads", when: (ctx) => SHOCKABLE(ctx) && !ctx.s.done?.pads, task: "applyPads", note: "shockable rhythm — pads on" },
    { id: "arrestDefib", when: SHOCKABLE, task: "defibrillate", note: "shockable rhythm — defibrillate" },
    // Step 9: vascular access, IO if delayed — this engine has no separate
    // IO-vs-IV distinction on the `iv` task, so it reuses the same task.
    { id: "ivArrest", when: (ctx) => pulseless(ctx) && !HAS_IV(ctx), task: "iv", note: "arrest — vascular access" },
    // Step 10: epinephrine only AFTER the second defibrillation for a
    // shockable rhythm...
    { id: "epiVF", when: (ctx) => SHOCKABLE(ctx) && doseCount(ctx, "defib") >= 2 && doseCount(ctx, "epiIV") < 3, task: "epiArrest", note: "post-shock x2 — epinephrine" },
    // ...but as early as possible for asystole/PEA (step 13).
    { id: "epiAsystolePEA", when: (ctx) => NONSHOCKABLE_ARREST(ctx) && doseCount(ctx, "epiIV") < 3, task: "epiArrest", note: "asystole/PEA — epinephrine early" },
    // Step 12: amiodarone 300mg after the third defibrillation for
    // refractory/recurrent VF/VT — a real, single administration now that
    // the repeat dose has its own entry (see arrestAmiodaroneRepeat below;
    // this fixes the earlier batch's approximation, which capped at TWO
    // 300mg doses and overshot the protocol's own 450mg total ceiling).
    { id: "arrestAmiodarone", when: (ctx) => SHOCKABLE(ctx) && doseCount(ctx, "defib") >= 3 && doseCount(ctx, "amiodarone") < 1, task: "amiodarone", note: "refractory VF/VT — amiodarone" },
    // Step 12 cont.: the real repeat — 150mg (drugs.js's new `amiodarone2`
    // entry), after TWO MORE defibrillations beyond the third (>=5 total)
    // and only once the initial 300mg dose has actually been given.
    { id: "arrestAmiodaroneRepeat", when: (ctx) => SHOCKABLE(ctx) && doseCount(ctx, "defib") >= 5 && gaveDose(ctx, "amiodarone") && doseCount(ctx, "amiodarone2") < 1, task: "amiodaroneRepeat", note: "refractory VF/VT after further defib x2 — amiodarone repeat, 150mg" },
    // Step 15: 1L saline, repeat x1, for any cardiac arrest — a real 2L
    // total target. QUEUE ITEM 68's audit (CLAUDE.md): this cap was <2 (one
    // administration's worth of headroom short of even this rule's OWN
    // stated 1L target, let alone the stated repeat) — `saline` (drugs.js)
    // is 500mL per administration, so "1L + repeat x1" needs 4
    // administrations, not 2. Fixed to the real target rather than left
    // under-delivering.
    { id: "saline_arrest", when: (ctx) => pulseless(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "arrest — fluid" },
    // Step 16: calcium chloride + sodium bicarbonate for arrest with
    // suspected hyperkalemia (e.g. renal failure).
    { id: "arrestCalcium", when: (ctx) => pulseless(ctx) && SEVERE_HYPERK(ctx) && doseCount(ctx, "calcium") < 1, task: "calciumChloride", note: "arrest, suspected hyperkalemia — calcium" },
    { id: "arrestBicarb", when: (ctx) => pulseless(ctx) && SEVERE_HYPERK(ctx) && doseCount(ctx, "bicarb") < 1, task: "sodiumBicarb", note: "arrest, suspected hyperkalemia — bicarb" },
    // Step 19: post-ROSC hypotension (SBP<90, pulse present) — fluid first,
    // push-dose epi if fluid alone doesn't hold the pressure. Checked
    // against queue item 68's audit and deliberately LEFT AT <1: unlike its
    // siblings below, this step's own source text says only "fluid," with
    // no quoted liter target to reconcile against — inventing a number here
    // would be exactly what section 4's "identify numbers, do not tune
    // them" discipline forbids.
    { id: "saline_rosc", when: (ctx) => !pulseless(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 1, task: "salineBolus", note: "post-ROSC hypotension — fluid" },
    { id: "pushEpi_rosc", when: (ctx) => !pulseless(ctx) && SHOCK(ctx) && gaveDose(ctx, "saline"), task: "pushEpi", note: "post-ROSC hypotension refractory to fluid — push-dose epi" },
    // Step 25: post-ROSC glucose — reuses the existing `dextrose`/
    // `HYPOGLYCEMIC` rule above unchanged; drugs.js's `d10` entry ("125 mL,
    // max:2") already matches this step's own "125mL, repeat once for a
    // total of 250mL" exactly, confirmed by reading the drug definition
    // before assuming a mismatch — no new rule needed.
    // Step 26: naloxone for suspected narcotic overdose. `naloxone_iv`'s
    // own declared dose (0.4mg/administration, the general-purpose EMT/
    // AEMT reversal entry) is smaller than the arrest-specific 2-4mg this
    // step names — capping at 4 doses here delivers 1.6mg cumulative,
    // conservative relative to the protocol's own 8mg ceiling rather than
    // matching it exactly. Reusing the existing entry rather than adding a
    // third naloxone tier in this batch; see the CLAUDE.md queue entry
    // filed this batch if the higher arrest-specific dose is ever wanted.
    { id: "arrestNaloxone", when: (ctx) => pulseless(ctx) && SUSPECTED_OPIOID(ctx) && doseCount(ctx, "naloxone_iv") < 4, task: "naloxoneArrest", note: "suspected narcotic overdose — naloxone" },
    // Steps 22-24 need no new rules — each already composes for free off
    // rules elsewhere in this file: step 23 (resume CPR on re-arrest) is
    // the `pulseless -> cpr` life-threat rule at the very top, which
    // re-fires automatically the instant a ROSC patient loses pulse again;
    // step 24 (12-lead) is the existing `noLeads -> leads` rule, which
    // doesn't care whether the call is pre- or post-arrest. Step 7
    // (pregnant arrest — uterine displacement during compressions) likewise
    // already composes via TP 1217-P's own `pregnancyPositioning` rule
    // above, which isn't gated on pulse. Steps 11 (ECPR/scene-time),
    // 17 (termination of resuscitation), 20-21 (advanced airway,
    // stretcher-head elevation) and 27 (public-health notification) are
    // transport/documentation/logistics decisions with no drug or
    // procedure to direct a crew member toward — genuinely out of scope
    // for a crew-direction engine, not gaps.

    // ── TP 1207/1207-P, Shock/Hypotension ──
    // Step 2: high-flow O2 for ANY patient in shock, regardless of SpO2 —
    // a real, more aggressive trigger than the general <94% rule above.
    { id: "o2Shock", when: (ctx) => !apnoeic(ctx) && SHOCK(ctx), task: "o2", note: "shock — high-flow O2 regardless of SpO2" },
    // Step 4: vascular access, large bore preferred (not representable —
    // this engine has one generic IV site, not a catheter-gauge choice).
    { id: "ivShock", when: (ctx) => SHOCK(ctx) && !HAS_IV(ctx), task: "iv", note: "shock — vascular access" },
    // Step 6: keep the patient warm — reuses the real, already-shipped
    // `warm` procedure (Active warming, procedures.js), which feeds
    // thermo.js's heat balance for real, not a decorative log line.
    { id: "warmShock", when: SHOCK, task: "warmBlanket", note: "shock — keep warm" },
    // Step 8: 1L saline for shock, independent of the sepsis-specific rule
    // above (a non-septic shock patient — e.g. cardiogenic — still gets it).
    // QUEUE ITEM 68's audit (CLAUDE.md): was capped at <1 (500mL) against
    // this step's own stated "1L" — `saline` (drugs.js) is 500mL per
    // administration, so a genuine "1L" target needs 2 administrations, not
    // 1. Fixed. `tbiSaline` (TP 1244, below) is deliberately calibrated
    // relative to THIS cap ("looser... so a TBI patient gets genuine
    // escalation past the generic shock rule's own stopping point") — its
    // own cap was doubled in the same pass so that relationship still holds.
    // QUEUE ITEM 69: excludes ACTIVE_HEMORRHAGE — a multi-system trauma
    // patient with genuine active bleeding gets the smaller, permissive-
    // hypotension `traumaMinorSaline` rule (TP 1244, below) instead of this
    // full 500mL/1L generic rule; without this exclusion both would fire
    // on the same patient and double the fluid this protocol's own
    // footnote specifically warns against.
    { id: "saline_shock", when: (ctx) => SHOCK(ctx) && !ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "shock — rapid saline infusion" },
    // Step 11: push-dose epinephrine once poor perfusion persists despite
    // the initial fluid bolus (or fluid had to be stopped for pulmonary
    // edema — not separately representable here, so gated on "fluid given,
    // perfusion still poor").
    { id: "pushEpi_shock", when: (ctx) => SHOCK(ctx) && POOR_PERFUSION(ctx) && gaveDose(ctx, "saline"), task: "pushEpi", note: "poor perfusion despite fluid — push-dose epinephrine" },

    // ── TP 1204/1204-P, Fever/Sepsis ──
    // Step 6: suspected sepsis (tactile fever, tachycardia, OR poor
    // perfusion) gets a 1L rapid saline infusion and documentation as
    // Sepsis. Ordered after the Shock-protocol saline rule above so an
    // already-shocky septic patient's fluid is credited to Shock's own,
    // more urgent framing first; this rule still fires for a septic
    // patient who isn't yet frankly hypotensive.
    // QUEUE ITEM 68's audit (CLAUDE.md): was capped at <1 (500mL) against
    // this step's own stated "1L rapid saline infusion" — fixed to the
    // real 2-administration target, the same fix applied to every sibling
    // "1L" saline rule in this file.
    { id: "saline_sepsis", when: (ctx) => (ctx.v.temp >= 38 || ctx.v.hr > 100 || POOR_PERFUSION(ctx)) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "suspected sepsis — rapid saline infusion" },
    // Step 8: fever WITHOUT sepsis/poor-perfusion signs gets passive
    // cooling instead. Queue item 55: now a genuinely separate, milder
    // mechanism (procedures.js's `passiveCooling`, 100W) rather than
    // reusing heat stroke's own aggressive ice-pack/misting protocol.
    { id: "feverCooling", when: (ctx) => ctx.v.temp >= 38 && ctx.v.hr <= 100 && !POOR_PERFUSION(ctx), task: "passiveCoolingTask", note: "fever without sepsis — passive cooling" },

    // ── TP 1205/1205-P, GI/GU Emergencies ──
    // Step 5: poor perfusion gets the same 1L saline rapid infusion.
    // QUEUE ITEM 68's audit (CLAUDE.md): was capped at <1 (500mL) against
    // this step's own stated "1L" — fixed to the real 2-administration
    // target. `pphSaline` (TP 1211-P, below) composes cumulatively ON TOP
    // of this rule's own doseCount (both gate on the same shared "saline"
    // dose id), so its own cap was recomputed in the same pass to preserve
    // its "1L from here, plus an additional real allowance" intent rather
    // than silently becoming a no-op once this rule's own ceiling moved.
    // QUEUE ITEM 69: excludes ACTIVE_HEMORRHAGE for the same reason
    // `saline_shock` above does — a genuinely actively-bleeding patient
    // (this signal is not trauma-specific; a GI bleed can trip it too)
    // gets the smaller `traumaMinorSaline` rule's conservative volume
    // instead of stacking a second full-size bolus on top of it.
    { id: "saline_gigu", when: (ctx) => POOR_PERFUSION(ctx) && !ACTIVE_HEMORRHAGE(ctx) && doseCount(ctx, "saline") < 2, task: "salineBolus", note: "poor perfusion — rapid saline infusion" },

    // ── TP 1209/1209-P (Behavioral/Psychiatric Crisis) step, TP 1222/
    //    1222-P (Hyperthermia, Environmental) step 4/6, and TP 1225/1225-P
    //    (Submersion, via TP 1222's own decompression-adjacent framing) all
    //    share the identical trigger — suspected hyperthermia (temp
    //    >39C/102F) gets cooling measures, reusing the real `activeCooling`
    //    procedure. One shared rule rather than three duplicates naming the
    //    same task, matching this file's own TP1204/1207 saline precedent. ──
    { id: "hyperthermiaCooling", when: (ctx) => ctx.v.temp > 39, task: "activeCoolingTask", note: "suspected hyperthermia — cooling measures" },

    // ── TP 1209/1209-P, Behavioral/Psychiatric Crisis, real algorithm
    //    (queue items 51/52) ──
    // ctx.v.agitation (0-1, neuro.js's updateCerebral — see that function's
    // own header comment for the full mechanism) is the real severity this
    // protocol's own drug-administration steps need. This engine has no
    // independent way to represent "cooperative" vs. "uncooperative" — that
    // is a judgement call about the specific patient interaction, not a
    // simulated physiological state — so severity itself is used as an
    // honest, stated proxy: a moderately agitated patient (still capable of
    // safely taking an oral tablet) gets olanzapine ODT first-line, matching
    // the real clinical preference for an oral route when a patient can
    // still cooperate with one (Project BETA psychopharmacology guidelines
    // for agitation, West J Emerg Med 2012); once agitation is severe enough
    // that oral cooperation is no longer plausible, the faster-acting
    // parenteral midazolam route is used instead. Neither rule gates on a
    // literal restraint flag — this engine has no restraint mechanic, and
    // excitedDeliriumAgitated's own resolve() text already frames this
    // deliberately as a medical crisis to be TREATED, not a restraint
    // problem to be solved physically.
    { id: "agitationOlanzapine", when: (ctx) => (ctx.v.agitation || 0) >= 0.3 && (ctx.v.agitation || 0) < 0.65 && doseCount(ctx, "olanzapine") < 1, task: "olanzapineOdt", note: "agitated, cooperative enough for an oral tablet — olanzapine ODT" },
    // Capped at 3 (under midazolam's own drugs.js max:4) — this file's own
    // source text for this specific step's repeat-dose ceiling was not in
    // hand when this rule was written, so a conservative cap consistent
    // with this file's other sub-ceilings under a drug's global max (e.g.
    // eclampsiaMidazolam's own cap of 2) is used rather than guessed higher.
    { id: "agitationMidazolam", when: (ctx) => (ctx.v.agitation || 0) >= 0.65 && doseCount(ctx, "midazolam") < 3, task: "midazolamAgitation", note: "severe agitation, uncooperative — midazolam, titrated to effect" },

    // ── TP 1217-P, Pregnancy Complication ──
    // Step 16/23: recovery position or left uterine displacement — for any
    // pregnant patient, not just during a seizure or arrest, matching the
    // protocol's own broad framing ("place patient in recovery position or
    // displace the uterus leftward"). Composes for free with the arrest
    // rules above (a pulseless pregnant patient still matches this).
    { id: "pregnancyPositioning", when: (ctx) => PREGNANT(ctx) && !DELIVERED(ctx), task: "leftTilt", note: "pregnant — left lateral tilt / uterine displacement" },
    // Step 15/17: preeclampsia (severe range) or eclampsia (a seizure in a
    // pregnant patient) both get magnesium sulfate. Footnote ❿'s "even if
    // their seizure has stopped" can't be perfectly represented — there's
    // no persistent "this patient had an eclamptic seizure this call" flag
    // — but in practice the seizure's own underlying elevated-pressure
    // substrate (SEVERE_PREECLAMPSIA) usually still reads true afterward,
    // and magnesium's own drugs.js `max:1` means this only needs to catch
    // the first administration, not sustain across the whole call.
    { id: "eclampsiaMagnesium", when: (ctx) => PREGNANT(ctx) && (SEVERE_PREECLAMPSIA(ctx) || ACTIVE_SEIZURE(ctx)), task: "magnesiumSulfate", note: "preeclampsia/eclampsia criteria met — magnesium sulfate" },
    // Step 18: midazolam ONLY for active, ongoing seizure — not preeclampsia
    // alone, and not a seizure that has already stopped (footnote ⓬: most
    // eclamptic seizures self-terminate and midazolam raises real airway
    // risk in this population). Capped at 2 doses (10mg total, the
    // protocol's own pre-base-contact ceiling — half of midazolam's own
    // drugs.js max:4).
    { id: "eclampsiaMidazolam", when: (ctx) => PREGNANT(ctx) && ACTIVE_SEIZURE(ctx) && doseCount(ctx, "midazolam") < 2, task: "midazolamSeizure", note: "active eclamptic seizure — midazolam" },
    // Step 19-21: postpartum hemorrhage. Fundal massage first (the real,
    // mechanism-backed uterotonic — see procedures.js's own fundalMassage,
    // queue item 9), independent of perfusion status, exactly as the
    // protocol lists it as its own unconditional first step. Saline is
    // gated on poor perfusion; the generic `saline_gigu` rule above already
    // gives the first liter (now 2 administrations, fixed by the same
    // queue-item-68 pass) to any poor-perfusion patient including this one
    // — this rule's own cap has to be HIGHER than `saline_gigu`'s, since
    // `doseCount` is cumulative across every rule sharing the "saline" dose
    // id (engine.js), not per-rule, so a cap equal to or below the sibling
    // rule's own ceiling would silently become a no-op.
    //
    // QUEUE ITEM 68's audit (CLAUDE.md): this rule's cap was <2 — which, at
    // the time it was written, WAS one dose of headroom past `saline_gigu`'s
    // OLD <1 cap (total 2 = 1L), but represented only 500mL of "additional"
    // volume against this protocol's own stated "additional 20mL/kg"
    // allowance — real, but a substantial understatement (20mL/kg for a
    // ~70kg adult, the flat reference weight this file's own protocols
    // already use elsewhere for adult dosing, is ~1.4L, closer to 1.5L than
    // 1L at 500mL-per-dose granularity). Recomputed to the real total: 1L
    // from `saline_gigu` (now 2 administrations) + ~1.5L additional (3 more
    // administrations) = 5 total.
    { id: "pphFundalMassage", when: DELIVERED, task: "fundalMassage", note: "postpartum — fundal massage" },
    { id: "pphSaline", when: (ctx) => DELIVERED(ctx) && POOR_PERFUSION(ctx) && doseCount(ctx, "saline") < 5, task: "salineBolus", note: "postpartum hemorrhage, poor perfusion — rapid saline infusion" },

    // ── TP 1219/1219-P, Allergy/Anaphylaxis ──
    // Step 4/5: epinephrine IM is first-line, repeatable, capped at 3 doses
    // total per the protocol's own explicit ceiling.
    { id: "anaphEpi", when: (ctx) => ANAPHYLAXIS(ctx) && doseCount(ctx, "epiIM") < 3, task: "epiIM", note: "anaphylaxis — epinephrine IM" },
    // Step 8: albuterol IN ADDITION TO epi IM if wheezing persists (footnote
    // ❷) — this engine can't distinguish "wheezing that's already been
    // treated with epi and persists" from "wheezing," so this fires
    // alongside anaphEpi rather than strictly after it; both are real,
    // correct interventions for the same finding regardless of order.
    { id: "anaphAlbuterol", when: (ctx) => WHEEZING(ctx) && doseCount(ctx, "albuterol") < 3, task: "albuterolNeb", note: "wheezing — albuterol" },
    // Step 10/footnote ❹: diphenhydramine is a late adjunct, "once other
    // treatments are complete", for itching/hives. Queue item 58 built the
    // real isolated-skin signal this previously had no way to detect
    // (pat.urticaria, published as v.urticaria) — still gated on epi already
    // given for a WHEEZING/anaphylaxis presentation (matching footnote ❹'s
    // ordering), but now ALSO fires for a real Grade-1 hives-only patient
    // (v.urticaria present, no wheeze, so there is no "other treatment" to
    // wait on) rather than being unreachable for that presentation.
    { id: "anaphDiphen", when: (ctx) => !gaveDose(ctx, "diphen") && ((gaveDose(ctx, "epiIM")) || (ctx.v.urticaria >= 0.15 && !WHEEZING(ctx))), task: "diphenhydramine", note: "itching/hives — diphenhydramine" },
    // Step 6-7's poor-perfusion saline and step 7's push-dose epi both reuse
    // the generic `saline_gigu`/`pushEpi_shock` rules already in this file
    // (POOR_PERFUSION-gated, not anaphylaxis-specific) — TP 1207's own
    // "treat in conjunction with Shock/Hypotension" cross-reference means
    // this is intentional reuse, not a missing rule.

    // ── TP 1223/1223-P, Hypothermia/Cold Injury ──
    // Step 4: warming measures for confirmed hypothermia (<35C) —
    // independent of the existing SHOCK-gated `warmShock` rule above, since
    // a hypothermic patient needs warming whether or not they're also in
    // shock. Also the real mechanism behind TP 1210's own "initiate
    // rewarming while resuscitation is ongoing" for hypothermic arrest and
    // TP 1225's cold-water-drowning rewarming — both compose for free here
    // since this rule doesn't check pulse.
    { id: "hypothermiaWarming", when: HYPOTHERMIC, task: "warmBlanket", note: "hypothermia — warming measures" },

    // ── TP 1231/1231-P, Seizure ──
    // Step 6: midazolam for ANY active, EMS-witnessed seizure — the general
    // case TP 1217-P's `eclampsiaMidazolam` rule above is the
    // pregnancy-specific instance of. Both target the same task; whichever
    // fires first in a given cycle is claimed, the other is a no-op for
    // that cycle (this file's own established multi-rule-one-task pattern,
    // e.g. the saline rules). Capped at 4 doses (20mg all-routes, the
    // protocol's own outer ceiling after base contact) rather than
    // `eclampsiaMidazolam`'s narrower 2-dose pre-base-contact cap, since
    // this rule has no pregnancy-specific airway-risk caveat (footnote ⓬)
    // to justify stopping earlier.
    { id: "seizureMidazolam", when: (ctx) => ACTIVE_SEIZURE(ctx) && doseCount(ctx, "midazolam") < 4, task: "midazolamSeizure", note: "active seizure — midazolam" },
    // Step 9's glucose check reuses the existing `glucoseCheck`/
    // `HYPOGLYCEMIC`/`SEVERE_HYPERGLYCEMIC` rules above (already gated on
    // altered mental status generically) rather than a seizure-specific
    // duplicate.

    // ── TP 1232/1232-P, Stroke/CVA/TIA ──
    // QUEUE ITEM 62, RESOLVED. A generic crew-directable assessment-task
    // wrapper (`t.assessId`, App.jsx's crewFn) and `gear.js`'s own
    // `assessStroke` (assessId:"strokeScreen", reusing `actions.js`'s real
    // player-facing FAST/Cincinnati screen and its real `pat.strokeWeakness`/
    // `strokeAphasia`/`strokeSide` fields) were both already built in an
    // earlier "Crew AI batch" — confirmed by reading the tree, not assumed
    // stale (lesson 16). What was still missing, and is the actual remainder
    // of this queue item: no PROTOCOL RULE ever directed a crew member to
    // run it — every `assessId`-based task in this file's TASKS list was a
    // player-assignable button nobody automatically called for. Gated on
    // the same `altered` signal TP 1229/1230/1235's own "no new rules"
    // reasoning already treats as the general ALOC/neuro-complaint trigger
    // (real field practice: FAST screening is applied broadly to any new
    // altered-mentation presentation, not narrowly pre-filtered to
    // already-confirmed stroke, which is what the screen exists to
    // determine). `ctx.s.done?.strokeScreen` (not `doseCount`/`gaveDose`,
    // which only read `s.doses` — an assessId task's completion is tracked
    // in `s.done` by App.jsx's own crewFn, a different ledger) makes this a
    // real once-per-call gate, not a repeat-every-tick order.
    { id: "strokeScreenCrew", when: (ctx) => altered(ctx) && !ctx.s.done?.strokeScreen, task: "assessStroke", note: "altered mentation — FAST/Cincinnati stroke screen" },

    // ── TP 1236/1236-P, Inhalation Injury — COMPLETE as of a later batch
    //    (the source text's own steps 1-18, in full; the earlier "cut off
    //    mid-step-12" note in this file's header is now resolved). Steps
    //    12-18, received later, needed no further new rules: step 12
    //    (nebulized epinephrine for airway edema/stridor) has no drug
    //    entry — the same gap already filed for TP 1234's identical step,
    //    not re-filed here; steps 15-18 (monitor, 12-lead, IV, poor-
    //    perfusion saline) all reuse the generic rules already in this
    //    file, same as every other protocol's identical baseline steps. ──
    // Step 13: albuterol for wheezing/bronchospasm reuses TP 1219's own
    // `WHEEZING`/`anaphAlbuterol` rule above — genuinely the same finding,
    // same drug, same route. That rule's 3-dose cap already matches this
    // protocol's own 15mg (3 x 5mg) ceiling exactly, so no duplicate rule
    // is needed.
    // Step 14: CPAP for an alert patient with moderate/severe respiratory
    // distress, held for hypotension (the protocol's own explicit
    // contraindication) — WHEEZING or lowSpo2 stands in for "moderate or
    // severe respiratory distress" (no distress-severity scale exists
    // beyond these two real signals).
    { id: "inhalationCpap", when: (ctx) => AWAKE(ctx) && !SHOCK(ctx) && (WHEEZING(ctx) || lowSpo2(ctx)), task: "cpapTask", note: "respiratory distress, alert, no shock — CPAP" },
    // Step 6/18: high-flow O2 "regardless of SpO2" for smoke/CO exposure,
    // and poor-perfusion saline, both reuse the generic `o2`/`saline_gigu`
    // rules above — no smoke-exposure-specific field exists to gate a
    // stricter, SpO2-independent O2 rule on (see the CLAUDE.md queue entry
    // filed this batch), so this protocol's O2 coverage is the ordinary
    // <94%-triggered rule, not a perfect match to "regardless of SpO2."

    // ── TP 1211, Cardiac Chest Pain ──
    // Step 5: aspirin for any alert chest-pain patient. `ctx.v.pain` is the
    // one real, already-published whole-body pain signal — not chest-pain
    // specific, but every scenario that authors chest pain as this
    // patient's presentation drives it through the same field, so a
    // moderate-or-worse pain reading is the honest proxy available.
    { id: "aspirinChestPain", when: (ctx) => AWAKE(ctx) && ctx.v.pain >= 4 && doseCount(ctx, "aspirin") < 1, task: "aspirinTask", note: "chest pain, alert — aspirin" },
    // Step 6: nitro, repeat q5min x2 (3 total) — the rule itself enforces
    // the SBP<100 hold, since a crew-directed dose bypasses drugs.js's own
    // `hold()` (that check only gates the PLAYER's manual action).
    { id: "nitroChestPain", when: (ctx) => ctx.v.pain >= 4 && ctx.v.sbp >= 100 && doseCount(ctx, "nitro") < 3, task: "nitroTask", note: "chest pain, SBP>=100 — nitroglycerin" },
    // Step 8: fentanyl (see gear.js's own note on picking one of the two
    // interchangeable opioids) once nitro has been tried or is
    // contraindicated (SBP<100) and pain persists.
    { id: "fentanylChestPain", when: (ctx) => ctx.v.pain >= 4 && (gaveDose(ctx, "nitro") || ctx.v.sbp < 100) && doseCount(ctx, "fentanyl") < 1, task: "fentanylPain", note: "persistent chest pain after/instead of nitro — fentanyl" },
    // Steps 3/7/9/10 (12-lead, vascular access, ondansetron, poor-perfusion
    // saline) all reuse the generic `leads`/`iv`/`ondansetron`/
    // `saline_gigu` rules already in this file — no duplicates needed.

    // ── TP 1212/1212-P, Cardiac Dysrhythmia — Bradycardia ──
    // Step 7: suspected hyperkalemia gets calcium (repeat x1 = 2 total) and
    // continuous albuterol — "repeat continuously until hospital arrival"
    // is the one place in this whole file where the SOURCE TEXT itself
    // calls for an uncapped repeat, so leaving `albuterolBrady` uncapped
    // here is a deliberate, protocol-matched choice, not an oversight (see
    // the CLAUDE.md queue entry on the crew-dose-max-bypass gap — this is
    // the one rule in the file where that gap's absence of a cap is
    // actually correct behavior, not a latent risk).
    { id: "bradyCalcium", when: (ctx) => BRADYCARDIC(ctx) && !pulseless(ctx) && SEVERE_HYPERK(ctx) && doseCount(ctx, "calcium") < 2, task: "calciumChloride", note: "bradycardia, suspected hyperkalemia — calcium" },
    { id: "bradyAlbuterol", when: (ctx) => BRADYCARDIC(ctx) && !pulseless(ctx) && SEVERE_HYPERK(ctx), task: "albuterolNeb", note: "bradycardia, suspected hyperkalemia — continuous albuterol" },
    { id: "bradyBicarb", when: (ctx) => BRADYCARDIC(ctx) && !pulseless(ctx) && SEVERE_HYPERK(ctx) && doseCount(ctx, "bicarb") < 1, task: "sodiumBicarb", note: "bradycardia, suspected hyperkalemia — bicarb" },
    // Step 8: atropine for poor perfusion, UNLESS HR<=40 (2nd-degree-II/
    // 3rd-degree territory per PACE_NOW's own comment above), where the
    // protocol says go straight to pacing instead. Capped at 3 doses
    // (3mg), matching both the protocol's own ceiling and atropine's own
    // drugs.js `max:3`.
    { id: "bradyAtropine", when: (ctx) => !pulseless(ctx) && POOR_PERFUSION(ctx) && BRADYCARDIC(ctx) && !PACE_NOW(ctx) && doseCount(ctx, "atropine") < 3, task: "atropineTask", note: "bradycardia, poor perfusion — atropine" },
    // Step 9: TCP for HR<=40 with continued poor perfusion — either
    // immediately (bypassing atropine, PACE_NOW) or once atropine alone
    // hasn't helped (still poor perfusion after an atropine dose).
    { id: "bradyPacing", when: (ctx) => !pulseless(ctx) && POOR_PERFUSION(ctx) && BRADYCARDIC(ctx) && (PACE_NOW(ctx) || gaveDose(ctx, "atropine")), task: "pacingTask", note: "bradycardia, HR<=40 or refractory to atropine — transcutaneous pacing" },
    // Step 9 cont.: sedation for an awake patient before/during pacing.
    // Reuses the same `midazolamSeizure` task TP 1217-P/1231 already use —
    // one real drugs.js drug, one TASKS entry, several clinically distinct
    // triggers (this file's established pattern). Capped at 2 doses
    // (10mg pre-base-contact ceiling, same reasoning as
    // `eclampsiaMidazolam`).
    { id: "bradyPacingSedation", when: (ctx) => !pulseless(ctx) && POOR_PERFUSION(ctx) && BRADYCARDIC(ctx) && AWAKE(ctx) && (PACE_NOW(ctx) || gaveDose(ctx, "atropine")) && doseCount(ctx, "midazolam") < 2, task: "midazolamSeizure", note: "sedation before/during pacing" },
    // Step 11: saline/push-dose epi for persistent poor perfusion after
    // TCP reuse the generic `saline_gigu`/`pushEpi_shock` rules already in
    // this file — both already fire for any poor-perfusion patient
    // regardless of cause. Step 12 (suspected overdose -> TP 1241) and
    // step 13 (ondansetron) are, respectively, a not-yet-received protocol
    // and an existing generic reuse.

    // ── TP 1213/1213-P, Cardiac Dysrhythmia — Tachycardia ──
    // Step 10/11: adenosine for SVT, repeat x1 (2 total) — same cap
    // regardless of whether perfusion is adequate or poor-but-alert, since
    // the protocol gives the identical drug/dose/cap in both branches
    // (steps 10 and 11 differ only in what happens AFTER a failed
    // adenosine trial, not in the adenosine step itself).
    { id: "svtAdenosine", when: (ctx) => TACHY_SVT(ctx) && AWAKE(ctx) && doseCount(ctx, "adenosine") < 2, task: "adenosineTask", note: "SVT — adenosine" },
    // Step 15/16: adenosine for regular monomorphic WCT — real per
    // footnote ❼ (AHA guidance: may be a supraventricular rhythm with
    // aberrancy, adenosine can convert it). Same 2-dose cap, same AWAKE
    // gate as SVT above.
    { id: "wctAdenosine", when: (ctx) => TACHY_WCT_REGULAR(ctx) && AWAKE(ctx) && doseCount(ctx, "adenosine") < 2, task: "adenosineTask", note: "regular monomorphic WCT — adenosine" },
    // Step 12/17: synchronized cardioversion for SVT or regular monomorphic
    // WCT once CARDIOVERT_NOW's own criteria are met (poor perfusion + ALOC
    // for SVT; poor perfusion + (ALOC or adenosine already failed) for
    // WCT). Capped at 3 (initial + repeat x2, the protocol's own ceiling).
    { id: "tachyCardioversion", when: (ctx) => CARDIOVERT_NOW(ctx) && doseCount(ctx, "cardiovert") < 3, task: "cardiovertTask", note: "poor perfusion, tachydysrhythmia — synchronized cardioversion" },
    // Sedation before cardioversion — same shared task/cap idiom as
    // bradycardia's pacing sedation above.
    { id: "tachySedation", when: (ctx) => CARDIOVERT_NOW(ctx) && AWAKE(ctx) && doseCount(ctx, "midazolam") < 2, task: "midazolamSeizure", note: "sedation before cardioversion" },
    // Steps 18-19, irregular WCT (torsades/polymorphic VT): the protocol's
    // OWN footnote ⓼ overrides its body text here — polymorphic VT "cannot
    // be synchronized reliably" and AHA guidelines call for IMMEDIATE
    // UNSYNCHRONIZED shock (defibrillation), not the synchronized
    // cardioversion the numbered steps literally say. Reuses the real,
    // already-shipped `defibrillate` task from TP 1210 rather than
    // `cardiovertTask`, following the clinically-correct footnote over the
    // less precise body text. Capped at 3 (matching the "repeat x2"
    // ceiling every other cardioversion/defib rule in this file uses).
    { id: "wctIrregularShock", when: (ctx) => TACHY_WCT_IRREGULAR(ctx) && SHOCK(ctx) && doseCount(ctx, "defib") < 3, task: "defibrillate", note: "polymorphic WCT, poor perfusion — unsynchronized shock (cannot reliably synchronize)" },
    // Atrial fibrillation (steps 13-14) deliberately gets no treatment
    // rule — see the header comment's own note. Sinus tachycardia (steps
    // 8-9) needs no new rule either: its own saline-for-poor-perfusion step
    // reuses the generic `saline_gigu` rule already in this file.

    // ── TP 1214, Pulmonary Edema/CHF ──
    // Step 4: CPAP for an alert, non-shocky patient — reuses the same
    // `cpapTask` TP 1236 already established, gated on the field this
    // protocol is actually ABOUT (pulmonary edema, `ctx.v.edema`) rather
    // than the wheeze/hypoxia proxy TP 1236 needed — this is the one
    // context in this file where reusing the general `edema` field is
    // exactly correct, not a mismatch (contrast queue item 61's own
    // deliberate refusal to reuse `edema` for airway swelling).
    { id: "chfCpap", when: (ctx) => AWAKE(ctx) && !SHOCK(ctx) && ctx.v.edema >= 0.3, task: "cpapTask", note: "pulmonary edema, alert, SBP>=90 — CPAP" },
    // Step 6/8: chest-pain workup and nitroglycerin both reuse TP 1211's
    // own `aspirinChestPain`/`nitroChestPain`/`fentanylChestPain` rules
    // above unchanged — the drug/dose/cap this engine can represent is
    // identical regardless of which protocol's chest-pain criterion fired
    // it (TP 1214's own SBP-tiered escalating nitro dose, 0.4/0.8/1.2mg,
    // isn't representable against a single flat-dose `nitro` entry — see
    // the CLAUDE.md queue entry filed this batch).
    // Step 9: albuterol if wheezing despite CPAP reuses TP 1219/1236's own
    // `WHEEZING`-gated `anaphAlbuterol` rule — same finding, same drug.
    // Step 10 (respiratory failure/shock -> TP 1207) reuses the generic
    // shock rules already in this file.

    // ── TP 1215/1215-P, Childbirth (Mother) — no new rules. Step 4
    //    (positioning) and step 10 (fundal massage)/step 11 (poor-perfusion
    //    saline) are, respectively, `pregnancyPositioning` and
    //    `pphFundalMassage`/`pphSaline` — all built in batch 3 for TP
    //    1217/1217-P and equally applicable here, since they're gated on
    //    the same real pregnancy/delivery state, not on which protocol is
    //    selected. Steps 5-9 (assist delivery, cut cord, manage placenta)
    //    are the actual physical delivery mechanic, which lives in the
    //    physiology engine's own condition/roster machinery (obstetric.js,
    //    the `_spawnQueue` newborn-spawn system) — not something a crew
    //    member is directed to DO via this file, the same reasoning
    //    already on record for TP 1210's own "steps 11/17/20-21/27 are
    //    logistics, not tasks" note. ──

    // ── TP 1216-P, Newborn/Neonate Resuscitation ──
    { id: "newbornStimulate", when: NEWBORN_UNSTIMULATED, task: "newbornDry", note: "newborn — dry, warm, stimulate" },
    { id: "newbornPPV", when: NEWBORN_NEEDS_PPV, task: "newbornPpv", note: "newborn HR<100 — positive-pressure ventilation" },
    { id: "newbornCPR", when: NEWBORN_NEEDS_CPR, task: "newbornCompressions", note: "newborn HR<60 despite PPV — chest compressions" },
    // Step 14: epinephrine, weight-scaled against the newborn's own weight
    // (gear.js's newbornEpi/App.jsx's t.neoAction==="epi" — queue item 65),
    // not a flat adult dose.
    { id: "newbornEpi", when: NEWBORN_NEEDS_EPI, task: "newbornEpi", note: "newborn HR<60 despite PPV+compressions — weight-scaled epinephrine" },
    // Step 12 (vascular access) and step 15 (saline, for suspected
    // neonatal hypovolemia — a distinct clinical picture from the
    // hypoxic-asphyxia course this state machine models) remain
    // deliberately NOT implemented. See CLAUDE.md queue item 65.

    // ── TP 1217/1217-P, new step 22 (added since this file's batch-3
    //    implementation) ──
    { id: "pphTxa", when: (ctx) => DELIVERED(ctx) && (SHOCK(ctx) || SHOCK_INDEX_HIGH(ctx)) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "postpartum hemorrhage, SBP<90 or HR>SBP — tranexamic acid" },

    // ── TP 1237/1237-P, Respiratory Distress ──
    // Step 18: needle decompression for real tension pneumothorax.
    // One-time (capped at 1 administration — `ptxFix` resolves it, a
    // second decompression on an already-fixed chest has nothing left to
    // treat).
    { id: "respDistressNeedleD", when: (ctx) => TENSION_PTX(ctx) && doseCount(ctx, "needleD") < 1, task: "needleDecompTask", note: "tension pneumothorax — needle decompression" },
    // Step 12: epinephrine IM for bronchospasm deteriorating DESPITE
    // albuterol (i.e., albuterol already tried, still wheezing, and now
    // either poor perfusion or hypoxic) — a real, different trigger from
    // TP 1219's `anaphEpi` (which fires on suspected anaphylaxis, not
    // bronchospasm-that's-failing-first-line-therapy), but reuses the
    // exact same `epiIM` task since the drug/dose/route are identical.
    { id: "respDistressEpi", when: (ctx) => WHEEZING(ctx) && gaveDose(ctx, "albuterol") && (POOR_PERFUSION(ctx) || lowSpo2(ctx)) && doseCount(ctx, "epiIM") < 3, task: "epiIM", note: "bronchospasm deteriorating despite albuterol — epinephrine IM" },
    // Steps 4/8/10/12(CPAP)/13/14/15/16/17 (O2, monitor, dysrhythmia
    // cross-refs, CPAP, vascular access, poor-perfusion saline, sepsis/
    // overdose/inhalation-injury cross-refs) all reuse rules already in
    // this file — `o2`/`o2Shock`, `monitor`/`leads`, `bradyAtropine`-family
    // (TP 1212)/tachy rules (TP 1213), `inhalationCpap` (same AWAKE +
    // !SHOCK + (WHEEZING||lowSpo2) trigger TP 1236 already established),
    // `iv`/`ivShock`, `saline_gigu`, `saline_sepsis`. Step 6 (albuterol for
    // bronchospasm, capped at 3 doses) reuses TP 1219's `anaphAlbuterol`
    // rule unchanged — same finding, same drug, same cap.

    // ── TP 1240/1240-P, HAZMAT ──
    // Steps 14 (severe nerve-agent exposure): DuoDote x3, one after
    // another, immediately. `duodote`'s own drugs.js `max:3` already
    // matches this exactly, so the cap here is redundant-but-explicit
    // rather than load-bearing on its own (matches this file's own
    // discipline of not relying on that max being enforced for crew doses
    // — see the queue entry on that systemic gap).
    { id: "hazmatDuodoteSevere", when: (ctx) => NERVE_AGENT_SEVERE(ctx) && doseCount(ctx, "duodote") < 3, task: "duodoteTask", note: "severe nerve agent exposure — DuoDote" },
    // Step 19/18-P: organophosphate-exposure atropine deliberately reuses
    // TP 1212's own `bradyAtropine` rule and `atropineTask` rather than
    // duplicating it — same drug, same mechanism, and a near-identical
    // real trigger (bradycardia/hypotension/respiratory depression). The
    // protocol's own stated dose here (2mg) is double `atropine`'s own
    // drugs.js entry (1mg), a real, minor, stated approximation — not
    // re-declared as a second drug entry in this batch, unlike
    // amiodarone's own two-tier fix, since the clinical stakes of slightly
    // under-dosing atropine here are far lower than amiodarone's.
    // Mild/moderate nerve-agent exposure (steps 15-17) and cyanide
    // exposure (step 26, `hydroxoTask`) have no automatic rule — see the
    // header comment's own note on why. Radiologic-exposure steps are
    // scene/logistics decisions with nothing to direct a crew member
    // toward.

    // ── TP 1241/1241-P, Overdose/Poisoning/Ingestion ──
    // Step 4: naloxone for a PULSED, apneic/hypoventilating opioid-toxic
    // patient — the non-arrest generalization of TP 1210's own
    // `arrestNaloxone`. Same task, same real `SUSPECTED_OPIOID` signal,
    // same conservative dose-count cap; gated on `apnoeic` (this
    // protocol's own explicit "altered mental status and hypoventilation/
    // apnea" criterion) rather than SHOCK, since opioid toxicity's
    // defining threat is respiratory, not circulatory.
    { id: "odNaloxone", when: (ctx) => !pulseless(ctx) && apnoeic(ctx) && SUSPECTED_OPIOID(ctx) && doseCount(ctx, "naloxone_iv") < 4, task: "naloxoneArrest", note: "opioid toxicity, hypoventilating — naloxone" },
    // Step 15/footnote ❸: calcium for suspected calcium-channel-blocker or
    // beta-blocker overdose — the real, stated clinical trigger
    // (bradycardia WITH hypotension) is genuinely available. Deliberately
    // NOT gated through SEVERE_HYPERK (unrelated mechanism) or through
    // `pulseless`/arrest (a different, already-covered context).
    { id: "odCalcium", when: (ctx) => !pulseless(ctx) && BRADYCARDIC(ctx) && SHOCK(ctx) && doseCount(ctx, "calcium") < 1, task: "calciumChloride", note: "suspected CCB/beta-blocker overdose, bradycardia+hypotension — calcium" },
    // QUEUE ITEM 54, RESOLVED: tricyclic-overdose bicarbonate (same step)
    // now has a real automatic rule. Its real trigger, wide QRS (>0.12s) on
    // the 12-lead — sodium-channel blockade from TCA toxicity — is
    // genuinely distinct from the SEVERE_HYPERK potassium/ECG signal above
    // (SHARED helper, WIDE_QRS, defined near SEVERE_HYPERK), not gated
    // through it: this is the honest reading of the protocol's own text,
    // which ties this step to the QRS finding directly, not to a
    // potassium-driven suspicion of hyperkalemia. Deliberately capped
    // conservatively at a single automatic dose (doseCount<1) rather than
    // guessing a repeat-dose count this batch's source text doesn't state
    // for this specific step — `sodiumBicarb` stays available for manual
    // re-ordering past that, matching this file's own standing precedent
    // (e.g. `odCalcium`) for a real but singly-confirmed trigger.
    { id: "odBicarb", when: (ctx) => !pulseless(ctx) && WIDE_QRS(ctx) && doseCount(ctx, "bicarb") < 1, task: "sodiumBicarb", note: "suspected tricyclic/sodium-channel-blocker toxicity, wide QRS (>0.12s) — bicarb" },
    // Steps 1-3/6-14/16-19 (airway/O2/IV, capnography, respiratory-
    // distress/chest-pain/dysrhythmia/trauma/diabetic cross-refs, poor-
    // perfusion saline, documentation, poison control, refusal-of-care)
    // all reuse rules already in this file or are logistics/documentation
    // with nothing to direct a crew member toward.

    // ── TP 1242/1242-P, Crush Injury/Syndrome ──
    // Step 10/15: calcium/bicarb/albuterol for ECG evidence of
    // hyperkalemia — the exact real `SEVERE_HYPERK` signal TP 1210/1212
    // already use, generalized here to fire regardless of rhythm (crush-
    // syndrome hyperkalemia is a real, independent threat whether or not
    // the patient happens to already be bradycardic — the existing
    // `arrestCalcium`/`bradyCalcium` rules stay correctly scoped to their
    // own contexts, this is a genuine third, broader case). Capped at 2
    // (repeat x1), matching the protocol's own "repeat x1 for persistent
    // ECG abnormalities." Albuterol is uncapped again here — "repeat
    // continuously until hospital arrival" is the same explicit
    // source-text instruction TP 1212's own `bradyAlbuterol` rule already
    // documents as the one deliberate exception to this file's usual
    // dose-cap discipline.
    { id: "crushCalcium", when: (ctx) => !pulseless(ctx) && SEVERE_HYPERK(ctx) && doseCount(ctx, "calcium") < 2, task: "calciumChloride", note: "crush syndrome, ECG evidence of hyperkalemia — calcium" },
    { id: "crushBicarb", when: (ctx) => !pulseless(ctx) && SEVERE_HYPERK(ctx) && doseCount(ctx, "bicarb") < 2, task: "sodiumBicarb", note: "crush syndrome, ECG evidence of hyperkalemia — bicarb" },
    { id: "crushAlbuterol", when: (ctx) => !pulseless(ctx) && SEVERE_HYPERK(ctx), task: "albuterolNeb", note: "crush syndrome, ECG evidence of hyperkalemia — continuous albuterol" },
    // Step 15: TXA for uncontrolled hemorrhage despite a tourniquet
    // already placed — a real, available signal (`s.done`'s own
    // `tq@<limb>` keys) combined with ongoing poor perfusion, reusing the
    // existing `txaTask` from TP 1217's own postpartum-hemorrhage work.
    { id: "crushTxa", when: (ctx) => TOURNIQUET_APPLIED(ctx) && POOR_PERFUSION(ctx) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "uncontrolled hemorrhage despite tourniquet — tranexamic acid" },
    // Prophylactic pre-extrication fluid (step 7) and pre-extrication
    // calcium/bicarb/albuterol/tourniquet timing (step 14) are genuine
    // scene-sequencing decisions — "give this 5 minutes before release of
    // compressive force" has no physiologic trigger to gate on, it's a
    // procedural timing call tied to when extrication is about to happen,
    // which this engine has no representation of. Steps 1-6/8-9/11-13
    // (trauma/airway/O2/SMR cross-refs, monitoring, warming, pain
    // management, nausea) reuse rules already in this file.

    // ── TP 1243/1243-P, Traumatic Arrest ──
    // Steps 3-4 (airway/BVM/O2, chest compressions) reuse the life-threat
    // rules at the very top of this file unchanged — a traumatic arrest is
    // still `pulseless(ctx)`/`apnoeic(ctx)`, the same real signals. Step 5
    // (bilateral needle thoracostomy) reuses `respDistressNeedleD`
    // unchanged — same `TENSION_PTX` signal, same task; see the header
    // comment's own note on why "bilateral" isn't separately
    // representable. Step 7 (defibrillate a shockable rhythm) reuses TP
    // 1210's own `arrestPads`/`arrestDefib` rules unchanged — real VF/VT
    // rhythm classification doesn't distinguish medical from traumatic
    // cardiac arrest, and shouldn't: the defibrillation indication is the
    // same either way. Step 9 (vascular access) reuses the existing
    // `ivArrest` rule unchanged.
    // Step 10: 2L saline, double TP 1210's own arrest-saline target (1L +
    // repeat x1). Reuses the SAME `salineBolus` task as `saline_arrest`
    // (TP 1210) under a genuinely higher cap, matching this file's own
    // established multi-rule-one-task pattern. `saline` (drugs.js) is
    // declared "Normal Saline 500 mL" per administration, so this rule's
    // own real "2L" target needs 4 administrations — <4 was already the
    // CORRECT absolute value against that reality when this rule was
    // written, even though `saline_arrest`'s own sibling cap was wrong at
    // the time (documented then as "inheriting whatever absolute
    // miscalibration it already has," preserving only the 2x RELATIVE
    // relationship rather than the real number).
    //
    // QUEUE ITEM 68's audit (CLAUDE.md) has since fixed `saline_arrest`
    // itself to <4 (its own real "1L + repeat x1" = 2L target) — so this
    // rule's cap needs NO change; it was always the honest absolute value,
    // just pinned to a sibling that hadn't caught up yet. Both rules now
    // independently land on the same real 2L/4-administration total for
    // the same reason (both protocols specify a 2L arrest bolus), which is
    // a real, expected coincidence, not a sign either cap is redundant —
    // `traumaArrestSaline` gates on TRAUMATIC arrest specifically and
    // composes with `saline_arrest`'s own cumulative doseCount the same
    // way every other multi-rule-one-dose-id pair in this file does.
    { id: "traumaArrestSaline", when: (ctx) => pulseless(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "traumatic arrest — 2L rapid saline infusion, two sites if possible" },
    // Step 2 (tourniquet for major bleeding) deliberately has NO automatic
    // rule. `pat.activeBleedRate` is a real, whole-body hemorrhage signal
    // — it says THAT a patient is bleeding significantly, not WHICH limb
    // needs a tourniquet, and this engine has no per-limb-injury field to
    // resolve that. An automatic rule here could only ever guess a limb,
    // which risks directing a tourniquet onto an uninjured one — worse
    // than no automatic rule at all. The existing `tq` task (gear.js,
    // predates this file) remains available for manual crew ordering,
    // where a human can actually see which limb is hurt.

    // ── TP 1244/1244-P, Traumatic Injury ──
    // Step 5/20: high-flow O2 for shock (reuses existing `o2Shock`
    // unchanged) OR suspected TBI (new — real `SUSPECTED_TBI` signal).
    { id: "o2Tbi", when: (ctx) => !apnoeic(ctx) && SUSPECTED_TBI(ctx), task: "o2", note: "suspected traumatic brain injury — high-flow O2" },
    // Step 3 (traumatic arrest -> TP 1243), step 8 (crush -> TP 1242) both
    // reuse rules already in this file (the arrest life-threat rules at
    // the top fire regardless of protocol; TP 1242's own crush rules are
    // gated on real hyperkalemia/tourniquet signals, not a protocol
    // label). Step 4 (SMR), step 6 (unmanageable-airway transport), step 7
    // (HERT activation), step 11 (warm blanket — reuses `warmShock`'s own
    // `warmBlanket` task is SHOCK-gated already, no separate always-on
    // trauma-warming rule was added since nothing in this protocol's text
    // makes warming unconditional the way TP 1223's hypothermia rule is),
    // and step 12 (consider a preceding medical cause) are all scene/
    // judgment calls or reuses, not new rules.

    // MULTI-SYSTEM TRAUMA
    // Step 13 (needle thoracostomy) reuses `respDistressNeedleD`
    // unchanged. Step 14: a vented chest seal for a simple/open
    // pneumothorax — real, previously crew-undirectable mechanism (see
    // the header comment and gear.js's own note on `pat.chestSealApplied`).
    { id: "traumaChestSeal", when: (ctx) => OPEN_PTX(ctx) && !gaveDose(ctx, "chestSeal"), task: "chestSealTask", note: "open/sucking chest wound — vented chest seal" },
    // Step 15: permissive hypotension — a SMALLER 250mL bolus for
    // suspected internal hemorrhage in multi-system trauma (queue item 69,
    // CLAUDE.md), now real: `salineMinor` (drugs.js) is a genuine
    // half-volume fluid entry, distinct from `saline`'s own 500mL and
    // tracked under its own `doseCount("salineMinor")` pool so the two can
    // never be confused. Gated on the SAME `ACTIVE_HEMORRHAGE` signal
    // `traumaTxa` below already uses to identify genuine active bleeding —
    // that signal existed and was correctly scoped for TXA, but nothing
    // used it to also redirect FLUID VOLUME, which is this protocol's own
    // actual footnote ❻/❽ point. `saline_shock`/`saline_gigu` (above, the
    // TP 1207/1205 generic shock rules) now explicitly exclude
    // `ACTIVE_HEMORRHAGE` so this patient gets ONLY the conservative
    // volume, not both — see those rules' own updated `when` clauses.
    // No liter figure/repeat-count is quoted in this protocol's own text
    // for the 250mL case beyond "a bolus" (per section 4's "identify
    // numbers, do not invent them" discipline) — capped at <4 (1L via
    // four 250mL boluses) as a real, conservative ceiling that stays
    // genuinely smaller in per-dose volume than `saline_shock`'s own 1L
    // full-size target, matching this rule's whole clinical point.
    // Gated on SHOCK||POOR_PERFUSION, not SHOCK alone: saline_gigu's own
    // POOR_PERFUSION-only gate is ALSO excluded from firing on an
    // ACTIVE_HEMORRHAGE patient above, so a compensated (poor-perfusion-
    // but-not-yet-frankly-shocked) bleeding patient must still land HERE
    // for the conservative dose rather than falling through both rules
    // and getting no fluid at all.
    { id: "traumaMinorSaline", when: (ctx) => ACTIVE_HEMORRHAGE(ctx) && (SHOCK(ctx) || POOR_PERFUSION(ctx)) && doseCount(ctx, "salineMinor") < 4, task: "salineMinorTask", note: "multi-system trauma, active hemorrhage — permissive hypotension, 250mL saline" },
    // Step 16: TXA for genuine active hemorrhage with shock or a high shock
    // index — narrower than TP 1217/1242's own TXA rules on purpose (see
    // `ACTIVE_HEMORRHAGE`'s own comment).
    { id: "traumaTxa", when: (ctx) => ACTIVE_HEMORRHAGE(ctx) && (SHOCK(ctx) || SHOCK_INDEX_HIGH(ctx)) && doseCount(ctx, "txa") < 1, task: "txaTask", note: "active hemorrhage, SBP<90 or HR>SBP — tranexamic acid" },
    // Step 17 (eviscerated-organ dressing) has no mechanism to hook —
    // narrative wound care, not a physiologic consequence this engine
    // tracks. Step 18/19: pain management and nausea. Nausea reuses the
    // generic `ondansetron` rule unchanged.
    { id: "traumaPain", when: (ctx) => GENERIC_PAIN(ctx) && doseCount(ctx, "fentanyl") < 5, task: "fentanylPain", note: "pain, multi-system trauma — fentanyl" },

    // ISOLATED HEAD INJURY
    // Step 21: saline for SBP<=90 — DELIBERATELY MORE aggressive than the
    // multi-system-trauma branch above (real, correctly-representable
    // clinical contrast, per footnote ⓫: permissive hypotension is
    // CONTRAINDICATED in suspected TBI, cerebral perfusion pressure needs
    // real volume). Capped looser than `saline_shock`'s own cap so a TBI
    // patient gets genuine escalation past the generic shock rule's own
    // stopping point — since `doseCount` is cumulative across every rule
    // sharing the "saline" dose id (engine.js), this cap has to strictly
    // EXCEED `saline_shock`'s, or it becomes a silent no-op the moment that
    // sibling rule's own ceiling is reached first.
    //
    // QUEUE ITEM 68's audit (CLAUDE.md) fixed `saline_shock` from <1 (its
    // own wrong number against a stated "1L" target) to <2 (the real 1L).
    // This rule's cap is recomputed in the same pass to preserve the
    // "looser, escalated" 2x relationship it was originally built on — no
    // liter figure is quoted in this protocol's own text for the TBI case,
    // so (per section 4's "identify numbers, do not tune them" discipline)
    // the RELATIVE relationship to its sibling is preserved rather than an
    // absolute number invented from nothing: <4 (2L), double `saline_shock`'s
    // new <2 (1L), the same real target `traumaArrestSaline`/`saline_arrest`
    // land on independently for their own, differently-sourced 2L targets.
    { id: "tbiSaline", when: (ctx) => SUSPECTED_TBI(ctx) && SHOCK(ctx) && doseCount(ctx, "saline") < 4, task: "salineBolus", note: "suspected TBI, SBP<=90 — aggressive saline (permissive hypotension contraindicated)" },
    // Step 22 (nausea/22 head-of-gurney elevation/24 seizure->TP1231/25
    // pain): nausea and seizure both reuse existing generic rules
    // (`ondansetron`, `seizureMidazolam`) unchanged; pain reuses
    // `traumaPain` above (same real pain>=4 signal, no TBI-specific
    // duplicate needed). Head-of-gurney elevation: QUEUE ITEM 70, RESOLVED —
    // `pat.headElevated` (procedures.js's `headElevate`) now genuinely lowers
    // `pat.icp` (neuro.js), so this is a real task, not a no-op. `once:1`-shaped
    // (positioning, not a repeatable dose) — fires once per patient.
    { id: "tbiHeadElevate", when: (ctx) => SUSPECTED_TBI(ctx) && !gaveDose(ctx, "headElevate"), task: "headElevateTask", note: "TBI — elevate head of bed 30° to reduce ICP" },

    // ISOLATED EXTREMITY INJURY
    // Step 25 (pain) reuses `traumaPain`. Step 26 (poor-perfusion saline)
    // reuses the generic `saline_gigu` rule unchanged — standard, non-
    // restricted resuscitation is correct here, unlike multi-system
    // trauma's internal-hemorrhage concern. Step 28 (TXA for uncontrolled
    // extremity hemorrhage despite a tourniquet) is EXACTLY TP 1242's own
    // `crushTxa` trigger (tourniquet applied + poor perfusion) — reused
    // outright, no duplicate rule. Step 29 (splinting/traction/amputation
    // care) has the same per-limb-targeting problem as tourniquet
    // placement above — no automatic rule, real procedures (`traction`
    // and friends, procedures.js) remain manual-only.
  ],
};

// Patient — the shared mutable state object every organ-system module reads and writes.
// This class intentionally has almost no physiology logic of its own: each
// updateX(pat, dt) call below hands the same `this` to a different organ
// module, which is how organ systems keep interacting (cardiovascular reads
// pao2 written by respiratory, renal reads map written by cardiovascular,
// coagulation reads activeBleedRate consumed by metabolic, etc.) while still
// living in separate files.
import { AgeProfile } from "./ageProfile.js";
import { MAX_STEP, MAX_TICK } from "./constants.js";
import { applyProcedures, updateDrugs } from "./pk.js";
import { updateHemorrhage, updateFluidShifts, updateMetabolism } from "./metabolic.js";
import { updateAutonomic, updateVenousReturn, updateCardiovascular, updateRhythm } from "./cardiovascular.js";
import { updateVentilation, updateGasExchange } from "./respiratory.js";
import { updateAcidBase } from "./acidbase.js";
import { updateRenalEndocrine, updateElectrolytes } from "./renal.js";
import { updateTemperature } from "./thermo.js";
import { updateCoagulation } from "./coagulation.js";
import { updateInflammation } from "./inflammation.js";
import { updateOrganInjury, updateCerebral } from "./neuro.js";
import { updateMortality } from "./mortality.js";

export class Patient {
  constructor(base, time) {
    const b = base || {};
    this.sex = b.sex === "female" ? "female" : (b.sex === "male" ? "male" : "male");
    this.ageProfile = new AgeProfile(b.age ?? 35, b.weight ?? null, this.sex, b.height ?? null);
    this.riskFactors = b.riskFactors || {};

    // PER-PATIENT BASELINE VARIABILITY (queue item 50). Real patients of the
    // same age/weight are not mathematical clones of each other — autonomic
    // reflex gain, resting metabolic rate, pain perception and vascular
    // smooth-muscle responsiveness all vary between individuals independent
    // of disease. Seeded once at construction (never touched again — this is
    // a fixed trait, not a live state variable) as a clamped Gaussian-ish
    // draw (sum of two uniforms, cheaper than Box-Muller and close enough for
    // a trait multiplier) centered on 1.0 so every existing scenario's
    // calibration is UNCHANGED in expectation. Each trait is intentionally
    // wired into exactly the coefficient its name describes (see
    // cardiovascular.js/metabolic.js/pk.js) rather than seeded and left
    // unread — section 1's own rule against decorative fields applies to a
    // trait multiplier as much as to any other field. Accepts an explicit
    // override (b.<trait>) so a scenario or a verification script can pin a
    // specific value instead of a random draw, the same idiom `b.blood`/
    // `b.pain` already use above.
    const trait = (override, spread, lo, hi) => {
      if (override != null) return override;
      const gauss = ((Math.random() + Math.random() + Math.random() + Math.random()) - 2) / 2; // ~N(0,~0.29), bounded [-1,1]
      return Math.max(lo, Math.min(hi, 1 + gauss * spread));
    };
    // Baroreflex gain — scales cardiovascular.js's baroGain constant, i.e.
    // how strongly this patient's autonomic nervous system reacts to a given
    // change in arterial pressure. A patient at the low end tachycardias/
    // vasoconstricts less per mmHg of hypotension than one at the high end —
    // real inter-individual variability well documented in baroreflex
    // sensitivity studies (e.g. Parati et al.), not something every patient
    // shares a single value for.
    this.baroreflexGain = trait(b.baroreflexGain, 0.18, 0.7, 1.3);
    // Resting metabolic rate — scales metabolic.js's restVO2 (itself already
    // age/weight-derived via ageProfile.totalVO2()). Real basal metabolic
    // rate varies meaningfully between individuals of identical age/weight/
    // sex (thyroid tone, body composition, genetics) independent of any
    // disease process this engine models explicitly.
    this.metabolicRate = trait(b.metabolicRate, 0.12, 0.85, 1.15);
    // Pain sensitivity — scales how much of this patient's own intrinsicPain
    // (queue item 20) reaches the sympathetic-drive/tachypnea pathways
    // (cardiovascular.js/respiratory.js, via pk.js's drugPain reseed).
    // Deliberately does NOT touch drug analgesic effect size — an opioid's
    // own fx.pain delta is applied afterward, unscaled, the same as before —
    // this only varies how strongly the UNTREATED pain itself drives
    // physiology, matching real documented individual variation in pain
    // response (not just self-reported pain score).
    this.painSensitivity = trait(b.painSensitivity, 0.22, 0.6, 1.4);
    // Vascular reactivity — scales the neural-sympathetic contribution to
    // alpha-adrenergic vascular tone (cardiovascular.js's alphaTone), i.e.
    // how much a given burst of sympathetic outflow actually constricts this
    // patient's vessels. Distinct from baroreflexGain (which governs how
    // MUCH sympathetic outflow a pressure change produces) — this is the
    // downstream vascular smooth-muscle responsiveness to that outflow,
    // real and separately variable (e.g. chronic antihypertensive use,
    // vessel wall composition), stated honestly as a coarse stand-in for
    // that rather than any single cited mechanism.
    this.vascularReactivity = trait(b.vascularReactivity, 0.16, 0.75, 1.25);
    // Renal reserve — scales this.baseGfr (below), independent of any
    // disease this engine models explicitly. Real nephron endowment varies
    // meaningfully between individuals of identical age/weight/sex (e.g.
    // documented ~20-fold variation in nephron number at birth, Bertram et
    // al. 2011) — a real baseline difference in how much functional
    // reserve a patient has before renal injury becomes clinically
    // apparent, distinct from riskFactors.renalDisease's own fixed 0.5x
    // (a diagnosed CHRONIC disease state, not ordinary inter-individual
    // variation).
    this.renalReserve = trait(b.renalReserve, 0.15, 0.8, 1.2);
    // Pulmonary reserve — scales this.compliance/airwayResistance/
    // tissueResistance (below), independent of disease. Real alveolar
    // surface area and lung elastic recoil vary between individuals of
    // identical age/weight (body habitus, prior subclinical lung
    // exposure, genetics) well before any diagnosed respiratory disease —
    // distinct from riskFactors.copd's own fixed multipliers (a diagnosed
    // chronic disease state layered ON TOP of this baseline, same
    // reasoning as renalReserve above).
    this.pulmonaryReserve = trait(b.pulmonaryReserve, 0.12, 0.85, 1.15);

    // Blood & fluid compartments
    const totalBV = this.ageProfile.bloodVolumeL();
    this.totalBloodVol = b.blood ?? totalBV;
    // FROZEN anatomical size baseline (Finding #2). bodyScale must represent
    // fixed anatomy, so it is derived from this once-captured value and never
    // from the LIVE totalBloodVol (which falls during hemorrhage — using it made
    // the whole heart "shrink" as the patient bled, masking shock). We take the
    // larger of the scenario's starting volume and the age/weight-normal volume
    // so an explicitly larger person (e.g. blood: 6) is sized up, while a patient
    // who merely STARTS mildly volume-down isn't sized down below their anatomy.
    this.bodyScaleBaselineL = Math.max(this.totalBloodVol, totalBV);
    this.unstressedVol = 0.35 * totalBV;
    this.stressedVol = Math.max(0, this.totalBloodVol - this.unstressedVol);
    // Hematology from the patient's OWN sex-specific reference (adult female
    // ~13.5 g/dL / 41%, male ~15 / 45%) rather than a single male constant.
    const hctRef = this.ageProfile.normalHct();
    const hbRef = this.ageProfile.normalHb();
    this.rbcVol = this.totalBloodVol * hctRef;
    this.plasmaVol = this.totalBloodVol - this.rbcVol;
    this.rbcMass = this.rbcVol * hbRef * 10 / hctRef; // g Hb
    // Derived, but initialised here so they read correctly before the first
    // update() rather than being undefined on a freshly built patient.
    this.hb = hbRef;
    this.hct = hctRef;
    const TBW = this.ageProfile.weight * 0.6;
    this.intracellularVol = TBW * 2/3;
    this.interstitialVol = TBW * 1/3 - this.plasmaVol;
    if (this.interstitialVol < 2) this.interstitialVol = 2;
    // Resting interstitial volume. Lymphatic drainage is referenced to this, so
    // the interstitium has a set-point to return toward rather than filling
    // without limit.
    this.interstitialVolBaseline = this.interstitialVol;
    this.ivAlbuminMass = this.plasmaVol * 70;
    this.isAlbuminMass = this.interstitialVol * 30;
    this.ivProtein = 70;
    this.isProtein = 30;
    // ENDOTHELIAL BARRIER INTEGRITY. 0 = intact, 1 = maximal injury. Read by
    // updateFluidShifts (metabolic.js), which derives the Starling reflection
    // coefficient and filtration coefficient from it. A general handle, not a
    // per-disease one: preeclampsia, sepsis, burns and anaphylaxis all injure
    // the same barrier and differ only in how fast and how far.
    this.capillaryLeak = 0;
    // BURN TBSA (queue item 56). Total body surface area burned, 0-1
    // fraction (e.g. 0.35 = 35% TBSA), scenario-authored via `patient:` or a
    // burn condition's own `initial` block — the engine never derives this
    // itself, the same "condition declares the lesion, engine derives the
    // consequence" idiom pathogenBurden already uses two lines below.
    // Defaults to 0 (no burn) so every existing patient is unaffected.
    // Read by thermalBurn's own progress() (conditions.js, drives
    // capillaryLeak above ~20% TBSA per Parkland-formula-adjacent
    // capillary-leak physiology) and by updateTemperature (thermo.js, via
    // pat.skinBarrierFn, impaired-barrier heat loss).
    this.burnTbsaFraction = b.burnTbsaFraction ?? 0;
    // QUEUE ITEM 46 — the inflammatory cascade's own SOURCE variable.
    // pat.pathogenBurden (0-1) is the one thing a condition declares: how
    // large an infectious/inflammatory insult this patient is carrying
    // right now (not a rate, a magnitude — the same "declare the lesion,
    // let the engine derive the consequence" idiom riskFactors already
    // uses). pat.cytokineLoad (0-1) is the DERIVED systemic response —
    // inflammation.js relaxes it toward pathogenBurden on a real cytokine-
    // kinetics time constant, so a sudden insult does not produce an
    // instant systemic picture. See inflammation.js for the full mechanism
    // and its consumers (capillaryLeak, metabolicHeatMultiplier,
    // coagulation.js's tissue-factor term). Both default to 0 so a
    // pre-first-tick read is never undefined, and a condition that never
    // touches either sees zero consequence — this is why the cascade is
    // safe to add without re-verifying every already-shipped condition
    // that doesn't opt into it.
    this.pathogenBurden = 0;
    this.cytokineLoad = 0;
    // tricyclicOverdose (queue item 7): condition-owned accumulators that
    // compose alongside pk.js's own reset-and-rederive fields
    // (sodiumChannelBlock/drugInotropy/vagalBlock) at their real consumer
    // sites in cardiovascular.js, rather than writing those fields directly
    // (measured necessary — a condition writing them directly is silently
    // wiped the same tick, see conditions.js's own comment). Defaulted here
    // so a pre-first-tick read is never undefined; tcaInotropyFactor
    // defaults to 1 (a neutral multiplier), the other two to 0.
    this.tcaNaBlock = 0;
    this.tcaInotropyFactor = 1;
    this.tcaVagalBlock = 0;
    // Queue item 67 (organophosphatePoisoning) — a THIRD condition-owned
    // vagal accumulator, same idiom as tcaVagalBlock immediately above and
    // for the same reason: pat.parasympathetic itself is fully recomputed
    // every tick by cardiovascular.js's baroreflex model, so a disease state
    // that needs to genuinely lower it (not just reflexively) needs its own
    // handle, composed alongside vagalBlock/tcaVagalBlock at both of their
    // real consumers (cardiovascular.js's hr formula and updateConduction's
    // effPara). Defaulted here so a pre-first-tick read is never undefined.
    this.cholinergicVagalTone = 0;
    // QUEUE ITEM 7 (cyanidePoisoning, Toxicology) — a generic, 0-1 cellular
    // UTILIZATION-blockade handle, distinct from every other hypoxia
    // mechanism in this engine (all of which act on DELIVERY: caO2, do2,
    // shuntFraction). Cytochrome c oxidase inhibition (cyanide; would also
    // cover hydrogen sulfide or azide if either is ever modeled) stops the
    // electron transport chain regardless of how much oxygen reaches the
    // tissue, so it is read at all three sites in this engine that convert
    // delivered oxygen into usable energy — metabolic.js's actualVO2 ceiling
    // (whole body), cardiovascular.js's usable coronary supply (myocardial
    // ATP), and neuro.js's brainO2 (consciousness and anoxic injury) — each
    // independent of do2/caO2, which stay normal. Condition-owned (like
    // tcaNaBlock above): pk.js never RESETS this field; hydroxocobalamin's
    // fx.cytoBlock applies a one-time reduction to it per dose.
    this.cytochromeBlock = 0;
    // Whole-body oxygen DELIVERY (mL/min), published by metabolic.js every
    // tick. Defaulted here per lesson 2 so a pre-first-tick read is never
    // undefined — scenarioSweep tracks it as a REQUIRED field, and it is the
    // delivery half of the delivery-vs-utilization contrast cytochromeBlock
    // above exists to create.
    this.do2 = 0;
    // QUEUE ITEM 51 — the same "declare the lesion, let the engine derive
    // the observable" idiom as pathogenBurden immediately above, for a
    // completely different axis: psychomotor agitation. pat.agitationBurden
    // (0-1) is the one thing a condition declares (excitedDelirium is the
    // first consumer — conditions.js); pat.agitation (0-1) is the DERIVED,
    // real-time severity neuro.js's updateCerebral composes from it plus
    // sympathetic tone and hypoxia, then lowers with real pharmacologic
    // sedation (pat.sedationDepth). See updateCerebral for the full
    // mechanism. Both default to 0 so a pre-first-tick read is never
    // undefined, and a condition that never touches agitationBurden sees
    // zero consequence from this addition.
    this.agitationBurden = 0;
    this.agitation = 0;
    // LARGE-ARTERY COMPLIANCE, as a multiple of this patient's own normal.
    // 1 = normal artery, below 1 = stiff. Read by the Cao term in
    // cardiovascular.js, which is what sets PULSE pressure (resistance sets
    // mean pressure; these are different lesions and were not separable before).
    this.arterialComplianceFactor = 1;
    this.activeBleedRate = b.bleed ?? 0;
    // LIMB-CIRCULATION queue item (see CLAUDE.md section 6, Phase 1): a
    // static, construction-time-only snapshot of how much of the TOTAL
    // activeBleedRate above is attributable to a wound at each body-map
    // location (armL/armR/legL/legR/torso/abdo/head/neck), built from the
    // same wound-authoring data buildPatient() already sums into `bleed`.
    // Deliberately NOT kept live/recomputed after construction — internal
    // hemorrhage conditions (AAA, GI bleed, ectopic, mesenteric ischemia...)
    // mutate pat.activeBleedRate directly every tick with no location
    // concept at all, and this must never fight or double-count that. Its
    // one real consumer is a location-aware tourniquet application
    // (pk.js's stopsBleed handling): knowing how much of the CURRENT total
    // came from a specific limb's wound is enough to subtract exactly that
    // much, once, without needing to touch or understand whatever else may
    // be independently growing/shrinking the whole-body total.
    this.woundBleedByLocation = b.woundBleedByLocation ?? {};
    this.splenicRBC = 0.2;
    this.venousCompliance = 2.0;
    this.venousResistance = 0.1;

    // Metabolic
    this.glucose = b.glu ?? 100;
    this.bun = 12;

    // Autonomic & receptor tones
    this.sympathetic = 0.3;
    this.parasympathetic = 0.7;
    this.catecholamines = 1.0;
    this.alphaTone = 0;
    this.beta1Tone = 0;
    this.beta2Tone = 0;
    this.vagalBlock = 0;          // atropine effect on HR
    this.venousToneModifier = 1;  // for nitroglycerin
    this.vasodilation = 0;        // arteriolar+venous vasodilation (distributive shock)
    // Uterotonic drive (queue item 9) — oxytocin (pharmacologic) or fundal
    // massage (mechanical) stimulating the postpartum myometrium. Read by
    // obstetric.js::updatePostpartumHemostasis, which raises the achievable
    // uterine-tone ceiling from it rather than writing activeBleedRate
    // directly. Irrelevant (and harmless) on a non-pregnant/non-postpartum
    // patient, exactly like every other reset drug accumulator.
    this.uterotonicDrive = 0;

    // Drug management
    this.drugHr = 0; this.drugSbp = 0; this.drugRr = 0;
    this.drugFio2 = 0.21; this.drugPain = b.pain ?? 0;
    // INTRINSIC PAIN (queue item 20) — the persistent baseline drugPain gets
    // reseeded from every tick, so a condition's `initial:{pain:N}` (or a
    // wound's own bleed/pain aggregation, physiology.js::buildPatient) shows
    // for real the whole call rather than vanishing after tick 1. See
    // pk.js::updateDrugs for the reseed and conditions.js for a condition
    // that raises it over time (appendicitis, on perforation).
    this.intrinsicPain = b.pain ?? 0;
    this.drugInstances = [];
    this.tvDrugOffset = 0;
    // Device/procedure mechanism state. All are recomputed every step by
    // pk.js::updateDrugs; initialised here so a fresh or restored patient reads
    // as "no device in place" rather than undefined.
    this.artificialAirway = 0;      // fraction of anatomic dead space bypassed
    this.artificialAirwayRes = 1;   // multiplier on upper-airway resistance
    // TRACHEOSTOMY (queue item 60, part 2 of 3 — the nebulized-epi slice
    // shipped separately; the FBAO-crew-task slice remains open). A
    // pre-existing surgical airway is a structural PATIENT TRAIT
    // (scenario-authored, like a comorbidity), not a device placed during
    // the call — distinct from artificialAirway above, which pk.js sets
    // live from a during-call procedure (ETT/SGA). A tracheostomy bypasses
    // the upper airway (larynx/pharynx) entirely, so upperAirwayObstruction
    // (croup/epiglottitis's fixed-extrathoracic-narrowing field) correctly
    // has NO effect on a trach patient (respiratory.js reads this to gate
    // that term out) — but the tube itself can become obstructed by
    // secretions, tracked separately by trachObstruction so the two real,
    // opposite consequences of having a tracheostomy (protection from
    // upper-airway swelling, vulnerability to cannula plugging) are both
    // representable at once.
    this.tracheostomy = b.tracheostomy ?? false;
    this.trachObstruction = b.trachObstruction ?? 0;   // 0-1, inner-cannula secretion obstruction
    this.pacerRate = 0;             // demanded rate (bpm) from a transcutaneous pacer
    this.pacerOutput = 0;           // stimulus strength (mA)
    this.pacedCapture = 0;          // 0-1, decided by cardiovascular.js
    this.vagalSurge = 0;            // transient parasympathetic surge (vagal maneuver)
    this.aorticOcclusion = 0;       // fraction of systemic bed excluded (REBOA)
    this.externalWarmingW = 0;      // watts of applied external heat
    this.opioidBlockade = 0;      // naloxone effect
    this.transcellularKShift = 0; // slow K movement
    this.txaEffect = 0;           // persistent TXA effect
    // Within-encounter receptor desensitization / acute tolerance (queue
    // item 45b) -- real values relax toward a class-specific ceiling under
    // active dosing and back toward zero once dosing stops; computed once
    // per tick by pk.js's updateDrugs. Pre-first-tick defaults only.
    this.opioidDesens = 0;
    this.gabaDesens = 0;
    this.beta2Desens = 0;

    // Baseline vitals
    const vit = this.ageProfile.baselineVitals();
    this.hrBase = b.hr ?? vit.hr;
    this.sbpBase = b.sbp ?? vit.sbp;
    this.rrBase = b.rr ?? vit.rr;
    // Ventilation outputs must exist from the moment the patient does. They are
    // otherwise only written by updateVentilation, which cannot run on the tick a
    // patient is created (dt is 0), so anything reading vitals on that first tick
    // -- the monitor on scenario load -- saw `undefined` rather than a number.
    this.rr = this.rrBase;
    // Age/size-scaled, NOT the adult 0.45 L literal that used to be here. That
    // literal was reported verbatim on the first tick of every scenario —
    // including a 15 kg child and a neonate, for whom 450 mL is an impossible
    // breath. (Found by the scenario sweep: max tidal volume was exactly 0.450
    // in all 24 scenarios regardless of patient size, which is the signature of
    // a constant rather than a computation.)
    const resp0 = this.ageProfile.respiratoryParams();
    this.vt = resp0.vt;
    // Alveolar ventilation likewise: zero alveolar ventilation is not a state a
    // living patient is ever in, and it was being shown before the first
    // updateVentilation could run.
    this.va = Math.max(0, (resp0.vt - resp0.deadSpace) * this.rr);
    // Same for the gas-exchange outputs, written only by updateGasExchange.
    this.sao2 = b.spo2 ?? 98;
    this.spo2 = this.sao2;
    this.sbpLeftOffset = b.sbpLeftOffset ?? 0;

    // Respiratory
    this.fio2 = b.fio2 ?? 0.21;
    const resp = this.ageProfile.respiratoryParams();
    this.vtBase = b.tv ?? resp.vt;
    this.deadSpace = resp.deadSpace;
    this.frc = resp.frc;
    this.shuntFraction = b.shunt ?? 0;
    // PULMONARY VASCULAR RESISTANCE MULTIPLIER — real, live field
    // (cardiovascular.js's pvr calculation, `pe`/decompressionIllness's own
    // mechanical-obstruction mechanism) that had no constructor default at
    // all before this session (every consumer read it via `|| 1`, so a
    // patient who never touched it correctly behaved as 1, but the field
    // itself was undefined pre-first-tick — confirmed by grep). Given a
    // real default here, matching every existing consumer's own fallback
    // exactly (a no-op for behavior, but lets scenarioSweep.mjs assert
    // presence/finiteness on it like any other real field).
    this.pulmResistFactor = b.pulmResistFactor ?? 1;
    // FLUID/SECRETIONS SITTING IN THE CONDUCTING AIRWAY (0-1) — physiology
    // queue item 13. Distinct from shuntFraction (blood perfusing UNVENTILATED
    // alveoli, distal, not suctionable) and from edema (interstitial/alveolar
    // flooding, also distal): this is proximal — pharynx, trachea, mainstem
    // bronchi — vomit, blood, secretions or aspirated water sitting in the
    // conducting path itself, which is exactly what a suction catheter can
    // physically remove. Read by respiratory.js (raises airway resistance, and
    // a smaller shunt contribution once fluid reaches deep enough to flood some
    // distal units too); reduced by the suction procedure (pk.js::applyProcedures).
    this.airwayFluid = b.airwayFluid ?? 0;
    // FLUID/BLOOD IN THE PLEURAL SPACE COMPRESSING THE LUNG FROM OUTSIDE
    // (0-1) — pleural effusion, hemothorax. Distinct from airwayFluid (inside
    // the airway lumen) and edema (inside the alveoli/interstitium): this is
    // outside the lung entirely, a restrictive/compressive lesion. Read by
    // respiratory.js (reduces compliance, adds a shunt contribution not
    // relieved by PEEP, since external compression cannot be recruited from
    // the inside).
    this.pleuralEffusion = b.pleuralEffusion ?? 0;
    // UPPER (EXTRATHORACIC) AIRWAY OBSTRUCTION (0-1) — croup, epiglottitis.
    // Deliberately a SEPARATE handle from pat.broncho: bronchospasm is
    // lower-airway smooth muscle, beta-2-responsive (albuterol works);
    // upper airway edema is neither smooth muscle nor beta-2-responsive
    // (albuterol is NOT indicated for croup — a real, important clinical
    // distinction this separation exists to preserve, not collapse into
    // "airway narrowing" generically). Read by respiratory.js — raises
    // inspiratory airway resistance via the same exponential Poiseuille-law
    // shape bronchospasm uses, but is NOT included in the expiratory
    // dynamic-compression term, since fixed extrathoracic obstruction does
    // not produce the same intrathoracic air-trapping bronchospasm does.
    this.upperAirwayObstruction = b.upperAirwayObstruction ?? 0;
    // CARBOXYHEMOGLOBIN FRACTION (0-1) — carbon monoxide poisoning. CO binds
    // hemoglobin with ~200-250x the affinity of O2 (Haldane 1895; cited
    // throughout the CO-poisoning literature, e.g. Weaver, NEJM 2009), so a
    // COHb-bound fraction of hemoglobin is simply unavailable to carry O2 —
    // real functional anemia, distinct from ordinary hypoxemia (a normal
    // PaO2/SaO2 does not mean normal oxygen CONTENT here). Read by
    // metabolic.js (reduces pat.caO2, the real oxygen-content term every
    // organ-perfusion signal in this engine already derives from) and by
    // patient.js's own vitals() (the DISPLAYED pulse-ox reading reads COHb
    // as if it were oxygenated hemoglobin — the actual clinical trap this
    // condition exists to teach: standard two-wavelength pulse oximetry
    // cannot distinguish COHb from O2Hb). Cleared by respiratory.js at a
    // real, FiO2-dependent first-order rate (high-flow O2 competitively
    // displaces CO from Hb).
    this.cohb = b.cohb ?? 0;
    this.broncho = b.bronch ?? 0;
    this.edema = b.edema ?? 0;
    // Isolated cutaneous urticaria/pruritus (queue item 58) — 0-1 severity of
    // histamine-driven skin/mucosal reaction ALONE, distinct from bronch
    // (bronchospasm) and edema (queue item 61 corrected an earlier version of
    // this comment that called `edema` the angioedema field — it is not, see
    // `this.angioedema` below), neither of which fires for a patient who has
    // hives and nothing else. Found missing while implementing TP 1219/
    // 1219-P's diphenhydramine indication: laCounty.js's `anaphDiphen` rule
    // had no isolated-skin signal to gate on and instead gates on
    // epinephrine already given. Real, modest physiologic consequence rather
    // than a decorative field: histamine is the same mediator driving
    // anaphylaxis's own pat.vasodilation term (distributive venodilation),
    // reused here at a MUCH smaller ceiling (see allergicReactionMild in
    // conditions.js) since isolated hives is real but is not systemic
    // anaphylaxis. Read by actions.js's skin exam and reduced by
    // diphenhydramine (pk.js "urticaria" fx prop, drugs.js diphen).
    this.urticaria = b.urticaria ?? 0;
    // ANGIOEDEMA (queue item 61) — 0-1 severity of localized histamine/
    // bradykinin-mediated submucosal swelling of the lips/tongue/pharynx/
    // larynx. Deliberately a SEPARATE field from BOTH `edema` (whole-body/
    // pulmonary — real consumers are pcwp, alveolar compliance/dlco, none of
    // them airway-localized; a CHF patient in pulmonary edema is not having
    // a tongue-swelling airway emergency) and `broncho` (lower-airway smooth
    // muscle, beta-2-responsive). Found while implementing TP 1234/1234-P
    // and TP 1236/1236-P's "visible airway/tongue swelling" step: this
    // engine had `pat.edema` for whole-body fluid and `pat.upperAirwayObstruction`
    // for fixed extrathoracic narrowing (croup/epiglottitis), but nothing
    // that represented anaphylactic angioedema itself, or fed
    // upperAirwayObstruction from it — access.js's own accessDifficulty
    // comment already (inaccurately, until this batch) described `uao` as
    // "croup/epiglottitis/anaphylaxis airway swelling." Anaphylaxis's own
    // progress() (conditions.js) now derives upperAirwayObstruction directly
    // from this field every tick (same Poiseuille-law inspiratory-resistance
    // route respiratory.js already applies to croup/epiglottitis), so
    // worsening or epi-treated angioedema shows up as a real, reversible
    // change in airway resistance and respiratory rate, not a one-way
    // ratchet. Reduced by IM epinephrine (pk.js "angioedema" fx prop,
    // drugs.js epiIM/epiAuto) via the same alpha-1 mucosal-vasoconstriction
    // mechanism that already justifies epi's real-world use in angioedema
    // (distinct from item 60's still-open nebulized-epi-for-stridor gap,
    // which is local topical vasoconstriction for a different presentation).
    this.angioedema = b.angioedema ?? 0;
    // Acute dystonic reaction (queue item 66) — 0-1 severity of involuntary
    // muscle spasm (torticollis/oculogyric crisis/trismus/opisthotonus),
    // distinct from `this.seizing` (a different, already-modeled electrical
    // phenomenon). Found missing while implementing TP 1239/1239-P: dopamine
    // D2-receptor blockade by an antiemetic/antipsychotic (metoclopramide,
    // prochlorperazine-class) disinhibits striatal cholinergic interneurons,
    // producing sustained involuntary contraction — no field anywhere in
    // this engine represented that. Real, modest physiologic consequence
    // rather than a decorative field: sustained spasm is genuinely painful
    // (conditions.js's acuteDystonicReaction drives pat.pain from it, the
    // same intrinsicPain-adjacent idiom envenomation/appendicitis already
    // use for a real-but-non-vital-signs symptom) and read by actions.js's
    // stroke-screen exam, since an acute dystonic reaction is a well-
    // documented FAST-positive stroke mimic in the field differential.
    // Reduced by diphenhydramine's real anticholinergic action (pk.js
    // "dystonia" fx prop, drugs.js diphen) — the SAME drug already treating
    // urticaria above, reused rather than inventing a parallel antidote,
    // since diphenhydramine's H1/anticholinergic activity is the actual
    // first-line treatment for drug-induced dystonia, not a coincidence of
    // engine convenience.
    this.dystonia = b.dystonia ?? 0;
    this.airway = b.airway ?? "clear";
    this.ptx = b.ptx ?? null;
    // Respiratory mechanics scale with body size: lung compliance tracks lung
    // volume (~weight), and small airways carry higher resistance. Without this
    // a neonate breathes at adult tidal volumes and blows off CO2 to alkalosis.
    // Exposed on the patient (queue item 33) so respiratory.js's own
    // "normal" mechanics reference can be individualised to THIS patient's
    // body size instead of a flat 70 kg adult constant — see that file's
    // updateVentilation for why a flat reference was silently forcing every
    // pediatric patient's own healthy anatomy to register as near-maximal
    // disease load.
    const massScale = Math.max(0.03, Math.min(1.3, (this.ageProfile.weight || 70) / 70));
    this.massScale = massScale;
    this.compliance = 0.09 * massScale * this.pulmonaryReserve;
    this.airwayResistance = 2 / Math.max(0.3, Math.sqrt(massScale) * this.pulmonaryReserve);
    // Lung tissue and chest wall also resist airflow (viscoelastic tissue
    // resistance), and in an adult they contribute roughly as much as the airways
    // themselves: total respiratory system resistance is ~3-5 cmH2O/(L/s) against
    // an airway component of only 1-2. Omitting it made every derived time
    // constant about a third of its physiological value, so air trapping,
    // intrinsic PEEP and the work of breathing all came out at the low end of
    // their ranges together. Unlike airway resistance this component is not
    // relieved by bronchodilators — which is part of why a bronchodilator cannot
    // fully normalise the work of breathing in severe disease.
    this.tissueResistance = 2.2 / Math.max(0.3, Math.sqrt(massScale) * this.pulmonaryReserve);
    this.dlco = 1.0;
    if (this.riskFactors.copd) {
      this.compliance *= 1.6;
      this.airwayResistance *= 1.8;
      this.frc *= 1.5;
    }
    if (this.edema > 0.5) this.dlco *= 0.5;
    if (this.riskFactors.fibrosis) this.dlco *= 0.4;
    this.intrinsicPEEP = 0;
    this.endExpiratoryVolume = this.frc;
    // Respiratory muscle fatigue (respiratory.js, pre-existing) — never had
    // a constructor default, only ever set inside updateVentilation's own
    // computation, so it read `undefined` on the very first tick before
    // that function had run once. Found while verifying the neuro batch's
    // reuse of this field for GBS/myasthenia gravis crisis.
    this.respMuscleFatigue = 0;
    // Neuromuscular blockade (pk.js's Hill-equation NMJ receptor occupancy,
    // queue item 40 — rocuroniumOverdose) — the same "no constructor
    // default, reads undefined before updateDrugs has run once" defect as
    // respMuscleFatigue above, found the same way: scenarioSweep.mjs's
    // first-tick presence check, added when this field was first read by a
    // real scenario.
    this.neuromuscularBlock = 0;
    // Sedation depth (pk.js, real direct pharmacologic CNS depression from
    // midazolam/etomidate, distinct from the perfusion-based consciousness
    // pathway) — same "no constructor default, reads undefined before
    // updateDrugs has run once" defect class as the two fields above.
    this.sedationDepth = 0;
    // QUEUE ITEM 52 — same defect class, same fix: pk.js's updateDrugs
    // resets/recomputes this every tick, but a pre-first-tick read (before
    // updateDrugs has run once) needs a real default, not undefined.
    this.antipsychoticEffect = 0;

    // Blood gases & acid‑base
    const ab = this.ageProfile.acidBaseBaseline();
    this.paco2 = ab.paco2;
    this.pao2 = 95;
    this.hco3 = ab.hco3;
    this.lactate = 1.0;
    // Tissue-compartment lactate (queue item 15) — see metabolic.js for the
    // exchange/washout mechanism. Starts equal to serum, same as a resting
    // patient with nothing to wash out.
    this.tissueLactate = 1.0;
    this.ph = ab.ph;
    this.phScale = Math.round(ab.ph * 100);
    this.anionGap = 12;
    // SODIUM AS A CONSERVED MASS. Serum sodium is a CONCENTRATION — it is
    // sodium mass divided by the water it is dissolved in — so it must be
    // derived, never stored as an independent state. Storing it meant losing
    // pure water could not concentrate it, and hyper/hyponatremia, dehydration,
    // SIADH and diabetes insipidus all had to be asserted rather than emerging.
    // naMass is total exchangeable extracellular sodium (mmol); pat.na is
    // recomputed from it each tick in renal.js.
    this.na = 140;
    this.naMass = 140 * (this.plasmaVol + this.interstitialVol);
    this.cl = 102;
    // QUEUE ITEM 44 — the three real strong-ion-difference levers
    // acidbase.js's updateAcidBase() derives hco3/ph from every tick (see
    // that file's header). unmeasuredAnions/clShift are pathological (a
    // healthy patient carries none); sidAdjust carries this patient's own
    // AGE-BASELINE acid-base offset so the very first derived hco3 lands
    // exactly on ab.hco3 above with no discontinuity at tick 1 — solved
    // from updateAcidBase's own formula at construction (na=140, k=4.0
    // default, cl=102, no anion burden): hco3 = 42 + sidAdjust - 18, so
    // sidAdjust = ab.hco3 - 24 (0 for a young adult; a small negative
    // number for an elderly patient, matching ageProfile's own mild
    // age-related renal acid-base decline).
    this.unmeasuredAnions = 0;
    this.clShift = 0;
    this.sidAdjust = ab.hco3 - 24;
    this.dpg = 1.0;

    // Renal & endocrine
    // Resting cardiac output reference, from cardiac index x body surface area
    // (CI 3.2 L/min/m2 is the normal resting value). Used by the pharmacokinetic
    // model as the denominator for hepatic blood flow, so that clearance is
    // scaled against THIS patient's own resting output rather than an adult
    // constant — otherwise every child would read as being in shock liver.
    // Reference cardiac output for organ-clearance scaling (pk.js reads this via
    // organClearanceFactor, where hepatic elimination scales with co/_restCo).
    //
    // The constant was 3.2 L/min/m2 — a normal cardiac index, but NOT the one
    // this engine actually produces. Measured resting cardiac index here is
    // 2.55, 2.49 and 2.64 for a 35y 70kg male, a 30y 65kg female and a 60y 90kg
    // male respectively, so the reference over-stated every patient's resting
    // output by about a quarter and the flow ratio at rest came out at 0.78-0.83
    // instead of 1.0.
    //
    // The consequence was that a HEALTHY patient scored an organ-clearance factor
    // of ~0.86 rather than 1.0, so every PK drug was eliminated roughly 15%
    // slower than intended, all the time. The factor is a ratio of the patient's
    // current output to their own resting output; if the denominator is not the
    // resting output the engine actually settles at, the ratio does not mean what
    // organClearanceFactor's comment says it means.
    //
    // 2.55 is measured from the engine, not chosen: it is the cardiac index this
    // model settles at, and it sits at the low-normal end of the 2.5-4.0
    // physiological range. This makes the factor 1.0 at rest and preserves the
    // intended behaviour — impaired only when output genuinely falls.
    this._restCo = 2.55 * (this.ageProfile.bsa || 1.7);
    this.baseGfr = this.ageProfile.baseGFR() * this.renalReserve;
    if (this.riskFactors.renalDisease) this.baseGfr *= 0.5;
    this.gfr = this.baseGfr;
    this.kExcretion = 1;
    this.k = b.k ?? 4.0;
    // Extracellular potassium MASS (mmol). Concentration is derived from this
    // and the extracellular water each tick (see renal.js).
    this.kMass = this.k * (this.plasmaVol + this.interstitialVol);
    this.ca = 2.4;
    // Serum lithium (mmol/L, queue item 7 — Toxicology: lithiumToxicity).
    // Therapeutic range is a narrow 0.6-1.2; this default sits inside it
    // (a patient with no lithium condition/prescription reads as chemically
    // inert, matching every other drug-level field's own healthy default).
    this.li = b.li ?? 0.8;
    this.adhs = 1;
    // Resting RAAS activity, not maximal. These were both 1 — full activation —
    // which every scenario then had to spend ~30 minutes of simulated time
    // unwinding before the patient reached his own baseline, and which no scene
    // is long enough to complete. A normotensive, euvolemic patient sits near
    // the bottom of the renin range; the regulator raises it when perfusion
    // pressure falls or sympathetic drive rises, which is the point of it.
    this.renin = 0.05;
    this.aldosterone = 0.05;
    this.cortisol = 1;
    // ENDOCRINE PANCREAS (queue item 5's remaining dead-field, this
    // session). pat.insulin/pat.glucagon were set here and never read or
    // written again — glucose regulation ran entirely through direct
    // pat.glucose writes in pk.js. Both are now real: renal.js's
    // updateRenalEndocrine relaxes each toward a glucose-dependent
    // secretion target (the SAME beta-cell/alpha-cell feedback idiom
    // pat.cortisol's own sympathetic-relaxation line two lines below
    // already establishes for a different axis), and BOTH now drive real
    // glucose disposal/production — see that file's own comment for the
    // full mechanism. 1 = baseline (euglycemic) secretion for both, same
    // as before.
    this.insulin = 1;
    this.glucagon = 1;
    // Tissue insulin SENSITIVITY (distinct from secretion) — 1 = normal
    // response to a given insulin level, lowered by conditions with a real
    // insulin-RESISTANT phenotype (diabetesT2/HHS) rather than an
    // insulin-DEFICIENT one (DKA/T1DM, which caps pat.insulin itself
    // instead — see conditions.js's own comments on each).
    this.insulinSensitivity = 1;
    this.afferentConstriction = 0;
    this.atnProgression = 0;

    // Temperature
    this.coreTemp = b.temp ?? 37;
    // AMBIENT TEMPERATURE (queue item 26). thermo.js previously hardcoded the
    // environment at 20 C, which meant no condition or scenario could ever
    // expose a patient to a genuinely hot environment — the whole heat/cold
    // ladder had no way to represent its own trigger. A real, settable field,
    // defaulting to the old hardcoded value so every existing patient is
    // completely unaffected.
    this.ambientTemp = b.ambientTemp ?? 20;
    // DIRECT SOLAR RADIANT LOAD (W), separate from ambient air temperature —
    // standing in full sun adds real radiant heat on top of a hot day, and is
    // the specific thing "move to shade" removes. Ambient air temperature
    // itself does not fall in the shade; only this term does, which is what
    // gives shade a genuine, bounded (not curative) benefit.
    this.solarRadiantW = b.solarRadiantW ?? 0;
    this.inShade = false;
    // SWEAT / EVAPORATIVE COOLING CAPACITY (0-1). 1 = fully functional
    // thermoregulatory sweating; 0 = failed (the defining feature of heat
    // stroke, vs. heat exhaustion's intact-but-overwhelmed sweating — "hot,
    // dry skin" is literally this field reading near 0). Read by thermo.js.
    this.sweatCapacity = b.sweatCapacity ?? 1;
    // METABOLIC RATE MULTIPLIER (endocrine batch, queue items 7/27). 1 =
    // normal. Read by thermo.js's heat-production term — thyroid storm and
    // excited delirium raise it (real hypermetabolism), myxedema coma lowers
    // it (real hypometabolism).
    this.metabolicHeatMultiplier = b.metabolicHeatMultiplier ?? 1;

    // Coagulation
    this.plateletCount = 250;
    this.fibrinogen = 3;
    this.factorII = 100;
    this.factorV = 100;
    this.factorVII = 100;
    this.factorVIII = 100;
    this.factorX = 100;
    this.thrombin = 0;
    this.clotStrength = 1;
    this.coagPct = 100;
    this.plateletActivation = 0;
    this.plasminActivity = 0;

    // Cardiovascular
    this.baseSVR = this.ageProfile.baseSVR();
    this.svr = this.baseSVR;
    this.cvp = 4;
    this.msfp = 7;
    this.vr = 5;
    this.edv = 120;
    this.esv = 50;
    this.sv = 70;
    this.ef = 0.58;
    this.hr = this.hrBase;
    this.co = 5.0;
    this.map = this.ageProfile.baselineMAP();
    this.mapBaseline = this.map;   // age-appropriate resting MAP (coronary/autoreg reference)
    // Baseline (unstressed-pressure) arterial compliance ceiling; the actual
    // working value (pat.arterialCompliance) is now pressure-dependent —
    // see updateCardiovascular's exponential stiffening term, which relaxes
    // toward this ceiling at low pressure and stiffens as MAP rises.
    this.arterialComplianceBase = this.ageProfile.isElderly() ? 0.7 : 1.0;
    this.arterialCompliance = this.arterialComplianceBase;
    this.pp = 40;
    this.sbp = this.sbpBase;
    this.dbp = 80;
    this.coronaryFlow = 1;
    this.contractility = 1;
    this.pvcFrequency = 0;
    // Progressive myocardial pump-function multiplier (1 = normal). Unlike
    // riskFactors.heartFailure (a fixed 0.7x for chronic disease), this is
    // meant to be nudged down in real time by conditions.js as an infarct
    // or failing ventricle actually gets worse over the call — AMI,
    // cardiogenic shock, and CHF all use it instead of reinventing their
    // own contractility hack.
    // Chronic medications the patient already takes. Entries may be a drug id or
    // { id, intervalMin, amount }. Seeded into the PK engine as real past doses
    // (see pk.js) so they act through identical pharmacology to scene drugs.
    this.homeMeds = b.homeMeds ?? [];
    this.contractilityFactor = b.contractilityFactor ?? 1;
    // Disease handle on ACTIVE RELAXATION, symmetric with contractilityFactor
    // above. The engine already lets a disease depress inotropy; diastolic
    // function had no such input, so a disease could describe systolic pump
    // failure but not the impaired relaxation that accompanies it. 1 = normal.
    this.lusitropyFactor = b.lusitropyFactor ?? 1;

    // ---- Closed-loop cardiovascular controller state (see cardiovascular.js) ----
    // Autonomic: neural sympathetic outflow and circulating adrenal
    // catecholamines are now SEPARATE resources with different kinetics.
    this.neuralSymp = 0.25;        // fast baroreflex-driven sympathetic nerve traffic (0..1)
    this.adrenalOutput = 0.0;      // adrenal medullary secretion rate (driven by neuralSymp, lags)
    this.catecholLevel = 1.0;      // circulating catecholamine level, relative to rest (slow)
    this.adrenalReserve = 1.0;     // depletable medullary reserve (replenishes over hours)
    this.baroSetpoint = this.map;  // adapts toward sustained MAP over minutes
    this.prevMap = this.map;       // for baroreceptor dP/dt term
    this.mapRate = 0;              // smoothed dMAP/dt (mmHg/min)

    // Venous side: dynamic compliance + regional reservoirs. Splanchnic bed is
    // mobilized first under sympathetic drive / hemorrhage.
    this.venousCompliance0 = 0.22; // baseline lumped venous compliance (L/mmHg)
    this.splanchnicFrac = 0.33;    // fraction of stressed volume held splanchnically
    this.intrathoracicP = -4;      // mean intrathoracic pressure (mmHg), set from respiration
    this.pericardialEffusion = 0;  // 0..1 — conditions raise this for tamponade (see updateVenousReturn)
    this.pericardialP = 0;         // mmHg; external pressure on the heart from pericardial fluid
    this.cardiacExternalP = -4;    // intrathoracicP + pericardialP; what the ventricle sees for filling

    // Valve lesions (queue item 41's regurgitation/PV-loop batch; consumed
    // by updateValves/updateFullLoopODE, cardiovascular.js). Real, not
    // decorative — aorticStenosisSeverity feeds the added-Ea stenotic term;
    // mitralRegurgFrac/aorticRegurgFrac are the composite (structural +
    // ischemic) regurgitant fraction the PV-loop solver actually consumes;
    // mitralRegurgStructural/aorticRegurgStructural are the structural-only
    // component. All were previously left with no constructor default —
    // undefined on the very first tick, before updateValves' own `?? 0`
    // guard runs — caught by the consolidated scenarioSweep.mjs pass
    // (865 "field is undefined" failures at t=2s across every scenario)
    // after being added to that suite's REQUIRED list without one.
    this.aorticStenosisSeverity = 0;
    this.mitralRegurgFrac = 0;
    this.aorticRegurgFrac = 0;
    this.mitralRegurgStructural = 0;
    this.aorticRegurgStructural = 0;

    // Myocardial energetics: coronary O2 supply vs demand -> ATP -> contractility.
    this.atp = 1.0;                // myocardial high-energy phosphate reserve (0..1)
    this.myoO2Balance = 0;         // instantaneous supply - demand (relative)
    // Fixed flow-limiting coronary lesion (0..1). Expressible directly so an
    // etiology condition can state its own severity (mild CAD vs a critical
    // left-main lesion); falls back to the binary risk-factor default.
    // Hyperlipidemia (queue item 21/23) accelerates atherosclerosis but is not
    // itself the acute event riskFactors.cad represents — additive, not a
    // replacement, so a patient can have HLD alone (a milder, subclinical
    // stenosis), known CAD alone, or both (compounding, the real clinical
    // picture of a longstanding dyslipidemic patient who then has a cardiac
    // event). 0.15 chosen as a genuine but subcritical lesion — well short of
    // riskFactors.cad's own 0.6 "known disease" baseline.
    // Diabetic vascular disease (queue item 21) reuses the same additive
    // slot — accelerated atherosclerosis from endothelial dysfunction/AGEs
    // is a real, distinct mechanism from lipid-driven plaque, but both land
    // on the same anatomical variable, so both compose the same way.
    this.coronaryStenosis = b.coronaryStenosis ??
      ((this.riskFactors.cad ? 0.6 : 0) + (this.riskFactors.hld ? 0.15 : 0) +
       (this.riskFactors.diabeticVascular ? 0.15 : 0));

    // Contractility is now a state variable that CHASES a target with kinetics,
    // rather than snapping. contractility (declared above) holds the live value.
    this.contractilityTarget = 1.0;
    this.lusitropy = 1.0;          // active relaxation quality (0..1), falls with ischemia

    // Ventricular-arterial coupling
    this.ees = 2.3;                // end-systolic elastance (contractility proxy)
    this.ea = 1.33;               // effective arterial elastance
    this.diastolicFraction = 0.6;  // fraction of cycle spent in diastole (falls with HR)
    this.atrialKick = 1.0;         // atrial contribution to filling (lost in AF/VT/junctional)

    // Electrical conduction subsystem
    this.qrsWidth = 0.08;          // s; widens with hyperK / Na-channel block / ischemia
    this.avConduction = 1.0;       // AV nodal conduction (0 = complete block)
    this.prInterval = 0.16;        // s; explicit AV-nodal delay (see updateConduction)
    this.firstDegreeBlock = false; // PR > 0.20s but still conducting
    this.saRate = this.hrBase;     // intrinsic sinus node rate before autonomic modulation

    // Independent arrhythmia substrates — identical electrolytes can yield
    // different rhythms depending on which substrate dominates.
    this.arrhythmia = {
      ischemia: 0,   // reentry around ischemic/scarred tissue -> monomorphic VT, VF
      repol: 0,       // QT prolongation / EAD burden -> torsades
      hyperK: 0,      // membrane depolarisation -> wide QRS -> sine wave -> asystole
      hypoK: 0,       // EAD/DAD from low K/Mg
      triggered: 0,   // catecholamine/Ca-overload triggered activity
      hypoxic: 0,     // hypox/acidotic ventricular irritability
      hypothermic: 0, // cold myocardium reentry (accidentalHypothermia)
    };
    this.scarBurden = this.riskFactors.priorMI ? 0.4 : 0;
    // Two new, narrower ectopy handles (cardiac conditions batch, queue item
    // 7) — deliberately distinct from a.ischemia/a.hyperK/a.triggered/
    // scarBurden, which are all substrate-specific and already spoken for.
    // pat.ectopicFocus models an irritable ventricular focus with no
    // ischemic, electrolyte or catecholaminergic cause (idiopathic PVCs,
    // classically RVOT-origin, StatPearls "Premature Ventricular
    // Contractions" — common in a structurally normal heart) — additive into
    // cardiovascular.js's pvc aggregate the same way scarBurden already is.
    // pat.atrialEctopicFocus is the same idea one chamber up (isolated PACs)
    // and drives an occasional single-tick sinus-rate perturbation rather
    // than a sustained afib jitter — see updateCardiovascular.
    this.ectopicFocus = b.ectopicFocus ?? 0;
    this.atrialEctopicFocus = b.atrialEctopicFocus ?? 0;
    this.mg = 1.0;                 // magnesium (mmol/L), affects repolarisation stability

    // Brain & ICP
    this.icp = 10;
    // Mass effect (neuro batch, queue item 7) — edema/hematoma/tumor volume
    // occupying intracranial space, additive into the icp formula in
    // neuro.js, distinct from brainInjury's own ischemia-driven ICP rise.
    this.icpMassEffect = b.icpMassEffect ?? 0;
    // Focal neurologic deficit (neuro batch, queue items 7/23 — Stroke/CVA).
    // Distinct from the engine's existing GLOBAL consciousness/GCS machinery
    // — a stroke patient can be wide awake with a dense hemiparesis. Read by
    // scenario probes/resolve() (the same established pattern hemothorax's
    // pat.ptx state or digoxinToxicity's avNodalDisease read use) rather than
    // a live UI exam system, since the actual finding (which side, how
    // severe) is fixed per patient at construction, not something that needs
    // a generic re-derivable observable the way an ECG rhythm does.
    this.strokeSide = b.strokeSide ?? null;       // "left" | "right" | null
    this.strokeWeakness = b.strokeWeakness ?? 0;  // 0-1, motor deficit severity
    this.strokeAphasia = b.strokeAphasia ?? false;
    // Floored at 0 (queue item 15): a real cerebral perfusion pressure
    // cannot go negative — at MAP<ICP the cerebral vessels simply collapse
    // and flow stops, it does not reverse. See neuro.js for the per-tick
    // update and the same floor there.
    this.cpp = Math.max(0, this.map - this.icp);
    this.consciousness = "awake";
    this.consciousnessTimer = 0;

    // Rhythm
    this.rhythm = b.rhythm ?? "sinus";
    this.rhythmInstability = 0;
    this.qtInterval = 0.4;
    // ICD magnet suppression (aicdMalfunction, queue item 7) — a persistent
    // boolean flag, same idiom as chestSealApplied/inShade: once a magnet is
    // placed over an implanted device it stays suppressed without needing
    // re-application every tick.
    this.icdSuppressed = false;
    this.icdShockCount = 0;

    // Mortality — see mortality.js. Sticky once set: a mechanism crossing
    // its sustained-duration threshold is not undone by later improvement.
    this.lethalTimers = {};
    this.deathCause = null;
    this.deathStory = null;

    // Organ injury
    this.kidneyInjury = 0;
    // Renal-local oxygen delivery/demand (queue item 42) -- real values are
    // computed every tick by renal.js's updateRenalEndocrine; these are just
    // the pre-first-tick defaults so a field-presence check never reads
    // undefined.
    this.renalDO2 = 1;
    this.renalO2Debt = 0;
    this.seizing = false;        // read by metabolic.js for the VO2 cost of seizure activity
    this.seizureDrive = 0;       // 0-1 probability driver, from drug toxicity
    // Fraction of seizure drive suppressed by an anticonvulsant on board. Set by
    // pk.js each tick from whatever is aboard; read by neuro.js.
    this.anticonvulsant = 0;
    // Was hardcoded to 0, silently dropping any `initial.brainInjury` a
    // condition declared (found via a grep sweep for the same dead-code
    // class as the na/hco3 constructor bug, queue item 32/5). brainInjury is
    // accumulative (neuro.js adds to it every tick, never overwrites it from
    // scratch — see updateOrganInjury), so a dropped seed isn't just a
    // cosmetic first-tick miss: it changes the whole call's trajectory.
    // `polytraumaFall` (initial.brainInjury:0.5) and `polytraumaMoto` (0.4)
    // both declared real starting TBI severity that patient.js was throwing
    // away — both scenarios' pupils probes narrate anisocoria/TBI, but the
    // underlying icp/consciousness/brain-death physiology (neuro.js's
    // pat.icp formula, the unconscious threshold at 0.5, mortality.js's
    // brain-death threshold at 0.6) never reflected it; the patient started
    // every call with a mechanically healthy brain regardless.
    this.brainInjury = b.brainInjury ?? 0;
    this.liverInjury = 0;
    // Hepatic-local oxygen delivery/demand (queue item 42, kidney's own
    // sibling) -- real values computed every tick by neuro.js's
    // updateOrganInjury; pre-first-tick defaults only.
    this.hepaticDO2 = 1;
    this.hepaticO2Debt = 0;
    // Splanchnic (gut) local oxygen delivery/demand + real structural
    // injury (queue item 42, third slice) -- a genuinely new field, not a
    // re-driven existing one; real values computed every tick by neuro.js's
    // updateOrganInjury.
    this.gutDO2 = 1;
    this.gutO2Debt = 0;
    this.gutInjury = 0;
    // Cutaneous (skin) perfusion (queue item 42, fourth slice) -- a live
    // signal only, deliberately no injury accumulator (see neuro.js's
    // comment); real values computed every tick by updateOrganInjury.
    this.skinDO2 = 1;
    // PER-LIMB arterial occlusion/perfusion (queue item 74, Phase 2). Unlike
    // woundBleedByLocation (a static construction-time snapshot), this is a
    // LIVE, mutable per-limb state: 0 = normal arterial inflow, 1 = fully
    // occluded. Two real writers: acuteLimbIschemia's own progress() (its
    // embolic occlusion severity/propagation), and a located
    // tourniquet/REBOA dose (pk.js) which sets 1.0 on its own limb -- the
    // real mechanism BY WHICH a tourniquet stops bleeding (it occludes
    // arterial inflow, not just "bleeding" as an independent fact).
    // limbDO2/limbO2Debt are computed every tick by updateOrganInjury
    // (neuro.js) for all four limbs on every patient, the same
    // always-on pattern kidney/gut/skin already use; limbInjury is the
    // structural, slow-decaying accumulator gated by an ischemic deadband,
    // read by physiology.js's irreversible-injury report.
    this.limbOcclusion = b.limbOcclusion ?? { armL: 0, armR: 0, legL: 0, legR: 0 };
    // COMPARTMENT PRESSURE (queue item 74, Phase 3), mmHg, per limb. Normal
    // resting intracompartmental pressure is near 0-10 mmHg (Whitesides et al.
    // 1975; McQueen & Court-Brown's compartment-pressure-monitoring literature
    // uses the same normal range). Raised by a condition via approach() (the
    // same rising-external-pressure-in-an-enclosed-space idiom
    // pat.pericardialEffusion->pat.pericardialP already uses for tamponade,
    // see cardiovascular.js's updateVenousReturn) and converted there into an
    // occlusion-equivalent, pat.compartmentOcclusion (below) — see that
    // function for the full mechanism and citation for the delta-pressure
    // (diastolic BP - compartment pressure) decision variable.
    this.compartmentPressure = b.compartmentPressure ?? { armL: 0, armR: 0, legL: 0, legR: 0 };
    // COMPARTMENT-SYNDROME-DERIVED OCCLUSION EQUIVALENT (queue item 74,
    // Phase 3), 0..1 per limb, recomputed FRESH every tick from live
    // dbp/compartmentPressure (cardiovascular.js) — deliberately NOT written
    // into pat.limbOcclusion itself. limbOcclusion's existing writers
    // (acuteLimbIschemia's progress(), a located tourniquet dose) each hold
    // their own state and never decrease except through their own explicit
    // mechanism, so composing this live-recomputed term into that SAME field
    // via max() would create a one-way ratchet: any transient dip in dbp
    // (e.g. the cardiovascular ODE's own startup settling transient, MEASURED
    // to briefly touch dbp ~40-54 mmHg in the first ~10s of a fresh patient)
    // would spike this term, get baked permanently into limbOcclusion via
    // max(), and never come back down even after dbp recovers — found by
    // direct measurement (crushSyndrome: occlusion pinned at 0.95 from a
    // 10-second-old transient while dbp sat at a healthy 86-94 mmHg for the
    // next 19+ minutes). Kept in its own field instead; neuro.js's
    // updateOrganInjury composes the two sources via max() only at the point
    // of consumption, so neither source's own state is ever contaminated by
    // the other's transient.
    this.compartmentOcclusion = { armL: 0, armR: 0, legL: 0, legR: 0 };
    this.limbDO2 = { armL: 1, armR: 1, legL: 1, legR: 1 };
    this.limbO2Debt = { armL: 0, armR: 0, legL: 0, legR: 0 };
    this.limbInjury = { armL: 0, armR: 0, legL: 0, legR: 0 };
    // Idiopathic/structural seizure disorder drive and non-hepatic/renal
    // toxic-metabolic confusion (neuro batch, queue item 7) — both read by
    // neuro.js, both a real, held-every-tick condition handle.
    this.epilepticDrive = b.epilepticDrive ?? 0;
    this.metabolicEncephalopathy = b.metabolicEncephalopathy ?? 0;

    // Noise filtering
    this._noise = {
      hr: 0, sbp: 0, dbp: 0, spo2: 0, rr: 0, etco2: 0, k: 0, ph: 0, temp: 0, coag: 0,
      bronch: 0, edema: 0, tv: 0, urticaria: 0
    };

    this.lastUpdate = time;
  }

  // =====================================================================
  //  MAIN UPDATE — walks every organ system in order, each mutating `this`.
  //  Order matters (mirrors physiological causality): procedures/drugs are
  //  applied first, then each 50ms sub-step propagates blood loss -> fluid
  //  shifts -> autonomic tone -> venous return -> pump -> ventilation ->
  //  gas exchange -> metabolism -> renal/endocrine -> electrolytes ->
  //  temperature -> coagulation -> organ injury -> cerebral perfusion ->
  //  rhythm -> mortality (reads everything above, so it runs last).
  // =====================================================================
  update(dt, s) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    // Clamp the advance to the maximum validated tick (see constants.js). A very
    // large dt is a symptom of a paused/backgrounded session, not a request to
    // integrate an hour in one step, and integrating it would leave the closed
    // loop numerically unstable.
    if (dt > MAX_TICK) {
      this._clampedTicks = (this._clampedTicks || 0) + 1;
      dt = MAX_TICK;
    }
    applyProcedures(this, s);
    updateDrugs(this, s, dt);
    let remaining = dt;
    let stepLimit = MAX_STEP;
    while (remaining > 0) {
      const step = Math.min(stepLimit, remaining);
      // Snapshot EVERY numeric field on the patient, not a hand-curated
      // subset (queue item 31 — see the removed GUARDED_FIELDS comment in
      // constants.js for the full history of why a curated list kept
      // regenerating new gaps). A bad substep can leave non-finite state
      // ANYWHERE downstream of whatever first diverged (map -> renal K/GFR/
      // RAAS, map -> ICP/CPP, cardiac output -> lactate/energyFailure...),
      // computed by a module that runs later in this same substep pass
      // before the finiteness check below ever gets a chance to roll
      // anything back. Objects/arrays/strings (riskFactors, arrhythmia,
      // drugInstances, rhythm, ptx, ...) are untouched by numerical
      // integration and are skipped — only `typeof === "number"` fields are
      // ever written by the ODE/compartment math this guard protects
      // against.
      const snapshot = {};
      const numericKeys = [];
      for (const k of Object.keys(this)) {
        if (typeof this[k] === "number") { numericKeys.push(k); snapshot[k] = this[k]; }
      }
      updateHemorrhage(this, step);
      updateFluidShifts(this, step);
      // SINGLE SOURCE OF TRUTH for hemoglobin concentration. This identical
      // expression was previously recomputed inline in cardiovascular.js,
      // respiratory.js, metabolic.js and neuro.js — four private copies of a
      // derived state, which is exactly the parallel-system pattern the
      // architecture rules forbid, and which meant `hb` existed nowhere on the
      // patient for a regression suite or a lab panel to read. Computed here,
      // immediately after the two steps that can change red cell mass
      // (hemorrhage) or plasma volume (fluid shifts), so every consumer in the
      // substep sees the same current value.
      this.hb = this.totalBloodVol > 0 ? this.rbcMass / (this.totalBloodVol * 10) : 0;
      this.hct = this.totalBloodVol > 0 ? this.rbcVol / this.totalBloodVol : 0;
      // Queue item 46 — runs before every consumer it feeds this same
      // substep: capillaryLeak (read by updateFluidShifts, already run
      // above this tick's earlier substeps and next tick's), the
      // metabolicHeatMultiplier updateTemperature reads below, and the
      // tissue-factor term updateCoagulation reads below.
      updateInflammation(this, step);
      updateAutonomic(this, step);
      updateVenousReturn(this, step);
      updateCardiovascular(this, step);
      updateVentilation(this, step);
      updateGasExchange(this, step);
      updateMetabolism(this, step);
      updateRenalEndocrine(this, step);
      updateElectrolytes(this, step);
      // Queue item 44 — runs AFTER renal/electrolytes so this tick's own
      // na/k/cl are already settled before hco3/ph are derived from them.
      // Respiratory's own Winter's-formula read of pat.hco3 (updateVentilation,
      // which already ran earlier THIS SAME tick) therefore reads last
      // tick's derived value — the identical one-tick lag this pipeline
      // already had before this item (hco3 used to be finished inside
      // updateMetabolism, also after updateVentilation in the same order).
      updateAcidBase(this);
      updateTemperature(this, step);
      updateCoagulation(this, step);
      updateOrganInjury(this, step);
      updateCerebral(this, step);
      updateRhythm(this, step);
      updateMortality(this, step);

      // Stability guard: if the substep produced a non-finite value anywhere in
      // its numeric state, roll back and retry at half the step. Repeated
      // failures fall back to the last good state rather than continuing with
      // NaN, which would otherwise propagate silently through every downstream
      // system for the rest of the session.
      let bad = false;
      for (const k of numericKeys) if (!Number.isFinite(this[k])) { bad = true; break; }
      if (bad) {
        for (const k of numericKeys) this[k] = snapshot[k];
        this._unstableSteps = (this._unstableSteps || 0) + 1;
        if (stepLimit > MAX_STEP / 16) { stepLimit = stepLimit / 2; continue; }
        remaining -= step;   // give up on this slice, state is restored
      } else {
        remaining -= step;
      }
    }
    this.lastUpdate = s.t;
  }

  vitals() {
    const filter = (key, raw, range) => {
      if (this._noise[key] == null) this._noise[key] = raw;
      const targetNoise = (Math.random() - 0.5) * range;
      this._noise[key] += (targetNoise - this._noise[key]) * 0.1;
      return raw + this._noise[key];
    };
    const hr  = Math.round(filter("hr", this.hr, 2));
    const sbp = Math.round(filter("sbp", this.sbp, 3));
    const dbp = Math.round(filter("dbp", this.dbp, 2));
    // PULSE OX CANNOT SEE CARBON MONOXIDE. A standard two-wavelength pulse
    // oximeter distinguishes only oxy- vs deoxy-hemoglobin by absorbance —
    // carboxyhemoglobin absorbs light close enough to O2Hb that the device
    // reads it as saturated. So the MONITOR display is sao2 (the true
    // saturation of the O2-available fraction of Hb) plus cohb (the fraction
    // it mistakes for oxygenated) — genuinely different from the true
    // oxygen-carrying capacity, pat.caO2 (metabolic.js), which correctly
    // discounts the CO-bound fraction. This is the actual, real reason CO
    // poisoning is dangerous: the number on the monitor can read normal
    // while tissue oxygen delivery is collapsing. Every other consumer in
    // this engine (organ DO2 signals, brainO2, etc.) reads caO2, not this
    // display value, so they see the real deficit regardless of what the
    // pulse ox shows.
    const spo2 = Math.min(100, Math.max(0, Math.round(filter("spo2", this.sao2 + (this.cohb || 0) * 100, 1))));
    const rr   = Math.round(filter("rr", this.rr, 1));
    // End-tidal CO2 is arterial CO2 diluted by alveolar dead space (see
    // respiratory.js). The gradient is therefore a measurement, not a constant.
    const vdFrac = this.alveolarDeadSpaceFrac ?? 0.06;
    // Capnography measures EXHALED gas, so it requires gas to actually be moving.
    // With an obstructed airway or apnoea there is no end-tidal sample and the
    // waveform goes flat — a defining clinical sign. Without this the reading
    // followed arterial CO2 upward during complete obstruction and displayed 140
    // mmHg on a patient who was not ventilating at all.
    const minuteVent = Math.max(0, (this.vt || 0) * (this.rr || 0));
    const sampleQuality = Math.max(0, Math.min(1, minuteVent / 0.5));
    const etco2 = Math.round(Math.max(0,
      this.paco2 * (1 - vdFrac) * sampleQuality + (Math.random() - 0.5) * 2 * sampleQuality));
    const k    = parseFloat(((this.k || 4) + filter("k", 0, 0.1)).toFixed(1));
    const blood = parseFloat(this.totalBloodVol.toFixed(2));
    const phScaled = Math.round((this.phScale || 740) + filter("ph", 0, 5));
    const kidney = this.gfr > 60 ? "normal" : this.gfr > 20 ? "pressure" : "fail";
    const temp  = parseFloat((this.coreTemp + filter("temp", 0, 0.1)).toFixed(1));
    const coag  = Math.round(this.coagPct + filter("coag", 0, 2));
    const bronch = parseFloat((this.broncho + filter("bronch", 0, 0.02)).toFixed(2));
    const edema  = parseFloat((this.edema + filter("edema", 0, 0.02)).toFixed(2));
    // Queue item 58: published so protocol rules (laCounty.js's anaphDiphen)
    // can gate on the real skin/pruritus finding instead of a proxy.
    const urticaria = parseFloat((this.urticaria || 0).toFixed(2));
    // Queue item 61: published so protocol rules (laCounty.js's ANAPHYLAXIS
    // helper) can gate on the real localized airway-swelling finding instead
    // of the wheeze+shock/hypoxia proxy the file's own comment already
    // documented as a known gap.
    const angioedema = parseFloat((this.angioedema || 0).toFixed(2));
    // Queue item 66: published so actions.js's stroke-screen exam can read
    // the real finding instead of nothing existing at all.
    const dystonia = parseFloat((this.dystonia || 0).toFixed(2));
    const tv     = parseFloat((this.vt + filter("tv", 0, 0.02)).toFixed(2));
    // ECTOPY OVERLAY (cardiac conditions batch, queue item 7): pvcFrequency
    // (cardiovascular.js) was a real, richly-computed aggregate that nothing
    // ever read — a genuine "written, never read" defect (section 1). Only
    // layered on top of an otherwise-normal SINUS classification: a patient
    // already in a named dangerous rhythm (afib/VT/chb/...) has that as the
    // actual finding, and layering an ectopy label on top of it would blur
    // the real teaching point. Threshold at 1/min follows the Lown grading
    // system's own definition of "frequent" ventricular ectopy (Grade 2,
    // >1/min or >30/hr) — the one place this kind of count has a named
    // clinical cutoff, rather than an invented number.
    const baseSinusEcg = hr > 100 ? "sinusTach" : hr < 60 ? "sinusBrad" : "sinus";
    // QUEUE ITEM 5: pat.firstDegreeBlock (cardiovascular.js, recomputed every
    // tick from prInterval>0.20) had no reader anywhere — a genuine
    // "written, never read" dead field, same class as pvcFrequency/
    // atrialEctopicFocus above before THEY were wired here. Checked after
    // ectopy (a frequent-PVC/PAC finding is the more urgent thing to flag)
    // and before the plain tachy/brady classification, since first-degree
    // block doesn't change rate — a bradycardic patient with a prolonged PR
    // still reads as the block finding, matching real 12-lead interpretation
    // convention ("sinus bradycardia with first-degree AV block" collapses
    // to the block finding here, the same simplification sinusPVC/sinusPAC
    // already make by not sub-classifying rate either).
    // accidentalHypothermia (queue item 7): Osborn/J waves are a real,
    // well-documented ECG sign once core temperature falls below roughly
    // 32 C, distinct from — and checked ahead of — the plain sinusBrad
    // classification, since it's the more clinically specific finding at
    // this severity (a candidate should learn to name it, not just note a
    // slow rate). Doesn't override actual ectopy/block findings above it.
    const ecgDesc = this.rhythm !== "sinus" ? this.rhythm
      : (this.pvcFrequency || 0) >= 1 ? "sinusPVC"
      : (this.atrialEctopicFocus || 0) >= 0.3 ? "sinusPAC"
      : this.firstDegreeBlock ? "firstDegreeBlock"
      : this.coreTemp < 32 ? "osborn"
      : baseSinusEcg;
    return {
      hr, sbp, dbp, sbpL: Math.round(sbp + (this.sbpLeftOffset || 0)),
      spo2, rr, etco2, glu: this.glucose,
      // Floored here (queue item 20), not at the accumulator: drugPain is
      // now intrinsic pain + this tick's drug fx.pain deltas, and a large
      // analgesic dose can legitimately drive the sum negative — displayed
      // pain cannot be negative, but the underlying accumulator is left
      // unclamped through the tick so a multi-drug combination isn't clipped
      // mid-accumulation.
      pain: Math.max(0, this.drugPain || 0),
      k, blood, ph: phScaled, kidney, temp, coag,
      bronch, edema, urticaria, angioedema, dystonia, airway: this.airway || "clear", ptx: this.ptx,
      rhythm: this.rhythm || "sinus", tv, ecg: ecgDesc,
      // QUEUE ITEM 54: qrsWidth (cardiovascular.js's updateConduction) is a
      // real, already-live quantity (seconds — 0.08 baseline, widened by
      // hyperkalaemia/Na-channel block/ischemia/hypermagnesaemia) that was
      // computed every tick but never published here, so no protocol rule
      // or player-facing action could read it. Rounded to 3dp (ms
      // precision) matching this object's own toFixed convention for other
      // small-magnitude physiological quantities (ef, ea, ees above).
      qrsWidth: +((this.qrsWidth ?? 0.08)).toFixed(3),
      // QUEUE ITEM 51: pat.agitation (neuro.js's updateCerebral) is a real,
      // already-live 0-1 severity — published here the same way qrsWidth
      // was above (queue item 54) so a protocol rule or player-facing
      // action can read it as ctx.v.agitation, matching how WIDE_QRS reads
      // ctx.v.qrsWidth.
      agitation: +((this.agitation ?? 0)).toFixed(2),
      _map: this.map, _lactate: this.lactate, _ph: this.ph, _cons: this.consciousness,
      _pvLoop: this.pvLoop || null,
      _cv: {
        edv: Math.round(this.edv || 0), esv: Math.round(this.esv || 0),
        sv: Math.round(this.sv || 0), ef: +((this.ef || 0)).toFixed(2),
        ees: +((this.ees || 0)).toFixed(2), ea: +((this.ea || 0)).toFixed(2),
        co: +((this.co || 0)).toFixed(2),
        paSys: Math.round(this.paSys || 0), paDia: Math.round(this.paDia || 0),
        paMean: Math.round(this.paMean || 0), rvEf: +((this.rvEf || 0)).toFixed(2),
        rvEdv: Math.round(this.rvEdv || 0), rvEsv: Math.round(this.rvEsv || 0),
        rvSv: Math.round(this.rvSv || 0),
        baro: +((this.baroFiring ?? 0.5)).toFixed(2), symp: +((this.sympathetic ?? 0.3)).toFixed(2),
      },
      _rvLoop: this.rvPvLoop || null,
    };
  }
}

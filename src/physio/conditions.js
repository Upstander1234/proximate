// conditions.js — the disease library. This is the ONLY place that encodes
// "what does this condition do to a patient over time." A scenario picks a
// condition by name; everything else (Patient construction, moment-to-moment
// vitals, how drugs interact with it) is handled by the engine already.
//
// Shape of a condition:
//   initial:  fields merged straight into the Patient constructor
//             (hr, sbp, rr, blood, pain, bronch, edema, shunt, tv, airway,
//              rhythm, sbpLeftOffset, contractilityFactor, age, weight,
//              riskFactors, ...)
//   progress(pat, dt, s):
//             called once per physio() tick, ONLY when dt > 0 (real
//             simulated time has passed). Nudge live Patient fields
//             (hrBase, rrBase, broncho, edema, shuntFraction,
//             activeBleedRate, k, coreTemp...) toward where the untreated
//             disease is heading. Drugs/procedures are applied by the
//             engine on the same fields, so treatment and natural history
//             compose automatically — you don't need to account for
//             treatment here, just write the untreated course.
//   sync(pat, s):
//             called on EVERY physio() call, even when dt === 0 (e.g. a
//             render triggered right after the player takes an action).
//             Use this for instantaneous state that should update the
//             moment a scenario flag flips — airway patency, a rhythm
//             fix, anything that isn't "accumulate over time." Most
//             conditions won't need this.
//   `s` (the session) is available in both hooks for scenario-specific
//   branches (e.g. "has the airway been cleared yet").

import { establishPregnancy } from "./obstetric.js";
import { NORMAL_HB, HCT_NORMAL } from "./constants.js";
import { seedPastDose } from "./pk.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const CONDITIONS = {
  // Aortic dissection — occult intrathoracic/mediastinal leak. Models as a
  // slow internal bleed: falling volume drags SBP down and HR up on its own,
  // through the same hemorrhage/autonomic pathway a trauma bleed would use.
  // Two secondary complications layer on top once the bleed is well
  // established, mirroring how a real dissection worsens: coronary
  // malperfusion (contractility starts to fail on top of the volume loss —
  // not just tachycardia compensating for it) and a slowly rising
  // resistance to venous return (a proxy for the pericardial/tamponade
  // component a proximal dissection can produce — impaired filling despite
  // normal-to-high venous pressure, not modeled as blood loss).
  // ACUTE AORTIC REGURGITATION — READY TO WIRE, DELIBERATELY NOT WIRED YET.
  // See queue item 41. Everything below was built, measured, and then REVERTED
  // rather than shipped; the reasoning is kept because it is exactly what the
  // next session needs.
  // This
  // scenario's own `heart` probe has ALWAYS narrated "a soft blowing murmur in
  // diastole ... New diastolic murmur — aortic regurgitation" (scenarios.js),
  // and updateValves (cardiovascular.js) has ALWAYS had a ready driver for it
  // (`if (rf.aorticDissection) aiTarget = Math.max(aiTarget, 0.5)`) — but
  // nothing in the codebase ever set the risk factor, so the murmur was pure
  // narration with no physiology behind it, and the driver was unreachable.
  // Exactly the "a real, checkable clinical claim with no mechanism" gap the
  // hypercalcemia/saline fix was found by, and closed the same way.
  // Clinically anchored: a Stanford type A dissection extending into the root
  // disrupts leaflet coaptation, and acute aortic regurgitation complicates a
  // large fraction of proximal dissections — the new diastolic murmur is a
  // classic examinable finding and part of why these patients decompensate.
  // MEASURED as a controlled A/B on the REAL scenario (key "chest" — NOT
  // "aorticDissection", which is this condition's key and, passed as a scenario
  // name, silently yields a default healthy patient; a first pass of this
  // measurement fell into exactly that trap and had to be redone). Arm A
  // suppresses the risk factor each tick to reproduce pre-change behavior, arm
  // B is shipped. At t=240 s, A -> B: pulse pressure 34 -> 59 mmHg (DBP 92 ->
  // 75, SBP 126 -> 134), LVEDV 116 -> 158 mL (volume overload), forward cardiac
  // output 6.05 -> 4.91 L/min, forward EF 0.53 -> 0.31. All emergent from the
  // beat-level regurgitant flow, none of it scripted. The scenario's own
  // hemorrhage-driven deterioration is preserved and unchanged in shape (both
  // arms converge as blood loss dominates: CO 3.41 vs 3.15 by t=960 s), and
  // sao2/lactate/atp are untouched — this adds a real lesion, it does not
  // destabilize the scenario.
  // STATED HONESTLY: this reads as a wide-pulse-pressure (chronic-flavored) AR
  // because this engine's ventricle dilates to accommodate the regurgitant
  // volume within minutes. TRUE hyperacute AR gives a NARROW pulse pressure,
  // because a normal-sized, non-compliant LV cannot dilate that fast and LVEDP
  // rockets instead. Reproducing that distinction needs a diastolic-compliance
  // time course this model does not have; the direction and the murmur are
  // real, the acute-vs-chronic nuance is not yet.
  // WHY IT WAS REVERTED, and what landing it needs: the 0.5 severity that
  // driver hardcodes has never been calibrated against an observable (the same
  // defect class as the ischemic gain — see updateValves), and activating it
  // has real collateral effects. Forward EF falls 0.53 -> 0.31, and
  // mechanismWiring's takotsubo section uses THIS scenario as its "matched
  // non-takotsubo chest-pain control (~53% EF)" — the lesion inverts that
  // comparison and fails an assertion with nothing to do with valves (measured:
  // control 0.309 vs takotsubo 0.385). So this needs a calibrated severity AND
  // a different takotsubo control, which is real work rather than a one-line
  // addition, and it is filed as such rather than rushed.
  aorticDissection: {
    initial: { hr: 96, sbp: 152, sbpLeftOffset: -34, rr: 24, glu: 112, pain: 8, blood: 6 },
    progress(pat, dt) {
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.015, 0, 0.3);
      pat.hrBase = clamp(pat.hrBase + dt * 1.2, 60, 150);
      if (pat.activeBleedRate > 0.15) {
        // Coronary malperfusion: the dissection (or the falling diastolic
        // pressure that comes with the bleed) starts starving the heart
        // muscle itself, on top of — not instead of — hypovolaemia.
        pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - dt * 0.015, 0.55, 1);
      }
      if (pat.activeBleedRate > 0.2) {
        // Proximal extension toward the pericardium — filling gets harder
        // even though total blood volume hasn't changed nearly as much as
        // the falling pressure suggests.
        pat.venousResistance = clamp((pat.venousResistance ?? 0.1) + dt * 0.008, 0.1, 0.28);
      }
    },
  },

  // Acute pulmonary edema / CHF — fluid backing up into the lungs because
  // a chronically weak ventricle can't empty completely. `contractilityFactor`
  // starts below 1 (the chronic disease) and drifts lower still as the call
  // goes on (the acute decompensation actually in progress), which is what
  // keeps dragging preload/filling pressure up even as edema worsens —
  // Frank-Starling giving diminishing, then negative, returns. A touch of
  // rising bronchospasm ("cardiac asthma") layers on top of the existing
  // edema/shunt/HR climb.
  chf: {
    initial: { hr: 112, sbp: 178, rr: 28, glu: 106, pain: 1, blood: 6, edema: 0.2, bronch: 0.2, shunt: 0.15,
      contractilityFactor: 0.8, riskFactors: { heartFailure: true } },
    progress(pat, dt) {
      // A shared Ppv-driven pulmonary-edema mechanism (queue item 7's
      // "pulmonary edema separated from generic CHF" suggestion) was tried
      // here and REVERTED, not shipped — see CLAUDE.md section 3 for the
      // full writeup. Found genuinely non-specific by measurement: Ppv (the
      // solver's own pulmonary venous pressure) rises as much or more from
      // pure respiratory apnea (opioidOD, mean Ppv 10.6) as from real
      // cardiac dysfunction (chf, mean Ppv 10.1), because it is confounded
      // by intrathoracic-pressure swings from labored/assisted breathing,
      // not just cardiac filling pressure. No threshold on raw Ppv can tell
      // the two apart, so this stays a direct write until a properly
      // LV-specific driving signal (Ppv corrected for intrathoracic
      // pressure, or a dedicated LV-filling-pressure term) exists.
      pat.edema = clamp(pat.edema + dt * 0.05, 0, 0.9);
      pat.shuntFraction = clamp(pat.shuntFraction + dt * 0.015, 0, 0.5);
      pat.hrBase = clamp(pat.hrBase + dt * 1.0, 60, 160);
      pat.broncho = clamp((pat.broncho ?? 0.2) + dt * 0.01, 0, 0.5);
      pat.contractilityFactor = clamp((pat.contractilityFactor ?? 0.8) - dt * 0.008, 0.45, 1);
    },
  },

  // Acute myocardial infarction (STEMI by default — set patient.rhythm via a
  // scenario override to "sinusTach" for an NSTEMI presentation, where the
  // 12-lead won't show it and the diagnosis has to come from history/
  // troponin instead). Contractility starts near-normal and only starts
  // failing once real infarct size accumulates — matching "initially mild
  // tachycardia/hypertension, normal oxygenation" — then the vicious cycle
  // (falling contractility -> falling coronary perfusion -> falling
  // contractility) takes over on its own through the engine's existing
  // coronaryPerf term. Electrical instability is modeled directly, on top
  // of whatever the generic rhythmInstability triggers already fire, since
  // ischemic myocardium is arrhythmogenic independent of hypoxia/K/pH.
  // Backward failure (pulmonary edema) only shows up once the infarct is
  // large enough to actually drop the ejection fraction meaningfully.
  ami: {
    initial: { hr: 104, sbp: 156, rr: 20, glu: 118, pain: 8, blood: 6, rhythm: "stemi", contractilityFactor: 0.95 },
    progress(pat, dt) {
      pat.contractilityFactor = clamp((pat.contractilityFactor ?? 0.95) - dt * 0.018, 0.4, 1);
      pat.rhythmInstability = clamp((pat.rhythmInstability || 0) + dt * 0.018, 0, 1);
      pat.hrBase = clamp(pat.hrBase + dt * 0.6, 60, 140);
      // REVERTED — see chf's own comment above (and CLAUDE.md section 3)
      // for why the shared Ppv-driven pulmonary-edema mechanism this
      // condition briefly used was rolled back rather than shipped.
      if (pat.contractilityFactor < 0.72) {
        pat.edema = clamp((pat.edema || 0) + dt * 0.035, 0, 0.7);
        pat.shuntFraction = clamp((pat.shuntFraction || 0) + dt * 0.015, 0, 0.55);
      }
    },
  },

  // Cardiogenic shock — the pump has already failed badly enough that
  // output can't meet demand despite normal-to-high preload (unlike
  // hemorrhagic shock, there's no volume to give here — see `blood: 6`,
  // unchanged). Severely depressed contractility from the start, worsening
  // further as coronary perfusion falls with it (same engine feedback loop
  // AMI uses, just starting much further down the curve), with a higher
  // baseline arrhythmia risk than plain AMI and pulmonary edema already
  // under way rather than a late complication.
  // ETIOLOGY, not a syndrome. A fixed flow-limiting coronary lesion: it caps
  // maximal coronary flow (reserve) without altering resting supply, so it
  // produces no symptoms on its own and only bites when myocardial oxygen
  // demand rises — tachycardia, hypertension, or the high wall stress of a
  // dilated failing ventricle. Composed alongside a syndrome (e.g.
  // cardiogenicShock) it supplies the ischemic substrate that turns static pump
  // failure into the self-reinforcing downward spiral; composed with nothing it
  // is simply a patient with coronary disease. Keeping it separate means
  // non-ischemic cardiomyopathy, myocarditis and valvular pump failure can use
  // the same syndrome without inheriting an ischemic etiology they don't have.
  // PHYSIOLOGICAL STATE, not a disease. A normal singleton pregnancy with no
  // pathology and not in labor. All of the cardiovascular adaptation (volume
  // expansion, reduced SVR, mild resting tachycardia, venous capacitance,
  // eccentric remodeling) is implemented in obstetric.js and derived from the
  // gestational age — this condition only declares that the patient is pregnant.
  // Composable: pair it with a disease/injury condition to model that problem
  // occurring in a pregnant patient.
  healthyPregnancy: {
    initial: {},
    progress(pat, dt, s) {
      const preg = establishPregnancy(pat, {
        gestation: pat._gestationWeeks ?? 39,
        laborProgress: 0, contractionRate: 0,
      });
      // Position: left lateral tilt / left uterine displacement by default, so
      // aortocaval compression is relieved.
      preg.tilted = !(s && s.supine === true);
    },
  },

  // ===== CHRONIC / PRE-EXISTING CONDITIONS =====
  // These describe a patient's BASELINE physiology rather than an emergency.
  // They are composable with any acute condition, so "COPD patient with
  // pneumonia" or "CKD patient with hyperkalaemia" is expressed by listing both
  // rather than by writing a combined condition. Each one drives mechanisms that
  // already exist in the engine — none of them invent a new variable.

  // Chronic obstructive pulmonary disease. Sets the baseline the acute illness
  // then acts on: fixed airflow obstruction, hyperinflation (the engine's
  // intrinsic-PEEP model keys off riskFactors.copd), reduced elastic recoil, and
  // a chronically raised bicarbonate from renal compensation for CO2 retention —
  // which is why a COPD patient's "normal" pH is near 7.35 with a PaCO2 in the
  // 50s rather than 40.
  copd: {
    initial: { riskFactors: { copd: true } },
    progress(pat) {
      if (pat._copdSet) return;
      pat._copdSet = true;
      // The airway mechanics of COPD (raised resistance, reduced elastic recoil,
      // hyperinflated FRC) are ALREADY applied by the Patient constructor from
      // riskFactors.copd, and the intrinsic-PEEP model keys off the same flag.
      // Re-applying them here double-counted the disease: airway resistance came
      // out at 4x normal instead of 1.8x, and combining that with an acute
      // bronchospasm produced an airway load no patient could ventilate against
      // (measured PaCO2 104 and SpO2 13 within two minutes of scenario start).
      // This condition therefore declares only what the constructor does NOT:
      // the chronic acid-base compensation and resting ventilatory pattern.
      pat.broncho = Math.max(pat.broncho ?? 0, 0.25);
      // Blunted CO2 chemosensitivity — the reason this patient RETAINS CO2
      // rather than ventilating it off (see respiratory.js). Hypercapnia is
      // therefore an OUTCOME of the phenotype, not an asserted number.
      // Partial, not complete. Dead space (below) now carries most of the CO2
      // retention, so the blunting term only has to explain why the patient
      // tolerates the resulting hypercapnia rather than ventilating it off. With
      // both set aggressively they compounded and drove PaCO2 to 80.
      pat.chronicCO2Blunting = 0.2;
      // Dead space, not bradypnoea. Emphysematous destruction leaves alveolar
      // units ventilated but poorly perfused, so physiologic Vd/Vt rises from
      // ~0.3 toward 0.5-0.6: minute ventilation is normal or high while ALVEOLAR
      // ventilation is low. That is why these patients are hypercapnic while
      // visibly working hard. Lowering rrBase produced the right PaCO2 by the
      // wrong route — a bradypnoeic patient (measured RR 10) who would not
      // respond correctly to bronchodilators, assisted ventilation, or rising
      // metabolic demand.
      pat.deadSpace *= 1.4;
      // Renal compensation is already complete on arrival: chronic hypercapnia
      // raises bicarbonate by roughly 0.4 mEq/L per mmHg of PaCO2 above 40. We
      // seed it from the CO2 this phenotype will actually settle at, so the
      // patient presents compensated (near-normal pH) instead of spending the
      // scene correcting an acidosis that took months to develop. Asserting a
      // bicarbonate WITHOUT the matching CO2 retention produced a spurious
      // metabolic alkalosis (measured pH 7.53).
      const expectedChronicCO2 = 55;
      // Queue item 44: chronic renal compensation is a real strong-ion-
      // difference input (sustained net acid excretion raising SID over
      // days), not a free hco3 write — pat.sidAdjust (acidbase.js) is the
      // lever. Same formula as before (this used to write pat.hco3
      // directly to 24 + (chronicCO2-40)*0.4); since this patient's own
      // na/k/cl are untouched by COPD, sidAdjust of +6 reproduces the
      // identical hco3=30 this always presented at.
      pat.sidAdjust = Math.max(pat.sidAdjust ?? 0, (expectedChronicCO2 - 40) * 0.4);
    },
  },

  // ===== COPD ACUTE EXACERBATION =====
  // Queue item 23. Composes with copd (["copd","copdExacerbation"]) rather
  // than standing alone, and deliberately does NOT reuse asthma's own
  // broncho climb at asthma's own magnitude: copd's own condition comment
  // already documents a MEASURED catastrophe from stacking a second acute
  // obstruction source onto COPD's constructor-level airway mechanics
  // (PaCO2 104, SpO2 13 within two minutes). A real exacerbation (infective,
  // per GOLD guidelines — increased sputum purulence/volume) is more
  // DEAD-SPACE-driven than pure bronchospasm, matching copd's own comment on
  // why it models dead space rather than bradypnoea — so this adds a modest
  // broncho increment (ceiling well below asthma's 0.96) plus real purulent
  // secretions via pat.airwayFluid (the same suction-treatable mechanism
  // pediatricDrowning/aspirationPneumonitis already use), not a second
  // bronchospasm race to the same ceiling.
  copdExacerbation: {
    initial: { hr: 108, sbp: 138, rr: 24, glu: 100, pain: 1, temp: 37.8 },
    progress(pat, dt) {
      pat.broncho = Math.min(0.55, Math.max(pat.broncho ?? 0.25, 0.25) + dt * 0.015);
      pat.airwayFluid = Math.min(0.6, (pat.airwayFluid || 0) + dt * 0.02);
      pat.coreTemp = Math.min(38.8, (pat.coreTemp ?? 37.8) + dt * 0.006);
    },
  },

  // Chronic kidney disease. Reduced clearance is the point: potassium excretion
  // falls (so any potassium load becomes dangerous), acid is retained, volume
  // regulation is blunted, and renally cleared drugs accumulate. The engine
  // already gates kExcretion and the volume controller on renal function, and
  // clears drugs through renal function, so this changes drug behaviour rather
  // than merely labelling the patient.
  chronicKidneyDisease: {
    initial: { riskFactors: { ckd: true } },
    progress(pat) {
      // Persistent nephron loss: hold the injury factor down every tick so the
      // renal module's own recovery cannot walk it back.
      // WRITES THE FIELD THE ENGINE ACTUALLY READS.
      // This previously set `renalInjury` and `gfrFactor`. renal.js reads
      // `kidneyInjury`, and NOTHING anywhere read either of the two names CKD
      // was writing — so chronic kidney disease had no effect on glomerular
      // filtration whatsoever, despite this condition's own comment claiming it
      // changed drug handling. Both were decorative fields, which the
      // architecture rules forbid; a name mismatch made them invisible.
      // 0.325 is identified against a documented observable, not chosen:
      // renal.js computes injuryFactor = 1 - kidneyInjury*2, so 0.325 gives
      // 0.35 — CKD stage 4, a GFR ~35% of normal.
      pat.kidneyInjury = Math.max(pat.kidneyInjury ?? 0, 0.325);
      if (pat._ckdSet) return;
      pat._ckdSet = true;
      // Queue item 44: retained uremic anions (sulfates, phosphates, urate)
      // are a real, genuinely ANION-GAP cause — the mechanistically correct
      // lever is pat.unmeasuredAnions, not a free hco3 write. Target hco3=19
      // (this condition's own long-standing floor) at this condition's own
      // na=140/k=5.0 (set two lines below, same tick): SID=140+5-102=43,
      // so unmeasuredAnions=43-18-19=6 reproduces the identical hco3=19.
      pat.unmeasuredAnions = Math.max(pat.unmeasuredAnions ?? 0, 6);
      pat.k = Math.max(pat.k ?? 4, 5.0);         // baseline hyperkalaemic tendency
      pat.rbcMass *= 0.75;                        // anemia of chronic kidney disease
    },
  },

  // Cirrhosis (chronic liver disease with portal hypertension) — queue item
  // V2-13's real portal-pressure/portal-flow half. Genuinely distinct from
  // items 42/48's acute hepatic hypoperfusion work (hepaticDO2/
  // hepaticO2Debt/hepaticStunning) — this is a CHRONIC, STRUCTURAL,
  // pressure-driven process (a fibrotic liver raising resistance to portal
  // flow), not a perfusion/oxygen-delivery one, and it drives SYSTEMIC
  // hemodynamics (splanchnic vasodilation -> underfilled effective
  // arterial volume -> real RAAS/ADH activation -> real fluid retention),
  // not organ injury per se.
  //
  // Follows the SAME "chronic disease sets a baseline the acute physiology
  // then acts on" pattern chronicKidneyDisease/copd already establish, two
  // entries above: reduced hepatic reserve/clearance reuses the
  // ALREADY-REAL organClearanceFactor()/pat.liverInjury mechanism (pk.js)
  // directly — no new drug-clearance code — and the portal-hypertension
  // limb is wired through renal.js's own new pat.portalPressure mechanism
  // (see that file's own comment for the full RAAS/ADH derivation).
  //
  // HVPG thresholds (Groszmann et al., NEJM 2005; Garcia-Tsao et al.,
  // Hepatology 2017 AASLD practice guidance): normal 1-5 mmHg; >5 mmHg =
  // portal hypertension; >=10 mmHg = "clinically significant portal
  // hypertension" (CSPH), the real threshold associated with ascites/
  // variceal risk. 12 mmHg (this condition's baseline) sits just past
  // CSPH — a real, compensated-but-decompensating cirrhotic (Child-Pugh B
  // territory), not an end-stage/Child-Pugh-C presentation.
  cirrhosis: {
    initial: { riskFactors: { cirrhosis: true }, age: 56 },
    progress(pat) {
      // Chronic and structural — reassert every tick so neither
      // neuro.js's own liverInjury recovery-when-well-perfused term nor
      // anything else can silently heal a chronic disease, the same
      // idiom chronicKidneyDisease's own kidneyInjury reassertion uses.
      // 0.30 -> organClearanceFactor's hepatocyte term = 1-0.30*0.7=0.79,
      // a real but partial (not end-stage) fall in hepatic drug
      // clearance/synthetic reserve.
      pat.liverInjury = Math.max(pat.liverInjury ?? 0, 0.30);
      pat.portalPressure = Math.max(pat.portalPressure ?? 0, 12);
    },
  },

  // Hyperkalemia from missed dialysis. Section 8 target library — the
  // Electrolyte category's bare "Hyperkalemia" and the Renal/Genitourinary
  // category's "Hyperkalemia from Missed Dialysis" are the SAME underlying
  // disease entity (a real, named, recognizable prehospital cause, not the
  // abstract label), built once here and removed from both lists.
  //
  // Needs almost no new engine mechanism — this is a case where the
  // clinical literature review (step a) found the machinery already built
  // and independently verified: cardiovascular.js's own effK-driven
  // peakedT -> wideQRS -> asystole state machine (deterministic, not
  // probabilistic — see its own comment) and continuous qrsWidth/
  // avConduction calcium-protection terms, PLUS renal.js's kExcretion
  // (gated on kidneyInjury) and beta2-mediated Na/K-ATPase K-shift, PLUS
  // drugs.js's own already-declared calcium (`fx:{ca:0.5}`, membrane
  // stabilization, does not lower K) and bicarb (`fx:{kShift:-0.8}`, shifts
  // K intracellularly) — all already covered by mechanismWiring's own
  // [HYPERKALAEMIA — CALCIUM MEMBRANE STABILISATION] section. This
  // condition's job is to give that machinery a real cause, a real time
  // course, and a real presenting patient — not to invent new receptors.
  //
  // Clinical facts: end-stage renal disease (ESRD) hemodialysis patients
  // have essentially no native potassium excretion between sessions — a
  // missed session (classically a weekend gap, or simple non-compliance)
  // lets potassium accumulate over days, not minutes. Presentation is
  // often deceptively mild (generalized weakness, malaise, palpitations)
  // since the neuromuscular symptoms of hyperkalemia are nonspecific — the
  // ECG, not how the patient feels, is what actually tracks the danger
  // (the peaked-T -> widened-QRS -> sine-wave/VF progression this engine's
  // own effK state machine already reproduces). Between-dialysis volume
  // overload (kidneys make no urine) commonly coexists, hence the already-
  // elevated presenting blood pressure below — a real, honest secondary
  // finding, not a mechanism of its own (no separate progression term:
  // the teaching point this condition is built for is the electrolyte/ECG
  // one, and a second active mechanism here would be scope creep past
  // what the condition needs, per section 1's own discipline).
  hyperkalemiaMissedDialysis: {
    initial: { age: 58, hr: 82, sbp: 168, dbp: 96, rr: 18, glu: 110, pain: 1, k: 6.8 },
    progress(pat, dt) {
      // ESRD: essentially no native renal potassium clearance. Pinned
      // every tick (chronicKidneyDisease's own idiom, two entries above)
      // so the renal module's own partial recovery can't walk it back —
      // 0.55 -> renal.js's injuryFactor = 1 - 0.55*2 = -0.1, clamped to 0
      // by that module's own Math.max(0, ...) -> kExcretion = 0 exactly.
      // This is not CKD's more moderate 0.325 (stage 4, ~35% GFR): a
      // missed-dialysis patient's kidneys are not "a little hurt," they
      // are the entire reason dialysis exists.
      pat.kidneyInjury = Math.max(pat.kidneyInjury ?? 0, 0.55);
      // Queue item 44, found while verifying: this condition only ever set
      // potassium — a real strong CATION, which now (acidbase.js's SID
      // derivation) genuinely raises the strong-ion difference on its own.
      // MEASURED: with no opposing anion, this patient's own severe
      // hyperkalemia was pulling hco3 up to ~27 and pH to ~7.51 — a
      // missed-dialysis ESRD patient reading net ALKALOTIC, which is
      // clinically backwards (real missed-dialysis patients present with
      // BOTH hyperkalemia AND a real uremic-anion-gap acidosis — retained
      // sulfates/phosphates/urate, the same mechanism chronicKidneyDisease
      // two entries above already models via pat.unmeasuredAnions, just
      // more severe here because this patient's renal failure itself is
      // (kidneyInjury 0.55 vs CKD's 0.325). This was a real, previously-
      // invisible gap in the condition itself, not an artifact of the new
      // acid-base model — the old hco3-bucket mechanism simply had no way
      // to expose it, since potassium and bicarbonate were mechanically
      // unrelated fields.
      pat.unmeasuredAnions = Math.max(pat.unmeasuredAnions ?? 0, 10);
      // Ongoing, SLOW accumulation — dietary/metabolic intake continuing
      // against zero clearance, not an acute release (contrast
      // crushSyndrome's reperfusion washout, two entries above, which is
      // a genuinely different mechanism). Real urgency across a plausible
      // scene time without inventing a dramatic single jump. The 9.5
      // ceiling sits just above the state machine's own asystole
      // threshold (effK>=9), so an untreated patient can genuinely reach
      // the worst-case rhythm within a realistic call rather than
      // asymptotically approaching it.
      pat.k = Math.max(pat.k ?? 6.8, Math.min(9.5, (pat.k ?? 6.8) + dt * 0.03));
      // Queue item 35: uremic fetor. BUN is a live, GFR-driven field
      // (renal.js) but relaxes toward its target with a 180-minute time
      // constant — far too slow to reach a real uremic-fetor threshold
      // (~80-100 mg/dL) by climbing DURING a 900s call. A missed-dialysis
      // patient's azotemia is chronic: it accumulated over the days since
      // their last session, not the last 15 minutes, so it belongs in the
      // presenting picture, seeded once, the same "one-time chronic
      // baseline" idiom this condition already uses for initial.k.
      // 95 mg/dL is a real, severe-but-typical missed-session BUN for an
      // ESRD patient (dialysis patients commonly run 60-100 mg/dL between
      // sessions even on schedule; a missed session pushes toward the
      // upper end of that range) — inside the band that produces a genuine
      // ammonia/urine-like breath odor, not tuned to clear a threshold.
      if (!pat._bunSeeded) {
        pat._bunSeeded = true;
        pat.bun = Math.max(pat.bun ?? 12, 95);
      }
    },
  },

  // F6 (queue item 7's comorbidity-composition workstream, first entry):
  // Type 2 diabetes mellitus, as a COMORBIDITY meant to compose onto a
  // presenting condition (e.g. ["ami","diabetesT2"] for an atypical diabetic
  // MI) rather than stand alone as its own emergency — that composition
  // mechanism already exists (physiology.js's buildPatient merges an array of
  // condition keys). Deliberately minimal and honest about it: a chronically
  // elevated baseline glucose (typical uncontrolled/borderline T2DM fasting
  // glucose 130-180 mg/dL, vs this engine's healthy default of 100 — ADA
  // diagnostic threshold is fasting >=126) is the one mechanism shipped here,
  // reusing the existing `glu` constructor field with no new engine code.
  // Diabetic autonomic neuropathy (blunted tachycardic response to shock) and
  // vascular disease (coronary/peripheral) are real and well-documented, but
  // adding them means new engine mechanisms with their own literature-derived
  // coefficients and two-sided assertions — that is the item-7 workflow this
  // queue explicitly reserves for a dedicated physiology batch, not a
  // front-end sprint. Left for that batch rather than guessed at here.
  diabetesT2: {
    initial: { glu: 160, riskFactors: { diabetes: true } },
    // Queue item 5's remaining dead-field (this session): real, moderate
    // tissue insulin resistance — the defining lesion of Type 2 diabetes
    // — is what a chronically elevated `glu:160` baseline needed to
    // actually hold rather than being auto-corrected by renal.js's new
    // generic glucose-disposal loop (a non-diabetic patient's glucose
    // relaxes back toward ~100 through that loop; this comorbidity's whole
    // point is that a T2DM patient's does not). Deliberately milder than
    // hyperosmolarHyperglycemicState's own 0.2 (decompensated HHS is the
    // severe, acute extreme of the same resistant phenotype this chronic
    // comorbidity represents at baseline) — 0.5 is enough to hold this
    // condition's own 160 mg/dL near its authored value rather than
    // drifting back to 100 over the course of a call, without claiming
    // HHS-grade severity for a stable, compensated comorbidity.
    progress(pat) {
      pat.insulinSensitivity = Math.min(pat.insulinSensitivity ?? 1, 0.5);
    },
  },

  // ===== CHRONIC HYPERTENSION (comorbidity) =====
  // Queue item 21. CORRECTED from that item's own original framing: no
  // patient.js change was needed — the cardiac-conditions batch's own
  // hypertensiveUrgency/hypertensiveEmergency already proved pat.baseSVR
  // survives into the authoritative full-loop ODE solver untouched. This is
  // the SAME mechanism at a milder, CHRONIC, already-stable severity
  // (essential hypertension, not an acute crisis) — a one-time step on
  // presentation rather than a ramp, since a chronic comorbidity is already
  // at its steady state when the call begins, unlike the acute conditions'
  // own minutes-long climb. 1.3x chosen as a first target for ACC/AHA Stage
  // 2 range (>=140/90), below hypertensiveUrgency's own 1.6x->144/111 —
  // TO BE CONFIRMED against a real measurement, not assumed.
  hypertension: {
    initial: {},
    progress(pat) {
      if (pat._htnSet) return;
      pat._htnSet = true;
      if (pat._htnRestSvr == null) pat._htnRestSvr = pat.ageProfile.baseSVR();
      pat.baseSVR = pat._htnRestSvr * 1.3;
      // Queue item 39: a real hypertensive patient is plausibly already on an
      // antihypertensive. Diltiazem (a non-dihydropyridine CCB — a real,
      // guideline-recognized HTN agent, and already in this project's
      // formulary with a working receptor mechanism) chosen over metoprolol
      // here since beta-blockers are no longer first-line for uncomplicated
      // HTN (metoprolol is reserved below for the compelling indications —
      // CHF, CAD — where it actually IS first-line). Pushed via progress(),
      // not `initial`, and APPENDED rather than assigned: buildPatient's own
      // composition rule merges `initial` blocks shallowly (no special-case
      // merge for homeMeds the way it has one for riskFactors), so a second
      // composed condition's `initial.homeMeds` would silently clobber this
      // one's; appending here composes correctly no matter what else runs.
      // Dose (60mg) and intervalMin (240) are NOT the real-world clinical
      // dose/schedule (real diltiazem ER is dosed once daily) — they were
      // measured directly against this engine's own PK_PARAMS (queue item 39
      // probe): PK_PARAMS' diltiazem entry is calibrated for acute IV-push
      // onset/offset (kel/k12/k21 on the order of minutes), so a literal
      // once-daily schedule washes out almost completely between doses under
      // THIS engine's kinetics (confirmed: central/peripheral concentration
      // ~0 at intervalMin=1440). intervalMin is therefore how often this
      // engine's own simplified kinetics need re-dosing to sustain a steady
      // chronic exposure, not the textbook clinical frequency. 60mg/240min
      // measured to land a modest, sub-maximal chronic rate/BP effect
      // (beta1Tone ~-0.18 vs an undosed control) — present and real, not
      // near-total blockade.
      pat.homeMeds = [...(pat.homeMeds || []), { id: "diltiazem", amount: 60, intervalMin: 240, route: "PO" }];
    },
  },

  // ===== HYPERLIPIDEMIA (comorbidity) =====
  // Queue item 21/23. Subtler than HTN: dyslipidemia's real prehospital-call
  // physiology is accelerating atherosclerosis in a COMPOSED cardiac
  // condition, not an acute-call vital-sign change of its own — see
  // patient.js's coronaryStenosis formula, which now reads
  // riskFactors.hld additively alongside riskFactors.cad. No progress():
  // a subclinical lesion does not evolve over a single call.
  hyperlipidemia: {
    initial: { riskFactors: { hld: true } },
  },

  // ===== DIABETIC VASCULOPATHY (comorbidity, composes with diabetesT2) =====
  // Queue item 21, continued. Two real, distinct, well-documented long-term
  // diabetic complications, deliberately kept in ONE condition (both are
  // "what ten years of poor glycemic control does to the vasculature and
  // nerves," not two independent diseases): accelerated atherosclerosis
  // (endothelial dysfunction/advanced glycation end-products — reuses the
  // SAME coronaryStenosis additive slot HLD uses, since both are
  // atherosclerosis accelerants landing on the same anatomical variable) and
  // autonomic neuropathy (blunts the baroreflex tachycardic response to
  // hypovolemia/shock — cardiovascular.js's updateAutonomic, the same
  // blunting idiom already used for elderly baroreflex attenuation). The
  // real teaching point: a diabetic hemorrhage patient may NOT show the
  // expected compensatory tachycardia, masking early shock behind a
  // deceptively normal-looking heart rate.
  diabeticVasculopathy: {
    initial: { riskFactors: { diabeticVascular: true } },
    progress(pat) {
      pat.autonomicNeuropathy = Math.max(pat.autonomicNeuropathy || 0, 0.6);
    },
  },

  // Chronic heart failure with reduced ejection fraction. A dilated, weakly
  // contracting ventricle that is already using its preload reserve — which is
  // why these patients tolerate a fluid bolus so badly.
  chronicHeartFailure: {
    initial: { contractilityFactor: 0.6, lusitropyFactor: 0.75 },
    progress(pat) {
      if (pat._chfSet) return;
      pat._chfSet = true;
      pat.chamberRemodeling = Math.max(pat.chamberRemodeling ?? 1, 1.35);  // eccentric dilation
      pat.sodiumRetentionDrive = Math.max(pat.sodiumRetentionDrive ?? 1, 1.1); // neurohormonal
      // Queue item 39: guideline-directed HFrEF therapy is built on a beta-
      // blocker (metoprolol succinate/carvedilol/bisoprolol — metoprolol is
      // the one already in this project's formulary with a working receptor
      // mechanism). 25mg — a real "starting" GDMT dose, not a titrated
      // target dose, appropriate for a patient who is already at their most
      // fragile on preload — chosen over the larger CAD dose below.
      // intervalMin=240 is the same engine-native "how often THIS PK model
      // needs re-dosing to sustain exposure" reasoning as hypertension's own
      // comment above, not a literal clinical schedule. Measured: beta1Tone
      // ~-0.18, a modest, present, sub-maximal chronic effect. Appended (not
      // assigned) for the same composition-safety reason hypertension's own
      // comment explains.
      pat.homeMeds = [...(pat.homeMeds || []), { id: "metoprolol", amount: 25, intervalMin: 240, route: "PO" }];
    },
  },

  // Takotsubo (stress) cardiomyopathy — "broken heart syndrome". An acute,
  // REVERSIBLE left-ventricular systolic dysfunction driven by a surge of
  // CIRCULATING catecholamines (adrenal-medullary discharge after emotional or
  // physical stress), with ANGIOGRAPHICALLY CLEAN coronaries. It mimics an acute
  // MI — chest pain, ST changes, a troponin leak — and is the trap the InterTAK
  // registry exists to catch: ~90% postmenopausal women, hospital mortality
  // ~4-5%, cardiogenic shock in ~5-10%, and full recovery of LV function over
  // 2-4 weeks (Templin, NEJM 2015; Lyon, JACC 2021; StatPearls NBK538160).
  //
  // WHY IT IS MODELLED AS WHOLE-CHAMBER PHYSIOLOGY, NOT SEGMENTAL GEOMETRY.
  // The signature is regional — an akinetic ballooning apex with a hyperkinetic
  // base — but this engine's LV is a single lumped chamber. Rather than fake
  // apex/base segments, takotsubo is represented by its EMERGENT whole-chamber
  // consequences: a reversible fall in global contractility (and therefore EF),
  // an elevated LVEDP, a prolonged QTc, and — the teaching point — the paradox
  // that catecholamines/inotropes make it WORSE. "Apical ballooning" is the
  // clinical interpretation of the global contractility drop, not a literal
  // geometry the model claims to reproduce.
  //
  // THE MECHANISM, AND WHY THE PARADOX EMERGES FOR FREE. At supraphysiological
  // concentrations the apical beta-2 adrenoceptor is thought to switch its
  // coupling from Gs (positive inotropy) to Gi (negative inotropy). The Gi arm
  // recruits the PI3K/Akt anti-apoptotic pathway, which is CARDIOPROTECTIVE —
  // it is why takotsubo stuns rather than infarcts, and therefore why it
  // recovers at all. So the same switch that drops contractility is the reason
  // the drop is reversible; the slow-recovery limb below is that pathway's
  // consequence, not a bolted-on timer. Because the biphasic contractility term
  // in updateContractility reads circulating + EXOGENOUS adrenergic drive (see
  // giDrive there), giving an inotrope pushes further into the Gi region and
  // deepens the dysfunction, while a beta-blocker pulls back toward recovery —
  // no if/then rule, it falls out of the curve.
  //
  // TWO INDEPENDENT TIME CONSTANTS. The circulating catecholamine surge clears
  // in hours (takotsuboSurge, fast); the myocardial stunning it triggers
  // persists for weeks (takotsuboStun, slow) as calcium overload, oxidative
  // stress and cellular edema resolve. These are NOT the same decay — the stun
  // is not the tail of the surge — so they are separate states. Within a
  // prehospital contact (minutes) neither moves much, which is correct: EF does
  // not recover during the call.
  takotsubo: {
    initial: { hr: 96, sbp: 118, rr: 20, glu: 108, pain: 7, blood: 6, rhythm: "sinus" },
    progress(pat, dt) {
      // One-time setup of the two states on first tick.
      if (pat.takotsubo == null) {
        pat.takotsubo = true;
        // Myocardial stunning severity (0..1). Set near-maximal at onset; this
        // is the SUSTAINED driver of the contractility drop and it decays slow.
        pat.takotsuboStun = 1.0;
        // Circulating catecholamine surge, in the engine's receptor-drive units
        // (comparable to _beta1Drug/_beta2Drug and catExcess, NOT plasma
        // concentration — the mapping from real catecholamine levels to this
        // scale is an internal calibration; what is pinned is the emergent EF,
        // ~40%, and the position above the Gi threshold). Sits near the K2=0.8
        // shoulder of the Hill term so exogenous catecholamines still have room
        // to push it higher, rather than saturating it.
        pat.takotsuboSurge = 0.7;
      }
      // FAST tau — the circulating surge clears over hours. In receptor units,
      // decay ~toward 0 with a ~1-2 h time constant. dt is in minutes.
      pat.takotsuboSurge = Math.max(0, (pat.takotsuboSurge ?? 0) - dt * 0.008);
      // SLOW tau — stunning resolves over ~2-4 weeks. This barely moves within a
      // prehospital call, which is the point: the ventricle stays stunned for
      // the duration of the contact and for weeks after. Rate set so a full
      // recovery takes ~3 weeks of continuous simulation.
      pat.takotsuboStun = Math.max(0, (pat.takotsuboStun ?? 0) - dt * 0.000033);
      // Diastolic dysfunction tracks the SLOW stun tau, not the acute surge:
      // impaired relaxation in takotsubo reflects calcium-handling abnormalities
      // that recover together with systolic function over weeks (not hours), so
      // it is gated by stun. Elevated LVEDP (>11 mmHg in 93%) emerges from the
      // reduced lusitropy through the existing diastolic-stiffness limb.
      pat.lusitropyFactor = clamp(1 - 0.30 * (pat.takotsuboStun ?? 0), 0.6, 1);
      // QTc prolongation ALSO tracks the slow tau, peaking over days (documented
      // peak day 3-4), because it reflects myocardial edema and altered
      // repolarisation rather than the acute catecholamine level. This feeds the
      // existing qtc term and therefore the torsades limb — takotsubo carries a
      // real ventricular-arrhythmia risk, which is why these patients are
      // monitored 48-72 h. Exposed as a per-condition QTc offset in seconds.
      pat.qtcConditionOffset = 0.06 * (pat.takotsuboStun ?? 0);
    },
  },

  // ===== ACQUIRED LONG QT / TORSADES SUBSTRATE (physiology queue item 3) =====
  // The torsades RHYTHM itself has been fully modeled for a while now
  // (self-termination, defibrillation, magnesium's Tzivoni-anchored
  // suppression — see cardiovascular.js) but nothing in the tree could ever
  // reach it: initiation needs arrhythmia.repol > 0.6 (updateRhythm), and the
  // largest substrate composable before this condition existed — severe
  // hypokalemia (K 2.0-2.5) plus amiodarone's potassium-channel blockade —
  // measured only 0.5. The rhythm was reachable only by a test harness
  // imposing it directly (mechanismWiring's "NOT ASSERTED, AND WHY" note).
  //
  // LITERATURE FIRST (item 7 step a). Acquired long QT / torsades classically
  // arises from the CONVERGENCE of several risk factors rather than any one
  // alone: bradycardia, hypokalemia, hypomagnesemia, and a QT-prolonging drug
  // (StatPearls, "Torsade de Pointes"; Roden, NEJM 2004;350:1013 "Drug-Induced
  // Prolongation of the QT Interval" — the factors compound, which is why any
  // one of them alone is common and safe while the combination is rare and
  // dangerous). Hypokalemia and hypomagnesemia commonly co-occur (shared
  // causes: diuretics, GI losses, poor intake) and each independently
  // prolongs repolarisation — exactly the two electrolyte terms already in
  // updateRhythm's qtc/a.repol formulas, so this condition is a convergence
  // of EXISTING mechanisms, not a new one.
  //
  // WIRED THROUGH EXISTING HANDLES (step c). pat.k (the same field
  // diabetesT2/CKD already use), pat.mg/_mgBase (magnesium's own persistent-
  // pool handle from pk.js, seeded low here instead of at its default-normal
  // baseline — the first condition to do so), hrBase (mild sinus bradycardia
  // — real but unremarkable on its own, so nothing on the initial vitals
  // alone reads as dangerous), and pat.qtcConditionOffset (the general
  // per-condition QTc handle takotsubo already established — here
  // representing a chronic QT-prolonging medication that is history, never a
  // dosed in-game drug).
  acquiredLongQT: {
    initial: { hr: 56, sbp: 116, rr: 14, glu: 96, pain: 0, blood: 5.6, rhythm: "sinus", k: 2.6 },
    sync(pat) {
      // One-time seed, not `initial`: patient.js's constructor does not read
      // an initial.mg override at all (this.mg is hardcoded to 1.0 — see the
      // dead-code note in the physiology queue), so the only way a condition
      // can reach magnesium is through pk.js's live pat.mg/_mgBase fields
      // directly, exactly as this seeds them. Same one-time-init pattern
      // seizurePostictal/polytraumaFall/stabChestTension already use for
      // brainInjury via sync(), copied rather than paraphrased.
      if (pat._lqtInit === undefined) {
        pat._lqtInit = true;
        pat.mg = 0.4;       // severe hypomagnesemia (symptomatic/arrhythmogenic is <0.5 mmol/L)
        pat._mgBase = 0.4;  // pk.js decays mg TOWARD _mgBase, not away from it — this HOLDS it low
      }
    },
    progress(pat) {
      // Chronic QT-prolonging medication. MEASURED against the engine's own
      // a.repol threshold, not guessed. First tried at 0.09 s: that held
      // a.repol at only ~0.45 settled (sub-threshold), which mostly fed the
      // engine's OTHER, slower ventricular-ectopy pathway instead — sustained
      // a.repol accumulates rhythmInstability until vtDrive>0.4 crosses
      // probabilistically, producing plain monomorphic VT, not torsades.
      // 0.16 s is what actually clears the instantaneous 0.6 initiation
      // threshold (measured a.repol ~0.73 settled at this patient's HR), and
      // sits at the severe end of the documented range for drug-induced QT
      // prolongation (StatPearls/case-series reports of methadone- and
      // antipsychotic-associated torsades commonly show QTc in the 500-650 ms
      // range, of which the baseline non-drug QTc — ~440 ms here, from the
      // hypokalemia/hypomagnesemia/bradycardia terms alone — is only part).
      // Torsades is a rare, severe event; calibrating to the severe end of a
      // documented range for the condition that exists specifically to
      // produce it is the correct reading of "identify against the engine's
      // own reachable range," not a tuned-to-pass number. This also gives
      // magnesium's existing magEAD suppression term real recurring episodes
      // to act on, closing the gap mechanismWiring's torsades section
      // flagged: "the engine cannot currently produce a patient whose own
      // substrate keeps restarting the rhythm."
      pat.qtcConditionOffset = 0.16;
      // Renal potassium handling (renal.js) retains potassium once serum K
      // is below its 4.0 setpoint, which would slowly correct this patient's
      // hypokalemia over the course of a call with no field potassium
      // replacement to fight it (there is none in this drug box — real EMS
      // protocols do not give IV potassium, correctly). Held at the same
      // severe level renal.js's own floor allows, rather than a stat write
      // nothing else composes with: this is what an ongoing GI/diuretic loss
      // outpacing the kidney's slow retention response looks like.
      pat.k = Math.min(pat.k, 2.6);
      // Torsades self-terminates in most untreated episodes (measured 9/10 in
      // mechanismWiring) and this condition's own untreated substrate can
      // recur, so the scenario's resolve() needs to know whether an episode
      // happened at ANY point during the call, not just whether the FINAL
      // tick's rhythm happens to still be torsades — otherwise a crew that
      // correctly gave magnesium during a since-self-terminated episode gets
      // no credit for it. Written here, read by the scenario via s.patient.
      if (pat.rhythm === "torsades") pat._everTorsades = true;
    },
  },

  // ===== THIRD-DEGREE (COMPLETE) AV BLOCK =====
  // Condition-library workstream, cardiac batch (physiology queue item 7).
  // Found while auditing cardiovascular.js for the AV-block work: the engine
  // already has a COMPLETE, working model of this rhythm that nothing had
  // ever reached. "chb" is a real PERFUSING rhythm state (cardiovascular.js's
  // PERFUSING/DYSSYNC/NO_ATRIAL_KICK tables all already include it), the
  // ventricular-escape HR clamp (25-45, catecholamine-modulated) already
  // exists, transcutaneous pacing already captures it (mechanismWiring's
  // existing pacing assertions use a bare mutate() to reach this exact
  // state), and ecg.js already has both a waveform and a read-out string
  // ("P waves and QRS marching independently. COMPLETE (3RD DEGREE) HEART
  // BLOCK.") for it. The only missing piece was a DISEASE that gets a
  // patient there — every one of those consumers was, before this, dead
  // machinery in the same sense pericardialEffusion and firstDegreeBlock
  // were (queue item 5).
  //
  // ETIOLOGY: idiopathic fibrodegenerative disease of the conduction system
  // (Lenegre-Lev disease) is the single most common cause of isolated
  // third-degree AV block in adults without an acute coronary event —
  // StatPearls, "Atrioventricular Block": progressive fibrosis/calcification
  // of the His-Purkinje system, usually in patients >60, presenting with
  // syncope (Stokes-Adams attacks), profound fatigue, or exertional dyspnea
  // from a fixed, rate-unresponsive cardiac output. Modeled as a STRUCTURAL,
  // INFRANODAL process — clinically the important distinction from a
  // reversible/vagally-mediated block, and the reason this condition sets
  // the new `pat.avNodalDisease` axis (cardiovascular.js) rather than
  // touching parasympathetic tone: atropine works by blocking vagal
  // input to the AV NODE, and an infranodal escape focus below a complete
  // block has no vagal innervation to block. That is not asserted as a
  // clinical claim here — it falls out for free, because avNodalDisease is
  // additive with (not routed through) the vagal term atropine actually
  // moves, which is exactly why drugs.js's atropine note ("USELESS in 2
  // degree type II or 3 degree block. Do not delay pacing for it.") could
  // already be written before any condition existed to make it true.
  thirdDegreeAVBlock: {
    initial: { hr: 40, sbp: 96, rr: 16, pain: 0 },
    progress(pat) {
      // Fixed, not evolving: this is a chronic structural process, not an
      // acute reversible one, so the patient presents already in complete
      // block rather than progressing into it mid-call (contrast with acs's
      // dynamic thrombus, which DOES belong on a progress() ramp). 0.99, not
      // 1.0, so the multiplicative av term (cardiovascular.js) never fully
      // zeroes out algebraically — avConduction still clamps to <0.05 and
      // crosses the engine's own chb threshold, which is what actually
      // matters; see the MEASURED note below.
      pat.avNodalDisease = 0.99;
    },
    // MEASURED (throwaway probe, settled abdPain baseline + this condition's
    // progress() applied every tick): avConduction 1.00 -> 0.02 within one
    // tick of onset, rhythm sinus -> chb within the engine's own existing
    // transition (avConduction <= 0.05), hr settles at the ventricular-escape
    // clamp (~33-38 depending on beta1Tone), co falls from a healthy ~6.0 to
    // ~2.6-3.0 L/min — symptomatic but (in a young/otherwise-healthy patient)
    // just above the engine's generic co<0.12 PEA floor, which is the
    // correct edge to sit on: real complete heart block is often tolerated
    // for a while before decompensating, which is why pacing is indicated
    // but not always immediately life-saving within a single call's window.
  },

  // ===== FIRST-DEGREE AV BLOCK =====
  // The mild end of the SAME avNodalDisease axis third-degree block uses —
  // deliberately built as one mechanism with two severities rather than two
  // mechanisms, per this workstream's own preference for graded disease over
  // duplicated coefficients (compare preeclampsia's single
  // arterialComplianceFactor covering its whole severity range). At this
  // level avConduction stays far above the chb entry threshold (measured
  // ~0.72, against a threshold of 0.05), so the rhythm-classification state
  // machine never engages — the ONLY observable is a prolonged but still
  // 1:1-conducting PR interval, which is the actual clinical definition of
  // first-degree block (PR > 0.20 s, every P wave still conducts). That
  // observable already existed and was already dead: `pat.firstDegreeBlock`
  // (cardiovascular.js) is recomputed every tick from pat.prInterval and was
  // never read by anything (queue item 5) because nothing had ever pushed
  // prInterval past 0.20 outside of a transient hyperkalaemic/drug state.
  // Usually asymptomatic and incidental — found on a monitor placed for some
  // OTHER complaint, not itself a 911 reason — so this is written as a
  // comorbidity condition meant to be COMPOSED with another (["ami",
  // "firstDegreeAVBlock"], the same array-composition buildPatient() already
  // supports for diabetesT2/coronaryArteryDisease) rather than a standalone
  // scenario. No treatment mechanism: real first-degree block does not get
  // treated in the field, which is itself the teaching point.
  firstDegreeAVBlock: {
    progress(pat) {
      // MEASURED: avNodalDisease 0.25 -> avConduction settles ~0.72 -> PR
      // interval ~0.23 s (base 0.16 * (1+(1-0.72)*1.8) = 0.256, pulled
      // toward that target on updateConduction's own 3s time constant) —
      // comfortably past the 0.20 s firstDegreeBlock threshold, comfortably
      // short of the chb/wideQRS state-machine's 0.05 avConduction floor.
      pat.avNodalDisease = Math.max(pat.avNodalDisease || 0, 0.25);
    },
  },

  // ===== SECOND-DEGREE AV BLOCK, TYPE I (WENCKEBACH) =====
  // Cardiac conditions batch (physiology queue item 7). FOUND WHILE BUILDING
  // THIS: pat.avNodalDisease/avConduction (first-/third-degree block, above)
  // only ever fed the PR interval and the binary sinus<->chb classification
  // — nothing reduced the actual ventricular RATE for an intermediate
  // severity, which is second-degree block's entire clinical content (SOME
  // atrial impulses fail to conduct, so ventricular rate is genuinely lower
  // than atrial rate — unlike first-degree's preserved 1:1 conduction).
  // Fixed generically in cardiovascular.js (a smooth conduction-ratio
  // approximation reducing HR as avConduction falls below 0.65, a no-op
  // above that so first-/third-degree block are untouched), not specially
  // for this condition. This continuous-tick engine has no clean way to
  // track individual dropped P:QRS beats (the same documented limitation as
  // afib/flutter's R-R irregularity) — stated honestly rather than faked.
  //
  // ETIOLOGY: classically VAGOTONIC — increased parasympathetic tone at the
  // AV node (well-conditioned athletes, sleep, inferior-MI vagal reflex),
  // usually benign and rarely progresses to complete block acutely
  // (StatPearls, "Second-Degree Atrioventricular Block"). Modeled with BOTH
  // an elevated resting parasympathetic tone AND a moderate avNodalDisease
  // baseline — pure vagal tone alone could not reach a clinically obvious
  // conduction-ratio deficit (the existing parasympathetic term in
  // updateConduction is calibrated small, correctly, since real vagal tone
  // swings are physiologically modest), so the disease-severity axis
  // supplies most of the deficit while the vagal component supplies a real,
  // if modest, ATROPINE-RESPONSIVE piece — the actual clinical distinction
  // from Type II below.
  secondDegreeAVBlockTypeI: {
    initial: { hr: 65, sbp: 100, rr: 16, pain: 0 },
    progress(pat) {
      pat.avNodalDisease = 0.45;
      pat.parasympathetic = Math.max(pat.parasympathetic || 0, 0.92);
    },
    // MEASURED (throwaway probe, real scenario CARD-034, 5-minute settle):
    // rhythm stays "sinus" (no beat-by-beat drop to classify, per the
    // documented limitation above). Untreated hr 54.9 vs a healthy ~94.5,
    // co 4.13 vs a healthy 6.00, avConduction 0.521 — a real, measurable
    // conduction-ratio deficit, meaningfully short of third-degree block's
    // collapse. Atropine: hr 54.9 -> 69.0, co 4.13 -> 4.49, avConduction
    // 0.521 -> 0.550 — a real, correctly-directioned improvement (the vagal
    // component of the deficit clears — see the updateConduction comment on
    // why atropine's vagalBlock now reaches this term), honestly modest
    // rather than inflated to look dramatic, and clearly larger than Type
    // II's own measured atropine response below.
  },

  // ===== SECOND-DEGREE AV BLOCK, TYPE II (MOBITZ II) =====
  // The dangerous end of the same axis: INFRANODAL disease (below the AV
  // node, in the His-Purkinje system), which carries a real risk of sudden
  // progression to complete heart block and is NOT meaningfully vagally
  // mediated — atropine can raise sinus rate without improving infranodal
  // conduction at all, which is why ACLS treats it as a "pace, don't wait
  // on drugs" rhythm (atropine's own note in drugs.js already says "USELESS
  // in 2° type II or 3° block" — this condition is the first thing that
  // actually tests that line). No parasympathetic elevation (this is not
  // vagotonic disease) — avNodalDisease alone, set high enough to sit
  // clearly in the intermediate conduction-ratio zone, well short of the
  // chb threshold (this is still SOME conduction, by definition, or it
  // would be third-degree block).
  secondDegreeAVBlockTypeII: {
    initial: { hr: 50, sbp: 92, rr: 16, pain: 0 },
    progress(pat) {
      pat.avNodalDisease = 0.75;
    },
    // MEASURED (throwaway probe, real scenario CARD-035, 5-minute settle):
    // rhythm stays "sinus". Untreated hr 39.1, co 3.19, avConduction 0.250 —
    // more severe than Type I (0.521), appropriately closer to (but clearly
    // short of) third-degree block's collapse. Atropine: hr 39.1 -> 46.2,
    // co 3.19 -> 3.61, but avConduction UNCHANGED at exactly 0.250 — a real,
    // subtler finding than "atropine does nothing," and a more precise
    // teaching point than first drafted: because this rhythm stays
    // classified "sinus" (unlike chb, which fully overrides hr from
    // beta1Tone alone), atropine's direct vagolytic HR bump still raises the
    // SINUS rate somewhat, but the underlying AV conduction RATIO — the
    // actual disease — does not improve at all, which is exactly the real
    // clinical hazard ACLS teaches for Mobitz II (atropine can raise the
    // atrial rate delivered to an already-marginal infranodal conduction
    // system without fixing the block itself, unlike Type I's real,
    // vagally-mediated improvement above). Pacing: hr -> 70.0, co 3.19 ->
    // 4.03 — a genuine, complete correction, the same PACING mechanism
    // verified for CHB.
  },

  // ===== ATRIAL FIBRILLATION (with rapid ventricular response by default) =====
  // Cardiac conditions batch (physiology queue item 7). Grep before writing
  // confirmed "afib" was fully wired into cardivascular.js's rhythm
  // machinery — PERFUSING, correctly excluded from the DYSSYNC ventricular-
  // dyssynchrony penalty (it conducts down the normal His-Purkinje system,
  // narrow-complex, unlike VT/chb), and ecg.js already carries both a
  // waveform and read-out text for it — with NOTHING in the codebase ever
  // setting pat.rhythm to it. The one real missing mechanism, the
  // "irregularly irregular" ventricular response that is the rhythm's actual
  // defining sign, is now added at the hr = clamp(...) branch in
  // cardiovascular.js; see that comment for the model and its limits.
  //
  // NOT MODELED, stated honestly rather than silently: loss of atrial kick
  // (the ~15-20% preload contribution lost when the atria fibrillate instead
  // of contracting) is documented, investigated, and DELIBERATELY left
  // unimplemented — the item 1 fix already tried wiring NO_ATRIAL_KICK's
  // atrial-elastance attenuation into the authoritative full-loop solver and
  // measured it WORSE (an emergent LA-pressure-backup compensation that nets
  // MORE filling, not less, at a compressed diastolic window — see the
  // "INVESTIGATED AND REJECTED" comment at that site). This condition
  // reaches real hemodynamic compromise through the rate alone (RVR engages
  // the SAME sysFrac/Weissler diastolic-filling-time mechanism item 1 built
  // for any tachycardia, narrow- or wide-complex), which is the honest,
  // measured route available right now, not a claim that atrial kick loss is
  // modeled.
  atrialFibrillation: {
    // RVR (rate ~150) by default: a well rate-controlled AFib patient
    // (~70-90) is usually the incidental-finding, "not every call is a
    // thriller" case (same territory as firstDegreeAVBlock) rather than one
    // that carries its own scenario. A scenario composing this condition
    // with its own `patient:{hr:78}` override (which wins over this initial,
    // per buildPatient's own documented merge order) gets ordinary
    // rate-controlled AFib for free, without a second condition.
    initial: { rhythm: "afib", hr: 150, sbp: 104, rr: 18, pain: 0 },
    progress(pat) {
      // Held every tick rather than relying on nothing-reverts-it: nothing
      // ELSE in the engine currently reverts a persisted "afib" classification
      // on its own (unlike wideQRS/peakedT's explicit potassium-based
      // reversion), but asserting it here keeps the condition self-contained
      // and correct even if that changes later.
      pat.rhythm = "afib";
    },
    // MEASURED (throwaway probe, real scenario CARD-030, 5-minute settle,
    // HR sampled every 20s): rhythm holds "afib" indefinitely; HR samples
    // 127-173 around a mean ~146 (stdev 16.2), against any sinus-rhythm
    // scenario's stdev around 1-2 — a real, sampled irregularity, not a
    // fixed number with a label. co 6.19 L/min, MAP 96.9 — NOT depressed
    // versus a healthy ~6.0 baseline. Stated honestly because it does not
    // match this condition's own first-draft comment (written before
    // measuring, corrected here per this project's own instrument-first
    // discipline): AFib is excluded from cardiovascular.js's DYSSYNC penalty
    // (conducts down the normal His-Purkinje system, exactly like SVT), and
    // item 1's own measurements already established that a synchronous
    // tachycardia in this rate range is "barely touched" (SVT HR 170: CO
    // 6.77->6.49) — AFib at a comparable mean rate behaves the same way,
    // which is internally consistent with the engine's existing precedent,
    // not a new defect. Real hemodynamic compromise from RVR AFib (which
    // does happen clinically) would need either a genuinely faster sustained
    // rate, a comorbid/older heart, or the still-undocumented atrial-kick
    // mechanism — this condition does not manufacture instability that
    // isn't there. Diltiazem (calciumChannel receptor) lowers the
    // pre-jitter rate the same way it lowers any other tachycardia, which
    // this condition's HR branch multiplies noise onto — MEASURED: mean HR
    // over a 60s post-dose window fell from 146 to ~115. Cardioversion
    // (pk.js's rhythmFix:"cardiovert", extended in this batch to cover AFib
    // as well as SVT) converts rhythm back to "sinus" — MEASURED, single
    // tick after a t+60s dose. Adenosine correctly does nothing (still gated
    // to rhythmFix:"svt" only) — MEASURED, rhythm stays "afib".
  },

  // ===== ATRIAL FLUTTER =====
  // Cardiac conditions batch (physiology queue item 7). A single re-entrant
  // circuit in the right atrium (typically around the cavo-tricuspid
  // isthmus) firing at a near-fixed ~300/min, reaching the ventricle through
  // a QUANTIZED AV conduction ratio — most commonly 2:1, giving the classic
  // ~150 bpm regular tachycardia (StatPearls, "Atrial Flutter"). Built as
  // its own rhythm state (cardiovascular.js) rather than a variant of afib,
  // because the ONE clinically load-bearing distinction — regular (flutter)
  // vs. irregularly irregular (afib) ventricular response — is exactly the
  // finding a candidate is meant to make on the monitor, and collapsing both
  // into "afib" would erase the actual teaching point. Composable
  // (["ami", "atrialFlutter"], the same array pattern coronaryArteryDisease/
  // diabetesT2 already use) since flutter, like afib, is frequently an
  // incidental or comorbid finding rather than the chief complaint itself.
  atrialFlutter: {
    initial: { rhythm: "flutter", hr: 150, sbp: 108, rr: 18, pain: 0 },
    progress(pat) {
      pat.rhythm = "flutter"; // held every tick, same idiom as atrialFibrillation
    },
    // MEASURED (throwaway probe, real scenario CARD-033, 5-minute settle):
    // rhythm holds "flutter"; hr settles regular at 149.7 with essentially NO
    // sample-to-sample variance (stdev 0.14, against afib's own measured
    // stdev ~17-19 at a comparable mean rate — the actual point of building
    // this as a separate rhythm). co 5.06 vs a healthy 6.00, mildly but not
    // dramatically depressed — consistent with item 1's own precedent that a
    // narrow-complex tachycardia in this rate range, synchronous and
    // DYSSYNC-excluded, is "barely touched" hemodynamically. Diltiazem lowers
    // the rate for real (149.7 -> 125.9 mean hr, a genuine shift within the
    // 75-160 conduction-ratio band, not a cosmetic number) — co also fell
    // slightly (5.06 -> 4.59), which is diltiazem's own direct negative
    // inotropy outweighing the modest filling-time gain from a rate this far
    // from the Weissler formula's steep zone (item 1 already measured that
    // rates in this range are only mildly filling-time-sensitive), not a
    // sign the rate control was wrong. Synchronised cardioversion converts to
    // sinus (pk.js's rhythmFix:"cardiovert", extended in this batch to
    // include "flutter" specifically because it is unusually cardioversion-
    // responsive clinically, often converting at low energy — a real,
    // distinct teaching point from afib) — MEASURED, confirmed. Adenosine
    // does nothing (still gated to rhythmFix:"svt" only) — MEASURED, rhythm
    // stays "flutter". NOT MODELED: adenosine's real diagnostic use in
    // flutter (a transient AV-nodal block that briefly unmasks flutter waves
    // without terminating the rhythm) would need a new short-lived effect
    // distinct from any existing mechanism; stated honestly as unmodeled
    // rather than approximated.
  },

  // ===== MONOMORPHIC VENTRICULAR TACHYCARDIA WITH PULSE =====
  // Cardiac conditions batch (physiology queue item 7). "VT" was already a
  // fully-plumbed rhythm state (hr clamps 150-220, DYSSYNC 0.6 dyssynchrony
  // penalty, shockable via defibrillation) — but every existing consumer
  // treats it as immediately critical/pulseless, and nothing in the whole
  // codebase composes a VT patient who is genuinely PERFUSING. That is a
  // real, distinct ACLS teaching case: a stable-appearing patient in a
  // regular wide-complex tachycardia, managed with synchronised
  // cardioversion or antiarrhythmics, NOT immediate defibrillation — the
  // clinical decision hinges entirely on assessing the pulse, not the rhythm
  // name. Etiology: a scar-based re-entrant circuit around an OLD healed MI
  // (StatPearls, "Ventricular Tachycardia") — chronic and structural, unlike
  // acs's acute, actively-propagating ischemic substrate, so this condition
  // deliberately does NOT drive atp/energyFailure down the way acs does; a
  // fixed, modest contractilityFactor reduction represents the old scar's
  // baseline effect on an otherwise-normal ventricle, small enough that the
  // DYSSYNC penalty and rate alone (not acute ischemia) are what the patient
  // is actually compensating against.
  monomorphicVT: {
    initial: { rhythm: "VT", hr: 180, sbp: 108, rr: 18, pain: 1 },
    progress(pat) {
      pat.rhythm = "VT";
      pat.contractilityFactor = Math.min(pat.contractilityFactor ?? 1, 0.85);
    },
    // MEASURED (throwaway probe, real scenario CARD-036, 5-minute settle):
    // rhythm holds "VT"; hr 180.0, co 4.47, map 88.0 — a genuinely PERFUSING
    // range (contrast a sicker/more acutely ischemic VT patient, who could
    // collapse on the same rhythm name), demonstrating the real point:
    // rhythm name alone does not determine pulselessness in this engine any
    // more than it does in a real patient — perfusion is computed the same
    // way for every rhythm. Synchronised cardioversion converts to sinus —
    // MEASURED, confirmed (defib already terminates it too, via the
    // pre-existing rhythmFix===1 ["VF","VT","torsades"] list; cardiovert was
    // extended to include "VT" in this batch specifically for this
    // stable/pulsed case — see the pk.js comment).
  },

  // ===== WOLFF-PARKINSON-WHITE SYNDROME =====
  // Cardiac conditions batch (physiology queue item 7). An accessory
  // conduction pathway (bundle of Kent) bypassing the AV node's normal
  // decremental delay. Built as a COMPOSABLE comorbidity (["ami","wpw"]-
  // style, no standalone scenario of its own) because WPW alone, at rest, is
  // an incidental ECG finding (short PR, delta wave) with no acute
  // physiology to model — the real, testable, DANGEROUS content only
  // appears when it is composed with atrialFibrillation (see the new
  // pat.accessoryPathway branch in cardiovascular.js's HR computation): the
  // bypass tract does not share the AV node's rate-limiting property, so
  // AFib conducting down it can reach genuinely lethal ventricular rates,
  // and AV-nodal-blocking drugs (diltiazem/adenosine/beta-blockade) do not
  // help and are relatively contraindicated because they can shunt MORE
  // conduction down the pathway instead.
  //
  // NOT MODELED, stated honestly: the resting short-PR/delta-wave ECG
  // finding itself has no mechanism here (prInterval's formula has no
  // "faster than normal" axis, only avNodalDisease's slowing one) — a
  // scenario composing this condition presents the delta wave as narrative
  // probe text (a 12-lead reading), not a live physiological observable.
  // That is a real, if minor, gap: unlike the AFib-interaction mechanism
  // above, nothing downstream currently reads for a short PR. Flagged
  // rather than built as a decorative field with no consumer.
  wpw: {
    progress(pat) {
      pat.accessoryPathway = true;
    },
    // MEASURED (throwaway probe, composed with atrialFibrillation, real
    // scenario CARD-037, 5-minute settle): WPW + AFib reaches mean hr 208.4
    // (stdev 17.2, genuinely irregular), far exceeding plain
    // atrialFibrillation's own measured ~146-151 mean at a comparable
    // substrate — confirmed reaching the higher 150-280 clamp band, not the
    // ordinary 40-200 one. Diltiazem given to the WPW+AFib patient does NOT
    // lower the rate the way it does for plain AFib (mean hr 208.4 -> 207.7,
    // essentially flat, versus plain AFib's already-measured 146.6 -> 126.4)
    // — the mechanism-accurate, clinically correct, and genuinely dangerous
    // non-response this condition exists to teach. co (5.42, WPW+AFib) is
    // not dramatically depressed in this otherwise-healthy 29-year-old —
    // consistent with item 1's own established finding that a structurally
    // normal heart's coronary reserve tolerates extreme rate alone without
    // spontaneously collapsing over a short probe window; the real clinical
    // danger of this combination is degeneration to VF from the extreme,
    // irregular rate, not a guaranteed instant collapse, and is stated that
    // way in the scenario rather than oversold as an immediate crash.
  },

  // ===== PERICARDIAL TAMPONADE (medical) =====
  // Cardiac conditions batch (physiology queue item 7). Queue item 5 already
  // flagged this exact gap: `pat.pericardialEffusion` is READ correctly by
  // updateVenousReturn (cardiovascular.js) — it raises pericardial pressure,
  // which combines with intrathoracic pressure into pat.cardiacExternalP,
  // which throttles ventricular filling exactly the way real tamponade
  // equalizes diastolic pressures and starves preload — but no condition in
  // the whole codebase had ever WRITTEN it, including aorticDissection, the
  // one tamponade-adjacent condition that already exists (it bypasses this
  // machinery entirely via a direct venousResistance write). This is the
  // same "declared mechanism nothing reaches" class item 5 was written to
  // catch, closed the same way afib/chb were: find the ready machinery,
  // write the missing disease.
  //
  // ETIOLOGY: uremic pericarditis with a large, slowly-accumulating effusion
  // in a hemodialysis-dependent patient who has missed dialysis — one of the
  // classic MEDICAL (non-traumatic) causes of tamponade, distinct from the
  // surgical/traumatic route stabChestTension already models, and a real,
  // common EMS presentation (StatPearls, "Cardiac Tamponade": malignancy,
  // uremia and idiopathic/viral pericarditis are the leading medical causes).
  // Given a real time course rather than presenting already maximal: this
  // call catches the patient mid-decompensation (effusion still
  // accumulating, approaching but not yet at its worst), which is what makes
  // early recognition and prompt transport matter, in contrast to
  // thirdDegreeAVBlock's fixed chronic presentation.
  pericardialTamponade: {
    initial: { hr: 112, sbp: 96, rr: 22, pain: 3 },
    progress(pat, dt) {
      // Exponential approach to a severe-but-survivable target — same
      // hand-rolled time-constant idiom conditions.js already uses
      // (neonatalTransition's vigor ramp), since approach() itself lives in
      // cardiovascular.js and isn't imported here. FIRST TRIED at 0.72: measured
      // co collapsing to 0.78 L/min and map to 36 by 15 minutes — past the
      // engine's own survivable range and, combined with a fluid bolus at that
      // point, drove map to an unphysiological 262 mmHg (cvp pinned at its
      // clamp ceiling while the baroreflex kept fighting a near-zero co with
      // nowhere left to go). Lowered to 0.5, the same "land inside the
      // engine's own survivable zone" discipline the acs condition's
      // coronaryStenosis=0.54 already used, rather than chasing the
      // extrapolated edge of a model never validated there.
      const k = Math.min(1, dt / 6);
      const target = 0.5;
      pat.pericardialEffusion = (pat.pericardialEffusion || 0) + (target - (pat.pericardialEffusion || 0)) * k;
    },
    // MEASURED (throwaway probe, real scenario CARD-031, after the blood-
    // ratchet fix below): pericardialEffusion climbs 0 -> 0.28 by 5 min,
    // 0.46 by 15 min (still approaching the 0.5 target). co falls from a
    // healthy ~5.9 to 4.34 at 5 min, 2.67 at 15 min; map 101 (healthy) -> 86
    // at 5 min -> 69 at 15 min — a real, worsening obstructive-shock
    // picture, not a step change. cvp RISES as the same venous return backs
    // up behind a heart that increasingly cannot accept it (6.1 -> 10.5
    // mmHg by 15 min) even as cardiac filling and output fall — the
    // mechanistic form of the clinical JVD sign, emergent from the
    // transmural-pressure math rather than a separate scripted "JVD
    // present" flag. A single 500 mL saline bolus is a real but modest,
    // temporizing improvement over the untreated trajectory at the same
    // elapsed time — MEASURED: given at 5 min, co 3.19 (untreated) -> 3.49
    // (treated) by 10 min; given at 10 min, co 2.67 (untreated) -> 3.05
    // (treated) by 15 min — not a cure, exactly the taught prehospital
    // ceiling for tamponade (fluid buys time; pericardiocentesis is the
    // fix, and this drug box has no field procedure for that).
    //
    // A REAL ENGINE DEFECT SURFACED AND FIXED WHILE MEASURING THIS, not a
    // tamponade-specific issue: the first attempt at this condition (target
    // 0.72) plus a saline bolus drove map to a physiologically meaningless
    // 262 mmHg. Traced, not guessed: pk.js's fluid-effect handler was doing
    // `pat.totalBloodVol += delta` EVERY TICK a dose's curve stayed active —
    // the identical ratchet shape queue item 25 already fixed for glucose,
    // just never noticed for blood/temp/k because most scenarios don't
    // sustain a long post-bolus window the way this condition's fluid-bolus
    // test does. Whole blood/plasma declare `dur:9999` (~166 min), so any
    // transfusion in a trauma scenario was ratcheting totalBloodVol for
    // effectively the rest of the call. Fixed at the source (pk.js) on the
    // same rising-edge-once pattern as glucose/magnesium — see that fix's
    // comment for the full writeup and the mechanismWiring assertion that
    // now guards it.
  },

  // ===== SYMPTOMATIC BRADYCARDIA (sinus node dysfunction) =====
  // Cardiac conditions batch (physiology queue item 7). Distinct from
  // thirdDegreeAVBlock on purpose: this is a CHRONOTROPIC failure (the SA
  // node itself firing too slowly) rather than a CONDUCTION failure (P
  // waves failing to reach the ventricle) — avConduction/avNodalDisease are
  // never touched, so the rhythm classification correctly stays "sinus"
  // throughout. That is the actual clinical distinction the ACLS
  // bradycardia algorithm's two entry points (sinus node disease vs.
  // high-degree AV block) are testing a candidate on, and building this as
  // its own hrBase-only mechanism rather than a milder avNodalDisease keeps
  // that distinction real instead of collapsing both into "slow heart."
  // Etiology: idiopathic degenerative fibrosis of the sinoatrial node — the
  // same disease-process family as thirdDegreeAVBlock's Lenegre-Lev
  // conduction disease, one node over (StatPearls, "Sick Sinus Syndrome" /
  // "Sinus Bradycardia").
  symptomaticBradycardia: {
    initial: { hr: 38, sbp: 90, rr: 16, pain: 0 },
    progress(pat) {
      // Held every tick, same "mutate holds it" idiom as thirdDegreeAVBlock.
      // 38, not lower: ACLS defines symptomatic bradycardia as HR<50 WITH
      // signs of poor perfusion, and 38 leaves room for atropine's fixed
      // +25 bpm vagolytic bump (cardiovascular.js, updateCardiovascular) to
      // read as a real, measurable, PARTIAL response rather than a rounding
      // error — the correct nuance versus thirdDegreeAVBlock's infranodal
      // block, where atropine does essentially nothing (an escape focus
      // below a complete block has no vagal input left to block). Sinus
      // node automaticity, even when diseased, is still modulated by vagal
      // tone, so atropine genuinely helps some here — just not all the way
      // to a healthy rate, which pacing alone closes.
      pat.hrBase = 38;
    },
    // MEASURED (throwaway probe, real scenario CARD-032 — the 82-year-old's
    // own age-blunted baroreflex matters here, see below — 3-minute settle,
    // 5-minute watch): rhythm stays "sinus" throughout in every arm
    // (confirms this is a pure rate defect, not a reclassified conduction
    // one). FIRST PROBED against a young/healthy default patient (abdPain)
    // and measured a near-miss: hr only fell to 69.9 (vs a 94.5 healthy
    // baseline) because a young patient's intact baroreflex raises
    // beta1Tone enough to claw most of the rate back — co barely moved
    // (6.00 -> 5.35). Re-probed against CARD-032's own 82-year-old patient,
    // where cardiovascular.js's existing elderly-baroreflex-blunting term
    // (not something this condition adds) leaves much less compensatory
    // reserve: hr settles 44.8, co 6.00 (healthy control) -> 3.54 L/min, map
    // 100.9 -> 64.6 mmHg — genuinely symptomatic and hypoperfusing, the
    // correct place for an ACLS-teaching bradycardia to sit, and a real
    // demonstration that this condition's severity is age-dependent through
    // an already-existing mechanism rather than something hand-tuned per
    // scenario. Atropine: hr 44.8 -> 58.1, co 3.54 -> 4.02, map 64.6 -> 71.6
    // — a real, partial, genuinely atropine-responsive rescue, the opposite
    // direction from thirdDegreeAVBlock's "does essentially nothing."
    // Transcutaneous pacing: captures and imposes hr 70.0 exactly as it
    // does for CHB (same PACING mechanism, already verified there); co 4.02
    // and map 72.4 land close to atropine's numbers despite the higher
    // imposed rate — NOT a bug, traced to the same Weissler diastolic-
    // filling-time mechanism item 1 built: a faster imposed rate shortens
    // filling time enough to trade off much of its own stroke-volume gain,
    // so pacing's real clinical advantage here is a RELIABLE, controlled
    // rate rather than a dramatically higher output over atropine in this
    // particular patient.
  },

  // ===== DIGOXIN TOXICITY =====
  // Cardiac conditions batch (physiology queue item 7). Digoxin inhibits the
  // myocardial Na-K-ATPase pump: intracellularly this raises calcium
  // (enhancing automaticity/triggered activity), and the resulting failure
  // to move potassium back into cells raises SERUM potassium — a real,
  // clinically important feature (serum K level correlates with mortality
  // in acute digoxin toxicity, StatPearls "Digoxin Toxicity") reused here by
  // composing with the ALREADY EXISTING hyperkalaemia pathway (effK, the
  // peakedT/wideQRS state machine) rather than inventing a parallel one. Also
  // increases vagal tone and directly slows AV conduction (the classic
  // "any rhythm plus a block" digoxin ECG teaching pattern) — modeled with
  // the SAME avNodalDisease + elevated parasympathetic combination as
  // secondDegreeAVBlockTypeI above, since digoxin's AV-nodal slowing genuinely
  // IS partly vagally mediated (vagotonic and atropine-partially-responsive,
  // unlike Mobitz II's infranodal disease). Ectopy (the real intracellular-
  // calcium-driven triggered-activity mechanism) is represented through the
  // engine's existing generic rhythmInstability aggregate — conditions.js's
  // own header comment documents this as the supported route (compare AMI's
  // identical use of it) — rather than reaching into a.triggered, which is
  // keyed to catecholLevel/serum calcium and would misrepresent an
  // intracellular-calcium mechanism as an extracellular one.
  digoxinToxicity: {
    initial: { hr: 48, sbp: 96, rr: 14, pain: 0 },
    progress(pat, dt) {
      pat.avNodalDisease = Math.max(pat.avNodalDisease || 0, 0.4);
      pat.parasympathetic = Math.max(pat.parasympathetic || 0, 0.9);
      pat.k = Math.max(pat.k ?? 4, 5.5);
      pat.rhythmInstability = clamp((pat.rhythmInstability || 0) + dt * 0.025, 0, 1);
    },
    // MEASURED (throwaway probe, real scenario CARD-038, 5-minute settle):
    // rhythm stays "sinus" (k settles 5.63, below the 6.0 peakedT / 7.0
    // wideQRS thresholds — a toxic but not maximally severe presentation, by
    // design). Untreated hr 42.4, co 3.41, map 65.5 — genuinely depressed
    // versus healthy, comparable in magnitude to secondDegreeAVBlockTypeI's
    // own measured deficit (same avNodalDisease/parasympathetic
    // combination). Atropine: hr 42.4 -> 56.1, co 3.41 -> 3.96 — a real,
    // partial improvement for the same reason Type I's is real (the vagal
    // component clears), not a full fix.
  },

  // ===== PERICARDITIS =====
  // Cardiac conditions batch (physiology queue item 7). Acute pericarditis
  // WITHOUT a hemodynamically significant effusion — deliberately the
  // MECHANICAL OPPOSITE of pericardialTamponade's own progression of the
  // same underlying process (pericardial inflammation) to the point of
  // externally compressing the heart. The entire teaching point of
  // uncomplicated pericarditis is that a patient can have alarming,
  // sharp, pleuritic, positional chest pain (classically worse supine,
  // relieved leaning forward) with essentially NORMAL cardiac function —
  // no ischemia, no contractility loss, no arrhythmia — which is exactly
  // why it must be distinguished from ACS on history and exam rather than
  // from how sick the patient looks. No progress(): deliberately no
  // ATP/EF/contractility mechanism at all, matching that teaching point
  // directly rather than approximating a "mild" version of ACS's ischemic
  // machinery, which would misrepresent a fundamentally different disease
  // process as a lesser version of the same one.
  pericarditis: {
    initial: { hr: 92, sbp: 118, rr: 18, pain: 5 },
    // MEASURED (throwaway probe, real scenario CARD-039, 5-minute settle):
    // atp stays at exactly 1.000 — zero ischemia, the load-bearing proof
    // that this condition does not touch cardiac energetics at all. co 4.97
    // versus a healthy 6.04, ef 0.508 versus a healthy 0.536 — a real but
    // MODEST reduction, honestly attributable to the initial resting
    // tachycardia and pain alone (the same Weissler diastolic-filling-time
    // effect any painful, tachycardic patient shows, per item 1), not to any
    // pericarditis-specific mechanism — there isn't one, by design.
  },

  // ===== MYOCARDITIS =====
  // Cardiac conditions batch (physiology queue item 7). Direct inflammatory
  // (typically post-viral) myocardial injury — unlike pericarditis
  // immediately above, this DOES genuinely depress contractility, through
  // the same contractilityFactor handle ACS's necrosis and takotsubo's
  // catecholamine stunning already use, but from a third, distinct
  // etiology (inflammatory injury, not ischemic necrosis or catecholamine
  // stunning) reusing the mechanism rather than duplicating it. Given a
  // genuinely slow time course (minutes-to-hours in real myocarditis,
  // approximated here as several minutes so a single call can observe it
  // trending) rather than an instant step change, per this workstream's own
  // "give it a real time course" discipline. Also raises arrhythmia risk
  // (inflamed myocardium is a real substrate for ectopy) through the same
  // generic rhythmInstability aggregate digoxinToxicity/AMI already use.
  myocarditis: {
    initial: { hr: 108, sbp: 100, rr: 20, pain: 3 },
    progress(pat, dt) {
      // physiology.js's dispatcher passes dt in MINUTES ((s.t-lastUpdate)/60),
      // not seconds — a mistake first made here (an initial dt/300 assumed
      // seconds, giving an accidental 300-MINUTE/5-hour time constant instead
      // of the intended 5 minutes, measured: contractilityFactor moved only
      // 1.0->0.989 after a full 10-minute settle, versus roughly 1.0->0.55
      // expected). pericardialTamponade's own dt/6 (elsewhere in this file)
      // already got this right — dt/6 with dt-in-minutes IS a real 6-minute
      // time constant, confirmed by that condition's own measured values
      // matching the exponential-approach math exactly. Fixed here to dt/5
      // (a genuine 5-minute time constant, matching this comment's own
      // "several minutes so a single call can observe it trending").
      const k = Math.min(1, dt / 5);
      pat.contractilityFactor = (pat.contractilityFactor ?? 1) + (0.65 - (pat.contractilityFactor ?? 1)) * k;
      pat.rhythmInstability = clamp((pat.rhythmInstability || 0) + dt * 0.015, 0, 1);
    },
    // MEASURED (throwaway probe, real scenario CARD-040): a first attempt
    // used dt/300 assuming dt was in seconds; physiology.js's dispatcher
    // actually passes dt in MINUTES, giving an accidental 5-HOUR time
    // constant instead of the intended 5 minutes (contractilityFactor moved
    // only 1.0->0.989 after a full 10-minute settle) — fixed to dt/5, a real
    // 5-minute time constant, matching pericardialTamponade's own dt/6
    // elsewhere in this file (that condition's measured values already
    // confirmed dt is in minutes). Re-measured at the corrected tau: at 2
    // min, contractilityFactor 0.886, co 5.07 (barely trending yet); at 10
    // min, contractilityFactor 0.697 (versus a target of 0.65 — matches the
    // exponential math, 1-e^-2 = 86.5% converged, to the digit), ef 0.398
    // (healthy control ef 0.536), co 4.66 — a real, trending injury across a
    // realistic call timescale, not a step change and not a stalled one.
  },

  // ===== HYPERTENSIVE URGENCY =====
  // Cardiac conditions batch (physiology queue item 7). Physiology queue
  // item 21 had flagged HTN as needing a new patient.js risk-factor
  // multiplier hook before it could be modeled — investigated, and that
  // turned out to be unnecessary: section 5's own note that "baseSVR is a
  // live handle" is correct and CONFIRMED BY MEASUREMENT (a throwaway probe
  // directly setting pat.baseSVR *= 1.6 on a resting patient raised sbp
  // 124.6->142.6 and map 100.9->119.9 through the real ODE solver, no
  // patient.js changes needed) — a condition can set it directly through
  // `progress()`, exactly like any other resting-tone handle. Severely
  // elevated blood pressure WITHOUT acute end-organ damage — the entire
  // teaching point is recognition and NOT aggressively lowering it in the
  // field (rapid correction risks watershed ischemia), contrast with
  // hypertensiveEmergency immediately below, which adds real end-organ
  // injury on top of the same afterload mechanism.
  hypertensiveUrgency: {
    initial: { sbp: 210, hr: 84, rr: 16, pain: 4 },
    progress(pat, dt) {
      // Target is a MULTIPLE of the patient's own fixed anatomical reference
      // (pat.ageProfile.baseSVR() — the same fixed denominator
      // cardiovascular.js's own restSvr computation uses), captured once,
      // not a hardcoded absolute — so this condition lands at the same
      // relative severity on a small elderly woman and a large young man,
      // rather than one hardcoded number that is severe for one body and
      // mild for another. MEASURED (isolated probe, before picking this
      // multiplier): baseSVR x1.6 -> sbp 144/dbp 111; x2.5 -> 163/133; x3.0
      // -> 171/142; x4.0 -> 183/158 — a real but STRONGLY DAMPENED,
      // sub-linear response (the ODE solver's own compensatory mechanisms
      // absorb much of a raw resistance change), so reaching classic
      // "severe" numbers needs a larger multiplier than the raw clinical
      // ratio would suggest. x3.0 chosen for urgency (severe, short of the
      // x4.0 emergency variant below).
      if (pat._htnRestSvr == null) pat._htnRestSvr = pat.ageProfile.baseSVR();
      const k = Math.min(1, dt / 3);
      const target = pat._htnRestSvr * 3.0;
      pat.baseSVR += (target - pat.baseSVR) * k;
    },
    // MEASURED (throwaway probe, real scenario CARD-041): sbp/dbp/map
    // genuinely reach severe-range hypertension through the real ODE
    // solver, not a scripted number, converging over several minutes rather
    // than instantly: 148/116 at 5 min, 155/124 at 10 min, 161/132 at 20
    // min (tau 3 min, still gently rising — a realistic call-length
    // trajectory). No edema, no consciousness change — deliberately nothing
    // else moves, matching the "urgency, not emergency" definition exactly.
  },

  // ===== HYPERTENSIVE EMERGENCY =====
  // The same afterload mechanism as hypertensiveUrgency, at a higher target,
  // PLUS a real, mechanistically distinct end-organ-damage marker: acute
  // afterload rising faster than the ventricle can adapt is a genuine cause
  // of "flash" pulmonary edema (a real hypertensive-emergency presentation,
  // not a fabricated symptom) — reusing the SAME pat.edema handle chf/
  // pulmonary-edema conditions already use, rather than inventing a
  // hypertension-specific edema mechanism. Hypertensive encephalopathy (the
  // OTHER classic end-organ presentation) was deliberately NOT attempted:
  // it is a hyperperfusion/cerebral-edema phenomenon, the opposite pole
  // from the low-perfusion unconsciousness mechanism this engine already
  // has, and forcing it through pat.brainInjury (a STRUCTURAL, permanent-
  // injury accumulator used for trauma) would misrepresent a reversible
  // functional state as permanent damage — stated honestly as unmodeled
  // rather than approximated with the wrong mechanism.
  hypertensiveEmergency: {
    initial: { sbp: 230, hr: 96, rr: 24, pain: 6 },
    progress(pat, dt) {
      if (pat._htnRestSvr == null) pat._htnRestSvr = pat.ageProfile.baseSVR();
      const k = Math.min(1, dt / 3);
      const target = pat._htnRestSvr * 4.0; // MEASURED: sbp/dbp 183/158 in isolation
      pat.baseSVR += (target - pat.baseSVR) * k;
      pat.edema = clamp((pat.edema || 0) + dt * 0.05, 0, 0.9);
    },
    // MEASURED (throwaway probe, real scenario CARD-042): sbp/dbp/map
    // exceed hypertensiveUrgency's own measured values at the same elapsed
    // time (161/132 at 5 min, 169/142 at 10 min, 179/151 at 20 min); edema
    // climbs from 0 to 0.25 at 5 min, 0.50 at 10 min, 0.90 at 20 min — a
    // genuine, TRENDING end-organ-damage marker (flash pulmonary edema from
    // acute afterload mismatch), not a step change and not shared with the
    // urgency variant.
  },

  // ===== PREMATURE VENTRICULAR CONTRACTIONS (isolated, idiopathic) =====
  // Cardiac conditions batch, continued (physiology queue item 7). Grep
  // before writing found pat.pvcFrequency (cardiovascular.js) already a
  // real, richly-computed aggregate of FOUR distinct substrates (ischemia,
  // hypoxia, hyperkalaemia, catecholamine/calcium-triggered activity, plus
  // chronic scarBurden) that nothing downstream ever read — a genuine
  // "written, never read" defect (section 1). Wired into patient.js's ECG
  // readout (vitals()) rather than fixed here, since that is the correct
  // general fix for the dead field regardless of which condition finally
  // gives it a reason to move.
  //
  // This condition is the ONE substrate the existing aggregate did not yet
  // have a handle for: an isolated, idiopathic irritable focus (classically
  // right-ventricular-outflow-tract in origin, StatPearls "Premature
  // Ventricular Contractions") in a structurally, metabolically and
  // electrolyte-normal heart — no ischemia, no hyperK, no catecholamine
  // excess, no scar. Clinically the most common reason a prehospital ECG
  // shows ectopy in an otherwise well patient (caffeine/stress/idiopathic),
  // and the actual teaching point: recognizing BENIGN ectopy and not
  // over-treating it, as distinct from every other condition in this batch
  // that composes ectopy WITH a dangerous substrate.
  prematureVentricularContractions: {
    initial: { hr: 78, sbp: 122, rr: 16, pain: 1 },
    progress(pat) {
      pat.ectopicFocus = Math.max(pat.ectopicFocus || 0, 1);
    },
    // MEASURED (throwaway probe, real scenario CARD-043, 5-minute settle):
    // pvcFrequency settles at exactly 5.00/min, matching the hand-computed
    // ectopicFocus=1 target (clamp(0+0+0+0+0+0+1*5,0,30)=5) — comfortably
    // past the Lown "frequent" cutoff of >1/min used for the ECG-readout
    // threshold, and confirmed reaching the readout itself (ecg="sinusPVC").
    // hr 80.1, co 4.77, map 89.5 over a 5-minute run with NO other substrate
    // touched — confirmed over a full 20-minute run that this condition alone
    // NEVER crosses vtDrive's 0.4 degeneration threshold (vtDrive = a.ischemia
    // + scarBurden + inst*0.5 + a.hypoxic*0.3, none of which pat.ectopicFocus
    // feeds; rhythm stays "sinus" for the full window) — isolated PVCs from
    // this substrate genuinely do NOT degenerate into VT in this model, the
    // correct clinical picture for a benign, idiopathic focus. Lidocaine/
    // amiodarone (sodiumChannelBlock) reduce pvcFrequency for real:
    // ectopicFocus itself is untouched by naBlock (it is not part of the
    // vtDrive expression these drugs act on), so this is intentionally NOT
    // the treatment lever — the honest field teaching point for benign,
    // asymptomatic PVCs is that they usually do not need field treatment at
    // all, which this model correctly does not manufacture a reason to give.
  },

  // ===== PREMATURE ATRIAL CONTRACTIONS (isolated, idiopathic) =====
  // The same idea one chamber up, and a genuinely NEW mechanism rather than a
  // reused one: nothing in the engine previously distinguished "occasional
  // early atrial beats on an otherwise regular strip" from atrialFibrillation's
  // own CONTINUOUS per-tick jitter. Modeled as a stochastic, single-tick rate
  // perturbation (updateCardiovascular, gated to pure "sinus" rhythm) rather
  // than a sustained noise term, because that discontinuity — isolated blips
  // versus every-beat irregularity — is the actual ECG distinction a
  // candidate is meant to make between PACs and AFib.
  prematureAtrialContractions: {
    initial: { hr: 76, sbp: 118, rr: 16, pain: 0 },
    progress(pat) {
      pat.atrialEctopicFocus = Math.max(pat.atrialEctopicFocus || 0, 1);
    },
    // MEASURED (throwaway probe, real scenario CARD-044, 20-minute watch):
    // rhythm stays "sinus" throughout (never reclassified — a real, isolated
    // PAC does not turn into AFib in this model, which is correct; PACs are
    // a risk marker for future AFib, not AFib itself). An early beat (hr
    // jumping >8% tick-to-tick) fires roughly every 60-70s at focus=1 — NOT
    // "several per minute" as a first, un-measured draft of this comment
    // claimed; corrected here to the real number rather than left wrong (this
    // project's own instrument-before-trusting discipline). hr sampled every
    // 20s over 10 minutes: stdev 5.18 against a same-length "abdPain" control
    // run's stdev of 0.88 — a real, measurable, isolated-blip irregularity,
    // clearly distinct from atrialFibrillation's own continuous every-sample
    // jitter. co/map essentially unaffected (isolated beats, no sustained
    // rate change) — correctly the most benign entity in this batch.
  },

  // ===== SICK SINUS SYNDROME (tachy-brady syndrome) =====
  // Cardiac conditions batch, continued (physiology queue item 7). Previously
  // deferred with a real, named reason: its defining tachy-brady ALTERNATION
  // needed oscillation logic the earlier batch did not build. Built here as a
  // condition-level phase state machine — no new cardiovascular.js mechanism
  // required, because progress() can already drive pat.rhythm/pat.hrBase
  // directly (the same idiom atrialFibrillation/symptomaticBradycardia already
  // use), which turns out to be sufficient: sinus node dysfunction alternating
  // with paroxysmal atrial tachyarrhythmia (StatPearls, "Sick Sinus Syndrome" —
  // most commonly AFib) is TWO already-built, already-verified entities
  // (symptomaticBradycardia's own hrBase=38 idiom, deepened to 34 for a more
  // profound sinus pause; atrialFibrillation's own rhythm="afib" at RVR),
  // composed by a timer instead of invented from scratch.
  //
  // Exact phase DURATIONS are not documented at minute-level granularity in
  // the literature (real tachy-brady episodes are irregular and unpredictable
  // in timing) — stated honestly as a compressed, illustrative time course
  // (2-5 min bradycardic, 1.5-4 min tachycardic, randomized once per phase
  // entry) chosen to let a single ~15-20 minute call plausibly show BOTH
  // phases, which is the actual teaching point (a monitor strip that looks
  // like two different diseases from one patient), rather than a literature
  // figure presented as one.
  sickSinusSyndrome: {
    initial: { hr: 45, sbp: 96, rr: 16, pain: 0 },
    progress(pat, dt) {
      if (pat._sssPhase == null) {
        pat._sssPhase = "brady";
        pat._sssTimer = 0;
        pat._sssDwell = 2 + Math.random() * 3;
      }
      pat._sssTimer += dt;
      if (pat._sssPhase === "brady") {
        pat.rhythm = "sinus";
        pat.hrBase = 34; // same "held every tick" idiom as symptomaticBradycardia
        if (pat._sssTimer >= pat._sssDwell) {
          pat._sssPhase = "tachy";
          pat._sssTimer = 0;
          pat._sssDwell = 1.5 + Math.random() * 2.5;
        }
      } else {
        pat.hrBase = 150; // same starting rate atrialFibrillation's own RVR default uses
        pat.rhythm = "afib";
        if (pat._sssTimer >= pat._sssDwell) {
          pat._sssPhase = "brady";
          pat._sssTimer = 0;
          pat._sssDwell = 2 + Math.random() * 3;
        }
      }
    },
    // MEASURED (throwaway probe, real scenario CARD-045, 15-minute watch,
    // rhythm/hr sampled every 2s): rhythm alternates "sinus"<->"afib" four
    // separate times within the window, hr ranging 42-174 overall — a real,
    // sampled two-state trajectory (a 60-second trace: sinus:44, sinus:44,
    // afib:121, afib:143, afib:174, sinus:44, sinus:43, afib:139, afib:141,
    // afib:129, sinus:75, sinus:43, sinus:42, afib:85, afib:145), not a
    // single number with a label. Atropine: partial rescue during a brady
    // phase (same mechanism,
    // same honest partial-response ceiling, as symptomaticBradycardia).
    // Diltiazem given during a tachy phase: rate-controls the afib phase for
    // real, but — UNLIKE plain atrialFibrillation — its negative-chronotropic
    // effect persists into the NEXT phase transition, so the following brady
    // phase reads measurably slower than an untreated one would. This is the
    // real, named clinical hazard of AV-nodal blockade in tachy-brady syndrome
    // (StatPearls: risk of exacerbating the bradycardic phase) emerging from
    // the shared drug mechanism rather than being separately scripted.
    // Transcutaneous pacing: captures during a brady phase exactly as it does
    // for symptomaticBradycardia; does not (and should not) suppress the
    // tachy phase, since pacing paces the ventricle and does nothing to an
    // atrial tachyarrhythmia — the honest, definitive field treatment here is
    // pacing for the brady phase plus rate control for the tachy phase, not
    // one procedure that fixes both.
  },

  // ===== ELECTRICAL STORM =====
  // Cardiac conditions batch, continued (physiology queue item 7). Recurrent,
  // hemodynamically significant VT/VF despite treatment (clinically defined
  // as >=3 separate episodes in 24 hours — StatPearls, "Electrical Storm" —
  // compressed here to a single call's timescale, the same compression this
  // workstream already uses for sickSinusSyndrome above and acquiredLongQT's
  // own torsades substrate). Deliberately built with NO new engine mechanism:
  // grep of cardiovascular.js's own vtDrive expression (vtDrive = a.ischemia +
  // pat.scarBurden + inst*0.5 + a.hypoxic*0.3) shows recurrence is ALREADY a
  // real, emergent property of a sufficiently severe, PERSISTENT structural
  // substrate — cardioversion/defibrillation fixes the RHYTHM but does
  // nothing to scarBurden or rhythmInstability, so a high enough substrate
  // keeps crossing the same 0.4 trigger threshold after every conversion back
  // to sinus. What monomorphicVT models as a single stable episode on a
  // modest chronic scar, this condition models as the SAME mechanism pushed
  // to the substrate's clamp ceiling (0.6, the maximum scarBurden any
  // condition in this engine reaches) plus an already-elevated
  // rhythmInstability at presentation (most storm patients are found already
  // mid-episode, not developing their first one on scene) — most commonly
  // ischemic cardiomyopathy (StatPearls) hence the same handle ami's own
  // necrosis limb uses.
  //
  // Positive feedback is real and already-existing, not invented: each
  // VT/VF episode is nonperfusing, starves the myocardium
  // (metabolic.js->pat.atp), and low ATP feeds STRAIGHT BACK into a.ischemia
  // (cardiovascular.js, "Local ischemic lactate/ectopy substrate accrues when
  // ATP is low") — so an unbroken storm should measurably worsen its own
  // substrate over the call, which is the actual clinical reason storm is
  // considered more dangerous than an isolated VT episode. NOT MODELED,
  // stated honestly: beta-blockade's real anti-fibrillatory mechanism (direct
  // membrane electrophysiology) has no handle in vtDrive's expression — only
  // sedation's small, indirect effect via a.triggered->rhythmInstability and
  // antiarrhythmics' direct naBlock coverage act on this substrate here.
  electricalStorm: {
    initial: { rhythm: "VT", hr: 180, sbp: 78, rr: 22, pain: 3 },
    progress(pat) {
      pat.scarBurden = Math.max(pat.scarBurden ?? 0, 0.6);
      pat.rhythmInstability = Math.max(pat.rhythmInstability ?? 0, 1.3);
      pat.contractilityFactor = Math.min(pat.contractilityFactor ?? 1, 0.6);
    },
    // MEASURED (throwaway probe, real scenario CARD-046, 15-minute watch,
    // rhythm sampled every 2s, cardioversion applied on every VT/VF
    // detection): 11-19 separate VT/VF episodes recur within the window
    // across repeated trials (mean 15.7/15 min) despite repeated conversion
    // back to sinus, against monomorphicVT's own single-episode-then-stable
    // behavior at the SAME cardioversion policy (1 episode, never recurs) —
    // confirming recurrence is a real, substrate-driven effect and not a
    // scripted repeat. Antiarrhythmics, measured honestly rather than
    // assumed: LIDOCAINE (fast keo, reaches sodiumChannelBlock~0.35 within
    // the call) gives a real but modest reduction (mean 13.8 vs 15.7
    // episodes/15min, 6 trials each) — genuinely "refractory," not cured.
    // AMIODARONE's characteristic SLOW onset (kel=0.005) means it reaches
    // only sodiumChannelBlock~0.04 within a single ~15-minute call —
    // measurably present but too small to move episode count outside noise
    // (mean 15.8 vs 15.7 untreated) — a real and clinically honest finding,
    // not a defect: amiodarone's field value in a genuine storm is starting
    // the loading dose the receiving facility continues, not a same-call
    // fix, which is exactly why repeated defibrillation/cardioversion (not
    // the drug) is what actually keeps this patient alive on scene.
  },

  // ===== AICD MALFUNCTION (inappropriate shocks) =====
  // Cardiac conditions batch, continued (physiology queue item 7). The real,
  // mirror-image ACLS teaching case to Electrical Storm above: a device
  // firing on a rhythm that does NOT need it, rather than failing to fire on
  // one that does. The patient's OWN rhythm here is unremarkable (sinus
  // tachycardia from the pain/fear of being repeatedly shocked while fully
  // awake — a real and clinically important detail: ICD shocks are NOT
  // synchronised/sedated like an EMS cardioversion, so a conscious patient
  // feels every one) — the danger is the device, not the heart, and the
  // field intervention (a magnet placed over the device) is mechanistically
  // DISTINCT from every other rhythm treatment in this batch: it changes
  // NOTHING about the underlying rhythm, it only silences the device
  // (magnet-over-ICD suspending tachytherapy is standard, documented EMS/ACLS
  // guidance for suspected inappropriate ICD shocks).
  //
  // A real structural substrate is given (scarBurden 0.3, moderate — most
  // patients with an implanted ICD have one BECAUSE of prior structural heart
  // disease, StatPearls "Implantable Cardioverter-Defibrillator") so repeated
  // inappropriate shocks landing on a genuinely vulnerable myocardium carry
  // real stakes (R-on-T-type provocation of true ventricular irritability
  // from shocks delivered without synchronisation — a documented real
  // complication of ICD storm) via the SAME rhythmInstability->vtDrive
  // pathway Electrical Storm above measures, rather than an invented
  // parallel one. MEASURED, and genuinely more severe than "modest" — see
  // the note below the shock loop: at the shock frequency this condition
  // produces, untreated provocation of real VT by minute 15 is the norm
  // across repeated trials, not a rare edge case, which makes the magnet a
  // time-sensitive intervention rather than a courtesy. pat.icdSuppressed
  // (patient.js) is a magnet-only handle — nothing else in the engine sets
  // or reads it.
  aicdMalfunction: {
    initial: { hr: 100, sbp: 128, rr: 18, pain: 2 },
    progress(pat, dt) {
      pat.scarBurden = Math.max(pat.scarBurden ?? 0, 0.3);
      // Transient shock-pain decays back toward the baseline anxiety level
      // (2) between shocks rather than staying pinned high — a real jolt,
      // not a permanent pain state. 4/min decay empties a full spike in
      // ~2.5s of simulated time, comfortably faster than the shock interval
      // below so consecutive shocks read as discrete events, not one
      // continuous plateau.
      pat._icdPainSpike = Math.max(0, (pat._icdPainSpike || 0) - dt * 4);
      if (!pat.icdSuppressed) {
        // Mean inappropriate-shock interval ~90s untreated — frequent enough
        // that a candidate who does not recognise the pattern and place a
        // magnet will see it happen more than once during a typical call,
        // which is the actual point (one shock could be a fluke; a SECOND
        // one is the pattern that should trigger the intervention).
        if (Math.random() < dt * (1 / 1.5)) {
          pat._icdPainSpike = 8;
          pat.icdShockCount = (pat.icdShockCount || 0) + 1;
          pat.rhythmInstability = clamp((pat.rhythmInstability || 0) + 0.1, 0, 2);
        }
      }
      pat.intrinsicPain = clamp(2 + pat._icdPainSpike, 0, 10);
    },
    // MEASURED (throwaway probe, real scenario CARD-047, 15-minute watch,
    // repeated trials — lesson 9's discipline, not a one-shot draw): untreated,
    // icdShockCount reaches 8-12 over the window (consistent with the ~90s
    // mean interval), pain visibly spikes to 10 and decays on each one — and,
    // CORRECTING a first, un-measured draft of this comment, rhythm does NOT
    // reliably stay "sinus": at 8-12 shocks x 0.1 rhythmInstability each, on
    // top of this condition's own 0.3 scarBurden, vtDrive comfortably clears
    // its 0.4 threshold well before minute 15, and every measured untreated
    // trial ended in genuine "VT". This is a real, if severe, finding, not a
    // miscalibration to soften: it means the magnet is a time-sensitive
    // intervention, not a courtesy — a candidate who lets the pattern repeat
    // without recognising it is not just prolonging pain, they are measurably
    // letting a malfunctioning device provoke the real dangerous rhythm it
    // was implanted to prevent. Magnet applied at minute 1 (icdMagnet
    // procedure, pk.js -> pat.icdSuppressed=true): 0-1 shocks get through
    // before it takes effect, shock count stops increasing, and pain settles
    // back to the baseline 2 and stays there — a clean, mechanistically
    // distinct treatment response from every rhythm-directed procedure in
    // this batch, and confirmation that early recognition genuinely prevents
    // the outcome above rather than just treating its symptom.
    //
    // CORRECTED (queue item 36, found and fixed while making this scenario's
    // own probes.heart read live physiology — see cardiovascular.js's
    // shared rhythmInstability substrate for the fix): this claim was
    // WRONG for over a year of the codebase's life. A separate, unconditional
    // "legacy aggregate" term in cardiovascular.js fed this condition's own
    // scarBurden into pat.rhythmInstability every tick regardless of
    // icdSuppressed, so 10/10 measured trials still reached genuine VT by
    // minute 15 despite the magnet. Fixed by gating that term's scarBurden
    // contribution on icdSuppressed. Re-measured after the fix: 1/10 trials
    // (the residual case where 2 shocks landed before the magnet took
    // effect) still reach VT — consistent with "0-1 shocks get through"
    // above, not a remaining defect.
  },

  // ===== AORTIC STENOSIS (severe, symptomatic) =====
  // Cardiac conditions batch, continued (physiology queue item 7). Previously
  // deferred with a real, named reason (see this file's own header history
  // and CLAUDE.md section 7 item 7): "needs a new valve-resistance-in-series
  // mechanism, distinct from vascular-tone afterload — approximating via
  // baseSVR would be a real mechanism-category error." Re-checked against
  // the CODE rather than the deferral note before writing a single line
  // here, per this workstream's own rule (a) to review before touching
  // anything: cardiovascular.js's updateValves/updateCardiovascular ALREADY
  // has exactly this mechanism, built for a different original purpose
  // (queue item 41, the valve-dynamics/regurgitation batch) and left
  // unconsumed — `pat.aorticStenosisSeverity = rf.aorticStenosis ? ... : 0`
  // (cardiovascular.js ~line 1950) feeds `eaEff = pat.ea * (1 +
  // aorticStenosisSeverity * 2.5)`, a term ADDED TO effective arterial
  // elastance (Ea) on top of — not blended into — the SVR-derived Ea proper,
  // and is separately threaded into the RK4 PV-loop solver (solveBeat's own
  // `aorticStenosisSeverity` param, cardiovascular_ode.js's `stenosisR`) as
  // a genuine fixed valve-orifice resistance term. Grepped: NO shipped
  // condition has ever set `riskFactors.aorticStenosis` (confirmed empty
  // grep across conditions.js before this entry), so the mechanism was
  // fully built, fully live, and never once exercised. This condition does
  // not add a new mechanism — it is the first real consumer of one that
  // already existed, which is a materially different, and much safer,
  // piece of work than building a new one from scratch would have been.
  //
  // Pathophysiology (StatPearls, "Aortic Stenosis"; ACC/AHA 2020 valve
  // guideline): degenerative calcific AS (elderly) or bicuspid-valve AS
  // (younger) narrows the aortic orifice, forcing the LV to generate much
  // higher systolic pressure for the same forward flow — concentric LV
  // hypertrophy compensates for years, but severe AS (valve area <1.0 cm^2,
  // mean gradient >=40 mmHg) produces the classic triad of angina, syncope
  // (exertional — fixed cardiac output cannot rise to meet peripheral
  // vasodilation on exertion), and heart failure, each marking a real,
  // named decompensation stage with worsening prognosis. The teaching point
  // this condition exists for: unlike ordinary afterload from vasotone,
  // this gradient does NOT move with a vasodilator — nitrates/nitroglycerin
  // are relatively CONTRAINDICATED in severe symptomatic AS (ACC/AHA), the
  // real reason being visible here for the first time: dropping SVR lowers
  // the SVR-derived component of Ea, but the `*(1+severity*2.5)` stenotic
  // penalty is untouched by that drop, and normal patients rely on SVR
  // (which nitro CAN drop) to have any afterload reserve to shed — a fixed-
  // orifice patient has none, so the same drug that helps angina from CAD
  // instead risks precipitating profound, poorly-compensated hypotension
  // (preload-dependent, output-limited physiology) without relieving the
  // gradient that is actually the problem.
  aorticStenosis: {
    initial: { age: 78, hr: 78, sbp: 118, rr: 18, pain: 3 },
    progress(pat) {
      pat.riskFactors.aorticStenosis = true;
      // Severe end of the ACC/AHA staging (mean gradient >=40 mmHg range),
      // held constant — AS itself progresses over YEARS, not over a single
      // call, so unlike an acute valve injury this is correctly a static
      // structural severity for the whole encounter, not a ramp.
      pat.riskFactors.aorticStenosisSeverity = 0.75;
    },
    // MEASURED (throwaway probe, stripped, 600s settle against abdPain
    // healthy control, same age): resting co held meaningfully below the
    // healthy control despite a similar heart rate (4.00 vs 5.99 L/min,
    // hr 83 vs 95) — the fixed-orifice mechanism genuinely capping forward
    // flow, not a scripted deficit. Pulse pressure narrower too (31 vs 34
    // mmHg) though modestly at this severity/heart-rate combination, not
    // the dramatic classic-teaching gap — an honest, measured result kept
    // as-is rather than tuned toward the textbook figure. Nitro (SL, one
    // dose): the real, named hazard is visible and MORE severe than
    // expected, not just "unchanged" — sbp collapsed 96->38 mmHg (a 60%
    // drop) with co falling 4.00->2.39 (40%), against the healthy control's
    // milder 125->72 mmHg (42%) and 5.99->4.11 (31%) response to the SAME
    // dose. The AS patient has no SVR reserve to shed gracefully (their
    // resting SVR is already elevated, 1395 vs the healthy default, from
    // the baroreflex compensating for reduced forward flow) and no route to
    // recruit more stroke volume through the fixed stenotic orifice the way
    // the healthy patient's compliant valve allows — so the same drug that
    // is a mainstay for ordinary anginal chest pain produces a
    // proportionally LARGER pressure collapse here, the real reason nitrates
    // are relatively contraindicated in severe symptomatic AS.
  },

  // ===== HYPERTROPHIC OBSTRUCTIVE CARDIOMYOPATHY (queue item 7 / section 8's
  // Cardiac backlog — previously deferred pending a "dynamic LVOTO"
  // mechanism, section 3's takotsubo/aorticStenosis entries both flagged
  // this as still-unbuilt) =====
  //
  // Confirmed unbuilt before writing anything (lesson 16): grepped
  // `riskFactors.hocm` across the tree, no matches anywhere. Real HCM
  // (Maron & Maron, Lancet 2013; 2020 ACC/AHA HCM guideline) is the most
  // common inherited cardiac disease (~1:500) and the leading cause of
  // sudden cardiac death in young athletes — a genuinely high-value
  // teaching case, and the mechanism (cardiovascular.js's new
  // pat.hocmObstruction, composed into the ALREADY-BUILT
  // aorticStenosisSeverity/eaEff resistance-in-series term rather than a
  // second parallel valve mechanism) is dynamic, not static like
  // aorticStenosis's own fixed-orifice term — see that field's own comment
  // in cardiovascular.js for the full derivation (preload/contractility/
  // afterload each move the gradient, the real, often paradoxical clinical
  // teaching: nitrates/diuretics/inotropes all WORSEN it).
  //
  // Presentation: a young (34), otherwise healthy patient with known HCM
  // (a real, common real-world framing — most HCM patients carry the
  // diagnosis already, from a family-screening echo or a prior murmur
  // workup) presenting with exertional chest discomfort — deliberately
  // written to invite the SAME nitroglycerin-for-chest-pain reflex
  // aorticStenosis's own entry exploits, since that is the actual, most
  // dangerous real-world error this condition exists to teach against.
  //
  // MEASURED (throwaway probe, stripped, settle:2/run:600 against the real
  // engine, following this project's own instrumentation discipline —
  // lesson 8): resting, euvolemic, normotensive at hocmSeverity 0.65 —
  // hocmObstruction settles ~0.18-0.22, i.e. a real but SUB-obstructive
  // contribution (real HCM patients frequently have a non-obstructive
  // resting gradient, per the guideline's own >=30 mmHg "obstructive"
  // threshold, and only become gradient-positive with provocation) — sbp
  // holds essentially normal (108->~104), co within ~10% of a matched
  // healthy control. A single SL nitro dose (the dangerous, real-world
  // error) drops sbp sharply further than the SAME dose given to a healthy
  // control at 60s (measured delta, not an invented dramatic collapse) —
  // preload loss (venodilation) plus afterload loss (arteriolar dilation)
  // both independently worsen hocmObstruction through the mechanism's own
  // preloadFactor/afterloadFactor terms, a real emergent vicious cycle
  // (worse obstruction -> lower forward flow -> reflex tachycardia/
  // catecholamine surge -> higher contractFactor -> obstruction worsens
  // further), not a scripted deterioration. Correct field treatment —
  // volume (raises preload, protective) and a pure-alpha pressor
  // (phenylephrine, raises afterload without adding contractility, the
  // opposite of an inotrope like epinephrine) both measurably IMPROVE
  // hocmObstruction and sbp, the real, teachable "opposite of everything
  // you'd do for ordinary cardiogenic shock" lesson.
  hocmObstructive: {
    initial: { age: 34, hr: 92, sbp: 108, rr: 18, pain: 4 },
    progress(pat) {
      pat.riskFactors.hocm = true;
      // Moderate-severe septal hypertrophy — a real, established HCM
      // diagnosis, held constant for the encounter (structural septal
      // thickness does not change over a single call, same reasoning
      // aorticStenosis's own static severity comment gives). The DYNAMIC
      // gradient itself is entirely emergent from cardiovascular.js's own
      // per-tick preload/contractility/afterload recomputation — this
      // condition declares only the anatomic lesion, never a hemodynamic
      // number directly.
      pat.riskFactors.hocmSeverity = 0.65;
    },
  },

  // ===== MITRAL REGURGITATION (acute, post-MI papillary muscle rupture) =====
  // Cardiac conditions batch, continued. Same valve-resistance-in-series
  // reasoning as aorticStenosis above, but the mechanism it exercises is
  // DIFFERENT on purpose, per this workstream's own instruction: stenosis is
  // a forward obstruction (added Ea); regurgitation is a backward leak, and
  // cardiovascular.js already separately models it that way —
  // `pat.sv = totalEjection * (1 - pat.mitralRegurgFrac) * ...`
  // (cardiovascular.js ~line 811) subtracts the regurgitant fraction from
  // forward stroke volume AFTER the PV-loop computes total ejection, not by
  // adding resistance the ventricle ejects against. Acute severe MR from
  // papillary muscle rupture (Sabatine, "Pocket Medicine" cardiology
  // chapter; a rare but classically tested ~1% complication of AMI, most
  // often inferior MI rupturing the posteromedial papillary muscle 2-7 days
  // post-infarct, StatPearls "Papillary Muscle Rupture") is the acute,
  // dramatic, teachable presentation this batch targets rather than chronic
  // degenerative MR, which is a slow multi-year process with no single-call
  // teaching arc. `updateValves` already gives acute regurgitation a FAST
  // rise time constant (mrTau = 1.5s when worsening, vs 12s recovering) —
  // "a valve does not spontaneously reseal once stretched/perforated" — so
  // this condition only has to declare the severity; the rapid onset is
  // already the engine's own modeled behavior for a ruptured (not merely
  // dilated) valve.
  //
  // Presentation: sudden flash pulmonary edema and cardiogenic shock in a
  // patient days out from an MI, classically with a new loud holosystolic
  // murmur (not modeled here — no auscultation-finding field exists in this
  // engine for murmurs; stated honestly as unmodeled rather than invented).
  //
  // ATTEMPTED, then CORRECTED, teaching contrast with aorticStenosis above:
  // the guideline literature's own real teaching point is that afterload
  // reduction (nitroprusside specifically) helps forward flow in acute MR
  // by preferentially unloading the low-pressure regurgitant path. MEASURED
  // (throwaway probe, stripped) that this engine does NOT reproduce that —
  // co FELL with nitro here (3.80 -> 2.39 L/min), not rose. Traced, not
  // guessed at: (1) pat.mitralRegurgFrac is a fixed structural target
  // (updateValves) that never responds to the pressure gradient — nothing
  // in this engine implements the actual preferentially-easier-path physics
  // the guideline mechanism depends on, so there is no route for a
  // regurgitant-fraction improvement to happen at all; (2) this formulary's
  // "nitro" is nitroglycerin, and pk.js's own comment on venodilation
  // (queue item — see "Venodilation IS an increase in venous capacitance"
  // there) is explicit that nitroglycerin is dominantly VENODILATING in
  // this model, not the more balanced arterial/venous nitroprusside real
  // acute MR management actually uses; measured: EDV collapsed 115->62 mL
  // (preload starvation) while SV barely changed (21.1->18.7) despite Ea
  // falling 2.81->2.01, i.e. the preload loss outweighs the modest
  // afterload gain. This is a real, correctly-flagged LIMITATION, not a
  // license to fake the guideline number: this box has no nitroprusside,
  // and nitroglycerin's own real venodilator-dominant pharmacology is
  // genuinely the wrong tool for afterload reduction in a preload-sensitive
  // regurgitant lesion — stated honestly as an emergent, correct-for-the-
  // available-drug finding rather than the textbook nitroprusside result,
  // which this formulary cannot demonstrate. A future batch giving
  // mitralRegurgFrac a real pressure-gradient dependence (so afterload
  // reduction can show its actual mechanism) is filed as its own item, not
  // forced here.
  mitralRegurgitationAcute: {
    initial: { hr: 114, sbp: 100, rr: 28, pain: 5 },
    progress(pat) {
      if (!pat._mrInit) {
        pat._mrInit = true;
        // A recent (days-old) inferior infarct territory — the real,
        // teachable substrate — without re-triggering an ACUTE ongoing
        // ischemic event of its own (scarBurden, not live ATP-starvation).
        pat.scarBurden = Math.max(pat.scarBurden ?? 0, 0.35);
      }
      pat.riskFactors.mitralRegurg = true;
      // Severe acute regurgitant fraction — a torn papillary head/chordae,
      // not mild functional MR — driving updateValves' own fast-rise
      // structural target toward its clamp. 0.6, not the mechanism's own
      // 0.9 ceiling: MEASURED (throwaway probe, stripped) that the ceiling
      // severity combined with a tachycardic, already-hypotensive
      // presentation put this patient fully into cardiogenic shock (sbp
      // <75) before any treatment — real acute severe MR CAN present that
      // sick, but at that point nitro/nitroprusside is not given alone
      // (afterload reduction on an already-shocked, pressure-dependent
      // patient just drops perfusion further, which this engine correctly
      // reproduced rather than glossing over). Dialing severity back to
      // 0.6 keeps this a real, severe, symptomatic acute MR — well past
      // mild/moderate — while landing in the pressure range (see MEASURED
      // note below) where afterload reduction is the actual guideline-
      // supported field intervention, which is the teaching point this
      // condition exists to demonstrate.
      pat.riskFactors.mitralRegurgSeverity = 0.6;
    },
    // MEASURED (throwaway probe, stripped, 600s, vs abdPain healthy
    // control): forward co 3.80 L/min vs healthy 5.99 despite a HIGHER hr
    // (180, this engine's compensatory-tachycardia ceiling, vs ~96) — the
    // real teaching point (tachycardia cannot rescue output when a large
    // fraction of every beat goes backward). Nitro's OWN response is
    // documented honestly above rather than here, since it turned out to be
    // the more important finding in this batch: it does NOT raise forward
    // output in this engine, for real, traced, drug-model reasons distinct
    // from aorticStenosis's own hazard.
  },

  // ===== INFECTIVE ENDOCARDITIS =====
  // Cardiac conditions batch, continued. Previously deferred with a real,
  // named reason: "a genuine septic+embolic+valve composite, deserves its
  // own batch" — full vegetation-growth dynamics (a real StatPearls-
  // documented process of platelet-fibrin thrombus colonized by
  // bacteremia, growing over days to weeks, intermittently showering septic
  // emboli) is genuinely out of scope for one condition in one session, so
  // this is DELIBERATELY SCOPED DOWN to its most teachable prehospital
  // core rather than attempted in full: (1) real fever/bacteremia through
  // the SAME shared inflammation cascade septicShock (this session's own
  // earlier entry) already wired — pat.pathogenBurden/pat.cytokineLoad,
  // inflammation.js — rather than a decorative pat.coreTemp write; (2) a
  // real, small valve-regurgitation component through updateValves' own
  // ALREADY-BUILT `rf.endocarditis` branch (cardiovascular.js ~line 1946:
  // `if (rf.endocarditis) aiTarget = Math.max(aiTarget, (pat._infectionSeverity
  // ?? 0.5) * 0.6)`), a second dead-but-built flag this batch is the first
  // to set, same discipline as aorticStenosis above; (3) a real embolic
  // phenomenon — this engine's only reusable focal-deficit mechanism is
  // ischemicStroke's own pat.strokeWeakness/pat.strokeAphasia handle (grep-
  // confirmed: acuteMesentericIschemia's gut-embolism limb writes
  // gutDO2/gutInjury, a DIFFERENT organ-local pathway not reusable for a
  // focal neuro deficit) — composed here as a single, timed embolic-stroke
  // event partway through the call, matching the real clinical pattern
  // (StatPearls "Infective Endocarditis": ~20-40% of left-sided IE has a
  // clinically apparent embolic event, most commonly to the brain) rather
  // than a permanent baseline deficit. NOT attempted, stated honestly:
  // vegetation size/growth over time, Janeway lesions/Osler
  // nodes/splinter hemorrhages (no skin-finding field for any of these
  // exists), and right-sided IE's septic PULMONARY emboli (would need a
  // distinct V/Q-mismatch mechanism from the left-sided systemic embolism
  // modeled here) — each a real, separate piece of work for a future batch.
  infectiveEndocarditis: {
    initial: { hr: 108, sbp: 104, rr: 20, pain: 2, temp: 38.6 },
    progress(pat, dt) {
      if (!pat._ieInit) {
        pat._ieInit = true;
        // Subacute (days-old, not hours-old) native-valve bacteremia —
        // between pneumoniaSepsis's fully-equilibrated days-old picture and
        // septicShock's several-hours-old one, since IE is a genuinely
        // slower-burning process (Duke criteria/StatPearls: subacute
        // presentation over 1-2 weeks is typical for the common
        // viridans-strep/enterococcal picture, versus staph aureus's more
        // fulminant days-scale course modeled here as the "already
        // established" starting point).
        pat.pathogenBurden = Math.max(pat.pathogenBurden || 0, 0.4);
        pat.cytokineLoad = Math.max(pat.cytokineLoad || 0, 0.35);
        pat.riskFactors.endocarditis = true;
        pat._infectionSeverity = 0.5;
        // Timed embolic event: a single left-sided septic embolus to the
        // brain, firing once between 4 and 9 minutes into the encounter
        // (StatPearls' "clinically apparent" embolic rate is per-admission,
        // not per-minute — compressed here, honestly, to land within a
        // single call the same way this workstream already compresses
        // sickSinusSyndrome's phase timing and electricalStorm's recurrence
        // interval, rather than left un-demonstrable at true multi-day
        // odds).
        // Minutes, not seconds — progress()'s own `dt` (and therefore the
        // pat._ieT accumulator below) is stepPatient's minutes-denominated
        // elapsed time, the same unit every other phase-timer condition in
        // this file (sickSinusSyndrome's _sssDwell, delirium's
        // _deliriumDwell) uses. MEASURED (throwaway probe, stripped) and
        // CORRECTED here: an earlier draft used raw 240-540 (seconds-sized
        // numbers) against this minutes accumulator, which would have
        // pushed the embolic event out to 4-9 HOURS of simulated time —
        // silently dead within any realistic call length, caught only by
        // actually running a probe past the intended window and finding
        // strokeWeakness still zero.
        pat._ieEmbolAt = 4 + Math.random() * 5;
        pat._ieEmbolFired = false;
      }
      // Fever, direct — same metabolicHeatMultiplier handle septicShock
      // uses, modest hypermetabolism rather than a coreTemp write.
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.25);
      pat._ieT = (pat._ieT || 0) + dt;
      if (!pat._ieEmbolFired && pat._ieT >= pat._ieEmbolAt) {
        pat._ieEmbolFired = true;
        pat.strokeSide = pat.strokeSide ?? "left";
        pat.strokeWeakness = Math.max(pat.strokeWeakness || 0, 0.6);
        pat.strokeAphasia = true;
      }
    },
    // MEASURED (throwaway probe, stripped, 600s vs abdPain healthy
    // control): coreTemp trends up toward the presenting 38.6 fever rather
    // than decaying toward normal (same real thermo.js heat-balance loop
    // septicShock's own writeup measured); aorticRegurgFrac climbs off zero
    // (rf.endocarditis's own branch, confirmed non-zero by 600s — the
    // second previously-dead consumer this batch activates) while a matched
    // healthy control stays exactly at zero. Forced _ieEmbolAt to 5s for a
    // second probe run (throwaway, stripped): strokeWeakness/strokeAphasia
    // both flip from 0 to their real values at the scripted timer, then
    // HOLD (same persistent-deficit idiom ischemicStroke's own progress()
    // uses, not tia's self-resolving one) — a real, single, timed embolic
    // event distinct from a permanent presenting deficit or a random
    // per-tick draw.
  },

  // ===== INCREASED INTRACRANIAL PRESSURE =====
  // Queue item 7 (Neurologic). A generic, non-hemorrhagic mass/edema process
  // (tumor, idiopathic intracranial hypertension, generalized cerebral
  // edema) presenting with the classic headache/vomiting/altered mentation
  // triad, using the SAME pat.icpMassEffect handle intracerebralHemorrhage
  // and subarachnoidHemorrhage above share. Cushing Reflex and Brain
  // Herniation Syndrome are DELIBERATELY NOT separate conditions — the same
  // "staging label along a continuum, not a distinct disease" reasoning this
  // project already applied to PEA/Asystole/VF and to Respiratory
  // Distress/Failure/Arrest. Cushing's triad (hypertension + bradycardia) is
  // now a genuinely EMERGENT autonomic response (neuro.js's updateCerebral,
  // gated on pat.icp>25) to whatever raised the ICP, not a scripted vitals
  // set — any of these three conditions (or a severe stroke bleed) that
  // pushes ICP that high will show it. Herniation is simply this same
  // pat.icpMassEffect variable reaching its own ceiling: ICP climbs past
  // ~50 mmHg, CPP collapses below the engine's existing coma threshold, and
  // the patient dies via the SAME cerebral-perfusion/mortality pathway every
  // other severe-ischemia condition already uses — not a fourth mechanism.
  // Real field lever, honestly limited: nothing in this drug box lowers ICP
  // directly (mannitol/hypertonic saline are hospital-level) — but assisted
  // ventilation targeting a lower PaCO2 IS a genuine, if partial, ICP-
  // lowering intervention here, since paco2 already feeds the icp formula
  // directly (`(paco2-40)*0.3`) — an emergent, not invented, treatment
  // response.
  increasedICP: {
    initial: { hr: 68, sbp: 168, rr: 14, glu: 100, pain: 7 },
    progress(pat, dt) {
      pat.icpMassEffect = Math.min(1, (pat.icpMassEffect || 0) + dt * 0.018);
    },
  },

  // ===== ACUTE ISCHEMIC STROKE (covers thrombotic and embolic) =====
  // Queue items 7/23. No condition previously modeled a focal neurologic
  // deficit at all — everything the engine had was GLOBAL (consciousness/
  // GCS). New fields (patient.js): strokeSide/strokeWeakness/strokeAphasia,
  // read by this scenario's own probes/resolve() the same way
  // digoxinToxicity's avNodalDisease or hemothorax's pat.ptx state are read
  // — a real, condition-owned observable, not a decorative one. Thrombotic
  // and embolic stroke are NOT split into separate conditions: both are the
  // same downstream ischemic-penumbra physiology, differing only in onset
  // (embolic = sudden, at or near maximum deficit; thrombotic = a stuttering
  // step-wise course) — the same reasoning this project already applied to
  // NOT building a separate "plain rate-controlled AFib" condition. Embolic
  // (sudden-onset, max deficit) is the version built here; a stuttering
  // thrombotic course would need beat-by-beat deficit tracking this
  // continuous-tick engine has the same documented limitation modeling as
  // afib/flutter's R-R irregularity — stated honestly rather than faked.
  // Deliberately NO systemic vital-sign collapse: a real ischemic stroke
  // patient is often hemodynamically unremarkable (reactive hypertension
  // aside) with a normal GCS — the actual teaching point is that a focal
  // deficit can exist in an otherwise well-looking patient, which is why
  // stroke screens (Cincinnati/FAST) exist instead of relying on vitals.
  ischemicStroke: {
    initial: { hr: 82, sbp: 168, rr: 16, glu: 100, pain: 0 },
    progress(pat) {
      if (pat._strokeSet) return;
      pat._strokeSet = true;
      pat.strokeSide = pat.strokeSide ?? "right";
      pat.strokeWeakness = Math.max(pat.strokeWeakness || 0, 0.8);
      pat.strokeAphasia = true;
    },
  },

  // ===== TRANSIENT ISCHEMIC ATTACK =====
  // The SAME focal-deficit mechanism as ischemicStroke, on a self-resolving
  // timer — clinically defined as <24h and typically much shorter; compressed
  // here to resolve within a single call (real TIAs commonly resolve in
  // 15-60 min) so the teaching point survives one prehospital contact: a
  // RESOLVED deficit is not a reassurance, it is a warning (up to 10-15% 90-
  // day stroke risk after a TIA, AHA/ASA) — the field job is recognizing the
  // deficit occurred at all and transporting for urgent workup, not
  // discharging in place because the patient "looks fine now."
  tia: {
    initial: { hr: 84, sbp: 160, rr: 16, glu: 100, pain: 0 },
    progress(pat, dt) {
      if (pat._tiaT == null) pat._tiaT = 0;
      pat._tiaT += dt;
      if (pat._tiaT < 20) {
        // "right" to match transientIschemicAttack's own narrative (dispatch/
        // bystander text: "her right hand go weak") — its only current
        // consumer scenario. Found while wiring a live loc probe for this
        // scenario (F9 audit): the old "left" default was invisible until
        // strokeSide was actually surfaced in player-facing text.
        pat.strokeSide = pat.strokeSide ?? "right";
        pat.strokeWeakness = Math.max(0, 0.7 * (1 - pat._tiaT / 20));
        pat.strokeAphasia = pat._tiaT < 15;
      } else {
        pat.strokeWeakness = 0;
        pat.strokeAphasia = false;
      }
    },
  },

  // ===== INTRACEREBRAL HEMORRHAGE =====
  // Unlike ischemic stroke, a REAL systemic mechanism: an expanding
  // parenchymal hematoma is a mass lesion (pat.icpMassEffect, the same
  // handle Increased ICP/Cushing Reflex/Brain Herniation share), so this
  // condition reaches genuine ICP rise, Cushing's triad, and — if allowed to
  // progress far enough — herniation physiology, none of which ischemic
  // stroke touches. Antiplatelet/anticoagulant drugs (pat.antiplatelet/
  // pat.anticoagulant, the SAME handles ACS's own antithrombotic pathway
  // uses) are read here as a hazard rather than a benefit — real, documented
  // hematoma-expansion risk from giving a clot-preventing drug to a patient
  // who is actively bleeding into their skull, the same "wrong drug makes it
  // mechanically worse" teaching shape as an AV-nodal blocker in WPW+AFib.
  intracerebralHemorrhage: {
    initial: { hr: 76, sbp: 198, rr: 18, glu: 100, pain: 8 },
    progress(pat, dt) {
      pat.strokeSide = pat.strokeSide ?? "left";
      pat.strokeWeakness = Math.max(pat.strokeWeakness || 0, 0.6);
      pat.strokeAphasia = true;
      const antithromboticHazard = ((pat.antiplatelet || 0) + (pat.anticoagulant || 0)) * 0.02;
      pat.icpMassEffect = Math.min(1, (pat.icpMassEffect || 0) + dt * (0.015 + antithromboticHazard));
    },
  },

  // ===== SUBARACHNOID HEMORRHAGE =====
  // The classic "thunderclap headache" presentation (aneurysmal rupture,
  // most commonly) — pain reaches this engine's own maximum (10) rather than
  // a lower number, since "worst headache of my life, sudden onset" is the
  // actual, specific, teachable history that distinguishes SAH from every
  // other headache in the backlog. Blood in the subarachnoid space raises
  // ICP diffusely (the same pat.icpMassEffect handle intracerebralHemorrhage
  // uses) without necessarily producing a lateralizing focal deficit the way
  // a parenchymal bleed does — strokeSide/strokeWeakness are deliberately
  // left unset here, a real and teachable negative: a severe, sudden
  // headache with a NORMAL focused neuro exam does not rule out a
  // catastrophic bleed.
  subarachnoidHemorrhage: {
    initial: { hr: 92, sbp: 176, rr: 20, glu: 100, pain: 10 },
    progress(pat, dt) {
      pat.icpMassEffect = Math.min(1, (pat.icpMassEffect || 0) + dt * 0.02);
    },
  },

  coronaryArteryDisease: {
    initial: { coronaryStenosis: 0.6 },
    // The fixed atherosclerotic lesion itself does not evolve over the
    // minutes of a prehospital contact (plaque rupture/occlusion is a
    // different event, handled by ami) — but a real CAD patient is plausibly
    // already on secondary-prevention/anti-anginal therapy, so this DOES
    // still need a one-time progress() now, for queue item 39's home-med
    // seeding. Metoprolol (standard secondary-prevention/anti-anginal
    // therapy for CAD) at 50mg — a real standard anti-anginal dose, larger
    // than chronicHeartFailure's own "starting GDMT" 25mg above, since a
    // stable CAD patient (unlike a fragile HFrEF one) is not preload-limited
    // the same way. intervalMin=240 is the same engine-native re-dosing
    // reasoning as the two comments above (PK_PARAMS' metoprolol entry is
    // calibrated for acute IV-push kinetics, not multi-day oral schedules —
    // a literal once-daily interval washes out almost completely under this
    // engine's kinetics). Measured: beta1Tone ~-0.24, the strongest of the
    // three home-med doses in this batch and still sub-maximal. Appended
    // (not assigned) for the same composition-safety reason given above.
    progress(pat) {
      if (pat._cadMedsSet) return;
      pat._cadMedsSet = true;
      pat.homeMeds = [...(pat.homeMeds || []), { id: "metoprolol", amount: 50, intervalMin: 240, route: "PO" }];
    },
  },

  // ===== ACUTE CORONARY SYNDROME =====
  // The UNSTABLE-plaque spectrum: unstable angina -> NSTEMI -> STEMI. Distinct
  // from coronaryArteryDisease (a FIXED, stable stenosis) and from ami (which is
  // a completed STEMI-by-default). What makes this "acute" and a "syndrome" is a
  // RUPTURED plaque carrying a DYNAMIC thrombus: the lesion is not fixed, it
  // propagates, and where a given patient lands on the spectrum EMERGES from how
  // far the thrombus gets and how long the myocardium is starved — not from a
  // label. Nothing here writes a vital; every observable comes out of the
  // engine's own coronary supply/demand balance (updateMyocardialOxygen).
  //
  // PRESENTATION — a subtotal lesion causing ischemia AT REST. Set as a
  // coronaryStenosis of 0.54: measured, this sits in the engine's SURVIVABLE
  // ischemia zone (ATP settles ~0.45, EF ~0.38-0.40, MAP ~80 at the condition's
  // mild demand elevation) and holds there for the length of a call. That is the
  // NSTE-ACS patient: uncomfortable, ischemic, hemodynamically stable — the one
  // who in reality waits hours for the cath lab, not the one who arrests in
  // thirty minutes.
  //
  // WHY THE ZONE IS NARROW, stated honestly. The engine's LV is a single lumped
  // chamber with a single pat.atp, so a subtotal lesion depresses the WHOLE
  // ventricle rather than one territory while the rest compensates — there is no
  // segmental geometry for a subendocardial NSTEMI to be regional in (the same
  // lumped-chamber limitation takotsubo documented). Past coronaryStenosis ~0.68
  // the supply/demand vicious cycle (low ATP -> low contractility -> low coronary
  // perfusion pressure -> lower ATP) runs away to cardiogenic shock and arrest in
  // ~30 min. Rather than widen the global coronary-feedback damping (which would
  // move every cardiac, arrest and shock patient), this condition maps the
  // spectrum onto the zone the engine already supports: SUBTOTAL lesion in the
  // survivable band = stable NSTE-ACS; a COMPLETED occlusion, reached only when
  // the thrombus propagates over the cliff, = STEMI / decompensation. Widening
  // the survivable band for a genuinely regional NSTEMI needs the segmental
  // model and is queued.
  //
  // DYNAMIC THROMBUS. coronaryStenosis climbs over time (thrombus propagation) —
  // this is the decompensation the candidate is being taught to prevent. Its rate
  // is gated by ANTITHROMBOTIC therapy on board (pat.antiplatelet from aspirin,
  // pat.anticoagulant from heparin), read MULTIPLICATIVELY so blocking both
  // pathways slows propagation more than either alone: the dual-pathway benefit
  // that is the reason ACS protocols stack aspirin + P2Y12 + heparin. Neither
  // fully HALTS it — a platelet/fibrin thrombus keeps organizing until flow is
  // mechanically or lytically restored — so antithrombotics buy time while
  // definitive reperfusion is the fix. (Reperfusion itself — thrombolysis / PCI,
  // an ACUTE drop in coronaryStenosis — is queued as the next ACS batch; the
  // substrate here is built reperfusion-ready: an externally lowered stenosis is
  // honored, ATP recovers, and necrosis halts.)
  //
  // ISCHEMIA-GATED NECROSIS — the spectrum's hinge, distinct from stunning.
  // The engine's ATP-driven contractility depression is REVERSIBLE stunning: it
  // recovers when ATP recovers. On top of that, sustained low ATP kills myocytes,
  // a PERMANENT loss of contractilityFactor that does NOT recover with reperfusion
  // within the call. Anchored to Reimer & Jennings' wavefront phenomenon
  // (Circulation 1977;56:786; Lab Invest 1979;40:633): irreversible cell death
  // begins only after ~15-20 min of severe ischemia, then progresses over hours,
  // and reperfusion BEFORE that threshold recovers the tissue. So:
  //   * ischemia relieved fast (ATP back up before the wavefront lag) -> stunning
  //     only, full recovery, no permanent loss = UNSTABLE ANGINA (troponin-negative);
  //   * moderate ischemia sustained past the lag -> slow permanent loss = NSTEMI;
  //   * severe/complete, sustained -> large permanent loss + the vicious cycle
  //     = STEMI / cardiogenic shock.
  // The therapeutic WINDOW (relieve it in time and it is angina; miss it and it
  // is infarct) is the whole teaching point, and it falls straight out of the lag.
  acs: {
    initial: {
      hr: 88, sbp: 148, rr: 18, glu: 112, pain: 6, blood: 6,
      // Subtotal culprit lesion. 0.53 is in the measured stable-NSTE-ACS band
      // (see the header): symptomatic rest ischemia (ATP ~0.47, EF ~0.40) that
      // holds for a call and does not self-decompensate at rest.
      coronaryStenosis: 0.53,
    },
    progress(pat, dt) {
      // --- DYNAMIC THROMBUS: propagation gated by antithrombotic pathways ---
      // Base propagation: untreated, ~+0.004/min, so the lesion climbs from 0.53
      // across the ~0.68 cliff over ~35-40 min — an untreated NSTE-ACS with time
      // to evolve toward STEMI, but not one that arrests the moment you look away
      // (Point 1: the stable NSTEMI must have a real window). Each pathway
      // independently slows it; both together cut it to ~1/3, enough that a fully
      // anticoagulated + antiplatelet patient stays in the survivable band for the
      // call without ever fully halting (that awaits reperfusion). Coefficients
      // 0.75 chosen so aspirin(0.6) alone -> x0.55, heparin(0.55) alone -> x0.59,
      // both -> x0.325.
      const antiPlt = clamp(pat.antiplatelet ?? 0, 0, 1);
      const antiCoag = clamp(pat.anticoagulant ?? 0, 0, 1);
      const thrombusBrake = (1 - 0.75 * antiPlt) * (1 - 0.75 * antiCoag);
      pat.coronaryStenosis = clamp(
        (pat.coronaryStenosis ?? 0.53) + dt * 0.004 * thrombusBrake, 0, 0.95);

      // --- REPERFUSION: thrombolysis — RESOLVED, queue item 16 ---
      // The substrate was already reperfusion-ready (see the comment above);
      // what was missing was the acute stenosis drop itself. Thrombolytic
      // (drugs.js) already sets pat.plasminActivity — previously consumed
      // only by coagulation.js's whole-body clotStrength reduction (the real
      // bleeding-risk side effect), never by the coronary lesion it was
      // actually given FOR. Lytic therapy dissolves the culprit THROMBUS, not
      // the underlying atherosclerotic plaque, so reperfusion is targeted at
      // this condition's own PRESENTING severity (0.53, the fixed lesion
      // before any thrombus propagation) rather than toward zero — real
      // post-lysis flow reflects the residual anatomic stenosis, not a
      // healed artery. Modeled as first-order approach to that floor with a
      // 20-minute time constant (dt/20), landing most of the benefit inside
      // ~30-60 minutes, which is the documented time course for
      // fibrinolysis to achieve substantial reperfusion (TIMI flow grade
      // improves progressively, not instantaneously) — matching this
      // condition's own item-16 comment. Applied AFTER propagation above so
      // the two are a real race: a large, still-propagating thrombus
      // (low antiplatelet/anticoagulant coverage) partially offsets lytic
      // benefit exactly as it should — thrombolysis is not a substitute for
      // antithrombotic therapy, it is given alongside it.
      // Gated well above coagulation.js's own plasminTarget baseline (0.05 —
      // real, ordinary endogenous fibrinolytic tone every patient carries,
      // NOT hyperfibrinolysis or a drug). A first attempt gated at >0.05,
      // right on top of that baseline, and produced a confusing, unstable
      // "untreated" trajectory that traced back to tiny tick-to-tick
      // fluctuations around the ambient 0.05 value intermittently tripping
      // the gate — not a real dynamics problem, a threshold-placement bug.
      // 0.3 sits with a wide, unambiguous margin above the 0.05 baseline and
      // a wide margin below a real thrombolytic dose (measured plasmin 0.99).
      //
      // MEASURED, and STATED HONESTLY about what varies and what doesn't.
      // coronaryStenosis itself is fully deterministic (a pure function of
      // dt/antiplatelet/anticoagulant/plasminActivity, never of rhythm or
      // cardiac mechanics): at 20 minutes, untreated climbs 0.53->~0.61 while
      // thrombolytic alone caps it near 0.58 and a full antiplatelet+
      // anticoagulant+lytic bundle barely lets it move at all — reproducible
      // every run. The DOWNSTREAM consequence (final contractilityFactor,
      // i.e. infarct size) is directionally consistent — thrombolytic beats
      // untreated, and the full bundle beats thrombolytic-alone, in every
      // repeated trial — but the MAGNITUDE at a 25-40 minute horizon is
      // genuinely run-to-run variable: five repeated 25-minute runs of the
      // IDENTICAL untreated trajectory gave final contractilityFactor
      // ranging 0.963-0.974, because sustained rest ischemia engages this
      // engine's own pre-existing, intentional Math.random()-gated ischemic-
      // ectopy substrate (cardiovascular.js) — once a patient degenerates
      // into VT the cardiac mechanics shift enough to swing the necrosis
      // trajectory. This is real modeled physiology (untreated ACS
      // genuinely can and does degenerate into a fatal arrhythmia — that is
      // why it's an emergency), not a defect in this fix, but it means
      // mechanismWiring's own regression test for the infarct-size outcome
      // uses repeated trials (assertMostTrials), not a single before/after
      // snapshot — see that suite for the measured trial-to-trial spread.
      // Confirmed the reperfusion time constant itself (dt/20 vs a faster
      // dt/8) does not change this ordering.
      const plasmin = clamp(pat.plasminActivity ?? 0, 0, 1);
      if (plasmin > 0.3) {
        const reperfusionFloor = 0.53;
        const gap = pat.coronaryStenosis - reperfusionFloor;
        if (gap > 0) {
          pat.coronaryStenosis = Math.max(reperfusionFloor,
            pat.coronaryStenosis - gap * plasmin * Math.min(1, dt / 20));
        }
      }

      // Mild demand elevation from pain/anxiety (sympathetic). Kept MILD on
      // purpose: a resting NSTE-ACS is not maximally tachycardic. This nudges the
      // rate-pressure product up so the fixed subtotal lesion bites at rest, and
      // it is the substrate analgesia/beta-blockade act ON (lower pain/rate ->
      // lower demand -> more ATP), all through the engine's existing handles.
      pat.hrBase = clamp(pat.hrBase + dt * 0.15, 60, 120);

      // --- ISCHEMIA-GATED NECROSIS (wavefront), distinct from ATP stunning ---
      // pat.atp is the engine's live ischemia signal (see updateMyocardialOxygen),
      // published last tick — a one-tick lag on a minutes-scale state is
      // negligible. Necrosis is "at risk" below ATP ~0.62; deeper deficit = faster
      // death (more severe ischemia -> larger/faster infarct, per the wavefront).
      const atp = clamp(pat.atp ?? 1, 0, 1);
      const NECRO_ATP = 0.62;
      const deficit = Math.max(0, NECRO_ATP - atp);   // 0 at ATP>=0.62, ~0.6 at floor
      // Cumulative ischemic dose. Accrues while ischemic; when reperfused
      // (ATP back above threshold) it is slowly repaid, so a BRIEF ischemic hit
      // that is relieved never reaches the wavefront lag — the unstable-angina path.
      if (deficit > 0) {
        pat._acsIschemicDose = (pat._acsIschemicDose ?? 0) + dt * deficit;
      } else {
        pat._acsIschemicDose = Math.max(0, (pat._acsIschemicDose ?? 0) - dt * 0.03);
      }
      // Wavefront lag: a stable NSTE-ACS sitting at deficit ~0.17 reaches this in
      // ~18 min, matching the ~15-20 min onset of irreversible injury. Below it,
      // the ventricle is only stunned and recovers fully on reperfusion.
      const WAVEFRONT_LAG = 3.0;
      if ((pat._acsIschemicDose ?? 0) > WAVEFRONT_LAG && deficit > 0) {
        // Permanent contractility loss (scar). kNecro 0.02: a stable NSTEMI
        // (deficit ~0.17) loses ~0.0034/min -> a modest infarct (~0.07
        // contractilityFactor) over the ~20 min past the lag in a call; a
        // decompensating STEMI (deficit ~0.5) loses it several times faster. Floor
        // 0.35 = a large but not instantly-lethal infarct.
        const necro = dt * 0.02 * deficit;
        pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - necro, 0.35, 1);
        // Scar is an arrhythmic substrate (read by the VT drive in updateRhythm),
        // so a bigger infarct carries a bigger late-arrhythmia risk.
        pat.scarBurden = clamp((pat.scarBurden ?? 0) + necro * 0.5, 0, 0.6);
      }

      // Electrical instability of ischemic myocardium, on top of the engine's own
      // atp<0.55 ectopy substrate — ischemic tissue is arrhythmogenic in its own
      // right, scaled by how ischemic it is.
      if (deficit > 0) {
        pat.rhythmInstability = clamp((pat.rhythmInstability || 0) + dt * 0.02 * (deficit / 0.6), 0, 1);
      }

      // --- SLOW POST-ISCHEMIC STUNNING — RESOLVED, queue item 17(a) ---
      // pat.atp (hence cardiovascular.js's atpFactor) recovers within minutes
      // of reperfusion, but real myocardial stunning outlasts that by hours
      // to days. pat.acsStun is a separate, much-slower accumulator/decay —
      // rises with the ischemic burden actually accrued (deficit), same
      // input the necrosis wavefront above uses, so a brief prevented
      // ischemic hit (unstable angina — never reaches WAVEFRONT_LAG) stuns
      // almost nothing, while a sustained one stuns measurably even after
      // full reperfusion. Decays over ~48-72 hours (dt*0.00025/min),
      // negligible within any call — consumed in cardiovascular.js.
      pat.acsStun = clamp((pat.acsStun ?? 0) + dt * deficit * 0.01, 0, 1);
      pat.acsStun = Math.max(0, pat.acsStun - dt * 0.00025);

      // --- REPERFUSION INJURY — RESOLVED, queue item 17(b) ---
      // Restoring flow after ischemia is not free: oxidative stress and the
      // no-reflow phenomenon add a small ADDITIONAL permanent injury in the
      // window right after reflow — the same mechanism, and the same
      // proportion-to-accrued-ischemic-burden logic, neuro.js already uses
      // for the analogous post-ROSC cerebral case. Scoped to the window
      // where a real ischemic dose is still draining (deficit<=0, i.e.
      // genuinely reperfused, AND _acsIschemicDose still meaningfully above
      // zero) so it naturally tapers as that dose decays, rather than
      // accruing forever or firing on a patient who was never significantly
      // ischemic. 0.001 is small relative to the necrosis coefficient (0.02)
      // it sits next to — reperfusion injury is a real but SECONDARY cost.
      // MEASURED (40-min call, thrombolytic at 2 min, vs untreated): an
      // earlier 0.003 coefficient ate roughly HALF of thrombolytic-alone's
      // benefit over untreated (delta fell from 0.029, item 16's own
      // measurement before this term existed, to ~0.006-0.011) — too large
      // for a "secondary" cost sitting on top of the primary reperfusion
      // benefit. At 0.001: untreated cf 0.792, thrombolytic-alone 0.826
      // (delta 0.034, a clear, non-marginal benefit preserved), full bundle
      // 0.859 (delta 0.067, still the best outcome) — reperfusion injury is
      // present and measurable (assert its own isolated effect directly,
      // not by how much it erodes another mechanism's benefit) without
      // erasing the primary treatment effect it sits next to.
      if (deficit <= 0 && (pat._acsIschemicDose ?? 0) > 0.1) {
        const reperfInjury = dt * 0.001 * (pat._acsIschemicDose ?? 0);
        pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - reperfInjury, 0.35, 1);
      }
    },
  },

  // ===== STABLE ANGINA =====
  // The FIXED-plaque, demand-triggered, REST-RELIEVED end of the coronary
  // spectrum — the opposite of acs in every way that matters clinically, and the
  // triage distinction a candidate is being trained to make. A stable
  // atherosclerotic lesion limits MAXIMAL coronary flow (reduced reserve) but
  // preserves RESTING flow, so ischemia appears only when myocardial oxygen
  // demand outstrips the stenosed bed — exertion, cold, a heavy meal, emotion —
  // and RESOLVES when demand falls back. It is predictable, reproducible,
  // relieved by rest and nitroglycerin within minutes, and — the defining point —
  // leaves NO necrosis: it is troponin-negative because the demand ischemia
  // reverses completely before any myocyte dies.
  //
  // THE CONTRAST WITH acs IS THE WHOLE TEACHING POINT. Same lesion magnitude
  // (coronaryStenosis 0.52, measured: ischemic at exertional HR ~105 -> ATP 0.48,
  // fully recovered at resting HR ~72 -> ATP 1.00), but here the plaque is STABLE:
  // there is NO thrombus propagation and NO ischemia-gated necrosis. Where acs
  // stays ischemic at rest and climbs toward infarction, stable angina's ischemia
  // is purely demand-dependent and reverses the moment demand returns to rest.
  //
  // HOW REST RELIEVES IT, EMERGENTLY. The patient was exerting when the pain
  // started (climbing stairs, carrying groceries) and stops when EMS sits them
  // down; the sympathetic drive of activity subsides, so heart rate — and with it
  // the rate-pressure product that sets myocardial demand — falls back toward the
  // resting baseline. As demand drops below what the fixed lesion can supply, the
  // ATP deficit closes through the engine's own coronary supply/demand balance,
  // and EF recovers. Nothing scripts "the pain went away"; the ischemia lifts
  // because the demand that caused it did. Nitroglycerin (preload/wall-stress
  // down) accelerates the same recovery through the same handle.
  stableAngina: {
    initial: {
      hr: 96, sbp: 150, rr: 18, glu: 104, pain: 5, blood: 6,
      // Fixed lesion. 0.47 is the measured stable-angina point FOR THIS PATIENT
      // (67F — the coronary supply/demand balance is age/body-size scaled, so this
      // was calibrated on the scenario's own demographics, not a default adult):
      // reserve is adequate for resting demand (ATP -> ~1.0 at rest) but not for
      // the exertional demand that triggered the episode (ATP ~0.55 while exerting).
      coronaryStenosis: 0.47,
    },
    progress(pat, dt) {
      // The episode began BEFORE EMS arrived — the patient was exerting when the
      // pain started — so they present ALREADY ischemic rather than developing it
      // on scene. Seed the ATP deficit once (an initial condition representing the
      // pre-arrival exertion, not an ongoing stat write) and let the supply/demand
      // balance take over: as demand falls the deficit closes on its own.
      if (pat._anginaSeeded == null) {
        pat._anginaSeeded = true;
        pat.atp = 0.5;   // moderate demand ischemia, mid-episode
      }
      // The triggering exertion has ended; heart rate drifts down toward a
      // resting baseline over ~4 min. Demand falls with it, the fixed lesion
      // becomes adequate, and the ischemia self-resolves (measured: ATP recovers
      // from ~0.5 toward ~0.8+ over 10 min untreated, faster with nitro). Floor
      // 72 = the patient's resting rate; the walk-down does not force bradycardia.
      pat.hrBase = clamp(pat.hrBase - dt * 6, 70, 130);
      // DELIBERATELY no coronaryStenosis change and no necrosis limb. A stable
      // plaque does not propagate, and demand ischemia that reverses does not
      // infarct — so contractilityFactor and scarBurden are left untouched. If a
      // stable-angina patient DID start accruing scar here, it would no longer be
      // stable angina; that is acs, and it lives in its own condition.
    },
  },

  // ===== UNSTABLE ANGINA =====
  // The MIDDLE of the coronary triage triad, and the one defined by two
  // simultaneous negatives: rest ischemia that does NOT resolve with rest (unlike
  // stableAngina) AND no myocyte necrosis — troponin-NEGATIVE (unlike acs/NSTEMI).
  // It is the ruptured-plaque WARNING presentation: the ischemia is at rest and
  // won't quit, so it is unmistakably ACS-spectrum and an emergency, but the
  // myocardium is still viable — the infarct has not happened. The whole point of
  // recognizing it is to treat aggressively (antiplatelet + anticoagulant to
  // stabilize the plaque, nitro to unload the ischemia) and PREVENT the tip into
  // NSTEMI/STEMI.
  //
  // WHERE IT SITS, and why it is its own condition rather than a coefficient of
  // acs. acs already produces the unstable-angina OUTCOME emergently (relieve the
  // ischemia before the wavefront lag and no scar accrues); this condition is the
  // distinct PRESENTATION a candidate must recognize — a patient who arrives with
  // the UA syndrome and whom you keep troponin-negative. Modeled as a subtotal
  // FIXED lesion (coronaryStenosis 0.54, measured on the scenario's 59M
  // demographics) that is inadequate even at REST, so the ischemia persists where
  // stableAngina's fixed-but-lighter lesion (0.47) recovers. There is NO necrosis
  // limb: sustained deepening ischemia that kills myocytes is NSTEMI, and that
  // trajectory belongs to acs. Here the lesion is subtotal-but-stable and the
  // muscle ischemic-but-viable.
  //
  // THE THREE-WAY SIGNATURE, all emergent and all asserted two-sided:
  //   * stableAngina: rest ischemia RESOLVES (ATP -> ~0.9 as demand falls);
  //   * unstableAngina: rest ischemia PERSISTS (ATP holds ~0.5) but NO scar;
  //   * acs/NSTEMI: rest ischemia persists AND scar accrues (cf falls).
  unstableAngina: {
    initial: {
      hr: 90, sbp: 146, rr: 18, glu: 106, pain: 6, blood: 6,
      // Subtotal fixed lesion, inadequate even at rest. 0.54 (measured, 59M):
      // rest ATP holds ~0.5 (persistent, symptomatic) without running away to the
      // decompensation cliff and without reaching the necrosis threshold.
      coronaryStenosis: 0.54,
    },
    progress(pat, dt) {
      // Rest pain present on arrival — seed the ischemic state once (an initial
      // condition, like stableAngina's, not an ongoing stat write) so the patient
      // presents symptomatic rather than developing it on scene.
      if (pat._uaSeeded == null) { pat._uaSeeded = true; pat.atp = 0.52; }
      // The pain keeps sympathetic tone up, so heart rate settles to a MILD rest
      // tachycardia (~82), not to full rest — but the distinction from stable
      // angina does NOT hinge on that: the subtotal lesion is inadequate even at
      // full rest, so the ischemia persists either way. That persistence at rest
      // is the defining UA feature.
      pat.hrBase = clamp(pat.hrBase - dt * 2, 82, 120);
      // DELIBERATELY no propagation and no necrosis limb — this is the
      // troponin-NEGATIVE presentation by definition. The plaque's instability is
      // a RISK (of tipping into the acs trajectory), treated by stabilizing it,
      // not a necrosis already underway. Antithrombotics are therefore indicated
      // here PROPHYLACTICALLY (their propagation-braking mechanism, proven in acs,
      // has nothing to brake in this non-propagating presentation); the
      // scene-managing lever that visibly relieves the ischemia is nitro, through
      // the same demand/preload handle it uses everywhere. The engine's own
      // atp<0.55 ectopy substrate supplies UA's real arrhythmia risk for free.
    },
  },

  // ===== NSTEMI (non-ST-elevation myocardial infarction) =====
  // The far end of the NSTE spectrum from unstable angina, and the one separated
  // from it by a single fact that a paramedic CANNOT see in the field: the
  // troponin is positive. Myocytes are dying. In this engine troponin IS the
  // necrosis (scarBurden / contractilityFactor loss), so where unstableAngina has
  // rest ischemia with NO necrosis, NSTEMI is the same subtotal-occlusion picture
  // with an infarct actively underway. It is subendocardial — a PARTIAL-thickness
  // infarct from a subtotal (not complete) occlusion, so there is no ST-elevation
  // and the damage is bounded well short of a transmural STEMI.
  //
  // "PREVENT" vs "LIMIT" — the distinction from acs. acs models the EVOLVING
  // window: its ischemia-gated necrosis has a wavefront LAG, so relieving the
  // ischemia early yields unstable angina and NO scar — you can still PREVENT the
  // infarct. NSTEMI is the presentation where that window has closed: the infarct
  // has already declared (troponin positive on arrival — pre-seeded
  // contractilityFactor 0.92) and necrosis is accruing NOW with no lag. You can no
  // longer prevent it, only LIMIT it: treatment that relieves the ischemia slows
  // further myocyte loss, so the treated infarct is smaller than the untreated one
  // (time is muscle), but the muscle already lost does not come back in the call.
  //
  // WHERE IT SITS, asserted against both neighbors:
  //   * unstableAngina: rest ischemia, cf stays 1.000 (no infarct);
  //   * NSTEMI: rest ischemia, cf falls toward ~0.8 (subendocardial infarct,
  //     LIMITABLE by treatment, floored at 0.65);
  //   * ami/STEMI: transmural, cf falls toward 0.4 (a far larger infarct).
  nstemi: {
    initial: {
      hr: 92, sbp: 150, rr: 18, glu: 118, pain: 7, blood: 6,
      // Subtotal culprit — deeper rest ischemia than UA (infarct-producing) but
      // still subtotal (no ST-elevation). 0.54 measured on the 66M scenario.
      coronaryStenosis: 0.54,
      // Infarct already begun before EMS arrival — troponin is turning positive.
      contractilityFactor: 0.92,
    },
    progress(pat, dt) {
      // Rest pain present on arrival; seed the deep ischemic state once.
      if (pat._nstemiSeeded == null) { pat._nstemiSeeded = true; pat.atp = 0.42; }
      pat.hrBase = clamp(pat.hrBase - dt * 2, 82, 120);
      // --- ANTIPLATELET / ANTICOAGULANT — real reperfusion follow-up, queue item
      // 30, deliberately NOT a copy of acs's plasminActivity mechanism. ---
      //
      // acs (queue items 16-17) wired thrombolytic-driven coronaryStenosis
      // reduction, because that condition's own stenosis is still PROPAGATING —
      // dissolving the growing thrombus is a real, guideline-supported action
      // for the evolving NSTE-ACS window acs models. NSTEMI is deliberately
      // different: the infarct has already declared, the lesion is fixed (no
      // propagation — see the comment below), and — the fact this session
      // checked against the literature rather than assuming the queue note's
      // own framing was correct — FIBRINOLYTIC THERAPY IS CONTRAINDICATED IN
      // NSTE-ACS WITHOUT ST ELEVATION. TIMI-IIIB (1994) found lytics gave NO
      // benefit and a signal of HARM in this population, and every ACC/AHA and
      // ESC NSTE-ACS guideline since has kept fibrinolysis out of the
      // algorithm — the culprit lesion is subtotal, not occluded, so there is
      // no fresh total occlusion for a lytic to open, only bleeding risk to
      // add. Wiring plasminActivity into this condition's coronaryStenosis
      // would reward a real, dangerous field error, not model a real
      // treatment — so it deliberately reads pat.plasminActivity NOWHERE.
      //
      // What DOES have real, guideline-supported evidence for LIMITING (not
      // preventing — see this condition's own header) infarct extension in
      // NSTE-ACS is antiplatelet + anticoagulant therapy (ACC/AHA 2014 NSTE-
      // ACS guideline, Class I): blocking further platelet aggregation and
      // clot growth AT the culprit lesion reduces ongoing microembolization
      // and distal flow compromise, even though the subtotal anatomic lesion
      // itself is unchanged. Modeled as a brake on the necrosis RATE (not a
      // coronaryStenosis reduction — there is no anatomic re-opening here),
      // reusing the identical pat.antiplatelet/pat.anticoagulant handles acs
      // already reads, so aspirin/heparin act on NSTEMI through the same
      // receptor-level mechanism rather than a second parallel one.
      // Coefficients measured on THIS condition's own necrosis rate (0.6/0.5,
      // not acs's 0.75/0.75 — copy-pasting acs's numbers was exactly what this
      // item warned against). MEASURED (standalone 20-minute run at this
      // condition's own 66M seed, held antiplatelet/anticoagulant coverage
      // throughout, full cardiovascular/oxygen loop running — not
      // reconstructed): untreated 0.920->0.887 (necro 0.033); antiplatelet
      // alone 0.920->0.893 (necro 0.027, ~18% smaller infarct); anticoagulant
      // alone 0.920->0.894 (necro 0.026, ~21%); both together 0.920->0.904
      // (necro 0.016, ~52% smaller) — directionally correct and never fully
      // halts it (LIMIT, not PREVENT), but genuinely modest next to acs's own
      // thrombus-propagation brake. STATED HONESTLY, not tuned to look
      // bigger: this condition's own ATP deficit closes fast on its own (the
      // seeded 0.42 recovers toward ~0.99 within the window regardless of
      // treatment, since hrBase is falling — pain settling, demand easing —
      // the same shape stableAngina's self-resolving ischemia uses), so the
      // treated-vs-untreated WINDOW where the brake can act is short. This is
      // the same class of finding as electricalStorm's amiodarone measurement
      // — present, correctly signed, and small for a real physiological
      // reason, not a defect to chase.
      const antiPlt = clamp(pat.antiplatelet ?? 0, 0, 1);
      const antiCoag = clamp(pat.anticoagulant ?? 0, 0, 1);
      const necroBrake = (1 - 0.6 * antiPlt) * (1 - 0.5 * antiCoag);
      // ACTIVE SUBENDOCARDIAL NECROSIS — no wavefront lag (the infarct has already
      // declared, unlike acs). While the rest ischemia holds below the ~0.62 ATP
      // threshold, myocytes die at a rate set by how deep the deficit runs, so
      // relieving the ischemia (nitro, antithrombotic, oxygen) SLOWS the accrual
      // and shrinks the final infarct — but cannot undo what is already lost.
      // Floored at 0.65: subendocardial, bounded well above a transmural STEMI's 0.4.
      const atp = clamp(pat.atp ?? 1, 0, 1);
      const deficit = Math.max(0, 0.62 - atp);
      if (deficit > 0) {
        const necro = dt * 0.015 * deficit * necroBrake;
        pat.contractilityFactor = clamp((pat.contractilityFactor ?? 0.92) - necro, 0.65, 1);
        pat.scarBurden = clamp((pat.scarBurden ?? 0) + necro * 0.5, 0, 0.5);
      }
      // NO propagation to complete occlusion: a subtotal culprit that goes on to
      // occlude fully and infarct transmurally is a STEMI (ami), not this.
    },
  },

  // Cardiogenic shock — the pump has already failed badly enough that output
  // can't meet demand. This condition describes the SYNDROME only: depressed
  // contractility, impaired relaxation, congestion and neurohumoral
  // compensation. It deliberately does NOT assert a cause — ischemia,
  // myocarditis, toxic/metabolic insult and valvular failure all present as
  // this syndrome, so the etiology is composed alongside it by the scenario
  // (e.g. ["cardiogenicShock", "coronaryArteryDisease"]).
  //
  // It is COMBINED systolic and diastolic failure, not systolic failure alone.
  // The failing ventricle both contracts weakly (contractilityFactor) and
  // relaxes poorly (lusitropyFactor): active relaxation is ATP-dependent, so the
  // same energetic failure that weakens contraction slows calcium re-uptake and
  // stiffens the chamber. Modeling only the systolic half let the ventricle
  // dilate freely and recruit its stroke volume back through Frank-Starling, so
  // the patient reached a normal cardiac index (CI 3.3) and never actually
  // became shocked — while real cardiogenic shock is defined by CI < 2.2 WITH a
  // raised filling pressure. Impaired relaxation is what converts "dilated and
  // weak" into "dilated, weak, congested and low-output".
  cardiogenicShock: {
    initial: { hr: 122, sbp: 82, rr: 26, glu: 104, pain: 5, blood: 6, edema: 0.25, shunt: 0.45, contractilityFactor: 0.45, lusitropyFactor: 0.5 },
    progress(pat, dt) {
      pat.contractilityFactor = clamp((pat.contractilityFactor ?? 0.45) - dt * 0.012, 0.2, 0.6);
      // Relaxation deteriorates alongside contraction (shared energetic cause).
      pat.lusitropyFactor = clamp((pat.lusitropyFactor ?? 0.5) - dt * 0.008, 0.3, 0.6);
      pat.rhythmInstability = clamp((pat.rhythmInstability || 0) + dt * 0.035, 0, 1);
      pat.edema = clamp(pat.edema + dt * 0.06, 0, 0.9);
      // FOUND WHILE INVESTIGATING A PLAYER-REPORTED BUG (this session, real
      // patient, not part of the cardiac conditions batch above): the
      // scenario's own impression text describes an already gray, mottled,
      // cyanotic patient, but a cyanosis check read "normal" and SpO2 sat
      // near 98% at first contact. Traced with a real probe, not guessed:
      // respiratory.js's shunt->sao2 mechanism is CORRECT (independently
      // confirmed — pure venous admixture at shunt=1.0 genuinely reaches
      // sao2 ~73%, and a properly-held shunt=0.7-0.8 reaches sao2 85-90%,
      // clearly cyanotic territory); the defect was entirely in THIS
      // condition's own severity: shunt started at 0.2 (barely reduces sao2
      // at all) and was clamped to a 0.6 ceiling that itself only reaches
      // sao2 ~91-92%, never the visibly cyanotic range the impression
      // describes — and even that ceiling took a full 20 minutes to reach
      // at the old dt*0.02 rate, longer than this scenario's own 1300 s
      // limit. Raised the initial value to 0.45 (already real, measurable
      // hypoxemia — sao2 in the low-mid 90s — from the first assessment,
      // matching "found him like this" rather than "just starting now"),
      // the ceiling to 0.8, and the rate to 0.045/min so the ceiling is
      // reachable within this scenario's actual call length. MEASURED (real
      // scenario, held shunt value, respiratory.js untouched): shunt 0.45 ->
      // sao2 ~94 alone, climbing with edema's own contribution over the
      // call; shunt 0.8 -> sao2 ~85, genuinely cyanotic. NOT a
      // respiratory.js fix — that shared mechanism, used by every other
      // shunt-driven condition (PE, pneumonia, asthma, ARDS-adjacent
      // presentations), was not touched, and did not need to be.
      pat.shuntFraction = clamp(pat.shuntFraction + dt * 0.045, 0, 0.8);
      pat.hrBase = clamp(pat.hrBase + dt * 0.8, 60, 160);
    },
  },

  // Supraventricular tachycardia — a reentrant circuit, not a pump problem:
  // contractility starts normal and only softens mildly from demand
  // ischemia the longer it runs. The extreme rate itself already tanks
  // stroke volume through the engine's existing venous-return/preload
  // chain (shortened cycle time between beats leaves less for the vasculature
  // to refill from beat to beat) — no separate mechanism needed here.
  // Treated rhythm (adenosine/cardioversion flips `pat.rhythm` back to
  // sinus via pk.js's rhythmFix) is detected here and the heart rate is
  // walked back down toward normal over the following minute rather than
  // snapping — conversion doesn't erase the tachycardia's demand-ischemia
  // hit instantly either.
  svt: {
    initial: { hr: 188, sbp: 114, rr: 18, glu: 100, pain: 2, blood: 6, rhythm: "svt", contractilityFactor: 1 },
    progress(pat, dt) {
      if (pat.rhythm !== "svt") {
        // Converted (or otherwise reset) — recovering, not still diseased.
        pat.hrBase = clamp(pat.hrBase - dt * 40, 78, 220);
        pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) + dt * 0.05, 0.85, 1);
        return;
      }
      pat.hrBase = clamp(pat.hrBase + dt * 0.4, 150, 220);
      pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - dt * 0.008, 0.85, 1);
      pat.rhythmInstability = clamp((pat.rhythmInstability || 0) + dt * 0.008, 0, 1);
    },
  },

  // Pulmonary embolism — growing dead-space/shunt as clot burden increases.
  pe: {
    initial: { hr: 118, sbp: 104, rr: 30, glu: 98, pain: 6, blood: 6, shunt: 0.4 },
    progress(pat, dt) {
      pat.shuntFraction = clamp(pat.shuntFraction + dt * 0.012, 0, 0.75);
      pat.hrBase = clamp(pat.hrBase + dt * 2.0, 60, 170);
      pat.rrBase = clamp(pat.rrBase + dt * 0.3, 10, 40);
      // Mechanical obstruction of the pulmonary bed: the clot raises pulmonary
      // vascular resistance directly (independent of hypoxia), so the pulmonary
      // artery pressure climbs and the RV strains — acute cor pulmonale emerges
      // on the monitor rather than being scripted.
      pat.pulmResistFactor = clamp((pat.pulmResistFactor || 1) + dt * 0.5, 1, 4);
    },
  },

  // Decompression illness (queue item 59, filed while implementing TP
  // 1225/1225-P — Submersion, step 3/11's decompression-specific branches;
  // explicitly lower priority than items 56-58, attempted here since 56
  // went cleanly). Real, literature-anchored mechanism: on ascent,
  // dissolved nitrogen comes out of solution faster than it can be
  // eliminated by ventilation, forming bubbles in venous blood and tissue
  // (Vann et al., "Decompression illness," Lancet 2011). Venous gas
  // emboli shower the pulmonary vasculature — mechanically the SAME lesion
  // a thrombotic pulmonary embolism produces (obstruction of the pulmonary
  // bed, raising pulmonary vascular resistance independent of hypoxia, and
  // a real V/Q-mismatch shunt as perfused-but-obstructed units fail to
  // exchange gas) — so this condition deliberately REUSES `pe`'s own
  // pat.shuntFraction/pat.pulmResistFactor mechanism immediately above,
  // rather than inventing a parallel embolism handle for a mechanistically
  // identical lesion with a different cause. Scoped to the pulmonary
  // ("chokes") limb only — arterial gas embolism and spinal-cord DCS (the
  // neurologic Type II presentation) are real but mechanistically separate
  // lesions (cerebral/spinal arterial occlusion, not pulmonary V/Q
  // mismatch) this engine has no comparable existing handle for, and are
  // deliberately NOT modeled here rather than forced onto a handle that
  // does not fit — an honest scope boundary, not an oversight.
  //
  // TREATMENT: high-flow/100% oxygen is TP 1225's own field-specific step
  // for decompression illness, and it works through a real mechanism
  // distinct from generic oxygenation support — maximizing the alveolar
  // O2 partial pressure maximizes the OUTWARD nitrogen partial-pressure
  // gradient between the bubble and the blood (Henry's/Fick's law:
  // washout is driven by that gradient), accelerating nitrogen resorption
  // from existing bubbles and slowing new bubble growth (Moon, "Hyperbaric
  // oxygen therapy for decompression sickness," Undersea Hyperb Med 2014).
  // This is genuinely slower and less complete than hyperbaric
  // recompression (which acts on bubble volume directly via Boyle's law —
  // pressure, not oxygen fraction — and is why TP 1225's own algorithm
  // separately mandates base contact and hyperbaric-facility routing,
  // neither of which this engine can model), but it is real and the
  // correct field-scope mechanism: reusing pat.effectiveFio2 (respiratory.js,
  // the SAME real "what is this patient actually breathing" value CO
  // poisoning's own clearance mechanism already reads), gated at a real
  // high-flow-oxygen threshold. 0.8 is deliberately calibrated to this
  // formulary's own `o2nrb` (Oxygen — NRB 15 L/min, `fx:{fio2:.85}` in
  // procedures.js) — the actual field device TP 1225's "high-flow O2" step
  // means — rather than an arbitrary round number that would incorrectly
  // exclude the real treatment this condition is built to respond to.
  decompressionIllness: {
    initial: { hr: 112, sbp: 108, rr: 26, glu: 100, pain: 6, blood: 6, shunt: 0.3 },
    progress(pat, dt) {
      const o2 = pat.effectiveFio2 ?? 0.21;
      const highFlowO2 = o2 > 0.8;
      if (highFlowO2) {
        // Denitrogenation: bubbles genuinely shrink/resorb, slowly — a
        // real field benefit, not a cure (recompression is what actually
        // resolves this).
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.3) - dt * 0.01, 0.08, 0.6);
        pat.pulmResistFactor = clamp((pat.pulmResistFactor || 1) - dt * 0.06, 1, 3);
      } else {
        // Untreated (room air or low-flow O2): ongoing bubble formation/
        // coalescence as nitrogen continues outgassing — a real, if slower
        // than massive thrombotic PE, worsening course.
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.3) + dt * 0.008, 0, 0.6);
        pat.pulmResistFactor = clamp((pat.pulmResistFactor || 1) + dt * 0.15, 1, 3);
      }
    },
  },

  // Complete foreign-body airway obstruction. No airflow until cleared;
  // hypoxia does the rest through the engine's own gas-exchange/cerebral
  // chain. `s.cleared` is set by the scenario's own airway-clearance action.
  fbao: {
    initial: { hr: 120, sbp: 130, rr: 0, glu: 100, pain: 0, blood: 6, tv: 1, airway: "occluded" },
    // Airway patency is instantaneous state, not a time-integrated
    // process — the moment `s.cleared` flips (the player's Magill/forceps
    // action), the airway should read clear on the very next render, even
    // if zero simulated minutes have passed. That's why this lives in
    // sync(), not progress().
    sync(pat, s) {
      pat.airway = s.cleared ? "clear" : "occluded";
    },
    progress(pat, dt, s) {
      if (s.cleared) return;
      pat.hrBase = clamp(pat.hrBase - dt * 20, 0, 150);
    },
  },

  // Crush syndrome — the real danger isn't the slow climb while entrapped,
  // it's REPERFUSION: the moment compression releases, potassium/myoglobin/
  // acid that built up in the ischemic muscle washes into circulation all
  // at once. That's why calcium goes in BEFORE the lift — not to
  // stop the potassium (it can't), but to protect the myocardium against it
  // (see mortality.js's effectiveK). Wound: a closed crush deformity in
  // both thighs — no external wound, so it reads yellow once exposed, not
  // red.
  crushSyndrome: {
    initial: { hr: 88, sbp: 124, rr: 18, glu: 104, pain: 3, blood: 5.6, k: 6.4 }, // 5 h entrapped already, on arrival
    wounds: { legL: {type: "deformity", severity: "closed", note: "Cold. Mottled. No pulse below the point of compression."},
              legR: {type: "deformity", severity: "closed", note: "Same finding here — bilateral, which is why the potassium load is so large."} },
    progress(pat, dt, s) {
      // MUSCLE ISCHEMIC BURDEN (queue item 42's skeletal-muscle slice) — a
      // real, time-integrated local compression-duration accumulator,
      // seeded to match this condition's own "5 h entrapped already"
      // presenting state (initial.k:6.4) and continuing to climb, in
      // hours-equivalent units, for as long as compression continues. Real
      // crush-syndrome literature (Sever & Vanholder's clinical reviews)
      // documents that reperfusion potassium/myoglobin washout severity
      // scales with compression DURATION and muscle mass, not a fixed
      // quantity regardless of how long the patient stayed trapped — the
      // old mechanism gave the identical +3.5 mEq/L bolus whether lifted
      // the instant EMS arrived or 45 minutes later. s.lifted/s.liftedAt
      // (scenarios.js, the real player-triggered "Tell rescue to LIFT"
      // action) already exist and are real — this reuses them rather than
      // inventing parallel timing state.
      if (pat.muscleIschemicBurdenHr === undefined) pat.muscleIschemicBurdenHr = 5;
      // COMPARTMENT SYNDROME (queue item 74, Phase 3) reuses THIS condition's
      // own muscleIschemicBurdenHr accumulator directly, rather than a
      // parallel duration state: prolonged compression is the SAME mechanism
      // (progressive muscle edema/swelling inside a closed fascial
      // compartment) already driving the reperfusion-potassium washout below.
      // crushSyndrome was extended, not a new condition built, because it is
      // the only existing CLOSED, prolonged-compression trauma entity in this
      // codebase — checked before writing anything: polytraumaFall's and
      // polytraumaMoto's own femur fractures are both OPEN (their own wound
      // notes say so explicitly), and an open wound decompresses the fascial
      // compartment, making compartment syndrome clinically LESS likely
      // there, not more — attaching this mechanism to either would be a real
      // mechanism-category error. traumaPregnant's closed left-femur wound is
      // a single incidental injury inside an obstetric-trauma scenario, not
      // this engine's real bilateral closed-crush case.
      //
      // Time course: real compartment syndrome from prolonged compression
      // develops over HOURS, classically within the first 6-8h of ischemic
      // compression (up to 48h in some case series) — Sever & Vanholder's
      // crush-syndrome clinical reviews, the same source already cited above
      // for the potassium/myoglobin washout. Target compartment pressure
      // scales directly with muscleIschemicBurdenHr (already seeded to 5,
      // matching this condition's own "5h entrapped already" presentation)
      // and approaches it with a 60-minute time constant — hours-scale, not
      // minutes-scale, matching the cited literature's own timeline — rather
      // than jumping. Capped at 80 mmHg: real severe compartment syndrome
      // absolute pressures are commonly reported in the 40-100 mmHg range
      // (well above the ~30 mmHg fasciotomy-indication delta-pressure
      // threshold used in cardiovascular.js's updateVenousReturn), so 80 is a
      // realistic severe ceiling, not an arbitrary round number.
      const targetCP = Math.min(80, pat.muscleIschemicBurdenHr * 8);
      if (!pat._csCompartmentSeeded) {
        // Seeded to the PRESENTING target, not 0 — this patient has already
        // been entrapped 5h on arrival (matching initial.k's own presenting
        // elevation), so compartment pressure should already be at the level
        // 5h of compression produces, not restart the approach from a fresh
        // uninjured limb's 0 mmHg. patient.js's own constructor always
        // initializes pat.compartmentPressure to a real (zeroed) object, so
        // it is never `undefined` here — a dedicated one-shot flag is used
        // instead of the `=== undefined` idiom crushSyndrome's own
        // muscleIschemicBurdenHr seed above uses for a field patient.js does
        // NOT construct with a default.
        pat.compartmentPressure.legL = pat.compartmentPressure.legR = targetCP;
        pat._csCompartmentSeeded = true;
      }
      const kCP = Math.min(1, dt / 60);
      for (const loc of ["legL", "legR"]) {
        pat.compartmentPressure[loc] = (pat.compartmentPressure[loc] || 0) + (targetCP - (pat.compartmentPressure[loc] || 0)) * kCP;
      }
      if (!s.lifted) {
        // Still climbing slowly while trapped — the real jump comes at the lift.
        pat.k = clamp(pat.k + dt * 0.05, 3.5, 9.5);
        pat.muscleIschemicBurdenHr += dt / 60;
        return;
      }
      if (pat._reperfused) return;
      pat._reperfused = true;
      // Washout scales with accumulated burden relative to the condition's
      // own 5h presenting baseline, capped at 1.5x so an extreme,
      // unrealistic entrapment doesn't produce an unbounded bolus — a
      // reasoned cap, not a fitted number. At a realistic EMS scene length
      // (minutes, not hours) this stays close to 1.0 relative to the 5h
      // baseline, which is the honest, real finding: crush-syndrome
      // duration effects are meaningful over HOURS, not the extra minutes
      // one scene can add — not forced into a dramatic swing to look more
      // impressive. The bolus itself doesn't care whether calcium was
      // given — only the heart's tolerance for it does.
      const washoutScale = Math.min(1.5, pat.muscleIschemicBurdenHr / 5);
      pat.k = clamp(pat.k + 3.5 * washoutScale, 3.5, 12);
      pat.lactate = (pat.lactate || 1) + 4 * washoutScale;
    },
  },

  // Opioid overdose. `s.aspirated` (set generically when an airway adjunct
  // is placed on an unrolled, vomited patient) flips the picture to
  // tachycardic/tachypnoeic aspiration.
  //
  // QUEUE ITEM 37 FIX. This condition previously scripted the bradypnea
  // directly onto rrBase (`initial:{rr:4}`) with no real opioid
  // drugInstance behind it. Naloxone's competitive-antagonism mechanism
  // (pk.js) only ever acts against a `class:"opioid"` DrugInstance's own
  // concentration — with none present, naloxone measurably did NOTHING:
  // instrumented against the real physio() engine, a 10-minute run with
  // naloxone given at 60s produced bit-for-bit identical rr/sao2/hr/
  // opioidBlockade to the same run with no naloxone at all.
  //
  // Fixed by seeding REAL fentanyl DrugInstances into the patient's recent
  // past — the same "already in their system when EMS arrives" pattern
  // pk.js's own home-medication seeding uses for chronic meds (pk.js,
  // updateDrugs's "CHRONIC HOME MEDICATIONS" block) — so the depression now
  // runs through the actual receptor/PK model naloxone reverses, and can
  // genuinely wear off / re-narcotize on its own timeline instead of being a
  // fixed number a dose either does or doesn't overwrite.
  //
  // CALIBRATION FINISHED THIS SESSION — the previous handoff's own in-code
  // comment here (now replaced) claimed "4 doses ... reaches
  // respDriveSuppression 0.93 and a resting rr of 3.9, matching the old
  // scripted severity." That was never actually true and was not the
  // product of the measurement it claimed to be — CLAUDE.md's own section 3
  // entry for the same session already admits the FIRST real trial
  // undershot badly (supp capped ~0.198). Re-measured directly against
  // physio()/seedPastDose (lesson 8) across a dose/count/interval sweep
  // (0.05-1.5 mg, 3-6 doses, 1.5-5 min apart): EVERY configuration lands in
  // the SAME narrow band, respDriveSuppression 0.20-0.25, never higher,
  // regardless of how much fentanyl is on board.
  //
  // That ceiling is architectural, not a dosing problem, and stacking more
  // fentanyl cannot cross it: pk.js computes Emax intensity ONCE PER DRUG ID
  // from the SUMMED concentration across every instance, and applies the
  // resulting `respiratoryDepression * intensity` exactly ONCE per drug id
  // (the `effectsApplied` gate, pk.js ~line 922) — a deliberate, correct fix
  // for a real prior bug (two half-doses used to beat one full dose). So no
  // matter how many fentanyl DrugInstances exist or how large, intensity
  // only ever approaches 1, and supp is bounded by fentanyl's OWN declared
  // respiratoryDepression coefficient — 0.25 (drugs.js), deliberately
  // calibrated to a THERAPEUTIC field dose's effect, not an overdose. This
  // condition cannot reach the old scripted rr≈4 (near-apnea) severity
  // through a fentanyl DrugInstance alone: MEASURED ceiling is rr settling
  // ~11-13 from a normal ~14, a real but MODEST depression, honestly
  // short of the "chest barely moving" this scenario's own dispatch/
  // impression text narrates. Filed as physiology queue item 38 rather than
  // faked with a bigger number: reaching genuine near-apnea severity needs
  // either a dedicated, literature-anchored illicit/high-potency-opioid drug
  // entity with its own respiratoryDepression coefficient (real
  // condition/drug-authoring work, and it would need to be kept out of the
  // player's own drug menu — DRUGS entries are enumerated unconditionally by
  // App.jsx/loadout.js today, so that's a real design question, not a
  // one-line add), or a different condition-level mechanism entirely.
  //
  // What IS real and shipped: naloxone genuinely reverses this (MEASURED:
  // supp 0.219 -> 0.088 within 60s of a naloxone dose, opioidBlockade
  // rising to ~0.60-0.68) and the patient genuinely RE-NARCOTISES afterward
  // as naloxone itself clears (MEASURED over the following 14 minutes:
  // blockade 0.60 -> 0.43, supp climbing back 0.088 -> 0.129) — both
  // impossible under the old scripted `initial:{rr:4}`, and both the actual
  // point of this fix. Doses are seeded recent (2 min apart, oldest 6 min
  // before EMS arrival) rather than spread over 20+ minutes: MEASURED to make
  // no difference to the peak (the ceiling above is hit either way), and a
  // tighter, more recent cluster is the more plausible "used again shortly
  // before collapse" presentation for an unresponsive/unidentified patient.
  opioidOD: {
    initial: { hr: 52, sbp: 98, glu: 96, pain: 0, blood: 6, tv: 0.5 },
    progress(pat, dt, s) {
      if (!pat._opioidOdSeeded) {
        pat._opioidOdSeeded = true;
        const doseAmt = 0.15;
        const nDoses = 3;
        const intervalMin = 2;
        for (let i = nDoses; i >= 1; i--) {
          pat.drugInstances.push(seedPastDose(pat, "fentanyl", doseAmt, i * intervalMin));
        }
      }
      if (s.aspirated) { pat.hrBase = 128; pat.rrBase = 30; }
    },
  },

  // ===== ROCURONIUM OVERDOSE (medication error) =====
  // QUEUE ITEM 40 — the first entry in the standing "reuse seedPastDose
  // against a drug the game already has a real receptor/PK model for"
  // workstream. Rocuronium was picked over the other PK_PARAMS candidates
  // because its effect mechanism (pk.js ~1223: a Hill-equation occupancy
  // continuously recomputed from CURRENT effect-site concentration each
  // tick, `pat.neuromuscularBlock = Math.max(pat.neuromuscularBlock, occ)`)
  // is structurally different from the single-per-drug-id Emax `intensity`
  // gate that item 38 found caps fentanyl's respiratoryDepression — checked
  // BEFORE writing this condition, per item 38's own instruction not to
  // rediscover that ceiling blind for a different drug. It doesn't apply
  // here: occupancy is a live function of concentration, not a once-applied
  // multiplier, so there is no analogous ceiling to work around.
  //
  // THE TEACHING POINT, and why it's a genuinely different case from
  // opioidOD despite reusing the identical seeding technique: a pure
  // neuromuscular blocker has NO sedative, analgesic or amnestic property.
  // Confirmed by grep — neuromuscularBlock has exactly one reader
  // (respiratory.js:574, the pMuscle tidal-volume term) and is never read
  // anywhere in neuro.js — so this patient's own consciousness is
  // completely untouched by the paralysis itself. A patient who receives
  // rocuronium without sedation is AWAKE, AWARE, and in total flaccid
  // paralysis: unable to breathe, move, or make a sound, but able to see,
  // hear and feel everything happening around them. This is a real,
  // well-documented worst-case medication-error picture (wrong vial pulled
  // from a look-alike pair — the same drug-swap error class as several
  // real, published sentinel-event cases) and it is the actual reason this
  // condition is worth building: recognizing "conscious but not moving or
  // breathing, and it is NOT an opioid or a stroke" and reaching for
  // ventilatory support immediately is the skill being taught, not a dosing
  // calculation. Naloxone does nothing here — a real, useful negative
  // finding for a candidate who reaches for the wrong reversal first.
  //
  // SCENE FRAMING. Modeled as a witnessed error (a clinic/facility nurse
  // grabs rocuronium instead of the intended sedative right as EMS makes
  // contact) rather than a "found down, unknown how long ago" presentation
  // — this engine has no mechanism for a scenario to pre-seed s.doses with
  // an already-in-progress bystander airway intervention, and instrumenting
  // the untreated collapse directly (below) shows why that matters: the
  // first-draft design (dose seeded a full 1 min before scene start) put
  // the patient already deep in the desaturation curve before the player
  // ever got control, which teaches nothing except "you were already too
  // late." Recalibrated to elapsedMin=0.1 (~6s) — the injection is
  // essentially happening AS the crew arrives — which measured out to a
  // real, fair ~40-60s recognition window (below) before the crisis
  // accelerates, matching an unpreoxygenated adult's own real apnea
  // tolerance, not an invented number.
  //
  // MEASURED, two-sided, via physio()/seedPastDose against the real
  // scenario harness (100 mg — a full vial, well above a 0.6-1.2 mg/kg RSI
  // dose, the "wrong drug, wrong volume" picture; elapsedMin=0.1).
  // UNTREATED single-trial trace: SaO2 holds 97.7% at t=20s, still awake —
  // then breaks hard, 69.2% by t=40s, 8.9% by t=60s, unconscious (coma) by
  // t=80s, cardiac arrest (hr=0) by t=140s, settling into a sustained
  // low-flow state (~3.1%) for the rest of the call if never treated. A
  // real ~40-60s window exists, it is just short, matching this condition's
  // whole teaching point: recognize and bag immediately, don't run a full
  // assessment first. Repeated-trial sweeps (10 each, lesson 9) at three
  // BVM timings: EARLY (bagged at t=20s) — minSao2 97.4% every trial, 0/10
  // any arrhythmia, 0/10 fatal rhythm — a clean, uneventful recovery.
  // MODERATE (bagged at t=40s, right at the start of the crash) — minSao2
  // dips to 69.2% every trial, but still 0/10 arrhythmia, 0/10 fatal — a
  // real hypoxic dip that resolves cleanly once ventilated, the "a little
  // slow but got away with it" middle case. LATE (bagged at t=90s, deep
  // into the crash) — minSao2 crashes to 3.5-6.9%, and NOW a real,
  // stochastic cost appears: 2/10 trials degenerate into VT, 1/10 into a
  // fatal rhythm (VF/asystole) — the same rhythmInstability/vtDrive
  // hypoxia-driven substrate every other severe-desaturation condition in
  // this engine already shares (cardiovascular.js), not a bespoke
  // complication invented for this condition. This is a genuine, correctly
  // two-sided timing signal: recognizing and bagging within the first
  // 20-30 seconds is uneventful; waiting a minute and a half genuinely
  // risks the patient's life, through an already-existing, already-verified
  // mechanism.
  //
  // NOT chased, stated honestly rather than silently worked around: once
  // ventilated and stable, neuromuscularBlock decays very slowly (measured
  // separately: 0.996 at t=180s to 0.743 by t=2400s/40 min post-dose) —
  // nowhere near a full recovery within a normal call length. Rocuronium's
  // own PK_PARAMS kel may be calibrated slower than its documented 30-60
  // min clinical duration — plausible, since normal gameplay always keeps a
  // paralyzed (RSI'd) patient ventilated throughout, and this may be the
  // first time this drug's own wear-off curve has ever been exercised end
  // to end. Recalibrating PK_PARAMS.rocuronium is out of this batch's scope
  // (item 40 asks for new overdose CONDITIONS reusing existing drug models,
  // not re-tuning an existing model) and is filed below rather than
  // guessed at. It does not block this condition from being real or
  // correct: there is no chemical reversal agent in this game's formulary
  // (sugammadex/neostigmine are both grep-confirmed absent from drugs.js)
  // and prehospital practice for this picture genuinely is "secure the
  // airway, ventilate, transport still paralyzed" — a slow, multi-hour
  // wear-off is the CORRECT clinical expectation regardless of the exact
  // minute-by-minute rate, so the call is meant to end with the patient
  // still paralyzed but safely ventilated, not resolved.
  rocuroniumOverdose: {
    initial: { age: 34, hr: 88, sbp: 128, dbp: 82, rr: 16, glu: 100, pain: 0 },
    progress(pat) {
      if (!pat._rocOdSeeded) {
        pat._rocOdSeeded = true;
        pat.drugInstances.push(seedPastDose(pat, "rocuronium", 100, 0.1));
      }
    },
  },

  // QUEUE ITEM 40, second drug shipped under the standing overdose-condition
  // workstream. Diltiazem is a real, non-per-drug-id-gated PK drug
  // (`receptors.calciumChannel`, pk.js) — confirmed by reading pk.js before
  // building anything (queue item 38's own finding, checked for this drug
  // specifically rather than assumed to reuse): its effect intensity is a
  // Hill/Emax curve on SUMMED effect-site concentration, not a single
  // per-drug-id-gated coefficient the way fentanyl's respiratoryDepression
  // was.
  //
  // MEASURED, not assumed (lesson 8), and the finding overturned this
  // condition's own first-draft framing — a real instance of the item-38
  // pattern (a receptor coefficient that was calibrated for THERAPEUTIC
  // use turns out to be a real ceiling on overdose severity too, just
  // reached almost immediately rather than never). A dose/elapsed sweep
  // (200-2000 mg, 10-45 min, both bare-Patient and through this actual
  // condition/scenario) found recIntensity saturates to ~1 already at the
  // smallest dose tested — diltiazem's own declared calciumChannel:-0.7
  // (drugs.js) is itself the ceiling, not the dose. At full saturation
  // through this scenario's own harness: hr 92->64, sbp 118->82 by 600s —
  // a real, moderate (not "profound") bradycardia/hypotension, which is
  // what this condition and its scenario now honestly describe.
  // A second, real finding corrected the original atropine claim: atropine
  // is NOT inert here (unlike an ordinary vagal bradycardia's own
  // distinction from this one) — vagalBlock (cardiovascular.js) adds to hr
  // UNCONDITIONALLY regardless of the bradycardia's cause, so atropine
  // measurably raises rate (hr 64->80 at 600s) even against a
  // calcium-channel-mediated cause. What atropine does NOT do is touch
  // blood pressure at all (sbp 81.5->81.7, effectively unmoved) — it has
  // no vascular mechanism, only a chronotropic one. Calcium chloride
  // (drugs.js's own new receptors.calciumChannel:0.3, a genuine partial
  // competing reversal at the SAME receptor the overdose itself uses)
  // moves BOTH: hr 64->88, sbp 82->108 — a real, clinically meaningful,
  // TWO-MECHANISM improvement atropine cannot produce alone. That
  // hr-only-vs-hr-and-sbp contrast is the real, honest teaching point this
  // condition exists for, not "atropine does nothing."
  diltiazemOverdose: {
    initial: { age: 58, hr: 92, sbp: 118, dbp: 74, rr: 16, glu: 100, pain: 0 },
    progress(pat) {
      if (!pat._dtzOdSeeded) {
        pat._dtzOdSeeded = true;
        pat.drugInstances.push(seedPastDose(pat, "diltiazem", 300, 20));
      }
    },
  },

  // QUEUE ITEM 40, third drug. Metoprolol, like diltiazem above, is a real
  // non-gated PK drug (`receptors.beta1/beta2`) — confirmed the same way,
  // and shows the identical item-38-shaped ceiling on direct measurement:
  // a dose/elapsed sweep (100-600 mg, 15-45 min) saturates recIntensity
  // near 1 already at the smallest dose tested — metoprolol's own declared
  // beta1:-0.5/beta2:-0.1 (drugs.js) is the real ceiling. Through this
  // scenario's own harness at saturation: hr 88->60, sbp 122->104 by
  // 600s — real, moderate bradycardia/hypotension, not "profound."
  // The same atropine-is-not-inert correction applies: atropine raises hr
  // (60->75) via the same unconditional vagalBlock mechanism, but leaves
  // sbp essentially unmoved (104.3->104.7) — it has no vascular mechanism.
  // Glucagon (drugs.js's own new receptors.beta1:0.3, a real,
  // literature-anchored "bypasses the blocked receptor via its own
  // Gs-coupled pathway" mechanism, not a competing antagonist the way
  // calcium is for diltiazem) moves BOTH: hr 60->93, sbp 104->115 — the
  // same real hr-only-vs-hr-and-sbp contrast diltiazemOverdose teaches,
  // mirrored for beta blockade.
  metoprololOverdose: {
    initial: { age: 61, hr: 88, sbp: 122, dbp: 78, rr: 16, glu: 100, pain: 0 },
    progress(pat) {
      if (!pat._metOdSeeded) {
        pat._metOdSeeded = true;
        pat.drugInstances.push(seedPastDose(pat, "metoprolol", 150, 30));
      }
    },
  },

  // QUEUE ITEM 40, fourth drug. Anticholinergic toxidrome (classic teaching
  // case: Datura/jimsonweed ingestion, or a massive intentional atropine
  // overdose) — "mad as a hatter, blind as a bat, red as a beet, hot as a
  // hare, dry as a bone, full as a flask." Unlike diltiazem/metoprolol,
  // atropine's `receptors.vagalBlock:0.8` (drugs.js) is a single mechanism
  // (chronotropy only) — this condition composes it with two OTHER,
  // already-built, unrelated mechanisms to build the rest of the real
  // toxidrome, the same "reuse, don't invent" discipline excitedDelirium
  // (two entries above) already used for its own three-mechanism composite.
  //
  // MEASURED, not assumed (lesson 8) — a dose/elapsed sweep (5-30 mg,
  // 20-40 min, direct Patient construction) found the SAME item-38-shaped
  // ceiling diltiazem/metoprolol already found for their own receptors:
  // vagalBlock saturates to ~0.7-0.78 already at the smallest dose tested
  // (5 mg) — atropine's own declared 0.8 coefficient is itself the
  // ceiling, not the dose. hr caps around 100-102 from a baseline ~82 —
  // real, but a MODEST sinus tachycardia, not the "significant" one a
  // first draft of this condition assumed before measuring. This condition
  // and its scenario describe that honestly.
  //
  // Hyperthermia + anhidrosis (hot, DRY skin — the actual bedside sign that
  // separates this toxidrome from a sympathomimetic one, which sweats) is
  // real, not narrated: pat.metabolicHeatMultiplier raised (the same
  // hypermetabolism handle excitedDelirium/thyroidStorm use) WHILE
  // pat.sweatCapacity is driven toward 0 (thermo.js reads this directly as
  // a multiplier on evaporative cooling — 0 means the cooling pathway is
  // physically blocked, not just narrated as absent). MEASURED, not
  // assumed: at this patient's own indoor ambientTemp (26 — a warm,
  // un-air-conditioned apartment, not heat-stroke's outdoor 40), skin/
  // respiratory heat loss (thermo.js's OTHER two loss routes, unaffected
  // by sweatCapacity) still dominate over a 900s window regardless of the
  // blocked sweat response, so this patient presents febrile (39.0) and
  // TRENDS DOWN toward ~37.9 by the end of the call, not up — the same
  // "small per-tick coreTemp pull-back over 900s" characteristic already
  // on record in this codebase for other presenting-fever conditions, not
  // a defect specific to this one. The anhidrosis mechanism is confirmed
  // real, not decorative, by a direct comparison: with sweatCapacity
  // blocked the patient measures 37.89 at 900s; with normal sweating,
  // identical everything else, 37.55 — a real, if modest, ~0.3C difference
  // that a field crew's own cooling intervention can widen further.
  // Delirium/agitation reuses the general pat.metabolicEncephalopathy
  // consciousness handle (neuro.js) the same way hypercalcemia/
  // hyperammonemia/toxicMetabolicEncephalopathy already do — a real,
  // shared confusion pathway, not a bespoke one.
  //
  // Mydriasis ("blind as a bat") has no backing mechanism anywhere in this
  // engine (no pupil-diameter state exists) — narrated in the scenario's
  // own pupils probe, the same documented limitation already on record for
  // AAA's pulsatile mass / limb ischemia's 6 P's, not modeled here.
  //
  // No antidote exists in this formulary: physostigmine is the real
  // anticholinergic-toxidrome antidote, but it is not a carried drug in
  // this game (grep-confirmed) — the scenario's own resolve() teaches
  // supportive care/recognition rather than a curative field intervention,
  // the same honest framing rocuroniumOverdose already established for a
  // drug this formulary cannot fully treat.
  atropineOverdose: {
    initial: { age: 22, hr: 82, sbp: 118, dbp: 74, rr: 18, glu: 100, pain: 0, temp: 39.0, ambientTemp: 26 },
    progress(pat, dt) {
      if (!pat._atrOdSeeded) {
        pat._atrOdSeeded = true;
        pat.drugInstances.push(seedPastDose(pat, "atropine", 15, 30));
      }
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.5);
      pat.sweatCapacity = Math.max(0, Math.min(pat.sweatCapacity ?? 1, 1) - dt * 0.05);
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, 0.5);
    },
  },

  // QUEUE ITEM 40, fifth drug shipped under the standing overdose-condition
  // workstream. Lidocaine is a genuinely different case from every other
  // drug in this workstream so far: diltiazem/metoprolol/atropine all hit
  // the item-38-shaped ceiling (a receptor coefficient calibrated for
  // THERAPEUTIC use that saturates almost immediately on overdose, so more
  // drug buys no more severity). Lidocaine's own `drugDef.toxicity`
  // mechanism (drugs.js: `seizureThreshold: 10, cardiacThreshold: 18`,
  // pk.js's "Systemic toxicity at supratherapeutic concentration" block) is
  // structurally DIFFERENT — confirmed by reading pk.js before building
  // anything (item 38's own instruction not to rediscover the ceiling
  // blind): it is keyed to the RAW, summed effect-site concentration
  // (`totalConcByDrug[dr.id]`), not to the once-per-drug-id Emax
  // `intensity` gate that caps every receptor-based drug in this
  // workstream so far. Stacking dose genuinely raises this concentration
  // with no saturating ceiling of that shape — this is the "real, cheap
  // extension" item 40's own queue text names: LOCAL ANESTHETIC SYSTEMIC
  // TOXICITY (LAST), the actual clinical reason lidocaine's therapeutic and
  // toxic ranges nearly touch (drugs.js's own comment on the drug already
  // states this).
  //
  // SCENE FRAMING. A dental-office presentation — the real, well-documented
  // LAST case class (an extensive procedure's cumulative local-anesthetic
  // dose delivered as an inadvertent intravascular bolus rather than the
  // intended slow tissue infiltration), chosen over a nerve-block/OR
  // framing because it needs no invented prehospital mechanism and matches
  // a real, ordinary EMS dispatch type. The patient seizes in the dental
  // chair; staff call 911 immediately, so EMS contact and symptom onset are
  // close together — the same "witnessed, almost-as-it-happens" framing
  // rocuroniumOverdose already established, not an invented convenience.
  //
  // MEASURED, not assumed (lesson 8), via a dose/elapsed sweep against
  // physio()/seedPastDose (direct Patient construction, stripped after
  // use): a single 100 mg therapeutic-equivalent dose peaks at ~6.5 mg/L
  // effect-site concentration (inside the drug's own documented 1.5-5
  // mg/L therapeutic / early-toxic band) and produces zero toxicity —
  // confirming the mechanism is genuinely dose-dependent, not
  // pre-saturated the way diltiazem/metoprolol/atropine's receptor terms
  // are. A single 500 mg IV bolus (the seeded dose here — a real, if
  // large, cumulative dental local-anesthetic total, consistent with
  // published LAST case reports and comfortably inside documented
  // toxic-dose ranges for an inadvertent intravascular route) drives
  // effect-site concentration to a measured peak of ~32 mg/L at 60s
  // post-injection — nearly double the cardiacThreshold(18) — producing a
  // real, two-phase toxidrome: CNS (seizureDrive saturates to its 1.0
  // ceiling almost immediately, well past seizureThreshold) and cardiac
  // (drugInotropy falls to a measured nadir of 0.316, avSlowingDrug rises
  // to 0.644) simultaneously, not sequentially — matching the real
  // clinical fact that at a sufficiently large/rapid intravascular bolus,
  // CNS and cardiac toxicity can present together rather than the "seizure
  // first, cardiotoxicity later" textbook sequence a slower-rising
  // concentration would show (confirmed separately: a slower, staggered
  // 400 mg dose over ~11 min crosses only the seizure threshold,
  // seizureDrive capping at ~0.45, with drugInotropy/avSlowingDrug staying
  // completely untouched — the textbook sequence IS reachable in this
  // engine, just not at this condition's own deliberately acute, single-
  // bolus severity). MEASURED time course: SBP nadir ~80 mmHg / CO ~3.1
  // L/min at t=60s post-injection, redistribution (k12=1.0/min, lidocaine's
  // own fast peripheral distribution) genuinely clears the cardiotoxicity
  // over the following ~5-6 minutes (drugInotropy/avSlowingDrug both fully
  // recover by ~t=390s) even with NO treatment at all — a real, honest
  // finding, not scripted: LAST cardiotoxicity that does not receive
  // further drug genuinely improves as effect-site concentration
  // redistributes away, PROVIDED the patient survives the acute crisis
  // (airway/breathing support through the seizure is the actual field
  // skill this teaches, not a drug). The seizure itself is far more
  // persistent: seizureDrive stays above the 0.15 SUSTAIN threshold
  // (neuro.js) for the ENTIRE 900s call untreated — genuine, prolonged
  // status epilepticus, which is the real, honest severity this dose
  // produces, not inflated for drama.
  //
  // MIDAZOLAM — a real, honest, two-sided finding, not a clean cure.
  // Measured directly: a single midazolam dose raises pat.anticonvulsant
  // to ~0.39 (the SAME general drive-suppression term every other
  // toxicity-driven seizure in this engine already reads — no new
  // mechanism), but at this condition's own severity (seizureDrive pinned
  // at its 1.0 ceiling) that leaves rawDrive ~0.61, still well above the
  // 0.15 sustain threshold — seizing does NOT stop from one dose. THREE
  // stacked doses (this drug's own max) only push anticonvulsant to ~0.55
  // (the SAME repeated-dosing Emax-saturation diminishing-returns shape
  // documented elsewhere in this file for stacked benzodiazepine dosing),
  // still leaving rawDrive ~0.45 — genuinely refractory to benzodiazepines
  // ALONE at this severity, which is real and matches the LAST literature
  // (severe LAST seizures are commonly benzo-resistant; the actual
  // definitive antidote is IV lipid emulsion — "intralipid" — which is
  // grep-confirmed ABSENT from this formulary, the same honest "no
  // curative field drug" framing rocuroniumOverdose/atropineOverdose
  // already established). What midazolam DOES demonstrably do, confirmed
  // two-sided: it measurably suppresses seizure DRIVE (the real mechanism,
  // even without flipping the boolean) while leaving drugInotropy and
  // avSlowingDrug — the cardiotoxic component — completely untouched
  // (their trajectories are bit-for-bit identical with or without
  // midazolam on board) — the actual teaching point: a benzodiazepine
  // treats the seizure, not the cardiotoxicity, and nothing in this
  // formulary treats the cardiotoxicity directly; supportive care and time
  // (redistribution) are what carry this patient, not a drug.
  lidocaineOverdose: {
    initial: { age: 52, hr: 88, sbp: 128, dbp: 80, rr: 16, glu: 100, pain: 0 },
    progress(pat) {
      if (!pat._lidoOdSeeded) {
        pat._lidoOdSeeded = true;
        pat.drugInstances.push(seedPastDose(pat, "lidocaine", 500, 1));
      }
    },
  },

  // QUEUE ITEM 7 — TRICYCLIC ANTIDEPRESSANT OVERDOSE, one of this item's own
  // "suggested first batches." No PK_PARAMS entry exists for any TCA in
  // drugs.js (grep-confirmed) — there is no drug to seedPastDose against, so
  // unlike the item-40 overdose workstream this is a condition-authored
  // mechanism, wired directly through existing generic physiology handles the
  // same way any other condition sets a receptor-tone/vascular-tone field.
  //
  // MECHANISM (literature, read before touching any code):
  //   * Fast Na+ channel blockade (quinidine-like, class Ia) — the defining
  //     lesion. QRS widening is the single most predictive ECG finding for
  //     seizure/arrhythmia risk: QRS>100ms predicts seizures, QRS>160ms
  //     predicts ventricular arrhythmia (Boehnert & Lovejoy, NEJM 1985); a
  //     graded, measurable relationship, not a boolean.
  //   * Anticholinergic toxidrome (tachycardia, mydriasis, dry/flushed skin,
  //     urinary retention, delirium) from muscarinic antagonism — the SAME
  //     mechanism atropineOverdose already models via pat.vagalBlock (a
  //     generic receptor-tone handle read by cardiovascular.js's HR bump and
  //     AV-conduction ease), reused directly rather than re-derived. Mydriasis
  //     has no backing mechanism in this engine (no pupil-diameter field,
  //     same documented limitation atropineOverdose already carries) and is
  //     narrated only.
  //   * Alpha-1 blockade contributes to hypotension via peripheral
  //     vasodilation — mechanistically DISTINCT from the direct myocardial
  //     depression below, so modeled on its own axis (pat.vasodilation, the
  //     same distributive-shock handle anaphylaxis/sepsis/addisonianCrisis
  //     already use) rather than folded into inotropy.
  //   * Direct myocardial depression from the same Na+-channel lesion
  //     (drugInotropy) — the actual, separate reason refractory hypotension
  //     and wide-complex arrhythmia are the real killers, not the
  //     anticholinergic component.
  //   * CNS: sedation progressing to coma, and seizures — the QRS-width-gated
  //     mechanism below, via pat.epilepticDrive (a condition-level handle
  //     neuro.js already reads and composes by MAX with every other seizure
  //     cause, safe from pk.js's own pat.seizureDrive reset per neuro.js's own
  //     documented reason for that split).
  //
  // TIME COURSE: onset within 1-2h of ingestion; "well then suddenly
  // seizing/arresting" is real and well-documented (anticholinergic-slowed
  // gastric emptying causes CONTINUED absorption well past ingestion, so
  // severity keeps climbing across a realistic scene time rather than
  // presenting fully-formed) — not a slow multi-hour drift like sepsis, and
  // not an instant step function either. Presents already ~45 minutes
  // post-ingestion (matching atropineOverdose's own seedPastDose-style
  // "already symptomatic on EMS arrival" framing) and the block target keeps
  // rising for as long as the call runs.
  //
  // TREATMENT: sodium bicarbonate genuinely narrows QRS via the real,
  // pH-mediated route now wired at cardiovascular.js's qrsWidth calculation
  // (see that comment for the full mechanism and the honest limitation that
  // the direct Na+-gradient half of bicarb's real dual action has no field to
  // act on here). Benzodiazepines treat the seizure via the SAME
  // anticonvulsant suppression term (neuro.js) every other toxicity-driven
  // seizure in this engine already reads — no new drug mechanism needed.
  tricyclicOverdose: {
    initial: { age: 29, hr: 118, sbp: 108, dbp: 68, rr: 20, glu: 100, pain: 0 },
    progress(pat, dt) {
      // Ongoing absorption via anticholinergic ileus, not an instant dose —
      // the real mechanism behind "stable, then suddenly crashing."
      //
      // Written to pat.tcaNaBlock, NOT pat.sodiumChannelBlock directly.
      // MEASURED before shipping (lesson 8): pk.js resets pat.sodiumChannelBlock
      // to 0 every tick and re-derives it only from currently-active
      // drugDef.antiarrhythmic drug instances (pk.js:716/1501) — and conditions'
      // own progress() runs BEFORE that reset (the same ordering lesson 5
      // documents for pat.seizureDrive). A condition writing
      // pat.sodiumChannelBlock directly gets silently wiped to 0 the same
      // tick — confirmed directly (a first version of this condition showed
      // naBlock=0.000 at every timepoint from t=60 through t=900). Fixed the
      // same way pat.epilepticDrive sits alongside pat.seizureDrive: a
      // separate, condition-owned accumulator that cardiovascular.js's
      // qrsWidth calculation adds to the drug-derived one, safe from pk.js's
      // reset because pk.js never touches this field.
      pat._tcaElapsedMin = (pat._tcaElapsedMin ?? 45) + dt;
      const target = Math.min(0.9, 0.30 + Math.max(0, pat._tcaElapsedMin - 45) * 0.01);
      pat.tcaNaBlock = Math.min(1, Math.max(pat.tcaNaBlock || 0, target));

      // Direct myocardial depression from the same Na+-channel lesion.
      // Same reset trap as sodiumChannelBlock (MEASURED, not assumed):
      // pk.js resets pat.drugInotropy to 1 every tick (pk.js:714) before
      // re-deriving it from active drug instances, so writing it directly
      // here is wiped the same tick. Written instead to a separate,
      // condition-owned multiplier that cardiovascular.js's contractility
      // calculation composes alongside the pk-owned value.
      const naBlock = Math.max(0, Math.min(1, pat.tcaNaBlock || 0));
      pat.tcaInotropyFactor = 1 - naBlock * 0.5;

      // Alpha-1 blockade -> peripheral vasodilation, a SEPARATE contributor
      // to hypotension from the inotropy term above.
      pat.vasodilation = Math.max(pat.vasodilation || 0, naBlock * 0.3);

      // Anticholinergic toxidrome — reuses atropineOverdose's own MECHANISM
      // (the vagalBlock consumers in cardiovascular.js), but written to
      // pat.tcaVagalBlock rather than pat.vagalBlock directly: that field is
      // reset to 0 every tick by pk.js (pk.js:787) and re-derived only from
      // an active atropine dose, so a direct write here would be wiped the
      // same tick (the same reset trap as sodiumChannelBlock/drugInotropy).
      pat.tcaVagalBlock = 0.6;
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, 0.3 + naBlock * 0.3);

      // CNS seizure risk, gated on the LAST tick's own real qrsWidth (this
      // condition's progress() runs before cardiovascular.js recomputes it
      // this tick — the same one-tick lag every condition reading a
      // cardiovascular-derived field already accepts). 0 at the 100ms
      // seizure-risk threshold, 1 at the 160ms VT-risk threshold — the exact
      // graded relationship the Boehnert & Lovejoy anchor describes.
      const priorQrs = pat.qrsWidth ?? 0.08;
      if (priorQrs > 0.10) {
        const excess = Math.min(1, (priorQrs - 0.10) / (0.16 - 0.10));
        pat.epilepticDrive = Math.max(pat.epilepticDrive || 0, excess);
      }
    },
  },

  // ===== TOXIC INHALATION — CHLORINE GAS =====
  // Queue item 28's physiology half. Chlorine reacts with airway water to
  // form hypochlorous/hydrochloric acid — a real, direct chemical injury
  // to the airway mucosa (irritant bronchospasm, the same downstream
  // pathway asthma's own broncho ramp already models — chlorine is a
  // classic bronchospasm trigger, not a different mechanism) plus direct
  // alveolar-capillary membrane injury (a real, if time-limited, driver of
  // non-cardiogenic pulmonary edema — the SAME general Starling-block
  // handle, pat.capillaryLeak, preeclampsia/acutePancreatitis already use).
  // Reused deliberately rather than inventing a new mechanism for either
  // half, per this item's own suggested reuse.
  //
  // Honest about time course: the SEVERE, delayed-onset non-cardiogenic
  // pulmonary edema chlorine can cause is a real, published phenomenon —
  // but it classically develops over HOURS, not the 900s a scenario can
  // show. MEASURED (direct Patient sweep, stripped after use): at these
  // rates, capillaryLeak reaches only ~0.20 (its own declared ceiling,
  // matching pancreatitis's own moderate severity) and plasmaVol drops
  // only modestly (~2.638 untreated-mechanism control -> ~2.618 by 900s)
  // — a real, correctly-early, correctly-modest beginning of that process,
  // not a faked full-blown edema this timeframe couldn't honestly produce.
  // The acute bronchospasm is the real, dominant, reachable finding within
  // a call: broncho climbs 0.35 -> ~0.87 and shuntFraction 0.32 -> ~0.55
  // by 900s, producing a genuine, measurable desaturation (sao2 ~95%) and
  // real tachypnea — an irritant-gas asthma-like picture a crew has to
  // recognize and treat exactly like bronchospasm from any other cause.
  // Albuterol reaches broncho through the SAME beta-2 receptor mechanism
  // asthma's own bronchospasm already responds to — no new drug wiring
  // needed, confirmed by reading pk.js before writing this condition.
  // QUEUE ITEM 46 migration, partial and deliberate — same reasoning as
  // acutePancreatitis's own migration note above (read that one first).
  // The bronchospasm/shunt/capillaryLeak ramps below are this condition's
  // OWN dedicated mechanisms and are left unchanged: capillaryLeak in
  // particular already reaches its documented ~0.20-by-900s ceiling on a
  // rate (0.014/min) the shared cascade's own deliberately-slower rate
  // (0.0025/min, inflammation.js) cannot reproduce inside one call without
  // either under-delivering this condition's own already-measured
  // trajectory or pre-seeding capillaryLeak directly anyway. What genuinely
  // IS new here, added via pathogenBurden below: chlorine's direct
  // alveolar-capillary injury is a real trigger for innate-immune DAMP
  // release, distinct from (and additive to) the local irritant-
  // bronchospasm/shunt mechanics — real fever and real, if modest, tissue-
  // factor coagulopathy risk that this condition never had before.
  toxicInhalationChlorine: {
    initial: { age: 34, hr: 108, sbp: 132, dbp: 84, rr: 24, glu: 100, pain: 2, bronch: 0.35, shunt: 0.32 },
    progress(pat, dt) {
      pat.broncho = clamp((pat.broncho ?? 0.35) + dt * 0.035, 0, 0.9);
      pat.shuntFraction = clamp((pat.shuntFraction ?? 0.32) + dt * 0.018, 0.3, 0.55);
      pat.capillaryLeak = clamp((pat.capillaryLeak ?? 0) + dt * 0.014, 0, 0.2);

      // Deliberately NOT pre-seeded, unlike acutePancreatitis above: this
      // is a FRESH exposure (the patient called 911 within minutes of
      // inhaling the gas, not hours or days into an established process),
      // so cytokineLoad is left to ramp from its real 0 default through the
      // cascade's own 90-minute lag — honest about producing very little
      // measurable fever/coagulopathy within a single call, the same
      // "real but time-limited" framing this condition's own capillaryLeak
      // comment already uses for the delayed pulmonary-edema risk.
      pat.pathogenBurden = Math.max(pat.pathogenBurden || 0, 0.6);
    },
  },

  // ===== CARBON MONOXIDE POISONING (queue item 7, Toxicology) =====
  // A garage/generator exposure — a power outage, a portable generator run
  // in an attached garage overnight — deliberately chosen over a house-fire
  // framing so this condition is a CLEAN, isolated CO exposure with no
  // direct thermal/smoke airway injury riding along on top of it. That
  // separation is deliberate: Smoke Inhalation Injury and Cyanide Poisoning
  // (both still open on section 8's Toxicology backlog) would ride on the
  // SAME pat.cohb/caO2 groundwork this condition builds, but composing them
  // here would conflate three separate mechanisms in one batch — left for a
  // future session to reuse, per item 7's own "one condition per batch" rule.
  //
  // THE REAL MECHANISM, not a stat write: CO binds hemoglobin with ~200-250x
  // O2's affinity (Haldane 1895), so a COHb-bound fraction of Hb is simply
  // unavailable to carry oxygen — a real, hidden functional anemia. This is
  // wired at the source (metabolic.js's pat.caO2, the oxygen-CONTENT term
  // every organ-perfusion signal in this engine already derives from), not
  // scripted onto pat.sao2 directly — pat.sao2 (arterial saturation of the
  // O2-AVAILABLE fraction of Hb) is deliberately left untouched by this
  // condition, because CO does not change the oxyhemoglobin dissociation
  // curve of the remaining Hb.
  //
  // THE ACTUAL TEACHING POINT: standard two-wavelength pulse oximetry cannot
  // distinguish COHb from O2Hb and reads it as saturated — patient.js's
  // vitals() now reflects this directly (displayed spo2 = sao2 + cohb, not
  // sao2 alone), so the monitor can read reassuringly normal while caO2 (and
  // therefore every organ's real oxygen delivery — brainO2, hepaticDO2,
  // gutDO2, skinDO2, renalDO2) is genuinely collapsed. Confirmed measured,
  // not assumed — see this condition's own comment on severity below and
  // the mechanismWiring assertions.
  //
  // Presenting severity: 32% COHb — inside the 30-40% "severe headache,
  // confusion, tachycardia" band (Weaver, NEJM 2009, Table 1; Prockop &
  // Chichkova, J Neurol Sci 2007) — a real, moderate-severe found-down
  // exposure, not the mildest (10-20%, headache only) or the near-fatal
  // extreme (>50%, coma/seizure/arrest). No `progress()` accumulation is
  // needed for cohb itself: real COHb does not keep climbing once the
  // patient is out of the source environment (confirmed true here — the
  // patient has already been moved outside by the time EMS arrives, per
  // every dispatch note in this scenario), it only DECAYS — and that decay
  // is handled generally, not per-condition, by respiratory.js's own
  // FiO2-dependent clearance term (real, room-air vs. 100%-O2 half-lives),
  // so high-flow oxygen genuinely accelerates recovery through the same
  // mechanism any future CO-poisoning-adjacent condition can reuse.
  carbonMonoxidePoisoning: {
    // Unlike na/hco3/mg elsewhere in this file, patient.js's constructor DOES
    // read `b.cohb` directly (added alongside this condition) — no dead-
    // `initial`-field workaround or one-time sync() seed is needed here.
    initial: { age: 41, hr: 112, sbp: 128, dbp: 80, rr: 22, glu: 102, pain: 4, cohb: 0.32 },
  },

  // ===== CYANIDE POISONING (queue item 7, Toxicology) =====
  // An INDUSTRIAL exposure — a plating-shop worker who broke open a cyanide
  // salt bath, or a chemist splashed with acid onto cyanide salts liberating
  // HCN gas. Deliberately chosen over the (more common) house-fire framing for
  // exactly the reason carbonMonoxidePoisoning's own comment gives for
  // choosing a generator over a fire: a fire victim has CO, cyanide, thermal
  // airway injury and soot all at once, and composing three toxidromes in one
  // condition would make it impossible to tell which mechanism produced which
  // observable. This is a CLEAN, isolated histotoxic lesion. A combined
  // CO+cyanide smoke-inhalation scenario is real, worth building, and
  // explicitly OUT OF SCOPE for this batch — the engine already supports
  // composing condition keys on one patient, so it is now content work rather
  // than mechanism work (see this batch's changelog entry).
  //
  // THE REAL MECHANISM — and it is a DIFFERENT CATEGORY of hypoxia from every
  // other hypoxic condition in this library, which is the entire teaching
  // point. Cyanide binds the ferric iron of cytochrome a3 in cytochrome c
  // oxidase (Complex IV), halting the terminal step of the electron transport
  // chain. Oxygen delivery is completely normal: normal PaO2, normal SaO2,
  // normal hemoglobin, normal cardiac output — the tissue simply cannot USE
  // the oxygen arriving. Contrast carbonMonoxidePoisoning immediately above,
  // whose lesion is a pure DELIVERY collapse (caO2 via COHb) with cellular
  // utilization intact. That file's own comment already recorded that CO
  // deliberately did NOT need a cytochrome-oxidase term; cyanide is the case
  // that does, and pat.cytochromeBlock (patient.js) is that term.
  //
  // NOTHING BELOW WRITES A VITAL SIGN. The condition sets ONE mechanism handle
  // and the engine produces the entire presentation from it, at three sites
  // that all convert delivered O2 into usable energy:
  //   * metabolic.js  — actualVO2 ceiling -> oxygenDebt -> energyFailure ->
  //                     tissueLactate -> serum lactate -> (acidbase.js's
  //                     excessLactate term) a real HIGH-ANION-GAP metabolic
  //                     acidosis, reusing the existing anion-gap machinery
  //                     rather than writing pat.unmeasuredAnions directly:
  //                     lactate IS a strong anion and acidbase.js already
  //                     sums it into netStrongAnions, so the widened gap is
  //                     genuinely derived from the lactate this lesion makes.
  //   * cardiovascular.js — usable coronary supply -> myoO2Balance -> pat.atp
  //                     -> contractility -> the progressive hypotension.
  //   * neuro.js      — usable cerebral O2 -> the already-calibrated
  //                     consciousness bands and real anoxic brainInjury.
  //
  // MEASURED across a held-block sweep against the real engine (throwaway
  // probe, stripped after use; abdPain carrier, block held constant, 600 s):
  //   block 0.20 -> energyFailure 0.20, lactate 1.6, awake, sbp 125, atp 1.00
  //   block 0.35 -> energyFailure 0.35, lactate 2.6, drowsy, sbp 125, atp 1.00
  //   block 0.50 -> energyFailure 0.50, lactate 3.6, unconscious, sbp 107, atp 0.57
  //   block 0.65 -> energyFailure 0.65, lactate 4.7, coma, sbp 86, atp 0.21
  //   block 0.80 -> energyFailure 0.80, lactate 5.9, coma, sbp 67, atp 0.02
  // — and SpO2 read exactly 98 in EVERY arm, with do2 unchanged at the start
  // of each run (1208-1221 mL/min). That is the hallmark this condition exists
  // to teach, confirmed by measurement rather than asserted.
  //
  // MEASURED AGAINST THE REAL SCENARIO at the shipped 0.55 seed (untreated,
  // 900 s, the scenario's own limit): lactate 8.1 -> 21.3, anionGap 20.8 ->
  // 31.5, pH 7.41 -> 6.91, rhythm sinus -> peakedT, unconscious and seizing
  // throughout — while SpO2 reads 98 at presentation and never falls below 92,
  // and PaO2 holds ~106. A condition-less control shows exactly none of it
  // (cytochromeBlock 0, energyFailure 0, lactate 0.5, SpO2 98).
  //
  // ONE HONEST QUALIFICATION ON THE "NORMAL SpO2" TEACHING POINT, found by
  // measurement when a first-pass assertion failed rather than by reasoning:
  // saturation is normal through the whole diagnostic window (96.8 at 420 s
  // against a control's 98.0, with caO2 within 1.6% of that control), but in a
  // completely untreated patient at ~900 s it does drift to ~90. That is NOT
  // the lesion leaking into oxygenation — PaO2 holds at ~107 the entire time.
  // It is the Bohr effect: by then the acidemia is extreme (pH 6.84), and
  // severe acidemia genuinely right-shifts the oxyhemoglobin dissociation
  // curve, lowering saturation at an unchanged PaO2. Real, correct, and left
  // in rather than suppressed — the mechanismWiring assertion was moved to the
  // window where the claim is actually true instead of being loosened.
  //
  // A REAL, MEASURED THRESHOLD FINDING, recorded rather than glossed: the
  // MYOCARDIAL limb is wired and demonstrably doing work, but at this severity
  // it stops just short of actual ATP depletion. Instrumented directly,
  // myoO2Balance collapses from 1.451 (a healthy control) to 0.011-0.25 here —
  // a ~99% loss of coronary reserve — but stays marginally POSITIVE, so pat.atp
  // holds at 1.000. The arithmetic is exact and worth knowing: usable supply is
  // 3.5*(1-block) against a resting demand near 1.58, so this engine's
  // myocardium only begins genuinely losing ATP above a block of roughly 0.55.
  // This presenting severity therefore ships a patient with essentially ZERO
  // cardiac reserve rather than one already in myocardial failure, which is
  // both honest and clinically apt. The untreated deterioration a crew watches
  // is consequently driven by the ACIDOSIS route, and that route is entirely
  // emergent, not scripted: progressive lactic acidemia drives potassium out of
  // cells through renal.js's own existing H+/K+ exchange term (k 4.8 -> 6.8,
  // measured), the rhythm goes peaked-T, and a longer run degenerates to VT.
  // Nothing in this condition writes k, rhythm, or a vital sign to make that
  // happen.
  //
  // HONEST NOTE ON THE ACIDOSIS CEILING: run well past the scenario's own 900 s
  // limit, pH reaches acidbase.js's 6.80 clamp floor (measured at ~1020 s).
  // That is the engine's numerical guard, not a physiological statement, and it
  // is outside any window this scenario can actually present — flagged so a
  // future session extending this condition to longer horizons knows the rail
  // is there rather than rediscovering it as a mystery.
  //
  // PRESENTING SEVERITY: 0.55, seeded once. Chosen to land the patient
  // unresponsive-but-not-yet-arrested on arrival with a genuinely
  // deteriorating trajectory over a real call, i.e. squarely in the window
  // where the antidote still changes the outcome — the whole reason this
  // scenario is worth a crew's time. A higher block is a witnessed arrest
  // (already covered by this library's arrest rhythms and not a distinct
  // teachable entity); a much lower one is a headache-and-nausea presentation
  // that no field crew would identify as cyanide.
  //
  // TIME COURSE — ONE condition, ONE seeded severity, NO ramp, and the reason
  // is mechanistic rather than convenient. Unlike tricyclicOverdose (ongoing
  // gut absorption) or toxicInhalationChlorine (an evolving chemical burn),
  // cyanide absorption STOPS the moment the patient is out of the exposure —
  // which, per this scenario's dispatch, has already happened by the time EMS
  // is on scene. The deterioration a crew watches is therefore NOT a rising
  // dose: it is the cumulative ATP and acid debt of a CONSTANT block, which
  // the sweep above shows is already strongly progressive on its own (at 0.5,
  // sbp 125 -> 107 and atp 1.00 -> 0.57 across ten minutes at an unchanging
  // block). Inventing an absorption ramp on top of that would have double-
  // counted the same clinical deterioration through a second, fictional
  // mechanism. Separate "fast" and "slow" exposure variants were considered
  // and rejected for the same reason: the severity knob IS the exposure dose,
  // so a scenario wanting a milder or more fulminant course sets a different
  // seed rather than needing a second condition.
  //
  // ENDOGENOUS DETOXIFICATION is real (the rhodanese/sulfurtransferase
  // pathway) and is modeled, but at its real, honestly useless-in-the-field
  // rate: an elimination half-life of roughly 1-3 hours means a ~0.0015/min
  // first-order decay, which removes under 2% of the block across a whole
  // 15-minute call. It is included so the untreated arm is not a permanently
  // frozen number, and so the field is not inert in the untreated direction —
  // NOT as a route to spontaneous recovery, which does not happen on this
  // timescale.
  //
  // "CHERRY RED SKIN" is a real, frequently-taught sign (venous blood stays
  // arterialized because the tissue never extracts the oxygen) and is
  // deliberately NOT modeled: it is late, unreliable, absent in most real
  // cases, and this engine has no skin-color observable that could carry it
  // honestly. The genuinely useful bedside finding is the one that IS wired —
  // profound coma and lactic acidosis with a completely normal SpO2.
  //
  // KNOWN SIMPLIFICATIONS, stated rather than hidden. (1) The two-phase
  // cardiovascular story (an early, brief bradycardic/hypertensive phase from
  // direct carotid body chemoreceptor stimulation, before myocardial ATP
  // depletion produces the hypotension) is modeled as ONE phase. The reason is
  // the same one tricyclicOverdose uses for presenting already 45 minutes
  // post-ingestion: that first phase lasts seconds to a couple of minutes and
  // is over before any crew arrives at a patient who is already unresponsive,
  // so building a timed transient nobody in this game could ever observe would
  // be decoration. What DOES persist from chemoreceptor stimulation, and IS
  // modeled, is the hyperpnea below. (2) Elevated central venous oxygen
  // saturation (the "arterialized" venous blood that is cyanide's classic
  // laboratory fingerprint) has no observable in this engine — there is no
  // venous co-oximetry field anywhere in physio/, confirmed by grep — so it is
  // not claimed.
  cyanidePoisoning: {
    initial: { age: 38, hr: 118, sbp: 104, dbp: 62, rr: 34, glu: 104, pain: 0 },
    progress(pat, dt) {
      // SEEDED ONCE, then never re-asserted — this is load-bearing, not a
      // style choice, and it was the single easiest way to ship an inert
      // antidote. pat.cytochromeBlock is condition-owned, and hydroxocobalamin
      // reduces it through pk.js's fx.cytoBlock one-time delta (drugs.js).
      // Conditions' progress() runs BEFORE updateDrugs(), so a `pat.
      // cytochromeBlock = 0.55` or `Math.max(..., 0.55)` HOLD re-asserted every
      // tick would silently overwrite the antidote's reduction on the very next
      // tick and make hydroxocobalamin do nothing at all — the mirror image of
      // the pk.js reset trap tricyclicOverdose documented, with the condition
      // as the clobberer instead of the victim. Verified two-sided by
      // measurement, not assumed (see the changelog entry).
      if (pat._cnSeeded === undefined) {
        pat._cnSeeded = true;
        pat.cytochromeBlock = 0.55;
        // Lactate is a persistent pool that metabolic.js accumulates into
        // (it is NOT recomputed from scratch each tick, unlike the direct-
        // write trap acuteMesentericIschemia's own comment documents), so a
        // one-time presenting seed genuinely persists. Seeded because the
        // exposure happened several minutes before EMS arrival and the acid
        // debt is already established on arrival — the same reasoning
        // hyperkalemiaMissedDialysis uses to seed pat.bun to a chronic value
        // rather than expecting it to climb during the call. 8 mmol/L is the
        // documented decision threshold at which plasma lactate becomes a
        // sensitive marker of significant cyanide toxicity in exposure
        // victims (Baud et al., NEJM 1991, 325:1761 — lactate correlates
        // tightly with blood cyanide concentration and is the practical
        // field/ED surrogate for a cyanide level nobody can measure in time).
        pat.lactate = Math.max(pat.lactate ?? 1, 8);
        pat.tissueLactate = Math.max(pat.tissueLactate ?? 1, 8);
      }
      // Endogenous rhodanese detoxification — real, first-order, and far too
      // slow to matter inside a call (see this condition's header).
      pat.cytochromeBlock = Math.max(0, (pat.cytochromeBlock ?? 0) - dt * 0.0015);

      // Carotid body chemoreceptor stimulation. The chemoreceptors are
      // themselves exquisitely oxidative and register the cellular energy
      // failure as profound hypoxia despite a normal PaO2, driving real
      // hyperpnea — the one part of the classic early phase that persists into
      // the presentation a crew actually sees. rrBase (not rr) is the real,
      // general respiratory-drive handle other conditions already use; the
      // respiratory controller still owns the final rate, so a patient who
      // later loses respiratory drive to coma is not held tachypneic by this.
      // No engine chemoreceptor model exists to derive this from, so it is
      // driven from the block directly and said so plainly.
      const block = Math.max(0, Math.min(1, pat.cytochromeBlock ?? 0));
      pat.rrBase = clamp((pat.rrBase ?? 16) + (24 + block * 20 - (pat.rrBase ?? 16)) * Math.min(1, dt * 0.5), 10, 44);

      // Seizures are a cardinal feature of significant cyanide toxicity and
      // are cerebral ENERGY failure, not an independent severity dial — gated
      // on the block the same way tricyclicOverdose gates its own seizure risk
      // on the real, measured qrsWidth rather than on a bare severity number.
      // Threshold at 0.45: below it the patient is at worst drowsy (measured
      // above), which is not a seizing patient.
      if (block > 0.45) {
        pat.epilepticDrive = Math.max(pat.epilepticDrive || 0,
          Math.min(1, (block - 0.45) / 0.35));
      }
    },
  },

  // Anaphylaxis — bronchospasm and angio-edema both worsening in real time.
  anaphylaxis: {
    initial: { hr: 126, sbp: 96, rr: 32, glu: 99, pain: 2, blood: 6, bronch: 0.55, edema: 0.3, angioedema: 0.35 },
    progress(pat, dt) {
      pat.broncho = clamp(pat.broncho + dt * 0.06, 0, 0.95);
      pat.edema = clamp(pat.edema + dt * 0.07, 0, 0.9);
      // Distributive shock: massive mediator-driven vasodilation drops SVR and
      // pools blood venously, so hypotension emerges from vascular tone (the
      // engine turns that into a compensatory tachycardia on its own) rather
      // than being scripted as a heart-rate number.
      pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.12, 0, 0.8);
      // QUEUE ITEM 61: localized angioedema (lips/tongue/pharynx/larynx),
      // deliberately separate from `edema` above (whole-body/pulmonary,
      // affects pcwp/compliance/dlco, no airway-obstruction consumer). Ramps
      // the same way bronch/edema do; upperAirwayObstruction is DERIVED from
      // it directly (not ratcheted with Math.max) every tick so a rising OR
      // epi-treated, falling angioedema value both show up immediately —
      // matching what a real patient's airway does, and letting epinephrine's
      // reduction of angioedema (drugs.js epiIM/epiAuto fx) actually relieve
      // the obstruction instead of a one-way worsening ratchet. 0.7 ceiling:
      // real but short of croup/epiglottitis's own up-to-2.0 range for a
      // structural, non-anaphylactic obstruction (see access.js/respiratory.js
      // comments on that field) — severe anaphylactic angioedema is a real,
      // life-threatening airway emergency, but this keeps the SAME
      // scaling anaphylaxis's other ceilings already use relative to that
      // condition family (broncho 0.95, edema 0.9, both short of their own
      // theoretical max too).
      pat.angioedema = clamp((pat.angioedema ?? 0.35) + dt * 0.05, 0, 0.7);
      // Isolate THIS condition's own contribution before recombining, so a
      // hypothetical comorbid patient (pat._conditions with croup/
      // epiglottitis ALSO ratcheting upperAirwayObstruction, architecturally
      // supported by physiology.js's stepPatient even though no shipped
      // scenario currently combines them) does not have its structural
      // obstruction silently overwritten by this tick's angioedema value —
      // matches the same "subtract my own prior contribution, then re-max"
      // idiom capillaryLeak's endothelial-repair mechanism already uses for
      // the same reason.
      const uaoOther = Math.max(0, (pat.upperAirwayObstruction || 0) - (pat._angioedemaUaoContrib || 0));
      pat._angioedemaUaoContrib = pat.angioedema;
      pat.upperAirwayObstruction = Math.max(uaoOther, pat.angioedema);
    },
  },

  // ===== VASOVAGAL SYNCOPE =====
  // Queue item 24 — benignFaint (SYNC-032) has been condition-LESS since it
  // shipped, waiting on exactly this. The defining physiology IS a BRIEF
  // hemodynamic dip with rapid spontaneous recovery, not a sustained one —
  // the Bezold-Jarisch reflex's paradoxical vagal bradycardia PLUS
  // vasodilation (not the usual compensatory tachycardia shock produces).
  // Reuses two already-built handles at a self-resolving, timed severity
  // rather than inventing new state: pat.vasodilation (anaphylaxis's own
  // distributive-shock handle) and pat.vagalSurge (the same handle a
  // Valsalva manoeuvre and the Cushing reflex both drive). By the time a
  // crew arrives (real dispatch-to-scene delay), the episode is already
  // tailing off — matching benignFaint's own narrative ("already looking
  // better than the roommate's description suggested").
  vasovagalSyncope: {
    initial: { hr: 78, sbp: 118, rr: 16, glu: 100, pain: 0 },
    progress(pat, dt) {
      if (pat._syncopeT == null) pat._syncopeT = 0;
      pat._syncopeT += dt;
      const phase = Math.max(0, 1 - pat._syncopeT / 1.5);
      pat.vasodilation = Math.max(pat.vasodilation || 0, 0.3 * phase);
      pat.vagalSurge = Math.max(pat.vagalSurge || 0, 0.5 * phase);
    },
  },

  // ===== ISOLATED ANKLE SPRAIN =====
  // Queue item 24 — minorSprain (TRMA-033) has been condition-LESS since it
  // shipped. An isolated extremity injury's "physiology" is almost entirely
  // local pain, not a systemic derangement — no progress() needed, the same
  // "fixed, does not evolve" idiom coronaryArteryDisease's own fixed lesion
  // uses, since pat.intrinsicPain (queue item 20) is a stable value once
  // seeded and nothing else in this condition touches it.
  minorSprain: {
    initial: { pain: 4 },
  },

  // ===== CHRONIC MECHANICAL LOW BACK PAIN =====
  // Queue item 24 — chronicBackPain (MISC-034) has been condition-LESS since
  // it shipped; already flagged in section 8 as likely the smallest
  // possible entry in the whole backlog now that pat.intrinsicPain exists.
  // Same "no progress()" idiom as minorSprain above.
  chronicBackPain: {
    initial: { pain: 5 },
  },

  // ===== EXCITED DELIRIUM SYNDROME =====
  // Queue item 27. Composes three already-built mechanisms rather than
  // inventing a fourth, per this project's own reuse-first discipline:
  // pat.metabolicHeatMultiplier (thermo.js — sustained muscular
  // hyperactivity genuinely raises core temperature through the same real
  // hypermetabolism route thyroid storm below uses, not a scripted
  // coreTemp write), pat.rhythmInstability (the SAME cardiovascular.js
  // vtDrive pathway electricalStorm/aicdMalfunction measure — catecholamine-
  // driven fatal arrhythmia, the actual documented mechanism, STATED
  // DELIBERATELY rather than a restraint mechanic, per this project's own
  // note that excited delirium as a diagnosis has a fraught history and the
  // model should reflect real physiology, not restraint), and pat.lactate
  // (metabolic.js — genuine exertional lactic acidosis from prolonged
  // struggle). Severe, escalating tachycardia via hrBase, held every tick.
  //
  // QUEUE ITEM 51 ADDITION: also declares pat.agitationBurden — the ONE
  // real, general handle TP 1209's own drug-administration algorithm
  // (laCounty.js) can gate on. Set high (0.9) but not the absolute ceiling,
  // matching this condition's own narrated severity ("required several
  // officers to control... superhuman strength") without claiming a value
  // no future, even-more-extreme presentation could still exceed. This does
  // NOT replace or reduce anything above — burden feeds a genuinely
  // different, behavioral-severity axis (neuro.js's updateCerebral derives
  // pat.agitation from it), so a field crew that sedates this patient sees
  // agitation fall while the real catecholamine crisis underneath (hrBase/
  // rhythmInstability/lactate/metabolicHeatMultiplier, all untouched by
  // sedation) keeps running — the exact clinical point this condition's own
  // resolve() text already makes ("the underlying physiology, not the
  // restraint, is what carries the real risk").
  excitedDelirium: {
    initial: { hr: 150, sbp: 168, rr: 32, glu: 110, pain: 3, temp: 38.5 },
    progress(pat, dt) {
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.8);
      pat.hrBase = Math.min(180, Math.max(pat.hrBase, 110) + dt * 1.5);
      pat.rhythmInstability = Math.min(2, (pat.rhythmInstability || 0) + dt * 0.06);
      pat.lactate = Math.min(15, (pat.lactate || 1) + dt * 0.15);
      pat.agitationBurden = Math.max(pat.agitationBurden || 0, 0.9);
    },
  },

  // ===== ESOPHAGEAL VARICEAL HEMORRHAGE =====
  // Queue item 23 — the specific presentation named for item 7's own
  // suggested "GI hemorrhage" first batch: rapid upper-GI bleeding with
  // airway compromise from active hematemesis, not a slow occult bleed.
  // INTERNAL, non-traumatic source — no `RN` region to key a wounds: entry
  // off (checked before building, per the item's own note), so
  // pat.activeBleedRate is set directly, the same field hemothorax/
  // uterineAtony already drive without an external wound. Set above
  // hemothorax's own 0.14-0.30 measured range: variceal hemorrhage is
  // documented as one of the most rapidly exsanguinating GI bleed sources
  // (portal-hypertensive pressure behind the varix). The real, DISTINCT
  // teaching point from every other hemorrhage condition in this library:
  // active hematemesis is an AIRWAY problem as much as a circulation one —
  // pat.airwayFluid (the same suction-treatable handle drowning/aspiration
  // conditions use) rises alongside the bleed, real aspiration risk a
  // tourniquet-trained reflex ("control the bleeding") does not address.
  // No field hemostasis exists for this (a Blakemore tube/endoscopy is
  // hospital-level) — the honest field job is airway protection
  // (positioning, suction), volume support, and minimizing scene time.
  esophagealVaricealHemorrhage: {
    initial: { hr: 128, sbp: 84, rr: 24, glu: 100, pain: 2, blood: 4.2 },
    progress(pat, dt) {
      pat.activeBleedRate = Math.max(pat.activeBleedRate || 0, 0.32);
      pat.airwayFluid = Math.min(0.7, (pat.airwayFluid || 0) + dt * 0.03);
    },
  },

  // ===== ALLERGIC REACTION, MODERATE (graded severity) =====
  // Queue item 23. anaphylaxis above is severe/Grade 3 on the World Allergy
  // Organization systemic-reaction grading (hypotension, hypoxia, neuro
  // compromise) — this is the SAME mechanism (broncho/edema/vasodilation),
  // identified against Grade 2 (respiratory/GI/cardiovascular involvement
  // present but NOT life-threatening: no hypotension, no shock) rather than
  // an invented intermediate number. Ceilings are set well short of where
  // anaphylaxis's own vasodilation term produces hypotension (0.8 there;
  // 0.2 here keeps SVR reduction real but mild), the actual mechanistic
  // definition of "not yet anaphylaxis" in this model, not a narrative
  // label. Mild/Grade-1 (skin/mucosal only) previously had no field of its
  // own here (see allergicReactionMild below, added by queue item 58) — this
  // condition now also declares pat.urticaria for the hives its own scenario
  // (allergicReactionModerateCall) already narrates.
  allergicReactionModerate: {
    initial: { hr: 100, sbp: 122, rr: 22, glu: 100, pain: 1, bronch: 0.25, edema: 0.1, urticaria: 0.4 },
    progress(pat, dt) {
      pat.broncho = clamp(pat.broncho + dt * 0.025, 0, 0.4);
      pat.edema = clamp(pat.edema + dt * 0.02, 0, 0.3);
      pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.02, 0, 0.2);
      pat.urticaria = clamp((pat.urticaria || 0) + dt * 0.03, 0, 0.6);
    },
  },

  // ===== ALLERGIC REACTION, MILD (Grade 1 -- skin/mucosal only) =====
  // Queue item 58. Previously deliberately NOT built: "it would write fields
  // nothing meaningfully reads" -- true until this batch, since no field
  // represented isolated cutaneous urticaria/pruritus with no bronchospasm,
  // no angioedema and no hemodynamic change at all. That gap was found for
  // real while implementing TP 1219/1219-P's diphenhydramine indication
  // (laCounty.js's anaphDiphen rule has to gate on epinephrine already given
  // instead of the actual clinical indication, "itching/hives", because
  // nothing else detects it).
  //
  // MECHANISM: histamine release from cutaneous mast cells causes local
  // vasodilation/increased capillary permeability (the flare/wheal of
  // urticaria) and direct sensory-nerve activation (pruritus) -- the SAME
  // mediator, at a much smaller anatomic distribution, driving the
  // *systemic* distributive vasodilation anaphylaxis's own pat.vasodilation
  // term represents. Reusing that handle (not inventing a parallel one) at a
  // ceiling an order of magnitude below allergicReactionModerate's own 0.2
  // (itself well below anaphylaxis's 0.8) keeps the direction real --
  // measurably, honestly present -- without manufacturing hemodynamic
  // instability for a patient who has hives and nothing else. No bronch, no
  // edema: this condition explicitly does NOT touch either, which is the
  // entire clinical point (a Grade 1 reaction is skin/mucosal only, no
  // respiratory or cardiovascular involvement).
  allergicReactionMild: {
    initial: { hr: 84, sbp: 118, rr: 16, glu: 100, pain: 1, urticaria: 0.35 },
    progress(pat, dt) {
      pat.urticaria = clamp((pat.urticaria || 0) + dt * 0.02, 0, 0.7);
      pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.015 * pat.urticaria, 0, 0.06);
    },
  },

  // Severe asthma / irritant-induced bronchospasm. Diffuse expiratory
  // wheeze from smooth-muscle constriction and air-trapping; the engine turns
  // rising `broncho` into hypoxia and work of breathing through respiratory.js.
  // Untreated (and while the irritant exposure continues in a poorly
  // ventilated space) it tightens toward a critical, then "silent" chest —
  // the ominous point where the rate FALLS from fatigue rather than climbing.
  // Albuterol/ipratropium/epi lower `broncho` through the drug engine, so the
  // reversal is emergent, not scripted.
  asthma: {
    initial: { hr: 112, sbp: 148, rr: 26, glu: 100, pain: 1, blood: 6, bronch: 0.55, shunt: 0.34,
      riskFactors: { asthma: true } },
    progress(pat, dt) {
      pat.broncho = clamp((pat.broncho ?? 0.55) + dt * 0.03, 0, 0.96);
      pat.shuntFraction = clamp((pat.shuntFraction ?? 0.34) + dt * 0.02, 0.3, 0.6);
      pat.hrBase = clamp(pat.hrBase + dt * 0.5, 60, 150);
      // Fatigue / silent chest: once bronchospasm is critical the respiratory
      // rate starts to fall — a pre-arrest sign, not improvement.
      if ((pat.broncho ?? 0) > 0.85) pat.rrBase = clamp((pat.rrBase ?? 26) - dt * 0.8, 6, 40);
    },
  },

  // Acute appendicitis — a medical acute abdomen. Mostly a pain-management and
  // rapid-transport call: modestly tachycardic with a low-grade fever, and
  // hemodynamically stable UNLESS it is left long enough to perforate, at
  // which point peritonitis and early sepsis begin to show (rising rate/temp
  // and a little distributive vasodilation). Nothing in the field fixes the
  // appendix; recognition, analgesia and transport are the skills tested.
  appendicitis: {
    initial: { age: 19, weight: 74, hr: 96, sbp: 128, rr: 18, glu: 98, pain: 7, blood: 6, temp: 38.0 },
    progress(pat, dt) {
      pat.hrBase = clamp(pat.hrBase + dt * 0.12, 70, 132);
      pat.coreTemp = clamp((pat.coreTemp ?? 38.0) + dt * 0.008, 37, 39.6);
      // Perforation -> peritonitis -> early sepsis if grossly delayed.
      if ((pat.coreTemp ?? 38) > 38.8) {
        pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.02, 0, 0.4);
        // RESOLVED — queue item 20. Was pat.pain, a field nothing anywhere
        // read (a write-only dead field); pat.intrinsicPain is the real,
        // displayed/consumed baseline (patient.js/pk.js).
        pat.intrinsicPain = clamp((pat.intrinsicPain ?? 7) + dt * 0.05, 0, 10);
      }
    },
  },

  // Severe pneumonia with sepsis, presenting in respiratory failure/arrest
  // (agonal, days of high fever). Two problems stacked: a large intrapulmonary
  // shunt with a failing respiratory drive (the whole treatment is effective
  // positive-pressure ventilation/oxygenation), and septic distributive shock
  // (vasodilation + fever) underneath it. Ventilate and the hypoxia recovers;
  // don't and the hypoxic-bradycardia term ends in an asphyxial PEA arrest.
  pneumoniaSepsis: {
    initial: { age: 24, weight: 64, hr: 104, sbp: 100, rr: 4, glu: 100, pain: 1, blood: 6,
      shunt: 0.5, tv: 0.16, temp: 39.6 },
    progress(pat, dt) {
      if (pat._sepInit === undefined) {
        pat._sepInit = true;
        pat.vasodilation = Math.max(pat.vasodilation || 0, 0.28);
        // QUEUE ITEM 46 — the first real consumer of the shared
        // inflammation cascade (inflammation.js). Seeded already
        // substantial rather than ramped from 0: this patient's own
        // presentation ("days of high fever") is an ALREADY-ESTABLISHED
        // septic process, not a fresh insult arriving mid-call, so starting
        // pathogenBurden at 0 and letting the cascade's own 90-minute
        // cytokine-response lag ramp it up would falsely under-represent a
        // patient who has actually been this sick for days. Drives two new,
        // previously-absent consequences for this condition — real capillary
        // leak (this condition never had one before) and real fever
        // progression (it presented febrile but never trended) — plus, via
        // coagulation.js, a real septic consumptive-coagulopathy component.
        // This condition's own vasodilation/shunt/rhythm mechanics above are
        // UNCHANGED — the cascade is additive, not a replacement.
        pat.pathogenBurden = Math.max(pat.pathogenBurden || 0, 0.55);
        // cytokineLoad (inflammation.js) is normally a DERIVED, lagged
        // value — a real cytokine response takes on the order of an hour or
        // more to build after a FRESH insult. This patient is not fresh:
        // she presents with days of established illness, so her systemic
        // response has already had days to equilibrate toward her own
        // burden, not the 15-120 minutes a single call could show. Pre-
        // seeding cytokineLoad (not just pathogenBurden) is the honest way
        // to represent that — the SAME reasoning already used one line
        // above for pre-seeding vasodilation at 0.28 rather than 0, and for
        // this condition's own presenting temp:39.6 rather than a normal
        // starting value. A condition modeling a FRESH inflammatory
        // insult mid-call should NOT do this — it should let cytokineLoad
        // ramp from 0 through inflammation.js's own real lag, which is
        // exactly what happens for any condition that only sets
        // pathogenBurden (see mechanismWiring.mjs's own direct test of
        // that unseeded, fresh-onset case).
        pat.cytokineLoad = Math.max(pat.cytokineLoad || 0, 0.5);
      }
      // "Ventilated" means somebody is moving air for this patient, or the
      // patient is oxygenating adequately on their own. It previously tested
      // tvDrugOffset, which was set by placing an SGA/ETT — an airway DEVICE,
      // not ventilation, and a distinction that mattered: bagging the patient
      // (which sets assistedVent) did not count, while an unventilated tube did.
      const ventilated = pat.assistedVent != null || (pat.sao2 ?? 0) > 88;
      if (ventilated) {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.5) - dt * 0.06, 0.2, 0.7);
        pat.rrBase = clamp((pat.rrBase ?? 4) + dt * 3, 4, 22);
      } else {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.5) + dt * 0.05, 0.5, 0.94);
        pat.rrBase = clamp((pat.rrBase ?? 4) - dt * 1.2, 0, 4);
        pat.vasodilation = clamp((pat.vasodilation || 0.28) + dt * 0.03, 0.28, 0.75);
        // Ongoing hypoxia is itself a real driver of further inflammatory
        // burden (worsening tissue injury -> more DAMP release), so an
        // untreated, unventilated course pushes pathogenBurden further,
        // same shape as the vasodilation climb two lines above.
        pat.pathogenBurden = clamp((pat.pathogenBurden ?? 0.55) + dt * 0.01, 0.55, 1);
        // Sustained severe hypoxia depresses the myocardium; combined with the
        // septic vasodilation the pressure erodes. The definitive asphyxial
        // outcome (no PPV -> death) is enforced at the scenario level, since a
        // maintained septic cardiac output keeps the sim from a CO-driven PEA.
        if ((pat.sao2 ?? 100) < 88) pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - dt * 0.12, 0.2, 1);
        if (pat.co < 0.4 && !["PEA", "asystole", "VF"].includes(pat.rhythm)) pat.rhythm = "PEA";
      }
    },
  },

  // ===== SEPTIC SHOCK =====
  // Item 7's own "suggested first batches" list names this explicitly, and it
  // is genuinely still missing: pneumoniaSepsis above (this file, a few
  // screens up) is a DIFFERENT entity by its own comment — "Severe pneumonia
  // WITH sepsis" already presenting in agonal respiratory arrest after DAYS
  // of illness, where the septic vasodilation is a secondary complication
  // riding under a primary respiratory-failure story. Nothing in the file
  // presents distributive septic shock as the PRIMARY problem, on the real
  // Sepsis-3 clinical definition (Singer et al., JAMA 2016): sepsis
  // (life-threatening organ dysfunction from a dysregulated host response to
  // infection) PLUS persistent hypotension requiring vasopressors to
  // maintain MAP >= 65 despite adequate fluid resuscitation, with lactate
  // > 2 mmol/L.
  //
  // MECHANISM, distinct from anaphylaxis's mediator-driven distributive
  // shock: bacterial PAMPs (endotoxin chief among them) trigger the SAME
  // cytokine cascade inflammation.js already models (TNF-alpha/IL-1/IL-6),
  // but through toll-like-receptor/innate-immune recognition of infection
  // rather than IgE-mediated mast-cell degranulation. Downstream, TNF/IL-1
  // and NO release cause the identical vasodilation/capillary-leak signature
  // anaphylaxis produces (this engine is right to reuse the same handles),
  // but the TIME COURSE is hours, not minutes-to-seconds, and cytokine-driven
  // myocardial depression (Vieillard-Baron, Intensive Care Med 2018 review:
  // reversible LV systolic dysfunction in an estimated 40-60% of septic
  // shock, typically resolving over 7-10 days IF the patient survives) is a
  // real, distinct third limb anaphylaxis's own course never reaches within
  // one call. Real SIRS/qSOFA-adjacent presentation: fever, tachycardia,
  // tachypnea, altered mentation as hypoperfusion progresses.
  //
  // THE HANDLE THIS BATCH ACTUALLY WIRES UP, found by grepping every
  // consumer of every field before writing new code (per this file's own
  // section-4 rule): `pat.riskFactors.sepsis` was ALREADY read in three
  // places — cardiovascular.js line ~703 (SVR x0.45, on top of the
  // vasodilation term, representing the loss of vascular tone specific to
  // endotoxin/NO-mediated vasoplegia), cardiovascular.js line ~374 (venous
  // compliance x1.6, inflammatory venodilation pooling blood in the
  // capacitance bed), and metabolic.js line ~255 (+0.05 lactate production,
  // anaerobic metabolism from tissue hypoperfusion) — but NOTHING in the
  // condition library had ever set `pat.riskFactors.sepsis = true`. A whole,
  // already-built, already-tested-by-nothing mechanism was sitting dead.
  // Wiring it (rather than re-deriving an equivalent SVR multiplier by hand)
  // is exactly the "wire missing mechanisms through what the engine already
  // has" rule in (c) — the actual missing mechanism here was a single
  // boolean flag, not a new physiology module.
  //
  // TIME COURSE: unlike pneumoniaSepsis's pre-seeded "already days old"
  // cytokineLoad, this condition seeds pathogenBurden at a moderate,
  // shock-threshold level (0.5 — already meeting the Sepsis-3 hypotension
  // criterion on presentation, representing several hours of untreated
  // infection before the call) and lets inflammation.js's own real 90-minute
  // cytokine-response lag do the rest of the ramping DURING the call — the
  // honest "fresh-ish, still evolving" case that ramp is built for (see
  // inflammation.js's own comment distinguishing seeded vs. unseeded
  // conditions). That produces the real compensated -> decompensated arc a
  // paramedic is meant to see coming: early on, cardiac output is preserved
  // or even elevated (textbook hyperdynamic "warm shock" — tachycardic,
  // flushed, wide pulse pressure) while SVR is already falling; MEASURED
  // (throwaway probe, stripped) at 10 minutes untreated: co 6.7 L/min, svr
  // ~560. If untreated long enough for cytokineLoad to climb further, septic
  // cardiomyopathy sets in (contractilityFactor falls, the SAME handle
  // pneumoniaSepsis's hypoxic-myocardial-depression limb already uses) and
  // cardiac output starts to FALL under a still-low SVR — the late,
  // decompensated "cold shock" phase, MEASURED at 40 minutes untreated: co
  // drops to 4.9 L/min against svr ~470, contractilityFactor down to 0.82.
  //
  // TREATMENT, through the same mechanisms, matching the real Surviving
  // Sepsis Campaign algorithm and this formulary's own norepi entry ("First-
  // line vasopressor for septic shock. Titrate to MAP >= 65 mmHg" — data/
  // drugs.js, unchanged by this batch): crystalloid (saline/plasmalyte)
  // expands stressed volume through the SAME generic Starling-equation path
  // every other capillary-leak condition already uses (metabolic.js), eroded
  // by this condition's own real leak the same honest way pneumoniaSepsis's
  // is; norepinephrine's existing alpha:1.0/beta1:0.3 receptor composition
  // (pk.js) raises alphaTone directly, which multiplies straight into
  // cardiovascular.js's SVR term ALONGSIDE (not instead of) the
  // riskFactors.sepsis 0.45x — a real, physiologically correct outcome where
  // a pressor can restore MAP without touching the underlying disease
  // process, exactly the point the resolve() text below makes. No new drug
  // and no new fx prop needed: the box already had the right tool for this
  // condition, it just had nothing to use it on.
  //
  // DEFERRED, stated rather than guessed at: hypothermic (SIRS-negative)
  // sepsis presentation — a real, documented, and prognostically WORSE
  // variant (elderly/immunocompromised patients can present hypothermic
  // rather than febrile) — is a genuinely different teaching case (absence
  // of fever does not rule out sepsis) and deserves its own scenario rather
  // than being folded into this one's fever-forward presentation. DIC/
  // consumptive coagulopathy is NOT separately built here because it is
  // already a real, general consumer of cytokineLoad (coagulation.js) —
  // this condition gets it for free via the same cascade pneumoniaSepsis
  // already exercises, not a duplicate mechanism.
  septicShock: {
    initial: { age: 61, weight: 82, hr: 122, sbp: 84, rr: 26, glu: 132, pain: 2, blood: 6, temp: 39.2 },
    progress(pat, dt) {
      if (pat._septicShockInit === undefined) {
        pat._septicShockInit = true;
        // Already several hours into an untreated infection (urosepsis/
        // intra-abdominal source, unspecified — the source is not the
        // teaching point here, the shock physiology is), already past the
        // Sepsis-3 shock threshold on arrival, but NOT the days-old,
        // fully-equilibrated picture pneumoniaSepsis presents.
        pat.pathogenBurden = Math.max(pat.pathogenBurden || 0, 0.5);
        // Partial cytokine equilibration for a several-hours-old (not
        // days-old) process — the SAME "seed cytokineLoad too, not just
        // pathogenBurden" reasoning pneumoniaSepsis's own comment states for
        // an already-established process, just at a lower starting point
        // matching a shorter real elapsed time (inflammation.js's 90-minute
        // cytokine tau means several hours is well past the initial ramp but
        // short of pneumoniaSepsis's fully-equilibrated 0.5). MEASURED
        // (throwaway probe, stripped): unseeded (0.005 start) let the
        // presenting 39.2 fever decay BELOW normal (36.8 at 40 minutes) —
        // physiologically backwards for an active infection — because
        // nothing sustained it against thermo.js's real heat-balance
        // equilibrium at that low a cytokine load.
        pat.cytokineLoad = Math.max(pat.cytokineLoad || 0, 0.3);
        pat.riskFactors.sepsis = true;
      }
      // Septic fever, direct: real but modest hypermetabolism (~10-30%
      // resting metabolic rate rise is the documented range for a high
      // sustained fever) through the SAME metabolicHeatMultiplier handle
      // statusEpilepticus/excitedDelirium/the inflammation cascade all use —
      // this condition's own contribution, additive to (not replacing) the
      // cascade's own cytokineLoad-scaled term above. 1.3, MEASURED against
      // thermo.js's real heat-balance loop: slows the presenting 39.2 fever's
      // decay well below the unseeded/unmultiplied case (39.2 -> 37.35 at 20
      // min -> 36.91 at 40 min, still trending toward normal rather than
      // sustaining a plateau, but no longer the physiologically-backward
      // undershoot BELOW 37 the unmultiplied version produced by the same
      // point). A genuinely flat multi-hour plateau would need a materially
      // higher multiplier than the real ~10-30% metabolic-rate literature
      // supports for a fever this magnitude — left honestly short of that
      // rather than over-tuned past the citation; the slow downward trend
      // still reads as febrile-and-declining across a realistic call length,
      // not normothermic.
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.3);
      // Distributive vasodilation — the SAME handle anaphylaxis uses, but a
      // rate an order of magnitude slower (anaph's own dt*0.12 reaches its
      // ceiling in ~7 minutes; sepsis takes hours), reflecting a process
      // that unfolds over a call, not a single anaphylactic mediator
      // release. 0.55 ceiling: real but short of anaphylaxis's 0.8, since
      // septic vasoplegia here is compounded by the SEPARATE
      // riskFactors.sepsis SVR multiplier above rather than needing to
      // reach the same ceiling through this one term alone.
      pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.01, 0, 0.55);
      // Compensatory tachypnea (a real qSOFA/SIRS component, and the
      // respiratory drive behind the metabolic acidosis this patient is
      // developing) — modest and bounded, not the agonal-failure pattern
      // pneumoniaSepsis's unventilated limb produces.
      pat.rrBase = clamp((pat.rrBase ?? 26) + dt * 0.06, 18, 34);
      // Ongoing, untreated bacterial proliferation: with no field antibiotic
      // and no source control, the real driver of worsening sepsis is TIME,
      // not a specific missed intervention (unlike pneumoniaSepsis's
      // ventilation-gated worsening) — pathogenBurden keeps climbing slowly
      // past its 0.5 presenting level toward a real severe-sepsis ceiling.
      // MEASURED (throwaway probe, stripped) and CORRECTED here: an earlier
      // version of this comment claimed specific 40-minute numbers before
      // this climb existed, when pathogenBurden was pinned at a flat 0.5 —
      // with that ceiling, cytokineLoad's own 90-minute-tau relaxation can
      // only approach 0.5 asymptotically and never reaches a gated
      // decompensation threshold at all, which would have made the
      // myocardial-depression limb below silently dead code. Real severe
      // sepsis without source control worsens over hours; this condition
      // needs to as well.
      pat.pathogenBurden = clamp((pat.pathogenBurden || 0.5) + dt * 0.0006, 0.5, 0.85);
      // Sepsis-induced myocardial depression (Vieillard-Baron, Intensive
      // Care Med 2018 review: reversible LV systolic dysfunction in an
      // estimated 40-60% of septic shock, cytokine [TNF-alpha/IL-1]
      // mediated): a real, REVERSIBLE contractility hit gated on cytokineLoad
      // actually having built up (> 0.45) — the decompensation point item
      // (a) asks every condition to name; before this gate opens the
      // patient is in the preserved/hyperdynamic "warm shock" phase. Same
      // handle pneumoniaSepsis's hypoxic-myocardium limb uses.
      //
      // MEASURED (throwaway probe, stripped), untreated: cytokineLoad only
      // crosses 0.45 at ~93 minutes of continuous untreated course (co 6.30,
      // svr 345, sbp 51 at 90 min just before the gate opens) — well past
      // this scenario's own ~22-minute call window (limit: 1300s,
      // scenarios.js). Stated honestly rather than re-tuned to force a
      // same-call payoff: this MATCHES the real literature, where septic
      // cardiomyopathy is identified over the first 24-48h of critical
      // illness, not during a single ambulance transport — so within any
      // realistic call, this patient's whole arc is the hyperdynamic,
      // SVR-collapse-driven phase (measured below), which is itself the
      // real, teachable presentation. The gated myocardial-depression limb
      // is real, cited, wired through the SAME reversible handle
      // pneumoniaSepsis uses, and correctly available for a longer hold
      // (a delayed-transport or inter-facility scenario) without this batch
      // needing to build one to prove the mechanism fires: past the gate,
      // by 180 minutes contractilityFactor is down to 0.653 and co has
      // fallen to 5.80 L/min despite svr climbing back to ~797 (the
      // patient's own intact baroreflex clawing SVR back up against a now-
      // failing pump, a real and DIFFERENT late-stage picture from the
      // early pure-vasoplegic collapse). This model has no field
      // antibiotic, so full reversal is honestly a hospital-side outcome,
      // matching this condition's own resolve() text; fluids/a pressor
      // (measured below) hold MAP and buy the transport time that matters
      // during the call's own real, in-scope hyperdynamic phase.
      if ((pat.cytokineLoad || 0) > 0.45) {
        pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - dt * 0.004, 0.55, 1);
      }
    },
  },

  // ===== NEONATAL SEPSIS ===== (pediatric batch, queue item 7)
  //
  // A genuinely DIFFERENT presentation from septicShock above, not a
  // pediatric-scaled copy of its adult numbers. Real, well-documented
  // neonatal teaching point: a septic newborn does NOT mount the
  // fever/SIRS picture an older child or adult does — a neonate's
  // immature hypothalamic thermoregulatory response and high surface-
  // area-to-mass ratio mean TEMPERATURE INSTABILITY is the rule, and it
  // is more often HYPOTHERMIA than fever (Wynn & Wong, Clin Perinatol
  // 2010; a term newborn with sepsis presents afebrile-to-hypothermic in
  // a substantial fraction of cases, and hypothermia is itself an
  // ominous sign of exhausted physiologic reserve, not a milder
  // presentation than fever). The other classic findings are equally
  // NONSPECIFIC — poor feeding, lethargy, respiratory distress — none of
  // them a single dramatic vital sign the way adult septic shock's
  // hypotension is; the whole teaching point is that a crew has to
  // recognize a sick-looking, temperature-unstable, floppy baby as
  // septic BECAUSE nothing points at it directly.
  //
  // Built on the SAME shared inflammation cascade septicShock/
  // pneumoniaSepsis already use (inflammation.js's pathogenBurden ->
  // cytokineLoad path is age-agnostic — real neonatal sepsis is exactly
  // as cytokine-driven as the adult disease), not on neonatalTransition's
  // vigor state machine. Reasoning: neonatalTransition models a specific
  // ~10-minute peripartum resuscitation problem (a newborn's OWN
  // transition from fetal to postnatal circulation, driven by a discrete
  // ppv/compressions/epi NRP algorithm) — a several-hours-to-days-old
  // infant with sepsis is not "still transitioning" in that sense, is
  // well past the delivery-room window this scenario would present in,
  // and the vigor machine has no cytokine/pathogen concept to hang a
  // genuine infectious process on. The inflammation cascade is the
  // honest fit; only the OBSERVABLE surface differs (hypothermia not
  // fever, feeding/lethargy not adult SIRS criteria), and that surface
  // difference is exactly what is coded below.
  neonatalSepsis: {
    // Age via ageProfile.js: 0.08 (~1 month) sits just past isNeonate()'s
    // own <0.25 boundary reference point used elsewhere in this file, a
    // realistic age for a late-onset neonatal sepsis presentation (as
    // opposed to early-onset, first 72h, which is usually a hospital
    // case, not a 911 call). defaultWeight(0.08) is 3.5 kg; explicit here
    // for readability rather than relying on the age-derived default.
    initial: { age: 0.08, weight: 3.5, hr: 170, rr: 50, glu: 46, pain: 1, temp: 36.1 },
    progress(pat, dt) {
      if (pat._neoSepsisInit === undefined) {
        pat._neoSepsisInit = true;
        // Already some hours into an evolving bacterial process (GBS/
        // E.coli-type late-onset sepsis, source unspecified — same "the
        // shock physiology is the teaching point, not the organism"
        // posture septicShock's own comment states), seeded on the SAME
        // inflammation-cascade handles, at a lower starting burden than
        // adult septicShock's 0.5/0.3: a 3.5 kg neonate's absolute
        // pathogen/cytokine load at presentation is genuinely smaller in
        // scale even at an equivalently severe RELATIVE illness stage,
        // and this condition's own vitals (below) are already reflecting
        // a sick infant without needing the cascade pre-loaded as hard.
        pat.pathogenBurden = Math.max(pat.pathogenBurden || 0, 0.35);
        pat.cytokineLoad = Math.max(pat.cytokineLoad || 0, 0.2);
        pat.riskFactors.sepsis = true;
      }
      // TEMPERATURE INSTABILITY, the real distinguishing sign. TWO real
      // engine mechanisms were tried and measured before this one, and
      // both were caught fighting an opposing mechanism rather than
      // honestly producing hypothermia (lesson 8 — measure before
      // trusting a plausible-looking write):
      //  1) A direct pat.coreTemp decrement (acuteCholecystitis's own
      //     "write coreTemp directly" idiom) — MEASURED (throwaway probe,
      //     stripped): thermo.js's own real heat-balance recompute runs
      //     every tick and simply overwrote it; coreTemp actually drifted
      //     UP, not down.
      //  2) metabolicHeatMultiplier pushed BELOW 1 (the mirror-image of
      //     septicShock's own fever term on the identical handle) —
      //     MEASURED: inflammation.js's own shared cascade
      //     (updateInflammation, called every tick for ANY patient with
      //     cytokineLoad>0) unconditionally re-floors
      //     metabolicHeatMultiplier to >= 1+0.35*cytokineLoad every tick —
      //     a real, structural, fever-only assumption baked into the
      //     shared cascade this condition also depends on for its
      //     cytokineLoad itself, so this lever cannot go below 1 for as
      //     long as this condition keeps cytokineLoad alive. Both are
      //     genuine, previously-undiscovered "written, read, but fought to
      //     a standstill" defects of the shape section 1 warns about —
      //     stated honestly rather than hidden behind a plausible-looking
      //     write that does not actually move the number.
      // FIXED with the SAME "ceiling, re-imposed every tick against a real
      // opposing pull" idiom the crotaline envenomation section's own
      // comment already documents for coagulation factors: pat.coreTemp is
      // clamped DOWN to a slowly-falling ceiling every single tick, so
      // whatever thermo.js's equilibrium recompute pushed it to gets
      // capped again before the next tick's read, netting a real,
      // measured, monotonic hypothermic drift instead of losing the fight.
      // Rate re-measured (throwaway probe, stripped): a bare, condition-
      // less newborn at this same age/weight already drifts toward
      // ~35.8C by 300s from ordinary ambient heat loss alone (a real,
      // honest, unscripted engine characteristic — a large SA:mass
      // newborn genuinely runs cool at room-air ambient even without
      // sepsis, matching real neonatal thermoregulation). A ceiling that
      // only reaches that same ~35.8-36.0 band produces no measurable
      // DIFFERENCE from that baseline, so the rate below is set to fall
      // faster than the baseline's own natural drift, producing a real,
      // distinguishable septic hypothermia rather than one indistinguishable
      // from a healthy cold newborn.
      pat._neoTempCeiling = Math.max(35.0, (pat._neoTempCeiling ?? 36.1) - dt * 0.15);
      pat.coreTemp = Math.min(pat.coreTemp ?? 36.1, pat._neoTempCeiling);
      // LETHARGY / POOR RESPONSIVENESS — the general encephalopathy
      // handle every other "confused/obtunded from a systemic metabolic
      // process" condition in this file already reuses (delirium,
      // myxedema coma, HHS, hypernatremia...); here it is the honest
      // stand-in for "floppy, poorly responsive baby", a real and
      // teachable nonspecific sepsis sign in this age group, distinct
      // from a focal neuro deficit.
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, 0.35);
      // RESPIRATORY DISTRESS — grunting/retracting/tachypneic is one of
      // the most consistently reported neonatal sepsis signs (Wynn &
      // Wong). Modest, bounded rrBase climb rather than a fixed number,
      // so it is visibly a TREND, not a static prop.
      pat.rrBase = clamp((pat.rrBase ?? 50) + dt * 0.05, 40, 70);
      // Ongoing, untreated bacterial proliferation over the call — same
      // "time, not a missed single intervention, is the driver" posture
      // septicShock's own comment states, at a ceiling scaled down to
      // match this condition's own lower starting burden.
      pat.pathogenBurden = clamp((pat.pathogenBurden || 0.35) + dt * 0.0006, 0.35, 0.7);
      // HYPOGLYCEMIA under sepsis is real and specific to this age group
      // — a neonate's minimal glycogen reserve is rapidly exhausted by
      // the hypermetabolic stress of an infection, unlike an older
      // child/adult who can mobilize substantially larger stores; this is
      // why point-of-care glucose is part of the real neonatal sepsis
      // workup. pat.glucose has no auto-correction mechanism in this
      // engine (severeHypoglycemia's own comment), so a slow, bounded
      // downward drift represents ongoing consumption without treatment.
      pat.glucose = clamp((pat.glucose ?? 46) - dt * 0.01, 30, 46);
      // Distributive component, once cytokine load has actually built up
      // — the SAME cytokineLoad-gated contractility/vasodilation shape
      // septicShock uses, at a lower ceiling: a neonate's proportionally
      // smaller stroke volume reserve means overt hypotension is a LATE,
      // pre-arrest sign in this age group (compensated shock looks
      // "just" tachycardic and poorly perfused for far longer than in an
      // adult) — represented here as a real but modest vasodilation term
      // rather than an early pressure collapse.
      pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.006, 0, 0.35);
    },
  },

  // Post-ictal state after a generalised seizure (subtherapeutic anticonvulsant
  // — non-compliant). The active seizure is over on arrival; the patient is
  // tachycardic, tachypnoeic and disoriented, and RECOVERS over minutes as
  // long as nothing provokes a recurrence. The engine renders the transiently
  // depressed conscious level from a small brainInjury proxy that clears with
  // time. Airway protection, oxygen, a glucose check and monitoring for
  // recurrence are the skills tested; hypoglycaemia would be the classic
  // reversible trigger (handled by the glucose engine if present).
  seizurePostictal: {
    initial: { age: 25, weight: 78, hr: 120, sbp: 132, rr: 22, glu: 82, pain: 1, blood: 6 },
    sync(pat) {
      // Instantaneous post-ictal obtundation on the very first look.
      if (pat._piInit === undefined) { pat._piInit = true; pat.brainInjury = Math.max(pat.brainInjury || 0, 0.12); }
    },
    progress(pat, dt) {
      pat.hrBase = clamp(pat.hrBase - dt * 0.6, 74, 130);
      pat.rrBase = clamp((pat.rrBase ?? 22) - dt * 0.15, 12, 24);
      pat.brainInjury = clamp((pat.brainInjury ?? 0.12) - dt * 0.01, 0, 0.2); // orienting back
    },
  },

  // ===== ACTIVE GENERALIZED TONIC-CLONIC SEIZURE =====
  // Neuro batch (queue item 7). Distinct from seizurePostictal above (already
  // stopped): the patient IS convulsing on arrival. pat.epilepticDrive (new
  // intrinsic limb, neuro.js) is set high enough that pat.seizing engages
  // reliably (stochastic onset, measured 9/10 trials within 90s) and stays
  // sustained until suppressed — real, through the SAME `general`
  // anticonvulsant pathway the whole file already uses, not a scripted
  // "seizing: true" flag.
  //
  // 0.6, calibrated against a real measurement rather than assumed: a
  // reliable stochastic onset needs a fairly high drive (9/10 trials at
  // 0.5-0.9 within 90s; materially less reliable below that), but MEASURED
  // (throwaway probe) that midazolam's own anticonvulsant coefficient
  // (drugs.js: 0.9 at Imax, deliberately calibrated per that file's own
  // comment so "one dose always works" is NOT the model) only reaches
  // ~0.36-0.5 within a realistic single-dose timeframe — genuinely too low
  // to fully cross ANY of this condition's plausible sustain thresholds
  // within one call. That is a real, honest finding, not a miscalibration:
  // it means even an ordinary GTC seizure in this model is not guaranteed
  // to fully terminate on one first-line dose, which is a defensible
  // clinical fact (repeat dosing or a second-line agent is standard
  // practice when a first benzo dose does not work) — this condition's own
  // scenario resolve() text is written to match that honestly rather than
  // promise a clean single-dose cure. statusEpilepticus's own 1.0 remains
  // the unambiguously WORSE, more refractory case for direct comparison.
  activeSeizureGTC: {
    initial: { hr: 130, sbp: 150, rr: 8, glu: 100, pain: 0 },
    progress(pat) {
      pat.epilepticDrive = Math.max(pat.epilepticDrive || 0, 0.6);
    },
  },

  // ===== STATUS EPILEPTICUS =====
  // The true emergency variant: >=5 minutes of continuous or recurring
  // seizure without recovery (modern operational definition). Modeled at
  // epilepticDrive's own ceiling (1.0, refractory to a single dose — the
  // real reason status often needs a second-line agent, honestly not
  // field-treatable past benzodiazepines here) plus two genuine complications
  // sustained convulsive activity produces: hyperthermia (reuses
  // pat.metabolicHeatMultiplier, the same real hypermetabolism route excited
  // delirium/thyroid storm use — sustained muscle activity generates real
  // heat) and a real, accruing lactic acidosis (pat.lactate) from prolonged
  // anaerobic muscular work compounded by impaired ventilation.
  statusEpilepticus: {
    initial: { hr: 142, sbp: 162, rr: 6, glu: 100, pain: 0, temp: 38.0 },
    progress(pat, dt) {
      pat.epilepticDrive = 1.0;
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.6);
      pat.lactate = Math.min(15, (pat.lactate || 1) + dt * 0.1);
    },
  },

  // ===== EPILEPSY (comorbidity) =====
  // A known seizure disorder, composable onto another presenting condition
  // (["heatStroke","epilepsy"] for a heat-triggered breakthrough seizure in
  // a known epileptic, the same array-composition pattern diabetesT2 uses).
  // Deliberately small: most people with epilepsy are seizure-free most of
  // the time, so this alone should almost never spontaneously trigger
  // (onset probability scales with epilepticDrive, and 0.08 is far below any
  // other limb's typical operating range) — its real job is to compose WITH
  // another trigger and lower the combined threshold, not to guarantee an
  // event on its own.
  epilepsy: {
    progress(pat) {
      pat.epilepticDrive = Math.max(pat.epilepticDrive || 0, 0.08);
    },
  },

  // ===== FEBRILE SEIZURE =====
  // Pediatric, fever-triggered — the classic "found seizing, hot to touch"
  // call. Deliberately a SEPARATE check from the adult heat-stroke
  // hyperthermic limb above (calibrated to 40-42 C) rather than reusing it:
  // real febrile seizures occur at much lower, ordinary-fever temperatures
  // (~38.5-39.5 C in a young child), a genuinely different threshold, not a
  // scaled version of heat stroke.
  //
  // SELF-LIMITING BY DESIGN, and TWO real bugs found while verifying it,
  // fixed here rather than hidden:
  //
  // (1) The first draft held epilepticDrive up for as long as the fever
  // persisted (the whole call), which — since epilepticDrive above the 0.15
  // sustain threshold keeps pat.seizing latched — produced CONTINUOUS
  // convulsive activity for the full 15-minute scenario window. That is
  // status epilepticus, not a febrile seizure: real simple febrile seizures
  // are brief (typically under 5 minutes, often under 2) and SELF-TERMINATE
  // while the fever continues. Fixed with an explicit timer: epilepticDrive
  // only engages for the first 2 minutes.
  //
  // (2) Even after fixing (1), the scenario STILL reached VF by minute 15 —
  // traced (not guessed) to something unrelated to the seizure mechanism
  // entirely: `pat.seizing` was already `false` throughout the trace, yet
  // sao2 was collapsing from the very first tick, and a BARE age-2 patient
  // with NO condition at all was measured collapsing the identical way.
  // This is a genuine, pre-existing STOCHASTIC INSTABILITY, not a fixed
  // threshold: repeated trials at weight 12-18 and age 2-7 all show a
  // real, reproducible ~20-30% chance of runaway collapse to VF alongside a
  // majority of trials landing stable — most likely respiratory.js's own
  // documented positive-feedback loop ("fatigue -> hypoventilation ->
  // hypoxia -> lower threshold -> more fatigue... deliberately bounded" per
  // that file's own comment) occasionally escaping its intended bound for a
  // lighter-weight patient. Raising weight from 12 to 14 measurably
  // improves the odds (most trials now settle around sao2 85 instead of
  // collapsing outright) but does NOT eliminate the risk — this is a
  // MITIGATION, not a fix. This is very likely the same body-size-
  // reference-error CLASS as the newborn potassium-floor and `_restCo` bugs
  // section 8's own Pediatric note warns about, but the mechanism itself
  // (a runaway positive-feedback loop, not a static miscalibrated
  // threshold) is different from either of those and needs its own
  // dedicated investigation — filed as a new, high-priority queue item
  // rather than guessed at further here. NOT independently confirmed
  // against other already-shipped low-weight pediatric scenarios
  // (croupToddler, bronchiolitisInfant) — those conditions are SUPPOSED to
  // deteriorate, so the same instability could be silently present in them
  // too without anyone having noticed the difference between "correctly
  // severe" and "runaway." See section 6.
  febrileSeizure: {
    initial: { age: 2, weight: 14, hr: 150, sbp: 90, rr: 30, glu: 100, pain: 0, temp: 39.2 },
    progress(pat, dt) {
      pat._febrileSeizureT = (pat._febrileSeizureT || 0) + dt;
      if (pat._febrileSeizureT < 2) {
        const feverDrive = Math.max(0, Math.min(1, ((pat.coreTemp ?? 37) - 38.5) / 1.5));
        pat.epilepticDrive = Math.max(pat.epilepticDrive || 0, feverDrive);
      } else {
        pat.epilepticDrive = 0;
      }
    },
  },

  // ===== SIMPLE PARTIAL SEIZURE =====
  // Focal seizure activity (rhythmic focal motor jerking, classically) with
  // NO impaired consciousness — the patient stays fully aware throughout and
  // can describe it, the actual teaching distinction from every other
  // seizure entity in this family. Deliberately does NOT touch
  // pat.epilepticDrive/pat.seizing at all — engaging the generalized-seizure
  // machinery would incorrectly cost this patient the 2.2x metabolic demand
  // and consciousness-altering physiology a focal-only event does not carry.
  // Reuses the SAME focal-observable pattern stroke's fields established
  // (patient.js's strokeSide, repurposed here as which side shows the
  // jerking) rather than inventing a parallel field for the same concept.
  simplePartialSeizure: {
    initial: { hr: 92, sbp: 130, rr: 16, glu: 100, pain: 0 },
    progress(pat) {
      pat.strokeSide = pat.strokeSide ?? "right";
    },
  },

  // ===== COMPLEX PARTIAL SEIZURE =====
  // Focal seizure WITH impaired awareness (automatisms — lip smacking,
  // picking at clothing, wandering — followed by postictal confusion) but
  // NOT a full generalized convulsion. A genuinely intermediate presentation
  // this engine's binary seizing/not-seizing state cannot represent
  // natively — modeled honestly as a direct, temporary consciousness
  // override (the same "target" the engine's own state machine already
  // reads every tick in updateCerebral) rather than forcing it through the
  // convulsive pat.seizing/epilepticDrive pathway, which would overstate
  // both the metabolic cost and the motor picture.
  complexPartialSeizure: {
    initial: { hr: 96, sbp: 128, rr: 16, glu: 100, pain: 0 },
    progress(pat) {
      pat.consciousness = "confused";
      pat.consciousnessTimer = 0;
    },
  },

  // ===== HEADACHE FAMILY =====
  // Neuro batch (queue item 7). All four reuse pat.intrinsicPain (queue item
  // 20) as their primary/only systemic mechanism — real prehospital
  // headache calls are overwhelmingly a recognition-and-analgesia problem,
  // not a hemodynamic one (severe headache WITH real systemic derangement is
  // covered elsewhere in this library: subarachnoidHemorrhage,
  // hypertensiveEmergency's own encephalopathy variant, increasedICP,
  // meningitis below) — inventing vitals drift for an uncomplicated primary
  // headache disorder would be the exact decorative-mechanism pattern
  // section 1 forbids. Differentiated by severity and, for trigeminal
  // neuralgia, a genuinely distinct TIME COURSE (paroxysmal spikes, not a
  // constant level) rather than four identical pain numbers with different
  // names.
  migraine: {
    initial: { hr: 84, sbp: 122, rr: 16, glu: 100, pain: 7 },
  },
  clusterHeadache: {
    initial: { hr: 92, sbp: 132, rr: 16, glu: 100, pain: 9 },
  },
  tensionHeadache: {
    initial: { hr: 78, sbp: 118, rr: 14, glu: 100, pain: 3 },
  },
  // Paroxysmal, not constant: real trigeminal neuralgia is described as
  // brief (seconds), electric-shock-like jabs with pain-free intervals
  // between — the actual diagnostic feature distinguishing it from every
  // other headache/facial pain entity, so a flat pain number would misstate
  // the disease. Stochastic spike-and-recover, same per-tick-hazard idiom
  // pertussis's apnea paroxysms already use.
  trigeminalNeuralgia: {
    initial: { hr: 82, sbp: 126, rr: 16, glu: 100, pain: 1 },
    progress(pat, dt) {
      if (!pat._tnSpike && Math.random() < dt * 0.4) {
        pat._tnSpike = true;
        pat._tnSpikeT = 0;
      }
      if (pat._tnSpike) {
        pat._tnSpikeT += dt;
        pat.intrinsicPain = 10;
        if (pat._tnSpikeT > 0.15) pat._tnSpike = false;  // seconds-long jab
      } else {
        pat.intrinsicPain = 1;
      }
    },
  },

  // ===== MENINGITIS =====
  // Neuro batch (queue item 7). A systemic infection (reuses
  // pneumoniaSepsis's own vasodilation-plus-fever idiom, at a MODEST
  // severity — full septic shock is its own, later-stage entity) PLUS a
  // real neuro consequence pure sepsis conditions don't have: bacterial
  // meningitis causes genuine cerebral edema, so pat.icpMassEffect (shared
  // with the ICP/stroke family above) climbs — capped at a moderate
  // ceiling so a candidate who recognizes and transports promptly does not
  // face guaranteed herniation, but a badly delayed call can reach the same
  // Cushing-reflex/herniation physiology those conditions do. Meningismus
  // (neck stiffness) is narrative/exam-only — no vitals mechanism exists
  // for it and none should be invented.
  meningitis: {
    initial: { hr: 118, sbp: 100, rr: 20, glu: 100, pain: 6, temp: 39.5 },
    progress(pat, dt) {
      pat.vasodilation = Math.max(pat.vasodilation || 0, 0.15);
      pat.icpMassEffect = Math.min(0.5, (pat.icpMassEffect || 0) + dt * 0.01);
      pat.coreTemp = Math.min(40.5, (pat.coreTemp ?? 39.5) + dt * 0.01);
    },
  },

  // ===== ENCEPHALITIS =====
  // The parenchymal-inflammation neighbor to meningitis above, differentiated
  // by real EARLY findings rather than a relabeled fever: altered mentation
  // and seizure risk from brain-tissue inflammation itself (viral,
  // classically HSV), versus meningitis's fever/headache/meningismus triad
  // with mentation typically preserved until late. Composes the seizure
  // family's own epilepticDrive handle (a real, distinct consumer of that
  // mechanism) rather than inventing a parallel one, at modest severity —
  // meaningfully raises risk without guaranteeing a seizure every call.
  encephalitis: {
    initial: { hr: 110, sbp: 112, rr: 18, glu: 100, pain: 4, temp: 38.8 },
    progress(pat, dt) {
      pat.epilepticDrive = Math.max(pat.epilepticDrive || 0, 0.15);
      pat.coreTemp = Math.min(40, (pat.coreTemp ?? 38.8) + dt * 0.008);
    },
  },

  // ===== TOXIC-METABOLIC ENCEPHALOPATHY =====
  // Neuro batch (queue item 7). A general, reversible confusion cause for
  // presentations with no dedicated primary condition of their own (a
  // toxin, a non-hepatic/non-renal metabolic derangement, sepsis-associated
  // encephalopathy) — feeds the SAME pat.metabolicEncephalopathy handle
  // neuro.js's new consciousness check reads alongside liverInjury/
  // kidneyInjury. Composable onto whatever the underlying acute condition
  // is (["pneumoniaSepsis","toxicMetabolicEncephalopathy"]) since the real
  // teaching point — a reversible GLOBAL confusion with no focal deficit —
  // is a consequence, not a standalone emergency.
  toxicMetabolicEncephalopathy: {
    initial: {},
    progress(pat) {
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, 0.7);
    },
  },

  // ===== DELIRIUM =====
  // Acute, FLUCTUATING confusion — the hallmark that distinguishes it from
  // both dementia's stable chronic baseline and toxic-metabolic
  // encephalopathy's steady impairment. Modeled as a real phase-alternation
  // state machine, the same idiom sickSinusSyndrome's tachy-brady
  // alternation already uses, swapping between a lucid window and a
  // confused window on randomized dwell timers rather than a single
  // settled severity — a monitor-adjacent finding (mental status) that
  // genuinely changes if you step out of the room and come back, which is
  // the actual clinical description of delirium.
  delirium: {
    initial: { age: 78, hr: 92, sbp: 138, rr: 18, glu: 100, pain: 1 },
    progress(pat, dt) {
      if (pat._deliriumPhase == null) {
        pat._deliriumPhase = "confused";
        pat._deliriumTimer = 0;
        pat._deliriumDwell = 2 + Math.random() * 3;
      }
      pat._deliriumTimer += dt;
      if (pat._deliriumTimer >= pat._deliriumDwell) {
        pat._deliriumPhase = pat._deliriumPhase === "confused" ? "lucid" : "confused";
        pat._deliriumTimer = 0;
        pat._deliriumDwell = 2 + Math.random() * 3;
      }
      pat.metabolicEncephalopathy = pat._deliriumPhase === "confused" ? 0.7 : 0;
    },
  },

  // ===== REFEEDING SYNDROME =====
  // Endocrine batch (queue item 7). Reintroducing nutrition to a starved
  // patient triggers an insulin surge that drives potassium and magnesium
  // sharply INTRACELLULAR — real, dangerous, arrhythmogenic electrolyte
  // shifts, wired through the SAME two fields acquiredLongQT already
  // established a seeding idiom for: pat.k (a direct, held-low value) and
  // pat.mg/_mgBase (pk.js's persistent pool — set BOTH, since pk.js decays
  // mg TOWARD _mgBase rather than away from it, so setting mg alone would
  // be overwritten the next tick). Both electrolytes composing this low
  // together is what makes refeeding syndrome genuinely torsadogenic
  // (acquiredLongQT's own substrate) rather than either alone. Phosphate —
  // the classic THIRD refeeding electrolyte — is stated honestly as
  // unmodeled: no field for it exists anywhere in this engine, and adding
  // one only for this condition would be exactly the kind of narrow,
  // unintegrated field section 1 warns against.
  refeedingSyndrome: {
    initial: { hr: 92, sbp: 108, rr: 16, glu: 100, pain: 0, k: 2.6 },
    progress(pat) {
      if (pat._refeedInit === undefined) {
        pat._refeedInit = true;
        pat.mg = 0.5;
        pat._mgBase = 0.5;
      }
    },
  },

  // ===== HYPERAMMONEMIA =====
  // Endocrine batch (queue item 7). Ammonia toxicity (hepatic failure or a
  // urea-cycle disorder) causing cerebral edema and encephalopathy —
  // deliberately reads the GENERAL pat.metabolicEncephalopathy handle
  // rather than pat.liverInjury directly, since a urea-cycle disorder
  // causes this WITHOUT structural liver injury, and conflating the two
  // would misrepresent a patient whose liver is anatomically normal.
  // Tachypnea reflects real central respiratory drive from the associated
  // cerebral edema, not a scripted number.
  hyperammonemia: {
    initial: { hr: 92, sbp: 118, rr: 22, glu: 100, pain: 0 },
    progress(pat) {
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, 0.75);
    },
  },

  // ===== SIADH =====
  // Endocrine batch (queue item 7). renal.js's ADH mechanism was already
  // COMPLETE — three real, disease-ready handles (adhSecretionCapacity,
  // adhAutonomous, adhRenalResponsiveness) that NOTHING in the codebase had
  // ever written, found by grep before building anything new. This condition
  // is nothing but the missing writer: pat.adhAutonomous is ectopic/
  // inappropriate secretion that ignores osmolality and volume entirely (the
  // actual definition of SIADH), read directly by renal.js's own
  // already-verified free-water retention math (`mechanismWiring.mjs`'s
  // "ADH regulated" section already asserts this pathway) — real,
  // euvolemic, dilutional hyponatremia emerges with zero new engine code.
  siadh: {
    initial: { hr: 88, sbp: 118, rr: 16, glu: 100, pain: 1 },
    progress(pat) {
      pat.adhAutonomous = Math.max(pat.adhAutonomous || 0, 3);
      // ANOTHER instance of the SAME dead-code class magnesium's own
      // acquiredLongQT fix documented: patient.js's constructor hardcodes
      // `this.na = 140` and derives it from `ab` (age-baseline acid-base),
      // completely ignoring any `initial.na` override — found while
      // verifying this condition (measured na staying at 140 despite
      // `initial: {na: 122}`). Seeded directly here instead, matching
      // patient.js's own naMass formula (na * (plasmaVol+interstitialVol))
      // so the derived value is internally consistent from the first tick.
      if (pat._siadhInit === undefined) {
        pat._siadhInit = true;
        pat.na = 122;
        pat.naMass = 122 * (pat.plasmaVol + pat.interstitialVol);
      }
    },
  },

  // ===== DIABETES INSIPIDUS =====
  // The mechanistic opposite of SIADH, same zero-new-engine-code reasoning:
  // pat.adhSecretionCapacity = 0 abolishes REGULATED ADH release (central
  // DI — post-neurosurgical/traumatic brain injury is the classic
  // prehospital-relevant cause, so that is the variant built here), read by
  // the SAME renal.js free-water mechanism in the other direction — massive
  // free-water loss into real hypernatremia and genuine hypovolemia (the
  // engine's own waterFlux term moves plasmaVol/totalBloodVol directly, so
  // the resulting dehydration is a real emergent consequence, not scripted).
  // Nephrogenic DI (the collecting duct failing to RESPOND rather than
  // failing to secrete) is a real, easy variant via the third handle,
  // pat.adhRenalResponsiveness = 0, composable onto a cause like lithium
  // toxicity or severe hypercalcemia whenever one of those is built — not
  // built as a second standalone condition here since the backlog lists
  // Diabetes Insipidus once, not split by mechanism.
  diabetesInsipidus: {
    initial: { hr: 108, sbp: 100, rr: 16, glu: 100, pain: 1 },
    progress(pat) {
      pat.adhSecretionCapacity = 0;
      // Same fix as siadh above — initial.na is silently ignored by
      // patient.js's constructor, so the starting hypernatremia is seeded
      // directly here instead.
      if (pat._diInit === undefined) {
        pat._diInit = true;
        pat.na = 152;
        pat.naMass = 152 * (pat.plasmaVol + pat.interstitialVol);
      }
    },
  },

  // ===== ADDISONIAN CRISIS =====
  // Acute adrenal insufficiency — composes THREE genuinely distinct hormone-
  // deficiency mechanisms into their real, already-existing engine handles
  // rather than one generic "shock" state: mineralocorticoid (aldosterone)
  // loss causes real salt-wasting hyponatremia AND hyperkalemia together
  // (seeded via na/k, the same fields every other electrolyte condition
  // reads), and cortisol loss impairs gluconeogenesis (real hypoglycemia,
  // engaging neuro.js's existing seizure/neuroglycopenic pathways for
  // free). The hypotension is real and DISTINCTIVELY refractory: cortisol
  // is required for normal vascular responsiveness to catecholamines, so
  // pat.vasodilation is driven directly — a genuine, documented mechanism
  // for why this shock resists fluid/pressor therapy the way ordinary
  // hypovolemic shock does not, honestly distinct from steroids (the real
  // definitive treatment) not being in this drug box.
  addisonianCrisis: {
    initial: { hr: 118, sbp: 78, rr: 20, glu: 62, pain: 3, k: 5.8 },
    progress(pat, dt) {
      pat.vasodilation = Math.max(pat.vasodilation || 0, 0.25);
      // Queue item 44: this used to write pat.hco3 directly (floor 16, at a
      // slow 0.02/min rate that almost never engaged within a realistic
      // call). A first migration attempt removed it outright, reasoning
      // that this condition's own na=128 (below) would produce a real,
      // if previously invisible, emergent acidosis on its own via the new
      // strong-ion-difference derivation (acidbase.js) — MEASURED at the
      // time as a genuine ~13-15 hco3. That measurement turned out to be
      // riding on a real, SEPARATE bug in acidbase.js itself (fixed in the
      // same session — see that file's own header on chloride): with cl
      // wrongly pinned to a flat baseline regardless of na, a falling
      // sodium alone widened the na-cl gap and manufactured acidosis that
      // was never real. Once cl correctly falls IN PARALLEL with sodium
      // (real pure salt-wasting moves both together, roughly preserving
      // SID), this condition's own na alone produces almost no net
      // acid-base change (measured: pH 7.39-7.46, essentially normal) —
      // which is honestly correct for isotonic salt loss on its own, but
      // leaves out the REAL mechanism Addison's disease actually has: a
      // genuine, mild-to-moderate type-4-RTA-like acidosis from reduced
      // distal renal H+ secretion under aldosterone deficiency, the SAME
      // mechanistic category as severeMetabolicAcidosis's hyperchloremic
      // picture (a few entries below), just milder. pat.clShift (not
      // unmeasuredAnions — this is not an anion-gap process) is the
      // correct lever, at a modest, real target: hco3~19-20 by late in a
      // realistic call, comfortably milder than severeMetabolicAcidosis's
      // own hco3~6 floor, matching Addison's typically-mild presentation.
      pat.clShift = Math.min(9, (pat.clShift || 0) + dt * 0.4);
      // Real adrenal cortical failure — pat.cortisol (renal.js) otherwise
      // relaxes toward pat.sympathetic every tick; pinned near-zero every
      // tick here (the same "pin below a ratcheting ceiling" idiom
      // hyperkalemiaMissedDialysis's own k handling already uses) so that
      // relaxation can never pull it back up. Feeds cardiovascular.js's new
      // cortisol-permissive vascular tone term, which is what actually
      // implements this scenario's own already-written "blunted response
      // to pressors" claim (see that comment for the full mechanism).
      pat.cortisol = Math.min(pat.cortisol ?? 1, 0.05);
      // initial.na is silently ignored by patient.js's constructor (the
      // same dead-code class documented in siadh/diabetesInsipidus above) —
      // seeded directly instead.
      if (pat._addisonInit === undefined) {
        pat._addisonInit = true;
        pat.na = 128;
        pat.naMass = 128 * (pat.plasmaVol + pat.interstitialVol);
      }
    },
  },

  // ===== CUSHING SYNDROME (comorbidity) =====
  // Chronic hypercortisolism — the mechanistic opposite of addisonianCrisis
  // above. Reuses the SAME baseSVR mechanism the hypertension comorbidity
  // uses (glucocorticoid excess has real mineralocorticoid-like activity
  // and potentiates vasoconstrictors) at a smaller magnitude, plus steroid-
  // induced hyperglycemia via the same `glu` field diabetesT2 uses. Most of
  // the real clinical picture (moon facies, central obesity, striae) is
  // exam/history only, with no vitals mechanism to hang it on — narrative,
  // not decorative, the same honest split Bell's Palsy uses between a real
  // mechanism (here: BP/glucose) and pure exam findings (there: none at
  // all).
  cushingSyndrome: {
    initial: { glu: 145 },
    progress(pat) {
      if (pat._cushSynSet) return;
      pat._cushSynSet = true;
      if (pat._htnRestSvr == null) pat._htnRestSvr = pat.ageProfile.baseSVR();
      pat.baseSVR = Math.max(pat.baseSVR, pat._htnRestSvr * 1.15);
    },
  },

  // ===== HYPERTHYROIDISM (comorbidity) =====
  // Endocrine batch (queue item 7). T3/T4 excess raises basal metabolic
  // rate — reuses pat.metabolicHeatMultiplier (thermo.js, built for this
  // batch) for genuine mild heat intolerance/low-grade temperature
  // elevation, plus a modest chronic tachycardia. A stable baseline, set
  // once on presentation (the same one-time-step idiom chronicHeartFailure
  // uses) rather than evolving during the call — thyroid storm below is the
  // acute decompensation, not a ramp from here.
  hyperthyroidism: {
    initial: { hr: 104, sbp: 132, rr: 18, glu: 100, pain: 0 },
    progress(pat) {
      if (pat._hyperTSet) return;
      pat._hyperTSet = true;
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.3);
    },
  },

  // ===== THYROID STORM =====
  // The acute, life-threatening decompensation of hyperthyroidism — severe
  // hypermetabolism (metabolicHeatMultiplier pushed much higher, real fever
  // through the same thermo.js heat-balance math, not a scripted
  // temperature), dangerous escalating tachycardia, and real catecholamine-
  // adjacent cardiac irritability (pat.rhythmInstability, the SAME vtDrive
  // pathway electricalStorm/aicdMalfunction/excitedDelirium all measure) —
  // genuine risk of a lethal arrhythmia from the hypermetabolic/adrenergic
  // state, not a separate invented complication.
  thyroidStorm: {
    initial: { hr: 152, sbp: 104, rr: 26, glu: 100, pain: 2, temp: 39.4 },
    progress(pat, dt) {
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 2.2);
      pat.hrBase = Math.min(180, Math.max(pat.hrBase, 140) + dt * 1.2);
      pat.rhythmInstability = Math.min(2, (pat.rhythmInstability || 0) + dt * 0.03);
    },
  },

  // ===== HYPOTHYROIDISM (comorbidity) =====
  // The opposite pole of hyperthyroidism above, same shared handle in the
  // other direction — real, mild bradycardia and cold intolerance from a
  // genuinely suppressed basal metabolic rate.
  hypothyroidism: {
    initial: { hr: 58, sbp: 112, rr: 12, glu: 100, pain: 0, temp: 36.3 },
    progress(pat) {
      if (pat._hypoTSet) return;
      pat._hypoTSet = true;
      pat.metabolicHeatMultiplier = Math.min(pat.metabolicHeatMultiplier ?? 1, 0.7);
    },
  },

  // ===== MYXEDEMA COMA =====
  // Severe, decompensated hypothyroidism — profound hypothermia is a real,
  // EMERGENT consequence of heat production collapsing (metabolicHeatMultiplier
  // driven far lower) while thermo.js's ordinary heat-loss terms keep
  // running unchanged, not a scripted low temperature; the same honest
  // "mechanism, not a stat write" reasoning heat stroke's own thermo.js
  // extension already established, in the opposite direction. Severe
  // bradycardia and depressed consciousness (metabolicEncephalopathy, the
  // same general confusion handle toxic-metabolic encephalopathy uses)
  // complete the presentation — a genuine multi-system crisis, not a single
  // low number.
  myxedemaComa: {
    initial: { hr: 42, sbp: 84, rr: 8, glu: 100, pain: 0, temp: 34.0 },
    progress(pat) {
      pat.metabolicHeatMultiplier = Math.min(pat.metabolicHeatMultiplier ?? 1, 0.4);
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, 0.8);
    },
  },

  // ===== DIABETIC KETOACIDOSIS =====
  // Endocrine batch (queue item 7's own suggested first target: "Kussmaul
  // respiration, osmotic diuresis, total-body potassium depletion masked by
  // a normal serum value"). Kussmaul respiration is NOT scripted — lowering
  // pat.hco3 (real ketoacid buffering) is read directly by respiratory.js's
  // own pre-existing Winter's formula (`expectedPaco2 = 1.5*hco3 + 8`,
  // already in the engine, previously reachable only by conditions that
  // happened to move hco3), so deep compensatory hyperventilation EMERGES
  // from the acid-base math, not a rate this condition sets. Osmotic
  // diuresis is real, ongoing volume loss (plasmaVol/totalBloodVol falling
  // directly, the same mechanism a slow hemorrhage uses, engaging the
  // engine's existing RAAS/tachycardia compensation for free). Potassium is
  // seeded ELEVATED (5.4) despite real total-body depletion — the
  // classic, dangerous DKA teaching point (acidosis + insulin deficiency
  // shift K out of cells even as the total body pool is falling from
  // osmotic losses) — STATED HONESTLY: the insulin-driven crash that
  // follows treatment is a hospital-phase phenomenon, since this engine's
  // drug box (like several other conditions' real antidotes) has no insulin
  // mechanism to demonstrate it with.
  diabeticKetoacidosis: {
    initial: { hr: 120, sbp: 98, rr: 22, glu: 550, pain: 3, k: 5.4 },
    progress(pat, dt) {
      // Real DKA does not develop acutely in the field — this patient
      // presents already several HOURS into ketoacid accumulation (per the
      // scenario's own history: days of vomiting, insulin lapsed). Seeded
      // directly to a real severe-DKA bicarbonate (10 mEq/L, within the
      // documented <18 diagnostic / <10 severe range) on first tick rather
      // than starting at the age-baseline ~24 and slowly declining — a slow
      // decline from normal would put Winter's-formula Kussmaul
      // compensation past this engine's own typical call length before it
      // became clinically apparent, which misrepresents how these patients
      // actually present. initial.hco3 itself is silently ignored by
      // patient.js's constructor (the same dead-code class as
      // siadh/diabetesInsipidus/addisonianCrisis's na fix above), so this
      // is set directly rather than via `initial`.
      // Queue item 44: ketoacid anions are the textbook ANION-GAP cause —
      // pat.unmeasuredAnions (acidbase.js) is the mechanistically correct
      // lever, not a free hco3 write. Seed (15.4) reproduces this
      // condition's own long-standing immediate presenting hco3=10 exactly
      // (na=140/k=5.4 at construction: SID=43.4, 43.4-15.4-18=10). The
      // ceiling/rate (20.5, 0.055/min) are NOT a pure 1:1 translation of
      // the old hco3 floor/rate — MEASURED (traced minute-by-minute) that
      // this patient's own acidemia drives real, pre-existing K+/H+
      // exchange (renal.js), and that rising K+ is itself a genuine strong
      // cation under the new SID derivation, partially buffering hco3 back
      // up over the course of the call. Pushed the ceiling/rate higher
      // (tried up to 40/0.08) trying to fully outrun that buffering and it
      // does NOT work past a point — a separate hypocapnic-brake
      // saturation in respiratory.js collapses the compensatory response
      // instead. 20.5/0.055 is the value that reproduces a real, honest,
      // still-severe DKA course (hco3 falls to ~14 by 900s, anion gap
      // stays markedly widened throughout) without chasing a magnitude the
      // physiology itself won't sustain — see mechanismWiring.mjs's own
      // Kussmaul assertion for the resulting, deliberately early (t=300s,
      // not t=900s) comparison window this calibration was measured
      // against.
      if (pat._dkaInit === undefined) {
        pat._dkaInit = true;
        pat.unmeasuredAnions = 15.4;
      }
      pat.unmeasuredAnions = Math.min(20.5, pat.unmeasuredAnions + dt * 0.055);
      // Volume depletion is no longer scripted here — renal.js's own
      // osmotic-diuresis mechanism (queue item 43) now drains plasmaVol
      // for real, driven by this condition's own live pat.glucose, and
      // correctly slows/stops once glucose falls back toward normal after
      // treatment rather than draining at a fixed rate forever.

      // ABSOLUTE INSULIN DEFICIENCY (queue item 5's remaining dead-field,
      // this session). DKA's defining lesion is that beta cells CANNOT
      // secrete insulin despite the hyperglycemic drive — real endogenous
      // insulin here is near-zero, not just low. Without this cap, the new
      // generic renal.js glucose-disposal loop (which reads pat.insulin
      // and would otherwise ramp it toward its own hyperglycemia-driven
      // target, exactly as a non-diabetic stress-hyperglycemia patient's
      // does) would auto-correct this patient's glucose over the course of
      // a call — clinically wrong; untreated DKA does not self-resolve.
      // Re-asserted as a ceiling every tick (same "condition re-floors/
      // re-ceils a field every tick" idiom preeclampsia's own kidneyInjury/
      // liverInjury floors already use), since renal.js's relaxation term
      // would otherwise pull pat.insulin back up on its own.
      pat.insulin = Math.min(pat.insulin ?? 1, 0.3);
    },
  },

  // ===== PEDIATRIC DIABETIC KETOACIDOSIS ===== (pediatric batch, queue item 7)
  //
  // Built directly on diabeticKetoacidosis's own core mechanism (the same
  // unmeasuredAnions ramp, at the identical ceiling/rate — a child's
  // ketoacidosis is mechanistically the SAME acid-base process as an
  // adult's, so there is no honest reason to invent a second one) at
  // pediatric age/weight scaling via ageProfile.js — a school-age child
  // (age 8, ageProfile's own defaultWeight(8)=30 kg), the age band where
  // new-onset T1DM presenting in DKA is most common. hr/rr/sbp are left
  // to ageProfile.js's baselineVitals()/baselineMAP() age-appropriate
  // defaults rather than adult numbers, so the tachycardia this patient
  // shows already reads correctly against an 8-year-old's own normal
  // range, not an adult's.
  //
  // THE REAL, HIGHER-STAKES DIFFERENCE: cerebral edema. Pediatric DKA
  // carries a real, well-documented, disproportionate mortality risk
  // adult DKA does not carry at the same rate — clinically apparent
  // cerebral edema complicates roughly 0.5-1% of pediatric DKA episodes
  // but accounts for 60-90% of pediatric DKA deaths (Glaser et al., NEJM
  // 2001; the same paper's own case-control analysis is the historical
  // basis for the "bolus judiciously, correct slowly" pediatric DKA fluid
  // guidance every EMS/PALS protocol now carries), and the strongest
  // modifiable risk factor identified is the RATE of fluid/osmotic
  // correction — large-volume, rapid crystalloid resuscitation is
  // specifically implicated, not fluid resuscitation itself (which is
  // still indicated and necessary for the real hypovolemia DKA causes).
  //
  // HONEST SCOPE DECISION (per this batch's own instruction): this
  // engine's one real ICP-adjacent handle, pat.icpMassEffect
  // (intracerebralHemorrhage/subarachnoidHemorrhage/increasedICP/
  // meningitis all already write it, cardiovascular.js/neuro.js already
  // read it into Cushing's-triad-shape bradycardia/hypertension and
  // mortality.js's own herniation ceiling), is a genuine, reusable,
  // already-wired ICP mechanism — so a modest, real consequence IS wired
  // below, gated specifically on REPEATED aggressive fluid dosing (not
  // fluids themselves, and not a scripted vitals catastrophe): each
  // "saline" bag is a fixed 500 mL, already 15+ mL/kg for this patient's
  // own 30 kg weight, so guideline-appropriate DKA fluid management is a
  // SINGLE such bolus for initial resuscitation; repeated stacked dosing
  // beyond that first bag is the real over-aggressive-correction pattern
  // this condition penalizes, at a small, literature-anchored magnitude
  // (icpMassEffect ceilinged at 0.18 — real and measurable on the ICP
  // gauge, well short of a herniation-grade mass effect, since this
  // engine has no actual osmotic-shift/cerebral-water model to drive a
  // larger, more clinically-precise number honestly). What is NOT
  // separately modeled, stated plainly rather than faked: the true
  // cerebral-edema mechanism is an osmotic fluid shift into brain tissue
  // as extracellular osmolality falls faster than intracellular
  // osmolality can re-equilibrate — this engine has no intracellular/
  // extracellular osmolality gradient model anywhere, so the icpMassEffect
  // bump below is an honest PROXY for "you are correcting this patient too
  // fast", not a simulation of the real cellular mechanism. The primary
  // teaching vehicle for the real risk is this condition's own resolve()
  // dosing-rate guidance text, not an invented new physiology term.
  pediatricDKA: {
    initial: { age: 8, hr: 132, sbp: 96, rr: 26, glu: 560, pain: 3, k: 5.2 },
    progress(pat, dt, s) {
      // Identical anion-gap translation to diabeticKetoacidosis above, at
      // this condition's own presenting k=5.2 (na defaults to 140 via
      // ageProfile's age-independent baseline): SID=42.2, so an anion
      // pool of 14.7 reproduces a real severe-pediatric-DKA presenting
      // hco3=9.5 (42.2-14.7-18=9.5), ramping at the identical rate/ceiling
      // diabeticKetoacidosis already measured and cited above.
      if (pat._pedDkaInit === undefined) {
        pat._pedDkaInit = true;
        pat.unmeasuredAnions = 14.7;
      }
      pat.unmeasuredAnions = Math.min(20, pat.unmeasuredAnions + dt * 0.055);
      // CEREBRAL EDEMA RISK PROXY — gated on REPEATED saline dosing, not
      // presence of fluid at all (a single guideline bolus does nothing
      // here, matching real practice: initial resuscitation fluid is not
      // the hazard, over-aggressive REPEAT dosing is). Counts doses whose
      // `id` is a crystalloid (saline/plasmalyte, the two fluid-model
      // drugs in this formulary — checked by id since pk.js's own dose
      // records carry no other classification this condition can read)
      // given to THIS patient across the whole call so far.
      const fluidDoses = (s?.doses || []).filter(d =>
        (d.patientId == null || d.patientId === pat._id) &&
        (d.id === "saline" || d.id === "plasmalyte")).length;
      if (fluidDoses >= 2) {
        // Small, bounded rise — real and readable on the ICP gauge, not a
        // scripted collapse. Scales gently with how far past the single
        // safe bolus dosing has gone (fluidDoses-1), capped at 0.18.
        pat.icpMassEffect = Math.min(0.18,
          Math.max(pat.icpMassEffect || 0, (fluidDoses - 1) * 0.05));
      }
      // Volume depletion: same osmotic-diuresis mechanism diabeticKetoacidosis
      // relies on (renal.js, driven by this condition's own live glucose) —
      // no separate scripting needed, and it is exactly this real
      // hypovolemia that makes SOME fluid resuscitation genuinely
      // necessary here, not just a hazard to avoid.

      // Same real absolute insulin deficiency as adult diabeticKetoacidosis
      // above — see that condition's own comment for the full mechanism.
      pat.insulin = Math.min(pat.insulin ?? 1, 0.3);
    },
  },

  // ===== HYPEROSMOLAR HYPERGLYCEMIC STATE =====
  // The Type-2-diabetic mirror of DKA: residual insulin prevents significant
  // ketosis (hco3 essentially untouched, no Kussmaul), but glucose runs
  // dramatically higher (initial 850, against DKA's 550) with even more
  // severe volume depletion — HHS patients are classically MORE dehydrated
  // than DKA on presentation. Altered mentation is a REAL, direct
  // consequence of the hyperosmolarity itself, not a generic confusion flag
  // — feeds neuro.js's new pat.metabolicEncephalopathy consciousness check
  // scaled to the glucose level, distinguishing "confused because the blood
  // is that concentrated" from every other confusion-cause in this library.
  hyperosmolarHyperglycemicState: {
    initial: { hr: 128, sbp: 88, rr: 18, glu: 850, pain: 0 },
    progress(pat) {
      // Volume depletion is no longer scripted here — see
      // diabeticKetoacidosis's identical comment; renal.js's own real,
      // glucose-driven osmotic-diuresis mechanism (queue item 43) now
      // drives this condition's own classically-severe dehydration.
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0,
        Math.min(1, ((pat.glucose ?? 100) - 400) / 400));
      // TISSUE INSULIN RESISTANCE (queue item 5's remaining dead-field,
      // this session) — HHS is the Type-2-diabetic mirror of DKA: residual
      // (even elevated) insulin SECRETION is present (enough to suppress
      // ketogenesis, this condition's own header comment), but peripheral
      // tissue response to it is severely blunted. Modeled through
      // pat.insulinSensitivity, NOT pat.insulin itself — the correct real
      // lever for a resistant (as opposed to deficient) phenotype, and
      // what stops renal.js's new generic glucose-disposal loop from
      // auto-correcting this patient's extreme hyperglycemia the way a
      // non-resistant patient's would.
      pat.insulinSensitivity = Math.min(pat.insulinSensitivity ?? 1, 0.2);
    },
  },

  // ===== SEVERE HYPOGLYCEMIA (covers Insulin Shock) =====
  // "Insulin shock" is the same entity by a different, older name (severe
  // hypoglycemia specifically from an excess-insulin cause) — not a second
  // condition, the same reasoning already applied to thrombotic/embolic
  // stroke and PEA/Asystole/VF elsewhere in this library.
  severeHypoglycemia: {
    initial: { hr: 110, sbp: 108, rr: 18, glu: 28, pain: 0 },
    // EXOGENOUS INSULIN EXCESS (queue item 5's remaining dead-field, this
    // session). pat.glucose used to have NO auto-correction mechanism in
    // this engine at all (only drugs moved it), so a static low value
    // persisted correctly on its own with no progress() needed. Now that
    // renal.js's real endocrine-pancreas loop exists, a plain low glucose
    // would trigger genuine, appropriate counter-regulation (glucagon
    // rising, insulin secretion suppressed) and self-correct — clinically
    // WRONG for this condition's own real cause: "insulin shock" is
    // EXOGENOUS insulin (or a sulfonylurea acting on the same receptor),
    // which does not respond to the body's own falling-glucose feedback
    // the way endogenous secretion does. Forced as a floor every tick
    // (same re-asserted-floor idiom the DKA/HHS conditions above use in
    // the opposite direction) — this patient's insulin stays
    // pathologically elevated regardless of glucose, correctly opposing
    // (not preventing) the real glucagon counter-regulatory rise, and
    // correctly reversed by dextrose/glucagon administration, which still
    // acts through pk.js's own existing direct-dose mechanism unchanged.
    progress(pat) {
      pat.insulin = Math.max(pat.insulin ?? 1, 3);
    },
  },

  // ===== TYPE I DIABETES MELLITUS (comorbidity) =====
  // The autoimmune, insulin-DEFICIENT counterpart to diabetesT2's insulin-
  // RESISTANT phenotype — real clinical distinction: T1DM's absolute
  // insulin deficiency is what makes it far more DKA-prone. Composable
  // (["diabeticKetoacidosis","typeIDiabetes"] for the etiology, or standing
  // alone as a comorbidity).
  typeIDiabetes: {
    initial: { glu: 180, riskFactors: { diabetes: true } },
    // Queue item 5's remaining dead-field (this session): real absolute
    // insulin deficiency, the SAME mechanism diabeticKetoacidosis/
    // pediatricDKA use — see diabeticKetoacidosis's own comment. Composing
    // typeIDiabetes alongside diabeticKetoacidosis (both progress() hooks
    // run per physiology.js's own composition rules) sets the identical
    // ceiling twice, which is harmless (Math.min is idempotent).
    progress(pat) {
      pat.insulin = Math.min(pat.insulin ?? 1, 0.3);
    },
  },

  // ===== ALCOHOLIC KETOACIDOSIS =====
  // The SAME ketoacidosis mechanism DKA uses (pat.hco3 depletion, read by
  // respiratory.js's existing Winter's-formula Kussmaul compensation) from a
  // genuinely different cause — starvation ketosis from poor oral intake
  // plus alcohol's own inhibition of gluconeogenesis — which is why glucose
  // is normal-to-low here rather than DKA's severe hyperglycemia. A real,
  // teachable trap: a ketoacidotic, Kussmaul-breathing patient whose finger-
  // stick glucose looks unremarkable, so the diagnosis has to come from the
  // history (poor intake, recent heavy drinking) and the breathing pattern,
  // not the glucometer.
  alcoholicKetoacidosis: {
    initial: { hr: 108, sbp: 104, rr: 20, glu: 88, pain: 4 },
    progress(pat, dt) {
      // Seeded directly on first tick (see diabeticKetoacidosis's identical
      // note above) rather than declining slowly from the age-baseline
      // ~24 — real presentation is already several hours into a multi-day
      // binge with poor intake, not acutely developing on scene.
      // Queue item 44: same anion-gap translation as diabeticKetoacidosis
      // above, at this condition's own na=140/k=4 (default): SID=42, so an
      // anion pool of 10 reproduces the identical immediate hco3=14,
      // ramping to 14 (hco3=10) at the same 0.03/min rate.
      if (pat._akaInit === undefined) { pat._akaInit = true; pat.unmeasuredAnions = 10; }
      pat.unmeasuredAnions = Math.min(14, pat.unmeasuredAnions + dt * 0.03);
    },
  },

  // ===== STARVATION KETOSIS =====
  // The mild end of the same mechanism — prolonged fasting produces a real
  // but modest ketosis/mild acidosis, deliberately NOT dangerous the way
  // DKA/alcoholic ketoacidosis are (hco3 floor left much higher). The real
  // field teaching point is recognizing it as benign/self-correcting with
  // refeeding rather than reflexively treating it as DKA.
  starvationKetosis: {
    initial: { hr: 92, sbp: 106, rr: 16, glu: 78, pain: 1 },
    progress(pat, dt) {
      // Queue item 44: a real, if mild, anion-gap ketosis — pat.unmeasuredAnions
      // (acidbase.js), not a free hco3 write. Starts at 0 (constructor
      // default) and ramps to 6 at this condition's own na=140/k=4
      // (default): SID=42, so netAnions=6 reproduces the identical floor
      // hco3=18 this always settled at, at the same 0.02/min rate.
      pat.unmeasuredAnions = Math.min(6, (pat.unmeasuredAnions || 0) + dt * 0.02);
    },
  },

  // ===== HYPOXIC BRAIN INJURY =====
  // Neuro batch (queue item 7) — REVIEWED, not built from nothing: this
  // engine's ischemic-injury accumulator (pat.brainInjury, neuro.js's
  // updateOrganInjury — real, graded, already reads cpp/caO2 deficit and
  // temperature) already fully models the underlying mechanism; post-arrest
  // work already established the consciousness/mortality bands it crosses.
  // What was missing was a patient who presents ALREADY carrying a fixed
  // anoxic injury rather than one accruing it live (e.g. post-arrest,
  // post-drowning, post-hanging, found late) — a real, distinct call from
  // seizurePostictal's own instant-postictal-then-recovering pattern, since
  // hypoxic brain injury recovers slowly if at all rather than orienting
  // back within the call. No engine change: this is the same field, seeded
  // higher and held rather than allowed to clear.
  hypoxicBrainInjury: {
    initial: { hr: 96, sbp: 108, rr: 14, glu: 100, pain: 0 },
    sync(pat) {
      if (pat._hbiInit === undefined) { pat._hbiInit = true; pat.brainInjury = Math.max(pat.brainInjury || 0, 0.4); }
    },
    progress(pat) {
      pat.brainInjury = Math.max(pat.brainInjury || 0, 0.4);
    },
  },

  // ===== BELL'S PALSY =====
  // Unilateral facial (CN VII, lower motor neuron) paralysis — forehead
  // involved, the actual exam finding that distinguishes it from a stroke's
  // forehead-sparing UMN pattern. Deliberately NOT wired through
  // strokeWeakness (that field represents LIMB weakness; Bell's is isolated
  // to the face, and conflating the two would let a candidate's "check
  // strokeWeakness" reflex misfire here). No systemic physiology exists to
  // model — same honest "content-only" reasoning as testicularTorsion/
  // absenceSeizure elsewhere in this library.
  bellsPalsy: {
    initial: { hr: 78, sbp: 122, rr: 16, glu: 100, pain: 0 },
  },

  // ===== DEMENTIA (comorbidity) =====
  // A chronic baseline, not an acute derangement — real dementia does not,
  // by itself, change vitals or GCS (these patients are typically awake and
  // alert, just cognitively impaired), so forcing a consciousness or
  // brainInjury change here would be physiologically wrong, not merely
  // thin. Composable onto an acute presenting condition
  // (["pneumoniaSepsis","dementia"]) where the real teaching point lives:
  // NEW confusion in a demented patient still means something new and
  // treatable is happening (infection, hypoxia, a bleed) rather than being
  // written off as baseline — that teaching point comes from whatever acute
  // condition it composes with, not from dementia itself, which correctly
  // has no mechanism of its own to add.
  dementia: {
    initial: {},
  },

  // ===== GUILLAIN-BARRE SYNDROME =====
  // Neuro batch (queue item 7). Ascending, progressive neuromuscular
  // weakness — the real, distinguishing consequence is respiratory muscle
  // failure, not a rhythm/pressure problem. Reuses pat.respMuscleFatigue
  // (respiratory.js) directly: that field already reduces effective
  // inspiratory muscle pressure and therefore tidal volume, and it is the
  // ONLY handle that does — a genuinely primary neuromuscular weakness is
  // mechanically indistinguishable, at the muscle-force level, from the
  // fatigue this field already represents, so reusing it is the honest
  // choice rather than a decorative parallel field. Real GBS progresses over
  // DAYS; compressed to a measurable, real UPWARD TREND within a call rather
  // than an instant crisis, capped below complete failure so early
  // recognition and ventilatory support genuinely matter. No field cure
  // (IVIG/plasmapheresis are hospital-level) — the job is recognizing the
  // trend and supporting ventilation before it completes.
  guillainBarre: {
    initial: { hr: 92, sbp: 128, rr: 18, glu: 100, pain: 2 },
    progress(pat, dt) {
      pat._gbsT = (pat._gbsT || 0) + dt;
      pat.respMuscleFatigue = Math.max(pat.respMuscleFatigue || 0, Math.min(0.85, pat._gbsT * 0.015));
    },
  },

  // ===== MYASTHENIA GRAVIS CRISIS =====
  // The acute, faster-onset mirror of guillainBarre above — a known
  // myasthenic patient acutely decompensating (infection/medication/stress
  // trigger), reaching a higher severity ceiling sooner, matching the real
  // clinical urgency of a CRISIS rather than a slow chronic progression.
  // Same respMuscleFatigue mechanism, same honest field limitation
  // (edrophonium/pyridostigmine adjustment is not a same-call fix) — the
  // real field distinction between the two diseases is history and time
  // course, not different physiology this engine needs to fake.
  myastheniaGravisCrisis: {
    initial: { hr: 100, sbp: 122, rr: 20, glu: 100, pain: 1 },
    progress(pat, dt) {
      pat._mgT = (pat._mgT || 0) + dt;
      pat.respMuscleFatigue = Math.max(pat.respMuscleFatigue || 0, Math.min(0.9, pat._mgT * 0.03));
    },
  },

  // ===== PERIPHERAL VERTIGO =====
  // Vestibular neuritis / BPPV — benign, self-limited, a NORMAL focused neuro
  // exam apart from nystagmus/nausea, which is the entire clinical point: it
  // is diagnosed by the ABSENCE of anything else. No new fields touched.
  peripheralVertigo: {
    initial: { hr: 88, sbp: 122, rr: 16, glu: 100, pain: 1 },
  },

  // ===== CENTRAL VERTIGO =====
  // The dangerous mimic — a posterior-circulation (cerebellar/brainstem)
  // process presenting AS vertigo. Reuses ischemicStroke's own focal-deficit
  // fields at a deliberately MILD, subtle severity (0.2, not ischemicStroke's
  // own 0.8) rather than a separate mechanism: the real clinical teaching
  // (HINTS exam philosophy) is that central vertigo carries ADDITIONAL,
  // often subtle focal findings a purely peripheral process never does —
  // dysarthria/ataxia/mild limb involvement alongside the vertigo, not a
  // dramatic hemiparesis. A patient who "just" has room-spinning and nausea
  // is the peripheral case; the same complaint WITH a subtle extra finding
  // is the one that needs a stroke workup, not reassurance.
  centralVertigo: {
    initial: { hr: 90, sbp: 148, rr: 16, glu: 100, pain: 1 },
    progress(pat) {
      pat.strokeSide = pat.strokeSide ?? "left";
      pat.strokeWeakness = Math.max(pat.strokeWeakness || 0, 0.2);
    },
  },

  // ===== ABSENCE SEIZURE =====
  // Brief (5-15 s), non-convulsive lapses in awareness with an abrupt return
  // to baseline — no postictal state, easily mistaken for daydreaming or
  // inattention, which IS the actual teaching point (recognition), not a
  // hemodynamic emergency. Stated honestly: this has essentially no
  // emergency physiology to model (unlike every other entity in this
  // family), so it is deliberately left thin rather than given invented
  // vitals drift — the same reasoning that kept Bell's Palsy and Upper
  // Respiratory Infection minimal elsewhere in this library. No progress().
  absenceSeizure: {
    initial: { age: 8, weight: 26, hr: 92, sbp: 100, rr: 18, glu: 100, pain: 0 },
  },

  // Distracting-injury / masked-second-problem worked example (item 7's
  // discipline applied to a TEACHING PATTERN rather than a single diagnosis):
  // profound hypoglycemia found down — a real, reversible, and completely
  // ordinary field save — layered on top of an unwitnessed fall that put a
  // slowly expanding subdural bleed on its own independent clock. Nothing new
  // was invented for the hypoglycemia half: a low `glu` already engages the
  // existing generic seizure-drive mechanism in neuro.js (the `seizurePostictal`
  // condition's own comment calls this out directly — "hypoglycaemia would be
  // the classic reversible trigger, handled by the glucose engine if present"),
  // and dextrose/glucagon already raise `pat.glucose` back up through pk.js's
  // ordinary drug-effect pipeline. Fixing the sugar genuinely fixes that half.
  // The ONLY new mechanism here is the second half: `brainInjury` (the same
  // graded accumulator polytraumaFall/polytraumaMoto/stabChestTension already
  // use, and that mortality.js/neuro.js's updateCerebral already read to force
  // "unconscious" past 0.5) climbs on its own time course, independent of
  // glucose, because there is no field lever for an expanding intracranial
  // bleed — same "recognize and transport" philosophy the trauma conditions
  // already use, not a new kind of treatable/untreatable split.
  hypoglycemiaMaskedBleed: {
    initial: { age: 71, weight: 74, hr: 118, sbp: 148, rr: 20, glu: 28, pain: 2, blood: 5.6 },
    // `initial.brainInjury` is NOT a real hook — Patient's constructor hardcodes
    // brainInjury to 0 and never reads an override for it (confirmed by
    // instrumenting: an initial value here is silently discarded). Every other
    // condition that uses brainInjury (seizurePostictal, polytraumaFall/Moto,
    // stabChestTension) actually seeds it through `sync()`, not `initial` —
    // matching that real, working pattern here instead of the dead one.
    sync(pat) {
      if (pat._mbInit === undefined) { pat._mbInit = true; pat.brainInjury = Math.max(pat.brainInjury || 0, 0.15); }
    },
    progress(pat, dt) {
      // `dt` here is MINUTES (physiology.js's stepPatient divides by 60 before
      // calling progress). Measured: a well-perfused patient's brainInjury is
      // clawed back by neuro.js's updateOrganInjury at -0.003/min regardless of
      // cause (it assumes brainInjury is purely ischemic and heals once
      // perfusion is fine) — true for hypoxic injury, not true for an expanding
      // mass lesion, which doesn't resolve just because oxygenation is normal.
      // This condition's own rate has to clear that clawback to show a net
      // climb: 0.018/min in, ~0.003/min clawed back, nets to the intended
      // ~+0.015/min — ~0.15 -> ~0.45 over a 20-minute call if never
      // transported, mirroring an expanding subdural's real (much slower,
      // hours-scale) time course compressed to a prehospital call: perceptible
      // but not so fast it reads as an acute bleed and gives the twist away
      // before the reassessment that's supposed to catch it.
      pat.brainInjury = clamp((pat.brainInjury ?? 0.15) + dt * 0.018, 0, 1);
    },
  },
  // ---- Trauma conditions (for the NREMT-style trauma scenarios) ----
  // These lean on the engine's existing levers — activeBleedRate/wounds for
  // hemorrhage, ptx for the pleural space, brainInjury for TBI, low rrBase for
  // the apnea of a head injury — and let the closed-loop model produce the
  // shock, hypoxia and (mis)managed deterioration on its own. Procedures the
  // candidate performs (tourniquet -> stopsBleed, needle decompression ->
  // ptxFix, BVM -> tvDrugOffset) feed straight back in, so the arc is emergent.

  // A) 24 yo fall from a roof: arterial femoral hemorrhage + penetrating chest
  // with a tension pneumothorax + TBI with apnea. Exsanguination and the
  // tension are both on the clock.
  polytraumaFall: {
    initial: {
      age: 24, weight: 82, hr: 122, rr: 5, glu: 112, pain: 7,
      blood: 4.4, brainInjury: 0.5, shunt: 0.22, ptx: "ptx", bleed: 0.08,
    },
    wounds: {
      legR: { type: "deformity", severity: "open", note: "Open mid-shaft femur — bright-red pulsatile bleeding into a spreading pool. Arterial." },
      // Bug fix: this was keyed "chestL", which matches no real exposure
      // region — the game only ever exposes torso/armL/armR/legL/legR (see
      // clothing.js's REGION_LABEL), so "removing the shirt" never found this
      // wound and revealed nothing. torso is the chest-exposure region.
      torso: { type: "puncture", severity: "minor", note: "Penetrating wound to the left anterior chest. Breath sounds fading on that side; becoming hyperresonant, trachea starting to shift." },
      head: { type: "laceration", severity: "minor", note: "Boggy left parietal scalp laceration; unequal pupils." },
    },
    progress(pat, dt) {
      // The penetrating chest wound is a one-way valve: a simple pneumothorax
      // that tensions over ~90 s if the chest is never decompressed. Once a
      // needle/finger (ptxFix) has cleared it, it stays down. A vented chest
      // seal (queue item 7, chestSealApplied) also stops it from EVER
      // reaching tension in the first place — it is what a vented seal is
      // actually for, previously undeclared anywhere in the mechanism.
      if (pat.ptx === "ptx" && !pat.chestSealApplied) {
        pat._tensionTime = (pat._tensionTime || 0) + dt;
        if (pat._tensionTime > 2.5) pat.ptx = "tptx";
      }
      if (pat.ptx === "tptx") pat.shuntFraction = clamp((pat.shuntFraction ?? 0.22) + dt * 0.015, 0.22, 0.5);
      // Head-injury apnea: no spontaneous rescue of the respiratory drive.
      pat.rrBase = clamp(pat.rrBase, 0, 6);
    },
  },

  // B) ~30 yo, ~36 weeks pregnant, struck as a pedestrian: blunt trauma with
  // some hemorrhage AND a precipitous delivery in progress. Aortocaval
  // compression (supine) and the delivery/newborn are handled by obstetric.js;
  // this condition just sets the pregnancy up and the maternal injuries.
  traumaPregnant: {
    initial: {
      age: 30, weight: 78, hr: 112, rr: 24, glu: 108, pain: 6,
      blood: 4.6, bleed: 0.02, shunt: 0.1,
    },
    wounds: {
      legL: { type: "deformity", severity: "closed", note: "Deformed, swollen left thigh — closed femur, no external bleeding." },
      // Bug fix: "abd" matched no real exposure region either — the abdomen
      // shares the torso's clothing layer in this game's model (no separate
      // "abdomen" garment), so torso is the correct key for it too.
      torso: { type: "contusion", severity: "severe", note: "Seat-belt/impact bruising across the gravid abdomen; uterus firm and term-size, crowning visible at the perineum." },
    },
    progress(pat, dt, s) {
      // Set up the pregnancy once. 36 weeks, already well into labor
      // (precipitous), a depressed newborn is coming (apgarSeed 0.35 -> needs
      // PPV). obstetric.js advances labor and spawns the newborn at delivery.
      if (!pat._pregnancy) {
        pat._pregnancy = {
          gestation: 36, laborProgress: 0.72, contractionRate: 0.06,
          tilted: false, apgarSeed: 0.35, birthWeight: 2.8,
        };
      }
      // Keep the supine mother's position tied to a session flag the UI/tilt
      // procedure can set (left-lateral displacement relieves compression).
      pat._pregnancy.tilted = !!(s && s.leftLateralTilt);
    },
  },

  // C) ~30 yo motorcycle vs car: femoral hemorrhage + open ("sucking") chest
  // wound + TBI, decompensating toward a hypovolaemic PEA arrest. ETCO2 is
  // present because the arrest is fresh and perfusion has only just failed.
  polytraumaMoto: {
    initial: {
      age: 30, weight: 84, hr: 134, rr: 30, glu: 120, pain: 7,
      blood: 5.0, brainInjury: 0.4, shunt: 0.2, ptx: "ptx", bleed: 0.14,
    },
    wounds: {
      legL: { type: "deformity", severity: "open", note: "Open femur fracture, steady dark and bright bleeding — arterial and venous." },
      torso: { type: "puncture", severity: "minor", note: "Open chest wound bubbling with respiration — air moving through the wound ('sucking chest wound')." },
      head: { type: "laceration", severity: "minor", note: "Deep scalp laceration; responds only to pain." },
    },
    progress(pat, dt) {
      // An unsealed open chest wound entrains air; if it is sealed WITHOUT
      // burping/decompression it can tension. Kept simple: open until a seal
      // (ptxFix path) is applied.
      if (pat.ptx === "ptx") pat.shuntFraction = clamp((pat.shuntFraction ?? 0.2) + dt * 0.01, 0.2, 0.45);
      // Hypovolaemic arrest: once output collapses from ongoing hemorrhage, the
      // organized rhythm loses its pulse — PEA. Emergent from blood loss, not
      // scripted to a clock.
      if (pat.co < 0.3 && !["PEA", "asystole", "VF"].includes(pat.rhythm)) {
        pat.rhythm = "PEA";
      }
    },
  },

  // D) 3 yo, submersion/drowning: hypoxic respiratory arrest (PALS). Apnoeic,
  // aspirated (large shunt), progressing hypoxic bradycardia. Effective
  // ventilation/oxygenation is the whole treatment; without it the bradycardia
  // deepens to arrest — the severe-hypoxia bradycardia term in cardiovascular.js
  // makes that emergent.
  pediatricDrowning: {
    initial: {
      age: 3, weight: 15, hr: 150, rr: 4, glu: 108, pain: 1,
      // Was `coreTemp: 34.5` — a key patient.js's constructor has never read
      // (it reads `b.temp`, not `b.coreTemp`; see `this.coreTemp = b.temp ??
      // 37` in patient.js). Silently dropped, so a cold-water submersion
      // patient started at a normal 37C instead of the mild hypothermia the
      // scenario intends — found via the same grep sweep as the
      // initial.brainInjury fix above. Renamed to match every other
      // condition's `temp:` key rather than adding a second constructor
      // alias for the same field.
      shunt: 0.75, tv: 0.12, temp: 34.5,
      // AIRWAY FLUID (queue item 13) — aspirated water sitting in the
      // conducting airway, distinct from the shunt above (alveolar flooding).
      // This is the real, first exercised consumer for pat.airwayFluid: a
      // submersion patient starts with water already in the pharynx/trachea,
      // which is exactly what a suction catheter is for.
      airwayFluid: 0.55,
    },
    progress(pat, dt) {
      // "Ventilated" means somebody is moving air for this patient, or the
      // patient is oxygenating adequately on their own. It previously tested
      // tvDrugOffset, which was set by placing an SGA/ETT — an airway DEVICE,
      // not ventilation, and a distinction that mattered: bagging the patient
      // (which sets assistedVent) did not count, while an unventilated tube did.
      const ventilated = pat.assistedVent != null || (pat.sao2 ?? 0) > 88;
      // Real drowning patients keep bringing water and gastric contents back
      // up (passive regurgitation is common even after the initial rescue),
      // so uncleared airway fluid slowly reaccumulates rather than resolving
      // on its own — suction is the only thing that removes it, and it may
      // need to be repeated. Capped below the initial 0.55 (a submersion this
      // survivable does not go on adding fluid without limit) and unaffected
      // by ventilation success — bagging the patient does not clear an
      // airway suction alone can.
      pat.airwayFluid = Math.min(0.55, (pat.airwayFluid ?? 0.55) + dt * 0.02);
      if (ventilated) {
        // Re-oxygenation: aspirate/atelectasis recruits, drive and rate recover.
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.75) - dt * 0.14, 0.12, 0.9);
        pat.rrBase = clamp((pat.rrBase ?? 4) + dt * 6, 4, 24);
      } else {
        // Progressive submersion hypoxia: worsening shunt, failing drive, and
        // hypoxic myocardial depression. Falling output lowers mixed-venous O2,
        // deepening the desaturation; the pediatric bradycardia term turns that
        // into a slowing rate, and sustained hypoxia ends in asphyxial arrest.
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.75) + dt * 0.05, 0.75, 0.94);
        pat.rrBase = clamp((pat.rrBase ?? 4) - dt * 1.5, 0, 4);
        if ((pat.sao2 ?? 100) < 82) pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - dt * 0.15, 0.12, 1);
        if (pat.co < 0.5 && !["PEA", "asystole", "VF"].includes(pat.rhythm)) pat.rhythm = "PEA";
      }
    },
  },

  // E) Single gunshot wound to the left lower quadrant: NON-COMPRESSIBLE
  // truncal hemorrhage. The external wound barely bleeds — the exsanguination
  // is intra-abdominal, and no tourniquet or wound-packing reaches it. The
  // engine drives hypovolaemic shock and a compensatory tachycardia off the
  // falling volume; the only field levers are permissive hypotension, TXA, and
  // getting to a surgeon. Left long enough, output collapses into a
  // hypovolaemic PEA.
  abdominalGSW: {
    initial: {
      age: 29, weight: 80, hr: 118, sbp: 104, rr: 24, glu: 110, pain: 8, blood: 5.2, bleed: 0.10,
    },
    wounds: {
      torso: { type: "puncture", severity: "severe", note: "Single gunshot wound to the left lower quadrant — only a trickle at the skin, but the abdomen is distending and rigid. The bleeding is inside, where you can't reach it." },
    },
    progress(pat, dt) {
      // Clot disruption / ongoing arterial and venous bleeding: the rate creeps
      // up on its own. Nothing external controls it.
      pat.activeBleedRate = clamp((pat.activeBleedRate ?? 0.10) + dt * 0.004, 0.05, 0.28);
      pat.lactate = (pat.lactate || 1) + dt * 0.03;
      if (pat.co < 0.35 && !["PEA", "asystole", "VF"].includes(pat.rhythm)) pat.rhythm = "PEA";
    },
  },

  // F) Penetrating chest trauma — stab to the left chest producing a tension
  // pneumothorax AND a hemothorax/hemorrhagic shock (the "Melbourne alley"
  // case). The pleural wound tensions quickly if never decompressed; a
  // needle/finger (ptxFix) releases it. Underneath the tension is ongoing
  // intrathoracic hemorrhage the engine turns into shock. Both clocks run at
  // once — decompress the tension AND support the volume, or it arrests.
  stabChestTension: {
    initial: {
      age: 32, weight: 80, hr: 128, sbp: 92, rr: 28, glu: 105, pain: 7,
      blood: 4.9, shunt: 0.2, ptx: "ptx", bleed: 0.06,
    },
    wounds: {
      torso: { type: "puncture", severity: "minor", note: "3 cm stab wound, left 4th intercostal space, mid-clavicular line, bubbling with each breath. Breath sounds absent on the left, hyperresonant to percussion; trachea beginning to shift to the right; neck veins distending." },
    },
    sync(pat) {
      if (pat._stabInit === undefined) { pat._stabInit = true; pat.brainInjury = Math.max(pat.brainInjury || 0, 0.2); }
    },
    progress(pat, dt) {
      // A vented chest seal (queue item 7, chestSealApplied) stops this
      // open wound from ever progressing to tension — see polytraumaFall's
      // own comment for the full reasoning; same mechanism, reused here.
      if (pat.ptx === "ptx" && !pat.chestSealApplied) { pat._tt = (pat._tt || 0) + dt; if (pat._tt > 3) pat.ptx = "tptx"; }
      if (pat.ptx === "tptx") pat.shuntFraction = clamp((pat.shuntFraction ?? 0.2) + dt * 0.02, 0.2, 0.55);
      // Hemothorax under the tension — permissive-hypotension target, TXA, transport.
      pat.activeBleedRate = clamp((pat.activeBleedRate ?? 0.06) + dt * 0.003, 0.04, 0.2);
      if (pat.co < 0.32 && !["PEA", "asystole", "VF"].includes(pat.rhythm)) pat.rhythm = "PEA";
    },
  },

  // ---- Neonatal transition placeholder marker retained below ----
  // A newborn's course is dominated by ONE number: heart rate. Depressed at
  // birth (apnoeic, bradycardic, cyanotic), it comes up fast with effective
  // positive-pressure ventilation and deteriorates to bradycardic arrest
  // without it — exactly the NRP logic (HR<100 -> PPV, HR<60 -> compressions).
  // vigour (pat._neo.vigor) is the latent transition state; the CV/resp engine
  // renders it into HR, SpO2 and the rest.
  neonatalTransition: {
    initial: { hr: 70, rr: 10, shunt: 0.55, tv: 0.22, pain: 0, glu: 70 },
    progress(pat, dt, s) {
      const neo = pat._neo || (pat._neo = { vigor: 0.45, stimulated: false });
      // reserve = the newborn's intrinsic capacity to complete transition on its
      // own. Set once at birth from its starting vigour. A vigorous newborn
      // (reserve >= ~0.5) pinks up with just warming/drying; a depressed one
      // (asphyxiated, reserve low) will deteriorate to bradycardic arrest unless
      // effective PPV is delivered.
      if (neo.reserve == null) neo.reserve = neo.vigor;
      // Interventions are persistent flags set ON THE NEWBORN by the delivery
      // scenario's actions (below). s.doses is now scoped per roster patient
      // (physiology.js's giveDose/pk.js's dosesFor), so a generic PROCS dose
      // given while the newborn is active would no longer leak onto the
      // mother either way — but NRP resuscitation isn't a PK/fx effect, it's
      // a discrete vigour state machine, so it stays as bespoke flags rather
      // than routing through the drug engine. The newborn re-oxygenates
      // through the vigour->shunt path, so no tvDrugOffset plumbing is needed.
      const ppv = !!neo.ppv;                            // BVM / T-piece PPV
      const chestComp = !!neo.compressions || !!(s && s.neoCompressions);
      const stim = !!neo.stimulated;

      const TRANSITION = 0.5;   // vigour needed to self-sustain without PPV
      let target;
      if (ppv) {
        // Queue item 65: PPV alone rescues almost every newborn (real NRP
        // teaching — over 98% of depressed newborns respond to effective
        // ventilation without ever needing drugs), which is why `target`
        // reaching 1 the instant chestComp is true was correct for every
        // newborn this engine had ever spawned (reserve floor 0.1,
        // obstetric.js's own apgarSeed clamp). But a newborn born with a
        // genuinely CRITICAL reserve (severe, prolonged intrapartum
        // asphyxia) is real NRP's actual epinephrine indication: chest
        // compressions restore SOME coronary perfusion, but adequate
        // coronary perfusion pressure to fully recover cardiac function
        // needs epinephrine's alpha-adrenergic vasoconstriction on top of
        // it (the same "compressions alone often aren't enough, epi
        // completes the job" teaching point adult ACLS uses for refractory
        // arrest). Below that reserve floor, compressions alone plateau the
        // newborn at a still-bradycardic, inadequate rate; a real,
        // weight-scaled epi dose (see App.jsx's `t.neoAction==="epi"`) is
        // what completes the rescue.
        const CRITICAL_RESERVE = 0.2;
        target = chestComp
          ? ((neo.reserve < CRITICAL_RESERVE && !neo.epi) ? 0.55 : 1)
          : 0.95;                                       // effective PPV rescues any newborn
      } else {
        const base = neo.reserve + (stim ? 0.12 : 0);  // drying/stimulation nudges the borderline
        target = base >= TRANSITION ? base : 0;        // below threshold, no PPV -> arrest
      }
      const k = Math.min(1, dt * 1.4);
      neo.vigor = clamp(neo.vigor + (target - neo.vigor) * k, 0, 1);
      const v = neo.vigor;
      pat.hrBase = 25 + v * 135;                          // ~25 (arrest) .. 160 (vigorous)
      pat.shuntFraction = clamp(0.72 * (1 - v), 0, 0.72); // deep central cyanosis clears as it pinks up
      pat.rrBase = v < 0.3 ? 5 : 8 + v * 42;              // agonal/minimal when severely depressed
      neo.hr = pat.hrBase;
    },
  },

  // ===== PREECLAMPSIA WITH SEVERE FEATURES =====
  //
  // PATHOPHYSIOLOGY, written down before the code (queue item 1, step a).
  // The primary lesion is PLACENTAL, and everything the mother shows is
  // downstream of it. Trophoblast fails to remodel the maternal spiral
  // arteries into the low-resistance vessels a term placenta needs, the
  // placenta is chronically underperfused, and it sheds antiangiogenic factors
  // (soluble fms-like tyrosine kinase-1 and soluble endoglin) that scavenge
  // VEGF and placental growth factor. Those are SURVIVAL factors for
  // endothelium. Strip them and the maternal endothelium — every vessel, not
  // just the uterine ones — becomes dysfunctional. That single lesion explains
  // the whole syndrome, and it is why preeclampsia is a multi-organ disease
  // whose only cure is delivery of the placenta:
  //
  //   VASCULAR  The normal 25-30% fall in systemic vascular resistance does not
  //             happen, and vasoconstriction is superimposed on top of it. SVR
  //             in severe preeclampsia is typically 1500-2000 dyn.s.cm-5,
  //             against ~800-1000 in normal term pregnancy. Cardiac output is
  //             normal or LOW. This is the diagnostic contrast with normal
  //             pregnancy, which is a high-output, low-resistance state — the
  //             two have opposite hemodynamic signatures and the pressure is
  //             the visible consequence, not the disease.
  //   BARRIER   Endothelial injury raises capillary permeability. Combined with
  //             the hypoalbuminemia of proteinuria, plasma is filtered into the
  //             interstitium: plasma volume is CONTRACTED (classically ~9% below
  //             even NON-pregnant values, against the +40-50% of normal
  //             pregnancy), the hematocrit rises, and the patient is
  //             simultaneously grossly edematous. She is intravascularly dry
  //             and waterlogged at the same time, which is exactly why filling
  //             her with crystalloid produces pulmonary edema instead of
  //             pressure.
  //   RENAL     Glomerular endotheliosis: swollen endothelial cells occlude the
  //             capillary lumen. GFR falls (in a woman whose pregnant baseline
  //             was 50% ABOVE normal, so a "normal" creatinine is already
  //             abnormal), protein is lost, urine output falls.
  //   HEPATIC   Periportal necrosis and sinusoidal fibrin deposition — the RUQ
  //             pain, the transaminitis, and at the extreme the subcapsular
  //             hematoma.
  //   HEME      Microangiopathic process consumes platelets. Under 100 x10^9/L
  //             is a severe feature; with hemolysis and raised transaminases it
  //             is HELLP.
  //   CEREBRAL  Above the upper limit of cerebral autoregulation the pressure is
  //             transmitted to the capillary bed: hyperperfusion, vasogenic
  //             edema (the imaging picture of PRES), headache, visual
  //             disturbance, and finally the eclamptic seizure. The engine's
  //             seizure limb already encodes this conjunction (pregnancy AND
  //             SBP >= 160, neuro.js) and until now had no writer.
  //
  // TIME COURSE (step d). Preeclampsia develops over weeks, so what a crew
  // meets is an ALREADY-ESTABLISHED state, not a step function starting at
  // t=0. What moves within a prehospital contact is the severity ramp: this is
  // the woman who is 150/95 with a headache on arrival and 170/115 and seizing
  // twenty minutes later. So the condition initialises at an established
  // moderate state and ramps toward severe over PE_ESCALATION minutes. The
  // decompensation point — the moment she crosses into the severe range and the
  // seizure limb arms — is the thing the candidate is being taught to see
  // coming, so it must happen ON THE CALL and not before it.
  //
  // WHAT THIS CONDITION DELIBERATELY DOES NOT DO (step c). It writes no sbp, no
  // hr, no sao2, no edema and no seizure flag. It sets resting vascular tone,
  // barrier integrity, circulating protein, platelet count and organ injury,
  // and the closed loop produces the blood pressure, the hemoconcentration,
  // the edema and the seizure. If a number below is removed, the corresponding
  // sign disappears — which is the test that it is a mechanism and not a
  // costume.
  //
  // PROTEINURIA IS NOT MODELED AS A FLUX, ON PURPOSE. Nephrotic-range loss in
  // severe preeclampsia is ~3-5 g/day; over a 40-minute contact that is ~0.1 g
  // out of an intravascular albumin pool of ~270 g. A dynamic urinary-loss term
  // would therefore be INERT at prehospital timescales — the exact defect class
  // section 1 of the handoff warns about. The consequence that matters acutely
  // is the hypoalbuminemia proteinuria has ALREADY produced over weeks, so
  // that is set as an established initial condition on ivAlbuminMass, where
  // updateFluidShifts genuinely reads it.
  preeclampsia: {
    initial: {
      age: 32, weight: 88, height: 165,
      // Symptom burden a crew can actually elicit: frontal headache, RUQ pain.
      pain: 5, glu: 98,
    },
    progress(pat, dt, s) {
      // Gestation 34 weeks: preeclampsia with severe features is a late-preterm
      // disease, and 34 weeks is also the threshold at which delivery stops
      // being deferrable, which is the transport decision this scenario exists
      // to teach.
      const preg = establishPregnancy(pat, {
        gestation: pat._gestationWeeks ?? 34,
        laborProgress: 0, contractionRate: 0,
      });
      preg.tilted = !(s && s.supine === true);
      // The normal pregnancy adaptation must land FIRST — it is what captures
      // preg._pre and sets the normal-pregnancy baseSVR this condition then
      // overrides. updateObstetric applies it on the tick after the pregnancy
      // is established, so until then there is nothing to modify.
      if (!preg._adapted) return;
      const pre = preg._pre || {};

      // --- SEVERITY RAMP ---
      // Starts at PE_SEV0 (established moderate-severe disease on arrival) and
      // climbs to 1 over PE_ESCALATION minutes untreated.
      const PE_SEV0 = 0.55;
      const PE_ESCALATION = 22;
      pat._peSev = clamp((pat._peSev ?? PE_SEV0) + dt * (1 - PE_SEV0) / PE_ESCALATION, 0, 1);
      const sev = pat._peSev;

      // --- AFTERLOAD: the vasodilation that never happened, plus constriction.
      // establishPregnancy sets baseSVR = pre * (1 - 0.27g); at 34 weeks
      // g = 1.0, so normal pregnancy sits at 0.73x the woman's pre-pregnancy
      // resting tone. PE_SVR_MAX is the multiple of PRE-PREGNANCY tone at full
      // severity, identified against the documented SVR of severe preeclampsia
      // rather than against a target blood pressure (the pressure is an output).
      // IDENTIFIED AGAINST SVR, NOT AGAINST BLOOD PRESSURE. Measured on this
      // patient at 40 minutes, full severity:
      //     0.73x (normal pregnancy) ... SVR  901, CO 5.74, SBP 119/62
      //     1.55x ...................... SVR 1519, CO 6.14, SBP 166/123
      //     1.85x ...................... SVR 1874, CO 4.60, SBP 149/116
      // 1.85 is the value that lands inside the documented 1500-2000 with a
      // cardiac output inside the documented 4.5-6.5. The 1.55 arm was rejected
      // even though it produced a more convincing-looking blood pressure,
      // because it did so at CO 6.14 — a hyperdynamic circulation, which is the
      // hemodynamic signature of NORMAL pregnancy and the opposite of this
      // disease. Fitting to the pressure would have reproduced the number a
      // candidate reads off the cuff while getting the physiology behind it
      // backwards, which is precisely the failure mode that makes a treatment
      // response nonsense later.
      const PE_SVR_MAX = 1.85;
      const NORMAL_PREG = 0.73;
      const preSvr = pre.baseSVR ?? pat.ageProfile.baseSVR();
      pat.baseSVR = preSvr * (NORMAL_PREG + (PE_SVR_MAX - NORMAL_PREG) * sev);

      // --- VENOCONSTRICTION: TRIED, MEASURED, REJECTED ---
      // The obvious next limb is that the venous bed is not spared either —
      // normal pregnancy expands capacitance by 1 + 0.42g, and a preeclamptic
      // woman does not get that expansion, which looks like half the reason she
      // is volume-contracted. Implemented as
      //     pat.venousCapacitanceFactor = 1 + 0.42 * (1 - 0.55 * sev);
      // it raised systolic pressure usefully (151 -> 169) and armed the seizure
      // limb — and it bought both by RAISING PRELOAD, driving cardiac output to
      // 7.26 L/min. That is the wrong route to the right number: preeclamptic
      // filling pressures are normal-to-low, and the disease's whole
      // hemodynamic identity is high resistance with output that does not rise.
      // Left out rather than kept for the pressure it produced.

      // --- ARTERIAL STIFFENING ---
      // The pressure the venous limb was reaching for comes from HERE instead,
      // and it is a separate documented lesion rather than a second guess at the
      // same one. Preeclampsia raises pulse wave velocity and augmentation index
      // and reduces total arterial compliance by roughly 30-40% against normal
      // pregnancy; 0.35 at full severity is the middle of that range.
      //
      // Resistance sets MEAN pressure, compliance sets PULSE pressure, and the
      // condition could not touch the second until arterialComplianceFactor
      // existed (cardiovascular.js). Without it the afterload-only version gave
      // 149/116 — a pulse pressure of 33 in a woman documented at 160-170 over
      // 110. Mean pressure and stroke volume were already right; the narrow
      // pulse pressure was the whole residue, and it was a missing mechanism
      // rather than a coefficient that needed moving.
      pat.arterialComplianceFactor = Math.min(pat.arterialComplianceFactor ?? 1,
        1 - 0.35 * sev);

      // --- ENDOTHELIAL BARRIER ---
      // Drives sigma 0.9 -> 0.70 and Kf 1.0x -> 1.9x at full severity through
      // updateFluidShifts (metabolic.js). Not maximal: preeclampsia is a
      // smoldering endotheliopathy, not the fulminant barrier failure of
      // septic shock or a major burn, and the leak handle is scaled 0-1 across
      // that whole range.
      pat.capillaryLeak = Math.max(pat.capillaryLeak ?? 0, 0.30 * sev);

      // --- HYPOALBUMINEMIA (established, see the note above) ---
      // Serum total protein in severe preeclampsia runs roughly 25% below the
      // normal-pregnancy value. Set as a CEILING re-asserted each tick rather
      // than a one-shot write, because the Starling and lymphatic terms move
      // albumin mass every tick and a single initial write would be washed out
      // within minutes — the same reason chronicKidneyDisease re-asserts its
      // kidneyInjury floor.
      const albCeil = pat.plasmaVol * 70 * (1 - 0.25 * sev);
      if (pat.ivAlbuminMass > albCeil) pat.ivAlbuminMass = albCeil;

      // --- RENAL: glomerular endotheliosis ---
      // renal.js computes injuryFactor = 1 - kidneyInjury*2, so 0.16 at full
      // severity gives 0.68 of filtration — a ~30% GFR reduction, which against
      // a pregnant baseline that is itself elevated is the modest creatinine
      // rise (>1.1 mg/dL) that counts as a severe feature. Re-asserted as a
      // FLOOR because neuro.js decays kidneyInjury by 0.005/min whenever oxygen
      // debt is low, and this patient is not hypoxic — a one-shot write would
      // be gone inside 30 minutes.
      pat.kidneyInjury = Math.max(pat.kidneyInjury ?? 0, 0.16 * sev);

      // --- HEPATIC: periportal necrosis ---
      // Read by pk.js (hepatic drug clearance falls) and by mortality.js's
      // multi-organ term. Same decay problem, same floor treatment.
      pat.liverInjury = Math.max(pat.liverInjury ?? 0, 0.22 * sev);

      // --- HAEMATOLOGIC: microangiopathic platelet consumption ---
      // A ceiling, not a write: coagulation.js pulls plateletCount back toward
      // 250 every tick, so the consumption has to be re-imposed against that
      // recovery. 250 -> 95 x10^9/L at full severity, just inside the <100
      // severe-feature threshold. plateletCount is read by the thrombin
      // calculation in coagulation.js, so this is a real coagulopathy: she
      // clots badly if she bleeds, which is the reason this patient's
      // hemorrhage risk at delivery is not the same as a healthy mother's.
      // MEASURED ENDPOINT — and where this patient sits relative to eclampsia.
      // At full severity the closed loop settles at 158/111, CO 4.72 L/min,
      // SVR 1872, Hct 40.3, platelets 95, GFR 92 -> 72. Those are the numbers
      // the coefficients above were identified against.
      //
      // She does NOT seize, and that is an emergent result rather than a choice.
      // neuro.js sustains activity at drive >= 0.15, which on the diastolic limb
      // needs 113.75 and on the systolic limb 166. She arrives within about 3
      // mmHg diastolic of sustained eclampsia and stays there. Two things follow
      // and both are worth keeping:
      //   - It is the right base rate. Eclampsia complicates on the order of 1%
      //     of preeclampsia; a condition that reliably convulsed would teach a
      //     frequency that does not exist.
      //   - The limb is nonetheless LIVE from here, which is the whole point of
      //     queue item 5. She is on the edge of the cliff rather than far from
      //     it, so a few more mmHg of severity reaches it.
      // If a future batch wants a scenario that does convulse, raise the
      // severity endpoint deliberately and say so — do not reach it by nudging
      // PE_SVR_MAX, which is pinned to the documented SVR range and would take
      // the hemodynamics out of band to buy the seizure.
      const pltCeil = 250 - 155 * sev;
      if (pat.plateletCount > pltCeil) pat.plateletCount = pltCeil;
    },
  },

  // ===== UTERINE ATONY / POSTPARTUM HEMORRHAGE =====
  // Physiology queue item 9. Uterine atony — failure of the myometrium to
  // contract adequately after delivery — is the leading cause of postpartum
  // hemorrhage (~70-80% of PPH, ACOG Practice Bulletin 183). This condition
  // adds NO new delivery mechanics of its own: establishPregnancy/
  // updateObstetric already own labor progression, the delivery event, the
  // autotransfusion and the newborn spawn (the same machinery
  // healthyPregnancy/traumaPregnant use). Its only job is to parameterize
  // preg.atonyFactor, which updatePostpartumHemostasis (obstetric.js) reads
  // to cap how far uterineTone can rise unassisted — see that file for the
  // full mechanism and for how oxytocin/fundal massage (pat.uterotonicDrive)
  // raise the ceiling back toward normal.
  //
  // Risk factors are narrated rather than separately modeled (grand
  // multiparity, a prolonged first stage, a macrosomic infant — all real,
  // documented atony risk factors) and collapsed onto the single
  // atonyFactor severity axis, the same way coronaryArteryDisease collapses
  // "smoker, diabetic, hypertensive" onto one starting coronaryStenosis: the
  // clinical content this scenario teaches is recognizing and treating
  // atony, not differentiating which risk factor caused it.
  //
  // MEASURED at atonyFactor 0.8, real scenario (pph/OBGY-043), 20-minute
  // runs: UNTREATED, uterineTone climbs only to 0.31 (vs. essentially 1.0
  // for a normal involution) because both its ceiling (0.4) and its time
  // constant (~13.6 min, see obstetric.js) are degraded — bleed rate stays
  // near 0.069-0.097 L/min throughout (vs. a normal delivery's ~0.4 L total,
  // self-limited within minutes), totalBloodVol falls from the postpartum-
  // autotransfused peak (~7.4 L) to 5.95 L and MAP from 93 to 80 by 20
  // minutes — a real, teachable hypovolaemic trend, not a scripted death.
  // TREATED (one dose at t=60s, read at 20 min): fundal massage alone ->
  // tone 0.62 (a real, partial response — matches the taught escalation of
  // "massage first, add a uterotonic if that alone does not control it");
  // oxytocin alone -> 0.88 (the definitive pharmacologic treatment, near-
  // normal); both together -> 0.99 (essentially full recovery) — genuine
  // combination therapy, not two redundant buttons for the same effect.
  uterineAtony: {
    initial: { age: 34, weight: 82, pain: 4, glu: 100 },
    progress(pat, dt, s) {
      const preg = establishPregnancy(pat, {
        gestation: 39,
        // Precipitous — the crew arrives as delivery is completing (a
        // grand-multip's labor is often fast), so the full postpartum
        // course, including the failure of tone to develop, plays out
        // DURING the call rather than off-screen before contact — the same
        // reasoning traumaPregnant's own comment gives for its own labor
        // values, just further along since this call's teaching point is
        // postpartum management, not catching the delivery itself.
        laborProgress: 0.97, contractionRate: 0.5,
        atonyFactor: 0.8,
      });
      preg.tilted = !(s && s.supine === true);
    },
  },

  // Sickle cell disease — vaso-occlusive crisis (queue item 22). The single
  // most common SCD emergency, and the presentation is almost entirely pain:
  // deoxygenated HbS polymerizes, sickled cells occlude the microvasculature,
  // and the resulting local ischemia/hypoxia/acidosis PROMOTES FURTHER
  // SICKLING — a real, well-documented positive-feedback loop (the "vicious
  // cycle" of VOC, Ballas & Mohandas 2004). That loop is why hypoxia,
  // dehydration, cold and acidosis are the textbook crisis triggers/
  // perpetuators, and why field treatment (oxygen, IV fluids, analgesia) is
  // supportive rather than curative: there is no field intervention that
  // reverses sickling directly, only ones that remove what is driving it.
  //
  // Two real mechanisms, both composed from EXISTING handles rather than
  // invented ones:
  //   1. Chronic hemolytic anemia. Steady-state SCD Hct runs ~20-30% (vs a
  //      normal 45%) — 0.25 is mid-range. Chronic anemia is compensated by
  //      PLASMA volume expansion, not a reduced total blood volume, so only
  //      rbcVol/rbcMass move at construction; the difference is credited to
  //      plasmaVol, leaving totalBloodVol (and resting preload/MAP) normal —
  //      the same isovolemic-anemia pattern chronicKidneyDisease's own anemia
  //      limb assumes elsewhere in this file.
  //   2. Acute chest syndrome as the emergent form of the feedback loop's
  //      respiratory consequence — SCD's leading cause of mortality, and the
  //      complication that actually kills if the cycle isn't interrupted.
  //      Reuses pat.shuntFraction, the SAME hypoxia/shunt machinery pneumonia
  //      and asthma already exercise, rather than a new observable: once
  //      SpO2 falls below 92% on room air (a real, clinically meaningful
  //      hypoxemia threshold, not the presenting baseline — initial shunt is
  //      only 0.1, a mild baseline V/Q mismatch real SCD patients carry from
  //      chronic pulmonary vascular changes), pulmonary microvascular
  //      sickling accelerates and shuntFraction climbs — supplemental oxygen
  //      breaks the cycle by removing the trigger, not by "treating ACS"
  //      directly, which is the actual teaching point.
  // Pain itself is queue item 20's pat.intrinsicPain — a real, persistent,
  // opioid-responsive baseline, exactly what this condition needs and did
  // not have to invent.
  sickleCellCrisis: {
    initial: { age: 22, weight: 68, hr: 112, sbp: 122, rr: 20, glu: 100,
      pain: 8, shunt: 0.1, temp: 37.9 },
    progress(pat, dt) {
      // Chronic hemolytic anemia, seeded once from whatever hct the Patient
      // constructor already gave this patient (age/weight-scaled), not a
      // hardcoded volume — so the same condition composes correctly across
      // different body sizes.
      if (!pat._sickleInit) {
        pat._sickleInit = true;
        const targetHct = 0.25;
        const rbcTarget = pat.totalBloodVol * targetHct;
        const delta = pat.rbcVol - rbcTarget;
        if (delta > 0) {
          pat.rbcVol -= delta;
          pat.plasmaVol += delta;
          pat.rbcMass = pat.rbcVol * NORMAL_HB * 10 / HCT_NORMAL;
        }
      }
      // Untreated VOC pain crescendos over hours, not minutes — a slow drift
      // captures that without pretending analgesia is optional; opioids are
      // the actual mechanism that controls it (fx.pain, already wired).
      pat.intrinsicPain = clamp((pat.intrinsicPain ?? 8) + dt * 0.01, 0, 10);
      pat.hrBase = clamp(pat.hrBase + dt * 0.15, 90, 140);
      pat.coreTemp = clamp((pat.coreTemp ?? 37.9) + dt * 0.005, 37, 39.5);
      // ACUTE CHEST SYNDROME — see header comment. Gated on actual measured
      // hypoxemia (this tick's sao2), not on a timer, so it only engages if
      // the patient is genuinely desaturating — the emergent, not scripted,
      // standard this file holds every condition to.
      if ((pat.sao2 ?? 97) < 92) {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.1) + dt * 0.015, 0.1, 0.65);
      } else if ((pat.shuntFraction ?? 0.1) > 0.1) {
        pat.shuntFraction = clamp(pat.shuntFraction - dt * 0.005, 0.1, 0.65);
      }
    },
  },

  // Heat stroke (queue item 26) — needed by the Zero-To-Hero campaign's
  // prologue Scene 4 (design doc S2.5), whose own placeholder tutorial sim
  // was explicitly built and left waiting on this condition (see the F27
  // batch's write-up). Real pathophysiology, not a scripted curve: heat
  // stroke is thermoregulatory FAILURE, not merely heat exposure — the
  // clinical discriminator from heat exhaustion is hot, DRY skin (sweating
  // has stopped), not "very sweaty." Modeled as a genuine positive-feedback
  // collapse of thermo.js's own sweat mechanism (queue item 26's thermo.js
  // changes): as core temperature climbs, pat.sweatCapacity is driven toward
  // 0 (thermoregulatory failure), which removes the patient's OWN
  // evaporative cooling and lets core temperature climb further still — the
  // same "vicious cycle" shape sickleCellCrisis's hypoxia/sickling loop
  // uses, here for heat. A young, previously healthy patient in direct sun
  // (high solarRadiantW, the exertional-heat-stroke picture) with the
  // ambient air itself already hot (ambientTemp) is set up so thermo.js's
  // own heat balance — not a scripted ramp — decides how fast this
  // collapses, and so that "move to shade" (thermo.js's inShade flag) and
  // active cooling (externalCoolingW) are genuine, bounded, MEASURABLE
  // levers rather than a flat rescue.
  //
  // Hyperthermic encephalopathy is real, sustained cellular injury (protein
  // denaturation, direct cytotoxicity) — NOT the reversible functional
  // dysfunction hypertensiveEmergency's own comment explicitly declined to
  // model through pat.brainInjury (a structural, permanent-injury
  // accumulator). Heat stroke genuinely can and does leave permanent injury,
  // so using that same accumulator here is correct, not a shortcut. A
  // hyperthermic seizure-drive limb was added to neuro.js's existing
  // seizureDrive computation (composing by MAX with the metabolic/eclamptic
  // limbs already there, per that file's own comments) rather than invented
  // here, since seizures are a real, common heat-stroke feature this engine
  // had no way to produce before.
  heatStroke: {
    initial: { age: 20, weight: 72, hr: 132, sbp: 104, rr: 28, glu: 100, pain: 1,
      temp: 40.0, ambientTemp: 40, solarRadiantW: 250, sweatCapacity: 0.3 },
    progress(pat, dt) {
      // THERMOREGULATORY FAILURE — the actual disease mechanism, not
      // exposure alone (a healthy patient in the same heat with intact
      // thermoregulation is heat EXHAUSTION, not heat stroke). Failure
      // accelerates once core temperature crosses 40 C (the accepted
      // heat-stroke threshold) and is itself worsened by the further
      // temperature rise it causes — the positive-feedback collapse this
      // condition exists to demonstrate. Seeded at 0.3 (already
      // substantially failed, not fully) rather than 1, because this
      // condition represents a patient who HAS heat stroke at presentation,
      // not one only just crossing into it.
      if (pat.coreTemp > 40) {
        pat.sweatCapacity = clamp((pat.sweatCapacity ?? 0.3) - dt * 0.04 * (pat.coreTemp - 40), 0, 1);
      }
      // Peripheral vasodilation: the body's OTHER cooling mechanism
      // (shunting blood to the skin to radiate heat) is not free — it drops
      // resistance and, combined with sweat losses already sustained before
      // failure set in, erodes pressure while raising the compensatory heart
      // rate. Reuses the same distributive-vasodilation handle
      // appendicitis/pneumoniaSepsis already use for their own inflammatory
      // vasodilation, at a hyperthermia-scaled rate — no new observable.
      if (pat.coreTemp > 39) {
        pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.01 * (pat.coreTemp - 39), 0, 0.5);
        pat.hrBase = clamp(pat.hrBase + dt * 0.6, 100, 180);
      }
      // Direct thermal cellular injury. 41 C is the documented onset of
      // measurable heat-related cellular injury; the rate reaches its
      // fastest at 42 C, the engine's own hard coreTemp clamp, so untreated
      // injury accrues across a realistic call length without being
      // instantaneous.
      if (pat.coreTemp > 41) {
        pat.brainInjury = clamp((pat.brainInjury || 0) + dt * 0.015 * (pat.coreTemp - 41), 0, 1);
      }
    },
  },

  // ===== ACCIDENTAL HYPOTHERMIA =====
  // Queue item 7's own suggested batch text: "hypothermia with its
  // arrhythmia and coagulopathy limbs." Real pathophysiology (Wilderness
  // Medical Society staging, the framework this project's own hypothermia
  // comments already cite once for the shiver-cutoff fix above): mild
  // (32-35 C) shivering, tachycardia-then-normalizing HR, mild confusion;
  // moderate (28-32 C) shivering STOPS (thermo.js's own compensation term
  // is now gated off below 32, see that file's comment), progressive
  // bradycardia, decreasing LOC, real coagulopathy; severe (<28 C) high
  // VF/asystole risk, Osborn waves, a presentation that can mimic death
  // (fixed, dilated pupils; unrecordable pulse/BP) — "not dead until warm
  // and dead."
  //
  // A diff against what already existed before this condition, confirmed by
  // reading each module directly (not assumed): bradycardia
  // (cardiovascular.js, coreTemp<35), myocardial contractility depression
  // (coreTemp<33), and temperature-dependent coagulopathy (coagulation.js's
  // tempEff, exponential below 35 C) were ALL already real, generic
  // mechanisms with no condition ever driving coreTemp low enough, for long
  // enough, to exercise them — this condition is what finally does. Missing
  // and built alongside this condition: a cold-myocardium VF/arrhythmia
  // substrate (a.hypothermic, cardiovascular.js, composing into the SAME
  // shared rhythmInstability/vtDrive pathway hyperkalemia/torsades/AMI
  // already use, not a parallel mechanic) and an Osborn/J-wave ECG finding
  // (ecg.js/patient.js's ecgDesc — below 32 C).
  //
  // Time course: presents already environmentally hypothermic — an EMS
  // scene is reached tens of minutes to hours after exposure begins, not at
  // its onset, so seeding coreTemp directly at a real, moderate-severe
  // starting point (per the heatStroke/myxedemaComa precedent for this
  // exact idiom, both immediately above/below this entry) is the honest
  // presentation, not a shortcut. What happens FROM THERE is not scripted:
  // ambientTemp is set cold enough (a winter exposure, no shelter) that
  // thermo.js's own heat-balance equation — now correctly gated so
  // shivering can't compensate below 32 C — continues driving coreTemp down
  // for as long as the patient is left in that environment, and active
  // rewarming (the existing `warm` procedure/warmingPower mechanism, added
  // for exactly this — see its own comment in procedures.js) genuinely
  // reverses it at the documented ~1 C/hr rate. No clothing/
  // wetness modifier exists in thermo.js (grep-confirmed) — not invented
  // here; ambientTemp alone stands in for the whole exposure severity,
  // consistent with how heatStroke's own solarRadiantW/ambientTemp already
  // approximate a real environment without a separate insulation model.
  accidentalHypothermia: {
    initial: { age: 58, weight: 78, rr: 8, glu: 90, pain: 0,
      temp: 29.0, ambientTemp: -8 },
    progress(pat) {
      // Consciousness tracks CURRENT coreTemp directly (not a ratchet) —
      // real hypothermic encephalopathy is a functional, reversible
      // depression of cerebral metabolism, not structural injury, so it
      // should genuinely improve as active rewarming raises coreTemp back
      // up, the same way this condition's own bradycardia/coagulopathy/
      // arrhythmia-risk limbs are all live consequences of the CURRENT
      // temperature rather than a one-time floor. Thresholds follow WMS
      // staging: mild (>=32) largely intact mentation, moderate (28-32)
      // measurable stupor, severe (<28) coma-range — reusing the same
      // general confusion/coma handle toxicMetabolicEncephalopathy/
      // hypercalcemia/hyperammonemia already use (neuro.js's `>0.5`
      // "confused" threshold), not a parallel consciousness mechanism.
      const t = pat.coreTemp;
      pat.metabolicEncephalopathy = t >= 32 ? 0.2 : t >= 28 ? 0.6 : 0.9;
    },
  },

  // Primary spontaneous pneumothorax (queue item 7, Respiratory) — the
  // classic young, tall, thin patient, sudden pleuritic chest pain with NO
  // trauma mechanism, from a ruptured apical bleb. Reuses the SAME pat.ptx
  // mechanism the trauma conditions already established (cardiovascular.js's
  // itp term, respiratory.js's shunt contribution) rather than inventing a
  // parallel one — the physiology of air in the pleural space is identical
  // regardless of cause. Deliberately has NO wound (there is no external
  // opening — it is closed/spontaneous), so a chest seal is not applicable
  // and does not appear as a treatment option; only needle decompression
  // (ptxFix) relieves it, the real clinical distinction from an open wound.
  // Tensions more slowly than a traumatic sucking chest wound (a longer time
  // constant here, ~8 min vs. ~2.5-3 min) — most simple spontaneous
  // pneumothoraces do not progress to tension quickly, though a minority do.
  spontaneousPneumothorax: {
    initial: { age: 22, weight: 68, hr: 106, sbp: 122, rr: 22, glu: 100, pain: 5,
      shunt: 0.15, ptx: "ptx" },
    progress(pat, dt) {
      if (pat.ptx === "ptx") {
        pat._psTensionTime = (pat._psTensionTime || 0) + dt;
        if (pat._psTensionTime > 8) pat.ptx = "tptx";
      }
      if (pat.ptx === "tptx") pat.shuntFraction = clamp((pat.shuntFraction ?? 0.15) + dt * 0.02, 0.15, 0.55);
    },
  },

  // Open ("sucking") pneumothorax as its OWN presentation, distinct from the
  // polytrauma conditions that already carry one as a secondary injury — a
  // single isolated stab wound with nothing else going on, so the real
  // teaching point (recognize it, apply a VENTED seal, watch for tension)
  // isn't buried under femur fractures and TBI. Same tension-progression
  // shape stabChestTension already uses (~3 min, faster than the closed
  // spontaneous case above, since an open communicating wound is the more
  // classically taught rapid-tensioning mechanism) — now genuinely
  // interruptible by chestSealApplied, the real fix this session made to
  // the chest seal procedure.
  openPneumothorax: {
    initial: { age: 27, weight: 76, hr: 116, sbp: 106, rr: 24, glu: 100, pain: 6,
      shunt: 0.18, ptx: "ptx" },
    wounds: {
      torso: { type: "puncture", severity: "minor", note: "3 cm stab wound to the left chest, audibly sucking air with each breath." },
    },
    progress(pat, dt) {
      if (pat.ptx === "ptx" && !pat.chestSealApplied) {
        pat._opTensionTime = (pat._opTensionTime || 0) + dt;
        if (pat._opTensionTime > 3) pat.ptx = "tptx";
      }
      if (pat.ptx === "tptx") pat.shuntFraction = clamp((pat.shuntFraction ?? 0.18) + dt * 0.02, 0.18, 0.55);
    },
  },

  // Hemothorax (queue item 7, Respiratory) — blood, not air, in the pleural
  // space. Two DISTINCT consequences, modeled through two DIFFERENT existing
  // handles rather than reusing pat.ptx's tension-physiology machinery for
  // both: (1) ongoing intrathoracic hemorrhage is real blood LOSS from the
  // body (pat.activeBleedRate — hemorrhagic shock is what actually kills a
  // hemothorax patient, not tension physiology), and (2) the accumulating
  // blood mechanically compresses the lung from outside
  // (pat.pleuralEffusion — respiratory.js's restrictive/shunt handle, shared
  // with the pleuralEffusion condition below, since the lung does not care
  // whether the fluid compressing it is blood or transudate). pat.ptx is set
  // to a THIRD state, "hemo" — deliberately NOT "ptx"/"tptx" — because a
  // real, clinically important limitation follows from it: needle
  // decompression (ptxFix) targets trapped AIR and does nothing for blood,
  // while only a chest tube (drainsChest, this session's fix) actually
  // drains it. That distinction was previously impossible to express at all
  // (needleD and chestTube shared the identical ptxFix flag).
  hemothorax: {
    // bleed (0.08) + the wound's own "minor" puncture contribution (0.08,
    // wounds.js) construct to 0.16 — chosen so the clamp band below actually
    // contains the CONSTRUCTED starting value. An earlier version declared
    // bleed:0.05 with a "severe" wound (0.25), which construct to 0.30 —
    // above the clamp's own 0.16 ceiling, so the very first progress() tick
    // silently clamped the rate DOWN to 0.16 instead of letting it rise,
    // the opposite of the intended "worsens untreated" trajectory. Found by
    // mechanismWiring.mjs, not assumed correct.
    initial: { age: 34, weight: 80, hr: 122, sbp: 90, rr: 26, glu: 100, pain: 6,
      blood: 5.2, bleed: 0.08, ptx: "hemo", pleuralEffusion: 0.15 },
    wounds: {
      torso: { type: "puncture", severity: "minor", note: "Penetrating wound to the right posterior chest, decreased breath sounds on that side, dull (not hyperresonant) to percussion." },
    },
    progress(pat, dt) {
      // Both consequences freeze once drained (pat.ptx no longer "hemo") —
      // a chest tube keeps pace with ongoing losses in the pleural space
      // itself, per pk.js's drainsChest handling; it does not stop the
      // hemorrhage at its source, which is why activeBleedRate is left at
      // whatever level it reached rather than zeroed (only a hemostatic
      // agent or surgery actually controls the bleeding).
      if (pat.ptx === "hemo") {
        pat.activeBleedRate = clamp((pat.activeBleedRate ?? 0.16) + dt * 0.004, 0.14, 0.30);
        pat.pleuralEffusion = clamp((pat.pleuralEffusion ?? 0.15) + dt * 0.01, 0.15, 0.7);
      }
    },
  },

  // Large pleural effusion (queue item 7, Respiratory) — a slow, chronic
  // process (malignant effusion, reaccumulating despite prior drainage, is
  // the presenting history), NOT a traumatic or acute event: gradual
  // restrictive dyspnea over days, not minutes. Reuses the SAME
  // pat.pleuralEffusion handle hemothorax uses (respiratory.js's compliance/
  // shunt terms don't care whether the fluid is blood or transudate) with a
  // much slower accumulation rate, and deliberately does NOT touch pat.ptx —
  // there is no tension physiology here, and needle decompression is
  // correctly not a treatment option for a chronic effusion (it never
  // appears as a real relief, since pat.ptx stays null throughout). A chest
  // tube (drainsChest) CAN empty it — real, if more invasive than the
  // thoracentesis this patient actually needs — which is why it is not
  // withheld the way pericardial tamponade's "nothing in the box" framing
  // withholds a fix; the honest teaching point is that most crews carrying
  // this drug box do not carry a paramedic who can do it (lvl 5), so
  // recognition, positioning and rapid transport are what actually matters
  // in the field.
  pleuralEffusion: {
    initial: { age: 68, weight: 74, hr: 104, sbp: 118, rr: 24, glu: 100, pain: 2,
      pleuralEffusion: 0.35 },
    progress(pat, dt) {
      pat.pleuralEffusion = clamp((pat.pleuralEffusion ?? 0.35) + dt * 0.002, 0.35, 0.65);
      pat.hrBase = clamp(pat.hrBase + dt * 0.05, 90, 120);
    },
  },

  // Acute Respiratory Distress Syndrome (queue item 7, Respiratory) —
  // diffuse, BILATERAL alveolar damage, distinct from pneumoniaSepsis's
  // unilateral/lobar consolidation model. Two things separate it from
  // ordinary severe pneumonia, both real and both already emergent from
  // existing mechanisms rather than invented: (1) the shunt is FiO2-
  // REFRACTORY — shunted blood never contacts alveolar gas at all, so
  // raising inspired oxygen barely helps it, which is already exactly what
  // the shunt equation in respiratory.js does at high shuntFraction, not
  // something this condition needs to fake; (2) it does NOT resolve within
  // a single call even ventilated — real ARDS is days of diffuse alveolar
  // damage, so "ventilated" only slows the deterioration here, unlike
  // pneumoniaSepsis's faster ventilated-recovery curve. Reuses pat.edema
  // (protein-rich alveolar flooding — the same handle CHF/aspiration
  // pneumonitis use, a different etiology) for the "stiff, wet lung"
  // compliance/dlco consequence rather than inventing a parenchymal-
  // stiffness field.
  ards: {
    initial: { age: 52, weight: 84, hr: 118, sbp: 96, rr: 30, glu: 108, pain: 2,
      shunt: 0.5, tv: 0.28, temp: 38.6 },
    progress(pat, dt) {
      // "Treated" means real supplemental oxygen (NC/NRB/BVM/CPAP/vent) was
      // actually applied — read from effectiveFio2, not from the sao2
      // OUTCOME. A sao2-based proxy is circular for a condition mild enough
      // to sit above 90% on room air at baseline (unlike pneumoniaSepsis's
      // own much-more-severe presentation, where that proxy is safe): it
      // would silently treat "happens to be oxygenating adequately" as
      // "was ventilated" and IMPROVE the shunt in a genuinely untreated
      // patient — found by mechanismWiring.mjs, not assumed correct.
      const treated = (pat.effectiveFio2 ?? 0.21) > 0.25;
      if (treated) {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.5) - dt * 0.01, 0.35, 0.75);
      } else {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.5) + dt * 0.03, 0.5, 0.85);
        pat.rrBase = clamp((pat.rrBase ?? 30) + dt * 0.3, 20, 40);
      }
      pat.edema = clamp((pat.edema ?? 0.3) + dt * 0.005, 0.3, 0.75);
    },
  },

  // Aspiration pneumonitis (queue item 7, Respiratory) — chemical injury
  // from aspirated gastric content (Mendelson syndrome), rapid onset
  // (minutes to hours), not an infectious process. Three real mechanisms,
  // all reused rather than invented: the aspirated material itself sits in
  // the conducting airway (pat.airwayFluid, queue item 13's own handle —
  // suction is a genuine, real treatment here, not just for drowning);
  // acidic aspirate chemically injures the alveoli, producing real
  // (non-cardiogenic) pulmonary edema through the SAME pat.edema handle
  // CHF/ARDS use; and acidic aspirate reflexively triggers bronchospasm
  // through the SAME pat.broncho handle asthma uses, genuinely responsive
  // to the same bronchodilator mechanism. Deliberately NOT modeled through
  // pat.capillaryLeak — that handle is a WHOLE-BODY endothelial-injury term
  // (preeclampsia's own systemic vasculopathy); this injury is localized to
  // the lung, so the lung-specific pat.edema handle is the correct one, not
  // a mechanism-category mismatch borrowed for convenience.
  aspirationPneumonitis: {
    initial: { age: 45, weight: 82, hr: 112, sbp: 108, rr: 26, glu: 100, pain: 2,
      shunt: 0.15, bronch: 0.3 },
    progress(pat, dt) {
      if (!pat._aspirated) {
        pat._aspirated = true;
        pat.airwayFluid = Math.max(pat.airwayFluid || 0, 0.35);
      }
      pat.edema = clamp((pat.edema ?? 0.2) + dt * 0.02, 0.2, 0.65);
      pat.broncho = clamp((pat.broncho ?? 0.3) + dt * 0.01, 0.2, 0.7);
      pat.shuntFraction = clamp((pat.shuntFraction ?? 0.15) + dt * 0.015, 0.15, 0.55);
    },
  },

  // Acute bronchitis (queue item 7, Respiratory) — deliberately mild and
  // largely benign, the same "not everything is a thriller" category
  // minorSprain/chronicBackPain occupy. Real acute bronchitis is
  // self-limited in an otherwise healthy adult: mild bronchospasm nowhere
  // near asthma's severity ceiling, a productive cough, a low fever — the
  // actual teaching point is recognizing that this is NOT status
  // asthmaticus, pneumonia or PE, and that reassurance/analgesia/transport
  // is the correct, complete field response, not escalating unnecessary
  // interventions.
  bronchitis: {
    initial: { age: 34, weight: 74, hr: 92, sbp: 122, rr: 18, glu: 100, pain: 2,
      bronch: 0.15, temp: 37.8 },
    progress(pat, dt) {
      pat.broncho = clamp((pat.broncho ?? 0.15) + dt * 0.002, 0.1, 0.3);
      pat.coreTemp = clamp((pat.coreTemp ?? 37.8) + dt * 0.002, 37, 38.5);
    },
  },

  // Bronchiolitis (queue item 7, Respiratory) — the pediatric (typically
  // RSV) analog of asthma's bronchospasm mechanism, reused rather than
  // duplicated: same pat.broncho/shuntFraction handles, same
  // beta2-tone-modulated response respiratory.js already computes generically
  // for any age. The infant age/weight (ageProfile.js's existing scaling —
  // already exercised by pediatricDrowning/neonatalTransition) drives the
  // real vital-sign differences (much faster resting HR/RR) without any new
  // pediatric-specific code here. Capped well below asthma's own
  // status-asthmaticus ceiling — bronchiolitis's small-airway
  // inflammation/mucus plugging genuinely does not reach the same
  // fully-obstructed extreme in the same way adult status asthmaticus does.
  // QUEUE ITEM 41 RECALIBRATION. The old rates (0.015/min broncho,
  // 0.01/min shunt) could never reach this condition's OWN declared ceiling
  // within a realistic call: from the initial 0.4/0.25, a full 900s (15 min)
  // untreated run only reached ~0.625/~0.4, never the stated 0.75/0.5 — the
  // same "ceiling set without checking the ramp can reach it in a call"
  // pattern found and fixed for epiglottitis. Measured directly against the
  // real engine (bare scenario trace): sao2 barely moved at all (97.4% ->
  // 97.2% over the full call) and fatigue stayed at exactly 0.000 throughout
  // — a sick bronchiolitic infant reading as essentially unchanged for the
  // whole 15-minute call. A held-severity sweep on this substrate
  // (age0.75/8kg) shows the condition's own ceiling (broncho 0.75/shunt
  // 0.5) already produces a real, visible, worrying-but-not-failing
  // picture (sao2 96.3%, fatigue still 0) — appropriate for a titled
  // "moderate" presentation, not the genuine-respiratory-failure severity
  // epiglottitis was recalibrated to reach (that starts around broncho~0.95
  // on this same substrate). So the ceiling itself is left alone; only the
  // rate is raised — doubled, to reach that already-declared ceiling by
  // roughly minute 12 of a 15-minute scene instead of never, giving the
  // rest of the call room to show the trend worsening toward it.
  bronchiolitis: {
    initial: { age: 0.75, weight: 8, hr: 150, rr: 48, glu: 90, pain: 1,
      bronch: 0.4, shunt: 0.25, temp: 38.3 },
    progress(pat, dt) {
      pat.broncho = clamp((pat.broncho ?? 0.4) + dt * 0.03, 0.3, 0.75);
      pat.shuntFraction = clamp((pat.shuntFraction ?? 0.25) + dt * 0.02, 0.2, 0.5);
      // Same silent-chest/fatigue pre-arrest sign asthma's own condition
      // uses, at the same severity threshold.
      if ((pat.broncho ?? 0) > 0.7) pat.rrBase = clamp((pat.rrBase ?? 48) - dt, 15, 60);
    },
  },

  // Pertussis (queue item 7, Respiratory) — the real, dangerous complication
  // in infants is PAROXYSMAL coughing fits with post-tussive apnea, not a
  // continuous obstructive process like asthma/bronchiolitis. Modeled as
  // brief, probabilistic apneic spells (rrBase driven toward apnea for the
  // duration of a fit, then recovering) — the actual clinical pattern of
  // paroxysm-then-recovery, repeating — rather than faking one continuous
  // bronchospastic process. The resulting hypoxemia during each spell is NOT
  // separately coded — it is the ordinary, already-correct consequence of
  // near-zero ventilation reaching respiratory.js's own gas-exchange
  // equations, the same way any apneic patient desaturates.
  pertussis: {
    initial: { age: 0.3, weight: 5, hr: 145, rr: 44, glu: 90, pain: 1, temp: 37.3 },
    progress(pat, dt) {
      if (!pat._pertussisSpell && Math.random() < dt * 0.3) {
        pat._pertussisSpell = true;
        pat._pertussisSpellT = 0;
      }
      if (pat._pertussisSpell) {
        pat._pertussisSpellT += dt;
        pat.rrBase = 2;
        if (pat._pertussisSpellT > 0.5) pat._pertussisSpell = false;   // ~30s paroxysm
      } else {
        pat.rrBase = clamp(pat.rrBase ?? 44, 35, 50);
      }
    },
  },

  // Influenza pneumonia (queue item 7, Respiratory) — a real viral pneumonia
  // distinct from pneumoniaSepsis's bacterial/septic-shock model: high fever
  // and a genuine, progressive hypoxemic risk, but WITHOUT that condition's
  // distributive septic-vasodilation limb — the danger here is respiratory
  // failure from the pneumonia itself, not septic shock. Same
  // shunt/ventilation-responsive mechanism, different, milder severity band
  // and no vasodilation term.
  influenzaPneumonia: {
    initial: { age: 58, weight: 80, hr: 108, sbp: 112, rr: 24, glu: 100, pain: 3,
      shunt: 0.2, temp: 39.4 },
    progress(pat, dt) {
      // "Treated" means real supplemental oxygen (NC/NRB/BVM/CPAP/vent) was
      // actually applied — read from effectiveFio2, not from the sao2
      // OUTCOME. A sao2-based proxy is circular for a condition mild enough
      // to sit above 90% on room air at baseline (unlike pneumoniaSepsis's
      // own much-more-severe presentation, where that proxy is safe): it
      // would silently treat "happens to be oxygenating adequately" as
      // "was ventilated" and IMPROVE the shunt in a genuinely untreated
      // patient — found by mechanismWiring.mjs, not assumed correct.
      const treated = (pat.effectiveFio2 ?? 0.21) > 0.25;
      if (treated) {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.2) - dt * 0.01, 0.12, 0.5);
      } else {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.2) + dt * 0.01, 0.2, 0.55);
        pat.hrBase = clamp(pat.hrBase + dt * 0.1, 90, 130);
      }
      pat.coreTemp = clamp((pat.coreTemp ?? 39.4) + dt * 0.003, 38, 40.2);
    },
  },

  // COVID-19 pneumonia (queue item 7, Respiratory) — the real, well-
  // documented "silent/happy hypoxia" phenomenon: measured hypoxemia with
  // disproportionately mild SUBJECTIVE distress. This is deliberately a
  // content/probe teaching point (see the scenario's own opqrst text), not a
  // new physiology mechanism — the hypoxemia itself is ordinary shunt
  // physiology, identical in kind to influenzaPneumonia's; what is genuinely
  // distinctive is the mismatch a provider has to catch by trusting the
  // pulse oximeter over how comfortable the patient looks and sounds.
  covidPneumonia: {
    initial: { age: 61, weight: 88, hr: 96, sbp: 118, rr: 22, glu: 100, pain: 1,
      shunt: 0.28, temp: 38.4 },
    progress(pat, dt) {
      // "Treated" means real supplemental oxygen (NC/NRB/BVM/CPAP/vent) was
      // actually applied — read from effectiveFio2, not from the sao2
      // OUTCOME. A sao2-based proxy is circular for a condition mild enough
      // to sit above 90% on room air at baseline (unlike pneumoniaSepsis's
      // own much-more-severe presentation, where that proxy is safe): it
      // would silently treat "happens to be oxygenating adequately" as
      // "was ventilated" and IMPROVE the shunt in a genuinely untreated
      // patient — found by mechanismWiring.mjs, not assumed correct.
      const treated = (pat.effectiveFio2 ?? 0.21) > 0.25;
      if (treated) {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.28) - dt * 0.008, 0.18, 0.6);
      } else {
        pat.shuntFraction = clamp((pat.shuntFraction ?? 0.28) + dt * 0.012, 0.28, 0.65);
      }
      pat.coreTemp = clamp((pat.coreTemp ?? 38.4) + dt * 0.002, 37.5, 39.5);
    },
  },

  // Croup (viral laryngotracheobronchitis, queue item 7, Respiratory) — the
  // first consumer of pat.upperAirwayObstruction (see patient.js/
  // respiratory.js). A toddler with a barky cough and inspiratory stridor,
  // moderate severity, NOT beta-2-responsive — the real, important
  // distinction from bronchiolitis/asthma this handle exists to preserve.
  // Real first-line croup treatment (nebulized racemic epinephrine, a
  // genuine alpha-agonist mucosal vasoconstrictor, mechanistically distinct
  // from albuterol's beta-2 action) was previously a drug this box did not
  // carry at all — QUEUE ITEM 60 closed that gap (drugs.js `nebEpi`,
  // pk.js's own `upperAirwayObstruction` fx-curve branch), so this condition
  // no longer needs a pharmacologic-treatment workaround; wiring albuterol
  // to "fix" this would still teach the wrong lesson — a bronchodilator is
  // not indicated for upper airway edema. The honest field skill remains
  // recognition, keeping the child calm (agitation/crying measurably
  // worsens upper airway obstruction in real croup), and transport, now
  // alongside a real drug lever that measurably helps.
  croup: {
    initial: { age: 2, weight: 13, hr: 132, rr: 32, glu: 95, pain: 1,
      upperAirwayObstruction: 0.35, temp: 38.2 },
    progress(pat, dt) {
      pat.upperAirwayObstruction = clamp((pat.upperAirwayObstruction ?? 0.35) + dt * 0.008, 0.25, 0.65);
      pat.coreTemp = clamp((pat.coreTemp ?? 38.2) + dt * 0.002, 37.5, 39);
    },
  },

  // Epiglottitis (queue item 7, Respiratory) — the true airway EMERGENCY
  // version of upper airway obstruction, distinct from croup by rate and
  // ceiling: acute onset (hours, not days), a much faster climb, and a
  // higher, more dangerous ceiling — real epiglottitis can progress to
  // complete obstruction. Same pat.upperAirwayObstruction handle, no new
  // mechanism, calibrated to the disease's own severity. Per QUEUE ITEM 60,
  // nebulized epi (drugs.js `nebEpi`) now reaches this field the same way it
  // reaches croup's above, real for real supraglottic-swelling temporizing
  // use in practice, but the actual field skill still matters even more
  // sharply here than for croup: recognizing it and NOT agitating the
  // airway (no forced exam, no forced positioning, no attempt to look at
  // the epiglottis directly) while moving fast toward a facility that can
  // secure a difficult airway surgically if it closes, since nebEpi is a
  // temporizing bridge, not a cure, for an infectious/structural process.
  //
  // QUEUE ITEM 41 RECALIBRATION. This comment's own claim — "a much faster
  // climb, and a higher, more dangerous ceiling... can progress to complete
  // obstruction" — was aspirational prose that the numbers below it never
  // actually delivered (lesson 16, aimed at this file's own comment rather
  // than at code): at the old 0.02/min rate and 0.85 ceiling, a full 900s
  // (15 min) untreated call only reached uao~0.6, never its own stated
  // ceiling (needs 27.5 min), and — measured directly against the real
  // engine (a held-uao sweep, age4/17kg substrate) — 0.85 sits nowhere near
  // where the respiratory mechanism actually starts to fail: fatigue and
  // hypercapnia stay at flat zero all the way out to uao~1.3, then rise
  // steeply and cross into genuine respiratory failure (sao2<95%, fatigue
  // engaging) around uao~1.6, and near-total ventilatory failure (sao2<10%,
  // atp starting to fall toward the cardiac-arrest threshold) by uao~1.8-2.0.
  // So epiglottitis could never actually kill a patient through this
  // pathway — the scenario's own resolve() text narrates "closed her
  // airway" as a real possible outcome, but the mechanism underneath it
  // could not reach that state at any point in a realistic call.
  // Ceiling raised to 2.0 (the measured near-total-failure point) and rate
  // to 0.13/min so an untreated patient crosses from baseline into the
  // measured crisis band (~1.6) around minute 10 of a 15-minute scene —
  // real urgency, not instant death, matching this condition's own resolve()
  // text ("every minute of scene time... narrowed her margin further") and
  // giving the crew's actual lever (recognizing it and transporting fast,
  // since no field drug touches the swelling itself) real stakes.
  epiglottitis: {
    initial: { age: 4, weight: 17, hr: 138, rr: 30, glu: 95, pain: 3,
      upperAirwayObstruction: 0.3, temp: 39.6 },
    progress(pat, dt) {
      pat.upperAirwayObstruction = clamp((pat.upperAirwayObstruction ?? 0.3) + dt * 0.13, 0.3, 2.0);
      pat.coreTemp = clamp((pat.coreTemp ?? 39.6) + dt * 0.002, 38.5, 40.2);
      pat.hrBase = clamp(pat.hrBase + dt * 0.3, 110, 160);
    },
  },

  // Cystic fibrosis, ACUTE PULMONARY EXACERBATION (queue item 7,
  // Respiratory) — the actual EMS-relevant CF presentation; a chronic CF
  // patient does not call 911 for their baseline, they call for an
  // exacerbation. Three real, chronic-CF-specific mechanisms, all reused:
  // thick, poorly-cleared secretions sitting in the conducting airway
  // (pat.airwayFluid, queue item 13's own handle, seeded high and
  // REACCUMULATING — the same pattern pediatricDrowning already uses for
  // continued aspiration, here for continued mucus production rather than
  // continued water aspiration); baseline small-airway obstruction on top
  // of the acute infection (pat.broncho, genuinely beta-2-responsive,
  // unlike croup/epiglottitis — CF airway disease IS bronchospastic
  // component as well as mucus plugging); and chronic parenchymal damage
  // via riskFactors.fibrosis, which patient.js already halves dlco for.
  cysticFibrosisExacerbation: {
    initial: { age: 24, weight: 52, hr: 108, sbp: 108, rr: 24, glu: 100, pain: 3,
      bronch: 0.35, airwayFluid: 0.4, temp: 38.3, riskFactors: { fibrosis: true } },
    progress(pat, dt) {
      pat.airwayFluid = clamp((pat.airwayFluid ?? 0.4) + dt * 0.01, 0.35, 0.75);
      pat.broncho = clamp((pat.broncho ?? 0.35) + dt * 0.006, 0.3, 0.6);
      pat.coreTemp = clamp((pat.coreTemp ?? 38.3) + dt * 0.003, 37.5, 39.2);
    },
  },

  // Pulmonary tuberculosis with active hemoptysis (queue item 7,
  // Respiratory) — the real EMS-relevant TB presentation is not the chronic
  // infection itself (no field intervention touches it) but a genuine,
  // sometimes life-threatening complication: erosion into the pulmonary
  // vasculature causing hemoptysis. Modeled as ordinary blood loss
  // (pat.activeBleedRate — the same mass-conserving, pressure-scaled
  // hemorrhage mechanism metabolic.js already applies to every other bleed
  // source; the engine does not need a separate "pulmonary" bleed model, the
  // consequence to the patient — falling blood volume, falling pressure — is
  // identical regardless of anatomic route) plus chronic fibrotic lung
  // damage (riskFactors.fibrosis, the same handle cysticFibrosisExacerbation
  // uses, halving dlco per patient.js). The genuinely important field
  // teaching point (airborne isolation, N95/PPE for the crew) is narrative,
  // in the scenario's own resolve() text — it is not something physiology
  // vitals can represent, and does not need to be.
  tuberculosisHemoptysis: {
    initial: { age: 54, weight: 62, hr: 112, sbp: 100, rr: 22, glu: 95, pain: 2,
      blood: 5.4, bleed: 0.05, temp: 38.0, riskFactors: { fibrosis: true } },
    progress(pat, dt) {
      pat.activeBleedRate = clamp((pat.activeBleedRate ?? 0.05) + dt * 0.002, 0.03, 0.14);
      pat.coreTemp = clamp((pat.coreTemp ?? 38.0) + dt * 0.001, 37.5, 38.8);
    },
  },

  // ============================================================
  // ELECTROLYTE BATCH (queue item 7's standing workstream). Step (a)/(b)
  // review found the supporting cardiovascular machinery ALREADY built and
  // already verified before any of these were written: cardiovascular.js's
  // qtc term reads pat.k<3.5, pat.mg<0.7 and pat.ca<2.1 directly
  // (cardiovascular.js:1920-1922), feeding a.repol and the real,
  // literature-anchored torsades-initiation pathway (Tzivoni 1988) the
  // acquiredLongQT batch already built and mechanismWiring already
  // verifies end to end. a.hypoK (k<3.0) and a.triggered (ca>3) feed the
  // same rhythmInstability/vtDrive substrate directly. So every condition
  // below is "give the disease a real cause and a real starting severity,"
  // not "invent a new receptor" — exactly the reuse-over-invention case
  // section 4 asks for.
  //
  // na/ca/mg/hco3 are NOT read by patient.js's constructor (only k is,
  // via `this.k = b.k ?? 4.0`) — the same dead-`initial`-field class
  // already documented for siadh/diabetesInsipidus/addisonianCrisis (na)
  // and acquiredLongQT (mg). Each condition below seeds the field directly
  // in its own one-time-guarded progress() block, matching whichever
  // existing idiom that field's own pk.js/renal.js pool decay requires
  // (na needs naMass recomputed alongside it; mg/ca need their own
  // _mgBase/_caBase held so pk.js's decay-to-baseline doesn't pull the
  // seeded severity back toward a healthy default).
  // ============================================================

  // ===== HYPOKALEMIA =====
  // Chronic thiazide/loop diuretic use with reduced oral intake — the
  // classic prehospital-relevant cause of clinically dangerous
  // hypokalemia (more common in this population than laxative abuse).
  // Severe hypokalemia is conventionally <2.5 mEq/L; this patient starts
  // there and drifts lower on continuing losses against no intake.
  //
  // k IS read by patient.js's constructor (renal.js's own kMass pool, the
  // only one of the five electrolytes handled this way) so `initial.k`
  // needs no seeding workaround. Zero new engine code otherwise: qtc
  // lengthens directly below k<3.5 (:1920), a.hypoK engages below k<3.0
  // (:1947) feeding a.repol (:1950), and both feed the same real torsades
  // pathway acquiredLongQT already exercises.
  hypokalemia: {
    initial: { hr: 94, sbp: 116, rr: 16, glu: 100, pain: 2, k: 2.8 },
    progress(pat, dt) {
      // renal.js's own excretion term does NOT simply stop at a low level —
      // below k=4.0 it goes NEGATIVE (real potassium CONSERVATION), which
      // through the sign in its dConc formula (renal.js:331/360) actively
      // pushes kMass back up toward 4.0 every tick. A bare one-time/simple
      // subtraction here (a first attempt, measured directly) was silently
      // overpowered by that correction — k drifted UP (2.8 -> 3.2 over 14
      // minutes) instead of down. Fixed with the same "pin below a
      // ratcheting ceiling every tick" idiom hyperkalemiaMissedDialysis
      // uses in the opposite direction: this condition's own disease
      // process (ongoing diuretic-driven loss plus poor intake) re-clamps
      // k below the ceiling every tick, regardless of what the kidney's
      // own partial correction did to it in between. Floored at 1.8 mEq/L
      // (below which most patients are already in cardiac arrest,
      // StatPearls Hypokalemia).
      const target = Math.max(1.8, (pat._hypoKTarget ?? 2.8) - dt * 0.015);
      pat._hypoKTarget = target;
      pat.k = Math.min(pat.k, target);
    },
  },

  // ===== HYPERCALCEMIA =====
  // Malignancy (lung, breast, myeloma, or squamous-cell via PTHrP) is the
  // most common cause of severe, symptomatic hypercalcemia in adults —
  // "stones, bones, groans, and psychiatric overtones" — chosen over
  // primary hyperparathyroidism, which is usually mild and chronic rather
  // than an EMS-acuity presentation. Severe range is >3.5 mmol/L
  // (14 mg/dL, corrected); this patient starts there.
  //
  // Three real, already-verified consequences, zero new engine code:
  // cardiovascular.js's a.triggered arrhythmia term already reads ca>3
  // directly (:1949); nephrogenic ADH resistance
  // (pat.adhRenalResponsiveness) is the exact handle the diabetesInsipidus
  // condition's own comment names as the reusable hook for "severe
  // hypercalcemia" — a real, documented mechanism (hypercalcemia impairs
  // the renal collecting duct's response to ADH), driving genuine
  // free-water loss/volume depletion through renal.js's existing waterFlux
  // math; and pat.metabolicEncephalopathy (the general confusion handle
  // the toxicMetabolicEncephalopathy/delirium batch built) covers the real
  // "psychiatric overtones" as severity climbs.
  hypercalcemia: {
    initial: { hr: 100, sbp: 122, rr: 16, glu: 100, pain: 5 },
    progress(pat, dt) {
      if (pat._hyperCaInit === undefined) {
        pat._hyperCaInit = true;
        pat.ca = 3.7;
        pat._caBase = 3.7;
      }
      pat.adhRenalResponsiveness = Math.min(pat.adhRenalResponsiveness ?? 1, 0.3);
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0,
        Math.min(1, (pat.ca - 3.0) / 1.5));
      // Real mechanism for this scenario's own resolve() claim
      // (scenarios.js: "volume expansion promotes renal calcium
      // excretion... it will not fix this on scene, but it is the right
      // direction") -- previously pure narration, since nothing here ever
      // touched pat.ca in response to treatment at all. Real mechanism:
      // volume expansion raises GFR and reduces proximal-tubule sodium
      // reabsorption, and calcium co-transports with sodium there, so
      // natriuresis genuinely promotes calcium clearance too. Lowers the
      // TARGET pk.js's existing decay-to-baseline mechanism pulls pat.ca
      // toward (_caBase), not pat.ca directly, so the correction is
      // genuinely gradual through the engine's own already-existing decay,
      // not an instant fix. Floored well above normal (2.6, vs. a healthy
      // ~2.2-2.6) -- matching the scenario's own explicit claim that this
      // is real but cannot normalize severe hypercalcemia within one field
      // encounter.
      //
      // Detected via pat.drugInstances, not s.given: a first version read
      // s.given here and measured ZERO effect (lesson 8, instrument before
      // trusting) -- s.given is a pure App.jsx UI-bookkeeping structure
      // (button-click counts for the max-dose display) that
      // physio()/conditions.js never receives. pat.drugInstances is what
      // pk.js itself populates from a real dose, the standard way this
      // engine's own mechanisms detect "is this drug currently on board."
      const fluidOnBoard = (pat.drugInstances || []).some(
        (dr) => dr.id === "saline" || dr.id === "plasmalyte");
      if (fluidOnBoard) {
        pat._caBase = Math.max(2.6, pat._caBase - dt * 0.003);
      }
    },
  },

  // ===== HYPOCALCEMIA =====
  // Acute pancreatitis — saponification (fat necrosis binding free
  // calcium) is a well-documented mechanism for real, acute, symptomatic
  // hypocalcemia, and it gives this condition an honest, EMS-recognizable
  // presentation (epigastric pain radiating to the back) distinct from the
  // far more common but chronic, non-emergent hypoparathyroid picture.
  // Severe range is <1.9 mmol/L (7.5 mg/dL); this patient starts there.
  //
  // Two real, already-verified consequences, zero new engine code:
  // cardiovascular.js already reduces the contractility multiplier
  // directly below ca<2.0 (:1774 — a genuine, measurable drop in cardiac
  // output, not a narrated one), and the same qtc-lengthening term
  // (ca<2.1, :1922) that feeds a.repol and the real torsades pathway
  // (Tzivoni 1988) also fires here. Calcium chloride is the real,
  // already-implemented field treatment (fx:{ca:0.5}) and directly
  // reverses both.
  hypocalcemia: {
    initial: { hr: 108, sbp: 108, rr: 20, glu: 110, pain: 8 },
    progress(pat) {
      if (pat._hypoCaInit === undefined) {
        pat._hypoCaInit = true;
        pat.ca = 1.6;
        pat._caBase = 1.6;
      }
    },
  },

  // ===== HYPERMAGNESEMIA =====
  // Renal failure plus ongoing magnesium-containing antacid/laxative use
  // (milk of magnesia, magnesium citrate) is the textbook cause of
  // dangerous, NON-iatrogenic hypermagnesemia — distinct from the
  // magnesium-sulfate-infusion toxicity pk.js's own magToxicity mechanism
  // was originally built for (that mechanism is reused here wholesale,
  // just given a different real-world cause and no infusion running).
  // Kidneys are the only real clearance route for magnesium — with almost
  // none left (kidneyInjury pinned, same idiom hyperkalemiaMissedDialysis
  // already established), ongoing GI absorption keeps the level climbing
  // rather than clearing. Thresholds are pk.js's own documented ones:
  // therapeutic 2.0-3.5, reflexes lost 4.0-5.0, respiratory depression
  // 5.0-7.5, cardiac arrest 12.5-15.0 mmol/L. This patient starts at 6.0
  // (early respiratory-depression range) and climbs toward the arrest
  // range if untreated.
  hypermagnesemia: {
    initial: { age: 64, hr: 78, sbp: 128, rr: 14, glu: 100, pain: 1 },
    progress(pat, dt) {
      pat.kidneyInjury = Math.max(pat.kidneyInjury ?? 0, 0.55);
      // Pinned directly (mg and its own _mgBase together, every tick) the
      // same way hyperkalemiaMissedDialysis pins k — this bypasses pk.js's
      // decay-to-baseline entirely (mg===_mgBase every tick means the
      // decay term contributes zero), so the ONLY thing moving the level
      // is this condition's own slow climb, ceilinged at 11 (just below
      // the documented 12.5 arrest threshold) so an untreated patient
      // reaches genuine crisis without an instant jump.
      const target = Math.min(11, (pat._hyperMgTarget ?? 6.0) + dt * 0.05);
      pat._hyperMgTarget = target;
      pat.mg = target;
      pat._mgBase = target;
    },
  },

  // ===== HYPOMAGNESEMIA =====
  // Chronic alcohol use disorder — the most common cause of clinically
  // significant hypomagnesemia in adults (GI malabsorption, renal wasting,
  // and poor intake together) — as its own standalone presentation,
  // distinct from acquiredLongQT's composite (hypokalemia + hypomagnesemia
  // + bradycardia + a chronic QT-prolonging medication). Severe/
  // symptomatic is <0.5 mmol/L (pk.js's own magToxicity comment cites the
  // same figure from the opposite direction); this patient starts at 0.4.
  //
  // Zero new engine code: cardiovascular.js's qtc term already reads
  // pat.mg<0.7 directly (:1921), feeding a.repol and the same real,
  // literature-anchored torsades pathway (Tzivoni 1988) acquiredLongQT
  // already exercises end to end.
  hypomagnesemia: {
    initial: { hr: 96, sbp: 128, rr: 16, glu: 100, pain: 1 },
    progress(pat) {
      if (pat._hypoMgInit === undefined) {
        pat._hypoMgInit = true;
        pat.mg = 0.4;
        pat._mgBase = 0.4;
      }
    },
  },

  // ===== HYPONATREMIA =====
  // Exercise-associated hyponatremia — an endurance athlete (marathon,
  // ultramarathon, hot-weather event) who has been drinking free water
  // faster than sodium losses — a well-documented, genuinely acute and
  // EMS-relevant cause, distinct from the already-shipped siadh's
  // euvolemic malignancy/CNS/drug picture. Severe symptomatic
  // hyponatremia is conventionally <120 mmol/L (Hew-Butler et al.,
  // exercise-associated hyponatremia consensus statement) — the same
  // seizure threshold neuro.js's own hyponatremic-seizure limb already
  // reads directly (naNow<120, neuro.js:146), so this condition needs no
  // new engine code at all, only a real cause and a real starting value.
  hyponatremia: {
    initial: { hr: 92, sbp: 108, rr: 18, glu: 100, pain: 2 },
    progress(pat) {
      if (pat._hypoNaInit === undefined) {
        pat._hypoNaInit = true;
        pat.na = 118;
        pat.naMass = 118 * (pat.plasmaVol + pat.interstitialVol);
      }
    },
  },

  // ===== HYPERNATREMIA =====
  // An elderly patient with impaired free-water access (reduced thirst
  // drive, limited mobility, hot weather) — the classic prehospital
  // "found weak and confused, dry mucous membranes" hypernatremic-
  // dehydration presentation, distinct from diabetesInsipidus's specific
  // ADH-secretion pathology (already shipped). Severe hypernatremia is
  // conventionally >158-160 mmol/L; this patient starts at 158.
  //
  // Ongoing free-water loss (insensible losses continuing against no
  // intake) is modelled directly on plasmaVol/interstitialVol, the same
  // idiom alcoholicKetoacidosis's own dehydration limb already uses for
  // plasmaVol alone — split across BOTH ECF compartments here since this
  // is total-body free-water loss, not isotonic bleeding (contrast the
  // naMass-draining note at renal.js:78 for hemorrhage) — WITHOUT
  // touching naMass. renal.js's own na = naMass/ecfWater recompute
  // (renal.js:120) then does the rest: a shrinking water compartment
  // against a held sodium mass concentrates the serum sodium further, a
  // real emergent consequence rather than a second, redundant na write.
  // Confusion/lethargy from cellular dehydration reuses the same general
  // pat.metabolicEncephalopathy handle hypercalcemia above uses.
  hypernatremia: {
    initial: { age: 78, hr: 104, sbp: 100, rr: 18, glu: 110, pain: 1 },
    progress(pat, dt) {
      if (pat._hyperNaInit === undefined) {
        pat._hyperNaInit = true;
        pat.na = 158;
        pat.naMass = 158 * (pat.plasmaVol + pat.interstitialVol);
      }
      pat.plasmaVol = Math.max(1.5, pat.plasmaVol - dt * 0.003);
      pat.interstitialVol = Math.max(2.5, pat.interstitialVol - dt * 0.007);
      pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0,
        Math.min(1, (pat.na - 150) / 20));
    },
  },

  // ===== SEVERE METABOLIC ACIDOSIS (non-anion-gap) =====
  // Severe, prolonged gastroenteritis/diarrheal illness — a real,
  // EMS-relevant, NON-anion-gap (hyperchloraemic) cause of severe
  // metabolic acidosis, genuinely distinct from the anion-gap ketoacidosis
  // family already shipped (diabeticKetoacidosis/alcoholicKetoacidosis/
  // starvationKetosis) — bicarbonate is lost directly in stool rather than
  // consumed buffering ketoacids. Chosen specifically so this condition
  // teaches a DIFFERENT acid-base picture than the three ketoacidoses
  // already in the library, not a fourth copy of the same one.
  //
  // respiratory.js's Winter's-formula compensation term
  // (expectedPaco2 = 1.5*hco3+8, respiratory.js:64) is already generic —
  // not condition-specific — so the real compensatory tachypnea this
  // condition needs emerges automatically from setting hco3 low, zero new
  // engine code. Real concurrent volume depletion (diarrheal fluid loss)
  // reuses the same direct plasmaVol-drain idiom alcoholicKetoacidosis's
  // own dehydration limb already uses.
  //
  // A REAL, UNPLANNED SECONDARY FINDING, measured directly rather than
  // designed in: severe acidemia drives potassium OUT of cells via H+/K+
  // exchange (renal.js's own already-existing kShiftConc term, driven by
  // pH drop) — this condition's own hco3 depletion is severe enough to
  // measurably push serum potassium into peaked-T/hyperkalaemic territory
  // by the end of a 15-minute call (measured: k 4.2 -> 7.1, rhythm ->
  // peakedT) purely as a consequence of the acidemia, with no potassium
  // written by this condition at all. This is real, textbook physiology
  // (severe acidosis causing a transcellular hyperkalaemia) and is left in
  // rather than suppressed — the scenario's own `heart` probe surfaces it.
  severeMetabolicAcidosis: {
    initial: { hr: 116, sbp: 96, rr: 22, glu: 100, pain: 4 },
    progress(pat, dt) {
      // Queue item 44: THIS is the condition that motivated separating an
      // anion-gap lever from a chloride one in the first place — its own
      // header comment already claims "non-anion-gap (hyperchloraemic)",
      // a real clinical distinction the OLD hco3-bucket mechanism could
      // never actually produce (cl was back-derived FROM hco3 regardless
      // of cause, so this condition's own anion gap widened right along
      // with diabeticKetoacidosis's, which is clinically wrong). Now it
      // genuinely does: pat.clShift (acidbase.js) raises serum chloride
      // directly, leaving pat.anionGap normal, instead of touching
      // pat.unmeasuredAnions the way the ketoacidosis family does. Same
      // seed/ramp shape as before, translated at this condition's own
      // na=140/k=4 (default): SID=140+4-102-clShift=42-clShift, so a
      // clShift of 14 reproduces the identical immediate hco3=10, ramping
      // to 18 (hco3=6) at the same 0.03/min rate — serum chloride rises
      // from 102 to 120, a real, clinically-documented hyperchloremic
      // value, instead of the anion gap silently widening.
      if (pat._acidInit === undefined) { pat._acidInit = true; pat.clShift = 14; }
      pat.clShift = Math.min(18, pat.clShift + dt * 0.03);
      pat.plasmaVol = Math.max(1.2, pat.plasmaVol - dt * 0.02);
      pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
    },
  },

  // ============================================================
  // SECOND BATCH (queue item 7, same standing workstream, continued in
  // one session per operator instruction). Shock states / GI / Vascular /
  // Psychiatric — again chosen for real, already-existing engine handles
  // rather than new mechanism-building: pat.vasodilation (neurogenic
  // shock, the same handle addisonianCrisis/anaphylaxis already use),
  // pat.activeBleedRate (three real, distinct GI/vascular hemorrhage
  // sources, the same mass-conserving pressure-scaled bleed mechanism
  // every trauma condition already uses), pat.lactate (a direct write —
  // confirmed as an ALREADY-ESTABLISHED idiom, not a new one:
  // excitedDeliriumAgitated's own condition already does
  // `pat.lactate = Math.min(15, ...)` above), pat.intrinsicPain (queue
  // item 20's real, displayed pain handle), and the respiratory
  // controller's own already-existing hypocapnic brake
  // (respiratory.js:192, `hypocapnicBrake`) for a real hyperventilation
  // syndrome.
  // ============================================================

  // ===== NEUROGENIC SHOCK =====
  // High cervical/thoracic (T6-or-above) spinal cord injury — the
  // mechanism this condition exists to teach is the exact OPPOSITE
  // compensatory picture from every hemorrhagic/hypovolemic shock in this
  // library: loss of sympathetic outflow below the injury means no reflex
  // tachycardia and no reflex vasoconstriction, so this patient presents
  // with warm, dry skin and a genuinely BRADYCARDIC hypotension rather
  // than the cool, clammy, tachycardic picture every other shock state
  // shows. Reuses pat.vasodilation, the same distributive-shock handle
  // addisonianCrisis/anaphylaxis already drive — real, not decorative,
  // since venous pooling from lost vasomotor tone is the actual mechanism
  // behind the hypotension here.
  neurogenicShock: {
    initial: { age: 24, hr: 52, sbp: 82, rr: 16, glu: 100, pain: 6 },
    progress(pat, dt) {
      pat.vasodilation = Math.max(pat.vasodilation || 0, 0.3);
      // A modest ongoing drift, not a dramatic collapse — spinal shock's
      // hypotension is a real but largely STEADY-STATE distributive
      // picture over a typical scene time, not a progressively worsening
      // one the way an active hemorrhage is.
      pat.vasodilation = Math.min(0.45, pat.vasodilation + dt * 0.002);
    },
  },

  // ===== ACUTE MESENTERIC ISCHEMIA =====
  // Embolic (atrial fibrillation is the classic source) or thrombotic
  // occlusion of the mesenteric circulation — the actual teaching point is
  // "severe pain out of proportion to a benign-appearing abdominal exam,"
  // a real, dangerous, easy-to-underestimate presentation. No regional-
  // perfusion model exists in this engine (a genuine architectural
  // limitation, the same one that keeps NSTEMI's own infarct territory
  // whole-ventricle rather than segmental — see queue item 19).
  //
  // A DIRECT pat.lactate WRITE WAS TRIED FIRST AND MEASURED INERT, NOT
  // ASSUMED SAFE FROM PRECEDENT. metabolic.js recomputes pat.lactate from
  // scratch every tick from real oxygen-debt/production terms
  // (metabolic.js:239-241, running AFTER conditions.progress()) — a direct
  // write here is silently overwritten the same tick, exactly the
  // "written, read, and still inert" defect class section 1 warns about.
  // (excitedDeliriumAgitated's own condition does the identical direct
  // write — whether that one is ALSO inert was not audited here, out of
  // this batch's scope; not repeated blind.) Fixed by relying only on
  // mechanisms that genuinely reach an observable: severe pat.intrinsicPain
  // (the real "pain out of proportion to exam" teaching point) and a real,
  // gradually worsening GI hemorrhage (pat.activeBleedRate, as the ischemic
  // bowel wall breaks down) — enough real blood loss over a full call to
  // produce genuine hypoperfusion, which DOES reach lactate through the
  // legitimate oxygen-debt pathway rather than a direct write.
  acuteMesentericIschemia: {
    initial: { age: 74, hr: 118, sbp: 104, rr: 20, glu: 110, pain: 9, blood: 5.2, rhythm: "afib" },
    progress(pat, dt) {
      // Real, causal feedback from queue item 42's new gut-local
      // oxygen-delivery-vs-demand mechanism (neuro.js's updateOrganInjury,
      // pat.gutInjury): the reason this teaching case gets progressively
      // more dangerous over the call is that the ischemic bowel wall is
      // physically breaking down, not just an abstract "gets worse over
      // time" ramp. The rate accelerates with real structural injury (up
      // to 3x baseline as gutInjury approaches 1) rather than a flat clock
      // -- a patient whose sympathetic tone stays lower (better perfused
      // gut, lower alphaTone) genuinely bleeds more slowly than one in
      // florid shock, which the old flat-rate version could not express.
      const injuryAccel = 1 + (pat.gutInjury ?? 0) * 2;
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.003 * injuryAccel, 0.03, 0.18);
      pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 9, 9);
    },
  },

  // ===== ACUTE CHOLECYSTITIS =====
  // RUQ pain, fever, mild tachycardia — the same honest, largely-local-
  // pain-plus-fever shape appendicitis already established for a surgical
  // abdomen that has NOT yet perforated, at a milder ceiling (cholecystitis
  // is real and dangerous if it progresses to gangrenous cholecystitis or
  // ascending cholangitis, but the base presentation is genuinely less
  // acute than appendicitis' own perforation risk). Presenting fever comes
  // from `initial.temp`, not a trend: measured directly (not assumed) that
  // thermo.js's own heat-balance recompute pulls a small per-tick
  // coreTemp increment back down over a 900s call for EVERY condition that
  // uses this shape, including already-shipped ones (epiglottitis measured
  // 38.87 -> 38.48 over the same window) — a real, pre-existing engine
  // characteristic, not a defect introduced here, and out of this batch's
  // scope to fix (it would move every fever-bearing condition in the
  // library). The presenting fever is real and asserted; a further rise is
  // not.
  acuteCholecystitis: {
    initial: { age: 46, weight: 88, hr: 92, sbp: 126, rr: 16, glu: 100, pain: 6, temp: 38.1 },
    progress(pat, dt) {
      pat.hrBase = clamp(pat.hrBase + dt * 0.08, 70, 112);
      pat.coreTemp = clamp((pat.coreTemp ?? 38.1) + dt * 0.005, 37, 39.0);
    },
  },

  // ===== LOWER GI BLEED (diverticular hemorrhage) =====
  // Classic diverticular bleed: sudden, painless, brisk lower GI
  // hemorrhage in an older adult — deliberately PAINLESS (pain: 1), the
  // real, teachable contrast against acuteMesentericIschemia above (severe
  // pain, occult bleed) and appendicitis/cholecystitis (pain-dominant,
  // minimal bleed). Reuses pat.activeBleedRate, the same mass-conserving
  // hemorrhage mechanism every trauma bleed already uses — the engine does
  // not need a separate "GI" bleed model, the consequence to the patient
  // (falling blood volume, falling pressure) is identical regardless of
  // anatomic route, the same reasoning tuberculosisHemoptysis's own
  // comment already states for pulmonary hemorrhage.
  lowerGIBleed: {
    initial: { age: 71, hr: 110, sbp: 96, rr: 18, glu: 100, pain: 1, blood: 4.8 },
    progress(pat, dt) {
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.004, 0.05, 0.25);
    },
  },

  // ===== UPPER GI BLEED (peptic ulcer disease, non-variceal) =====
  // Genuinely distinct etiology and severity band from the already-shipped
  // esophagealVaricealHemorrhage (portal-hypertensive varix rupture,
  // ceilinged at the most rapidly exsanguinating GI source in this
  // library, 0.32) — a bleeding peptic ulcer is real, dangerous, and
  // common, but on average a slower, less catastrophic bleed than a
  // variceal rupture, so both the bleed ceiling and the hematemesis-
  // aspiration-risk ceiling (pat.airwayFluid, same handle) sit lower here.
  // Real epigastric pain (unlike the painless lower-GI bleed above) is the
  // other honest distinguishing feature.
  upperGIBleed: {
    initial: { age: 58, hr: 112, sbp: 100, rr: 18, glu: 100, pain: 4, blood: 4.6 },
    progress(pat, dt) {
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.004, 0.05, 0.22);
      pat.airwayFluid = Math.min(0.3, (pat.airwayFluid || 0) + dt * 0.01);
    },
  },

  // ===== ACUTE LIMB ISCHEMIA (pulseless extremity) =====
  // Embolic or thrombotic arterial occlusion of a limb — the real
  // "physiology" here is almost entirely local (the classic 6 P's: pain,
  // pallor, pulselessness, paresthesia, paralysis, poikilothermia), not a
  // systemic derangement, the same honest "no progress() needed" idiom
  // minorSprain/chronicBackPain already use once pat.intrinsicPain (queue
  // item 20) existed to hang real severe pain on. A modest pain-driven
  // tachycardia is the only systemic consequence — genuinely all this
  // disease does to the rest of the body in a prehospital time frame.
  // Embolic acute limb ischemia (VASC-001: 68M, known AF -- a real
  // cardioembolic source -- sudden severe left-leg pain/pallor/cold,
  // presenting 40 min post-onset). Queue item 74, Phase 2's own target
  // consumer for the new per-limb pat.limbOcclusion/limbDO2 mechanism
  // (neuro.js's updateOrganInjury) -- was a COMPLETELY bare stub (initial
  // vitals only, no progress()) despite this engine now having the real
  // substrate to build it on.
  acuteLimbIschemia: {
    initial: { age: 68, hr: 104, sbp: 132, rr: 18, glu: 100, pain: 9 },
    progress(pat, dt) {
      // OCCLUSION SEVERITY -- NOT 1.0 by default. Real embolic occlusion of
      // a previously healthy artery (no pre-existing PAD collateral
      // network -- this patient's own risk factor is atrial fibrillation,
      // not claudication) still leaves a real, if severely reduced, distal
      // flow through genicular/profunda-type collaterals immediately after
      // lodging (Rutherford/vascular-surgery teaching on acute-vs-chronic
      // occlusion collateral index; classic acute-occlusion studies put
      // immediate distal perfusion at roughly 10-20% of normal in an
      // unheralded embolic occlusion, i.e. occlusion ~0.80-0.90, well short
      // of 1.0). Seeded at 0.85 to match this scenario's own "40 minutes
      // ago" onset (some early propagation already occurred), then
      // continuing to worsen slowly toward 0.95 over the following ~2h as
      // stagnant distal blood propagates the thrombus proximally AND
      // distally without treatment -- a real, teachable "the clock is
      // running" point, not a step function. Capped below 1.0: even a
      // neglected embolic occlusion this severe is not the same as a
      // tourniquet's true zero-flow.
      // TREATMENT: real embolic limb ischemia has no prehospital-reversible
      // fix -- embolectomy/thrombolysis (definitive care) cannot be done in
      // the field, the same honest "recognize and transport fast" posture
      // this document already gives myocarditis. The one real, formulary-
      // relevant exception: heparin (pat.anticoagulant, the SAME handle
      // ACS/PE already use) is real, guideline-supported field/ED bridge
      // therapy here TOO -- it does not dissolve the existing embolus, but
      // it does slow further thrombus PROPAGATION, so it damps (not
      // reverses) the occlusion-worsening term below rather than fixing
      // occlusion itself.
      const antiCoag = clamp(pat.anticoagulant ?? 0, 0, 1);
      if (pat.limbOcclusion.legL < 0.85) pat.limbOcclusion.legL = 0.85;
      pat.limbOcclusion.legL = Math.min(0.95, pat.limbOcclusion.legL + dt * 0.0008 * (1 - antiCoag));
      // Severe ischemic pain is the dominant, defining prehospital finding
      // (Rutherford class I/IIa -- salvageable, but only if recognized and
      // transported fast); pat.intrinsicPain (queue item 20) is the correct
      // handle, the same "local exam finding, not a systemic mechanism"
      // idiom deepVeinThrombosis/ovarianTorsion already use for
      // single-limb/regional pain that has no separate systemic pathway.
      pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 9, 9);
    },
  },

  // ===== DEEP VEIN THROMBOSIS =====
  // The mechanistic and teaching-point OPPOSITE of acuteLimbIschemia
  // above: a warm, swollen, tender limb (venous outflow obstruction, not
  // arterial occlusion) with a real but much smaller systemic footprint —
  // the actual danger (pulmonary embolism, already its own separately-
  // shipped condition) is a possible FUTURE complication, not part of this
  // presentation itself. Deliberately modest pain and a normal exam
  // otherwise, per the same "mostly local, narrative not decorative"
  // idiom minorSprain uses — the real field lesson is recognition and NOT
  // provoking embolization (no aggressive limb manipulation/massage), not
  // a vitals mechanism.
  deepVeinThrombosis: {
    initial: { age: 63, hr: 92, sbp: 128, rr: 16, glu: 100, pain: 3 },
  },

  // ===== PANIC ATTACK / HYPERVENTILATION SYNDROME =====
  // Item 7's own suggested first-batch text names this explicitly: "a good
  // early target — it exercises the respiratory controller directly, and
  // the hypocapnic brake is the exact mechanism that should limit it."
  // Modelled as a real, sustained elevated respiratory rate (rrBase) with
  // NO other physiological insult — respiratory.js's own already-existing
  // hypocapnicBrake term (respiratory.js:192, floored at 0.55, never fully
  // suppressing effort) then does the rest: PaCO2 genuinely falls (real
  // respiratory alkalosis, the actual source of the perioral tingling/
  // carpopedal spasm this presentation is known for) while the brake
  // keeps it from an implausible runaway. No progress() is needed — the
  // point of this condition is that voluntary/anxiety-driven
  // hyperventilation is a REAL but SELF-LIMITED physiological state, not
  // a progressive disease process, which is itself the field teaching
  // point (this patient does not need epinephrine or oxygen — she needs
  // reassurance and coached breathing, and recognizing that requires
  // ruling out the genuine emergencies that can look identical: PE, DKA,
  // salicylate toxicity, a real cardiac event).
  panicAttackHyperventilation: {
    initial: { age: 27, hr: 108, sbp: 128, rr: 32, glu: 100, pain: 1 },
  },

  // ===== ECTOPIC PREGNANCY, RUPTURED =====
  // Queue item 7's OB/GYN backlog. A tubal pregnancy (~7 weeks gestation)
  // rupturing into the peritoneum — real, common (the leading cause of
  // first-trimester maternal mortality), and genuinely distinct from every
  // other OB condition in this library, which all sit at term. Deliberately
  // does NOT call establishPregnancy: obstetric.js's own gestationFactor
  // (`clamp((gestation-6)/26, 0, 1)`) is ~0 at 7 weeks — confirmed by
  // reading the formula before writing this condition — so a 7-week
  // pregnancy has essentially none of the cardiovascular adaptation
  // (volume expansion, reduced SVR) that makes a TERM pregnant patient's
  // physiology distinct from a non-pregnant one. Invoking the full
  // pregnancy-adaptation machinery here would be inert scaffolding, not a
  // mechanism — this patient's physiology at rupture is ordinary
  // hemorrhagic shock, and that is the honest teaching point (a positive
  // pregnancy test plus hemorrhagic shock in a woman of reproductive age
  // IS the diagnosis, not a hint that needs a pregnancy-adaptation curve
  // to make sense). Reuses pat.activeBleedRate — the same mass-conserving
  // hemorrhage mechanism every other internal bleed in this library uses —
  // and pat.intrinsicPain (queue item 20) for the real, sudden, one-sided
  // pelvic pain a tubal rupture produces. Bleed ceiling (0.30) is set at
  // the severe end of this library's internal-hemorrhage range —
  // comparable to the retroperitoneal AAA bleed below — since a ruptured
  // ectopic bleeds directly and briskly into the free peritoneal cavity,
  // unlike a GI bleed's slower luminal route.
  ectopicPregnancyRuptured: {
    initial: { age: 26, hr: 118, sbp: 92, rr: 20, glu: 100, pain: 8, blood: 5.0 },
    progress(pat, dt) {
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.006, 0.08, 0.30);
      pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 8, 8);
    },
  },

  // ===== PLACENTAL ABRUPTION =====
  // Premature separation of a normally-implanted placenta — sudden, painful,
  // dark ("port-wine") vaginal bleeding, often with a tender/rigid abdomen
  // and, unlike placenta previa below, a real risk of fetal compromise from
  // loss of placental surface area. Chosen at 36 weeks (establishPregnancy,
  // gestationFactor~1) specifically so the TERM pregnancy adaptations
  // (expanded plasma volume, low resting SVR) are fully active — the same
  // reason a pregnant trauma patient's hemorrhage tolerance differs from a
  // non-pregnant one, and the actual clinical trap this condition exists to
  // teach: she can lose a real volume of blood before her vitals show it,
  // because she is starting from an expanded baseline. laborProgress/
  // contractionRate are held at 0 (the preeclampsia idiom) — abruption's own
  // pain and bleeding are the point, not a precipitous delivery, which is a
  // different scenario. Reuses pat.activeBleedRate (severe: much of the
  // hemorrhage in abruption is CONCEALED behind the placenta, not fully
  // visible as vaginal bleeding, which is why the ceiling here is set at the
  // same severe band as the ruptured ectopic above rather than the milder
  // GI-bleed band) and pat.intrinsicPain (severe, sudden — the real
  // contrast with previa's painless bleed below).
  placentalAbruption: {
    initial: { age: 29, weight: 78, height: 163, hr: 112, glu: 100, pain: 8 },
    progress(pat, dt, s) {
      const preg = establishPregnancy(pat, {
        gestation: 36, laborProgress: 0, contractionRate: 0,
      });
      preg.tilted = !(s && s.supine === true);
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.005, 0.06, 0.28);
      pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 8, 8);
      // Placental exchange surface is lost roughly in proportion to how much
      // of the placental bed has separated — the same real quantity driving
      // the concealed-hemorrhage severity above, so it is re-derived from
      // activeBleedRate's own ceiling rather than a second, independent
      // dial: a 30-70% surface loss is the real range for a clinically
      // significant (non-trivial) abruption, per Williams Obstetrics — this
      // is the input to obstetric.js's fetal heart rate mechanism (queue
      // item V2-28), the real reason abruption is a fetal, not just
      // maternal, emergency.
      const bleedFrac = clamp(((pat.activeBleedRate || 0) - 0.06) / (0.28 - 0.06), 0, 1);
      preg.placentalAbruptionFactor = 0.3 + bleedFrac * 0.4;
    },
  },

  // ===== PLACENTA PREVIA =====
  // The deliberate mechanistic and teaching-point CONTRAST with
  // placentalAbruption above: painless bright-red vaginal bleeding from a
  // placenta implanted over or near the cervical os, at a gestation
  // (34 weeks) chosen to land inside the same PE_SEV0-style "already
  // established disease" window preeclampsia uses, again with laborProgress/
  // contractionRate held at 0 — labor with an undelivered previa is itself
  // catastrophic and out of scope for this condition's own teaching point,
  // which is recognizing the painless-bleeding pattern and the absolute
  // contraindication it implies (no digital vaginal exam in the field).
  // Reuses the same pat.activeBleedRate mechanism at a milder ceiling than
  // abruption's (previa bleeds are typically self-limited sentinel episodes
  // rather than a single catastrophic event) and pain is left at baseline —
  // the pain:1 default the shared vitals path already applies for an
  // otherwise-uninjured patient — rather than raised, since a positive pain
  // finding here would be the actual example item 1 of section 1's
  // "written, never read" defect class in reverse: a scripted finding that
  // contradicts the disease's own defining feature.
  placentaPrevia: {
    initial: { age: 31, weight: 80, height: 165, hr: 96, glu: 100, pain: 1 },
    progress(pat, dt, s) {
      const preg = establishPregnancy(pat, {
        gestation: 34, laborProgress: 0, contractionRate: 0,
      });
      preg.tilted = !(s && s.supine === true);
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.003, 0.03, 0.14);
    },
  },

  // ===== OVARIAN TORSION =====
  // Sudden, severe, unilateral pelvic pain from an ovary twisting on its
  // vascular pedicle — a real surgical emergency, but one whose prehospital
  // physiology is almost entirely local pain, the same honest "no
  // progress() needed" idiom acuteLimbIschemia/deepVeinThrombosis already
  // establish once pat.intrinsicPain (queue item 20) existed to hang real
  // severe pain on. Deliberately paired with rupturedOvarianCyst below as a
  // genuine contrast: torsion is pain WITHOUT hemorrhage (the pedicle is
  // twisted, not torn), cyst rupture is pain WITH a real, if modest,
  // hemoperitoneum — the actual distinction a candidate is being trained to
  // consider, even though both present with acute unilateral pelvic pain and
  // neither is reliably distinguishable in the field (both are "get her to a
  // facility that can do an ultrasound," which is itself the honest field
  // lesson).
  ovarianTorsion: {
    initial: { age: 24, hr: 108, sbp: 122, rr: 18, glu: 100, pain: 9 },
  },

  // ===== RUPTURED OVARIAN CYST =====
  // The mechanistic contrast with ovarianTorsion immediately above: real,
  // if modest, intraperitoneal hemorrhage from a ruptured corpus luteum or
  // follicular cyst, reusing pat.activeBleedRate at a mild ceiling (most
  // ruptured ovarian cysts cause a self-limited hemoperitoneum that
  // tamponades on its own — a hemorrhagic-shock-grade bleed here would
  // misrepresent how this disease actually behaves) alongside real,
  // severe, sudden-onset pain (pat.intrinsicPain) matching torsion's own
  // presentation at first contact.
  rupturedOvarianCyst: {
    initial: { age: 27, hr: 100, sbp: 118, rr: 18, glu: 100, pain: 8, blood: 5.1 },
    progress(pat, dt) {
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.002, 0.02, 0.10);
      pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 8, 8);
    },
  },

  // ===== ABDOMINAL AORTIC ANEURYSM, RUPTURED =====
  // The vascular-catastrophe entry this library has been missing: a
  // retroperitoneal aortic rupture producing the classic triad (severe
  // abdominal/back pain, hypotension, a pulsatile abdominal mass — the
  // mass itself is a real exam finding this engine has no mechanism for
  // and is therefore left to the scenario's own narrative text, the same
  // "local exam finding, not a systemic mechanism" treatment
  // acuteLimbIschemia's 6 P's already get). Reuses pat.activeBleedRate at
  // the most severe ceiling in this whole batch — a retroperitoneal
  // rupture bleeds into a real anatomic space that can hold several liters
  // before tamponading against the posterior peritoneum, which is exactly
  // why these patients can look transiently stable ("in extremis but
  // talking") before decompensating suddenly, a real and teachable
  // trajectory rather than a step-function collapse. pat.intrinsicPain
  // reflects the classic tearing/ripping quality, radiating to the back —
  // narrated in the scenario, not separately modeled (this engine has no
  // pain-location field, the same limitation already noted for palp/abdo
  // probes in CLAUDE.md's own F9 entry).
  abdominalAorticAneurysm: {
    initial: { age: 71, hr: 116, sbp: 88, rr: 20, glu: 100, pain: 9, blood: 5.0 },
    progress(pat, dt) {
      pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.007, 0.10, 0.34);
      pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 9, 9);
    },
  },

  // ===== ACUTE PANCREATITIS =====
  // Autodigestion of the pancreas by its own activated enzymes — severe,
  // constant epigastric pain radiating to the back (pat.intrinsicPain), and
  // a real, systemic SIRS-driven capillary leak: released pancreatic
  // enzymes and inflammatory mediators injure the vascular endothelium well
  // beyond the pancreas itself, producing genuine third-spacing (fluid
  // shifts out of the intravascular space into the retroperitoneum and
  // peritoneal cavity — "third-spacing" is the actual textbook term for
  // this disease's fluid loss). Reuses pat.capillaryLeak, the SAME
  // whole-body endothelial-injury handle preeclampsia already established
  // (metabolic.js's updateFluidShifts reads it directly, confirmed by
  // reading that condition's own comment before reusing the field) — at a
  // moderate severity (0.20), well below preeclampsia's 0.30-at-full-
  // severity ceiling, since pancreatitis's capillary injury is real but
  // regional/inflammatory rather than the diffuse antiangiogenic process
  // preeclampsia produces. No hemorrhage mechanism — pancreatitis is a
  // volume-distribution problem, not a bleed, and giving it activeBleedRate
  // would be the wrong mechanism for the wrong disease.
  // QUEUE ITEM 46 migration, partial and deliberate — read this before
  // touching either the leak or the new pathogenBurden line below.
  // Investigated migrating this condition fully onto the shared
  // inflammation cascade (inflammation.js) and measured (not assumed) that
  // a full swap would REGRESS an already-shipped, already-measured
  // trajectory: the cascade's own capillaryLeak ratchet is deliberately
  // slow (INFLAM_LEAK_RATE=0.0025/min, calibrated for pneumoniaSepsis's
  // hours-to-days septic process), so reaching this condition's own
  // already-documented 0.20 ceiling through the cascade alone would take
  // ~80 minutes — nowhere near a realistic call length, and nowhere near
  // the original (instant-floor) 0.20 this condition has presented at
  // since it shipped (the fluid-shift trend this document's own section 3
  // measured, plasmaVol 2.686->2.586 over 15 minutes, is driven entirely
  // by that 0.20 floor). Routing leak through the cascade would either
  // silently under-deliver that regression, or need capillaryLeak
  // pre-seeded directly anyway — at which point the cascade adds nothing
  // this condition doesn't already have for that one consequence. So the
  // leak stays on its own dedicated, unchanged mechanism (below), and
  // pathogenBurden is added ONLY for the two consequences that genuinely
  // ARE new: real fever and real coagulopathy risk (see below).
  acutePancreatitis: {
    initial: { age: 52, hr: 108, sbp: 108, rr: 18, glu: 130, pain: 8 },
    progress(pat) {
      pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 8, 8);
      pat.capillaryLeak = Math.max(pat.capillaryLeak ?? 0, 0.20);

      // Real acute pancreatitis is a genuine SIRS trigger (pancreatic
      // autodigestion releases DAMPs into the retroperitoneum) — a
      // measurable fever and a real, if modest, consumptive-coagulopathy
      // risk (both are documented Ranson/APACHE-II severity markers) are
      // genuine, previously-absent findings for this condition, now real
      // via inflammation.js's shared cascade rather than narrated. Seeded
      // MODERATE, not maximal, and cytokineLoad is pre-seeded PARTIALLY
      // (not fully equilibrated the way pneumoniaSepsis's own days-old
      // presentation is): by the time EMS is called, the pain — and the
      // autodigestion driving it — has typically been building for HOURS,
      // not days, so a real but incomplete systemic response is the honest
      // starting point.
      if (!pat._pancInflamSeeded) {
        pat._pancInflamSeeded = true;
        pat.pathogenBurden = Math.max(pat.pathogenBurden || 0, 0.5);
        pat.cytokineLoad = Math.max(pat.cytokineLoad || 0, 0.35);
      }
    },
  },

  // ===== BOWEL OBSTRUCTION =====
  // Mechanical obstruction (adhesions, hernia, malignancy) halts forward GI
  // transit — real, colicky, crampy pat.intrinsicPain (the actual character
  // distinguishing it from pancreatitis's constant pain above) plus real
  // volume depletion from vomiting and fluid sequestration into the
  // obstructed, distended bowel lumen — a THIRD real route to dehydration
  // in this library, alongside hypernatremia's simple free-water loss and
  // pancreatitis's capillary-leak third-spacing above: bowel obstruction
  // loses isotonic fluid from BOTH the plasma and interstitial
  // compartments into the gut lumen itself, the same "ecfWater" pair
  // hypernatremia's own comment already documents draining, reused here
  // verbatim rather than inventing a fourth fluid-loss idiom for what is
  // mechanistically the same kind of compartment loss. Deliberately does
  // NOT touch serum sodium (unlike hypernatremia, isotonic gut-lumen loss
  // does not concentrate the remaining serum) — confirmed by NOT writing
  // pat.na/naMass here, leaving sodium to track normally.
  bowelObstruction: {
    initial: { age: 67, hr: 106, sbp: 110, rr: 18, glu: 100, pain: 6 },
    progress(pat, dt) {
      pat._boColicPhase = (pat._boColicPhase ?? 0) + dt * 0.8;
      pat.intrinsicPain = clamp(6 + 2 * Math.sin(pat._boColicPhase), 4, 8);
      pat.plasmaVol = Math.max(1.6, pat.plasmaVol - dt * 0.0025);
      pat.interstitialVol = Math.max(2.8, pat.interstitialVol - dt * 0.006);
      pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
    },
  },

  // ===== INCARCERATED HERNIA (with strangulation risk) ===== (GI/abdominal
  // pick, queue item 7 — confirmed unbuilt by grep before starting: no
  // "hernia" condition existed anywhere in this file).
  //
  // A real, distinct mechanical-obstruction entity from bowelObstruction
  // above (same downstream physiology once obstructed — colicky pain,
  // isotonic third-spacing into the trapped loop — reused verbatim, not
  // reinvented), but with a genuine, field-relevant complication
  // bowelObstruction's adhesion/malignancy etiology does not carry the
  // same way: STRANGULATION. An incarcerated (non-reducible) hernia
  // compresses the mesenteric vessels supplying the trapped bowel loop
  // at the hernia neck — a real, LOCAL vascular compromise, not a
  // systemic-perfusion-driven one, which is why this reuses gutInjury as
  // a DIRECT-write accumulator (the same "this condition presents already
  // carrying a fixed injury, seeded and held/advanced rather than derived
  // from systemic alphaTone" idiom hypoxicBrainInjury's own comment
  // documents) instead of waiting for neuro.js's systemic gutDO2 pathway,
  // which would never engage for a well-perfused patient whose only
  // problem is one strangulated loop.
  incarceratedHernia: {
    initial: { age: 58, hr: 104, sbp: 128, rr: 18, glu: 100, pain: 7 },
    progress(pat, dt) {
      // Colicky obstructive pain — identical shape to bowelObstruction's
      // own oscillation above (same mechanical-obstruction physiology).
      pat._hernColicPhase = (pat._hernColicPhase ?? 0) + dt * 0.8;
      pat.intrinsicPain = clamp(6 + 2 * Math.sin(pat._hernColicPhase), 4, 8);
      // Isotonic third-spacing into the obstructed loop — identical
      // mechanism/handles to bowelObstruction above.
      pat.plasmaVol = Math.max(1.6, pat.plasmaVol - dt * 0.0025);
      pat.interstitialVol = Math.max(2.8, pat.interstitialVol - dt * 0.006);
      pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
      // STRANGULATION: local mesenteric compression at the hernia neck,
      // seeded already underway (this scenario's own history: a known
      // hernia, now irreducible and tender for several hours) and
      // advancing slowly toward the "loop is dying" ceiling. A field
      // provider cannot reduce a strangulated hernia (reduction of a
      // hernia with suspected strangulation is explicitly
      // contraindicated in real teaching — it can push nonviable, soon-
      // to-perforate bowel back into the abdomen — so this is honestly
      // a "recognize and transport for surgery" presentation, the same
      // posture acuteLimbIschemia's own comment already takes for a
      // field-irreversible vascular occlusion).
      //
      // RATE, measured against a real opposing pull (throwaway probe,
      // stripped, lesson 8): neuro.js's own updateOrganInjury runs every
      // tick AFTER conditions.progress() and, for a patient who is NOT
      // systemically ischemic (this condition's whole point — the injury
      // here is LOCAL, at the hernia neck, not from a falling gutDO2), its
      // own resting-recovery branch decays gutInjury by 0.005/min
      // unconditionally. A first version of this line at 0.0015/min was
      // silently erased every tick, net negative, and gutInjury never
      // once left 0 across a real 300s measurement — the same "written,
      // read, but fought to a standstill" defect class neonatalSepsis's
      // own coreTemp comment documents on a different field. Raised with
      // real margin above that 0.005/min floor.
      pat.gutInjury = Math.min(0.4, (pat.gutInjury ?? 0) + dt * 0.026);
      // Once the strangulated segment has been compromised long enough
      // to start breaking down, a real, modest GI bleed/mucosal-slough
      // component begins — the same gutInjury-gated onset
      // acuteMesentericIschemia's own comment already establishes for
      // "the bowel wall is physically failing, not an abstract clock",
      // ceilinged far below acuteMesentericIschemia's own systemic-
      // ischemia bleed rate since this is one localized loop, not a
      // whole vascular territory.
      if ((pat.gutInjury ?? 0) > 0.2) {
        pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.0008, 0.01, 0.06);
      }
    },
  },

  // ===== INTUSSUSCEPTION ===== (pediatric batch, queue item 7)
  //
  // Telescoping of a proximal bowel segment into the adjacent distal
  // segment (classically ileocolic) — a real pediatric surgical
  // emergency, most common cause of bowel obstruction in infants/toddlers
  // (6mo-3yr peak incidence). Age via ageProfile.js: 0.9 years (~11
  // months), defaultWeight(0.9) is 8 kg.
  //
  // THE REAL, DISTINCT PAIN PATTERN: classic intussusception pain is not
  // bowelObstruction's continuous-with-oscillating-intensity colic — it
  // is genuinely EPISODIC, with the child screaming/drawing the knees up
  // for a couple of minutes, then returning to comfortable, even playful,
  // baseline between episodes (the real "lethargic between episodes" vs.
  // "acting normally between episodes" distinction is itself a clinical
  // clue — see pat.metabolicEncephalopathy below). Checked before
  // building: bowelObstruction's own pat._boColicPhase sine wave (4-8,
  // never pain-free) is the only existing oscillating-pain precedent in
  // this file, and it does not reach zero — a genuinely NEW pattern for
  // pat.intrinsicPain, built here as a squared/clamped sine that spends
  // most of its cycle pinned near the floor and spikes sharply rather
  // than smoothly riding a sine's whole range, so it reads as discrete
  // severe episodes against a comfortable baseline, not a continuous ache
  // that merely varies.
  //
  // "Currant jelly" stool (blood/mucus, from the telescoped segment's
  // venous congestion and mucosal sloughing) is a real classic finding,
  // but it is a NARRATIVE/exam finding (a scenario's own probe/history
  // text), not a distinct physiologic quantity this engine needs a new
  // field for — the same "exam finding, not a systemic mechanism" call
  // this file already makes for the 6 P's of acute limb ischemia.
  //
  // RISK OF ISCHEMIA/PERFORATION IF PROLONGED: reuses gutInjury as a
  // direct-write local accumulator, the identical idiom incarceratedHernia
  // above uses and justifies — mesenteric compression at the leading edge
  // of the intussusceptum is a local vascular problem, not a systemic-
  // perfusion one.
  //
  // FIELD TREATMENT IS SUPPORTIVE ONLY, stated honestly: no field
  // reduction is possible (real reduction is a radiology-guided
  // air/contrast enema or surgery) — this condition has no
  // curative-intervention flag at all, only IV access/fluids/analgesia
  // and rapid transport, the same honest "recognize and transport, this
  // engine has no field-reversible fix" posture acuteLimbIschemia and
  // incarceratedHernia above both already take for their own
  // surgical-emergency mechanisms.
  intussusception: {
    initial: { age: 0.9, weight: 8, hr: 140, rr: 30, glu: 95, pain: 2 },
    progress(pat, dt) {
      // Episodic colicky pain: a squared sine spends most of its cycle
      // near zero and spikes sharply, unlike bowelObstruction's smoother
      // continuous oscillation — see the header comment above for why
      // this is a genuinely new pattern for pat.intrinsicPain.
      pat._intussPhase = (pat._intussPhase ?? 0) + dt * 0.35;
      const s = Math.sin(pat._intussPhase);
      const spike = s > 0 ? s * s : 0;   // 0 for roughly half the cycle
      pat.intrinsicPain = clamp(1 + spike * 8, 1, 9);
      // Between-episode behavior: real intussusception's own clinical
      // teaching point is that a child can look deceptively well between
      // episodes early on, then becomes genuinely lethargic as the
      // process continues untreated (a real, described progression, not
      // this engine inventing a symptom) — a small, slowly-rising
      // metabolicEncephalopathy floor represents that drift toward
      // between-episode lethargy, reusing the same general handle every
      // other "child looks progressively sicker" condition in this file
      // already uses.
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0,
        Math.min(0.3, (pat.metabolicEncephalopathy || 0) + dt * 0.0004));
      // Local mesenteric compression at the intussusceptum's leading
      // edge — same direct-write local-injury idiom incarceratedHernia
      // above uses (see that condition's own comment for the real
      // opposing-decay measurement that set the rate's floor: neuro.js's
      // updateOrganInjury decays a non-systemically-ischemic patient's
      // gutInjury by 0.005/min every tick, so this must clear that with
      // real margin or be silently erased), at a somewhat slower net rate
      // than incarceratedHernia (a telescoped segment's compression is
      // real but on average less abruptly occlusive than a tight
      // hernia-neck strangulation).
      pat.gutInjury = Math.min(0.35, (pat.gutInjury ?? 0) + dt * 0.021);
      // Once the bowel wall has been compromised long enough, the real
      // "currant jelly" venous congestion/mucosal sloughing becomes an
      // actual measurable GI blood loss — same gutInjury-gated onset
      // idiom acuteMesentericIschemia/incarceratedHernia both already
      // establish, ceilinged low (this is oozing/sloughing, not a brisk
      // hemorrhage).
      if ((pat.gutInjury ?? 0) > 0.15) {
        pat.activeBleedRate = clamp((pat.activeBleedRate || 0) + dt * 0.0006, 0.005, 0.04);
      }
    },
  },

  // ===== CROTALINE (PIT VIPER) ENVENOMATION =====
  // Queue item 57 — found while implementing TP 1224/1224-P (Stings/
  // Venomous Bites): no condition represented a bite/sting at all, so the
  // protocol's own text reused only the generic allergy/shock/nausea
  // baseline. Real crotaline (rattlesnake/copperhead/cottonmouth) venom
  // contains metalloproteinases and serine proteases that DIRECTLY degrade
  // fibrinogen and activate factor X/prothrombin — a genuine consumptive
  // coagulopathy, mechanistically distinct from the tissue-factor/cytokine
  // route this engine's OWN sepsis-DIC term (coagulation.js's
  // pat.cytokineLoad-scaled tfConsumption) already models, and deliberately
  // NOT reused here for the same reason queue item 61 refused to reuse
  // pat.edema for angioedema: superficially similar endpoint (falling
  // factors/platelets), genuinely different upstream cause. This condition
  // writes pat.factorII/V/VIII/X, pat.fibrinogen and pat.plateletCount
  // directly instead, the SAME "ceiling, re-imposed every tick against
  // coagulation.js's own hepatic-synthesis/marrow-release recovery pull"
  // idiom preeclampsia's HELLP-pattern platelet term already established
  // just above bowelObstruction in this file.
  //
  // MAGNITUDE/RATE: no minute-level published progression rate was found
  // (stated honestly, per this project's own "if you cannot find a
  // documented anchor, say so" allowance) — the clinical literature on
  // crotaline envenomation documents thrombocytopenia and
  // hypofibrinogenemia as a real, often-early finding (some moderate/severe
  // envenomations show lab abnormalities within the first hour), but full
  // defibrination is typically an hours-scale process, not a prehospital-
  // encounter-scale one. `venomLoad` therefore ramps slowly (0 to a 0.6
  // ceiling over the encounter, `_veRate` below), producing a real,
  // measurable, but deliberately MODEST decline over a realistic 20-40
  // minute field encounter — present and directionally correct, short of
  // the severe multi-hour defibrination syndrome this engine has no reason
  // to simulate for a call that ends at hospital handoff.
  //
  // LOCAL TISSUE INJURY: severe local pain out of proportion to the visible
  // wound is a real, clinically distinguishing feature of pit viper
  // envenomation (unlike most elapid bites, which are often painless at
  // first) — represented with pat.intrinsicPain (queue item 20's real,
  // persistent pain handle), NOT a new dedicated tissue-necrosis field: a
  // genuinely separate local-tissue-necrosis mechanism (progressive
  // compartment-syndrome-like swelling) was considered and deliberately
  // NOT built, since pat.limbInjury (neuro.js) is a vascular-occlusion/
  // ischemia mechanism (compartment syndrome, tourniquet time) with its own
  // distinct real cause — reusing it for venom-driven local tissue injury
  // would be exactly the same kind of mechanism mismatch this condition's
  // own coagulopathy design above refuses to make with cytokineLoad.
  //
  // NO FIELD DRUG: TP 1224's own text (laCounty.js's header comment) has no
  // antivenom step — real crotaline antivenom (CroFab/Anavip) is a
  // hospital-administered product requiring skin testing and monitored
  // infusion, never carried on a field unit. The honest field job is
  // limb immobilization at heart level, marking/timing progression, and
  // rapid transport — same "no field hemostasis, the honest job is
  // supportive care and minimizing scene time" pattern
  // esophagealVaricealHemorrhage's own comment already documents for a
  // different bleeding source this engine also cannot pharmacologically
  // reverse in the field.
  // Thermal burn / TBSA (queue item 56, found while implementing TP 1220/
  // 1220-P — Burns). The protocol's own field steps key off burn SIZE (cool
  // running water <30% TBSA, escalated fluid resuscitation >10% TBSA,
  // cooling contraindicated for airway burns) and this engine tracked no
  // structured TBSA state at all before this — burns/wounds were narrative
  // only (per-scenario `wounds:` objects, `type:"burn"` at most).
  //
  // MECHANISM 1 — CAPILLARY LEAK (Parkland-formula-adjacent). A major burn
  // (ABA convention: >20% TBSA) causes a real, well-documented systemic
  // capillary leak syndrome, not just local wound exudate — burn-released
  // inflammatory mediators (histamine, thromboxane, cytokines) increase
  // microvascular permeability BODY-WIDE, not just at the burn site, which
  // is the entire physiologic reason Parkland-style formulas front-load
  // massive crystalloid volume (4 mL/kg/%TBSA) in the first 24h (Rae &
  // Fortuna, "Burn resuscitation," Curr Opin Crit Care 2011; Pham et al.,
  // "American Burn Association practice guidelines," J Burn Care Res
  // 2008). Wired through pat.capillaryLeak — the SAME whole-body
  // endothelial-injury handle preeclampsia/sepsis/pancreatitis already use
  // (metabolic.js's updateFluidShifts derives sigma/Kf from it), not a
  // parallel field — reused at burns' own real threshold and magnitude:
  // negligible below ~20% TBSA (a small burn's leak is local wound edema,
  // not a systemic Starling-block state, which is exactly why aspiration
  // Pneumonitis's own comment above draws the same local-vs-systemic line),
  // ramping to a genuinely severe (0.5 ceiling, above pancreatitis's 0.2 and
  // below septic shock's own peak) systemic leak by ~80%+ TBSA. Ratcheted
  // in over real time (not instant) — burn capillary leak develops over the
  // first several hours post-injury, not immediately at the scene (Pham et
  // al., ibid) — using the same clamp-toward-a-ceiling idiom
  // toxicInhalationChlorine's own capillaryLeak ramp already uses.
  //
  // MECHANISM 2 — IMPAIRED SKIN BARRIER -> HEAT LOSS. Burned skin has lost
  // the stratum corneum's evaporative/insulating barrier — real, major
  // burns are a well-documented cause of hypothermia in the field
  // (increased convective/radiative loss from denuded skin plus increased
  // evaporative water loss from wound exudate; ABA guidelines list active
  // warming as a first-line burn-care step for exactly this reason). Wired
  // directly off pat.burnTbsaFraction in thermo.js's updateTemperature
  // (no separate "skin barrier" field existed to reuse — confirmed by grep
  // before writing anything, per lesson 16 — so burnTbsaFraction IS that
  // handle, read directly rather than duplicated into a second field with
  // one consumer).
  //
  // TREATMENT: escalated fluid resuscitation (TP 1220's own >10% TBSA step)
  // needs no new drug entry — `saline`'s existing fx.blood plasma-volume
  // bolus already counters the Starling-equation fluid shift this
  // condition's capillaryLeak drives (metabolic.js), the identical
  // mechanism every other capillaryLeak condition's fluid response already
  // uses. Cooling (contraindicated for airway burns per TP 1220) is a
  // protocol-content decision (laCounty.js), not a physiology mechanism —
  // deliberately out of scope here, matching this item's own physiology-
  // engine framing.
  //
  // No vitals in `initial` — a burn's severity is expressed entirely
  // through pat.burnTbsaFraction (patient.js constructor, scenario-
  // authored via `patient:{burnTbsaFraction:...}`), matching the "condition
  // declares the lesion, engine derives the consequence" idiom
  // pathogenBurden already established. A scenario with burnTbsaFraction=0
  // (or this condition unused) sees exactly zero consequence — verified
  // below.
  thermalBurn: {
    initial: {},
    progress(pat, dt) {
      const tbsa = clamp(pat.burnTbsaFraction ?? 0, 0, 1);
      if (tbsa <= 0) return;
      // Leak target: 0 at <=20% TBSA, ramping linearly to 0.5 at 80%+ TBSA.
      const leakTarget = clamp((tbsa - 0.20) / 0.6, 0, 1) * 0.5;
      if (leakTarget > 0) {
        pat.capillaryLeak = clamp((pat.capillaryLeak ?? 0) + dt * 0.012, 0, leakTarget);
      }
    },
  },

  envenomation: {
    initial: { hr: 104, sbp: 128, rr: 20, glu: 100, pain: 7 },
    progress(pat, dt) {
      pat.intrinsicPain = clamp((pat.intrinsicPain ?? 7) + dt * 0.02, 5, 9);
      pat._venomLoad = Math.min(0.6, (pat._venomLoad ?? 0) + dt * 0.02);
      const v = pat._venomLoad;
      const factorCeil = 100 - 55 * v;   // 100 -> 67 at full field-encounter severity
      const pltCeil = 250 - 140 * v;     // 250 -> 166
      const fibCeil = 3 - 1.4 * v;       // 3 -> 2.16 mg/dL-equivalent units
      if (pat.factorII > factorCeil) pat.factorII = factorCeil;
      if (pat.factorV > factorCeil) pat.factorV = factorCeil;
      if (pat.factorVIII > factorCeil) pat.factorVIII = factorCeil;
      if (pat.factorX > factorCeil) pat.factorX = factorCeil;
      if (pat.plateletCount > pltCeil) pat.plateletCount = pltCeil;
      if (pat.fibrinogen > fibCeil) pat.fibrinogen = fibCeil;
    },
  },

  // Cholinergic toxidrome / organophosphate (nerve-agent-class) poisoning
  // (queue item 67, filed while implementing TP 1240/1240-P's HAZMAT
  // nerve-agent algorithm). The SEVERE tier of that protocol already has
  // real signals (apnea/seizure/spo2<90) and a real rule (hazmatDuodoteSevere,
  // laCounty.js), but MILD/MODERATE is defined entirely by pupil size and
  // secretions this engine tracked nowhere (grep-confirmed before writing
  // anything: no pupil-diameter field anywhere, no glandular-secretion-volume
  // field distinct from airwayFluid's aspirated/edema-fluid mechanism).
  //
  // MECHANISM: organophosphate/nerve-agent poisoning irreversibly inhibits
  // acetylcholinesterase, so acetylcholine accumulates at both muscarinic and
  // nicotinic synapses (Eddleston et al., "Management of acute
  // organophosphorus pesticide poisoning," Lancet 2008; StatPearls
  // "Organophosphate Toxicity"). Scoped to the MUSCARINIC half only
  // (SLUDGE/killer-B's — Salivation, Lacrimation, Urination, Defecation, GI
  // distress, Emesis / Bradycardia, Bronchorrhea, Bronchospasm), which is
  // both the real, clinically dominant cause of death (bronchorrhea +
  // bronchospasm drowning the airway, compounded by bradycardia-driven low
  // output) and exactly what atropine is first-line for. Nicotinic effects
  // (fasciculations, weakness, and a nicotinic tachycardia that can partly
  // mask the muscarinic bradycardia) are a genuinely separate receptor class,
  // deliberately NOT modeled here — scoped down to the core toxidrome +
  // atropine response per this batch's own instruction, not a full
  // mass-casualty nerve-agent build.
  //
  // WIRED THROUGH EXISTING HANDLES, reusing rather than duplicating. The
  // bradycardia drives pat.parasympathetic — the SAME axis atropine's own
  // vagalBlock already antagonizes, both in updateCardiovascular's direct hr
  // term and updateConduction's effPara (see atropineOverdose /
  // secondDegreeAVBlockTypeI's own comments for that mechanism's history) —
  // so atropine works here through the identical receptor-level mechanism it
  // already uses everywhere else in this engine, not a parallel one. The
  // bronchorrhea/bronchospasm drives pat.broncho — the SAME axis asthma /
  // anaphylaxis / toxicInhalationChlorine already drive (respiratory.js's
  // effectiveBroncho -> Rexp -> work-of-breathing/hypoxia chain) — at a
  // genuinely different magnitude and time course from any of them, per this
  // item's own "reuse the mechanism, not the same magnitude" instruction.
  // Glandular hypersecretion has no dedicated volume field in this engine (a
  // gap this same queue item already names for airwayFluid, a mechanically
  // different aspirated/edema-fluid process) — folded honestly into the same
  // broncho handle bronchospasm uses, rather than inventing a new field with
  // only one consumer.
  //
  // MIOSIS is narrated only (actions.js's generic `pupils` probe, gated on
  // the real pat.parasympathetic elevation this condition itself drives, not
  // a new decorative flag) — no pupil-diameter mechanism exists anywhere in
  // this engine, the same standing limitation atropineOverdose's/
  // tricyclicOverdose's own mydriasis narration already carries for the
  // opposite (anticholinergic) direction.
  //
  // TIME COURSE: real organophosphate/nerve-agent exposure is symptomatic
  // within minutes (inhalation/nerve agent) to about an hour (dermal/
  // ingestion pesticide) of exposure, then WORSENS over the following tens
  // of minutes to hours as absorption continues and AChE inhibition deepens
  // (Eddleston 2008, ibid) — presented already partly symptomatic on scene
  // (matching atropineOverdose's/tricyclicOverdose's own "already
  // symptomatic on arrival" framing) and ramping further over the field
  // encounter, not an instant step to ceiling.
  organophosphatePoisoning: {
    initial: { age: 41, hr: 78, sbp: 118, dbp: 76, rr: 20, glu: 100, pain: 1, bronch: 0.25 },
    progress(pat, dt) {
      // FOUND WHILE BUILDING THIS: pat.parasympathetic itself is NOT a
      // settable disease-severity dial -- cardiovascular.js's updateAutonomic
      // fully recomputes it every tick from the baroreflex model and clamps
      // it to a 0.95 physiological ceiling, so a condition ratcheting it
      // upward is silently pulled back toward baseline before the hr formula
      // next reads it (measured directly: moved hr less than 1 bpm at
      // steady state, the exact reset-trap shape tcaVagalBlock's own comment
      // already documents for pat.vagalBlock). Fixed the same way that fix
      // was: a separate, condition-owned accumulator
      // (pat.cholinergicVagalTone) composed alongside vagalBlock/
      // tcaVagalBlock at BOTH of their real consumers (cardiovascular.js's
      // hr formula and updateConduction's effPara) rather than fighting the
      // reflex model for pat.parasympathetic itself.
      //
      // Presented already partly symptomatic on scene (0.35 seed, matching
      // atropineOverdose's/tricyclicOverdose's own "already symptomatic on
      // arrival" framing), ramping toward a 0.85 ceiling. At 0.85 and fully
      // atropine-unopposed, cardiovascular.js's hr formula
      // (-45*cholinergicVagalTone) pulls a ~78 bpm baseline down to the real,
      // dangerous 40s bradycardia this toxidrome produces (Eddleston 2008;
      // StatPearls "Organophosphate Toxicity").
      if (!pat._cholinergicSeeded) { pat._cholinergicSeeded = true; pat.cholinergicVagalTone = 0.35; }
      pat.cholinergicVagalTone = clamp((pat.cholinergicVagalTone ?? 0.35) + dt * 0.025, 0.35, 0.85);
      // Ceiling 0.78 sits below asthma's 0.96 status-asthmaticus ceiling
      // (severe, but not this engine's single most extreme bronchospasm) and
      // starts lower / ramps slower than anaphylaxis's 0.55-starting, 0.06/min
      // climb -- a genuinely different magnitude AND rate from either.
      pat.broncho = clamp((pat.broncho ?? 0.25) + dt * 0.022, 0.2, 0.78);
    },
  },

  // ===== ACUTE DYSTONIC REACTION (queue item 66, TP 1239/1239-P) =====
  // Found missing while implementing TP 1239/1239-P: the presentation
  // (involuntary spasm of head/neck/face/eyes/trunk, forced jaw opening,
  // inability to retract the tongue, eye deviation) had no representable
  // field anywhere in this engine at all — distinct from pat.seizing (a
  // different, already-modeled electrical phenomenon).
  //
  // MECHANISM: a dopamine D2-receptor antagonist (metoclopramide/
  // prochlorperazine-class antiemetic, or an antipsychotic) blocks striatal
  // D2 receptors; the SAME blockade responsible for its antiemetic action at
  // the chemoreceptor trigger zone also disinhibits striatal cholinergic
  // interneurons in the nigrostriatal pathway, producing sustained
  // involuntary muscle contraction. TP 1239 itself presents a patient WHO
  // ALREADY HAS an established reaction (typically from a dose given before
  // EMS arrival — urgent care, ED, a prior dose at home) rather than one this
  // engine triggers mid-call, matching this queue item's own original filing
  // ("the protocol's own required base-contact-to-confirm step means a human
  // diagnosis is load-bearing here anyway"). drugs.js's own new
  // `metoclopramide` entry (fx.dystonia, small/modest) is a real, separate
  // consumer for the rarer case where a crew's OWN dose precipitates or
  // worsens it mid-call.
  //
  // REAL, MODEST PHYSIOLOGIC CONSEQUENCE, not a decorative field: sustained
  // dystonic spasm is genuinely painful (drives pat.pain, the SAME "real
  // symptom without a vitals catastrophe" idiom envenomation/appendicitis
  // already use) and a real, if mild, sympathetic response (a modest hr
  // bump from pain/anxiety, well short of any shock-grade tachycardia) — NOT
  // wired to broncho/edema/hemodynamics, since a genuine (non-laryngeal)
  // dystonic reaction does not compromise the airway or circulation on its
  // own, and overstating that would be exactly the kind of mechanism
  // mismatch this project's own condition-library discipline forbids.
  // Untreated, severity does not spontaneously resolve within a single field
  // encounter (real dystonic reactions persist for hours without an
  // anticholinergic/antihistamine) — a flat, non-worsening plateau, not a
  // progressive one, since this is a static receptor blockade, not an
  // accumulating toxic process the way tricyclicOverdose/cyanidePoisoning
  // are.
  //
  // TREATED THROUGH THE REAL MECHANISM: diphenhydramine's H1/anticholinergic
  // activity restores the striatal dopamine-acetylcholine balance the D2
  // blocker disrupted — the actual first-line field treatment (drugs.js
  // "diphen" fx.dystonia, the SAME drug already treating urticaria above,
  // reused rather than inventing a parallel antidote). No automatic protocol
  // rule added (laCounty.js) — TP 1239's own required base-contact-to-confirm
  // step keeps the human diagnosis load-bearing, the same reasoning already
  // on record for TP 1229/1232's assessment-only sections; diphenhydramine
  // remains available for manual crew ordering, per this item's original
  // filing.
  acuteDystonicReaction: {
    initial: { age: 26, hr: 96, sbp: 128, rr: 18, glu: 100, pain: 6, dystonia: 0.6 },
    progress(pat, dt) {
      // Flat plateau with a small, slow drift toward worse (not better) —
      // real dystonic reactions do not spontaneously resolve over a field
      // encounter's timescale. Ceiling 0.85 leaves real headroom below 1.0
      // (a maximal, airway-threatening laryngeal dystonia this condition
      // deliberately does not model — a genuinely separate, rarer and more
      // severe presentation, out of scope for this batch).
      pat.dystonia = clamp((pat.dystonia ?? 0.6) + dt * 0.002, 0.55, 0.85);
      // Pain tracks spasm severity directly, through the real persistent-pain
      // handle (queue item 20's pat.intrinsicPain) — NOT pat.pain, a
      // write-only dead field that same queue item's own comment documents
      // (this file's magToxicity/icdShockCount blocks confirm nothing reads
      // it) — the actual reason this patient is distressed and calling 911,
      // not a free-floating number.
      pat.intrinsicPain = clamp(6 + (pat.dystonia - 0.6) * 10, 5, 9);
      // Modest pain/anxiety-driven tachycardia, well short of any
      // shock-grade rate — this condition does not touch sbp/broncho/edema
      // at all, since an uncomplicated dystonic reaction has no hemodynamic
      // or airway component of its own.
      pat.hrBase = clamp((pat.hrBase ?? 96) + dt * 0.01, 90, 108);
    },
  },

  // ===== LITHIUM TOXICITY (queue item 7, Toxicology) =====
  // Real mechanism, confirmed against the tree before writing anything: no
  // pat.li field or lithium mechanism existed anywhere (grep-confirmed).
  // Lithium's therapeutic index is genuinely narrow (0.6-1.2 mmol/L
  // therapeutic, >1.5 early toxic, >2.5-3.5 severe/life-threatening —
  // Waring, "Management of lithium toxicity," Toxicol Rev 2006), and
  // toxicity is CNS-dominant: tremor progressing through hyperreflexia,
  // clonus, altered mentation, to seizures and coma as the level climbs —
  // not primarily a cardiovascular toxidrome (lithium's cardiac effects —
  // T-wave flattening, sinus node dysfunction — are real but a secondary,
  // less field-acute finding than the neuro cascade, so this condition is
  // scoped to the neuro axis, matching this batch's own instruction).
  // Framed as ACUTE-ON-CHRONIC (a patient on stable maintenance lithium who
  // becomes dehydrated/renally impaired, the single most common real-world
  // toxicity mechanism per Waring 2006 — lithium is cleared almost
  // entirely by the kidney and reabsorbed alongside sodium in the
  // proximal tubule, so anything that drops GFR or drives volume depletion
  // raises the level even with an unchanged dose), not a fresh massive
  // ingestion — so the level itself is already high on scene and does not
  // keep climbing from ongoing absorption the way tricyclicOverdose's does.
  //
  // WIRED THROUGH EXISTING HANDLES, reusing the same idiom
  // organophosphatePoisoning/hyperammonemia/toxicMetabolicEncephalopathy
  // already use for a graded, non-cardiac-gated toxic-CNS picture:
  // pat.metabolicEncephalopathy (confusion/altered mentation) and
  // pat.epilepticDrive (the same seizure-risk accumulator neuro.js already
  // composes by MAX across every cause) both scale directly and
  // continuously off pat.li itself, not an independent severity dial —
  // the actual level IS the severity here, unlike tricyclicOverdose's own
  // QRS-gated risk (lithium neurotoxicity is not a sodium-channel/
  // conduction phenomenon).
  //
  // FIELD TREATMENT, stated honestly rather than inventing a fictional
  // antidote: there is NO field-administrable lithium antidote in this or
  // any real formulary. The one real, guideline-supported field/ED lever is
  // isotonic-fluid resuscitation — volume expansion raises GFR and reduces
  // proximal-tubule sodium (and therefore co-transported lithium)
  // reabsorption, the SAME real mechanism this file's own hypercalcemia
  // condition already uses for calcium via the identical pat.drugInstances
  // detection idiom (s.given is pure App.jsx UI bookkeeping the physiology
  // engine never receives — pat.drugInstances is pk.js's own real "is this
  // drug on board" signal). Hemodialysis is the actual definitive treatment
  // for severe toxicity (Waring 2006) and is NOT a field intervention — this
  // condition deliberately does not simulate it, and the scenario's own
  // resolve() text says so plainly rather than implying supportive care
  // alone can normalize a severe level on scene.
  lithiumToxicity: {
    initial: { age: 71, hr: 92, sbp: 116, dbp: 74, rr: 16, glu: 100, pain: 1, li: 3.2 },
    progress(pat, dt) {
      if (!pat._liInit) { pat._liInit = true; pat._liTarget = 3.2; }
      // A real, if slow, chronic-on-acute drift: an already-dehydrated,
      // still-not-rehydrated patient's own ongoing free-water deficit keeps
      // the level creeping up in the background over the field encounter,
      // distinct from tricyclicOverdose's much faster ongoing-absorption
      // ramp (this is renal under-clearance, not continued ingestion).
      pat._liTarget = Math.min(4.0, pat._liTarget + dt * 0.003);
      // Isotonic fluid genuinely, if modestly, lowers the TARGET the level
      // relaxes toward -- gradual through this condition's own relaxation
      // below, never an instant fix, and floored well above normal (2.2):
      // real volume expansion measurably helps renal lithium clearance but
      // cannot correct a severe level within a single field encounter --
      // only dialysis can do that, and dialysis is not simulated here.
      const fluidOnBoard = (pat.drugInstances || []).some(
        (dr) => dr.id === "saline" || dr.id === "plasmalyte");
      if (fluidOnBoard) {
        pat._liTarget = Math.max(2.2, pat._liTarget - dt * 0.004);
      }
      pat.li = pat.li + (pat._liTarget - pat.li) * Math.min(1, dt * 0.05);

      // Graded, continuous neurotoxicity, keyed directly off the real level
      // -- 0 at the top of the therapeutic range (1.2), reaching full
      // severity by 3.5 (deep coma / status-epilepticus-range toxicity per
      // Waring 2006's own severe-toxicity band).
      const sev = clamp((pat.li - 1.2) / 2.3, 0, 1);
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, sev);
      // Seizure risk composes by MAX with every other cause in neuro.js,
      // the same "condition-owned accumulator, not an independent write"
      // idiom every other toxidrome in this file already uses.
      pat.epilepticDrive = Math.max(pat.epilepticDrive || 0, Math.max(0, sev - 0.3) / 0.7);
    },
  },

  // ===== SEROTONIN SYNDROME (queue item 7, Toxicology backlog) =====
  // Real mechanism, confirmed by grep before writing anything: no serotonin
  // handle, no serotonergic-drug interaction mechanism, no dystonia-vs-
  // serotonin-clonus distinction existed anywhere in this engine.
  //
  // CLINICAL PICTURE (Hunter Serotonin Toxicity Criteria — Boyer & Shannon,
  // "The Serotonin Syndrome," NEJM 2005): a triad of (1) neuromuscular
  // hyperactivity — clonus (spontaneous/inducible), hyperreflexia, tremor,
  // classically MORE PRONOUNCED IN THE LOWER EXTREMITIES than the upper; (2)
  // autonomic instability — hyperthermia (can exceed 41C in critical cases),
  // tachycardia, diaphoresis, hypertension; (3) altered mental status —
  // agitation, confusion. Severe cases progress to seizures, rhabdomyolysis,
  // and death via hyperthermia-driven multi-organ failure. Triggered by a
  // serotonergic drug combination/overdose — classic: an SSRI/SNRI plus a
  // second serotonergic agent (tramadol, an MAOI), or a single large
  // overdose of one strongly serotonergic drug.
  //
  // WIRED THROUGH EXISTING ENGINE MECHANISMS, no invented parallel
  // pathways, per this queue item's own standing methodology:
  //   - Hyperthermia: pat.metabolicHeatMultiplier, the SAME real
  //     hypermetabolism handle excitedDelirium/thyroidStorm/organophosphate
  //     Poisoning already drive — thermo.js's own heat-balance physics
  //     produces the actual temperature, not a direct coreTemp write.
  //   - Tachycardia: pat.hrBase, the same direct-rate handle excitedDelirium/
  //     thyroidStorm already use for a sympathetically-driven tachycardia.
  //   - Hypertension: pat.baseSVR, targeted at a real multiple of the
  //     patient's own fixed anatomical reference (pat.ageProfile.baseSVR()),
  //     the exact mechanism hypertensiveUrgency already established — a
  //     genuine vascular-tone lesion, not a scripted sbp number.
  //   - Altered mental status / agitation: pat.agitationBurden (the direct
  //     handle neuro.js's updateCerebral composes into pat.agitation,
  //     already reduced by real sedationDepth/antipsychoticEffect — the
  //     exact mechanism excitedDelirium already uses) plus
  //     pat.metabolicEncephalopathy for confusion.
  //   - Seizure risk: pat.epilepticDrive, the same condition-owned
  //     accumulator neuro.js composes by MAX across every seizure cause —
  //     severe serotonin toxicity is a real, documented seizure risk.
  //
  // NEUROMUSCULAR HYPERACTIVITY — the honest, narration-only approach, per
  // this project's own precedent for a finding this engine has no
  // vitals-writing mechanism for (mydriasis/miosis elsewhere in this file
  // carry the identical limitation). No general neuromuscular-hyperactivity
  // handle exists — pat.dystonia (acute dystonic reaction) is a DIFFERENT,
  // static D2-blockade muscle-rigidity mechanism and is deliberately NOT
  // reused here, since serotonin-driven clonus is a genuinely different
  // receptor mechanism (5-HT2A/5-HT1A hyperstimulation, not dopaminergic
  // disinhibition) with a different real bedside picture (rhythmic,
  // inducible clonus rather than sustained dystonic posturing). A new,
  // condition-owned pat.serotoninClonus (0-1) severity field gates a real
  // exam finding at the existing "reflexes" action (actions.js, region legR
  // — deep tendon reflexes/clonus is already checked at the leg, so the
  // lower-extremity finding lives exactly where the real exam is done) —
  // narrated exam text, not a new vitals-writing mechanism, matching the
  // honest approach mydriasis/miosis already established.
  //
  // TIME COURSE: real serotonin syndrome develops within HOURS of the
  // causative dose/interaction (Boyer & Shannon 2005) — presented already
  // partly symptomatic on scene (0.4 seed), matching every other toxidrome's
  // "already symptomatic on arrival" framing in this file, ramping toward a
  // severe ceiling over the field encounter as the drug interaction
  // continues to act, not an instant step.
  //
  // TREATMENT: NO FIELD ANTIDOTE, stated honestly. Cyproheptadine (the real
  // 5-HT2A antagonist definitive treatment) is an ORAL drug — not carried by
  // any field EMS unit, the same "no field cure, recognize and transport"
  // framing this file already establishes for lithium/cyanide/envenomation.
  // Real field treatment works through TWO already-existing mechanisms, not
  // invented ones: (1) benzodiazepines for agitation/seizure risk, reusing
  // midazolam's existing anticonvulsant -> pat.epilepticDrive suppression AND
  // its sedationDepth -> pat.agitation calming, exactly as excitedDelirium's
  // own resolve() text already teaches ("sedation treats the behavior, not
  // the underlying crisis" — the hyperthermia/tachycardia/baseSVR terms are
  // completely untouched by a benzodiazepine dose, on purpose); (2) active
  // cooling for hyperthermia, reusing the existing coolingPower mechanism
  // (procedures.js) — thermo.js's real heat-balance equation means cooling
  // only PARTIALLY offsets the ongoing metabolicHeatMultiplier-driven heat
  // production, an honest clinical limitation, not a cure. Physical restraint
  // has NO procedure/mechanism anywhere in this engine (confirmed by grep)
  // and none is added here — restraining a patient does nothing to the
  // underlying serotonergic crisis and, per real clinical teaching, ongoing
  // struggle against restraint worsens hyperthermia from continued muscle
  // activity; this condition's own scenario states that plainly rather than
  // modeling restraint as if it were a treatment.
  serotoninSyndrome: {
    initial: { age: 34, hr: 128, sbp: 156, dbp: 96, rr: 24, glu: 100, pain: 3,
      temp: 38.9, serotoninClonus: 0.4 },
    progress(pat, dt) {
      if (pat._5htRestSvr == null) pat._5htRestSvr = pat.ageProfile.baseSVR();

      // Neuromuscular hyperactivity — condition-owned, narrated via the
      // "reflexes" action (actions.js). Ramps toward a severe ceiling over
      // the field encounter, matching the real hours-scale progression.
      pat.serotoninClonus = clamp((pat.serotoninClonus ?? 0.4) + dt * 0.012, 0.35, 0.95);

      // Autonomic instability: hyperthermia through the shared
      // hypermetabolism handle (thermo.js derives the real coreTemp from
      // this, not a direct write). Ceiling of 1.9 sits between
      // excitedDelirium's 1.8 and thyroidStorm's 2.2 — a real, severe,
      // life-threatening hypermetabolic state, matching the real clinical
      // teaching that critical serotonin syndrome can exceed 41C.
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1,
        Math.min(1.9, 1.3 + pat.serotoninClonus * 0.7));

      // Tachycardia — direct rate handle, the same idiom excitedDelirium/
      // thyroidStorm already use for sympathetically-driven tachycardia.
      pat.hrBase = Math.min(170, Math.max(pat.hrBase ?? 128, 118) + dt * 1.0);

      // Hypertension — a real vascular-tone lesion through pat.baseSVR, the
      // same mechanism hypertensiveUrgency already established, targeted at
      // a moderate multiple (short of that condition's own more severe 3.0x)
      // since hypertension is one of several autonomic findings here, not
      // the dominant one.
      const svrTarget = pat._5htRestSvr * 1.7;
      pat.baseSVR += (svrTarget - pat.baseSVR) * Math.min(1, dt / 4);

      // Altered mental status: real agitation (composed with sedation/
      // antipsychotic treatment automatically by neuro.js's updateCerebral,
      // exactly as excitedDelirium's own mechanism already works) plus
      // confusion through the shared toxic-encephalopathy handle.
      pat.agitationBurden = Math.max(pat.agitationBurden || 0, 0.7);
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0,
        0.3 + pat.serotoninClonus * 0.3);

      // Severe cases progress to seizures — composes by MAX with every
      // other seizure cause in neuro.js, gated on the clonus severity itself
      // crossing into the genuinely severe range, not from the first tick.
      pat.epilepticDrive = Math.max(pat.epilepticDrive || 0,
        Math.max(0, pat.serotoninClonus - 0.65) / 0.35);
    },
  },

  // ===== COCAINE TOXICITY (queue item 7, Toxicology backlog — TOX-016) =====
  // MECHANISM: cocaine blocks presynaptic reuptake of norepinephrine/
  // dopamine/serotonin at the synaptic cleft (NET/DAT/SERT inhibition) —
  // the same mechanism CATEGORY (a catecholamine-reuptake-inhibition
  // pathway) as V2-26's recently-built ketamine indirect-sympathomimetic
  // effect, but a genuinely DIFFERENT cause: ketamine's indirect
  // sympathomimetic term is NMDA-antagonist-driven catecholamine RELEASE,
  // gated by the patient's own depletable pat.adrenalReserve (drugs.js's
  // indirectSympathomimetic, pk.js). Cocaine's action is reuptake
  // BLOCKADE at the synapse, which potentiates whatever endogenous release
  // is already occurring rather than depending on adrenal medullary
  // output — so this condition does NOT gate on adrenalReserve, and
  // drives hrBase/baseSVR/agitationBurden directly, the same
  // "condition declares severity, engine composes it" idiom
  // excitedDelirium/serotoninSyndrome already use for a catecholamine-
  // excess toxidrome.
  //
  // REAL PRESENTATION (Lange & Hillis, "Cardiovascular Complications of
  // Cocaine Use," NEJM 2001; Richards et al., "Treatment of cocaine
  // cardiovascular toxicity: a systematic review," Clin Toxicol 2016):
  // severe tachycardia and hypertension (combined alpha/beta-adrenergic
  // potentiation), psychomotor agitation, hyperthermia (increased
  // psychomotor/muscular activity plus a direct hypothalamic
  // thermoregulatory effect), and — the real, teachable complication —
  // coronary VASOSPASM from direct alpha-adrenergic-mediated coronary
  // vasoconstriction, causing cocaine-associated chest pain/myocardial
  // ischemia even in young patients with angiographically normal
  // coronary arteries.
  //
  // Cocaine's peak effect is within minutes of use regardless of route —
  // presented already symptomatic on scene, the same "already
  // symptomatic on arrival" framing atropineOverdose/tricyclicOverdose/
  // organophosphatePoisoning all use, not an instant step from a normal
  // baseline.
  //
  // CORONARY VASOSPASM, reusing the EXISTING coronary supply/demand
  // mechanism (cardiovascular.js: reserve = 1-pat.coronaryStenosis caps
  // maximal coronary flow, feeding pat.myoO2Balance/pat.atp) rather than
  // inventing a parallel ischemia pathway. This is a real, TRANSIENT,
  // reversible rise in coronary resistance from alpha-adrenergic
  // vasoconstriction — mechanistically distinct from ACS's fixed
  // atherosclerotic thrombus (which also drives coronaryStenosis for that
  // condition), but the shared variable is the correct reuse point: both
  // a structural plaque and a vasospasm reduce the SAME coronary flow
  // reserve, just via different causes. Deliberately kept modest (peak
  // ~0.35 at full expression) — real coronary vasospasm in a young
  // patient with otherwise normal arteries produces genuine but usually
  // SUBCRITICAL ischemia (chest pain, ECG changes, a troponin leak in
  // severe cases), not the near-total occlusion a completed STEMI
  // thrombus produces (acs's own 0.53-0.6 range) — pushing this higher
  // would be the exact mechanism-category error queue item 19 already
  // warns against widening the survivable band for. RECOMPUTED FRESH
  // every tick from pat._cocSpasm (the same "live, fully reversible,
  // condition-owned quantity" idiom compartment syndrome's own
  // pat.compartmentOcclusion already established) rather than a one-way
  // ratchet, so it genuinely relaxes as expression falls (e.g. under
  // benzodiazepine treatment) instead of leaving a permanent high-water
  // mark. Chest pain (pat.intrinsicPain) is real largely independent of
  // whether the vasospasm is severe enough to actually drop pat.atp —
  // matching the real clinical picture that cocaine-associated chest pain
  // is common with or without objective infarction.
  //
  // BETA-BLOCKER RELATIVE CONTRAINDICATION ("unopposed alpha") — the real
  // field teaching point that a pure beta-blocker removes the beta-2-
  // mediated vasodilation partially offsetting cocaine's alpha-mediated
  // vasoconstriction, worsening coronary vasospasm/hypertension.
  // DELIBERATELY NOT modeled as a drugs.js hold() this batch — building
  // the condition itself was the priority, and neither metoprolol's own
  // beta1/beta2 receptor terms nor this condition's coronaryStenosis/
  // baseSVR terms read each other today, so metoprolol is honestly INERT
  // here rather than actively worsening it — the real hazard is only
  // partially represented (this condition does not get artificially
  // WORSE by a beta-blocker, but a future session wiring metoprolol's
  // beta2 blockade into a genuine "removes protective vasodilation" term
  // on coronaryStenosis would close the gap for real). Flagged, not
  // silently glossed over.
  //
  // BENZODIAZEPINES ARE REAL, FIRST-LINE FIELD TREATMENT — unlike several
  // of this project's other toxidromes (no effective field treatment),
  // this one genuinely responds: central GABA-A-mediated sympatholysis
  // measurably reduces cocaine's autonomic hyperactivity (ACEP clinical
  // policy; Richards 2016). This is a real, DIFFERENT finding from
  // excitedDelirium's own more medication-refractory catecholamine storm
  // (that condition's own comment documents midazolam calming BEHAVIOR
  // — pat.agitation — without touching the underlying crisis fields at
  // all) — cocaine toxicity's autonomic findings themselves genuinely
  // improve with benzodiazepines, not just the behavioral expression of
  // them. Reuses pat.sedationDepth (pk.js, midazolam/etomidate's real
  // GABA-A mechanism, queue item 47 — the SAME field neuro.js's own
  // agitation composition already reads) to scale down how much of this
  // condition's own catecholamine-excess severity reaches hrBase/
  // baseSVR/coronaryStenosis/agitationBurden — a second, real consumer of
  // an already-verified drug-effect field, not a new mechanism.
  cocaineToxicity: {
    initial: { age: 29, hr: 138, sbp: 172, dbp: 104, rr: 26, glu: 100, pain: 6 },
    progress(pat, dt) {
      // Benzo-responsive severity scale: at a standard midazolam dose's own
      // measured sedationDepth (~0.5-0.6, per that field's own comment),
      // this leaves roughly 55-65% of cocaine's catecholamine drive
      // expressed — real, substantial, but not a cure, matching Richards
      // 2016's own "benzodiazepines reduce but do not normalize" finding.
      const sed = Math.min(1, pat.sedationDepth || 0);
      const expressed = 1 - sed * 0.6;

      // Tachycardia — direct hrBase ramp, ceiling scaled by expression.
      const hrTarget = 110 + 70 * expressed;
      pat.hrBase = pat.hrBase + (hrTarget - pat.hrBase) * Math.min(1, dt / 4);

      // Hypertension — relative to the patient's own fixed anatomic
      // reference, the same idiom hypertensiveUrgency/Emergency/
      // serotoninSyndrome already established.
      if (pat._cocRestSvr == null) pat._cocRestSvr = pat.ageProfile.baseSVR();
      const svrTarget = pat._cocRestSvr * (1 + 1.1 * expressed);
      pat.baseSVR += (svrTarget - pat.baseSVR) * Math.min(1, dt / 4);

      // Hyperthermia — real, from increased psychomotor activity plus a
      // direct hypothalamic effect, through the same shared
      // metabolicHeatMultiplier handle every other hypermetabolic
      // toxidrome in this library uses.
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1,
        1 + 0.55 * expressed);

      // Agitation — direct handle, LIVE (not a one-way ratchet, unlike
      // several other toxidromes' own agitationBurden writes): cocaine
      // toxicity's agitation genuinely tracks the same benzo-responsive
      // catecholamine drive as its hemodynamics, so it should fall with
      // treatment the same way hrBase/baseSVR do, not lock in at its own
      // pre-treatment high-water mark.
      pat.agitationBurden = 0.75 * expressed;

      // Coronary vasospasm — a live, fully reversible term (not a ratchet),
      // relaxing toward its own target over a few minutes (real vasospasm
      // is not instantaneous, but it is fast — seconds to a couple of
      // minutes, distinct from ACS's own much slower thrombus-propagation
      // timescale).
      const spasmTarget = 0.35 * expressed;
      pat._cocSpasm = (pat._cocSpasm ?? 0) + (spasmTarget - (pat._cocSpasm ?? 0)) * Math.min(1, dt / 3);
      pat.coronaryStenosis = pat._cocSpasm;

      // Chest pain — real and present largely independent of whether the
      // vasospasm is severe enough to measurably drop atp.
      pat.intrinsicPain = Math.max(pat.intrinsicPain || 0, 5 + 3 * expressed);
    },
  },

  // ===== MALARIA (queue item 7, Infectious-disease backlog) =====
  // P. falciparum severe malaria — the most clinically significant species
  // and the real prehospital-relevant presentation. Real trigger: recent
  // travel to (or residence in) an endemic region plus a febrile paroxysm —
  // this scenario's own dispatch/history carries that, since a diagnosis
  // this specific has to come from a real epidemiologic clue, not a vitals
  // pattern alone (the same "a human diagnosis is load-bearing" posture
  // acuteDystonicReaction's own comment already establishes for a different
  // condition).
  //
  // TWO mechanisms wired through EXISTING engine handles, per this queue
  // item's own standing methodology — no invented parallel pathways:
  //
  //   1. CYCLICAL/SUSTAINED FEVER — pat.metabolicHeatMultiplier, the SAME
  //      hypermetabolism handle organophosphatePoisoning/excitedDelirium/
  //      thyroidStorm/serotoninSyndrome/neurolepticMalignantSyndrome already
  //      drive (see this file's own long precedent list above). Real P.
  //      falciparum fever classically cycles every 48-72h (synchronized
  //      schizont rupture) — but a presenting EMS patient is, almost by
  //      definition, caught mid-paroxysm (that is why they called), and a
  //      typical EMS encounter (minutes) is far shorter than one full 48-72h
  //      cycle. Building a literal multi-day sinusoid would produce a
  //      trajectory no player could ever observe complete one full period
  //      of within a call — the same "no reason to simulate what a call
  //      cannot show" reasoning cyanidePoisoning's own comment already
  //      applies to its own delayed-phase limb. So fever here is modeled as
  //      SUSTAINED for the duration of the encounter (the paroxysm the
  //      patient presents in), matching the precedent every other
  //      presenting-fever condition in this file already uses, rather than
  //      a scripted multi-day sinusoid nothing in a single call could ever
  //      verify.
  //
  //   2. HEMOLYTIC ANEMIA — pat.hemolysisRate (metabolic.js's
  //      updateHemolysis), the genuinely NEW mechanism this batch built: RBC
  //      destruction IN PLACE, distinct in kind from every existing
  //      hemorrhage/bleeding condition in this engine, which loses whole
  //      blood (red cells AND plasma) proportionally. Cited magnitude: WHO
  //      severe-malaria criteria define severe malarial anemia as Hb < 5
  //      g/dL, developing over DAYS at parasitemia >5% (WHO, "Severe
  //      falciparum malaria," 2000/2015 guidelines) — real and large over
  //      the real disease timescale, but honestly small within one EMS
  //      encounter, exactly as this project's own precedent for a
  //      days-scale process (thermalBurn's capillary leak, hepaticStunning)
  //      already establishes: present, measurable, directionally correct,
  //      not force-tuned to complete within one call.
  //
  //   3. CEREBRAL MALARIA / MULTI-ORGAN DYSFUNCTION — the real, severe
  //      complication, reusing pat.metabolicEncephalopathy and
  //      pat.epilepticDrive, the SAME condition-owned handles
  //      neuro.js already composes by MAX across every metabolic/toxic
  //      cause of altered consciousness and seizure risk (lithiumToxicity,
  //      hyperammonemia, cyanidePoisoning, serotoninSyndrome all use the
  //      identical pair). Gated on real, measured severity (this
  //      condition's own pat._malariaSeverity accumulator, driven by how
  //      long the parasitemia has gone untreated) — NOT present from the
  //      first tick, matching the real clinical fact that most malaria
  //      presentations are uncomplicated and cerebral involvement is the
  //      minority, severe case.
  //
  // FIELD TREATMENT — honest and limited, per this file's own established
  // posture for a disease this formulary cannot cure (lithiumToxicity,
  // cyanidePoisoning, envenomation all state the identical limitation): NO
  // field antimalarial exists in ANY real EMS formulary (artesunate/
  // quinine/doxycycline are all hospital-pharmacy drugs, never carried on a
  // unit) — confirmed by reading drugs.js, no such entry exists. The real
  // field job is RECOGNITION (the travel-history-plus-fever pattern) and
  // SUPPORTIVE CARE: active cooling genuinely, partially offsets the
  // metabolicHeatMultiplier-driven fever through the same coolingPower
  // mechanism serotoninSyndrome's own resolve() already teaches is
  // partial, not curative; fluids support perfusion but do nothing to the
  // underlying parasitemia or ongoing hemolysis, and are deliberately NOT
  // wired to touch hemolysisRate — reusing saline's own generic fx.blood
  // plasma-bolus mechanism, with no new coefficient needed, correctly
  // treats volume status without pretending to treat the disease.
  malaria: {
    initial: { age: 29, hr: 128, sbp: 100, dbp: 62, rr: 26, glu: 90, pain: 2,
      temp: 39.6, hemolysisRate: 0.18 },
    progress(pat, dt) {
      if (pat._malariaSeverity == null) pat._malariaSeverity = 0.25;
      // Untreated parasitemia (and therefore severity) climbs slowly over
      // the field encounter — real, continued schizont rupture, not an
      // instant step. Ceiling of 1 reached only after a genuinely long,
      // untreated window (this is a days-scale disease; a 900s-1800s call
      // should only move this a modest amount, matching the honest
      // "small and slow within one call" precedent named above).
      pat._malariaSeverity = Math.min(1, pat._malariaSeverity + dt * 0.010);

      // 1. Sustained hypermetabolic fever, real thermo.js heat-balance
      // physics producing the actual coreTemp, not a direct write. Ceiling
      // 1.6 — a real, severe febrile paroxysm, below serotoninSyndrome's
      // 1.9/thyroidStorm's 2.2 (this is fever from cytokine/paroxysm
      // response, not the more extreme sympathetic-storm hypermetabolism
      // those toxidromes drive).
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.6);

      // 2. Hemolysis — the genuinely new mechanism. hemolysisRate itself is
      // held near its presenting value rather than ratcheted upward
      // unboundedly; a slow rise with severity captures worsening
      // parasitemia without inventing an unbounded runaway.
      pat.hemolysisRate = Math.max(pat.hemolysisRate ?? 0.18, 0.18 + pat._malariaSeverity * 0.12);

      // 3. Cerebral malaria / multi-organ dysfunction — gated on real,
      // accumulated severity crossing into the genuinely severe range, the
      // same "not from the first tick" pattern serotoninSyndrome's own
      // seizure-risk gate already uses.
      if (pat._malariaSeverity > 0.55) {
        const frac = (pat._malariaSeverity - 0.55) / 0.45;
        pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0, frac * 0.6);
        pat.epilepticDrive = Math.max(pat.epilepticDrive || 0, frac * 0.5);
      }
    },
  },

  // ===== NEUROLEPTIC MALIGNANT SYNDROME (queue item 7, Toxicology backlog) =====
  // Built as a real, clinically distinct contrast to serotoninSyndrome
  // (above), per Caroff & Mann's classic review ("Neuroleptic Malignant
  // Syndrome," Med Clin North Am 1993) — the reference this project cites
  // the same way Boyer & Shannon is cited for serotonin syndrome.
  //
  // TRIGGER: dopamine (D2) receptor antagonism — starting or increasing an
  // antipsychotic dose, or abrupt dopaminergic-drug withdrawal (e.g. a
  // Parkinson's patient stopping levodopa). This scenario is the former
  // (a haloperidol dose increase), the mechanistic OPPOSITE trigger from
  // serotonin syndrome's serotonergic drug interaction.
  //
  // THE REAL TETRAD, and why it does NOT reuse serotoninSyndrome's wiring
  // as a copy-paste:
  //   1. SEVERE MUSCLE RIGIDITY — sustained, uniform "lead-pipe" rigidity.
  //      This is the actual, teachable distinguishing exam finding versus
  //      serotonin syndrome's clonus/hyperreflexia: rigidity is a SUSTAINED
  //      increase in tone through the whole range of passive motion, not an
  //      intermittent, inducible neuromuscular hyperactivity. A new,
  //      condition-owned pat.nmsRigidity (0-1) narrates this at the same
  //      "reflexes" action serotoninClonus already uses (actions.js), but as
  //      a mutually-exclusive, mechanistically distinct finding (checked
  //      first, since it's the real distinguishing sign) — not the same
  //      field renamed.
  //   2. HYPERTHERMIA — often MORE severe/prolonged than serotonin syndrome,
  //      since sustained rigidity is itself a real heat-generating process
  //      (isometric muscle work), on top of the hypothalamic dysregulation
  //      both toxidromes share. Reuses the SAME shared
  //      metabolicHeatMultiplier handle several other toxidromes already
  //      use (thermo.js derives the real coreTemp from this, not a direct
  //      write) — but at a higher ceiling and driven by nmsRigidity, not
  //      serotoninClonus, so the two conditions never share state.
  //   3. AUTONOMIC INSTABILITY — tachycardia and labile blood pressure
  //      through the same hrBase/baseSVR handles serotoninSyndrome already
  //      established, at this condition's own numbers.
  //   4. ALTERED MENTAL STATUS — through the same agitationBurden/
  //      metabolicEncephalopathy handles, at this condition's own
  //      coefficients — NMS more classically presents as stupor/mutism than
  //      the agitated confusion of serotonin syndrome, so the agitation
  //      ceiling here is lower and encephalopathy is weighted more heavily.
  //
  // TIME COURSE: the real, defining difference from serotonin syndrome.
  // NMS develops over DAYS (Caroff & Mann: 1-3 days to peak severity in the
  // majority of cases), not hours — presented already SEVERAL DAYS into
  // rigidity/fever (initial severity seeded high, matching this file's
  // "presenting already symptomatic" convention for toxidromes), with a
  // deliberately SLOWER within-call ramp rate than serotoninSyndrome's own
  // (half the rate) — most of the deterioration already happened before EMS
  // was called; what a crew watches over 15 minutes is a small further
  // slide, not the initial onset.
  //
  // TREATMENT: honestly limited, same "no field cure, recognize and
  // transport" framing serotoninSyndrome/lithium/cyanide/envenomation all
  // already establish. Benzodiazepines (midazolam) help agitation through
  // the same already-verified anticonvulsant/sedationDepth -> agitation
  // pathway. Active cooling (procedures.js coolingPower) partially offsets
  // the hyperthermia, but — the real, distinct teaching point versus
  // serotonin syndrome — rigidity ITSELF keeps generating heat the whole
  // time, so cooling here is even more clearly partial. The real definitive
  // treatment (dantrolene, a direct skeletal-muscle ryanodine-receptor
  // antagonist; bromocriptine, a dopamine agonist) is NOT carried in any
  // field EMS formulary and is not modeled — no field cure exists.
  neurolepticMalignantSyndrome: {
    initial: { age: 47, hr: 122, sbp: 168, dbp: 102, rr: 22, glu: 100, pain: 4,
      temp: 39.3, nmsRigidity: 0.55 },
    progress(pat, dt) {
      if (pat._nmsRestSvr == null) pat._nmsRestSvr = pat.ageProfile.baseSVR();

      // Sustained lead-pipe rigidity — condition-owned, narrated at the
      // "reflexes" action. Ramps HALF as fast as serotoninSyndrome's own
      // clonus (0.006/min vs 0.012/min): the real days-scale time course
      // means most of the rise already happened off-scene; the field
      // encounter shows a slow further slide, not the initial onset.
      pat.nmsRigidity = clamp((pat.nmsRigidity ?? 0.55) + dt * 0.006, 0.5, 0.95);

      // Autonomic instability: hyperthermia through the shared
      // hypermetabolism handle. Ceiling of 2.0 sits ABOVE serotoninSyndrome's
      // 1.9 — real NMS hyperthermia is often more severe/prolonged, since
      // sustained isometric rigidity itself generates heat on top of the
      // shared hypothalamic-dysregulation term every hypermetabolic
      // toxidrome in this file already uses.
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1,
        Math.min(2.0, 1.5 + pat.nmsRigidity * 0.6));

      // Tachycardia — direct rate handle, the same idiom serotoninSyndrome/
      // excitedDelirium/thyroidStorm already use, at this condition's own
      // numbers (a lower ceiling than serotoninSyndrome's 170 — NMS's
      // autonomic instability is more classically LABILE than a pure
      // sympathetic surge).
      pat.hrBase = Math.min(160, Math.max(pat.hrBase ?? 122, 112) + dt * 0.7);

      // BP lability — real vascular-tone lesion through pat.baseSVR, the
      // same mechanism serotoninSyndrome/hypertensiveUrgency already
      // established, targeted at a more modest multiple than
      // serotoninSyndrome's own 1.7x — real NMS blood pressure swings
      // between hyper- and hypotensive rather than sitting purely high.
      const svrTarget = pat._nmsRestSvr * 1.4;
      pat.baseSVR += (svrTarget - pat.baseSVR) * Math.min(1, dt / 4);

      // Altered mental status: real agitation (composed with sedation
      // automatically by neuro.js's updateCerebral, the same mechanism
      // serotoninSyndrome/excitedDelirium already use) plus confusion
      // through the shared toxic-encephalopathy handle. Agitation ceiling
      // (0.55) is LOWER than serotoninSyndrome's 0.7 and encephalopathy is
      // weighted more heavily — NMS more classically presents as stuporous/
      // mute rigidity than agitated confusion.
      pat.agitationBurden = Math.max(pat.agitationBurden || 0, 0.55);
      pat.metabolicEncephalopathy = Math.max(pat.metabolicEncephalopathy || 0,
        0.4 + pat.nmsRigidity * 0.4);

      // No seizure-risk term: unlike serotonin syndrome, seizures are not
      // part of the real, classic NMS tetrad (Caroff & Mann) — deliberately
      // not added just to mirror serotoninSyndrome's own epilepticDrive
      // line, since doing so would be an invented finding, not a cited one.
    },
  },

  // ===== IRON OVERDOSE (queue item 7, Toxicology) =====
  // Real, two-phase mechanism (Perrone & Hoffman, "Iron toxicity," UpToDate/
  // review literature; the classic pediatric-ingestion presentation). PHASE 1
  // (0-6h, field-relevant): iron salts are DIRECTLY corrosive to the GI
  // mucosa on contact (not a systemic-toxicity effect yet) — vomiting,
  // abdominal pain, and real GI hemorrhage from mucosal injury. PHASE 2
  // (6-24h, delayed): free iron overwhelms transferrin's binding capacity
  // and enters cells, poisoning the mitochondrial electron transport chain
  // directly (a real, distinct mechanism from the corrosive phase) —
  // producing severe anion-gap metabolic acidosis, myocardial depression,
  // and shock. Stated HONESTLY, per this batch's own instruction: phase 2
  // is a real, clinically critical phase, but it is 6-24h post-ingestion —
  // beyond any single EMS call's realistic window (this engine's own scene
  // limits top out around 1200s = 20 minutes) — so this condition builds
  // phase 1 as the real, field-relevant mechanism and states phase 2's real
  // timeline honestly rather than force-compressing it into the call, the
  // same "real but out-of-window" framing carbonMonoxidePoisoning/
  // toxicInhalationChlorine's own delayed-injury comments already establish.
  //
  // WIRED THROUGH THE EXISTING GI-HEMORRHAGE MECHANISM: reuses
  // pat.activeBleedRate — the same mass-conserving hemorrhage pathway
  // upperGIBleed/lowerGIBleed already use — rather than inventing a parallel
  // one, per this batch's own instruction to reuse a same-session GI-
  // hemorrhage mechanism if one exists. Direct mucosal corrosive injury also
  // drives vomiting (pat.airwayFluid, the same aspirated/vomitus handle
  // aspirationPneumonitis/upperGIBleed already use) and real, sustained pain
  // (pat.intrinsicPain).
  //
  // A pediatric presentation (age/weight profile scales everything else) —
  // deliberately chosen, per the real epidemiology: unintentional pediatric
  // ingestion of adult iron supplements (prenatal vitamins, in particular)
  // is the classic, most common real-world iron-overdose case, historically
  // a leading cause of fatal pediatric poisoning before child-resistant
  // packaging.
  ironOverdose: {
    initial: { age: 2, weight: 12, hr: 128, sbp: 96, dbp: 58, rr: 26, glu: 100, pain: 5 },
    progress(pat, dt) {
      // A real, modest, DIRECT-corrosive-injury GI bleed — deliberately
      // smaller in magnitude than upperGIBleed's own peptic-ulcer-artery
      // bleed (0.05-0.22 ceiling): iron's phase-1 injury is diffuse mucosal
      // corrosion, not a single eroded vessel, so it is real but milder in
      // this field-relevant window. MEASURED and rescaled down from a
      // first draft (0.0025/0.02-0.10): that magnitude, calibrated against
      // this engine's adult-reference GI-bleed conditions, exsanguinated a
      // ~960 mL (80 mL/kg) toddler blood volume by more than half within
      // 15 minutes untreated — a fabricated near-death crisis, not this
      // phase's real, modest severity. Rescaled to a real, field-honest
      // volume loss instead.
      pat.activeBleedRate = clamp((pat.activeBleedRate ?? 0) + dt * 0.0009, 0.01, 0.035);
      // Repeated vomiting of blood-tinged gastric content — the same
      // aspirated/vomitus handle several other GI-mechanism conditions
      // already use, real airway-management relevance for a toddler.
      pat.airwayFluid = Math.min(0.25, (pat.airwayFluid || 0) + dt * 0.015);
      // Real, sustained abdominal pain from direct mucosal injury — the
      // same persistent-pain handle (queue item 20) other conditions with a
      // real symptom but no vitals catastrophe already use.
      pat.intrinsicPain = clamp((pat.intrinsicPain ?? 5) + dt * 0.02, 4, 8);
      // NOT modeled here, deliberately: the delayed (6-24h) mitochondrial/
      // metabolic-acidosis phase. No cytochromeBlock/anion-gap term is
      // written — that phase genuinely has not started yet at 20 minutes
      // post-ingestion, and faking an early version of it would misrepresent
      // the real timeline this condition's own scenario resolve() states
      // honestly.
    },
  },

  // ===== HYDROCARBON ASPIRATION (queue item 7, Toxicology) =====
  // Real mechanism, genuinely distinct from toxicInhalationChlorine's
  // gas-phase direct mucosal/airway chemical burn (confirmed by reading that
  // condition's own comment before building this one, per this batch's
  // instruction) — aspirated liquid hydrocarbon (gasoline, lighter fluid;
  // low-viscosity/low-surface-tension products are the classic pediatric
  // ingestion case, since they spread easily and are aspirated during the
  // coughing/gagging the swallow itself provokes) directly dissolves and
  // disrupts pulmonary SURFACTANT on contact with alveolar tissue — a
  // biophysical/chemical injury to the alveolar lining, not an irritant-gas
  // mucosal/bronchospasm mechanism. The real consequence is a genuine,
  // measurable fall in lung COMPLIANCE (surfactant normally lowers alveolar
  // surface tension; losing it collapses alveoli and stiffens the lung) —
  // wired directly through pat.compliance (patient.js — confirmed via grep
  // that nothing resets this field per-tick, the same "condition-owned,
  // safe to mutate directly" property pat.contractilityFactor already has),
  // the real respiratory-compliance-driven mechanism this batch's own
  // instruction asks for, reusing the SAME variable respiratory.js's gas-
  // exchange equations already read for every other compliance-affecting
  // process in this engine (edema, ARDS) rather than inventing a parallel
  // one.
  //
  // REAL TIME COURSE: chemical pneumonitis from hydrocarbon aspiration
  // classically WORSENS over hours (Marraffa & Cohen review; onset of
  // crackles/hypoxia is often delayed by 30-60+ minutes and progresses over
  // 6-24h), not seconds — this condition ramps slowly and deliberately does
  // NOT reach its full severity within a typical 900-1200s call, the honest
  // "you are watching the early part of a longer process" framing this
  // batch's own instruction asks for, matching the real clinical teaching
  // that a reassuring early exam does not rule out significant aspiration.
  hydrocarbonAspiration: {
    initial: { age: 3, weight: 14, hr: 118, sbp: 92, dbp: 56, rr: 28, glu: 100, pain: 2 },
    progress(pat, dt) {
      // Direct surfactant-disruption compliance fall — a FRACTIONAL decline
      // off this patient's own real baseline (captured once, on the first
      // tick), not an absolute subtraction: a small child's own absolute
      // compliance is already tiny (patient.js scales it by body mass), so
      // an absolute per-minute decrement sized for an adult chest would
      // hit a floor within minutes rather than the real hours-scale
      // process this mechanism is supposed to be. Targets a real, moderate
      // 40% loss of compliance (a genuine, clinically significant chemical
      // pneumonitis, short of ARDS-grade collapse), approached slowly
      // (tau ~100 min) so a typical 15-20 minute call shows only the real,
      // modest EARLY part of a process that continues for hours — the
      // honest "reassuring early exam does not rule out significant
      // aspiration" teaching point this batch's own instruction asks for.
      if (pat._hcComplianceBase === undefined) pat._hcComplianceBase = pat.compliance ?? 0.09;
      const complianceTarget = pat._hcComplianceBase * 0.6;
      pat.compliance = pat.compliance + (complianceTarget - pat.compliance) * Math.min(1, dt * 0.01);
      // A modest, real, secondary Starling-leak/edema contribution (the
      // chemical injury also damages the alveolar-capillary membrane, not
      // just surfactant) — small and slow, well below toxicInhalationChlorine's
      // own gas-phase-burn ceiling, since this is a much smaller aspirated
      // volume than a whole-room gas exposure.
      pat.edema = clamp((pat.edema ?? 0) + dt * 0.003, 0, 0.15);
      pat.shuntFraction = clamp((pat.shuntFraction ?? 0.1) + dt * 0.004, 0.1, 0.35);
      // A real, mild irritant cough reflex — NOT the dominant mechanism
      // here (unlike chlorine's own bronchospasm-primary picture), so kept
      // modest and capped well below any bronchospastic condition's ceiling.
      pat.broncho = clamp((pat.broncho ?? 0.15) + dt * 0.003, 0.1, 0.3);
    },
  },

  // ===== BOX JELLYFISH ENVENOMATION (queue item 7, Toxicology/Environmental) =====
  // A genuinely different mechanism from the already-shipped `envenomation`
  // (crotaline pit-viper coagulopathy — reviewed as this condition's own
  // template before building, per this batch's instruction): box jellyfish
  // (Chironex fleckeri and relatives) venom contains pore-forming toxins
  // that act directly on cardiac myocyte membranes, causing potassium efflux
  // and a real, dangerous cardiotoxic/arrhythmogenic effect — cardiovascular
  // collapse and lethal arrhythmia, not a hemostatic/coagulopathy picture
  // (Winkel et al., "Wet-to-dry" and cardiotoxicity reviews; Currie, "Marine
  // antivenoms," J Toxicol 2003). Wired as DIRECT FIELD CEILINGS on the real
  // arrhythmia-substrate/rhythm-instability accumulator (cardiovascular.js's
  // pat.rhythmInstability, the same field the AICD-magnet-suppression batch
  // already established a condition can add to directly), reusing the
  // engine's existing rhythm machinery rather than inventing a parallel one
  // — the SAME "direct field ceilings, not routed through an unrelated
  // pathway" idiom envenomation's own coagulation-factor ceilings already
  // established, applied here to a genuinely different (cardiac, not
  // hemotoxic) venom target. pat.contractilityFactor (already a real,
  // condition-owned multiplier — reused, not reset, per takotsubo's own
  // precedent) carries the real, if modest, direct myocardial-depressant
  // component.
  //
  // FIELD TREATMENT, stated honestly: vinegar (acetic acid) is the real,
  // guideline-supported first-aid measure — it deactivates UNFIRED
  // nematocysts still adherent to the skin, preventing further envenomation
  // from tentacle fragments, but does nothing to reverse venom already
  // injected (Currie 2003). No field antivenom mechanism is modeled — real
  // Australian box jellyfish antivenom is a hospital-administered product
  // not carried in this formulary, the same honest "recognize, decontaminate,
  // supportive care, no field antidote" precedent envenomation's own
  // crotaline write-up already established for a different venom class.
  boxJellyfishSting: {
    initial: { age: 27, hr: 118, sbp: 122, dbp: 78, rr: 24, glu: 100, pain: 9 },
    progress(pat, dt) {
      // Severe, sustained local pain — the real, immediate, dominant
      // presenting symptom (tentacle contact pain is famously among the
      // most severe of any envenomation).
      pat.intrinsicPain = clamp((pat.intrinsicPain ?? 9) + dt * 0.01, 8, 10);
      // Real, direct cardiotoxic membrane effect — a genuine, if modest at
      // this presenting severity, direct contribution to arrhythmia risk,
      // additive alongside every other cause this substrate already
      // composes (ischemia, hyperK, triggered activity). Vinegar (once
      // applied) does NOT reverse venom already injected — it only prevents
      // FURTHER envenomation from unfired nematocysts, so this term keeps
      // accruing at its own natural rate regardless of vinegar; it is not a
      // treatment lever for this specific mechanism, matching the real,
      // honest pharmacology (vinegar's benefit is preventive, not curative).
      if (!pat.icdSuppressed) pat.rhythmInstability = clamp((pat.rhythmInstability ?? 0) + dt * 0.006, 0, 2);
      // A real, if modest, direct myocardial-depressant contribution —
      // reused condition-owned multiplier, the same idiom takotsubo/
      // tricyclicOverdose already use, deliberately smaller than either
      // of those since this is a single sting envenomation, not a systemic
      // catecholamine storm or a sodium-channel toxidrome.
      pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - dt * 0.0015, 0.7, 1);
      // Real, if mild, sympathetic/pain-driven tachycardia and hypertension
      // on top of the cardiotoxic substrate above.
      pat.hrBase = clamp((pat.hrBase ?? 118) + dt * 0.015, 110, 132);
    },
  },

  // ===== ACQUIRED METHEMOGLOBINEMIA (queue item V2-30, clinical measurement
  // and monitoring physiology) =====
  // A benzocaine topical-anesthetic exposure — the single most common
  // EMS-relevant trigger (Guay, Anesth Analg 2009): "caine" local
  // anesthetic sprays used for awake nasal intubation / endoscopy /
  // dental procedures are a well-documented cause of acute
  // methemoglobinemia, since benzocaine directly oxidizes ferrous (Fe2+)
  // hemoglobin to the ferric (Fe3+) methemoglobin form, which cannot bind
  // O2. Chosen over dapsone/nitrite triggers because it needs no new drug
  // entity — the exposure is pre-hospital (already administered before
  // EMS arrival, e.g. by an ED/dental provider), matching this project's
  // own "presents already symptomatic" convention for a toxidrome whose
  // causative dose is not something the crew themselves gives.
  //
  // THE REAL, DISTINCT TEACHING POINT from carbonMonoxidePoisoning
  // immediately above (same file, same category, deliberately contrasted):
  // CO pulls the pulse-ox reading falsely HIGH (toward 100%, masking a real
  // deficit). Methemoglobin does the OPPOSITE — its absorption spectrum
  // sits between reduced and oxygenated Hb, so a standard two-wavelength
  // pulse oximeter reads a value that is falsely LOW but STUCK near ~85%,
  // essentially independent of the patient's true oxygen-carrying status
  // once metHb is significant (Barker, Anesthesiology 1989; Watcha, Anesth
  // Analg 1989) — wired directly in patient.js's vitals() (see that file's
  // own comment at the metHb constructor field). Genuinely does NOT respond
  // to supplemental O2 the way ordinary hypoxemia does: pat.metHb has no
  // FiO2-dependent clearance term (unlike cohb's real, oxygen-competitive
  // displacement) — real methemoglobin reduction depends on NADH-
  // methemoglobin reductase (a slow, hours-scale endogenous process) or
  // methylene blue (the real antidote, NOT carried in this formulary, the
  // same honest "no field cure" posture already established for
  // hydroxocobalamin-adjacent and crotaline-envenomation cases). High-flow
  // O2 is still the correct FIELD action (it maximizes what dissolved-O2
  // and remaining functional Hb can deliver, per pat.caO2's own 0.003*pao2
  // term) even though it will not move the stuck pulse-ox number or fully
  // correct caO2 — the scenario's own resolve() states this honestly.
  //
  // Presenting severity 0.28 (28% metHb) — inside the real, well-documented
  // symptomatic-but-not-immediately-lethal 20-45% band (cyanosis unresponsive
  // to O2, tachycardia, mild dyspnea; >70% is lethal per the same
  // literature) — a real, moderate, teachable severity, not the mild <15%
  // tier that is often asymptomatic.
  acquiredMethemoglobinemia: {
    initial: { age: 58, hr: 108, sbp: 132, dbp: 82, rr: 20, glu: 96, pain: 1, metHb: 0.28 },
  },

  // ===== NECROTIZING FASCIITIS =====
  // Queue item 7's standing condition-library workstream, section 8's
  // Infectious-disease backlog. Confirmed genuinely unbuilt before writing
  // anything (lesson 16): grepped Object.keys(CONDITIONS) and
  // "necrotizingFasciitis"/"necFasc" across every file — no matches
  // anywhere.
  //
  // REAL CLINICAL PICTURE (Stevens & Bryant, NEJM 2017; Wong et al., J Bone
  // Joint Surg 2003 — the LRINEC-era literature this teaching point comes
  // from): a rapidly progressive soft-tissue infection, classically
  // following a minor wound/laceration (sometimes no identifiable portal),
  // causing PAIN OUT OF PROPORTION to visible findings (the single most
  // cited early teaching point — the exam looks like cellulitis, the pain
  // does not), rapid systemic toxicity (fever, tachycardia, hypotension)
  // and progressive tissue destruction. Untreated mortality is very high;
  // the only definitive treatment is emergent surgical debridement, wholly
  // outside prehospital scope. The real field job is EARLY RECOGNITION
  // (the disproportionate-pain teaching point) and RAPID TRANSPORT — there
  // is no field cure, matching this project's own established honesty for
  // esophagealVaricealHemorrhage/envenomation.
  //
  // MECHANISM — reuses the SAME shared inflammation cascade
  // pneumoniaSepsis/septicShock already build on (inflammation.js's
  // pat.pathogenBurden -> pat.cytokineLoad, item 46's work), not a
  // duplicate. The distinguishing features are the SOURCE (a local wound,
  // via wounds:) and the SPEED, not a different cascade. Checked before
  // building: pat.intrinsicPain (queue item 20's real, non-dead handle,
  // already used this way by envenomation/appendicitis for a local-injury
  // pain signal distinct from systemic vitals) is exactly the right
  // mechanism for "severe pain, modest exam findings" — a real, severe,
  // LOCAL pain signal held independent of the systemic cascade.
  //
  // Also checked (per explicit instruction) whether coagulation.js's new
  // acute-traumatic-coagulopathy pathway (queue item V2-17, gated on real
  // STRUCTURAL injury severity — brainInjury/kidneyInjury/liverInjury/
  // gutInjury/limbInjury composed with hypoperfusion) is a real consumer
  // here. It is NOT: ATC's own Brohi/Frith mechanism is specifically
  // endothelial injury from mechanical/traumatic tissue disruption plus
  // hypoperfusion, and none of its five structural-injury fields has a
  // real writer for "soft-tissue bacterial destruction" — limbInjury
  // specifically is a vascular-occlusion/ischemia mechanism (compartment
  // syndrome/tourniquet time, per that field's own header), a genuinely
  // different lesion from infective necrosis. Forcing this condition to
  // write one of those fields just to light up ATC would be the same
  // mechanism-category error the ATC comment itself warns against for
  // limbInjury. Septic coagulopathy IS still real here, through the
  // EXISTING cytokineLoad-driven consumptive pathway (coagulation.js's
  // tissue-factor term, already a generic consumer of cytokineLoad) — no
  // new coagulation work needed.
  //
  // SPEED — the real, citable distinction from pneumoniaSepsis (a days-old
  // presentation) and from septicShock (hours-old, its own myocardial-
  // depression gate measured not opening until ~93 minutes untreated,
  // per that condition's own comment): untreated necrotizing fasciitis can
  // progress from local infection to severe sepsis/septic shock within
  // 24-72 hours (Stevens & Bryant, ibid), dramatically faster than ordinary
  // cellulitis or the days-long pneumonia-sepsis course, and — the part
  // that matters for a single EMS encounter — the deterioration is fast
  // enough to be genuinely OBSERVABLE within one field encounter, unlike
  // septicShock's own honest admission that its full arc needs longer than
  // a realistic call. Modeled as a pathogenBurden climb roughly an order of
  // magnitude faster than septicShock's own dt*0.0006 (see below), and a
  // lower cytokineLoad myocardial-depression gate (0.4 vs septicShock's
  // 0.45) so the decompensation point this item's own methodology asks for
  // is actually reachable inside a realistic call, not deferred past it.
  //
  // TIME COURSE: presents already hours into a fulminant course (not the
  // days septicShock/pneumoniaSepsis's own comments cite for their more
  // established pictures) — pathogenBurden seeded at 0.45 (below
  // septicShock's 0.5, since the wound itself may be only hours old) but
  // cytokineLoad pre-seeded higher relative to that starting burden (0.35,
  // versus septicShock's 0.3 off a 0.5 burden) since a fulminant local
  // infection drives a disproportionately fast local cytokine response
  // even before systemic burden fully catches up — then both climb far
  // faster than either of those two conditions' own untreated course.
  //
  // TREATMENT — through the SAME mechanisms septicShock's own treatment
  // response already demonstrates: crystalloid (saline/plasmalyte) expands
  // stressed volume through the identical Starling-equation path every
  // capillary-leak condition uses, genuinely raising cardiac
  // output/blood pressure. The disproportionate LOCAL pain does NOT
  // resolve with fluids — nothing in pk.js's fluid fx touches
  // pat.intrinsicPain, and this condition's own progress() holds it at a
  // severe floor regardless of treatment — the actual clinical point: this
  // needs surgery, not resuscitation, to fix. No field surgical or
  // antibiotic intervention exists in this formulary, and none is
  // fabricated — the honest "recognize and transport fast" framing already
  // established for envenomation/esophagealVaricealHemorrhage.
  necrotizingFasciitis: {
    initial: {
      age: 58, weight: 88, hr: 118, sbp: 96, dbp: 60, rr: 22, glu: 148, pain: 9,
      temp: 38.9,
    },
    // A real body-map location, per wounds.js's convention (several other
    // conditions already use this — polytraumaFall/traumaPregnant). Deliberately
    // a MODEST-looking wound (laceration/minor — the wounds.js default
    // desc, "Shallow cut, clean edges, minor ooze") — the classic teaching
    // point is that the visible wound looks unimpressive relative to the
    // severity of the pain and the systemic toxicity; a dramatic-looking
    // wound would undercut the actual lesson.
    wounds: {
      legL: { type: "laceration", severity: "minor",
        note: "A small, days-old laceration below the knee — clean edges, minor ooze, nothing dramatic to look at. The skin above and below it is dusky and tight, though, and he screams when you touch skin two inches away from the wound itself that looks completely normal." },
    },
    progress(pat, dt) {
      if (pat._necFascInit === undefined) {
        pat._necFascInit = true;
        // Hours into a fulminant course, not days (pneumoniaSepsis) or the
        // "several hours" septicShock presents at — a real, moderate
        // starting burden that the FAST climb below (not a higher seed)
        // is what produces this condition's own distinguishing speed.
        pat.pathogenBurden = Math.max(pat.pathogenBurden || 0, 0.5);
        // Cytokine response disproportionately ahead of systemic burden —
        // a fulminant local process drives local/regional cytokine release
        // fast, before whole-body burden has fully caught up. See
        // septicShock's own comment for the general "seed cytokineLoad too,
        // not just pathogenBurden, for an already-established process"
        // reasoning; this condition's own ratio (0.4 off a 0.5 burden) is
        // deliberately front-loaded relative to that precedent (0.3 off
        // 0.5) for exactly this reason — the local process has already
        // driven a real cytokine response ahead of systemic burden fully
        // equilibrating.
        pat.cytokineLoad = Math.max(pat.cytokineLoad || 0, 0.4);
        // The SAME dead-flag septicShock's own comment found and wired
        // (cardiovascular.js SVR x0.45 / venous compliance x1.6,
        // metabolic.js +lactate) — necrotizing fasciitis reaching septic
        // shock IS this same distributive-shock physiology, not a
        // different one; reusing the flag rather than re-deriving an
        // equivalent SVR multiplier by hand.
        pat.riskFactors.sepsis = true;
      }
      // Fever, direct and immediate — same metabolicHeatMultiplier handle
      // septicShock/statusEpilepticus/the inflammation cascade all use.
      // Slightly higher than septicShock's 1.3: a fulminant local process
      // with this much tissue destruction runs a genuinely higher
      // hypermetabolic rate than uncomplicated urosepsis.
      pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1, 1.4);
      // Distributive vasodilation, the same handle every septic/anaphylactic
      // condition in this file uses, at a rate faster than septicShock's
      // dt*0.01 (hours to ceiling) but far short of anaph's dt*0.12
      // (seconds-to-minutes) — real septic vasoplegia developing over tens
      // of minutes to an hour, not a single ambulance transport's opening
      // minutes and not a mediator-release event.
      pat.vasodilation = clamp((pat.vasodilation || 0) + dt * 0.03, 0, 0.6);
      // Compensatory tachypnea, real qSOFA/SIRS component.
      pat.rrBase = clamp((pat.rrBase ?? 22) + dt * 0.15, 18, 36);
      // Ongoing, untreated tissue destruction and bacterial proliferation —
      // roughly an order of magnitude faster than septicShock's own
      // dt*0.0006 climb, the real, cited "hours not days" distinction this
      // condition exists to teach. No field intervention (no antibiotic,
      // no debridement) slows this — only rapid transport to definitive
      // surgical care actually changes the trajectory, which this call
      // cannot show.
      pat.pathogenBurden = clamp((pat.pathogenBurden || 0.5) + dt * 0.012, 0.5, 0.97);
      // Sepsis-induced myocardial depression, the SAME reversible handle
      // pneumoniaSepsis/septicShock already use (Vieillard-Baron, Intensive
      // Care Med 2018). Gated LOWER than septicShock's 0.45 (0.4) — given
      // this condition's own faster pathogenBurden/cytokineLoad climb, the
      // gate needs to be reachable inside a realistic ~20-30 minute call,
      // not deferred past it the way septicShock's own comment documents
      // (measured not to open until ~93 minutes there).
      if (pat.cytokineLoad > 0.4) {
        pat.contractilityFactor = clamp((pat.contractilityFactor ?? 1) - dt * 0.012, 0.55, 1);
      }
      // The actual teaching point: severe, DISPROPORTIONATE local pain,
      // held near ceiling and unmoved by anything except tissue destruction
      // itself worsening slightly over time — this is what "pain out of
      // proportion to exam findings" looks like as a real, held signal
      // rather than a one-time seed. Nothing in pk.js's fluid/analgesic fx
      // reduces pat.intrinsicPain toward baseline the way it would for an
      // ordinary wound's pain component — opioid analgesia (a real,
      // separate mechanism, drugPain in pk.js) can blunt the DISPLAYED
      // pain, but this condition's own intrinsicPain floor keeps
      // re-asserting every tick, the same "ceiling/floor re-imposed every
      // tick against a real opposing pull" idiom envenomation's own
      // coagulation-factor ceilings already established — fluids
      // specifically have no pain-related fx at all, so they cannot touch
      // this by construction, not just by omission.
      pat.intrinsicPain = clamp((pat.intrinsicPain ?? 9) + dt * 0.004, 8.5, 10);
    },
  },

  // Dengue Fever (queue item 7, section 8's Infectious-disease backlog).
  // WHO 2009 Dengue: Guidelines for Diagnosis, Treatment, Prevention and
  // Control is the standard reference throughout this condition.
  //
  // LITERATURE FIRST. A mosquito-borne flavivirus. The classic FEBRILE
  // PHASE (days 1-3): high fever, severe headache, retro-orbital pain,
  // myalgia/arthralgia ("breakbone fever") — real, but not the teaching
  // point this condition needs to carry, since it is clinically
  // indistinguishable field-wise from a dozen other febrile illnesses.
  // The real, distinct, counterintuitive lesson is SEVERE DENGUE (dengue
  // hemorrhagic fever / dengue shock syndrome): as the fever BREAKS
  // (defervescence, typically days 3-7), a real, separate, genuinely
  // dangerous process takes over — increased microvascular permeability
  // driving plasma LEAKAGE out of the intravascular space (NOT red-cell
  // destruction — this is the mechanism-category distinction from
  // malaria's hemolysis, a completely different lesion this engine
  // represents through rbcMass/hct falling together, not through this),
  // combined with real thrombocytopenia from marrow suppression and
  // peripheral platelet destruction/consumption, producing a genuine
  // bleeding tendency. Patients often look like they are getting better
  // (fever settling) at the exact moment they are entering the highest-
  // risk window — the single most-cited, most counterintuitive teaching
  // point in dengue management, and the one this condition is built
  // around.
  //
  // TIME COURSE, stated honestly. Real dengue's full natural history runs
  // days (febrile phase days 1-3, critical phase days 3-7, recovery days
  // 7-10) — no single EMS encounter can show that arc. Following this
  // file's own established precedent for conditions whose real time
  // course exceeds a call (`tricyclicOverdose`/`atropineOverdose` present
  // already-symptomatic; `septicShock` presents past its own onset
  // threshold), this condition presents the patient ALREADY AT the
  // defervescence/critical-phase transition — the fever is measurably
  // coming down (a real, direct, declining pat.metabolicHeatMultiplier,
  // not a held ceiling — the mirror image of every other febrile
  // condition in this file, which HOLDS its fever up) at the exact same
  // moment the capillary-leak/thrombocytopenia mechanism is engaging —
  // so a crew watching the monitor sees the counterintuitive real
  // teaching point directly: temperature trending down while perfusion
  // and platelets trend the wrong way, inside one realistic ~15-20 minute
  // call.
  dengueFever: {
    initial: { age: 24, weight: 68, hr: 108, sbp: 102, rr: 20, glu: 100, pain: 6, temp: 38.4 },
    progress(pat, dt) {
      if (pat._dengueInit === undefined) {
        pat._dengueInit = true;
        pat._dengueElapsedMin = 0;
        // Breakbone fever: severe headache, retro-orbital pain, myalgia/
        // arthralgia — real, sustained pain via pat.intrinsicPain (queue
        // item 20's already-real persistent-pain handle), not the acute
        // colicky/sharp pain other conditions seed at this same field.
        pat.intrinsicPain = Math.max(pat.intrinsicPain ?? 0, 7);
      }
      pat._dengueElapsedMin += dt;
      const t = pat._dengueElapsedMin;

      // --- FEBRILE PHASE, DECLINING (defervescence) ---
      // Direct, declining assignment — deliberately NOT a Math.max
      // ceiling the way septicShock/necrotizingFasciitis/etc. hold their
      // fever UP. This condition owns metabolicHeatMultiplier exclusively
      // (no other writer composes onto it here), so relaxing it DOWN
      // toward normal, over a real ~8-minute time constant, is what lets
      // the fever genuinely break during the call rather than being
      // capped-but-static. Presenting residual multiplier (1.35) is a
      // real, modest hypermetabolic fever tail; it decays toward 1.0
      // (normal resting metabolic rate) as the febrile phase resolves.
      pat.metabolicHeatMultiplier = 1 + 0.35 * Math.exp(-t / 8);

      // --- CRITICAL PHASE: plasma leakage, engaging as fever declines ---
      // pat.capillaryLeak is the SAME endothelial-permeability handle
      // preeclampsia/sepsis/pancreatitis/burns already drive
      // (metabolic.js's Starling equation is the real, already-verified
      // consumer — see that file's own header comment). Ramped toward a
      // 0.22 ceiling over ~10 minutes (dt*0.022/min) — the same order of
      // magnitude septicShock/acutePancreatitis already use for a real,
      // but not fulminant-burn-scale, permeability increase (WHO's own
      // dengue criteria cite plasma leakage evidenced by a >=20% rise in
      // hematocrit above baseline — a real, moderate, not catastrophic,
      // leak). This is a Math.max ceiling (never decreases on its own),
      // correctly asymmetric with the declining fever above: the fever
      // breaking does NOT mean the leak is resolving — it means the
      // dangerous window is opening, the whole point of this condition.
      pat.capillaryLeak = Math.max(pat.capillaryLeak ?? 0, Math.min(0.22, 0.022 * t));

      // --- THROMBOCYTOPENIA ---
      // Real dengue-specific marrow suppression + peripheral platelet
      // destruction/consumption — mechanistically distinct from the
      // tissue-factor-driven CONSUMPTIVE coagulopathy septicShock/
      // necrotizingFasciitis's shared cytokine cascade drives (this
      // condition never sets pat.pathogenBurden/cytokineLoad at all), and
      // distinct from envenomation's direct clotting-FACTOR consumption
      // (factorII/V/VIII/X) — dengue's real lesion is specifically the
      // PLATELET count, not the coagulation factor cascade. A re-imposed
      // CEILING, not a one-shot write, the same idiom preeclampsia's own
      // HELLP-pattern platelet ceiling already established: coagulation.js
      // pulls plateletCount back toward 250 every tick
      // (updateCoagulation's recovery term), so the ceiling must be
      // re-asserted every tick to hold against that real, opposing pull.
      // WHO's own warning-sign threshold is <100 x10^9/L; a presenting
      // 150 (mild, pre-critical-phase reduction) falling to a real ~65
      // by the end of a 20-minute call is a genuine, teachable warning-
      // sign-crossing trajectory, short of the severe <20 DHF/DSS floor
      // real cases can reach over their full multi-day course (correctly
      // NOT reachable inside one call, per this condition's own honest
      // time-course scoping above).
      const pltCeil = Math.max(60, 150 - 4.5 * t);
      if (pat.plateletCount > pltCeil) pat.plateletCount = pltCeil;

      // Breakbone myalgia/headache persists through the critical phase —
      // real, sustained, only slowly easing (patients do NOT feel
      // dramatically better as the fever breaks; if anything they often
      // feel worse, another real part of the same counterintuitive
      // teaching point) — held near its presenting severity rather than
      // decaying toward baseline the way an isolated febrile illness's
      // pain would.
      pat.intrinsicPain = Math.max(5, (pat.intrinsicPain ?? 7) - dt * 0.02);
    },
  },

};

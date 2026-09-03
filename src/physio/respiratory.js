// Respiratory system: ventilation mechanics and gas exchange.
// Reads: pat.rrBase, pat.drugRr, pat.paco2, pat.pao2, pat.hco3, pat.airway, pat.broncho,
//        pat.edema, pat.compliance, pat.airwayResistance, pat.tvDrugOffset, pat.fio2, pat.drugFio2, pat.ph, pat.coreTemp, pat.dpg, pat.cohb
// Writes: pat.rr, pat.vt, pat.va, pat.intrinsicPEEP, pat.paco2, pat.sao2, pat.caO2, pat.pao2, pat.svO2, pat.pvO2, pat.cohb
import { ATM, PH2O, RQ } from "./constants.js";

function oxySat(po2, ph, paco2, temp, dpgFactor = 1) {
  const safePO2 = Math.max(0, po2); // Math.pow(negative, 2.7) is NaN in JS — severe
                                     // hypoventilation can legitimately drive PAO2 below
                                     // zero on room air, and that should read as "no
                                     // oxygen", not corrupt every downstream value.
  const safePH = Math.max(6.8, Math.min(7.8, ph));
  const p50_std = 26.6 * dpgFactor;
  const dPH = safePH - 7.4;
  const dT = temp - 37;
  const logShift = -0.48 * dPH + 0.024 * dT + 0.06 * Math.log10(Math.max(10, paco2) / 40);
  const p50 = p50_std * Math.pow(10, logShift);
  const n = 2.7;
  return 100 * Math.pow(safePO2, n) / (Math.pow(safePO2, n) + Math.pow(p50, n));
}

function inverseHill(sat, p50 = 26.6, n = 2.7) {
  const s = sat / 100;
  return p50 * Math.pow(s / (1 - s), 1 / n);
}

export function updateVentilation(pat, dt) {
    // 2,3-DPG (queue item 5) — was frozen at its constructor default of 1.0
    // for the patient's entire life, so oxySat()'s dpgFactor argument (right
    // below, and in updateGasExchange) never moved: the oxyhemoglobin curve's
    // real right-shift in chronic anemia/hypoxemia never engaged. Erythrocyte
    // 2,3-DPG rises over DAYS in response to a sustained oxygen-delivery
    // deficit, not over the span of a single EMS call, so this is computed
    // ONCE, from the patient's chronic baseline, not evolved live — an acute
    // hemorrhage at minute 20 of a call must not right-shift the curve; a
    // human body cannot synthesise new 2,3-DPG that fast. Guarded on
    // pat._dpgSet so it fires on the first real tick, which is late enough to
    // see a condition's own first-tick chronic-anemia rebalancing (CKD's
    // rbcMass cut, sickle cell's Hct retarget — both already applied via
    // conds.progress() before pat.update() reaches here, so pat.hb already
    // reflects the chronic disease baseline) but is captured once and never
    // touched again, so it cannot drift with an acute bleed or transfusion.
    if (!pat._dpgSet) {
      pat._dpgSet = true;
      // Chronic anemia: Torrance et al. 1970 (NEJM) — P50 rises roughly
      // linearly as hemoglobin falls, reaching ~29-30 mmHg (vs a normal
      // ~26.6) at Hb ~6-7 g/dL, about half a normal adult reference (~14-15
      // g/dL male / ~13.5 g/dL female) — a +10-13% shift. Coefficient
      // (0.25) identified so a patient at half their own reference Hb lands
      // in that band: 0.5 deficit x 0.25 = +12.5%.
      const hbRef = pat.ageProfile.normalHb();
      const hbFrac = hbRef > 0 ? Math.max(0, Math.min(1, (pat.hb ?? hbRef) / hbRef)) : 1;
      const chronicAnemiaShift = Math.max(0, 1 - hbFrac) * 0.25;
      // Chronic hypoxemia (COPD, chronic hypoxic lung disease): Lenfant et
      // al.'s high-altitude/chronic-hypoxemia studies document a comparable,
      // more modest ~5-9% P50 rise for sustained hypoxemia adaptation. This
      // engine's own `riskFactors.copd` is a flat flag, not graded by resting
      // SpO2 (patient.js:213 already treats it the same way for compliance/
      // resistance/FRC), so a fixed +7% is the honest reading of that same
      // input rather than inventing a severity scale copd doesn't have.
      const chronicHypoxiaShift = pat.riskFactors.copd ? 0.07 : 0;
      pat.dpg = Math.max(1.0, Math.min(1.35, 1.0 + chronicAnemiaShift + chronicHypoxiaShift));
    }
    const expectedPaco2 = 1.5 * (pat.hco3 || 24) + 8;
    const paco2Error = pat.paco2 - expectedPaco2;
    // RESPIRATORY DRIVE SUPPRESSION (opioids, sedatives, anesthetics).
    // These agents do not simply subtract breaths — they blunt the medullary
    // chemoreceptor GAIN, so the patient stops responding to rising CO2. That
    // distinction is the whole clinical picture: with an intact CO2 response a
    // fixed rate reduction is self-limiting (CO2 rises, drive rises, ventilation
    // recovers), which is why a pure rate offset could never produce a genuine
    // opioid overdose. With the gain suppressed, hypoventilation raises CO2, the
    // blunted chemoreceptor fails to answer, and the patient progresses to
    // hypercapnic respiratory failure — reversible by naloxone restoring the
    // gain. Driven by pat.respDriveSuppression (0 = intact, 1 = abolished).
    // Chronic CO2 retainers (advanced COPD) have a BLUNTED central chemoreceptor
    // response: years of hypercapnia desensitise the CO2 drive, which is why they
    // tolerate a PaCO2 in the 50s without the ventilatory response a normal
    // person would mount. It is the same gain-suppression mechanism opioids use,
    // so it composes with them rather than needing separate machinery — and it is
    // why an opioid is so much more dangerous in this patient.
    const driveSupp = Math.max(0, Math.min(1,
      (pat.respDriveSuppression || 0) + (pat.chronicCO2Blunting || 0)));
    const driveGain = 1 - driveSupp;
    let rr = pat.rrBase + pat.drugRr;
    if (pat.paco2 > 40) rr += (pat.paco2 - 40) * 0.1 * driveGain;
    // Hypocapnia suppresses respiratory drive — without this the drive could only
    // ever raise RR above baseline, so any patient whose resting mechanics ran a
    // little rich stayed permanently alkalotic.
    // HYPOCAPNIC VENTILATORY SUPPRESSION.
    // Falling CO2 is a powerful respiratory depressant: in awake humans the
    // apnoeic threshold sits only a few mmHg below resting PaCO2, so drive is
    // strongly withdrawn as the arterial value falls. This must be able to
    // restrain tachypnoea that originates from a condition's own rrBase, not
    // merely trim it — otherwise a scenario that sets a high respiratory rate
    // hyperventilates without limit and reaches pH 7.5-7.6, which real patients
    // do not sustain. Hypoxic and acidotic drives above remain able to override
    // it, which is exactly the competition that decides the real arterial value.
    // OBSTRUCTION OVERRIDES THE HYPOCAPNIC BRAKE.
    // The brake above is right for a normal patient, and wrong for an obstructed
    // one. A severe asthmatic is tachypnoeic AND hypocapnic at the same time:
    // the low PaCO2 is the RESULT of a respiratory rate driven by rapidly
    // adapting irritant receptors and J-receptors in the airway wall, afferents
    // that are mechanical rather than chemical and so are not withdrawn as CO2
    // falls. Applying chemoreceptor logic to that patient makes the model slow
    // them down for breathing hard.
    //
    // Measured before this change, at 5 minutes into the asthma scenario: the
    // condition sets rrBase 26, the brake removed 5.99, and the patient settled
    // at rr 19.7 with a PaCO2 of 31 — hypocapnic, which is correct, but no longer
    // tachypnoeic, which is not. Documented severe asthma runs 25-40.
    //
    // Scaled by bronchoconstriction (previous tick's value, as elsewhere in this
    // module) so it is obstruction that suspends the brake, not a diagnosis, and
    // so the brake returns intact as the obstruction resolves. 0.85 rather than
    // 1.0 leaves the chemoreceptor a residual say even at maximal obstruction.
    //
    // This also matters clinically well beyond the rate: the RISING PaCO2 of a
    // tiring asthmatic is only an ominous sign if they were hypocapnic to begin
    // with, and that arc could not previously be shown.
    //
    // QUEUE ITEM 41. Extended to upperAirwayObstruction (croup, epiglottitis)
    // for the identical reason: fixed extrathoracic narrowing stimulates the
    // SAME class of mechanical laryngeal/tracheal irritant afferent that
    // drives stridor and tachypnea in real croup, independent of the
    // patient's own PaCO2 — not a chemoreceptor signal, so it should not be
    // withdrawn as CO2 falls either. Before this fix croup/epiglottitis had
    // NO mechanism at all connecting worsening obstruction to a rising
    // respiratory rate — measured, a held-severity sweep on a bare
    // croupToddler substrate showed rr FALLING slightly (28.0 -> 27.4) as
    // uao rose from 0 to 0.85, the opposite of the hallmark clinical sign,
    // because croup's own hypocapnic paco2 (~33, below the 38 threshold)
    // was suppressing rate through the untouched brake while nothing pulled
    // the other way. Using max(effectiveBroncho, upperAirwayObstruction)
    // rather than summing keeps this a "is there significant obstruction of
    // EITHER kind" gate, not a double-counted magnitude — a patient with
    // both bronchospasm and upper airway swelling does not get 1.7x the
    // brake suspension of either alone.
    const obstructionDrive = 1 - 0.85 * Math.max(0, Math.min(1,
      Math.max(pat.effectiveBroncho || 0, pat.upperAirwayObstruction || 0)));
    if (pat.paco2 < 38) rr -= (38 - pat.paco2) * 0.9 * driveGain * obstructionDrive;
    if (pat.pao2 < 60) rr += (60 - pat.pao2) * 0.15 * driveGain;
    if (paco2Error > 2) rr += paco2Error * 0.3 * driveGain;
    rr += (pat.sympathetic - 0.3) * 5 * driveGain;
    // Suppressed drive lowers the resting rate itself toward apnea, and shallows
    // each breath — opioids reduce both frequency AND tidal volume.
    rr *= (1 - 0.75 * driveSupp);
    if (pat.drugPain > 0) rr += pat.drugPain * 0.1;

    // Paralysis: vt forced to 0, and display rr = 0
    if (pat.tvDrugOffset < 0) {
      pat.vt = 0;
      pat.rr = 0;   // monitor will show 0
      pat.va = 0;
      return;
    }

    pat.rr = Math.max(4, Math.min(40, rr));

    // Inspiratory effort is also blunted by drive suppression: opioids and
    // sedatives shallow the breath as well as slowing it, so minute ventilation
    // falls faster than rate alone suggests.
    // INSPIRATORY EFFORT.
    // Effort is referenced to a FIXED normal resting rate, not to the patient's
    // own (possibly collapsing) rrBase. Scaling by rr/rrBase made the ratio
    // explode as respiratory drive failed: in respiratory arrest rrBase falls
    // toward zero, so a patient taking 4 slow agonal breaths was scored as
    // breathing four times harder than baseline and generated a 1.5 L tidal
    // volume — deeper breaths the closer they came to apnoea, which inverts the
    // physiology. A failing patient breathes shallowly AND slowly.
    // Effort is additionally bounded: respiratory muscles have a maximum
    // inspiratory pressure, and it falls as drive is suppressed or the patient
    // fatigues.
    // Effort rises SUB-LINEARLY with rate and is tightly bounded. Rapid breathing
    // is shallow breathing: as rate climbs, inspiratory time shortens (Ti below)
    // and the achievable tidal volume falls, so effort must not scale linearly or
    // a tachypnoeic patient ends up breathing both fast AND deep, hyperventilating
    // into an implausible alkalosis (measured pH 7.60 in PE and trauma). The
    // square-root relation with a ceiling reproduces the observed pattern:
    // meaningful extra effort at moderate tachypnoea, diminishing returns beyond.
    const REST_RR_REF = 14;                       // normal adult resting rate
    // HYPOCAPNIA WITHDRAWS DRIVE FROM DEPTH, NOT ONLY FROM RATE.
    // The rate controller above already backs off once PaCO2 falls below 38, but
    // effort carried no such term — so a high-drive patient kept taking
    // FULL-SIZE breaths at a high rate and ventilated into an alkalosis no awake
    // patient sustains (pH up to 7.68 in the PE scenario once resting effort was
    // correctly identified). Drive is a single medullary output: it sets depth
    // and rate together, and hypocapnia withdraws both. The floor is not zero
    // because the hypoxic and metabolic-acidosis drives can and do override the
    // hypocapnic brake — which is precisely why a patient in shock keeps
    // hyperventilating despite a low PaCO2.
    const hypocapnicBrake = Math.max(0.55, Math.min(1,
      1 - (38 - (pat.paco2 ?? 40)) * 0.03));
    const effortRatio = Math.max(0.4, Math.min(1.15,
      Math.sqrt(Math.max(0.05, pat.rr / REST_RR_REF)))) * hypocapnicBrake;
    const Ti = 60 / Math.max(10, pat.rr) * 0.33;
    // DYNAMIC HYPERINFLATION REDUCES COMPLIANCE.
    // Trapped gas raises functional residual capacity, so tidal breathing happens
    // higher up the lung's pressure-volume curve — on its flat, stiff portion.
    // The chest is already near full, so each further millilitre costs more
    // pressure. This closes the trapping loop: obstruction traps gas, trapping
    // stiffens the chest, a stiffer chest raises the work of breathing, and the
    // extra work accelerates fatigue. It is also why hyperinflated patients
    // benefit from a SLOWER rate — more expiratory time lets the trapped volume
    // fall, which softens the chest again.
    // Referenced to a nominal 2 L of trapping causing near-total loss of reserve.
    const hyperinflation = Math.max(0, Math.min(0.6, (pat.trappedVolume || 0) / 2.0));
    // PLEURAL SPACE-OCCUPYING FLUID (queue item 7 — pleuralEffusion,
    // hemothorax). A large effusion or hemothorax compresses the lung from
    // OUTSIDE the parenchyma — mechanically a restrictive lesion, distinct
    // from edema (which floods the alveoli themselves) and from pneumothorax
    // (air, handled separately via itp/shunt in cardiovascular.js — see
    // pat.ptx). One general handle, 0-1, so both conditions that fill the
    // pleural space with liquid (blood or transudate/exudate) share it
    // rather than each inventing their own compliance term.
    const C = pat.compliance * (1 - pat.edema * 0.5) * (1 - hyperinflation) *
      (1 - (pat.pleuralEffusion || 0) * 0.4);
    // SEVERE PULMONARY EDEMA FLOODS THE CONDUCTING AIRWAY TOO, NOT ONLY THE
    // ALVEOLI. `pat.edema` above governs alveolar/interstitial flooding (via
    // compliance and dlco in patient.js); once it is severe the same
    // transudate froths up into the trachea and pharynx as the classic pink
    // frothy sputum of flash pulmonary oedema — the reason these patients
    // need active suctioning, not only oxygen and CPAP. General mechanism
    // (not a per-condition special case): every condition that already drives
    // pat.edema this high (chf, hypertensiveEmergency, myocarditis in extremis)
    // gets this consequence for free. Threshold at 0.6 so ordinary,
    // moderate CHF (edema well under that) does not flood the airway — only
    // the severe/flash end does; 0.15/min past threshold reaches roughly half
    // scale within ~10-15 minutes of sustained severe edema, a realistic call
    // timescale for a deteriorating flash-pulmonary-oedema patient.
    if (pat.edema > 0.6) {
      pat.airwayFluid = Math.min(1, (pat.airwayFluid || 0) + (pat.edema - 0.6) * 0.15 * dt);
    }
    // AIRWAY SMOOTH MUSCLE TONE FROM BETA-2 RECEPTOR ACTIVITY.
    // Bronchial smooth muscle is held relaxed by tonic beta-2 stimulation, so
    // airway calibre is a function of beta2Tone, not a standalone number. This
    // was the missing link: beta2Tone was composed correctly from neural
    // sympathetic drive, circulating catecholamines and beta-2 drugs, but its
    // only consumer anywhere was lactate production — so albuterol "dilated" by
    // writing pat.broncho directly (a stat change), and beta blockade could not
    // narrow the airway at all, which is why beta-blocker-induced bronchospasm
    // was impossible to represent.
    // Resting tone (~0.35) is the reference: above it the airway dilates
    // (albuterol, endogenous epinephrine in stress), below it the airway
    // constricts (beta blockade). Disease-driven pat.broncho still sets the
    // underlying obstruction; this modulates it the way receptors actually do.
    // Reference = the engine's actual resting beta-2 tone, so a patient with no
    // drug on board and no sympathetic activation sits exactly at their disease's
    // own airway calibre and this term contributes nothing. (Measured resting
    // beta2Tone is ~0.07; using a higher reference would impose a tonic
    // bronchoconstriction on every patient in the simulator.)
    const REST_BETA2 = 0.07;
    // Airway smooth muscle sees SYSTEMIC beta-2 tone plus any LOCAL drug
    // deposited directly on it by the inhaled route. That local term is what
    // makes a nebuliser far more effective per unit of systemic exposure than
    // the same drug given intravenously.
    const beta2Delta = (pat.beta2Tone ?? REST_BETA2) - REST_BETA2 + (pat._beta2Airway || 0);
    // Dilation saturates (receptor reserve); constriction from blockade is
    // limited but real, and bites hardest when obstruction is already present.
    // DILATION GAIN: 0.5 -> 0.113. The 0.6 ceiling is correct and stays — there
    // is a maximum achievable bronchodilation, and receptor reserve is real. What
    // was wrong is how fast the model reached it: a SINGLE standard albuterol
    // nebuliser produced an uncapped relax of 0.921 against that 0.6 ceiling, so
    // the first dose landed 53% PAST maximum.
    //
    // The consequence was that albuterol could not be titrated at all. Measured
    // on the asthmaAttack scenario, peak beta2Delta accumulates correctly with
    // repeat dosing — 1.84, 3.63, 5.30 for one, two and three nebulisers — but
    // the resulting bronchoconstriction was IDENTICAL at 0.234 for all three,
    // because every one of them was clamped. The escalation machinery was
    // present and working; it was invisible behind the ceiling. This is the same
    // defect class as amiodarone's ec50 and vasopressin's SVR clamp: a drug on
    // the flat top, where an overdose is indistinguishable from a correct dose.
    // It was found by curveDrugAudit.mjs, which reported 1.4% sensitivity to
    // doubling albuterol's own receptor coefficient.
    //
    // 0.113 is identified from the dosing regimen, not fitted: three back-to-back
    // nebulisers in the first hour is the standard escalation for moderate-severe
    // asthma, and benefit plateaus after roughly three. So the THIRD dose should
    // be arriving at the ceiling, not the first: 0.6 / 5.30 = 0.113. That yields
    // 0.21, 0.41 and 0.60 for one, two and three doses — 35%, 68% and 100% of
    // maximal dilation, which is the escalation curve the scenario exists to
    // teach.
    //
    // NOTE: this gain is shared by every beta-2 source, including endogenous
    // sympathetic tone and the bronchodilation of epinephrine in anaphylaxis.
    // That is correct — it is one receptor population — but it means the
    // anaphylaxis assertions are the ones to watch on any change here.
    const beta2Relax = beta2Delta >= 0
      ? Math.min(0.6, beta2Delta * 0.113)
      : Math.max(-0.5, beta2Delta * 0.6);
    const effBroncho = Math.max(0, Math.min(1,
      (pat.broncho || 0) * (1 - beta2Relax) - (beta2Relax > 0 ? beta2Relax * 0.15 : 0)));
    pat.effectiveBroncho = effBroncho;
    // AIRWAY RESISTANCE RISES STEEPLY WITH NARROWING.
    // Poiseuille's law makes resistance inversely proportional to the FOURTH
    // power of radius, so a modest reduction in airway calibre produces a large
    // rise in resistance. A linear (1 + broncho*0.8) relation capped severe
    // bronchospasm at 1.8x normal resistance, when status asthmaticus runs
    // 5-15x — which is why the model's "severe" asthmatic was doing almost no
    // extra work of breathing and could never tire. The exponential form
    // reproduces the steep non-linearity without pretending to resolve
    // individual airway geometry.
    // Total respiratory resistance = airway (bronchodilator-responsive, and
    // steeply non-linear with narrowing) PLUS tissue/chest-wall resistance, which
    // is not relieved by bronchodilators.
    // An artificial airway replaces the collapsible upper airway with a fixed
    // conduit. It relieves upper-airway resistance ONLY — a tube does nothing
    // for bronchospasm, which is distal to it, so the exponential bronchospasm
    // term is applied to the reduced baseline rather than removed.
    // AIRWAY FLUID (queue item 13) — secretions/vomit/blood/aspirated water
    // sitting in the conducting airway narrow it mechanically, the same
    // Poiseuille effect bronchospasm produces via smooth-muscle narrowing, so
    // it is applied the same way: an exponential multiplier on the SAME
    // airway-resistance term (not the tissue term, which fluid in the lumen
    // does not touch). Coefficient 1.3 sits between "present but mild" and
    // bronchospasm's own 1.7 (which reaches 5-15x at status-asthmaticus
    // severity) — airwayFluid realistically tops out lower than a fully
    // bronchospastic airway (pediatricDrowning caps at 0.7, severe flash
    // pulmonary oedema below), so a somewhat gentler coefficient still produces
    // a clinically real, roughly-doubling rise at those levels without
    // implying a degree of total obstruction the model's own sources never
    // reach: exp(0.7*1.3) = 2.5x baseline resistance.
    // UPPER AIRWAY OBSTRUCTION (croup, epiglottitis) — see patient.js's own
    // comment for why this is a separate handle from effBroncho: not
    // beta-2-responsive, and deliberately included here (raises baseline
    // resistance in both phases) but NOT in the Rexp dynamic-compression
    // term below, which is specifically the intrathoracic collapse
    // mechanism bronchospasm produces. Coefficient 1.5 sits between
    // airwayFluid's 1.3 and bronchospasm's 1.7 — fixed extrathoracic
    // narrowing is a real, sometimes airway-threatening obstruction, but
    // this model does not give it bronchospasm's full severity ceiling,
    // since the two are anatomically and mechanistically distinct lesions.
    // TRACHEOSTOMY (queue item 60, part 2 of 3). A surgical airway sits
    // BELOW the larynx/pharynx, so it physically bypasses croup/
    // epiglottitis's whole fixed-extrathoracic-narrowing lesion — a real
    // trach patient in laryngeal edema breathes fine through the stoma even
    // as their native upper airway swells shut. Gated out entirely (not
    // scaled down) when pat.tracheostomy is set, rather than left to
    // silently apply to a patient it cannot physically affect. The tube
    // itself is a real, DIFFERENT vulnerability: inner-cannula secretions
    // narrow that one fixed-diameter conduit the same way airwayFluid
    // narrows a native airway — coefficient 1.6 (between airwayFluid's 1.3
    // and upperAirwayObstruction's 1.5) reflects that a small-bore trach
    // tube can occlude more severely, proportionally, than the same volume
    // of secretions in a native airway (TP 1234's own "inner-cannula
    // obstruction" emergency branch).
    // Real time course, not a static severity: tracheostomy secretions
    // genuinely accumulate without airway care (routine, scheduled
    // suctioning is real, standard home/facility trach care specifically
    // because they do). Modest and slow — a scenario presenting an
    // already-symptomatic patient authors the starting trachObstruction
    // directly (patient.js's own scenario-authored default), and this term
    // represents ONGOING worsening over the course of the call if nothing
    // clears it, not the initial presentation itself.
    if (pat.tracheostomy) {
      pat.trachObstruction = Math.max(0, Math.min(1, (pat.trachObstruction || 0) + dt * 0.006));
    }
    const uaoTerm = pat.tracheostomy ? 0 : (pat.upperAirwayObstruction || 0);
    const trachTerm = pat.tracheostomy ? (pat.trachObstruction || 0) : 0;
    const Rairway = pat.airwayResistance * (pat.artificialAirwayRes ?? 1) *
      Math.exp(effBroncho * 1.7) * Math.exp((pat.airwayFluid || 0) * 1.3) *
      Math.exp(uaoTerm * 1.5) * Math.exp(trachTerm * 1.6);
    const R = Rairway + (pat.tissueResistance ?? 2.2);

    // ----- LOAD-DEPENDENT EFFORT AND RESPIRATORY MUSCLE FATIGUE -----
    // To move air against a stiffer or more obstructed chest the patient must
    // generate MORE inspiratory pressure for the same tidal volume. Effort was
    // previously independent of the load, so a severe asthmatic "worked" exactly
    // as hard as a healthy person — which made it impossible to represent the
    // single most important thing about severe obstruction: that the patient is
    // sustaining ventilation only by working at a level they cannot maintain.
    //
    // Fatigue is governed by the TENSION-TIME INDEX, the documented predictor of
    // diaphragmatic failure: TTI = (Pi/Pimax) x (Ti/Ttot), i.e. how hard each
    // breath pulls as a fraction of maximum, multiplied by the fraction of each
    // cycle spent pulling. Below a TTI of ~0.15 breathing can be sustained
    // indefinitely; above it the muscles fatigue in a time that shortens steeply
    // as the index rises. Fatigue then degrades the pressure the patient can
    // generate, which lowers tidal volume, which raises CO2 — the decompensation
    // spiral that ends in hypercapnic arrest.
    //
    // Respiratory muscles are also perfused muscle: hypoxaemia and shock lower
    // the sustainable threshold, which is why a hypotensive patient tires faster.
    // Reference values for a NORMAL respiratory system — THIS PATIENT'S OWN,
    // not a flat adult one (queue item 33). normalR is TOTAL resistance
    // (airway ~2 + tissue/chest wall ~2.2), not the airway component alone.
    // When tissue resistance was added, these references were left at the
    // old airway-only value of 2, so a perfectly healthy patient's load index
    // read as 2.1 instead of 1.0 — every patient in the simulator was scored as
    // obstructed, and a bag-valve-mask was judged unable to keep pace with a
    // normal chest.
    //
    // These were then a SECOND time left at the flat 70 kg adult constants
    // (0.09, 4.2) even after patient.js started scaling pat.compliance/
    // pat.airwayResistance/pat.tissueResistance by massScale for body size —
    // so a healthy, undiseased pediatric patient's own correctly-smaller,
    // higher-resistance anatomy was being compared against an adult
    // reference it was never supposed to match. Measured directly: a bare,
    // condition-less 14 kg (age 2) patient has C=0.018/R=9.39 by
    // construction (massScale=0.2), giving loadIndex = (0.09/0.018)*(9.39/4.2)
    // = 11.2 BEFORE clamping — saturating the [0.5,6] clamp at its ceiling,
    // indistinguishable from the load of severe adult bronchospasm, on a
    // healthy toddler. That inflated effort demand (via unassistedEffort
    // below) drove real hypoxia/hypercapnia from the very first tick with
    // respMuscleFatigue never even engaging — this was not the fatigue
    // spiral the field's own comment blamed, it was upstream of it. Scaling
    // normalC/normalR by the same massScale pat.compliance/airwayResistance/
    // tissueResistance already use makes loadIndex correctly read 1.0 for
    // ANY healthy patient regardless of body size — disease deviation is
    // still fully preserved, since a diseased patient's C/R still moves
    // relative to their OWN scaled baseline exactly as before.
    const normalC = 0.09 * pat.massScale, normalR = 4.2 / Math.sqrt(pat.massScale);
    const loadIndex = Math.max(0.5, Math.min(6,
      (normalC / Math.max(0.005, C)) * (Math.max(0.1, R) / normalR)));
    // Pressure demanded to sustain the current pattern against this load.
    const PIMAX = 25;                                   // maximal inspiratory effort, model units
    // Load compensation is INCOMPLETE. Patients increase inspiratory pressure
    // against a higher load, but not enough to fully preserve tidal volume —
    // which is precisely why obstruction leads to CO2 retention rather than to
    // maintained ventilation. A full (square-root) compensation made obstructed
    // patients out-ventilate healthy ones and reach pH 7.57. The sub-square-root
    // exponent leaves a residual ventilatory deficit that grows with load, and
    // it is that deficit which the fatigue term below then converts into
    // progressive hypercapnia.
    // ----- DYNAMIC HYPERINFLATION (INTRINSIC PEEP) AND ITS THRESHOLD LOAD -----
    // When expiratory time is too short for the lung's time constant (tau = R*C),
    // exhalation is incomplete and alveolar pressure never returns to zero. The
    // residual pressure is intrinsic PEEP, and it imposes a THRESHOLD LOAD: the
    // patient must first generate that entire pressure before any air moves, work
    // that produces no ventilation whatsoever.
    //
    // This was previously computed only when riskFactors.copd was set, but air
    // trapping is a property of obstruction, not of a diagnosis — status
    // asthmaticus is the classic auto-PEEP state. It is now derived from the
    // mechanics for any patient, so it appears wherever obstruction does.
    // EXPIRATORY resistance exceeds inspiratory resistance in obstruction:
    // during expiration the airways are compressed by surrounding pleural
    // pressure, and in obstructive disease they collapse dynamically, producing
    // expiratory flow limitation. This asymmetry is why obstructed patients
    // struggle to get air OUT and is what drives air trapping.
    // Dynamic compression collapses AIRWAYS on expiration; tissue resistance is
    // unaffected by it, so the flow-limitation multiplier applies to the airway
    // component alone.
    const Rexp = Rairway * (1 + effBroncho * 2.2) + (pat.tissueResistance ?? 2.2);
    const expTime = Math.max(0.1, 60 / Math.max(4, pat.rr) - Ti);
    const tau = Math.max(0.05, Rexp * C);
    const exhaledFraction = 1 - Math.exp(-expTime / tau);

    // Trapped gas accumulates breath to breath: whatever is not exhaled is added
    // to the volume already sitting above FRC, and it is relieved as mechanics
    // improve or the rate falls. Intrinsic PEEP is then the pressure that trapped
    // volume generates against the chest's compliance (P = V / C) — the physical
    // relation, rather than a per-breath fraction proxy which produced PEEPi of
    // under 1 cmH2O where severe obstruction runs 5-15.
    const trappedPerBreath = Math.max(0, pat.vtPrev ?? 0.45) * (1 - exhaledFraction);
    const breathsThisTick = (pat.rr || 12) * dt;
    // Equilibrium trapped volume is the PHYSICAL steady state, not a damped
    // proxy. At equilibrium the lung exhales exactly what it takes in, so with
    // Vtrap sitting above FRC at end-expiration:
    //     (Vtrap + Vt) * exhaledFraction = Vt   =>   Vtrap = Vt * (1 - ef) / ef
    // which is trappedPerBreath / ef.
    //
    // The previous denominator was (1 - ef + 0.15). That is not a steady state of
    // anything: it SATURATES at roughly 0.87 x one tidal volume however severe
    // the obstruction gets, so intrinsic PEEP could never exceed about Vt/C no
    // matter how flow-limited the patient became. Measured at near-maximal
    // bronchoconstriction (effBroncho 0.96, Rexp 33.9 cmH2O/L/s, ef 0.47) it gave
    // PEEPi 3.5 where severe obstruction is documented at 5-15.
    //
    // The 0.05 floor on ef bounds the singularity as ef -> 0 (a patient exhaling
    // nothing at all traps without limit); the existing 2.0 L clamp on
    // trappedVolume below is the physiological backstop.
    const trapEquilibrium = trappedPerBreath / Math.max(0.05, exhaledFraction);
    pat.trappedVolume = Math.max(0, Math.min(2.0,
      (pat.trappedVolume || 0) + (trapEquilibrium - (pat.trappedVolume || 0)) *
      Math.min(1, breathsThisTick * 0.25)));
    pat.intrinsicPEEP = Math.max(0, Math.min(20, pat.trappedVolume / Math.max(0.02, C)));

    // Externally applied airway pressure (CPAP/PEEP) offsets the threshold load:
    // by holding the airway at the same pressure the alveoli are already at, the
    // patient no longer has to generate it before flow begins. This is the
    // principal mechanism by which CPAP relieves the work of breathing in
    // obstruction — it does not push volume in, it removes wasted effort.
    const appliedPEEP = pat.appliedPEEP || 0;
    const thresholdLoad = Math.max(0, pat.intrinsicPEEP - appliedPEEP);

    // Threshold load is added to the pressure the patient must generate, so it
    // raises the tension-time index and drives fatigue exactly as a mechanical
    // load should.
    // RESTING INSPIRATORY EFFORT IS NOT A FREE CONSTANT.
    // This read `5 * effortRatio * ...`, a literal 5 cmH2O. Against the model's
    // own normal mechanics that produces a 364 mL breath in a 70 kg adult, where
    // the documented resting tidal volume is ~7 mL/kg (~500 mL). The engine then
    // compensated the shortfall with RATE — settling at 15.4 breaths of 364 mL
    // instead of 12 of 500. Minute ventilation looked right (5.6 L/min), but a
    // fast shallow pattern wastes a larger fraction of every breath on a fixed
    // dead space, so alveolar ventilation came out at 3.45 L/min against a
    // documented 4.2, and a HEALTHY RESTING PATIENT SAT AT PaCO2 46.3 / pH 7.34.
    //
    // The constant is now derived rather than chosen: at normal load, the
    // pressure generated must reproduce THIS patient's own declared resting
    // tidal volume (vtBase, from ageProfile) through the same mechanics equation
    // that vt is computed with below. Two sources of truth for resting tidal
    // volume — the declared one and the mechanically-derived one — are now
    // required to agree, which is what identifies the number.
    // NORMAL mechanics are used deliberately, not the patient's CURRENT
    // (disease-modified) C and R: the load-dependence of effort is already
    // carried by loadIndex, and using current mechanics here would count
    // disease twice. But "normal" must still mean THIS PATIENT'S OWN healthy
    // baseline (queue item 33), the same normalC/normalR already fixed above
    // — not a flat 70 kg adult constant. Reusing the SAME two variables
    // (rather than a second pair of magic numbers) means this reference and
    // loadIndex's reference can no longer silently disagree with each other.
    // Before this fix, a healthy pediatric patient's vtBase-targeted pressure
    // was calibrated against adult mechanics and then applied against their
    // own genuinely stiffer/higher-resistance chest in the real vt formula
    // below — measured, a bare 14 kg (age 2) patient's resultant vt landed at
    // 0.052 L against its own declared vtBase of 0.098 L, roughly half —
    // chronic under-ventilation from the very first tick, on a healthy
    // patient, with no disease and no fatigue (respMuscleFatigue stayed at
    // 0.000 throughout) to blame it on.
    const restingEffort = (pat.vtBase ?? 0.5) * (1 / normalC + normalR / Ti);
    const unassistedEffort = restingEffort * effortRatio * Math.pow(loadIndex, 0.32) + thresholdLoad;

    // ----- ASSISTED VENTILATION UNLOADS THE RESPIRATORY MUSCLES -----
    // This is the entire clinical rationale for bagging or CPAP in a tiring
    // patient: the device does the work the diaphragm can no longer sustain.
    // Without it, fatigue was a one-way trip — an intervention could raise SpO2
    // while the patient continued to exhaust and arrest, which is the opposite of
    // what these devices are for.
    //
    // Unloading is proportional to how much of the required ventilation the
    // device supplies. It is not total: a spontaneously breathing patient on a
    // bag or mask still does some of the work (only paralysis abolishes it), so
    // a residual fraction of effort remains and full recovery takes time.
    let unloadFraction = 0;
    if (pat.assistedVent && pat.airway === "clear") {
      const av = pat.assistedVent;
      // Queue item 33: this used to reference the removed flat-adult
      // NORMAL_C/NORMAL_R constants — same bug as loadIndex/restingEffort
      // above, just a third site. Reused normalC/normalR (this patient's
      // OWN scaled baseline, fixed above) for the same reason: how much of
      // a device squeeze reaches the patient should degrade with THIS
      // patient's disease relative to their own normal, not with their body
      // size relative to a 70 kg adult's.
      const normalC0 = normalC, normalR0 = normalR;
      const deliveryFactor0 = Math.max(0.25, Math.min(1,
        (C / normalC0) * (normalR0 / Math.max(0.1, R))));
      // rr of 0 means the device supports the patient's OWN rate (CPAP/PS)
      const avRate = av.rr > 0 ? av.rr : pat.rr;
      const assistedMV = av.vt * deliveryFactor0 * avRate;
      // Provisional spontaneous minute ventilation at the CURRENT effort.
      const spontVt = Math.max(0.01, unassistedEffort / (1 / C + R / Ti));
      const spontMV = spontVt * pat.rr;
      // Fraction of the patient's ventilatory work the device replaces. A device
      // supplying as much as the patient was managing takes over essentially all
      // of it; one supplying half takes over half.
      // Unloading requires the device to actually REPLACE the patient's
      // ventilation, not merely to be attached. A device delivering less than the
      // patient was already achieving does not let them rest — they keep working,
      // which is exactly what an inadequately bagged patient does. Reducing
      // effort without replacing the ventilation produced hypoventilation:
      // bagging a HEALTHY patient drove PaCO2 to 64 and pH to 7.20, i.e. the
      // intervention harmed a patient who needed nothing.
      const capability = assistedMV / Math.max(0.01, spontMV);
      unloadFraction = Math.max(0, Math.min(1, (capability - 0.8) / 0.2));
    }
    pat.ventUnloadFraction = unloadFraction;
    // Residual patient effort after the device takes its share.
    const effortDemand = unassistedEffort * (1 - 0.85 * unloadFraction);

    const dutyCycle = Math.max(0.2, Math.min(0.6, Ti / (60 / Math.max(4, pat.rr))));
    const tti = (effortDemand / PIMAX) * dutyCycle;

    // Sustainable threshold falls with poor oxygen delivery to the muscles.
    // Hypoxaemia and hypoperfusion lower the sustainable threshold, but the
    // coupling is deliberately bounded: it is a positive feedback loop (fatigue
    // -> hypoventilation -> hypoxia -> lower threshold -> more fatigue), and an
    // unbounded version collapses the patient from compensating to exhausted in
    // a few minutes. Real decompensation is progressive over tens of minutes,
    // which is what makes it recognisable and treatable.
    const o2Adequacy = Math.max(0.7, Math.min(1, (pat.sao2 ?? 97) / 95)) *
                       Math.max(0.7, Math.min(1, (pat.map ?? 90) / 70));
    const ttiThreshold = 0.15 * o2Adequacy;
    const fatigueRate = 0.10;                           // per minute at double threshold
    const recoveryRate = 0.04;                          // per minute when unloaded
    const dFatigue = tti > ttiThreshold
      ? ((tti - ttiThreshold) / Math.max(0.01, ttiThreshold)) * fatigueRate * dt
      : -recoveryRate * dt;
    pat.respMuscleFatigue = Math.max(0, Math.min(1, (pat.respMuscleFatigue || 0) + dFatigue));
    pat.workOfBreathing = tti;                          // exposed for monitoring/metabolism

    // Fatigue and drug-induced drive suppression both reduce the pressure the
    // patient actually generates.
    // Neuromuscular blockade removes the muscle's ability to generate pressure
    // at all, independently of drive — a paralysed patient is still trying.
    const pMuscle = -effortDemand * (1 - 0.5 * driveSupp)
                    * (1 - 0.65 * pat.respMuscleFatigue)
                    * (1 - Math.max(0, Math.min(1, pat.neuromuscularBlock || 0)));

    // Only the pressure generated ABOVE the threshold load produces flow: the
    // first part of every breath is spent overcoming trapped gas.
    const effectivePMuscle = Math.min(0, pMuscle + thresholdLoad);
    pat.vt = Math.max(0, -effectivePMuscle / (1/C + R / Ti));

    if (pat.airway !== "clear") pat.vt = 0;
    // Residual positive tidal-volume offsets (e.g. an SGA/ETT improving delivered
    // volume) still add; assisted VENTILATION is handled separately below.
    if (pat.tvDrugOffset > 0) pat.vt += pat.tvDrugOffset;

    // ----- ASSISTED (POSITIVE-PRESSURE) VENTILATION -----
    // A delivered breath REPLACES the patient's own breath rather than adding to
    // it: when a rescuer squeezes the bag, that squeeze IS the breath. Summing
    // them was producing tidal volumes of 1.2-1.5 L — more than a self-inflating
    // bag physically holds — and blowing arterial CO2 down to 14 mmHg on a
    // patient who was already ventilating adequately.
    //
    // The device therefore sets the breath, and the patient's own effort only
    // matters where it exceeds what is being delivered (a patient breathing
    // harder than you are bagging). Delivered volume is additionally bounded by
    // the chest that receives it: a stiff or obstructed chest takes less of the
    // squeeze, which is why bagging a severe asthmatic is so difficult and why
    // ventilating a patient with poor compliance requires slower, smaller breaths.
    pat.assistedRR = 0;
    if (pat.assistedVent && pat.airway === "clear") {
      const av = pat.assistedVent;
      // Compliance/resistance limit on the delivered breath, referenced to
      // THIS patient's own scaled normal chest (normalC/normalR, computed
      // above from massScale — queue item 33's fix). A FOURTH flat-adult-
      // constant site of that same bug class was found here while fixing
      // queue item 43: this block used to shadow the outer, already-scaled
      // normalC/normalR with a fresh local `const normalC=0.09,normalR=4.2`
      // — meaning the fraction of a squeezed breath that actually reaches
      // the chest was STILL being computed against a flat 70 kg adult
      // reference for every patient, even after item 33's fix corrected the
      // three other sites. This is the mechanism that sets the delivered
      // pat.vt/pat.rr once the assisted-ventilation override engages (below)
      // — with the flat reference, suctioning a toddler's airway (which
      // lowers R) barely changed deliveryFactor relative to the wrong 4.2
      // baseline, which is why the item-43 "suction + BVM -> lower paco2"
      // assertion stayed broken even after the device's own nominal vt was
      // scaled to the patient. A stiffer or more obstructed chest, relative
      // to ITS OWN normal, still accepts less of the squeeze.
      const deliveryFactor = Math.max(0.25, Math.min(1,
        (C / normalC) * (normalR / Math.max(0.1, R))));
      const deliveredVt = av.vt * deliveryFactor;
      const spontaneousMV = pat.vt * pat.rr;
      const avRate2 = av.rr > 0 ? av.rr : pat.rr;
      const assistedMV = deliveredVt * avRate2;
      if (assistedMV >= spontaneousMV) {
        pat.vt = deliveredVt;
        pat.rr = avRate2;
      }
      pat.assistedRR = av.rr;
    }
    // TRAPPED-VOLUME INPUT MUST BE THE BREATH THAT ACTUALLY HAPPENED
    // (queue item 12). This used to be captured BEFORE the airway-clear
    // check and the assisted-ventilation override above, so
    // trappedPerBreath (the intrinsic-PEEP/auto-PEEP mechanism, computed
    // NEXT tick from pat.vtPrev) never saw a bagged breath at all — MEASURED:
    // bagging a severe asthmatic with a nominal 500 mL breath moved vtPrev
    // from 0.285 to only 0.298 L, i.e. essentially nothing reached the
    // auto-PEEP mechanism. This is the real, classic "stacking breaths"
    // hazard the bvm note already warns about (over-bagging a resistant
    // chest builds dangerous auto-PEEP) and it could not previously show up
    // in intrinsicPEEP at all. One-tick lag remains (this tick's own
    // trapped-volume calculation, earlier in this function, still used
    // pat.rr from before this tick's assisted-ventilation override, so the
    // RATE side of a bagged breath is not yet reflected in the SAME tick) —
    // a smaller, scoped remainder, not attempted in this batch; the VOLUME
    // side (what a stiff/obstructed chest actually receives) is now correct.
    pat.vtPrev = pat.vt;
    // ARTIFICIAL AIRWAY — anatomic dead space excluded by the device. An SGA
    // sits above the glottis and bypasses the oro/nasopharynx (~40% of anatomic
    // dead space); a cuffed ETT bypasses the whole upper airway (~50%). This is
    // the real reason an intubated patient ventilates better at the same minute
    // volume, and it replaces the former fx:{tv:0.2/0.3}, which invented tidal
    // volume out of nothing (including in patients nobody was ventilating).
    pat.effectiveDeadSpace = pat.deadSpace * (1 - Math.max(0, Math.min(0.6, pat.artificialAirway || 0)));
    pat.va = Math.max(0, (pat.vt - pat.effectiveDeadSpace) * pat.rr);

    // ALVEOLAR DEAD SPACE — alveoli that are ventilated but not perfused.
    // pat.deadSpace above is the ANATOMIC dead space (conducting airways, ~2
    // mL/kg), which never exchanges gas. Alveolar dead space is different: it is
    // lung that receives air but no blood, and it is what separates end-tidal CO2
    // from arterial CO2. The PaCO2-EtCO2 gradient IS this measurement, and it is
    // the main clinical reason end-tidal CO2 is monitored at all — it widens when
    // pulmonary perfusion fails.
    //   * normal ~6% of alveolar volume -> gradient 2-3 mmHg at PaCO2 40
    //   * low cardiac output (shock, arrest) -> alveoli outrun their blood supply,
    //     the gradient widens, and EtCO2 falls even while PaCO2 rises. This is why
    //     EtCO2 tracks cardiac output during CPR and why its return signals ROSC.
    //   * pulmonary embolism -> obstructed segments are ventilated but not
    //     perfused, the classic widened gradient with a normal-looking PaCO2.
    // Previously the gradient was hardcoded at 6 mmHg, so it was both too wide at
    // rest and completely unable to respond to any of the above.
    const expectedCO = 0.055 * (pat.ageProfile.bsa || 1.9) * 60 / 1.0;  // ~ CI 3.0 x BSA
    const perfusionRatio = Math.max(0.05, Math.min(1.5, (pat.co || expectedCO) / Math.max(0.1, expectedCO)));
    const perfusionDeficit = Math.max(0, 1 - perfusionRatio);
    const peBurden = Math.max(0, (pat.pulmResistFactor || 1) - 1) * 0.12;
    pat.alveolarDeadSpaceFrac = Math.max(0, Math.min(0.85,
      0.06 + perfusionDeficit * 0.55 + peBurden));
}

export function updateGasExchange(pat, dt) {
    // CO2 production follows the ACTUAL metabolic rate, not the resting one
    // (see vo2Demand in metabolic.js). A patient working hard to breathe, febrile
    // or catecholamine-driven makes more CO2, which is what stops minute
    // ventilation alone from driving arterial CO2 arbitrarily low.
    const vco2 = ((pat.vo2Demand ?? pat.ageProfile.totalVO2()) / 1000) * RQ;
    // Alveolar ventilation equation: PaCO2 = (VCO2 / VA) x 863.
    //
    // The constant is 863, not the dry barometric term (ATM - PH2O) = 713. 863
    // additionally carries the conversion between VCO2, conventionally expressed
    // at STPD, and ventilation, expressed at BTPS — a factor of 1/0.826. Using
    // 713 understated PaCO2 by exactly that ratio, which put EVERY patient in the
    // simulator into a chronic respiratory alkalosis at rest: measured pH 7.474
    // and PaCO2 33.8 against a documented 7.35-7.45 and 35-45. That in turn drove
    // potassium steadily into cells (alkalosis causes hypokalaemia), so a healthy
    // patient's serum potassium drifted down ~0.5 mEq/L over 45 minutes — the K
    // drift was a CORRECT consequence of an incorrect resting ventilation.
    const ALVEOLAR_CONSTANT = 863;
    let paco2Target;
    if (pat.va > 0.01) {
      paco2Target = (vco2 / pat.va) * ALVEOLAR_CONSTANT;
    } else {
      paco2Target = 150;
    }
    paco2Target = Math.max(10, Math.min(150, paco2Target));
    // The body's CO2 stores are large, so arterial PaCO2 tracks alveolar
    // ventilation with a real time constant rather than snapping to it every
    // tick. Relaxing toward the target (instead of overwriting) also breaks a
    // numerical tick-to-tick limit cycle between the ventilation controller and
    // gas exchange that otherwise made PaCO2/PaO2 oscillate violently.
    const a = 1 - Math.exp(-dt / 0.4);
    pat.paco2 = pat.paco2 + (paco2Target - pat.paco2) * a;
    pat.paco2 = Math.max(10, Math.min(150, pat.paco2));

    // Effective inspired oxygen fraction: ambient (pat.fio2) or whatever a device
    // is delivering (pat.drugFio2), whichever is greater. Published as a single
    // value so consumers and tests read ONE variable rather than recomputing the
    // combination — the two-variable form meant nothing in the engine held the
    // patient's actual FiO2, and it could not be asserted on.
    const fio2 = Math.max(pat.fio2, pat.drugFio2);
    pat.effectiveFio2 = fio2;
    // CARBOXYHEMOGLOBIN CLEARANCE. CO's ~200-250x affinity for hemoglobin
    // over O2 (Haldane 1895) means clearance is driven by competitive
    // displacement: raising dissolved/alveolar O2 partial pressure (i.e.
    // FiO2) drives the equilibrium back toward O2Hb — the actual mechanism
    // behind high-flow O2 therapy for CO poisoning, not a scripted
    // "antidote." Published COHb half-life is real and well-documented:
    // roughly 250-320 min on room air, 74-90 min on 100% O2 (Weaver, NEJM
    // 2009; Peterson & Stewart, J Appl Physiol 1970). Room-air 300 min and
    // 100%-O2 80 min are used here — both inside the published range, not
    // fitted to a target. The rate constant interpolates linearly with FiO2
    // between the two anchors, so a real intermediate device (e.g. o2nrb's
    // 85%) clears faster than room air without needing its own anchor.
    if ((pat.cohb || 0) > 0) {
      const kRoom = Math.log(2) / 300;                  // /min, ~0.21 FiO2
      const kO2   = Math.log(2) / 80;                    // /min, 1.0 FiO2
      const o2Frac = Math.max(0, Math.min(1, (fio2 - 0.21) / (1 - 0.21)));
      const kClear = kRoom + (kO2 - kRoom) * o2Frac;
      pat.cohb = Math.max(0, pat.cohb * Math.exp(-kClear * dt));
    }
    const PAO2 = (ATM - PH2O) * fio2 - pat.paco2 / RQ;
    const idealPaO2 = PAO2 - 10;
    const diffusionPaO2 = idealPaO2 * pat.dlco + (1 - pat.dlco) * 40;
    pat.sao2 = oxySat(diffusionPaO2, pat.ph, pat.paco2, pat.coreTemp, pat.dpg);
    const hb = pat.hb ?? 0;   // derived once per substep in patient.js
    pat.caO2 = 1.34 * hb * pat.sao2 / 100 + 0.003 * pat.pao2;
    const do2 = pat.co * pat.caO2 * 10;
    const vo2 = pat.actualVO2 || pat.ageProfile.totalVO2();
    const er = do2 > 0 ? vo2 / do2 : 1;
    pat.svO2 = Math.max(0, pat.sao2 * (1 - er));
    pat.pvO2 = inverseHill(pat.svO2, 26.6 * pat.dpg);
    // ALVEOLAR RECRUITMENT FROM APPLIED AIRWAY PRESSURE.
    // Positive end-expiratory pressure holds flooded and collapsed alveoli open
    // through expiration, returning them to gas exchange and so reducing the
    // shunt fraction. This is the mechanism by which CPAP improves oxygenation in
    // pulmonary oedema — it does not remove the fluid, it re-opens the units the
    // fluid had closed. Recruitment is greatest where there is most collapsed
    // lung to recover, i.e. where the shunt is largest.
    const recruit = Math.max(0, Math.min(0.6, (pat.appliedPEEP || 0) / 12));
    // Airway fluid's shunt contribution is a SECONDARY effect (the primary
    // consequence is the resistance rise above) — deep-enough proximal
    // flooding eventually reaches some distal units too. Deliberately NOT
    // scaled by `recruit`: PEEP holds open alveoli that are already ventilated
    // but collapsed, it does not clear fluid sitting in the pharynx/trachea,
    // so applied airway pressure should not appear to fix what only suction
    // actually removes.
    const airwayFluidShunt = (pat.airwayFluid || 0) * 0.15;
    // Pleural fluid compresses lung from OUTSIDE it — an external mechanical
    // lesion, not alveolar collapse from within, so (like airwayFluidShunt)
    // it is deliberately NOT relieved by applied PEEP: no amount of airway
    // pressure decompresses a pleural effusion or hemothorax from the inside.
    const pleuralEffusionShunt = (pat.pleuralEffusion || 0) * 0.2;
    const effShunt = Math.max(0, pat.shuntFraction * (1 - recruit) + airwayFluidShunt + pleuralEffusionShunt);
    pat.recruitedFraction = recruit;
    pat.pao2 = PAO2 * (1 - effShunt) + pat.pvO2 * effShunt;
    pat.pao2 = Math.max(20, Math.min(600, pat.pao2));
    pat.sao2 = oxySat(pat.pao2, pat.ph, pat.paco2, pat.coreTemp, pat.dpg);
    if (pat.co <= 0.1) pat.sao2 *= 0.5;

    // THE "100% OXYGEN TEST" (V2-6, scoped slice) — a real, standard bedside/
    // ICU maneuver for distinguishing PURE SHUNT (ARDS, severe pulmonary
    // edema: blood bypasses ventilated alveoli entirely via effShunt above,
    // so raising FiO2 barely moves the mixed pao2/pvO2 blend) from LOW-V/Q
    // mismatch (pneumonia, bronchospasm: some gas exchange is still
    // occurring, so a higher inspired fraction genuinely raises PaO2). Tracks
    // pat.pao2 (partial pressure, real mmHg dynamic range), deliberately NOT
    // pat.sao2/SpO2 — SpO2 saturates near 100% once PaO2 clears roughly
    // 100-150 mmHg (the flat top of the oxyhemoglobin dissociation curve),
    // so it has almost no discriminating range left at high FiO2 regardless
    // of shunt severity; this is also why real clinicians use PaO2 (or the
    // PaO2/FiO2 ratio — the actual Berlin ARDS severity criterion) for this
    // test, not the pulse-ox percentage. This is NOT a new gas-exchange
    // mechanism — the effShunt equation just above already produces exactly
    // this graded refractoriness in pat.pao2 (confirmed by direct
    // measurement before building this: ards's own 0.85 shuntFraction
    // ceiling vs asthmaAttack's 0.6, mostly-V/Q-mismatch ceiling, produce
    // genuinely different PaO2 deltas for the identical FiO2 step — see the
    // numbers in this session's own verification). What was missing was a
    // way to SURFACE that already-real distinction as something a crew can
    // actually run, rather than an unlabelled internal number. Tracks the
    // real room-air baseline the FIRST time this patient is seen breathing
    // room air (or low-flow O2 under 25%), then the real delta once a
    // high-flow device (FiO2 > 0.6 — o2nrb's own 0.85 and above) has
    // actually been applied — both are genuine simulated values at two real
    // points in time, not a reconstruction of the shunt equation from
    // outside it.
    if (fio2 <= 0.25 && pat._roomAirPao2 == null) {
      pat._roomAirPao2 = pat.pao2;
    }
    if (fio2 > 0.6 && pat._roomAirPao2 != null) {
      pat._o2TestDelta = pat.pao2 - pat._roomAirPao2;
    }
}

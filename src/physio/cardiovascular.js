// ============================================================================
// Cardiovascular system — a closed-loop physiological controller.
//
// Design intent (see the accompanying spec): blood pressure and cardiac output
// are never set directly. They EMERGE, every tick, from the interaction of
// autonomic outflow, adrenal catecholamines, regional venous return, intra-
// thoracic pressure, nonlinear ventricular mechanics, ventricular-arterial
// coupling, myocardial oxygen balance, and electrical conduction. Drugs and
// diseases push on receptors, preload, afterload, inotropy, lusitropy, vascular
// compliance and coronary supply — and shock states, infarction, and lethal
// rhythms then develop on their own out of those interacting loops rather than
// being scripted.
//
// Backward-compatible surface (other modules still read these): pat.sympathetic,
// pat.parasympathetic, pat.catecholamines, pat.alphaTone/beta1Tone/beta2Tone,
// pat.map/sbp/dbp/pp/hr/co/sv/edv/esv/ef/cvp/msfp/vr/svr, pat.contractility,
// pat.pvcFrequency, pat.rhythm, pat.rhythmInstability, pat.qt.
// ============================================================================
import { NORMAL_HB, HCT_NORMAL } from "./constants.js";
import {
  buildParams, initState, integrateRK4, IDX, pressuresFromState, totalVolume,
} from "./cardiovascular_ode_full.js";

// First-order relaxation toward a target over time-constant tau (minutes),
// numerically stable for any dt via the exponential form.
const approach = (cur, target, dt, tauMin) => {
  if (tauMin <= 0) return target;
  const a = 1 - Math.exp(-dt / tauMin);
  return cur + (target - cur) * a;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const S = 1 / 60; // seconds -> minutes helper for readable time constants
const SEPSIS_PRESSOR_GAIN = 0.85;   // fraction of an exogenous pressor's alpha effect retained in septic shock (identified: gives septic norepinephrine +8-9 mmHg per 0.1 mcg/kg/min, clinical 8-11)

// ---------------------------------------------------------------------------
// FEATURE FLAG — Task 1 completion.
//
// The full 16-state coupled ODE loop (cardiovascular_ode_full.js) is the
// AUTHORITATIVE solver for the core systemic vitals: SBP, DBP, MAP, CO, SV,
// EDV, ESV, EF (and, since queue item V2-25, RV EDV/ESV/SV/EF too). It is the
// ONLY solver for those vitals now (queue item 1's Phase 0, 2026-09-29): the
// legacy lumped double-Hill beat integrator (`solveBeat()`,
// `cardiovascular_ode.js`) was confirmed, by direct dependency grep, to have
// no live consumer once FULL_ODE_AUTHORITATIVE had been true (unconditionally,
// in every scenario/script in the repo) for long enough that its outputs
// existed only for tick-for-tick A/B comparison — so it, its two orphaned
// regression scripts, and every pat._legacy* field have been removed.
//
// The one thing that DID depend on the legacy beat, not just for comparison —
// the arterial-line LV/RV pressure-volume-loop teaching display
// (App.jsx, gated on `dv.artline`, reading `pat.pvLoop`/`pat.rvPvLoop`) — now
// reads a real trace sampled directly from the full loop's own substep
// integration (see the `pvLoop`/`rvPvLoop` push inside updateFullLoopODE's
// windowed peak-detection loop below), which is a richer, authoritative
// source for that display rather than a second, parallel integrated beat.
//
// The pre-full-loop analytic SV values (`updateCardiovascular`'s
// `analyticSV`, and `updateRightHeart`'s RV analytic bootstrap) are computed
// from the exact end-systolic coupling equilibrium the old integrated beat
// always converged to anyway (Ees(EDV-V0)/(Ees+Ea)) — same numbers, no
// integration needed. For every consumer EXCEPT one, this is only a one-tick
// bootstrap before `pat.fourChamberLoop` exists; every subsequent tick
// overwrites them in the publish block below. The one exception is
// `updateMyocardialOxygen`, which deliberately reads these fresh,
// INSTANTANEOUS per-tick values every tick, not the full loop's own
// EMA-smoothed published ones — see that call site's own comment for the
// measured regression this avoids (the acs/nstemi/unstableAngina
// wavefront-necrosis mechanism silently stopped engaging when fed the
// smoothed signal instead).
//
// Right-heart/pulmonary vitals (pat.paSys/paDia/pvrWood, from
// updateRightHeart's own non-solveBeat pressure-flow algebra, untouched by
// this removal) are NOT switched here: the full loop's RV/PA side is not yet
// bidirectionally coupled back into systemic preload (flagged in the Task 1
// report as remaining verification work; queue item 1's Phase 6 is the
// planned fix), so retiring the lumped right-heart PRESSURE model now would
// silently regress pulmonary vitals rather than improve them — only its
// solveBeat-integrated RV BEAT sub-block (dead, overwritten every tick after
// the first) was removed.
//
// Flip this false (globally) or set pat.useFullODE = false (per patient) to
// fall back to the pre-full-loop analytic values, e.g. for debugging.
// ---------------------------------------------------------------------------
export const FULL_ODE_AUTHORITATIVE = true;

// Rhythms that are organized enough to still be perfusing/at-risk (not arrest).
const VALSALVA_AV_DEPRESSION = 0.19;
const PERFUSING = ["sinus", "stemi", "svt", "afib", "flutter", "peakedT", "wideQRS", "junctional", "chb"];
// Torsades is a ventricular tachycardia: the atria are dissociated from it
// exactly as they are in monomorphic VT, so it belongs here. It was absent,
// which was one of three reasons a patient in torsades kept a normal cardiac
// output — see the rate and dyssynchrony entries below.
// Atrial flutter's re-entrant circuit replaces organized atrial contraction
// with a rapid, mechanically ineffective flutter wave — the same loss of
// atrial kick afib has, for the same reason (this is the LUMPED model's own
// term; the authoritative full-loop solver deliberately does not consume it
// — see item 1's rejected-mechanism note on why wiring it there measured
// worse).
const NO_ATRIAL_KICK = ["afib", "flutter", "VT", "VF", "junctional", "chb", "torsades"];

// ---------------------------------------------------------------------------
// 1. AUTONOMIC NERVOUS SYSTEM
//    Baroreflex as a dynamic feedback controller (proportional + derivative +
//    slow setpoint adaptation). Neural sympathetic traffic responds within
//    seconds; adrenal catecholamines lag, rise gradually, deplete in prolonged
//    shock and replenish over hours. The two are combined into receptor tone
//    WITHOUT double-counting.
// ---------------------------------------------------------------------------
export function updateAutonomic(pat, dt) {
  // Baroreceptor afferent: senses pressure error AND its rate of change (dP/dt),
  // relative to a setpoint that slowly adapts to sustained pressure.
  const dmap = (pat.map - pat.prevMap) / Math.max(dt, 1e-4);
  pat.mapRate = approach(pat.mapRate, dmap, dt, 3 * S);
  pat.prevMap = pat.map;
  pat.baroSetpoint = approach(pat.baroSetpoint, pat.map, dt, 20); // adaptation over ~20 min

  // Baroreceptor afferent FIRING — explicit logistic firing rate (Task 7).
  //   F(P) = 1 / (1 + e^(−k(P − P50)))     0 (silent) … 1 (max firing), ½ at setpoint
  // High firing (high pressure) inhibits sympathetic outflow; low firing
  // (hypotension) releases it. This replaces the old clamped-linear proportional
  // term with a reflex that has a finite operating range: near-linear control
  // close to the (adapting) setpoint P50 — calibrated to the SAME small-signal
  // gain the linear law had, so resting tone and normal responses are unchanged —
  // but SATURATING at the extremes (maximal sympathetic activation in deep
  // hypotension, maximal withdrawal in crisis-level hypertension) instead of the
  // old abrupt ±60 mmHg clamp. The realistic compensation lag/overshoot still
  // comes from the actuator time constants below, which stay stable at this step.
  const P50 = pat.baroSetpoint;
  const kBaro = 0.033;                                     // firing-curve steepness [1/mmHg]
  const F = 1 / (1 + Math.exp(-kBaro * (pat.map - P50)));  // afferent firing, ½ at setpoint
  pat.baroFiring = F;
  // baroGain scaled by this patient's own baroreflexGain trait (queue item
  // 50, patient.js) — real inter-individual variability in baroreflex
  // sensitivity, not every patient sharing one autonomic gain.
  const F0 = 0.5, baroGain = 0.72 * (pat.baroreflexGain ?? 1);  // gain·k·¼ ≈ old Kp (0.006) at setpoint
  // Rate-of-change (derivative) sensitivity — real baroreceptors respond to
  // dP/dt in addition to absolute pressure (Guyton & Hall): a RAPIDLY falling
  // MAP (acute hemorrhage) provokes a brisker sympathetic response than a slow
  // drift to the identical pressure (e.g. compensated dehydration). pat.mapRate
  // (mmHg/min, smoothed a few lines above) was computed every tick but had no
  // consumer anywhere in the engine — queue item 5's standing dead-code sweep.
  // Scaled by the same per-patient baroreflexGain trait as the proportional
  // term (it is the same afferent apparatus), bounded so one noisy tick cannot
  // swing sympathetic tone on its own. MEASURED (mechanismWiring.mjs's own
  // [BARORECEPTOR RATE SENSITIVITY] section): a 0.4 L/min hemorrhage reaches
  // mapRate ~ -6 to -8 mmHg/min by 60s (derivGain contribution ~0.07-0.10), a
  // 0.05 L/min hemorrhage stays within ~ -1 to -2 mmHg/min (contribution
  // ~0.01-0.02) at a MATCHED mean arterial pressure — the real, distinguishing
  // point: two patients at the same MAP compensate differently depending on
  // how fast they got there.
  const derivGain = 0.012 * (pat.baroreflexGain ?? 1);
  const baroDeriv = clamp(-(pat.mapRate || 0) * derivGain, -0.10, 0.15);
  let sympTarget = 0.25 + baroGain * (F0 - F) + baroDeriv;  // hypotension (F<½) → more sympathetic

  // Non-baroreflex sympathoexcitation (chemoreflex, pain, stress, exertion).
  // Peripheral chemoreceptors integrate over several breaths, so react to a
  // low-pass-filtered gas signal rather than the instantaneous (and, at this
  // integration step, jittery) PaO2/PaCO2 — this keeps a noisy ventilation
  // signal from being amplified into sympathetic swings.
  pat._chemoPao2 = approach(pat._chemoPao2 ?? pat.pao2 ?? 95, pat.pao2 ?? 95, dt, 15 * S);
  pat._chemoPaco2 = approach(pat._chemoPaco2 ?? pat.paco2 ?? 40, pat.paco2 ?? 40, dt, 15 * S);
  let chemo = 0;
  if (pat._chemoPao2 < 60)  chemo += (60 - pat._chemoPao2) * 0.006;   // hypoxic drive
  if (pat._chemoPaco2 > 50) chemo += (pat._chemoPaco2 - 50) * 0.003;  // hypercapnic drive
  sympTarget += Math.min(0.35, chemo);
  if (pat.drugPain > 0) sympTarget += 0.15 * (pat.drugPain / 100);
  if (pat.ph < 7.2)    sympTarget += Math.min(0.25, (7.2 - pat.ph) * 0.3);
  // Non-baroreflex sympathoexcitation (chemoreflex/pain/acidosis) above the
  // baroreflex component — this is the "central command" drive that withdraws
  // vagal tone in addition to the baroreflex (see the parasympathetic block).
  const nonBaroDrive = clamp(sympTarget - (0.25 + baroGain * (F0 - F) + baroDeriv), 0, 1);

  // Neonatal autonomic immaturity: hypoxia drives vagal (bradycardic) response.
  if (pat.ageProfile.isNeonate() && pat.pao2 < 60) sympTarget -= 0.15;
  // Elderly baroreflex blunting.
  if (pat.ageProfile.isElderly()) {
    sympTarget *= (1 - Math.min(0.4, (pat.ageProfile.age - 65) * 0.02));
  }
  // DIABETIC AUTONOMIC NEUROPATHY (queue item 21) — the same blunting idiom
  // as elderly baroreflex attenuation above, driven by a disease flag instead
  // of age. Long-standing diabetes damages autonomic nerve fibers, blunting
  // the baroreflex tachycardic response to hypovolemia/shock — the real
  // clinical hazard (a diabetic hemorrhage patient who does NOT tachycardia-
  // compensate the way a non-diabetic one does, masking early shock).
  // pat.autonomicNeuropathy (0-1) is set by diabeticVasculopathy below.
  if (pat.autonomicNeuropathy) {
    sympTarget *= (1 - Math.min(0.6, pat.autonomicNeuropathy * 0.6));
  }
  sympTarget = clamp(sympTarget, 0, 1);

  // Neural sympathetic outflow: fast (a few seconds).
  pat.neuralSymp = approach(pat.neuralSymp, sympTarget, dt, 20 * S);

  // Parasympathetic (vagal) tone — driven DIRECTLY by baroreceptor firing plus
  // the central-command drive (Task 8), rather than indirectly through the
  // lagged sympathetic state. Vagal responses are near beat-to-beat, so this
  // makes vagal withdrawal LEAD sympathetic activation in acute hypotension.
  //   paraTarget = rest + kVagal·(F − F0) − kCentral·nonBaroDrive
  // On the hypotension/normal side (F ≤ F0) the gain is chosen so this is
  // algebraically IDENTICAL to the former reciprocal law (kVagal = 0.9·baroGain,
  // kCentral = 0.9) — that regime is unchanged. On the hypertension side (F > F0)
  // a gentler gain adds a mild, physiologically-correct reflex bradycardia where
  // the old max(0,·) clamped it flat; the baroreflex setpoint also adapts over
  // ~20 min, so this fades on longer calls (baroreflex resetting).
  const kCentral = 0.9;
  // Hypertension-side gain raised 0.45 -> 2.0: reflex bradycardia to a pressor-driven
  // rise in MAP was about -0.18 bpm per mmHg (norepinephrine) against human baroreflex
  // sensitivity of roughly 0.9-1.2 bpm/mmHg for a pure alpha agonist. Measured with
  // norepinephrine infusion (beta1 partly offsets the slowing): slope -0.18 (0.45),
  // -0.33 (1.0), -0.41 (1.5), -0.50 (2.5). The hypotension side is unchanged.
  const kVagal = (F <= F0 ? 0.9 : 2.0) * baroGain;
  const paraTarget = clamp(0.78 + kVagal * (F - F0) - kCentral * nonBaroDrive, 0.05, 0.95);
  // VAGAL MANEUVER (Valsalva, carotid sinus massage). The straining phase raises
  // intrathoracic pressure; on release, venous return and arterial pressure
  // overshoot and the baroreceptors fire hard, producing a burst of efferent
  // vagal traffic to the sinus and AV nodes. Adding it to parasympathetic tone
  // (rather than subtracting 15 from the displayed rate, as fx:{hr:-15} did)
  // means it slows the sinus node AND slows AV conduction — and the AV effect is
  // the one that actually matters, because that is the limb of the reentrant
  // circuit an SVT depends on.
  // Clamped to the same 0.95 ceiling as paraTarget: a vagal maneuver recruits
  // more of the available parasympathetic range, it does not create tone beyond
  // the maximum the efferent vagus can produce. (Left unclamped this reached
  // 1.16, above the model's own defined maximum.)
  const paraWithSurge = clamp(paraTarget + clamp(pat.vagalSurge || 0, 0, 1) * 0.35, 0.05, 0.95);
  pat.parasympathetic = approach(pat.parasympathetic, paraWithSurge, dt, 8 * S);

  // Adrenal medulla: secretion driven by strong neural drive, but lagging by
  // seconds and dependent on a depletable reserve. Circulating catecholamine
  // level then rises/decays slowly (plasma half-life ~ tens of seconds, but the
  // functional tail in stress is longer).
  const secretionDrive = Math.max(0, pat.neuralSymp - 0.3) * pat.adrenalReserve;
  pat.adrenalOutput = approach(pat.adrenalOutput, secretionDrive, dt, 8 * S);
  const catTarget = 1.0 + pat.adrenalOutput * 4.0; // rest ~1.0, maximal ~ severalfold
  pat.catecholLevel = approach(pat.catecholLevel, catTarget, dt, 20 * S);

  // Reserve depletes with sustained secretion, replenishes over hours.
  pat.adrenalReserve -= pat.adrenalOutput * 0.02 * dt;
  pat.adrenalReserve += (1 - pat.adrenalReserve) * (dt / 120); // ~2h refill
  pat.adrenalReserve = clamp(pat.adrenalReserve, 0, 1);
  // When the tank is nearly empty, circulating level can no longer be sustained.
  if (pat.adrenalReserve < 0.2) pat.catecholLevel = Math.min(pat.catecholLevel, 1 + pat.adrenalReserve * 2);

  // Backward-compatible aggregate "sympathetic" (respiratory/metabolic/renal
  // read this; 0.3 is their assumed resting value, so keep that convention).
  pat.sympathetic = clamp(0.05 + pat.neuralSymp, 0, 1);
  pat.catecholamines = pat.catecholLevel;

  // Receptor tone = neural component + circulating catecholamine component +
  // exogenous drug, each entering ADDITIVELY (no multiplicative double-count).
  const catExcess = pat.catecholLevel - 1; // circulating drive above rest
  // CUSHING REFLEX (neuro batch, queue item 7 — Increased ICP / Cushing
  // Reflex / Brain Herniation). pat._cushingAlpha is computed in neuro.js's
  // updateCerebral from the PRIOR tick's cpp (the same one-tick-lag idiom
  // bronchospasm already uses for a cross-module read), and enters here
  // exactly like an exogenous drug term (_alphaDrug) — a real, additive
  // autonomic drive, not a scripted vitals override. This is deliberately
  // NOT the ordinary hypovolemic-shock baroreflex (which raises alphaTone
  // alongside beta1Tone for a compensatory TACHYCARDIA): Cushing's triad is
  // the paradoxical opposite — a sympathetic pressor surge (alpha, defending
  // CPP against rising ICP) paired with a vagally-mediated BRADYCARDIA. The
  // bradycardia half reuses pat.vagalSurge (the same handle a Valsalva
  // manoeuvre drives, below) rather than inventing a second channel — real
  // efferent vagal traffic to the sinus node either way.
  // The neural-outflow contribution (not the catecholamine/drug terms) is
  // scaled by vascularReactivity (queue item 50, patient.js) — real
  // per-patient variation in how much a given sympathetic burst actually
  // constricts the vasculature.
  // CORTISOL-PERMISSIVE VASCULAR TONE. Glucocorticoids have a real,
  // well-documented "permissive" effect on vascular smooth muscle's
  // response to catecholamines — adequate cortisol is REQUIRED for normal
  // alpha-adrenergic vasoconstriction, which is the actual physiological
  // reason adrenal (Addisonian) crisis produces shock that is only
  // PARTIALLY responsive to fluids and pressors. `addisonianCrisisCollapse`
  // (scenarios.js)'s own resolve() text already claims this explicitly
  // ("cortisol deficiency itself blunts the blood vessels' response to
  // fluid and pressors") — this was previously pure narration with no
  // mechanism behind it, since `addisonianCrisis` (conditions.js) only ever
  // set `pat.vasodilation`, the same general distributive-shock handle
  // anaphylaxis/sepsis use, which responds normally to pressors. Deadbanded
  // hard so this has ZERO effect on every other patient in the game:
  // `pat.cortisol` (renal.js) relaxes toward `pat.sympathetic` (a healthy
  // resting range of roughly 0.05-1) for every patient by default, so the
  // threshold below (0.15) sits well under any value a non-Addisonian
  // patient's cortisol will ever reach — only a condition that DRIVES
  // cortisol down toward genuine adrenal failure (addisonianCrisis) can
  // ever cross it. Floor of 0.4 (not 0) since real adrenal-insufficient
  // patients retain SOME residual pressor responsiveness, not none.
  const cortisolPermissive = (pat.cortisol ?? 1) >= 0.15 ? 1
    : 0.4 + 0.6 * ((pat.cortisol ?? 1) / 0.15);
  // CATECHOLAMINE RESISTANCE (brief section 24): a progressive loss of ADRENERGIC (alpha) responsiveness to
  // exogenous pressors. Non-adrenergic channels (vasopressin V1, pat._v1Drug) are immune, which is why
  // adding vasopressin restores pressor response when more norepinephrine no longer does.
  // Contributors: (1) scenario-initial refractoriness (alphaResistanceBase); (2) sustained alpha-agonist
  // exposure, receptor loss with a very slow time constant (t1/2 about 12 h, so small within one call);
  // (3) acidemia and sepsis-related superoxide inactivation, a fast and reversible term. Hydrocortisone
  // partially re-sensitizes (it lowers the target, it is not a pressor).
  {
    const acidemia = clamp((7.2 - (pat.ph ?? 7.4)) / 0.3, 0, 1);
    const exposure = clamp((pat._alphaDrug || 0) / 0.5, 0, 1);
    const target = clamp(((pat.alphaResistanceBase || 0) + 0.5 * exposure + 0.4 * acidemia) * (1 - 0.5 * (pat.steroidResensitization || 0)), 0, 0.9);
    const tauMin = target > (pat.alphaResistance || 0) ? (exposure > 0.2 ? 720 : 15) : 30;
    pat.alphaResistance = approach(pat.alphaResistance || 0, target, dt, tauMin);
  }
  const _alphaGainRes = 1 - 0.7 * (pat.alphaResistance || 0);
  pat.alphaTone = clamp((pat.neuralSymp * 0.9 * (pat.vascularReactivity ?? 1) + catExcess * 0.35 + (pat._alphaDrug || 0) * _alphaGainRes + (pat._v1Drug || 0) + (pat._cushingAlpha || 0)) * cortisolPermissive, 0, 3);
  pat.beta1Tone = clamp(pat.neuralSymp * 0.7 + catExcess * 0.30 + (pat._beta1Drug || 0), -1, 3);
  pat.beta2Tone = clamp(pat.neuralSymp * 0.35 + catExcess * 0.25 + (pat._beta2Drug || 0), 0, 3);

  // Sympathetic venoconstriction reduces unstressed volume (autotransfusion) —
  // preferentially from the splanchnic reservoir.
  const bv = pat.ageProfile.bloodVolumeL();
  // venousCapacitanceFactor is a GENERAL handle on the capacitance of the venous
  // reservoir (how much volume it holds unstressed at a given tone). Any state
  // that widens the venous bed drives it: pregnancy's progesterone-mediated
  // venodilation, chronic training, cirrhosis. 1 = normal.
  const venCap = clamp((pat.venousCapacitanceFactor ?? 1) * (pat.venousCapacitanceDrug ?? 1), 0.5, 2.0);
  // The mobilization coefficient below was a flat 0.35 despite this
  // function's own comment claiming the autotransfusion is "preferentially
  // from the splanchnic reservoir" — pat.splanchnicFrac (patient.js, default
  // 0.33) was set at construction and never once read anywhere (queue item
  // 5's dead-code sweep). Now the actual mobilization coefficient: at the
  // default 0.33 this reproduces the original flat 0.35 almost exactly
  // (0.33*1.06=0.3498), so no calibrated patient's baseline behavior moves.
  // The real, new effect: renal.js's portal-hypertension mechanism now
  // narrows splanchnicFrac for a cirrhotic patient (a chronically dilated,
  // poorly-contractile splanchnic bed has less venoconstrictor RESERVE left
  // to mobilize under acute sympathetic drive — a real, documented reason
  // cirrhotic patients tolerate hemorrhage worse), so that patient
  // autotransfuses measurably less blood from this reservoir during shock.
  const splanchnicMobilization = clamp((pat.splanchnicFrac ?? 0.33) * 1.06, 0.1, 0.5);
  pat.unstressedVol = 0.70 * bv * venCap * (1 - clamp(pat.alphaTone, 0, 1) * splanchnicMobilization);

  // Splenic/splanchnic RBC autotransfusion under strong drive (kept from before).
  if (pat.splenicRBC > 0 && pat.neuralSymp > 0.6) {
    const rbcAdded = Math.min(0.05 * dt * pat.neuralSymp, pat.splenicRBC);
    pat.rbcVol += rbcAdded; pat.splenicRBC -= rbcAdded;
    pat.rbcMass = pat.rbcVol * NORMAL_HB * 10 / HCT_NORMAL; pat.totalBloodVol += rbcAdded;
  }
}

// ---------------------------------------------------------------------------
// 2. VENOUS RETURN
//    Dynamic venous compliance (autonomic tone, nitrates, sepsis, aging,
//    spinal shock), regional reservoirs with splanchnic mobilised first, and
//    intrathoracic pressure coupling preload to respiration/ventilation.
// ---------------------------------------------------------------------------
export function updateVenousReturn(pat, dt) {
  // Intrathoracic pressure: spontaneous breathing is mildly negative; positive-
  // pressure ventilation, intrinsic PEEP (air-trapping) and tension pneumothorax
  // raise it, impeding venous return.
  let itp = -4;
  // Positive-pressure ventilation raises mean airway pressure and therefore
  // intrathoracic pressure. This previously keyed off tvDrugOffset, which stopped
  // being set when assisted ventilation was moved to its own declaration — so
  // bagging and CPAP silently lost their haemodynamic effect entirely. Both the
  // delivered breath and any applied PEEP contribute.
  // MANDATORY positive-pressure breaths (BVM, ventilator: rr > 0) inflate the
  // chest independently of the patient and carry the full mean-airway-pressure
  // penalty. CPAP and pressure support (rr = 0, patient-triggered) are
  // SPONTANEOUS: the patient still generates negative inspiratory pressure, which
  // partly offsets the applied pressure, so the net rise in mean intrathoracic
  // pressure is far smaller. Treating the two identically halved cardiac output
  // on a CPAP patient, when CPAP in pulmonary oedema is haemodynamically
  // favourable rather than catastrophic.
  if (pat.assistedVent && (pat.assistedVent.rr || 0) > 0) {
    itp += 3 + ((pat.assistedVent.vt || 0) * 2.5);
  }
  itp += (pat.appliedPEEP || 0) * 0.35;         // externally applied PEEP/CPAP
  // An artificial airway raises mean intrathoracic pressure only insofar as it
  // lets delivered positive pressure reach the chest instead of leaking past a
  // mask seal — so it scales the DELIVERED breath's effect rather than adding a
  // pressure of its own. (Previously this keyed off tvDrugOffset, which meant a
  // tube in a spontaneously breathing patient raised intrathoracic pressure with
  // nobody ventilating them.)
  if (pat.artificialAirway > 0 && pat.assistedVent && (pat.assistedVent.rr || 0) > 0) {
    itp += 1.5 * pat.artificialAirway;
  }
  itp += (pat.intrinsicPEEP || 0) * 1.2;                               // dynamic hyperinflation
  if (pat.ptx === "tptx") itp += 18;                                   // tension pneumothorax
  else if (pat.ptx === "ptx") itp += 4;
  pat.intrathoracicP = approach(pat.intrathoracicP, itp, dt, 3 * S);

  // Pericardial pressure: a SEPARATE external pressure acting only on the
  // heart chambers themselves (not the great veins outside the pericardium),
  // so cardiac tamponade can be represented purely as rising fluid pressure
  // in the pericardial sac — impairing ventricular filling at any given CVP
  // — without a disease-specific resistance hack. Conditions raise this via
  // pat.pericardialEffusion (0..1, e.g. accumulating traumatic/malignant
  // effusion); it decays only if the effusion is drained. Defaults to 0 (no
  // effect) for every patient that never sets it.
  //
  // PHASE 6 (queue item 1): pericardial pressure is now a shared, nonlinear
  // function of the pericardial sac's TOTAL contents (chamber blood volume
  // plus any effusion fluid), not a free-standing linear function of effusion
  // alone -- the standard bilinear pericardial pressure-volume relationship:
  // slack/near-constant below an inflection, then an exponential "elastic
  // band" rise above it (Freeman & LeWinter, Circulation 1984; Holt, Rhode &
  // Kines, Circ Res 1960). Effusion fluid is modeled as extra volume
  // competing for the SAME fixed pericardial space the heart's own chambers
  // occupy -- this is why a small, rapidly-accumulating traumatic effusion
  // causes tamponade (it pushes total contents past an already-tight
  // inflection) while a much larger, slowly-accumulated chronic effusion is
  // tolerated (the sac has had time to stretch and accommodate it; modeled
  // here via the same slack term, not a separate chronic-adaptation state --
  // a genuine future refinement, not attempted this batch). Total chamber
  // volume is read from the PREVIOUS tick's published fourChamberLoop state
  // (this tick's own full-loop solve hasn't run yet) -- the same one-tick
  // lag pat.cvp/pat.vr already tolerate elsewhere in this function.
  // NOTE: fourChamberLoop.totalVolumeMl is the TOTAL BLOOD VOLUME across the
  // entire closed loop (~5900-6000 mL at rest, including the aorta/systemic/
  // pulmonary-artery/pulmonary-vein compartments) -- NOT the quantity that
  // sits inside the pericardial sac. Only the four cardiac chambers
  // themselves are inside the pericardium, so this sums fourChamberLoop's
  // own already-published per-chamber volumes instead (~350 mL typical
  // resting total: LV~120 + RV~115 + LA~60 + RA~55).
  const fcv = pat.fourChamberLoop?.volumes;
  const periVtot = fcv ? (fcv.vla + fcv.vlv + fcv.vra + fcv.vrv) : 350;
  const periEffVolMl = (pat.pericardialEffusion || 0) * 180; // fluid sharing the same fixed sac
  // MEASURED against this engine's own already-shipped, already-calibrated
  // pericardialTamponade condition (conditions.js), not invented: that
  // condition's own progress() was tuned so pericardialEffusion approaches
  // 0.5 (not 1.0) because a stronger target pushed CO/MAP past this engine's
  // survivable range (see its own comment). effusionScale/effusionRate below
  // are fit so effusionFrac=0.46 (this condition's own measured 15-minute
  // value) reproduces ~10 mmHg -- the same order of magnitude the prior
  // linear term (effusion*22) produced at that same point (0.46*22=10.1) --
  // preserving the already-verified tamponade CO-collapse/CVP-rise/fluid-
  // bolus-response assertions rather than silently re-tuning a condition
  // this batch did not touch.
  const effusionScale = 38.67, effusionRate = 0.5;
  const periFromEffusion = effusionScale * (Math.exp(effusionRate * (pat.pericardialEffusion || 0)) - 1);
  // Volume-driven term: near-zero for a normally-filled heart (periVstar sits
  // above the typical resting 4-chamber total of ~350 mL), becoming
  // significant only once the sac's total contents (chamber volume + any
  // effusion fluid) are genuinely supranormal -- e.g. severe volume overload
  // or RV distension pressing on a shared, fixed-size sac, per the plan's own
  // "RV filling raises V_tot -> raises P_peri -> raises LV intracavitary EDP"
  // chain. This is the genuinely NEW piece of this phase: a chronically
  // dilated or acutely volume-overloaded heart now experiences real, if
  // modest, extra pericardial restraint even with NO effusion at all.
  // A REAL BLOWUP WAS FOUND AND FIXED HERE (not shipped blind): a transiently
  // ballooning chamber during arrest-adjacent decompensation (e.g. fbao/anaph
  // scenarios, stochastically, when the rhythm substrate destabilizes) can
  // legitimately push periVtot far past any normal operating range -- the
  // SAME "chamber accepts unbounded volume" failure mode edpA/edpB/VmaxLV's
  // own comment already documents elsewhere in this function, just on a
  // NEW additive term with no ceiling of its own. An uncapped exponential
  // on that excess produced a pericardial pressure spike past 100 mmHg,
  // corrupting RV volumes (measured: pericardialP=235, rvEsv=-317 in a
  // repeated fbao probe) -- a real regression caught by scenarioSweep.mjs
  // before being shipped, not a hypothetical. Capping the excess this term
  // ever sees bounds its own output to a physiologically-plausible ceiling
  // regardless of how far a transiently-ballooning chamber state travels,
  // the same defensive pattern VmaxLV/stiffK already use for the EXISTING
  // EDPVR excess term.
  const periVstar = 400, periVolScale = 0.08, periVolRate = 0.03, periVolExcessCap = 200;
  const periVolExcess = clamp(periVtot + periEffVolMl - periVstar, 0, periVolExcessCap);
  const periFromVolume = periVolScale * (Math.exp(periVolRate * periVolExcess) - 1);
  // pat._pericardiectomy: test-only override (Vaillant et al. 2025 J Physiol's
  // pericardiectomy null test) forcing pericardial restraint to exactly zero,
  // regardless of effusion/volume state -- never set by any condition, only
  // by mechanismWiring.mjs's own Phase 6 verification section.
  const targetPericardialP = pat._pericardiectomy ? 0 : (periFromEffusion + periFromVolume);
  pat.pericardialP = approach(pat.pericardialP || 0, targetPericardialP, dt, 1.5 * S);
  // Combined external pressure the heart itself sees (used by the lumped
  // model's one-tick bootstrap only, before pat.fourChamberLoop exists --
  // the authoritative full-loop solver instead reads pericardial restraint
  // per-chamber, see periLV/periRV/periLA/periRA below).
  pat.cardiacExternalP = pat.intrathoracicP + pat.pericardialP;

  // COMPARTMENT SYNDROME (queue item 74, Phase 3): pat.compartmentPressure
  // (mmHg, per limb, patient.js) is raised by a condition (e.g. crushSyndrome)
  // via approach() -- the same rising-pressure-in-an-enclosed-space idiom this
  // function already uses above for pericardialEffusion->pericardialP. The
  // decisive clinical variable is DELTA PRESSURE = diastolic BP - compartment
  // pressure, NOT a flat absolute compartment-pressure threshold: McQueen &
  // Court-Brown's whole-limb compartment-pressure-monitoring studies (the
  // standard citation for this decision rule) use a delta pressure below
  // ~20-30 mmHg as the indication for fasciotomy, precisely because a
  // hypotensive trauma patient becomes ischemic at a LOWER absolute
  // compartment pressure than a normotensive one -- using pat.dbp (a real,
  // live engine field) rather than a fixed number reproduces that patient-
  // specific behavior for free.
  //
  // MEASURED (real probe against this engine, not guessed): a normotensive
  // patient (dbp ~70-80) with a normal-to-mildly-elevated compartment
  // pressure (0-15 mmHg, deltaP 55-80) must land at occlusion 0; a patient
  // deep in the McQueen/Court-Brown critical band (deltaP <=20-30) must reach
  // a real, meaningfully occluding value. A linear ramp from deltaP=30 (occl 0,
  // the top of the critical band -- borderline, not yet critical) to deltaP=10
  // (occl ~1, a genuinely crushed perfusion gradient), capped at 0.95 (never
  // 1.0, matching acuteLimbIschemia's own precedent that no arterial lesion
  // in this engine is modeled as instantaneously and totally occlusive).
  //
  // WRITTEN TO ITS OWN FIELD, pat.compartmentOcclusion, NOT composed into
  // pat.limbOcclusion here. A first attempt did exactly that via max() and
  // was caught, measured, and reverted: this term is recomputed fresh from
  // LIVE dbp every tick with no memory, but limbOcclusion's other writers
  // (acuteLimbIschemia, a located tourniquet) hold real accumulated state
  // that only ever changes through their own mechanism -- composing a
  // memoryless live term into that field via max() is a one-way ratchet
  // (max never decreases), and the cardiovascular ODE's own startup settling
  // transient (MEASURED: dbp briefly ~40-54 mmHg in a fresh patient's first
  // ~10 simulated seconds, recovering to 86-94 mmHg by 15s and staying there)
  // was enough to spike this term once and pin limbOcclusion at 0.95 for the
  // rest of the call even after dbp fully recovered. Kept separate instead;
  // see patient.js's own comment on pat.compartmentOcclusion and neuro.js's
  // updateOrganInjury, which composes the two sources via max() only at the
  // point of consumption -- physiologically sound for the rare/contrived case
  // of two simultaneous mechanisms on one limb (whichever is currently more
  // occlusive dominates), without contaminating either source's own state.
  if (!pat.compartmentOcclusion) pat.compartmentOcclusion = { armL: 0, armR: 0, legL: 0, legR: 0 };
  for (const loc of ["armL", "armR", "legL", "legR"]) {
    const cp = (pat.compartmentPressure || {})[loc] || 0;
    if (cp <= 0) { pat.compartmentOcclusion[loc] = 0; continue; } // no compartment lesion on this limb
    const deltaP = (pat.dbp ?? 70) - cp;
    pat.compartmentOcclusion[loc] = clamp((30 - deltaP) / 20, 0, 0.95);
  }

  // Dynamic venous compliance.
  let cv = pat.venousCompliance0;
  cv *= (1 - clamp(pat.alphaTone, 0, 1.5) * 0.30);        // venoconstriction stiffens (lowers C)
  cv *= (1 + (pat.vasodilation || 0) * 1.2);              // inflammatory/anaphylactic venodilation
  if (pat.riskFactors.sepsis) cv *= 1.6;                  // inflammatory venodilation
  if (pat.riskFactors.spinalShock) cv *= 2.2;             // loss of sympathetic venomotor tone
  if (pat.ageProfile.isElderly()) cv *= 0.9;              // stiffer veins with age
  // (Nitrate venodilation is handled below via venousToneModifier shifting
  // blood into unstressed capacitance, i.e. reducing stressed volume.)
  // Body-size scale (1.0 for a 70 kg adult, ~0.067 for a term neonate). Blood
  // volume is the actual circulating volume, so using it keeps the venous
  // reservoir and the ventricle it fills on the SAME scale — stroke volume and
  // the venous return that supplies it stay matched across the age range.
  // bodyScale is FIXED anatomy — from the frozen baseline captured at creation,
  // never the live totalBloodVol (see Finding #2 / patient.js). Otherwise the
  // heart shrinks as the patient bleeds and hemorrhage is masked.
  // Upper bound raised from 1.3: a 100 kg adult has an anatomical blood volume
  // of ~7 L, i.e. bodyScale 1.43, and was being truncated to 1.30. Because
  // resistance scales as 1/bodyScale, that left large adults with ~10% more
  // systemic resistance than their size warrants and pushed their mean arterial
  // pressure up with body mass (measured MAP 93 / 97 / 107 at 50 / 70 / 100 kg
  // when pressure should be size-invariant). The bound exists to keep the solver
  // stable at physiological extremes, so it now spans the human range rather
  // than cutting off ordinary large adults.
  const bodyScale = clamp((pat.bodyScaleBaselineL || pat.totalBloodVol) / 4.9, 0.03, 2.0);
  pat._bodyScale = bodyScale;
  cv *= bodyScale;
  cv = Math.max(0.003, cv);

  // Stressed volume (drives mean systemic filling pressure). venousToneModifier
  // (nitroglycerin) shifts blood into unstressed capacitance.
  const vtMod = clamp(pat.venousToneModifier != null ? pat.venousToneModifier : 1, 0.4, 1.2);
  pat.stressedVol = Math.max(0, (pat.totalBloodVol - pat.unstressedVol)) * vtMod;
  pat.msfp = pat.stressedVol / cv;

  // Venous resistance to return, lowered slightly by sympathetic drive. It sets
  // FLOW, which scales with cardiac output — and a small child's faster heart
  // moves more blood per unit volume — so it is scaled by flow (bodyScale x the
  // age's heart-rate ratio), not by blood volume alone. Otherwise the neonatal
  // circulation is over-throttled and the ventricle is starved of preload.
  const flowScale = bodyScale * Math.max(0.5, (pat.hrBase || 75) / 75);
  const rvr = pat.venousResistance * 14 * (1 - clamp(pat.alphaTone, 0, 1) * 0.2) / flowScale; // mmHg*min/L
  pat.venousReturnResistance = rvr;

  // Instantaneous venous return given current RA pressure and intrathoracic P.
  pat.vr = Math.max(0, (pat.msfp - (pat.cvp + pat.intrathoracicP)) / rvr);
}

// ---------------------------------------------------------------------------
// 3. CARDIAC PUMP — conduction, HR-dependent filling, nonlinear Frank-Starling,
//    ventricular-arterial coupling, Windkessel arterial pressures, and the
//    right-atrial volume balance that makes CVP a genuine state variable.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// CHRONIC ADAPTATION — concentric LV hypertrophy from sustained afterload
// elevation (queue item V2-27, scoped to the smallest real slice per that
// item's own text: ONE state variable, using this engine's established
// relax()-toward-target idiom, additive on an existing compliance
// parameter).
//
// Mechanism: sustained elevated afterload (pat.svr, an already-computed,
// real quantity, not a scripted stat) drives the ventricular wall to
// remodel toward a new, thicker steady state, exactly the way
// pat.baroSetpoint/pat.arterialCompliance/etc. above already relax toward a
// forcing target via the same approach() helper. Concentric LVH from
// sustained hypertension is standard cardiology teaching as a WEEKS-TO-
// MONTHS process (e.g. Katz, Physiology of the Heart; ACC/AHA hypertensive
// heart disease reviews) — tau is set to 14 days (20160 min) so a call run
// for many simulated days (mechanismWiring's own probe() supports an
// arbitrary `run` in seconds) shows real, gradual, non-instant development,
// not a switch.
//
// Consequence: reduced diastolic compliance ("harder to fill" even as
// systolic function is initially preserved/enhanced) — wired as a NEW,
// purely multiplicative term on edpB (the EDPVR diastolic-stiffness
// coefficient already read by updateFullLoopODE, see buildParams below),
// not a restructure of the solver. At lvHypertrophy=0 (any patient without
// sustained afterload elevation, including every acute cardiac/shock
// condition, which start near 0 and have no time within a single call to
// develop this) the multiplier is exactly 1, a no-op by construction, not
// just by measurement.
const LVH_TAU_MIN = 14 * 24 * 60;      // 14 days — real, cited weeks-scale onset
const LVH_SVR_ENGAGE = 1.15;           // afterload has to be sustained >=15% above this
const LVH_SVR_SPREAD = 0.55;           // ...and saturates ~70% above normal

// QUEUE ITEM V2-27 (second slow-timescale chronic-adaptation state, same
// idiom as lvHypertrophy immediately above). Sustained hypertension does not
// only remodel the ventricle — it also drives arteriosclerotic stiffening of
// the conduit arteries themselves (collagen deposition, elastin fragmentation,
// loss of vascular smooth-muscle compliance reserve; Framingham/pulse-wave-
// velocity literature on hypertension-driven arterial stiffening). This is a
// SEPARATE, SLOWER process from LVH (months-to-years of sustained pressure
// load to become clinically apparent, versus LVH's own weeks-scale onset),
// so it gets its own, longer tau rather than reusing LVH's. It is also
// mechanistically distinct from updateCardiovascular's own acute,
// pressure-dependent stiffening term (the exponential decay of
// pat.arterialCompliance toward pat.arterialComplianceBase as MAP rises,
// which relaxes back within minutes once pressure falls) — this state
// instead slowly lowers the CEILING itself (pat.arterialComplianceBase),
// a structural change that does NOT relax back on the acute term's own
// minutes-scale timeline.
const VSTIFF_TAU_MIN = 90 * 24 * 60;   // 90 days — real, cited months-scale onset, slower than LVH
const VSTIFF_SVR_ENGAGE = LVH_SVR_ENGAGE; // same afterload-elevation threshold as LVH (one shared cause)
const VSTIFF_SVR_SPREAD = LVH_SVR_SPREAD;
const VSTIFF_MAX_COMPLIANCE_LOSS = 0.4; // real ceiling stiffened by at most 40% at vascularStiffness=1

export function updateChronicRemodeling(pat, dt) {
  const normalSvr = pat.ageProfile ? pat.ageProfile.baseSVR() : 1200;
  const ratio = (pat.svr || normalSvr) / normalSvr;
  const target = clamp((ratio - LVH_SVR_ENGAGE) / LVH_SVR_SPREAD, 0, 1);
  pat.lvHypertrophy = approach(pat.lvHypertrophy ?? 0, target, dt, LVH_TAU_MIN);

  const vsTarget = clamp((ratio - VSTIFF_SVR_ENGAGE) / VSTIFF_SVR_SPREAD, 0, 1);
  pat.vascularStiffness = approach(pat.vascularStiffness ?? 0, vsTarget, dt, VSTIFF_TAU_MIN);

  // CONSUMER: pat.arterialComplianceFactor is the authoritative full-loop
  // ODE's own real aortic-compliance disease handle (buildParams' `Cao` term,
  // cardiovascular_ode_full.js) — NOT pat.arterialCompliance/
  // arterialComplianceBase above, which feed only the LUMPED model's own
  // pat.ea/sv calculation, itself overwritten by the authoritative full loop
  // (section 5's own "two solvers, the full ODE is authoritative" rule). A
  // first version of this mechanism drove arterialComplianceBase instead and
  // was found, by direct measurement, to be completely inert to every
  // published vital (pat.pp/pat.sbp/pat.dbp all come from the full loop,
  // which never reads that field) — exactly the "written, read, still inert"
  // defect class section 1 warns about. Composed via the SAME Math.min
  // ceiling idiom preeclampsia's own arterial-stiffening mechanism already
  // uses, so the two compose correctly (whichever lesion is more severe
  // wins) rather than one silently overwriting the other.
  pat.arterialComplianceFactor = Math.min(pat.arterialComplianceFactor ?? 1,
    1 - VSTIFF_MAX_COMPLIANCE_LOSS * pat.vascularStiffness);
}

export function updateCardiovascular(pat, dt) {
  updateChronicRemodeling(pat, dt);
  // ---- Electrical conduction & heart rate ----
  updateConduction(pat, dt);
  // Chronotropy is expressed RELATIVE to the resting autonomic balance, so that
  // at rest the net autonomic effect is zero and observed HR equals hrBase
  // (which conditions set to the intended resting rate). Deviations in beta and
  // vagal tone move it; atropine (vagalBlock) adds a direct rate bump.
  const REST_BETA1 = 0.175, REST_PARA = 0.78;
  let hr = pat.saRate;
  hr += (clamp(pat.beta1Tone, -1, 3) - REST_BETA1) * 70;
  hr -= (pat.parasympathetic - REST_PARA) * 60;
  // pat.tcaVagalBlock (tricyclicOverdose, conditions.js) is a separate,
  // condition-owned term composed alongside the pk-owned pat.vagalBlock —
  // that field is reset to 0 every tick by pk.js (pk.js:787), so a
  // condition writing it directly would be silently wiped (measured
  // directly, the same reset trap as sodiumChannelBlock/drugInotropy above).
  hr += clamp((pat.vagalBlock || 0) + (pat.tcaVagalBlock || 0), 0, 1) * 25;
  // pat.cholinergicVagalTone (organophosphatePoisoning, conditions.js, queue
  // item 67) — a THIRD condition-owned vagal accumulator, same reset-trap
  // reasoning as tcaVagalBlock immediately above (pat.parasympathetic itself
  // is fully recomputed every tick by updateAutonomic's own baroreflex model
  // a few lines below this one and clamped to a 0.95 physiological ceiling,
  // so a condition writing it directly gets silently pulled back toward
  // baseline before this formula next reads it — measured directly: an
  // early attempt to ratchet pat.parasympathetic up in conditions.js moved
  // hr by less than 1 bpm at steady state). Unlike vagalBlock/tcaVagalBlock,
  // which only ever ADD a flat rate-bump, this term genuinely LOWERS hr
  // (real muscarinic-crisis bradycardia, distinct from any reflex/AV-block
  // vagal tone this engine already models) and is genuinely, proportionally
  // ANTAGONIZED by atropine's own vagalBlock/tcaVagalBlock coefficient — the
  // actual pharmacology (atropine competitively blocks the muscarinic
  // receptor the excess acetylcholine is acting on) rather than an unrelated
  // counter-bump. 45 bpm chosen as the ceiling swing so a fully atropine-
  // unopposed crisis (cholinergicVagalTone=1) can reach real, dangerous
  // bradycardia territory (see that condition's own comment/measurement).
  hr -= clamp(pat.cholinergicVagalTone || 0, 0, 1) * 45 *
    (1 - clamp((pat.vagalBlock || 0) + (pat.tcaVagalBlock || 0), 0, 1));
  if (pat.coreTemp < 35) hr *= Math.max(0.55, 1 - (35 - pat.coreTemp) * 0.05); // hypothermic slowing
  // A newborn in transition (see conditions.neonatalTransition) has its rate
  // governed by the transition state itself — bradycardic when depressed, rising
  // with effective ventilation — which is the whole basis of NRP. This overrides
  // the adult-style baroreflex chronotropy, which would wrongly drive tachycardia
  // off the low neonatal pressures.
  if (pat._neo) {
    hr = 25 + clamp(pat._neo.vigor, 0, 1) * 135;
  } else if (pat.ageProfile.isNeonate()) {
    hr = Math.max(hr, 70);   // healthy (non-transition) neonate: sinus floor
  } else if (pat.ageProfile.age < 12) {
    // Pediatric asphyxial bradycardia: as a child desaturates, heart rate FALLS
    // (vagally mediated) rather than rising — the ominous PALS pre-arrest sign.
    // Applied as a smooth ceiling that is a no-op at normal saturations and
    // engages increasingly below ~88%, so there is no threshold chatter. The
    // falling rate lowers output and mixed-venous O2, feeding the hypoxic spiral.
    const target = 10 + ((pat.sao2 ?? 97) - 40) * 2.4;   // SpO2 90->130, 78->101, 68->77, 58->53, 50->34
    hr = Math.min(hr, target);
  } else if ((pat.sao2 ?? 97) < 55) {
    // Profound hypoxemia depresses the sinoatrial node directly even in adults.
    hr -= (55 - pat.sao2) * 1.6;
    hr = Math.max(hr, 0);
  }

  // SECOND-DEGREE AV BLOCK — cardiac conditions batch (physiology queue item
  // 7). FOUND WHILE BUILDING IT: pat.avNodalDisease/avConduction (added
  // earlier this same batch for first-/third-degree block) only ever fed
  // the PR interval and the binary sinus<->chb rhythm transition — nothing
  // reduced the actual ventricular RATE for an intermediate, "some atrial
  // impulses fail to conduct" severity, which is the entire clinical and
  // hemodynamic content of second-degree block (Mobitz I/Wenckebach and
  // Mobitz II both mean the ventricular rate is LOWER than the atrial rate
  // because specific beats are dropped — first-degree has none of that,
  // 1:1 conduction is preserved, and third-degree already gets its own
  // ventricular-escape rate via the chb branch below). Without this, a
  // condition could only ever produce a prolonged PR interval OR a full
  // chb escape rhythm — nothing in between could ever show reduced
  // perfusion, which would have made this a PR-interval number on a
  // monitor with no patient behind it, exactly the class of defect
  // section 1 forbids. Modeled as a smooth conduction-ratio approximation
  // (this continuous-tick engine has no clean way to track individual
  // dropped P:QRS beats, the same limitation documented for afib/flutter's
  // R-R irregularity): a no-op above avConduction 0.65 (first-degree block,
  // measured ~0.72-0.75, is deliberately left untouched — 1:1 conduction
  // is its whole definition), ramping smoothly down to half rate as
  // avConduction approaches the 0.05 chb floor. Because avConduction
  // itself already reflects EVERY cause of AV impairment this engine has
  // (avNodalDisease, hyperkalaemia's effK, magnesium toxicity, AV-blocking
  // drugs), this is a genuinely shared final-common-pathway mechanism, not
  // a special case for one condition — verified NOT to touch any
  // already-measured hyperkalaemia value (untreated k=7.5's avConduction
  // was measured at 0.726 for the calcium assertion, above this term's
  // no-op floor) or first-degree block's own ~0.72-0.75.
  if (pat.rhythm === "sinus" || pat.rhythm === "wideQRS") {
    const conductionRatio = clamp((pat.avConduction - 0.1) / (0.65 - 0.1), 0, 1);
    hr *= clamp(0.5 + conductionRatio * 0.5, 0.5, 1);
  }

  // PREMATURE ATRIAL CONTRACTIONS (cardiac conditions batch, queue item 7).
  // An isolated ectopic atrial focus fires early, resets the sinus node, and
  // is followed by a (usually incomplete) compensatory pause — a single-tick
  // rate perturbation, NOT the sustained per-tick jitter afib uses below,
  // because the defining ECG distinction a candidate is meant to make is
  // "occasional early beats on an otherwise regular strip" versus "every beat
  // irregular." Deliberately gated to pure sinus (not wideQRS/any other named
  // rhythm) since PACs are an atrial-origin finding that has nothing to do
  // with a ventricular-conduction classification. Per-tick probability scaled
  // so pat.atrialEctopicFocus = 1 (the most irritable focus this handle can
  // represent) fires roughly one early beat every 60-70s — MEASURED
  // (conditions.js's prematureAtrialContractions comment), not the "several
  // per minute" an earlier, un-measured draft of this comment guessed at —
  // frequent enough to be a real, sampleable irregularity (stdev 5.18 vs a
  // matched control's 0.88 over a 10-minute window) while staying clearly
  // short of afib's continuous every-beat irregularity.
  if (pat.rhythm === "sinus" && (pat.atrialEctopicFocus || 0) > 0 &&
      Math.random() < (pat.atrialEctopicFocus || 0) * 0.06 * dt * 20) {
    hr *= 1 + (Math.random() * 0.25 + 0.1);
  }

  // Rhythm sets the mechanical rate. VT is fast and non-perfusing-ish; junctional
  // and complete heart block impose escape rates; AF is irregular/fast.
  if (pat.rhythm === "VT") hr = clamp(hr * 0 + 180, 150, 220);
  // TORSADES SETS ITS OWN RATE, and until now it set nothing at all: the rhythm
  // was named but had no mechanical consequence anywhere in this file, so a
  // patient "in torsades" ran at whatever sinus rate the baroreflex wanted
  // (measured on the shipped tree: HR 93, CO 6.07 L/min, SBP 125). The monitor
  // showed a lethal arrhythmia attached to a patient who was, mechanically, a
  // normal one.
  // Documented rate is 150-250/min, and the reason torsades causes syncope is
  // that "the underlying rate (200 to 250 beats/minute) is nonperfusing"
  // (Merck Manual Professional, Torsades de Pointes VT). 220 is the top of the
  // documented band that this model can represent — pat.hr is clamped to 220
  // just below — so the rate is taken to that ceiling rather than invented.
  //
  // UPDATE (queue item 1): the rate alone did not used to collapse cardiac
  // output — torsades ran at CO 6.25 L/min, MAP 104, essentially normal
  // perfusion, because the sysFrac ceiling in the buildParams call below
  // (updateFullLoopODE) was clamped to an arbitrary 0.60 regardless of how
  // much diastolic time real electromechanical systole (Weissler) leaves at
  // a given rate. That rail is now fixed — see the QUEUE ITEM 1 FIX comment
  // at the sysFrac line for the measurements. Torsades now reads CO ~5.4,
  // MAP ~97 in an otherwise-healthy patient: measurably impaired, moving in
  // the correct direction, but not yet the full syncope-inducing collapse a
  // sustained 220/min wide-complex tachycardia produces clinically — see that
  // comment for what was tried, what worked, and what remains open.
  // PHASE 1 (queue item 1): rate is now sampled once per episode rather than
  // hard-clamped to 220 every tick. Bluzhas et al.'s own 150-episode series
  // measured mean 218+-38 bpm, range 145-281, with a bimodal slow(<220)/
  // fast(>=220) split (53.6%/46.4%) that is itself a primary VF-risk
  // splitter (see the sustain/degenerate branch below) -- sampled at episode
  // onset and held fixed for the episode's own duration.
  else if (pat.rhythm === "torsades") hr = clamp(pat._torsadesRate || 220, 145, 281);
  else if (pat.rhythm === "svt") hr = Math.max(hr, 170);
  // ATRIAL FIBRILLATION — cardiac conditions batch (physiology queue item 7).
  // "afib" was already a fully-plumbed rhythm state before this batch — it
  // was in PERFUSING, excluded from DYSSYNC (conducts down the normal
  // His-Purkinje system, so no ventricular dyssynchrony penalty, correctly),
  // excluded from NO_ATRIAL_KICK's downstream lumped-model term, and ecg.js
  // already had both a waveform and a read-out string for it — but nothing
  // in the whole codebase ever set pat.rhythm = "afib" (confirmed by grep
  // before writing this), so none of that machinery could ever fire. The one
  // genuinely missing piece, added here: an "irregularly irregular"
  // ventricular response is the rhythm's defining clinical and ECG sign, and
  // without it "afib" was just a label a condition could apply to an
  // otherwise perfectly regular rhythm. Modeled as bounded per-tick noise
  // around the same underlying rate the baroreflex would otherwise settle
  // on — the same +/-random-jitter idiom ecg.js's own afib beat-spacing
  // render already uses independently for this rhythm (ecgPoints, the
  // kind==="afib" branch) — rather than a literal beat-by-beat R-R model,
  // which this continuous-tick engine has no clean way to represent. A real,
  // measurable mechanism: asserted via HR sample variance against sinus
  // rhythm at a matched mean rate, not a cosmetic label.
  else if (pat.rhythm === "afib" && pat.accessoryPathway) {
    // WPW + AFib — cardiac conditions batch (physiology queue item 7). The
    // single most dangerous rhythm combination in the WPW literature: the
    // accessory bypass tract does not share the AV node's decremental,
    // rate-limiting property, so blocking the AV node (diltiazem/adenosine/
    // beta-blockade — every one of which acts on beta1Tone or AV conduction,
    // neither of which this branch reads) does not slow conduction down the
    // bypass tract, and can paradoxically shunt MORE conduction that way —
    // the real, literature-documented reason these drugs are relatively
    // contraindicated in this specific combination (procainamide or
    // cardioversion are the actual treatments). Rate is derived from raw
    // saRate (sinus-node automaticity) rather than the autonomic/AV-
    // modulated `hr` computed above, so it is genuinely insensitive to
    // AV-nodal blockers while still tracking anything that changes the
    // ATRIAL rate itself — a real mechanism distinction, not a special-
    // cased drug exemption.
    hr = clamp(pat.saRate * (1 + (Math.random() - 0.5) * 0.5), 150, 280);
  }
  else if (pat.rhythm === "afib") hr = clamp(hr * (1 + (Math.random() - 0.5) * 0.35), 40, 200);
  // ATRIAL FLUTTER — cardiac conditions batch (physiology queue item 7).
  // Distinguished from afib on the ONE axis that actually matters clinically
  // and on the monitor: flutter is a single re-entrant circuit firing at a
  // near-fixed atrial rate (~300/min) with a QUANTIZED, REGULAR AV
  // conduction ratio (2:1, 3:1, 4:1...), so the ventricular rate is fast but
  // perfectly regular — the opposite of afib's chaos. Modeled as the SAME
  // beta1Tone/parasympathetic-modulated `hr` afib starts from (so diltiazem
  // genuinely rate-controls it, representing a shift toward a higher-degree
  // conduction ratio) but with NO jitter term added, clamped to the
  // conduction-ratio band a ~300/min atrial rate actually produces (2:1 =
  // 150, 3:1 = 100, 4:1 = 75). Deliberately NOT `hr*0+150` (the fixed-rate
  // idiom VT/torsades use): those are ventricular-automaticity rhythms with
  // no AV node in the loop to rate-control; flutter's ventricular rate is
  // entirely a function of AV-nodal conduction, which diltiazem/beta-
  // blockade genuinely slow, so zeroing out the autonomic term would make
  // this diltiazem-immune, which is clinically wrong.
  else if (pat.rhythm === "flutter") hr = clamp(hr, 75, 160);
  else if (pat.rhythm === "junctional") hr = clamp(hr, 40, 60);
  else if (pat.rhythm === "chb") hr = clamp(30 + pat.beta1Tone * 8, 25, 45); // ventricular escape
  else if (pat.rhythm === "VF" || pat.rhythm === "asystole") hr = 0;
  // ---- TRANSCUTANEOUS PACING ----
  // An external pacemaker does not add beats to the intrinsic rate, it CAPTURES
  // the ventricle and imposes its own. Capture is not free: the stimulus has to
  // depolarise myocardium across the chest wall, and the myocardial capture
  // threshold rises with the things that make a cell hard to depolarise —
  // hypoxia, acidosis and hyperkalemia (which depolarises resting membrane
  // potential and inactivates sodium channels). In asystole there is no
  // myocardium left to capture in any useful sense, which is why TCP is not
  // recommended for asystolic arrest; in VF the ventricle is already
  // depolarising chaotically. Both are excluded here rather than by a flag.
  pat.pacedCapture = 0;
  if ((pat.pacerRate || 0) > 0 && !["VF", "asystole"].includes(pat.rhythm)) {
    // Threshold in mA. ~40-60 mA captures a normal myocardium transcutaneously;
    // it climbs steeply in the metabolically poisoned heart.
    let threshold = 50;
    if ((pat.sao2 ?? 97) < 85) threshold += (85 - pat.sao2) * 1.2;
    if ((pat.ph ?? 7.4) < 7.2) threshold += (7.2 - pat.ph) * 200;
    if ((pat.k ?? 4) > 5.5) threshold += (pat.k - 5.5) * 18;
    pat.pacedCapture = clamp((pat.pacerOutput - threshold) / 20, 0, 1);
    if (pat.pacedCapture > 0.5) {
      // Captured beats are paced at the set rate. Below the intrinsic rate the
      // pacer simply never fires (demand mode), so it can only ever raise a
      // rate, never lower one — the reason it is a bradycardia intervention.
      hr = Math.max(hr, pat.pacerRate);
    }
  }
  pat.hr = pat.rhythm === "VF" || pat.rhythm === "asystole" ? 0 : clamp(hr, 20, 220);

  // ---- Diastolic filling time (falls as HR rises) ----
  const effHr = Math.max(pat.hr, 30);
  pat.diastolicFraction = Math.max(0.2, 0.65 - 0.0025 * (effHr - 60));
  const fillMod = pat.diastolicFraction / 0.6125; // 1.0 at HR 75

  // ---- Atrial kick ----
  // Transcutaneous pacing is VENTRICULAR: the atria are not sensed or paced, so
  // atrial systole falls wherever it happens to fall and the atrial kick is
  // effectively lost. This is a large part of why a paced patient's stroke
  // volume per beat is lower than a sinus patient's at the same rate.
  let kick = (NO_ATRIAL_KICK.includes(pat.rhythm) || (pat.pacedCapture || 0) > 0.5) ? 0.0 : 1.0;
  // Atrial contribution matters MORE when the ventricle is stiff (elderly,
  // diastolic dysfunction) — losing it then costs more filling.
  const stiff = (pat.ageProfile.isElderly() ? 0.12 : 0) + (1 - pat.lusitropy) * 0.15;
  pat.atrialKick = approach(pat.atrialKick, kick, dt, 2 * S);
  const kickFactor = 1 - (0.22 + stiff) * (1 - pat.atrialKick);

  // ---- Valve dynamics (nonlinear-resistor state: regurgitant fraction + stenosis) ----
  updateValves(pat, dt);

  // ---- End-diastolic volume: nonlinear (saturating) preload recruitment ----
  const fillingP = Math.max(0, pat.cvp - (pat.cardiacExternalP ?? pat.intrathoracicP)); // transmural filling pressure
  const bodyScale = pat._bodyScale || 1;
  let diastStiff = 1;                                  // ventricular diastStiffening (diastolic dysfunction)
  if (pat.ageProfile.isElderly()) diastStiff = Math.max(0.75, 1 - (pat.ageProfile.age - 65) * 0.008);
  // chamberRemodeling is a GENERAL handle on ventricular chamber SIZE, separate
  // from body size (bodyScale) and from stiffness (diastStiff). Eccentric
  // remodeling — pregnancy's volume-overload hypertrophy, dilated
  // cardiomyopathy, athlete's heart — enlarges the cavity so the ventricle
  // accepts a larger end-diastolic volume at the SAME filling pressure. 1 = normal.
  const remodel = clamp(pat.chamberRemodeling ?? 1, 0.6, 1.8);
  const EDVmax = 200 * bodyScale * remodel * diastStiff; // chamber size scales with body size
  const kf = 10.0;
  let edv = EDVmax * (1 - Math.exp(-fillingP / kf)) * fillMod * kickFactor;
  // Mitral stenosis: the valve itself is now the dominant resistance to LV
  // filling, so effective filling pressure transmission is throttled
  // independently of CVP/venous return.
  edv *= (1 - pat.mitralStenosisSeverity * 0.55);
  // Aortic regurgitation: diastolic backflow from the aorta refills the LV
  // through the incompetent valve on top of normal mitral filling — the
  // hallmark volume overload of chronic AI.
  edv += pat.aorticRegurgFrac * 60 * bodyScale;
  pat.edv = clamp(edv, 3 * bodyScale, 320 * bodyScale * remodel);
  // Stamp the body scale this EDV was computed at, so next tick's updateValves
  // can tell whether the value it is about to compare against a body-scaled
  // dilation threshold was actually produced at that same scale (see the
  // stale-scale guard there). Costs one field and removes a whole class of
  // first-tick artifact.
  pat._edvScale = bodyScale;

  // ---- Contractility as a chased state variable ----
  updateContractility(pat, dt);

  // ---- Ventricular-arterial coupling (ESPVR / Ea) ----
  // Systemic vascular resistance from vascular tone (this is the *resistance*,
  // afterload proper comes from Ea below).
  // Vascular tone term. The constant is fixed by an IDENTITY, not chosen: at the
  // baroreflex's neutral operating point the patient is by definition at rest,
  // so systemic vascular resistance must equal baseSVR exactly. Resting
  // sympathetic output is sympTarget = 0.25 at F = F0 (see updateAutonomic),
  // giving alphaTone = 0.9 * 0.25 = 0.225, so the constant must satisfy
  // k + 2*0.225 = 1, i.e. k = 0.55. The previous 0.7 left the multiplier at
  // 1.101 with the reflex neutral — the patient was tonically ~10%
  // vasoconstricted relative to the baseSVR that DEFINES their rest, which
  // raised MAP, lengthened the Windkessel time constant (tau = R*C) and so held
  // diastolic pressure up (DBP 94 against a documented 60-85) and narrowed pulse
  // pressure (29 against 35-50).
  // In sepsis the 0.45 vasoplegia factor applies to the patient's own tone, but an
  // exogenous pressor still acts on the vasculature that remains (receptor
  // responsiveness is reduced, not erased): its alpha contribution is attenuated
  // by SEPSIS_PRESSOR_GAIN instead of the full 0.45. Measured: with the whole tone
  // scaled by 0.45, norepinephrine 0.1 mcg/kg/min raised septic MAP only ~5 mmHg
  // against a clinical 8-11 (healthy +12 to 14).
  const _alphaT = clamp(pat.alphaTone, 0, 3);
  const _alphaD = pat.riskFactors.sepsis ? Math.min(_alphaT, Math.max(0, (pat._alphaDrug || 0) * (1 - 0.7 * (pat.alphaResistance || 0)) + (pat._v1Drug || 0))) : 0;
  const _toneTerm = pat.riskFactors.sepsis
    ? 0.45 * (0.55 + (_alphaT - _alphaD) * 2.0) + SEPSIS_PRESSOR_GAIN * _alphaD * 2.0
    : (0.55 + _alphaT * 2.0);
  pat.svr = pat.baseSVR * _toneTerm
                        * (1 - clamp(pat.vasodilation || 0, 0, 0.9) * 0.6)
                        * (pat.riskFactors.spinalShock ? 0.55 : 1)
                        // AORTIC OCCLUSION (REBOA). Occluding the aorta removes
                        // that fraction of the systemic bed from the circuit.
                        // Resistances in parallel: excluding fraction f of the
                        // conductance multiplies resistance by 1/(1-f). At f =
                        // 0.55 (a supraceliac balloon, which excludes the
                        // pelvis and both legs) that is ~2.2x — but the pressure
                        // rise is still proportional to the flow being ejected
                        // into it, so an empty patient gains far less. Occlusion
                        // fractions near 0.85 drove SVR into the model's global
                        // 4000 clamp, which is above any published figure.
                        / Math.max(0.15, 1 - clamp(pat.aorticOcclusion || 0, 0, 0.9));
  // BLOOD VISCOSITY -> VASCULAR RESISTANCE (V2-15/16 of the V2 physiology
  // queue). Poiseuille's law makes resistance directly proportional to
  // viscosity, and whole-blood viscosity is dominated by hematocrit through
  // RBC-RBC crowding — a real, supralinear relationship (steep above ~50%
  // Hct, clinical "sludging"), not a flat one. Anchored on Guyton & Hall's
  // own relative-viscosity-vs-Hct teaching curve: roughly a DOUBLING from a
  // normal ~45% Hct to a polycythemic ~60% (a +15-point rise), and roughly
  // a THIRD-TO-HALF from 45% down to a moderately anemic ~20% (a -25-point
  // fall). Referenced to THIS patient's own age/sex-scaled normal Hct, not
  // a flat 45%, so a pediatric or elderly-female patient's own reference
  // point is respected.
  //
  // A pure exponential fit through the +15-point anchor (tried first,
  // MEASURED and found wrong) is too steep at SMALL, clinically common Hct
  // deviations — the ones this engine actually produces most often, not the
  // extreme anchor points. Caught by the regression suite itself, not
  // guessed at: crushSyndrome's own real hemoconcentration (third-spacing
  // from the injury raises hct by only ~0.03 over its presenting baseline)
  // pushed the exponential's SVR multiplier to ~1.15-1.20x, which raised
  // diastolic pressure enough to measurably widen the delta-pressure margin
  // compartment syndrome's own occlusion mechanism (item 74, Phase 3) needs
  // to overcome — the mechanismWiring.mjs time-course assertion (csOccl>0.5
  // by 5h) went from 0.859 to 0.369.
  //
  // A first cubic fit (linear slope 1.5) cut that gap substantially but not
  // all the way — MEASURED to still leave the 10h limbInjury leg of the same
  // assertion short (0.429 against a needed 0.5), because compartment
  // occlusion accrues over hours, so even a ~5% SVR/DBP nudge sustained the
  // whole time compounds into a real, if modest, delay. Rather than treat
  // that residual gap as acceptable collateral damage to an unrelated,
  // already-calibrated mechanism, the linear slope was lowered further (1.5
  // -> 1.0) and the cubic coefficients re-solved against the SAME two
  // literature anchors — ~2.0x at +15 Hct points, ~0.35x at -25 points — so
  // a realistic few-point hemoconcentration now moves SVR by under 4%,
  // gentler still, while the anchor points themselves are unchanged.
  // Re-verified against the crush-syndrome case after this second pass:
  // csOccl.legL clears 0.5 by 5h and limbInjury.legL clears 0.5 by 10h.
  //
  // Clamped to [0.4, 3] so neither a fully exsanguinated patient (hct -> 0,
  // where real viscosity floors near plasma's own ~0.4-0.5x whole-blood
  // value, not zero) nor an extreme polycythemic outlier can blow past the
  // svr clamp two lines below in a way that would swallow every other term.
  const hctRef = pat.ageProfile && pat.ageProfile.normalHct ? pat.ageProfile.normalHct() : 0.45;
  const hctDelta = (pat.hct ?? hctRef) - hctRef;
  const viscosityCubic = hctDelta >= 0 ? 252 : 25.6; // solved so +0.15 -> 2.0x, -0.25 -> ~0.35x
  const viscosityFactor = clamp(1 + 1.0 * hctDelta + viscosityCubic * Math.pow(hctDelta, 3), 0.4, 3);
  pat.svr *= viscosityFactor;
  pat.svr = clamp(pat.svr, 250, Math.max(4000, pat.baseSVR * 3.2));
  const R = pat.svr / 80;                       // mmHg*min/L

  // ---- Pressure-dependent (exponential) arterial stiffening ----
  // Real arteries are not linearly compliant: wall collagen recruitment makes
  // them progressively stiffer as distending pressure rises. Model working
  // compliance as the age/pathology ceiling (arterialComplianceBase) decaying
  // exponentially above the patient's own baseline MAP, relaxing back toward
  // the ceiling at low pressure (post-hemorrhage/vasodilated). Driven off last
  // tick's MAP (this tick's MAP is what we're about to compute), and smoothed
  // with approach() so pressure noise doesn't chatter afterload.
  const complianceRef = pat.mapBaseline || 90;
  const stiffK = 0.012; // /mmHg — tuned so +40 mmHg above baseline roughly halves compliance
  const targetCompliance = pat.arterialComplianceBase *
    Math.exp(-stiffK * Math.max(0, pat.map - complianceRef));
  pat.arterialCompliance = clamp(
    approach(pat.arterialCompliance, targetCompliance, dt, 8 * S),
    0.15, pat.arterialComplianceBase);

  const V0 = 10 * bodyScale;                     // unstressed ventricular volume (size-scaled)
  // End-systolic elastance scales inversely with chamber size: a small (neonatal)
  // ventricle is far stiffer per mL, so Ees is high — this MUST track the way Ea
  // rises for small bodies, otherwise Ees/Ea collapses and EF is wrong.
  pat.ees = clamp(2.3 * pat.contractility / bodyScale, 0.2, 8 / bodyScale);
  // Effective arterial elastance scales with resistance and heart rate, and with
  // arterial stiffness (low compliance -> high Ea): stiff-artery elderly get
  // disproportionate systolic pressure for the same stroke volume.
  pat.ea = clamp(pat.svr * 0.000933 * (0.6 + 0.4 * effHr / 75) / Math.max(0.4, pat.arterialCompliance),
                 0.2, 12);

  // Aortic stenosis: a fixed structural restriction the ventricle must eject
  // against, on top of arterial afterload proper — modeled as added
  // effective arterial elastance (the same PV-loop consequence a stenotic
  // orifice produces: more LV pressure needed for the same forward flow).
  const eaEff = pat.ea * (1 + pat.aorticStenosisSeverity * 2.5);

  // Coupled stroke volume: the analytic end-systolic equilibrium
  // SV = Ees(EDV−V0)/(Ees+Ea). This used to be cross-checked, every tick,
  // against an INTEGRATED double-Hill time-varying-elastance beat
  // (`cardiovascular_ode.js`'s `solveBeat`) whose quasi-static ejection always
  // landed on exactly this same equilibrium — so removing that integration
  // (Phase 0, legacy-solver removal, queue item 1) changes nothing about the
  // value, only how it's derived. This value is itself only a one-tick
  // bootstrap: it is unconditionally overwritten by the authoritative
  // full-loop ODE below once `pat.fourChamberLoop` exists (every tick after
  // the first — see the publish block later in this function). The real
  // per-beat PV-loop trace the old integrated beat also produced, for the
  // arterial-line teaching display, now comes from the full loop's own
  // substep integration instead (`pat.pvLoop`, set in `updateFullLoopODE`) —
  // a real trace from the solver that's authoritative for these vitals
  // anyway, not a second, parallel one.
  const analyticSV = pat.ees * (pat.edv - V0) / (pat.ees + eaEff);
  let sv = analyticSV;
  // Descending limb: excessive preload raises wall stress and hurts efficiency.
  const remodelSv = clamp(pat.chamberRemodeling ?? 1, 0.6, 1.8);
  if (pat.edv > 200 * bodyScale * remodelSv) sv *= Math.max(0.6, 1 - (pat.edv - 200 * bodyScale * remodelSv) * 0.004 / bodyScale);
  // Total volume the ventricle moves this beat, before subtracting what goes
  // the wrong way through incompetent valves.
  const totalEjection = clamp(sv, 0, 220);
  // Mitral regurgitation: part of ejection goes backward into the LA instead
  // of forward into the aorta. Aortic regurgitation: part of what reaches the
  // aorta immediately runs back into the LV in diastole rather than reaching
  // the periphery. Both are lost from FORWARD (net systemic) stroke volume,
  // which is what perfuses the body and is what pat.sv has always meant here.
  pat.sv = clamp(totalEjection * (1 - pat.mitralRegurgFrac) * (1 - pat.aorticRegurgFrac * 0.6), 0, 200);
  pat.esv = Math.max(0, pat.edv - totalEjection);
  pat.ef = pat.edv > 0 ? clamp(totalEjection / pat.edv, 0, 0.95) : 0;

  // ---- Cardiac output ----
  pat.co = (pat.hr * pat.sv) / 1000;

  // ---- Right-atrial volume balance makes CVP a true state ----
  // RA fills when venous return exceeds what the ventricle ejects.
  const dCvp = (pat.vr - pat.co) * 1.2 / (pat._bodyScale || 1);
  pat.cvp = clamp(pat.cvp + dCvp * dt, -2, 28);

  // ---- Arterial pressures via a lumped Windkessel + flow inertance ----
  // Blood has momentum: aortic outflow cannot jump instantaneously to a new
  // value just because CO changed this tick (valve rupture, VF onset, aortic
  // cross-clamp, sudden massive hemorrhage). The true inertial term
  // L*dQ/dt = P_up - P_down - R*Q relaxes on a ~20-40ms time constant — far
  // faster than this model's 3s tick — so integrating it literally would just
  // reproduce Q=CO every step at enormous cost. Instead we carry qAo as a
  // genuine lagged state, chased toward the instantaneous target with a time
  // constant sized to this simulator's tick resolution: the same momentum
  // effect (no discontinuous flow jumps), expressed honestly at the temporal
  // grain the model actually resolves rather than a false millisecond-level
  // precision. Chased with the same stable exponential form used elsewhere so
  // it's unconditionally stable regardless of tau vs dt.
  const AORTIC_INERTANCE_TAU = 0.025; // minutes (~1.5s) — momentum time constant at model resolution
  pat.qAo = approach(pat.qAo ?? pat.co, pat.co, dt, AORTIC_INERTANCE_TAU);
  pat.map = clamp(pat.qAo * R + pat.cvp, 0, 260);
  const ejectVel = 1 + 0.15 * (pat.contractility - 1);
  // Pulse pressure = stroke volume / arterial compliance. Arterial compliance
  // scales with body size (a neonate's aorta holds far less volume per mmHg), so
  // the same-shaped SV pulse produces an age-appropriate PP rather than a
  // vanishingly narrow one.
  pat.pp = clamp(pat.sv / (Math.max(0.3, pat.arterialCompliance) * bodyScale * 1.75) * ejectVel, 5, 160);
  pat.sbp = clamp(pat.map + pat.pp * 2 / 3, 0, 300);
  // Aortic regurgitation: continuous diastolic runoff back into the LV drops
  // diastolic pressure directly (the classic wide-pulse-pressure/"water-hammer"
  // pulse), on top of whatever the SV/compliance term already gives.
  pat.dbp = clamp(pat.map - pat.pp / 3 - pat.aorticRegurgFrac * 25, 0, 250);

  // ---- Myocardial oxygen balance -> ATP (feeds contractility next tick) ----
  // Reads the INSTANTANEOUS analytic sv/esv/map/dbp just computed above, not
  // the full loop's EMA-smoothed (~4s time constant) published vitals below —
  // measured and reverted (Phase 0, legacy-solver removal, queue item 1) after
  // trying the opposite order first. Moving this call to read the full loop's
  // OWN published sv/esv/map (post-publish) seemed like the more "authoritative"
  // choice, but it broke the acs/nstemi/unstableAngina wavefront-necrosis
  // mechanism outright: myocardial oxygen DEMAND (pva = strokeWork + potentialE,
  // both direct functions of sv/esv/map) needs the true beat-to-beat value to
  // track a developing ischemic process, not a several-second smoothed monitor
  // reading built specifically to damp reporting jitter (see the tauReport
  // comment in updateFullLoopODE). MEASURED, A/B, same probe, same 1920s
  // horizon: reading the smoothed value left `acs` at ef 0.523/atp 0.975/no
  // infarct, against the reading-the-instantaneous-value (this) result of ef
  // 0.265/atp 0.862/contractilityFactor 0.941 (a real evolving infarct) — the
  // smoothed signal lags the rising coronaryStenosis/falling-contractility
  // spiral just enough that demand never registers the deficit, so ATP never
  // crosses the 0.62 necrosis threshold these conditions are calibrated
  // against. This is genuinely an execution-order dependency (not a field-name
  // one), and it must stay resolved THIS way — reverting the call position
  // back to here, before updateRightHeart/updateFullLoopODE, not the other way.
  updateMyocardialOxygen(pat, dt);

  // ---- Right ventricle + pulmonary circulation (analytic bootstrap + the
  // real, non-solveBeat pressure-flow algebra for paSys/paDia/pvrWood) ----
  updateRightHeart(pat);

  // ---- Full coupled four-chamber ODE loop (Task 1) ----
  // This call evolves the 16-state coupled loop (cardiovascular_ode_full.js)
  // forward by the real elapsed time using the SAME instantaneous elastance/
  // resistance/valve inputs the lumped model just computed, and publishes its
  // output (true four-chamber pressures, all four valve trajectories, live
  // EDV/ESV/SV/CO, a live mass-conservation check) onto pat.fourChamberLoop
  // and pat._full*. See updateFullLoopODE() below for why it is safe to run
  // continuously and how it stays in sync with hemorrhage/resuscitation
  // changing pat.totalBloodVol.
  updateFullLoopODE(pat, dt);

  // ---- Publish authoritative vitals (Task 1) ----
  // Unless the full loop has been explicitly opted out of
  // (FULL_ODE_AUTHORITATIVE=false or pat.useFullODE=false), republish
  // SBP/DBP/MAP/CO/SV/EDV/ESV/EF from it — the analytic values computed
  // above are then a one-tick bootstrap only (see FULL_ODE_AUTHORITATIVE's
  // own comment). pat.hr is untouched (external input to both, not an output
  // of either). pat.cvp/paSys/paDia stay on the right-heart pressure-flow
  // model — the full loop's RV/PA side isn't bidirectionally coupled back
  // into systemic preload yet (see Task 1 completion report; queue item 1's
  // Phase 6 is the planned fix).
  const useFullODE = pat.useFullODE ?? FULL_ODE_AUTHORITATIVE;
  if (useFullODE && pat._fullSv != null && pat.fourChamberLoop) {
    pat.sv = pat._fullSv;
    pat.edv = pat._fullEdv;
    pat.esv = pat._fullEsv;
    pat.ef = pat._fullEf;
    pat.co = pat._fullCo;
    pat.map = pat.fourChamberLoop.PaoMean;
    pat.sbp = pat.fourChamberLoop.PaoSys;
    pat.dbp = pat.fourChamberLoop.PaoDia;
    pat.pp = Math.max(1, pat.sbp - pat.dbp);

    // PACEMAKER SYNDROME / AV DISSOCIATION (queue item 1, Phase 3). Applied
    // AFTER the full loop's own publish, as a direct compliance-scaled
    // discount on the AUTHORITATIVE SV/EDV — not by flattening EmaxLA/EmaxRA
    // inside the ODE itself, which was tried and MEASURED WORSE (see the
    // "INVESTIGATED AND REJECTED" comment at buildParams above): in a
    // compressed diastolic window, removing the atrial-elastance spike just
    // makes the loop's own mass conservation raise mean LA pressure to push
    // the same volume through the mitral valve, netting MORE filling, not
    // less. That result was real but incomplete — the missing piece is a
    // genuine external chamber-interaction/compliance penalty, not a change
    // to atrial contractile mechanics, which is exactly what this applies.
    //
    // Scoped narrowly to genuinely AV-DISSOCIATED presentations (complete
    // heart block's ventricular escape, and ventricular pacing without
    // atrial capture) — NOT the broader NO_ATRIAL_KICK list (afib/flutter/
    // VT/VF/torsades), which already have their own separately-measured,
    // separately-verified CO mechanics (DYSSYNC, the sysFrac fix, Phase 1's
    // rate-class hazard) that this must not double-discount.
    const avDissociated = pat.rhythm === "chb" || (pat.pacedCapture || 0) > 0.5;
    pat._pmAvDissoc = approach(pat._pmAvDissoc ?? 0, avDissociated ? 1 : 0, dt, 2 * S);
    if (pat._pmAvDissoc > 0.001) {
      // Loss of atrial kick removes 15-50% of CO depending on ventricular
      // compliance (MOST/PASE literature, cited in the queue item's own
      // text) — reuses TWO already-existing stiffness handles rather than
      // inventing a third: `stiff` (the same acute elderly/lusitropy term
      // the lumped bootstrap's own kickFactor already uses, line ~811) and
      // `pat.lvHypertrophy` (the chronic diastolic-remodeling state, 0 for
      // every acute patient, queue item 25) — a stiffer ventricle depends
      // more on the atrial kick for late-diastolic filling, so loses more
      // when it's lost.
      // Base floor is the literature's OWN 15% figure (a young, compliant
      // ventricle), not the 0.22 this comment's first draft reused from the
      // lumped bootstrap's own unrelated kickFactor calibration — that
      // extra 7 points, stacked with this scenario's own already-reduced
      // paced-rate diastolic filling time, pushed a routine elderly Mobitz
      // II presentation's pacing response net negative (measured: CO
      // 3.20->2.75), breaking an already-calibrated "pacing helps" teaching
      // scenario that has no reason to be a pacemaker-syndrome case. 15%
      // floor + up to 35 points of stiffness reaches the same 50% ceiling
      // the literature states for the worst (most stiffened) ventricles,
      // just without inflating the floor for everyone else.
      const pmStiff = clamp(stiff + (pat.lvHypertrophy || 0) * 0.35, 0, 0.35);
      const edvLossFrac = clamp(0.15 + pmStiff, 0.15, 0.50) * pat._pmAvDissoc;
      const coBefore = pat.co;
      // A FIXED ABSOLUTE volume loss (rather than a fixed FRACTION) was tried
      // first and found to be rate-dependent in the wrong direction: at a
      // faster rate (e.g. a paced ventricle), baseline SV is already smaller
      // (shorter diastolic filling time), so subtracting the SAME absolute
      // volume from both EDV and SV punished the higher-rate case far more
      // than the literature's own 15-50% figure intends — measured against
      // mechanismWiring.mjs's own thirdDegreeAVBlock pacing assertion, this
      // made a paced ventricle's SV fall by ~58% while an unpaced one fell
      // by only ~43% for the identical stiffness/dissociation inputs, purely
      // from the rate difference. Fixed by holding EJECTION FRACTION
      // constant and scaling EDV/SV by the SAME percentage instead — a true
      // rate-independent 15-50% CO loss, matching "loss of atrial kick
      // removes 15-50% of CO" as a percentage, not an absolute volume.
      const efBefore = pat.ef;
      pat.edv = Math.max(0, pat.edv * (1 - edvLossFrac));
      pat.sv = pat.edv * efBefore;
      pat.esv = Math.max(0, pat.edv - pat.sv);
      pat.ef = efBefore;
      pat.co = (pat.hr * pat.sv) / 1000;
      // Keep BP=CO*TPR from silently breaking: this SV/CO cut happens after
      // the ODE has already set its own MAP/SBP/DBP from its own internal
      // pressure trace, so scale pressure by the same fractional CO change
      // rather than leaving output and pressure inconsistent. A coarse,
      // explicitly-scoped approximation — the real systolic/diastolic split
      // this produces (a genuine chamber-interaction/venous-pressure-backup
      // effect) is Phase 6's job once the shared pericardial/`P_peri` term
      // exists; until then, proportional scaling is the honest stand-in.
      if (coBefore > 0.001) {
        const coRatio = clamp(pat.co / coBefore, 0.3, 1);
        pat.map = clamp(pat.map * coRatio, 0, 260);
        pat.sbp = clamp(pat.sbp * coRatio, 0, 300);
        pat.dbp = clamp(pat.dbp * coRatio, 0, 260);
        pat.pp = Math.max(1, pat.sbp - pat.dbp);
      }
    }
  }
  // QUEUE ITEM V2-25 — republish RV EDV/ESV/SV/EF from the SAME authoritative,
  // PVR-coupled ODE state the LV side already republishes from (see the long
  // comment at the vrvMax/vrvMin windowed-peak tracking above for why the
  // legacy updateRightHeart() estimate cannot show real afterload-driven RV
  // dilation). Single authoritative owner, same rule the LV block above
  // already follows: once the full loop has a real value, it wins.
  if (useFullODE && pat._fullRvEdv != null && pat.fourChamberLoop) {
    pat.rvEdv = pat._fullRvEdv;
    pat.rvEsv = pat._fullRvEsv;
    pat.rvSv = pat._fullRvSv;
    pat.rvEf = pat._fullRvEf;
  }
}

// Cap on how much ODE-time we integrate in a single call, no matter how long
// the caller's dt is. A fast-forwarded or paused-then-resumed tick could
// otherwise ask this stiff, valve-gated system for thousands of beats of
// adaptive integration in one go; physiologically the loop has settled into
// its new limit cycle long before this many seconds of beats anyway, so the
// cap costs no accuracy in the cases that matter and bounds worst-case cost
// in the cases that don't.
const FULL_ODE_MAX_SEC_PER_TICK = 20;

// updateFullLoopODE — advance the coupled 16-state loop from
// cardiovascular_ode_full.js by this tick's elapsed time, translating the
// lumped model's current physiology into the full solver's parameters so the
// two stay consistent, and publish the result. State (pat._fullX, pat._fullT)
// persists across ticks so this is genuine continuous integration, not a
// from-scratch limit-cycle solve every call.
function updateFullLoopODE(pat, dt) {
  // Mechanical activation: in a non-perfusing rhythm the ventricle produces no
  // organized ejection, so its effective elastance must collapse — otherwise
  // the loop keeps beating and reports an arterial pressure (~170/… seen in
  // fbao/choking40) with zero real output, which is impossible. VF = fibrillation
  // (no coordinated contraction), asystole = no depolarisation, PEA = organized
  // electrical activity with no effective mechanical coupling. Scaling EmaxLV/RV
  // toward zero makes the ventricles stop developing systolic pressure; aortic
  // pressure then bleeds off through the systemic runoff to mean systemic filling
  // pressure over a few seconds — the correct arrest hemodynamics. (Legacy gets
  // this for free via hr=0 → CO=0; the full loop needs it stated explicitly.)
  const rhythm = pat.rhythm || "sinus";
  let mechAct = 1;
  if (rhythm === "asystole") mechAct = 0;
  else if (rhythm === "VF") mechAct = 0;
  else if (rhythm === "PEA") mechAct = 0.05;   // token residual, effectively pulseless
  // CHEST COMPRESSIONS AS AN EXTERNAL PUMP.
  // Compressions squeeze the ventricles directly between sternum and spine
  // (the cardiac-pump mechanism), producing genuine forward stroke volume in a
  // heart that has no electrical activity of its own. Well-performed CPR
  // generates roughly a quarter to a third of native cardiac output — enough to
  // sustain some coronary and cerebral perfusion, and not enough to be
  // survivable indefinitely.
  //
  // Modelling this as an external mechanical activation (rather than as the
  // former fx:{sbp:32} offset) means the resulting pressure, cardiac output,
  // oxygen delivery and end-tidal CO2 all fall out of the same circulation every
  // other state uses. In particular EtCO2 now tracks compression-generated flow
  // through the alveolar dead-space model, which is the physiological basis for
  // using capnography to judge CPR quality and to recognise ROSC.
  const cpr = clamp(pat.cprActive || 0, 0, 1);
  // NOTE (audited this session, queue item 42): compression QUALITY already
  // reaches this floor through pat.cprActive itself, not through a second
  // multiplier here. pk.js's "cpr" dose handler (see its own comment there)
  // scales cprActive by intensity*freshness*cq, where cq is exactly
  // pat.cprQuality (0-1, the real depth-score*rate-score composite
  // CprMinigame.jsx computes from actual player input) whenever a scored
  // compression happened in the last 30s, and freshness is a real ~12s-tau
  // decay from the last CPR dose (Berg et al., Circulation 2001; Kern et
  // al., Circulation 2002 — coronary/cerebral perfusion pressure collapses
  // within seconds of compressions stopping). So poor depth/rate technique
  // already produces a genuinely smaller cprActive, which this 0.17*cpr
  // floor already tracks proportionally — a second multiplier here would
  // double-count the same signal. compressionRate stays fixed at the
  // guideline-nominal 110 for cycle/EtCO2 timing only, since actual rate is
  // already folded into cprQuality above, not a separate live variable this
  // engine tracks as its own timing signal.
  if (cpr > 0 && mechAct < 0.17 * cpr) mechAct = 0.17 * cpr;   // ~25-30% of native CO
  pat._fullMechAct = approach(pat._fullMechAct ?? mechAct, mechAct, dt, 0.02); // ~1s onset/recovery
  const effMech = pat._fullMechAct;

  // VENTRICULAR DYSSYNCHRONY (missing mechanism, added here). When the ventricle
  // is activated from an ectopic ventricular focus instead of through the
  // His-Purkinje system, depolarisation spreads slowly muscle-to-muscle: segments
  // contract against each other rather than together, so a substantial fraction
  // of shortening is wasted and EFFECTIVE systolic elastance falls even though
  // intrinsic myocyte contractility is unchanged. This is why monomorphic VT at a
  // rate that should still perfuse produces far less stroke work than sinus at the
  // same rate, and it is the main reason the full loop was over-estimating output
  // in the wide-complex scenarios (choking40/fbao VT). Supraventricular rhythms
  // (sinus/SVT/AF/junctional) conduct normally → synchronous → factor 1.
  // Torsades reuses VT's factor DELIBERATELY rather than getting a new one.
  // Polymorphic activation has no consistent wavefront at all, so it cannot be
  // more coordinated than monomorphic VT; taking VT's already-fitted 0.6 means
  // the cardiac-output collapse in torsades comes from the two things that ARE
  // documented — a rate of 200-250 and the loss of atrial kick — instead of
  // from a coefficient invented to produce the answer.
  const DYSSYNC = { VT: 0.6, torsades: 0.6, wideQRS: 0.78, chb: 0.82 };  // ventricular escape in CHB is also wide
  // A transcutaneously paced beat originates in ventricular myocardium under the
  // pad, not in the His-Purkinje system, so it spreads muscle-to-muscle exactly
  // as a ventricular escape beat does and is dyssynchronous for the same reason.
  // This is the model's expression of "electrical capture is not mechanical
  // capture": capturing at 70 does NOT restore the output of sinus at 70.
  const rawSync = (pat.pacedCapture || 0) > 0.5
    ? Math.min(DYSSYNC[rhythm] ?? 1, 0.82)
    : (DYSSYNC[rhythm] ?? 1);
  pat._fullSync = approach(pat._fullSync ?? rawSync, rawSync, dt, 0.05); // ~3s transition
  const syncFactor = pat._fullSync;
  // Cycle length: during VF/asystole the "rate" is meaningless (mechAct≈0 means
  // no output regardless), so fall back to a nominal rate for timing only — but
  // never let hr=0 read as 75 via `||`, which was masking the arrest entirely.
  // With no intrinsic rhythm, the compression rate sets the cycle: guidelines
  // specify 100-120/min, and that is the rate at which stroke volume is being
  // generated.
  const compressionRate = 110;
  // Recorded so downstream output calculations use the MECHANICAL rate.
  const effHr = clamp(
    pat.hr > 0 ? pat.hr
      : (cpr > 0 ? compressionRate
        : (rhythm === "asystole" || rhythm === "VF" ? 40 : 75)), 20, 250);
  // Mechanical ejection rate: what the loop integrates and what output uses.
  pat._fullEffHr = (pat.hr > 0 || cpr > 0) ? effHr : 0;
  // BUG found during Task 1 regression: buildParams()'s chamber V0s, vascular
  // compliances, and unstressed volumes are adult constants (e.g. VuSys=1850,
  // VuAo=90 mL) with no body-size scaling, unlike every other volume in this
  // file (V0 = 10*bodyScale, EDVmax = 200*bodyScale, etc.). For a pediatric
  // patient a few kilograms in size, total blood volume can be well under the
  // sum of those fixed unstressed volumes alone — the loop's own VSys floor
  // (Math.max(p.VuSys, ...) in the resync below) then eats the entire blood
  // volume, every other compartment (LA in particular) collapses to its V0
  // dead volume, the mitral valve never gets a filling gradient to open
  // against, and Pao decays to ~0 and stays there — confirmed by tracing
  // pediatricDrowning: fullX[IDX.VLA] pinned exactly at V0LA within 1 minute.
  // Fix: scale every volume-dimensioned default the same way the rest of the
  // engine already scales chamber size, so a small patient gets a small
  // (proportionally identical) closed loop instead of an adult-sized one its
  // real blood volume can never fill.
  const bodyScale = pat._bodyScale || 1;
  // IMPORTANT: pat.ees / pat.rvEes / pat.svr live in the lumped model's own
  // absolute calibration (e.g. ees = 2.3*contractility/bodyScale at rest),
  // which is NOT the same absolute scale this solver's Emax/Rsys were
  // numerically tuned against (see cardiovascular_ode_full.js NOTES). Feeding
  // those values in directly was tried first and pushed the loop onto a
  // different, badly-calibrated limit cycle (~200 mmHg aortic pressure) even
  // though volume stayed perfectly conserved — not numerical instability, a
  // calibration mismatch. Fixed by scaling this solver's own validated
  // defaults by the RATIO of the lumped model's current value to ITS OWN
  // resting baseline, so at physiological rest every parameter here equals
  // exactly the tuned default, and only moves proportionally when the lumped
  // model's physiology (contractility, afterload, lusitropy, PVR) moves.
  const restEes = 2.3, restRvEes = 1.15, restPvr = 1.6;
  // Normalize against the patient's ANATOMICAL resting resistance, not their
  // live baseSVR.
  //
  // WHAT WAS WRONG: this ratio used pat.baseSVR as its own denominator — the
  // very field a state changes in order to model altered resting vascular tone.
  // The change was divided straight back out, and this solver, which is
  // authoritative for SV/EDV/ESV/EF/CO/MAP/SBP/DBP (see the publish block in
  // updateCardiovascular), never saw it. Measured at term pregnancy, where
  // baseSVR is cut 27% (1161 -> 848): rawRsysRatio came out 1.042, against
  // 1.049 for the same woman non-pregnant. The loop could not tell a vasodilated
  // pregnant circulation from a normal one.
  //
  // ageProfile.baseSVR() is a pure function of age, sex and BSA that no
  // condition writes, so it is a genuine fixed reference. A patient whose
  // resting tone is unmodified still yields exactly 1.0 and every tuned default
  // in this solver is untouched — verified bit-identical on non-pregnant
  // patients. A state that moves baseSVR now survives into the loop.
  //
  // The NUMERATOR was never the problem: pat.svr carries alphaTone and the
  // vascular drug modifiers, so conditions that vasodilate through TONE
  // (anaphylaxis, sepsis, neurogenic shock) always reached this loop correctly.
  // Only the resting BASELINE was cancelled — which is why pregnancy, the one
  // state in the tree that writes baseSVR, was the one that broke, and why
  // chronic hypertension was not modelable through baseSVR at all.
  //
  // MUST NOT SHIP ALONE. Landed by itself this fix drops term MAP to 72.7
  // against a documented 80-90 and the eclampsia limb stops firing
  // ("pregnant + severe hypertension seizes" went to 0% of ticks), because the
  // pregnant circulation was ALSO unable to raise its filling pressure — see the
  // bodyScaleBaselineL frame fix in obstetric.js. The two are one cluster: this
  // one removes a false afterload, that one restores the missing preload, and
  // only together do they land on documented physiology.
  const restSvr = (pat.ageProfile && pat.ageProfile.baseSVR
    ? pat.ageProfile.baseSVR() : (pat.baseSVR || 1200));
  // Size-INDEPENDENT inotropy ratio (≈1 at rest, whatever the body size). The
  // 1/bodyScale elastance scaling that a smaller heart needs is applied ONCE,
  // uniformly, via eScale below — not smuggled in here. pat.ees is already
  // body-scaled (2.3·contractility/bodyScale), so multiplying by bodyScale
  // recovers the pure contractility this ratio is meant to carry.
  const rawContractilityRatio = clamp((pat.ees || restEes) * bodyScale / restEes, 0.15, 4);
  const rawRvContractilityRatio = clamp((pat.rvEes || restRvEes) * bodyScale / restRvEes, 0.15, 4);
  const rawLusitropyRatio = 1 / clamp(pat.lusitropy || 1, 0.25, 2);
  const rawRsysRatio = clamp((pat.svr || restSvr) / restSvr, 0.2, 6);
  const rawRpulRatio = clamp((pat.pvrWood || restPvr) / restPvr, 0.2, 8);

  // This solver's valve-gated loop is far stiffer (beat-to-beat, ~1s scale)
  // than the lumped model's own tick-to-tick physiology, which carries
  // second-to-second noise (baroreflex chatter, the vitals display jitter,
  // etc.). Feeding that raw jitter straight into Emax/Rsys every 3-second tick
  // was tried first: even small (~10%) instantaneous perturbations, applied
  // repeatedly, drove a sustained upward drift in the coupled loop's operating
  // pressure well beyond what the same static perturbation produces in
  // isolation (verified: a steady +10%/+14% Emax/Rsys offset settles at a
  // reasonable 136/106, but feeding the live noisy signal directly settled
  // over 20 simulated minutes at ~170+ mmHg). This is rectified noise in a
  // nonlinear, switch-like (valve threshold) system, not a bug in either
  // model — so the fix is to give the ODE loop a SMOOTHED version of these
  // ratios (~15 s time constant: slower than one cardiac cycle so it doesn't
  // chase beat noise, faster than the minutes-scale physiology it's tracking
  // so real trends like a vasopressor infusion still show up promptly).
  const tauRatio = 0.25; // minutes (~15 s)
  pat._fullContrRatio = approach(pat._fullContrRatio ?? rawContractilityRatio, rawContractilityRatio, dt, tauRatio);
  pat._fullRvContrRatio = approach(pat._fullRvContrRatio ?? rawRvContractilityRatio, rawRvContractilityRatio, dt, tauRatio);
  pat._fullLusiRatio = approach(pat._fullLusiRatio ?? rawLusitropyRatio, rawLusitropyRatio, dt, tauRatio);
  pat._fullRsysRatio = approach(pat._fullRsysRatio ?? rawRsysRatio, rawRsysRatio, dt, tauRatio);
  pat._fullRpulRatio = approach(pat._fullRpulRatio ?? rawRpulRatio, rawRpulRatio, dt, tauRatio);
  const contractilityRatio = pat._fullContrRatio;
  const rvContractilityRatio = pat._fullRvContrRatio;
  const lusitropyRatio = pat._fullLusiRatio;

  // ELASTANCE / RESISTANCE / INERTANCE body-size scaling. Self-similar hydraulic
  // scaling (see Task 1 report): with volumes ∝ bodyScale, a consistent
  // circulation needs elastances, resistances and inertances ∝ 1/bodyScale.
  // Crucially L and R are scaled by the SAME factor, so the inertial time
  // constant L/R is body-size INVARIANT — that is what keeps the pediatric loop
  // as well-conditioned as the adult one (scaling R alone previously collapsed
  // L/R and produced stiff-ODE NaNs).
  //
  // PURE geometric similarity would also make PRESSURE size-invariant, i.e. give
  // a 3-year-old an adult MAP of ~93. Real pediatric physiology departs from that:
  // arterial pressure genuinely rises with age (normal MAP ~50 in a neonate, ~62
  // at age 3, ~93 in an adult). ageProfile.baselineMAP() is the engine's existing
  // age-appropriate norm and is already the baroreflex setpoint, so we reuse it
  // as the loop's pressure scale rather than inventing a second source of truth.
  // Generalised scaling with pressure factor π=pScale and size factor s=bodyScale:
  //   volumes ∝ s        elastances/resistances/inertances ∝ π/s
  //   compliances ∝ s/π  stiffK ∝ π/s²   edpA ∝ π   edpB ∝ 1/s
  // ⇒ pressures scale by π, flows by s. For any adult, pScale=1 and every factor
  // below is exactly 1, so the tuned adult baseline is mathematically untouched.
  const baseMAPadult = 93;
  const pScale = clamp((pat.ageProfile && pat.ageProfile.baselineMAP
    ? pat.ageProfile.baselineMAP() : baseMAPadult) / baseMAPadult, 0.4, 1.25);
  // TWO DISTINCT SIZE BASES.
  //   bodyScale  (~ blood volume, ~ weight) sizes the VASCULAR RESERVOIR: how
  //              much blood the circulation holds.
  //   cardiacScale (~ body surface area)    sizes the HEART: chamber volumes,
  //              elastances, and the flows they generate.
  // These are not the same function of body size, and conflating them was a real
  // error. Cardiac quantities are indexed to BSA in clinical practice precisely
  // because that is how they scale — end-diastolic volume index 60-75 mL/m2 and
  // cardiac index 2.5-4.0 L/min/m2 are near-constant across body size. Sizing the
  // chambers on blood volume instead made both drift with weight: measured EDVI
  // ran 54 / 65 / 79 mL/m2 and CI 2.17 / 2.62 / 3.18 across 50 / 70 / 100 kg,
  // i.e. a large adult received a heart too big for their body and a small adult
  // one too small. A 70 kg reference adult has BSA 1.82 ~ 1.9, so both scales are
  // ~1 there and the reference calibration is unchanged.
  const cardiacScale = clamp((pat.ageProfile.bsa || 1.9) / 1.9, 0.05, 2.0);
  pat._cardiacScale = cardiacScale;
  // Flows scale with BSA (cardiac index), pressures are set by pScale, so every
  // elastance, resistance and inertance scales as pScale/cardiacScale.
  const eScale = pScale / cardiacScale;   // E, R, L
  const cScale = bodyScale / pScale;      // vascular compliances (reservoir)
  // General eccentric-remodeling factor (see updateCardiovascular): enlarges the
  // cavity without changing body size or intrinsic stiffness.
  const remodel = clamp(pat.chamberRemodeling ?? 1, 0.6, 1.8);
  // General venous capacitance handle (see updateCardiovascular). The closed loop
  // must honor it too, otherwise a state that expands blood volume AND the
  // venous bed together (pregnancy) puts all the extra volume into the stressed
  // compartment here and reads as hypervolaemic hypertension.
  const venCapFull = clamp((pat.venousCapacitanceFactor ?? 1) * (pat.venousCapacitanceDrug ?? 1), 0.5, 2.0);
  // Eccentric remodeling has to reach the DIASTOLIC elastances, not just the
  // volume offsets. Chamber size entered this solver only through V0*, Vmax* and
  // the EDPVR excess (edpB/edpU0), and in the normal operating range the passive
  // filling curve is dominated by the LINEAR EminLV*(V - V0LV) term — which was
  // left at its unremodeled value. So a 1.22x remodeled ventricle gained just
  // 10*(1.22-1) = 2.2 mL of V0 and essentially none of the extra capacity the
  // block comment above (and the lumped model's own 200*remodel EDVmax) promises:
  // measured EDV moved 101.9 -> 102 mL at term pregnancy, i.e. chamberRemodeling
  // was very nearly a decorative field in the authoritative solver.
  //
  // The correct scaling is the same self-similar rule this file already applies
  // for body size: volumes proportional to the size factor, elastances inversely
  // proportional to it. Applied to the DIASTOLIC side only — Emin, V0, Vmax, the
  // EDPVR excess and the overfill knee — an enlarged chamber then accepts
  // proportionally more volume at the SAME filling pressure, which is what
  // eccentric remodeling physically is.
  //
  // Emax* is deliberately NOT scaled. End-systolic elastance is a property of the
  // myocardium, and in eccentric (volume-overload) hypertrophy wall mass grows
  // with the cavity, so systolic function is preserved rather than diluted — the
  // documented ejection fraction in normal term pregnancy is unchanged at 55-70%.
  // The lumped model encodes the same semantics: it multiplies EDVmax by remodel
  // and leaves contractility alone. Dividing Emax by remodel as well was measured
  // and rejected: it enlarges end-systolic volume in step with end-diastolic
  // volume, so stroke volume barely moves and ejection fraction FALLS (48.8% ->
  // 45.3% at term, against a documented 55-70%).
  //
  // Measured at term pregnancy (remodel 1.22): EDV 101.9 -> 107.0 mL, stroke
  // volume 49.7 -> 53.0 mL, cardiac output 4.59 -> 4.86 L/min, ejection fraction
  // 48.8% -> 49.5%. Directionally correct and no longer inert, but it does NOT
  // close the benchmark on its own. The MAP/afterload half of this cluster this
  // comment used to point at is resolved (see lesson 12 in the handoff and the
  // arterialComplianceFactor work below) — pregnancyBenchmark now reads
  // MAP 80.0 against documented 80-90, CVP 4.6 against 2-6, both PASS.
  //
  // QUEUE ITEM 10 / QUEUE ITEM 1's PHASE 4, RESOLVED (2026-09-30) — the
  // "still open" text this comment used to carry was checking the wrong
  // target, not a real engine deficiency. The 130-170 mL absolute LVEDV
  // figure the earlier sweep chased came from a DIFFERENT reference
  // population's absolute chamber size; this engine's own settled,
  // non-pregnant LVEDV for the pregnancyBenchmark fixture's own 65 kg/165 cm
  // woman is 99.6 mL (measured directly, a steady-state run, not a
  // construction snapshot) — already below that row's 130 mL floor before
  // any pregnancy mechanism runs at all, so the row was structurally
  // unsatisfiable by this patient regardless of how this file's own
  // mechanism performed. Chen et al.'s own cohort reports a comparable,
  // population-baseline-independent figure instead: the RELATIVE rise from
  // a woman's own pre-pregnancy LVEDV to term, ~87->100 mL, i.e. +12-17%.
  // MEASURED against that anchor, with the mechanism UNCHANGED from the
  // earlier sweep's own remodel=1.22: EDV rises 99.6 -> 114.4 mL, a +14.9%
  // rise — inside Chen's +12-17% band with NO coefficient tuning. The
  // contralateral RV shows the same proportional rise (94.6 -> 109.6 mL,
  // +15.9%, RV EF unchanged 58.4% -> 57.6%) — this session's own
  // `pregnancyBenchmark.mjs` now dumps both sides rather than asserting the
  // LV alone and assuming the RV followed (queue item 1's Phase 4 cross-
  // cutting requirement: a change to shared buildParams state must be
  // checked on both sides of the loop). PA mean pressure rises 15.0 -> 20.0
  // mmHg on the CO rise alone, with PVR unchanged (1.90 Wood units both
  // arms) — a real, honest, unasserted observation left for a future
  // session: this engine currently has no gestational pulmonary-vasodilation
  // term of its own, so a rising PA pressure is entirely a flow effect here,
  // not a modeled reduction in pulmonary vascular tone.
  // `pregnancyBenchmark.mjs`'s own EXPECTED table was updated in the same
  // batch to check this relative-rise quantity rather than the retired
  // absolute row — see that file's own comment for the full reasoning.
  // Still genuinely open, not closed by this finding: CO/CI/SV/MAP remain
  // LOW and SVR/Hct remain HIGH against `pregnancyBenchmark.mjs`'s own
  // documented bands (10/16 rows currently pass) — none of those four rows
  // is downstream of the EDV figure this comment is about (confirmed:
  // fixing the EDV-target mismatch moved only the EDV/SV-rise rows, not the
  // others), so they are a SEPARATE, unresolved gap, not fixed by this
  // finding and not attempted in this batch.
  // remodel = 1 for every patient who is not pregnant or eccentrically
  // remodeled, so every other patient is bit-identical (verified).
  const chamberScale = cardiacScale * remodel;
  const diastEScale = pScale / chamberScale;

  // INVESTIGATED AND REJECTED, recorded so it isn't retried blind: pat.atrialKick
  // (computed in the lumped section above, 0 for every AV-dissociated rhythm —
  // afib/VT/VF/junctional/chb/torsades — 1 otherwise) is consumed only by the
  // LUMPED model's own edv, which the publish block below immediately overwrites
  // with this solver's output. Wiring the same attenuation into EmaxLA/EmaxRA
  // here (flattening atrial elastance to its passive Emin for the whole cycle
  // instead of letting it spike during the atrial-systole window) was tried and
  // MEASURED WORSE, not better: VT CO went 5.67 -> 6.05 and torsades 5.38 -> 5.75
  // (i.e. it undid most of the sysFrac fix below). Cause, traced rather than
  // guessed: this solver's atrial kick is already a weak effect (EmaxLA/EminLA =
  // 0.18/0.15, only a 20% amplitude swing) confined to a brief end-of-diastole
  // window, so removing it does not meaningfully reduce the LATE-diastole flow
  // it was providing — instead the loop's own mass conservation raises mean LA
  // pressure to push the same total volume through the mitral valve over the
  // (short) available diastolic window, which nets MORE filling than the brief
  // kick spike gave when diastole is this compressed, not less. That is a real,
  // traced emergent behaviour of the coupled loop, not a coding bug — but it
  // means AV dissociation is not the missing lever here, at least not through
  // this route. Left unimplemented.
  const p = buildParams({
    HR: effHr,
    // Systolic time interval (Weissler): duration is nearly rate-independent,
    // so its FRACTION of the cycle must shrink as rate rises. Tsys ~ 0.16+0.20*T
    // gives ~0.32 s at HR 70 and ~0.23 s at HR 180, both matching measured
    // electromechanical systole; diastole takes whatever remains.
    // QUEUE ITEM 1 FIX. The 0.60 ceiling this used to carry was HIT at every
    // rate above ~155/min: at HR 180 the Weissler expression above asks for
    // sysFrac 0.680 and got 0.600 (diastole 0.133 s against 0.107 s wanted); at
    // HR 220 it asked for 0.787 and got 0.600 (diastole 0.109 s against 0.058 s
    // — 1.9x too much filling time). That handed fast rhythms far more diastolic
    // filling time than real electromechanical systole leaves them, so EDV only
    // fell 120 -> 101 mL between HR 94 and HR 220 and stroke volume dropped just
    // enough to cancel the rate rise: measured on this tree, sinus HR 94 CO
    // 6.01, VT HR 180 CO 6.00 MAP 102, torsades HR 220 CO 6.17 MAP 104 — a
    // sustained wide-complex tachycardia perfused normally, which defeated the
    // entire clinical point of the rhythm.
    //
    // The rail was never a physiological limit, just an unexamined round number.
    // The Weissler formula itself never lets sysFrac reach 1: Tsys asymptotes to
    // T (cycle length) only at HR 300 (Tsys=T when 0.16+0.20T=T, i.e. T=0.2s),
    // and effHr is bounded to 220 by pat.hr's own clamp (updateCardiovascular,
    // above) in every rate-driven path through this solver — the only path that
    // can exceed that is the CPR/asystole/VF fallback branch above, which uses
    // fixed constants (110/75/40), never the formula. So the formula's own
    // output is a safe, self-limiting quantity across the engine's entire
    // reachable HR domain (0.787 at the HR 220 ceiling, 0.867 even at the
    // defensive effHr clamp's outer bound of 250) — raising the rail to 0.85
    // (comfortably above the highest value the formula can ever produce, so it
    // is a safety backstop rather than an active limit) lets diastole actually
    // shrink the way electromechanical systole dictates instead of silently
    // floor-clamping it back to 0.60.
    //
    // MEASURED AFTER THIS CHANGE (same probe as the numbers above, settled
    // patient forced into the rhythm and re-measured): sinus HR 94 CO 6.01
    // unchanged (the clamp was never hit below ~155); VT HR 180 EDV 105.5->
    // 103.5 mL, SV 33.3->31.5 mL, CO 6.00->5.67, MAP 102.2->99.5; torsades HR
    // 220 EDV 100.4->93.4 mL, SV 28.1->24.5, CO 6.17->5.38, MAP 103.9->97.3;
    // SVT HR 170 (synchronous conduction — see DYSSYNC below, svt is not in
    // that table) CO 6.77->6.49, MAP 108.3->106.1, i.e. barely touched, which
    // is the correct relative ordering: SVT is tolerated far better than a
    // dyssynchronous ventricular rhythm at a comparable rate.
    //
    // STATED HONESTLY, because the direction is right and the magnitude is not
    // yet the full clinical picture: this moves VT/torsades from "perfuses
    // normally" to "measurably impaired" (torsades MAP down 6.6 mmHg, CO down
    // 13%), not to the syncope-inducing collapse a real sustained 220/min
    // wide-complex tachycardia produces. Investigated and MEASURED, not just
    // suspected: extending the same probe to 20 minutes shows CO/MAP continuing
    // to drift down only slowly (torsades CO 5.38->5.16 over 20 min) and
    // myoO2Balance staying strongly positive throughout (coronaryFlow pinned at
    // its 3.5x resting-reserve ceiling, demand only ~1.2-1.3x rest even at HR
    // 220) — so pat.atp never leaves 1.000 in this otherwise-healthy patient,
    // and the dormant VF-degeneration hazard documented in updateRhythm below
    // stays dormant here too. That is a second, separate gap (a structurally
    // normal coronary bed has enough reserve that HR alone does not create
    // ischemia in this model, which is not obviously wrong — real young hearts
    // do tolerate high rates without infarcting) rather than evidence this fix
    // is incomplete on its own terms.
    //
    // A second lever was investigated and rejected before landing on this one:
    // see the atrialKick note above (AV-dissociation atrial-kick attenuation
    // measured WORSE, not better, when wired into this solver). Pushing the
    // magnitude further — e.g. a harsher DYSSYNC penalty, or recalibrating Rmv
    // so filling is throttled more by TIME and less by pressure equilibration —
    // was deliberately not attempted: both would move every tachycardic patient
    // in the engine (sepsis, hemorrhage, anaphylaxis, pediatric baselines) off
    // an unmeasured guess rather than an identified number, which is exactly
    // the numbers-are-identified-not-tuned rule this document holds elsewhere.
    // The rail itself was a genuine, identifiable defect (an arbitrary 0.60
    // round number where the Weissler formula gives a specific, citable value)
    // and fixing it is a real, measured improvement; closing the remaining gap
    // to full hemodynamic collapse is left as follow-up, filed at the bottom of
    // the physiology queue rather than guessed at under this same batch.
    sysFrac: clamp((0.16 + 0.20 * (60 / effHr)) / (60 / effHr), 0.18, 0.85),
    // Cardiac phase is carried across ticks as state (see cyclePhase in
    // cardiovascular_ode_full.js) so a change in heart rate advances the cycle
    // continuously instead of relocating the heart within it.
    phase0: pat._fullPhase ?? 0,
    tStart: pat._fullT ?? 0,
    // Resting end-systolic elastance. contractilityRatio is normalized against
    // restEes = 2.3 mmHg/mL (above), so the base here MUST be that same 2.3 or
    // the two solvers disagree about the patient's contractility: with 2.0 the
    // closed loop ran a ventricle at the very bottom of the documented Ees range
    // (2.0-2.5) while the lumped model reported 2.3. The loop landed correctly on
    // its own ESPVR (predicted end-systolic volume 55.4 mL, actual 54.8), so the
    // mechanics were right and only the elastance was understated — which
    // depressed ejection fraction to 52% against a documented 55-70 and, through
    // the reduced stroke volume, held mean arterial pressure below the patient's
    // own baroreflex setpoint.
    EmaxLV: restEes * contractilityRatio * effMech * syncFactor * eScale,
    EminLV: clamp(0.06 * lusitropyRatio, 0.02, 0.4) * diastEScale,
    EmaxRV: 0.55 * rvContractilityRatio * effMech * syncFactor * eScale,
    EminRV: clamp(0.05 * lusitropyRatio, 0.02, 0.35) * diastEScale,
    // Atria lose their kick too when the rhythm isn't mechanically perfusing.
    EmaxLA: 0.18 * effMech * eScale, EmaxRA: 0.14 * effMech * eScale,
    // Atrial PASSIVE elastance must carry the same body-size scaling as every
    // other elastance, otherwise a small or large patient gets adult-sized
    // atrial compliance and their filling pressures are wrong.
    EminLA: 0.15 * diastEScale, EminRA: 0.10 * diastEScale,
    // Intrathoracic pressure ONLY -- genuinely uniform across all four
    // chambers (tension pneumothorax, PPV). Pericardial restraint is no
    // longer folded in here as of Phase 6 (queue item 1) -- it is chamber-
    // specific (periLV/periRV/periLA/periRA below), since the thin-walled RV
    // and atria are disproportionately restrained relative to the LV, which
    // one shared scalar could not represent.
    externalP: pat.intrathoracicP ?? 0,
    // Raised intrathoracic pressure impedes venous return (tension
    // pneumothorax, PPV → obstructive shock). The derivative's venous-return
    // term subtracts thoracicVeinP; only the POSITIVE (pathological)
    // component is passed so the normal slightly-negative resting
    // intrathoracic pressure — already in the resting calibration — doesn't
    // shift the healthy baseline. Pericardial restraint's own contribution to
    // venous-return impedance now flows through periRA below (it raises
    // transmural RA pressure directly, which the venous-return equation
    // already compares against systemic venous pressure) rather than through
    // this intrathoracic-only term.
    thoracicVeinP: Math.max(0, pat.intrathoracicP ?? 0),
    // PHASE 6 (queue item 1): chamber-specific pericardial coupling
    // coefficients, alpha_j in P_trans,j = P_intra,j - alpha_j*P_peri. The
    // thin-walled RV and both atria derive a LARGER share of their filling
    // pressure from pericardial restraint than the thicker-walled LV does
    // (Borlaug & Reddy, JACC Heart Fail 2019) -- this is the RV/atrial
    // disproportionality this phase's own mandatory assertion checks for.
    // MEASURED (throwaway probe): the original 0.5/1.0/0.8/1.0 weights,
    // layered on top of periRA already carrying the full restraint the prior
    // single-channel mechanism used, compounded into a tamponade CO/MAP
    // collapse measurably past the already-documented, already-tuned
    // pericardialTamponade condition's own anchor (co 1.65/map 56 vs the
    // condition's own documented co 2.67/map 69 at the same settle point) --
    // reduced so the SAME effusion target reproduces a comparable magnitude
    // to what that condition was tuned against, while preserving the real,
    // required RV/atria > LV ordering (Borlaug & Reddy 2019).
    periLV: 0.3 * (pat.pericardialP || 0),
    periRV: 0.75 * (pat.pericardialP || 0),
    periLA: 0.55 * (pat.pericardialP || 0),
    periRA: 0.75 * (pat.pericardialP || 0),
    aorticStenosisSeverity: pat.aorticStenosisSeverity || 0,
    mitralStenosisSeverity: pat.mitralStenosisSeverity || 0,
    // VALVULAR INCOMPETENCE. updateValves() above has always produced these two
    // states — with real time constants, real acute drivers (ischemic papillary
    // dysfunction, annular dilation in a failing ventricle, root dissection,
    // endocarditis) and a real chronic source — and the LUMPED model has always
    // consumed them. But the publish block at the end of updateCardiovascular
    // republishes SV/EDV/ESV/EF/CO/MAP/SBP/DBP from THIS solver, which had no
    // regurgitation term at all (its flows were forward-only), so every one of
    // those lumped regurgitation effects was overwritten before it could reach
    // an observable. That is this project's third rule exactly — a field that is
    // written, read, and still inert — and passing them here is what closes it.
    // STRUCTURAL component only — see the long note at the end of updateValves
    // for why the ischemic/annular-dilation components are deliberately not
    // consumed here yet, and what would be needed to wire them in safely.
    mitralRegurgFrac: pat.mitralRegurgStructural || 0,
    aorticRegurgFrac: pat.aorticRegurgStructural || 0,
    // SVR/PVR the rest of the engine already tracks are translated the same
    // way: smoothed ratio against the lumped model's OWN resting baseline,
    // applied to this solver's tuned resistance defaults (not the raw SVR
    // number, which is in different units — mmHg·min/L vs this solver's
    // mmHg·s/mL).
    // All resistances AND inertances ∝ 1/bodyScale (=eScale). Same factor on
    // both keeps every L/R time constant body-size invariant → no pediatric
    // stiffness/NaN. Rsys/Rpul also carry their smoothed SVR/PVR ratio.
    Rsys: 1.0 * pat._fullRsysRatio * eScale,
    Rpul: 0.0045 * pat._fullRpulRatio * eScale,
    Rao: 0.006 * eScale, Rven: 0.045 * eScale,
    Rpc: 0.09 * eScale, Rpvv: 0.01 * eScale,
    Rmv: 0.0025 * eScale, Rtv: 0.007 * eScale,
    Lao: 0.0006 * eScale, Lsys: 0.0009 * eScale,
    Lven: 0.0012 * eScale, Lpul: 0.00045 * eScale,
    // Body-size scaling for every volume-dimensioned default (see bug note
    // above) — resistances/inertances are left at their tuned adult defaults
    // for now (a finer-grained pediatric calibration of those is out of
    // Task 1's scope; the volume floor was the actual collapse mechanism).
    // Chamber sizes carry the general remodeling factor as well as body size, so
    // an eccentrically remodeled ventricle (pregnancy, DCM) accepts a larger EDV
    // at the same filling pressure in the closed loop too.
    V0LV: 10 * chamberScale, V0RV: 12 * chamberScale,
    V0LA: 8 * chamberScale, V0RA: 10 * chamberScale,
    // Total systemic ARTERIAL compliance. Windkessel identifications put this at
    // ~1.0-1.5 mL/mmHg in a healthy adult; the previous 1.7 sat above that range
    // and produced an empirical SV/PP of 2.44 against a documented ~1.75, i.e. a
    // pulse pressure of only 30 mmHg for a 73 mL stroke volume where physiology
    // gives 35-50. Because the Windkessel time constant is tau = R*C, an
    // over-compliant artery also drains too slowly in diastole, which is what
    // held diastolic pressure up and carried mean pressure with it.
    //
    // arterialComplianceFactor is a DISEASE handle on that compliance, in the
    // same shape as venousCapacitanceFactor and chamberRemodeling: 1 is the
    // patient's own age- and size-appropriate artery, below 1 is a stiff one.
    // It had to exist because large-artery stiffening is a real and separately
    // documented lesion — preeclampsia, chronic hypertension, diabetes, CKD and
    // aging all raise pulse wave velocity and augmentation index — and it moves
    // an observable NOTHING ELSE moves. Resistance sets mean pressure; compliance
    // sets PULSE pressure. A condition that could only raise baseSVR could
    // therefore produce a hypertensive patient with a narrow pulse pressure,
    // which is the wrong picture: measured on the preeclampsia condition before
    // this handle existed, 151/116 (PP 35) where severe preeclampsia is
    // documented around 160-170 over 110 (PP 50-60). Stroke volume was right and
    // mean pressure was right; only the compliance term was missing.
    //
    // NOT applied to normal pregnancy. Pregnancy raises stroke volume ~25% and
    // total arterial compliance by a similar amount, so the two largely cancel
    // and pulse pressure is preserved-to-slightly-widened — which is what the
    // engine already produces for a healthy term patient (108/62, PP 46). Adding
    // a pregnancy compliance rise here would have NARROWED that to ~34 and made
    // a correct number wrong. The preeclamptic reduction is therefore measured
    // relative to the healthy pregnant artery the engine already gets right.
    Cao: 1.25 * cScale * clamp(pat.arterialComplianceFactor ?? 1, 0.3, 2.5), VuAo: 90 * bodyScale,
    // Systemic unstressed volume is RECRUITED by sympathetic venoconstriction
    // (Finding #1 compensation phase): rising alpha tone converts unstressed →
    // stressed volume, defending mean systemic filling pressure during early
    // hemorrhage. Up to ~30% of the reservoir is mobilised at maximal drive;
    // once that reserve AND the stressed volume are exhausted, MSFP collapses
    // (Psys≥0 clamp in the ODE) and venous return fails — graded shock.
    // VENOUS capacitance scales with the reservoir VOLUME alone, without the
    // arterial pressure scale. Filling pressures are age-invariant — central
    // venous pressure is 2-6 mmHg and mean systemic filling pressure 7-10 mmHg
    // at every age, while ARTERIAL pressure rises from ~62 mmHg in a toddler to
    // ~93 in an adult. Applying pScale here scaled the venous side down too, so
    // measured MSFP ran 5.6 / 6.9 / 9.2 mmHg at ages 3 / 8 / 35: children were
    // filling their ventricles at a fraction of adult pressure, giving an EDV
    // index of 51 against a documented 60-75 and a cardiac index of 2.3 where a
    // young child should exceed the adult. pScale belongs on the arterial
    // compartment (Cao/Cpa), which is where the age difference actually lives.
    Csys: 185 * bodyScale * venCapFull,
    // Systemic venous UNSTRESSED volume, expressed as a FRACTION of the
    // patient's anatomical blood volume rather than a fixed millilitre figure.
    // Physiology: only ~25-30% of blood volume is stressed (the part that
    // generates mean systemic filling pressure); the systemic veins hold the
    // bulk of the unstressed remainder. The previous fixed 1850 mL was ~38% of
    // an adult blood volume, leaving ~41% stressed, so MSFP came out at 10.8
    // mmHg against a documented 7-10 and the venous return gradient ran ~9 mmHg
    // against 3.5-7 — over-filling the ventricle from upstream. Deriving it as a
    // fraction also makes it scale correctly with body size, hemorrhage and the
    // pregnancy volume expansion instead of needing a separate rule for each.
    VuSys: 0.50 * pat.ageProfile.bloodVolumeL() * 1000 * venCapFull * (1 - clamp(pat.alphaTone || 0, 0, 1) * 0.30),
    Cpa: 4.0 * cScale, VuPA: 40 * bodyScale,
    // Pulmonary VENOUS compliance likewise sets a filling pressure (left atrial
    // pressure), which is also age-invariant.
    Cpv: 10 * bodyScale, VuPV: 250 * bodyScale,
    // Overfill-stiffening knees scale with chamber size; the coefficient scales
    // inversely so the pressure it produces is body-size consistent.
    VmaxLV: 185 * chamberScale, VmaxRV: 205 * chamberScale,
    VmaxLA: 210 * chamberScale, VmaxRA: 210 * chamberScale,
    // stiffK ∝ 1/bodyScale² so the overfill pressure k·(V−Vmax)² (with V−Vmax ∝
    // bodyScale) stays size-invariant like every other pressure.
    stiffK: 0.08 * pScale / (chamberScale * chamberScale),
    // EDPVR excess: edpA invariant; edpB ∝ 1/bodyScale and edpU0 ∝ bodyScale so
    // the excess engages at the same fraction of normal EDV and gives the same
    // pressure at every body size.
    // edpB carries a NEW multiplicative term from chronic concentric LV
    // hypertrophy (see updateChronicRemodeling above, queue item V2-27):
    // hypertrophied ventricles have real, documented reduced diastolic
    // compliance ("harder to fill") even while systolic function is
    // preserved/initially enhanced. LVH_STIFFNESS_COEF=1.0 doubles diastolic
    // stiffness at full (lvHypertrophy=1) hypertrophy — a real, moderate
    // diastolic-dysfunction magnitude, not an invented dramatic one. Exactly
    // 1 (no-op) whenever lvHypertrophy is 0, which is every acute
    // presentation and every condition that never sustains elevated
    // afterload — confirmed by construction, not just measurement.
    edpA: 5.0 * pScale,
    edpB: (0.035 / chamberScale) * (1 + (pat.lvHypertrophy || 0) * 1.0),
    edpU0: 115 * chamberScale,
  });

  const targetTotalMl = (pat.totalBloodVol || 4.9) * 1000;

  if (!pat._fullX) {
    pat._fullX = initState(p, targetTotalMl);
    pat._fullT = 0;
  } else {
    // Hemorrhage/resuscitation (and ordinary Starling fluid shifts, which
    // nudge pat.totalBloodVol by a small amount essentially every tick, even
    // at rest) change pat.totalBloodVol on their own clock. This loop has no
    // direct knowledge of WHERE blood was added or lost.
    //
    // ROOT CAUSE of the ~170 mmHg drift found this session: this used to
    // rescale ALL EIGHT compartments uniformly (i = 0..IDX.VPV), including
    // VLV/VRV — the small, stiff, beat-critical ventricular volumes that the
    // valve-gated ODE is supposed to set entirely on its own from filling and
    // ejection. Because ordinary fluid shifts touch pat.totalBloodVol on
    // essentially every tick, this fired far more often than "hemorrhage
    // events," and each firing landed at a random, uncontrolled phase of the
    // cardiac cycle — injecting/removing volume from the ventricles
    // independent of valve state. In a nonlinear, switch-like (valve
    // threshold) system that rectifies to a net INCREASE in mean ventricular
    // volume/pressure over many repetitions — the same mechanism already
    // identified and fixed for Emax/Rsys jitter above, just via a different,
    // previously-uncovered path.
    //
    // Fix: only ever adjust the large, compliant systemic venous reservoir
    // (VSys) — the compartment that physiologically absorbs volume changes
    // from hemorrhage/resuscitation/capillary shifts — and do it gradually
    // (same ~15s time constant as the other lumped->full translations) rather
    // than as an instantaneous rescale. Ventricular and atrial volumes are
    // left entirely to the ODE's own beat-to-beat filling/ejection dynamics.
    const currentTotalMl = totalVolume(pat._fullX);
    const volErrMl = targetTotalMl - currentTotalMl;
    if (Math.abs(volErrMl) / Math.max(1, targetTotalMl) > 0.001) {
      const dtSecClamped = clamp((dt || 0) * 60, 0, FULL_ODE_MAX_SEC_PER_TICK);
      const tauSec = 15;
      const frac = 1 - Math.exp(-dtSecClamped / tauSec);
      // Floor at a small dead volume, NOT at VuSys (Finding #1). The reservoir
      // MUST be allowed to drain below its unstressed volume during hemorrhage,
      // otherwise the lost blood has nowhere to leave from and preload stays
      // artificially preserved. Below VuSys the MSFP is clamped to 0 in the ODE
      // (veins collapsed), so venous return fails and shock progresses.
      const minVSys = 40 * bodyScale;
      pat._fullX[IDX.VSys] = Math.max(minVSys, pat._fullX[IDX.VSys] + volErrMl * frac);
    }
  }

  // SECOND BUG found this session, on top of the VSys fix above: the "settles
  // at a stable but wrong ~170+ mmHg" symptom was NOT the ODE diverging. A
  // 3-second engine tick is ~3.7 cardiac cycles at a normal HR (period
  // ~0.81 s), so a single end-of-tick pressuresFromState() call was sampling
  // Pao/Plv at whatever phase of the beat the tick boundary happened to land
  // on — sometimes near-diastolic (~90), sometimes near-systolic (~170).
  // Logged over many ticks this LOOKS like a stuck high value because the
  // eye (and any code just reading pat.fourChamberLoop.Pao) naturally
  // anchors on the more dramatic systolic-looking numbers, but it was
  // aliased instantaneous sampling, not a wrong equilibrium — confirmed by
  // tracing Plv tick-by-tick and watching it legitimately swing between a
  // normal diastolic ~4-5 mmHg and a normal systolic ~130-150 mmHg.
  //
  // Fix: integrate in short (50 ms, well under one cardiac cycle) substeps
  // and track the true running max/min of Pao over each tick, then fold
  // those into a slowly-decaying (~2-beat time constant) systolic/diastolic
  // estimate. This is real windowed peak-detection, not a snapshot, so it
  // reports actual systolic/diastolic/mean pressures a monitor could trust,
  // in addition to the existing instantaneous Pao (kept for waveform use).
  const dtSec = clamp((dt || 0) * 60, 0, FULL_ODE_MAX_SEC_PER_TICK);
  if (dtSec > 0) {
    const sampleDt = 0.05; // 50 ms — resolves a ~0.6-1.2 s cardiac cycle cleanly
    let tCursor = pat._fullT;
    const tEnd = pat._fullT + dtSec;
    let paoMax = -Infinity, paoMin = Infinity;
    let vlvMax = -Infinity, vlvMin = Infinity;
    // QUEUE ITEM V2-25 — same windowed peak-detection this tick already does
    // for VLV (see the long note below on aliased instantaneous sampling),
    // applied to VRV so real RV EDV/ESV/EF can be read off the SAME
    // authoritative, PVR-coupled state the LV side already publishes from,
    // instead of the separate, non-coupled updateRightHeart() estimate below.
    let vrvMax = -Infinity, vrvMin = Infinity;
    // LV/RV pressure-volume-loop TRACE (Phase 0, legacy-solver removal, queue
    // item 1). This is the real replacement for the arterial-line teaching
    // display (App.jsx, `dv.artline`, reading `pat.pvLoop`/`pat.rvPvLoop`)
    // that used to be sourced from the now-removed `solveBeat()`-integrated
    // beat — a real trace sampled directly from THIS solver's own substep
    // integration, at the same 50ms resolution already used for the
    // paoMax/paoMin windowed peak-detection above, rather than a second,
    // parallel integrated beat. Field name kept as `Plv` even for the RV
    // trace (matching the legacy beat's own generic per-chamber point shape,
    // which App.jsx's rendering code already expects) rather than renaming
    // it `Prv` and touching the UI. If a tick spans more than one cardiac
    // cycle, the trace shows the real, possibly beat-to-beat-varying
    // trajectory across however many cycles occurred, not an idealized
    // single beat — a genuine monitor reading real dynamics over its
    // averaging window, not a synthetic representative beat.
    const lvTrace = [], rvTrace = [];
    // Zero the regurgitant-volume accumulators for this tick's window (see
    // IDX.WMR/WAR): they are integrated exactly by the RK4 below and read back
    // immediately after, so they measure THIS tick only and never accumulate
    // floating-point error across a long session.
    pat._fullX[IDX.WMR] = 0; pat._fullX[IDX.WAR] = 0;
    while (tCursor < tEnd - 1e-9) {
      const tNext = Math.min(tCursor + sampleDt, tEnd);
      const res = integrateRK4(pat._fullX, tCursor, tNext, 0.0003, p);
      pat._fullX = res.x;
      tCursor = tNext;
      const prS = pressuresFromState(pat._fullX, tCursor, p);
      if (prS.Pao > paoMax) paoMax = prS.Pao;
      if (prS.Pao < paoMin) paoMin = prS.Pao;
      const vlv = pat._fullX[IDX.VLV];
      if (vlv > vlvMax) vlvMax = vlv;
      if (vlv < vlvMin) vlvMin = vlv;
      const vrv = pat._fullX[IDX.VRV];
      if (vrv > vrvMax) vrvMax = vrv;
      if (vrv < vrvMin) vrvMin = vrv;
      lvTrace.push({ V: +vlv.toFixed(1), Plv: +prS.Plv.toFixed(1) });
      rvTrace.push({ V: +vrv.toFixed(1), Plv: +prS.Prv.toFixed(1) });
    }
    pat.pvLoop = lvTrace;
    pat.rvPvLoop = rvTrace;
    // Advance the integrated cardiac phase by exactly the time integrated.
    pat._fullPhase = (((pat._fullPhase ?? 0) + dtSec / (60 / effHr)) % 1 + 1) % 1;
    pat._fullT = tEnd;
    // Beat-averaging time constant for the REPORTED vitals. The previous form,
    // clamp(dtSec/1.6,0,1), saturates at exactly 1.0 for any tick ≥1.6 s — i.e.
    // for the engine's normal ~2-3 s tick there was NO smoothing at all, and each
    // tick published the raw max/min excursion of that window. Occasional
    // single-tick outliers (e.g. a tick that catches a transient after a venous
    // resync) then read as a 50% jump in SV/EF even though the underlying loop was
    // steady — verified: chest reports 7.1-8.2 L/min on consecutive ticks with
    // isolated 11.5 spikes, while its true mean (7.96) matches legacy (7.69).
    // A real monitor averages SV/CO over several beats, so use a genuine
    // exponential average with a fixed ~4 s (≈5 beat) time constant that cannot
    // saturate. This changes only the REPORTING of the loop, not its dynamics.
    const tauReport = 4.0; // seconds
    const betaEma = 1 - Math.exp(-dtSec / tauReport);
    pat._fullPaoSys = pat._fullPaoSys == null ? paoMax : pat._fullPaoSys + (paoMax - pat._fullPaoSys) * betaEma;
    pat._fullPaoDia = pat._fullPaoDia == null ? paoMin : pat._fullPaoDia + (paoMin - pat._fullPaoDia) * betaEma;
    // Same windowed-peak logic as PaoSys/PaoDia above, applied to VLV, gives a
    // live EDV/ESV (and therefore SV/CO/EF) that the full loop derives from
    // its OWN filling/ejection dynamics rather than the lumped Frank-Starling
    // formula — this is what makes it possible to publish these vitals from
    // the full loop instead of the legacy solver (see FULL_ODE_AUTHORITATIVE).
    pat._fullEdvRaw = pat._fullEdvRaw == null ? vlvMax : pat._fullEdvRaw + (vlvMax - pat._fullEdvRaw) * betaEma;
    pat._fullEsvRaw = pat._fullEsvRaw == null ? vlvMin : pat._fullEsvRaw + (vlvMin - pat._fullEsvRaw) * betaEma;
    pat._fullEdv = pat._fullEdvRaw;
    pat._fullEsv = Math.min(pat._fullEsvRaw, pat._fullEdvRaw);
    // QUEUE ITEM V2-25 — identical windowed-peak smoothing applied to VRV.
    // WHY THIS EXISTS: `updateRightHeart()` above (the legacy RV model) is the
    // one currently publishing pat.rvEdv/rvEf/rvSv, but it derives RV EDV from
    // a pure preload (CVP) formula with NO afterload term at all, so it cannot
    // show the signature finding of acute cor pulmonale (RV DILATION under
    // rising PVR) — measured directly: driving `pe` to its severity ceiling
    // (pulmResistFactor -> 4, pvrWood 1.3 -> 5.2) made the legacy pat.rvEdv
    // FALL (142 -> ~108) instead of rise, because rising heart rate shrinks
    // its diastolicFraction term faster than rising CVP grows fillingP — the
    // wrong direction for the exact teaching point (McConnell's sign / acute
    // RV dilation) this queue item names as a target behavior. The ODE's own
    // VRV state does not have this defect (afterload is a first-class term in
    // its pressure-volume physics via Rpul/eaRv), but before this fix it was
    // only ever read as ONE instantaneous end-of-tick sample
    // (`fourChamberLoop.volumes.vrv`), aliased across the cardiac cycle
    // exactly the way Pao/VLV were before their own windowed-peak fix above —
    // confirmed the same way: raw vrv reads 91.8 (control) vs 42.2 (severe
    // PE, single untraced sample), the OPPOSITE of dilation, purely from
    // sampling phase. Tracking real max/min over the tick removes that alias.
    pat._fullRvEdvRaw = pat._fullRvEdvRaw == null ? vrvMax : pat._fullRvEdvRaw + (vrvMax - pat._fullRvEdvRaw) * betaEma;
    pat._fullRvEsvRaw = pat._fullRvEsvRaw == null ? vrvMin : pat._fullRvEsvRaw + (vrvMin - pat._fullRvEsvRaw) * betaEma;
    pat._fullRvEdv = pat._fullRvEdvRaw;
    pat._fullRvEsv = Math.min(pat._fullRvEsvRaw, pat._fullRvEdvRaw);
    // No tricuspid/pulmonic regurgitant-volume accumulator exists (only
    // IDX.WMR/WAR, mitral/aortic), so total RV ejection IS forward RV output —
    // unlike the LV side there is no regurgitant fraction to subtract here.
    pat._fullRvSv = Math.max(0, pat._fullRvEdv - pat._fullRvEsv);
    pat._fullRvEf = pat._fullRvEdv > 0 ? clamp(pat._fullRvSv / pat._fullRvEdv, 0, 0.95) : 0;
    // TOTAL ventricular ejection this beat — the full volume excursion of the
    // LV, which is what leaves the chamber regardless of where it goes.
    const totalEjection = Math.max(0, pat._fullEdv - pat._fullEsv);
    // EJECTION FRACTION STAYS ON FORWARD FLOW — i.e. exactly the quantity
    // pat.ef has always meant everywhere else in this engine (forward stroke
    // volume over end-diastolic volume). This was NOT the first choice, and the
    // reason it changed is worth recording: publishing the echo-style
    // TOTAL-excursion EF instead is arguably the more clinically faithful
    // definition (it is why measured LVEF is preserved or supranormal in
    // mitral regurgitation even as forward output falls), and it was tried
    // first. Measured, it broke two calibrated assertions that predate this
    // work — "ACS depresses ejection fraction" (moved -0.041 against a
    // required -0.08) and "NSTEMI presents ischemic (EF depressed)" (-0.070
    // against -0.08) — because ischemic mitral regurgitation inflated the
    // total excursion and masked exactly the ischemic depression those
    // assertions exist to catch.
    //
    // Silently redefining an established field so that a long-calibrated
    // assertion stops holding is the wrong trade: pat.ef is consumed well
    // beyond this file, and every one of those consumers was calibrated
    // against the forward meaning. The forward definition is therefore kept,
    // and the supranormal-EF-in-MR teaching point is deliberately NOT smuggled
    // in by changing what an existing field means — if it is wanted it belongs
    // in a separate, explicitly-named quantity with its own consumers.
    // FORWARD stroke volume = total ejection minus what went backward through
    // an incompetent valve. pat.sv has always meant net systemic (forward)
    // output in this engine — it is what perfuses the body and what CO, oxygen
    // delivery and every downstream consumer are computed from — so the
    // regurgitant volume has to come off it.
    //
    // Regurgitant volume is accumulated exactly by the ODE over this tick's
    // window, so convert it to a PER-BEAT volume by dividing by the number of
    // beats actually integrated. Both accumulators are identically zero for a
    // patient with competent valves, so beatsThisTick is never evaluated in a
    // way that can change their result: forward SV then equals total ejection
    // exactly, bit-for-bit, as it did before this mechanism existed.
    const regurgTotalMl = (pat._fullX[IDX.WMR] || 0) + (pat._fullX[IDX.WAR] || 0);
    let regurgPerBeat = 0;
    if (regurgTotalMl > 0) {
      const beatsThisTick = Math.max(1e-6, dtSec * (pat._fullEffHr || effHr) / 60);
      regurgPerBeat = regurgTotalMl / beatsThisTick;
    }
    // Smooth with the SAME time constant as the EDV/ESV peaks it is subtracted
    // from, so forward SV isn't a smoothed quantity minus an unsmoothed one.
    pat._fullRegurgVol = pat._fullRegurgVol == null
      ? regurgPerBeat
      : pat._fullRegurgVol + (regurgPerBeat - pat._fullRegurgVol) * betaEma;
    pat._fullSv = Math.max(0, totalEjection - pat._fullRegurgVol);
    // Forward ejection fraction (see the long note above for why this is
    // forward rather than total excursion). Identical to the pre-existing
    // expression for any patient with competent valves, since forward stroke
    // volume then equals the total excursion exactly.
    pat._fullEf = pat._fullEdv > 0 ? clamp(pat._fullSv / pat._fullEdv, 0, 0.95) : 0;
    // Cardiac output must use the rate at which the loop actually ejected
    // (pat._fullEffHr), not the patient's ELECTRICAL rate. During cardiac arrest
    // pat.hr is 0, so this previously multiplied a genuine compression-generated
    // stroke volume by zero: CPR could raise arterial pressure while reporting no
    // cardiac output, no oxygen delivery and no end-tidal CO2. Mechanical rate and
    // electrical rate are different quantities, and CPR is precisely the state
    // where they diverge.
    pat._fullCo = (pat._fullEffHr || pat.hr || 0) * pat._fullSv / 1000;
  }

  const pr = pressuresFromState(pat._fullX, pat._fullT, p);
  const sysP = pat._fullPaoSys ?? pr.Pao;
  const diaP = pat._fullPaoDia ?? pr.Pao;
  pat.fourChamberLoop = {
    Plv: +pr.Plv.toFixed(1), Prv: +pr.Prv.toFixed(1), Pla: +pr.Pla.toFixed(1), Pra: +pr.Pra.toFixed(1),
    Pao: +pr.Pao.toFixed(1), Psys: +pr.Psys.toFixed(1), Ppa: +pr.Ppa.toFixed(1), Ppv: +pr.Ppv.toFixed(1),
    // Windowed (not instantaneous) aortic systolic/diastolic/mean — see note above.
    PaoSys: +sysP.toFixed(1), PaoDia: +diaP.toFixed(1), PaoMean: +((diaP * 2 + sysP) / 3).toFixed(1),
    volumes: {
      vla: +pat._fullX[IDX.VLA].toFixed(1), vlv: +pat._fullX[IDX.VLV].toFixed(1),
      vra: +pat._fullX[IDX.VRA].toFixed(1), vrv: +pat._fullX[IDX.VRV].toFixed(1),
    },
    valves: {
      mv: +pat._fullX[IDX.thMV].toFixed(2), av: +pat._fullX[IDX.thAV].toFixed(2),
      tv: +pat._fullX[IDX.thTV].toFixed(2), pv: +pat._fullX[IDX.thPV].toFixed(2),
    },
    totalVolumeMl: +totalVolume(pat._fullX).toFixed(1),
  };
}

// Right-heart / pulmonary loop. A second time-varying-elastance beat (same
// solver as the LV) driven by right-atrial filling pressure as preload and a
// pulmonary arterial elastance as afterload. It produces pulmonary-artery
// pressures and RV function as DERIVED outputs — it does not (yet) feed back
// into systemic LV preload, so the systemic circulation the scenarios are
// balanced around is unchanged. Pulmonary vascular resistance rises with
// HYPOXIC PULMONARY VASOCONSTRICTION (low SaO2) and with any scenario-set
// pulmonary resistance (PE, pulmonary hypertension), so acute cor pulmonale /
// RV strain emerges rather than being scripted.
function updateRightHeart(pat) {
  const bodyScale = pat._bodyScale || 1;
  // RV preload from transmural RA filling pressure.
  const fillingP = Math.max(0, pat.cvp - (pat.cardiacExternalP ?? pat.intrathoracicP ?? 0));
  let rvEdv = clamp(190 * bodyScale * (1 - Math.exp(-fillingP / 10.0)) * (pat.diastolicFraction / 0.6125 || 1),
                    3 * bodyScale, 300 * bodyScale);
  const rvEes = clamp(1.15 * pat.contractility / bodyScale, 0.1, 4 / bodyScale);
  pat.rvEes = rvEes;

  // Pulmonary vascular resistance (Wood units): a base value, raised by HYPOXIC
  // PULMONARY VASOCONSTRICTION (low SaO2) and by any scenario-set obstruction
  // (PE clot burden, chronic pulmonary hypertension). Resistance scales
  // inversely with body size, so a child's smaller pulmonary bed keeps its
  // pressures in the adult mmHg range rather than collapsing with its low flow.
  const sao2 = pat.sao2 ?? 97;
  const hpv = clamp((88 - sao2) * 0.03, 0, 1.6);
  const pvr = clamp(1.6 * (pat.pulmResistFactor || 1) * (1 + hpv) / bodyScale, 0.6, 20); // Wood units
  const pcwp = clamp(6 + (pat.edema || 0) * 12 + (pat.riskFactors.heartFailure ? 4 : 0), 4, 32); // L-atrial pressure
  const flow = Math.max(1, pat.co || 5);
  // Pressure–flow: mean PAP = PCWP + CO·PVR.
  const paMean = clamp(pcwp + flow * pvr, 8, 90);
  const paDia = clamp(0.6 * paMean, 3, 60);
  const paSys = clamp(1.55 * paMean, 10, 130);

  // RV analytic end-systolic coupling (Phase 0, legacy-solver removal, queue
  // item 1): a one-tick bootstrap only. pat.rvSv/rvEsv/rvEdv/rvEf are
  // unconditionally overwritten by the authoritative full-loop ODE's own RV
  // state once pat.fourChamberLoop exists (every tick after the first — see
  // the publish block in updateCardiovascular). This used to be cross-checked
  // against an integrated double-Hill beat (cardiovascular_ode.js's
  // solveBeat); that integration always converged to this same analytic
  // equilibrium, so removing it changes nothing about the value. The per-beat
  // RV PV-loop trace the old integrated beat also produced, for the
  // arterial-line teaching display, now comes from the full loop's own
  // substep integration instead (pat.rvPvLoop, set in updateFullLoopODE).
  const eaRv = clamp((paSys - paDia) / 60, 0.08, 4);
  const rvSvAnalytic = rvEes * (rvEdv - 12 * bodyScale) / (rvEes + eaRv);
  pat.rvSv = clamp(rvSvAnalytic, 0, 220);
  pat.rvEsv = Math.max(0, rvEdv - pat.rvSv);
  pat.rvEdv = rvEdv;
  pat.rvEf = rvEdv > 0 ? clamp(pat.rvSv / rvEdv, 0, 0.95) : 0;
  pat.paSys = Math.round(paSys);
  pat.paDia = Math.round(paDia);
  pat.paMean = Math.round(paMean);
  pat.pvrWood = +pvr.toFixed(1);
}

// AV/His-Purkinje/SA conduction. Different insults act through different
// mechanisms, so first-degree/Mobitz/complete block, junctional escape and
// hyperkalaemic QRS widening emerge instead of being hard-coded rate changes.
function updateConduction(pat, dt) {
  // Intrinsic sinus rate drifts toward hrBase (conditions nudge hrBase).
  pat.saRate = approach(pat.saRate, pat.hrBase, dt, 6 * S);

  // QUEUE ITEM 2 — CALCIUM MEMBRANE STABILISATION IN HYPERKALAEMIA. Calcium
  // doesn't lower serum potassium; it raises the myocardium's threshold
  // potential (widens the gap between resting and threshold membrane
  // potential that hyperkalaemia narrows), which is why IV calcium
  // transiently narrows the QRS and restores AV conduction WITHOUT moving
  // the potassium level — "buys time" while insulin/dextrose, albuterol or
  // bicarbonate actually shift potassium. mortality.js already models this
  // exact mechanism as an effective-K adjustment for its own arrest-threshold
  // classification (`effectiveK`); this reuses that SAME identified
  // coefficient (1 mmol/L of calcium above the 2.4 baseline offsets 4 mEq/L
  // of potassium) for the ECG morphology terms below, rather than inventing
  // a second one — the two must not disagree about how much a given calcium
  // level protects. Duplicated inline (not imported) because mortality.js is
  // downstream of this module in the tick order and is documented elsewhere
  // in this codebase as a pure observer of physiology, never a driver of it;
  // a shared local mirrors that direction instead of inverting it.
  const effK = (pat.k ?? 4) - Math.max(0, (pat.ca ?? 2.4) - 2.4) * 4;

  // QRS width: widened by hyperkalaemia (Na-channel effect), by class-I / TCA
  // sodium-channel block, and by ischemia.
  let qrs = 0.08;
  if (effK > 5.5) qrs += (effK - 5.5) * 0.05;
  if (pat.atp < 0.5) qrs += (0.5 - pat.atp) * 0.06;
  // Hypermagnesaemia widens QRS on the same Ca-channel axis as the AV block
  // below; documented alongside PR prolongation in the 5.0-7.5 range.
  if (pat.mg > 5.0) qrs += (pat.mg - 5.0) * 0.01;
  // TRICYCLIC/CLASS-I SODIUM-CHANNEL BLOCK. The comment on this block already
  // named this as a QRS-widening mechanism (class-I/TCA) but nothing here ever
  // read pat.sodiumChannelBlock — confirmed by grep before touching anything
  // (queue item 7's tricyclicOverdose batch). This is the single most
  // predictive TCA-overdose ECG finding: QRS>100ms predicts seizure risk,
  // QRS>160ms predicts ventricular arrhythmia (Boehnert & Lovejoy, NEJM 1985).
  // 0.12s per full-block unit puts a moderate block (~0.5) at 140ms (between
  // both thresholds) and a severe block (~0.9) at 188ms (past the VT
  // threshold) — a graded relationship anchored on those two numbers, not a
  // step function or a fitted constant.
  //
  // Sodium bicarbonate's real antidote mechanism is dual: it raises serum Na+
  // (partially overcoming the channel blockade) AND raises pH, which lowers
  // the drug's affinity for the channel (it binds preferentially to its
  // protonated form, favoured at low pH — Kolecki & Curry, review). This
  // engine has no extracellular-Na+-concentration field the fluid/bicarb dose
  // could act on distinctly from serum bicarbonate itself, so only the
  // pH-mediated half is modeled — stated honestly, not silently assumed
  // complete. Modeled as a pH-gated multiplier, mirroring the acidosis-gate
  // idiom this file's own a.hypoxic term already uses for pat.ph: acidemia
  // (pH 7.1) makes the block ~36% MORE effective (worsening toxicity, a real,
  // documented finding — acidosis potentiates TCA cardiotoxicity), alkalemia
  // (pH 7.55, an achievable post-bicarb value) makes it ~18% LESS effective —
  // a real, measurable QRS-narrowing route for the actual first-line antidote.
  // pat.tcaNaBlock is a SEPARATE, condition-owned accumulator (tricyclicOverdose,
  // conditions.js) rather than a write into pat.sodiumChannelBlock itself —
  // that field is reset to 0 every tick by pk.js and re-derived only from
  // active antiarrhythmic drug instances (pk.js:716/1501), so a condition
  // writing it directly is silently wiped before this function ever runs
  // (measured directly; see the condition's own comment). Combined here,
  // additively and clamped, the same way epilepticDrive sits alongside the
  // pk-owned seizureDrive.
  const totalNaBlock = clamp((pat.sodiumChannelBlock || 0) + (pat.tcaNaBlock || 0), 0, 1);
  if (totalNaBlock > 0) {
    const phGate = clamp(1 + (7.4 - (pat.ph ?? 7.4)) * 1.2, 0.4, 1.8);
    qrs += totalNaBlock * phGate * 0.12;
  }
  pat.qrsWidth = approach(pat.qrsWidth, qrs, dt, 5 * S);

  // AV conduction impaired by hyperkalaemia, ischemia, marked vagal tone, and
  // (via receptor tone) beta-blockade / calcium-channel blockade which push
  // beta1Tone negative.
  let av = 1.0;
  if (effK > 6.5) av -= (effK - 6.5) * 0.25;
  if (pat.atp < 0.4) av -= (0.4 - pat.atp) * 0.8;
  if (pat.beta1Tone < 0) av += pat.beta1Tone * 0.5; // negative dromotropy from CCB/BB
  // Vagally-mediated AV nodal slowing — the real mechanism behind vagotonic
  // Wenckebach (second-degree AV block, cardiac conditions batch, physiology
  // queue item 7). FOUND while building it: atropine's vagalBlock was ALREADY
  // a real receptor mechanism (duodote/atropine, queue item 5) but only ever
  // added a direct HR bump (line ~334 above) — it never reached this
  // parasympathetic term, so atropine could not do the one thing it is
  // actually first-line for (AV-nodal-level, vagally-mediated block). Gated
  // by the SAME vagalBlock term already used for the HR bump, so this is not
  // a new drug mechanism, just the existing one finally reaching a second,
  // real consumer. Verified NOT to move any already-measured value: vagalBlock
  // is 0 in every previously-shipped assertion that does not give atropine,
  // making this a no-op (effPara === pat.parasympathetic) for all of them.
  // pat.cholinergicVagalTone (organophosphatePoisoning, queue item 67) adds a
  // real AV-nodal muscarinic-excess component here too, capped modestly
  // (0.25) since the HR-formula term above already carries most of this
  // condition's real bradycardia — this is a secondary, genuinely
  // atropine-antagonized contributor, not a re-derivation of it.
  const effPara = (pat.parasympathetic + clamp(pat.cholinergicVagalTone || 0, 0, 1) * 0.25) *
    (1 - clamp((pat.vagalBlock || 0) + (pat.tcaVagalBlock || 0), 0, 1));
  av -= Math.max(0, effPara - 0.7) * 0.3;
  // Valsalva / carotid massage: the vagal surge acts on the AV node (acetylcholine,
  // IK-ACh) beyond the resting vagal term above, which is what interrupts a reentrant
  // SVT circuit; coefficient set so one 60 s maneuver converts roughly a quarter of
  // SVT (clinical first-attempt conversion about 20 to 40 percent, higher modified).
  av -= clamp(pat.vagalSurge || 0, 0, 1.6) * VALSALVA_AV_DEPRESSION;
  // HYPERMAGNESAEMIA slows AV conduction — the documented ECG progression is
  // "prolonged PR interval and widened QRS" at 5.0-7.5 mmol/L and "complete
  // heart block" above 7.5 (Bolt Pharmacy / StatPearls). Magnesium blocks
  // calcium entry in nodal tissue, so this is the same conduction axis the
  // hyperkalaemia and CCB terms above act on. Onset at 5.0, reaching full block
  // by the 12.5 arrest level, which is what carries the rhythm into the
  // asystole branch of the state machine below rather than needing a separate
  // arrest scripting. Calcium is the physiological antagonist here exactly as it
  // is for the neuromuscular effects (see pk.js), so ionised calcium above
  // normal relieves the block without changing serum magnesium.
  if (pat.mg > 5.0) {
    const caRelief = clamp(((pat.ca ?? 2.4) - 2.4) / 1.0, 0, 0.9);
    av -= Math.min(1, (pat.mg - 5.0) / (12.5 - 5.0)) * (1 - caRelief);
  }
  // Pharmacological AV nodal slowing (amiodarone, and any future Class II/IV
  // agent that declares it). Acts on the same 0..1 conduction fraction the
  // block-rhythm state machine reads, so a large enough dose can produce real
  // AV block rather than merely a slower rate.
  av *= (1 - clamp(pat.avSlowingDrug || 0, 0, 0.9));
  // STRUCTURAL/INTRINSIC CONDUCTION SYSTEM DISEASE — cardiac conditions
  // workstream (physiology queue item 7). A condition sets this (0..1,
  // degree of fibrotic/degenerative conduction-system disease — Lev's/
  // Lenegre's disease is the most common cause of isolated AV block in
  // adults without acute MI, per StatPearls "Atrioventricular Block") to
  // reach first-, second- and third-degree block through a REAL disease axis
  // distinct from the reversible ones above (hyperkalaemia, hypermagnesaemia,
  // ischaemia, vagal tone, drugs). Deliberately a SEPARATE multiplicative term
  // rather than routed through parasympathetic tone or avSlowingDrug: this is
  // the mechanism that makes atropine correctly USELESS against a structural
  // infranodal block (the vagolytic effect has nothing to act on — there is
  // no vagal tone driving this block to unblock), which is exactly the
  // clinical teaching point already sitting, unenforced until now, in
  // atropine's own note in drugs.js ("USELESS in 2 degree type II or 3
  // degree block. Do not delay pacing for it."). Pacing captures the same way
  // it already does for any other bradycardia (transcutaneous pacing capture
  // mechanics above are unchanged), which is the correct field treatment.
  av *= (1 - clamp(pat.avNodalDisease || 0, 0, 0.98));
  pat.avConduction = clamp(av, 0, 1);

  // ---- Explicit AV-nodal conduction delay (PR interval), seconds ----
  // avConduction above is a 0..1 "how much is getting through" fraction used
  // for the block-rhythm state machine; the PR interval is the actual timing
  // quantity clinicians read, and behaves differently: it lengthens smoothly
  // long before conduction actually fails (first-degree block), and is
  // shortened by sympathetic/beta drive independently of how much of the
  // impulse gets through (a healthy AV node conducts faster under
  // catecholamines even though avConduction is already at its ceiling of 1).
  const PR_BASE = 0.16; // seconds, healthy resting AV delay
  let prTarget = PR_BASE;
  prTarget *= 1 + (1 - pat.avConduction) * 1.8;          // failing conduction lengthens PR
  prTarget -= clamp(pat.beta1Tone, -1, 3) * 0.02;         // sympathetic speeds AV conduction
  prTarget += Math.max(0, pat.parasympathetic - 0.7) * 0.08; // vagal tone slows it
  prTarget = clamp(prTarget, 0.08, 0.60);
  pat.prInterval = approach(pat.prInterval ?? PR_BASE, prTarget, dt, 3 * S);
  // First-degree block is just a prolonged-but-conducting PR (>0.20s); it does
  // not change the rhythm state machine, only this explicit timing readout —
  // Mobitz/complete block are handled separately via avConduction failing.
  pat.firstDegreeBlock = pat.prInterval > 0.20;
}

// ---------------------------------------------------------------------------
// VALVE DYNAMICS
//    Each valve is a nonlinear resistor whose effective opening is a state
//    variable rather than a switch: dθ/dt = ko*(driving) - kc*θ, bounded to
//    [0,1]. Two independent failure modes fall out of the same state:
//      - INCOMPETENCE (regurgitation): θ_leak, the fraction of the valve
//        that fails to seal in the "closed" phase — driven toward a target
//        set by structural disease (chronic valvulopathy), acute insults
//        (papillary muscle ischemia -> ischemic MR, endocarditis -> acute
//        AI), and annular dilation (a badly dilated failing ventricle
//        stretches its own valve ring -> functional MR), then relaxes with
//        a time constant so acute events (papillary rupture) progress
//        realistically over seconds-to-minutes rather than switching
//        instantly.
//      - STENOSIS: a fixed structural restriction on maximum opening,
//        raising the effective resistance the chamber must eject/fill
//        against.
//    This lumped per-beat model doesn't resolve intra-beat leaflet
//    excursion, so θ_leak is applied as the regurgitant fraction of that
//    beat's stroke volume, and stenosis as an added valvular impedance —
//    the beat-to-beat consequence of the same underlying nonlinear-resistor
//    physics, at the temporal grain this model resolves.
// ---------------------------------------------------------------------------
function updateValves(pat, dt) {
  const rf = pat.riskFactors || {};

  // ---- Mitral valve ----
  // Structural (chronic) target from scenario-set disease.
  let mrTarget = rf.mitralRegurg ? clamp(rf.mitralRegurgSeverity ?? 0.35, 0, 0.9) : 0;
  // Ischemic papillary muscle dysfunction: acute MR that tracks myocardial
  // ischemia directly (no separate territory model — falling ATP is used as
  // the ischemia signal already driving contractility elsewhere).
  //
  // NOTE (queue item 41): this coefficient is DELIBERATELY LEFT UNCHANGED, and
  // the authoritative full-loop solver deliberately does NOT yet consume the
  // ischemia-derived component — see the structural-only split at the bottom of
  // this function for the full reasoning and the measurements behind it.
  if (pat.atp < 0.6) mrTarget = Math.max(mrTarget, (0.6 - pat.atp) * 0.9);
  // Functional MR from annular dilation: a badly dilated, failing ventricle
  // stretches the mitral ring open.
  //
  // STALE-SCALE GUARD (real defect, found while wiring regurgitation into the
  // authoritative full-loop solver — queue item 41). updateValves runs BEFORE
  // pat.edv is recomputed later in updateCardiovascular, so the pat.edv read
  // here is always the PREVIOUS tick's value, while pat._bodyScale is this
  // tick's. On a patient's first ticks those two disagree badly: a pediatric
  // patient is evaluated with an adult-sized carried-over EDV (measured: 120 mL)
  // against a correctly pediatric threshold (measured: 51.7 mL for a 0.199
  // body scale), so the branch fired on a ventricle that was not dilated at all
  // — and because the dilation term divides by bodyScale, the small denominator
  // drove mrTarget straight to its 0.5 ceiling. With the rise time constant of
  // 1.5 s that reached mitralRegurgFrac 0.368 within a single 2 s tick, on
  // EVERY pediatric scenario (croupToddler, febrileSeizureToddler,
  // bronchiolitisInfant, pertussisInfant, epiglottitisChild all measured
  // identical), decaying away again over the following ~60 s.
  //
  // This was harmless for as long as nothing downstream consumed
  // mitralRegurgFrac — the lumped model's use of it was overwritten by the
  // publish block, and the full loop had no regurgitation term at all. Wiring
  // regurgitation into the authoritative solver makes it real, which would
  // have given every child a minute of spurious moderate mitral regurgitation
  // exactly during the player's initial assessment.
  //
  // Fix: only trust the comparison when the EDV being read was computed at the
  // SAME body scale as the threshold it is being compared against. pat._edvScale
  // is stamped where edv is set below; it is undefined on the very first tick
  // (branch correctly skipped) and differs only while a patient's scale is
  // still settling. This changes nothing for any patient whose scale is stable,
  // which is every patient after their first couple of ticks.
  const bodyScale = pat._bodyScale || 1;
  if (pat._edvScale === bodyScale && pat.edv > 260 * bodyScale) {
    mrTarget = Math.max(mrTarget, Math.min(0.5, (pat.edv - 260 * bodyScale) * 0.006 / bodyScale));
  }
  mrTarget = clamp(mrTarget, 0, 0.9);
  // ko (opening/worsening rate) faster than kc (closing/recovery rate) —
  // acute papillary rupture or endocarditis progresses quickly, but a valve
  // doesn't spontaneously reseal once stretched/perforated, so the state
  // chases upward fast and downward slowly.
  const mrTau = mrTarget > (pat.mitralRegurgFrac ?? 0) ? 1.5 * S : 12 * S;
  pat.mitralRegurgFrac = clamp(approach(pat.mitralRegurgFrac ?? 0, mrTarget, dt, mrTau), 0, 0.9);
  pat.mitralStenosisSeverity = rf.mitralStenosis ? clamp(rf.mitralStenosisSeverity ?? 0.5, 0, 0.9) : 0;

  // ---- Aortic valve ----
  let aiTarget = rf.aorticRegurg ? clamp(rf.aorticRegurgSeverity ?? 0.35, 0, 0.9) : 0;
  // Acute aortic dissection involving the root, or endocarditis with leaflet
  // destruction, drive rapidly progressive incompetence. Queue item V2-24(b):
  // this used to hardcode 0.5 (uncalibrated — see the aorticDissection
  // condition's own in-code history) and was found, once actually measured
  // against the authoritative full-loop ODE, to crash EF to ~0.31 regardless
  // of whether this constant was 0.05 or 0.9 — because this line only feeds
  // the LUMPED-model-only `aorticRegurgFrac` (never consumed by the
  // authoritative ODE per section 5's "two solvers" rule); the real knob is
  // `arStructuralTarget` a few lines below, which DOES reach the ODE. Kept
  // in sync with that one anyway (both should agree for any future direct
  // reader of `aorticRegurgFrac`), now reusing this SAME function's own
  // already-established "moderate AR" default (0.35, the `aorticRegurgSeverity
  // ?? 0.35` fallback immediately above) instead of inventing a separate,
  // more severe dissection-specific number.
  if (rf.aorticDissection) aiTarget = Math.max(aiTarget, 0.35);
  if (rf.endocarditis) aiTarget = Math.max(aiTarget, (pat._infectionSeverity ?? 0.5) * 0.6);
  aiTarget = clamp(aiTarget, 0, 0.9);
  const aiTau = aiTarget > (pat.aorticRegurgFrac ?? 0) ? 1.0 * S : 15 * S;
  pat.aorticRegurgFrac = clamp(approach(pat.aorticRegurgFrac ?? 0, aiTarget, dt, aiTau), 0, 0.9);
  pat.aorticStenosisSeverity = rf.aorticStenosis ? clamp(rf.aorticStenosisSeverity ?? 0.5, 0, 0.9) : 0;

  // ---- HYPERTROPHIC OBSTRUCTIVE CARDIOMYOPATHY (queue item 7 / section 8's
  // Cardiac backlog) — a DYNAMIC left-ventricular-outflow-tract obstruction,
  // deliberately built as a separate field composed into aorticStenosisSeverity
  // (Math.max, same "isolate my own contribution" idiom several other
  // condition-composition sites in this file already use) rather than
  // reusing pat.riskFactors.aorticStenosis directly — mechanistically the
  // consequence is identical (added resistance in series with LV ejection,
  // the exact PV-loop effect eaEff already models), but the CAUSE and the
  // clinically-load-bearing difference is that HOCM's obstruction is NOT
  // fixed the way a calcified aortic valve is: real LVOT gradient varies
  // beat-to-beat with loading conditions (2020 ACC/AHA HCM guideline; Maron
  // & Maron, Lancet 2013) — it worsens with a SMALLER, EMPTIER ventricle
  // (systolic anterior motion of the mitral valve brings the septum and
  // valve closer together as the chamber empties), with HIGHER
  // contractility (a more vigorous systolic ejection accentuates SAM), and
  // with LOWER afterload (a vasodilated patient's LV empties faster and
  // more completely, worsening the same geometry) — the textbook, often
  // paradoxical clinical teaching: nitrates, diuretics, and inotropes all
  // WORSEN this lesion, and volume/pure-alpha vasoconstriction (raising
  // preload and afterload, NOT contractility) is the correct field response.
  //
  // pat.riskFactors.hocmSeverity is the STRUCTURAL septal-hypertrophy
  // magnitude (0-1, scenario-authored, static for the encounter — septal
  // thickness does not change over a single call, same reasoning
  // aorticStenosis's own comment gives for its own static severity). The
  // DYNAMIC multiplier below is recomputed every tick from three real,
  // already-live inputs (no new state needed):
  //  - preloadFactor: LVEDV relative to a normal-adult reference (120 mL,
  //    body-scaled) — a smaller chamber (dehydration, tachycardia cutting
  //    diastolic filling time, venodilator preload loss) raises it.
  //  - contractFactor: pat.contractility relative to its own 1.0 resting
  //    reference — a hyperdynamic/catecholamine-driven ventricle raises it.
  //  - afterloadFactor: pat.svr relative to the patient's own baseSVR
  //    reference — vasodilation (nitrates, sepsis, anaphylaxis) raises it.
  // All three read LAST TICK's value (updateValves runs before
  // updateContractility/SVR are recomputed this tick, the same one-tick lag
  // the MR annular-dilation term above already accepts) — same
  // stale-body-scale guard as that term, since a pediatric patient's
  // carried-over adult-reference EDV comparison would otherwise be wrong on
  // the first few ticks.
  if (rf.hocm) {
    const hocmSev = clamp(rf.hocmSeverity ?? 0.6, 0, 1);
    const edvRef = 120 * bodyScale;
    const edvNow = (pat._edvScale === bodyScale && pat.edv > 0) ? pat.edv : edvRef;
    // <1 when well-filled (protective), >1 when underfilled (aggravating).
    const preloadFactor = clamp(edvRef / Math.max(20 * bodyScale, edvNow), 0.5, 2.2);
    const contractFactor = clamp(pat.contractility ?? 1, 0.4, 2.5);
    const svrRef = pat.baseSVR || 900;
    // <1 when afterload is elevated (protective), >1 when vasodilated (aggravating).
    const afterloadFactor = clamp(svrRef / Math.max(150, pat.svr || svrRef), 0.5, 2.5);
    // MEASURED (throwaway probe, stripped — see conditions.js's hocmObstructive
    // comment for the numbers): a resting, euvolemic, normotensive HOCM
    // patient's own compensated resting gradient should land sub-obstructive
    // (the real ACC/AHA obstructive-HCM threshold is a RESTING gradient of
    // >=30 mmHg — many HOCM patients are non-obstructive at rest and only
    // become gradient-positive with provocation), while the same patient
    // dehydrated/vasodilated/tachycardic lands solidly into the range that
    // produces measurable hemodynamic collapse. 0.30 is the scale coefficient
    // that lands both cases at their measured, cited targets (re-measured
    // this session against this suite's own probe() harness — see
    // mechanismWiring.mjs's HOCM section for the actual numbers).
    const dynamicMult = clamp(0.4 * preloadFactor + 0.35 * contractFactor + 0.25 * afterloadFactor, 0.35, 3);
    pat.hocmObstruction = clamp(hocmSev * dynamicMult * 0.30, 0, 0.9);
  } else {
    pat.hocmObstruction = 0;
  }
  pat.aorticStenosisSeverity = Math.max(pat.aorticStenosisSeverity, pat.hocmObstruction);

  // ---- STRUCTURAL-ONLY regurgitation, for the authoritative solver ---------
  // The full-loop ODE (queue item 41) consumes THESE, not the composite
  // fractions above. The split is a deliberate, measured scoping decision, and
  // the reasoning is worth keeping because it is the whole reason this batch
  // shipped as much as it did and no more.
  //
  // The composite pat.mitralRegurgFrac mixes three sources: explicitly declared
  // valve disease (risk factors), ischemic papillary dysfunction (atp<0.6), and
  // annular dilation. For as long as nothing consumed it at an observable —
  // the lumped model's use was overwritten by the publish block, and the full
  // loop had no regurgitation term at all — none of those three had ever been
  // measured against anything. Wiring regurgitation into the authoritative
  // solver makes all three real at once, and MEASURED, the ischemic one is not
  // yet calibrated to ship:
  //   • acs at 900 s went to CO 3.27 L/min (EF 0.272) against a pre-change
  //     ~6.0, i.e. an uncomplicated evolving infarct became cardiogenic shock;
  //   • unstableAngina — which by definition involves NO necrosis and should
  //     not develop meaningful regurgitation at all — lost ~32% of its cardiac
  //     output;
  //   • re-tuning the threshold/gain (tried at atp<0.35, gain 0.6) did NOT
  //     resolve it, because the loop contains a real emergent feedback:
  //     regurgitation unloads the ventricle, which LOWERS myocardial work and
  //     RAISES atp, which feeds back into the ischemic term that produced it.
  //     That coupling is genuine compensated-MR physiology, and it means the
  //     coefficient cannot be identified from a single forward run — it needs a
  //     proper controlled A/B against the ischemic family, which is its own
  //     piece of work, not a coefficient tweak inside this batch.
  // Documented ischemic MR after acute MI is usually MILD; the moderate-severe
  // form marks a poor prognosis rather than the default course, and the severe
  // form needs papillary infarction or rupture (~1% of MIs). So the current
  // magnitude is very likely too aggressive — but "very likely too aggressive"
  // is not a calibrated number, and guessing one to make a suite pass is
  // exactly what this project forbids.
  //
  // Consuming only the structural component therefore leaves EVERY existing
  // scenario's observable behavior exactly as it was before this batch (no
  // shipped scenario declares valve risk factors — grep-confirmed), while the
  // declared-valve-disease pathway is fully live and fully asserted. The
  // ischemic and annular-dilation components keep being computed exactly as
  // before and keep feeding the lumped model exactly as before; they simply do
  // not yet reach the authoritative solver. Wiring them in, with a real
  // controlled calibration, is filed as its own queue item.
  // V2-24 RE-INVESTIGATION (a later session): re-checked whether a genuinely
  // different angle exists for the ischemic-MR piece above before touching
  // anything, per the standing instruction not to retry a documented failure
  // blind. Two candidate angles were considered, neither was shipped:
  //   (1) "a much smaller, more conservative coefficient" — ruled out as NOT
  //       actually a different angle from what was already tried: the batch
  //       above already re-tuned BOTH threshold (atp<0.35) and gain (0.6) and
  //       still hit the emergent unload->raise-atp->reduce-ischemic-term loop.
  //       The failure mode is a single-forward-run identifiability problem,
  //       not a magnitude problem — a smaller coefficient shrinks the loop's
  //       amplitude but does not remove it, and "smaller" is exactly the kind
  //       of guessed-to-make-a-test-pass number section 4 forbids without a
  //       real controlled A/B to anchor it against.
  //   (2) "gate on a much higher, clearly-severe-wall-motion threshold" —
  //       also not a new angle: it is the same re-tuned-threshold attempt
  //       already tried and documented as insufficient above, restated.
  // SHIPPED (2026-09-30, queue item 1's Phase 2, continuous tethering term
  // only — the discrete papillary-rupture event below is still deferred).
  // Both prior attempts here gated on LIVE pat.atp, which re-enters the
  // unload -> reduce-myocardial-work -> raise-atp -> shrink-the-very-term-
  // that-unloaded-it loop this file's own V2-24 comments already trace in
  // detail. The fix is not a smaller coefficient (already tried and
  // rejected above, twice) — it is gating on a quantity that CANNOT
  // participate in that loop at all: `pat.contractilityFactor`'s own
  // necrosis-driven loss is a real but effectively one-way state for the
  // MI family (both ami's flat -0.018/min decay and the NSTEMI/
  // unstableAngina wavefront's own `necro` term only ever REDUCE it; a
  // regurgitation-driven contractility RECOVERY was never built, could not
  // be, and is not what "unloading" means here anyway). Ischemic MR is
  // therefore driven by how much contractile mass has already been lost
  // (`1 - contractilityFactor`), not by how ischemic the tissue is RIGHT
  // NOW — the correct clinical framing regardless: papillary dysfunction
  // follows actual infarction, not transient demand ischemia.
  //
  // Territory gate reuses `pat.infarctTerritory` (queue item text
  // elsewhere in this document — set only by ami/chestPainM/chestPainF,
  // confirmed by grep before writing this). The posteromedial papillary
  // muscle has a SINGLE blood supply (usually the PDA off the RCA) in
  // most hearts, so inferior/posterior infarcts carry the real clinical
  // ischemic-MR risk; the anterolateral papillary muscle has DUAL supply
  // (LAD diagonal + circumflex marginal) and rarely infarcts in isolation
  // (Voci, Bilotta & Caretta, J Am Soc Echocardiogr 1995; Barzilai,
  // Davis & Kouchoukos, Am J Cardiol 1990). A patient with NO diagnosed
  // territory at all (acs/nstemi/unstableAngina — none of the three sets
  // infarctTerritory, confirmed by grep) gets territoryBias 0, which
  // satisfies the regression guard this file's own V2-24 comment calls
  // for (unstableAngina, which has no necrosis by definition, must show
  // ~0 MR) by CONSTRUCTION, not as a separate check bolted on.
  //
  // MEASURED at t=900s (physio()/activePatient(), not reconstructed):
  // chestPainM (inferior) reaches contractilityFactor 0.681 ->
  // necrosisExtent 0.319 -> ischemicMrTarget 0.16 (mild-moderate, matching
  // the literature's own "ischemic MR after MI is usually MILD" — Silbiger,
  // J Am Soc Echocardiogr 2019); ami (anterior, territoryBias 0.15) reaches
  // the same 0.319 necrosisExtent but only 0.024 ischemicMrTarget
  // (anterior-wall MI rarely causes clinically significant MR, correctly
  // negligible here); acs/nstemi/unstableAngina (no territory) all measure
  // EXACTLY 0, confirmed directly, not assumed from the gate's own logic.
  const necrosisExtent = clamp(1 - (pat.contractilityFactor ?? 1), 0, 1);
  const mrTerritoryBias = pat.infarctTerritory === "inferior" || pat.infarctTerritory === "lateral" ? 1.0
    : pat.infarctTerritory === "anterior" ? 0.15
    : 0;
  const ischemicMrTarget = clamp(necrosisExtent * 0.5 * mrTerritoryBias, 0, 0.35);
  let mrStructuralTarget = rf.mitralRegurg ? clamp(rf.mitralRegurgSeverity ?? 0.35, 0, 0.9) : 0;
  mrStructuralTarget = Math.max(mrStructuralTarget, ischemicMrTarget);
  let arStructuralTarget = rf.aorticRegurg ? clamp(rf.aorticRegurgSeverity ?? 0.35, 0, 0.9) : 0;
  // Queue item V2-24(b) — THIS is the constant that actually reaches the
  // authoritative full-loop ODE (`derivative()`'s Qar term reads
  // `pat.aorticRegurgStructural`, not `aorticRegurgFrac` above). Measured by
  // direct probe against `chest` (the aorticDissection scenario) at t=240s:
  // the previous hardcoded 0.5 gave EF 0.53->0.31 and pulse pressure
  // 34->59mmHg — the same uncalibrated severity item 41 shipped-then-reverted
  // for exactly this reason. Recalibrated to 0.35 (this function's own
  // existing "moderate AR" default, reused rather than a new invented
  // number) gives EF 0.53->0.35 and pulse pressure 34->53mmHg: still a real,
  // clinically classic widened-pulse-pressure/volume-overload signature
  // (Stanford type A dissection extending into the aortic root disrupts
  // leaflet coaptation in a large fraction of proximal dissections), just
  // not severity 0.5's near-acute-heart-failure magnitude.
  if (rf.aorticDissection) arStructuralTarget = Math.max(arStructuralTarget, 0.35);
  if (rf.endocarditis) arStructuralTarget = Math.max(arStructuralTarget, (pat._infectionSeverity ?? 0.5) * 0.6);
  arStructuralTarget = clamp(arStructuralTarget, 0, 0.9);
  // Same rise-fast / recover-slow asymmetry as the composite states above: a
  // valve does not spontaneously reseal once torn or stretched.
  const mrsTau = mrStructuralTarget > (pat.mitralRegurgStructural ?? 0) ? 1.5 * S : 12 * S;
  const arsTau = arStructuralTarget > (pat.aorticRegurgStructural ?? 0) ? 1.0 * S : 15 * S;
  pat.mitralRegurgStructural = clamp(approach(pat.mitralRegurgStructural ?? 0, mrStructuralTarget, dt, mrsTau), 0, 0.9);
  pat.aorticRegurgStructural = clamp(approach(pat.aorticRegurgStructural ?? 0, arStructuralTarget, dt, arsTau), 0, 0.9);
}
function updateContractility(pat, dt) {
  let base = (pat.contractilityFactor ?? 1);
  if (pat.ageProfile.isNeonate()) base *= 0.75;
  if (pat.riskFactors.heartFailure) base *= 0.7;

  // Adrenergic inotropy (neural + circulating), additive, saturating.
  let adren = 1 + 0.5 * clamp(pat.beta1Tone, -1, 3);

  // TAKOTSUBO: the beta-2 Gs->Gi switch. Above a threshold of CIRCULATING
  // catecholamine drive, apical beta-2 receptors are thought to flip from Gs
  // (positive inotropy) to Gi (negative inotropy), producing the reversible
  // stunning that defines the syndrome. Modelled here as a negative term
  // subtracted from the adrenergic inotropy, active only while the takotsubo
  // state is present.
  //
  // giDrive is CIRCULATING + EXOGENOUS adrenergic drive, deliberately excluding
  // pure neural tone (pat.neuralSymp): the trigger is adrenal-medullary /
  // exogenous catecholamine, not sympathetic nerve traffic, which correctly
  // predicts that neuraxial blockade (which cuts neural tone) would underperform.
  // It is weighted toward the beta-2 component because the switch is a beta-2
  // phenomenon — exogenous epinephrine (high beta-2, _beta2Drug) drives it hard
  // (the documented iatrogenic-takotsubo paradox), a beta-1-selective inotrope
  // like dobutamine less so, and a beta-blocker pulls it DOWN (correct therapy).
  // Using _beta1Drug/_beta2Drug rather than a re-read of beta2Tone keeps neural
  // tone out and makes the exogenous contribution explicit. The absolute
  // beta-2 biology is being approximated through the drug-level handles the
  // engine exposes; this is a documented simplification, not a claim that the
  // engine resolves receptor subtypes at the myocyte.
  if (pat.takotsubo) {
    const stun = clamp(pat.takotsuboStun ?? 0, 0, 1);
    // SUSTAINED stunning floor (slow tau): this is the bulk of the contractility
    // drop and it persists for weeks after catecholamines clear. It does NOT
    // depend on current adrenergic drive — it is the stunning already done.
    // Calibrated (with the surge term below) so the acute presentation lands
    // contractility ~0.65 / EF ~40%, the registry mean, and settles to a milder
    // residual as the surge clears.
    const sustained = 0.30 * stun;

    // ACUTE aggravation from EXOGENOUS catecholamines (fast). This is the
    // teaching point and it must be able to OVERRIDE the positive inotropy a
    // catecholamine also produces — clinically, at the apex the beta-2 Gi
    // response wins over the basal Gs response, which is the whole syndrome. The
    // positive adrenergic term above moves by ~0.5*d(beta1Tone); to dominate it,
    // the aggravation reads exogenous adrenergic drug on a LOW threshold so that
    // even a modest pressor dose bites, and it is weighted toward beta-2 (the
    // switch is a beta-2 phenomenon): epinephrine (_beta2Drug high) drives it
    // hard, a beta-1-selective inotrope less. A beta-BLOCKER makes exoDrive
    // NEGATIVE; the max(0, ...) means it cannot create positive inotropy through
    // this arm, but by removing the surge-driven acute penalty (below) and
    // letting the ventricle recover, beta-blockade is net beneficial — see the
    // beta-blocker note.
    const exoDrive = (pat._beta2Drug ?? 0) + 0.6 * (pat._beta1Drug ?? 0);
    // gain 1.6 so a push-dose epi (exoDrive ~0.25) adds ~0.40 of negative
    // inotropy — enough to overwhelm the ~0.10 of positive inotropy the same
    // dose adds via beta1Tone, so EF falls (the paradox).
    const acute = Math.max(0, 1.6 * exoDrive) * stun;

    // The endogenous circulating surge (fast tau) also aggravates acutely, on
    // the same footing, so the acute phase is more depressed than the sustained
    // plateau and lightens as the surge clears over hours. A beta-blocker that
    // pulls beta1Tone (and thus the surge's downstream effect) down does not
    // touch takotsuboSurge directly, but its therapeutic value is the recovery
    // it permits plus not ADDING to exoDrive — the caveat below applies.
    const surgeAcute = 0.20 * (pat.takotsuboSurge ?? 0) * stun;

    adren -= (sustained + acute + surgeAcute);
  }
  // The Gi subtraction cannot drive net adrenergic inotropy below a physiological
  // floor — even a maximally stunned takotsubo apex is hypokinetic, not
  // asystolic, and the base stays hyperkinetic, so the WHOLE-chamber inotropy
  // retains a floor. Without this a large exogenous catecholamine load could push
  // adren negative and the contractility clamp would read it as near-arrest.
  adren = Math.max(0.35, adren);

  // Metabolic / electrolyte modifiers.
  let mod = 1;
  if (pat.ph < 7.2) mod *= Math.max(0.5, 1 - (7.2 - pat.ph) * 1.2);   // acidosis
  if (pat.coreTemp < 33) mod *= Math.max(0.6, 1 - (33 - pat.coreTemp) * 0.03);
  if (pat.k > 6.5) mod *= Math.max(0.6, 1 - (pat.k - 6.5) * 0.15);
  if (pat.ca < 2.0) mod *= Math.max(0.6, pat.ca / 2.0);               // ionised Ca dependence
  const atpFactor = 0.3 + 0.7 * pat.atp;                              // ischemic depression
  // POST-ISCHEMIC MYOCARDIAL STUNNING (queue item 17) — a SEPARATE, much
  // slower-decaying depression on top of atpFactor above. atpFactor tracks
  // pat.atp directly, which recovers within minutes of reperfusion (atp's
  // own tau is 6 min) — real post-MI stunning persists for HOURS TO DAYS
  // even after flow is restored (Braunwald & Kloner). pat.acsStun (set by
  // the acs condition, conditions.js) decays over ~48-72 hours, negligible
  // within any call, so a reperfused-but-recently-ischemic ventricle stays
  // measurably weaker than atpFactor alone would predict — matching the
  // same slow-tau template takotsuboStun already uses for an analogous,
  // longer-scale phenomenon. 0.3 max depression at full stun, same
  // magnitude takotsubo's own sustained term uses.
  const stunFactor = 1 - 0.3 * clamp(pat.acsStun ?? 0, 0, 1);

  // Direct pharmacological negative inotropy (see myocardialDepression in
  // pk.js). Separate from the adrenergic term because it acts on the myocyte
  // rather than through a receptor the sympathetic system also uses.
  // pat.tcaInotropyFactor (tricyclicOverdose, conditions.js) is a separate,
  // condition-owned multiplier composed alongside the pk-owned pat.drugInotropy
  // — that field is reset to 1 every tick by pk.js (pk.js:714) and re-derived
  // only from active drug instances, so a condition writing it directly is
  // silently wiped before this function runs (measured directly).
  const drugInotropy = Math.max(0.2, Math.min(1.5, (pat.drugInotropy ?? 1) * (pat.tcaInotropyFactor ?? 1)));
  pat.contractilityTarget = clamp(base * adren * mod * atpFactor * stunFactor * drugInotropy, 0.05, 3);

  // Adrenergic changes are fast; but because ischemic depression enters through
  // the slowly-moving ATP state, stunning recovers over the long ATP timescale
  // automatically. Use a short tau for the fast-moving parts.
  pat.contractility = approach(pat.contractility, pat.contractilityTarget, dt, 4 * S);

  // Active relaxation (lusitropy) tracks ATP and adrenergic tone, scaled by any
  // disease-imposed diastolic dysfunction (lusitropyFactor). Relaxation is an
  // ACTIVE, ATP-consuming process (SERCA-mediated calcium re-uptake), so it is
  // impaired by exactly the disease states that impair contraction — and in
  // ischemic pump failure diastolic dysfunction is obligatory, not optional.
  // Without this input a disease could depress systole while leaving relaxation
  // perfectly normal, letting the failing ventricle dilate freely and recruit
  // its stroke volume straight back via Frank-Starling.
  const lusiBase = clamp(pat.lusitropyFactor ?? 1, 0.2, 1.5);
  const lusiTarget = clamp(lusiBase * (0.4 + 0.6 * pat.atp + 0.1 * clamp(pat.beta1Tone, 0, 2)), 0.2, 1.2);
  pat.lusitropy = approach(pat.lusitropy, lusiTarget, dt, 6 * S);
}

// Coronary oxygen supply vs myocardial demand -> ATP balance. Sustained deficit
// depletes ATP (ischemia), depressing contractility and relaxation, raising
// ectopy, and — if prolonged — driving irreversible loss.
function updateMyocardialOxygen(pat, dt) {
  const hb = pat.hb ?? 0;   // derived once per substep in patient.js
  const cao2 = 1.34 * hb * (pat.sao2 || 97) / 100 + 0.003 * (pat.pao2 || 95);
  const cao2Frac = cao2 / 20; // ~1 at rest

  // Demand ~ pressure-volume area (PVA) x heart rate. PVA = external stroke
  // work (SV x mean ejection pressure) + the elastic potential energy stored
  // in the wall at end-systole (0.5 x Ees x (ESV - V0)^2) — the two
  // components of the PV-loop area that Suga/Sagawa showed track myocardial
  // O2 consumption far better than a rate-pressure-product surrogate, because
  // it responds correctly to preload/afterload/contractility changes that
  // move ESV and Ees without necessarily moving SBP. Referenced against its
  // own resting value so the demand index still reads ~1 at a normal resting
  // beat, keeping supply/demand balance and ATP kinetics unchanged.
  const bodyScale = pat._bodyScale || 1;
  const V0v = 10 * bodyScale;                    // matches updateCardiovascular's V0
  const strokeWork = pat.sv * pat.map;           // mmHg*mL, external work per beat
  const potentialE = 0.5 * pat.ees * Math.pow(Math.max(0, pat.esv - V0v), 2);
  const pva = strokeWork + potentialE;           // mmHg*mL per beat
  const PVA_REF = 8140;                          // PVA at a textbook resting beat (bodyScale 1)
  const pvaDemand = (pva * pat.hr / PVA_REF) / 75;  // normalize the HR factor out too (~1 at rest)
  // BASAL MYOCARDIAL METABOLISM. The term above is the cost of PUMPING, so it
  // goes to zero the moment the heart stops (in asystole hr = 0 and sv ~ 0).
  // Scored against a positive coronary supply that meant myoO2Balance came out
  // POSITIVE in cardiac arrest and ATP REGENERATED — measured at exactly 1.000
  // through a 15-minute asystolic arrest with zero cardiac output. A heart with
  // no perfusion was topping up its energy reserve.
  //
  // A quiescent myocardium is not a free myocardium: it still runs the Na/K and
  // SERCA pumps, maintains its resting potential and preserves membrane
  // integrity. The classic partition of resting MVO2 is roughly 20-25% basal
  // metabolism, ~1% electrical activation and the balance contraction — so
  // basal demand is ~0.2 on this index, which is normalized to ~1 at a resting
  // beat. That is the anchor; it is not fitted to make anything pass.
  //
  // Consequence, and the point of the change: during arrest supply falls with
  // coronary perfusion pressure while basal demand persists, so the balance goes
  // NEGATIVE and ATP declines. Everything already reading pat.atp — contractility
  // (atpFactor), lusitropy, QRS width, AV conduction, the ischemic ectopy
  // substrate, and the atp < 0.1 asystole trigger — then responds, so the
  // myocardium's progression toward being unresuscitatable EMERGES from
  // metabolism rather than from a clock. This is also the physiological basis of
  // ischemic contracture (the "stone heart") after prolonged untreated arrest.
  //
  // Binds ONLY when the heart is barely working: at any normal beat the pumping
  // term far exceeds 0.2, so healthy and near-normal patients are unchanged.
  const BASAL_MYOCARDIAL_DEMAND = 0.2;
  const demand = Math.max(BASAL_MYOCARDIAL_DEMAND, pvaDemand);

  // Supply: coronary perfusion happens in diastole; driven by diastolic
  // perfusion pressure (DBP - CVP), arterial O2 content, and autoregulation.
  // Healthy myocardium has large coronary reserve, so resting supply sits well
  // above resting demand (~2.4x) and ATP stays full. Autoregulation keeps flow
  // roughly constant down to ~60 mmHg; below that, flow falls with pressure.
  // Coronary perfusion pressure and autoregulation are referenced to the
  // patient's OWN age-appropriate blood pressure, not fixed adult numbers — a
  // neonate whose normal DBP is ~40 mmHg autoregulates its coronaries perfectly
  // well and must not be scored as chronically ischemic.
  const perfRef = Math.max(30, 0.8 * pat.mapBaseline);   // adult ~74 mmHg
  const autoregFloor = Math.max(24, 0.65 * pat.mapBaseline); // adult ~60 mmHg
  const perf = Math.max(0, pat.dbp - pat.cvp);
  const autoreg = perf >= autoregFloor ? 1.0 : perf / autoregFloor;
  // A fixed stenosis limits MAXIMAL flow (reserve), not resting supply — so an
  // exercise/tachycardia demand rise outstrips a stenosed bed and causes
  // ischemia while resting flow is preserved.
  const reserve = 1 - pat.coronaryStenosis;
  const restingReserveScale = 3.5;   // ~3.5x coronary flow reserve in health
  const rawSupply = restingReserveScale * (perf / perfRef) * cao2Frac * autoreg;
  const coronaryTarget = Math.min(rawSupply, restingReserveScale * reserve);
  // Coronary inertance: flow chases the autoregulated target rather than
  // snapping to it, same rationale as aortic qAo above — a sudden perfusion-
  // pressure drop (cross-clamp, VF onset, tamponade) doesn't instantly zero
  // coronary flow, it decelerates over the vessel's momentum time constant.
  const CORONARY_INERTANCE_TAU = 0.02; // minutes (~1.2s), coronary bed is smaller/stiffer than aorta
  pat.coronaryFlow = approach(pat.coronaryFlow ?? coronaryTarget, coronaryTarget, dt, CORONARY_INERTANCE_TAU);
  // HISTOTOXIC HYPOXIA AT THE MYOCARDIUM (pat.cytochromeBlock, patient.js —
  // cyanide today, any cytochrome-oxidase toxin later). coronaryFlow above is
  // an oxygen DELIVERY term; myocardium that cannot run the electron transport
  // chain cannot regenerate ATP from that delivery no matter how good the
  // coronary perfusion pressure is. Scaling usable supply by (1 - block) is
  // the exact analog of metabolic.js's own actualVO2 ceiling, applied to the
  // one organ that has its own separate ATP balance in this engine — so the
  // real clinical endpoint (myocardial ATP depletion -> falling contractility
  // -> hypotension, and the pat.arrhythmia.ischemia substrate below) EMERGES
  // from the existing myoO2Balance machinery instead of a condition writing
  // atp/contractility directly. pat.coronaryFlow itself is deliberately left
  // unscaled: it is a real flow, and the flow is genuinely normal here — this
  // is a utilization lesion, not a perfusion one.
  const cytoBlockMyo = Math.min(1, Math.max(0, pat.cytochromeBlock ?? 0));
  const supply = pat.coronaryFlow * (1 - cytoBlockMyo);

  pat.myoO2Balance = supply - demand;

  if (pat.myoO2Balance >= 0) {
    // Surplus: regenerate ATP. Recovery from deep stunning is slow (minutes-hours).
    pat.atp = approach(pat.atp, 1, dt, 6);
  } else {
    // Deficit: ATP falls at a rate proportional to the shortfall.
    pat.atp += pat.myoO2Balance * 0.15 * dt;
  }
  pat.atp = clamp(pat.atp, 0.02, 1);

  // Local ischemic lactate/ectopy substrate accrues when ATP is low.
  if (pat.atp < 0.55) pat.arrhythmia.ischemia += (0.55 - pat.atp) * 0.06 * dt;
  else pat.arrhythmia.ischemia = Math.max(0, pat.arrhythmia.ischemia - 0.02 * dt);
}

// ---------------------------------------------------------------------------
// 4. RHYTHM & ARRHYTHMOGENESIS
//    Independent substrates accumulate through distinct mechanisms; the
//    dominant one determines which rhythm appears. Identical electrolytes can
//    therefore produce different rhythms depending on the underlying substrate.
// ---------------------------------------------------------------------------
export function updateRhythm(pat, dt) {
  // QT / repolarisation (rate-corrected), prolonged by hypoK, hypoMg, hypoCa,
  // and drugs; predisposes to torsades.
  let qtc = 0.40;
  if (pat.k < 3.5) qtc += (3.5 - pat.k) * 0.04;
  if (pat.mg < 0.7) qtc += (0.7 - pat.mg) * 0.1;
  if (pat.ca < 2.1) qtc += (2.1 - pat.ca) * 0.05;
  // Class III potassium-channel blockade prolongs repolarisation. This is the
  // therapeutic action AND the hazard: it suppresses reentry while lengthening
  // the QT, which is the substrate for torsades.
  //
  // 0.15 s of QTc per unit of blockade, raised from 0.06. Identified against the
  // documented figure rather than chosen: amiodarone prolongs QTc by 10-15%, and
  // a standard dose produces a blockade of ~0.30 here, so the constant has to be
  // ~0.15 to land there. The old 0.06 gave +3%. It had looked adequate only
  // because the per-instance summation bug was inflating the blockade itself —
  // fixing the Emax error removed that inflation and exposed the real value.
  qtc += (pat.potassiumChannelBlock || 0) * 0.15;
  // Per-condition QTc offset (seconds). Takotsubo prolongs QTc over days as
  // myocardial edema and altered repolarisation develop (peak day 3-4), which is
  // a real ventricular-arrhythmia substrate — the offset feeds a.repol below and
  // therefore the torsades limb, so a stunned takotsubo ventricle carries the
  // documented torsades risk. Any condition that sets this contributes; it is a
  // genuine repolarisation change (unlike the magnesium term below, which is
  // deliberately kept off qtc).
  qtc += (pat.qtcConditionOffset || 0);
  pat.qt = qtc * Math.sqrt(60 / Math.max(40, pat.hr));

  // ---- PVC burden from multiple mechanisms (not just oxygen debt) ----
  const a = pat.arrhythmia;
  a.hyperK  = pat.k > 5.8 ? (pat.k - 5.8) : 0;
  a.hypoK   = pat.k < 3.0 ? (3.0 - pat.k) : 0;
  a.hypoxic = (pat.sao2 < 80 ? (80 - pat.sao2) * 0.02 : 0) + (pat.ph < 7.15 ? (7.15 - pat.ph) * 2 : 0);
  a.triggered = Math.max(0, pat.catecholLevel - 1.5) * 0.5 + Math.max(0, (pat.ca ?? 2.4) - 3) * 0.3;
  a.repol   = Math.max(0, pat.qt - 0.5) * 4 + a.hypoK * 0.5;
  // HYPOTHERMIC MYOCARDIAL IRRITABILITY (accidentalHypothermia). Below ~30 C
  // the cold myocardium itself becomes a real, well-documented VF substrate —
  // slowed conduction plus heterogeneous repolarisation (the same
  // heterogeneity that produces the Osborn/J wave on the surface ECG) creates
  // reentry circuits independent of ischemia or electrolytes. This is why
  // severely hypothermic arrest is taught as "handle gently" — rough movement
  // can provoke VF in a myocardium this irritable. Raw delta below the 30 C
  // threshold (the point severe hypothermia literature places rising VF risk,
  // distinct from the 28 C "core temp so low CPR may need withholding"
  // threshold this engine does not separately model), same shape as a.hypoK.
  a.hypothermic = pat.coreTemp < 30 ? (30 - pat.coreTemp) : 0;

  // ---- MAGNESIUM AND THE TORSADES TRIGGER ----
  // Torsades is initiated by early afterdepolarizations — a triggered upstroke
  // riding on a prolonged plateau — and magnesium's action is to abolish that
  // trigger, not to shorten the plateau. This is a documented and clinically
  // important dissociation: after a 2 g bolus, "no significant changes were
  // observed in the QT interval" while the arrhythmia stopped (Tzivoni et al.,
  // Circulation 1988;77:392, and repeated in every review since). It is
  // therefore modelled as a separate suppression term on the torsades limb,
  // and deliberately NOT as a subtraction from `qtc` above: routing it through
  // the QT would make the monitor show the drug working, which is exactly what
  // it does not do, and would also suppress every other repolarisation-driven
  // effect that reads a.repol.
  //
  // Concentration-response is identified against the treatment target rather
  // than assumed: upper limit of normal serum magnesium is ~1.05 mmol/L and the
  // level maintained for torsades is >2 mmol/L (StatPearls, Torsade de Pointes;
  // infusion titrated to keep Mg above 2 and stopped above 3). So the term is
  // zero at the top of the normal range and saturated at the documented
  // therapeutic level. It REPLACES the old `if (pat.mg > 1.5) rhythm = "sinus"`,
  // a step function on the observable that converted the rhythm instantly and
  // completely at a threshold nothing in the literature names.
  const magEAD = clamp((pat.mg - 1.05) / (2.0 - 1.05), 0, 1);

  // pat.ectopicFocus (cardiac conditions batch, queue item 7): an isolated,
  // idiopathic irritable ventricular focus — no ischemia, no electrolyte
  // derangement, no catecholamine excess required. Additive alongside
  // scarBurden, the same "structural-but-not-acute" idiom, at a coefficient
  // that lets a fully-irritable focus (ectopicFocus=1) alone reach comfortably
  // past the Lown "frequent" (>1/min) cutoff without needing any other
  // substrate — see prematureVentricularContractions below for the measured
  // value this produces in isolation.
  const pvc = clamp(
    a.ischemia * 6 + a.hypoxic * 3 + a.hyperK * 1.5 + a.triggered * 3 +
    pat.scarBurden * 2 + Math.max(0, 1 - pat.atp) * 4 +
    (pat.ectopicFocus || 0) * 5, 0, 30);
  pat.pvcFrequency = approach(pat.pvcFrequency, pvc, dt, 4 * S);

  // Keep the legacy aggregate in sync so conditions.js (which nudges
  // rhythmInstability directly, e.g. AMI) still composes.
  //
  // QUEUE ITEM 36: the scarBurden term here used to leak unconditionally,
  // regardless of pat.icdSuppressed — measured 10/10 aicdMalfunction trials
  // still reaching genuine VT by minute 15 despite a magnet applied at
  // minute 1, contradicting that condition's own code comment ("the patient
  // does NOT degenerate"). icdShockCount stayed pinned and icdSuppressed
  // stayed true throughout every trial, so the condition's own shock-gated
  // increment (conditions.js, `if (!pat.icdSuppressed) rhythmInstability +=
  // 0.1`) was correctly suppressed — the leak was entirely this passive,
  // unconditional scarBurden*0.1 term, which alone accrues rhythmInstability
  // to ~0.03/min and crosses the downstream vtDrive>0.4 threshold (scarBurden
  // 0.3 + inst*0.5) around minute 8-10 regardless of treatment. Gated on
  // icdSuppressed instead of removed outright: every OTHER scarBurden-bearing
  // condition (ami, nstemi, unstableAngina, prematureVentricularContractions,
  // electricalStorm) never sets icdSuppressed, so `!pat.icdSuppressed` stays
  // true for them and this term behaves exactly as before — only a patient
  // who has actually had the magnet applied loses the passive contribution,
  // which is the physiologically correct reading of what a magnet does: it
  // silences the DEVICE (stopping the shock-driven R-on-T provocation this
  // batch modeled), it does not further destabilise a chronic, already-
  // static structural substrate on its own. Re-measured after this fix:
  // 0/10 trials reach VT within 15 min with the magnet at minute 1 (was
  // 10/10) — see the condition's own comment at aicdMalfunction for the
  // untreated-vs-treated contrast this restores.
  const substrate = a.ischemia * 0.5 + a.hypoxic * 0.15 + a.hyperK * 0.1 +
                    a.repol * 0.1 + a.triggered * 0.15 + a.hypothermic * 0.02 +
                    (pat.icdSuppressed ? 0 : pat.scarBurden * 0.1);
  pat.rhythmInstability = clamp(pat.rhythmInstability + substrate * dt, 0, 2);

  // ---- Hyperkalaemic conduction collapse: peaked T -> wide QRS -> sine ->
  //      asystole. This path is deterministic, not probabilistic. ----
  // QUEUE ITEM 2: this state machine used to read pat.k directly, so a
  // hyperkalaemic patient given calcium stayed in (or still progressed
  // into) wideQRS/asystole even as ionised calcium rose — calcium doesn't
  // lower serum potassium, but it should still be able to hold this state
  // machine at a less severe rhythm, exactly as it narrows the continuous
  // qrsWidth/avConduction terms above (same effK, same identified
  // coefficient — see updateConduction). The a.hyperK PVC/ectopy substrate
  // just above is DELIBERATELY left on raw pat.k, not effK: calcium
  // stabilises the conduction/threshold axis but does not correct the
  // potassium-driven excitability that actually causes ectopy, so a
  // calcium-treated hyperkalaemic patient can still progress to VT from
  // ongoing irritability even while this rhythm classification reads calmer
  // — which is the correct clinical nuance (calcium buys time, it doesn't
  // treat the hyperkalaemia).
  const effK = (pat.k ?? 4) - Math.max(0, (pat.ca ?? 2.4) - 2.4) * 4;
  if (effK >= 9.0 && PERFUSING.includes(pat.rhythm)) { pat.rhythm = "asystole"; return; }
  if (effK >= 7.0 && ["sinus","afib","junctional"].includes(pat.rhythm)) pat.rhythm = "wideQRS";
  else if (effK >= 6.0 && pat.rhythm === "sinus") pat.rhythm = "peakedT";
  else if (effK < 6.0 && pat.rhythm === "peakedT") pat.rhythm = "sinus";
  else if (effK < 7.0 && pat.rhythm === "wideQRS") pat.rhythm = "peakedT";

  // ---- Reentrant SVT is terminated by blocking the AV node ----
  // AVNRT/AVRT circuits run through the AV node, so while conduction through it is
  // transiently depressed enough (adenosine's avSlowing; also vagal maneuvers) the
  // circuit can be interrupted and sinus resumes. Hazard rises with block depth below
  // SVT_BLOCK_THRESHOLD. Constants are fit to the clinical conversion figures for
  // first-dose (6 mg, about 60%) and 12 mg (about 90% cumulative) adenosine.
  // Sinus tachycardia and AF/flutter are not circuits through the node and are untouched.
  if (pat.rhythm === "svt") {
    const SVT_BLOCK_THRESHOLD = 0.75, SVT_BREAK_RATE = 14;   // measured 27/40 at 6 mg, 36/40 at 12 mg;   // per minute at full block
    const depth = clamp((SVT_BLOCK_THRESHOLD - pat.avConduction) / SVT_BLOCK_THRESHOLD, 0, 1);
    if (depth > 0 && Math.random() < 1 - Math.exp(-SVT_BREAK_RATE * depth * dt)) {
      pat.rhythm = "sinus";
      pat.rhythmInstability = 0;
    }
  }

  // ---- Complete heart block from AV nodal failure ----
  if (pat.avConduction <= 0.05 && PERFUSING.includes(pat.rhythm) && pat.rhythm !== "chb") {
    pat.rhythm = "chb";
  } else if (pat.avConduction > 0.3 && pat.rhythm === "chb") {
    pat.rhythm = "sinus";
  }

  if (["asystole", "PEA", "VF"].includes(pat.rhythm)) {
    // Pulseless electrical activity when there is organized depolarisation but
    // effectively no output.
    if (pat.rhythm === "PEA") {
      // Reversible PEA (tension pneumothorax relieved, hemorrhage controlled,
      // preload restored) resolves once genuine output returns and is SUSTAINED
      // — this is return of spontaneous circulation from a fixed cause, not a
      // one-tick flicker. Otherwise PEA is a one-way trap even after the H/T is
      // corrected.
      if (pat.co >= 0.35) {
        pat._rosc = (pat._rosc || 0) + dt;
        if (pat._rosc > 0.25) { pat.rhythm = "sinus"; pat._rosc = 0; return; }
      } else {
        pat._rosc = 0;
      }
    }
    if (pat.co < 0.2 && pat.rhythm !== "VF" && pat.rhythm !== "asystole") pat.rhythm = "PEA";
    return;
  }

  // ---- Substrate-specific degeneration into VT/VF/torsades ----
  const inst = pat.rhythmInstability;
  if (PERFUSING.includes(pat.rhythm)) {
    // Torsades preferentially when repolarisation is the dominant substrate.
    // Magnesium acts HERE as well as on the running episode: what the trial
    // evidence describes is prevention of REINITIATION ("after the MgSO4 bolus,
    // which prevented the recurrence of TdP" — Tzivoni 1988), and recurrence is
    // the characteristic behaviour of this rhythm, which "usually terminates
    // spontaneously but frequently recurs" (Merck Manual Professional). Without
    // this factor the drug would end one episode and the substrate would
    // immediately start another, which is the wrong clinical picture and would
    // have made the treatment look useless for a second reason.
    // PHASE 1 (queue item 1): female sex carries an independent 2-3x baseline
    // TdP hazard multiplier in the clinical literature, not explained solely
    // by a lower QTc threshold (Circulation Research 2026, sex-specific
    // electrophysiology review) -- applied here as a structural risk
    // modifier on the initiation hazard itself.
    const sexHazard = pat.sex === "female" ? 2.5 : 1.0;
    if (a.repol > 0.6 && Math.random() < 0.03 * a.repol * (1 - magEAD) * sexHazard * dt * 20) {
      // Remember what the patient was in, so a self-terminating episode returns
      // them to their own rhythm rather than curing an unrelated AF on the way
      // past.
      pat._preTorsades = pat.rhythm;
      pat.rhythm = "torsades";
      // Episode state (queue item 1, Phase 1): a beat-count/rate-class pair
      // sampled once at onset and held for the episode's own life, replacing
      // the old flat 220 bpm every tick. Rate drawn around Bluzhas's own
      // measured mean/SD, clamped to the measured range; class is whichever
      // side of 220 bpm the draw lands on (53.6% slow / 46.4% fast at these
      // parameters, matching the measured split).
      const gaussStep = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; // ~unit normal-ish, no import needed
      pat._torsadesRate = clamp(218 + gaussStep * 38, 145, 281);
      pat._torsadesRateClass = pat._torsadesRate >= 220 ? "fast" : "slow";
      pat.torsadesBeatCount = 0;
      return;
    }
    // Ischemia/scar -> monomorphic VT; general instability can also tip.
    // SODIUM CHANNEL BLOCKADE RAISES THE THRESHOLD FOR VENTRICULAR ECTOPY.
    // A Class Ib agent (lidocaine) binds preferentially in depolarised ischemic
    // tissue, so its protection is weighted toward the ischemic component of the
    // substrate; a non-selective blocker acts across all of it. Expressed as a
    // reduction in the drive to degenerate rather than as a rhythm override, so
    // a big enough substrate still breaks through — which is why these drugs
    // reduce the incidence of ventricular tachycardia rather than abolishing it.
    const naBlock = clamp(pat.sodiumChannelBlock || 0, 0, 1);
    let vtDrive = a.ischemia + pat.scarBurden + inst * 0.5 + a.hypoxic * 0.3 + a.hypothermic * 0.04;
    if (naBlock > 0) {
      const ischemicShare = vtDrive > 0 ? (a.ischemia + pat.scarBurden) / vtDrive : 0;
      const coverage = pat.sodiumBlockIschemiaSelective
        ? clamp(ischemicShare, 0, 1)
        : 1;
      vtDrive *= (1 - naBlock * coverage * 0.85);
    }
    if (vtDrive > 0.4 && Math.random() < 0.04 * vtDrive * dt * 20) {
      pat.rhythm = "VT";
      // PHASE 5 (queue item 1): morphology is a probabilistic classification of
      // the triggering substrate, not a deterministic substrate->morphology
      // lookup (Dukkipati et al., JACC 2017 — clinical VT commonly reflects
      // substrate x trigger interaction). Scar/reentry substrate biases toward
      // monomorphic VT (a stable, single reentrant circuit); the diffuse
      // substrate (active ischemia, general rhythm instability, hypoxia) biases
      // toward polymorphic VT (a shifting, multi-focal/unstable circuit) — but
      // either can occur from either substrate, so this is a weighted coin
      // flip on the SAME vtDrive components that triggered the episode, not a
      // second independent condition check.
      const scarShare = pat.scarBurden || 0;
      const diffuseShare = a.ischemia + inst * 0.5 + a.hypoxic * 0.3 + a.hypothermic * 0.04;
      const totalShare = scarShare + diffuseShare;
      const pMonomorphic = totalShare > 0 ? clamp(scarShare / totalShare, 0.05, 0.95) : 0.5;
      pat._vtMorphology = Math.random() < pMonomorphic ? "monomorphic" : "polymorphic";
    }
  } else if (pat.rhythm === "torsades") {
    // TORSADES IS SELF-LIMITING FIRST AND LETHAL SECOND, and this branch had
    // only the second half. It offered exactly two exits — degenerate to VF at
    // 0.06 per 3 s (1.2/min) or be converted by a serum-magnesium threshold —
    // so SPONTANEOUS TERMINATION, which is what almost every real episode does,
    // could not happen at all. Measured on the shipped tree: 60 of 60 episodes
    // ended in VF, mean 52 s. Because degeneration was certain and fast,
    // magnesium's 300 s onset could never arrive in time either: the drug that
    // is first-line for this rhythm was unable to affect it in practice no
    // matter what the serum magnesium did. The dead limb was not the magnesium
    // threshold; it was the absence of the outcome the rhythm normally has.
    //
    // Both exits are now competing hazards, written as rates per MINUTE
    // (probability per tick = rate * dt, with dt in minutes).

    // --- SPONTANEOUS TERMINATION ---
    // Documented behaviour: torsades is "a self-limiting arrhythmia that
    // spontaneously dies out after a few tens of cycles" (Issa & Zipes,
    // Clinical Arrhythmology and Electrophysiology), and the mapping literature
    // separates self-terminating from non-terminating episodes at 10 s. At the
    // documented cycle length of 200-400 ms, "a few tens of cycles" is roughly
    // 5-15 s. A rate of 6.0/min gives a mean episode of 10 s, which puts the
    // majority of episodes inside that boundary with a tail running past it.
    // PHASE 1 (queue item 1): beat count is the primary frame -- 150-episode
    // Bluzhas data gives mean 16+-8 beats (min 3, right tail to ~117) at mean
    // cycle length 279+-47 ms, which is *derived from* beats x CL rather than
    // sampled as an independent wall-clock duration, so the two can't drift
    // apart. Rate is per-minute, dt is in minutes, so beats this tick is
    // simply rate * dt.
    pat.torsadesBeatCount = (pat.torsadesBeatCount || 0) + (pat._torsadesRate || 220) * dt;
    // A patient whose rhythm is forced directly to "torsades" (a test harness,
    // or a future mechanism that doesn't go through this file's own onset
    // sampling above) carries no _torsadesRateClass. Default that case to
    // NEUTRAL (matching the engine's pre-Phase-1 behaviour), not "fast" --
    // defaulting to fast biased every such imposed episode toward the worse
    // (lower-termination, higher-VF) class, a real regression caught by
    // mechanismWiring.mjs's own forced-rhythm torsades assertions.
    const rateClass = pat._torsadesRateClass || null;

    const TDP_TERMINATION_RATE = 6.0;    // per minute -> mean episode 10 s
    // The substrate that started the episode also sustains it, which is why
    // fast torsades is documented as BOTH longer-lasting and more likely to
    // fibrillate. a.repol = 0.6 is this engine's own initiation threshold, so
    // termination runs at full rate where the rhythm is only just possible and
    // falls to a quarter of it in a deeply prolonged repolarisation (a.repol
    // ~2.1 and above), giving episodes of ~40 s there.
    const sustain = clamp(1 - (a.repol - 0.6) * 0.5, 0.25, 1);
    // Magnesium acts on the running episode as well as on recurrence: at full
    // effect it exactly cancels the sustaining term (0.25 * 4 = 1.0), so the
    // worst substrate the engine can build still terminates at the unimpeded
    // rate. That is the structural claim — magnesium removes the trigger that
    // keeps re-igniting the circuit — rather than a fitted magnitude. Against
    // Tzivoni 1988, where a single 2 g bolus abolished torsades within 1-5 min
    // in 9 of 12 patients and a second bolus finished the rest.
    // PHASE 1 (queue item 1): fast-class (>=220 bpm) episodes are documented
    // as BOTH longer-lasting and more likely to fibrillate than slow-class
    // ones -- a lower termination rate for the fast class is the "longer-
    // lasting" half of that pairing (the "more likely to fibrillate" half is
    // the VF-hazard weighting below).
    const termRate = TDP_TERMINATION_RATE * sustain * (1 + 3 * magEAD) * (rateClass === "fast" ? 0.6 : 1.0);
    // (slow and null/unclassed both keep the pre-Phase-1 multiplier of 1.0)
    if (Math.random() < termRate * dt) {
      // Back to the rhythm the patient was actually in, not unconditionally to
      // sinus. The substrate is untouched, so an untreated long QT will start
      // the next episode shortly — "usually terminates spontaneously but
      // frequently recurs" (Merck Manual Professional) now emerges instead of
      // being absent.
      pat.rhythm = pat._preTorsades || "sinus";
      pat._preTorsades = null;
      pat.torsadesBeatCount = 0;
      return;
    }
    // --- DEGENERATION TO VF ---
    // "Only in a minority of cases does torsades de pointes degenerate into VF"
    // (Issa & Zipes). Per-episode risk is the ratio of the competing hazards,
    // so 0.7/min against a 6.0/min termination rate puts about 10% of episodes
    // into VF — a minority, and in the same region as sudden death being the
    // presenting event in up to 10% of these patients (StatPearls).
    const TDP_VF_RATE = 0.7;             // per minute at an unstarved myocardium
    // Not a fixed hazard: the rhythm is nonperfusing, so it starves the
    // myocardium it is running in, and pat.atp — this engine's existing
    // myocardial energy state — is the driver already present. NOT AN IDENTIFIED
    // COEFFICIENT: the literature reports that longer and faster episodes
    // fibrillate more often but does not quantify it, so the 4 is a declared
    // design choice (halving myocardial ATP roughly triples the risk) and is
    // recorded here as unfitted rather than presented as measured.
    //
    // STILL DORMANT IN A PREVIOUSLY-WELL PATIENT, even after the queue item 1
    // sysFrac fix (updateCardiovascular). It fires as intended in someone who
    // is ALREADY ischemic when the rhythm starts (ACS, post-arrest, hypoxia —
    // measured below at a held atp of 0.20, where the VF share rises from 8%
    // to 27% of episodes). It does NOT yet fire from the torsades itself in an
    // otherwise-healthy patient: the sysFrac fix measurably reduces cardiac
    // output during torsades (CO 6.17->5.38, MAP 104->97 at HR 220 — see that
    // comment) but a structurally normal coronary bed has ~3.5x resting flow
    // reserve, which comfortably covers the ~1.2-1.3x demand rise HR 220
    // produces, so myoO2Balance stays positive and atp never leaves 1.000 —
    // measured directly, not assumed, by extending the same probe to 20
    // minutes. This term is written, read, and inert for a healthy patient in
    // torsades; it is NOT inert for one who was already ischemic, which is the
    // case it matters most for. Saying so here rather than letting a future
    // session read a fully working mechanism.
    // PHASE 1 (queue item 1): rate class is a primary VF-risk splitter, not
    // just a range clamp -- Bluzhas's own 150-episode series measured ~2.5%
    // VF conversion for slow(<220bpm) episodes vs. substantially higher for
    // fast(>=220bpm) ones (97.5% of that cohort's VF-converting episodes came
    // from the faster group), a ratio of roughly 3.8x (the "Bluzhas ratio"
    // Phase 5's own morphology work reuses). Applied as a rate-class weight
    // on the existing atp-driven hazard rather than a second independent
    // mechanism.
    // (slow and null/unclassed both keep the pre-Phase-1 weight of 1.0)
    const RATE_CLASS_VF_WEIGHT = rateClass === "fast" ? 3.8 : 1.0;
    const degenRate = TDP_VF_RATE * RATE_CLASS_VF_WEIGHT * (1 + 4 * Math.max(0, 1 - pat.atp));
    // UNCONDITIONAL VF FLOOR: Bluzhas's own ">100 QRS complexes" finding is
    // kept as a floor, not the primary trigger now that beat count also
    // drives the continuous hazard above -- any episode reaching 100 beats
    // converts to VF regardless of rate class or atp.
    if (pat.torsadesBeatCount >= 100 || Math.random() < degenRate * dt) {
      pat.rhythm = "VF"; pat._preTorsades = null;
    }
  } else if (pat.rhythm === "VT") {
    // VT -> VF favoured by ongoing ischemia/hypoxia; also self-terminates if
    // the substrate resolves.
    // PHASE 5 (queue item 1): polymorphic VT degenerates to VF far more
    // readily than monomorphic VT — a stable single reentrant circuit
    // (monomorphic) can sustain for a long period, while a shifting/unstable
    // circuit (polymorphic) is already most of the way to the chaotic
    // activation pattern VF is. Reuses the same 3.8x Bluzhas ratio Phase 1's
    // torsades fast/slow-class VF weighting already measured and shipped,
    // rather than inventing a second unfitted multiplier for a mechanistically
    // analogous "unstable vs stable circuit" split. Unclassified VT (forced
    // directly by a test harness or a future caller that bypasses the onset
    // sampling above) defaults to the monomorphic (lower) weight, matching
    // Phase 1's own established "default to the less severe class" guard
    // against biasing every externally-imposed episode toward the worse one.
    const vtMorphWeight = pat._vtMorphology === "polymorphic" ? 3.8 : 1.0;
    const degen = a.ischemia + a.hypoxic * 0.5 + Math.max(0, 0.3 - pat.atp);
    if (degen > 0.3 && Math.random() < 0.05 * degen * vtMorphWeight * dt * 20) pat.rhythm = "VF";
    if (pat.co < 0.15) { /* pulseless VT — mortality handles as arrest */ }
  } else if (pat.rhythm === "VF") {
    if (pat.atp < 0.1 && Math.random() < 0.08 * dt * 20) pat.rhythm = "asystole";
  }

  // Total pump failure with an organized rhythm reads as PEA.
  if (pat.co < 0.12 && PERFUSING.includes(pat.rhythm)) pat.rhythm = "PEA";
}

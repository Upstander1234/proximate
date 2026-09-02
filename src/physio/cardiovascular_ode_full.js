// cardiovascular_ode_full.js — the unified, mass-conserving cardiovascular
// state vector (Task 1), built on top of the valve/elastance primitives that
// already existed in cardiovascular_ode.js (Tasks 3 & 4) and extending them
// to all four chambers, the full vessel loop, and inertial flow (Task 2).
//
// ---------------------------------------------------------------------------
// STATE VECTOR
// ---------------------------------------------------------------------------
// x = [ VLA, VLV, VAo, VSys, VRA, VRV, VPA, VPV,     8 chamber/vessel volumes
//       QAo, QSys, QVen, QPul,                       4 inertial flow states
//       thetaMV, thetaAV, thetaTV, thetaPV ]          4 valve-opening states
//
// This is 16 states rather than the roadmap's headline 14 because the two
// autonomic states (sympathetic, parasympathetic) already have their own,
// more elaborate ODE integrator in cardiovascular.js (updateAutonomic — fast
// neural tone + lagged adrenal catecholamine kinetics, baroreflex firing,
// chemoreflex, etc.). Re-deriving that here as two bare scalar states would
// either duplicate or fight that model. Instead this module TAKES sympathetic/
// parasympathetic tone as external, per-tick INPUTS (they still drive Emax,
// HR, and venous tone below) — the coupling is one-directional into this
// solver, exactly as the roadmap's arrows show autonomic state feeding the
// mechanical system. This is a deliberate scope decision, not an omission —
// flagged here so it's visible on review.
//
// ---------------------------------------------------------------------------
// WHAT THIS FIXES vs. the old solveBeat() in cardiovascular_ode.js
// ---------------------------------------------------------------------------
//   • All 8 compartment volumes are now genuine integrated states, not
//     algebraic quasi-static approximations — including the three that were
//     entirely absent before (LA, Ao is inertial-fed already, Sys, RA, PA, PV).
//   • Blood moves between compartments ONLY through the flow states / valve
//     laws below, so total volume is conserved BY CONSTRUCTION (the sum of
//     all 8 dV/dt telescopes to exactly zero — see verifyMassConservation()).
//   • One global dx/dt = f(x,t) drives every chamber and vessel together,
//     instead of several local solvers.
//   • Two integrators are available: fixed-step classic RK4, and an adaptive
//     embedded Dormand–Prince RK45 (Task 1's "adaptive solver" requirement).
//
// solveBeat() in cardiovascular_ode.js is left untouched and remains the
// fast/guarded default the rest of the engine calls; this module is the new,
// higher-fidelity solver additive tasks 2/3/5/9 should build on. Wiring it in
// as the live default is a separate, follow-up integration step once it has
// been run against real patient parameter ranges — see NOTES at the bottom.
// ---------------------------------------------------------------------------

import { activation } from "./cardiovascular_ode.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Index map, kept as named constants so the rest of the file (and any caller)
// never hardcodes magic numbers.
export const IDX = {
  VLA: 0, VLV: 1, VAo: 2, VSys: 3, VRA: 4, VRV: 5, VPA: 6, VPV: 7,
  QAo: 8, QSys: 9, QVen: 10, QPul: 11,
  thMV: 12, thAV: 13, thTV: 14, thPV: 15,
  // Cumulative regurgitant VOLUME (mL) through the mitral and aortic valves.
  // These are integrated by the same RK4/DOPRI step as everything else, which
  // is exact — the alternative (sampling the instantaneous leak flow at the
  // caller's 50 ms boundaries and trapezoid-integrating) would resolve a
  // half-wave that only occupies part of a ~0.8 s cycle with ~8 samples, and
  // regurgitant volume is precisely the quantity forward stroke volume is
  // derived from, so a few percent of quadrature error there would land
  // straight on reported cardiac output. Appended AFTER the existing 16 so
  // every pre-existing index (including the 12-15 valve states scenarioSweep
  // checks by number) is unchanged. The caller ZEROES these at the start of
  // each engine tick and reads them at the end, so they never accumulate
  // floating-point error over a long session.
  WMR: 16, WAR: 17,
};
export const N_STATE = 18;

// ---------------------------------------------------------------------------
// CARDIAC PHASE.
//
// Phase must be INTEGRATED, never derived as (absolute time mod cycle length).
// The heart has no knowledge of absolute time: it advances continuously through
// its cycle at the instantaneous rate, dPhase/dt = HR/60. Computing
// tn = (t mod T)/T instead makes the phase depend on the CURRENT T, so the
// moment heart rate changes the ventricle teleports to a different point in its
// cycle — truncating an ejection or replaying one. The error is amplified by
// t/T (about a thousand cycles into a 15-minute run), so it grows with session
// length, and because parameters are rebuilt once per engine tick it made the
// whole trajectory depend on tick size: measured LV end-systolic volume was
// 49 mL at 20 ms ticks, 14.7 mL at 100 ms and 38 mL at 2 s, which made every
// downstream cardiac measurement untrustworthy.
//
// p.phase0 is the phase at p.tStart; within a tick T is constant, so phase
// advances linearly and continuity across ticks is exact.
// Rate at which a shut valve extinguishes residual flow momentum (1/s). Large
// enough that closure is effectively instantaneous on the scale of a cardiac
// cycle (~20 ms), small enough to stay well inside the RK4 step's stability.
const VALVE_CLOSURE_DAMPING = 50;

// ---------------------------------------------------------------------------
// REGURGITANT ORIFICE CONDUCTANCE.
//
// An incompetent valve is a hole that stays open when the valve should be
// sealed, so the leak is a resistor across the closed valve, driven by the
// SAME instantaneous transmural gradient the forward flows use. Expressing the
// leak conductance as a fraction of that valve's OWN open-orifice conductance
// (1/Rmv, 1/Rao) rather than as an absolute mL/s/mmHg number is deliberate:
// Rmv/Rao are already body-size scaled by the caller (∝ eScale), so the leak
// automatically inherits the identical scaling with no extra plumbing and a
// child's regurgitant lesion stays proportionate to a child's heart.
//
// WHAT THE SEVERITY PARAMETER ACTUALLY IS, stated precisely because the
// measurement below overturned the assumption this was first written under.
// It is an ORIFICE severity — the size of the hole — NOT a guaranteed
// regurgitant fraction. A single fixed conductance CANNOT produce a
// load-independent regurgitant fraction, and the sweep below shows why: as
// severity rises, total ventricular ejection rises too (the RF denominator)
// and atrial/ventricular pressures equalise somewhat (shrinking the driving
// gradient), so measured RF saturates. That is not a modelling defect, it is
// the real reason echocardiography reports effective regurgitant orifice area
// (the load-independent lesion) SEPARATELY from regurgitant fraction (its
// load-dependent consequence) — and reproducing it is precisely the capability
// this beat-level treatment buys that the old per-beat multiplier could not:
// the lumped model's sv*(1-frac) made RF a constant regardless of afterload,
// heart rate or atrial compliance, which is wrong.
//
// MEASURED declared-severity -> resulting regurgitant fraction, on a
// normotensive resting adult (abdPain, 900 s, traits pinned), at the chosen
// coefficients. Both coefficients are set to 0.020, IDENTIFIED as the value
// that puts measured RF essentially exactly on declared severity at the 0.50
// SEVERE boundary — the clinically load-bearing threshold in the ACC/AHA
// grading scale — rather than fitted to minimise error at some arbitrary
// midpoint:
//     declared   0.10    0.30    0.50    0.70
//     mitral     ~0.20   0.433   0.535   0.566
//     aortic     ~0.19   0.390   0.514   0.589
// So severity 0.5 reads as severe on both valves, and the engine's own
// existing default (updateValves' `?? 0.35`) lands in the moderate-severe
// band. Above ~0.5 the curve flattens: severity keeps enlarging the orifice
// but RF gains little, because atrial pressure rises to meet it. That
// self-limiting behaviour is real — it is why acute severe mitral
// regurgitation presents as flash pulmonary oedema (pressure) rather than as
// unbounded regurgitant volume (flow).
const REGURG_G_MV = 0.020;   // × (1/Rmv) per unit declared severity
const REGURG_G_AV = 0.020;   // × (1/Rao) per unit declared severity

function cyclePhase(t, p) {
  const T = 60 / p.HR;
  const ph = (p.phase0 ?? 0) + (t - (p.tStart ?? 0)) / T;
  return ((ph % 1) + 1) % 1;
}

// ---------------------------------------------------------------------------
// Atrial activation — same Double-Hill shape as the ventricular one (Task 4
// only required LV, so we reuse its normalized curve rather than invent a
// second empirical fit), but phase-shifted earlier in the cycle so atrial
// contraction ("kick") precedes ventricular systole, matching PR-interval
// timing already used elsewhere in the engine.
// ---------------------------------------------------------------------------
// Remap cycle-normalized time so that SYSTOLE occupies p.sysFrac of the cycle
// instead of the activation curve's built-in ~50%.
//
// Ventricular systole is NOT a fixed fraction of the cardiac cycle — its
// DURATION is nearly rate-independent (Weissler: electromechanical systole
// shortens only slightly as heart rate rises), and diastole absorbs almost the
// whole change in cycle length. Treating systole as a constant 50% therefore
// gets the timing wrong at every rate except one: at rest it made systole 0.43 s
// (documented ~0.32 s), giving too long an ejection period and too short a
// diastolic runoff — stroke volume came out at 84 mL against a documented 60-80,
// and diastolic pressure stayed high because the Windkessel had less time to
// drain. At tachycardia the same error runs the other way, leaving too much
// diastole. This remap makes the activation curve span the physiological
// systolic interval and lets diastole take the remainder.
function scaleActivationTime(tn, sysFrac) {
  const f = sysFrac > 0.02 ? sysFrac : 0.5;
  return tn * (0.5 / f);
}

function atrialActivation(tn, atrialPhaseFrac) {
  // Wrap so atrial systole happens just before tn=0 (i.e. late diastole of
  // the PREVIOUS cycle) — shift phase forward by atrialPhaseFrac and wrap.
  let tShift = tn + atrialPhaseFrac;
  if (tShift >= 1) tShift -= 1;
  return activation(tShift);
}

// ---------------------------------------------------------------------------
// Default parameter set. Every value has an mmHg/mL/s-consistent unit and a
// short physiological justification; callers override per-patient via the
// `overrides` argument to buildParams().
// ---------------------------------------------------------------------------
export function buildParams(overrides = {}) {
  const p = {
    // Ventricular elastance (Task 4 — LV double-Hill; RV mirrored, lower Emax)
    EmaxLV: 2.0, EminLV: 0.06, V0LV: 10,
    EmaxRV: 0.55, EminRV: 0.05, V0RV: 12,
    // Atrial elastance — much lower than ventricular, a small "kick" only.
    // Atrial passive (minimum) elastance IS the reciprocal of atrial compliance.
    // Documented left atrial compliance is ~5-10 mL/mmHg and right atrial
    // ~10-15 mL/mmHg, i.e. Emin ~0.10-0.20 and ~0.07-0.10 respectively. The
    // previous values (0.04 / 0.03) correspond to compliances of 25 and 33
    // mL/mmHg — 3-5x too compliant — so the atria absorbed volume without
    // developing pressure: measured RA transmural pressure was 1.9 mmHg at 74 mL
    // where physiology gives 6-8 mmHg at 50-60 mL. That collapsed right atrial
    // pressure (reported CVP -2.1 mmHg, which is not a physiological resting
    // value) and so DOUBLED the venous return driving gradient, MSFP-RAP, to
    // 10.5 mmHg against a documented 3.5-7 — over-filling the ventricle from
    // upstream rather than through any defect in ventricular compliance.
    // V2-24 RE-INVESTIGATION (a later session): before retrying the already-
    // documented-failed "attenuate atrial kick for AV-dissociated rhythms"
    // approach, checked whether a genuinely different mechanism exists for
    // pacemaker syndrome's real hemodynamic problem — per the task's own
    // suggestion, that's retrograde VA conduction / cannon A-waves (atrial
    // contraction against a closed AV valve) plus neurohormonal reflex
    // effects, not simply "less atrial kick." A cannon-A-wave signal (a real,
    // distinct, purely DIAGNOSTIC finding — periodic CVP/JVD spikes for
    // AV-dissociated rhythms) is a genuinely different, lower-risk angle,
    // since it would not touch ventricular filling/stroke volume at all and
    // so could not reproduce the documented "LA-pressure-backup compensation
    // nets MORE filling" failure mode. It was NOT built this session: pat.cvp
    // is read by several other consumers (renal perfusion pressure, the jvd
    // exam finding, shock-state logic) that were not individually re-verified
    // against a new periodic-spike term, and a diagnostic sign alone does not
    // address the actual hemodynamic compromise (hypotension from lost AV
    // synchrony) this sub-item is asking for — building it without measuring
    // both would ship an unverified partial fix. Deferred, not attempted, for
    // a future session with room to validate both halves. See queue item
    // V2-24 (item 41(c)).
    EmaxLA: 0.18, EminLA: 0.15, V0LA: 8, atrialPhaseFrac: 0.86,
    EmaxRA: 0.14, EminRA: 0.10, V0RA: 10,

    // Vascular compliances [mL/mmHg] and unstressed volumes [mL]. Csys/VuSys
    // dominate — the systemic bed holds the bulk of blood volume at low
    // pressure (the same "most volume sits in the venous reservoir at
    // near-zero stressed pressure" fact the existing Guyton MSFP model in
    // cardiovascular.js relies on) — sized so resting Psys lands in the
    // normal ~5-8 mmHg MSFP range rather than the ~65 mmHg an undersized
    // Csys produces (this was wrong in an earlier pass; verified empirically,
    // see NOTES at the bottom).
    Cao: 1.7, VuAo: 90,
    Csys: 185, VuSys: 1850,
    Cpa: 4.0, VuPA: 40,
    Cpv: 10, VuPV: 250,

    // Inertances [mmHg·s²/mL] and resistances [mmHg·s/mL] for the four
    // tracked flow states (Task 2).
    Lao: 0.0006, Rao: 0.006,     // aortic valve outflow tract
    Lsys: 0.0009, Rsys: 1.0,     // systemic arterial run-off (Ao -> Sys)
    Lven: 0.0012, Rven: 0.045,   // venous inertial return (Sys -> RA)
    Lpul: 0.00045, Rpul: 0.0045, // pulmonic valve outflow tract (RV -> PA)

    // Non-inertial (algebraic) resistances for the remaining links.
    Rmv: 0.0025,  // mitral valve open resistance
    Rtv: 0.007,   // tricuspid valve open resistance
    Rpc: 0.09,    // pulmonary capillary/vascular bed resistance (PA -> PV)
    Rpvv: 0.01,   // pulmonary vein -> LA drainage resistance

    // Valve kinetics (opening/closing rate constants), shared form for all
    // four valves: dtheta/dt = ko*dP*(1-theta) if dP>0 else -kc*theta.
    koMV: 60, kcMV: 60, koAV: 60, kcAV: 60,
    koTV: 55, kcTV: 55, koPV: 55, kcPV: 55,

    // Stenosis/regurgitation severities in [0,1], all default to none.
    aorticStenosisSeverity: 0, mitralStenosisSeverity: 0,
    pulmonicStenosisSeverity: 0, tricuspidStenosisSeverity: 0,
    // VALVULAR INCOMPETENCE, 0..1 — ORIFICE SEVERITY, not a guaranteed
    // regurgitant fraction (see the REGURG_G_* block above for the measured
    // severity->RF mapping and why the two cannot be the same number). These
    // are fed from cardiovascular.js's pat.mitralRegurgFrac /
    // pat.aorticRegurgFrac, whose names predate this work; the field names are
    // left alone rather than renamed across the engine, but what they drive
    // HERE is the size of the leak, and the resulting regurgitant fraction is
    // an emergent, load-dependent output.
    // 0 for every patient with a competent valve, which makes the leak terms
    // in derivative() identically zero and leaves the loop bit-for-bit
    // unchanged for anyone without valve disease.
    mitralRegurgFrac: 0, aorticRegurgFrac: 0,

    // Extrinsic pressures.
    externalP: 0,          // pericardial+intrathoracic, acts on all 4 chambers
    thoracicVeinP: 0,       // acts only on the venous return path (Task 10 scope)

    // Nonlinear diastolic stiffening (pericardial / EDPVR constraint). The
    // linear Emin term alone makes a chamber accept unbounded volume at low
    // pressure — a failing or ARRESTED ventricle then balloons without limit
    // (VLV hit >1500 mL in VF). These knees sit ABOVE the normal operating
    // range, so pressure is unchanged for healthy volumes and rises steeply only
    // once a chamber is overfilled, bounding filling the way a real pericardium
    // does. Absolute chamber volumes (mL, adult); scaled by bodyScale by the caller.
    // Nonlinear diastolic pressure–volume relationship (EDPVR) for the
    // ventricles: Ppassive = edpA·(exp(edpB·(V−V0))−1). This REPLACES the far
    // too compliant linear Emin diastolic term — a real ventricle stiffens
    // steeply as it fills, so a low-output/high-filling state (cardiogenic
    // shock) develops a high LVEDP (pulmonary congestion) that backs up and
    // limits further dilation instead of ballooning to Starling-driven high SV.
    // edpA/edpB are chosen so diastolic pressure MATCHES the old Emin curve
    // through the normal operating range (healthy unchanged) and rises above it
    // only past normal EDV. edpB is scaled ∝1/bodyScale by the caller so the
    // curve is body-size invariant.
    // Exponential EDPVR EXCESS (adds to linear Emin). edpU0 = volume above V0 at
    // which the excess starts (just past normal EDV, so normal filling is
    // untouched); edpA/edpB set how steeply LVEDP then climbs toward the
    // ~25-30 mmHg seen in a dilated, congested ventricle. edpU0 ∝ bodyScale and
    // edpB ∝ 1/bodyScale (set by caller) so the curve is body-size invariant.
    edpA: 5.0, edpB: 0.035, edpU0: 115,
    VmaxLV: 185, VmaxRV: 205, VmaxLA: 210, VmaxRA: 210, stiffK: 0.08,

    // Fraction of the cycle occupied by systole. Default 0.5 preserves the
    // curve's native shape; the caller supplies the rate-dependent value.
    sysFrac: 0.5,
    // Cardiac phase at tStart (0..1). Integrated by the caller across ticks.
    phase0: 0, tStart: 0,
    HR: 75,                 // beats/min -> sets cycle length T
  };
  return Object.assign(p, overrides);
}

// ---------------------------------------------------------------------------
// derivative(x, t, p) — the single global dx/dt = f(x,t) for the whole loop.
// ---------------------------------------------------------------------------
export function derivative(x, t, p) {
  const tn = cyclePhase(t, p);

  const stenR = (sev) => 1 + (sev || 0) * 6;

  // --- elastance-driven chamber pressures ---------------------------------
  const tAct = scaleActivationTime(tn, p.sysFrac);
  const eLV = p.EminLV + (p.EmaxLV - p.EminLV) * activation(tAct);
  const eRV = p.EminRV + (p.EmaxRV - p.EminRV) * activation(tAct);
  const aA = atrialActivation(tn, p.atrialPhaseFrac);
  const eLA = p.EminLA + (p.EmaxLA - p.EminLA) * aA;
  const eRA = p.EminRA + (p.EmaxRA - p.EminRA) * aA;

  // ROOT CAUSE of the ~171/132 (mean 145) elevated-pressure bug found this
  // session: these four chamber pressures had +p.externalP baked in, but the
  // vascular compartments below (Pao/Psys/Ppa/Ppv, linear compliance) do NOT
  // carry an externalP term at all. Every valve-gating gradient (dAV uses
  // Plv-Pao, dPV uses Prv-Ppa) and every inertial-flow driving term (dQAo,
  // dQPul) that compares a chamber to a vessel was therefore comparing an
  // externalP-shifted quantity against an unshifted one — at rest,
  // externalP=-4 (normal intrathoracic pressure, not an edge case) skews
  // those specific gradients by a constant 4 mmHg. Confirmed empirically:
  // removing externalP from just these four internal-use quantities (while
  // leaving pressuresFromState()'s externally-reported Plv/Prv/Pla/Pra
  // computed WITH +externalP, since that absolute-pressure conversion is
  // correct for reporting) took the wired-loop's steady state from
  // 171/132/145 back down to the expected 134/104/114 for the same
  // contractility/resistance ratios — an exact match, isolating this as the
  // full explanation, not just a contributing factor.
  //
  // Fix: use the pure transmural (no-externalP) chamber pressures for every
  // valve/flow physics calculation below, since that's the frame the
  // vascular compartments are already in. externalP only matters for
  // absolute-pressure reporting, which pressuresFromState() still applies.
  // Nonlinear overfill stiffening backstop (steep, past the physiologic max).
  const stiff = (V, Vmax, k) => (V > Vmax ? k * (V - Vmax) * (V - Vmax) : 0);
  // Diastolic EDPVR = linear Emin (unchanged in the normal range, so healthy
  // physiology is preserved exactly) PLUS an exponential EXCESS that is zero
  // until the chamber fills past ~normal EDV and then climbs steeply. This is
  // the standard linear+exponential end-diastolic P–V curve: it raises LVEDP
  // (→ LA/pulmonary congestion) and limits further dilation in low-output /
  // high-filling states (cardiogenic shock) without touching normal filling.
  const edpExcess = (u) => (u > p.edpU0 ? p.edpA * (Math.exp(p.edpB * (u - p.edpU0)) - 1) : 0);
  const Plv = eLV * (x[IDX.VLV] - p.V0LV) + edpExcess(x[IDX.VLV] - p.V0LV) + stiff(x[IDX.VLV], p.VmaxLV, p.stiffK);
  const Prv = eRV * (x[IDX.VRV] - p.V0RV) + edpExcess(x[IDX.VRV] - p.V0RV) + stiff(x[IDX.VRV], p.VmaxRV, p.stiffK);
  const Pla = eLA * (x[IDX.VLA] - p.V0LA) + stiff(x[IDX.VLA], p.VmaxLA, p.stiffK);
  const Pra = eRA * (x[IDX.VRA] - p.V0RA) + stiff(x[IDX.VRA], p.VmaxRA, p.stiffK);

  // --- vascular compartment pressures (linear compliance) ----------------
  const Pao = (x[IDX.VAo] - p.VuAo) / p.Cao;
  // Mean systemic filling pressure. Clamped at ≥0: once stressed volume is
  // exhausted (VSys ≤ VuSys, e.g. massive hemorrhage) the veins collapse and
  // MSFP cannot go negative — venous return then fails and preload collapses
  // (Finding #1). Without this clamp a below-unstressed reservoir produced a
  // negative driving pressure that the solver quietly balanced, masking shock.
  const Psys = Math.max(0, (x[IDX.VSys] - p.VuSys) / p.Csys);
  const Ppa = (x[IDX.VPA] - p.VuPA) / p.Cpa;
  const Ppv = (x[IDX.VPV] - p.VuPV) / p.Cpv;

  // --- valve opening-state derivatives (Task 3, all four valves) ---------
  const dTh = (theta, dP, ko, kc) => (dP > 0 ? ko * dP * (1 - theta) : -kc * theta);
  const dMV = dTh(x[IDX.thMV], Pla - Plv, p.koMV, p.kcMV);
  const dAV = dTh(x[IDX.thAV], Plv - Pao, p.koAV, p.kcAV);
  const dTV = dTh(x[IDX.thTV], Pra - Prv, p.koTV, p.kcTV);
  const dPV = dTh(x[IDX.thPV], Prv - Ppa, p.koPV, p.kcPV);

  // --- algebraic (non-inertial) valve flows: AV inflow tracts -----------
  const Rmv = p.Rmv * stenR(p.mitralStenosisSeverity);
  const Rtv = p.Rtv * stenR(p.tricuspidStenosisSeverity);
  const Qmv = clamp(x[IDX.thMV], 0, 1) * Math.max(0, Pla - Plv) / Rmv;
  const Qtv = clamp(x[IDX.thTV], 0, 1) * Math.max(0, Pra - Prv) / Rtv;

  // --- valvular REGURGITATION (incompetence) ------------------------------
  // Both leaks are driven by the same transmural gradients the forward flows
  // use, and both are inherently PHASE-SELECTIVE without needing any explicit
  // phase test — which is the whole reason this belongs in the beat-level
  // solver rather than being applied as a per-beat correction factor:
  //   • Mitral regurgitation flows LV -> LA only while Plv > Pla, i.e. during
  //     systole, when the mitral valve should be shut. In diastole the
  //     gradient reverses and max(0, ·) makes the term exactly zero, so no
  //     valve-state gating is needed (and none should be applied — it is
  //     precisely the CLOSED valve that leaks).
  //   • Aortic regurgitation flows Ao -> LV only while Pao > Plv, i.e. from
  //     the moment of aortic valve closure through the whole of diastole.
  //     During ejection Plv >= Pao and the term is exactly zero.
  // The emergent consequences are the real clinical signs, none of them
  // scripted: AR returns volume to the ventricle during diastole, so LVEDV
  // rises (volume overload) while aortic diastolic pressure falls (the
  // wide-pulse-pressure, "water-hammer" pulse); MR decompresses the LV into
  // the left atrium, so LA pressure — and behind it pulmonary venous
  // pressure — rises while forward output falls.
  // NOTE both leaks scale off the valve's BASE conductance (p.Rmv / p.Rao),
  // deliberately NOT the stenosis-adjusted Rmv/Rao used for forward flow.
  // Stenosis and incompetence are independent lesions of the same valve — a
  // rheumatic mitral valve is commonly both — and dividing the leak by the
  // stenosed resistance would wrongly make a tighter stenosis shrink the
  // regurgitant orifice.
  const Qmr = p.mitralRegurgFrac > 0
    ? (p.mitralRegurgFrac * REGURG_G_MV / p.Rmv) * Math.max(0, Plv - Pla)
    : 0;
  const Qar = p.aorticRegurgFrac > 0
    ? (p.aorticRegurgFrac * REGURG_G_AV / p.Rao) * Math.max(0, Pao - Plv)
    : 0;

  // --- algebraic downstream pulmonary links -------------------------------
  const Qpc = (Ppa - Ppv) / p.Rpc;         // pulmonary vascular bed
  const Qpvla = (Ppv - Pla) / p.Rpvv;      // pulmonary vein -> LA

  // --- inertial flow-state derivatives (Task 2, all four) -----------------
  const Rao = p.Rao * stenR(p.aorticStenosisSeverity);
  const Rpul = p.Rpul * stenR(p.pulmonicStenosisSeverity);
  // VALVE COMPETENCE. Gating only the DRIVING pressure by the valve state is not
  // enough: once thAV reaches 0 the equation degenerates to
  // dQ = -Rao*Q/Lao, so flow coasts down with a time constant Lao/Rao ~ 0.1 s —
  // a third of systole — and the ventricle keeps emptying through a shut valve
  // against an adverse gradient. Measured directly: 96 mL/s of forward aortic
  // flow with the valve closed and left ventricular pressure 57 mmHg BELOW
  // aortic, ejecting ~25 mL after closure and carrying end-systolic volume past
  // the ESPVR (37.8 mL where the ESPVR predicts ~62).
  //
  // A competent semilunar valve permits no flow in either direction once shut.
  // Physically the closing leaflets present a rapidly rising resistance, so the
  // closure term below extinguishes any residual momentum within ~20 ms; it is
  // zero while the valve is open, so it cannot affect normal ejection.
  const avOpen = clamp(x[IDX.thAV], 0, 1);
  const dQAo = (avOpen * (Plv - Pao) - Rao * x[IDX.QAo]) / p.Lao
             - (1 - avOpen) * x[IDX.QAo] * VALVE_CLOSURE_DAMPING;
  const dQSys = (Pao - Psys - p.Rsys * x[IDX.QSys]) / p.Lsys;
  const dQVen = (Psys - (Pra + p.thoracicVeinP) - p.Rven * x[IDX.QVen]) / p.Lven;
  const pvOpen = clamp(x[IDX.thPV], 0, 1);
  const dQPul = (pvOpen * (Prv - Ppa) - Rpul * x[IDX.QPul]) / p.Lpul
              - (1 - pvOpen) * x[IDX.QPul] * VALVE_CLOSURE_DAMPING;

  // Forward-only outflow tracts (a valve state can't pull flow backward
  // through a closed valve; guard exactly as the original solveBeat() did).
  const QAoEff = Math.max(0, x[IDX.QAo]);
  const QPulEff = Math.max(0, x[IDX.QPul]);
  const QVenEff = Math.max(0, x[IDX.QVen]); // Guyton-style: venous return is one-directional

  // --- mass-conserving volume derivatives (Task 1's global loop) ---------
  // Qmr moves volume LV -> LA and Qar moves it Ao -> LV, so each appears once
  // with each sign and the eight dV/dt terms still telescope to exactly zero:
  // mass conservation is preserved BY CONSTRUCTION, as before (and is checked
  // at runtime by scenarioSweep's mass-drift assertion).
  const dVLV = Qmv - QAoEff - Qmr + Qar;
  const dVAo = QAoEff - x[IDX.QSys] - Qar;
  const dVSys = x[IDX.QSys] - QVenEff;
  const dVRA = QVenEff - Qtv;
  const dVRV = Qtv - QPulEff;
  const dVPA = QPulEff - Qpc;
  const dVPV = Qpc - Qpvla;
  const dVLA = Qpvla - Qmv + Qmr;

  const dx = new Array(N_STATE);
  dx[IDX.VLA] = dVLA; dx[IDX.VLV] = dVLV; dx[IDX.VAo] = dVAo; dx[IDX.VSys] = dVSys;
  dx[IDX.VRA] = dVRA; dx[IDX.VRV] = dVRV; dx[IDX.VPA] = dVPA; dx[IDX.VPV] = dVPV;
  dx[IDX.QAo] = dQAo; dx[IDX.QSys] = dQSys; dx[IDX.QVen] = dQVen; dx[IDX.QPul] = dQPul;
  dx[IDX.thMV] = dMV; dx[IDX.thAV] = dAV; dx[IDX.thTV] = dTV; dx[IDX.thPV] = dPV;
  // Regurgitant volume accumulators (see IDX). Integrated by the same step as
  // every other state, so the volume the caller reads back is exact rather
  // than a coarse resampling of a half-wave.
  dx[IDX.WMR] = Qmr; dx[IDX.WAR] = Qar;
  return dx;
}

// Convenience: derive every pressure from a state vector (for logging/plots
// and for callers — e.g. respiratory/renal modules — that need Pra, Ppa, etc.
// without recomputing the derivative).
export function pressuresFromState(x, t, p) {
  const tn = cyclePhase(t, p);
  const tAct = scaleActivationTime(tn, p.sysFrac);
  const eLV = p.EminLV + (p.EmaxLV - p.EminLV) * activation(tAct);
  const eRV = p.EminRV + (p.EmaxRV - p.EminRV) * activation(tAct);
  const aA = atrialActivation(tn, p.atrialPhaseFrac);
  const eLA = p.EminLA + (p.EmaxLA - p.EminLA) * aA;
  const eRA = p.EminRA + (p.EmaxRA - p.EminRA) * aA;
  const stiff = (V, Vmax, k) => (V > Vmax ? k * (V - Vmax) * (V - Vmax) : 0);
  const edpExcess = (u) => (u > p.edpU0 ? p.edpA * (Math.exp(p.edpB * (u - p.edpU0)) - 1) : 0);
  return {
    Plv: eLV * (x[IDX.VLV] - p.V0LV) + edpExcess(x[IDX.VLV] - p.V0LV) + stiff(x[IDX.VLV], p.VmaxLV, p.stiffK) + p.externalP,
    Prv: eRV * (x[IDX.VRV] - p.V0RV) + edpExcess(x[IDX.VRV] - p.V0RV) + stiff(x[IDX.VRV], p.VmaxRV, p.stiffK) + p.externalP,
    Pla: eLA * (x[IDX.VLA] - p.V0LA) + stiff(x[IDX.VLA], p.VmaxLA, p.stiffK) + p.externalP,
    Pra: eRA * (x[IDX.VRA] - p.V0RA) + stiff(x[IDX.VRA], p.VmaxRA, p.stiffK) + p.externalP,
    Pao: (x[IDX.VAo] - p.VuAo) / p.Cao,
    Psys: Math.max(0, (x[IDX.VSys] - p.VuSys) / p.Csys),
    Ppa: (x[IDX.VPA] - p.VuPA) / p.Cpa,
    Ppv: (x[IDX.VPV] - p.VuPV) / p.Cpv,
  };
}

// ---------------------------------------------------------------------------
// INTEGRATORS
// ---------------------------------------------------------------------------

// Classic fixed-step RK4 — unchanged in spirit from cardiovascular_ode.js,
// generalised to the full 16-element state vector.
function rk4Step(x, t, h, p) {
  const add = (a, b, s) => a.map((v, i) => v + b[i] * s);
  const k1 = derivative(x, t, p);
  const k2 = derivative(add(x, k1, h / 2), t + h / 2, p);
  const k3 = derivative(add(x, k2, h / 2), t + h / 2, p);
  const k4 = derivative(add(x, k3, h), t + h, p);
  return x.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

export function integrateRK4(x0, t0, t1, h, p) {
  let x = x0.slice(), t = t0;
  const trace = [{ t, x: x.slice() }];
  while (t < t1 - 1e-12) {
    const step = Math.min(h, t1 - t);
    x = rk4Step(x, t, step, p);
    t += step;
    trace.push({ t, x: x.slice() });
  }
  return { x, trace };
}

// ---------------------------------------------------------------------------
// Adaptive Dormand–Prince RK45 (the roadmap's second allowed solver). Embeds
// a 5th-order solution with a 4th-order error estimate from the same six
// stages, so step size can be grown/shrunk to hit a target local error
// without the cost of two independent solves.
// ---------------------------------------------------------------------------
const DOPRI_A = [
  [],
  [1 / 5],
  [3 / 40, 9 / 40],
  [44 / 45, -56 / 15, 32 / 9],
  [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729],
  [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656],
  [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84],
];
const DOPRI_C = [0, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1];
const DOPRI_B5 = [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84, 0];
const DOPRI_B4 = [5179 / 57600, 0, 7571 / 16695, 393 / 640, -92097 / 339200, 187 / 2100, 1 / 40];

function dopriStep(x, t, h, p) {
  const n = x.length;
  const k = new Array(7);
  for (let s = 0; s < 7; s++) {
    const xs = x.slice();
    for (let j = 0; j < s; j++) {
      const a = DOPRI_A[s][j];
      if (a) for (let i = 0; i < n; i++) xs[i] += h * a * k[j][i];
    }
    k[s] = derivative(xs, t + DOPRI_C[s] * h, p);
  }
  const x5 = new Array(n), x4 = new Array(n);
  for (let i = 0; i < n; i++) {
    let s5 = 0, s4 = 0;
    for (let s = 0; s < 7; s++) { s5 += DOPRI_B5[s] * k[s][i]; s4 += DOPRI_B4[s] * k[s][i]; }
    x5[i] = x[i] + h * s5;
    x4[i] = x[i] + h * s4;
  }
  let errNorm = 0;
  for (let i = 0; i < n; i++) {
    const scale = 1e-6 + 1e-4 * Math.max(Math.abs(x[i]), Math.abs(x5[i]));
    errNorm = Math.max(errNorm, Math.abs(x5[i] - x4[i]) / scale);
  }
  return { x5, errNorm };
}

// integrateAdaptive — Dormand–Prince with PI step-size control. Returns the
// same {x, trace} shape as integrateRK4 so callers can swap solvers freely.
export function integrateAdaptive(x0, t0, t1, p, opts = {}) {
  const tol = opts.tol ?? 1.0;          // acceptable local error norm
  let h = opts.hInit ?? (t1 - t0) / 200;
  const hMin = opts.hMin ?? 1e-6;
  const hMax = opts.hMax ?? (t1 - t0) / 10;
  let x = x0.slice(), t = t0;
  const trace = [{ t, x: x.slice() }];
  let guard = 0;
  while (t < t1 - 1e-12 && guard++ < 200000) {
    if (t + h > t1) h = t1 - t;
    const { x5, errNorm } = dopriStep(x, t, h, p);
    if (errNorm <= tol || h <= hMin * 1.0001) {
      t += h; x = x5;
      trace.push({ t, x: x.slice() });
      // Grow step (classic PI controller, order 5 -> exponent 1/5).
      const grow = errNorm > 1e-12 ? 0.9 * Math.pow(tol / errNorm, 0.2) : 5;
      h = clamp(h * clamp(grow, 0.2, 5), hMin, hMax);
    } else {
      const shrink = 0.9 * Math.pow(tol / errNorm, 0.25);
      h = clamp(h * clamp(shrink, 0.1, 1), hMin, hMax);
    }
  }
  return { x, trace, steps: trace.length - 1 };
}

// ---------------------------------------------------------------------------
// verifyMassConservation — sums total volume at two states; used by tests
// and available to callers who want a runtime sanity check (e.g. after a
// long run, confirm no numerical drift beyond floating-point noise).
// ---------------------------------------------------------------------------
export function totalVolume(x) {
  return x[IDX.VLA] + x[IDX.VLV] + x[IDX.VAo] + x[IDX.VSys] +
    x[IDX.VRA] + x[IDX.VRV] + x[IDX.VPA] + x[IDX.VPV];
}

// ---------------------------------------------------------------------------
// initState — build a plausible resting initial condition from total blood
// volume, splitting it across compartments by their unstressed volumes +
// typical stressed fractions. Not physiologically load-bearing (the solver
// will relax to its own limit cycle over a few beats) — just a sane start.
// ---------------------------------------------------------------------------
export function initState(p, totalBloodVolMl = 5000) {
  const x = new Array(N_STATE).fill(0);
  // Scale the resting-guess stressed volumes off the same body-size ratio
  // implied by p's own (possibly scaled, see cardiovascular.js) V0LV — a
  // fixed adult 120/130/55/60 mL guess for a pediatric-scaled p left the
  // ventricles/atria at an adult-sized initial condition no amount of the
  // (VSys-only) resync could ever correct back down to that patient's real,
  // much smaller total blood volume. Not physiologically load-bearing (the
  // loop relaxes to its own limit cycle over a few beats either way) — this
  // just gets that relaxation starting from the right ballpark.
  const sizeRatio = (p.V0LV ?? 10) / 10;
  x[IDX.VLV] = 120 * sizeRatio; x[IDX.VRV] = 130 * sizeRatio;
  x[IDX.VLA] = 55 * sizeRatio; x[IDX.VRA] = 60 * sizeRatio;
  x[IDX.VAo] = p.VuAo + 40 * sizeRatio;
  x[IDX.VPA] = p.VuPA + 15 * sizeRatio;
  x[IDX.VPV] = p.VuPV + 60 * sizeRatio;
  const used = x[IDX.VLV] + x[IDX.VRV] + x[IDX.VLA] + x[IDX.VRA] + x[IDX.VAo] + x[IDX.VPA] + x[IDX.VPV];
  x[IDX.VSys] = Math.max(p.VuSys, totalBloodVolMl - used);
  // flows and valve states start at rest / closed
  x[IDX.QAo] = 0; x[IDX.QSys] = 5; x[IDX.QVen] = 5; x[IDX.QPul] = 0;
  x[IDX.thMV] = 0; x[IDX.thAV] = 0; x[IDX.thTV] = 0; x[IDX.thPV] = 0;
  return x;
}

// ---------------------------------------------------------------------------
// runToLimitCycle — integrate several beats so transient initial-condition
// error dies out, then return the final beat's trace + summary metrics. This
// is the entry point later tasks (2/3/5/9) and any eventual replacement for
// solveBeat() should call.
// ---------------------------------------------------------------------------
export function runToLimitCycle(paramOverrides = {}, opts = {}) {
  const p = buildParams(paramOverrides);
  const T = 60 / p.HR;
  const nBeats = opts.nBeats ?? 6;
  const method = opts.method ?? "dopri5";
  let x = initState(p, opts.totalBloodVolMl ?? 4900);
  let lastTrace = null;
  const v0 = totalVolume(x);
  for (let b = 0; b < nBeats; b++) {
    const t0 = b * T;
    const res = method === "rk4"
      ? integrateRK4(x, t0, t0 + T, opts.h ?? 0.002, p)
      : integrateAdaptive(x, t0, t0 + T, p, { tol: opts.tol ?? 0.5 });
    x = res.x;
    lastTrace = res.trace;
  }
  const v1 = totalVolume(x);
  const vols = lastTrace.map((pt) => pt.x);
  const lvSeries = vols.map((s) => s[IDX.VLV]);
  const rvSeries = vols.map((s) => s[IDX.VRV]);
  const edvLV = Math.max(...lvSeries), esvLV = Math.min(...lvSeries);
  const edvRV = Math.max(...rvSeries), esvRV = Math.min(...rvSeries);
  const paoSeries = lastTrace.map((pt) => (pt.x[IDX.VAo] - p.VuAo) / p.Cao);
  const ppaSeries = lastTrace.map((pt) => (pt.x[IDX.VPA] - p.VuPA) / p.Cpa);
  return {
    p, trace: lastTrace, x,
    svLV: edvLV - esvLV, edvLV, esvLV, efLV: edvLV > 0 ? (edvLV - esvLV) / edvLV : 0,
    svRV: edvRV - esvRV, edvRV, esvRV, efRV: edvRV > 0 ? (edvRV - esvRV) / edvRV : 0,
    sbp: Math.max(...paoSeries), dbp: Math.min(...paoSeries),
    pasp: Math.max(...ppaSeries), padp: Math.min(...ppaSeries),
    massConservationDrift: v1 - v0,
    massConservationDriftFrac: (v1 - v0) / v0,
  };
}

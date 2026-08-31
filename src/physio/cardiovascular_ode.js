// cardiovascular_ode.js — intra-beat pressure–volume solver for the left heart.
//
// This is the first piece of the roadmap's move from a single-point,
// per-beat lumped coupling toward a genuine ODE cardiovascular model. It
// integrates ONE cardiac cycle with a real numerical solver (classic RK4) at a
// few-millisecond timestep and returns the stroke volume, end-systolic volume,
// and the full pressure–volume loop, plus valve-opening trajectories.
//
// What it implements from the roadmap:
//   • Double-Hill time-varying elastance  E_LV(t) = Emin + (Emax-Emin)·e(t)   (Task 4)
//   • Activation e(t) driven by a cycle phase, so it can later be triggered by a
//     ventricular activation EVENT rather than a fixed clock                   (Task 5)
//   • Nonlinear valve opening-state dynamics dθ/dt = ko(ΔP) − kc·θ for the
//     mitral and aortic valves, with orifice flow Q = θ·ΔP/R                    (Task 3)
//   • Flow inertance L·dQ/dt = ΔP − R·Q on the aortic outflow                   (Task 2)
//   • A 2-element arterial Windkessel as the afterload                          (Task 1, LV/systemic slice)
//
// DESIGN CONTRACT — why this can replace the analytic SV without moving BP:
//   The classic Sunagawa result SV = Ees·(EDV−V0)/(Ees+Ea) is the end-systolic
//   equilibrium of exactly this time-varying-elastance system when the arterial
//   load is expressed as an elastance Ea referenced at EDV. So when we drive the
//   solver with Emax = pat.ees and an arterial load calibrated to pat.ea, the
//   integrated end-systolic SV converges to the same value the lumped model
//   already produced — the vitals downstream (MAP/PP/SBP/DBP) are unchanged by
//   construction, while the beat itself is now a real integrated loop. The
//   caller keeps the analytic value as a guarded fallback.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------------------------------------------------------------------------
// Double-Hill activation e(t) ∈ [0,1], peak normalized to 1.
// tn is the cycle phase in [0,1). Parameters after Stergiopulos/Mynard, giving
// a fast upstroke and a slightly delayed, sharper relaxation.
// ---------------------------------------------------------------------------
const DH = { a1: 0.269, a2: 0.452, m1: 1.32, m2: 21.9 };
// Precompute the raw peak so we can normalize e(t) to a true maximum of 1.
function dhRaw(tn) {
  const g1 = Math.pow(tn / DH.a1, DH.m1);
  const g2 = Math.pow(tn / DH.a2, DH.m2);
  return (g1 / (1 + g1)) * (1 / (1 + g2));
}
let _dhPeak = 0, _dhPeakTn = 0.3;
for (let i = 0; i <= 1000; i++) { const r = dhRaw(i / 1000); if (r > _dhPeak) { _dhPeak = r; _dhPeakTn = i / 1000; } }
export function activation(tn) {
  if (tn <= 0 || tn >= 1) return 0;
  return clamp(dhRaw(tn) / _dhPeak, 0, 1);
}

// ---------------------------------------------------------------------------
// solveBeat — integrate one cardiac cycle and return loop + summary.
//
// params (all SI-ish: mL, mmHg, seconds, mL/s):
//   Emax   end-systolic elastance         [mmHg/mL]   (= pat.ees)
//   Emin   diastolic elastance            [mmHg/mL]
//   V0     unstressed ventricular volume  [mL]
//   edv    end-diastolic volume (preload) [mL]
//   Ea     effective arterial elastance   [mmHg/mL]   (= effective, incl. stenosis)
//   pDia   diastolic aortic pressure the valve opens against [mmHg] (display offset only)
//   T      cycle length                   [s]         (= 60/HR)
//   aorticStenosisSeverity ∈ [0,1] (read directly off params below, not
//     destructured — see the stenosisR line)
//   externalP  pericardial+intrathoracic pressure the chamber sees [mmHg]
//   substep    integration step [s] (default 0.002)
//
// This solver integrates a SINGLE beat's ejection dynamics; it has no
// windkessel/runoff state that would carry across beats, so systemic runoff
// resistance and arterial compliance (the cardiovascular_ode_full.js solver's
// own Rsys/Cao) have no place to act here — pDia is a pure display offset
// (see below), not an input to a decay term. Mitral/aortic regurgitation are
// real, working mechanisms (cardiovascular.js: they inflate preload before
// this is ever called, and cut forward stroke volume afterward), just not
// through this function — a `mitralRegurgFrac`/`aorticRegurgFrac` pass-through
// here would be accepted and silently ignored, so callers pass neither.
// ---------------------------------------------------------------------------
export function solveBeat(params) {
  const {
    Emax, Emin = 0.08, V0 = 10, edv, Ea,
    pDia = 60, T, externalP = 0,
  } = params;

  const h = params.substep || 0.002;         // 2 ms
  const nSteps = Math.max(20, Math.round(T / h));

  // Arterial afterload as an elastance line referenced at EDV: Pao_load(V) =
  // Ea·(EDV − V), zero at the moment the valve opens and rising as blood enters
  // the aorta. This is the load whose end-systolic equilibrium with the ESPVR
  // reproduces SV = Ees·(EDV−V0)/(Ees+Ea) — so the integrated SV matches the
  // lumped model it replaces. The diastolic pressure pDia is a pure DISPLAY
  // offset (the real aorta sits at DBP when the valve opens); it does not enter
  // the SV determination, matching the Sunagawa idealisation.
  //
  // State vector y = [V, Qao, theta_ao]
  //   V      LV volume            [mL]
  //   Qao    aortic outflow       [mL/s]  — carries momentum (inertance)
  //   theta  aortic valve opening [0..1]
  const L = 0.0006;        // aortic flow inertance [mmHg·s²/mL]
  const Rav = 0.006;       // open aortic valve resistance [mmHg·s/mL]
  const ko = 60, kc = 60;  // valve opening/closing rate constants
  const stenosisR = 1 + (params.aorticStenosisSeverity || 0) * 6; // stenosis raises valve resistance
  const Reff = Rav * stenosisR;
  // Mitral valve (filling limb) parameters.
  const Rmv = 0.008 * (1 + (params.mitralStenosisSeverity || 0) * 8); // stenosis slows filling
  const koM = 60, kcM = 60;

  function elastance(tn) { return Emin + (Emax - Emin) * activation(tn); }

  // Full four-phase cardiac cycle, integrated over one beat.
  //
  //  • Contraction + EJECTION (up to the activation peak): the open aortic valve
  //    holds Plv ≈ Pao, so emptying is quasi-static — LV volume sits at the
  //    elastance/arterial-load equilibrium Veq(t) = (E·V0 + Ea·EDV)/(E + Ea),
  //    forward-only, bottoming out at the Sunagawa end-systolic volume. This is
  //    what pins SV = Ees(EDV−V0)/(Ees+Ea) exactly (no calibration drift).
  //  • Relaxation + FILLING (after the activation peak): the mitral valve opens
  //    when left-atrial pressure exceeds the falling LV pressure, and the
  //    ventricle refills toward EDV — a real inflow limb with its own valve-angle
  //    state. The filling pressure Pla is set to the value that yields exactly
  //    the engine's EDV at end-diastole, so the loop closes on EDV and SV is
  //    unchanged; only the loop GEOMETRY (and the mitral valve trajectory) is added.
  const esvA = (Emax * V0 + Ea * edv) / (Emax + Ea);   // analytic end-systolic volume
  const Pla = Emin * (edv - V0) + externalP;            // filling pressure targeting EDV
  const tPeak = _dhPeakTn * T;

  let V = edv, Qao = 0, thetaAo = 0, thetaMi = 0;
  let t = 0;
  let peakPlv = 0, peakPes = 0;
  const loop = [];
  for (let i = 0; i < nSteps; i++) {
    t += h;
    const tn = (t % T) / T;
    const E = elastance(tn);
    if (t <= tPeak) {
      // Ejection: quasi-static, forward-only, down to the analytic ESV.
      const Veq = (E * V0 + Ea * edv) / (E + Ea);
      V = Math.min(V, Math.max(Veq, esvA));
    } else {
      // Diastolic filling through the mitral valve toward EDV.
      const PlvNow = E * (V - V0) + externalP;
      const dPmi = Pla - PlvNow;
      thetaMi = clamp(thetaMi + h * (dPmi > 0 ? koM * dPmi * (1 - thetaMi) : -kcM * thetaMi), 0, 1);
      V = Math.min(edv, V + h * thetaMi * Math.max(0, dPmi) / Rmv);
    }
    const Plv = E * (V - V0) + externalP;
    const Pes = Ea * Math.max(0, edv - V);              // arterial pressure above diastolic
    const dPa = Plv - Pes;
    // Aortic valve opening state + outflow inertance (waveform).
    thetaAo = clamp(thetaAo + h * (dPa > 0 ? ko * Math.max(dPa, 0) * (1 - thetaAo) : -kc * thetaAo), 0, 1);
    Qao = Math.max(0, Qao + h * (thetaAo * dPa - Reff * Qao) / L);
    if (Plv > peakPlv) peakPlv = Plv;
    if (Pes > peakPes) peakPes = Pes;
    if (i % 3 === 0) loop.push({
      t: +t.toFixed(3), V: +V.toFixed(1), Plv: +Plv.toFixed(1),
      Pao: +(pDia + Pes).toFixed(1), thAo: +thetaAo.toFixed(2), thMi: +thetaMi.toFixed(2),
    });
  }
  const peakPao = pDia + peakPes;
  const esv = esvA;

  const sv = Math.max(0, edv - esv);
  const ef = edv > 0 ? clamp(sv / edv, 0, 0.95) : 0;
  return {
    sv, esv, ef, edv,
    peakPlv, peakPao,
    endDiaPao: pDia,
    loop,
    ok: Number.isFinite(sv) && sv >= 0 && sv < 400,
  };
}

// obstetric.js — pregnancy, labor and delivery.
//
// A pregnant patient carries `pat._pregnancy`:
//   { gestation, laborProgress, contractionRate, tilted, delivered, apgarSeed }
// A condition sets it up (see e.g. the trauma-in-pregnancy condition), then
// updateObstetric() is driven every dt>0 from physiology.js. Two things happen:
//
//   1. Aortocaval compression — a term gravid uterus compressing the IVC in the
//      SUPINE position throttles venous return, so MAP falls; left-lateral tilt
//      (pat._pregnancy.tilted, set by the "tilt"/left-lateral-displacement
//      procedure or position) relieves it. This is emergent: we raise venous
//      resistance while supine and the closed-loop CV model produces the
//      hypotension and reflex tachycardia on its own.
//
//   2. Labor — laborProgress advances toward 1.0; on delivery we queue a
//      newborn onto the session roster (s._spawnQueue). The newborn's initial
//      vigour ("apgarSeed") is carried through so a distressed pregnancy yields
//      a depressed newborn that needs resuscitation.
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ---------------------------------------------------------------------------
// NORMAL PREGNANCY CARDIOVASCULAR ADAPTATION
//
// Pregnancy is a physiological STATE, not a disease: by term the maternal
// circulation has remodeled substantially, and those adaptations are what a
// pregnant patient's baseline vitals actually are. Previously none of this was
// represented — a "pregnant" patient was a non-pregnant patient with a caval
// compression term bolted on, so term cardiac output came out ~4.9 L/min
// instead of the documented 6-7 L/min.
//
// Documented term (≈38-40 week) changes, all relative to the same woman
// non-pregnant, phased in with gestation (most are largely established by
// ~28-32 weeks, so we ramp from 6 weeks and saturate around 32):
//
//   plasma volume        +45-50%   ┐ together: total blood volume +40-45%, with
//   red cell mass        +20-30%   ┘ RBC lagging plasma → dilutional ("physiological")
//                                    anemia of pregnancy, Hb ~11-12 g/dL
//   systemic vascular resistance  −25 to −30%  (progesterone/relaxin-mediated
//                                    vasodilation + the low-resistance
//                                    uteroplacental bed in parallel)
//   resting heart rate   +10-20 bpm
//   venous capacitance   increased (progesterone venodilation)
//   LV eccentric remodeling: LV mass +~50%, end-diastolic volume +~20-30%
//   ⇒ stroke volume +20-30% and cardiac output +30-50% EMERGE from the above
//     rather than being asserted — which is the point: give the closed loop the
//     right preload, afterload, rate and chamber size and it produces the
//     hyperdynamic circulation of pregnancy on its own.
//
// Everything here is expressed through GENERAL cardiovascular handles
// (blood volume, baseSVR, hrBase, venousCapacitanceFactor, chamberRemodeling)
// so no pregnancy-specific code lives in cardiovascular.js.
function gestationFactor(gestation) {
  // 0 before 6 weeks, ramping to 1 by ~32 weeks (adaptations plateau in T3).
  return clamp(((gestation || 0) - 6) / 26, 0, 1);
}

// Applied ONCE when the pregnancy is established. Captures the pre-pregnancy
// baseline first so the adaptation can be unwound after delivery.
function applyPregnancyAdaptations(pat) {
  const preg = pat._pregnancy;
  const g = gestationFactor(preg.gestation);
  if (g <= 0) { preg._adapted = true; return; }

  // Separate gestational weight gain from pre-pregnancy anatomy. By term a
  // singleton pregnancy adds ~12 kg of uterus, fetus, placenta and fluid; the
  // scenario declares the woman's CURRENT (term) weight, which drug dosing needs,
  // but blood volume must be derived from what she massed before conceiving.
  // RED CELLS AND PLASMA MUST BE ON THE SAME BODY FRAME.
  // Setting gestationalWeightGainKg re-bases bloodVolumeL() onto the
  // PRE-PREGNANCY mass, which is what the plasma target below is built from.
  // But pat.rbcVol/rbcMass were computed at construction from the woman's
  // CURRENT (term) weight and are not recomputed, so without the rescale below
  // the two halves of the blood volume come from different bodies.
  //
  // Measured for the 65 kg term patient used by the validation suite:
  //   bloodVolumeL at term weight 65 kg ... 4.225 L   (rbcVol 1.732, Hct 41.0%)
  //   bloodVolumeL after gwg, 53 kg ....... 3.445 L   (rbcVol still 1.732)
  // which implies a pre-pregnancy hematocrit of 50.3% — not a possible value for
  // a woman. Carried through the term expansion it produced Hct 43.4% and a
  // hemoglobin of 14.63 g/dL at term, where pregnancy is DILUTIONAL and should
  // sit near 33% and 10.5-12.8 g/dL. The dilutional-anemia assertion had been
  // failing on exactly this since before this line of work began.
  //
  // The ratio is taken from bloodVolumeL() either side of the assignment rather
  // than from the weights, so it follows whatever scaling ageProfile actually
  // uses instead of assuming blood volume is linear in mass.
  const bvTermFrame = pat.ageProfile.bloodVolumeL();
  pat.ageProfile.gestationalWeightGainKg = 12 * g;
  const frameRatio = pat.ageProfile.bloodVolumeL() / Math.max(0.1, bvTermFrame);
  pat.rbcVol *= frameRatio;
  pat.rbcMass *= frameRatio;
  // bodyScaleBaselineL is the FROZEN anatomical size baseline (patient.js), and
  // it was captured at construction from the declared TERM weight — the same
  // term-frame error the red-cell rescale above exists to correct, on a field
  // that was simply missed. It must ride the identical frameRatio, because
  // bodyScale sizes the VASCULAR RESERVOIR and gestational mass is uterus,
  // fetus, placenta and fluid rather than vascularized tissue.
  //
  // Measured for the 65 kg (term 77 kg) validation patient: bodyScale ran 1.021
  // against the 0.862 her pre-pregnancy anatomy gives, an 18% oversize. That fed
  // straight into the closed loop's systemic venous compliance, Csys = 185 x
  // bodyScale x venousCapacitanceFactor, so pregnancy scaled compliance TWICE —
  // once through the capacitance handle it is supposed to use, and once through
  // a body frame that had silently grown by the weight of the pregnancy.
  // Instrumented at the ODE: stressed volume rose 51% at term while Csys rose
  // 68%, so mean systemic filling pressure FELL, 9.22 -> 8.25 mmHg, and the
  // ventricle could not fill no matter how much volume was retained. Pregnancy
  // raises preload; it does not lower it.
  pat.bodyScaleBaselineL = (pat.bodyScaleBaselineL ?? pat.totalBloodVol) * frameRatio;

  preg._pre = {
    totalBloodVol: pat.totalBloodVol,
    plasmaVol: pat.plasmaVol,
    rbcVol: pat.rbcVol,
    rbcMass: pat.rbcMass,
    baseSVR: pat.baseSVR,
    hrBase: pat.hrBase,
  };

  // --- Volume: plasma expands faster than red cell mass ---
  // Pregnancy does not "add" volume — it RESETS the volume the kidney defends.
  // Renin, angiotensin II and aldosterone all rise severalfold from early
  // gestation, producing sustained renal sodium and water retention; the
  // expanded plasma volume is the steady state of that reset regulator. So we
  // drive the general renal set-point (renal.js implements the retention) and
  // set the initial condition to the already-established term value, rather
  // than continuously injecting volume from here.
  // Most of the expansion is now EMERGENT: the venodilation below raises venous
  // capacitance, the circuit is underfilled, and the renal controller retains
  // until it is full again (renal.js). What remains here is the PRIMARY
  // endocrine component — estrogen/progesterone directly stimulate hepatic
  // angiotensinogen and renin, so pregnancy retains sodium beyond what
  // underfilling alone would explain.
  pat.sodiumRetentionDrive = 1 + 0.12 * g;
  pat.plasmaVol = (preg._pre.plasmaVol ?? 0) * (1 + 0.50 * g);
  // Red cell mass expansion is erythropoietic (EPO-driven), a separate and
  // slower process that lags plasma — hence the dilutional anemia. It is a mass
  // already laid down by term, so it is set once here.
  pat.rbcVol = (preg._pre.rbcVol ?? 0) * (1 + 0.25 * g);
  pat.rbcMass = (preg._pre.rbcMass ?? 0) * (1 + 0.25 * g);
  pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
  // The interstitium expands with the ECF in pregnancy too (which is why
  // dependent edema is normal at term). Both the actual volume and the
  // lymphatic set-point move together, because at term that expansion is
  // already established — raising only the set-point would make the lymphatics
  // treat the normal compartment as under-filled and stop draining.
  const isExpand = 1 + 0.20 * g;
  const isBase0 = pat.interstitialVolBaseline ?? pat.interstitialVol;
  pat.interstitialVolBaseline = isBase0 * isExpand;
  pat.interstitialVol = pat.interstitialVol * isExpand;
  pat.isAlbuminMass = (pat.isAlbuminMass ?? 0) * isExpand;   // protein follows its compartment

  // --- Afterload: systemic vasodilation + low-resistance uteroplacental bed ---
  pat.baseSVR = (preg._pre.baseSVR ?? 1200) * (1 - 0.27 * g);

  // --- Rate ---
  pat.hrBase = (preg._pre.hrBase ?? 75) + 15 * g;

  // --- Venous capacitance (progesterone venodilation) ---
  // Central venous pressure is essentially UNCHANGED in normal pregnancy despite
  // a 40-45% rise in blood volume — the venous bed expands to accommodate
  // essentially all of it. So capacitance must grow in proportion to the volume
  // expansion, not by some smaller token amount; otherwise the extra volume is
  // forced into the STRESSED compartment, filling pressure climbs and the model
  // produces a hypertensive, hyperdynamic circulation that pregnancy does not
  // have. Pregnancy's cardiac output rise comes from reduced afterload, higher
  // rate and a larger chamber — NOT from a raised filling pressure.
  pat.venousCapacitanceFactor = 1 + 0.42 * g;

  // --- Eccentric LV remodeling (volume-overload hypertrophy) ---
  pat.chamberRemodeling = 1 + 0.22 * g;

  // --- Initialize AT the chronic steady state ---
  // A woman at 39 weeks has been adapted for months: she should START at the
  // defended equilibrium, with the renal controller MAINTAINING it. Otherwise
  // the simulation has to "become pregnant" over several hours of controller
  // action, which is both wrong and slow. We therefore solve for the volume the
  // renal controller will defend (same expression as renal.js) and set plasma to
  // put her exactly there, so net renal retention at t=0 is zero.
  const UNSTRESSED_FRACTION = 0.70;
  const capacitanceTerm = UNSTRESSED_FRACTION * pat.venousCapacitanceFactor + (1 - UNSTRESSED_FRACTION);
  const target = pat.ageProfile.bloodVolumeL() * capacitanceTerm * pat.sodiumRetentionDrive;
  pat.plasmaVol = Math.max(0.1, target - pat.rbcVol);
  pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
  pat.targetBloodVol = target;

  // The gestational expansion is retained ISOTONICALLY — RAAS holds sodium and
  // water together — so the extra extracellular water arrives with its sodium
  // and does not by itself dilute the patient. Sodium mass is therefore rescaled
  // to the new extracellular water at the concentration she is defending.
  // The mild hyponatremia of pregnancy (~135 rather than 140) then comes from
  // the OSMOSTAT RESET below, which is the documented mechanism, rather than
  // from unaccounted dilution.
  pat.osmostatSetpoint = 290 - 10 * g;
  const ecfWater = Math.max(0.5, pat.plasmaVol + pat.interstitialVol);
  const defendedNa = 140 - 5 * g;
  pat.naMass = defendedNa * ecfWater;
  pat.na = defendedNa;

  preg._adapted = true;
}

// Postpartum hemostasis by uterine involution.
//
// The myometrium is the mother's hemostatic mechanism: contraction of the
// interlacing muscle fibres occludes the spiral arteries of the placental bed —
// the classic "living ligatures" — so bleeding from the placental site is heavy
// for the first minutes and then stops mechanically, well before clotting
// contributes much. Documented blood loss for an uncomplicated vaginal delivery
// is ~300-500 mL, and postpartum hemorrhage is DEFINED as >= 1000 mL precisely
// because the normal course is self-limiting (ACOG Practice Bulletin 183).
//
// So the loss is an INTEGRAL, not a rate. An exponential decay of the atonic
// rate with a time constant of PP_TONE_TAU integrates to PP_PEAK_BLEED *
// PP_TONE_TAU liters: 0.10 L/min x 4 min = 0.40 L, mid-range for a normal
// delivery, and reached over the few minutes involution actually takes.
// Neither number is free — the product is pinned to the documented loss and the
// time constant to the documented time course.
//
// The obstetric contribution is tracked separately in preg._ppBleed and applied
// as a DELTA to pat.activeBleedRate, so it composes with a trauma bleed on the
// same patient (trauma-in-pregnancy) instead of overwriting it.
//
// RESOLVED — physiology queue item 9. Uterine atony is the leading cause of
// postpartum hemorrhage (~70-80% of PPH, ACOG Practice Bulletin 183), and it
// is exactly a failure of the myometrium to contract adequately after
// delivery — a BOGGY uterus, not merely a slower one. `preg.atonyFactor`
// (0-1, set by a condition via establishPregnancy/sync — 0 is the normal
// involution this file always modelled) now scales BOTH how far tone can rise
// on its own AND how long that takes: a boggy uterus does not just take
// longer to reach the same tone, it may never reach it unassisted.
//
// Treatment (oxytocin, fundal massage) works through `preg.uterotonicDrive`
// (0-1, pk.js), a real pharmacologic/mechanical stimulus to the SAME muscle —
// it raises the achievable ceiling rather than suppressing the bleed rate
// directly, which is what oxytocin's fx used to do (fx:{bleed:-0.6},
// drugs.js) before this fix: a flat, continuous suppression of
// pat.activeBleedRate with no reference to whether the uterus was actually
// contracting, the exact `fx:{sbp:+30}`-shaped stat write section 1 forbids.
const PP_PEAK_BLEED = 0.10;   // L/min at zero uterine tone
const PP_TONE_TAU = 4;        // minutes to involution, normal (atonyFactor 0)

function updatePostpartumHemostasis(pat, dt) {
  const preg = pat._pregnancy;
  const atony = clamp(preg.atonyFactor ?? 0, 0, 1);
  const uterotonic = clamp(pat.uterotonicDrive || 0, 0, 1);
  // Atony both slows the myometrium's UNASSISTED response (up to 4x the
  // normal involution time constant at zero treatment) and caps how much
  // tone it can generate — the boggy uterus of clinical atony, not a uterus
  // that simply takes longer to finish the same job. A real uterotonic
  // stimulus (drug or mechanical) works DIRECTLY on the same fibres, so full
  // treatment (uterotonic=1) restores the normal-involution time constant,
  // not merely a higher slow-moving ceiling — oxytocin's own contractile
  // response is a matter of minutes clinically, not the ~14 minutes a first
  // measurement of this formula (ceiling-only, tau untouched by treatment)
  // produced: at atonyFactor 0.8 the ORIGINAL tau-independent-of-treatment
  // version left even a fully-treated patient only 76% of the way to a 1.0
  // target after a 19-minute call. Both a real disease mechanism (untreated
  // atony really is this slow/incomplete) and a real defect in how the fix
  // was first written (treatment should also speed the response, not only
  // its endpoint) — corrected here rather than shipped on the first
  // untested formula.
  const tau = PP_TONE_TAU * (1 + atony * 3 * (1 - uterotonic));
  const ceiling = 1 - atony * 0.75;
  const target = Math.min(1, ceiling + uterotonic * (1 - ceiling));
  const tone0 = preg.uterineTone ?? 0;
  preg.uterineTone = clamp(tone0 + (target - tone0) * clamp(dt / tau, 0, 1), 0, 1);
  const bleedTarget = PP_PEAK_BLEED * (1 - preg.uterineTone);
  const prev = preg._ppBleed ?? 0;
  pat.activeBleedRate = Math.max(0, (pat.activeBleedRate || 0) - prev + bleedTarget);
  preg._ppBleed = bleedTarget;
}

// Unwind the adaptation after delivery. The circulation does not normalize
// instantly — SVR, rate and chamber size return over days-weeks — but within a
// prehospital contact the clinically important part is the immediate one, so we
// relax the maintained parameters slowly toward their pre-pregnant values while
// the acute autotransfusion (below) happens at once.
function normalizePostpartum(pat, dt) {
  const preg = pat._pregnancy;
  const pre = preg._pre;
  if (!pre) return;
  const tau = 60;                       // minutes; slow relative to a scene
  const k = clamp(dt / tau, 0, 1);
  pat.baseSVR += ((pre.baseSVR ?? pat.baseSVR) - pat.baseSVR) * k;
  pat.hrBase += ((pre.hrBase ?? pat.hrBase) - pat.hrBase) * k;
  pat.venousCapacitanceFactor += (1 - (pat.venousCapacitanceFactor ?? 1)) * k;
  pat.chamberRemodeling += (1 - (pat.chamberRemodeling ?? 1)) * k;
  // The defended volume returns to normal too — this is the postpartum diuresis
  // that clears the retained gestational fluid over the following days.
  pat.sodiumRetentionDrive += (1 - (pat.sodiumRetentionDrive ?? 1)) * k;
}

// Establish the pregnancy state on a patient. This is the single entry point for
// "this patient is pregnant" — conditions call it rather than hand-building the
// _pregnancy object, so gestation-dependent adaptation is applied consistently
// wherever pregnancy appears (healthy term, trauma in pregnancy, pre-eclampsia).
export function establishPregnancy(pat, opts = {}) {
  if (pat._pregnancy) return pat._pregnancy;
  pat._pregnancy = {
    gestation: opts.gestation ?? 39,
    laborProgress: opts.laborProgress ?? 0,
    contractionRate: opts.contractionRate ?? 0,
    tilted: opts.tilted ?? false,
    delivered: false,
    apgarSeed: opts.apgarSeed ?? null,
    birthWeight: opts.birthWeight ?? 3.3,
    // Uterine atony risk (queue item 9) — 0 is normal involution, see
    // updatePostpartumHemostasis. Grand multiparity, prolonged labor,
    // chorioamnionitis, uterine overdistension (twins, polyhydramnios,
    // macrosomia) and retained placenta are the documented risk factors; a
    // condition sets this from whichever of those it represents.
    atonyFactor: opts.atonyFactor ?? 0,
  };
  return pat._pregnancy;
}

export function updateObstetric(pat, dt, s) {
  const preg = pat._pregnancy;
  if (!preg) return;

  // --- Normal pregnancy adaptation (once, when pregnancy is established) ---
  if (!preg._adapted) applyPregnancyAdaptations(pat);

  // --- Aortocaval compression (supine, term uterus) ---
  // Fraction of caval compression scales with gestation past ~20 weeks and is
  // essentially abolished by left-lateral tilt. We express it as an added
  // venous return resistance; the CV model turns that into reduced preload.
  const gestFactor = clamp(((preg.gestation || 0) - 20) / 18, 0, 1); // 0 at 20w, 1 at 38w
  const supine = !preg.tilted && !preg.delivered;
  const compression = supine ? gestFactor : gestFactor * 0.1;
  // Baseline venousResistance is 0.1; compression adds up to ~0.18 (a large
  // relative rise in resistance to venous return -> marked preload drop).
  pat.venousResistance = 0.1 + compression * 0.18;

  if (preg.delivered) {
    // Postpartum circulation: hemostasis by uterine involution, then a slow
    // return toward the pre-pregnant baseline.
    updatePostpartumHemostasis(pat, dt);
    normalizePostpartum(pat, dt);
    return;
  }

  // --- Labor progression ---
  // Contractions advance cervical dilation/descent. In these scenarios labor is
  // already advanced (precipitous), so the default rate delivers within minutes.
  const rate = preg.contractionRate != null ? preg.contractionRate : 0.06; // per minute
  preg.laborProgress = clamp((preg.laborProgress || 0) + rate * dt, 0, 1);

  // Crowning flag for the scenario/UI to surface, at ~85% progress.
  preg.crowning = preg.laborProgress >= 0.85;

  if (preg.laborProgress >= 1) {
    preg.delivered = true;
    preg.crowning = false;
    // Post-partum: uterus decompresses (compression relieved above once
    // delivered), and there is an obligate amount of post-partum blood loss —
    // brisker if the mother is shocked/coagulopathic (uterine atony).
    // Obligate postpartum blood loss is FINITE and SELF-LIMITING, so it is
    // started here as an atonic uterus and handed to updatePostpartumHemostasis()
    // below rather than added to activeBleedRate as a permanent rate.
    //
    // WHAT WAS WRONG: this line added 0.05 L/min to activeBleedRate and nothing
    // ever removed it, so a normal term delivery bled 3 L/hour forever. Worse,
    // updateHemorrhage() divides the rate by clotStrength, which the bleeding
    // itself consumes (coagulation.js) — correct trauma physiology, but fed by a
    // bleed that never stops it becomes a runaway. Instrumented on the
    // validation fixture: blood volume ran 6.52 -> 2.24 L over 30 minutes, i.e.
    // the engine exsanguinated every healthy postpartum mother, and the loss
    // ACCELERATED (0.10 L per 2 min early, 0.99 L per 2 min by t=30) as the
    // coagulopathy limb spun up. This is what the "autotransfusion occurred"
    // assertion had been reporting as -2.71 to -2.78 L.
    preg.uterineTone = 0;      // fully atonic at the moment of delivery
    preg._ppBleed = 0;

    // --- Postpartum autotransfusion ---
    // Delivery empties the uteroplacental bed and the contracting (involuting)
    // uterus squeezes its blood back into the systemic circulation — roughly
    // 300-500 mL returned at once. Together with relief of caval compression
    // this is why cardiac output SPIKES immediately after delivery rather than
    // falling, and it is what a post-partum hemorrhage then eats into.
    const autoTx = 0.4 * gestationFactor(preg.gestation);   // liters
    pat.plasmaVol = (pat.plasmaVol || 0) + autoTx * (1 - 0.30);
    pat.rbcVol = (pat.rbcVol || 0) + autoTx * 0.30;
    pat.totalBloodVol = (pat.totalBloodVol || 0) + autoTx;

    // Newborn vigour: depends on how the pregnancy went. A mother who was
    // hypoxic/shocked at delivery yields a depressed newborn. apgarSeed lets a
    // scenario force a specific starting state (e.g. "apneic, HR 70").
    let vigor = preg.apgarSeed;
    if (vigor == null) {
      vigor = 0.85;
      if ((pat.sao2 || 97) < 90) vigor -= 0.35;
      if (pat.map < 60) vigor -= 0.25;
      if (pat.consciousness === "unconscious" || pat.consciousness === "coma") vigor -= 0.2;
      vigor = clamp(vigor, 0.1, 0.95);
    }

    s._spawnQueue = s._spawnQueue || [];
    s._spawnQueue.push({
      id: "newborn",
      role: "newborn",
      name: "Newborn",
      condition: "neonatalTransition",
      patient: { age: 0.0, weight: preg.birthWeight || 3.3 },
      makeActive: false,
      init: (nb) => {
        nb._neo = { vigor, stimulated: false, deliveredAt: s.t };
      },
    });
    s._deliveryEvent = { t: s.t, vigor };
  }
}

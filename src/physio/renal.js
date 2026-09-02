// Renal & endocrine system: GFR, RAAS, ADH, electrolytes.
// Reads pat.map (from cardiovascular), pat.k, pat.transcellularKShift (from pk.js / metabolic.js)
export function updateRenalEndocrine(pat, dt) {
    // RENAL PERFUSION PRESSURE — the afferent-arteriolar input, before any
    // angiotensin-mediated constriction is applied to it. Kept as its own named
    // quantity because two different things need it and they are not the same
    // quantity: renin secretion is driven by PRESSURE at the afferent
    // arteriole, while filtration is driven by pressure AFTER constriction.
    let perfPressure = pat.map < 60 ? Math.max(0, (pat.map - 40) / 20) : 1;
    if (pat.ageProfile.isElderly()) {
      const loss = Math.min(0.4, (pat.ageProfile.age - 65) * 0.015);
      if (pat.map < 80) perfPressure *= (1 - loss);
    }

    pat.afferentConstriction = pat.angiotensinII ? pat.angiotensinII * 0.3 : 0;
    let renalPerf = perfPressure * (1 - pat.afferentConstriction);

    // RENAL OXYGEN DELIVERY vs DEMAND — queue item 42's "start small: extend
    // the existing brain/heart delivery-vs-demand pattern to one more organ"
    // slice. renalPerf above is already a real, LOCAL, autoregulated fraction
    // of normal renal blood flow (flat above the ~60 mmHg MAP knee, falling
    // below it, further cut by angiotensin-driven afferent constriction) --
    // but until now nothing read it as an oxygen-delivery signal. Real renal
    // O2 consumption tracks tubular workload (active Na+ reabsorption against
    // the filtered load), which is why the reference demand here is a
    // constant 1 (normalized), not pat.gfr itself -- GFR already falls when
    // renalPerf falls, so tying demand to GFR would make the debt term
    // self-cancelling and mask exactly the hypoperfusion this is meant to
    // detect. pat.caO2 (metabolic.js) already runs earlier in the same tick
    // (updateMetabolism, before updateRenalEndocrine -- patient.js's own
    // update() ordering) and is an ABSOLUTE mL-O2/dL quantity (~20 at a
    // normal Hb 15/SaO2 98%), not a 0-1 fraction, so it's normalized against
    // a 20 mL/dL reference here to keep renalDO2 itself a 0-1-ish delivery
    // fraction consistent with renalPerf. A low-Hb or hypoxemic patient is
    // reflected here too, not just a low-flow one: two patients at identical renalPerf but
    // different Hb/SaO2 now genuinely diverge, the exact payoff item 42 names.
    pat.renalDO2 = renalPerf * ((pat.caO2 ?? 20) / 20);
    pat.renalO2Debt = Math.max(0, 1 - pat.renalDO2);

    if (renalPerf < 0.5) pat.atnProgression += 0.01 * dt;
    else pat.atnProgression = Math.max(0, pat.atnProgression - 0.005 * dt);
    pat.atnProgression = Math.min(1, pat.atnProgression);
    const injuryFactor = Math.max(0, 1 - pat.kidneyInjury * 2 - pat.atnProgression * 0.5);
    pat.gfr = pat.baseGfr * renalPerf * injuryFactor;
    pat.kExcretion = renalPerf * injuryFactor;
    // Renal drug excretion: perfusion pressure and nephron mass. It does not
    // include the angiotensin term, because that term is a CONSEQUENCE of the
    // regulator rather than a measure of how much kidney the patient has.
    pat.renalClearanceFraction = Math.max(0.05, Math.min(1.2, perfPressure * injuryFactor));

    // --- RENIN SECRETION -----------------------------------------------------
    // This previously read `reninDrive = 1 - renalPerf`, where renalPerf had
    // ALREADY had afferent constriction multiplied into it. Renin therefore
    // drove the constriction that drove renin: a positive feedback loop with no
    // set point and no opposing term. In a healthy, normotensive patient
    // (MAP 101) it self-activated to renin 0.67 and 40% afferent constriction,
    // holding resting GFR at 71 against a baseline of 120 — i.e. the engine's
    // idea of a healthy young adult was someone with half-normal filtration and
    // a fully engaged renin-angiotensin system.
    //
    // Renin release has three documented stimuli, and none of them is the
    // perfusion that renin itself has already reduced:
    //   1. the afferent arteriolar BARORECEPTOR, sensing perfusion pressure;
    //   2. renal SYMPATHETIC nerve activity (beta-1 mediated), which is why
    //      hemorrhage recruits RAAS before pressure has even fallen;
    //   3. the VOLUME limb — the kidney defends a blood volume, and a deficit
    //      against that defended volume is the signal RAAS exists to correct.
    // Angiotensin II additionally exerts short-loop NEGATIVE feedback on renin
    // release, which is what actually gives the system a set point.
    //
    // At rest this yields renin ~0, afferent constriction ~0, and GFR equal to
    // baseGfr — which is what "baseline" is supposed to mean.
    //
    // TECHNICAL DEBT: the volume limb below stands in for macula densa NaCl
    // delivery, which is the true sensor. Tubuloglomerular feedback makes renin
    // respond to SALT delivery, not to volume as such, so a salt-depleted
    // euvolemic patient still will not activate RAAS correctly. Replace once
    // distal sodium delivery is a tracked quantity.
    //
    // The baroreceptor threshold is 90 mmHg, not the 60 used for filtration.
    // These are different physiological facts and were being conflated: renal
    // blood flow is autoregulated down to about 80 mmHg (so GFR holds), while
    // renin secretion begins rising as renal perfusion pressure falls below
    // roughly 90. Driving renin off the filtration threshold meant a patient at
    // MAP 61 — class III hemorrhagic shock — registered as having FULL renal
    // perfusion pressure and produced essentially no renin.
    const baroDrive = Math.max(0, Math.min(1, (90 - (pat.map ?? 90)) / 50));
    const sympDrive = Math.max(0, (pat.sympathetic ?? 0.25) - 0.25) * 0.8;
    // Volume deficit against the kidney's own defended set point.
    const targetBV = pat.targetBloodVol || pat.totalBloodVol || 1;
    const volDrive = Math.max(0, Math.min(1, 1 - (pat.totalBloodVol || 0) / targetBV)) * 1.5;
    // MACULA DENSA / TUBULOGLOMERULAR FEEDBACK (queue item 14) — a genuine
    // low-salt-delivery stimulus for renin release, independent of the
    // perfusion-pressure and blood-volume terms above. The macula densa
    // senses distal tubular NaCl delivery; this engine has no tracked
    // segmental reabsorption to derive that from directly (the technical
    // debt this comment used to name), but serum sodium is a real,
    // ALREADY-INDEPENDENT axis to key off instead of guessing at one:
    // hemorrhage in this engine does NOT move serum sodium (see patient.js's
    // note on naMass — bleeding is isotonic, so it drains mass and water
    // together and the concentration does not move), so this term cannot
    // double-count a hemorrhage that baroDrive/volDrive already activate
    // renin for. What it adds is the gap the old comment named explicitly: a
    // salt-depleted but volume-replete patient (thiazide/loop-diuretic use,
    // salt-wasting, adrenal insufficiency) previously could not activate
    // RAAS at all, because nothing read serum sodium here. Read from the
    // PREVIOUS tick's pat.na (this function only derives the current value
    // later, below) — a one-tick lag, the same coupling every other
    // cross-module read in this engine already accepts.
    // Weighted at 0.6, not 1.0: real salt-wasting states DO drive marked
    // RAAS activation, but a single electrolyte axis maxing out renin on its
    // own (reachable only at a severe Na of 120, MEASURED against no other
    // drive present) would overstate what one input should be able to do
    // alone relative to the combined perfusion/volume drives above, which
    // together can reach the same ceiling only from actual shock.
    const maculaDensaDrive = Math.max(0, Math.min(1, (140 - (pat.na ?? 140)) / 20)) * 0.6;
    const shortLoopFeedback = (pat.angiotensinII || 0) * 0.15;
    const reninDrive = Math.max(0, Math.min(1,
      baroDrive + sympDrive + volDrive + maculaDensaDrive - shortLoopFeedback));
    pat.renin += (reninDrive - pat.renin) * 0.1 * dt;
    pat.angiotensinII = pat.renin * 2;
    pat.aldosterone = pat.angiotensinII * 0.5 + (pat.k > 5 ? -0.2 : 0);
    // --- SERUM SODIUM IS DERIVED, NOT STORED ---
    // Na+ concentration = extracellular sodium MASS / extracellular WATER. With
    // this, every disorder of salt and water emerges from the two masses instead
    // of being asserted: lose pure water and the concentration rises
    // (dehydration, diabetes insipidus); retain pure water and it falls (SIADH);
    // bleed isotonically and it does not move at all.
    const ecfWater = Math.max(0.5, pat.plasmaVol + pat.interstitialVol);
    if (pat.naMass == null) pat.naMass = (pat.na || 140) * ecfWater;
    // The 100/190 bounds are numerical guards on a DERIVED quantity, and they
    // should never be reached. They once were: serum sodium sat pinned at
    // exactly 100 in trauma scenarios, which was not a sodium problem at all
    // but the exsanguination defect — patients drained to 0.000 L, ECF water
    // collapsed toward the 0.5 L floor above, and the quotient fell through the
    // rail. Once hemorrhage was made pressure-dependent (metabolic.js) the
    // circulation asymptotes instead of emptying and the guard stopped binding:
    // measured minimum sodium is now 139.9-140.0 across all five of the trauma
    // scenarios that used to pin it. Left in place deliberately as a guard, but
    // if you ever see sodium resting exactly on 100 or 190 again, the bug is
    // upstream in volume, not here.
    pat.na = Math.max(100, Math.min(190, pat.naMass / ecfWater));

    // --- BUN (blood urea nitrogen) --- queue item 5: was frozen at its
    // constructor default of 12 for the patient's entire life, so the
    // osmolality calc below never reflected real kidney injury or
    // dehydration despite pat.gfr already being a live, correctly-computed
    // quantity right above this line. Urea production from hepatic protein
    // catabolism is roughly constant, while clearance scales with GFR, so
    // BUN is modeled as relaxing toward a target set by clearance capacity
    // rather than snapping to it — real urea equilibrates over hours, so a
    // 30-60 minute prehospital contact should show it TRENDING, not
    // arriving, the same reasoning already applied to the renal volume
    // controller's own 240-minute tau above. A second, PRERENAL term is
    // added on top of the pure-GFR relationship: dehydration/hypoperfusion
    // (high ADH) increases passive urea reabsorption in the proximal tubule
    // and ADH-responsive inner-medullary urea transporters, which is the
    // real reason a dehydrated patient's BUN rises out of proportion to any
    // fall in GFR (the "prerenal" BUN pattern) — distinct from intrinsic
    // renal failure, where BUN tracks GFR alone. Reads pat.adhs from the
    // PREVIOUS tick (this function only derives the current value later,
    // below) — the same one-tick cross-term lag the macula-densa term above
    // already accepts.
    const BUN_NORMAL = 12;
    const gfrFraction = pat.baseGfr > 0 ? Math.max(0.05, pat.gfr / pat.baseGfr) : 1;
    const ureaReabsorption = 1 + Math.max(0, (pat.adhs ?? 1) - 1) * 0.4;
    const bunTarget = Math.min(180, (BUN_NORMAL / gfrFraction) * ureaReabsorption);
    const BUN_TAU = 180; // minutes
    pat.bun = (pat.bun ?? BUN_NORMAL) + (bunTarget - (pat.bun ?? BUN_NORMAL)) * Math.min(1, dt / BUN_TAU);
    pat.bun = Math.max(5, Math.min(180, pat.bun));

    const osm = 2 * pat.na + pat.glucose / 18 + pat.bun / 2.8;

    // --- DEFENDED EFFECTIVE CIRCULATING VOLUME ---
    // The kidney does not defend an absolute blood volume — it defends how well
    // the vascular compartment is FILLED relative to its capacitance (effective
    // arterial/circulating volume). Encoding an absolute target would get
    // cirrhosis and heart failure exactly backwards: in both, total extracellular
    // volume is grossly EXPANDED (ascites, edema) while the kidney keeps
    // retaining, because the effective circulating volume is low. Making the
    // target capacitance-aware reproduces that automatically, and it makes
    // pregnancy's volume expansion largely EMERGENT: progesterone-mediated
    // venodilation raises venousCapacitanceFactor, the circuit is underfilled,
    // RAAS is engaged, and the kidney retains until the larger circuit is full.
    //
    //   target = anatomical BV x (unstressed fraction x capacitance + stressed
    //            fraction) x sodiumRetentionDrive
    //
    // sodiumRetentionDrive is the remaining PRIMARY endocrine term — hormonal
    // sodium retention that is not secondary to underfilling (pregnancy's
    // estrogen/progesterone-driven renin activation, mineralocorticoid excess).
    // Both inputs default to 1, so an ordinary patient's target is exactly their
    // anatomical blood volume, unchanged.
    const venCap = Math.max(0.5, Math.min(2.0, pat.venousCapacitanceFactor ?? 1));
    const retention = Math.max(0.5, Math.min(1.6, pat.sodiumRetentionDrive ?? 1));
    const UNSTRESSED_FRACTION = 0.70;   // matches the venous reservoir in cardiovascular.js
    const capacitanceTerm = UNSTRESSED_FRACTION * venCap + (1 - UNSTRESSED_FRACTION);
    pat.targetBloodVol = pat.ageProfile.bloodVolumeL() * capacitanceTerm * retention;
    const volumeDepletion = 1 - pat.totalBloodVol / pat.targetBloodVol;
    // ADH (vasopressin), normalized so 1.0 = resting secretion. Two drives:
    // osmotic (the dominant one — a ~1% rise in osmolality is enough to change
    // secretion) and volume (baroreceptor-mediated, weaker but able to override
    // osmolality when volume is threatened, which is why hypovolemia produces
    // hyponatremia). Two general disease inputs:
    //   adhSecretionCapacity — 0 abolishes regulated release (central diabetes
    //     insipidus); reduced values blunt it.
    //   adhAutonomous — secretion that ignores osmolality and volume entirely
    //     (SIADH: ectopic or inappropriate release).
    // Nephrogenic DI is the collecting duct failing to RESPOND, represented by
    // adhRenalResponsiveness below rather than by suppressing secretion.
    // The osmostat setpoint is itself adjustable: pregnancy resets it downward
    // by ~10 mOsm/kg (hCG/relaxin-mediated), which is why a normal pregnant
    // woman runs a serum sodium of ~135 and defends it rather than correcting
    // back to 140. Default 290 mOsm/kg.
    const osmSetpoint = pat.osmostatSetpoint ?? 290;
    const osmoticDrive = (osm - osmSetpoint) * 0.05;
    const volumeDrive = Math.max(0, volumeDepletion) * 3;
    const adhCapacity = Math.max(0, Math.min(1.5, pat.adhSecretionCapacity ?? 1));
    const adhRegulated = Math.max(0, 1.0 + osmoticDrive + volumeDrive);
    pat.adhs = Math.max(0, Math.min(6, (pat.adhAutonomous ?? 0) + adhCapacity * adhRegulated));

    // --- THIRST (queue item V2-9) ---
    // Real thirst has two real triggers, engaging at genuinely different
    // sensitivities, the same two afferents that drive ADH secretion above
    // (osmoreceptor + baroreceptor) but NOT the same threshold — thirst is
    // the more conservative of the two systems physiologically:
    //   * OSMOTIC: the dominant, more sensitive driver. Osmoreceptor-
    //     mediated thirst engages at roughly a 1-2% rise in plasma
    //     osmolality above the ~280-290 mOsm/kg setpoint (Robertson,
    //     "Regulation of Arginine Vasopressin in the Syndrome of
    //     Inappropriate Antidiuresis" — the same ~1% ADH-release threshold
    //     already anchors osmoticDrive two lines above, and thirst's own
    //     threshold is a close, slightly higher-set neighbor on the same
    //     osmoreceptor). Modeled as a ramp from 0 at the setpoint to a full
    //     drive at roughly 3% above it — deliberately gated to only the
    //     RISING side (osm below setpoint should not produce negative
    //     thirst), same clamp-at-zero idiom osmoticDrive's own consumer
    //     already uses.
    //   * HYPOVOLEMIC: baroreceptor-mediated, real but LESS sensitive and
    //     engaging only at a larger volume deficit than osmotic thirst
    //     does — clinically, roughly a 10-15% loss of effective circulating
    //     volume before hypovolemic thirst becomes a significant drive
    //     (Fitzsimons, "Angiotensin, thirst, and sodium appetite") —
    //     reusing the SAME volumeDepletion fraction already computed above
    //     for ADH's own (more sensitive, ~nothing-needed) volume drive,
    //     just gated at a real, higher deadband before it contributes.
    // The two combine rather than simply taking the max, since a patient
    // who is both hyperosmolar AND volume-depleted (the common dehydration
    // picture — DKA/HHS osmotic diuresis is the worked example item 43
    // already built) is thirstier than either alone would predict.
    const thirstOsmotic = Math.max(0, Math.min(1, (osm - osmSetpoint) / (osmSetpoint * 0.03)));
    const thirstVolume = Math.max(0, Math.min(1, (volumeDepletion - 0.10) / 0.15));
    pat.thirstDrive = Math.max(0, Math.min(1, thirstOsmotic * 0.7 + thirstVolume * 0.5));

    // Renal handling of water: retention when below the defended volume,
    // diuresis when above it. This closes the loop that RAAS/ADH were already
    // computing but never actuated. It is deliberately SLOW (hours) — renal
    // volume compensation cannot mask an acute hemorrhage, it only sets where
    // body water settles over time.
    if (pat.targetBloodVol > 0) {
      const tau = 240;                                  // minutes
      const drive = renalPerf * injuryFactor;           // a failing kidney regulates poorly

      // --- PRESSURE NATRIURESIS (Guyton renal-body fluid feedback) ---
      // LONG-TERM arterial pressure is set by the kidney, not the baroreflex.
      // Baroreceptors ADAPT — they reset toward the prevailing pressure over
      // hours (pat.baroSetpoint does exactly this), so they buffer acute changes
      // but cannot defend a pressure level chronically. The kidney closes that
      // loop: a rise in renal perfusion pressure increases sodium and water
      // excretion, which lowers blood volume, cardiac output and therefore
      // pressure, until excretion again matches intake. This was entirely
      // missing — arterial pressure simply settled wherever the mechanics put
      // it. Demonstrated directly: adding 1 L raised MAP from 116 to 138 and it
      // was STILL 138 ninety minutes later, because nothing regulated pressure.
      // Because the response is gated by renal function below, impaired kidneys
      // now produce volume-dependent hypertension on their own.
      const pressureSetpoint = pat.ageProfile.baselineMAP();
      // Gain is deliberately CHRONIC (hours-to-days, ~0.1 L/h per 10 mmHg): this
      // is the long-term controller, so it must set where a patient's pressure
      // sits at rest without perceptibly shifting volume during a single
      // prehospital contact. A larger gain "fixes" resting MAP within minutes,
      // but only by making the patient hypovolemic — which would mask, rather
      // than expose, any residual error in the resting arterial mechanics.
      const kPressureNatriuresis = 0.00018;             // L/min per mmHg of excess
      const natriuresis = kPressureNatriuresis * (pat.map - pressureSetpoint) * drive;

      const dV = (((pat.targetBloodVol - pat.totalBloodVol) / tau) * drive - natriuresis) * dt;
      const step = Math.max(-0.02 * dt, Math.min(0.02 * dt, dV));  // cap L/min
      pat.plasmaVol = Math.max(0, pat.plasmaVol + step);
      pat.totalBloodVol = Math.max(0, pat.totalBloodVol + step);
      // Volume regulation moves ISOTONIC fluid — RAAS retains salt AND water
      // together — so this changes volume without changing concentration.
      pat.naMass = Math.max(50, pat.naMass + pat.na * step);
    }

    // --- RENAL FREE-WATER HANDLING (ADH) ---
    // ADH sets collecting-duct water permeability. Above its resting level the
    // kidney reabsorbs solute-free water (antidiuresis); below it, free water is
    // excreted. Net free-water balance is intake minus excretion — at rest they
    // cancel, so a normal patient holds a steady sodium. Because ADH is itself
    // driven by osmolality and volume above, this closes the osmoregulatory
    // loop: it defends sodium concentration WITHOUT sodium ever being written
    // to directly. Fixed-high ADH (SIADH) retains water into hyponatremia;
    // absent ADH (diabetes insipidus) loses free water into hypernatremia.
    const ADH_REST = 1.0;
    // Collecting-duct responsiveness to ADH. 1 = normal; reduced values are
    // nephrogenic diabetes insipidus (lithium, hypercalcemia, medullary disease),
    // where ADH is present and often high but the duct cannot answer it.
    const adhResponse = Math.max(0, Math.min(1, pat.adhRenalResponsiveness ?? 1));
    const adhEffect = Math.max(-1, Math.min(1, (pat.adhs * adhResponse - ADH_REST) / 1.5));
    const maxFreeWaterFlux = 0.0035;                    // L/min (~5 L/day either way)
    const waterFlux = maxFreeWaterFlux * adhEffect * renalPerf * injuryFactor * dt;
    if (waterFlux !== 0) {
      // Free water distributes across the extracellular water it enters.
      const pFrac = pat.plasmaVol / ecfWater;
      pat.plasmaVol = Math.max(0.1, pat.plasmaVol + waterFlux * pFrac);
      pat.interstitialVol = Math.max(0.5, pat.interstitialVol + waterFlux * (1 - pFrac));
      pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
    }

    // --- OSMOTIC DIURESIS (glucosuria) ---
    // Queue item 43 (nephron abstraction) named this as a real payoff of
    // segmenting the nephron; this is the narrow, general slice, built
    // without the full segmentation. Real mechanism: once blood glucose
    // exceeds the renal glucose threshold (~180 mg/dL — the point at which
    // proximal-tubule glucose reabsorption capacity, Tm-glucose, is
    // exceeded), unreabsorbed glucose remains in the tubular lumen and
    // creates an osmotic force that drags free water out REGARDLESS of ADH
    // status — the actual mechanism behind DKA/HHS's classic severe
    // polyuria/dehydration. Previously represented in this engine only as
    // a flat, glucose-INDEPENDENT plasmaVol depletion rate scripted
    // per-condition (diabeticKetoacidosis/hyperosmolarHyperglycemicState),
    // which meant the "osmotic diuresis" comment at those sites was
    // narration, not mechanism: the same drain rate applied whether
    // glucose was 850 or, after treatment brought it back toward normal,
    // 150 — real osmotic diuresis should slow and stop once glucose falls
    // back under threshold, which a flat rate cannot do. This is now
    // GENERAL (any sufficiently hyperglycemic patient shows it, not just
    // the two conditions that happened to script it) and EMERGES from the
    // patient's own live glucose value rather than a fixed per-condition
    // number.
    //
    // Coefficient identified by measurement against this engine's own two
    // already-calibrated flat rates, not invented: DKA's old 0.025 L/min at
    // glu~550 (excess 370 above threshold) implies ~0.0000676/mg/dL; HHS's
    // old 0.035 L/min at glu~850 (excess 670) implies ~0.0000522/mg/dL —
    // both landing in the same order of magnitude, so 0.00006 sits inside
    // that measured range rather than inventing a third number.
    const GLUCOSE_RENAL_THRESHOLD = 180; // mg/dL
    const glucoseExcess = Math.max(0, (pat.glucose ?? 100) - GLUCOSE_RENAL_THRESHOLD);
    const osmoticDiuresis = glucoseExcess * 0.00006 * renalPerf * injuryFactor * dt;
    if (osmoticDiuresis > 0) {
      pat.plasmaVol = Math.max(0.1, pat.plasmaVol - osmoticDiuresis);
      pat.totalBloodVol = pat.plasmaVol + pat.rbcVol;
    }

    // --- RENAL SODIUM HANDLING ---
    // Salt and water are regulated by TWO loops with distinct controlled
    // variables, and between them they fully determine sodium concentration:
    //   * WATER (ADH, above) defends osmolality — i.e. the CONCENTRATION.
    //   * SODIUM (aldosterone/RAAS) defends extracellular VOLUME, and it is
    //     already actuated by the isotonic retention/excretion in the volume
    //     controller above, which moves sodium and water together.
    // An additional free-standing aldosterone->sodium-mass flux was therefore
    // both redundant and unanchored: resting aldosterone decays toward zero at
    // normal renal perfusion, so a flux referenced to an assumed resting value
    // excreted sodium continuously and drove a healthy patient to a serum sodium
    // of 126 mmol/L over 12 hours. Sodium mass now changes only through
    // physically identified routes — isotonic renal handling, hemorrhage, and
    // administered fluids — so it is conserved when nothing is moving it.
    // pat.cl used to be BACK-derived from hco3 here (100 + (hco3-24)*0.5) —
    // backwards from real causality, and the reason a non-anion-gap and an
    // anion-gap acidosis were mechanistically indistinguishable in this
    // engine (see acidbase.js's header, queue item 44). Chloride is now the
    // independent variable — CL_BASELINE + pat.clShift, computed in
    // acidbase.js's updateAcidBase(), which runs later in this tick's own
    // pipeline (after this function) — and hco3 derives FROM it instead.
    pat.cortisol += (pat.sympathetic - pat.cortisol) * 0.1 * dt;

    // --- ENDOCRINE PANCREAS (queue item 5's remaining dead-field) ---
    // pat.insulin/pat.glucagon (patient.js constructor, both defaulted to
    // 1) were set once and never read or written again — glucose
    // regulation ran entirely through direct pat.glucose writes in pk.js
    // (dextrose/glucagon/oralGlucose dosing) and each condition's own
    // `initial.glu`. This is a real, minimal beta-cell/alpha-cell feedback
    // loop, not a fitted curve: insulin secretion rises with glucose
    // (Sherwin et al.'s classic dose-response is steep and roughly linear
    // over the clinically relevant 70-250 mg/dL range before saturating at
    // higher glucose); glucagon is the mirror counter-regulatory hormone,
    // rising as glucose falls below euglycemia (its whole physiological
    // job). Both targets are centered on 1.0 at the same 100 mg/dL
    // reference this engine's own patient.js constructor default already
    // uses, so a healthy, condition-less patient starts and stays at
    // insulin=glucagon=1 with zero net glucose drift (verified below).
    const insulinTarget = Math.max(0.1, Math.min(5, 1 + (pat.glucose - 100) / 50));
    const glucagonTarget = Math.max(0.1, Math.min(4, 1 - (pat.glucose - 100) / 80));
    // Real endogenous secretion responds within minutes (first-phase
    // insulin release peaks within ~5 min of a glucose stimulus; glucagon's
    // counter-regulatory rise on falling glucose is similarly fast) — same
    // relaxation-toward-target shape as cortisol's own line above, at a
    // comparably fast tau (~8 min, rate 0.125/min) rather than a slower
    // multi-hour hormonal axis.
    pat.insulin += (insulinTarget - pat.insulin) * 0.125 * dt;
    pat.glucagon += (glucagonTarget - pat.glucagon) * 0.125 * dt;

    // GLUCOSE DISPOSAL/PRODUCTION — the real, new consequence that makes
    // insulin/glucagon more than a decorative pair of numbers. Insulin
    // drives peripheral glucose UPTAKE (disposal), glucagon drives hepatic
    // glycogenolysis/gluconeogenesis (production) — the two opposing real
    // mechanisms that, in health, hold glucose near a set point with no
    // outside intervention (this engine previously had NO such mechanism
    // at all: pat.glucose was completely static outside a drug dose or a
    // condition's one-time `initial.glu`, confirmed by grep before writing
    // this). pat.insulinSensitivity (patient.js, default 1) is the
    // TISSUE-RESPONSE lever, deliberately separate from secretion —
    // diabetesT2/HHS's real insulin-RESISTANT phenotype lowers this
    // instead of pat.insulin itself, while DKA/T1DM's real insulin-
    // DEFICIENT phenotype caps pat.insulin directly (see conditions.js).
    // Coefficients chosen so a healthy patient (insulin=glucagon=1,
    // sensitivity=1, glucose=100) sits at exact equilibrium (disposal ==
    // production, verified below), and a non-diabetic hyperglycemic
    // patient (e.g. stress hyperglycemia, glu~250) drifts back toward
    // normal over a real, gentle, multi-tens-of-minutes timescale — a
    // physiological correction, not a same-tick cure. The 60 mg/dL floor
    // on the disposal term prevents insulin from driving glucose into
    // hypoglycemia on its own (real basal insulin does not overshoot into
    // hypoglycemia in a person with intact counter-regulation); the 40x
    // ratio between the two rate constants is exactly what equilibrium at
    // the 100 mg/dL reference point (glucose-60=40) requires algebraically
    // once both targets are pinned to 1.0 there.
    const DISPOSE_RATE = 0.0007;   // mg/dL/min per (insulin unit x mg/dL above floor)
    const PROD_RATE = 0.028;       // mg/dL/min per glucagon unit
    const disposal = DISPOSE_RATE * pat.insulin * (pat.insulinSensitivity ?? 1) *
      Math.max(0, pat.glucose - 60) * dt;
    const production = PROD_RATE * pat.glucagon * dt;
    pat.glucose = Math.max(0, pat.glucose - disposal + production);
}

export function updateElectrolytes(pat, dt) {
    const pHDrop = 7.4 - (pat.ph || 7.4);
    // Acidaemia drives K+ out of cells. This is a RATE (mEq/L per minute), so it
    // must be scaled by dt like the renal loss below — previously it was added
    // once per sub-step regardless of dt, so any small sustained pH offset
    // integrated into lethal hyperkalaemia within minutes.
    // --- POTASSIUM AS A CONSERVED EXTRACELLULAR MASS ---
    // Serum K+ is a concentration, so like sodium it must be mass / water. It was
    // previously a free-standing number, which meant the extracellular volume had
    // no effect on it at all: giving two litres of fluid could not dilute a
    // hyperkalaemic patient, and losing extracellular water could not concentrate
    // one. Every route that moves potassium is now expressed as a movement of
    // MASS (mmol), and the reported concentration follows from the water it sits
    // in — so dilution, contraction, transcellular shift and renal excretion all
    // compose correctly instead of each writing the same number.
    const ecfK = Math.max(0.5, pat.plasmaVol + pat.interstitialVol);
    if (pat.kMass == null) pat.kMass = (pat.k || 4) * ecfK;
    // Conditions and procedures may still write pat.k directly (e.g. crush injury
    // releasing intracellular potassium). Treat any such external write as
    // authoritative and re-derive the mass from it, so the two representations
    // cannot silently diverge.
    // Compare against the value WE last published, not against the current
    // mass/water quotient: the quotient legitimately changes whenever
    // extracellular water moves (that is the whole point of a mass model), so
    // testing it would misread every dilution as an external write and undo it.
    if (pat._kPublished == null) pat._kPublished = pat.k;
    if (Math.abs((pat.k || 4) - pat._kPublished) > 1e-6) pat.kMass = (pat.k || 4) * ecfK;

    // Acidaemia drives K+ OUT of cells (H+/K+ exchange): mass enters the ECF.
    const kShiftConc = pHDrop * (pat.lactate > 2 ? 0.2 : 0.6) * dt;

    // BETA-2 STIMULATION DRIVES K+ INTO CELLS (Na/K-ATPase activation). This is
    // why nebulised albuterol is a first-line temporising treatment for
    // hyperkalaemia, and why a patient on a beta-2 agonist infusion drifts
    // hypokalaemic. beta2Tone already existed and was correctly composed; nothing
    // consumed it for this. Referenced to resting tone so a drug-free patient
    // contributes nothing.
    const REST_BETA2 = 0.07;
    // Magnitude anchored to the documented clinical effect: nebulised albuterol
    // lowers serum potassium by roughly 0.5-1.5 mEq/L over 30-60 minutes.
    const beta2K = Math.max(0, (pat.beta2Tone ?? REST_BETA2) - REST_BETA2) * 0.07 * dt;

    // Drug-driven transcellular movement already queued by pk.js (insulin, bicarb).
    const shiftAmount = pat.transcellularKShift * (dt / 300);
    pat.transcellularKShift -= shiftAmount;

    // Renal excretion, driven by the gradient above normal and by aldosterone.
    const renalLoss = ((pat.k || 4) - 4.0) * pat.kExcretion * 0.01;
    const aldoEffect = (pat.aldosterone - 1) * 0.05;

    // NA/K-ATPase FAILURE — the post-arrest / post-mortem potassium rise.
    //
    // Roughly 98% of body potassium is intracellular, held there against a steep
    // gradient by the Na/K-ATPase. That pump is the single largest consumer of
    // cellular ATP, so when oxidative phosphorylation fails the gradient is no
    // longer defended and K+ leaks out along it. This is the mechanism behind
    // the rise in serum potassium after prolonged arrest, behind the
    // hyperkalaemia of crush and reperfusion injury, and behind the steady
    // post-mortem climb that makes vitreous potassium usable for estimating
    // time since death.
    //
    // Driven by pat.energyFailure (metabolic.js) — the measured shortfall of
    // oxygen delivery against oxidative demand — NOT by any death flag. A
    // perfused patient has energyFailure 0 and contributes nothing here, so
    // normal physiology is untouched; a patient in arrest has it near 1 whether
    // or not anything has classified them as dead.
    //
    // Rate anchored to the ~0.2 mmol/L/min observed early in complete no-flow
    // arrest (serum K+ reaching roughly 7-10 mmol/L over 20-30 minutes).
    // Deliberately NOT a standalone "death meter": it is one term in the same
    // balance as acidaemic shift, beta-2 uptake, drug shifts and renal
    // excretion, so the resulting potassium reflects the interaction of
    // ischemia duration, acid-base state and renal clearance — and it falls
    // again if perfusion is restored and the kidney can excrete the load.
    const pumpFailureK = (pat.energyFailure ?? 0) * 0.2 * dt;

    const dConc = kShiftConc + pumpFailureK + shiftAmount - beta2K - (renalLoss + aldoEffect) * dt;
    // The mass floor must scale with the patient's own ECF volume, not be a flat
    // number: it exists only to keep kMass/ecfK from implying an impossibly low
    // serum K (the same 2.5 mEq/L floor the line below applies to the derived
    // concentration), so the floor is that same concentration times THIS
    // patient's ecfK, not an adult-sized volume's worth of mass.
    // WHAT WAS WRONG: a flat `Math.max(20, ...)` was calibrated for an adult ECF
    // (~17 L, physiological kMass ~68 mEq, so 20 never bound). For a newborn
    // (ecfK ~2 L, physiological kMass ~8 mEq), that same flat 20 forced kMass up
    // to 20 on the very first tick after birth — an instant, deterministic
    // "hyperkalemic arrest at birth" for every newborn spawned via the
    // childbirth scenario's roster (measured: k 4 -> 9.3 mEq/L and rhythm ->
    // asystole within one 2-second tick). A body-size reference error, the same
    // defect class as the _restCo and bodyScaleBaselineL bugs.
    pat.kMass = Math.max(2.5 * ecfK, pat.kMass + dConc * ecfK);
    pat.k = Math.max(2.5, Math.min(12, pat.kMass / ecfK));
    pat._kPublished = pat.k;
}

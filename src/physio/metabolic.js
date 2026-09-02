// Blood volume, capillary fluid shifts (Starling), lactate/acid-base metabolism.
import { oncoticPressureFromMass, HCT_NORMAL, NORMAL_HB } from "./constants.js";

export function updateHemorrhage(pat, dt) {
    if (pat.activeBleedRate <= 0) return;
    const clotMod = Math.max(0.1, pat.clotStrength);
    // Hemorrhage is PRESSURE-DRIVEN FLOW through a wound: Q = dP / R_wound. The
    // declared activeBleedRate is the rate at the patient's normal perfusion
    // pressure, so it must be scaled by how much pressure is actually left.
    //
    // WHAT WAS WRONG: the rate was independent of perfusion, so bleeding
    // continued at full declared rate all the way to an empty circulation.
    // Measured on the `motorcycle` scenario, blood volume reached 0.000 L within
    // 15 minutes and the engine then integrated the corpse — HR 175 in PEA held
    // for six minutes, serum sodium pinned at exactly 100 and lactate at exactly
    // 20.0 (both clamp rails), still bleeding 0.360 L/min from a circulation
    // with nothing in it. Five scenarios did this. scenarioSweep passed ~497k
    // checks throughout, because every value stayed finite, non-negative and
    // mass-conserving on the way down — see the survivable-range checks added
    // there, which is what surfaced this.
    //
    // With the pressure term, exsanguination ASYMPTOTES instead of draining the
    // tank: as volume falls, mean arterial pressure falls, and the bleeding
    // slows itself. That is the same physiology behind permissive hypotension as
    // a resuscitation strategy, and it is why compensated early hemorrhage keeps
    // bleeding briskly — the baroreflex is defending MAP, so the pressure term
    // stays near 1 until compensation fails.
    //
    // Normalized against the patient's OWN age-appropriate baseline MAP
    // (ageProfile.baselineMAP(), already the baroreflex setpoint) so a patient at
    // rest bleeds at exactly the declared rate and every existing bleed
    // coefficient keeps its meaning. Capped at 1.5 so a hypertensive patient
    // bleeds faster but boundedly.
    const mapRef = Math.max(40, pat.ageProfile?.baselineMAP?.() ?? 93);
    const perfusionFactor = Math.max(0, Math.min(1.5, (pat.map ?? mapRef) / mapRef));
    const rate = pat.activeBleedRate * perfusionFactor / clotMod;
    const loss = rate * dt;
    if (loss <= 0) return;
    const hct = pat.totalBloodVol > 0 ? pat.rbcVol / pat.totalBloodVol : HCT_NORMAL;
    const rbcLoss = loss * hct;
    const plasmaLoss = loss * (1 - hct);
    pat.totalBloodVol = Math.max(0, pat.totalBloodVol - loss);
    pat.rbcVol = Math.max(0, pat.rbcVol - rbcLoss);
    pat.plasmaVol = Math.max(0, pat.plasmaVol - plasmaLoss);
    // Hemorrhage is an ISOTONIC loss — sodium leaves dissolved in the lost
    // plasma water, so the concentration is unchanged. This is why bleeding
    // causes hypovolemia without hypernatremia.
    pat.naMass = Math.max(0, (pat.naMass ?? 0) - (pat.na || 140) * plasmaLoss);
    // Potassium leaves with the same plasma water, so bleeding does not by itself
    // derange the serum potassium.
    if (pat.kMass != null) pat.kMass = Math.max(0, pat.kMass - (pat.k || 4) * plasmaLoss);
    pat.rbcMass = pat.rbcVol * NORMAL_HB * 10 / HCT_NORMAL;
    const albuminLoss = pat.ivAlbuminMass * (plasmaLoss / Math.max(0.001, pat.plasmaVol + plasmaLoss));
    pat.ivAlbuminMass = Math.max(0, pat.ivAlbuminMass - albuminLoss);
    const normalBV = pat.ageProfile.bloodVolumeL();
    if (pat.totalBloodVol < normalBV * 0.85 && pat.interstitialVol > 1) {
      const refillRate = 0.008;
      const refill = Math.min(refillRate * dt, normalBV - pat.totalBloodVol, pat.interstitialVol);
      pat.totalBloodVol += refill;
      pat.plasmaVol += refill;
      pat.interstitialVol -= refill;
    }
}

// Queue item 7 (standing condition-library workstream) — Malaria.
// Genuinely NEW mechanism category: pure red-cell DESTRUCTION, distinct in
// kind from every existing bleeding pathway. updateHemorrhage above (and
// every wound/internal-bleed condition in this engine) removes whole blood
// PROPORTIONALLY — rbcVol and plasmaVol both fall at the patient's own hct
// ratio, because a wound loses whatever mixture of red cells and plasma is
// actually flowing through it. Hemolysis is mechanistically the opposite:
// P. falciparum ruptures parasitized (and, via splenic clearance of
// rigidified/opsonized cells, a larger share of NON-parasitized) red cells
// IN PLACE, inside the vascular space — the plasma itself is not lost, only
// the cells suspended in it. That is why acute malarial anemia does not
// produce hypovolemic shock the way an equivalent blood LOSS would: the
// intravascular volume is refilled by the plasma that was never removed.
//
// pat.hemolysisRate (fraction of rbcMass destroyed per minute) is the one
// thing a condition declares, the same "declare the lesion" idiom
// cytochromeBlock/pathogenBurden already establish elsewhere in this
// engine. rbcVol/rbcMass fall; totalBloodVol falls by exactly the same
// amount (red cells are gone, so the space they occupied is gone too);
// plasmaVol is UNTOUCHED — the real, distinguishing two-sided signature
// versus updateHemorrhage's proportional loss.
//
// MAGNITUDE, cited not guessed: WHO severe-malaria criteria (WHO, "Severe
// falciparum malaria," Trans R Soc Trop Med Hyg 2000/WHO 2015 guidelines)
// define severe malarial anemia as Hb < 5 g/dL (Hct < 15%) — a real,
// large fall from a normal ~13-15 g/dL, but one that is documented as
// developing over DAYS in a heavy, sustained parasitemia (commonly cited
// >5% parasitized erythrocytes / >250,000 parasites/uL is the threshold
// associated with severe disease — WHO 2000). Within one ~15-30 minute EMS
// encounter, the honest, measurable consequence is a SMALL fraction of
// that total — the same "real, present, small and slow within one call"
// precedent thermalBurn's/hepaticStunning's own comments already establish
// for a process whose real timescale is hours-to-days, not minutes.
export function updateHemolysis(pat, dt) {
    const rate = pat.hemolysisRate || 0;
    if (rate <= 0) return;
    const rbcLoss = pat.rbcMass * rate * dt / 100; // rate is %/min of rbcMass
    if (rbcLoss <= 0) return;
    const hct = pat.totalBloodVol > 0 ? pat.rbcVol / pat.totalBloodVol : HCT_NORMAL;
    const rbcVolLoss = hct > 0 ? Math.min(pat.rbcVol, rbcLoss / (NORMAL_HB * 10 / HCT_NORMAL)) : 0;
    pat.rbcMass = Math.max(0, pat.rbcMass - rbcLoss);
    pat.rbcVol = Math.max(0, pat.rbcVol - rbcVolLoss);
    // The destroyed cells' own volume leaves the vascular space (they are
    // gone, not converted to plasma), but nothing removes plasma — this is
    // the one line that makes this mechanism genuinely different from
    // updateHemorrhage's proportional loss above.
    pat.totalBloodVol = Math.max(0, pat.totalBloodVol - rbcVolLoss);
}

export function updateFluidShifts(pat, dt) {
    // --- ENDOTHELIAL BARRIER INJURY -----------------------------------------
    // sigma and Kf were both hard constants, which meant no disease in the
    // library could express the single most important thing a damaged
    // endothelium does. Every capillary-leak state — preeclampsia, sepsis,
    // burns, anaphylaxis, ARDS — had to be faked as an edema number or a blood
    // volume write, because the Starling equation the engine already solves had
    // no injury input. pat.capillaryLeak is that input (0 intact, 1 maximal).
    //
    // The two coefficients move for different reasons and are identified
    // separately:
    //
    //   sigma (reflection coefficient) is how well the barrier retains albumin.
    //   The whole-body value in health is ~0.9. Endothelial injury opens the
    //   protein-permeable pathway: the transcapillary escape rate of albumin,
    //   ~5%/h normally, roughly doubles-to-triples in severe systemic
    //   inflammation and is measurably raised in preeclampsia. A fall to ~0.55
    //   at maximal injury reproduces that order of magnitude, and — this is the
    //   part that matters clinically — it also collapses the oncotic term
    //   sigma*(ivOnc - isOnc) that normally HOLDS water in the vessel, because
    //   protein that has crossed raises isOnc on the far side of the membrane.
    //
    //   Kf (filtration coefficient) is bulk hydraulic conductivity — surface
    //   area times permeability to water. It rises several-fold in the same
    //   states; 3x at maximal injury is the conservative end of the reported
    //   range and is what sets the SPEED of accumulation rather than its
    //   endpoint.
    //
    // The pathognomonic combination of these two is a patient who is
    // simultaneously intravascularly DEPLETED and grossly EDEMATOUS. That is
    // emergent here: neither state is written anywhere. It is what preeclampsia
    // looks like, and it is why filling such a patient with crystalloid drowns
    // her rather than restoring her pressure.
    const leak = Math.max(0, Math.min(1, pat.capillaryLeak || 0));
    const sigma = 0.9 - 0.35 * leak;
    const capPressure = 10 + 0.5 * (pat.cvp || 5);
    const interPressure = -3;
    const ivOnc = oncoticPressureFromMass(pat.ivAlbuminMass, pat.plasmaVol);
    const isOnc = oncoticPressureFromMass(pat.isAlbuminMass, pat.interstitialVol);
    const netPressure = (capPressure - interPressure) - sigma * (ivOnc - isOnc);
    const Kf = 0.002 * (1 + 2 * leak);
    const Jv = Kf * netPressure * dt;
    if (Jv > 0) {
      const move = Math.min(Jv, pat.plasmaVol * 0.1);
      pat.plasmaVol -= move;
      pat.interstitialVol += move;
      pat.totalBloodVol -= move;
      const albuminMove = pat.ivAlbuminMass * (move / (pat.plasmaVol + move)) * (1 - sigma);
      pat.ivAlbuminMass -= albuminMove;
      pat.isAlbuminMass += albuminMove;
    } else if (Jv < 0) {
      const move = Math.min(-Jv, pat.interstitialVol * 0.1);
      pat.plasmaVol += move;
      pat.interstitialVol -= move;
      pat.totalBloodVol += move;
      const albuminMove = pat.isAlbuminMass * (move / (pat.interstitialVol + move)) * (1 - sigma);
      pat.isAlbuminMass -= albuminMove;
      pat.ivAlbuminMass += albuminMove;
    }
    // --- LYMPHATIC RETURN ---
    // Net capillary filtration is not a one-way leak: the lymphatics drain the
    // interstitium back into the circulation (~2-4 L/day in an adult) and carry
    // the filtered protein with it. Without this the Starling equation bleeds
    // plasma into the interstitium indefinitely — a completely healthy patient
    // lost ~3.7% of plasma volume every 30 min and progressively
    // hemoconcentrated. Lymph flow rises steeply as the interstitium distends
    // (the "edema safety factor"), so the interstitium has an equilibrium: at
    // rest, lymph return balances filtration; when filtration rises, a modest
    // interstitial expansion drives enough extra lymph to match it, and only
    // when that reserve is exhausted does edema accumulate.
    const isBase = pat.interstitialVolBaseline ?? pat.interstitialVol;
    const excess = pat.interstitialVol - isBase;
    if (excess > 0) {
      const lymphGain = 0.02;                       // L/min per L of interstitial excess
      const lymph = Math.min(lymphGain * excess * dt, pat.interstitialVol * 0.1);
      if (lymph > 0) {
        pat.interstitialVol -= lymph;
        pat.plasmaVol += lymph;
        pat.totalBloodVol += lymph;
        // Lymph returns interstitial protein to the circulation — this is how
        // albumin gets back, and why the oncotic gradient is sustainable.
        const prot = pat.isAlbuminMass * (lymph / Math.max(0.001, pat.interstitialVol + lymph));
        pat.isAlbuminMass -= prot;
        pat.ivAlbuminMass += prot;
      }
    }
    pat.ivProtein = pat.plasmaVol > 0 ? pat.ivAlbuminMass / pat.plasmaVol : 0;
    pat.isProtein = pat.interstitialVol > 0 ? pat.isAlbuminMass / pat.interstitialVol : 0;
}

export function updateMetabolism(pat, dt) {
    const hb = pat.hb ?? 0;   // derived once per substep in patient.js
    // CARBON MONOXIDE POISONING: the COHb-bound fraction of hemoglobin is
    // simply unavailable to carry oxygen (real functional anemia, not a
    // change to the oxyhemoglobin dissociation curve of the REMAINING
    // Hb — pat.sao2 itself, computed in respiratory.js from PaO2/pH/PaCO2,
    // is left alone). This is the authoritative caO2 site (last write wins
    // over respiratory.js's own intermediate computation, since this runs
    // later in the per-tick substep order) — every organ delivery signal in
    // this engine (brainO2, hepaticDO2, gutDO2, skinDO2, renalDO2, the do2
    // term below) already derives from caO2, so a real, previously-hidden
    // hypoxic consequence reaches all of them from this one change, with no
    // second, per-organ mechanism needed. Deliberately does NOT add a
    // separate direct-cytochrome-oxidase-toxicity term: real CO does have
    // one at high levels, but no well-anchored coefficient for it was found,
    // and the oxygen-delivery collapse alone already reaches the correct
    // downstream severity (confusion via brainO2, ATP failure via
    // energyFailure below) — see conditions.js's carbonMonoxidePoisoning for
    // the full reasoning.
    const cohbFrac = Math.min(0.95, pat.cohb || 0);
    // METHEMOGLOBIN (queue item V2-30): the ferric fraction of Hb, like the
    // CO-bound fraction above, is simply unavailable to carry O2 — a second,
    // separate functional-anemia mechanism composing with cohb rather than
    // replacing it (a real patient could in principle carry both, though no
    // shipped condition does).
    const metHbFrac = Math.min(0.9, pat.metHb || 0);
    pat.caO2 = 1.34 * hb * (1 - cohbFrac - metHbFrac) * pat.sao2 / 100 + 0.003 * pat.pao2;
    const do2 = pat.co * pat.caO2 * 10;
    // PUBLISHED (queue item 7, cyanidePoisoning). This was a local only, which
    // left mechanismWiring.mjs's own snapshot reading a `p.do2` nothing ever
    // assigned — a real dead field, caught by grep before it could assert
    // anything. It is the engine's whole-body oxygen DELIVERY term, and the
    // delivery-vs-utilization contrast cyanide exists to teach cannot be
    // asserted two-sided without being able to read it: the claim is precisely
    // that do2 is NORMAL while energyFailure is severe.
    pat.do2 = do2;
    // METABOLIC RATE IS NOT CONSTANT.
    // Resting VO2 is the floor, not the value. Oxygen consumption — and with it
    // CO2 production — rises with:
    //   * fever      ~10-13% per degree C above 37 (and falls with hypothermia)
    //   * adrenergic drive (catecholamines raise metabolic rate substantially)
    //   * WORK OF BREATHING: normally ~2-3% of total VO2, but 20-30% in severe
    //     respiratory distress — the respiratory muscles become a major consumer
    //   * seizure / shivering: several-fold
    // Treating it as fixed meant a febrile, seizing or severely dyspnoeic patient
    // consumed exactly as much oxygen as one at rest, and therefore produced
    // exactly as much CO2. That is why tachypnoeic patients over-blew their CO2
    // into an implausible alkalosis (measured pH 7.53-7.59 in trauma and PE):
    // real patients breathing hard also MAKE more CO2, which limits how far the
    // arterial value can fall.
    // Scaled by this patient's own metabolicRate trait (queue item 50,
    // patient.js) — real per-patient basal metabolic variability on top of
    // the age/weight-derived reference, independent of any disease process.
    const restVO2 = pat.ageProfile.totalVO2() * (pat.metabolicRate ?? 1);
    const feverFactor = 1 + Math.max(-0.3, Math.min(0.8, ((pat.coreTemp ?? 37) - 37) * 0.11));
    const adrenergic = 1 + Math.min(0.5, Math.max(0, (pat.beta1Tone ?? 0) - 0.2) * 0.35);
    // Work of breathing scales with minute ventilation above resting and with the
    // impedance it must be delivered against.
    const restMV = restVO2 * 0.025;                    // L/min, ~ resting minute ventilation
    const mv = Math.max(0, (pat.vt || 0) * (pat.rr || 0));
    const wobRatio = Math.max(0, mv / Math.max(0.1, restMV) - 1);
    const loadFactor = 1 + (pat.effectiveBroncho ?? pat.broncho ?? 0) * 1.5;
    const wob = 1 + Math.min(0.35, wobRatio * 0.10 * loadFactor);
    const seizing = pat.seizing ? 2.2 : 1;
    pat.vo2Demand = restVO2 * feverFactor * adrenergic * wob * seizing;
    const vo2Demand = pat.vo2Demand;
    const criticalDO2 = vo2Demand * 1.2;
    let actualVO2;
    if (do2 >= criticalDO2) {
      actualVO2 = vo2Demand;
    } else if (do2 <= 0) {
      actualVO2 = 0;
    } else {
      actualVO2 = vo2Demand * (do2 / criticalDO2);
    }
    // HISTOTOXIC HYPOXIA (cyanide poisoning, queue item 7, Toxicology):
    // cytochrome c oxidase inhibition blocks the terminal step of the
    // electron transport chain, so tissue cannot USE oxygen no matter how
    // much is delivered (do2 above can be normal or high). This is the
    // genuinely missing mechanism CO's own comment above explains it did NOT
    // need — CO's route is a pure delivery (caO2) collapse. pat.cytochromeBlock
    // (0-1, conditions.js's cyanidePoisoning; general enough for any future
    // cytochrome-oxidase toxin) caps actualVO2 at vo2Demand*(1-block),
    // independent of the do2-limited branch above — the two terms compose by
    // MIN, so either delivery failure or utilization failure alone can drive
    // oxygenDebt/energyFailure/lactate, and a patient with both takes the
    // worse of the two rather than double-penalizing.
    const cytochromeBlock = Math.min(1, Math.max(0, pat.cytochromeBlock ?? 0));
    if (cytochromeBlock > 0) actualVO2 = Math.min(actualVO2, vo2Demand * (1 - cytochromeBlock));
    pat.actualVO2 = actualVO2;
    const oxygenDebt = Math.max(0, vo2Demand - actualVO2);
    // CELLULAR ENERGY FAILURE, published as the fraction of oxidative demand
    // that delivery cannot meet: 0 when perfusion covers metabolism, 1 when
    // there is no delivery at all. It was computed here already and thrown
    // away after making lactate. Publishing it gives the rest of the engine a
    // single, mechanistically-derived measure of how far short of its ATP
    // requirement the tissue is running — which is what actually drives
    // ion-pump failure (see the Na/K-ATPase term in renal.js) rather than each
    // module inventing its own ischemia proxy.
    pat.energyFailure = vo2Demand > 0 ? Math.min(1, oxygenDebt / vo2Demand) : 0;
    // NON-ISCHEMIC lactate sources: these are systemic (sepsis's impaired
    // mitochondrial pyruvate utilization even in well-perfused tissue,
    // stress/beta-2-agonist-driven aerobic glycolysis), not a regional
    // no-flow phenomenon, so they add to SERUM lactate directly rather than
    // routing through the tissue compartment below.
    let lactateProd = 0;
    if (pat.riskFactors.sepsis) lactateProd += 0.05;
    lactateProd += (pat.sympathetic - 0.3) * 0.05;
    if (pat.beta2Tone > 0.2) lactateProd += 0.02;

    // TISSUE / SERUM LACTATE SPLIT (queue item 15) — RESOLVED. In true
    // no-flow, anaerobic glycolysis still produces lactate LOCALLY, but there
    // is no circulation to carry it to the venous sampling site — this
    // model previously let ISCHEMIC lactate production add straight to
    // pat.lactate every tick regardless of flow, so serum lactate rose
    // smoothly THROUGH an arrest instead of staying relatively flat and then
    // spiking after ROSC (the documented "washout phenomenon": tissue
    // lactate that accumulated during no-flow is released once circulation
    // resumes). pat.tissueLactate now accumulates unconditionally from the
    // SAME oxygen-debt term (unchanged coefficient, just relocated) and
    // exchanges into serum at a rate set by how much flow is actually
    // reaching the tissue — do2/criticalDO2 is already computed above for
    // actualVO2, reused here rather than inventing a second flow proxy. At
    // true no-flow (do2=0) the exchange rate is genuinely zero: nothing
    // ischemic reaches the sample. Once flow is restored the two
    // compartments equilibrate quickly, producing the spike.
    if (pat.tissueLactate == null) pat.tissueLactate = pat.lactate;
    const tissueLactateProd = oxygenDebt * 0.005;    // same coefficient the old direct term used
    pat.tissueLactate = Math.min(80, pat.tissueLactate + tissueLactateProd * dt);
    const perfusionFrac = criticalDO2 > 0 ? Math.max(0, Math.min(1, do2 / criticalDO2)) : 1;
    const washoutRate = 0.15 * perfusionFrac;          // per-minute equilibration toward tissue level
    const ischemicWashout = (pat.tissueLactate - pat.lactate) * Math.min(1, washoutRate * dt);

    pat.lactate += lactateProd * dt + ischemicWashout;
    // QUEUE ITEM V2-12 — hepatic clearance is now gated on REAL-TIME hepatic
    // flow (pat.hepaticDO2, item 42), not only on accumulated structural
    // liver injury. Before this fix, clearance read `pat.liverInjury` only —
    // a slow accumulator that takes tens of minutes to move — so a patient
    // in acute cardiogenic/obstructive shock with hepaticDO2 collapsed to
    // near zero (real hepatic hypoperfusion, right now) still cleared
    // lactate at nearly the full baseline rate, because the liver hadn't yet
    // accrued measurable structural injury. That is the real "type A lactic
    // acidosis" gap this item names: shock worsens serum lactate via BOTH
    // increased production (already modeled above, sepsis/sympathetic) AND
    // impaired clearance (previously NOT modeled in real time).
    //
    // Coefficient: hepatic lactate clearance capacity roughly halving at
    // ~50% reduction in hepatic blood flow is a commonly cited
    // approximation in the critical-care lactate literature (a rough
    // clinical rule of thumb, not a single precise trial figure — stated
    // honestly since a more precise number was not found). hepaticDO2 is
    // already normalized to ~1 at rest (hepaticFlow * caO2/20, neuro.js), so
    // a direct multiply on the hepatic-clearance term reproduces that
    // roughly-linear halving relationship without inventing a new curve.
    // Floored at 0.15 (not 0) because some lactate clearance persists via
    // skeletal muscle/kidney/heart even with near-total hepatic flow loss —
    // the 0.03 baseline term below already represents that non-hepatic
    // route and is left untouched by this gate.
    const hepaticFlowFactor = Math.max(0.15, Math.min(1, pat.hepaticDO2 ?? 1));
    const clearance = 0.03 + (1 - pat.liverInjury * 0.5) * 0.02 * hepaticFlowFactor + (pat.gfr > 30 ? 0.01 : 0);
    pat.lactate = Math.max(0.5, pat.lactate - clearance * dt);
    // Tissue lactate clears too, once perfusion returns — otherwise a
    // patient who was briefly hypoperfused decades ago (in engine terms, one
    // bad minute) would carry an ever-rising tissue reservoir forever. Same
    // clearance mechanism as serum (hepatic/renal elimination reaches
    // tissue via the SAME circulation that washes it out), applied once
    // flow is meaningfully restored.
    if (perfusionFrac > 0.5) pat.tissueLactate = Math.max(0.5, pat.tissueLactate - clearance * dt);
    // CEILING IS A NUMERICAL GUARD, NOT A PHYSIOLOGICAL LIMIT.
    //
    // This was Math.min(20), and the physiology genuinely reached it: measured
    // pinned at exactly 20.0 in three trauma scenarios and by ~14 min of
    // untreated arrest. A value resting exactly on a round guard number is the
    // model running out of mechanism, and here it truncated a real consequence —
    // excessLactate below feeds the metabolic acidosis, so clamping lactate was
    // silently clamping how acidotic a dying patient could become.
    //
    // Severe shock and post-arrest states are documented at 20-30+ mmol/L, with
    // survivable extremes reported around 30-40, so 20 sat INSIDE the real
    // range rather than beyond it. Raised to 40 and labeled for what it is: a
    // guard against numerical runaway, not a claim that 40 is a physiological
    // maximum.
    //
    // KNOWN MISSING MECHANISM, deliberately not faked here: in a true no-flow
    // state SERUM lactate cannot track tissue lactate, because there is no
    // circulation to carry it from tissue to the sampling site. Real arrests
    // show the large lactate rise AFTER ROSC — the washout phenomenon — whereas
    // this model raises serum lactate smoothly during the arrest itself.
    // Representing that needs a tissue/serum compartment split, which is a
    // larger change than a rail; noted so the next reader knows the ceiling is
    // not the only thing simplified here.
    pat.lactate = Math.min(40, pat.lactate);
    // hco3/ph/anionGap used to be finished off right here (a direct hco3
    // ratchet from excess lactate, then Henderson-Hasselbalch). Queue item
    // 44 moved that to acidbase.js's updateAcidBase(), which runs later in
    // patient.js's own per-tick pipeline (after renal.js has settled na/k
    // for this tick) — see that file's header for the real strong-ion-
    // difference mechanism lactate now feeds instead of a bare rate.
}

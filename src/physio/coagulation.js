// Coagulation cascade: clotting factors, platelet activation, fibrinolysis, TXA effect.
export function updateCoagulation(pat, dt) {
    // (pat._plasmaVol0 was captured here for the dilution term below. That term
    // no longer references plasma volume, so the field was removed rather than
    // left written-and-never-read.)
    const consumption = pat.activeBleedRate * 0.5;
    const clotFeedback = Math.max(0.1, pat.clotStrength);
    pat.factorII  = Math.max(0, pat.factorII  - consumption * dt / clotFeedback);
    pat.factorV   = Math.max(0, pat.factorV   - consumption * dt / clotFeedback);
    pat.factorVIII = Math.max(0, pat.factorVIII - consumption * dt / clotFeedback);
    pat.factorX    = Math.max(0, pat.factorX    - consumption * dt / clotFeedback);

    // QUEUE ITEM 46 — tissue-factor-driven consumptive coagulopathy.
    // Real mechanism: sustained cytokine exposure activates endothelium into
    // expressing tissue factor, which triggers extrinsic-pathway coagulation
    // activation throughout the vasculature (not just at a wound) — the
    // actual cause of sepsis-associated DIC. A full biphasic model (an early
    // hypercoagulable/microthrombotic phase preceding the later consumptive
    // one) is not attempted: neither phase is independently observable at
    // this engine's bedside-monitor granularity within a realistic call
    // length, and modeling an unobservable intermediate state that nothing
    // downstream reads would be exactly the decorative-mechanism pattern
    // this project's own conventions forbid. What IS observable and real is
    // the consumptive endpoint — falling factors/platelets/fibrinogen and a
    // rising fibrinolytic drive — so that is what is modeled directly,
    // scaled by pat.cytokineLoad (inflammation.js), zero for any patient
    // whose condition never sets pat.pathogenBurden. The rate (0.08 at
    // cytokineLoad=1) is a stated, honest estimate — chosen to be clinically
    // meaningful but SLOWER than an actively bleeding wound's own
    // consumption (activeBleedRate*0.5 easily exceeds 0.08 for any real
    // hemorrhage), since sepsis-associated DIC is a real but comparatively
    // gradual process next to a mechanical bleed, not a cited trial number.
    if (pat.cytokineLoad > 0) {
      const tfConsumption = 0.08 * pat.cytokineLoad;
      pat.factorII   = Math.max(0, pat.factorII   - tfConsumption * dt);
      pat.factorV    = Math.max(0, pat.factorV    - tfConsumption * dt);
      pat.factorVIII = Math.max(0, pat.factorVIII - tfConsumption * dt);
      pat.factorX    = Math.max(0, pat.factorX    - tfConsumption * dt);
      pat.fibrinogen = Math.max(0, pat.fibrinogen - tfConsumption * dt * 0.03);
      pat.plateletCount = Math.max(0, pat.plateletCount - tfConsumption * dt * 2.5);
    }

    // QUEUE ITEM V2-17 — Acute Traumatic Coagulopathy (ATC): a general,
    // endothelial-injury-driven consumptive pathway, deliberately SEPARATE
    // from the cytokine/tissue-factor term just above (item 46 — a real,
    // stated ~90-minute cytokine lag) and from the hemorrhage-volume
    // consumption term at the top of this file (activeBleedRate-driven).
    // Real mechanism (Brohi et al., J Trauma 2003; Frith et al., J Thromb
    // Haemost 2010): severe tissue injury combined with hypoperfusion
    // directly activates protein C via the thrombomodulin-thrombin complex
    // on injured endothelium — this degrades factors Va/VIIIa and drives
    // hyperfibrinolysis WITHIN MINUTES of injury, documented to precede
    // both dilutional and hypothermic coagulopathy, and mechanistically
    // distinct from sepsis-DIC (protein-C-driven anticoagulation from
    // direct mechanical/toxic/burn endothelial injury, not a cytokine
    // cascade activating tissue factor).
    //
    // Gated on real structural tissue injury already present, reusing the
    // organ-injury fields queue items 42/74 built (kidneyInjury/
    // liverInjury/gutInjury/limbInjury) PLUS pat.brainInjury — the one
    // signal already-shipped major-trauma conditions (polytraumaFall,
    // polytraumaMoto) set DIRECTLY at presentation as their own overall
    // structural-injury-severity dial (0.4-0.5 at scene), rather than an
    // accumulator that only builds over tens of minutes to hours the way
    // kidneyInjury/liverInjury/gutInjury/limbInjury themselves do — this is
    // what lets a polytrauma patient trigger ATC immediately at scene
    // instead of waiting on those slower accumulators, matching the real
    // "within minutes" clinical time course this mechanism is named for.
    // Taking the MAX across all five (not a sum) means whichever structural
    // lesion is most severe drives the term, not an unrealistic pile-up of
    // several partially-injured organs.
    //
    // Hypoperfusion is the second real requirement, per Brohi's own model —
    // tissue injury alone (an isolated closed fracture in a normotensive
    // patient) does not produce ATC. Reused via pat.alphaTone, the SAME
    // sympathetic-tone shock proxy item 42's gut/skin mechanisms already
    // established (measured range: ~0.2-0.3 resting, ~0.6 at a genuinely
    // near-terminal shock state — see neuro.js's own comment for the
    // measurement) — deadbanded against resting tone so a compensated,
    // non-shocked trauma patient contributes zero.
    const atcInjury = Math.max(
      pat.brainInjury || 0, pat.kidneyInjury || 0, pat.liverInjury || 0, pat.gutInjury || 0,
      pat.limbInjury ? Math.max(pat.limbInjury.armL || 0, pat.limbInjury.armR || 0, pat.limbInjury.legL || 0, pat.limbInjury.legR || 0) : 0
    );
    const atcShock = Math.max(0, Math.min(1, (pat.alphaTone ?? 0) - 0.3));
    const atcSeverity = Math.max(0, Math.min(1, atcInjury)) * atcShock;
    if (atcSeverity > 0) {
      // Rate deliberately FASTER than cytokineLoad's own 0.08 (item 46's
      // comment) — ATC's whole clinical significance is that it precedes
      // the cytokine cascade — but still slower than a directly bleeding
      // wound's own consumption (activeBleedRate*0.5), matching that
      // comment's own "meaningful but slower than mechanical bleeding"
      // calibration philosophy.
      const atcConsumption = 0.25 * atcSeverity;
      pat.factorII   = Math.max(0, pat.factorII   - atcConsumption * dt);
      pat.factorV    = Math.max(0, pat.factorV    - atcConsumption * dt);
      pat.factorVIII = Math.max(0, pat.factorVIII - atcConsumption * dt);
      pat.factorX    = Math.max(0, pat.factorX    - atcConsumption * dt);
      pat.fibrinogen = Math.max(0, pat.fibrinogen - atcConsumption * dt * 0.03);
      pat.plateletCount = Math.max(0, pat.plateletCount - atcConsumption * dt * 2.5);
    }

    // Dilutional coagulopathy.
    //
    // WHAT WAS WRONG: this was driven by a plasma volume DEFICIT against
    // baseline — `max(0, 1 - plasmaVol/_plasmaVol0)`. That has the sign of the
    // physiology backwards in both directions. Dilution is the arrival of
    // fluid that contains no platelets and no factors, so it makes plasma
    // volume RISE relative to the cellular and protein content; the deficit
    // expression is therefore zero in exactly the case it was written for
    // (crystalloid resuscitation) and positive in the opposite case (plasma
    // being filtered OUT of the circulation, which CONCENTRATES what is left).
    //
    // It went unnoticed because the only patients that moved plasma volume far
    // were hemorrhaging, and there the two errors partly cancelled: a bleeding
    // patient does become coagulopathic, so a term that fired on plasma loss
    // looked right even though its mechanism was inverted. Preeclampsia is what
    // exposed it — a patient who loses a quarter of her plasma to the
    // interstitium with no bleeding at all had her platelet count driven from
    // 250 to 31 x10^9/L by a "dilutional" term, while hemoconcentrating.
    //
    // HEMODILUTION IS A FALLING HEMATOCRIT. That is both the correct physical
    // measure — red cell mass is the conserved quantity that non-blood fluid
    // dilutes — and the bedside marker the effect actually travels with. It
    // still fires on crystalloid resuscitation of a hemorrhage, which is the
    // case this term exists for; it no longer fires on hemoconcentration.
    // The 5% deadband and the 0.55 gain are unchanged, so a patient who is
    // genuinely being diluted sees the same coagulopathy as before.
    if (pat._hct0 == null) pat._hct0 = Math.max(0.05, pat.hct || 0.42);
    const dilution = Math.max(0, (pat._hct0 / Math.max(0.05, pat.hct) - 1) - 0.05) * 0.55;
    pat.fibrinogen *= (1 - dilution * dt);
    pat.plateletCount *= (1 - dilution * dt);

    // Slow hepatic synthesis / marrow release back toward normal, so trivial
    // losses recover and a healthy patient's coagulation stays intact. Severe,
    // sustained hemorrhage still outpaces this and becomes coagulopathic.
    //
    // QUEUE ITEM V2-13 — HEPATIC SYNTHETIC FAILURE, real coagulopathy of
    // liver disease. This regen block previously chased every factor back to
    // a fixed 100/3, regardless of how much liver a patient had left — so a
    // decompensated cirrhotic (pat.liverInjury already real, item 42/48;
    // pat.portalPressure already real, this item's own renal.js half) could
    // never show a real elevated bleeding tendency from synthetic failure
    // alone, only from active consumption (bleeding/DIC/ATC above). That is
    // physiologically wrong: chronic liver disease is a recognized, distinct
    // cause of coagulopathy even with zero active bleeding, because factors
    // II, V, VII, IX and X (plus fibrinogen) are hepatocyte-synthesized, and
    // a fibrotic/failing liver cannot replace consumption at the normal
    // rate (Tripodi & Mannucci, NEJM 2011, "The Coagulopathy of Chronic
    // Liver Disease" — reduced synthesis of the vitamin-K-dependent factors
    // plus factor V is the central mechanism behind cirrhosis's prolonged
    // PT/INR).
    //
    // hepaticSynthCapacity reuses pk.js's own organClearanceFactor()
    // hepatocyte-integrity proxy (Math.max(0.1, 1 - liverInjury*0.7)) rather
    // than inventing a second liver-damage curve — same quantity, same
    // reasoning, single mental model for "how much working liver is left."
    // Factor VIII is DELIBERATELY excluded: it is synthesized mainly by
    // vascular endothelium, not hepatocytes, and is characteristically
    // NORMAL OR ELEVATED (an acute-phase reactant) in liver failure even as
    // II/V/VII/IX/X fall — a real, teachable divergence, not an oversight.
    const hepaticSynthCapacity = Math.max(0.1, 1 - (pat.liverInjury ?? 0) * 0.7);
    const factorTarget = 100 * hepaticSynthCapacity;
    pat.factorII   += (factorTarget - pat.factorII)   * 0.02 * dt;
    pat.factorV    += (factorTarget - pat.factorV)    * 0.02 * dt;
    pat.factorVIII += (100 - pat.factorVIII) * 0.02 * dt;
    pat.factorX    += (factorTarget - pat.factorX)    * 0.02 * dt;
    pat.fibrinogen     += (3 * hepaticSynthCapacity - pat.fibrinogen)     * 0.01 * dt;

    // PORTAL HYPERTENSION -> SPLENIC SEQUESTRATION -> THROMBOCYTOPENIA
    // (queue item V2-13, second real liver-disease coagulation link).
    // Portal hypertension causes congestive splenomegaly, which sequesters
    // platelets in the enlarged spleen rather than destroying them — the
    // recognized mechanism behind cirrhotic thrombocytopenia (Afdhal et al.,
    // Am J Med 2008, "Thrombocytopenia associated with chronic liver
    // disease"), distinct from both DIC-style consumption and dilution
    // above. Reuses pat.portalPressure (renal.js, this same item's own HVPG
    // handle) directly rather than a new liver-severity proxy: below the
    // real >5 mmHg portal-hypertension threshold this term is exactly zero
    // (a patient with no portal lesion is guaranteed unaffected), ramping to
    // a real, bounded 60% sequestration ceiling by clinically-significant
    // portal hypertension (>=10 mmHg) and beyond — cirrhotic platelet counts
    // commonly settle in the 50-100 x10^9/L range (of a 250 baseline here),
    // consistent with a 40-60% reduction, not the near-total loss DIC alone
    // can cause.
    const pp = Math.max(0, pat.portalPressure || 0);
    const spleenSequestration = Math.max(0, Math.min(0.6, (pp - 5) / 15 * 0.6));
    pat.plateletCount  += (250 * (1 - spleenSequestration) - pat.plateletCount)  * 0.01 * dt;

    const activationRate = 0.1 * pat.thrombin;
    pat.plateletActivation += activationRate * dt;
    pat.plateletActivation = Math.min(1, pat.plateletActivation);

    // Fibrinolysis relaxes toward a low baseline and climbs only with shock
    // (the hyperfibrinolysis of trauma) — it is not a one-way ratchet to total
    // clot lysis. TXA suppresses it further.
    // Secondary hyperfibrinolysis is a real, documented feature of septic
    // DIC (the consumptive coagulopathy's own clot-breakdown side, not just
    // factor depletion) — added on the same footing as the existing
    // lactate-driven trauma hyperfibrinolysis term already on this line.
    const plasminTarget = Math.min(1, 0.05 + (pat.lactate > 4 ? 0.35 : 0) + 0.25 * pat.cytokineLoad);
    pat.plasminActivity += (plasminTarget - pat.plasminActivity) * Math.min(1, dt * 0.4);

    // TXA persistent effect (hours)
    pat.txaEffect = Math.max(0, pat.txaEffect - 0.0003 * dt); // slow decay
    pat.plasminActivity = Math.max(0, pat.plasminActivity - 0.05 * pat.txaEffect * dt);

    const tempEff = pat.coreTemp < 35 ? Math.pow(2, (35 - pat.coreTemp) / 2) : 1;
    const acidEff = pat.ph < 7.2 ? Math.pow(2, (7.2 - pat.ph) * 10) : 1;
    const calciumEffect = pat.ca > 1.0 ? 1.0 : pat.ca / 1.0;

    // Factors are expressed as % of normal (100 = normal), so normalize each to
    // a fraction before multiplying — otherwise thrombin came out ~10^6 and
    // clotStrength was so large that bleeding (rate / clotStrength) was
    // effectively suppressed and no patient could ever exsanguinate.
    pat.thrombin = ((pat.factorII / 100) * (pat.factorV / 100) * (pat.factorX / 100) * (pat.plateletCount / 250))
                    * (1 + pat.plateletActivation) / (tempEff * acidEff) * calciumEffect;
    pat.clotStrength = pat.thrombin * pat.fibrinogen / 3;
    pat.clotStrength *= (1 - pat.plasminActivity * 0.5);
    pat.clotStrength = Math.min(1.2, pat.clotStrength);
    pat.coagPct = Math.min(100, Math.round(pat.clotStrength * 100));
}

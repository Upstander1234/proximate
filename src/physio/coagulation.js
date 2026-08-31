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
    pat.factorII   += (100 - pat.factorII)   * 0.02 * dt;
    pat.factorV    += (100 - pat.factorV)    * 0.02 * dt;
    pat.factorVIII += (100 - pat.factorVIII) * 0.02 * dt;
    pat.factorX    += (100 - pat.factorX)    * 0.02 * dt;
    pat.fibrinogen     += (3   - pat.fibrinogen)     * 0.01 * dt;
    pat.plateletCount  += (250 - pat.plateletCount)  * 0.01 * dt;

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

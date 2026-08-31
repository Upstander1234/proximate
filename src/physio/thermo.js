// Thermoregulation: core temperature balance (metabolic heat production vs environmental loss).
export function updateTemperature(pat, dt) {
    const weight = pat.ageProfile.weight;
    const bsa = pat.ageProfile.bsa;
    const basalMetW = 80 * Math.pow(weight / 70, 0.75);
    const q10 = Math.pow(2, (pat.coreTemp - 37) / 10);
    // METABOLIC RATE MULTIPLIER (endocrine batch, queue items 7/27) — a
    // general, reusable handle for any condition that genuinely changes basal
    // heat production rather than just ambient exposure. 1 = normal.
    // Thyroid storm's hypermetabolism (T3/T4 uncouple oxidative
    // phosphorylation, raising resting energy expenditure) and excited
    // delirium's sustained muscular hyperactivity both drive core temperature
    // UP through this same real route — heat genuinely being generated
    // faster than it can be shed — rather than an invented direct coreTemp
    // write. Myxedema coma (severe hypothyroidism) uses the same handle
    // below 1 for the opposite, well-documented direction (profound
    // hypothermia from a suppressed metabolic rate).
    const heatProd = basalMetW * q10 * (pat.metabolicHeatMultiplier ?? 1) * 60;
    // AMBIENT TEMPERATURE (queue item 26) — was a hardcoded 20 C, so no
    // condition or scenario could ever put a patient in a genuinely hot (or
    // cold) environment; the whole heat/cold ladder had no trigger to read.
    // Defaults to the old hardcoded value, so every existing patient is
    // completely unaffected.
    const env = pat.ambientTemp ?? 20;
    const radConvCoeff = 6;
    const respHeatLoss = 0.1 * radConvCoeff * bsa * (pat.coreTemp - env);
    // BURN-IMPAIRED SKIN BARRIER (queue item 56). Burned skin has lost the
    // stratum corneum's insulating/evaporative barrier — a real, documented
    // cause of field hypothermia in major burns (increased convective/
    // radiative loss from denuded skin, plus increased evaporative water
    // loss from wound exudate; ABA guidelines list active warming as
    // first-line burn care for exactly this reason). No dedicated
    // "skin barrier function" field exists anywhere in this engine
    // (confirmed by grep before writing this), so pat.burnTbsaFraction
    // (patient.js, scenario-authored, 0 for every non-burn patient) IS that
    // handle, read directly here rather than duplicated into a second field
    // with a single consumer. Multiplier is a modest, honest 1.0 (no burn)
    // to 2.0 (100% TBSA) — doubling combined skin heat loss at the extreme
    // end, not an invented order-of-magnitude effect.
    const burnHeatLossMult = 1 + Math.max(0, Math.min(1, pat.burnTbsaFraction || 0));
    const skinHeatLoss = (1 - pat.alphaTone * 0.5) * radConvCoeff * bsa * (pat.coreTemp - env) * burnHeatLossMult;
    // DIRECT SOLAR RADIANT LOAD — standing in direct sun adds real heat on
    // top of ambient air temperature (a documented ~150-300 W for an adult in
    // direct sun, depending on angle/clothing/skin color); shade removes this
    // term specifically, while ambient air temperature (env, above) does not
    // change — a patient moved to shade on a 41 C day is still on a 41 C day,
    // just no longer taking direct radiant load on top of it. This is what
    // gives "move to shade" a genuine, bounded benefit rather than a cure.
    const solarGain = (pat.inShade ? 0 : (pat.solarRadiantW || 0)) * 60;
    // EVAPORATIVE (SWEAT) COOLING. Previously entirely absent from this
    // model — there was no way to distinguish a compensating, sweating
    // patient (heat exhaustion) from one whose thermoregulation has FAILED
    // (heat stroke's defining "hot, dry skin"), because sweating did not
    // exist as a mechanism at all. Sweat drive ramps with core temperature
    // (onset well below the febrile range, saturating by ~39 C, i.e. a
    // patient is sweating hard well before heat stroke territory); actual
    // cooling achieved is that drive scaled by pat.sweatCapacity (1 = fully
    // functional, driven toward 0 by conditions that model thermoregulatory
    // failure — see heatStroke in conditions.js). 700 W is the documented
    // ceiling for evaporative heat loss in a well-hydrated adult at maximal
    // sweat rate (~1 L/hr x ~2.4 kJ/g latent heat of vaporization / 3600 s).
    const sweatDrive = Math.max(0, Math.min(1, (pat.coreTemp - 37) / 2));
    const evapLoss = sweatDrive * Math.max(0, Math.min(1, pat.sweatCapacity ?? 1)) * 700 * 60;
    const heatLoss = (skinHeatLoss + respHeatLoss) * 60 + evapLoss;
    const bodyHeatCap = weight * 3470;
    // ACTIVE EXTERNAL WARMING. Added as POWER into the same heat balance every
    // other thermal term uses, so what it achieves depends on the patient: a
    // hypothermic patient rewarms at roughly the documented 1 C/hr, while a
    // normothermic one barely moves because his own heat loss rises with core
    // temperature. The former fx:{temp:2.2} added 2.2 C to anybody.
    const externalHeat = (pat.externalWarmingW || 0) * 60;   // W -> J/min
    // ACTIVE COOLING (ice packs, cold-water immersion) — the same idiom as
    // externalHeat above, in reverse.
    const externalCooling = (pat.externalCoolingW || 0) * 60;
    const dT = (heatProd + externalHeat + solarGain - heatLoss - externalCooling) * dt / bodyHeatCap;
    // SHIVERING THERMOGENESIS — only works in mild hypothermia. Real shivering
    // is a voluntary-muscle heat-generation reflex that requires glycogen
    // reserves and CNS drive; both fail as core temperature falls further, so
    // shivering itself stops (not just becomes less effective) somewhere in
    // the moderate-hypothermia range (~32 C is the commonly cited cutoff,
    // Wilderness Medical Society staging: mild 32-35 C shivering present,
    // moderate/severe <32 C shivering absent). Previously this compensation
    // fired at ANY coreTemp<36.5 with no floor, which meant a patient could
    // "shiver" their way through severe hypothermia — physiologically wrong,
    // and it silently worked against any condition (accidentalHypothermia)
    // trying to model a genuine, un-shivering severe presentation.
    if (pat.coreTemp < 36.5 && pat.coreTemp >= 32 && pat.ageProfile.age > 0.5) {
      pat.coreTemp += basalMetW * 2.5 * 60 * dt / bodyHeatCap;
    }
    pat.coreTemp = Math.max(25, Math.min(42, pat.coreTemp + dT));
}

// mortality.js — how death actually gets decided.
//
// The old version checked a handful of instantaneous values ("K > 7.5?"
// "SpO2 < 65?") at whatever single moment the game happened to ask. That
// meant a patient could spike lethal and then, one tick later, look
// survivable again purely because the spike passed — no sense in which the
// damage was irreversible.
//
// This version instead tracks, for each lethal mechanism, how long the
// patient has CONTINUOUSLY met that mechanism's criteria (`pat.lethalTimers`,
// minutes). Once a mechanism's sustained duration crosses its threshold,
// `pat.deathCause` is set and — deliberately — never cleared again, even if
// the numbers recover afterward. That's the actual clinical claim being
// modeled: some derangements, held long enough, cause damage that outlasts
// the derangement itself. Falling short of the threshold costs nothing —
// the timer for that mechanism simply resets the moment the criteria stop
// being met, so a brief excursion you catch in time never counts against
// you.
//
// Two mechanisms (multi-organ failure, brain death) key off the engine's
// own organ-injury accrual (pat.kidneyInjury / liverInjury / brainInjury,
// see neuro.js) rather than reinventing a proxy — those numbers already
// represent sustained hypoperfusion/hypoxia over time, so leaning on them
// directly is both more accurate and keeps this file from duplicating logic
// that already lives in the organ modules.
//
// Thresholds are real clinical reference points, not arbitrary:
//   K+ >= 11 mEq/L        — immediately incompatible with life (ventricular
//                            standstill territory)
//   K+ >= 8.5 mEq/L        — severe hyperkalaemia; lethal arrhythmia risk if
//                            sustained without correction
//   pH < 6.8               — widely cited as the lower limit compatible with
//                            life
//   MAP < 40 + lactate > 8  — decompensated shock; held long enough it
//                            becomes irreversible
//   blood < 40% + coag < 40%— ongoing uncontrolled hemorrhage with failed
//                            clotting
//   CPP < 20 in coma        — essentially no effective cerebral perfusion
//   pulseless rhythm         — VF / asystole / PEA (no cardiac output) with
//                            no ROSC
// Calcium (chloride/gluconate) doesn't lower serum potassium — it raises the
// myocardium's tolerance for it by widening the gap between resting and
// threshold membrane potential. Modeled here as an effective-K adjustment
// rather than baking a scenario-specific drug flag into this file: any
// condition that drives real hyperkalaemia benefits automatically once
// calcium is given, without this file needing to know why.
const effectiveK = (pat) => (pat.k ?? 4) - Math.max(0, (pat.ca ?? 2.4) - 2.4) * 4;

const MECHANISMS = [
  {
    key: "hyperkalemiaExtreme",
    cause: "hyperkalaemic arrest",
    minutes: 0.25, // near-instant; this level is essentially unsurvivable
    test: (pat) => effectiveK(pat) >= 11,
    story: (pat) => `Potassium ${(pat.k ?? 0).toFixed(1)} mEq/L — ventricular standstill territory. No drug reaches that fast.`,
  },
  {
    key: "hyperkalemiaSevere",
    cause: "hyperkalaemic arrest",
    minutes: 3,
    test: (pat) => effectiveK(pat) >= 8.5,
    story: () => `Potassium held at or above 8.5 mEq/L (myocardium unprotected) for several minutes uncorrected — the heart gave out.`,
  },
  {
    key: "acidosis",
    cause: "severe acidosis",
    minutes: 2,
    test: (pat) => (pat.ph ?? 7.4) < 6.8,
    story: (pat) => `pH ${(pat.ph ?? 0).toFixed(2)}, sustained — below the range any enzyme system tolerates.`,
  },
  {
    // IRREVERSIBLE arrest — note this is NOT "has been pulseless for N minutes".
    //
    // It used to be exactly that: a 4-minute timer on a pulseless rhythm, which
    // conflated REVERSIBLE arrest with death and permanently marked a patient
    // dead even if they later achieved ROSC. A clock is also the one thing the
    // design brief rules out: irreversibility must emerge from accumulated
    // injury.
    //
    // What actually makes an arrest unrecoverable is that the myocardium runs
    // out of the high-energy phosphate needed to contract at all. pat.atp is a
    // live metabolic substrate (see the basal-demand term in cardiovascular.js):
    // during arrest coronary supply falls with perfusion pressure while basal
    // metabolism continues, so the reserve drains. Below ~0.2 there is not
    // enough ATP for meaningful cross-bridge cycling or for the SERCA/Na-K
    // pumps that permit relaxation — the substrate of ischemic contracture, the
    // "stone heart", and the reason a long down-time arrest cannot be restarted
    // no matter what is given. Requiring the heart to be pulseless AND
    // energetically exhausted means a patient with a shockable rhythm and an
    // intact reserve is never written off, while one whose myocardium has
    // actually run down is.
    key: "cardiacArrest",
    cause: "irreversible cardiac arrest",
    minutes: 0.5, // brief hold to reject transients, not a survival clock
    test: (pat) => (["VF", "asystole", "PEA"].includes(pat.rhythm) || pat.co < 0.1)
      && (pat.atp ?? 1) < 0.2,
    story: (pat) => `No cardiac output, with myocardial energy reserve exhausted (ATP ${(pat.atp ?? 0).toFixed(2)}) — the muscle no longer has the substrate to contract.`,
  },
  {
    key: "exsanguination",
    cause: "exsanguination",
    minutes: 2,
    test: (pat) => pat.totalBloodVol < pat.ageProfile.bloodVolumeL() * 0.4 && pat.coagPct < 40,
    story: (pat) => `Blood volume ${pat.totalBloodVol.toFixed(1)} L with clotting failing (${Math.round(pat.coagPct)}%) — bled out faster than it could be replaced.`,
  },
  {
    key: "irreversibleShock",
    cause: "irreversible shock",
    minutes: 5,
    test: (pat) => pat.map < 40 && pat.lactate > 8,
    story: (pat) => `MAP under 40 with a lactate of ${pat.lactate.toFixed(1)}, sustained — shock passed the point of reversal.`,
  },
  {
    key: "multiOrganFailure",
    cause: "multi-organ failure",
    minutes: 3,
    test: (pat) => ((pat.kidneyInjury + pat.liverInjury + pat.brainInjury) / 3) >= 0.6,
    story: () => "Sustained hypoperfusion accrued damage across the kidneys, liver, and brain faster than any of them could recover.",
  },
  {
    // Brain death must EMERGE from accumulated ischaemic injury, not from a
    // clock on perfusion. This previously tested "comatose with CPP < 20 for 5
    // minutes", which is exactly the simplistic time-unconscious model the
    // design brief rules out — and once brainInjury became a graded accumulator
    // (neuro.js) the two disagreed openly: it declared brain death at 5.5 min of
    // asystole while cumulative injury was only 0.25, i.e. the patient was
    // classified brain-dead and neurologically "mild" at the same instant.
    //
    // Now it requires the accrued injury itself, with the perfusion state as a
    // corroborating condition rather than the driver. 0.6 is the engine's own
    // scale, not a clinical measurement: 0.5 is already where updateCerebral
    // forces unconsciousness, and multiOrganFailure above uses 0.6 on the same
    // injury axis, so this stays consistent with both. Because brainInjury
    // integrates the DEPTH and DURATION of the oxygen deficit and is modified by
    // temperature, a cold arrest now takes longer to reach brain death than a
    // warm one — which is the clinically important behaviour a CPP timer could
    // not express at all.
    key: "brainDeath",
    cause: "brain death",
    minutes: 0.5, // brief hold to reject transients; the duration is in the injury
    test: (pat) => (pat.brainInjury ?? 0) >= 0.6 && pat.consciousness === "coma" && pat.cpp < 20,
    story: (pat) => `Cumulative hypoxic-ischaemic injury reached ${Math.round((pat.brainInjury ?? 0) * 100)}% with no effective cerebral perfusion — the damage outlasts the insult.`,
  },
];

// Which mechanisms end cerebral function specifically, as opposed to
// circulatory function. Kept as data so the classifier below does not have to
// re-derive brain death from raw numbers that neuro.js already owns.
const NEURO_MECHANISMS = new Set(["brainDeath"]);

export function updateMortality(pat, dt) {
  if (!pat.lethalTimers) pat.lethalTimers = {};
  for (const m of MECHANISMS) {
    const was = pat.lethalTimers[m.key] || 0;
    const now = m.test(pat) ? was + dt : 0;
    pat.lethalTimers[m.key] = now;
    // Sticky: once a mechanism crosses its threshold, the verdict is locked
    // in — later improvement doesn't undo it, matching real irreversibility.
    if (!pat.deathCause && now >= m.minutes) {
      pat.deathCause = m.cause;
      pat.deathStory = m.story(pat);
      pat.deathTimeMin = pat.elapsedMin ?? 0;
      pat.deathMechanism = m.key;
      if (NEURO_MECHANISMS.has(m.key)) pat.brainDeath = true;
    }
  }

  // ------------------------------------------------------------------
  // CLASSIFICATION. This module OBSERVES the trajectories the physiology
  // modules produce; it never drives them. Nothing outside this file gates on
  // the result, and nothing should: organ systems keep evolving because
  // perfusion, oxygen delivery, ATP, temperature and cellular integrity are
  // changing, not because a patient is flagged alive or dead.
  //
  // Four states, because "alive vs dead" cannot express the two clinically
  // decisive distinctions: an arrest that is still reversible, and a patient
  // whose circulation persists after cerebral function has ended.
  //
  //   alive     — perfusing.
  //   arrest    — no effective circulation RIGHT NOW. Explicitly NOT sticky:
  //               this is the state ROSC exits, and a patient in arrest has
  //               not been written off.
  //   brainDead — cerebral function ended while circulation continues. A real
  //               physiological endpoint, not a UI state, and the reason the
  //               engine must keep running: this patient still has a heartbeat,
  //               metabolism and organ trajectories worth modelling.
  //   dead      — irreversible. Sticky, because that is what irreversible
  //               means.
  // ------------------------------------------------------------------
  const pulseless = ["VF", "asystole", "PEA"].includes(pat.rhythm) || (pat.co ?? 1) < 0.1;

  // Elapsed-time bookkeeping for the end-of-call report. Accumulated here
  // rather than read from the scenario clock so the record survives whatever
  // drives the tick (game loop, validation harness, sweep).
  pat.elapsedMin = (pat.elapsedMin ?? 0) + dt;
  if (pulseless && pat.arrestStartMin == null) pat.arrestStartMin = pat.elapsedMin;
  // ROSC: was pulseless on the previous tick, is perfusing now. Recorded as a
  // fact about the trajectory — it stays true even if the patient re-arrests,
  // because "did circulation ever come back" is what the debrief asks.
  if (pat.arrested && !pulseless) {
    pat.roscOccurred = true;
    pat.roscTimeMin = pat.elapsedMin;
  }
  pat.arrested = pulseless;

  // NEUROLOGICAL OUTCOME BANDS. The clinically decisive question after an
  // arrest is not alive-vs-dead but what neurological state the survivor is in,
  // so this is graded alongside the circulatory classification rather than
  // folded into it. Emergent from the cumulative ischaemic injury neuro.js
  // accrues — no separate timer, no second injury model.
  //
  // Boundaries reuse the engine's OWN calibrated numbers rather than inventing
  // a scale: 0.5 is already the brainInjury at which updateCerebral forces the
  // patient unconscious, so it is the natural floor for "severe". Below 0.2 the
  // recovery term in updateOrganInjury can still clear the deficit with
  // restored perfusion, which is what "intact" means here.
  const bi = pat.brainInjury ?? 0;
  pat.neuroOutcome = pat.brainDeath || bi >= 0.6 ? "brainDead"
    : bi >= 0.5 ? "severe"
    : bi >= 0.2 ? "mild"
    : "intact";

  // TROPONIN — RESOLVED, physiology queue item 18. Deferred twice before
  // (first in takotsubo, as write-only) for lack of a real underlying
  // quantity to read: the acs condition's ischemia-gated necrosis now
  // produces a genuine accumulating integral (contractilityFactor loss), so
  // this is finally a non-decorative reading rather than an invented number.
  // A pure OBSERVER, like neuroOutcome above — never gates anything, never
  // drives physiology, consumed by outcomeReport() (physiology.js) as a
  // debrief/confirmatory value, not a live prehospital monitor reading: real
  // troponin assays take too long to turn around for field use, which is why
  // this is exposed at end-of-call rather than through vitals().
  //
  // No invented ng/mL scale — this engine has no literature anchor for
  // "necrosis fraction to troponin concentration" and manufacturing one would
  // be exactly the decorative-precision this project's rules warn against.
  // Graded instead against boundaries the condition library ALREADY
  // established and calibrated, not new numbers: nstemi's own contractility
  // floor is 0.65 (a bounded subendocardial infarct, "LIMITABLE by
  // treatment"), ami/STEMI's is 0.4 (transmural, "a far larger infarct") —
  // see conditions.js. Necrosis fraction is 1-contractilityFactor.
  const necrosisFraction = 1 - (pat.contractilityFactor ?? 1);
  pat.troponin = necrosisFraction <= 0.02 ? "negative"
    : necrosisFraction <= 0.35 ? "positive (subendocardial)"
    : "positive (transmural)";
  if (pat.deathCause && !pat.brainDeath) {
    pat.clinicalState = "dead";
  } else if (pat.brainDeath) {
    // Cerebral function is gone. Whether that reads as brain death or as death
    // depends on whether anything is still perfusing.
    pat.clinicalState = pulseless ? "dead" : "brainDead";
  } else if (pulseless) {
    pat.clinicalState = "arrest";
  } else {
    pat.clinicalState = "alive";
  }
}

// Which lethal mechanisms have a field-available intervention that acts on the
// mechanism itself. This is deliberately NOT a claim that treatment would have
// saved a given patient — answering that honestly would require re-running the
// scenario counterfactually, which nothing here does. It states only whether the
// thing that killed them was of a kind that responds to treatment, so the
// debrief can distinguish "nothing on the truck would have touched this" from
// "there was a lever here", and leave the judgement to the reviewer.
export const MECHANISM_TREATABILITY = {
  hyperkalemiaExtreme: { treatable: true, lever: "calcium to stabilise the myocardium, then insulin/dextrose or salbutamol to shift K+" },
  hyperkalemiaSevere: { treatable: true, lever: "calcium, insulin/dextrose, salbutamol" },
  acidosis: { treatable: true, lever: "ventilation and perfusion; bicarbonate only as an adjunct" },
  cardiacArrest: { treatable: true, lever: "early high-quality CPR and defibrillation, before the myocardial energy reserve is spent" },
  exsanguination: { treatable: true, lever: "haemorrhage control and blood products" },
  irreversibleShock: { treatable: true, lever: "volume, vasoactive support, and treating the cause before the shock state fixes" },
  multiOrganFailure: { treatable: false, lever: "accrued organ damage; no field intervention reverses it once established" },
  brainDeath: { treatable: false, lever: "cerebral perfusion had already failed; nothing reverses established brain death" },
};

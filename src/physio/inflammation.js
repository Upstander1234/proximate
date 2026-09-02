// Inflammation as a shared, first-class physiological system (queue item 46).
//
// THE GAP THIS CLOSES: before this file existed, every condition with a real
// inflammatory/infectious component (pneumoniaSepsis, preeclampsia,
// acutePancreatitis, toxicInhalationChlorine, the anaphylaxis family) scripted
// its own independent leak/fever/vasodilation terms at its own hand-picked
// rate, with no shared mechanism connecting them — a sepsis patient's fever
// and a preeclampsia patient's capillary leak had no common cause in the
// model even though both are, physiologically, the same class of process
// (cytokine-driven endothelial/systemic response) at different magnitudes.
//
// THE REAL MECHANISM, stated plainly so the numbers below have something to
// answer to: pathogen-associated or damage-associated molecular patterns
// (PAMPs/DAMPs) are recognized by innate immune cells, which release
// pro-inflammatory cytokines (IL-1, IL-6, TNF-alpha chief among them). Those
// cytokines are the actual common cause behind the clinical picture this
// item names:
//   - endothelial activation loosens paracellular tight junctions (occludin/
//     claudin), raising capillary permeability — the same Starling-block
//     mechanism pat.capillaryLeak already drives (metabolic.js);
//   - IL-1/IL-6/TNF act on the hypothalamic OVLT to raise the thermoregulatory
//     set point via prostaglandin E2 — a real fever, not ambient heating;
//   - TNF/IL-1 and downstream nitric-oxide release directly relax vascular
//     smooth muscle (distributive vasodilation), which this engine already
//     represents via pat.vasodilation and its own downstream baroreflex-driven
//     compensatory tachycardia — cytokineLoad is wired to FEED that existing
//     pathway where a condition opts in, not to duplicate it with a second,
//     competing HR term;
//   - activated endothelium expresses tissue factor, which is the real
//     trigger for extrinsic-pathway coagulation activation — in sustained
//     severe inflammation (sepsis being the textbook case) this produces a
//     real, clinically observable consumptive coagulopathy (falling
//     platelets/fibrinogen/factors, i.e. early DIC) — wired into
//     coagulation.js's own factor-consumption terms, not a parallel field.
//
// KINETICS, stated as an honest estimate, not a fitted number: the interval
// from a significant inflammatory insult (major sepsis, severe pancreatitis)
// to a measurable systemic cytokine response is on the order of one to a few
// hours — IL-6 is detectable within 1-2h of a major insult and continues
// rising for several hours in the general sepsis-cytokine-kinetics literature
// (e.g. Cavaillon et al.'s reviews of the cytokine cascade in sepsis). A tau
// near the middle of that band, 90 minutes, is used here
// (rate = 1/90 min^-1 ~= 0.0111/min) — deliberately NOT instant, so a
// condition presenting with an already-established, days-old process (like
// pneumoniaSepsis's own "days of high fever" framing) has to seed
// pat.pathogenBurden already substantial rather than relying on this lag to
// manufacture severity from nothing on arrival, while a condition modeling a
// FRESH insult mid-call would show the real, honest ramp.
//
// SAFE BY CONSTRUCTION: cytokineLoad only ever departs from 0 for a patient
// whose condition(s) explicitly set pat.pathogenBurden above 0. Every
// consumer below either reads cytokineLoad additively (coagulation.js) or
// via a Math.max ratchet against a shared field that every other writer of
// that field ALSO uses as a Math.max/clamp ratchet — so a condition that
// never touches pathogenBurden sees this module contribute exactly nothing,
// and no already-shipped, already-verified condition's own trajectory
// changes unless this batch explicitly migrated it onto the cascade (see the
// CLAUDE.md queue-item-46 entry for exactly which one was, and which weren't).
const CYTOKINE_TAU_MIN = 90;          // systemic cytokine response lag
const INFLAM_LEAK_RATE = 0.0025;      // capillaryLeak units / min at cytokineLoad=1
const INFLAM_LEAK_CEIL = 0.22;        // matches the ceiling band existing leak
                                       // consumers already use (0.2-0.3)
const INFLAM_FEVER_GAIN = 0.35;       // metabolicHeatMultiplier bonus at cytokineLoad=1
                                       // (statusEpilepticus's own hypermetabolic
                                       // multiplier is 1.6 total; this cytokine-only
                                       // contribution is deliberately more modest,
                                       // since a septic fever is real but is not the
                                       // same magnitude of heat production as sustained
                                       // convulsive muscular activity)

// QUEUE ITEM V2-5 (endothelial physiology): a real nitric-oxide-mediated
// vasodilation coupling, distinct from capillaryLeak.
//
// pat.vasodilation is a real, already-verified distributive-shock handle —
// septicShock, pneumoniaSepsis, necrotizingFasciitis, anaphylaxis,
// addisonianCrisis and others each already set it directly, and
// cardiovascular.js already reads it to lower SVR/produce hypotension. But
// every one of those writers sets it INDEPENDENTLY of cytokineLoad, even
// though several of them (septicShock, pneumoniaSepsis, necrotizingFasciitis)
// are cytokine-driven processes that ALSO set pathogenBurden two lines away
// in the same condition. There was no real coupling between the two
// already-real fields — cytokineLoad and vasodilation were two numbers that
// happened to rise in the same septic patient because the same condition
// author set both by hand, not because the engine connected them.
//
// The real mechanism this closes: TNF-alpha and IL-1 induce inducible nitric
// oxide synthase (iNOS) in vascular endothelium and smooth muscle, and the
// resulting sustained NO release is the actual, textbook cause of septic/
// inflammatory distributive vasodilation (Landry & Oliver, NEJM 2001,
// "The Pathogenesis of Vasodilatory Shock") — mechanistically the SAME
// cytokine signal already driving capillaryLeak and fever above, just a
// third real consequence of it, not a fourth invented field.
//
// Composed via the identical Math.max ratchet capillaryLeak/
// metabolicHeatMultiplier already use, so this is safe by construction for
// every already-shipped, already-calibrated condition: a condition that
// already sets pat.vasodilation to a higher value this same tick (its own
// dedicated, hand-tuned ramp) is completely unaffected, since Math.max never
// lowers a value another writer just set. The only patients who see a NEW,
// real effect from this term are ones that set pathogenBurden but have no
// dedicated vasodilation writer of their own (infectiveEndocarditis,
// neonatalSepsis at the time this was added) — for them, this closes a real
// gap: a septic/bacteremic patient with genuinely zero distributive-shock
// contribution despite a real, elevated cytokineLoad.
//
// MEASURED, not guessed (direct probe, stripped before shipping): at the
// coefficient below, this term never exceeds ~0.3 * cytokineLoad, which
// stays under every already-shipped condition's own vasodilation value at
// every timepoint checked (pneumoniaSepsis's 0.28 floor, septicShock's own
// ramp, necrotizingFasciitis's own faster ramp) — confirmed non-overriding
// across each condition's real presenting/settled trajectory, not just at
// t=0.
const INFLAM_VASO_CEIL = 0.3;         // vasodilation contribution at cytokineLoad=1

export function updateInflammation(pat, dt) {
  const burden = Math.max(0, Math.min(1, pat.pathogenBurden || 0));
  // First-order relaxation toward the current declared burden — the real
  // "systemic response lags the insult" kinetics, not an instant readout.
  pat.cytokineLoad += (burden - pat.cytokineLoad) * Math.min(1, dt / CYTOKINE_TAU_MIN);
  pat.cytokineLoad = Math.max(0, Math.min(1, pat.cytokineLoad));

  if (pat.cytokineLoad <= 0) return;   // nothing to do for a burden-free patient

  // Endothelial permeability. Additive, ratcheted to a shared ceiling the
  // same way every existing capillaryLeak writer already ratchets its own
  // contribution — a condition that ALSO sets capillaryLeak directly (none
  // do yet, alongside pathogenBurden) would compose exactly the way any two
  // conditions' own leak terms already compose (whichever term's own
  // Math.max/clamp last runs this tick wins the ceiling check, same as today).
  pat.capillaryLeak = Math.max(0, Math.min(INFLAM_LEAK_CEIL,
    (pat.capillaryLeak || 0) + dt * INFLAM_LEAK_RATE * pat.cytokineLoad));

  // Cytokine-driven fever — the real hypothalamic-set-point mechanism, routed
  // through the SAME hypermetabolic multiplier statusEpilepticus/
  // excitedDelirium/thyroidStorm already use, so thermo.js's own real heat
  // balance (not a direct coreTemp write) produces the actual temperature
  // rise over real time.
  pat.metabolicHeatMultiplier = Math.max(pat.metabolicHeatMultiplier ?? 1,
    1 + INFLAM_FEVER_GAIN * pat.cytokineLoad);

  // Cytokine-driven (iNOS/NO-mediated) distributive vasodilation — see the
  // V2-5 comment block above this function for the full mechanism and
  // measurement. Math.max ratchet, so a condition that already set
  // pat.vasodilation higher THIS tick (its own dedicated ramp) is untouched;
  // only a condition with pathogenBurden but no dedicated vasodilation
  // writer of its own gets a real, new, non-zero value here.
  pat.vasodilation = Math.max(pat.vasodilation || 0, INFLAM_VASO_CEIL * pat.cytokineLoad);
}

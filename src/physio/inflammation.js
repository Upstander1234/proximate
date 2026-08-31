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
}

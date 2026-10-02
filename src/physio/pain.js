// ============================================================================
// Pain sensitization — peripheral/central plasticity and glial-driven
// disinhibition (allodynia). Queue item 62, first mechanism of the pain-
// physiology deepening workstream (CLAUDE.md section 6, items 62-66).
//
// Today's pain model (pat.intrinsicPain -> pat.drugPain -> v.pain, pk.js) is
// a MEMORYLESS scalar: the same stimulus produces the same pain regardless
// of how long it has been going on or whether it has been treated. Real
// nociception is not memoryless — sustained noxious input drives real
// tissue-level and dorsal-horn plasticity that (a) amplifies subsequent pain
// from the SAME noxious stimulus (peripheral sensitization / hyperalgesia)
// and (b) eventually makes ordinarily non-noxious stimuli (touch, movement,
// splinting) themselves painful (central-sensitization-driven allodynia),
// and that plasticity persists for a real, measurable time after the
// original driver resolves. This module adds that cascade as four relaxing
// states, each read by pk.js's per-tick pain reseed (see there for the
// consumer wiring) rather than writing pat.drugPain/pain directly — per
// this project's own standing rule, a mechanism must produce the state a
// clinical number is a MEASUREMENT of, not the number itself.
//
// Cascade topology: peripheralSensitization -> glialActivation -> {
//   centralSensitization (hyperalgesia: multiplicative gain on
//   intrinsicPain), allodyniaLevel (disinhibition: a genuinely new pain
//   source from otherwise-innocuous input) }. glialActivation feeds BOTH
// downstream states because the literature separates two real, distinct
// consequences of the same glial substrate — a multiplicative gain on
// noxious input, and a qualitatively new pain source from innocuous input —
// rather than one generic "central gain" collapsing them together.
// ============================================================================

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// First-order relaxation with INDEPENDENT build/decay time constants
// (minutes) — cardiovascular.js's own approach() (lvHypertrophy/
// vascularStiffness) uses one symmetric tau; every state below needs the
// asymmetry itself (rising far faster than it falls) as the actual,
// literature-anchored sensitization/plasticity behavior, not a modeling
// convenience.
function approachAsym(cur, target, dt, tauUpMin, tauDownMin) {
  const tau = target >= cur ? tauUpMin : tauDownMin;
  if (tau <= 0) return target;
  const a = 1 - Math.exp(-dt / tau);
  return cur + (target - cur) * a;
}

// --- Peripheral sensitization ---
// Carrageenan-model nociceptor hyperexcitability (reduced rheobase,
// depolarized resting membrane potential, increased inward Na+ current at
// the peripheral terminal) is measurable within ~2h of sustained
// inflammatory drive, peaks ~6h, and declines back toward baseline by ~24h
// as inflammatory mediators wane — the standard inflammatory-pain
// carrageenan time course. Driven by sustained noxious drive: this engine's
// own pat.intrinsicPain above a real engagement threshold (mild pain alone
// does not sensitize; sustained moderate-severe pain does), OR-composed
// with existing local injury markers (active hemorrhage, capillary leak,
// burn TBSA) so a patient can sensitize from real tissue injury even before
// intrinsicPain itself has been scripted high.
const PERIPH_BUILD_TAU_MIN = 120;    // 2h — meaningful rise
const PERIPH_DECAY_TAU_MIN = 360;    // 6h — ~full decay by ~24h (4 tau) once driver resolves
const PERIPH_PAIN_ENGAGE = 3;        // intrinsicPain (0-10) below this doesn't sensitize
const PERIPH_PAIN_SPREAD = 5;        // saturates by intrinsicPain ~8

// --- Glial activation ---
// A microglia-then-astrocyte sequence, not one lump: microglial activation
// markers appear within ~1 day, proliferate over 2-3 days, peak within the
// first week and subside over subsequent weeks; astrocyte reactivity is
// slower to engage but sustained, and is what actually maintains persistent
// pain (Ji, Berta & Nedergaard-class dorsal-horn glial-pain reviews). This
// module models one lumped state rather than two cell populations, so its
// OWN decay tau is deliberately biased toward the slower, sustained
// astrocyte-like end rather than the fast microglial transient — a future
// session splitting this into microglial/astrocyte sub-states should feed
// centralSensitization from the sustained (astrocyte) arm only. Gated on
// SUSTAINED (not merely nonzero) peripheral sensitization.
const GLIAL_BUILD_TAU_MIN = 2 * 24 * 60;   // 2 days
const GLIAL_DECAY_TAU_MIN = 7 * 24 * 60;   // 7 days — sustained, not transient
const GLIAL_PERIPH_ENGAGE = 0.3;

// --- Central sensitization ---
// Models the LATER, glial/NMDA-LTP-dependent, INPUT-INDEPENDENT persistent
// state specifically — deliberately distinguished from the earlier, purely
// input-dependent hours-scale spinal windup that isolated-cord evidence
// shows emerging ~6h and developing further by ~20h after a sustained
// afferent barrage (no input-independent plasticity is present at 3h). That
// earlier, faster component is NOT given its own separate state here; it is
// already folded into peripheralSensitization's own faster dynamics above.
// centralSensitization here is the state that SURVIVES once the acute
// driver is gone: real spinal LTP from high-frequency afferent input can
// produce allodynia persisting >35 days, but it remains reversible
// plasticity (NMDAR/alpha2delta-1 antagonism actively reverses it) — so
// this state's decay, while much slower than its build, MUST still return
// fully to 0 given enough time. NEVER a permanent latch. Tau reuses the
// same order of magnitude as cardiovascular.js's own lvHypertrophy/
// vascularStiffness slow-adaptation states (weeks scale) for the same
// "gradual, not a switch, but not permanent" reason. Gated on SUSTAINED
// glial activation.
const CENTRAL_BUILD_TAU_MIN = 4 * 24 * 60;   // 4 days — slower to build than glial itself
const CENTRAL_DECAY_TAU_MIN = 14 * 24 * 60;  // 14 days — reversible, never permanent
const CENTRAL_GLIAL_ENGAGE = 0.35;

// --- Allodynia (disinhibition) ---
// The mechanistic core of allodynia is LOSS OF INHIBITION, not a generic
// "central gain": microglial BDNF downregulates KCC2 (collapsing the
// chloride gradient GABA_A/glycine inhibition depends on), IL-1beta can
// potentiate glycinergic synapses onto inhibitory interneurons, and
// inflammatory central sensitization follows a sequential
// microglia-to-A1-astrocyte cascade dismantling feed-forward inhibitory
// control over days 3-7 (Ji et al.; Berta/Nedergaard dorsal-horn astrocyte
// reviews). Driven by glialActivation DIRECTLY, not by centralSensitization
// — the two are separate consequences of the same glial substrate: one a
// multiplicative gain on noxious input (hyperalgesia, above), one a
// genuinely new pain source from innocuous input (allodynia, here). Tracks
// glialActivation fairly directly (no long lag of its own beyond glia's
// own dynamics) since the KCC2/glycinergic disinhibition mechanism engages
// on the same cellular timescale as the glial state driving it.
const ALLODYNIA_GLIAL_ENGAGE = 0.25;
const ALLODYNIA_TAU_MIN = 24 * 60; // 1 day

export function updateSensitization(pat, dt) {
  const pain = pat.intrinsicPain || 0;
  const injuryDrive = clamp(
    (pat.activeBleedRate > 0 ? 0.5 : 0) +
    (pat.capillaryLeak || 0) * 2 +
    (pat.burnTbsaFraction || 0) * 1.5,
    0, 1);
  const painDrive = clamp((pain - PERIPH_PAIN_ENGAGE) / PERIPH_PAIN_SPREAD, 0, 1);
  const periphTarget = Math.max(painDrive, injuryDrive);
  pat.peripheralSensitization = approachAsym(
    pat.peripheralSensitization ?? 0, periphTarget, dt,
    PERIPH_BUILD_TAU_MIN, PERIPH_DECAY_TAU_MIN);

  const glialTarget = clamp(
    ((pat.peripheralSensitization || 0) - GLIAL_PERIPH_ENGAGE) / (1 - GLIAL_PERIPH_ENGAGE),
    0, 1);
  pat.glialActivation = approachAsym(
    pat.glialActivation ?? 0, glialTarget, dt,
    GLIAL_BUILD_TAU_MIN, GLIAL_DECAY_TAU_MIN);

  const centralTarget = clamp(
    ((pat.glialActivation || 0) - CENTRAL_GLIAL_ENGAGE) / (1 - CENTRAL_GLIAL_ENGAGE),
    0, 1);
  pat.centralSensitization = approachAsym(
    pat.centralSensitization ?? 0, centralTarget, dt,
    CENTRAL_BUILD_TAU_MIN, CENTRAL_DECAY_TAU_MIN);

  const allodyniaTarget = clamp(
    ((pat.glialActivation || 0) - ALLODYNIA_GLIAL_ENGAGE) / (1 - ALLODYNIA_GLIAL_ENGAGE),
    0, 1);
  pat.allodyniaLevel = approachAsym(
    pat.allodyniaLevel ?? 0, allodyniaTarget, dt,
    ALLODYNIA_TAU_MIN, ALLODYNIA_TAU_MIN);
}

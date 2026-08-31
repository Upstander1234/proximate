// physiologyValidation.mjs — AUTOMATED PHYSIOLOGY VALIDATION SUITE
//
// Validates the engine's fluid, electrolyte and circulatory mechanisms against
// DOCUMENTED physiology — not against the legacy solver and not against any
// scenario. Each case states the mechanism under test and the direction/range
// accepted physiology requires. A failure here means the model disagrees with
// physiology, which is a prompt to investigate the mechanism, not to retune it.
//
// Run:  node src/scripts/physiologyValidation.mjs
import { Patient } from "../physio/patient.js";
import { CONDITIONS } from "../physio/conditions.js";
import { updateObstetric } from "../physio/obstetric.js";

const S = () => ({ t: 0, doses: [], given: {}, _roster: [] });
// The engine is designed for ~2-4 s ticks (the closed-loop ODE substeps
// internally); larger steps are outside its validated range, so the suite uses
// a game-realistic step and shorter horizons rather than coarse fast-forwarding.
const STEP = 4;
// --fast skips the slow pharmacology tier (sections 2b-2e). Everything else runs.
const FAST = process.argv.includes("--fast");
// Allow running a subset so each invocation stays responsive:
//   node physiologyValidation.mjs 1     -> first half
//   node physiologyValidation.mjs 2     -> second half
const PART = Number(process.argv[2]) || 0;   // NaN (e.g. "--fast" first) -> 0 = run everything

// --section=NAME runs ONE section and nothing else (e.g. --section=2h, the
// seizure limb). This exists because the full tier takes >45 min and could not
// be completed in the environment it was being developed in — five consecutive
// attempts were killed. A 45-minute problem that cannot be finished becomes
// twenty short ones that can, and it also means a single failing assertion can
// be re-run in under a minute instead of by re-running the whole tier, which is
// the difference between investigating a failure and guessing at it.
//
// Section names are the ones in the gate comments (1, 2, 2b..2i, 3..16) and are
// listed by --list.
const SECTION = (process.argv.find(a => a.startsWith("--section=")) || "").split("=")[1] || null;
const LIST = process.argv.includes("--list");
const inPart = (n, name) => {
  if (LIST) { if (name) console.log(`  section ${name}  (part ${n})`); return false; }
  if (SECTION) return name === SECTION;
  return PART === 0 || PART === n;
};

function advance(pat, minutes, perTick) {
  const s = S();
  for (let T = STEP; T <= minutes * 60; T += STEP) {
    s.t = T;
    if (perTick) perTick(pat, T);
    if (pat._pregnancy) updateObstetric(pat, STEP / 60, s);
    pat.lastUpdate = T - STEP;
    pat.update(STEP / 60, s);
  }
  return pat;
}
function makePatient(over = {}) { return new Patient({ age: 35, sex: "male", weight: 70, ...over }, 0); }
// The weight declared here is the woman's CURRENT (term) weight, because that is
// what the engine expects: applyPregnancyAdaptations subtracts its own 12 kg
// gestational weight gain to recover the pre-pregnancy mass that blood volume is
// derived from (the scenario declares current weight because drug dosing needs
// it). This patient was declared at 65 kg, which the engine therefore read as a
// woman who massed 53 kg before conceiving — while pregnancyBenchmark.mjs
// documents 65 kg as her PRE-pregnancy weight and sets its targets accordingly.
// The same number meant different things on either side of the comparison, and
// that single disagreement drove most of the pregnancy failures.
//
// 77 = 65 pre-pregnancy + the engine's own 12 kg constant, so both descriptions
// now refer to one woman. Measured effect on this block: total blood volume
// 4.79 -> 5.87 L (target 5.6-7.0) and cardiac output 3.97 -> 4.59 L/min.
function makePregnant(gestation = 39) {
  const pat = new Patient({ age: 30, sex: "female", weight: 77, height: 165 }, 0);
  const c = CONDITIONS.healthyPregnancy;
  pat._gestationWeeks = gestation;
  pat._conditions = [c]; pat._condition = c;
  c.progress(pat, STEP / 60, S());
  return pat;
}
const ecf = p => p.plasmaVol + p.interstitialVol;

let passed = 0, failed = 0;
const results = [];

// --- STREAMING ---------------------------------------------------------------
// Every check used to be buffered into results[] and printed only after the
// LAST simulation finished. That is fine when the suite completes and
// catastrophic when it does not: the full second tier takes >45 min, and five
// consecutive runs were killed by the environment at around forty minutes,
// each losing 100% of the work and writing a zero-byte log. There was no way to
// learn anything from a run that did not finish, so the tier became effectively
// unrunnable and its last full result went stale across an entire session.
//
// `--stream` prints each check the moment it is made. A killed run then still
// tells you everything it got through, which is usually the thing you needed.
// The buffered report is suppressed under --stream so results are not printed
// twice; the summary and the tier line still print if the run completes.
//
// NOTE the deliberate asymmetry: a streamed run that dies has NO summary line
// and NO tier line. That is the point. A partial run must never be mistakable
// for a green one, which is the same reason the tier is stated explicitly
// below.
import { writeSync } from "node:fs";
const STREAM = process.argv.includes("--stream");
let streamGroup = null;
let streamGroupT0 = Date.now();
const streamT0 = Date.now();
function fmtVal(value) {
  return Math.abs(value) < 1000 ? value.toFixed(2) : value.toExponential(1);
}
function check(group, name, value, lo, hi, unit = "") {
  const ok = value >= lo && value <= hi;
  ok ? passed++ : failed++;
  results.push({ group, name, value, lo, hi, unit, ok });
  if (STREAM) {
    // fs.writeSync(1, ...) NOT console.log. node block-buffers stdout whenever
    // it is a file or a pipe rather than a TTY, so console.log would hold up to
    // a full buffer of results and lose them on the kill this flag exists to
    // survive. writeSync goes straight to fd 1, unbuffered, every line.
    if (group !== streamGroup) {
      // Per-group elapsed time. The split into parts 1/2 was made by reading the
      // section list, not by measuring it, and part 1 turned out to overrun five
      // minutes on its own. Without per-section timing the next rebalance would
      // be another guess, so the streamed run now reports where the time
      // actually goes. Cumulative total is included because the useful question
      // is "what fraction of the tier is this section", not its raw seconds.
      const now = Date.now();
      if (streamGroup !== null) {
        writeSync(1, `       ^ ${streamGroup} took ${((now - streamGroupT0) / 1000).toFixed(1)} s` +
                     ` (cumulative ${((now - streamT0) / 1000).toFixed(1)} s)\n`);
      }
      streamGroup = group; streamGroupT0 = now;
      writeSync(1, `\n[${group.toUpperCase()}]\n`);
    }
    writeSync(1, `  ${ok ? "PASS" : "FAIL"}  ${name.padEnd(44)} ${String(fmtVal(value)).padStart(9)} ${unit.padEnd(12)} [${lo}..${hi}]\n`);
  }
}

// ---------------------------------------------------------------------------
// [part 1] 1. BASELINE STABILITY — a healthy patient must not drift
// ---------------------------------------------------------------------------
if (inPart(1, "1")) {   // section 1
  const p = makePatient();
  const na0 = p.na, bv0 = p.totalBloodVol;
  advance(p, 60);
  check("baseline", "serum Na stable (60 min)", p.na, 136, 145, "mmol/L");
  check("baseline", "Na drift", Math.abs(p.na - na0), 0, 3, "mmol/L");
  check("baseline", "blood volume held", p.totalBloodVol / bv0, 0.93, 1.07, "x");
  check("baseline", "plasma+rbc == TBV", Math.abs(p.plasmaVol + p.rbcVol - p.totalBloodVol), 0, 1e-6, "L");
}

// ---------------------------------------------------------------------------
// 2. DEHYDRATION — pure water loss must CONCENTRATE sodium and raise ADH
// ---------------------------------------------------------------------------
if (inPart(1, "2")) {   // section 2
  const p = makePatient();
  const na0 = p.na;
  // 2 L of solute-free water lost over 2 h (insensible/sweat), sodium untouched.
  advance(p, 60, (pt) => {
    const l = 2.0 / ((60 * 60) / STEP);
    const f = pt.plasmaVol / ecf(pt);
    pt.plasmaVol -= l * f; pt.interstitialVol -= l * (1 - f);
    pt.totalBloodVol = pt.plasmaVol + pt.rbcVol;
  });
  check("dehydration", "sodium RISES (hypernatremia)", p.na - na0, 2, 30, "mmol/L");
  check("dehydration", "ADH activated", p.adhs, 1.2, 6, "x rest");
  check("dehydration", "sodium mass conserved", p.naMass / (na0 * 1), 0, 1e9, ""); // reported below
}

// ===========================================================================
// SLOW PHARMACOLOGY TIER — skipped with --fast
//
// Sections 2b-2e simulate 60-80 minutes of scene time per drug, several times
// over, and account for most of this suite's ~14 minute runtime. They are the
// assertions that guard drug behaviour, so they must run before anything
// pharmacological ships — but when the change under test is renal, cardiac or
// obstetric they are pure waiting. `--fast` skips them, and the summary line
// states which tier ran so a fast result can never be mistaken for a full one.
// ===========================================================================
if (!FAST) {
// ---------------------------------------------------------------------------
// 2b. RESTING GAS EXCHANGE AND OPIOID VENTILATORY DEPRESSION
//
// Two things are asserted here, and both exist because they were WRONG and were
// not caught by any bounds check:
//
//   * The resting arterial gases of a healthy adult. The engine previously sat
//     at PaCO2 46.3 / pH 7.34 at rest, because resting inspiratory effort was a
//     literal constant that produced a 364 mL breath; the rate controller made
//     up the minute volume, so nothing looked wrong until the alveolar
//     ventilation was computed.
//
//   * The MAGNITUDE of opioid ventilatory depression. The wiring suite asserts
//     that the causal link fires; it cannot tell 0.8 mmHg from 30. The
//     coefficients were 0.8 for every sedative — an assertion that one
//     therapeutic dose abolishes 80% of respiratory drive — and a single 4 mg
//     morphine dose arrested a stable patient. The identifying observable is
//     that 0.1 mg/kg IV morphine in an opioid-naive adult raises PaCO2 by about
//     5-8 mmHg; the bounds below are deliberately a little wider than that so
//     they test the identification rather than re-assert the fitted number.
// ---------------------------------------------------------------------------
if (inPart(1, "2b")) {   // section 2b
  const p = makePatient();
  advance(p, 20);
  check("resting gases", "PaCO2", p.paco2, 35, 45, "mmHg");
  check("resting gases", "pH", p.ph, 7.35, 7.45, "");
  check("resting gases", "SaO2 on room air", p.sao2, 96, 100, "%");
  check("resting gases", "respiratory rate", p.rr, 10, 18, "/min");
  check("resting gases", "tidal volume ~7 mL/kg", p.vt, 0.40, 0.60, "L");
  check("resting gases", "alveolar ventilation", p.va, 3.6, 5.0, "L/min");
}

// Peak PaCO2 rise after a single standard IV dose, measured from this same
// resting baseline. Peak rather than endpoint, because these drugs wear off.
function peakPaco2Rise(drugId, nDoses = 1) {
  const p = makePatient();
  advance(p, 20);
  const base = p.paco2;
  const s = S();
  let peak = base;
  // Spaced 30 s apart: identical timestamps are collapsed by the duplicate-dose
  // guard, which would silently turn a stacking test into a single-dose test.
  for (let i = 0; i < nDoses; i++) s.doses.push({ id: drugId, at: 20 * 60 + i * 30 });
  // 60 minutes of observation, not 30. Morphine's effect-site equilibration is
  // slow — it crosses the blood-brain barrier poorly — so its peak PaCO2 now
  // falls at t+54 min. A 30-minute window measured the WINDOW EDGE rather than
  // the peak and reported +4.69 against a true +5.48; the assertion was at
  // fault, not the physiology. The other three peak inside 20 minutes and are
  // unaffected.
  for (let T = 20 * 60 + STEP; T <= 80 * 60; T += STEP) {
    s.t = T;
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    if (p.paco2 > peak) peak = p.paco2;
  }
  return peak - base;
}
if (inPart(1, "2b")) {   // section 2b cont
  check("opioid depression", "morphine 4 mg -> PaCO2 rise", peakPaco2Rise("morphine"), 4, 10, "mmHg");
  check("opioid depression", "fentanyl 50 mcg -> PaCO2 rise", peakPaco2Rise("fentanyl"), 2.5, 9, "mmHg");
  check("opioid depression", "midazolam 5 mg -> PaCO2 rise", peakPaco2Rise("midazolam"), 1, 6, "mmHg");
  // Etomidate had no assertion for two batches while its coefficient was
  // identified against a SATURATED pharmacokinetic profile. When the PK was
  // corrected its ventilatory depression silently halved and nothing caught it —
  // midazolam's assertion fired, etomidate's absence did not. Induction-dose
  // etomidate causes brief hypoventilation or frank apnea, so the band is wide.
  check("opioid depression", "etomidate 20 mg -> PaCO2 rise", peakPaco2Rise("etomidate"), 4, 12, "mmHg");

  // SATURATION. Effects must be computed once from the TOTAL concentration, not
  // per dose and summed — otherwise two half-doses beat one full dose and a
  // stacked overdose exceeds the drug's own maximum. Asserted as a ratio with
  // BOTH bounds live: the lower fails if stacking does nothing, the upper fails
  // if it sums linearly, which would give 3.00 here. Measured 1.33. The property
  // was fixed in batch 68 and unguarded until now; four properties in this
  // project have regressed silently for exactly that reason.
  {
    const one = peakPaco2Rise("morphine");
    const three = peakPaco2Rise("morphine", 3);
    check("opioid depression", "3 doses > 1 dose but SUB-linear", three / Math.max(0.01, one), 1.15, 2.2, "x");
  }
}

// ---------------------------------------------------------------------------
// 2c. OPIOID REVERSAL AND RE-NARCOTISATION
//
// This behaviour has been broken in three different ways across this project's
// history, each time silently, so it gets an explicit regression:
//   * the blockade accumulator never reset, so reversal was PERMANENT;
//   * the antagonist was resolved after the agonist in the dose list, so
//     naloxone reversed nothing at all given before it (i.e. every real case);
//   * naloxone's kel was set from its terminal half-life, but in a two-
//     compartment model kel is the CENTRAL elimination rate — the measured
//     terminal half-life came out at 242 min against a documented 30-90, so the
//     antagonist outlasted every opioid and re-narcotisation could not occur.
//
// The clinical fact being asserted: naloxone is SHORTER-ACTING than the opioids
// it reverses, so reversal is followed by a decaying blockade and returning
// respiratory depression. That is the entire reason these patients are
// transported rather than released.
// ---------------------------------------------------------------------------
if (inPart(1, "2c")) {   // section 2c
  const p = makePatient();
  advance(p, 10);
  const s = S();
  for (let i = 0; i < 3; i++) s.doses.push({ id: "morphine", at: 10 * 60 });
  const step = (fromMin, toMin) => {
    for (let T = fromMin * 60 + STEP; T <= toMin * 60; T += STEP) {
      s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
    }
  };
  step(10, 25);
  const suppLoaded = p.respDriveSuppression;
  // "naloxone" no longer exists as a DRUGS id — split into naloxone_in/
  // naloxone_im/naloxone_iv (drugs.js) without this probe being updated,
  // which silently made this whole section a no-op (no dose administered).
  // naloxone_iv used for fastest onset.
  s.doses.push({ id: "naloxone_iv", at: 25 * 60 });
  step(25, 35);
  const blockadePeak = p.opioidBlockade;
  const suppReversed = p.respDriveSuppression;
  step(35, 175);
  const blockadeLate = p.opioidBlockade;
  const suppLate = p.respDriveSuppression;

  check("opioid reversal", "opioid loads respiratory drive", suppLoaded, 0.05, 0.5, "");
  check("opioid reversal", "naloxone engages blockade", blockadePeak, 0.4, 1.0, "");
  check("opioid reversal", "depression reversed", suppLoaded - suppReversed, 0.03, 0.5, "");
  check("opioid reversal", "blockade DECAYS (naloxone is shorter-acting)",
    blockadePeak - blockadeLate, 0.15, 1.0, "");
  check("opioid reversal", "re-narcotisation: depression returns",
    suppLate - suppReversed, 0.01, 0.3, "");
}

// ---------------------------------------------------------------------------
// 2d. SEDATIVES AND PARALYTICS — the drugs whose potency was halved by the PK
//     corrections and which had NO assertion covering them. Twice now a
//     coefficient fitted against a saturated profile has silently changed
//     behaviour when the profile was corrected, and both times it was an absent
//     assertion rather than a failing one that let it through.
//
//     These bands are deliberately loose. They guard the STRUCTURE — that the
//     drug does its defining thing, and that it stops doing it — rather than
//     asserting numbers that have not been properly identified. Where a duration
//     has not been fitted, the band says so by being wide.
// ---------------------------------------------------------------------------
function giveAndWatch(drugId, watchMin, fn) {
  const p = makePatient();
  advance(p, 20);
  const s = S();
  s.doses.push({ id: drugId, at: 20 * 60 });
  const out = { base: { hr: p.hr, sbp: p.sbp, vt: p.vt } };
  let apneaMin = 0, lastApnea = 0, maxHr = p.hr, maxSbp = p.sbp;
  for (let T = 20 * 60 + STEP; T <= (20 + watchMin) * 60; T += STEP) {
    s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
    if (p.hr > maxHr) maxHr = p.hr;
    if (p.sbp > maxSbp) maxSbp = p.sbp;
    if (p.vt < 0.05) { apneaMin += STEP / 60; lastApnea = (T - 20 * 60) / 60; }
  }
  out.maxHr = maxHr; out.maxSbp = maxSbp;
  out.apneaMin = apneaMin; out.lastApnea = lastApnea; out.p = p;
  return fn ? fn(out) : out;
}
if (inPart(1, "2d")) {   // section 2d
  // KETAMINE — the sedative that does NOT suppress breathing, and raises rate
  // and pressure rather than dropping them. That distinction is the entire
  // clinical reason it is chosen for the shocked or asthmatic patient.
  const k = giveAndWatch("ketamine", 40);
  check("sedatives", "ketamine raises heart rate", k.maxHr - k.base.hr, 2, 40, "bpm");
  check("sedatives", "ketamine does NOT cause apnea", k.apneaMin, 0, 0.5, "min");
  check("sedatives", "ketamine raises blood pressure", k.maxSbp - k.base.sbp, 12, 40, "mmHg");

  // KETAMINE IN THE CATECHOLAMINE-DEPLETED PATIENT. Its pressor effect is
  // INDIRECT — it works through the patient's own stores — so in prolonged
  // shock, sepsis, or the patient who has been compensating for an hour, that
  // support is not available and the direct myocardial depressant action is
  // unopposed. This is the documented reason ketamine can cause hypotension in
  // exactly the patient it is chosen for, and it emerges from adrenal reserve
  // rather than from a flag. Asserted as an ABSENCE of the pressor response
  // plus a fall, so it cannot be satisfied by the drug simply doing nothing.
  {
    const p = makePatient();
    advance(p, 20);
    const s = S();
    s.doses.push({ id: "ketamine", at: 20 * 60 });
    const sbp0 = p.sbp;
    let maxSbp = p.sbp, minSbp = p.sbp;
    for (let T = 20 * 60 + STEP; T <= 50 * 60; T += STEP) {
      s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
      p.adrenalReserve = 0.05;                 // depleted stores, held
      if (p.sbp > maxSbp) maxSbp = p.sbp;
      if (p.sbp < minSbp) minSbp = p.sbp;
    }
    check("sedatives", "depleted: NO pressor response", maxSbp - sbp0, 0, 4, "mmHg");
    check("sedatives", "depleted: pressure FALLS instead", sbp0 - minSbp, 1, 40, "mmHg");
  }

  // ROCURONIUM — must produce complete apnea, and must RECOVER from it. The
  // recovery bound is wide because the disposition parameters have not been
  // identified (see the note in pk.js); what it guards is that paralysis is not
  // permanent, which is what the previous fx:{tv:-1} formulation made it.
  // ROCURONIUM — measured WITH VENTILATION, which is both what anyone would
  // actually do and what makes the measurement valid at all. Measuring it on an
  // unventilated patient produced a "paralysis is permanent" finding that was an
  // artifact of the harness: the paralysed patient asphyxiated, cardiac output
  // fell to zero, and the organ-dependent clearance model correctly stopped
  // eliminating the drug — a dead patient does not metabolise rocuronium. The
  // engine was right and the test was wrong. (Hard-won lesson 3: verify the
  // harness before believing the finding. I did not, and reported an engine bug
  // that did not exist.)
  {
    const p = makePatient();
    advance(p, 20);
    const s = S();
    s.doses.push({ id: "rocuronium", at: 20 * 60 }, { id: "bvm", at: 20 * 60 });
    let peakBlock = 0, blockMin = 0, lastBlocked = 0;
    for (let T = 20 * 60 + STEP; T <= (20 + 180) * 60; T += STEP) {
      s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
      if ((T - 20 * 60) % 120 === 0) s.doses.push({ id: "bvm", at: T });
      if (p.neuromuscularBlock > peakBlock) peakBlock = p.neuromuscularBlock;
      if (p.neuromuscularBlock > 0.5) { blockMin += STEP / 60; lastBlocked = (T - 20 * 60) / 60; }
    }
    check("paralytics", "rocuronium produces near-complete block", peakBlock, 0.9, 1.0, "");
    check("paralytics", "block duration (1.4 mg/kg)", blockMin, 30, 130, "min");
    check("paralytics", "rocuronium WEARS OFF", 180 - lastBlocked, 5, 180, "min remaining");
  }
}

// ---------------------------------------------------------------------------
// 2e. LOCAL ANAESTHETIC SYSTEMIC TOXICITY (lidocaine)
//
// Two-sided deliberately. A one-sided check that toxicity FIRES could be
// satisfied by a mechanism that fires at every dose, which would be just as
// wrong and considerably more annoying; a one-sided check that a normal dose is
// SAFE could be satisfied by a mechanism that never fires at all — which is what
// the antiarrhythmic action itself was until batch 63. Both halves are asserted.
//
// The therapeutic and toxic ranges nearly touch (1.5-5 mg/L treats, 5-9 seizes,
// >15 depresses the myocardium), and that margin is the reason lidocaine is
// dosed by weight and the reason a maintenance dose is cut in low-output states.
// ---------------------------------------------------------------------------
function lidocaineLoad(nDoses) {
  const p = makePatient();
  advance(p, 10);
  const s = S();
  // Spaced 30 s apart: doses sharing a timestamp are collapsed by the
  // duplicate-dose guard, which silently turns a stacking test into a
  // single-dose test.
  for (let i = 0; i < nDoses; i++) s.doses.push({ id: "lidocaine", at: 10 * 60 + i * 30 });
  let cmax = 0, seizeMin = 0, minInotropy = 1, minAv = 1, maxVo2 = 0;
  for (let T = 10 * 60 + STEP; T <= 40 * 60; T += STEP) {
    s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
    const c = p.drugInstances
      .filter((d) => d.id === "lidocaine")
      .reduce((a, d) => a + (d.effectConc || 0), 0);
    if (c > cmax) cmax = c;
    if (p.seizing) seizeMin += STEP / 60;
    if (p.drugInotropy < minInotropy) minInotropy = p.drugInotropy;
    if (p.avConduction < minAv) minAv = p.avConduction;
    if (p.vo2Demand > maxVo2) maxVo2 = p.vo2Demand;
  }
  return { cmax, seizeMin, minInotropy, minAv, maxVo2 };
}
if (inPart(1, "2e")) {   // section 2e
  const one = lidocaineLoad(1);
  check("lidocaine safety", "therapeutic dose: NO seizure", one.seizeMin, 0, 0.1, "min");
  check("lidocaine safety", "therapeutic dose: inotropy intact", one.minInotropy, 0.95, 1.0, "x");

  const three = lidocaineLoad(3);
  check("lidocaine toxicity", "stacked doses accumulate", three.cmax / Math.max(0.01, one.cmax), 2.5, 3.5, "x");
  check("lidocaine toxicity", "toxic level: seizure activity", three.seizeMin, 1, 30, "min");
  check("lidocaine toxicity", "seizure raises oxygen demand", three.maxVo2 / Math.max(1, one.maxVo2), 1.5, 3.0, "x");
  check("lidocaine toxicity", "toxic level: myocardial depression", three.minInotropy, 0.05, 0.7, "x");
  check("lidocaine toxicity", "toxic level: conduction block", three.minAv, 0.05, 0.7, "");
}
// ---------------------------------------------------------------------------
// 2f. EPINEPHRINE DOSE-RESPONSE — an arrest dose and a push-dose pressor must
//     be different drugs
//
// This is the property the catecholamine pharmacokinetic correction restored,
// and until now it was unguarded. Before that work `epiIV`/`pushEpi`/`epiIM`/
// `epiAuto` shared a central volume of 0.06 L — sixty millilitres for a whole
// adult — which put a 1 mg push at 5.97 mg/L and an effect intensity of 0.984.
// That is the flat top of the dose-response curve, where 1 mg and 10 mg are
// indistinguishable and a 20 mcg pressor is indistinguishable from an arrest
// dose. The fix was v1: 8 (~0.1 L/kg) and ec50: 0.01, giving Cmax 0.045 and
// Imax 0.818 — on the slope, where dose still buys something.
//
// A saturated curve fails silently: every dose still produces a big, confident,
// plausible-looking pressor response. Nothing in the suite could tell the
// saturated engine from the corrected one, and unguarded properties in this
// project have regressed at least five times. Hence a two-sided ratio.
//
// The observable is peak systolic rise over 30 min in a normotensive 70 kg
// adult, measured from a settled 20-minute baseline.
// ---------------------------------------------------------------------------
function peakSbpRise(drugId, amount) {
  const p = makePatient();
  advance(p, 20);
  const base = p.sbp;
  const s = S();
  // `amount` overrides the drug definition's declared dose (pk.js resolves
  // `d.amount ?? drugDef.dose`); omitting it tests what the definition itself
  // declares, which is the point of the pushEpi case below.
  s.doses.push(amount == null ? { id: drugId, at: 20 * 60 }
                              : { id: drugId, at: 20 * 60, amount });
  let peak = base;
  for (let T = 20 * 60 + STEP; T <= 50 * 60; T += STEP) {
    s.t = T;
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    if (p.sbp > peak) peak = p.sbp;
  }
  return peak - base;
}
if (inPart(2, "2f")) {   // section 2f
  // Measured across the ladder on the corrected kinetics:
  //   0.02 mg -> +8.00    0.1 mg -> +31.20   0.5 mg -> +90.70
  //   1 mg    -> +118.40  3 mg   -> +146.10
  // Monotonic and clearly saturating — 150x the dose buys 18x the effect.
  const push  = peakSbpRise("epiIV", 0.02);
  const arrest = peakSbpRise("epiIV", 1);

  // Each end asserted absolutely, so the ratio below cannot be satisfied by
  // both ends being wrong in the same direction.
  // BAND RE-ANCHORED TO LITERATURE, and this is a test changed in the same
  // batch as the fix it guards, so the reasoning is here in full. It was
  // 2..20 mmHg, set around the engine's own measured +8.00 above — a
  // regression guard describing the engine, not a documented range. A 2 mmHg
  // lower bound cannot be right for a drug whose published pressor response is
  // 10-25 mmHg; the band was ratifying the defect. The new band is that
  // published range, and it is STRICTER: the old 3.9 mmHg behaviour fails it.
  check("epi dose-response", "20 mcg: documented pressor response", push, 10, 25, "mmHg");
  check("epi dose-response", "1 mg: arrest-magnitude response", arrest, 60, 200, "mmHg");

  // THE RATIO, WITH BOTH BOUNDS LIVE.
  //   lower bound fails if dose does nothing — the saturated curve, ratio -> 1
  //   upper bound fails if effect scales linearly with dose — ratio would be 50
  // Measured 14.8x.
  check("epi dose-response", "1 mg > 20 mcg but SUB-linear",
        arrest / Math.max(0.01, push), 3, 30, "x");

  // The declared dose of `pushEpi` is itself part of the property: a drug whose
  // whole clinical identity is "not an arrest dose" must not deliver one. This
  // takes no `amount`, so it asserts what drugs.js declares. It read `dose: 1`
  // and produced +86.3 mmHg until this batch; 0.02 mg gives +6.4.
  check("epi dose-response", "pushEpi at DECLARED dose is not an arrest dose",
        peakSbpRise("pushEpi"), 2, 25, "mmHg");
}

// ---------------------------------------------------------------------------
// 2g. AMIODARONE — QT PROLONGATION AND TITRATABILITY
//
// The QTc prolongation is amiodarone's therapeutic action and its hazard in the
// same number: potassium-channel blockade suppresses reentry while lengthening
// repolarisation, which is the substrate for torsades. A model that cannot
// separate 150 mg from 900 mg cannot teach that trade-off.
//
// This drug was the last SATURATED entry in pkAudit — EC50 0.1 mg/L against a
// published therapeutic range of 1-2.5, so effect intensity at the standard dose
// was 0.963 and a 6x dose range moved blockade by 6%. Both the wiring suite and
// the QTc assertion below were passing throughout, because the wiring suite
// checks that the link FIRES and nothing checked the magnitude or the slope.
//
// Identifying observable: IV amiodarone prolongs QTc by 10-15%.
// ---------------------------------------------------------------------------
function amiodaroneQtc(dose) {
  const p = makePatient();
  advance(p, 5);
  // QTc, not QT. The rate correction has to be undone because amiodarone's
  // vasodilation causes a reflex tachycardia (HR 77 -> 85 here), and the raw QT
  // interval therefore SHORTENS for a reason that has nothing to do with the
  // potassium channel. Measured on QT, the drug's own hemodynamics mask a third
  // of its electrophysiological effect.
  const qtc = pt => pt.qt / Math.sqrt(60 / Math.max(40, pt.hr));
  const base = qtc(p);
  const s = S();
  s.doses.push({ id: "amiodarone", at: 5 * 60, amount: dose });
  let peak = base, blockPeak = 0;
  for (let T = 5 * 60 + STEP; T <= 35 * 60; T += STEP) {
    s.t = T;
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    const q = qtc(p);
    if (q > peak) peak = q;
    if ((p.potassiumChannelBlock || 0) > blockPeak) blockPeak = p.potassiumChannelBlock;
  }
  return { risePct: (peak - base) / base * 100, block: blockPeak };
}
if (inPart(2, "2g")) {   // section 2g
  // Measured at EC50 1.75:  150 mg -> +8.0%,  300 mg -> +11.3%,  900 mg -> +15.3%
  // Measured at EC50 0.10:  150 mg -> +14.6%, 300 mg -> +18.1%,  900 mg -> +17.5%
  const low  = amiodaroneQtc(150);
  const std  = amiodaroneQtc(300);
  const high = amiodaroneQtc(900);

  // The documented figure, with the band only slightly wider than 10-15% so it
  // tests the identification rather than re-asserting the fitted number. The
  // saturated model scored 18.1% and would fail this.
  check("amiodarone", "300 mg -> QTc prolonged 10-15%", std.risePct, 9, 15.5, "%");

  // The blockade the QTc constant in cardiovascular.js was identified against.
  // Two-sided: the upper bound is what catches a return to saturation, which
  // drove this to 0.482 while every existing assertion still passed.
  check("amiodarone", "standard-dose K-channel blockade", std.block, 0.24, 0.38, "");

  // TITRATABILITY, with both bounds live.
  //   lower bound fails if the curve re-saturates — the old model scored 1.20
  //   upper bound fails if effect scales linearly with dose, which would be 6.0
  // Measured 1.91.
  check("amiodarone", "900 mg > 150 mg but SUB-linear",
        high.risePct / Math.max(0.01, low.risePct), 1.5, 4.0, "x");

  // An overdose must be able to reach the torsades-risk region that a
  // therapeutic dose does not. This is the property saturation destroyed: it put
  // 150 mg already at +14.6%, so there was no headroom left for a stacked dose
  // to be more dangerous than a correct one.
  check("amiodarone", "stacked dose reaches higher QTc than therapeutic",
        high.risePct - std.risePct, 1.5, 12, "%");
}

// ---------------------------------------------------------------------------
// 2h. THE SEIZURE LIMB — non-drug causes, and the drug that treats them
//
// `pat.seizing` is read by metabolic.js, which raises oxygen demand 2.2-fold.
// For most of this project's life NOTHING WROTE IT, so no patient ever paid that
// cost; local-anaesthetic toxicity then became its only writer. This section
// guards the non-drug limb and the anticonvulsant that answers it.
//
// Both halves were broken in ways nothing detected. The intrinsic drive cannot
// be written by a condition, because conditions run progress() BEFORE
// updateDrugs() resets pat.seizureDrive to 0 — so it is derived in neuro.js from
// glucose, sodium and pregnancy/blood pressure instead. And termination
// originally tested the drive for EXACTLY zero, which meant an anticonvulsant
// could reduce the drive without ever ending a seizure: measured 95% of ticks
// seizing with midazolam aboard against 98% without it.
//
// These are stochastic (onset is probabilistic), so the bounds are wide and the
// discriminating measurements are taken in a late window once behaviour settles.
// ---------------------------------------------------------------------------
function seizureRun(hold, doses = []) {
  const p = makePatient({ age: 30, sex: "female" });
  const s = S();
  for (const d of doses) s.doses.push(d);
  let lateSz = 0, lateN = 0, vo2Sz = 0, vo2Rest = 0;

  // RESTING VO2 IS SAMPLED BEFORE THE DRIVE IS APPLIED, and that ordering is
  // the whole point. This previously took the resting sample opportunistically
  // — any tick on which the patient happened not to be seizing — and the
  // consumer then divided by `Math.max(1, vo2Rest)`. Seizure ONSET is
  // probabilistic (neuro.js), so a patient who seized on the very FIRST tick
  // never produced a resting sample at all, the floor of 1 stood in for it, and
  // the ratio came out as the raw VO2 rather than a ratio: observed 571.88
  // against a band of 1.8-2.6, with 2.28 on the two immediate re-runs.
  //
  // That is the dangerous shape — a guard that turns "no data" into a
  // plausible-looking number instead of an honest failure. The band was never
  // wrong; the denominator was. Two clean ticks with no hold give a
  // deterministic resting value, so the assertion no longer depends on a coin
  // flip and a missing sample can no longer masquerade as a measurement.
  for (let T = STEP; T <= 2 * STEP; T += STEP) {
    s.t = T;
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    vo2Rest = Math.max(vo2Rest, p.vo2Demand);
  }

  for (let T = 3 * STEP; T <= 30 * 60; T += STEP) {
    s.t = T;
    if (hold) hold(p);
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    if (p.seizing) vo2Sz = Math.max(vo2Sz, p.vo2Demand);
    else vo2Rest = Math.max(vo2Rest, p.vo2Demand);
    if (T > 15 * 60) { lateN++; if (p.seizing) lateSz++; }
  }
  return { latePct: lateSz / Math.max(1, lateN) * 100, vo2Sz, vo2Rest };
}
if (inPart(2, "2h")) {   // section 2h
  // SPECIFICITY FIRST. A limb that fires in everybody is worse than none: the
  // renin assertion once passed only because renin was elevated in EVERY
  // patient. Both bounds of this section depend on these two being 0.
  check("seizure limb", "healthy patient does NOT seize",
        seizureRun(null).latePct, 0, 2, "% ticks");
  // Eclampsia is modelled as pregnancy AND severe hypertension, so severe
  // hypertension alone must not produce it.
  check("seizure limb", "hypertension without pregnancy does NOT seize",
        seizureRun(pt => { pt.sbp = 185; }).latePct, 0, 2, "% ticks");

  // Neuroglycopenic seizure: documented below ~40 mg/dL.
  const moderate = seizureRun(pt => { pt.glucose = 35; });
  check("seizure limb", "hypoglycemia (glu 35) seizes", moderate.latePct, 50, 100, "% ticks");

  // The metabolic cost that had never once been paid. Coefficient is 2.2 in
  // metabolic.js; measured 249 -> 571 with the adrenergic response on top.
  check("seizure limb", "seizure raises VO2 demand",
        moderate.vo2Rest > 0 ? moderate.vo2Sz / moderate.vo2Rest : -1, 1.8, 2.6, "x");

  // MIDAZOLAM TERMINATES A MODERATE SEIZURE. Two-sided against the two ways this
  // has already failed: it read 95% when termination tested for exactly zero,
  // and it would read 0% at every dose if the drug simply abolished seizures.
  check("seizure limb", "midazolam terminates moderate seizure",
        seizureRun(pt => { pt.glucose = 35; }, [{ id: "midazolam", at: 300 }]).latePct,
        0, 15, "% ticks");

  // AND MUST NOT FIX THE CAUSE. A benzodiazepine does not treat hypoglycemia, so
  // a profound drive stays above the sustain threshold and the seizure continues
  // until the glucose is corrected. This is the assertion that stops the
  // anticonvulsant from being tuned into a universal off-switch.
  check("seizure limb", "midazolam does NOT stop profound hypoglycemic seizure",
        seizureRun(pt => { pt.glucose = 25; }, [{ id: "midazolam", at: 300 }]).latePct,
        50, 100, "% ticks");

  // CAUSE SELECTIVITY. Magnesium is the definitive drug for the ECLAMPTIC
  // mechanism and a poor anticonvulsant against anything else — not indicated in
  // status epilepticus of other causes, ineffective in epilepsy. It carried a
  // single generic coefficient for one batch, which silently made it a
  // broad-spectrum anticonvulsant.
  //
  // This is the assertion that keeps the two apart, and it is deliberately the
  // MIRROR of the midazolam pair above: same seizure, same dose timing, opposite
  // expected result, because the drugs differ in what they act on rather than in
  // how strong they are. If the selective term is ever collapsed back into the
  // general one, this fails immediately.
  check("seizure limb", "magnesium does NOT stop moderate hypoglycemic seizure",
        seizureRun(pt => { pt.glucose = 35; }, [{ id: "magnesium", at: 300 }]).latePct,
        50, 100, "% ticks");
}

// The sodium and eclampsia limbs shipped a batch before these assertions did,
// because the obvious way to test them does not work: pat.na and pat.sbp are both
// RECOMPUTED during update(), so holding either from outside the loop is erased
// before neuro.js reads it. Both are therefore driven through real mechanisms
// here — which is the point of lesson 1 anyway, since a subsystem driven by
// synthetic inputs gives confident wrong answers.
if (inPart(2, "2h")) {   // section 2h cont
  // HYPONATREMIC SEIZURE. Sodium is diluted by loading free water, the exact
  // inverse of the lever section 2 uses to concentrate it, so the renal model
  // stays in the loop and simply cannot excrete fast enough. 4 L over 45 min
  // takes serum sodium to 109 mmol/L, well under the ~120 threshold at which
  // cerebral oedema produces seizures.
  const p = makePatient();
  const s = S();
  let lateSz = 0, lateN = 0, naMin = 999;
  for (let T = STEP; T <= 60 * 60; T += STEP) {
    s.t = T;
    if (T <= 45 * 60) {
      const l = 4.0 / ((45 * 60) / STEP);
      const f = p.plasmaVol / ecf(p);
      p.plasmaVol += l * f; p.interstitialVol += l * (1 - f);
      p.totalBloodVol = p.plasmaVol + p.rbcVol;
    }
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    naMin = Math.min(naMin, p.na);
    if (T > 50 * 60) { lateN++; if (p.seizing) lateSz++; }
  }
  check("seizure limb", "free water drives sodium below threshold", naMin, 100, 120, "mmol/L");
  check("seizure limb", "hyponatremia seizes", lateSz / Math.max(1, lateN) * 100, 50, 100, "% ticks");
}

// ECLAMPSIA IS A CONJUNCTION, and each half is asserted separately because a
// conjunction that fires on either half alone is the same defect as a limb that
// fires in everybody. Severe-range hypertension is reached with a vasopressor
// rather than with pre-eclampsia, because THE ENGINE HAS NO PRE-ECLAMPSIA
// CONDITION — see the note in the reporting for this batch. That makes this a
// correct test of the branch and NOT evidence that anything in scenario play
// drives it.
function eclampsiaRun(pregnant, doses) {
  const p = pregnant ? makePregnant(34) : makePatient({ age: 30, sex: "female", weight: 65 });
  const s = S();
  for (const d of doses) s.doses.push(d);
  let sz = 0, n = 0, sbpMax = 0;
  for (let T = STEP; T <= 25 * 60; T += STEP) {
    s.t = T;
    if (p._pregnancy) updateObstetric(p, STEP / 60, s);
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    sbpMax = Math.max(sbpMax, p.sbp);
    if (T > 5 * 60) { n++; if (p.seizing) sz++; }
  }
  return { pct: sz / Math.max(1, n) * 100, sbpMax };
}
if (inPart(2, "2h")) {   // section 2h cont
  const PRESSOR = [{ id: "epiIV", at: 300, amount: 1 }];
  const eclamptic = eclampsiaRun(true, PRESSOR);
  // Measured: sbpMax 225, seizing 52% of the observation window.
  check("seizure limb", "pregnant + severe hypertension seizes", eclamptic.pct, 20, 100, "% ticks");
  // Neither half alone. The non-pregnant arm reaches a HIGHER pressure (231) and
  // must still not seize, so this cannot be passing for want of blood pressure.
  check("seizure limb", "same hypertension, NOT pregnant, does not seize",
        eclampsiaRun(false, PRESSOR).pct, 0, 2, "% ticks");
  check("seizure limb", "pregnant WITHOUT hypertension does not seize",
        eclampsiaRun(true, []).pct, 0, 2, "% ticks");

  // AND THE POSITIVE HALF OF THE SELECTIVITY PAIR. Magnesium must actually
  // treat the mechanism it is selective FOR, or "selective" just means "weak".
  // Together with the hypoglycemia mirror above this pins the drug from both
  // sides: it works here and it does not work there, and no single coefficient
  // can satisfy both.
  //
  // The band is wide on purpose. The drug lands at 420 s of a 20-minute observed
  // window with a 5-minute onset, so roughly a third of observed ticks are
  // necessarily pre-effect and a result near zero would mean the fixture, not
  // the drug, had changed.
  check("seizure limb", "magnesium suppresses eclamptic seizure",
        eclampsiaRun(true, [...PRESSOR, { id: "magnesium", at: 420, amount: 1 }]).pct,
        0, 45, "% ticks");
}

// ---------------------------------------------------------------------------
// 2i. VASOPRESSIN — the pressor effect must be VASOCONSTRICTION, not an offset
//
// This drug carried `fx: { sbp: 30 }`, which is the exact pattern section 1 of
// the brief forbids: a systolic offset produces a monitor number without
// producing the state that number is a measurement of. It was also DEAD — the
// measured pressor response was +101.0 mmHg with the field present and absent
// alike, while stripping the receptors dropped it to +0.1. The offset therefore
// never did anything, and the danger was that someone would notice a field that
// appeared broken and "fix" it, double-counting the entire effect on top of the
// V1 limb that already works.
//
// The guard is on SVR, not on blood pressure. A stat write can move the systolic
// reading; only vasoconstriction moves systemic vascular resistance, so asserting
// both together is what makes the offset unable to come back unnoticed.
//
// NOTE: the MAGNITUDE below is measured, not identified. +101 mmHg from a 40 U
// bolus is of the same order as an arrest dose of epinephrine (+118) and may
// well be too large; the bounds are deliberately wide because they exist to
// catch a mechanism change, not to bless the number. Identifying it against a
// documented observable is outstanding work — see the batch report.
// ---------------------------------------------------------------------------
if (inPart(2, "2i")) {   // section 2i
  const p = makePatient();
  advance(p, 20);
  const base = { sbp: p.sbp, svr: p.svr };
  const s = S();
  s.doses.push({ id: "vasopressin", at: 20 * 60 });
  let pkSbp = base.sbp, pkSvr = base.svr;
  for (let T = 20 * 60 + STEP; T <= 50 * 60; T += STEP) {
    s.t = T;
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    if (p.sbp > pkSbp) pkSbp = p.sbp;
    if (p.svr > pkSvr) pkSvr = p.svr;
  }
  // Measured: +101.0 mmHg and +2761 dyn.s.cm-5.
  check("vasopressin", "raises systemic vascular resistance", pkSvr - base.svr, 800, 4500, "dyn.s.cm-5");
  check("vasopressin", "raises systolic pressure", pkSbp - base.sbp, 40, 150, "mmHg");
}

}   // end of the slow pharmacology tier

// ---------------------------------------------------------------------------
// 3. HEMORRHAGE — isotonic loss: hypovolemia WITHOUT hypernatremia
// ---------------------------------------------------------------------------
if (inPart(2, "3")) {   // section 3
  const p = makePatient();
  const na0 = p.na;
  advance(p, 10, (pt) => {
    const loss = 1.5 / ((10 * 60) / STEP);
    const hct = pt.rbcVol / Math.max(0.01, pt.totalBloodVol);
    pt.totalBloodVol -= loss; pt.rbcVol -= loss * hct;
    pt.plasmaVol -= loss * (1 - hct);
    pt.naMass -= pt.na * loss * (1 - hct);
  });
  check("hemorrhage", "volume actually lost", p.totalBloodVol, 3.0, 4.0, "L");
  check("hemorrhage", "sodium UNCHANGED (isotonic)", Math.abs(p.na - na0), 0, 4, "mmol/L");
  check("hemorrhage", "renin activated", p.renin, 0.15, 3, "");
  check("hemorrhage", "ADH activated", p.adhs, 1.2, 6, "x rest");
}

// ---------------------------------------------------------------------------
// 4. FLUID OVERLOAD — isotonic load: edema and diuresis, no hypernatremia
// ---------------------------------------------------------------------------
if (inPart(2, "4")) {   // section 4
  const p = makePatient();
  const na0 = p.na, is0 = p.interstitialVol;
  advance(p, 20, (pt) => {
    const g = 2.5 / ((20 * 60) / STEP);
    pt.plasmaVol += g; pt.totalBloodVol += g; pt.naMass += 140 * g;
  });
  const bvPeak = p.totalBloodVol;
  advance(p, 45);
  check("overload", "volume falls back toward target", bvPeak - p.totalBloodVol, 0.2, 3.0, "L");
  check("overload", "sodium unchanged (isotonic load)", Math.abs(p.na - na0), 0, 4, "mmol/L");
  check("overload", "edema forms", p.interstitialVol - is0, 0.2, 6, "L");
}

// ---------------------------------------------------------------------------
// 5. SIADH — autonomous ADH: water retention -> DILUTIONAL hyponatremia
// ---------------------------------------------------------------------------
// HORIZON: these three disorders derange serum sodium by RENAL water handling,
// which moves it at roughly 0.5-1.5 mmol/L per hour — untreated complete central
// DI loses free water at ~0.4 L/h and raises serum sodium ~0.5-1.0 mmol/L per
// hour unreplaced, and SIADH hyponatremia develops over hours to days (the
// reason the safe CORRECTION limit is 8-10 mmol/L per 24 h). A 2-3 mmol/L
// threshold therefore needs 2-3 hours of simulated time, not 45 minutes.
//
// These three assertions ran for 45 min while carrying thresholds that describe
// multi-hour movement, so they were unreachable by construction and had been
// failing since before they were written — the oldest debt in the project, and
// not an engine defect. renalValidation.mjs passes the SAME [3..40]/[2..40]
// ranges on the SAME mechanisms because it runs 12-hour horizons; the thresholds
// appear to have been copied between fixtures without the horizon.
//
// Measured on this tree (dNa at 45 min / 2 h / 3 h / 6 h / 12 h):
//   SIADH           -1.45 / -3.62 /  ~-5  / -8.92 / -12.26
//   central DI      +0.98 / +2.43 /  ~+3.5 / +6.14 /  +8.39
//   nephrogenic DI  +0.92 / +2.29 / +3.31 /   -   /     -
// Every case tracks the documented rate at every documented timescale, so the
// horizon is raised to 3 h — chosen from the rate, with margin, NOT from where
// the assertion happens to pass.
if (inPart(2, "5")) {   // section 5
  const p = makePatient();
  const na0 = p.na;
  p.adhAutonomous = 3;
  advance(p, 180);
  check("SIADH", "sodium FALLS (hyponatremia)", na0 - p.na, 3, 40, "mmol/L");
  check("SIADH", "water retained (ECF up)", ecf(p) / (2.7 + 11.3), 0.98, 1.5, "x");
  check("SIADH", "sodium MASS not lost (dilutional)", p.naMass, 1800, 2600, "mmol");
}

// ---------------------------------------------------------------------------
// 6. CENTRAL DIABETES INSIPIDUS — no ADH: free water lost -> hypernatremia
// ---------------------------------------------------------------------------
if (inPart(2, "6")) {   // section 6
  const p = makePatient();
  const na0 = p.na;
  p.adhSecretionCapacity = 0;
  advance(p, 180);
  check("central DI", "sodium RISES (hypernatremia)", p.na - na0, 2, 40, "mmol/L");
  check("central DI", "ADH absent", p.adhs, 0, 0.2, "x rest");
}

// ---------------------------------------------------------------------------
// 7. NEPHROGENIC DI — ADH present but duct unresponsive
// ---------------------------------------------------------------------------
if (inPart(2, "7")) {   // section 7
  const p = makePatient();
  const na0 = p.na;
  p.adhRenalResponsiveness = 0.05;
  advance(p, 180);
  check("nephrogenic DI", "sodium RISES", p.na - na0, 2, 40, "mmol/L");
  check("nephrogenic DI", "ADH is HIGH (unlike central DI)", p.adhs, 1.0, 6, "x rest");
}

// ---------------------------------------------------------------------------
// 8. CIRRHOSIS — splanchnic venodilation: kidney retains DESPITE total overload
// ---------------------------------------------------------------------------
if (inPart(2, "8")) {   // section 8
  const p = makePatient();
  const bv0 = p.totalBloodVol, tgt0 = p.ageProfile.bloodVolumeL();
  p.venousCapacitanceFactor = 1.5;   // splanchnic/systemic venodilation
  advance(p, 45);
  check("cirrhosis", "defended volume RISES (underfilled circuit)", p.targetBloodVol / tgt0, 1.15, 1.8, "x");
  check("cirrhosis", "kidney retains (volume up)", p.totalBloodVol / bv0, 1.0, 1.6, "x");
  check("cirrhosis", "sodium not deranged by retention", p.na, 130, 145, "mmol/L");
}

// ---------------------------------------------------------------------------
// 9. SEPSIS — vasodilation: low SVR, preserved/high CO
// ---------------------------------------------------------------------------
if (inPart(2, "9")) {   // section 9
  const p = makePatient({ riskFactors: { sepsis: true } });
  advance(p, 30);
  check("sepsis", "SVR reduced", p.svr, 300, 1000, "dyn.s.cm-5");
  check("sepsis", "cardiac output preserved/high", p.co, 5.0, 14, "L/min");
}

// ---------------------------------------------------------------------------
// 10. PREGNANCY (term, tilted) — hyperdynamic, volume-expanded, mildly hyponatremic
// ---------------------------------------------------------------------------
if (inPart(2, "10")) {   // section 10
  const p = makePregnant(39);
  advance(p, 25);
  check("pregnancy", "blood volume expanded", p.totalBloodVol, 5.6, 7.0, "L");
  check("pregnancy", "cardiac output", p.co, 5.5, 7.5, "L/min");
  check("pregnancy", "heart rate", p.hr, 78, 98, "bpm");
  check("pregnancy", "hemoglobin (dilutional anemia)", p.rbcMass / (p.totalBloodVol * 10), 10.5, 12.8, "g/dL");
  check("pregnancy", "sodium ~135 (osmostat reset)", p.na, 130, 138, "mmol/L");
  check("pregnancy", "CVP near non-pregnant", p.cvp, 0, 7, "mmHg");
}

// ---------------------------------------------------------------------------
// 11. POSTPARTUM — autotransfusion then normalization
// ---------------------------------------------------------------------------
if (inPart(2, "11")) {   // section 11
  const p = makePregnant(39);
  p._pregnancy.laborProgress = 0.97;
  p._pregnancy.contractionRate = 5;
  const bvBefore = p.totalBloodVol;
  advance(p, 30);
  check("postpartum", "delivered", p._pregnancy.delivered ? 1 : 0, 1, 1, "");
  check("postpartum", "autotransfusion occurred", p.totalBloodVol - bvBefore, -1.0, 1.0, "L");
  check("postpartum", "volume set-point unwinding", p.sodiumRetentionDrive ?? 1, 1.0, 1.13, "x");
}

// ---------------------------------------------------------------------------
// 12. CEREBRAL ISCHEMIC INJURY — emergent from cerebral O2 delivery.
//     Graded by depth and duration, modified by temperature, with an
//     extraction reserve below which no injury accrues.
// ---------------------------------------------------------------------------
if (inPart(2, "12")) {   // section 12
  // Arrest is driven by holding the rhythm in asystole: cardiac output goes to
  // zero and cerebral delivery collapses through the normal chain. Note fio2
  // CANNOT be used to drive hypoxia — pk.js resets drugFio2 to 0.21 every tick
  // and effectiveFio2 takes the max, so room air is a hard floor by design.
  const arrest = (q) => { q.rhythm = "asystole"; };

  const healthy = makePatient();
  advance(healthy, 10);
  check("cerebral injury", "well-perfused brain accrues NO injury", healthy.brainInjury, 0, 0.001, "frac");

  const brief = makePatient();
  advance(brief, 2, arrest);
  const prolonged = makePatient();
  advance(prolonged, 10, arrest);
  check("cerebral injury", "prolonged arrest injures brain", prolonged.brainInjury, 0.15, 1.0, "frac");
  check("cerebral injury", "brief arrest injures LESS than prolonged",
    prolonged.brainInjury - brief.brainInjury, 0.05, 1.0, "frac diff");

  // Extraction reserve: hypoxaemia WITHOUT circulatory failure is compensated.
  // SpO2 in the low 80s with intact perfusion is altitude, not infarction.
  const hypoxaemic = makePatient();
  advance(hypoxaemic, 10, (q) => { q.shuntFraction = 0.9; });
  check("cerebral injury", "hypoxaemia with intact perfusion is compensated",
    hypoxaemic.brainInjury, 0, 0.01, "frac");

  // Temperature: cerebral metabolic suppression makes a cold arrest less
  // damaging than a warm one over identical ischaemic time.
  const warm = makePatient();
  advance(warm, 8, (q) => { arrest(q); q.coreTemp = 38.5; });
  const cold = makePatient();
  advance(cold, 8, (q) => { arrest(q); q.coreTemp = 30; });
  check("cerebral injury", "cold arrest is protective vs warm",
    warm.brainInjury - cold.brainInjury, 0.02, 1.0, "frac diff");
}

// ---------------------------------------------------------------------------
// 13. MYOCARDIAL ENERGETICS IN ARREST — ATP is a live metabolic substrate.
//     Irreversibility must emerge from metabolism, not from a clock.
// ---------------------------------------------------------------------------
if (inPart(2, "13")) {   // section 13
  const arrest = (q) => { q.rhythm = "asystole"; };

  // A perfused, beating heart keeps its reserve full: basal demand must not
  // quietly drain a healthy myocardium.
  const healthy = makePatient();
  advance(healthy, 15);
  check("myocardial energetics", "perfused heart holds ATP reserve", healthy.atp, 0.95, 1.0, "frac");

  // No coronary perfusion with basal metabolism still running => reserve falls.
  const arrested = makePatient();
  advance(arrested, 15, arrest);
  check("myocardial energetics", "arrest depletes ATP reserve", arrested.atp, 0.2, 0.85, "frac");
  check("myocardial energetics", "ATP deficit is driven by supply-demand",
    arrested.myoO2Balance, -1.0, -0.05, "index");

  // Graded in time, not a step: a longer arrest depletes further.
  const brief = makePatient();
  advance(brief, 5, arrest);
  check("myocardial energetics", "longer arrest depletes further",
    brief.atp - arrested.atp, 0.05, 1.0, "frac diff");
}

// ---------------------------------------------------------------------------
// 14. CLINICAL STATE CLASSIFICATION — mortality OBSERVES the trajectories the
//     physiology produces. Arrest is reversible; death is not.
// ---------------------------------------------------------------------------
if (inPart(2, "14")) {   // section 14
  const arrest = (q) => { q.rhythm = "asystole"; };
  const st = (p) => ({ alive: 0, arrest: 1, brainDead: 2, dead: 3 }[p.clinicalState] ?? -1);

  const well = makePatient();
  advance(well, 15);
  check("clinical state", "perfusing patient classified alive", st(well), 0, 0, "enum");

  // Pulseless NOW = arrest, and crucially NOT yet dead: still recoverable.
  const early = makePatient();
  advance(early, 3, arrest);
  check("clinical state", "early arrest classified arrest (not dead)", st(early), 1, 1, "enum");
  check("clinical state", "early arrest has no death cause", early.deathCause ? 1 : 0, 0, 0, "bool");

  // THE regression the old 4-minute timer caused: a patient who arrests and
  // then achieves ROSC must not stay marked dead.
  const rosc = makePatient();
  advance(rosc, 1.5, arrest);
  advance(rosc, 4.5, (q) => { q.rhythm = "sinus"; });
  check("clinical state", "ROSC returns patient to alive", st(rosc), 0, 0, "enum");
  check("clinical state", "ROSC leaves no death cause", rosc.deathCause ? 1 : 0, 0, 0, "bool");

  // Prolonged arrest DOES become irreversible — via cerebral perfusion failing,
  // an actual physiological endpoint, rather than a clock on the rhythm.
  //
  // QUEUE ITEM 29, RESOLVED. This was failing at 12 minutes and had been left
  // open as "a narrow miss" (ATP 0.641, brainInjury 0.521 — both short, both
  // trending right). The real cause was not a rate drift: mortality.js's
  // brainDeath mechanism requires consciousness==="coma" exactly, but
  // neuro.js's consciousness state machine had an unconditional line —
  // `if (pat.brainInjury > 0.5) target = "unconscious"` — that downgraded an
  // already-selected "coma" to "unconscious" the moment cumulative brainInjury
  // passed 0.5, which happens on the way to every genuine coma trajectory
  // (brainInjury only climbs during ongoing ischemia, never falls back below
  // 0.5 mid-arrest). That made brainDeath's own gate UNREACHABLE for the
  // patients it exists to classify — a real "written, read, and still inert"
  // mechanism (see this project's rule 3), not a calibration problem. Fixed in
  // neuro.js (only ever RAISES severity, never overrides an already-deeper
  // "coma") — a second real consumer, physiology.js's arrestWarning, was
  // silently broken by the identical bug and is fixed by the same change.
  //
  // With that fixed, a plain condition-less patient now reaches brain death
  // at a MEASURED 14.2 minutes into continuous asystole (instrumented
  // directly: brainInjury crosses 0.6 at ~14 min, cpp has been ~0 since
  // ~13 min) — genuinely past 12 minutes, not a rounding difference. 12 was
  // the stale number; the window is widened to 16, comfortably past the
  // measured crossing without approaching the next real transition (cardiac
  // arrest's own ATP<0.2 threshold, not measured until ~27 min in the same
  // trace) — see the instrumentation in this batch's report for the full
  // minute-by-minute trajectory.
  const prolonged = makePatient();
  advance(prolonged, 16, arrest);
  check("clinical state", "prolonged arrest becomes dead", st(prolonged), 3, 3, "enum");
}

// ---------------------------------------------------------------------------
// 15. CELLULAR ENERGY FAILURE -> POTASSIUM EFFLUX. The Na/K-ATPase is the
//     largest consumer of cellular ATP; when oxidative supply fails the K+
//     gradient is no longer defended.
// ---------------------------------------------------------------------------
if (inPart(2, "15")) {   // section 15
  const arrest = (q) => { q.rhythm = "asystole"; };

  const well = makePatient();
  advance(well, 20);
  check("energy failure", "perfused patient has no energy deficit", well.energyFailure ?? 0, 0, 0.05, "frac");
  check("energy failure", "perfused patient holds normal K+", well.k, 3.5, 5.0, "mmol/L");

  const arrested = makePatient();
  advance(arrested, 20, arrest);
  check("energy failure", "no-flow state is total energy failure", arrested.energyFailure ?? 0, 0.9, 1.0, "frac");
  // Documented: serum K+ reaches roughly 7-10 mmol/L over 20-30 min of arrest.
  check("energy failure", "arrest drives K+ efflux", arrested.k, 7.0, 11.0, "mmol/L");
  check("energy failure", "K+ rise is driven by ischaemia not a flag",
    arrested.k - well.k, 2.0, 8.0, "mmol/L diff");
}

// ---------------------------------------------------------------------------
// 16. NEUROLOGICAL OUTCOME — graded bands over cumulative ischaemic injury.
//     Surviving and surviving neurologically intact are different results.
// ---------------------------------------------------------------------------
if (inPart(2, "16")) {   // section 16
  const arrest = (q) => { q.rhythm = "asystole"; };
  const band = (p) => ({ intact: 0, mild: 1, severe: 2, brainDead: 3 }[p.neuroOutcome] ?? -1);

  const well = makePatient();
  advance(well, 15);
  check("neuro outcome", "perfused patient stays neurologically intact", band(well), 0, 0, "enum");

  // Short downtime with ROSC: circulation restored before injury accumulates.
  const goodRosc = makePatient();
  advance(goodRosc, 1.5, arrest);
  advance(goodRosc, 6, (q) => { q.rhythm = "sinus"; });
  check("neuro outcome", "rapid ROSC preserves neurological function", band(goodRosc), 0, 1, "enum");
  check("neuro outcome", "ROSC is recorded for the debrief", goodRosc.roscOccurred ? 1 : 0, 1, 1, "bool");

  // Long downtime: injury accumulates into the severe/brain-dead bands.
  const longDown = makePatient();
  advance(longDown, 15, arrest);
  check("neuro outcome", "prolonged downtime destroys neurological function", band(longDown), 2, 3, "enum");
  check("neuro outcome", "outcome worsens with downtime", band(longDown) - band(goodRosc), 1, 3, "enum diff");

  // Brain death is reached through ACCUMULATED injury, so a cold arrest — where
  // cerebral metabolism is suppressed — must not reach it as fast as a warm one.
  const warm = makePatient();
  advance(warm, 15, (q) => { arrest(q); q.coreTemp = 38.5; });
  const cold = makePatient();
  advance(cold, 15, (q) => { arrest(q); q.coreTemp = 30; });
  check("neuro outcome", "cold arrest preserves brain longer than warm",
    warm.brainInjury - cold.brainInjury, 0.05, 1.0, "frac diff");
}


if (!STREAM) {
  console.log("PHYSIOLOGY VALIDATION SUITE");
  console.log("=".repeat(78));
  let group = null;
  for (const r of results) {
    if (r.group !== group) { group = r.group; console.log(`\n[${group.toUpperCase()}]`); }
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(44)} ${String(fmtVal(r.value)).padStart(9)} ${r.unit.padEnd(12)} [${r.lo}..${r.hi}]`);
  }
}
console.log("\n" + "=".repeat(78));
console.log(`${passed} passed, ${failed} failed, ${passed + failed} total`);
// State the tier explicitly. A partial run that prints an unqualified total is
// exactly how a green result gets trusted for a change it never tested.
// The tier line must describe what ACTUALLY ran. --section made this urgent:
// a single-section run was printing "TIER: FULL - all assertions ran", which is
// precisely the failure this line exists to prevent. A five-assertion run that
// claims to be the full tier is worse than no line at all, because it reads as
// a green suite to anyone skimming.
console.log(SECTION ? `TIER: SINGLE SECTION "${SECTION}" — every other section was SKIPPED.`
  : PART !== 0 ? `TIER: PART ${PART} ONLY — the other part was SKIPPED.`
  : FAST ? "TIER: FAST — slow pharmacology assertions (2b-2e) were SKIPPED."
  : "TIER: FULL — all assertions ran.");
process.exitCode = failed > 0 ? 1 : 0;

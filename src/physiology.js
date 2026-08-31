// physiology.js — public interface only. The actual organ-system engine
// lives in ./physio/*; this file wires it up and keeps the exports
// (physio, critical, PK_PARAMS) that App.jsx and other callers use.
//
// MULTI-PATIENT: a session now holds a *roster* of patients (s._roster) to
// support MCI scenarios and obstetric cases where a delivery spawns a second
// (neonatal) patient mid-call. Backward compatibility is total: single-patient
// scenarios still work unchanged, and `s.patient` is always kept pointing at
// the currently-active patient so every existing caller (probes, micn,
// resolve, arrestWarning, critical, App.jsx) reads exactly what it did before.
import { GRACE } from "./scope.js";
import { SCEN } from "./data/scenarios.js";
import { MECHANISM_TREATABILITY } from "./physio/mortality.js";
import { CONDITIONS } from "./physio/conditions.js";
import { woundDef } from "./physio/wounds.js";
import { Patient } from "./physio/patient.js";
import { updateObstetric } from "./physio/obstetric.js";
export { PK_PARAMS } from "./physio/pk.js";

const SAFE_VITALS = {
  hr: 0, sbp: 0, dbp: 0, sbpL: 0, spo2: 0, rr: 0, etco2: 0, glu: 0, pain: 0,
  k: 4, blood: 0, ph: 740, kidney: "normal", temp: 37, coag: 100,
  bronch: 0, edema: 0, airway: "clear", ptx: null, rhythm: "sinus", tv: 0,
  ecg: "sinus",
};

// Build a Patient from a condition key + optional per-scenario overrides,
// folding any wound-derived bleed/pain into the constructor base (this is the
// same logic the single-patient path always used).
// A patient's pathophysiology is COMPOSED from one or more conditions. A
// scenario may name a single condition ("asthma") or a list
// (["cardiogenicShock", "coronaryArteryDisease"]) — the second form lets a
// physiological SYNDROME be kept separate from the ETIOLOGY that caused it, so
// ischemic cardiogenic shock, non-ischemic cardiomyopathy, myocarditis and
// valvular pump failure are all expressible by combining mechanisms instead of
// forking the syndrome into disease-specific variants.
//
// Composition rules:
//  - `initial` blocks merge left-to-right (later entries win on a key clash),
//    then the scenario's own `patient` overrides win over all of them.
//  - `wounds` accumulate across every condition.
//  - `sync`/`progress` run for each condition in declared order, so an etiology
//    can keep pushing on the substrate while the syndrome evolves.
function buildPatient(condKey, overrides, t) {
  const keys = Array.isArray(condKey) ? condKey : (condKey ? [condKey] : []);
  const conds = keys.map(k => CONDITIONS[k]).filter(Boolean);
  let base = {};
  for (const cond of conds) base = { ...base, ...(cond.initial || {}) };
  // riskFactors is a nested map, so merge it rather than letting one condition's
  // block erase another's.
  const rf = conds.reduce((acc, c) => ({ ...acc, ...((c.initial || {}).riskFactors || {}) }), {});
  if (Object.keys(rf).length) base.riskFactors = { ...rf, ...((overrides || {}).riskFactors || {}) };
  base = { ...base, ...(overrides || {}) };
  if (base.riskFactors && Object.keys(rf).length) base.riskFactors = { ...rf, ...((overrides || {}).riskFactors || {}) };

  let bleed = 0, pain = 0;
  const woundBleedByLocation = {};
  for (const cond of conds) {
    if (!cond.wounds) continue;
    Object.entries(cond.wounds).forEach(([loc, w]) => {
      const d = woundDef(w);
      if (!d) return;
      bleed += d.bleed;
      pain += d.pain;
      if (d.bleed) woundBleedByLocation[loc] = (woundBleedByLocation[loc] || 0) + d.bleed;
    });
  }
  if (bleed || pain) {
    base.bleed = (base.bleed || 0) + bleed;
    base.pain = (base.pain || 0) + pain;
  }
  if (Object.keys(woundBleedByLocation).length) base.woundBleedByLocation = woundBleedByLocation;
  const pat = new Patient(base, t);
  pat._conditions = conds;
  pat._condition = conds[0] || null;   // primary syndrome (back-compat reads)
  return pat;
}

// A roster entry: { id, role, name, patient }. `role` is free-form ("primary",
// "mother", "newborn", or an MCI triage tag). The active entry drives the
// monitor and every legacy single-patient read.
function ensureRoster(s) {
  if (s._roster && s._roster.length) return;
  const scen = SCEN[s.scen] || {};
  s._roster = [];
  if (Array.isArray(scen.patients) && scen.patients.length) {
    scen.patients.forEach((p, i) => {
      const id = p.id || `p${i + 1}`;
      const patient = buildPatient(p.condition, p.patient, s.t);
      patient._id = id;   // lets pk.js scope s.doses to this patient — see giveDose()
      s._roster.push({ id, role: p.role || null, name: p.name || null, patient });
    });
  } else {
    const patient = buildPatient(scen.condition, scen.patient, s.t);
    patient._id = "primary";
    s._roster.push({ id: "primary", role: "primary", name: scen.patientName || null, patient });
  }
  if (!s.activePatientId) s.activePatientId = s._roster[0].id;
}

// Advance one patient by whatever wall-clock time has elapsed since it last
// updated. sync() (instantaneous, e.g. airway patency) runs every call;
// progress() and the physiology sub-step only run when dt > 0.
function stepPatient(pat, s) {
  if (!pat) return;
  const conds = pat._conditions || (pat._condition ? [pat._condition] : []);
  for (const c of conds) if (c.sync) c.sync(pat, s);
  const dt = Math.max(0, (s.t - pat.lastUpdate) / 60);
  if (dt > 0) {
    for (const c of conds) if (c.progress) c.progress(pat, dt, s);
    if (pat._pregnancy) updateObstetric(pat, dt, s);   // labor / delivery timing
    // ENDOTHELIAL BARRIER REPAIR — queue item 49's hysteresis audit found
    // pat.capillaryLeak had NO resolution mechanism in either direction:
    // every condition that raises it (preeclampsia, acutePancreatitis,
    // toxicInhalationChlorine, anaphylaxis) only ever ratchets it up toward
    // its own ceiling, and nothing anywhere ever lowered it — a genuinely
    // missing mechanism, not just an unmodeled hysteresis shape. Real
    // endothelial tight-junction repair is a slow, generic process
    // (restoration of the paracellular barrier via re-established
    // occludin/claudin junctions) that begins once the inciting cytokine/
    // mediator stimulus fades, independent of which disease caused the
    // injury in the first place — the same reasoning that makes this a
    // shared handle rather than a per-condition one (patient.js's own
    // comment on the field). Clinical anchor: systemic capillary leak
    // syndrome and sepsis-associated permeability both show measurable
    // improvement beginning in the first 24-72h of the recovery phase
    // (the literature's own "leak phase" -> "recruitment/diuretic phase"
    // transition) — a tau near the middle of that band, ~36h, is used
    // here (rate = 1 / (36*60) min^-1 = ~0.00046/min).
    //
    // Applied unconditionally, every tick, AFTER every condition's own
    // forcing has already run this tick — while a condition is actively
    // driving the leak (every existing consumer's own rate is 0.006-0.03
    // /min, 15-65x this decay rate), the forcing dominates and the net
    // trajectory is still upward, unchanged from before this fix. The
    // decay only becomes visible once nothing is actively forcing the
    // field anymore, which no current 900s scenario's own call length
    // can show moving by more than a few thousandths — correctly small
    // and slow, not faked into a same-call recovery real endothelium
    // cannot achieve. This closes the literal gap item 49 found, without
    // attempting item 46's full inflammation-cascade scope.
    pat.capillaryLeak = Math.max(0, (pat.capillaryLeak || 0) - dt * 0.00046);
  }
  pat.update(dt, s);
}

// A patient (via the obstetric model) can request that a newborn be added to
// the roster. We service the queue AFTER stepping everyone so the newborn does
// not get double-stepped on its birth tick.
function processSpawns(s) {
  if (!s._spawnQueue || !s._spawnQueue.length) return;
  const spawns = s._spawnQueue;
  s._spawnQueue = [];
  for (const spec of spawns) {
    const pat = buildPatient(spec.condition, spec.patient, s.t);
    const id = spec.id || `p${s._roster.length + 1}`;
    pat._id = id;   // lets pk.js scope s.doses to this patient — see giveDose()
    if (spec.init) spec.init(pat);
    const entry = { id, role: spec.role || null,
      name: spec.name || null, patient: pat };
    s._roster.push(entry);
    if (spec.makeActive) s.activePatientId = entry.id;
    s._lastSpawn = { id: entry.id, role: entry.role, name: entry.name, t: s.t };
  }
}

export function physio(s) {
  try {
    ensureRoster(s);
    for (const entry of s._roster) stepPatient(entry.patient, s);
    processSpawns(s);
    const active = s._roster.find(e => e.id === s.activePatientId) || s._roster[0];
    s.patient = active.patient;                 // backward-compat live reference
    const v = active.patient.vitals();
    active.patient._lastVitals = v;
    return v;
  } catch (e) {
    console.error("Physiology engine error — holding last known vitals.", e);
    return s.patient?._lastVitals || SAFE_VITALS;
  }
}

// ---- Multi-patient helpers (used by MCI/obstetric UI; harmless otherwise) ----

// The full roster as lightweight views. Vitals are computed for each patient so
// a triage/overview panel can render every casualty at once.
export function roster(s) {
  try {
    ensureRoster(s);
    return s._roster.map(e => ({
      id: e.id, role: e.role, name: e.name,
      active: e.id === s.activePatientId,
      vitals: e.patient.vitals(),
      dead: !!e.patient.deathCause, deathCause: e.patient.deathCause || null,
    }));
  } catch { return []; }
}

// Switch which patient the monitor / assessment is bound to. Returns the new
// active id (or null on failure).
export function setActivePatient(s, id) {
  try {
    ensureRoster(s);
    if (s._roster.some(e => e.id === id)) { s.activePatientId = id; return id; }
    return null;
  } catch { return null; }
}

export function activePatient(s) {
  try { ensureRoster(s); return (s._roster.find(e => e.id === s.activePatientId) || s._roster[0]).patient; }
  catch { return s.patient || null; }
}

// Record a dose/procedure against whichever patient is currently active, so
// s.doses stops being one undifferentiated pile shared by the whole roster.
// pk.js reads each patient's doses back out by matching patientId against
// that patient's _id (see applyProcedures/updateDrugs), so meds given while
// patient A is active never act on patient B once you switch the monitor
// over — the leak that childbirth's neonatalTransition workaround (see
// conditions.js) previously had to dodge by hand with bespoke pat._neo flags.
// Doses written before this existed (or by any caller that still pushes
// onto s.doses directly) carry no patientId and are treated as global, so
// old saves keep working unchanged.
export function giveDose(s, dose) {
  try {
    ensureRoster(s);
    const patientId = s.activePatientId ?? s._roster[0]?.id ?? null;
    const stamped = { ...dose, patientId };
    s.doses = [...(s.doses || []), stamped];
    return stamped;
  } catch {
    s.doses = [...(s.doses || []), dose];
    return dose;
  }
}

const GUARD = (s) => (s.phase === "scene" || s.phase === "transport") && (s.t - (s.onSceneAt ?? s.t)) >= GRACE;

export const arrestWarning = (v, s) => {
  try {
    if (!GUARD(s)) return null;
    const pat = s.patient;
    if (!pat) return null;
    if (v.hr === 0 || v.sbp === 0 || ["VF", "asystole", "PEA"].includes(pat.rhythm)) return { cause: "cardiac arrest", story: "No cardiac output — this is the moment CPR/defibrillation matters." };
    if (pat.consciousness === "coma" && pat.cpp < 30) return { cause: "critical cerebral perfusion", story: `CPP ${Math.round(pat.cpp)} mmHg in a comatose patient — heading toward irreversible.` };
    if ((pat.k ?? 4) >= 8.5) return { cause: "severe hyperkalaemia", story: `Potassium ${pat.k.toFixed(1)} mEq/L — arrhythmia territory if this isn't corrected.` };
    if ((pat.ph ?? 7.4) < 6.9) return { cause: "severe acidosis", story: `pH ${pat.ph.toFixed(2)} — approaching the limit of survivability.` };
    if (pat.map < 40 && pat.lactate > 8) return { cause: "decompensated shock", story: `MAP ${Math.round(pat.map)}, lactate ${pat.lactate.toFixed(1)} — shock is close to irreversible.` };
    if (pat.totalBloodVol < pat.ageProfile.bloodVolumeL() * 0.4 && pat.coagPct < 40) return { cause: "hemorrhage with coagulopathy", story: `Blood volume ${pat.totalBloodVol.toFixed(1)} L and clotting failing — bleeding out.` };
    return null;
  } catch { return null; }
};

export const critical = (v, s) => {
  try {
    if (!GUARD(s)) return null;
    const pat = s.patient;
    if (!pat || !pat.deathCause) return null;
    return { cause: pat.deathCause, story: pat.deathStory };
  } catch { return null; }
};

// END-OF-CALL OUTCOME REPORT.
//
// Deliberately NOT exposed through vitals(), roster() or critical(): the design
// brief is explicit that the provider must not learn during the scenario whether
// the patient will survive, whether ROSC will ultimately succeed, or whether
// neurological recovery is possible. This is the debrief view, to be rendered
// only on the evaluation screen after the call has ended.
//
// Every field is READ from the trajectory the physiology modules produced. This
// function computes no physiology of its own and must never be given any — if a
// number is wanted here that the engine does not already track, it belongs in
// the module that owns the mechanism.
export const outcomeReport = (s) => {
  try {
    if (!GUARD(s)) return null;
    const pat = s.patient;
    if (!pat) return null;

    const irreversible = [];
    if ((pat.brainInjury ?? 0) >= 0.5) irreversible.push("hypoxic-ischaemic brain injury");
    if ((pat.kidneyInjury ?? 0) >= 0.5) irreversible.push("acute kidney injury");
    if ((pat.liverInjury ?? 0) >= 0.5) irreversible.push("ischaemic hepatic injury");
    if ((pat.gutInjury ?? 0) >= 0.5) irreversible.push("bowel ischaemia / infarction");
    // Queue item 74, Phase 2: per-limb structural ischemic injury
    // (neuro.js's updateOrganInjury, pat.limbInjury). Same 0.5 magnitude
    // threshold as the scalar organs above, applied per limb since a
    // single patient can lose one limb while the other three stay fine —
    // collapsing this into one whole-body flag would hide that.
    const LIMB_NAMES = { armL: "left arm", armR: "right arm", legL: "left leg", legR: "right leg" };
    for (const loc of Object.keys(LIMB_NAMES)) {
      if (((pat.limbInjury || {})[loc] ?? 0) >= 0.5) {
        irreversible.push(`irreversible ${LIMB_NAMES[loc]} ischemia`);
      }
    }

    // REVERSIBLE FINDINGS (queue item 48) — the list above is really a
    // MAGNITUDE threshold mislabeled "irreversible," which conflates injury
    // SIZE with injury PERMANENCE: a patient can have severe but genuinely
    // reversible dysfunction (classic prerenal azotemia — supportive care
    // and restored perfusion resolve it) or, in principle, modest but
    // durable structural damage. Kidney already has the real substrate for
    // this distinction and nothing else does yet, so this is scoped to
    // kidney alone rather than invented for every organ at once, per this
    // item's own "start narrow, not a speculative scalar on every organ"
    // framing. `pat.atnProgression` (renal.js) is a SEPARATE accumulator
    // from `pat.kidneyInjury` — it rises only while renal perfusion is
    // genuinely low and decays fully back to zero once perfusion recovers
    // (renal.js's own comment), i.e. it already IS a real, functioning
    // "reversible renal dysfunction" signal distinct from the slower,
    // durable `kidneyInjury` structural accumulator — it just had no reader
    // outside its own GFR contribution before this. MEASURED (not
    // guessed): a healthy control and a real, moderate trauma scenario both
    // hold atnProgression at exactly 0.000 (a genuine deadband, not noise
    // to filter with a large threshold — any nonzero value is a real
    // positive finding), while a genuinely catastrophic, untreated,
    // near-terminal hemorrhage (AAA at 30 min, kidneyInjury still under the
    // 0.5 structural threshold at that point) reaches 0.134 — the threshold
    // below is set low enough to catch this real case, not fitted to force
    // a dramatic number.
    const reversible = [];
    if ((pat.kidneyInjury ?? 0) < 0.5 && (pat.atnProgression ?? 0) > 0.02) {
      reversible.push("acute tubular dysfunction from transient renal hypoperfusion (likely reversible with supportive care)");
    }

    const mech = pat.deathMechanism ? MECHANISM_TREATABILITY[pat.deathMechanism] : null;

    return {
      survived: !pat.deathCause,
      clinicalState: pat.clinicalState ?? "alive",
      // Neurological outcome is the headline for an arrest survivor: being alive
      // and being neurologically intact are different results.
      neuroOutcome: pat.neuroOutcome ?? "intact",
      brainInjuryFraction: +(pat.brainInjury ?? 0).toFixed(3),
      arrestOccurred: pat.arrestStartMin != null,
      arrestAtMin: pat.arrestStartMin != null ? +pat.arrestStartMin.toFixed(1) : null,
      roscOccurred: !!pat.roscOccurred,
      roscAtMin: pat.roscTimeMin != null ? +pat.roscTimeMin.toFixed(1) : null,
      // Downtime is what actually predicts neurological outcome after arrest,
      // so it is reported rather than left for the reviewer to subtract.
      downtimeMin: pat.arrestStartMin != null
        ? +(((pat.roscTimeMin ?? pat.deathTimeMin ?? pat.elapsedMin ?? 0) - pat.arrestStartMin)).toFixed(1)
        : 0,
      deathCause: pat.deathCause ?? null,
      deathStory: pat.deathStory ?? null,
      timeOfDeathMin: pat.deathTimeMin != null ? +pat.deathTimeMin.toFixed(1) : null,
      irreversibleInjuries: irreversible,
      reversibleFindings: reversible,
      // See MECHANISM_TREATABILITY: this reports whether the lethal mechanism is
      // of a treatable KIND. It is not a claim about this patient's outcome.
      lethalMechanismTreatable: mech ? mech.treatable : null,
      lethalMechanismLever: mech ? mech.lever : null,
      // TROPONIN (queue item 18) — a real lab-confirmation value, not a live
      // monitor reading (see mortality.js for why: real assay turnaround is
      // too slow for prehospital use). Reported here, not through vitals(),
      // for the same reason survival/ROSC/neuroOutcome are debrief-only:
      // the provider should not learn a hospital lab result during the call.
      troponin: pat.troponin ?? "negative",
    };
  } catch { return null; }
};

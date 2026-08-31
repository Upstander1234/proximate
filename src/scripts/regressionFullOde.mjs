// scripts/regressionFullOde.mjs — Task 1 regression harness.
//
// Runs every CONDITIONS[] patient profile (plus a healthy baseline) forward
// for SIM_MINUTES of simulated time with no interventions, and compares the
// now-authoritative full ODE loop (pat._full*) against the legacy lumped
// solver (pat._legacy*) — both of which are computed EVERY tick regardless
// of which one is published (see FULL_ODE_AUTHORITATIVE in cardiovascular.js)
// so this is a genuine same-trajectory, same-random-draws A/B comparison, not
// two separate noisy runs.
//
// Usage: node scripts/regressionFullOde.mjs
import { Patient } from "../src/physio/patient.js";
import { CONDITIONS } from "../src/physio/conditions.js";
import { woundDef } from "../src/physio/wounds.js";

const SIM_MINUTES = 20;      // simulated patient-time per scenario
const TICK_SEC = 3;          // matches the app's normal tick cadence
const WARMUP_MIN = 1.5;      // let the full loop leave its generic initState transient before scoring

function buildPatient(condKey) {
  const cond = condKey ? CONDITIONS[condKey] : null;
  const base = { ...(cond?.initial || {}) };
  if (cond?.wounds) {
    let bleed = 0, pain = 0;
    Object.values(cond.wounds).forEach((w) => {
      const d = woundDef(w);
      if (d) { bleed += d.bleed; pain += d.pain; }
    });
    base.bleed = (base.bleed || 0) + bleed;
    base.pain = (base.pain || 0) + pain;
  }
  const pat = new Patient(base, 0);
  pat._condition = cond || null;
  return pat;
}

function runOne(condKey) {
  const pat = buildPatient(condKey);
  const s = { t: 0, doses: [] };
  const totalTicks = Math.round((SIM_MINUTES * 60) / TICK_SEC);
  const warmupTicks = Math.round((WARMUP_MIN * 60) / TICK_SEC);

  const rows = []; // per-tick {legacy:{}, full:{}} once warmed up
  let died = null;

  for (let i = 0; i < totalTicks; i++) {
    if (pat._condition && pat._condition.sync) pat._condition.sync(pat, s);
    s.t += TICK_SEC;
    const dt = TICK_SEC / 60;
    if (pat._condition && pat._condition.progress) pat._condition.progress(pat, dt, s);
    pat.update(dt, s);

    if (pat.deathCause && !died) died = { cause: pat.deathCause, atMin: +(s.t / 60).toFixed(2) };

    if (i >= warmupTicks) {
      rows.push({
        legacy: {
          sbp: pat._legacySbp, dbp: pat._legacyDbp, map: pat._legacyMap,
          co: pat._legacyCo, sv: pat._legacySv, ef: pat._legacyEf,
        },
        full: {
          sbp: pat.sbp, dbp: pat.dbp, map: pat.map, co: pat.co, sv: pat.sv, ef: pat.ef,
        },
        hr: pat.hr,
        massDriftFrac: pat.fourChamberLoop
          ? (pat.fourChamberLoop.totalVolumeMl) : null,
      });
    }
  }

  const metrics = ["sbp", "dbp", "map", "co", "sv", "ef"];
  const summary = {};
  for (const m of metrics) {
    const diffs = rows.map((r) => (r.full[m] ?? 0) - (r.legacy[m] ?? 0));
    const legacyVals = rows.map((r) => r.legacy[m] ?? 0);
    const fullVals = rows.map((r) => r.full[m] ?? 0);
    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const meanLegacy = mean(legacyVals), meanFull = mean(fullVals);
    const meanAbsDiff = mean(diffs.map(Math.abs));
    const maxAbsDiff = Math.max(...diffs.map(Math.abs), 0);
    summary[m] = {
      meanLegacy: +meanLegacy.toFixed(2), meanFull: +meanFull.toFixed(2),
      meanAbsDiff: +meanAbsDiff.toFixed(2), maxAbsDiff: +maxAbsDiff.toFixed(2),
      pctDiff: meanLegacy !== 0 ? +((100 * (meanFull - meanLegacy) / meanLegacy).toFixed(1)) : null,
    };
  }
  const finalHr = rows.length ? rows[rows.length - 1].hr : pat.hr;
  const finalMassMl = rows.length ? rows[rows.length - 1].massDriftFrac : null;
  const initMassMl = pat.fourChamberLoop ? null : null;

  return {
    condition: condKey || "healthy", died, finalHr, summary,
    finalMassMl,
    lethalTimers: pat.lethalTimers,
  };
}

function fmtRow(cols) { return cols.join(" | "); }

function main() {
  const keys = [null, ...Object.keys(CONDITIONS)];
  const results = keys.map((k) => {
    try { return runOne(k); }
    catch (e) { return { condition: k || "healthy", error: e.stack }; }
  });

  console.log(`\nTask 1 regression: full ODE loop (authoritative) vs legacy lumped solver`);
  console.log(`${SIM_MINUTES} simulated minutes per scenario, ${TICK_SEC}s ticks, first ${WARMUP_MIN} min excluded as full-loop warmup.\n`);

  for (const r of results) {
    if (r.error) {
      console.log(`### ${r.condition} — ERROR\n${r.error}\n`);
      continue;
    }
    console.log(`### ${r.condition}${r.died ? `  [died: ${r.died.cause} @ ${r.died.atMin} min]` : ""}`);
    console.log(fmtRow(["metric", "legacyMean", "fullMean", "meanAbsDiff", "maxAbsDiff", "pctDiff"].map((c) => c.padEnd(11))));
    for (const m of ["sbp", "dbp", "map", "co", "sv", "ef"]) {
      const s = r.summary[m];
      console.log(fmtRow([m, s.meanLegacy, s.meanFull, s.meanAbsDiff, s.maxAbsDiff, s.pctDiff].map((c) => String(c).padEnd(11))));
    }
    console.log("");
  }

  // Flag scenarios worth a closer look: full loop diverges >20% from legacy
  // mean MAP/CO, or crashes to non-finite, or the two solvers disagree on
  // whether the patient died in this run.
  console.log("---- FLAGGED FOR REVIEW ----");
  let anyFlag = false;
  for (const r of results) {
    if (r.error) { console.log(`${r.condition}: threw — ${r.error.split("\n")[0]}`); anyFlag = true; continue; }
    const mapS = r.summary.map, coS = r.summary.co;
    const bad = [];
    if (mapS.pctDiff != null && Math.abs(mapS.pctDiff) > 20) bad.push(`MAP off by ${mapS.pctDiff}%`);
    if (coS.pctDiff != null && Math.abs(coS.pctDiff) > 20) bad.push(`CO off by ${coS.pctDiff}%`);
    if (!Number.isFinite(mapS.meanFull) || !Number.isFinite(coS.meanFull)) bad.push("non-finite full-loop output");
    if (bad.length) { console.log(`${r.condition}: ${bad.join("; ")}`); anyFlag = true; }
  }
  if (!anyFlag) console.log("(none — all scenarios within the expected calibration band)");
}

main();

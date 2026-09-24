// tools/browser/verifyLungsProbeLive.mjs — F7 standing workstream: six
// non-cardiac scenarios' probes.lungs were frozen text hiding a real,
// live bronchospasm/upper-airway-obstruction severity field
// (pat.effectiveBroncho / pat.upperAirwayObstruction) — the same defect
// class already fixed once for toxicInhalationChlorine and the
// cardiac-arrhythmia/ACS-family heart probes. Fixed scenarios: anaph,
// asthmaAttack, bronchiolitisInfant, croupToddler, epiglottitisChild,
// copdExacerbationCall (the exact scenario key is confirmed at runtime
// below via the scenario registry, not assumed).
//
// This forces the live patient's severity field directly via
// __proximateTestSetState (the same dev-only hook other F7 verification
// scripts use), clicks the real "Auscultate lung fields" action at two
// different severity levels, and confirms the logged text actually
// differs between them — proving the probe reads live state, not a
// frozen string.
//
// Run: node tools/browser/verifyLungsProbeLive.mjs   (needs `npm run dev`)
//
// KNOWN FLAKINESS, stated honestly: a Vite dev server hot-reloading src
// files while this script is mid-run can drop the injected
// __proximateTestSetState hook (a real page-context loss, not a bug in
// the fix itself) — if you see "not found on window" mid-run, restart the
// dev server cleanly (no concurrent edits to src/) and re-run. Every
// individual case in this file has passed a clean click-through
// independently at least once; the harness's flakiness is about running
// all six back-to-back without a src edit landing mid-run, not about the
// probes themselves. A second, harness-independent confirmation exists:
// calling scenarios.js's own exported probes.lungs functions directly
// against synthetic {patient:{...}} state (see queue item F7's
// CLAUDE.md changelog entry for the numbers) is the stronger evidence
// this fix reads live state, since it exercises the exact shipped
// function with zero browser-timing dependency.

import { launch, clickText, waitForPhase, setState, getState, toTitleScreen } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.reload();
  await page.waitForTimeout(500);
  await toTitleScreen(page);
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Lungs");
  await page.fill('input[placeholder="Last"]', "Probe");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

// scenario key, the field to force, low/high values that should produce
// visibly different probe text.
// pat.effectiveBroncho is DERIVED every physio tick from pat.broncho (see
// respiratory.js) — forcing effectiveBroncho directly gets silently
// overwritten by the very next tick during the action's own busy timer.
// Force the underlying pat.broncho instead (a slow accumulator, stable
// across the ~25 sim-second window) and let the engine derive
// effectiveBroncho from it live, same as real play. upperAirwayObstruction
// is not derived per-tick, so it can be forced directly.
const CASES = [
  { scen: "anaph", field: "broncho", low: 0.3, high: 0.9 },
  { scen: "asthmaAttack", field: "broncho", low: 0.3, high: 0.9 },
  { scen: "bronchiolitisInfant", field: "broncho", low: 0.2, high: 0.7 },
  { scen: "croupToddler", field: "upperAirwayObstruction", low: 0.2, high: 0.6 },
  { scen: "epiglottitisChild", field: "upperAirwayObstruction", low: 0.3, high: 1.5 },
  { scen: "copdExacerbationCall", field: "broncho", low: 0.1, high: 0.5 },
];

async function auscultate(page, scen, field, value) {
  // A raw setState({phase:"scene", scen:...}) while ALREADY in phase
  // "scene" does not reliably re-trigger the effect that constructs a
  // fresh physiology Patient for the new scenario — bounce all the way
  // out to "gmodePick" and back for each call to guarantee a clean patient.
  await setState(page, { phase: "gmodePick", scen: null });
  await page.waitForTimeout(300);
  await setState(page, {
    phase: "scene", gmode: "sandbox", scen, level: "paramedic",
    t: 5, onSceneAt: 0, tab: "assess", region: "torso",
    pockets: ["scope"], exposed: { torso: true },
    speed: 12, done: {}, busy: null,
  });
  await page.waitForTimeout(400);
  // Force the live patient's severity field directly, mirroring how other
  // F7 scripts force pat.* fields via the dev hook.
  await page.evaluate(({ f, v }) => {
    const st = window.__proximateTestGetState();
    if (st.patient) st.patient[f] = v;
  }, { f: field, v: value });
  await page.waitForTimeout(100);
  const preLogLen = ((await getState(page)).log || []).length;
  await clickText(page, "Auscultate lung fields");
    await page.waitForTimeout(1500);
    if (await page.getByText("Finish listening").count()) await clickText(page, "Finish listening");
  await page.waitForTimeout(3500);
  const afterState = await getState(page);
  const newLog = (afterState.log || []).slice(preLogLen);
  if (!newLog.length) return "(NO NEW LOG ENTRY — click likely failed)";
  return newLog.map(l => l.text || "").join(" | ");
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // Confirm real scenario keys against the registry before trusting the
  // guessed names above (lesson 16 / lesson 8 — do not assume a name).
  const realKeys = await page.evaluate(async () => {
    const mod = await import("/src/data/scenarios.js");
    return Object.keys(mod.SCEN || mod.SCENARIOS || {});
  });

  const findings = [];
  for (const c of CASES) {
    if (!realKeys.includes(c.scen)) {
      const guess = realKeys.find(k => k.toLowerCase().includes(c.scen.toLowerCase().slice(0, 6)));
      findings.push(`${c.scen}: not a real scenario key (did you mean "${guess}"?) — skipping`);
      continue;
    }
    consoleErrors.length = 0;
    try {
      const lowText = await auscultate(page, c.scen, c.field, c.low);
      const highText = await auscultate(page, c.scen, c.field, c.high);
      if (lowText === highText) {
        findings.push(`${c.scen}: lungs probe text IDENTICAL at ${c.field}=${c.low} and ${c.field}=${c.high} — "${lowText}"`);
      } else {
        console.log(`PASS: ${c.scen} lungs probe text differs by ${c.field} (low: "${lowText.slice(0,60)}..." / high: "${highText.slice(0,60)}...")`);
      }
      if (consoleErrors.length) findings.push(`${c.scen}: console errors — ${consoleErrors.join(" | ")}`);
    } catch (err) {
      findings.push(`${c.scen}: threw during click/read — ${err.message}`);
    }
  }

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("All lungs probes read live severity state, zero console errors.");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

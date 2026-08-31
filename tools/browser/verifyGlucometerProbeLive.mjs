// tools/browser/verifyGlucometerProbeLive.mjs — F7 standing workstream.
// A real, previously-undiscovered defect: 91 scenario-authored
// `probes.glucometer` overrides across src/data/scenarios.js (e.g.
// diabeticKetoacidosisCall's `"HIGH" — off the top of the scale`,
// severeHypoglycemia's exact "28 mg/dL") were completely DEAD — every real
// finding-override lookup site in App.jsx keys on `a.probe` (the action's
// own declared probe name, e.g. pedL/radL's `probe:"pedL"`/`probe:"radL"`),
// and neither of the two "gluc" actions in actions.js declared a `probe`
// field at all, so `(scenOf(s).probes||{})[a.probe]` was always
// `(...)[undefined]` — the scenario's authored glucometer text could never
// fire; players only ever saw the generic `${v.glu} mg/dL.` readout, even
// for scenarios whose author clearly wrote a more specific/clinically
// realistic override (off-scale "HIGH", a teaching-point framing for a
// normal glucose in alcoholic ketoacidosis, etc). Fixed by adding
// `probe:"glucometer"` to both `gluc` actions (armR/armL) — the same
// one-line fix pattern every other probe-bearing action already uses.
// This clicks the real "Blood glucose" action for a real DKA scenario and
// confirms the authored "HIGH" override text now appears instead of the
// generic numeric readout.
//
// Run: node tools/browser/verifyGlucometerProbeLive.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await clickText(page, "Continue without AI");
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Gluc");
  await page.fill('input[placeholder="Last"]', "Probe");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  const findings = [];

  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "diabeticKetoacidosisCall", level: "paramedic",
    t: 5, onSceneAt: 0, tab: "assess", region: "armR",
    // gluc has no pocket/expose gate beyond its own region, but pockets is
    // still read for other actions on the same tab — harmless to include.
    pockets: ["glucometer"], exposed: {},
    speed: 12,
  });
  await page.waitForTimeout(300);

  await clickText(page, "Blood glucose");
  await page.waitForTimeout(3500);

  const afterState = await getState(page);
  const lastLog = (afterState.log || []).slice(-6).map(l => l.text || "").join(" | ");

  if (lastLog.includes("HIGH")) {
    console.log(`PASS: diabeticKetoacidosisCall's authored glucometer override fired — log: "${lastLog}"`);
  } else {
    findings.push(`diabeticKetoacidosisCall: expected the authored "HIGH" override text, got: "${lastLog}"`);
  }
  // Filter out the expected, already-documented "no real WebGPU adapter in
  // this environment" classification log (F0's own reliability fix logs it
  // via console.error on purpose) — every F0 verification script across
  // this project's history hits the same benign noise in headless Chromium;
  // it isn't a regression introduced by this glucometer fix.
  const realErrors = consoleErrors.filter(e => !e.includes("LocalLLMProvider: model load failed"));
  if (realErrors.length) findings.push(`console errors — ${realErrors.join(" | ")}`);

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("Glucometer probe override now fires for real, zero console errors.");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

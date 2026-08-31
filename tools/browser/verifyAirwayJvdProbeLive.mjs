// tools/browser/verifyAirwayJvdProbeLive.mjs — F7 standing workstream,
// direct follow-up to the same glucometer defect found this session:
// the same grep-and-check pass (does the scenario's override key match a
// REAL action's own declared `probe:"..."` name in actions.js?) found four
// more dead scenario-authored overrides, all real key-name MISMATCHES, not
// missing content:
//  - stabChest's `probes.neck` (JVD + tracheal deviation for tension
//    pneumothorax) — no action declares `probe:"neck"`; the real action is
//    `jvd` (`probe:"jvd"`). Renamed neck -> jvd.
//  - choking40 (condition fbao), activeSeizureGTC, and esophagealVaricesBleed
//    each declared `probes.airway` — no action declares `probe:"airway"`;
//    the real action is `airwayLook` (`probe:"airwayLook"`, "Look in the
//    airway"). Renamed all three airway -> airwayLook.
// All four overrides were previously dead: players saw only the generic
// default finding (`jvd`'s cvp-only text with no tracheal-deviation
// mention; `airwayLook`'s generic patent/vomit-only text) regardless of
// what the scenario author actually wrote for that specific presentation.
//
// This clicks the real actions for all four scenarios and confirms each
// authored override now fires.
//
// Run: node tools/browser/verifyAirwayJvdProbeLive.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Airway");
  await page.fill('input[placeholder="Last"]', "Probe");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

const CASES = [
  { scen: "stabChest", region: "neck", clickLabel: "Jugular venous distension", expect: "trachea shifted" },
  { scen: "choking40", region: "head", clickLabel: "Look in the airway", expect: "Magill forceps" },
  { scen: "activeSeizureGTC", region: "head", clickLabel: "Look in the airway", expect: "secretions pooling" },
  { scen: "esophagealVaricesBleed", region: "head", clickLabel: "Look in the airway", expect: "vomiting again" },
];

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  const findings = [];

  for (const c of CASES) {
    consoleErrors.length = 0;
    await setState(page, {
      phase: "scene", gmode: "sandbox", scen: c.scen, level: "paramedic",
      t: 5, onSceneAt: 0, tab: "assess", region: c.region,
      pockets: ["scope"], exposed: { torso: true, head: true },
      speed: 12, done: {}, log: [],
    });
    await page.waitForTimeout(300);

    await clickText(page, c.clickLabel);
    await page.waitForTimeout(3500);

    let afterState = await getState(page);
    let lastLog = (afterState.log || []).slice(-6).map(l => l.text || "").join(" | ");
    // Retry once — an unprompted Tier-1/2 dialogue line can occasionally
    // render an overlapping element right as the click lands (a real,
    // already-documented test-harness flakiness class, not an app defect —
    // see this project's own tools/browser/README.md gotchas list), which
    // can eat the click without the action ever resolving.
    if (!lastLog.includes(c.expect)) {
      await clickText(page, c.clickLabel).catch(() => {});
      await page.waitForTimeout(3500);
      afterState = await getState(page);
      lastLog = (afterState.log || []).slice(-6).map(l => l.text || "").join(" | ");
    }
    if (lastLog.includes(c.expect)) {
      console.log(`PASS: ${c.scen} — authored override fired ("${c.expect}" found in log)`);
    } else {
      findings.push(`${c.scen}: expected "${c.expect}" in log, got: "${lastLog}"`);
    }
    const realErrors = consoleErrors.filter(e => !e.includes("LocalLLMProvider: model load failed"));
    if (realErrors.length) findings.push(`${c.scen}: console errors — ${realErrors.join(" | ")}`);
  }

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("All 4 renamed probe overrides (jvd/airwayLook) fire for real, zero console errors.");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

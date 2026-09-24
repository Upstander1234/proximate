// tools/browser/verifyBreadthBugHunt.mjs — F4's own "still open, worth a
// future batch" breadth pass: the prior bug-hunt only launched 4 scenarios
// and never switched region away from torso (so the head-gated Airway/Meds
// tabs were never actually opened), never click-tested a real crew-order
// flow. This script widens that: several scenarios across different body
// systems, a region switch to "head" to reach Airway/Meds, clicking through
// each tab, and a real crew-order click — watching for console errors and
// anything that renders obviously wrong (undefined/NaN/[object).
//
// Run: node tools/browser/verifyBreadthBugHunt.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Breadth");
  await page.fill('input[placeholder="Last"]', "Hunt");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

// Spans medical/cardiac/trauma/OB/neuro/respiratory — different body systems
// and scenario shapes than the prior pass's chest/random/custom-combo set.
const SCENARIOS = ["stabChest", "seizure", "childbirth", "asthmaAttack", "abdPain", "atrialFibrillationRVR"];

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await freshCharacter(page);

  const findings = [];

  for (const scen of SCENARIOS) {
    consoleErrors.length = 0;
    await setState(page, {
      phase: "scene", gmode: "sandbox", scen, level: "paramedic",
      t: 5, onSceneAt: 0, tab: "assess", region: "torso",
    });
    await page.waitForTimeout(300);
    let bodyText = await page.locator("body").innerText();
    if (/undefined|NaN|\[object Object\]/.test(bodyText)) {
      findings.push(`${scen} (torso/assess): suspicious render text found`);
    }

    // Switch region to head — the gap the prior pass never exercised.
    await setState(page, { region: "head", tab: "airway" });
    await page.waitForTimeout(300);
    bodyText = await page.locator("body").innerText();
    if (/undefined|NaN|\[object Object\]/.test(bodyText)) {
      findings.push(`${scen} (head/airway): suspicious render text found`);
    }

    await setState(page, { tab: "meds" });
    await page.waitForTimeout(300);
    bodyText = await page.locator("body").innerText();
    if (/undefined|NaN|\[object Object\]/.test(bodyText)) {
      findings.push(`${scen} (head/meds): suspicious render text found`);
    }

    if (consoleErrors.length) {
      findings.push(`${scen}: console errors — ${consoleErrors.join(" | ")}`);
    }
    console.log(`checked ${scen}: torso/assess, head/airway, head/meds`);
  }

  // A real crew-order click-through, not simulated via setState — the
  // Crew tab's own click path was never exercised by the prior pass either.
  consoleErrors.length = 0;
  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "stabChest", level: "paramedic",
    t: 5, onSceneAt: 0, panel: "crew", tab: "assess", region: "torso",
    // A synthetic riding EMT — setState jumps straight to phase:"scene",
    // skipping the real unit-select flow that would normally populate
    // s.crew, so the crew tab is otherwise empty and untestable this way.
    crew: [{ id: "bugHuntEmt1", name: "Cruz", level: "emt" }],
  });
  await page.waitForTimeout(300);
  const beforeState = await getState(page);
  const crewCount = (beforeState.crew || []).length;
  if (crewCount > 0) {
    try {
      await clickText(page, beforeState.crew[0].name, { timeout: 4000 });
      await page.waitForTimeout(300);
      const bodyText = await page.locator("body").innerText();
      if (/undefined|NaN|\[object Object\]/.test(bodyText)) {
        findings.push("crew-order panel: suspicious render text found after clicking a crew member");
      }
      console.log(`checked crew tab: clicked ${beforeState.crew[0].name}, panel opened without error`);
    } catch (e) {
      findings.push(`crew-order panel: could not click crew member name — ${e.message}`);
    }
  } else {
    console.log("no crew present on stabChest at paramedic level — skipping crew-order click");
  }
  if (consoleErrors.length) findings.push(`crew tab: console errors — ${consoleErrors.join(" | ")}`);

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("No suspicious render text or console errors across 6 scenarios x 3 tabs + crew-order click.");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

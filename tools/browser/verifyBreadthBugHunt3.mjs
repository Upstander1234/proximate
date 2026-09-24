// tools/browser/verifyBreadthBugHunt3.mjs — F4's own "still open" breadth
// pass, extended to a FOURTH fresh 6-scenario slice: three pediatric
// scenarios (age/weight-scaled physiology — infant/toddler-specific
// rendering edge cases none of the prior three passes exercised at all),
// a rare neuromuscular crisis, an endocrine crisis, and excited delirium
// (a combative/hyperthermic/superhuman-strength presentation — an unusual
// UI/behavior combination). Same method as the prior passes: torso/assess,
// head/airway, head/meds, head/procedures, watching for undefined/NaN/
// [object Object] and console errors.
//
// Run: node tools/browser/verifyBreadthBugHunt3.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="Last"]', "Three");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

const SCENARIOS = ["bronchiolitisInfant", "croupToddler", "febrileSeizureToddler",
  "myastheniaGravisCrisisCall", "addisonianCrisisCollapse", "excitedDeliriumAgitated"];

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await runChecks(page, consoleErrors);
  } finally {
    await browser.close();
  }
}

async function runChecks(page, consoleErrors) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
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

    await setState(page, { tab: "procedures" });
    await page.waitForTimeout(300);
    bodyText = await page.locator("body").innerText();
    if (/undefined|NaN|\[object Object\]/.test(bodyText)) {
      findings.push(`${scen} (head/procedures): suspicious render text found`);
    }

    if (consoleErrors.length) {
      const real = consoleErrors.filter(e => !e.includes("LocalLLMProvider: model load failed"));
      if (real.length) findings.push(`${scen}: console errors — ${real.join(" | ")}`);
    }
    console.log(`checked ${scen}: torso/assess, head/airway, head/meds, head/procedures`);
  }

  const afterState = await getState(page);
  if (!afterState || !afterState.scen) findings.push("final getState() looks empty/broken after the sweep");

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log(`No suspicious render text or console errors across ${SCENARIOS.length} scenarios x 4 tabs.`);
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

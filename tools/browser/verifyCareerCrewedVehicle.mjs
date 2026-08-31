// tools/browser/verifyCareerCrewedVehicle.mjs — direct follow-up to
// verifyCareerSetupWizard.mjs's own honest scope note: that script
// deliberately picked "On foot" (no vehicle, no crew requirement) to reach
// the end of the Career Mode setup chain without also depending on the
// recruit-crew hiring sub-flow. This script exercises exactly that
// skipped path: County EMS -> ALS ambulance (a real needsCrew:true rig,
// per App.jsx's `needsCrew=["ambBLS","ambALS","engine"].includes(veh.kind)`)
// -> hiring one real candidate from the generated recruit pool -> mode ->
// scope -> ready -> station, watching for undefined/NaN/[object Object]
// and console errors the whole way, plus a final check that the hired
// partner actually landed in g.roster.
//
// Run: node tools/browser/verifyCareerCrewedVehicle.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await runChecks(page, consoleErrors);
  } finally {
    await browser.close();
  }
}

async function checkBody(page, findings, label) {
  const bodyText = await page.locator("body").innerText();
  if (/undefined|NaN|\[object Object\]/.test(bodyText)) {
    findings.push(`${label}: suspicious render text found`);
  }
}

async function runChecks(page, consoleErrors) {
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    try { localStorage.clear(); } catch {}
    try { localStorage.setItem("proximate_tester_unlocked", "1"); } catch {}
  });

  const findings = [];

  await clickText(page, "Continue without AI");
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Crewed");
  await page.fill('input[placeholder="Last"]', "Vehicle");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);

  await clickText(page, "Career Mode");
  await waitForPhase(page, "learningMode", 5000);
  await clickText(page, "Master of Your Scope");
  await waitForPhase(page, "level", 5000);
  await clickText(page, "Paramedic");
  await waitForPhase(page, "department", 5000);

  // Not clickText() — see verifyCareerSetupWizard.mjs's own comment: the
  // department screen's descriptive paragraph repeats the department name
  // before the real button.
  await page.locator("button", { hasText: "County EMS" }).first().click();
  await waitForPhase(page, "vehicle", 5000);
  await checkBody(page, findings, "vehicle");

  const alsButton = page.locator("button", { hasText: "ALS ambulance" }).first();
  if (await alsButton.count() === 0) {
    findings.push('vehicle: no "ALS ambulance" button rendered for Paramedic/County EMS — check Fleet Settings defaults');
  } else {
    await alsButton.click();
    await waitForPhase(page, "partners", 5000);
    await checkBody(page, findings, "partners (before hire)");

    const preHireState = await getState(page);
    console.log(`vehicle: ${preHireState.myVeh?.name}, candidate pool size for this dept/level: (see Recruit button count below)`);

    const recruitCount = await page.locator("button:has-text('Recruit'):not([disabled])").count();
    if (recruitCount === 0) {
      findings.push("partners: no enabled \"Recruit\" button found — candidate pool may be empty or every candidate is unaffordable/seat-blocked");
    } else {
      await page.locator("button:has-text('Recruit'):not([disabled])").first().click();
      await checkBody(page, findings, "partners (after hire)");

      const postHireState = await getState(page);
      if ((postHireState.roster || []).length === 0) {
        findings.push("partners: clicked Recruit but g.roster is still empty afterward");
      } else {
        console.log(`PASS: hired a real partner — roster now: ${JSON.stringify(postHireState.roster.map(p => ({ name: p.name, level: p.level, student: p.student })))}`);
      }

      const continueBtn = page.locator('button:has-text("Continue")').first();
      const isDisabled = await continueBtn.isDisabled().catch(() => false);
      if (isDisabled) {
        findings.push("partners: Continue is still disabled after hiring a real crew member — needsCrew gate may not be reading the hire correctly");
      } else {
        await continueBtn.click();
        await waitForPhase(page, "mode", 5000);
        await checkBody(page, findings, "mode");

        await clickText(page, "City");
        await waitForPhase(page, "scope", 5000);
        await checkBody(page, findings, "scope");

        await page.locator("button", { hasText: "Ready" }).first().click();
        await waitForPhase(page, "ready", 5000);
        await checkBody(page, findings, "ready");

        await clickText(page, "Begin");
        await waitForPhase(page, "station", 5000);
        await checkBody(page, findings, "station");

        const finalState = await getState(page);
        if (!finalState.level || !finalState.department || !finalState.myVeh || !finalState.mode || !(finalState.roster || []).length) {
          findings.push(`station: setup finished with incomplete state — level=${finalState.level}, department=${finalState.department}, myVeh=${!!finalState.myVeh}, mode=${finalState.mode}, roster=${(finalState.roster || []).length}`);
        } else {
          console.log(`PASS: reached station crewed — level=${finalState.level}, department=${finalState.department}, vehicle=${finalState.myVeh?.name}, roster size=${finalState.roster.length}, scopeLocked=${finalState.scopeLocked}`);
        }
      }
    }
  }

  const realErrors = consoleErrors.filter(e =>
    !e.includes("LocalLLMProvider: model load failed") &&
    !e.includes("WasmLLMProvider: model load failed") &&
    !e.includes("net::ERR_CONNECTION_RESET"));
  if (realErrors.length) findings.push(`console errors — ${realErrors.join(" | ")}`);

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("Crewed-vehicle Career setup (recruit/hire sub-flow) completed clean, zero console errors.");
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

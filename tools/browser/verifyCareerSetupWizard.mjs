// tools/browser/verifyCareerSetupWizard.mjs — F4's own still-open item:
// "Career mode's own setup wizard (as opposed to Sandbox's)" had never
// been real-click-tested by any prior breadth pass. This walks the FULL
// Career Mode setup chain for real — gmodePick -> Career (tester-gated) ->
// learningMode (Master of Your Scope) -> level -> department -> vehicle ->
// partners -> mode -> scope -> ready -> station — watching for
// undefined/NaN/[object Object] render text and console errors at every
// step, plus a final sanity check that the resulting station state is
// coherent (level/department/vehicle/mode/scope all actually set).
//
// Run: node tools/browser/verifyCareerSetupWizard.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, getState, toTitleScreen } from "./driver.mjs";

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
    // Real, dev-accessible unlock (src/testerGate.js's own TESTER_KEY) —
    // the same flag a real tester's password entry sets, used here to skip
    // re-typing the password on every run rather than bypassing anything
    // the real gate doesn't already expose.
    try { localStorage.setItem("proximate_tester_unlocked", "1"); } catch {}
  });

  const findings = [];

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
  await page.fill('input[placeholder="First"]', "Career");
  await page.fill('input[placeholder="Last"]', "Setup");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
  await checkBody(page, findings, "gmodePick");

  await clickText(page, "Career Mode");
  await waitForPhase(page, "learningMode", 5000);
  await checkBody(page, findings, "learningMode");

  await clickText(page, "Master of Your Scope");
  await waitForPhase(page, "level", 5000);
  await checkBody(page, findings, "level");

  await clickText(page, "Paramedic");
  await waitForPhase(page, "department", 5000);
  await checkBody(page, findings, "department");

  const deptState = await getState(page);
  if (!deptState.level) findings.push("department: g.level never got set by the level-pick click");

  // Click whichever department button actually rendered — the exact set
  // depends on DEFAULT_ALLOWED_DEPARTMENTS/Fleet Settings, not fixed.
  const deptButtons = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button")).map(b => b.textContent).filter(Boolean));
  const knownDepts = ["Fire Dept", "County EMS", "Private EMS", "Police Dept", "Sheriff's Office", "Campus PD", "Volunteer Agency", "Flight EMS"];
  // Button text is concatenated with no whitespace against the vehicle-list
  // subtext ("Fire DeptFire engine · Rescue truck..."), so match by prefix,
  // not exact equality.
  const deptToClick = knownDepts.find(d => deptButtons.some(t => t.startsWith(d)));
  if (!deptToClick) {
    findings.push(`department: none of the expected department buttons rendered — saw: ${JSON.stringify(deptButtons)}`);
  } else {
    // Not clickText() here — the department NAME also appears in this
    // screen's own descriptive paragraph ("a Fire Dept medic isn't rolling
    // up..."), which getByText().first() would match before the real
    // button, clicking inert text and silently doing nothing. Scope to an
    // actual <button> instead.
    await page.locator("button", { hasText: deptToClick }).first().click();
    await waitForPhase(page, "vehicle", 5000);
    await checkBody(page, findings, "vehicle");

    const onFootAvailable = await page.locator("text=On foot").count();
    if (onFootAvailable > 0) {
      await clickText(page, "On foot");
    } else {
      // No "On foot" option for this department/level combo — fall back to
      // whatever the FIRST real vehicle button is.
      const vehButtons = await page.evaluate(() =>
        Array.from(document.querySelectorAll("button")).map(b => b.textContent).filter(t => t && t.includes("seat")));
      if (vehButtons.length === 0) findings.push("vehicle: no vehicle option (including 'On foot') was clickable");
      else await page.locator(`button:has-text("${vehButtons[0].split("·")[0].trim()}")`).first().click().catch(() => {});
    }
    await waitForPhase(page, "partners", 5000);
    await checkBody(page, findings, "partners");

    const partnersState = await getState(page);
    console.log(`vehicle picked: ${partnersState.myVeh?.name}, needs-crew roster length: ${(partnersState.roster||[]).length}`);

    const continueBtn = page.locator('button:has-text("Continue")').first();
    const isDisabled = await continueBtn.isDisabled().catch(() => false);
    if (isDisabled) {
      findings.push(`partners: Continue button is disabled (this rig needs crew and none is hired) — vehicle=${partnersState.myVeh?.name}`);
    } else {
      await continueBtn.click();
      await waitForPhase(page, "mode", 5000);
      await checkBody(page, findings, "mode");

      await clickText(page, "City");
      await waitForPhase(page, "scope", 5000);
      await checkBody(page, findings, "scope");

      // Not clickText() — the scope screen's own descriptive paragraph
      // ("Once you press Ready below...") contains the substring "Ready"
      // and appears before the real button in DOM order, same trap as the
      // department screen above.
      await page.locator("button", { hasText: "Ready" }).first().click();
      await waitForPhase(page, "ready", 5000);
      await checkBody(page, findings, "ready");

      await clickText(page, "Begin");
      await waitForPhase(page, "station", 5000);
      await checkBody(page, findings, "station");

      const finalState = await getState(page);
      if (!finalState.level || !finalState.department || !finalState.myVeh || !finalState.mode) {
        findings.push(`station: setup wizard finished with incomplete state — level=${finalState.level}, department=${finalState.department}, myVeh=${!!finalState.myVeh}, mode=${finalState.mode}`);
      } else {
        console.log(`PASS: reached station with level=${finalState.level}, department=${finalState.department}, vehicle=${finalState.myVeh?.name}, mode=${finalState.mode}, scopeLocked=${finalState.scopeLocked}`);
      }
    }
  }

  // Both are the same already-documented, expected "no real network/GPU in
  // this environment" F0 noise — LocalLLMProvider (WebGPU) and
  // WasmLLMProvider (its fallback) both log a classified failure on
  // purpose; neither is a regression this script introduced.
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
    console.log("Full Career Mode setup wizard (Master of Your Scope path) completed clean, zero console errors.");
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

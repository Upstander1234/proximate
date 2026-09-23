// tools/browser/verifyMonitorScreenMinigame.mjs — Hyper-realism pass, Batch 3:
// aedAnalyze/aedShock/defib/cardiovert/pacing now open a real device screen
// (MonitorScreenMinigame.jsx) instead of ProcMinigame's old shared generic
// torso+pads scene. Confirms, via real clicks against injected minigame
// state (the same state-injection pattern this project's own tooling
// documents for reaching a deep screen — driver.mjs's own header comment):
//   - aedAnalyze at BLS scope shows a screenless banner-only flow (no
//     device-screen "ECG II" trace label), analyzes, and resolves.
//   - aedShock at paramedic scope shows a real rhythm trace and gates the
//     shock button behind the clear checklist.
//   - defib reflects the monitor panel's own charge state in its energy
//     readout.
//   - cardiovert draws a real sync-marker overlay once SYNC is enabled —
//     the exact "never drawn" gap this batch closes.
//   - pacing shows a capture indicator once mA/pulse-check pass.
//
// Run: node tools/browser/verifyMonitorScreenMinigame.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const findings = [];
const ok = (msg) => console.log("PASS: " + msg);
const bad = (msg) => { findings.push(msg); console.log("FAIL: " + msg); };

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  const playLink = page.getByText("Play →", { exact: false }).first();
  if (await playLink.count()) await playLink.click({ timeout: 10000 });
  const creditsContinue = page.getByText("Continue", { exact: true }).first();
  if (await creditsContinue.count().catch(() => 0)) await creditsContinue.click({ timeout: 5000 }).catch(() => {});
  await clickText(page, "CONTINUE WITHOUT AI");
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Monitor");
  await page.fill('input[placeholder="Last"]', "Screen");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function openMinigame(page, { procId, screenType, level = "paramedic", extra = {} }) {
  // Force a real unmount/remount of the minigame component between calls —
  // in real play the modal always fully closes (accessMinigame -> null)
  // between separate procedures; jumping directly from one procId to
  // another via state injection without this step would leave the SAME
  // mounted component instance holding stale internal useState (phase,
  // clear, sync...) from the PREVIOUS procedure, which real gameplay never
  // does since the modal always closes first.
  await setState(page, { accessMinigame: null, busy: null });
  await page.waitForTimeout(150);
  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "cardiogenicShock", level, t: 5, onSceneAt: 0,
    tab: "procedures", region: "torso", bags: ["monitor"], exposed: { torso: true }, speed: 12,
    accessMinigame: { action: { id: procId }, kind: "monitor", site: "torso", procId, procName: procId, screenType, attempts: 0, alertBaseline: 0 },
    ...extra,
  });
  await page.waitForTimeout(400);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await freshCharacter(page);

    // 1. aedAnalyze, BLS scope -> screenless banner-only flow.
    await openMinigame(page, { procId: "aedAnalyze", screenType: "aedBasic", level: "emt" });
    const bodyBasic = await page.evaluate(() => document.body.innerText);
    if (bodyBasic.includes("ECG II")) bad(`aedBasic still shows the device-screen rhythm label — should be banner-only. Body: ${bodyBasic.slice(0, 300)}`);
    else ok("aedBasic (screenless AED) shows no rhythm-trace screen.");
    const startBtn = page.locator("button", { hasText: "Start analysis" }).first();
    if (await startBtn.count()) {
      await startBtn.click({ timeout: 5000 });
      await page.waitForTimeout(1900);
      // First "Continue" (inside body()) commits win() and reveals the
      // shared flash/confirmation panel, which has its OWN "Continue" that
      // actually calls onResolve — two sequential buttons with the same
      // label, matching every other minigame's flash-confirmation pattern.
      await page.locator("button", { hasText: "Continue" }).first().click({ timeout: 5000 });
      await page.waitForTimeout(300);
      await page.locator("button", { hasText: "Continue" }).first().click({ timeout: 5000 });
      await page.waitForTimeout(500);
      const s1 = await getState(page);
      if (s1.accessMinigame) bad("aedAnalyze minigame did not close after Continue.");
      else ok("aedAnalyze (screenless) completes end to end.");
    } else bad('"Start analysis" button not found for aedAnalyze.');

    // 2. aedShock, paramedic scope -> real screen, clear-checklist gating.
    await openMinigame(page, { procId: "aedShock", screenType: "aedScreen" });
    const bodyShock = await page.evaluate(() => document.body.innerText);
    if (!bodyShock.includes("ECG II")) bad(`aedScreen (paramedic AED-mode) should show a rhythm-trace screen. Body: ${bodyShock.slice(0, 300)}`);
    else ok("aedScreen renders the real rhythm trace.");
    const shockBtn = page.locator("button", { hasText: "DELIVER SHOCK" }).first();
    if (await shockBtn.count()) {
      const disabledBefore = await shockBtn.isDisabled();
      if (!disabledBefore) bad("Shock button was NOT disabled before the clear checklist was completed.");
      else ok("shock is gated behind the clear checklist before it's complete.");
      await page.locator("button", { hasText: "Hands off" }).first().click({ timeout: 5000 });
      await page.locator("button", { hasText: "Oxygen moved away" }).first().click({ timeout: 5000 });
      await page.locator("button", { hasText: "Call it:" }).first().click({ timeout: 5000 });
      await page.waitForTimeout(300);
      const disabledAfter = await shockBtn.isDisabled();
      if (disabledAfter) bad("Shock button still disabled after the clear checklist was completed.");
      else ok("shock becomes available once the clear checklist is complete.");
    } else bad('"DELIVER SHOCK" button not found for aedShock.');

    // 3. defib — energy readout reflects the monitor panel's own charge state.
    await openMinigame(page, { procId: "defib", screenType: "monitorDefib", extra: { defib: { energy: 200, charged: true } } });
    const bodyDefib = await page.evaluate(() => document.body.innerText);
    if (!/200 J/.test(bodyDefib)) bad(`defib screen should show the real charged energy "200 J". Body: ${bodyDefib.slice(0, 300)}`);
    else ok("defib screen reflects the real charged energy (200 J) from the monitor panel.");

    // 4. cardiovert — a real sync marker is drawn once SYNC is enabled.
    await openMinigame(page, { procId: "cardiovert", screenType: "monitorDefib" });
    const syncBtn = page.locator("button", { hasText: "Enable SYNC mode" }).first();
    if (await syncBtn.count()) {
      await syncBtn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      const markerCount = await page.locator("polygon").count();
      if (markerCount === 0) bad("No sync-marker <polygon> elements drawn after enabling SYNC mode — the exact gap this batch was meant to close.");
      else ok(`cardioversion draws real sync markers on the trace (${markerCount} found).`);
    } else bad('"Enable SYNC mode" button not found for cardiovert.');

    // 5. pacing — capture indicator appears once mA/pulse-check pass.
    await openMinigame(page, { procId: "pacing", screenType: "monitorDefib" });
    const apBtn = page.locator("button", { hasText: "Anterior-posterior" }).first();
    if (await apBtn.count()) {
      await apBtn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      const sliders = page.locator('input[type="range"]');
      const sliderCount = await sliders.count();
      if (sliderCount >= 2) {
        await sliders.nth(1).fill("80");
        await page.waitForTimeout(200);
        await page.locator("button", { hasText: "Check for a pulse" }).first().click({ timeout: 5000 });
        await page.waitForTimeout(300);
        const bodyPace = await page.evaluate(() => document.body.innerText);
        if (!/CAPTURED/.test(bodyPace)) bad(`Pacing screen should show a CAPTURED indicator. Body: ${bodyPace.slice(0, 300)}`);
        else ok("pacing screen shows a real CAPTURED indicator once mA/pulse-check pass.");
      } else bad(`Expected at least 2 range sliders on the pacing screen, found ${sliderCount}.`);
    } else bad('"Anterior-posterior" button not found for pacing.');

    if (consoleErrors.length) bad(`console errors — ${consoleErrors.join(" | ")}`);

    console.log("\n--- RESULTS ---");
    if (findings.length) {
      console.log(`${findings.length} FINDING(S):`);
      findings.forEach(f => console.log(" - " + f));
      process.exitCode = 1;
    } else {
      console.log("All five AED/monitor procedures render and interact correctly through MonitorScreenMinigame.");
    }
  } finally {
    await browser.close();
  }
}

const hardDeadline = setTimeout(() => {
  console.error("FAIL: hard timeout — something hung without throwing.");
  process.exit(1);
}, 60000);

main()
  .catch((err) => { console.error("FAIL:", err); process.exitCode = 1; })
  .finally(() => { clearTimeout(hardDeadline); });

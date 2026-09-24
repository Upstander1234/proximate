// tools/browser/verifyCardiacHeartProbeLive.mjs — F7 standing workstream:
// six ACS-family scenarios' probes.heart (ami, chestPainM, chestPainF, acs,
// unstableAngina, nstemi) had a hardcoded rate description ("Rate is fast",
// "Regular, a bit fast", etc.) instead of reading live v.hr, the same defect
// the prior batch fixed for stableAngina/the cardiac-arrhythmia scenarios
// ("surfacing nitro's real reflex tachycardia instead of hiding it"). Now
// all six read v.hr live. This clicks the real "Auscultate heart sounds"
// action for each and confirms the logged text embeds a number matching the
// live patient's actual heart rate at click time — not a fixed word like
// "fast".
//
// Run: node tools/browser/verifyCardiacHeartProbeLive.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Heart");
  await page.fill('input[placeholder="Last"]', "Probe");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

const SCENARIOS = ["ami", "chestPainM", "chestPainF", "acs", "unstableAngina", "nstemi"];

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  const findings = [];

  for (const scen of SCENARIOS) {
    consoleErrors.length = 0;
    await setState(page, {
      phase: "scene", gmode: "sandbox", scen, level: "paramedic",
      t: 5, onSceneAt: 0, tab: "assess", region: "torso",
      // The heart probe is gated behind pocket:"scope" (a stethoscope,
      // g.pockets defaults to [] on a fresh setState jump) AND the torso
      // being exposed (CLOTH_LOCK hides chest-region actions entirely,
      // not just disables them, until g.exposed.torso is set) — neither
      // is populated by jumping straight into phase:"scene" via setState;
      // both are normally set by the real undress/expose action flow.
      pockets: ["scope"], exposed: { torso: true },
      // The action's own 25 (sim-second) cost only resolves once real sim
      // time actually advances that far — the tick loop advances s.t by
      // 0.1*speed per ~100ms real tick, so at speed:1 a 25s action takes
      // ~25 real seconds. Speed the clock up so the busy timer clears fast.
      speed: 12,
    });
    await page.waitForTimeout(300);

    await clickText(page, "Auscultate heart sounds");
    // The action now opens the free-placement AuscultationMinigame modal;
    // finishing it is what resolves the action and logs the engine's finding.
    await page.waitForTimeout(1500);
    if (await page.getByText("Finish listening").count()) await clickText(page, "Finish listening");
    await page.waitForTimeout(3500);

    const afterState = await getState(page);
    const lastLog = (afterState.log || []).slice(-6).map(l => l.text || "").join(" | ");
    // Read hr AFTER the action resolves — the probe fires at completion
    // time, and 25 sim-seconds at speed:12 can genuinely move the rate.
    const liveHr = afterState.patient?.hr;
    if (liveHr == null) { findings.push(`${scen}: no live patient.hr found in state`); continue; }
    const hrRounded = Math.round(liveHr);
    // Allow the tick loop to have moved hr by a beat or two between the
    // read and the click resolving — check a small window, not exact equality.
    const found = [hrRounded, hrRounded - 1, hrRounded + 1, hrRounded - 2, hrRounded + 2]
      .some(n => lastLog.includes(String(n)));
    if (!found) {
      findings.push(`${scen}: expected a number near live hr=${hrRounded} in log, got: "${lastLog}"`);
    } else {
      console.log(`PASS: ${scen} heart probe logged a live rate near hr=${hrRounded}`);
    }
    if (consoleErrors.length) findings.push(`${scen}: console errors — ${consoleErrors.join(" | ")}`);
  }

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("All 6 ACS-family heart probes read live v.hr, zero console errors.");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

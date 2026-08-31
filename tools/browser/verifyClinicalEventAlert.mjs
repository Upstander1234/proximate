// tools/browser/verifyClinicalEventAlert.mjs — real setState verification of
// the "visible emergent clinical event" popup: a physiology-driven edge
// (seizure onset, loss of responsiveness) or a scenario's own scripted
// crit-kind `events` fire should each push a real, on-screen alert
// (ClinicalEventAlert.jsx, fed by g.eventAlertQueue) that a player can't
// easily miss the way a scrolling-log line can be missed.
//
// Run: node tools/browser/verifyClinicalEventAlert.mjs   (needs `npm run dev`)

import { launch, clickText, getState, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5174";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Event");
  await page.fill('input[placeholder="Last"]', "Alert");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // Directly inject an already-queued alert — the cheapest, most direct way
  // to prove the QUEUE -> UI rendering path works, independent of the tick
  // loop's own edge-detection timing.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 0, tab: "assess",
      eventAlertQueue: [{ id: "test1", text: "The patient begins seizing." }],
    });
  });
  await page.waitForTimeout(400);
  let bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("The patient begins seizing.")) throw new Error("Expected the queued alert to render on screen");
  console.log("PASS: a queued eventAlertQueue entry renders as a real on-screen alert");

  // Clicking the alert dismisses it immediately (not waiting the full 6.5s).
  await page.click('[role="alert"]');
  await page.waitForTimeout(200);
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes("The patient begins seizing.")) throw new Error("Expected click-to-dismiss to clear the alert");
  console.log("PASS: clicking the alert dismisses it");

  // Now the real thing: seed a patient who starts NOT seizing, then flip
  // pat.seizing true via a raw physio mutate and let the tick loop's own
  // edge-detection (App.jsx) pick it up on its own, unassisted.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 4, tab: "assess", eventAlertQueue: [], speed: 1,
      _seizingFlag: false, _unresponsiveFlag: false,
    });
  });
  await page.waitForTimeout(300);
  // Force pat.seizing true on the live patient instance the tick loop reads.
  const forced = await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    if (!s.patient) return false;
    s.patient.seizing = true;
    return true;
  });
  if (!forced) throw new Error("Expected a live s.patient to exist to mutate");
  // Give the 100ms tick loop a couple of cycles to notice the edge.
  await page.waitForTimeout(500);
  bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("The patient begins seizing.")) throw new Error("Expected the tick loop's own edge-detection to fire a seizure alert");
  console.log("PASS: real physiology (pat.seizing flipping true) triggers the alert via the tick loop, unassisted");

  if (consoleErrors.length) {
    console.error("Console errors:", consoleErrors);
    process.exitCode = 1;
  } else {
    console.log("\nALL CHECKS PASSED, zero console errors");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

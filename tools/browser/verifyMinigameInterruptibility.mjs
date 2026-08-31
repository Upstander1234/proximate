// tools/browser/verifyMinigameInterruptibility.mjs — real-click verification
// of Spec 2.5's option (a): sim time (and physiology) no longer freezes while
// a procedure mini-game modal is open, and a real patient-condition change
// mid-attempt surfaces a genuine "Abandon" escape hatch (PROCEDURE_OUTCOME.
// ABORTED) distinct from "Cancel attempt".
//
// Run: node tools/browser/verifyMinigameInterruptibility.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState, getState } from "./driver.mjs";

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
  await page.fill('input[placeholder="First"]', "Interrupt");
  await page.fill('input[placeholder="Last"]', "Test");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
    t: 5, onSceneAt: 0, tab: "procedures",
    accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" },
      kind: "iv", site: "armR", attempts: 0, alertBaseline: 0 },
  });
  await page.waitForTimeout(300);

  // 1. Sim time must keep advancing while the mini-game is open — the whole
  // point of spec 2.5. Read s.t twice, a real interval apart.
  const t1 = (await getState(page)).t;
  await page.waitForTimeout(1200);
  const t2 = (await getState(page)).t;
  if (!(t2 > t1)) throw new Error(`Expected sim time to keep advancing during an open mini-game (t1=${t1}, t2=${t2})`);
  console.log(`PASS: sim time advances while a mini-game is open (${t1} -> ${t2})`);

  // 2. Force a real, visible edge (seizure onset) while the mini-game is
  // still open — the same two-field gotcha this project's own tooling notes
  // documents (pat.epilepticDrive=1 AND pat.seizing=true together).
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    if (s.patient) { s.patient.epilepticDrive = 1; s.patient.seizing = true; }
  });
  await page.waitForTimeout(1500);

  const afterEdge = await getState(page);
  if (!(afterEdge.eventAlertQueue || []).some(e => /seizing/i.test(e.text))) {
    throw new Error("Expected a real 'begins seizing' alert to queue while the mini-game stayed open");
  }
  console.log("PASS: a real physiology edge fires eventAlertQueue while a mini-game is still open");

  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("condition just changed")) throw new Error("Expected the in-modal interrupt banner to appear");
  if (!bodyText.includes("Abandon")) throw new Error("Expected an Abandon button to appear once interrupted");
  console.log("PASS: the mini-game surfaces the interrupt banner and Abandon button");

  // 3. Abandon must resolve for free (no accessAttempts increment), close
  // the mini-game, and log a distinct message from a plain cancel.
  await clickText(page, "Abandon — attend to the patient");
  await page.waitForTimeout(300);
  const afterAbandon = await getState(page);
  if (afterAbandon.accessMinigame) throw new Error("Expected accessMinigame to close after Abandon");
  if ((afterAbandon.accessAttempts?.["iv@armR"] || 0) !== 0) throw new Error("Abandon should not count as a failed attempt");
  if (!afterAbandon.log.some(l => /abandoned.*condition changed/i.test(l.text))) {
    throw new Error("Expected a distinct 'abandoned — condition changed' log entry");
  }
  console.log("PASS: Abandon closes the mini-game for free with a distinct log entry");

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

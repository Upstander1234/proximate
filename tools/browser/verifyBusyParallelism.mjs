// tools/browser/verifyBusyParallelism.mjs — real-click + setState
// verification of the "Procedure Gameplay" fix: while the player's own
// busy-timer procedure is running (g.busy), ASSESS and GENERAL tab actions
// remain clickable (real interaction with the patient/crew/monitor/
// environment continues), while AIRWAY/PROCEDURES/MEDS tabs — anything
// requiring the player's own hands — stay correctly blocked, matching how
// two hands-on tasks can't really happen at once.
//
// Run: node tools/browser/verifyBusyParallelism.mjs   (needs `npm run dev`)

import { launch, clickText, getState, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

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
  await page.fill('input[placeholder="First"]', "Busy");
  await page.fill('input[placeholder="Last"]', "Check");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // Drop straight into a live scene with a fabricated busy-timer already
  // running (simulating "mid-procedure"), on the assess tab. The `fn`
  // closure can't cross the page.evaluate serialization boundary as a Node
  // function, so it's constructed IN the browser context instead.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 0, tab: "assess", region: "torso", panel: "actions",
      busy: { id: "directPressure", doneKey: "directPressure", label: "Applying pressure", dur: 30, left: 20, fn: () => ({}), commit: false },
    });
  });
  await page.waitForTimeout(500);

  const s1 = await getState(page);
  if (s1.phase !== "scene") throw new Error(`Expected scene phase, got ${s1.phase}`);

  // ASSESS tab: at least one real, clickable (non-disabled) action button
  // should be present even though g.busy is set.
  const assessButtons = await page.locator('[data-tutorial-id="actions"] button:not([disabled])').count();
  if (assessButtons < 1) throw new Error(`Expected at least one enabled action on ASSESS tab while busy, found ${assessButtons}`);
  console.log(`PASS: ASSESS tab shows ${assessButtons} clickable action(s) while a procedure is busy`);

  // Confirm the busy banner itself is showing (sanity: we really are "busy").
  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("Applying pressure")) throw new Error("Expected the busy-timer banner to be visible");
  if (!bodyText.includes("you can still ask, listen, watch the monitor")) throw new Error("Expected the updated busy-banner copy");
  console.log("PASS: busy-timer banner shows updated 'still interact' copy");

  // Switch to PROCEDURES tab — should still be blocked ("Hands full").
  await page.evaluate((st) => window.__proximateTestSetState(st), { tab: "procedures" });
  await page.waitForTimeout(300);
  const procButtons = await page.locator('[data-tutorial-id="actions"] button:not([disabled])').count();
  if (procButtons > 0) throw new Error(`Expected ZERO clickable actions on PROCEDURES tab while busy, found ${procButtons}`);
  const procText = await page.locator("body").innerText();
  if (!procText.includes("Hands full")) throw new Error("Expected 'Hands full' messaging on the blocked PROCEDURES tab");
  console.log("PASS: PROCEDURES tab stays correctly blocked (0 clickable actions, 'Hands full' shown) while busy");

  // Switch to GENERAL tab — should also remain free.
  await page.evaluate((st) => window.__proximateTestSetState(st), { tab: "general" });
  await page.waitForTimeout(300);
  const generalButtons = await page.locator('[data-tutorial-id="actions"] button:not([disabled])').count();
  if (generalButtons < 1) throw new Error(`Expected at least one enabled action on GENERAL tab while busy, found ${generalButtons}`);
  console.log(`PASS: GENERAL tab shows ${generalButtons} clickable action(s) while a procedure is busy`);

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

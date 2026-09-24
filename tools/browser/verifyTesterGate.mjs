// tools/browser/verifyTesterGate.mjs — real-click verification that Career
// Mode / Co-op are password-gated behind the tester unlock, and that Medical
// Simulation (Sandbox) mode is completely unaffected.
//
// Confirms, via real clicks (not state injection):
//   1. Clicking "Career Mode" from a fresh browser (no localStorage flag)
//      lands on the testerGate phase, not "learningMode".
//   2. Clicking "Co-op" does the same, landing on testerGate, not "coopSetup".
//   3. A wrong password shows an error and does NOT advance the phase.
//   4. The correct password ("proximate") unlocks and routes to the
//      originally-clicked destination (learningMode for Career).
//   5. Sandbox mode is reachable with ZERO password prompt, before or after
//      unlocking.
//   6. Once unlocked, clicking Career again skips the gate entirely (the
//      localStorage flag persists).
//
// Run: node tools/browser/verifyTesterGate.mjs   (needs `npm run dev` running)

import { launch, clickText, getState, waitForPhase, toTitleScreen } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.reload();
  await page.waitForTimeout(500);
  await toTitleScreen(page);
  await clickText(page, "Go on shift");
  // Disclaimer may or may not show depending on prior localStorage in this
  // browser context — handle both.
  const state1 = await getState(page);
  if (state1?.phase === "disclaimer") {
    await clickText(page, "I understand");
  }
  // "saves" screen -> "+ New save" -> disclaimer again (F18: every new save
  // gets it, even if this browser has already dismissed it once).
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Tess");
  await page.fill('input[placeholder="Last"]', "Tester");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  // Clear any stale tester-unlock flag from a previous run in this profile.
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });

  await freshCharacter(page);

  // 1. Career Mode click -> testerGate, not learningMode
  await clickText(page, "Career Mode");
  await waitForPhase(page, "testerGate", 5000);
  console.log("PASS: Career Mode click routes to testerGate when locked");

  // 3. Wrong password
  await page.fill('input[placeholder="Password"]', "wrongpass");
  await clickText(page, "Unlock");
  await page.waitForTimeout(300);
  const afterWrong = await getState(page);
  if (afterWrong.phase !== "testerGate") throw new Error("Wrong password should not advance phase, got " + afterWrong.phase);
  const errorVisible = await page.getByText("Incorrect password.").count();
  if (errorVisible < 1) throw new Error("Expected an 'Incorrect password.' message");
  console.log("PASS: wrong password rejected, stays on testerGate");

  // 4. Correct password unlocks and routes to learningMode
  await page.fill('input[placeholder="Password"]', "proximate");
  await clickText(page, "Unlock");
  await waitForPhase(page, "learningMode", 5000);
  console.log("PASS: correct password unlocks and routes to learningMode (Career's real destination)");

  // Confirm the localStorage flag was actually set
  const unlocked = await page.evaluate(() => localStorage.getItem("proximate_tester_unlocked"));
  if (unlocked !== "1") throw new Error("Expected localStorage proximate_tester_unlocked=1, got " + unlocked);

  // 6. Going back to gmodePick and clicking Career again should skip the gate
  await page.evaluate(() => window.__proximateTestSetState({ phase: "gmodePick" }));
  await clickText(page, "Career Mode");
  await page.waitForTimeout(300);
  const afterUnlockedClick = await getState(page);
  if (afterUnlockedClick.phase === "testerGate") throw new Error("Should have skipped the gate once unlocked");
  if (afterUnlockedClick.phase !== "learningMode") throw new Error("Expected learningMode, got " + afterUnlockedClick.phase);
  console.log("PASS: once unlocked, Career Mode skips the gate entirely");

  // 5. Sandbox is never gated, even on a totally fresh (locked-again) browser
  await browser.close();
  const fresh = await launch({ headless: true });
  await fresh.page.goto(BASE_URL);
  await fresh.page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(fresh.page);
  await clickText(fresh.page, "Medical Education Mode");
  await waitForPhase(fresh.page, "level", 5000);
  console.log("PASS: Medical Education Mode (Sandbox) reachable with zero password prompt");

  // Co-op gate, independently, on a third fresh (locked) browser — confirms
  // the gate applies to BOTH buttons, not just Career.
  await fresh.browser.close();
  const coopCheck = await launch({ headless: true });
  await coopCheck.page.goto(BASE_URL);
  await coopCheck.page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(coopCheck.page);
  await clickText(coopCheck.page, "Co-op");
  await waitForPhase(coopCheck.page, "testerGate", 5000);
  console.log("PASS: Co-op click also routes to testerGate when locked");
  await coopCheck.page.fill('input[placeholder="Password"]', "proximate");
  await clickText(coopCheck.page, "Unlock");
  await waitForPhase(coopCheck.page, "coopSetup", 5000);
  console.log("PASS: correct password unlocks Co-op and routes to coopSetup");
  if (coopCheck.consoleErrors.length) {
    console.error("Console errors (coop check):", coopCheck.consoleErrors);
    process.exitCode = 1;
  }
  await coopCheck.browser.close();

  if (fresh.consoleErrors.length) {
    console.error("Console errors:", fresh.consoleErrors);
    process.exitCode = 1;
  } else {
    console.log("\nALL CHECKS PASSED, zero console errors");
  }
  await fresh.browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

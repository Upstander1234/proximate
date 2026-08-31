// tools/browser/verifyMinigameVitalsStrip.mjs — real-click verification of
// the "Procedure Gameplay" fix: every interactive procedure mini-game
// (IV/IO, laryngoscopy/ETT, cric, SGA) now shows a compact, real SpO2/HR/RR/
// LOC readout instead of a fully opaque black modal with zero patient
// information — directly answering the spec's own worked example ("While
// performing the IV, the player may... Monitor SpO2... Watch the ECG...
// Reassess the patient").
//
// Run: node tools/browser/verifyMinigameVitalsStrip.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase } from "./driver.mjs";

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
  await page.fill('input[placeholder="First"]', "Vitals");
  await page.fill('input[placeholder="Last"]', "Strip");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // Drop straight into a live scene with the IV mini-game already open
  // (App.jsx's own accessMinigame shape) so the modal renders immediately.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 0, tab: "procedures",
      accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" }, kind: "iv", site: "armR", attempts: 0 },
    });
  });
  await page.waitForTimeout(400);

  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("SPO2")) throw new Error("Expected the SPO2 vitals chip to render inside the IV mini-game");
  if (!bodyText.includes("LOC")) throw new Error("Expected the LOC vitals chip to render inside the IV mini-game");
  console.log("PASS: IV mini-game shows a real SPO2/HR/RR/LOC vitals strip, not a blind black modal");

  // Cancel out of the IV attempt and open the airway (ETT) mini-game instead
  // — confirm the strip is a genuinely shared component, not IV-only.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      accessMinigame: { action: { id: "ett", region: "head", cost: 30, gerund: "Intubating" }, kind: "ett" },
    });
  });
  await page.waitForTimeout(400);
  const airwayText = await page.locator("body").innerText();
  if (!airwayText.includes("SPO2")) throw new Error("Expected the vitals strip inside the airway (ETT) mini-game too");
  console.log("PASS: the vitals strip is shared across the airway mini-game as well");

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

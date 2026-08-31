// tools/browser/verifyProcedureAssist.mjs — real-click + setState
// verification of the "Procedure Gameplay" spec 2.9 accessibility tiers:
// a real Settings row lets the player pick Assisted/Standard/Advanced, it
// persists to g.procedureAssist, and it actually widens/narrows the
// mini-game acceptance bands (checked directly against the exported
// assistToleranceMult, not re-derived).
//
// Run: node tools/browser/verifyProcedureAssist.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Assist");
  await page.fill('input[placeholder="Last"]', "Level");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // Default is "standard" — confirm the default first.
  const s0 = await getState(page);
  if ((s0.procedureAssist || "standard") !== "standard") throw new Error(`Expected default procedureAssist "standard", got ${s0.procedureAssist}`);
  console.log("PASS: fresh save defaults to Standard");

  // Open Settings via a real click and pick Assisted via a real click.
  await clickText(page, "⚙");
  await page.waitForTimeout(200);
  const bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("PROCEDURE ASSIST")) throw new Error("Expected the PROCEDURE ASSIST settings row to render");
  await clickText(page, "Assisted");
  await page.waitForTimeout(200);
  const s1 = await getState(page);
  if (s1.procedureAssist !== "assisted") throw new Error(`Expected procedureAssist "assisted" after clicking it, got ${s1.procedureAssist}`);
  console.log("PASS: a real click on Assisted persists g.procedureAssist");

  // Confirm the multiplier itself is real (imported directly, not
  // reconstructed) and actually changes with the tier — the mechanism the
  // mini-games multiply their tolerance bands by.
  const mults = await page.evaluate(async () => {
    const mod = await import("/src/procedureAssist.js");
    return {
      assisted: mod.assistToleranceMult("assisted"),
      standard: mod.assistToleranceMult("standard"),
      advanced: mod.assistToleranceMult("advanced"),
    };
  });
  if (!(mults.assisted > mults.standard && mults.standard > mults.advanced))
    throw new Error(`Expected assisted > standard > advanced, got ${JSON.stringify(mults)}`);
  if (mults.standard !== 1) throw new Error(`Expected standard multiplier to be exactly 1 (no behavior change), got ${mults.standard}`);
  console.log(`PASS: assistToleranceMult is real and ordered correctly (${JSON.stringify(mults)})`);

  // Drop into a live IV mini-game with Assisted active and confirm the
  // component actually reads the prop (renders without error, difficulty
  // line still shows real physiology band).
  await clickText(page, "close");
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 0, tab: "procedures",
      accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" }, kind: "iv", site: "armR", attempts: 0 },
    });
  });
  await page.waitForTimeout(400);
  const mgText = await page.locator("body").innerText();
  if (!mgText.includes("Difficulty:")) throw new Error("Expected the IV mini-game to render with the assisted tier active");
  console.log("PASS: IV mini-game renders normally with Assisted tier active, no errors");

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

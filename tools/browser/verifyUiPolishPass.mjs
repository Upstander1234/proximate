// tools/browser/verifyUiPolishPass.mjs — rendered UI inspection for the
// UI/UX polish pass (design-token remap, StatsTab hierarchy fix, Education
// tab-nav overflow fix, AuscultationPracticeTab category-badge color fix).
// Screenshots the surfaces named in the plan's verification section at both
// a desktop and mobile width. Read-only inspection, no assertions beyond
// "no console errors" — the actual visual judgment happens by looking at
// the screenshots.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyUiPolishPass.mjs`.

import { launch, clickText, setState, getState, toTitleScreen, waitForPhase } from "./driver.mjs";
import { mkdirSync } from "fs";

const APP_URL = process.env.PROXIMATE_URL || "http://localhost:5174";
const OUT = new URL("./screenshots", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function shoot(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

async function enterSimulatorScene(page) {
  await toTitleScreen(page);
  await clickText(page, "Go on shift", { timeout: 5000 });
  await clickText(page, "I understand", { timeout: 3000 });
  await clickText(page, "New save", { timeout: 3000 });
  await clickText(page, "I understand", { timeout: 3000 });
  await clickText(page, "Start", { timeout: 3000 });
  await page.waitForTimeout(1700);
  // "Medical Education Mode" here is the Simulator's own SANDBOX mode label
  // (unrelated to src/education) -- the real click chain to a scene screen,
  // confirmed by stepping through it live: level -> scope -> protocols ->
  // ready -> station -> cat (scenario picker) -> kit -> response -> scene.
  await clickText(page, "Medical Education Mode", { timeout: 3000 });
  await waitForPhase(page, "level", 5000);
  await clickText(page, "Paramedic", { timeout: 3000 });
  await waitForPhase(page, "scope", 5000);
  await clickText(page, "Continue", { timeout: 3000 });
  await waitForPhase(page, "protocols", 5000);
  await clickText(page, "Continue", { timeout: 3000 });
  await waitForPhase(page, "ready", 5000);
  await clickText(page, "▲ Begin", { timeout: 3000 });
  await waitForPhase(page, "station", 5000);
  await clickText(page, "▲ Get the call", { timeout: 3000 });
  await waitForPhase(page, "cat", 5000);

  const select = page.locator("select").filter({ has: page.locator('option[value="abdPain"]') });
  await select.first().selectOption("abdPain");
  const row = select.first().locator("xpath=..");
  await row.locator("button", { hasText: "Go" }).click({ timeout: 3000 });
  await waitForPhase(page, "kit", 5000);

  await clickText(page, "Bring the stretcher", { timeout: 5000 });
  await clickText(page, "Roll", { timeout: 5000 });
  await waitForPhase(page, "response", 5000);
  const st = await getState(page);
  await setState(page, { phase: "scene", onSceneAt: st.t });
  await page.waitForTimeout(300);
  return true;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  const results = [];

  try {
    // -- Education Mode surfaces --
    await page.goto(APP_URL, { waitUntil: "load" });
    await page.waitForTimeout(300);
    await clickText(page, "Study");
    await page.waitForTimeout(1200); // guest-mode progress load
    await shoot(page, "education-dashboard-desktop", DESKTOP);
    await shoot(page, "education-tabnav-mobile", MOBILE);

    await clickText(page, "MCQ Practice");
    await page.waitForTimeout(600);
    await shoot(page, "education-mcq-desktop", DESKTOP);

    await page.locator("nav button", { hasText: "Progress" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(600);
    await shoot(page, "education-stats-desktop", DESKTOP);
    await shoot(page, "education-stats-mobile", MOBILE);

    await clickText(page, "Auscultation Practice");
    await page.waitForTimeout(600);
    await shoot(page, "education-auscultation-desktop", DESKTOP);

    results.push("Education Mode surfaces captured.");
  } catch (e) {
    results.push(`Education Mode capture failed partway: ${e.message}`);
  }

  try {
    // -- Simulator surfaces --
    await page.goto(APP_URL, { waitUntil: "load" });
    await page.waitForTimeout(300);
    const ok = await enterSimulatorScene(page);
    if (ok) {
      await shoot(page, "simulator-scene-desktop", DESKTOP);
      await shoot(page, "simulator-scene-mobile", MOBILE);
      // Settings overlay is globally mounted via Shell.jsx.
      try {
        await page.click("text=⚙", { timeout: 2000 });
        await page.waitForTimeout(300);
        await shoot(page, "simulator-settings-desktop", DESKTOP);
      } catch (e) {
        results.push(`Settings overlay click failed: ${e.message}`);
      }
      results.push("Simulator surfaces captured.");
    } else {
      results.push("Could not reach a Simulator scene screen in this pass.");
    }
  } catch (e) {
    results.push(`Simulator capture failed partway: ${e.message}`);
  }

  console.log(results.join("\n"));
  console.log(`\nConsole errors observed: ${consoleErrors.length}`);
  if (consoleErrors.length) console.log(consoleErrors.slice(0, 20).join("\n"));
  console.log(`\nScreenshots written to ${OUT}`);

  await browser.close();
}

main();

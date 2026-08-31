// tools/browser/verifyIvAngleTouchControls.mjs — real-click verification
// that the IV mini-game's insertion angle can be adjusted WITHOUT a
// keyboard. Before this fix, the "insert" step's angle only responded to
// an ArrowLeft/ArrowRight keydown listener — a real, previously-undiscovered
// gap against the Procedure Gameplay spec's own 2.14 ("mobile/touch must
// work"): on a phone there was no way to correct the stick angle mid-
// advance at all. The fix adds plain onClick ◀/▶ buttons, which fire from
// a tap's synthetic click event on every mobile browser with no separate
// touch handling needed — this script proves those buttons actually move
// the angle (and clamp correctly at both ends), using ordinary clicks,
// which is exactly the event path a tap uses.
//
// Run: node tools/browser/verifyIvAngleTouchControls.mjs   (needs `npm run dev`)

import { launch, clickText, setState, waitForPhase } from "./driver.mjs";

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
  await page.fill('input[placeholder="First"]', "Angle");
  await page.fill('input[placeholder="Last"]', "Tap");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function angleText(page) {
  const body = await page.locator("body").innerText();
  const m = body.match(/Angle (\d+)°/);
  if (!m) throw new Error(`Could not find "Angle N°" text in:\n${body.slice(0, 400)}`);
  return Number(m[1]);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
    t: 5, onSceneAt: 0, tab: "procedures",
    accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" }, kind: "iv", site: "armR", attempts: 0 },
  });
  await page.waitForTimeout(300);

  // Real click, same event path as a real IV stick, into the "insert" step.
  await clickText(page, "Uncap the needle");
  await page.waitForTimeout(200);

  const initial = await angleText(page);
  if (initial !== 20) throw new Error(`Expected the IV mini-game's default insertion angle to be 20°, got ${initial}°`);
  console.log(`PASS: insert step opens at the expected default angle (${initial}°)`);

  // ▶ Angle five times — plain clicks, the same event a tap synthesizes.
  for (let i = 0; i < 5; i++) await clickText(page, "Angle ▶");
  await page.waitForTimeout(100);
  const afterUp = await angleText(page);
  if (afterUp !== 25) throw new Error(`Expected angle 25° after 5 taps on Angle ▶, got ${afterUp}°`);
  console.log(`PASS: 5 taps on "Angle ▶" move the angle from 20° to ${afterUp}° with no keyboard involved`);

  // ◀ Angle eight times.
  for (let i = 0; i < 8; i++) await clickText(page, "◀ Angle");
  await page.waitForTimeout(100);
  const afterDown = await angleText(page);
  if (afterDown !== 17) throw new Error(`Expected angle 17° after 8 taps on ◀ Angle, got ${afterDown}°`);
  console.log(`PASS: 8 taps on "◀ Angle" move the angle down to ${afterDown}°`);

  // Clamp at the floor (0).
  for (let i = 0; i < 30; i++) await clickText(page, "◀ Angle");
  await page.waitForTimeout(100);
  const floored = await angleText(page);
  if (floored !== 0) throw new Error(`Expected angle to clamp at 0°, got ${floored}°`);
  console.log("PASS: repeated taps clamp the angle at the real floor (0°), never negative");

  // Clamp at the ceiling (60, the real upper bound of a peripheral-IV angle).
  for (let i = 0; i < 70; i++) await clickText(page, "Angle ▶");
  await page.waitForTimeout(100);
  const ceiled = await angleText(page);
  if (ceiled !== 60) throw new Error(`Expected angle to clamp at 60°, got ${ceiled}°`);
  console.log("PASS: repeated taps clamp the angle at the real ceiling (60°)");

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

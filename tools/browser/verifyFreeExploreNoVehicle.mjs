// Confirms the DEFAULT Free Explore path (spawnVehicle unchecked) is
// unaffected by this batch — no vehicle, no console errors, ordinary
// on-foot walking still works exactly as before.
import { launch, clickText } from "./driver.mjs";

const BASE_URL = process.argv[2] || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL, { waitUntil: "load" });

  await clickText(page, "Free Explore");
  await page.waitForFunction(() => document.body.innerText.includes("Spawn with a vehicle"), null, { timeout: 5000 });
  // Deliberately do NOT check the checkbox this time.
  await clickText(page, "Northwood City");

  await page.waitForFunction(() => typeof window.__proximateTestFreeExplore === "function", null, { timeout: 10000 });
  await page.waitForTimeout(500);
  const t = await page.evaluate(() => window.__proximateTestFreeExplore());
  console.log("state:", t);
  if (t.hasCar) throw new Error("FAIL: hasCar is true even though spawnVehicle was never checked");
  if (t.mode !== "walk") throw new Error(`FAIL: expected mode "walk", got "${t.mode}"`);

  // Ordinary walk still works.
  await page.keyboard.down("w");
  await page.waitForTimeout(500);
  await page.keyboard.up("w");
  const after = await page.evaluate(() => window.__proximateTestFreeExplore());
  const dist = Math.hypot(after.P.x - t.P.x, after.P.z - t.P.z);
  console.log(`walked ${dist.toFixed(2)}m`);
  if (dist < 0.5) throw new Error("FAIL: ordinary on-foot walking did not move the player");

  if (consoleErrors.length) {
    console.log("Console errors:", consoleErrors);
    throw new Error(`FAIL: ${consoleErrors.length} console error(s)`);
  }
  console.log("PASS: no-vehicle path unaffected, zero console errors.");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

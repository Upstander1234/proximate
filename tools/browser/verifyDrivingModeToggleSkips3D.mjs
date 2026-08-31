// tools/browser/verifyDrivingModeToggleSkips3D.mjs — real in-browser
// verification that Settings' "DRIVING MODE" toggle now skips BOTH
// DrivingScene and Coop3DWalk when off (map-expansion batch, item 5's
// mid-batch follow-up: a player on weaker hardware should be able to turn
// off all real-time WebGL rendering and still play the whole game).
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyDrivingModeToggleSkips3D.mjs`.

import { launch, clickText } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await clickText(page, "Go on shift");
    await clickText(page, "I understand");
    await clickText(page, "New save");
    await clickText(page, "I understand");
    await clickText(page, "Start");
    await page.waitForTimeout(1700);
    await clickText(page, "Medical Education Mode");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "level", null, { timeout: 5000 });
    await clickText(page, "Paramedic");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
    await clickText(page, "County EMS", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
    await clickText(page, "EMS Supervisor", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
    await clickText(page, "▲ Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });

    // Turn DRIVING MODE off via the real Settings overlay.
    await clickText(page, "⚙", { exact: true });
    await page.waitForTimeout(200);
    await clickText(page, "off", { exact: true });
    await clickText(page, "close", { exact: true });
    await page.waitForTimeout(200);
    console.log("1. Real click: Settings -> DRIVING MODE off. OK");

    await clickText(page, "City", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
    await clickText(page, "▲ Ready");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
    await clickText(page, "▲ Begin");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    await clickText(page, "▲ Get the call");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
    await clickText(page, "🎲 Random cardiac");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await clickText(page, "Bring the stretcher");
    await clickText(page, "▲ Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });

    const canvasCount = await page.locator("canvas").count();
    console.log(`2. Reached response phase with DRIVING MODE off — canvas count: ${canvasCount} (expect 0).`);
    if (canvasCount !== 0) throw new Error(`expected NO WebGL canvas with driving mode off, found ${canvasCount}`);

    const bodyText = await page.locator("body").innerText();
    if (/W accelerate/i.test(bodyText)) throw new Error("expected DrivingScene's own hint text to be absent with driving mode off");
    console.log("3. No DrivingScene rendered — the plain approach/response screen is shown instead. OK");

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } catch (e) {
    console.error("Verification crashed:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
main();

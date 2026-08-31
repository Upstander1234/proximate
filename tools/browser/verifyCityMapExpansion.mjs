// tools/browser/verifyCityMapExpansion.mjs — real in-browser verification
// for the city-map content-expansion pass (src/data/maps.js CITY_MAP grown
// to a 7x7 grid with real street names/addresses/city hall/skyscrapers, plus
// player-facing labels in CityMap.jsx and a real dispatch address line).
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyCityMapExpansion.mjs`.

import { launch, clickText, getState } from "./driver.mjs";

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
    await clickText(page, "ALS ambulance", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
    await page.evaluate(() => {
      const st = window.__proximateTestGetState();
      const cand = (st.candidatePool || []).find((c) => c.agency === st.department);
      if (cand) window.__proximateTestSetState({ roster: [{ ...cand, student: false, cost: 0, exp: 0 }] });
    });
    await clickText(page, "▲ Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
    await clickText(page, "City", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
    await clickText(page, "▲ Ready");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
    await clickText(page, "▲ Begin");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    // The station screen is a real 3D walk-up-to-the-whiteboard interaction
    // now (not a plain button) — not what this script is testing, so skip
    // straight to the scenario picker via setState, the same "fast-forward
    // past what isn't under test" idiom verifyDestinationPicker.mjs already
    // uses for the response/approach phase.
    await page.evaluate(() => window.__proximateTestSetState({ phase: "cat" }));
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });

    // --- Map view: confirm the bigger grid renders and shows real labels ---
    await clickText(page, "Map", { exact: true });
    await page.waitForTimeout(300);
    const svgBuildingCount = await page.locator("svg g[fill]").count();
    console.log("Buildings rendered on map:", svgBuildingCount);
    if (svgBuildingCount < 60) throw new Error(`expected 60+ buildings on the grown city map, got ${svgBuildingCount}`);
    await page.screenshot({ path: "tools/browser/screenshots/citymap-expanded.png" });

    // Landmark labels should be visible WITHOUT hovering (cityHall/hospital/
    // school/etc. are in ALWAYS_LABELED_TYPES) — confirm real text renders,
    // not just icons.
    const svgText = await page.locator("svg text").allTextContents();
    console.log("Always-on labels found:", svgText.filter(Boolean).length, "e.g.", svgText.filter(Boolean).slice(0, 6));
    if (!svgText.some((t) => t === "Northwood City Hall")) throw new Error('expected "Northwood City Hall" label to render without debug/hover');
    if (!svgText.some((t) => /Tower|Grand Hotel/.test(t))) throw new Error("expected a skyscraper label to render");

    // --- Dispatch: confirm a real address line renders at response phase ---
    // Switch back to List view — the map toggle above put us in map mode,
    // which shows CityMap instead of the body-system picker buttons.
    await clickText(page, "List", { exact: true });
    await page.waitForTimeout(200);
    await clickText(page, "🎲 Random cardiac");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await clickText(page, "Bring the stretcher");
    await clickText(page, "▲ Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
    await page.waitForTimeout(300);
    const bodyText = await page.locator("body").innerText();
    const dispatchLine = bodyText.split("\n").find((l) => l.startsWith("Dispatched to "));
    console.log("Dispatch line:", dispatchLine || "(none found)");
    if (!dispatchLine) throw new Error('expected a "Dispatched to ..." line to render at the response phase');
    if (/undefined|null/.test(dispatchLine)) throw new Error(`dispatch line rendered broken text: "${dispatchLine}"`);
    await page.screenshot({ path: "tools/browser/screenshots/dispatch-address-line.png" });

    // --- 3D drive-by: confirm the scene mounts with the bigger map/new
    // building types with no crash (city hall / skyscraper meshes included
    // indirectly via BUILDING_MODEL_URL, not asserted pixel-by-pixel here).
    await page.waitForTimeout(2000);
    const canvasCount = await page.locator("canvas").count();
    console.log("3D canvas elements mounted:", canvasCount);
    if (!canvasCount) throw new Error("expected the 3D driving scene canvas to mount");
    await page.screenshot({ path: "tools/browser/screenshots/citymap-3d-drive.png" });

    console.log("\nPASS: expanded city map renders, labels show, dispatch address line is real, 3D scene mounts.");

    if (consoleErrors.length) {
      console.log("Console errors:", consoleErrors.join(" | "));
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  } catch (e) {
    console.error("Verification crashed:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
main();

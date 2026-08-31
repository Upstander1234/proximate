// tools/browser/verifyMapExpansion.mjs — real in-browser verification of the
// map-expansion batch (see CLAUDE.md's map-expansion plan / the plan file
// this session shipped): confirms the CityMap screen actually renders real
// streets/buildings for all 3 regions (not the old decorative pin overlay),
// clicking a building still launches a case, and the DRIVING MODE settings
// toggle really skips the minigame while the response phase still advances
// on the same real, map-derived travel time.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyMapExpansion.mjs`.

import { launch, clickText, getState } from "./driver.mjs";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const SHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");
const shot = (name) => path.join(SHOT_DIR, name);

async function createSandboxCharacter(page, region) {
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
  await clickText(page, "County EMS");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
  await clickText(page, "EMS Supervisor");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
  await clickText(page, "▲ Continue");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
  await clickText(page, region);
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
  await clickText(page, "▲ Ready");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
  await clickText(page, "▲ Begin");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
  await clickText(page, "▲ Get the call");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
}

async function main() {
  await mkdir(SHOT_DIR, { recursive: true });
  const { browser, page, consoleErrors } = await launch({ headless: true });
  let failed = false;
  try {
    // ── Part 1: the real CityMap screen, all 3 regions ────────────────────
    // Each region gets a fresh, isolated browser context (not just a
    // page.goto reload on the same page) — reusing one page across several
    // "New save" flows hits pre-existing, unrelated localStorage-carryover
    // behavior in the save picker (a second "New save" click doesn't repeat
    // the same disclaimer flow once a save already exists), which is a
    // real property of the app worth not fighting in a script that's
    // testing something else entirely.
    for (const region of ["City", "Suburban", "Rural"]) {
      const ctx = await browser.newContext();
      const rpage = await ctx.newPage();
      const rErrors = [];
      rpage.on("console", (msg) => { if (msg.type() === "error") rErrors.push(msg.text()); });
      rpage.on("pageerror", (err) => rErrors.push(`pageerror: ${err.stack || err.message}`));
      await rpage.goto(URL, { waitUntil: "domcontentloaded" });
      await createSandboxCharacter(rpage, region);
      await verifyRegionMap(rpage, region);
      consoleErrors.push(...rErrors);
      await ctx.close();
    }

    async function verifyRegionMap(page, region) {
      console.log(`[${region}] Real click-through to cat (case picker) phase. OK`);

      // Toggle to Map view — the button pair is [List|Map] next to
      // "OR PICK A SPECIFIC CASE — BY BODY SYSTEM".
      await clickText(page, "Map");
      await page.waitForTimeout(300);

      const svgCount = await page.locator("svg").count();
      if (svgCount < 1) throw new Error(`[${region}] expected a real <svg> CityMap, found none`);
      // Streets are <line> elements; buildings are <rect>/<circle>/<polygon>
      // icon shapes. A real map should have many of both — the old
      // decorative overlay was a background-image with <button> pins, no
      // <line>/<svg> at all.
      const lineCount = await page.locator("svg line").count();
      const buildingShapeCount = await page.locator("svg g[style] rect, svg g[style] circle, svg g[style] polygon").count();
      console.log(`[${region}] CityMap SVG present: ${svgCount} svg, ${lineCount} street lines, ~${buildingShapeCount} building shapes.`);
      if (lineCount < 10) throw new Error(`[${region}] expected a real street graph (>=10 lines), found ${lineCount}`);
      await page.locator("svg").first().scrollIntoViewIfNeeded();
      await page.locator("svg").first().screenshot({ path: shot(`citymap-${region.toLowerCase()}.png`) });

      // Real click on a building launches a case (pickForBuilding ->
      // pickBodySystem -> pickExact -> phase becomes "kit").
      const anyBuilding = page.locator("svg g[style]").first();
      await anyBuilding.click({ timeout: 5000 });
      await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
      const st = await getState(page);
      console.log(`[${region}] Clicking a building launched a real case (scen="${st.scen}"), phase="${st.phase}". OK`);
    }

    // ── Part 2: DRIVING MODE toggle off -> minigame skipped, real time still used ──
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page, "City");
    // Turn DRIVING MODE off via the real Settings gear + toggle, not state
    // injection — this is the actual player-facing control.
    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(200);
    // exact:true — the DRIVING MODE row's own descriptive note text contains
    // the substring "off" ("Turning it off skips straight to the scene"),
    // which a plain substring getByText("off") matches BEFORE the actual
    // Chip button (Row renders label, then note, then children, in that DOM
    // order) — the same "prose-shadowing" gotcha this project's own
    // tools/browser/README.md already documents for a different screen.
    await clickText(page, "off", { exact: true });
    await clickText(page, "close");
    console.log("Real click: Settings -> DRIVING MODE off. OK");

    await clickText(page, "🎲 Random cardiac");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await clickText(page, "Bring the stretcher");
    // "▲ " prefix disambiguates from unrelated loadout-summary prose that
    // also happens to contain the substring "Roll" — same "prose-shadowing"
    // gotcha documented elsewhere in tools/browser/README.md.
    await clickText(page, "▲ Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });

    const stOff = await getState(page);
    if (!stOff.driveMiniDone) throw new Error("DRIVING MODE off: expected g.driveMiniDone to already be set at dispatch, it was not");
    if (!stOff.locations?.station || !stOff.locations?.incident) throw new Error("expected g.locations to be seeded at dispatch");
    const canvasCountOff = await page.locator("canvas").count();
    if (canvasCountOff > 0) throw new Error(`DRIVING MODE off: expected no <canvas> minigame, found ${canvasCountOff}`);
    console.log(`Real dispatch with DRIVING MODE off -> g.driveMiniDone=${stOff.driveMiniDone} at dispatch, no <canvas> rendered, g.locations seeded (mapId=${stOff.locations.mapId}). OK`);
    await page.screenshot({ path: shot("driving-mode-off-response.png") });

    // Confirm the phase clock is still real and running (need = real
    // map-derived travelTimes(), unaffected by the toggle).
    await page.waitForTimeout(1500);
    const stOff2 = await getState(page);
    if (!(stOff2.t > stOff.t)) throw new Error("expected g.t to advance during the response phase even with DRIVING MODE off");
    console.log(`Response-phase clock advancing normally with DRIVING MODE off (t: ${stOff.t.toFixed(1)} -> ${stOff2.t.toFixed(1)}). OK`);

    // ── Part 3: DRIVING MODE on (default) still renders the minigame ─────
    // Fresh, isolated context again — see Part 1's own comment for why.
    const ctx3 = await browser.newContext();
    const page3 = await ctx3.newPage();
    const p3Errors = [];
    page3.on("console", (msg) => { if (msg.type() === "error") p3Errors.push(msg.text()); });
    page3.on("pageerror", (err) => p3Errors.push(`pageerror: ${err.stack || err.message}`));
    await page3.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page3, "City");
    await clickText(page3, "🎲 Random cardiac");
    await page3.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await clickText(page3, "Bring the stretcher");
    await clickText(page3, "▲ Roll");
    await page3.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
    const stOn = await getState(page3);
    const canvasCountOn = await page3.locator("canvas").count();
    console.log(`Real dispatch with DRIVING MODE on (default) -> g.driveMiniDone=${!!stOn.driveMiniDone}, <canvas> count=${canvasCountOn}.`);
    if (stOn.driveMiniDone) throw new Error("DRIVING MODE on: expected g.driveMiniDone NOT set yet at dispatch (minigame should render)");
    if (canvasCountOn < 1) throw new Error("DRIVING MODE on: expected the driving minigame's <canvas> to render");
    console.log("DRIVING MODE on -> minigame renders normally (regression check). OK");
    consoleErrors.push(...p3Errors);
    await ctx3.close();

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } catch (e) {
    failed = true;
    console.error("Verification crashed:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
  if (failed) process.exit(1);
}
main();

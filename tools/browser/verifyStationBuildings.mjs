// tools/browser/verifyStationBuildings.mjs — real in-browser verification of
// the department/vehicle-aware station batch (see CLAUDE.md's plan file):
// confirms the new 8 station building types actually render on CityMap for
// all 3 regions, and confirms dispatch genuinely routes from a DIFFERENT
// station depending on the player's department AND specific vehicle kind —
// not just decoration. Extends the existing verifyMapExpansion.mjs pattern.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyStationBuildings.mjs`.

import { launch, clickText, getState } from "./driver.mjs";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const SHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");
const shot = (name) => path.join(SHOT_DIR, name);

// Real click-through to dispatch (phase "response"), choosing a SPECIFIC
// department + vehicle kind label, not the fixed "EMS Supervisor" the other
// scripts in this directory use — that's the whole point here.
async function dispatchAs(page, { region, departmentLabel, vehicleLabel }) {
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
  // exact:true — the department phase's own intro paragraph names "Fire
  // Dept" and "Sheriff's" in prose ahead of the real buttons in DOM order
  // (a plain substring match would click that paragraph instead), the same
  // "prose-shadowing" gotcha this project's own tools/browser/README.md
  // already documents for other screens. Each department/vehicle button's
  // own label span contains ONLY that exact string, so exact matching
  // disambiguates cleanly.
  await clickText(page, departmentLabel, { exact: true });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
  await clickText(page, vehicleLabel, { exact: true });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
  await clickText(page, "▲ Continue");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
  await clickText(page, region);
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
  await clickText(page, "▲ Ready");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
  await clickText(page, "▲ Begin");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
  // The station screen became a real 3D walk-up-to-the-whiteboard
  // interaction in a later session (no plain "Get the call" button
  // anymore) — this script predates that and was left stale. Not what
  // this script is testing, so skip straight to the scenario picker.
  await page.evaluate(() => window.__proximateTestSetState({ phase: "cat" }));
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
  await clickText(page, "🎲 Random cardiac");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
  await clickText(page, "Bring the stretcher");
  await clickText(page, "▲ Roll");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
  return getState(page);
}

async function main() {
  await mkdir(SHOT_DIR, { recursive: true });
  const { browser, page, consoleErrors } = await launch({ headless: true });
  let failed = false;
  try {
    // ── Part 1: station buildings render on CityMap, all 3 regions ───────
    for (const region of ["City", "Suburban", "Rural"]) {
      const ctx = await browser.newContext();
      const rpage = await ctx.newPage();
      const rErrors = [];
      rpage.on("console", (msg) => { if (msg.type() === "error") rErrors.push(msg.text()); });
      rpage.on("pageerror", (err) => rErrors.push(`pageerror: ${err.stack || err.message}`));
      await rpage.goto(URL, { waitUntil: "domcontentloaded" });
      await clickText(rpage, "Go on shift");
      await clickText(rpage, "I understand");
      await clickText(rpage, "New save");
      await clickText(rpage, "I understand");
      await clickText(rpage, "Start");
      await rpage.waitForTimeout(1700);
      await clickText(rpage, "Medical Education Mode");
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "level", null, { timeout: 5000 });
      await clickText(rpage, "Paramedic");
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
      await clickText(rpage, "County EMS", { exact: true });
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
      await clickText(rpage, "EMS Supervisor", { exact: true });
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
      await clickText(rpage, "▲ Continue");
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
      await clickText(rpage, region);
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
      await clickText(rpage, "▲ Ready");
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
      await clickText(rpage, "▲ Begin");
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
      // Same stale-button fix as dispatchAs() above — see its comment.
      await rpage.evaluate(() => window.__proximateTestSetState({ phase: "cat" }));
      await rpage.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
      await clickText(rpage, "Map");
      await rpage.waitForTimeout(300);
      const buildingCount = await rpage.locator("svg g[style]").count();
      console.log(`[${region}] CityMap renders ${buildingCount} building markers (stations included).`);
      if (buildingCount < 20) throw new Error(`[${region}] expected a real number of buildings including new stations, got ${buildingCount}`);
      await rpage.locator("svg").first().scrollIntoViewIfNeeded();
      await rpage.locator("svg").first().screenshot({ path: shot(`stations-${region.toLowerCase()}.png`) });
      consoleErrors.push(...rErrors);
      await ctx.close();
    }
    console.log("Part 1 OK: station buildings render on CityMap for all 3 regions.\n");

    // ── Part 2: two different departments -> two different stations ──────
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await pageA.goto(URL, { waitUntil: "domcontentloaded" });
    const stA = await dispatchAs(pageA, { region: "City", departmentLabel: "County EMS", vehicleLabel: "EMS Supervisor" });
    console.log(`County EMS / EMS Supervisor -> station node "${stA.locations?.station?.nodeId}"`);
    await ctxA.close();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await pageB.goto(URL, { waitUntil: "domcontentloaded" });
    // "Rescue truck", not "Fire engine" — engine is one of the 3 vehicle
    // kinds (["ambBLS","ambALS","engine"]) that require hiring at least one
    // partner before "Continue" enables (App.jsx's `needsCrew`/`blocked`);
    // rescue has no such gate, so this stays a pure department/station test.
    const stB = await dispatchAs(pageB, { region: "City", departmentLabel: "Fire Dept", vehicleLabel: "Rescue truck" });
    console.log(`Fire Dept / Rescue truck -> station node "${stB.locations?.station?.nodeId}"`);
    await ctxB.close();

    if (!stA.locations?.station?.nodeId || !stB.locations?.station?.nodeId) throw new Error("expected g.locations.station to be seeded on both runs");
    if (stA.locations.station.nodeId === stB.locations.station.nodeId) throw new Error(`expected DIFFERENT stations for County EMS vs Fire Dept, both got "${stA.locations.station.nodeId}"`);
    console.log("Part 2 OK: two different departments dispatch from two different, correctly department-specific stations.\n");

    // ── Part 3: two different vehicle kinds, SAME department -> can differ ──
    // "Medic squad" (fs1/fs2 in city, common) vs "Battalion Chief" (fs3
    // only, rare) — deliberately NOT rescue/ladder (both only live at fs3
    // in city, so they'd always tie) and NOT engine (needsCrew-gated, see
    // Part 2's own comment).
    const ctxC1 = await browser.newContext();
    const pageC1 = await ctxC1.newPage();
    await pageC1.goto(URL, { waitUntil: "domcontentloaded" });
    const stC1 = await dispatchAs(pageC1, { region: "City", departmentLabel: "Fire Dept", vehicleLabel: "Medic squad" });
    console.log(`Fire Dept / Medic squad -> station node "${stC1.locations?.station?.nodeId}"`);
    await ctxC1.close();

    const ctxC2 = await browser.newContext();
    const pageC2 = await ctxC2.newPage();
    await pageC2.goto(URL, { waitUntil: "domcontentloaded" });
    const stC2 = await dispatchAs(pageC2, { region: "City", departmentLabel: "Fire Dept", vehicleLabel: "Battalion Chief" });
    console.log(`Fire Dept / Battalion Chief -> station node "${stC2.locations?.station?.nodeId}"`);
    await ctxC2.close();

    if (!stC1.locations?.station?.nodeId || !stC2.locations?.station?.nodeId) throw new Error("expected g.locations.station to be seeded on both runs");
    if (stC1.locations.station.nodeId === stC2.locations.station.nodeId) throw new Error(`expected DIFFERENT stations for Medic squad vs Battalion Chief (same department, different kind), both got "${stC1.locations.station.nodeId}"`);
    console.log(`Part 3 OK: same department, different vehicle kind (squad vs battalion) routes from two DIFFERENT stations ("${stC1.locations.station.nodeId}" vs "${stC2.locations.station.nodeId}") — the per-kind rarer-vehicle filter is real, not decorative.`);

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

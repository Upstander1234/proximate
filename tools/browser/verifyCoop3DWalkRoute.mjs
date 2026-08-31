// tools/browser/verifyCoop3DWalkRoute.mjs — real in-browser verification
// that Coop3DWalk.jsx's TARGET/LAYOUT now come from real per-call map data
// (map-expansion batch, CLAUDE.md item 5) instead of a fixed ~130m walk
// every time: connects one real co-op client (peerCount 1 is a real,
// supported case — Coop3DWalk needs no second player to render), reaches
// the approach phase twice on two DIFFERENT scenarios, and confirms the
// HUD's own live distance readout differs between them — a real, per-call
// varying walk distance, not the old fixed constant.
//
// Requires the co-op relay running first: `npm run coop-server`. Then the
// dev server: `npm run dev`. Then, in a third terminal:
// `node tools/browser/verifyCoop3DWalkRoute.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const SHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");
const shot = (name) => path.join(SHOT_DIR, name);

async function reachApproachWithSeed(page, seed) {
  // Force a fresh approach-phase mount at a specific dispatch seed — same
  // "toggle the render-gating field off then on" idiom
  // verifyDrivingSceneRoute.mjs already established for DrivingScene,
  // adapted here: Coop3DWalk has no onFinish/driveMiniDone race to avoid,
  // since it's gated only on phase+coop3d+drivingModeEnabled, so a single
  // atomic setState is enough.
  await setState(page, { phase: "response" });
  await page.waitForTimeout(150);
  await setState(page, { phase: "approach", locations: { ...(await getState(page)).locations, seed } });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "approach", null, { timeout: 5000 });
}

async function main() {
  await mkdir(SHOT_DIR, { recursive: true });
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await clickText(page, "Go on shift");
    await clickText(page, "I understand");
    await clickText(page, "New save");
    await clickText(page, "I understand");
    await clickText(page, "Start");
    await page.waitForTimeout(1700);

    // Real co-op connect (one client — a real, supported case).
    await clickText(page, "Co-op");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "coopSetup", null, { timeout: 5000 });
    await clickText(page, "▲ Connect");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.coop?.status === "connected", null, { timeout: 8000 });
    console.log("1. Real co-op connect (1 client) OK.");
    await clickText(page, "Continue →");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "level", null, { timeout: 5000 });
    await clickText(page, "Paramedic");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "department", null, { timeout: 5000 });
    await clickText(page, "County EMS", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "vehicle", null, { timeout: 5000 });
    await clickText(page, "EMS Supervisor", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
    await clickText(page, "▲ Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
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
    console.log("2. Real click-through to a live call (response phase) OK.");

    const readDist = async () => {
      const t = await page.locator("body").innerText();
      const m = t.match(/(\d+)m\b/);
      return m ? parseInt(m[1], 10) : null;
    };

    // Two different dispatch seeds -> two different incident buildings ->
    // two different real walk-in distances (the actual deliverable).
    await reachApproachWithSeed(page, 111);
    await page.waitForTimeout(500);
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible", timeout: 8000 });
    console.log("3. Coop3DWalk canvas rendered with real map data (seed 111). OK");
    const box1 = await canvas.boundingBox();
    await page.screenshot({ path: shot("coop-walk-seed-a.png"), clip: box1 });
    const distA = await readDist();
    console.log(`   distance readout: ${distA}m`);

    await reachApproachWithSeed(page, 999999);
    await page.waitForTimeout(500);
    await canvas.waitFor({ state: "visible", timeout: 8000 });
    const box2 = await canvas.boundingBox();
    await page.screenshot({ path: shot("coop-walk-seed-b.png"), clip: box2 });
    const distB = await readDist();
    console.log(`4. Coop3DWalk canvas rendered with real map data (seed 999999). OK\n   distance readout: ${distB}m`);

    if (distA == null || distB == null) throw new Error("could not read the GPS distance HUD readout on one or both runs");
    if (distA === distB) throw new Error(`expected two different dispatch seeds to produce two different real walk distances, got the same ${distA}m both times (the old fixed-~130m fallback would do exactly this)`);
    console.log(`\nPASS: walk-in distance genuinely varies by dispatch (${distA}m vs ${distB}m), confirming real per-call map data is wired in, not the old fixed constant.`);

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } catch (e) {
    console.error("Verification crashed:", e);
    console.error("Console/page errors captured before crash:", consoleErrors.join(" | ") || "(none)");
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
main();

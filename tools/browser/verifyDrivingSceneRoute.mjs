// tools/browser/verifyDrivingSceneRoute.mjs — real in-browser verification
// that DrivingScene.jsx now follows the REAL route (map-expansion batch,
// CLAUDE.md item 5): a hand-picked station/incident pair on the city map
// with two real 90-degree turns (u2-0 -> u2-1 -> u2-2 -> u1-2 -> u0-2 ->
// u0-3 -> u0-4, confirmed via a direct mapGraph.js probe — east, then
// north, then east again, 480m total) is seeded via setState, then the
// scene is driven with real held-W keyboard input for long enough to pass
// both turns, with screenshots at each leg confirming the car's heading
// visibly rotates to match the route rather than staying fixed in a
// straight recycled corridor.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyDrivingSceneRoute.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const SHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");
const shot = (name) => path.join(SHOT_DIR, name);

const ROUTE_LOCATIONS = {
  mapId: "city",
  station: { type: "node", nodeId: "u2-0" },
  incident: { type: "node", nodeId: "u0-4" },
  seed: 1,
};

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
    await clickText(page, "City", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
    await clickText(page, "▲ Ready");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
    await clickText(page, "▲ Begin");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    await setState(page, { stationBoardOpen: true });
    await page.waitForTimeout(300);
    await clickText(page, "▲ Get the call");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
    await clickText(page, "🎲 Random cardiac");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await clickText(page, "Bring the stretcher");
    // Seed the real, longer hand-picked route BEFORE the drive ever starts
    // (not after reaching "response" and forcing a remount) — this
    // environment's sim-clock/travel-time settings can resolve a short
    // default incident's drive to arrival almost instantly, racing past
    // Playwright before it can catch the mounted canvas. Seeding first
    // means the FIRST mount already uses the real 480m route, no race.
    await setState(page, { locations: ROUTE_LOCATIONS, t: 0, code: 3 });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.locations?.station?.nodeId === "u2-0", null, { timeout: 5000 });
    await clickText(page, "▲ Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });

    // Force a genuine FRESH MOUNT with the hand-picked route: DrivingScene
    // only reads its `route` prop at mount (deliberately excluded from the
    // effect's own dependency array — see the component's header comment),
    // so overwriting g.locations on an ALREADY-MOUNTED scene wouldn't pick
    // it up. Toggling a real dependency like `code` doesn't work either —
    // that forces a REAL unmount/remount cycle, and the cleanup's own
    // onFinish() unconditionally sets driveMiniDone:1 again the instant it
    // fires (this is deliberate, documented behavior — see the component's
    // isDriverRef comment on why only a genuine unmount should do that).
    // The real dispatch draw above may have already finished its own
    // (short, real) drive and set driveMiniDone:1 naturally; explicitly
    // forcing it to 1 first (idempotent if already there) and waiting for
    // React to fully process that unmount BEFORE flipping it back to 0
    // with the new route avoids racing that onFinish callback.
    await setState(page, { driveMiniDone: 1 });
    await page.waitForTimeout(250);
    await setState(page, { locations: ROUTE_LOCATIONS, driveMiniDone: 0, t: 0, code: 3 });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.locations?.station?.nodeId === "u2-0", null, { timeout: 5000 });
    // A permanent dev-only test hook (DrivingScene.jsx,
    // window.__proximateTestDriveTelemetry — same gated pattern as
    // App.jsx's own __proximateTestGetState/__proximateTestSetState) — a
    // first-person screenshot can never SHOW a heading change (the camera
    // always looks straight ahead by construction), so this is what
    // actually proves the yaw rotates at the real route's turns, not just
    // that the scene renders without crashing.
    await page.evaluate(() => { window.__telemetryLog = []; window.__proximateTestDriveTelemetry = (t) => { window.__telemetryLog.push(t); if (window.__telemetryLog.length > 400) window.__telemetryLog.shift(); }; });

    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible", timeout: 20000 });
    console.log("DrivingScene canvas rendered.");
    await page.waitForTimeout(400);
    // App.jsx's own 100ms sim tick continuously re-renders the page, which
    // Playwright's element-screenshot stability heuristic reads as
    // "not stable" indefinitely (the same gotcha tools/browser/README.md
    // already documents for the old drive-minigame result button). Use a
    // clipped PAGE screenshot instead of an element screenshot — it has no
    // such stability wait.
    const shootCanvas = async (name) => {
      const box = await canvas.boundingBox();
      await page.screenshot({ path: shot(name), clip: box });
    };
    const sampleTelemetry = async (label) => {
      const last = await page.evaluate(() => window.__telemetryLog?.[window.__telemetryLog.length - 1]);
      console.log(`  [${label}] dist=${last?.dist?.toFixed(1)}m x=${last?.x?.toFixed(1)} z=${last?.z?.toFixed(1)} yaw=${last?.yawDeg?.toFixed(1)}deg`);
      return last;
    };

    await shootCanvas("route-leg1-east.png");
    const t0 = await sampleTelemetry("leg1 (east-bound, arc 0-160m)");

    // Hold W through the route's real turns (east -> north at arc~160m,
    // north -> east at arc~320m, 480m total, maxSpeed=24 units/s at code
    // 3) — real keyboard input, not setState. First interval (9s) lands
    // mid-first-leg (~157m observed); a shorter follow-up (4s more) lands
    // inside the north-bound leg (arc 160-320m) before the next turn.
    await page.keyboard.down("w");
    await page.waitForTimeout(9000);
    await sampleTelemetry("still leg1, mid-drive");
    await page.waitForTimeout(4000);
    await shootCanvas("route-leg2-north.png");
    const t1 = await sampleTelemetry("leg2 (north-bound, arc 160-320m)");
    await page.waitForTimeout(9000);
    await shootCanvas("route-leg3-east-again.png");
    const t2 = await sampleTelemetry("leg3 (east-bound again, arc 320-480m)");
    await page.waitForTimeout(4000);
    await page.keyboard.up("w");
    await shootCanvas("route-arrived.png");
    const t3 = await sampleTelemetry("arrived (arc clamped at totalLen)");

    const finalState = await getState(page);
    console.log(`Final locations still the seeded route: ${finalState.locations?.station?.nodeId === "u2-0" && finalState.locations?.incident?.nodeId === "u0-4"}`);

    // The real assertion: yaw genuinely rotates ~90 degrees at each turn,
    // not just "the scene didn't crash." leg1 (east-bound, yaw~90 or -90
    // depending on sign convention) vs leg2 (north-bound) vs leg3
    // (east-bound again, yaw should return close to leg1's own value).
    const yawDelta = (a, b) => { let d = Math.abs(a - b) % 360; if (d > 180) d = 360 - d; return d; };
    const turn1 = t0 && t1 ? yawDelta(t0.yawDeg, t1.yawDeg) : null;
    const turn2 = t1 && t2 ? yawDelta(t1.yawDeg, t2.yawDeg) : null;
    const backToStart = t0 && t2 ? yawDelta(t0.yawDeg, t2.yawDeg) : null;
    console.log(`\nYaw change leg1->leg2 (turn 1): ${turn1?.toFixed(1)}deg (expect ~90)`);
    console.log(`Yaw change leg2->leg3 (turn 2): ${turn2?.toFixed(1)}deg (expect ~90)`);
    console.log(`Yaw change leg1->leg3 (both east-bound): ${backToStart?.toFixed(1)}deg (expect ~0)`);
    if (turn1 == null || turn2 == null || backToStart == null) throw new Error("telemetry missing — could not verify heading change numerically");
    if (turn1 < 60 || turn1 > 120) throw new Error(`turn 1 yaw change (${turn1.toFixed(1)}deg) is not a real ~90-degree turn`);
    if (turn2 < 60 || turn2 > 120) throw new Error(`turn 2 yaw change (${turn2.toFixed(1)}deg) is not a real ~90-degree turn`);
    if (backToStart > 20) throw new Error(`leg1 and leg3 are both east-bound segments but yaw differs by ${backToStart.toFixed(1)}deg`);
    console.log("\nPASS: the car's heading genuinely rotates ~90 degrees at each real route turn, confirmed numerically.");

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS — screenshots + numeric telemetry both confirm real-route following.");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } catch (e) {
    console.error("Verification crashed:", e);
    console.error("Console/page errors captured before crash:", consoleErrors.join(" | ") || "(none)");
    console.error("Current URL:", page.url());
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
main();

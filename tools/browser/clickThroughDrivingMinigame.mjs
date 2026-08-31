// tools/browser/clickThroughDrivingMinigame.mjs — real in-browser playtest
// of DrivingScene.jsx, the single 3D drive-in segment that now runs for
// EVERY mode (Sandbox/Career/Master of Your Scope/Zero-To-Hero/co-op),
// replacing what used to be two separate implementations: a 2D top-down
// canvas minigame for solo play and a co-op-only 3D scene. This script
// covers the solo path (the co-op path is exercised elsewhere, by the 3D
// driving/walking batch's own two-browser Playwright session — see
// CLAUDE.md).
//
// Unlike the old 2D minigame, DrivingScene has no ready/countdown/result
// phases of its own and no fixed run length — it's a real THREE.WebGLRenderer
// scene (its <canvas> is renderer.domElement) that renders continuously the
// instant it mounts, and reports its score via onFinish only when App.jsx's
// own tick loop advances g.phase away from "response" (the real, map-derived
// travel time — see scope.js's travelTimes()/mapGraph.js's shortestPath()
// — elapsing), i.e. on unmount. So this script: real clicks to a scenario's
// response phase with a vehicle (EMS Supervisor, fleet.js type "suv", not
// "none", so a drive segment exists at all), confirms the WebGL canvas
// renders immediately (no ready/countdown gate), holds real "w" keydown and
// confirms the HUD's live MPH readout actually rises (proving real physics,
// not a static scene), taps D then A to exercise steering, then sets CALL
// SPEED to 4× via the real Settings toggle (the same "speed up the wait"
// idiom other scripts here already use for busy-timers) so the real,
// map-derived drive time on a short in-city trip elapses in well under a
// minute of wall-clock time, and confirms the phase transition away from
// "response" lands g.driveMiniDone/g.speedBoost in global state — the
// real, unmount-driven finish, not a "Keep rolling ->" button (that overlay
// no longer exists).
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/clickThroughDrivingMinigame.mjs`.

import { launch, clickText, getState } from "./driver.mjs";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const SHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");
const shot = (name) => path.join(SHOT_DIR, name);

async function createSandboxCharacter(page) {
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
  // "EMS Supervisor" -> fleet.js's supervisor entry, vehicle.type:"suv" (not
  // "none") — real for the drive scene to render at all: a Layperson's
  // on-foot vehicle (type:"none") skips it entirely.
  await clickText(page, "EMS Supervisor");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
  // "▲ " prefixes are load-bearing — see this file's own "prose-shadowing"
  // gotcha (the scope screen's descriptive paragraph contains the plain
  // word "Ready" ahead of the real button).
  await clickText(page, "▲ Continue");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
  // City — the densest, shortest-edges map (src/data/maps.js), so a real
  // station->incident drive time is short even at 1x, keeping this script's
  // wait-for-phase-transition step fast.
  await clickText(page, "City");
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
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page);
    console.log("1. Real click-through to the cat (case picker) phase. OK");

    // Real click: Settings -> CALL SPEED 4x, before dispatch, so the tick
    // loop that ends the response phase (App.jsx: n.t>=drive) runs at 4x
    // real speed for the whole drive segment below — the same "speed up
    // the real-time wait" idiom other scripts in this directory already use
    // for busy-timers, applied here to a real map-derived drive time
    // instead. exact:true avoids matching the SETTINGS row's own
    // descriptive prose (the same "prose-shadowing" gotcha this file
    // documents further down) before the actual Chip button.
    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(200);
    await clickText(page, "4×", { exact: true });
    await clickText(page, "close");
    console.log("2. Real click: Settings -> CALL SPEED 4x (speeds up the real-time wait below, not the drive scene's own physics). OK");

    await clickText(page, "🎲 Random cardiac");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await clickText(page, "Bring the stretcher");
    // "▲ " prefix disambiguates from unrelated loadout-summary prose that
    // also happens to contain the substring "Roll" — same "prose-shadowing"
    // gotcha this file's own README documents elsewhere.
    await clickText(page, "▲ Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
    console.log("3. Real click-through kit -> \"Roll\" -> response (a real vehicle, drive scene should render). OK");

    // ── The drive scene itself, real keyboard input throughout ──────────
    // DrivingScene has no ready/countdown gate — it's a THREE.WebGLRenderer
    // scene rendering the instant it mounts, so its <canvas> (and steering
    // hint text) should be present immediately, not after a keypress.
    let bodyText = await page.locator("body").innerText();
    if (!/accelerate.*steer/i.test(bodyText)) throw new Error("expected DrivingScene's \"W accelerate ... A/D steer\" hint text, found none");
    const canvasCount = await page.locator("canvas").count();
    if (canvasCount < 1) throw new Error("expected a real <canvas> (THREE.WebGLRenderer's own domElement) for the drive scene, found none");
    console.log("4. Drive scene hint text + real WebGL <canvas> present immediately on mount (no ready/countdown gate). OK");
    await page.screenshot({ path: shot("drive-ready.png") });

    const readMph = async () => {
      const t = await page.locator("body").innerText();
      const m = t.match(/(\d+)\s*MPH/);
      return m ? parseInt(m[1], 10) : null;
    };
    const mphBefore = await readMph();

    // Real "w" keydown — DrivingScene's own keydown listener is global
    // (window-level), not canvas-focused, matching the old component's own
    // first-time-player-friendly design.
    await page.keyboard.down("w");
    await page.waitForTimeout(1500);
    const mphDuring = await readMph();
    console.log(`5. Real "w" keydown held 1.5s -> HUD MPH ${mphBefore} -> ${mphDuring}.`);
    if (!(mphDuring > (mphBefore ?? 0))) throw new Error(`expected HUD MPH to rise while holding "w", got ${mphBefore} -> ${mphDuring}`);
    await page.screenshot({ path: shot("drive-running.png") });

    // Exercise steering for real (D then A) while still accelerating.
    await page.keyboard.down("d");
    await page.waitForTimeout(700);
    await page.keyboard.up("d");
    await page.waitForTimeout(300);
    await page.keyboard.down("a");
    await page.waitForTimeout(700);
    await page.keyboard.up("a");
    console.log("6. Real D then A steering input exercised while driving. OK");
    await page.screenshot({ path: shot("drive-steering.png") });

    // Wait for the real, map-derived drive time to elapse (App.jsx's tick
    // loop, sped up 4x by the CALL SPEED setting above) and the phase to
    // move on to "approach" — DrivingScene unmounts at that point and fires
    // its real onFinish, landing driveMiniDone/speedBoost in global state.
    // No fixed-length "result" overlay to wait for anymore; poll phase.
    let reachedApproach = false;
    for (let i = 0; i < 40; i++) {
      const st = await getState(page);
      if (st.phase === "approach") { reachedApproach = true; break; }
      await page.waitForTimeout(1500);
    }
    await page.keyboard.up("w");
    if (!reachedApproach) throw new Error("response phase never advanced to \"approach\" after ~60s at 4x call speed — drive scene may be stuck");
    console.log("7. Real, map-derived drive time elapsed -> phase advanced to \"approach\" -> DrivingScene unmounted. OK");

    const st = await getState(page);
    if (!st.driveMiniDone) throw new Error("expected g.driveMiniDone to be set once DrivingScene unmounted");
    if (typeof st.speedBoost !== "number") throw new Error(`expected g.speedBoost to be a number, got ${st.speedBoost}`);
    console.log(`8. Real drive scene finish (on unmount) -> g.driveMiniDone=${st.driveMiniDone}, g.speedBoost=${st.speedBoost.toFixed(3)}, phase="${st.phase}". OK`);
    await page.screenshot({ path: shot("drive-result.png") });

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Click-through test crashed:", e); process.exit(1); });

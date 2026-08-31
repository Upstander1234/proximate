// tools/browser/verifyDefaultSpeed.mjs — real-click verification that a
// brand-new save defaults its sim clock to 4x, not 1x (see App.jsx's
// `blank()` comment). Confirms both the state default AND that the tick
// loop genuinely advances g.t at ~4x wall-clock once inside a live call.
//
// Run: node tools/browser/verifyDefaultSpeed.mjs   (needs `npm run dev`)

import { launch, clickText, getState, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });

  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Speed");
  await page.fill('input[placeholder="Last"]', "Check");
  await clickText(page, "Start");
  await waitForPhase(page, "gmodePick", 8000);

  const s1 = await getState(page);
  if (s1.speed !== 4) throw new Error(`Expected blank() default speed=4, got ${s1.speed}`);
  console.log(`PASS: fresh save defaults to speed=${s1.speed}`);

  // Confirm real, live tick-loop pacing (not just the static default): drop
  // straight into a scene phase via setState (a real, already-established
  // shortcut for jumping past unrelated setup screens, per driver.mjs's own
  // header), then measure g.t advancement over a fixed 2s wall-clock window.
  // The tick effect runs every 100ms (BG_TICK_MS) advancing dt=.1*speed sim
  // seconds per tick — at speed=4 that's 0.4 sim-sec every 100ms real, i.e.
  // ~8 sim-sec over a 2s wall-clock window (vs. ~2s at speed=1).
  await page.evaluate((st) => window.__proximateTestSetState(st), {
    phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
    t: 0, onSceneAt: 0,
  });
  await page.waitForTimeout(200); // let one tick settle
  const before = await getState(page);
  await page.waitForTimeout(2000);
  const after = await getState(page);
  const dt = after.t - before.t;
  console.log(`Measured sim-time advance over 2s wall-clock: ${dt.toFixed(3)}s (expect ~8s at speed=4, vs ~2s at speed=1)`);
  if (dt < 0.5) throw new Error(`Sim clock advanced too slowly for speed=4 (got ${dt.toFixed(3)}s over 2s) — default speed may not be reaching the tick loop`);
  console.log("PASS: live tick loop genuinely runs at ~4x, not 1x");

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

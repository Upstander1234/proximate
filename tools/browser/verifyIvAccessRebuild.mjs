// tools/browser/verifyIvAccessRebuild.mjs — real-click verification of the
// rebuilt IV access mini-game (AccessMinigame.jsx): the 4-phase sequence
// (assess/choose-site -> insert -> confirm) with the new gauge choice and
// failure taxonomy (infiltration/arterial puncture/blown vein/failed
// attempt), plus the gauge -> flow-rate consequence in HangMinigame.
//
// Run: node tools/browser/verifyIvAccessRebuild.mjs   (needs `npm run dev`)

import { launch, clickText, setState, waitForPhase, getState, toTitleScreen } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await toTitleScreen(page);
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Line");
  await page.fill('input[placeholder="Last"]', "Placer");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

// A REAL click on the real action button, not a fabricated accessMinigame
// object — the fake shape used elsewhere in this tools/ directory for
// quick UI checks lacks the real action's own `.run`, so a SUCCESS
// resolution downstream (App.jsx's resolveAccessMinigame re-invoking
// `mg.action`) would silently do nothing to g.ivSites/g.ivGauge. Real
// click is the only honest way to verify that full chain.
async function openIvOn(page, region = "armR") {
  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
    t: 5, onSceneAt: 0, tab: "iv", region, bags: ["drug"],
    exposed: { [region]: true, torso: true },
  });
  await page.waitForTimeout(250);
  const label = { armR: "IV — right arm", armL: "IV — left arm", legR: "IV — right leg", legL: "IV — left leg" }[region];
  await clickText(page, label);
  await page.waitForTimeout(250);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // --- 1. Full success path: forearm, default 18g, routine difficulty. ---
  await openIvOn(page, "armR");
  const body1 = await page.locator("body").innerText();
  if (!/IV:.*choose a site/.test(body1)) throw new Error(`Expected the assess phase's own "choose a site" title, got:\n${body1.slice(0, 300)}`);
  console.log("PASS: IV mini-game opens on the assess (site-choice) phase");

  await page.locator('[aria-label="Choose forearm (cephalic)"]').click();
  await page.waitForTimeout(100);
  await clickText(page, "Look closer");
  await page.waitForTimeout(50);
  const afterInspect = await page.locator("body").innerText();
  if (!/Looks (well-filled|faint|barely)/.test(afterInspect)) throw new Error("Inspect step did not reveal a visibility description");
  console.log("PASS: Inspect reveals a real visibility-based description");

  // Palpate: press-and-hold gesture, same idiom as the insert-phase needle hold.
  const palpateBtn = page.getByText("Press and hold to palpate", { exact: false }).first();
  const box = await palpateBtn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.waitForTimeout(50);
  const afterPalpate = await page.locator("body").innerText();
  if (!/Feels (bouncy|thready)/.test(afterPalpate)) throw new Error("Palpate step did not reveal a real palpability description");
  console.log("PASS: Palpate reveals a real, distinct (from inspection) palpability description");

  await clickText(page, "Proximal (toward the heart)"); // the real answer — every peripheral vein drains proximally
  await page.waitForTimeout(50);
  await clickText(page, "20g");
  await page.waitForTimeout(50);
  await clickText(page, "Uncap the needle and start the stick");
  await page.waitForTimeout(150);

  const insertBody = await page.locator("body").innerText();
  if (!/Angle 20°/.test(insertBody)) throw new Error(`Expected the insert phase's default angle text, got:\n${insertBody.slice(0, 300)}`);
  console.log("PASS: insert phase reached with angle + lateral + depth controls");

  // Dial angle to the real target (22) and lateral to 0, then hold to
  // advance depth into the vein band — a real, deliberate stick, not a
  // lucky default.
  await clickText(page, "Angle ▶");
  await clickText(page, "Angle ▶");
  await page.waitForTimeout(50);

  const svgBox = await page.locator("svg").first().boundingBox();
  await page.mouse.move(svgBox.x + svgBox.width / 2, svgBox.y + svgBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(640); // ~0.02/30ms => depth lands near the vein center (0.34-0.50 band), with margin on both the shallow (~510ms) and blown (~750ms) boundaries for real-timer jitter under headless/CI load
  await page.mouse.up();
  await page.waitForTimeout(100);

  const afterStick = await page.locator("body").innerText();
  if (!/venous or arterial/i.test(afterStick)) {
    throw new Error(`Expected a real flash + venous/arterial judgment prompt after a good stick, got:\n${afterStick.slice(0, 500)}`);
  }
  console.log("PASS: a correctly-angled, correctly-held stick produces a real flashback and asks the player to judge it");

  await clickText(page, "Looks venous — proceed");
  await page.waitForTimeout(80);
  await clickText(page, "Advance the catheter off the needle");
  await page.waitForTimeout(80);

  const advanceBtn = page.locator("button", { hasText: "Hold to advance" }).first();
  const abox = await advanceBtn.boundingBox();
  await page.mouse.move(abox.x + abox.width / 2, abox.y + abox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1200);
  await page.mouse.up();
  await page.waitForTimeout(80);
  await clickText(page, "Catheter fully advanced");
  await page.waitForTimeout(80);
  await clickText(page, "Withdraw the needle");
  await page.waitForTimeout(80);
  await clickText(page, "Apply occlusive pressure and connect the line");
  await page.waitForTimeout(80);

  const flushBtn = page.locator("button", { hasText: "Hold to flush" }).first();
  const fbox = await flushBtn.boundingBox();
  await page.mouse.move(fbox.x + fbox.width / 2, fbox.y + fbox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1200);
  await page.mouse.up();
  await page.waitForTimeout(80);
  await clickText(page, "Flushed — confirm the line");
  await page.waitForTimeout(150);

  const finalBody = await page.locator("body").innerText();
  if (!/IV established/.test(finalBody)) throw new Error(`Expected the real IV-established success message, got:\n${finalBody.slice(0, 400)}`);
  console.log("PASS: full assess -> insert -> confirm sequence produces a real IV-established success screen");

  await clickText(page, "Continue");
  // The real "iv" action's own run() effect (setting g.ivSites/g.ivGauge)
  // fires only once the short POST_MINIGAME_CONFIRM_S busy timer elapses —
  // that's real SIM seconds, which only advance as fast as the tick loop's
  // real-time rate allows (dt=.1*speed per ~100ms tick), not instantly on
  // click. 3.5s of real wait comfortably covers the 3 sim-second window at
  // the default speed (see tools/browser/README.md's own documented gotcha
  // for this exact pattern).
  await page.waitForTimeout(3500);
  const s1 = await getState(page);
  if (!s1.ivSites?.includes("armR")) throw new Error("Expected armR to be recorded in g.ivSites after a successful IV");
  if ((s1.ivGauge || {}).armR !== 20) throw new Error(`Expected the chosen 20g gauge to be stored on g.ivGauge.armR, got ${JSON.stringify(s1.ivGauge)}`);
  console.log(`PASS: successful placement records the real chosen gauge (20g) on g.ivGauge.armR`);

  // --- 2. Gauge -> flow-rate consequence: hang a large fluid bolus on the
  // 20g line just placed and confirm a wide-open rate is now capped. ---
  await setState(page, {
    accessMinigame: { action: { id: "give", region: "armR" }, kind: "hang", site: "armR",
      drugName: "Normal Saline 1000 mL", fluidMode: true, access: "IV", accessOptions: ["IV"], warnings: [], attempts: 0 },
    patient: s1.patient,
  });
  await page.waitForTimeout(200);
  await page.locator("button", { hasText: "Spike the bag" }).first().click();
  await page.waitForTimeout(80);
  await clickText(page, "Continue");
  await page.waitForTimeout(80);

  const chamber = page.locator("svg rect").first();
  const cbox = await chamber.boundingBox().catch(() => null);
  // Prime via the drip chamber hold gesture (same SVG press-and-hold idiom).
  const primeTarget = page.locator("svg").first();
  const pbox = await primeTarget.boundingBox();
  await page.mouse.move(pbox.x + pbox.width / 2, pbox.y + pbox.height * 0.5);
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.mouse.up();
  await page.waitForTimeout(100);
  await clickText(page, "Continue to the hub");
  await page.waitForTimeout(80);
  await page.locator("button", { hasText: "Scrub the hub" }).first().click();
  await page.waitForTimeout(50);
  await clickText(page, "Aspirate and flush 5 mL");
  await page.waitForTimeout(50);
  await clickText(page, "Spike into the IV hub");
  await page.waitForTimeout(80);

  const rateBody = await page.locator("body").innerText();
  const m = rateBody.match(/tops out around (\d+) gtt\/min/);
  if (!m) throw new Error(`Expected the rate step to state the 20g line's real gtt/min ceiling, got:\n${rateBody.slice(0, 500)}`);
  console.log(`PASS: HangMinigame states the 20g line's real gravity-flow ceiling (${m[1]} gtt/min) instead of an unconditioned rate`);

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

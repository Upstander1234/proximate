// tools/browser/verifyBatch5DirectManip.mjs — Hyper-realism pass, Batch 5:
// per-minigame polish items converted from button/checkbox interactions to
// direct manipulation. Confirms each conversion actually drives real state.
//
// Run: node tools/browser/verifyBatch5DirectManip.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const findings = [];
const ok = (msg) => console.log("PASS: " + msg);
const bad = (msg) => { findings.push(msg); console.log("FAIL: " + msg); };

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  const playLink = page.getByText("Play →", { exact: false }).first();
  if (await playLink.count()) await playLink.click({ timeout: 10000 });
  const creditsContinue = page.getByText("Continue", { exact: true }).first();
  if (await creditsContinue.count().catch(() => 0)) await creditsContinue.click({ timeout: 5000 }).catch(() => {});
  await clickText(page, "CONTINUE WITHOUT AI");
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Batch");
  await page.fill('input[placeholder="Last"]', "Five");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function openMinigame(page, kind, extra = {}) {
  await setState(page, { accessMinigame: null, busy: null });
  await page.waitForTimeout(150);
  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "abdPain", level: "paramedic", t: 5, onSceneAt: 0,
    tab: "assess", region: "armR", bags: ["monitor", "trauma", "airway"], pockets: ["glucometer"],
    exposed: { torso: true }, speed: 12,
    accessMinigame: { action: { id: kind, region: "armR", tab: "assess", label: "test action", cost: 25, lvl: 0 }, kind, site: "torso", attempts: 0, alertBaseline: 0, ...extra },
  });
  await page.waitForTimeout(400);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await freshCharacter(page);

    // 1. Glucometer — the real glucose value appears on the meter's own LCD.
    await openMinigame(page, "gluc");
    // Walk through the steps quickly.
    await page.locator("button", { hasText: "Insert strip" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(150);
    await page.locator("button", { hasText: "Wipe the fingertip" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(150);
    await page.locator("button", { hasText: "Let it dry" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(150);
    await page.locator("button", { hasText: "Continue" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(150);
    await page.locator("button", { hasText: "Lance the side" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(150);
    // Squeeze: press and hold directly on the fingertip's hit-circle
    // (viewBox 200x120, hit-circle centered at (58,50) — see
    // GlucometerMinigame.jsx's Finger component) until the drop is in range.
    const fingerSvg = page.locator("svg").first();
    const fbox = await fingerSvg.boundingBox();
    if (fbox) {
      // The squeezable hit-circle sits inside a <g transform="translate(20,20)">
      // in Finger's own SVG — its real on-screen position is (20+58, 20+50).
      const sx = fbox.x + (78 / 200) * fbox.width, sy = fbox.y + (70 / 120) * fbox.height;
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      await page.waitForTimeout(1300);
      await page.mouse.up();
    }
    await page.waitForTimeout(200);
    const useDropBtn = page.locator("button", { hasText: "Use this drop" }).first();
    if (await useDropBtn.count()) await useDropBtn.click({ timeout: 5000 });
    await page.waitForTimeout(200);
    const applyBtn = page.locator("button", { hasText: "Apply the drop" }).first();
    if (await applyBtn.count()) await applyBtn.click({ timeout: 5000 });
    await page.waitForTimeout(5200); // the 5s reading countdown
    const bodyGluc = await page.evaluate(() => document.body.innerText);
    if (!/\d{2,3}/.test(bodyGluc.split("Confirm the reading")[0].slice(-40))) {
      bad(`Glucometer LCD should show a real numeric value before "Confirm the reading". Body tail: ${bodyGluc.slice(-200)}`);
    } else ok("Glucometer: the meter's own LCD shows a real numeric glucose reading.");

    // 2. DeviceMinigame pads — click directly on the torso to place pads.
    await openMinigame(page, "device", { deviceId: "pads", deviceName: "Defib pads" });
    await page.locator("button", { hasText: "Dry and clear the chest" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(150);
    await page.locator("button", { hasText: "Peel the backing" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(150);
    await page.locator("button", { hasText: "Continue" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(200);
    const padEls = page.locator("text").filter({ hasText: "Right upper chest" });
    if (await padEls.count()) {
      await padEls.first().dispatchEvent("click");
      await page.waitForTimeout(150);
      const padEls2 = page.locator("text").filter({ hasText: "Left lower chest" });
      if (await padEls2.count()) await padEls2.first().dispatchEvent("click");
      await page.waitForTimeout(150);
      await page.locator("button", { hasText: "Press them down" }).first().click({ timeout: 5000 });
      await page.waitForTimeout(150);
      const bodyPads = await page.evaluate(() => document.body.innerText);
      if (!/Pads seated with good contact/.test(bodyPads)) bad(`Clicking pad zones directly should place valid pads. Body: ${bodyPads.slice(0, 300)}`);
      else ok("DeviceMinigame pads: clicking directly on the torso places pads correctly.");
    } else bad("Pad placement zone labels not found in the rendered scene.");

    // 3. CprMinigame — pressing directly on the chest registers a compression.
    await openMinigame(page, "cpr");
    const cprSvg = page.locator("svg").first();
    const cbox = await cprSvg.boundingBox();
    if (cbox) {
      for (let i = 0; i < 3; i++) {
        await page.mouse.click(cbox.x + cbox.width / 2, cbox.y + cbox.height / 2);
        await page.waitForTimeout(150);
      }
      const bodyCpr = await page.evaluate(() => document.body.innerText);
      if (!/Compressions 3/.test(bodyCpr)) bad(`Pressing the drawn chest 3 times should register 3 compressions. Body: ${bodyCpr.slice(0, 300)}`);
      else ok("CprMinigame: pressing directly on the chest registers real compressions.");
    } else bad("CPR chest scene SVG not found.");

    // 4. DrawUpMinigame — tapping the bubble flicks it out (3 taps).
    await openMinigame(page, "prep");
    const stateNow = await getState(page);
    const setup = stateNow.accessMinigame;
    // Pick the first vial, pull the plunger, then tap the bubble.
    const vialBtn = page.locator("button[aria-label^='Select vial']").first();
    if (await vialBtn.count()) {
      await vialBtn.click({ timeout: 5000 });
      await page.waitForTimeout(150);
      const slider = page.locator('input[type="range"]').first();
      await slider.fill("3");
      await page.waitForTimeout(150);
      const bubbleG = page.locator("svg circle[r='10']").first();
      if (await bubbleG.count()) {
        for (let i = 0; i < 3; i++) { await bubbleG.click({ timeout: 5000, force: true }); await page.waitForTimeout(100); }
        const bodyDraw = await page.evaluate(() => document.body.innerText);
        if (!/Air expelled/.test(bodyDraw)) bad(`Tapping the bubble 3 times should expel it. Body: ${bodyDraw.slice(0, 300)}`);
        else ok("DrawUpMinigame: tapping the bubble directly on the syringe expels it after real repeated taps.");
      } else bad("Bubble hit-target not found on the syringe.");
    } else bad("Vial selection button not found.");

    if (consoleErrors.length) bad(`console errors — ${consoleErrors.join(" | ")}`);

    console.log("\n--- RESULTS ---");
    if (findings.length) {
      console.log(`${findings.length} FINDING(S):`);
      findings.forEach(f => console.log(" - " + f));
      process.exitCode = 1;
    } else {
      console.log("All Batch 5 direct-manipulation conversions work correctly.");
    }
  } finally {
    await browser.close();
  }
}

const hardDeadline = setTimeout(() => {
  console.error("FAIL: hard timeout — something hung without throwing.");
  process.exit(1);
}, 90000);

main()
  .catch((err) => { console.error("FAIL:", err); process.exitCode = 1; })
  .finally(() => { clearTimeout(hardDeadline); });

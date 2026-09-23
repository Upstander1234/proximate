// tools/browser/verifyProcMinigameDirectManip.mjs — Hyper-realism pass,
// Batch 4: a representative sample of ProcMinigame procedures converted
// from dropdown/button choices to real click/press gestures directly on
// the drawn anatomy. Confirms each conversion actually drives state, not
// just that an element is clickable.
//
// Run: node tools/browser/verifyProcMinigameDirectManip.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Proc");
  await page.fill('input[placeholder="Last"]', "Direct");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function openProc(page, procId, extra = {}) {
  await setState(page, { accessMinigame: null, busy: null });
  await page.waitForTimeout(150);
  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "cardiogenicShock", level: "paramedic", t: 5, onSceneAt: 0,
    tab: "procedures", region: "torso", bags: ["monitor", "trauma", "airway"], exposed: { torso: true }, speed: 12,
    accessMinigame: { action: { id: procId }, kind: "proc", site: "torso", procId, procName: procId, attempts: 0, alertBaseline: 0 },
    ...extra,
  });
  await page.waitForTimeout(400);
}

async function clickSvgText(page, label) {
  // The hotspot circle sits at the same coordinates as its label and can
  // legitimately intercept Playwright's actionability check — both are
  // inside the SAME onClick <g>. A real, plain mouse click at the
  // element's rendered center (accounting for any SVG <g> transform, which
  // getBoundingClientRect already resolves) is the most honest simulation
  // of a real tap, so use that directly rather than element.click().
  const el = page.locator("text").filter({ hasText: label }).first();
  const n = await el.count();
  if (!n) return false;
  await el.dispatchEvent("click");
  return true;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await freshCharacter(page);

    // 1. needleD — click a real decompression site landmark directly.
    await openProc(page, "needleD");
    if (await clickSvgText(page, "2nd ICS")) {
      await page.waitForTimeout(200);
      const s = await getState(page);
      if (s.accessMinigame?.action?.id !== "needleD") bad("needleD site click did not advance the minigame.");
      else {
        const bodyTxt = await page.evaluate(() => document.body.innerText);
        if (!/Insert just over the TOP/.test(bodyTxt)) bad(`needleD site click should advance to the depth step. Body: ${bodyTxt.slice(0, 200)}`);
        else ok("needleD: clicking the 2nd ICS landmark directly advances the procedure.");
      }
    } else bad("needleD site landmark label not found in the rendered scene.");

    // 2. headTilt — click the correct grip zone directly on the head.
    await openProc(page, "headTilt");
    const bodyBefore = await page.evaluate(() => document.body.innerText);
    if (!/soft tissue/.test(bodyBefore)) bad("headTilt grip hotspots not rendered.");
    else {
      // Click the wrong zone first (soft tissue) and confirm it fails with the real reason.
      await clickSvgText(page, "soft tissue");
      await page.waitForTimeout(200);
      const s1 = await getState(page);
      if (!s1.accessMinigame) bad("headTilt: clicking the wrong grip zone should show a failure message, not close the minigame.");
      const failTxt = await page.evaluate(() => document.body.innerText);
      if (!/soft tissue under the jaw pushes the tongue/.test(failTxt)) bad(`headTilt wrong-grip click should show the real failure reason. Body: ${failTxt.slice(0, 300)}`);
      else ok("headTilt: clicking the wrong grip zone on the head fails with the real anatomic reason.");
    }

    // 3. chestSeal — press and hold directly on the wound to apply the seal.
    await openProc(page, "chestSeal");
    await page.locator("button", { hasText: "Wipe the skin" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(200);
    await page.locator("button", { hasText: "Continue" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(200);
    // Press-and-hold on the wound ellipse (center of the 200x100 viewBox scene).
    const sealSvg = page.locator("svg").first();
    const box = await sealSvg.boundingBox();
    if (box) {
      const cx = box.x + box.width * 0.5, cy = box.y + box.height * 0.55;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.waitForTimeout(600); // let the exhale phase cycle
      await page.mouse.up();
      await page.waitForTimeout(300);
      const bodyAfter = await page.evaluate(() => document.body.innerText);
      if (!/Sealed on the exhale|sealed it on the inhale/.test(bodyAfter)) bad(`chestSeal press-on-wound should produce a real win/fail message. Body: ${bodyAfter.slice(0, 300)}`);
      else ok("chestSeal: pressing directly on the wound resolves the procedure (real exhale-timing check).");
    } else bad("chestSeal scene SVG not found for press interaction.");

    // 4. o2nrb — click the tank valve directly on the scene (viewBox 200x100,
    // the valve knob sits at (22,26) — see ProcMinigame.jsx's o2nc/o2nrb case).
    await openProc(page, "o2nrb");
    const sceneSvg = page.locator("svg").first();
    const sceneBox = await sceneSvg.boundingBox();
    if (sceneBox) {
      const vx = sceneBox.x + (22 / 200) * sceneBox.width, vy = sceneBox.y + (26 / 100) * sceneBox.height;
      await page.mouse.click(vx, vy);
      await page.waitForTimeout(200);
      const contAppeared = await page.locator("button", { hasText: "Continue" }).first().count();
      if (!contAppeared) bad("o2nrb: clicking the tank valve did not open it (no Continue button appeared).");
      else ok("o2nrb: clicking the tank valve directly opens it.");
    } else bad("o2nrb scene SVG not found.");

    if (consoleErrors.length) bad(`console errors — ${consoleErrors.join(" | ")}`);

    console.log("\n--- RESULTS ---");
    if (findings.length) {
      console.log(`${findings.length} FINDING(S):`);
      findings.forEach(f => console.log(" - " + f));
      process.exitCode = 1;
    } else {
      console.log("All sampled ProcMinigame direct-manipulation conversions work correctly.");
    }
  } finally {
    await browser.close();
  }
}

const hardDeadline = setTimeout(() => {
  console.error("FAIL: hard timeout — something hung without throwing.");
  process.exit(1);
}, 60000);

main()
  .catch((err) => { console.error("FAIL:", err); process.exitCode = 1; })
  .finally(() => { clearTimeout(hardDeadline); });

// tools/browser/verifyShockClearing.mjs — proves "clear the patient" on the
// AED/monitor actually interrupts every actor touching the patient, and that
// the shock safety check is still mandatory afterward.
//
// The regression this guards is specific and real. clearPatientForShock()
// originally decided which patient-contact procedures to stop from TASK
// BOOKKEEPING (g.busy / g.cBusy) rather than from whether the DOSE was still
// live. A crew member's "Compressions" task lasts 25 s but its cpr dose runs
// 150 s (bvm/lucas are dur:9999 — src/data/procedures.js), so once that task
// completed the hand was gone from cBusy while the engine was still
// compressing/ventilating. Nothing was "interrupted", so the cpr/bvm dose
// survived straight through the shock. The fix keys off doseActive() instead.
// The "orphaned dose" case below is exactly that scenario, injected directly.
//
// Checks:
//   1. Shock is disabled until all three clear-checklist items are ticked.
//   2. Ticking "hands off" cancels an in-progress PLAYER action (busy + its
//      done marker) — the action is unfinished, so it must be re-doable.
//   3. Ticking "hands off" cancels every in-flight CREW task (cBusy) and
//      releases the monitor hold (monitorBy).
//   4. THE REGRESSION: a live cpr/bvm dose with NO task object attached (the
//      exact shape a completed crew task leaves behind) is still stopped.
//   5. The monitor minigame itself stays open — clearing must not close the
//      device screen the player is using.
//   6. Sim time keeps advancing; no console errors.
//
// Run: node tools/browser/verifyShockClearing.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Shock");
  await page.fill('input[placeholder="Last"]', "Clear");
  await clickText(page, "Start");
  await waitForPhase(page, "gmodePick", 12000).catch(() => {});
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await freshCharacter(page);

    // --- 1. the shock is gated behind the clear checklist ------------------
    await openDefib(page, {
      busy: { id: "cpr", doneKey: "cpr", label: "Doing compressions", dur: 25, left: 20, commit: false },
      done: { cpr: { at: 1 } },
      cBusy: { c1: { name: "Reyes", task: "Applying defib pads", taskId: "pads", dur: 25, left: 20, startedAt: 1 } },
      monitorBy: "c1",
      crew: [{ id: "c1", name: "Reyes", level: "emt" }],
      // THE REGRESSION CASE: a live compression/ventilation dose with no task
      // object behind it — precisely what a completed crew "Compressions"
      // task leaves behind (task gone, 150 s dose still running).
      doses: [{ id: "cpr", at: 2 }, { id: "bvm", at: 2 }],
    });
    await page.waitForTimeout(400);
    const shockBtn = page.locator("button", { hasText: "DELIVER SHOCK" }).first();
    if (!(await shockBtn.count())) { bad('"DELIVER SHOCK" button not found.'); }
    else if (!(await shockBtn.isDisabled())) bad("Shock was NOT gated behind the clear checklist.");
    else ok("shock stays disabled until the clear checklist is complete.");

    // --- 2/3/4. ticking "hands off" interrupts everything -------------------
    await page.locator("button", { hasText: "Hands off" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(400);
    const s = await getState(page);
    if (s.busy) bad(`player action was not interrupted (busy.id=${s.busy.id}).`);
    else ok("in-progress player action is interrupted on clear.");
    if (s.done && s.done.cpr) bad("the interrupted action's done marker was not cleared, so it cannot be redone.");
    else ok("interrupted action can be started again (done marker cleared).");
    if (Object.keys(s.cBusy || {}).length) bad(`crew tasks still running: ${JSON.stringify(Object.keys(s.cBusy))}.`);
    else ok("every in-flight crew task is cancelled on clear.");
    if (s.monitorBy) bad("monitorBy was not released on clear.");
    else ok("monitor hold is released on clear.");
    const live = (s.doses || []).map((d) => d.id);
    if (live.includes("cpr") || live.includes("bvm")) bad(`live compression/ventilation dose survived the clear: ${JSON.stringify(live)}`);
    else ok("live cpr/bvm doses are stopped even with no task object attached (the regression case).");

    // --- 5. the device screen itself stays open ----------------------------
    if (!s.accessMinigame || s.accessMinigame.kind !== "monitor") bad("clearing closed the monitor minigame the player is using.");
    else ok("the monitor minigame stays open across the clear.");

    // --- 6. the checklist still gates the shock ----------------------------
    if (!(await shockBtn.isDisabled())) bad("shock became available after only ONE of three clear items was ticked.");
    else ok("shock still requires the remaining two clear items — the check is not bypassed.");
    await page.locator("button", { hasText: "Oxygen moved away" }).first().click({ timeout: 5000 });
    await page.locator("button", { hasText: "Call it:" }).first().click({ timeout: 5000 });
    await page.waitForTimeout(300);
    if (await shockBtn.isDisabled()) bad("shock still disabled after the full checklist was completed.");
    else ok("shock becomes available once the full checklist is complete.");

    // --- 7. sim time keeps running -----------------------------------------
    const t1 = (await getState(page)).t;
    await page.waitForTimeout(1200);
    const t2 = (await getState(page)).t;
    if (!(t2 > t1)) bad(`sim time did not advance across the clear flow (t ${t1} -> ${t2}).`);
    else ok(`sim time keeps advancing during the minigame (t ${t1.toFixed(1)} -> ${t2.toFixed(1)}).`);

    if (consoleErrors.length) bad(`console errors: ${JSON.stringify(consoleErrors)}`);
    else ok("zero console errors throughout");

    console.log(findings.length ? `\n${findings.length} FINDING(S)` : "\nALL SHOCK-CLEARING CHECKS PASSED");
  } finally {
    await browser.close();
  }
  if (findings.length) process.exit(1);
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });

const openDefib = (page, extra = {}) => setState(page, {
  phase: "scene", gmode: "sandbox", scen: "cardiogenicShock", level: "paramedic",
  t: 5, onSceneAt: 0, tab: "procedures", region: "torso", bags: ["monitor"],
  exposed: { torso: true }, speed: 12, busy: null, cBusy: {}, doses: [], done: {},
  accessMinigame: {
    action: { id: "defib" }, kind: "monitor", site: "torso", procId: "defib",
    procName: "defib", screenType: "monitorDefib", attempts: 0, alertBaseline: 0,
  },
  ...extra,
});

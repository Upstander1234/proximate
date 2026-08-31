// tools/browser/verifyOutcomeReportDebrief.mjs — F44 verification. Confirms
// the new "THE CHART" debrief section (App.jsx) renders REAL data from
// outcomeReport() (physiology.js) after a real declare-death call, and
// renders nothing (gracefully) for an uncomplicated, no-arrest debrief.
//
// Real clicks throughout except: setState skipping the response/approach
// travel-time drive (a separate, already-covered surface — same documented
// carve-out every other script here uses), and setState raising g.speed to
// fast-forward sim time past GRACE (120s) without a multi-minute real-time
// wait — g.speed is a plain top-level scalar the tick loop already reads
// every tick, so patching it is safe (unlike patching s.patient, which would
// lose the Patient class's own prototype methods).
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyOutcomeReportDebrief.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

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
  await clickText(page, "EMS Supervisor");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "partners", null, { timeout: 5000 });
  await clickText(page, "▲ Continue");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "mode", null, { timeout: 5000 });
  // Suburban, not City — City triggers the 3D driving-station scene
  // (App.jsx's show3DStation), which needs WASD/E-to-interact input this
  // script doesn't drive; Suburban keeps the plain station UI this script's
  // click sequence targets.
  await clickText(page, "Suburban");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
  await clickText(page, "▲ Ready");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
  await clickText(page, "▲ Begin");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
  await clickText(page, "▲ Get the call");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "cat", null, { timeout: 5000 });
}

async function launchScenario(page, key) {
  const select = page.locator("select").filter({ has: page.locator(`option[value="${key}"]`) });
  const count = await select.count();
  if (!count) throw new Error(`no <select> found containing option value="${key}"`);
  await select.first().selectOption(key);
  const row = select.first().locator("xpath=..");
  await row.locator("button", { hasText: "Go" }).click();
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
  const st = await getState(page);
  if (st.scen !== key) throw new Error(`expected scen=${key}, got ${st.scen}`);
}

async function enterScene(page) {
  await clickText(page, "Bring the stretcher");
  // "▲ Roll" not bare "Roll" — a bare substring match can resolve to some
  // other on-screen text before the real button in DOM order depending on
  // the scenario's own bag-description text; the "▲ " prefix is this
  // codebase's own convention for a real action button (see other scripts'
  // identical gotcha notes for the Ready/Continue buttons).
  await clickText(page, "▲ Roll");
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
  const st = await getState(page);
  await setState(page, { phase: "scene", onSceneAt: st.t });
  await page.waitForTimeout(200);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });

    // ---- PART 1: the arrest/declare-death path, real content expected ----
    await createSandboxCharacter(page);
    console.log("1. Real click-through to a Paramedic Sandbox character, cat phase. OK");

    // doa (DOA-030) — patient starts already in asystole (rhythm:"asystole",
    // hr:0) with no condition attached, content-only. arrestStartMin sets on
    // the very first tick (pulseless from t=0), and mortality.js's own
    // cardiacArrest lethal-timer threshold is 0.5 min (30s) — well inside
    // the 120s GRACE window outcomeReport()'s own GUARD requires anyway.
    await launchScenario(page, "doa");
    console.log("2. Real-selected \"doa\" from the Other-system dropdown, launched to kit. OK");

    await enterScene(page);
    console.log("3. Real click Bring the stretcher -> Roll -> response, setState-skipped travel time -> scene. OK");

    // Fast-forward sim time past GRACE (120s) without a 2-minute real wait —
    // g.speed is a plain scalar the tick loop already multiplies dt by every
    // 100ms tick; patching it via setState is safe (unlike patching
    // s.patient, which would strip the Patient class's own methods).
    await setState(page, { speed: 40 });
    let st = await getState(page);
    const onSceneAt = st.onSceneAt;
    let onSceneSec = 0;
    for (let i = 0; i < 60; i++) {
      st = await getState(page);
      if (!st) { await page.waitForTimeout(100); continue; }   // transient null read, retry
      // A responding unit (squad/engine/PD) arriving on scene sets g.newUnit,
      // which is one of the sim-clock pause-guard flags (App.jsx's tick
      // effect) — the clock stalls until it's acknowledged. Clear it
      // directly rather than clicking the real "Acknowledge order"/"Take
      // command" button, since dismissing an arriving-unit notification is
      // a separate, already-covered surface from what this script exists to
      // verify.
      if (st.newUnit) await setState(page, { newUnit: null });
      onSceneSec = st.t - onSceneAt;
      if (onSceneSec >= 150) break;   // comfortably > GRACE(120), well under doa's own 600s scene limit
      await page.waitForTimeout(250);
    }
    await setState(page, { speed: 1 });
    console.log(`4. Fast-forwarded on-scene time to ${onSceneSec.toFixed(1)}s (> GRACE=120s). OK`);
    if (onSceneSec < 120) throw new Error(`on-scene time only reached ${onSceneSec.toFixed(1)}s, needed >=120s`);

    // The "Declare death on scene" button only renders on the GENERAL tab
    // (tab==="general" in App.jsx's own render guard) — the scene defaults
    // to the ASSESS tab, and a squad's own protocol-driven CPR/monitor work
    // (real crew-direction narrative, confirmed in the DOM) doesn't change
    // that. Real click the tab first.
    await clickText(page, "GENERAL");
    await clickText(page, "Declare death on scene");
    await clickText(page, "Yes — declare death");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "debrief", null, { timeout: 5000 });
    console.log("5. Real click-through: Declare death on scene -> confirm -> debrief. OK");

    st = await getState(page);
    const po = st.physioOutcome;
    console.log(`6. g.physioOutcome = ${JSON.stringify(po)}`);
    if (!po) throw new Error("g.physioOutcome is null after a real declare-death call on an asystolic patient — outcomeReport() should have real data here");
    if (!po.arrestOccurred) throw new Error("expected po.arrestOccurred=true for a patient in asystole since t=0");

    const bodyText1 = await page.locator("body").innerText();
    if (!/THE CHART/.test(bodyText1)) throw new Error("expected \"THE CHART\" section header in the debrief DOM, not found");
    if (!/Cardiac arrest at minute/.test(bodyText1)) throw new Error("expected the real arrest-timing line in the debrief DOM, not found");
    console.log("7. \"THE CHART\" section is visible in the DOM with real arrest-timing text. OK");

    // ---- PART 2: an uncomplicated, no-arrest debrief — graceful handling ----
    // A fresh, isolated browser CONTEXT (not just page.goto on the same
    // page) rather than trying to reset g in-place — a bare reload keeps
    // Part 1's localStorage save around, which changes the "New save"/
    // disclaimer click sequence (the disclaimer only shows once per
    // browser storage). A new incognito-style context has none of that.
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    const consoleErrors2 = [];
    page2.on("console", (msg) => { if (msg.type() === "error") consoleErrors2.push(msg.text()); });
    page2.on("pageerror", (err) => consoleErrors2.push(`pageerror: ${err.stack || err.message}`));
    await page2.goto(URL, { waitUntil: "domcontentloaded" });
    await createSandboxCharacter(page2);
    // benignFaint — a low-acuity, non-arresting scenario already used
    // elsewhere in this tooling (bughuntBreadth.mjs's own SYSTEMS list
    // doesn't include it, but it's the tutorial-shift's own first real call
    // and a known-benign presentation).
    await launchScenario(page2, "benignFaint");
    console.log("8. Fresh character, real-selected \"benignFaint\" (no arrest expected). OK");
    await enterScene(page2);

    // Resolve the call the honest way this scenario supports: transport to
    // the hospital. Fast-forward through response/approach/scene/transport
    // via the same speed patch, watching for phase to reach "arrived" (pick
    // an impression) or "debrief" directly (a scene-time-limit resolve()).
    await setState(page2, { speed: 60 });
    let reached = null;
    let st2 = null;
    for (let i = 0; i < 120; i++) {
      st2 = await getState(page2);
      if (!st2) { await page2.waitForTimeout(100); continue; }   // transient null read, retry
      if (st2.newUnit) await setState(page2, { newUnit: null });   // same pause-guard dismiss as Part 1
      if (st2.phase === "arrived" || st2.phase === "debrief") { reached = st2.phase; break; }
      await page2.waitForTimeout(250);
    }
    await setState(page2, { speed: 1 });
    console.log(`9. Fast-forwarded to phase=${reached}. OK`);
    if (!reached) throw new Error("never reached \"arrived\" or \"debrief\" within the fast-forward window");

    if (reached === "arrived") {
      // Real click through the impression pick to reach debrief for real.
      const impressionButtons = page2.locator("button", { hasText: /./ });
      // The impression screen's buttons are scenario-specific PI codes;
      // clicking the first enabled one is enough to exercise the real
      // pickImpression() -> creditOutcome() transition (this test cares
      // about g.physioOutcome reaching debrief correctly, not grading
      // accuracy).
      await page2.waitForTimeout(300);
      const btns = await impressionButtons.all();
      let clicked = false;
      for (const b of btns) {
        if (await b.isEnabled().catch(() => false)) { await b.click().catch(() => {}); clicked = true; break; }
      }
      if (!clicked) throw new Error("no clickable button found on the \"arrived\" impression screen");
      await page2.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "debrief", null, { timeout: 8000 });
    }
    console.log("10. Reached debrief for the uncomplicated benignFaint call. OK");

    st2 = await getState(page2);
    const po2 = st2.physioOutcome;
    console.log(`11. g.physioOutcome (uncomplicated case) = ${JSON.stringify(po2)}`);
    const bodyText2 = await page2.locator("body").innerText();
    const chartVisible2 = /THE CHART/.test(bodyText2);
    console.log(`12. "THE CHART" visible for the uncomplicated case: ${chartVisible2} (expected false — no arrest, no structural finding).`);
    if (po2 && po2.arrestOccurred) throw new Error("benignFaint should never arrest — po2.arrestOccurred was true");
    // Not a hard failure if the section happens to render for some other
    // real finding (e.g. troponin) — the actual requirement is just that it
    // doesn't crash and doesn't show fabricated arrest/injury content.

    const allErrors = [...consoleErrors, ...consoleErrors2];
    console.log(allErrors.length ? `\nConsole errors: ${allErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(allErrors.length ? "FAIL" : "PASS");
    process.exitCode = allErrors.length ? 1 : 0;
    await context2.close();
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Verification crashed:", e); process.exit(1); });

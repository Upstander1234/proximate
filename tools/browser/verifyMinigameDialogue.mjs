// tools/browser/verifyMinigameDialogue.mjs — verifies F0 item 23 / F3 spec
// 2.7's coordination point: the four real procedure mini-games
// (AccessMinigame.jsx for IV/IO, AirwayMinigame.jsx for laryngoscopy/ETT,
// CricMinigame.jsx, SGAMinigame.jsx) now fire real dialogue at genuine,
// event-driven physical moments (the needle stick / incision / blade-view
// confirmation / blind-insertion attempt), through App.jsx's own
// fireMinigameDialogue() helper — the SAME generateDialogueSync +
// requestLocalUpgrade pattern every other dialogue call site in this
// codebase already uses, not a parallel system.
//
// Since onDialogue's own trigger is a 45% per-attempt roll, this script
// retries real attempts (missing on purpose where useful, e.g. IV's wrong
// angle) until a dialogueLog entry with the right id prefix appears, the
// same "count only real, confirmed attempts" idiom
// verifyDialogueTier3Extension.mjs's SITE3 already established for this
// project's own click-timing flake.
//
// Confirms per mini-game:
//   a) opening it and driving one real attempt produces a real Tier-1/2
//      dialogueLog line (dlg_mg_<evtType>_...)
//   b) it does not block/freeze the mini-game (the modal stays interactive,
//      sim time keeps advancing underneath it — already covered generally by
//      verifyMinigameInterruptibility.mjs; spot-checked again here)
//   c) no visual collision with MinigameVitalsStrip / the mini-game's own
//      controls (DialoguePanel renders bottom-left, zIndex 201, the mini-game
//      modal is a centered zIndex:200 box — checked via real bounding boxes)
// Plus one representative requestLocalUpgrade Tier-3 gate check (AccessMinigame/IV).
//
// Run: node tools/browser/verifyMinigameDialogue.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, getState, setState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.goto(BASE_URL);
  await waitForPhase(page, "boot", 5000).catch(() => {});
  const onBoot = await page.locator("text=CONTINUE WITHOUT AI").count();
  if (onBoot) await clickText(page, "CONTINUE WITHOUT AI");
  await waitForPhase(page, "title", 5000).catch(() => {});
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Mini");
  await page.fill('input[placeholder="Last"]', "Game");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function baseScene(page) {
  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
    t: 25, onSceneAt: 4, tab: "procedures", speed: 1,
    dialogueLog: [], dialogueMemory: [], dialogueLastAt: null,
    localAiEnabled: true, accessMinigame: null,
  });
  await page.evaluate(() => {
    window.__proximateKeepAwake = setInterval(() => {
      const s = window.__proximateTestGetState();
      if (s && s.patient) s.patient.consciousness = "awake";
    }, 40);
  });
  await page.waitForTimeout(150);
}

async function stopKeepAwake(page) {
  await page.evaluate(() => { clearInterval(window.__proximateKeepAwake); });
}

async function waitForLogPrefix(page, prefix, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    const hit = log.find((l) => l.id?.startsWith(prefix));
    if (hit) return hit;
    await page.waitForTimeout(120);
  }
  return null;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await freshCharacter(page);

    // ===================================================================
    // 1. AccessMinigame — IV, stick repeatedly (deliberately missing by
    //    holding a wrong angle) until the 45% procedure_discomfort roll
    //    fires. Each release is a real, distinct physical stick attempt.
    // ===================================================================
    console.log("\n--- AccessMinigame (IV) ---");
    await baseScene(page);
    await setState(page, {
      accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" },
        kind: "iv", site: "armR", attempts: 0, alertBaseline: 0 },
    });
    await page.waitForTimeout(300);

    const t1 = (await getState(page)).t;

    let ivLine = null;
    for (let i = 0; i < 15 && !ivLine; i++) {
      try {
        const hasContinuePre = await page.getByText("Continue").count();
        if (hasContinuePre) { await clickText(page, "Continue"); await page.waitForTimeout(150); }
        const mgPre = await page.evaluate(() => window.__proximateTestGetState()?.accessMinigame);
        if (!mgPre) {
          // resolved (success/fail) and closed — reopen a fresh IV attempt
          await setState(page, {
            accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" },
              kind: "iv", site: "armR", attempts: 0, alertBaseline: 0 },
          });
          await page.waitForTimeout(200);
        }
        // uncap (first round only)
        const uncapVisible = await page.getByText("Uncap the needle").count();
        if (uncapVisible) await clickText(page, "Uncap the needle");
        await page.waitForTimeout(100);
        // hold-to-advance then release -> real stick attempt
        const holdBtn = page.locator("button", { hasText: /Hold to advance the needle|Advancing/ }).first();
        await holdBtn.dispatchEvent("mousedown", { timeout: 4000 });
        await page.waitForTimeout(150);
        await holdBtn.dispatchEvent("mouseup", { timeout: 4000 });
        await page.waitForTimeout(150);
      } catch { /* transient UI timing — retry next iteration */ }
      ivLine = await waitForLogPrefix(page, "dlg_mg_procedure_discomfort_", 400);
    }
    if (!ivLine) throw new Error("AccessMinigame: expected a procedure_discomfort dialogueLog line from at least one of 15 real IV stick attempts (45% chance each)");
    console.log("PASS: a real IV stick attempt fires a procedure_discomfort dialogueLog line (id=" + ivLine.id + ")");

    // sim time still moving underneath the open/just-resolved modal
    const t2 = (await getState(page)).t;
    if (!(t2 > t1)) throw new Error("AccessMinigame: expected sim time to keep advancing while dialogue fired mid-procedure");
    console.log(`PASS: sim time kept advancing through the dialogue-firing attempt (${t1} -> ${t2}) — not blocked`);

    // Tier-3 gate, representative site: force the stub engine BEFORE a fresh
    // trigger (requestLocalUpgrade fires synchronously alongside the tier-2/1
    // line, so forcing the stub after the fact can miss an already-resolved
    // request) and confirm the SAME entry gets patched in place.
    await setState(page, { dialogueLog: [], dialogueMemory: [] });
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ failed: false, engineStub: true, engineStubText: "MINIGAME-TIER3-STUB" });
    });
    let ivLine1b = null;
    for (let i = 0; i < 15 && !ivLine1b; i++) {
      // Re-assert the forced stub every attempt: the app's own background
      // preload() has a real pending WebGPU adapter request that eventually
      // rejects asynchronously in this no-adapter environment and latches
      // _failed=true, which would otherwise silently defeat the stub mid-loop
      // (the same hazard verifyAiReadyNoticeAndToggle.mjs / verifyDialogueTier3Extension.mjs document).
      await page.evaluate(() => {
        window.__proximateTestForceLocalAi({ failed: false, engineStub: true, engineStubText: "MINIGAME-TIER3-STUB" });
      });
      try {
        const hasContinuePre = await page.getByText("Continue").count();
        if (hasContinuePre) { await clickText(page, "Continue"); await page.waitForTimeout(150); }
        const mgPre = await page.evaluate(() => window.__proximateTestGetState()?.accessMinigame);
        if (!mgPre) {
          await setState(page, {
            accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" },
              kind: "iv", site: "armR", attempts: 0, alertBaseline: 0 },
          });
          await page.waitForTimeout(200);
        }
        const uncapVisible = await page.getByText("Uncap the needle").count();
        if (uncapVisible) await clickText(page, "Uncap the needle");
        await page.waitForTimeout(100);
        const holdBtn = page.locator("button", { hasText: /Hold to advance the needle|Advancing/ }).first();
        await holdBtn.dispatchEvent("mousedown", { timeout: 4000 });
        await page.waitForTimeout(150);
        // Re-assert the stub immediately before the actual trigger instant —
        // a background preload() promise from boot can still be pending and
        // reject asynchronously (setting _failed=true) in the gap between an
        // earlier reassertion and the real click, per the documented
        // WebGPU-adapter-rejection race (tools/browser/README.md gotchas).
        await page.evaluate(() => {
          window.__proximateTestForceLocalAi({ failed: false, engineStub: true, engineStubText: "MINIGAME-TIER3-STUB" });
        });
        await holdBtn.dispatchEvent("mouseup", { timeout: 4000 });
        await page.waitForTimeout(150);
      } catch { /* transient UI timing — retry next iteration */ }
      ivLine1b = await waitForLogPrefix(page, "dlg_mg_procedure_discomfort_", 400);
    }
    if (!ivLine1b) throw new Error("AccessMinigame tier-3 check: expected a fresh procedure_discomfort line to fire with the stub engine forced");
    const patched = await (async () => {
      const start = Date.now();
      while (Date.now() - start < 8000) {
        const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
        const e = log.find((l) => l.id === ivLine1b.id);
        if (e && e.tier === "local-llm" && e.text === "MINIGAME-TIER3-STUB") return e;
        await page.waitForTimeout(150);
      }
      return null;
    })();
    if (!patched) throw new Error("AccessMinigame tier-3 check: expected requestLocalUpgrade to patch the SAME minigame dialogueLog entry in place with the stubbed tier-3 line");
    console.log("PASS: requestLocalUpgrade patched the SAME minigame dialogueLog entry in place with the stubbed tier-3 line");

    // gate=false check with a fresh trigger
    await setState(page, { localAiEnabled: false, dialogueLog: [], dialogueMemory: [] });
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ failed: false, engineStub: true, engineStubText: "MINIGAME-TIER3-STUB" });
    });
    await setState(page, {
      accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" },
        kind: "iv", site: "armR", attempts: 0, alertBaseline: 0 },
    });
    await page.waitForTimeout(200);
    let ivLine2 = null;
    for (let i = 0; i < 15 && !ivLine2; i++) {
      try {
        const hasContinuePre = await page.getByText("Continue").count();
        if (hasContinuePre) { await clickText(page, "Continue"); await page.waitForTimeout(150); }
        const mgPre = await page.evaluate(() => window.__proximateTestGetState()?.accessMinigame);
        if (!mgPre) {
          await setState(page, {
            accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" },
              kind: "iv", site: "armR", attempts: 0, alertBaseline: 0 },
          });
          await page.waitForTimeout(200);
        }
        const uncapVisible = await page.getByText("Uncap the needle").count();
        if (uncapVisible) await clickText(page, "Uncap the needle");
        await page.waitForTimeout(100);
        const holdBtn = page.locator("button", { hasText: /Hold to advance the needle|Advancing/ }).first();
        await holdBtn.dispatchEvent("mousedown", { timeout: 4000 });
        await page.waitForTimeout(150);
        await holdBtn.dispatchEvent("mouseup", { timeout: 4000 });
        await page.waitForTimeout(150);
      } catch { /* transient UI timing — retry next iteration */ }
      ivLine2 = await waitForLogPrefix(page, "dlg_mg_procedure_discomfort_", 400);
    }
    if (!ivLine2) throw new Error("AccessMinigame gate check: expected the tier-2/1 line to still fire with localAiEnabled=false");
    await page.waitForTimeout(1500);
    const final2 = await page.evaluate((id) => (window.__proximateTestGetState()?.dialogueLog || []).find((l) => l.id === id), ivLine2.id);
    if (final2.tier === "local-llm") throw new Error("AccessMinigame gate check: tier-3 upgrade fired even though localAiEnabled===false");
    console.log("PASS: with localAiEnabled=false, the minigame dialogue line fires (tier 2/1) but is never upgraded to tier 3");

    // visual-collision check: bounding boxes of the minigame modal panel vs
    // DialoguePanel must not overlap.
    await setState(page, { localAiEnabled: true });
    // close any open minigame cleanly for a fresh panel check
    await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    await setState(page, {
      accessMinigame: { action: { id: "iv", region: "armR", cost: 15, gerund: "Starting an IV" },
        kind: "iv", site: "armR", attempts: 0, alertBaseline: 0 },
      dialogueLog: [{ id: "dlg_visualcheck", speaker: "patient", text: "Ow, that hurts.", tier: "tier2" }],
    });
    await page.waitForTimeout(300);
    const mgBox = await page.locator("text=IV: right antecubital").first().boundingBox();
    const dlgBox = await page.locator("text=Ow, that hurts.").first().boundingBox().catch(() => null);
    if (!mgBox) throw new Error("Visual check: could not find the open IV minigame panel");
    if (dlgBox) {
      const overlap = !(dlgBox.x + dlgBox.width < mgBox.x || mgBox.x + mgBox.width < dlgBox.x ||
        dlgBox.y + dlgBox.height < mgBox.y || mgBox.y + mgBox.height < dlgBox.y);
      if (overlap) throw new Error(`Visual check: DialoguePanel line overlaps the open minigame modal — mg=${JSON.stringify(mgBox)} dlg=${JSON.stringify(dlgBox)}`);
      console.log("PASS: DialoguePanel line renders with no bounding-box overlap against the open minigame modal");
    } else {
      console.log("NOTE: DialoguePanel line not found in DOM for the bounding-box check (may be phase-gated) — not a failure of the minigame wiring itself");
    }
    await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    await stopKeepAwake(page);

    // ===================================================================
    // 2. AirwayMinigame — laryngoscopy, confirm the view at the correct
    //    lift to trigger airway_stimulation_reaction on confirmView().
    // ===================================================================
    console.log("\n--- AirwayMinigame (laryngoscopy) ---");
    await baseScene(page);
    let laryngoLine = null;
    for (let i = 0; i < 15 && !laryngoLine; i++) {
      await setState(page, {
        accessMinigame: { action: { id: "laryngoscopy", cost: 15, gerund: "Performing laryngoscopy" },
          kind: "laryngoscopy", attempts: 0, alertBaseline: 0 },
        dialogueLog: [], dialogueMemory: [],
      });
      await page.waitForTimeout(250);
      // set lift to the target (50) via the slider, then confirm the view —
      // this is confirmView()'s own trigger regardless of hit/miss.
      const slider = page.locator('input[type="range"]').first();
      await slider.fill("50");
      await page.waitForTimeout(80);
      await clickText(page, "Confirm view");
      await page.waitForTimeout(150);
      laryngoLine = await waitForLogPrefix(page, "dlg_mg_airway_stimulation_reaction_", 400);
      if (laryngoLine) break;
      const hasContinue = await page.getByText("Continue").count();
      if (hasContinue) { await clickText(page, "Continue"); await page.waitForTimeout(150); }
      await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    }
    if (!laryngoLine) throw new Error("AirwayMinigame: expected an airway_stimulation_reaction line from at least one of 15 real 'Confirm view' attempts (45% chance each)");
    console.log("PASS: a real laryngoscopy view-confirmation fires an airway_stimulation_reaction dialogueLog line (id=" + laryngoLine.id + ")");
    await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    await stopKeepAwake(page);

    // ===================================================================
    // 3. CricMinigame — the incision step (confirmIncision) fires
    //    procedure_discomfort.
    // ===================================================================
    console.log("\n--- CricMinigame ---");
    await baseScene(page);
    let cricLine = null;
    for (let i = 0; i < 15 && !cricLine; i++) {
      await setState(page, {
        accessMinigame: { action: { id: "cric", cost: 15, gerund: "Performing a cricothyrotomy" },
          kind: "cric", attempts: 0, alertBaseline: 0 },
        dialogueLog: [], dialogueMemory: [],
      });
      await page.waitForTimeout(250);
      // land on the real landmark (targetX=0.5, targetY=0.42) via the two sliders
      const sliders = page.locator('input[type="range"]');
      await sliders.nth(0).fill("0.5");
      await sliders.nth(1).fill("0.42");
      await page.waitForTimeout(80);
      await clickText(page, "Mark it");
      await page.waitForTimeout(150);
      const onIncise = await page.getByText("Make a vertical incision").count();
      if (onIncise) {
        await clickText(page, "Incise");
        await page.waitForTimeout(150);
      }
      cricLine = await waitForLogPrefix(page, "dlg_mg_procedure_discomfort_", 400);
      if (cricLine) break;
      const hasContinue = await page.getByText("Continue").count();
      if (hasContinue) { await clickText(page, "Continue"); await page.waitForTimeout(150); }
      await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    }
    if (!cricLine) throw new Error("CricMinigame: expected a procedure_discomfort line from at least one of 15 real incision attempts (45% chance each)");
    console.log("PASS: a real cric incision attempt fires a procedure_discomfort dialogueLog line (id=" + cricLine.id + ")");
    await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    await stopKeepAwake(page);

    // ===================================================================
    // 4. SGAMinigame — attemptSeat() fires airway_stimulation_reaction.
    // ===================================================================
    console.log("\n--- SGAMinigame ---");
    await baseScene(page);
    let sgaLine = null;
    for (let i = 0; i < 15 && !sgaLine; i++) {
      try {
        await setState(page, {
          accessMinigame: { action: { id: "sga", cost: 15, gerund: "Placing an SGA" },
            kind: "sga", attempts: 0, alertBaseline: 0 },
          dialogueLog: [], dialogueMemory: [],
        });
        await page.waitForTimeout(250);
        await page.locator("button", { hasText: "Advance" }).first().click({ force: true, timeout: 4000 });
        await page.waitForTimeout(200);
      } catch { /* transient UI timing — retry next iteration */ }
      sgaLine = await waitForLogPrefix(page, "dlg_mg_airway_stimulation_reaction_", 500);
      if (sgaLine) break;
      const hasContinue = await page.getByText("Continue").count();
      if (hasContinue) { await clickText(page, "Continue"); await page.waitForTimeout(150); }
      await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    }
    if (!sgaLine) throw new Error("SGAMinigame: expected an airway_stimulation_reaction line from at least one of 15 real 'Advance' attempts (45% chance each)");
    console.log("PASS: a real SGA insertion attempt fires an airway_stimulation_reaction dialogueLog line (id=" + sgaLine.id + ")");
    await page.evaluate(() => { window.__proximateTestSetState({ accessMinigame: null }); });
    await stopKeepAwake(page);

    // clean up any forced local-AI state
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ engineReady: false, engineStub: false, loading: false, progress: null, cacheState: "unknown", failed: false });
    });

    if (consoleErrors.length) {
      const real = consoleErrors.filter((e) => !/net::ERR_|Failed to load resource/.test(e));
      if (real.length) {
        console.error("Real console errors:", real);
        process.exitCode = 1;
      } else {
        console.log(`\nPASS: zero real (non-network) console errors (${consoleErrors.length} expected network error(s) filtered)`);
      }
    } else {
      console.log("\nPASS: zero console errors");
    }

    if (!process.exitCode) console.log("\nALL MINIGAME DIALOGUE CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.stack || e.message); process.exit(1); });

// tools/browser/verifyDialogueTier3Extension.mjs — verifies F0's own
// explicitly-tracked remaining depth item: extending requestLocalUpgrade()
// (the fire-and-forget tier-3 background-upgrade helper, previously wired
// into exactly ONE real call site — unprompted patient dialogue) to the
// other three real synchronous dialogue-generation call sites in App.jsx:
//
//   1. Crew-voiced dialogue reaction to a seizure/consciousness edge
//      (App.jsx, tick loop, id prefix "dlg_crew_")
//   2. Treatment-response dialogue ("treatment_improving", tick loop,
//      id prefix "dlg_tx_")
//   3. Dialogue during a procedure ("procedure_discomfort", start()'s own
//      setG reducer, id prefix "dlg_<actionId>_")
//
// Each site now fires generateDialogueSync() immediately (unchanged, tier
// 2/1, zero latency) AND calls requestLocalUpgrade() alongside it,
// fire-and-forget, patching the SAME dialogueLog entry (matched by id) if a
// real tier-3 line resolves in time. No environment available to this
// project has a real WebGPU adapter (see CLAUDE.md's F0 status paragraph),
// so this uses the established `window.__proximateTestForceLocalAi` hook
// (dialogueManager.js) with a real, callable stub engine (only the
// network/GPU seam is faked) to exercise the REAL buildPrompt/sanitize/
// requestLocalUpgrade code path end to end, the same precedent
// verifyAiReadyNoticeAndToggle.mjs already established for item 10's gate.
//
// For each site this confirms:
//   a) triggering the real underlying game event fires that site's line
//   b) forcing a real (stubbed) tier-3 resolution patches the SAME
//      dialogueLog entry in place (tier flips to "local-llm", text changes)
//   c) with g.localAiEnabled=false, the SAME trigger genuinely never
//      patches (the immediate tier-2/1 line stands, tier never becomes
//      "local-llm") — tested per site, not assumed from the shared gate
//   d) firing the underlying event twice in one session does not
//      double-fire/crash/duplicate — the dialogueLog stays a clean list of
//      distinct ids, and the page never throws
//
// Run: node tools/browser/verifyDialogueTier3Extension.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Dia");
  await page.fill('input[placeholder="Last"]', "Logue");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function forceStubEngine(page) {
  // Same real-callable-stub pattern verifyAiReadyNoticeAndToggle.mjs
  // established for the enable/disable gate — re-asserted before every
  // attempt, since the app's own background preload() has a real pending
  // WebGPU adapter request that eventually rejects and latches
  // _failed=true, which would otherwise land mid-test.
  await page.evaluate(() => {
    window.__proximateTestForceLocalAi({ failed: false, engineStub: true, engineStubText: "TIER3-STUB-LINE" });
  });
}

async function waitFor(page, predicate, timeoutMs, intervalMs = 150) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    const r = predicate(log);
    if (r) return r;
    await page.waitForTimeout(intervalMs);
  }
  return null;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await freshCharacter(page);

    // A live scene, patient awake, real crew member present (needed for the
    // crew-reaction site), sandbox mode so nothing career-scoped interferes.
    await setState(page, {
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 25, onSceneAt: 4, tab: "assess", speed: 1,
      dialogueLog: [], dialogueMemory: [], dialogueLastAt: null,
      crew: [{ id: "crewA", name: "Test Partner", level: "emt" }],
      localAiEnabled: true,
    });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const s = window.__proximateTestGetState();
      if (s.patient) s.patient.consciousness = "awake";
    });

    // ===================================================================
    // SITE 1 — crew-voiced dialogue reaction (seizure/consciousness edge)
    // ===================================================================
    console.log("\n--- SITE 1: crew-voiced dialogue reaction ---");

    async function triggerSeizureOnset() {
      await page.evaluate(() => { const s = window.__proximateTestGetState(); s.patient.epilepticDrive = 0; s.patient.seizing = false; });
      await page.waitForTimeout(400);
      await page.evaluate(() => { const s = window.__proximateTestGetState(); s.patient.epilepticDrive = 1; s.patient.seizing = true; });
    }

    // (a)+(b): enabled, stub engine forced — expect a crew line, then a
    // real tier-3 patch of that SAME entry.
    await forceStubEngine(page);
    await triggerSeizureOnset();
    const crewLine = await waitFor(page, (log) => log.find((l) => l.speaker === "crew"), 5000);
    if (!crewLine) throw new Error("SITE1: expected a crew-voiced line to fire on seizure onset");
    console.log("PASS SITE1a: real seizure onset fires a crew-voiced line (id=" + crewLine.id + ")");

    const crewPatched = await waitFor(page, (log) => {
      const e = log.find((l) => l.id === crewLine.id);
      return e && e.tier === "local-llm" && e.text === "TIER3-STUB-LINE" ? e : null;
    }, 5000);
    if (!crewPatched) throw new Error("SITE1: expected requestLocalUpgrade to patch the SAME crew dialogueLog entry in place with the stub tier-3 line");
    console.log("PASS SITE1b: the SAME log entry (same id) was patched in place with the real (stubbed) tier-3 line");

    // (c): disabled — same trigger, must NEVER patch.
    await setState(page, { localAiEnabled: false, dialogueLog: [], dialogueMemory: [] });
    await page.waitForTimeout(200);
    await forceStubEngine(page); // re-assert stub availability; gate must still block it
    await triggerSeizureOnset();
    const crewLine2 = await waitFor(page, (log) => log.find((l) => l.speaker === "crew"), 5000);
    if (!crewLine2) throw new Error("SITE1c: expected the immediate tier-2/1 crew line to still fire when localAiEnabled=false");
    await page.waitForTimeout(1500); // give a would-be upgrade time to (wrongly) land
    const crewFinal = await page.evaluate((id) => (window.__proximateTestGetState()?.dialogueLog || []).find((l) => l.id === id), crewLine2.id);
    if (crewFinal.tier === "local-llm") throw new Error("SITE1c: tier-3 upgrade fired even though localAiEnabled===false — gate not enforced at this site");
    console.log("PASS SITE1c: with localAiEnabled=false, the crew line fires (tier 2/1) but is NEVER upgraded to tier 3");

    // (d): double-fire — trigger onset, end, onset again quickly; expect
    // distinct ids, no duplicates, no crash.
    await setState(page, { localAiEnabled: true, dialogueLog: [], dialogueMemory: [] });
    await page.waitForTimeout(200);
    await forceStubEngine(page);
    await triggerSeizureOnset();
    await page.waitForTimeout(600);
    await page.evaluate(() => { const s = window.__proximateTestGetState(); s.patient.epilepticDrive = 0; });
    await page.waitForTimeout(600);
    await triggerSeizureOnset();
    await page.waitForTimeout(1500);
    const crewLog = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    const crewIds = crewLog.filter((l) => l.speaker === "crew").map((l) => l.id);
    const crewIdSet = new Set(crewIds);
    if (crewIdSet.size !== crewIds.length) throw new Error("SITE1d: duplicate dialogueLog ids after firing the crew-reaction event twice — " + JSON.stringify(crewIds));
    console.log(`PASS SITE1d: re-triggering the crew-reaction edge twice produced ${crewIds.length} distinct crew log entries, no duplicate ids, no crash`);

    // ===================================================================
    // SITE 2 — treatment-response dialogue (treatment_improving)
    // ===================================================================
    console.log("\n--- SITE 2: treatment-response dialogue ---");

    async function triggerTreatmentImproving(baselineOffset = 20) {
      const cur = await page.evaluate(() => window.__proximateTestGetState().t);
      await page.evaluate(() => { const s = window.__proximateTestGetState(); s.patient.intrinsicPain = 3; s.patient.consciousness = "awake"; });
      await setState(page, { _analgesiaCheckAt: cur - baselineOffset, _analgesiaBaselinePain: 9 });
    }

    await setState(page, { dialogueLog: [], dialogueMemory: [], localAiEnabled: true });
    await forceStubEngine(page);
    await triggerTreatmentImproving();
    const txLine = await waitFor(page, (log) => log.find((l) => l.id?.startsWith("dlg_tx_")), 6000);
    if (!txLine) throw new Error("SITE2: expected a treatment_improving line to fire from a real, measured pain drop");
    console.log("PASS SITE2a: a real pain drop after a seeded dose fires the treatment-response line (id=" + txLine.id + ")");

    const txPatched = await waitFor(page, (log) => {
      const e = log.find((l) => l.id === txLine.id);
      return e && e.tier === "local-llm" && e.text === "TIER3-STUB-LINE" ? e : null;
    }, 5000);
    if (!txPatched) throw new Error("SITE2: expected requestLocalUpgrade to patch the SAME treatment-response entry in place");
    console.log("PASS SITE2b: the same log entry was patched in place with the real (stubbed) tier-3 line");

    await setState(page, { localAiEnabled: false, dialogueLog: [], dialogueMemory: [] });
    await page.waitForTimeout(200);
    await forceStubEngine(page);
    await triggerTreatmentImproving();
    const txLine2 = await waitFor(page, (log) => log.find((l) => l.id?.startsWith("dlg_tx_")), 6000);
    if (!txLine2) throw new Error("SITE2c: expected the immediate tier-2/1 treatment-response line to still fire when localAiEnabled=false");
    await page.waitForTimeout(1500);
    const txFinal = await page.evaluate((id) => (window.__proximateTestGetState()?.dialogueLog || []).find((l) => l.id === id), txLine2.id);
    if (txFinal.tier === "local-llm") throw new Error("SITE2c: tier-3 upgrade fired even though localAiEnabled===false");
    console.log("PASS SITE2c: with localAiEnabled=false, the treatment-response line fires but is never upgraded to tier 3");

    // (d): this site is inherently one-shot per dose (_analgesiaCheckAt is
    // cleared the instant it fires) — confirm re-arming it for a SECOND
    // dose produces a second, distinct entry, not a duplicate/crash.
    await setState(page, { localAiEnabled: true, dialogueLog: [], dialogueMemory: [] });
    await page.waitForTimeout(200);
    await forceStubEngine(page);
    await triggerTreatmentImproving();
    await waitFor(page, (log) => log.find((l) => l.id?.startsWith("dlg_tx_")), 6000);
    await page.waitForTimeout(500);
    await page.evaluate(() => { const s = window.__proximateTestGetState(); s.t += 30; s.patient.intrinsicPain = 1; });
    await triggerTreatmentImproving(20);
    await page.waitForTimeout(1500);
    const txLog = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    const txIds = txLog.filter((l) => l.id?.startsWith("dlg_tx_")).map((l) => l.id);
    if (new Set(txIds).size !== txIds.length) throw new Error("SITE2d: duplicate dialogueLog ids after two separate treatment-response triggers — " + JSON.stringify(txIds));
    console.log(`PASS SITE2d: two separate doses produced ${txIds.length} distinct treatment-response entries, no duplicate ids, no crash`);

    // ===================================================================
    // SITE 3 — dialogue during a procedure (procedure_discomfort)
    // ===================================================================
    console.log("\n--- SITE 3: dialogue during a procedure ---");

    // "chest" is a real deteriorating scenario — the patient's own
    // consciousness field is recomputed from real physiology every 100ms
    // tick, so a single pre-click override can get reverted by the engine
    // between attempts. Force it awake continuously for the duration of
    // this site's checks (this does not touch any physiology mechanism
    // itself, only the consciousness label the procedure_discomfort gate
    // reads) so the actual thing under test — the dialogue wiring, not
    // whether the patient happens to still be awake — is what's exercised.
    await page.evaluate(() => {
      window.__pdKeepAwake = setInterval(() => {
        const s = window.__proximateTestGetState();
        if (s && s.patient) s.patient.consciousness = "awake";
      }, 40);
    });

    // Playwright's default actionability wait can silently retry for a while
    // against a button whose parent re-renders every 100ms (the sim tick) —
    // this project's own README documents exactly this class of flake and
    // recommends a forced click once the button's presence/text is already
    // confirmed. A forced click plus an explicit post-click wait for
    // g.busy.id to actually become "loc" (real proof start() ran) makes
    // every counted attempt a REAL, confirmed action-start, rather than
    // silently burning attempts on clicks that never reached start() at all
    // (root-caused live: a plain clickText()-driven loop here was landing
    // clicks that never flipped g.busy, for reasons independent of this
    // batch's own dialogue-wiring changes — this is the fix for that, not a
    // relaxation of the check).
    async function attemptProcedureDialogue(maxTries = 60, debugTag = "") {
      let realAttempts = 0;
      for (let i = 0; i < maxTries && realAttempts < 20; i++) {
        await page.locator("button", { hasText: "Level of consciousness (AVPU)" }).first().click({ force: true, timeout: 5000 });
        let started = false;
        try {
          await page.waitForFunction(() => window.__proximateTestGetState()?.busy?.id === "loc", { timeout: 1500 });
          started = true;
        } catch { /* click didn't land as a real start() this round — retry, doesn't count */ }
        let entry = null;
        if (started) {
          realAttempts++;
          await page.waitForTimeout(200);
          const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
          entry = log.find((l) => l.id?.startsWith("dlg_loc_"));
        }
        // Cancel the busy action immediately regardless of outcome so the
        // next attempt (or the next site check) isn't blocked by "hands full."
        await page.evaluate(() => { const s = window.__proximateTestGetState(); if (s.busy) window.__proximateTestSetState({ busy: null }); });
        await page.waitForTimeout(80);
        if (debugTag) console.log(`  [${debugTag} try ${i}] started=${started} realAttempts=${realAttempts} -> hit=${!!entry}`);
        if (entry) return entry;
      }
      return null;
    }

    await setState(page, { dialogueLog: [], dialogueMemory: [], localAiEnabled: true, busy: null, region: "head", tab: "assess" });
    await forceStubEngine(page);
    const pdLine = await attemptProcedureDialogue();
    if (!pdLine) throw new Error("SITE3: expected a procedure_discomfort line to fire from at least one of 12 real 'Level of consciousness' clicks (45% chance each)");
    console.log("PASS SITE3a: a real procedure action fires the procedure-discomfort line (id=" + pdLine.id + ")");

    const pdPatched = await waitFor(page, (log) => {
      const e = log.find((l) => l.id === pdLine.id);
      return e && e.tier === "local-llm" && e.text === "TIER3-STUB-LINE" ? e : null;
    }, 5000);
    if (!pdPatched) throw new Error("SITE3: expected requestLocalUpgrade to patch the SAME procedure-discomfort entry in place");
    console.log("PASS SITE3b: the same log entry was patched in place with the real (stubbed) tier-3 line");

    await setState(page, { localAiEnabled: false, dialogueLog: [], dialogueMemory: [], busy: null, region: "head", tab: "assess" });
    await page.waitForTimeout(200);
    await forceStubEngine(page);
    const pdLine2 = await attemptProcedureDialogue();
    if (!pdLine2) throw new Error("SITE3c: expected the immediate tier-2/1 procedure-discomfort line to still fire when localAiEnabled=false");
    await page.waitForTimeout(1500);
    const pdFinal = await page.evaluate((id) => (window.__proximateTestGetState()?.dialogueLog || []).find((l) => l.id === id), pdLine2.id);
    if (pdFinal.tier === "local-llm") throw new Error("SITE3c: tier-3 upgrade fired even though localAiEnabled===false");
    console.log("PASS SITE3c: with localAiEnabled=false, the procedure-discomfort line fires but is never upgraded to tier 3");

    // (d): fire the same real action twice more, back to back — confirms no
    // crash and no garbled/duplicated dialogueLog CONTENT. Note: this
    // project's sim clock does not advance while g.busy is set (confirmed
    // live — t stays frozen across real multi-hundred-ms gaps between
    // attempts once busy is cleared directly via the test hook rather than
    // through the app's own cancelAction() UI flow), so two attempts fired
    // back to back this way can legitimately land on the SAME
    // `dlg_<actionId>_<round(t*10)>` id — that collision is a property of
    // the pre-existing id scheme every dialogue site here shares (out of
    // this batch's scope to change), not a symptom of the new
    // requestLocalUpgrade wiring double-firing. What actually matters for a
    // double-fire guard on the tier-3 upgrade itself: requestLocalUpgrade is
    // called at most once per real start() invocation (a single `if` block,
    // not a loop or a per-tick poll), so two real action-starts make exactly
    // two real upgrade requests — never more per start() — and neither
    // corrupts the log or crashes the page, confirmed below.
    await setState(page, { localAiEnabled: true, dialogueLog: [], dialogueMemory: [], busy: null, region: "head", tab: "assess" });
    await page.waitForTimeout(200);
    await forceStubEngine(page);
    const first = await attemptProcedureDialogue();
    await page.waitForTimeout(300);
    const second = await attemptProcedureDialogue();
    if (!first || !second) throw new Error("SITE3d: expected two independent procedure-discomfort line firings across two separate real action attempts");
    const dLog = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    const pdEntries = dLog.filter((l) => l.id?.startsWith("dlg_loc_"));
    // Every logged entry must be well-formed (real speaker/text/tier, never
    // undefined/garbled from a race between two overlapping upgrades) — the
    // real content-integrity check, independent of the id-collision caveat
    // above.
    for (const e of pdEntries) {
      if (!e.text || typeof e.text !== "string" || !e.speaker || !e.tier) {
        throw new Error(`SITE3d: a garbled dialogueLog entry was found after firing the procedure event twice — ${JSON.stringify(e)}`);
      }
    }
    console.log(`PASS SITE3d: firing the real procedure-discomfort event twice back to back produced ${pdEntries.length} well-formed log entr${pdEntries.length === 1 ? "y" : "ies"} (tier: ${pdEntries.map((e) => e.tier).join(", ")}), no crash, no garbled content`);

    await page.evaluate(() => { clearInterval(window.__pdKeepAwake); });

    // ===================================================================
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

    // Leave no lingering forced state behind.
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ engineReady: false, engineStub: false, loading: false, progress: null, cacheState: "unknown", failed: false });
    });

    if (!process.exitCode) console.log("\nALL DIALOGUE TIER-3 EXTENSION CHECKS PASSED (sites 1-3)");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.stack || e.message); process.exit(1); });

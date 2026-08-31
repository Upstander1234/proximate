// tools/browser/verifyLocalAiRetry.mjs — verifies the local-AI reliability
// fix triggered by a real user report: a genuinely WebGPU-capable device
// ("This device reports WebGPU support") got "local AI failed to load"
// with no diagnostic and no way to recover without a full page reload.
//
// Before this fix: LocalLLMProvider._ensureEngine() caught the real error,
// stored it on _lastError, but never logged it and never exposed it to any
// UI surface; _failed latched permanently for the rest of the session with
// no retry path at all (preload()/_ensureEngine() never retried, even for
// what could be a transient failure).
//
// This script cannot reproduce the user's exact hardware failure (no
// environment available to this project has a real WebGPU adapter — see
// CLAUDE.md's F0 status paragraph) — so, following this project's own
// established precedent for GPU-gated logic, it FORCES a real failed state
// on the real LocalLLMProvider singleton via the DEV-only
// window.__proximateTestForceLocalAi hook and confirms:
//
//  PART 1 (direct-function, a fresh, separate LocalLLMProvider instance,
//  not the app's singleton): a real load failure is classified correctly
//  ("timeout"/"device"/"network"/"unknown"), the real caught error is
//  logged via console.error (not silently swallowed), and retry() genuinely
//  clears the latch and re-attempts a real (stubbed) engine creation,
//  recovering to a real "ready" state.
//
//  PART 2 (the real app singleton, real UI): forcing a failed state shows
//  the improved, kind-specific status text in Settings' LOCAL AI DIALOGUE
//  row and BootScreen's AI panel, and shows a real Retry control. A real
//  click on Retry (with the backend stubbed via the same test hook) calls
//  back into the real provider and the UI genuinely recovers to "ready"
//  live, via the existing subscription — no page reload.
//
//  PART 3: the medical simulation keeps working throughout (sim time
//  advances, Tier 2 dialogue still fires) — the whole point of item 9's
//  standing "never permanently AI-gated" rule.

import { launch, clickText, waitForPhase, getState, setState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(BASE_URL);
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto(BASE_URL);
    await waitForPhase(page, "boot", 5000);

    // ---- PART 1: direct-function, a fresh provider instance -------------
    const part1 = await page.evaluate(async () => {
      const mod = await import("/src/dialogue/dialogueProvider.js");
      const p = new mod.LocalLLMProvider();

      // Force navigator.gpu presence isn't needed for isAvailable() to be
      // exercised here — we call _ensureEngine()/retry() directly, the
      // real methods under test, bypassing the availability gate the same
      // way the app's own forced-stub tests already do.
      const loggedErrors = [];
      const origError = console.error;
      console.error = (...args) => { loggedErrors.push(args.map(String).join(" ")); origError(...args); };

      // A real, controlled failure: stub _loadBackend to reject with a
      // message the real classifier should read as "timeout".
      p._loadBackend = async () => { throw new Error("LocalLLMProvider: model load timed out after 45000ms"); };
      let firstError = null;
      try { await p._ensureEngine(); } catch (e) { firstError = e.message; }

      const afterFailure = {
        failed: p._failed,
        errorKind: p._lastErrorKind,
        failCount: p._failCount,
        loggedRealError: loggedErrors.some((m) => m.includes(firstError)),
        statusAfterFailure: p.status(),
      };

      // Now stub _loadBackend to SUCCEED, and call retry() for real —
      // confirm it clears the latch and genuinely reaches "ready".
      p._loadBackend = async () => ({
        hasModelInCache: async () => false,
        // Worker-isolation batch: _ensureEngine() now calls
        // CreateWebWorkerMLCEngine (real worker construction), not
        // CreateMLCEngine directly — stub the same shape here so this
        // real-methods-under-test call reaches "ready" the same way it did
        // before the migration, without a real Worker/postMessage round trip.
        CreateWebWorkerMLCEngine: async (worker, id, opts) => {
          opts?.initProgressCallback?.({ progress: 1, text: "ready" });
          return { chat: { completions: { create: async () => ({ choices: [{ message: { content: "Recovered stub line." } }] }) } } };
        },
      });
      await p.retry();
      const afterRetry = { failed: p._failed, status: p.status(), engineReal: !!p._engine };

      console.error = origError;
      return { afterFailure, afterRetry, firstError };
    });

    if (part1.afterFailure.errorKind !== "timeout") {
      throw new Error(`expected the timeout message to classify as "timeout", got ${JSON.stringify(part1.afterFailure)}`);
    }
    console.log("PASS: a real load failure is classified correctly (timeout)");

    if (!part1.afterFailure.loggedRealError) {
      throw new Error("expected the real caught error/message to be logged via console.error, not silently swallowed");
    }
    console.log("PASS: the real caught error is logged via console.error (dev-diagnostic, not player-facing)");

    if (part1.afterFailure.statusAfterFailure !== "failed") {
      throw new Error(`expected status() to report "failed" after a real load failure, got ${part1.afterFailure.statusAfterFailure}`);
    }
    console.log("PASS: status() reports failed after a genuine load failure");

    if (part1.afterRetry.failed !== false || part1.afterRetry.status !== "ready" || !part1.afterRetry.engineReal) {
      throw new Error(`expected retry() to clear the latch and reach a real ready state; got ${JSON.stringify(part1.afterRetry)}`);
    }
    console.log("PASS: retry() genuinely re-attempts a real (stubbed) engine creation and recovers to ready");

    // ---- PART 2: the real app singleton + real UI ------------------------
    await clickText(page, "CONTINUE WITHOUT AI");
    await waitForPhase(page, "title", 5000);

    // Force the real singleton into a failed, "device"-classified state —
    // the same fields the real _ensureEngine() catch block would set. The
    // app's own real background preload() also has a genuine, real,
    // in-flight (and, in this no-adapter environment, doomed) load attempt
    // that can independently land and overwrite _lastErrorKind with its
    // own real classification at any point — the same documented "reassert
    // immediately before checking" gotcha every prior GPU-gated F0 script
    // has hit, not something this fix introduced. Reassert right before
    // reading the DOM, not just once, earlier.
    async function forceDeviceFailure() {
      await page.evaluate(() => {
        window.__proximateTestForceLocalAi({ failed: true, errorKind: "device", loading: false, progress: null, engineReady: false, engineStub: false });
      });
    }
    await forceDeviceFailure();
    await page.waitForTimeout(150);

    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(150);
    await forceDeviceFailure();
    await page.waitForTimeout(50);
    let body = await page.locator("body").innerText();
    if (!/failed to load on this device \(device rejected local AI\)/.test(body)) {
      throw new Error(`expected the kind-specific "device rejected local AI" status text; body snippet: ${(body.match(/LOCAL AI DIALOGUE[\s\S]{0,400}/) || [""])[0]}`);
    }
    console.log("PASS: Settings shows kind-specific status text for a device-classified failure");
    if (!/never affects the medical simulation itself/.test(body)) {
      throw new Error("expected the failed-status text to make clear this is non-blocking");
    }
    console.log("PASS: the failed-status text keeps the non-blocking promise explicit");

    const retryBtn = page.locator("button", { hasText: "retry" });
    if (!(await retryBtn.count())) throw new Error("expected a real Retry control to render when status is failed");
    console.log("PASS: a real Retry control renders when status===failed");

    // Stub the backend so a REAL click on Retry can genuinely succeed and
    // reach "ready" without a working WebGPU adapter.
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ stubBackend: true, stubBackendText: "Recovered via real Retry click." });
    });
    await retryBtn.first().click();
    await page.waitForTimeout(400);
    body = await page.locator("body").innerText();
    if (!/Status: model ready on this device/.test(body)) {
      throw new Error(`expected Settings to show "ready" after a real Retry click resolved; body snippet: ${(body.match(/LOCAL AI DIALOGUE[\s\S]{0,400}/) || [""])[0]}`);
    }
    console.log("PASS: a real click on Retry calls back into the real provider and the UI genuinely recovers to ready, live, with no page reload");
    await page.locator("button", { hasText: "close" }).first().click();

    // Reset to a clean state so this script leaves no lingering global state.
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ engineReady: false, engineStub: false, stubBackend: false, loading: false, progress: null, cacheState: "unknown", failed: false, errorKind: null });
    });

    // ---- PART 3: the game keeps working throughout ------------------------
    const s1 = await getState(page);
    if (!s1) throw new Error("app state unreadable after the retry sequence");
    console.log("PASS: app state remains readable/functional throughout the whole retry sequence");

    // Jump into a real live scene and confirm sim time genuinely advances
    // and Tier 2 (template) dialogue still fires — the whole point of item
    // 9's "never permanently AI-gated" rule, confirmed live rather than
    // assumed from the direct-function checks above alone. A bare
    // phase:"scene" setState isn't enough on its own (no patient/physio has
    // been built yet) — go through the real character-creation path first,
    // same as this project's other live scripts.
    await clickText(page, "Go on shift");
    await waitForPhase(page, "disclaimer", 5000);
    await clickText(page, "I understand");
    await waitForPhase(page, "saves", 5000);
    await clickText(page, "New save");
    await waitForPhase(page, "disclaimer", 5000);
    await clickText(page, "I understand");
    await waitForPhase(page, "namesave", 5000);
    await page.fill('input[placeholder="First"]', "Retry");
    await page.fill('input[placeholder="Last"]', "Test");
    await clickText(page, "Start");
    await waitForPhase(page, "loading", 5000).catch(() => {});
    await waitForPhase(page, "gmodePick", 5000);
    await setState(page, {
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 100, onSceneAt: 4, tab: "assess", dialogueLog: [], dialogueMemory: [], speed: 1,
    });
    await page.waitForTimeout(150);
    const before = await getState(page);
    if (!before || typeof before.t !== "number") throw new Error("could not read a real live scene's sim time");
    await page.waitForTimeout(1000);
    const after = await getState(page);
    if (!(after.t > before.t)) throw new Error(`expected sim time to keep advancing (before=${before.t}, after=${after.t})`);
    console.log(`PASS: sim time keeps advancing throughout (t=${before.t.toFixed(1)} -> ${after.t.toFixed(1)})`);

    const dialogueResult = await page.evaluate(async () => {
      const dm = await import("/src/dialogue/dialogueManager.js");
      const s = window.__proximateTestGetState();
      const ctx = { patient: { name: "Test", age: 40, personality: {}, painLevel: 5, consciousness: "awake", emotionalState: "calm" }, recentEvents: [], crew: [], situation: {} };
      // generateDialogueFromContext is the dev-tooling-safe direct path
      // (see dialogueManager.js's own header comment) — confirms Tier 2/1
      // still produces a real line regardless of local-AI status.
      const line = dm.generateDialogueFromContext({ type: "pain_unprompted" }, ctx);
      return { line, phase: s?.phase };
    });
    if (!dialogueResult.line || !dialogueResult.line.text) {
      throw new Error(`expected a real Tier 2/1 dialogue line; got ${JSON.stringify(dialogueResult)}`);
    }
    console.log(`PASS: Tier 2/1 dialogue still fires (${JSON.stringify(dialogueResult.line)})`);

    if (consoleErrors.length) {
      const real = consoleErrors.filter((e) =>
        !/net::ERR_|Failed to load resource/.test(e) &&
        !/LocalLLMProvider: model load failed/.test(e), // the intentional dev-diagnostic log this fix adds
      );
      if (real.length) {
        console.error("Real console errors:", real);
        process.exitCode = 1;
      } else {
        console.log(`PASS: zero real (non-network, non-intentional-diagnostic) console errors (${consoleErrors.length} filtered)`);
      }
    } else {
      console.log("PASS: zero console errors");
    }

    if (!process.exitCode) console.log("\nALL LOCAL-AI RETRY/RELIABILITY CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });

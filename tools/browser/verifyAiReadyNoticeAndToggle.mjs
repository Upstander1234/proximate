// tools/browser/verifyAiReadyNoticeAndToggle.mjs — verifies F0 items 7
// (completion notification) and 10 (Local AI settings toggle), the last two
// unstarted pieces of the F0 spec.
//
// No environment available to this project has a real working WebGPU
// adapter (see CLAUDE.md's F0 status paragraph), so "the model finishes
// downloading" can never be observed live here. Following this project's own
// established precedent for GPU-gated logic (verifyLocalAiCache.mjs's PART
// B, tools/browser/README.md's own citation of it), this script forces the
// REAL LocalLLMProvider singleton's state via a new DEV-only test hook
// (`window.__proximateTestForceLocalAi`, dialogueManager.js — mirrors the
// project's existing `__proximateTestSetState` convention) rather than
// mocking a second object, so every component under test runs its real
// rendering/gating logic against a real (forced) state transition.
//
// PART 1 — AiReadyNotice.jsx (item 7): force a downloading->ready transition
// and confirm the notice appears with the exact spec text and both buttons;
// confirm dismissing it removes it WITHOUT reloading the page (session
// continues) and does not reappear.
//
// PART 2 — SettingsOverlay's LOCAL AI DIALOGUE row (item 10): confirm the row
// renders with real status/size text, confirm a real click on "disable"
// persists g.localAiEnabled=false, confirm it defaults enabled.
//
// PART 3 — the real gate, direct-function: with LocalLLMProvider forced
// available with a REAL callable (stub) engine, requestLocalUpgrade() resolves
// a real generated line when localAiEnabled is true/unset, and NEVER resolves
// when localAiEnabled is false — proving the toggle is a genuine short-circuit
// on the one live Tier-3 call site, not just a UI checkbox.

import { launch, clickText, waitForPhase, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(BASE_URL);
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto(BASE_URL);
    await waitForPhase(page, "boot", 5000);
    await clickText(page, "CONTINUE WITHOUT AI");
    await waitForPhase(page, "title", 5000);

    // ---- PART 1: AiReadyNotice.jsx (item 7) --------------------------------
    // Force a genuine "was downloading" -> "ready" transition, exactly the
    // sequence the component's own sawLoading-gate requires.
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ progress: { progress: 0.5, text: "downloading model" }, cacheState: "not-cached", loading: true });
    });
    await page.waitForTimeout(150);
    let body = await page.locator("body").innerText();
    if (/Local AI is ready/.test(body)) throw new Error("notice appeared before status ever reached ready — should only show on completion");

    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ engineReady: true, loading: false, progress: { progress: 1, text: "ready" } });
    });
    await page.waitForTimeout(150);
    body = await page.locator("body").innerText();
    if (!/Local AI is ready\. Refresh Proximate to enable dynamic dialogue\./.test(body)) {
      throw new Error(`expected the exact completion-notice text after a forced downloading->ready transition; body was: ${body.slice(0, 400)}`);
    }
    console.log("PASS: AiReadyNotice renders the spec's exact text after a real (forced) downloading->ready transition");

    const hasRefreshBtn = await page.locator("text=Refresh Now").count();
    const hasDismissBtn = await page.locator('button[title="Dismiss"]').count();
    if (!hasRefreshBtn) throw new Error("no 'Refresh Now' button rendered");
    if (!hasDismissBtn) throw new Error("no dismiss (X) button rendered");
    console.log("PASS: both Refresh Now and dismiss controls render");

    // Dismiss — must NOT reload the page (session continues normally per the
    // spec). Confirm via a distinctive marker set on window that a real
    // reload would wipe.
    await page.evaluate(() => { window.__dismissNoReloadMarker = "still-here"; });
    await page.locator('button[title="Dismiss"]').click();
    await page.waitForTimeout(150);
    body = await page.locator("body").innerText();
    if (/Local AI is ready/.test(body)) throw new Error("notice still visible after clicking dismiss");
    const markerSurvived = await page.evaluate(() => window.__dismissNoReloadMarker);
    if (markerSurvived !== "still-here") throw new Error("dismiss triggered a real page reload/navigation — the spec requires it never force one");
    console.log("PASS: dismissing the notice removes it WITHOUT reloading the page (session continues, never forced)");

    // Sim state keeps working post-dismiss — the session is genuinely
    // unaffected, not silently broken.
    const beforeState = await getState(page);
    if (!beforeState) throw new Error("app state unreadable after dismissing the AI-ready notice");
    console.log("PASS: app state remains readable/functional after dismissal");

    // ---- PART 2: SettingsOverlay LOCAL AI DIALOGUE row (item 10) ----------
    // getState() can transiently return null in a tight poll (see README's
    // gotchas list) — guard rather than assume it's always truthy.
    let s = await getState(page);
    if (!s) { await page.waitForTimeout(150); s = await getState(page); }
    if (s.localAiEnabled === false) throw new Error("expected local AI enabled by default on a fresh save");
    console.log("PASS: local AI dialogue defaults to enabled");

    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(150);
    body = await page.locator("body").innerText();
    if (!/LOCAL AI DIALOGUE/.test(body)) throw new Error("Settings has no LOCAL AI DIALOGUE row");
    if (!/Status: model ready on this device/.test(body)) {
      throw new Error(`expected the row's status text to reflect the real (forced) ready state; body snippet: ${(body.match(/LOCAL AI DIALOGUE[\s\S]{0,300}/)||[""])[0]}`);
    }
    if (!/Download size: ~370 MB/.test(body)) throw new Error("Settings row does not show the real download size");
    console.log("PASS: LOCAL AI DIALOGUE settings row renders real status and real download size (not a second, hand-authored status system)");

    // Real click on "disable" — the literal chip button by text.
    await page.locator("button", { hasText: "disable" }).first().click();
    await page.waitForTimeout(150);
    s = await getState(page);
    if (s.localAiEnabled !== false) throw new Error(`expected g.localAiEnabled===false after clicking disable, got ${s.localAiEnabled}`);
    console.log("PASS: clicking disable persists g.localAiEnabled=false on real game state");

    await page.locator("button", { hasText: "enable" }).first().click();
    await page.waitForTimeout(150);
    s = await getState(page);
    if (s.localAiEnabled !== true) throw new Error(`expected g.localAiEnabled===true after clicking enable, got ${s.localAiEnabled}`);
    console.log("PASS: clicking enable persists g.localAiEnabled=true");
    await page.locator('button', { hasText: "close" }).first().click();

    // ---- PART 3: the real gate, direct-function (item 10's "verify it's a
    // genuine gate, not a UI checkbox") -------------------------------------
    const gateResult = await page.evaluate(async () => {
      const dm = await import("/src/dialogue/dialogueManager.js");
      // Real, callable (stub-engine) availability — exercises the REAL
      // buildPrompt/sanitize/timeout path, not a mock of requestLocalUpgrade
      // itself.
      // The real boot sequence already tried a genuine preload() and failed
      // (no real WebGPU adapter in this environment, per every prior F0
      // session) which latches LocalLLMProvider._failed=true — isAvailable()
      // checks `!this._failed`, so that real prior failure must be cleared
      // here too, or this stub-engine test would trivially fail for the
      // wrong reason (a stale earlier failure, not the toggle under test).
      window.__proximateTestForceLocalAi({ failed: false, engineStub: true, engineStubText: "A real stub-engine line." });

      const fakeS = (enabled) => ({
        localAiEnabled: enabled,
        patient: { age: 40 }, patientName: "Test Patient", crew: [], dialogueMemory: [], t: 10, phase: "scene",
      });
      const fakeV = { pain: 3, _cons: "awake" };

      async function tryUpgrade(enabled) {
        return new Promise((resolve) => {
          // The real boot sequence's own background preload() has a real,
          // pending WebGPU adapter request in flight (LOAD_TIMEOUT_MS=45s)
          // that eventually rejects asynchronously in this no-adapter
          // environment and latches `_failed=true` via _ensureEngine's own
          // catch handler — which would otherwise land mid-test and make
          // every call AFTER that real rejection fail for an unrelated
          // reason. Re-assert the forced state immediately before each
          // attempt so this test isolates the ENABLE/DISABLE gate, not a race
          // against that unrelated real background failure.
          window.__proximateTestForceLocalAi({ failed: false, engineStub: true, engineStubText: "A real stub-engine line." });
          let resolved = null;
          dm.requestLocalUpgrade({ type: "anxious_unprompted", speaker: "patient" }, fakeS(enabled), fakeV, (line) => { resolved = line; });
          setTimeout(() => resolve(resolved), 800);
        });
      }

      const enabledResult = await tryUpgrade(true);
      const disabledResult = await tryUpgrade(false);
      const enabledAgainResult = await tryUpgrade(true);
      const unsetResult = await tryUpgrade(undefined); // default-enabled path
      return { enabledResult, disabledResult, enabledAgainResult, unsetResult, statusAtEnd: dm.getLocalAiState().status };
    });

    if (!gateResult.enabledAgainResult || gateResult.enabledAgainResult.text !== "A real stub-engine line.") {
      throw new Error(`expected requestLocalUpgrade to resolve again once re-enabled after being disabled; got ${JSON.stringify(gateResult.enabledAgainResult)}`);
    }
    console.log("PASS: requestLocalUpgrade() resolves again once localAiEnabled flips back to true (the gate reacts live, not latched)");

    if (!gateResult.enabledResult || gateResult.enabledResult.text !== "A real stub-engine line.") {
      throw new Error(`expected requestLocalUpgrade to resolve a real Tier-3 line when enabled; got ${JSON.stringify(gateResult.enabledResult)}`);
    }
    console.log("PASS: requestLocalUpgrade() genuinely reaches and resolves a real Tier-3 line when localAiEnabled is true");

    if (gateResult.disabledResult !== null) {
      throw new Error(`expected requestLocalUpgrade to NEVER resolve when localAiEnabled===false; got ${JSON.stringify(gateResult.disabledResult)} — the toggle is not a real gate`);
    }
    console.log("PASS: requestLocalUpgrade() never resolves (never reaches the local model) when localAiEnabled===false — a genuine short-circuit, confirmed by the SAME real call path that succeeded when enabled");

    if (!gateResult.unsetResult || gateResult.unsetResult.text !== "A real stub-engine line.") {
      throw new Error(`expected requestLocalUpgrade to default to enabled when localAiEnabled is unset (existing saves); got ${JSON.stringify(gateResult.unsetResult)}`);
    }
    console.log("PASS: an unset localAiEnabled field (existing saves before this batch) defaults to enabled, preserving today's behavior");

    // Reset the forced state so this script leaves no lingering global state.
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ engineReady: false, engineStub: false, loading: false, progress: null, cacheState: "unknown", failed: false });
    });

    if (consoleErrors.length) {
      const real = consoleErrors.filter((e) => !/net::ERR_|Failed to load resource/.test(e));
      if (real.length) {
        console.error("Real console errors:", real);
        process.exitCode = 1;
      } else {
        console.log(`PASS: zero real (non-network) console errors (${consoleErrors.length} expected sandbox network error(s) filtered)`);
      }
    } else {
      console.log("PASS: zero console errors");
    }

    if (!process.exitCode) console.log("\nALL F0 ITEM-7/ITEM-10 CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });

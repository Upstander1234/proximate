// tools/browser/verifyDeviceHint.mjs — verifies the "device"-kind failure
// troubleshooting hint added to bootScreenText.js's aiStatusLine() and
// SettingsOverlay.jsx's LOCAL AI DIALOGUE status row.
//
// Background (see CLAUDE.md's dated entry and dialogueProvider.js's own
// comment above classifyLoadError): a real WebGPU-capable Windows/Edge user
// got "Unable to find a compatible GPU... No available adapters", alongside
// Chromium's own "The powerPreference option is currently ignored when
// calling requestAdapter() on Windows" warning. Investigation against the
// actual installed @mlc-ai/web-llm source found NO genuine lever to retry
// the adapter request differently (CreateMLCEngine's reload() always calls
// the library's internal detectGPUDevice() with no arguments, so it always
// uses the hardcoded default powerPreference; MLCEngineConfig exposes no
// field to change it or inject a pre-made adapter/device; and Chromium's own
// warning says Windows ignores the value anyway) — so instead of a fake
// decorative retry, both surfaces got a short, real, actionable
// troubleshooting hint for exactly this failure kind. This script confirms
// that hint text genuinely renders, live, in both places, via the same
// DEV-only window.__proximateTestForceLocalAi hook prior F0 scripts use
// (this environment has no real WebGPU adapter, so a real device-classified
// failure can't be reproduced/observed here — see CLAUDE.md's F0 status).

import { launch, clickText, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(BASE_URL);
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto(BASE_URL);
    await waitForPhase(page, "boot", 5000);

    async function forceDeviceFailure() {
      await page.evaluate(() => {
        window.__proximateTestForceLocalAi({ failed: true, errorKind: "device", loading: false, progress: null, engineReady: false, engineStub: false });
      });
    }

    // ---- BootScreen's AI panel -------------------------------------------
    await forceDeviceFailure();
    await page.waitForTimeout(150);
    // The app's own real background preload() can independently land and
    // overwrite _lastErrorKind mid-check (the documented "reassert
    // immediately before reading" gotcha every prior GPU-gated F0 script has
    // hit) — reassert right before reading the DOM.
    await forceDeviceFailure();
    await page.waitForTimeout(50);
    let body = await page.locator("body").innerText();
    if (!/hardware acceleration is turned on/.test(body)) {
      throw new Error(`expected BootScreen's AI panel to show the device troubleshooting hint; body snippet: ${(body.match(/UNAVAILABLE[\s\S]{0,400}/) || [""])[0]}`);
    }
    console.log("PASS: BootScreen shows the device-failure troubleshooting hint (hardware acceleration)");
    if (!/edge:\/\/gpu/.test(body) || !/chrome:\/\/gpu/.test(body)) {
      throw new Error("expected BootScreen's hint to name the browser's own WebGPU status page");
    }
    console.log("PASS: BootScreen hint names edge://gpu / chrome://gpu");
    if (!/GPU drivers/.test(body)) {
      throw new Error("expected BootScreen's hint to mention updating GPU drivers");
    }
    console.log("PASS: BootScreen hint mentions updating GPU drivers");
    // Still keeps the core non-blocking promise (item 9).
    if (!/nothing about the medical simulation is affected/.test(body)) {
      throw new Error("expected the non-blocking sentence to remain present alongside the new hint");
    }
    console.log("PASS: the non-blocking sentence is still present alongside the new hint");

    // ---- SettingsOverlay's LOCAL AI DIALOGUE row --------------------------
    await clickText(page, "CONTINUE WITHOUT AI");
    await waitForPhase(page, "title", 5000);
    await forceDeviceFailure();
    await page.waitForTimeout(150);
    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(150);
    await forceDeviceFailure();
    await page.waitForTimeout(50);
    body = await page.locator("body").innerText();
    if (!/Try checking that hardware acceleration is on/.test(body)) {
      throw new Error(`expected Settings' LOCAL AI DIALOGUE row to show the device troubleshooting hint; body snippet: ${(body.match(/LOCAL AI DIALOGUE[\s\S]{0,500}/) || [""])[0]}`);
    }
    console.log("PASS: Settings shows the device-failure troubleshooting hint");
    if (!/edge:\/\/gpu \/ chrome:\/\/gpu/.test(body)) {
      throw new Error("expected Settings' hint to name the browser's own WebGPU status page");
    }
    console.log("PASS: Settings hint names edge://gpu / chrome://gpu");

    // Confirm the hint is scoped ONLY to "device" — a timeout/network
    // failure shouldn't grow this same GPU-specific advice, since it isn't
    // relevant to those failure modes.
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ failed: true, errorKind: "timeout", loading: false, progress: null, engineReady: false, engineStub: false });
    });
    await page.waitForTimeout(150);
    body = await page.locator("body").innerText();
    if (/hardware acceleration/i.test(body)) {
      throw new Error("expected the device-specific hint to NOT appear for a timeout-classified failure");
    }
    console.log("PASS: the device-specific hint does not leak into timeout/network failure text");

    await page.locator("button", { hasText: "close" }).first().click();
    await page.evaluate(() => {
      window.__proximateTestForceLocalAi({ engineReady: false, engineStub: false, stubBackend: false, loading: false, progress: null, cacheState: "unknown", failed: false, errorKind: null });
    });

    if (consoleErrors.length) {
      const real = consoleErrors.filter((e) =>
        !/net::ERR_|Failed to load resource/.test(e) &&
        !/LocalLLMProvider: model load failed/.test(e),
      );
      if (real.length) {
        console.error("Real console errors:", real);
        process.exitCode = 1;
      } else {
        console.log(`PASS: zero real console errors (${consoleErrors.length} filtered)`);
      }
    } else {
      console.log("PASS: zero console errors");
    }

    if (!process.exitCode) console.log("\nALL DEVICE-HINT CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });

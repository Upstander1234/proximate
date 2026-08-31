// tools/browser/verifyProgressiveDownloadGate.mjs — verifies F0 item 5 (the
// progressive ~20%-download gate): "once core assets are ready AND ~20% of
// the model has downloaded, offer Continue without AI."
//
// Scope, stated honestly. The boot screen's "Continue without AI" button was
// ALREADY always clickable from the very first paint (F0 item 9, shipped in
// an earlier slice) — so nothing here adds a NEW gate the player can be
// blocked behind. What item 5 actually asked this slice to add is the
// THRESHOLD-AWARE messaging: once real download progress crosses ~20%, the
// tone under the button should shift from "nothing meaningful has happened
// yet" to "real progress exists, but you don't have to wait." This script
// verifies that logic two ways:
//
// PART A (direct-function, offline): dialogueProvider.js's pure, exported
// progressStage(fraction) fed a spread of synthetic progress values —
// 0, null, undefined, negative, NaN, just-under-threshold, exactly-at-
// threshold, mid-range, and 1.0/over. This is the ONLY honest way to verify
// a threshold crossing in this environment: no environment across any F0
// session has a working WebGPU adapter to push a real download to any
// particular percentage, so this is NOT a claim that a live download was
// observed crossing 20% — it verifies the classification function itself,
// which is what the UI actually keys off.
//
// PART B (direct-function, live page): BootScreen.jsx's own exported
// continueHint(ai)/aiStatusLine(ai) — the actual functions the component
// renders through — called directly with synthetic `ai` objects at every
// progressStage, confirming each produces a real, distinct, non-crashing
// string (never throws, never returns undefined/blank).
//
// PART C (live, real page): a real boot-screen navigation confirms the page
// itself renders without any console error while dialogueManager's real
// getLocalAiState() (whatever it honestly reports in this environment) is
// what's actually driving the panel — i.e. the new progressStage plumbing
// didn't break the ordinary boot flow.

import { launch, getState, waitForPhase } from "./driver.mjs";

const DEV_URL = process.env.PROXIMATE_DEV_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch();
  try {
    await page.goto(DEV_URL, { waitUntil: "networkidle" });
    await waitForPhase(page, "boot", 5000);

    // ---- PART A: progressStage() direct-function threshold test ----------
    const stageResults = await page.evaluate(async () => {
      const { progressStage, PROGRESS_GATE_THRESHOLD } = await import("/src/dialogue/dialogueProvider.js");
      const cases = [
        [undefined, "not-started"],
        [null, "not-started"],
        [0, "not-started"],
        [-0.4, "not-started"],
        [NaN, "not-started"],
        ["0.5", "not-started"], // non-number input must not be coerced
        [0.001, "early"],
        [0.19, "early"],
        [PROGRESS_GATE_THRESHOLD - 0.0001, "early"],
        [PROGRESS_GATE_THRESHOLD, "meaningful"],
        [0.2, "meaningful"],
        [0.5, "meaningful"],
        [0.999, "meaningful"],
        [1, "ready"],
        [1.5, "ready"], // clamped/over-100% still reads as ready, not a crash
      ];
      return cases.map(([input, expected]) => ({
        input, expected, actual: progressStage(input), ok: progressStage(input) === expected,
      }));
    });
    const failedStages = stageResults.filter((r) => !r.ok);
    if (failedStages.length) {
      throw new Error(`progressStage() mismatch(es): ${JSON.stringify(failedStages)}`);
    }
    console.log(`PASS: progressStage() correctly classifies all ${stageResults.length} synthetic progress values (including the exact ~20% threshold boundary, non-number input, and out-of-range 1.5) — this is a direct-function check of the classification logic, NOT a claim that a live download was observed crossing 20% in this environment.`);

    // ---- PART B: BootScreen's own continueHint()/aiStatusLine() ----------
    const uiResults = await page.evaluate(async () => {
      const mod = await import("/src/components/bootScreenText.js");
      const stages = ["not-started", "early", "meaningful", "ready"];
      const out = [];
      for (const progressStage of stages) {
        const ai = { supported: true, status: "downloading", progress: { progress: 0.5, text: "downloading model" }, cacheState: "not-cached", progressStage };
        let hint, line, threw = false;
        try {
          hint = mod.continueHint(ai);
          line = mod.aiStatusLine(ai);
        } catch (e) {
          threw = String(e && e.message || e);
        }
        out.push({ progressStage, hint, lineText: line?.text, threw });
      }
      return out;
    });
    for (const r of uiResults) {
      if (r.threw) throw new Error(`continueHint()/aiStatusLine() threw for progressStage="${r.progressStage}": ${r.threw}`);
      if (!r.hint || typeof r.hint !== "string") throw new Error(`continueHint() returned no usable string for progressStage="${r.progressStage}"`);
      if (!r.lineText || typeof r.lineText !== "string") throw new Error(`aiStatusLine() returned no usable text for progressStage="${r.progressStage}"`);
    }
    const earlyHint = uiResults.find((r) => r.progressStage === "early").hint;
    const meaningfulHint = uiResults.find((r) => r.progressStage === "meaningful").hint;
    if (earlyHint === meaningfulHint) {
      throw new Error(`continueHint() did not change tone across the ~20% threshold: "early" and "meaningful" produced the same text ("${earlyHint}")`);
    }
    console.log(`PASS: BootScreen's continueHint() never throws and its tone genuinely changes at the ~20% threshold:\n  early:      "${earlyHint}"\n  meaningful: "${meaningfulHint}"`);

    // ---- PART C: real boot page still renders cleanly with the new wiring
    const bodyText = await page.textContent("body");
    if (!/CONTINUE WITHOUT AI|ENTER PROXIMATE/.test(bodyText)) {
      throw new Error("boot screen did not render its Continue button after the progressStage plumbing was added");
    }
    const s0 = await getState(page);
    if (s0?.phase !== "boot") throw new Error(`expected to still be at phase=boot, got "${s0?.phase}"`);
    console.log("PASS: real boot screen still renders normally (Continue button present, phase=boot) with the new progressStage plumbing wired in");

    const realErrors = consoleErrors.filter((e) => !/net::ERR_|Failed to load resource/.test(e));
    if (realErrors.length) {
      throw new Error(`${realErrors.length} real (non-network) console error(s): ${realErrors.join(" | ")}`);
    }
    console.log(`PASS: zero real (non-network) console errors`
      + (consoleErrors.length ? ` (${consoleErrors.length} expected sandbox network-resource error(s) filtered)` : ""));

    console.log("\nALL PROGRESSIVE-DOWNLOAD-GATE (F0 item 5) CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });

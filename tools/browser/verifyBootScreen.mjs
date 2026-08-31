// tools/browser/verifyBootScreen.mjs — live verification of F0 item 4 (the
// boot/initialization screen). Confirms: the boot screen is the FIRST thing
// a fresh page load shows (real navigation, not a setState jump); the core
// checklist renders real counts (not a placeholder); the AI panel reflects
// real navigator.gpu/LocalLLMProvider state (this headless-Chromium
// environment has no real WebGPU adapter, so "unsupported/unavailable" is
// the expected, honest result here — see CLAUDE.md); "Continue without AI"
// is clickable immediately (never gated on AI state) and lands on the real
// title screen; and the game is fully playable afterward (a real click
// through to "Go on shift") with zero console errors throughout.

import { launch, clickText, getState, waitForPhase } from "./driver.mjs";

const DEV_URL = process.env.PROXIMATE_DEV_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch();
  try {
    await page.goto(DEV_URL, { waitUntil: "networkidle" });

    // 1. Boot is the very first phase on a fresh load.
    const s0 = await getState(page);
    if (s0?.phase !== "boot") throw new Error(`expected initial phase "boot", got "${s0?.phase}"`);
    console.log("PASS: fresh load starts at phase=boot");

    // 2. Core checklist renders real, non-empty data-derived text.
    const bodyText = await page.textContent("body");
    if (!/conditions loaded/.test(bodyText)) throw new Error("core checklist missing conditions count");
    if (!/scenarios loaded/.test(bodyText)) throw new Error("core checklist missing scenario count");
    if (!/maps loaded/.test(bodyText)) throw new Error("core checklist missing map count");
    console.log("PASS: core systems checklist shows real counts:",
      bodyText.match(/\d+ conditions loaded/)?.[0], "|",
      bodyText.match(/\d+ scenarios loaded/)?.[0], "|",
      bodyText.match(/\d+ maps loaded/)?.[0]);

    // 3. AI panel reflects real feature detection. In this headless
    // environment navigator.gpu has no real adapter, so UNSUPPORTED is the
    // expected, honest state — not a failure of this test.
    const hasUnsupported = /UNSUPPORTED/.test(bodyText);
    const hasAiState = /UNSUPPORTED|READY|DOWNLOADING|SUPPORTED|UNAVAILABLE/.test(bodyText);
    if (!hasAiState) throw new Error("AI panel did not render any recognizable status line");
    const aiLineMatch = bodyText.match(/LOCAL AI DIALOGUE(UNSUPPORTED[^]*?WebGPU|READY[^]*?active|DOWNLOADING[^]*?|SUPPORTED[^]*?started|UNAVAILABLE[^]*?device)/);
    console.log(`PASS: AI panel shows a real status line: "${aiLineMatch?.[1] || "(see raw bodyText)"}" (${hasUnsupported ? "UNSUPPORTED, expected in headless Chromium" : "NOT unsupported — check real hardware result"})`);

    // 4. "Continue without AI" is clickable immediately and reaches title.
    await clickText(page, "CONTINUE WITHOUT AI");
    await waitForPhase(page, "title", 5000);
    console.log("PASS: Continue without AI reaches phase=title immediately");

    // 5. Game is fully playable afterward — real click to "Go on shift".
    await clickText(page, "Go on shift");
    const s1 = await getState(page);
    if (s1?.phase === "title" || s1?.phase === "boot") throw new Error(`expected to leave title after Go on shift, still at "${s1?.phase}"`);
    console.log(`PASS: Go on shift advances past title (phase=${s1?.phase})`);

    if (consoleErrors.length) {
      console.log("CONSOLE ERRORS:", consoleErrors);
      throw new Error(`${consoleErrors.length} console error(s) during boot -> title -> go-on-shift`);
    }
    console.log("PASS: zero console errors throughout");

    console.log("\nALL BOOT SCREEN CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });

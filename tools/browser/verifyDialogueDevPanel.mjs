// tools/browser/verifyDialogueDevPanel.mjs — confirms F0 item 29 (a real
// in-game developer/test-mode UI for hand-supplying a dialogue context) is
// genuinely wired and working, not just present in the tree. CLAUDE.md's F0
// entry had this flagged "unbuilt" while src/components/DialogueDevPanel.jsx
// already existed and was already mounted from Shell.jsx (DEV-only) — this
// script is the live proof needed before correcting that stale record.

import { launch, waitForPhase, clickText } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(BASE_URL);
    await waitForPhase(page, "boot", 5000);
    await clickText(page, "CONTINUE WITHOUT AI");
    await waitForPhase(page, "title", 5000);

    const toggle = page.locator("button", { hasText: "DIALOGUE DEV" });
    if (!(await toggle.count())) throw new Error("expected the DIALOGUE DEV toggle button to be present on the title screen (DEV build)");
    await toggle.click();
    await page.waitForTimeout(100);

    let body = await page.locator("body").innerText();
    if (!/DIALOGUE DEV MODE/.test(body)) throw new Error("expected the dev panel to open");
    console.log("PASS: dev panel opens");

    // Default preset/event, click GENERATE, confirm real dialogue text renders.
    await page.locator("button", { hasText: "GENERATE" }).click();
    await page.waitForTimeout(100);
    body = await page.locator("body").innerText();
    if (!/no line defined/.test(body) && !/·/.test(body)) {
      throw new Error(`expected either a generated line (speaker · tier) or the explicit "no line defined" message; body snippet: ${(body.match(/DIALOGUE DEV MODE[\s\S]{0,400}/) || [""])[0]}`);
    }
    console.log("PASS: GENERATE produces a real result (line or explicit no-line message)");

    // Switch preset + a crew event, confirm it re-generates without throwing
    // (crew events take the separate bucketOverride path in buildCtx/run()).
    await page.locator("select").first().selectOption("agitated");
    await page.locator("select").nth(1).selectOption("crew_seizure_reaction");
    await page.locator("button", { hasText: "GENERATE" }).click();
    await page.waitForTimeout(100);
    body = await page.locator("body").innerText();
    if (!/no line defined/.test(body) && !/·/.test(body)) {
      throw new Error("expected a real result for the crew_seizure_reaction preset too");
    }
    console.log("PASS: a crew event + non-default preset also produces a real result");

    // Custom patient name feeds into the context (spot-check it doesn't crash
    // and the panel stays open/responsive).
    await page.locator("input").first().fill("Test Patient");
    await page.locator("select").nth(1).selectOption("pain_unprompted");
    await page.locator("button", { hasText: "GENERATE" }).click();
    await page.waitForTimeout(100);
    body = await page.locator("body").innerText();
    if (!/DIALOGUE DEV MODE/.test(body)) throw new Error("expected the panel to remain open and responsive after a custom name + generate");
    console.log("PASS: custom patient name + regenerate does not crash the panel");

    await page.locator("button", { hasText: "✕" }).click();
    await page.waitForTimeout(50);
    body = await page.locator("body").innerText();
    if (/DIALOGUE DEV MODE/.test(body)) throw new Error("expected the panel to close");
    console.log("PASS: panel closes");

    if (consoleErrors.length) {
      console.error("Real console errors:", consoleErrors);
      process.exitCode = 1;
    } else {
      console.log("PASS: zero console errors");
    }

    if (!process.exitCode) console.log("\nALL DIALOGUE DEV PANEL CHECKS PASSED");
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });

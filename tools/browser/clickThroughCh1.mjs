// tools/browser/clickThroughCh1.mjs — a real click-through test (not state
// injection) proving Chapter 1's actual button handlers work: arrival
// prompt -> gear-up -> a real queue gets seeded -> "station" renders with
// the 3-call queue, then further into a real call.
import { launch, clickText, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await clickText(page, "Go on shift");
    await clickText(page, "I understand");
    await clickText(page, "New save");
    await clickText(page, "I understand");
    await clickText(page, "Start");
    await page.waitForTimeout(1700);
    await clickText(page, "Career Mode");
    await clickText(page, "Zero-To-Hero", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignRenderPref");
    await clickText(page, "2D", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignDisclaimer");
    console.log("1. Reached campaignDisclaimer via real clicks. OK");

    // Jump straight to the arrival prompt (skips ~15 unrelated Prologue
    // scenes that F1's own earlier batches already verified) but from here
    // every click is real.
    await page.evaluate(() => window.__proximateTestSetState({ phase: "campaignArrivalPrompt", arrivalPromptSeen: false }));
    await page.waitForTimeout(200);
    await clickText(page, "45 minutes early");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh1Gearup", null, { timeout: 5000 });
    console.log("2. Real click on an arrival-time option -> campaignCh1Gearup. OK");

    // VNDialogue advances on a click anywhere on its own text block — the
    // "▶ click to continue" / "▶ <doneLabel>" indicator it always renders
    // is a stable target regardless of how many lines a given scene has.
    for (let i = 0; i < 15; i++) {
      const phase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
      if (phase !== "campaignCh1Gearup") break;
      await page.locator("text=/▶/").first().click({ timeout: 3000 });
      await page.waitForTimeout(150);
    }
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    const st = await getState(page);
    console.log(`3. Gearup dialogue clicked through -> "station". Real queue seeded: [${st.career?.queue?.join(", ")}] (length ${st.career?.queue?.length}). OK`);

    if (st.career?.queue?.length !== 3) throw new Error(`expected a 3-call queue, got ${st.career?.queue?.length}`);
    // CH1_CALL_POOL is ["benignFaint","chronicBackPain","testicularTorsion"], but one slot
    // has a 1/3 chance of becoming a frequent-flyer draw instead (minorSprain,
    // frequentFlyerIntoxicated, frequentFlyerCannabis, or rarely "od") — see
    // campaign/chapter1.js's seedCh1Queue/FREQUENT_FLYER_SCENARIOS.
    const VALID_CH1_CALLS = ["benignFaint", "chronicBackPain", "testicularTorsion",
      "minorSprain", "frequentFlyerIntoxicated", "frequentFlyerCannabis", "od"];
    if (!st.career.queue.every((k) => VALID_CH1_CALLS.includes(k)))
      throw new Error(`queue contains a call outside CH1_CALL_POOL/frequent-flyer set: ${st.career.queue}`);

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Click-through test crashed:", e); process.exit(1); });

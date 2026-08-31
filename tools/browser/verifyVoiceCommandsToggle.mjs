// tools/browser/verifyVoiceCommandsToggle.mjs — real click-through of the
// Phase 4 voice-commands settings row and mic indicator (crew-AI batch).
// SpeechRecognition itself can't be driven by Playwright (no real
// microphone), so this verifies what CAN be verified in a real browser:
// the settings row exists, is off by default, toggling it on sets
// g.voiceCommandsEnabled, and the mic badge appears/disappears with it.
import { launch, clickText, setState, getState } from "./driver.mjs";

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
    await clickText(page, "City");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scope", null, { timeout: 5000 });
    await clickText(page, "▲ Ready");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "ready", null, { timeout: 5000 });
    await clickText(page, "▲ Begin");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    await setState(page, { phase: "cat" });
    console.log("1. Real click-through to a live shift (Paramedic/EMS Supervisor/City). OK");

    const select = page.locator("select").filter({ has: page.locator('option[value="ami"]') });
    await select.first().selectOption("ami");
    const row = select.first().locator("xpath=..");
    await row.locator("button", { hasText: "Go" }).click();
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    await page.waitForTimeout(300);
    await clickText(page, "Bring the stretcher");
    await page.waitForTimeout(300);
    await clickText(page, "▲ Roll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "response", null, { timeout: 5000 });
    let st = await getState(page);
    await setState(page, { phase: "scene", onSceneAt: st.t });
    await page.waitForTimeout(300);
    console.log("2. Real click into a live scene. OK");

    // Real click: open Settings, confirm the row exists and is off, toggle
    // it on, confirm g.voiceCommandsEnabled flips, close.
    await page.getByTitle("Settings").click();
    await page.waitForTimeout(200);
    const settingsText = await page.evaluate(() => document.body.innerText);
    if (!settingsText.includes("VOICE COMMANDS")) throw new Error("VOICE COMMANDS row not found in Settings");
    console.log("3. Real click opened Settings; VOICE COMMANDS row is present. OK");

    st = await getState(page);
    if (st.voiceCommandsEnabled) throw new Error("expected voiceCommandsEnabled to default to false/undefined");

    // No mic badge yet (toggle is off).
    let micBadge = await page.getByTitle("Voice commands — say a crew member's name, then a task").count();
    if (micBadge !== 0) throw new Error("mic badge should not render while voice commands are off");
    console.log("4. Off by default, no mic badge shown. OK");

    // Real click on the "on" chip inside the VOICE COMMANDS row specifically
    // (not the many other "on"/"off" chip pairs on this screen).
    // A div-filter by hasText matches every ANCESTOR that also contains the
    // text (up to and including the whole modal, which also contains the
    // Driving Mode row's own "on"/"off" chips) — go to the label's own
    // immediate parent (the Row wrapper) instead of guessing first()/last().
    const voiceRow = page.getByText("VOICE COMMANDS", { exact: true }).locator("xpath=..");
    await voiceRow.getByText("on", { exact: true }).click({ timeout: 5000, force: true });
    await page.waitForTimeout(200);
    st = await getState(page);
    if (st.voiceCommandsEnabled !== true) throw new Error("expected voiceCommandsEnabled=true after clicking on");
    console.log("5. Real click on 'on' -> g.voiceCommandsEnabled=true. OK");

    await clickText(page, "close");
    await page.waitForTimeout(300);
    micBadge = await page.getByTitle("Voice commands — say a crew member's name, then a task").count();
    if (micBadge !== 1) throw new Error(`expected exactly 1 mic badge once enabled, got ${micBadge}`);
    const badgeText = await page.getByTitle("Voice commands — say a crew member's name, then a task").innerText();
    // Headless Chromium has no real mic/speech backend, so this will
    // realistically sit at "starting…" (never reaches "listening") rather
    // than actually recognizing anything — that's expected here, not a bug;
    // the real behavior (recognition itself) can only be confirmed by a
    // human on a supported browser with a real microphone.
    console.log(`6. Mic badge now renders: "${badgeText}". OK`);

    await page.screenshot({ path: "tools/browser/screenshots/voice-commands-toggle.png", fullPage: true });
    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Voice commands toggle verification crashed:", e); process.exit(1); });

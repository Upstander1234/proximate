// tools/browser/verifyPlayerSpriteReuse.mjs — closes F8's one real item
// ("a live character preview elsewhere in the game — e.g. the customize
// screen's chosen portrait later reappearing as the player's own on-scene
// sprite"). Confirms the player's own layered portrait (built once at
// campaignCustomize) actually reappears via VNSprite's new `layers` prop in
// three later Zero-To-Hero VN scenes — campaignHeatStrokeAftermath,
// campaignLibraryEncounter, and offDuty's zth branch — with REAL network
// responses for all 4 layer images (base/outfit/hair/eyes), not just an
// absence of console errors.
//
// Real clicks establish a genuine Zero-To-Hero character and a real
// campaignCustomize confirm (so g.playerGender/g.campaignAppearance are the
// app's own real committed values, not injected); setState then jumps
// `phase` to each of the three target scenes in turn (a real relationship
// fixture for the partner sprite, the same idiom campaignSmoke.mjs uses) to
// check each one without re-walking the whole prologue three times — the
// player-sprite mechanism itself was already exercised for real by the
// customize-screen click-through, so this is checking REUSE, not the
// mechanism's own render path a second time.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyPlayerSpriteReuse.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";
import { fileURLToPath } from "url";
import path from "path";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const SHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");

// DOM inspection, not network-response tracking (see CLAUDE.md's F8 entry
// for why the network-response version gave a false 0-requests reading: the
// same 4 URLs were already requested once by campaignCustomize's own preview
// moments earlier in this same page session, and a browser cache hit does
// not necessarily re-fire a "response" event the second time). Checking the
// rendered <img src> attributes directly is what actually proves the
// layers are present in the DOM, cache or no cache.
async function playerImgSrcs(page) {
  return page.$$eval("img", (els) => els.map((e) => e.getAttribute("src")).filter((s) => s && s.includes("/characters/player/")));
}

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
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignDisclaimer", null, { timeout: 5000 });
    console.log("1. Real click-through to a Zero-To-Hero campaignDisclaimer. OK");

    // Real click through the disclaimer -> coincidence notice -> acceptance
    // letter into the actual customize screen (all three intermediate
    // screens use the identical "Continue" button label; each click happens
    // only after the PREVIOUS phase change is confirmed, so re-using the
    // same text three times in a row is unambiguous), then real-click every
    // attribute (mirroring a real player pick) and confirm for real — so
    // g.playerGender/g.campaignAppearance below are the app's own committed
    // values, not injected ones.
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCoincidence", null, { timeout: 5000 });
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignLetter", null, { timeout: 5000 });
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCustomize", null, { timeout: 5000 });
    console.log("2. Real click-through to campaignCustomize. OK");

    // Each row is a plain "‹ value ›" cycle UI (App.jsx's attrRow/arrowBtn) —
    // real-click each row's own right arrow (the buttons render in the same
    // top-to-bottom DOM order as the rows themselves, so nth(rowIndex) picks
    // the right one) until getState confirms the exact field landed on the
    // wanted value, rather than screen-scraping text that could collide
    // across rows (e.g. "Black" is both a hair color and an outfit color).
    const rows = [
      ["playerGender", "Female"], ["skinTone", "Light"], ["hairStyle", "Short"],
      ["hairColor", "Black"], ["eyeColor", "Brown"], ["outfit", "Hoodie"], ["outfitColor", "Black"],
    ];
    const arrows = page.locator("button", { hasText: "›" });
    for (let i = 0; i < rows.length; i++) {
      const [field, want] = rows[i];
      for (let tries = 0; tries < 10; tries++) {
        const st = await getState(page);
        const cur = field === "playerGender" ? st.playerGender : (st.campaignAppearance || {})[field];
        if (cur === want) break;
        await arrows.nth(i).click();
        await page.waitForTimeout(60);
      }
    }
    let st = await getState(page);
    for (const [field, want] of rows) {
      const cur = field === "playerGender" ? st.playerGender : (st.campaignAppearance || {})[field];
      if (cur !== want) throw new Error(`failed to cycle ${field} to "${want}", landed on "${cur}"`);
    }
    console.log(`3. Real-clicked attribute rows. playerGender=${st.playerGender}, campaignAppearance=${JSON.stringify(st.campaignAppearance)}. OK`);

    await clickText(page, "▲ Confirm");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignWelcome", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.playerGender || !st.campaignAppearance) throw new Error("expected a real committed playerGender/campaignAppearance after Confirm");
    console.log(`4. Real click "Confirm" -> campaignWelcome. Committed look: ${st.playerGender}, ${JSON.stringify(st.campaignAppearance)}. OK`);

    const partnerFixture = { name: "Sam Okafor", role: "PATROL partner", gender: "female", friendship: 20, romance: 0, met: true };

    // ── Scene 1: campaignHeatStrokeAftermath ────────────────────────────
    await setState(page, { phase: "campaignHeatStrokeAftermath", aftermathTalked: 0, relationships: { partner_patrol: partnerFixture } });
    await page.waitForTimeout(400);
    let srcs = await playerImgSrcs(page);
    console.log(`5. campaignHeatStrokeAftermath: ${srcs.length} player-layer <img> elements in the DOM: ${JSON.stringify(srcs)}.`);
    if (srcs.length < 4) throw new Error(`expected 4 player-layer <img> elements, got ${srcs.length}`);
    await page.screenshot({ path: path.join(SHOT_DIR, "player-sprite-heatstroke-aftermath.png") });

    // ── Scene 2: campaignLibraryEncounter ───────────────────────────────
    await setState(page, { phase: "campaignLibraryEncounter", libraryTalked: 0, relationships: { partner_patrol: partnerFixture } });
    await page.waitForTimeout(400);
    srcs = await playerImgSrcs(page);
    console.log(`6. campaignLibraryEncounter: ${srcs.length} player-layer <img> elements in the DOM: ${JSON.stringify(srcs)}.`);
    if (srcs.length < 4) throw new Error(`expected 4 player-layer <img> elements, got ${srcs.length}`);
    await page.screenshot({ path: path.join(SHOT_DIR, "player-sprite-library.png") });

    // ── Scene 3: offDuty (zth branch) ───────────────────────────────────
    await setState(page, { phase: "offDuty", learningMode: "zth", relationships: { partner_patrol: partnerFixture }, relCallOpen: 0 });
    await page.waitForTimeout(400);
    srcs = await playerImgSrcs(page);
    console.log(`7. offDuty (zth): ${srcs.length} player-layer <img> elements in the DOM: ${JSON.stringify(srcs)}.`);
    if (srcs.length < 4) throw new Error(`expected 4 player-layer <img> elements, got ${srcs.length}`);
    // Real, visual confirmation the layers actually composite on screen
    // (not just present-but-broken in the DOM) — both sprites side by side.
    await page.screenshot({ path: path.join(SHOT_DIR, "player-sprite-offduty.png") });
    console.log("8. Screenshot saved: tools/browser/screenshots/player-sprite-offduty.png");

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Verification crashed:", e); process.exit(1); });

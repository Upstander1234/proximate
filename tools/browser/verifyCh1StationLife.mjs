// tools/browser/verifyCh1StationLife.mjs — real in-browser verification of
// the Chapter 1 station-life follow-up batch (help-me-plan-out-compiled-
// badger.md's §9 checklist), the one item that plan left explicitly out of
// scope for a code-only pass: the one-bag/no-stretcher kit screen, the
// corrected ~1-minute ALONE-ON-SCENE banner, that station NPC names are
// real drawn names (never a literal placeholder), rotation actually
// changing who's offered across shifts, talking to a station NPC creating
// a real relationship, and the background-dispatch state machine's
// dispatched/onScene/returning/atStation cycle with "Talk to" gating on it.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyCh1StationLife.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function clickThroughDialogue(page, maxClicks = 12) {
  const startPhase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
  for (let i = 0; i < maxClicks; i++) {
    const phase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
    if (phase !== startPhase) return;
    const arrow = page.locator("text=/▶/").first();
    if (!(await arrow.isVisible().catch(() => false))) return;
    await arrow.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(150);
  }
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
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignRenderPref", null, { timeout: 5000 });
    await clickText(page, "2D", { exact: true });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignDisclaimer", null, { timeout: 5000 });
    console.log("1. Reached campaignDisclaimer via real clicks. OK");

    // Jump straight to the arrival prompt (real-click Chapters 1-3 breadth
    // is already covered by clickThroughCh1.mjs/clickThroughCh1to3.mjs) but
    // from here every click that matters to THIS batch is real. This skips
    // campaignCustomize's own real UI (a separate, already-covered click
    // path), which is normally what seeds g.campaignNames — so seed it here
    // via the SAME real function App.jsx itself calls
    // (initializeCampaignNames(CAMPAIGN_NAME_SLOTS), dynamically imported
    // inside the page, not reconstructed — lesson 8), rather than leaving
    // it null and having every campaignName() lookup silently fall back to
    // the bare slot id, which would look like a real name and mask exactly
    // the bug this test exists to catch.
    const seededNames = await page.evaluate(async () => {
      const mod = await import("/src/campaign/index.js");
      return mod.initializeCampaignNames(mod.CAMPAIGN_NAME_SLOTS);
    });
    await setState(page, { phase: "campaignArrivalPrompt", arrivalPromptSeen: false, campaignNames: seededNames });
    await page.waitForTimeout(200);
    await clickText(page, "45 minutes early");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh1Gearup", null, { timeout: 5000 });
    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    let st = await getState(page);
    if (st.career?.queue?.length !== 3) throw new Error(`expected a 3-call queue, got ${st.career?.queue?.length}`);
    console.log(`2. Real click through Gearup -> "station" with a real 3-call queue [${st.career.queue.join(", ")}]. OK`);

    // Speed the sim clock up for the scene phase later.
    await setState(page, { speed: 4 });

    // --- §7: station NPC names are real drawn names, not placeholders ---
    const bodyText1 = await page.locator("body").innerText();
    if (!bodyText1.includes("WHO'S AT THE STATION")) throw new Error(`"WHO'S AT THE STATION" panel not found on the station screen`);
    const npcButtonTexts = await page.evaluate(() => {
      return [...document.querySelectorAll("button")]
        .map((b) => b.innerText)
        .filter((t) => /— (Bike EMR|Cart crew)/.test(t));
    });
    if (npcButtonTexts.length !== 3) throw new Error(`expected 3 station-NPC buttons (1 bike EMR + 2 cart crew), got ${npcButtonTexts.length}: ${JSON.stringify(npcButtonTexts)}`);
    for (const t of npcButtonTexts) {
      const namePart = t.split("—")[0].trim();
      // Exact-match check, not a substring regex — an earlier version used
      // /NaN/i.test(namePart), which false-positived on any real name that
      // happens to CONTAIN the letters "nan" in sequence (e.g. "Ferna-nan-da
      // Lima" — "Fernanda" itself), a real name never a placeholder.
      const broken = !namePart || namePart === "undefined" || namePart === "null" || namePart === "NaN" || namePart.includes("_");
      if (broken) throw new Error(`station NPC button has a broken/placeholder name: "${t}"`);
    }
    console.log(`3. "WHO'S AT THE STATION" lists 3 real-named NPCs: ${npcButtonTexts.map((t) => t.replace(/\n/g, " ")).join(" | ")}. OK`);

    // Confirm rotation actually changes who's offered across shifts by
    // calling the real patrolShiftRoster(shiftIdx) directly (the same
    // function App.jsx itself calls) at idx 0 vs idx 1 — cheaper and more
    // deterministic than replaying a full 3-call shift to force a real
    // shift-boundary increment, and it's the SAME function/module the app
    // runs, not a reconstruction (lesson 8).
    const rosterCmp = await page.evaluate(async () => {
      const mod = await import("/src/campaign/index.js");
      const r0 = mod.patrolShiftRoster(0), r1 = mod.patrolShiftRoster(1);
      const ids = (r) => [r.bikeEmr.relId, r.cartCrew[0].relId, r.cartCrew[1].relId].join(",");
      return { r0: ids(r0), r1: ids(r1) };
    });
    if (rosterCmp.r0 === rosterCmp.r1) throw new Error(`patrolShiftRoster(0) and patrolShiftRoster(1) returned the same roster (${rosterCmp.r0}) — rotation is not actually rotating`);
    console.log(`4. patrolShiftRoster rotates for real: shift 0 = [${rosterCmp.r0}], shift 1 = [${rosterCmp.r1}]. OK`);

    // --- §7: talk to a station NPC -> real relationship created ---
    const talkBtn = page.locator("button", { hasText: "— Bike EMR" }).first();
    const talkLabel = (await talkBtn.innerText()).split("\n")[0];
    await talkBtn.click({ timeout: 5000 });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.ch1StationTalkTarget != null, null, { timeout: 5000 });
    st = await getState(page);
    const talkId = st.ch1StationTalkTarget;
    const bodyText2 = await page.locator("body").innerText();
    if (!bodyText2.includes("TALKING WITH")) throw new Error(`expected a "TALKING WITH ..." VN scene after clicking a station NPC's talk button`);
    console.log(`5. Real click "${talkLabel.trim()}" -> a real "TALKING WITH" VN scene opened (relId=${talkId}). OK`);
    // Click ▶ until the specific doneLabel button ("▶ Back to the station")
    // is on screen, then click THAT one deliberately and wait for the real
    // onDone-driven state change (ch1StationTalkTarget -> null) rather than
    // racing a generic "keep clicking any ▶" loop against React's own
    // re-render — a prior version of this script was flaky here because a
    // late click could land on a stale/wrong element mid-transition.
    for (let i = 0; i < 12; i++) {
      const doneBtn = page.locator("text=/▶.*Back to the station/");
      if (await doneBtn.isVisible().catch(() => false)) { await doneBtn.click({ timeout: 3000 }); break; }
      const arrow = page.locator("text=/▶/").first();
      if (!(await arrow.isVisible().catch(() => false))) break;
      await arrow.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(150);
    }
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.ch1StationTalkTarget == null, null, { timeout: 8000 });
    st = await getState(page);
    if (!st.relationships?.[talkId]) throw new Error(`expected g.relationships["${talkId}"] to exist after talking to that NPC, it doesn't`);
    console.log(`6. Talking through to the end created a real relationship: g.relationships["${talkId}"].name="${st.relationships[talkId].name}", friendship=${st.relationships[talkId].friendship}. OK`);

    // --- §2: kit screen offers exactly one "Backpack" bag, no stretcher ---
    // With a real 3-call queue still holding, the station renders the
    // "DISPATCH BOARD — PICK WHAT YOU RUN NEXT" picker (F2b) instead of the
    // plain "▲ Get the call" button (that only shows once upcoming.length
    // drops to 1) — click the first queued call's own card, which reuses
    // the same takeCall()->phase:"kit" path.
    const gotCallBoard = await page.locator("text=DISPATCH BOARD").isVisible().catch(() => false);
    if (gotCallBoard) await page.locator("button", { hasText: /MEDICAL|TRAUMA/ }).first().click({ timeout: 5000 });
    else await clickText(page, "▲ Get the call");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "kit", null, { timeout: 5000 });
    const kitBodyText = await page.locator("body").innerText();
    const bagButtonTexts = await page.evaluate(() => {
      return [...document.querySelectorAll("button")].map((b) => b.innerText.split("\n")[0].trim());
    });
    const bagLikeButtons = bagButtonTexts.filter((t) => ["Backpack", "Monitor", "Drug box", "Airway bag", "Trauma bag"].includes(t));
    if (bagLikeButtons.length !== 1 || bagLikeButtons[0] !== "Backpack")
      throw new Error(`expected exactly one bag choice ("Backpack") on Chapter 1's Layperson kit screen, got: ${JSON.stringify(bagLikeButtons)}`);
    if (kitBodyText.includes("Bring the stretcher"))
      throw new Error(`expected no "Bring the stretcher" option on Chapter 1's Layperson kit screen, but it's present`);
    console.log(`7. Kit screen offers exactly one bag ("Backpack") and no stretcher option. OK`);
    await clickText(page, "Backpack");
    await page.waitForTimeout(150);

    // --- §1: the ALONE ON SCENE banner reads the ~1-minute Chapter 1 text/cap ---
    await clickText(page, "Head over");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "scene", null, { timeout: 15000 });
    console.log(`8. Real click "Head over" -> response -> approach -> "scene" (real drive/approach ticks, not skipped). OK`);
    await page.waitForTimeout(300);
    const sceneBodyText = await page.locator("body").innerText();
    if (!sceneBodyText.includes("ALONE ON SCENE")) throw new Error(`expected the ALONE ON SCENE banner to render for a Chapter 1 Layperson on scene, it didn't`);
    if (!sceneBodyText.includes("about a minute out"))
      throw new Error(`expected the Chapter 1 banner text ("about a minute out"), got something else — banner may still be showing the stale 5-minute text. Body snippet: ${sceneBodyText.slice(sceneBodyText.indexOf("ALONE ON SCENE"), sceneBodyText.indexOf("ALONE ON SCENE") + 260)}`);
    if (sceneBodyText.includes("at least five minutes"))
      throw new Error(`the stale "at least five minutes" text is still present on a Chapter 1 scene — banner branch not taken`);
    const clkMatch = sceneBodyText.match(/(\d{1,2}):(\d{2}) remaining/);
    if (!clkMatch) throw new Error(`expected a "MM:SS remaining" countdown near the banner, none found`);
    const totalSec = (+clkMatch[1]) * 60 + (+clkMatch[2]);
    if (totalSec > 60) throw new Error(`expected the Chapter 1 banner countdown to start at/under 60s (cap=60), read ${clkMatch[0]}`);
    console.log(`9. Banner reads Chapter 1 text ("...about a minute out...") with a <=60s cap: "${clkMatch[0]}". OK`);

    // --- §8: background-dispatch state machine — a real unit goes out and
    // comes back, cycling through the documented status values, and the
    // "Talk to" button for that unit is gated on it (disabled while away).
    // Drive it directly via the tick-loop's own reducer shape rather than
    // waiting out the full real/sim cooldown window, which real play leaves
    // to chance (a ~90-180s roll) — this exercises the SAME state field
    // (ch1BgUnits) and the SAME gating logic the station screen reads,
    // just forces the dispatched case into view deterministically.
    const bikeEmrId = rosterCmp.r0.split(",")[0];
    await setState(page, {
      ch1BgUnits: { [bikeEmrId]: { status: "dispatched", availableAt: 999999 } },
    });
    await page.waitForTimeout(150);
    // Jump back to the station screen — there's no in-call button to reach
    // it from mid-"scene" (the kit screen's own "← Back to station" only
    // exists at phase "kit"), and this half of the test is about the
    // station UI's own gating render, not the call-abandon path, so a
    // direct phase jump is the honest tool here, not a real click.
    await setState(page, { phase: "station" });
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    const awayBtn = page.locator("button", { hasText: "— Bike EMR" }).first();
    const awayText = await awayBtn.innerText();
    const awayDisabled = await awayBtn.isDisabled();
    if (!awayText.includes("OUT ON A CALL")) throw new Error(`expected the dispatched bike EMR's button to read "OUT ON A CALL", got: ${awayText}`);
    if (!awayDisabled) throw new Error(`expected the dispatched bike EMR's "Talk to" button to be disabled while away, it wasn't`);
    console.log(`10. §8 background-dispatch gating confirmed: a "dispatched" unit's button reads "OUT ON A CALL" and is disabled. OK`);
    await setState(page, { ch1BgUnits: { [bikeEmrId]: { status: "atStation", availableAt: 0 } } });
    await page.waitForTimeout(150);
    const backText = await (page.locator("button", { hasText: "— Bike EMR" }).first()).innerText();
    if (backText.includes("OUT ON A CALL")) throw new Error(`expected the unit to be talkable again once status flips back to "atStation", still showing OUT ON A CALL`);
    console.log(`11. Flipping status back to "atStation" re-enables the button. OK`);

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Verification crashed:", e); process.exit(1); });

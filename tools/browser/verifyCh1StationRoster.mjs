// tools/browser/verifyCh1StationRoster.mjs — real click-through verification
// for the grown Northwood PATROL roster: the campus_emr portrait rename/fix
// (a Bike EMR/Cart crew NPC no longer falls back to the generic civilian
// sprite), the 2 new foot-patrol duos being real, listed, talkable roster
// entries, a dispatched (background-called-away) NPC's talk button being
// genuinely disabled, and a mid-conversation background dispatch producing
// the real interrupt line and closing the overlay cleanly.
import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  const portraitRequests = [];
  page.on("response", (res) => {
    const u = res.url();
    if (u.includes("/characters/portraits/")) portraitRequests.push(u);
  });
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
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignDisclaimer");
    console.log("1. Real character creation reached campaignDisclaimer. OK");

    await setState(page, {
      phase: "station", learningMode: "zth", ch1Done: 0, gmode: "career",
      ch1ShiftIdx: 0, ch1BgUnits: {}, ch1StationTalkedThisShift: {}, relationships: {},
    });
    await page.waitForTimeout(300);

    const bodyText = await page.locator("body").innerText();
    if (!bodyText.includes("WHO'S AT THE STATION")) throw new Error("station roster panel did not render");
    const footCount = (bodyText.match(/Foot Patrol/g) || []).length;
    if (footCount < 2) throw new Error(`expected 2 Foot Patrol rows, found ${footCount}`);
    console.log("2. Roster panel lists 2 real Foot Patrol rows alongside Bike EMR/Cart crew. OK");

    // Talk to a Bike EMR — confirms the campus_emr portrait rename actually
    // resolves (not the generic civilian fallback), and that a real
    // conversation opens.
    portraitRequests.length = 0;
    const bikeRow = page.locator("button", { hasText: "Bike EMR" }).first();
    await bikeRow.click({ timeout: 5000 });
    await page.waitForFunction(() => !!window.__proximateTestGetState?.()?.ch1StationTalkTarget, null, { timeout: 5000 });
    await page.waitForTimeout(300);
    const bikePortrait = portraitRequests.find((u) => u.includes("/characters/portraits/campus_emr_"));
    if (!bikePortrait) throw new Error(`expected a campus_emr_* portrait request talking to a Bike EMR, got: ${portraitRequests.join(", ")}`);
    console.log(`3. Bike EMR conversation requested a real campus_emr portrait: ${bikePortrait.split("/").pop()}. OK`);

    // Finish the conversation (real click on VNDialogue's own advance/done)
    // and return to the roster.
    for (let i = 0; i < 6; i++) {
      const target = await page.evaluate(() => window.__proximateTestGetState?.()?.ch1StationTalkTarget);
      if (!target) break;
      await page.locator("text=/▶/").first().click({ timeout: 3000 });
      await page.waitForTimeout(150);
    }
    let st = await getState(page);
    if (st.ch1StationTalkTarget) throw new Error("conversation did not close after clicking through");
    console.log("4. Conversation closed cleanly via a real click, back to the roster. OK");

    // Talk to a Foot Patrol NPC — real per-relId dialogue, civilian portrait
    // (foot patrol is Layperson, not campus_emr).
    portraitRequests.length = 0;
    const footRow = page.locator("button", { hasText: "Foot Patrol" }).first();
    await footRow.click({ timeout: 5000 });
    await page.waitForFunction(() => !!window.__proximateTestGetState?.()?.ch1StationTalkTarget, null, { timeout: 5000 });
    st = await getState(page);
    const footTarget = st.ch1StationTalkTarget;
    if (!footTarget?.startsWith("station_foot")) throw new Error(`expected a station_foot* talk target, got ${footTarget}`);
    await page.waitForTimeout(300);
    const footPortrait = portraitRequests.find((u) => u.includes("/characters/portraits/civilian_"));
    if (!footPortrait) throw new Error(`expected a civilian_* portrait request talking to Foot Patrol, got: ${portraitRequests.join(", ")}`);
    console.log(`5. Foot Patrol (${footTarget}) conversation is real and requested a civilian portrait. OK`);

    // Mid-conversation interruption: simulate the background-dispatch tick
    // picking this exact NPC while the conversation is still open.
    await setState(page, { ch1StationTalkInterrupt: footTarget });
    await page.waitForTimeout(300);
    const interruptText = await page.locator("body").innerText();
    if (!interruptText.includes("radio crackles")) throw new Error("mid-conversation interrupt line did not render");
    console.log("6. Mid-conversation background dispatch produced the real interrupt line. OK");
    await page.locator("text=/▶/").first().click({ timeout: 3000 });
    await page.waitForTimeout(200);
    st = await getState(page);
    if (st.ch1StationTalkTarget || st.ch1StationTalkInterrupt) throw new Error("interrupted conversation did not close cleanly");
    console.log("7. Interrupted conversation closed cleanly (ch1StationTalkTarget/ch1StationTalkInterrupt both null). OK");

    // A dispatched (away) NPC's talk button is genuinely disabled.
    await setState(page, { ch1BgUnits: { station_cart1a: { status: "dispatched" } } });
    await page.waitForTimeout(300);
    const awayText = await page.locator("body").innerText();
    if (!awayText.includes("OUT ON A CALL")) throw new Error("dispatched NPC did not show OUT ON A CALL");
    const isDisabled = await page.locator("button", { hasText: "OUT ON A CALL" }).first().isDisabled();
    if (!isDisabled) throw new Error("dispatched NPC's talk button was not actually disabled");
    console.log("8. A dispatched NPC's talk button is genuinely disabled, not just styled to look so. OK");

    console.log(consoleErrors.length ? `Console errors: ${consoleErrors.join(" | ")}` : "No console errors.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("verifyCh1StationRoster crashed:", e); process.exit(1); });

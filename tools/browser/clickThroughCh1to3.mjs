// tools/browser/clickThroughCh1to3.mjs — a REAL click-through (not state
// injection) of the Chapter 1 End -> Chapter 2 -> Chapter 3 End boundary,
// closing the specific gap CLAUDE.md's F1 queue entry names as the single
// highest-priority next step: "no in-browser click-through of Chapters
// 1-3/8-10 has happened yet." campaignSmoke.mjs already proves every
// individual screen renders given injected state; this proves the actual
// onClick handlers between them wire up correctly — the thing state
// injection cannot catch (a broken handler, a wrong setG payload, a typo'd
// phase name).
//
// Scope, stated honestly: reaching campaignCh1End for real would mean
// actually playing three full calls (kit -> scene -> transport -> debrief,
// three times) through the tutorial shift's own already-proven queue
// (clickThroughCh1.mjs proves that queue seeds correctly) — that's the
// core gameplay loop, a separate, already-exercised surface, not part of
// the campaign PHASE-WIRING gap this script targets. So this script
// establishes a real base character via real clicks (title -> new save ->
// Zero-To-Hero, same as every other script here), then uses setState ONCE
// to jump straight to campaignCh1End with the same relationship fixture
// campaignSmoke.mjs's own "ch1_end" entry uses. From that single jump
// forward, EVERY transition through Chapter 2 and Chapter 3 is a real
// click on the actual rendered button/dialogue-advance element.
//
// The funding-cut incident (design doc §1.6.12) fires probabilistically
// (25% at Ch.2, 35% at Ch.3) — this script does not force it off, it
// handles BOTH outcomes for real: if campaignFundingCut appears, it
// clicks through the "part-time job" branch (the only one of the three
// choices with no further randomness) for real, then continues.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/clickThroughCh1to3.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

// Clicks the stable "▶" VNDialogue advance indicator repeatedly until
// EITHER it's no longer on screen (its onDone revealed non-dialogue choice
// buttons within the SAME phase, as campaignCh2Classmate's intro line
// does) OR the phase itself changes, whichever comes first. Stopping on a
// phase change (checked BEFORE each click, not just via the caller's own
// waitForFunction afterward) matters: the NEXT phase's own VNDialogue
// often shows "▶" immediately too (a single-line scene), so a loop that
// only checked visibility would race ahead and silently click through
// TWO OR MORE phases in one call — non-deterministically, since whether
// the DOM has repainted the new phase before the next isVisible() check is
// a timing race, not something this test controls. That produced exactly
// this failure mode while writing this script: the very same real path
// passed cleanly on some runs and hung on others, with no app-side change
// between them — a test-harness race, not an app bug. Bounding each call
// to one phase makes every step's own waitForFunction below deterministic.
async function clickThroughDialogue(page, maxClicks = 6) {
  const startPhase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
  for (let i = 0; i < maxClicks; i++) {
    const curPhase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
    if (curPhase !== startPhase) return;
    const loc = page.locator("text=/▶/").first();
    const visible = await loc.isVisible().catch(() => false);
    if (!visible) return;
    await loc.click({ timeout: 3000 });
    await page.waitForTimeout(150);
  }
}

// If a funding-cut incident fired, resolve it for real via the
// no-further-randomness branch ("part-time job"), then click through to
// its resolved-stage "Continue". Returns immediately (no-op) if the
// incident didn't fire this time.
async function resolveFundingCutIfPresent(page) {
  const phase = await page.evaluate(() => window.__proximateTestGetState?.()?.phase);
  if (phase !== "campaignFundingCut") return false;
  console.log("  (funding-cut incident fired — resolving via the part-time-job branch)");
  await clickText(page, "Work a part-time job to cover it");
  await page.waitForTimeout(200);
  await clickText(page, "Continue");
  await page.waitForTimeout(200);
  return true;
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
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignDisclaimer");
    console.log("0. Reached campaignDisclaimer via real clicks. OK");

    // Single state jump: skip the 3-call tutorial shift (a different,
    // already-proven surface — see clickThroughCh1.mjs) and land on
    // campaignCh1End exactly as a real completed Chapter 1 shift would.
    await setState(page, {
      phase: "campaignCh1End", ch1Done: 0,
      relationships: { supervisor: { name: "Alex Rivera", role: "supervisor", gender: "female", friendship: 20, romance: 0, met: true } },
    });
    await page.waitForTimeout(200);

    // ── Chapter 1 End -> Chapter 2 ──────────────────────────────────────
    await clickText(page, "Enroll in EMR school");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2Intro", null, { timeout: 5000 });
    console.log("1. Real click \"Enroll in EMR school\" -> campaignCh2Intro. OK");

    await clickThroughDialogue(page);
    await resolveFundingCutIfPresent(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2Practice", null, { timeout: 5000 });
    console.log("2. Real dialogue-click through campaignCh2Intro (funding-cut roll included) -> campaignCh2Practice. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2Classmate", null, { timeout: 5000 });
    console.log("3. Real dialogue-click through campaignCh2Practice -> campaignCh2Classmate. OK");

    await clickThroughDialogue(page); // the intro line -> reveals the 3 option buttons
    await clickText(page, "You seem like you've got this down already");
    await page.waitForTimeout(200);
    await clickThroughDialogue(page); // the response line -> onDone
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2ExamPrep", null, { timeout: 5000 });
    console.log("4. Real click through campaignCh2Classmate's own 3-option choice -> campaignCh2ExamPrep. OK");

    // Bias toward a pass so the chain continues deterministically — the
    // EXAM ROLL ITSELF (rollExamFieldScore/rollWrittenQuiz) still runs for
    // real off these stats; nothing about examPass/examCombinedScore is
    // bypassed.
    await setState(page, { knowledge: 60, confidence: 60 });
    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2ExamResult", null, { timeout: 5000 });
    let st = await getState(page);
    console.log(`5. Real click through campaignCh2ExamPrep -> campaignCh2ExamResult (outcome: ${st.ch2ExamOutcome}, combined ${st.ch2ExamCombinedScore}). OK`);

    for (let tries = 0; tries < 4 && st.ch2ExamOutcome !== "pass"; tries++) {
      console.log("   (failed the EMR exam — real-clicking \"Retake the exam\")");
      await clickText(page, "Retake the exam");
      await page.waitForTimeout(200);
      await clickThroughDialogue(page);
      await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2ExamResult", null, { timeout: 5000 });
      st = await getState(page);
    }
    if (st.ch2ExamOutcome !== "pass") throw new Error("EMR exam never passed after 5 real attempts — cannot continue chain");
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2Departure", null, { timeout: 5000 });
    console.log("6. Real click \"Continue\" on a passed EMR exam -> campaignCh2Departure. OK");

    await clickThroughDialogue(page);
    await clickText(page, "A quiet, appreciative goodbye");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh2End", null, { timeout: 5000 });
    console.log("7. Real click through campaignCh2Departure's goodbye choice -> campaignCh2End. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh3Intro", null, { timeout: 5000 });
    console.log("8. Real dialogue-click through campaignCh2End -> campaignCh3Intro (Chapter 2 fully traversed). OK");

    // ── Chapter 3 ────────────────────────────────────────────────────────
    await clickThroughDialogue(page);
    await clickText(page, "I need the paycheck");
    await page.waitForTimeout(200);
    await resolveFundingCutIfPresent(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh3PathPatrol", null, { timeout: 5000 });
    console.log("9. Real click \"I need the paycheck. PATROL.\" (funding-cut roll included) -> campaignCh3PathPatrol. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh3End", null, { timeout: 5000 });
    console.log("10. Real dialogue-click through campaignCh3PathPatrol -> campaignCh3End. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4Intro", null, { timeout: 5000 });
    st = await getState(page);
    console.log(`11. Real dialogue-click through campaignCh3End -> campaignCh4Intro. chapter3Path=${st.chapter3Path}, ch1Done=${st.ch1Done}, ch2Done=${st.ch2Done}, ch3Done=${st.ch3Done}. OK`);

    if (st.chapter3Path !== "patrol") throw new Error(`expected chapter3Path "patrol", got ${st.chapter3Path}`);
    if (!st.ch2Done || !st.ch3Done) throw new Error("ch2Done/ch3Done not both set after a full real click-through");

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Click-through test crashed:", e); process.exit(1); });

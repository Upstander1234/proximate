// tools/browser/clickThroughCh4to7.mjs — a REAL click-through (not state
// injection) of Chapter 4 (EMT School) -> Chapter 5 (Employment) ->
// Chapter 6 (AEMT School) -> Chapter 7 (AEMT: New Responsibilities), closing
// the specific gap CLAUDE.md's F1 queue entry names as still open after
// clickThroughCh1to3.mjs/clickThroughCh8to10.mjs: "Chapters 4-7's own
// still-separately-flagged click-through gap." campaignSmoke.mjs proves
// individual Ch.4-7 screens render given injected state (well, actually it
// doesn't even have Ch.4-6 fixtures — only campaignSmoke's ch7_intro entry
// touches this range at all); this proves the actual onClick handlers
// between them wire up correctly.
//
// Scope, stated honestly, same carve-out clickThroughCh1to3.mjs already
// uses for the symmetric Ch.1-3 gap: reaching campaignCh4Intro for real
// would mean actually clicking through Chapters 1-3 first (a separate,
// already-proven surface — see clickThroughCh1to3.mjs itself). So this
// script establishes a real base character via real clicks (title -> new
// save -> Zero-To-Hero), then uses setState ONCE to land on campaignCh4Intro
// with a plausible "just finished Chapter 3" fixture (money/reputation/
// knowledge/confidence high enough that every tuition/exam gate this chain
// hits resolves on the FIRST real click rather than needing a scripted
// retry loop — the retry loops below exist anyway, for the rare high-variance
// miss, not because the fixture is expected to fail). From that single jump
// forward, EVERY transition through Chapters 4, 5, 6 and 7 is a real click
// on the actual rendered button/dialogue-advance element, ending on
// shiftSummary (Ch.7's own real exit point).
//
// The Ch.4 funding-cut incident (design doc §1.6.12, rolled at a flat 45%
// for Ch.4) fires probabilistically — this script does not force it off; it
// handles both outcomes for real via the same resolveFundingCutIfPresent
// pattern clickThroughCh1to3.mjs already established for the identical
// campaignFundingCut phase.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/clickThroughCh4to7.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

// See clickThroughCh1to3.mjs's own comment for why this stops on a PHASE
// change as well as on "▶" disappearing: a loop that only checked
// visibility could silently race across a phase boundary when the next
// phase's own VNDialogue also shows "▶" on its very first render.
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

// Same phase (campaignFundingCut), same buttons as clickThroughCh1to3.mjs's
// own identical helper — copied verbatim rather than shared, matching this
// directory's own no-shared-module-beyond-driver.mjs convention.
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

    // Single state jump: skip Chapters 1-3 (a separate, already-proven
    // surface — clickThroughCh1to3.mjs) and land on campaignCh4Intro as a
    // real completed Chapter 3 (PATROL path) would. Stats set high enough
    // that every tuition/exam gate below resolves cleanly on a real click,
    // not because any of those rolls are bypassed — the exam ROLLS
    // themselves (rollExamFieldScore/rollWrittenQuiz) still run for real.
    await setState(page, {
      phase: "campaignCh4Intro", ch1Done: 1, ch2Done: 1, ch3Done: 1, chapter3Path: "patrol",
      money: 5000, reputation: 50, knowledge: 60, confidence: 60,
    });
    await page.waitForTimeout(200);

    // ── Chapter 4: EMT School ───────────────────────────────────────────
    await clickThroughDialogue(page);
    await resolveFundingCutIfPresent(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4Day1", null, { timeout: 5000 });
    console.log("1. Real dialogue-click through campaignCh4Intro (funding-cut roll included) -> campaignCh4Day1. OK");

    await clickThroughDialogue(page); // the 3-line "day one" intro, sets ch4Day1TuitionShown
    // money=5000 > TUITION.emt=1300, so shortfall<=0 -> the direct-pay button.
    await clickText(page, "Pay tuition and enroll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4Practice", null, { timeout: 5000 });
    console.log("2. Real click through campaignCh4Day1's tuition beat -> campaignCh4Practice. OK");

    await clickText(page, "Take the slot"); // the ed_observation_shift downtime event, resolved inline
    await page.waitForTimeout(150);
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4Classmate", null, { timeout: 5000 });
    console.log("3. Real click through campaignCh4Practice's ED-observation choice -> campaignCh4Classmate. OK");

    await clickThroughDialogue(page); // the intro line -> reveals the 3 option buttons
    await clickText(page, "So when do we get to the exciting stuff?");
    await page.waitForTimeout(200);
    await clickThroughDialogue(page); // the response line -> onDone
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4ExamPrep", null, { timeout: 5000 });
    console.log("4. Real click through campaignCh4Classmate's own 3-option choice -> campaignCh4ExamPrep. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4ExamResult", null, { timeout: 5000 });
    let st = await getState(page);
    console.log(`5. Real click through campaignCh4ExamPrep -> campaignCh4ExamResult (outcome: ${st.ch4ExamOutcome}, combined ${st.ch4ExamCombinedScore}). OK`);

    for (let tries = 0; tries < 4 && st.ch4ExamOutcome !== "pass"; tries++) {
      console.log("   (failed the EMT exam — real-clicking \"Retake the exam\")");
      await clickText(page, "Retake the exam");
      await page.waitForTimeout(200);
      await clickThroughDialogue(page);
      await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4ExamResult", null, { timeout: 5000 });
      st = await getState(page);
    }
    if (st.ch4ExamOutcome !== "pass") throw new Error("EMT exam never passed after 5 real attempts — cannot continue chain");
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh4End", null, { timeout: 5000 });
    console.log("6. Real click \"Continue\" on a passed EMT exam -> campaignCh4End. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh5Intro", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.emtCertified || st.level !== "emt") throw new Error(`expected emtCertified+level="emt" after Ch.4, got emtCertified=${st.emtCertified} level=${st.level}`);
    console.log("7. Real dialogue-click through campaignCh4End -> campaignCh5Intro (Chapter 4 fully traversed, emtCertified+level=emt confirmed). OK");

    // ── Chapter 5: Employment ───────────────────────────────────────────
    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh5JobChoice", null, { timeout: 5000 });
    console.log("8. Real dialogue-click through campaignCh5Intro -> campaignCh5JobChoice. OK");

    // ift ("Crosswind Medical Transport") has no entrance exam (§1.6.6) —
    // pickInstant fires straight from this one click. Same prose-shadowing
    // gotcha as the scope screen's "Ready" text (tools/browser/README.md):
    // the framing paragraph above the employer list ALSO says "Crosswind
    // Medical Transport" ("...naming the three real employers (Crosswind
    // Medical Transport for IFT...)"), earlier in DOM order than the real
    // button — a bare substring match hits that inert prose instead.
    // "— IFT" (the button's own jobType suffix) only appears on the button.
    await clickText(page, "Crosswind Medical Transport — IFT");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh5EmployerIntro", null, { timeout: 5000 });
    console.log("9. Real click \"Crosswind Medical Transport\" -> campaignCh5EmployerIntro. OK");

    await clickThroughDialogue(page); // supervisor + partner + first-shift lines -> finish()
    // ift is one of the two combinable jobs (§1.6.6) and this is the only
    // job held so far -> canAddSecond is true -> campaignCh5AddSecondJob.
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh5AddSecondJob", null, { timeout: 5000 });
    console.log("10. Real click through campaignCh5EmployerIntro's first-shift dialogue -> campaignCh5AddSecondJob. OK");

    await clickText(page, "Not right now"); // skip the second job, real content decision
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh5JobChoice", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.jobs?.includes("ift")) throw new Error(`expected jobs to include "ift", got ${JSON.stringify(st.jobs)}`);
    console.log("11. Real click \"Not right now\" -> back to campaignCh5JobChoice with jobs=[ift] confirmed. OK");

    await clickText(page, "Move on with this job for now");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh5End", null, { timeout: 5000 });
    console.log("12. Real click \"Move on with this job for now\" -> campaignCh5End. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6Offer", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.ch5Done) throw new Error("expected ch5Done after campaignCh5End's onDone");
    console.log("13. Real dialogue-click through campaignCh5End -> campaignCh6Offer (Chapter 5 fully traversed, ch5Done confirmed). OK");

    // ── Chapter 6: AEMT School ───────────────────────────────────────────
    // reputation=50 > AEMT_REPUTATION_FLOOR(10), so the "eligible" button
    // set is showing (rendered alongside the dialogue, not gated behind it).
    await clickText(page, "Enroll in AEMT school");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6Enroll", null, { timeout: 5000 });
    console.log("14. Real click \"Enroll in AEMT school\" -> campaignCh6Enroll. OK");

    // iftCalls=0 so scholarshipEligible (needs a real tenure) is false —
    // this lands directly on the flat-cost branch. money=5000 > TUITION.aemt
    // (2400) so shortfall<=0 -> the direct-pay button.
    await clickText(page, "and enroll");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6ClassIntro", null, { timeout: 5000 });
    console.log("15. Real click to pay AEMT tuition -> campaignCh6ClassIntro. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6ScheduleConflict", null, { timeout: 5000 });
    console.log("16. Real dialogue-click through campaignCh6ClassIntro -> campaignCh6ScheduleConflict. OK");

    // AEMT_SCHEDULE_CONFLICT_ROUNDS=3 rounds; round 1 (index 1) is the
    // "office politics" friction beat with different button text.
    for (let guard = 0; guard < 6; guard++) {
      st = await getState(page);
      if (st.phase !== "campaignCh6ScheduleConflict") break;
      const round = st.ch6ConflictRound || 0;
      if (round === 1) await clickText(page, "Comply — pick up the awkward shifts anyway");
      else await clickText(page, "Go to class");
      await page.waitForTimeout(200);
    }
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6Exam", null, { timeout: 5000 });
    console.log("17. Real click through all 3 campaignCh6ScheduleConflict rounds (including the friction round) -> campaignCh6Exam. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6ExamResult", null, { timeout: 5000 });
    st = await getState(page);
    console.log(`18. Real click through campaignCh6Exam -> campaignCh6ExamResult (combined ${st.ch6ExamCombinedScore}, need 82). OK`);

    for (let tries = 0; tries < 4 && st.ch6ExamOutcome !== "pass"; tries++) {
      console.log("   (failed the AEMT boards — real-clicking \"Retake the boards\")");
      await clickText(page, "Retake the boards");
      await page.waitForTimeout(200);
      await clickThroughDialogue(page);
      await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6ExamResult", null, { timeout: 5000 });
      st = await getState(page);
    }
    if (st.ch6ExamOutcome !== "pass") throw new Error("AEMT boards never passed after 5 real attempts — cannot continue chain");
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh6End", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.aemtCertified || st.level !== "aemt") throw new Error(`expected aemtCertified+level="aemt" after Ch.6, got aemtCertified=${st.aemtCertified} level=${st.level}`);
    console.log("19. Real click \"Continue\" on passed AEMT boards -> campaignCh6End (aemtCertified+level=aemt confirmed). OK");

    await clickThroughDialogue(page);
    // aemtCertified=true routes onDone into campaignCh7Intro, not shiftSummary.
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh7Intro", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.ch6Done) throw new Error("expected ch6Done after campaignCh6End's onDone");
    console.log("20. Real dialogue-click through campaignCh6End -> campaignCh7Intro (Chapter 6 fully traversed, ch6Done confirmed, AEMT-certified path taken). OK");

    // ── Chapter 7: AEMT — New Responsibilities ──────────────────────────
    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh7Advocate", null, { timeout: 5000 });
    console.log("21. Real dialogue-click through campaignCh7Intro -> campaignCh7Advocate. OK");

    // Same phase for both the pre-reveal ("Open the envelope") and
    // post-reveal ("Continue") stages — clickThroughDialogue's own
    // ▶-visibility check (not just its phase-change check) carries this
    // through both real clicks in one call, since the re-render after
    // reveal() still shows a fresh "▶" immediately.
    await clickThroughDialogue(page, 6);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh7End", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.paramedicAdvocate?.name) throw new Error("expected a real paramedicAdvocate draw after campaignCh7Advocate");
    console.log(`22. Real click through campaignCh7Advocate's envelope-open + reveal beats -> campaignCh7End (advocate drawn: ${st.paramedicAdvocate.name}, ${st.paramedicAdvocate.role}). OK`);

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "shiftSummary", null, { timeout: 5000 });
    st = await getState(page);
    if (!st.ch7Done) throw new Error("expected ch7Done after campaignCh7End's onDone");
    console.log("23. Real dialogue-click through campaignCh7End -> shiftSummary (Chapter 7 fully traversed, ch7Done confirmed — Chapters 4-7 fully click-through-verified end to end). OK");

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Click-through test crashed:", e); process.exit(1); });

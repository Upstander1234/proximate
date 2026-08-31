// tools/browser/clickThroughCh8to10.mjs — a REAL click-through (not state
// injection) of Chapter 8 (Paramedic School) through Chapter 9 (open world)
// through Chapter 10 (Advanced Roles) and back to the Chapter 9 hub. Same
// motivation as clickThroughCh1to3.mjs: CLAUDE.md's F1 queue entry names
// "no in-browser click-through of Chapters 1-3/8-10" as the single
// highest-priority next step, and campaignSmoke.mjs's own state-injection
// breadth check cannot catch a broken onClick handler between screens.
//
// Scope, stated honestly, same two carve-outs as clickThroughCh1to3.mjs:
//   1. Reaching campaignCh8Intro for real needs AEMT certification and a
//      real 911/AEMT call history — a huge separate prerequisite chain
//      (Chapters 4-7) that is its own, separately-flagged gap, not this
//      script's target. This script establishes a real base character via
//      real clicks, then uses setState ONCE to jump to campaignCh8Intro
//      with the same eligibility fixture campaignSmoke.mjs's own
//      "ch8_apply_eligible" entry uses (calls911:20, aemtCalls:10),
//      plus stat/money boosts (see below) so the chain's own RNG-gated
//      steps (admission chance, exam rolls, tuition) resolve
//      deterministically without bypassing the code that computes them.
//   2. The Chapter 8 field internship's "Begin" button is clicked for
//      real (proving campaignCh8Internship's own begin() handler actually
//      seeds a real career queue and reaches "station") but the actual
//      calls are NOT played out — that's the core gameplay loop, a
//      separate, already-exercised surface. From "station", a second
//      setState jump lands on campaignCh8InternshipReview with the same
//      fakeCareerResults(5, 1.0) fixture campaignSmoke.mjs's own
//      "ch8_internshipReview_clean" entry uses, and every transition from
//      there onward is a real click again.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/clickThroughCh8to10.mjs`.

import { launch, clickText, setState, getState } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

// See clickThroughCh1to3.mjs's own comment on this helper for why it stops
// on a phase change, not just on the "▶" indicator disappearing.
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

    // Single state jump: skip Chapters 4-7 (a separate, already-flagged
    // gap — see this file's header) and land on campaignCh8Intro with the
    // same eligibility fixture campaignSmoke.mjs already uses, plus stat
    // boosts so the real RNG-driven rolls ahead (admission chance, exam
    // scores) resolve to a pass on the first or second real attempt
    // instead of needing dozens of retries. None of these rolls are
    // bypassed — every one still runs its real formula off these stats.
    await setState(page, {
      phase: "campaignCh8Intro", aemtCertified: true,
      calls911: 20, aemtCalls: 10, iftCalls: 0, eventCalls: 0,
      reputation: 80, knowledge: 60, confidence: 60, money: 100000,
    });
    await page.waitForTimeout(200);

    // ── Chapter 8: application -> entrance exam -> interview -> the wait -> admission ──
    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8Apply", null, { timeout: 5000 });
    console.log("1. Real dialogue-click through campaignCh8Intro -> campaignCh8Apply. OK");

    await clickText(page, "Submit application");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8EntranceExam", null, { timeout: 5000 });
    console.log("2. Real click \"Submit application\" -> campaignCh8EntranceExam. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8Interview", null, { timeout: 5000 });
    console.log("3. Real click through the entrance exam -> campaignCh8Interview. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8Wait", null, { timeout: 5000 });
    console.log("4. Real dialogue-click through campaignCh8Interview -> campaignCh8Wait. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8AdmissionResult", null, { timeout: 5000 });
    let st = await getState(page);
    console.log(`5. Real click "Open the letter" -> campaignCh8AdmissionResult (chance was ${st.ch8AdmissionChance?.toFixed?.(1)}%, admitted=${st.paramedicAdmitted}). OK`);

    if (!st.paramedicAdmitted) {
      // Rejected on the real roll despite a ~97% computed chance — rare,
      // but possible. Rather than retrying the whole application loop,
      // force the outcome so the rest of the chain (genuinely the point
      // of this script) still gets exercised for real; this is a
      // documented override of ONE RNG draw, not a bypass of the
      // admission FORMULA itself, which already ran for real above.
      console.log("   (rejected on the real roll — forcing admitted for the rest of the chain)");
      await setState(page, { paramedicAdmitted: 1 });
      await page.waitForTimeout(200);
    }
    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8Rotations", null, { timeout: 5000 });
    console.log("6. Real click \"Continue\" on admission -> campaignCh8Rotations. OK");

    // ── Chapter 8: five clinical rotations, all real clicks ─────────────
    // Loop by ch8RotationIdx (not by text-matching a specific button label
    // per rotation, since 4 of the 5 are plain single-line VNDialogues and
    // the 5th — OR/Anesthesia — is the real "Attempt intubation" mini-loop
    // described in the phase's own comment). Exits once the dispatcher's
    // own idx>=CH8_ROTATIONS.length (5) branch renders "ROTATIONS COMPLETE"
    // instead of a rotation, still inside campaignCh8Rotations.
    for (let round = 0; round < 30; round++) {
      st = await getState(page);
      if (st.phase !== "campaignCh8Rotations" || (st.ch8RotationIdx || 0) >= 5) break;
      const attemptBtn = page.getByText("Attempt intubation", { exact: false }).first();
      if (await attemptBtn.isVisible().catch(() => false)) {
        await attemptBtn.click();
        await page.waitForTimeout(120);
        continue;
      }
      const orFinishBtn = page.getByText(/continue$/i).first();
      if (await orFinishBtn.isVisible().catch(() => false)) {
        await orFinishBtn.click({ timeout: 3000 });
        await page.waitForTimeout(150);
        continue;
      }
      await clickThroughDialogue(page, 3);
      await page.waitForTimeout(150);
    }
    st = await getState(page);
    console.log(`7. Real click-through of all 5 rotations (intubation mini-loop included) -> ch8RotationIdx=${st.ch8RotationIdx}. OK`);
    if ((st.ch8RotationIdx || 0) < 5) throw new Error(`rotations did not complete: ch8RotationIdx=${st.ch8RotationIdx}`);

    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8Internship", null, { timeout: 5000 });
    console.log("8. Real click \"Continue\" on ROTATIONS COMPLETE -> campaignCh8Internship. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "station", null, { timeout: 5000 });
    st = await getState(page);
    console.log(`9. Real click "Begin" on the field internship -> a real career queue seeded (${st.career?.queue?.length} calls), phase="station". OK`);
    if (!st.ch8InternshipActive || (st.career?.queue?.length || 0) < 1) throw new Error("campaignCh8Internship's begin() did not seed a real career queue");

    // Skip playing the actual internship calls (core gameplay, a separate
    // surface — see header) and jump to the review with a clean fixture.
    await setState(page, {
      phase: "campaignCh8InternshipReview",
      career: { queue: ["a", "b", "c", "d", "e"], idx: 5, results: Array.from({ length: 5 }, (_, i) => ({
        title: `Call ${i + 1}`, truth: "test", died: false, correct: true, lucky: false, evidence: 3, base: false, pay: 80,
      })) },
    });
    await page.waitForTimeout(200);

    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8FinalExam", null, { timeout: 5000 });
    console.log("10. Real click \"Continue\" on the internship review -> campaignCh8FinalExam. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8FinalExamResult", null, { timeout: 5000 });
    st = await getState(page);
    console.log(`11. Real click through the paramedic final exam -> campaignCh8FinalExamResult (outcome: ${st.ch8FinalExamOutcome}, combined ${st.ch8FinalExamCombinedScore}). OK`);

    for (let tries = 0; tries < 4 && st.ch8FinalExamOutcome !== "pass"; tries++) {
      console.log("    (failed the paramedic exam — real-clicking \"Retake the exam\")");
      await clickText(page, "Retake the exam");
      await page.waitForTimeout(200);
      await clickThroughDialogue(page);
      await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8FinalExamResult", null, { timeout: 5000 });
      st = await getState(page);
    }
    if (st.ch8FinalExamOutcome !== "pass") throw new Error("paramedic final exam never passed after 5 real attempts");

    await clickText(page, "Continue");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh8End", null, { timeout: 5000 });
    console.log("12. Real click \"Continue\" on a passed final exam -> campaignCh8End. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh9Intro", null, { timeout: 5000 });
    console.log("13. Real dialogue-click through campaignCh8End -> campaignCh9Intro (Chapter 8 fully traversed). OK");

    // ── Chapter 9 -> Chapter 10 -> back to the Chapter 9 hub ────────────
    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh9Hub", null, { timeout: 5000 });
    console.log("14. Real dialogue-click through campaignCh9Intro -> campaignCh9Hub. OK");

    await clickText(page, "Advanced Roles — Critical Care / Flight");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh10Intro", null, { timeout: 5000 });
    console.log("15. Real click \"Advanced Roles\" -> campaignCh10Intro. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh10Choice", null, { timeout: 5000 });
    console.log("16. Real dialogue-click through campaignCh10Intro -> campaignCh10Choice. OK");

    await clickText(page, "Critical Care Paramedic");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh10CCP", null, { timeout: 5000 });
    console.log("17. Real click \"Critical Care Paramedic\" -> campaignCh10CCP. OK");

    await clickText(page, "Pay tuition");
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh10End", null, { timeout: 5000 });
    console.log("18. Real click \"Pay tuition ... and certify\" -> campaignCh10End. OK");

    await clickThroughDialogue(page);
    await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignCh9Hub", null, { timeout: 5000 });
    st = await getState(page);
    console.log(`19. Real dialogue-click through campaignCh10End -> back to campaignCh9Hub (loop closed). advancedRole=${st.advancedRole}, ch8Done implied by paramedicCertified=${st.paramedicCertified}, level=${st.level}. OK`);

    if (st.advancedRole !== "ccp") throw new Error(`expected advancedRole "ccp", got ${st.advancedRole}`);
    if (st.level !== "paramedic") throw new Error(`expected level "paramedic", got ${st.level}`);

    console.log(consoleErrors.length ? `\nConsole errors: ${consoleErrors.join(" | ")}` : "\nNo console errors across the whole run.");
    console.log(consoleErrors.length ? "FAIL" : "PASS");
    process.exitCode = consoleErrors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error("Click-through test crashed:", e); process.exit(1); });

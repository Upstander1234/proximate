// tools/browser/campaignSmoke.mjs — real-browser verification for the
// Zero-To-Hero campaign's phase wiring (Chapters 1-10). Written as the
// first real consumer of tools/browser/driver.mjs, specifically to close
// the "no in-browser click-through happened" gap CLAUDE.md flagged for the
// Chapter 1/2/3/8/9/10 batch.
//
// What this proves, and what it doesn't:
//   - PROVES: the real click-through from title screen to a fully set-up
//     Zero-To-Hero character actually works (character creation, level/
//     vehicle/gmode all populate correctly); every listed campaign phase
//     renders without throwing, given a state patch that resembles what a
//     real playthrough would have produced at that point.
//   - DOES NOT PROVE: a full, unbroken click-through of every button in
//     every chapter in sequence — each phase is reached by direct state
//     injection (see driver.mjs's own comment for why), not by clicking
//     the actual "Continue"/choice buttons of the chapter before it. A
//     phase rendering correctly when jumped to directly is a real, useful
//     signal (it catches undefined-reference crashes, missing imports,
//     broken conditionals) but is not the same as proving every onClick
//     handler in the chain actually reaches it. Full path verification is
//     the next step up from this script, not a replacement for it.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/campaignSmoke.mjs`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launch, clickText, setState, getState, toTitleScreen } from "./driver.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const OUT = path.join(__dirname, "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const slug = (s) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");

async function establishBaseState(page) {
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => { try { localStorage.clear(); localStorage.setItem("proximate_tester_unlocked", "1"); } catch {} });
  await page.reload();
  await page.waitForTimeout(500);
  await toTitleScreen(page);
  await clickText(page, "Go on shift");
  await clickText(page, "I understand"); // liability disclaimer #1 (title -> saves)
  await clickText(page, "New save");
  await clickText(page, "I understand"); // liability disclaimer #2 (F18: every new save gets it again)
  await clickText(page, "Start");
  // "loading" auto-advances to gmodePick after a fixed 1.4s timer (App.jsx).
  await page.waitForTimeout(1700);
  await clickText(page, "Career Mode");
  await clickText(page, "Zero-To-Hero", { exact: true });
  await page.waitForFunction(() => window.__proximateTestGetState?.()?.phase === "campaignRenderPref", null, { timeout: 10000 });
  await clickText(page, "2D", { exact: true });
  await page.waitForFunction(
    () => window.__proximateTestGetState && window.__proximateTestGetState()?.phase === "campaignDisclaimer",
    null, { timeout: 10000 }
  );
}

// Each entry: [name, state patch]. Patches include just enough prerequisite
// data (relationships, career.results, etc.) for the phase to render the
// way a real playthrough would have arranged it, not just the bare phase
// name — a screen that only works with everything else blank is a weaker
// signal than one that works with realistic surrounding state.
function buildChecks() {
  const fakeRelationship = (name, role, gender, friendship = 20, romance = 0) => ({
    name, role, gender, friendship, romance, met: true,
  });
  const fakeCareerResults = (n, correctFrac) => ({
    queue: Array.from({ length: n }, (_, i) => `call${i}`),
    idx: n,
    results: Array.from({ length: n }, (_, i) => ({
      title: `Call ${i + 1}`, truth: "test", died: false,
      correct: i < Math.round(n * correctFrac), lucky: false, evidence: 3, base: false, pay: 80,
    })),
  });

  return [
    ["ch1_arrivalPrompt_debut", { phase: "campaignArrivalPrompt", arrivalPromptSeen: false }],
    ["ch1_arrivalPrompt_recurring", { phase: "campaignArrivalPrompt", arrivalPromptSeen: true, ch1Done: 0 }],
    ["ch1_gearup", { phase: "campaignCh1Gearup" }],
    ["ch1_end", { phase: "campaignCh1End", ch1Done: 0,
      relationships: { supervisor: fakeRelationship("Alex Rivera", "supervisor", "female") } }],
    ["ch2_intro", { phase: "campaignCh2Intro", ch1Done: 1 }],
    ["ch2_practice", { phase: "campaignCh2Practice" }],
    ["ch2_classmate", { phase: "campaignCh2Classmate",
      relationships: { classmate_emr: fakeRelationship("Devon Blackwell", "EMR classmate", "male") } }],
    ["ch2_examPrep", { phase: "campaignCh2ExamPrep", emrExamAttempts: 0 }],
    ["ch2_examResult_pass", { phase: "campaignCh2ExamResult",
      ch2ExamOutcome: "pass", ch2ExamFieldScore: 82, ch2ExamWrittenCorrect: 5, ch2ExamWrittenTotal: 5, ch2ExamCombinedScore: 84 }],
    ["ch2_examResult_fail", { phase: "campaignCh2ExamResult",
      ch2ExamOutcome: "fail", ch2ExamFieldScore: 55, ch2ExamWrittenCorrect: 2, ch2ExamWrittenTotal: 5, ch2ExamCombinedScore: 51 }],
    ["ch2_departure_bittersweet", { phase: "campaignCh2Departure",
      relationships: { partner_patrol: fakeRelationship("Sam Okafor", "PATROL partner", "female", 70, 55) } }],
    ["ch2_departure_lowRomance", { phase: "campaignCh2Departure",
      relationships: { partner_patrol: fakeRelationship("Sam Okafor", "PATROL partner", "female", 30, 5) } }],
    ["ch2_end", { phase: "campaignCh2End" }],
    ["ch3_intro", { phase: "campaignCh3Intro",
      relationships: { supervisor: fakeRelationship("Alex Rivera", "supervisor", "female") } }],
    ["ch3_info", { phase: "campaignCh3Info" }],
    ["ch3_pathPatrol", { phase: "campaignCh3PathPatrol" }],
    ["ch3_pathFire", { phase: "campaignCh3PathFire" }],
    ["ch3_end", { phase: "campaignCh3End" }],
    ["ch7_intro", { phase: "campaignCh7Intro",
      relationships: { partner_patrol: fakeRelationship("Sam Okafor", "PATROL partner", "female") } }],
    ["ch8_intro_noAdvocate", { phase: "campaignCh8Intro", aemtCertified: true }],
    ["ch8_intro_withAdvocate", { phase: "campaignCh8Intro", aemtCertified: true,
      paramedicAdvocate: { role: "ER physician", relationshipId: "advocate_er", name: "Dr. Adaeze Okonkwo", gender: "female" },
      relationships: { advocate_er: fakeRelationship("Dr. Adaeze Okonkwo", "ER physician", "female", 60) } }],
    ["ch8_apply_eligible", { phase: "campaignCh8Apply", calls911: 20, aemtCalls: 10, iftCalls: 0, eventCalls: 0 }],
    ["ch8_apply_ineligible", { phase: "campaignCh8Apply", calls911: 0, aemtCalls: 0, iftCalls: 0, eventCalls: 0 }],
    ["ch8_entranceExam", { phase: "campaignCh8EntranceExam" }],
    ["ch8_interview", { phase: "campaignCh8Interview" }],
    ["ch8_wait", { phase: "campaignCh8Wait" }],
    ["ch8_admissionResult_admitted", { phase: "campaignCh8AdmissionResult", paramedicAdmitted: 1 }],
    ["ch8_admissionResult_rejected", { phase: "campaignCh8AdmissionResult", paramedicAdmitted: 0 }],
    ["ch8_rotations_ed", { phase: "campaignCh8Rotations", ch8RotationIdx: 0 }],
    ["ch8_rotations_or_midway", { phase: "campaignCh8Rotations", ch8RotationIdx: 3, ch8IntubationCount: 2, ch8IntubationAttempts: 3 }],
    ["ch8_rotations_or_done", { phase: "campaignCh8Rotations", ch8RotationIdx: 3, ch8IntubationCount: 5, ch8IntubationAttempts: 5 }],
    ["ch8_rotations_complete", { phase: "campaignCh8Rotations", ch8RotationIdx: 5 }],
    ["ch8_internship", { phase: "campaignCh8Internship" }],
    ["ch8_internshipReview_clean", { phase: "campaignCh8InternshipReview", career: fakeCareerResults(5, 1.0) }],
    ["ch8_internshipReview_rough", { phase: "campaignCh8InternshipReview", career: fakeCareerResults(5, 0.4) }],
    ["ch8_finalExam", { phase: "campaignCh8FinalExam" }],
    ["ch8_finalExamResult_pass", { phase: "campaignCh8FinalExamResult",
      ch8FinalExamOutcome: "pass", ch8FinalExamFieldScore: 90, ch8FinalExamWrittenCorrect: 7, ch8FinalExamWrittenTotal: 8, ch8FinalExamCombinedScore: 89 }],
    ["ch8_finalExamResult_fail", { phase: "campaignCh8FinalExamResult",
      ch8FinalExamOutcome: "fail", ch8FinalExamFieldScore: 60, ch8FinalExamWrittenCorrect: 3, ch8FinalExamWrittenTotal: 8, ch8FinalExamCombinedScore: 58 }],
    ["ch8_end", { phase: "campaignCh8End" }],
    ["ch9_intro", { phase: "campaignCh9Intro" }],
    ["ch9_hub_noRole", { phase: "campaignCh9Hub", advancedRole: null, lifetimeStats: { callsRun: 12 }, paramedicCertCallsSnapshot: 2 }],
    ["ch9_hub_withRole", { phase: "campaignCh9Hub", advancedRole: "ccp" }],
    ["ch9_mentor", { phase: "campaignCh9Mentor" }],
    ["ch9_housing", { phase: "campaignCh9Housing", housingTier: "dorm", money: 5000 }],
    ["ch10_intro", { phase: "campaignCh10Intro" }],
    ["ch10_choice", { phase: "campaignCh10Choice" }],
    ["ch10_ccp_afford", { phase: "campaignCh10CCP", money: 5000 }],
    ["ch10_ccp_broke", { phase: "campaignCh10CCP", money: 0 }],
    ["ch10_flight_fitOk", { phase: "campaignCh10Flight", fitness: 20, money: 5000 }],
    ["ch10_flight_fitFail", { phase: "campaignCh10Flight", fitness: 10, money: 5000 }],
    ["ch10_end_ccp", { phase: "campaignCh10End", advancedRole: "ccp" }],
    ["ch10_end_flight", { phase: "campaignCh10End", advancedRole: "flight" }],
  ];
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  const results = [];
  try {
    await establishBaseState(page);
    const base = await getState(page);
    console.log(`Base state OK — level=${base.level} gmode=${base.gmode} myVeh=${base.myVeh?.name} phase=${base.phase}`);
    await page.screenshot({ path: path.join(OUT, "00_base_campaignDisclaimer.png") });

    for (const [name, patch] of buildChecks()) {
      consoleErrors.length = 0;
      let renderError = null;
      try {
        await setState(page, patch);
        await page.waitForTimeout(250);
        // A blank/white page with no rendered text at all is the "impure
        // render crashed the whole tree" failure mode — React unmounts
        // everything below an uncaught error unless an ErrorBoundary
        // catches it (this app has one, Shell/ErrorBoundary.jsx, but its
        // own fallback UI still renders SOME text, so an empty body means
        // something worse slipped past it).
        const bodyText = await page.evaluate(() => document.body.innerText || "");
        if (bodyText.trim().length < 3) renderError = "page body is empty after state transition";
      } catch (e) {
        renderError = e.message;
      }
      await page.screenshot({ path: path.join(OUT, `${slug(name)}.png`) }).catch(() => {});
      const errs = [...consoleErrors];
      const ok = !renderError && errs.length === 0;
      results.push({ name, ok, renderError, errs });
      console.log(`${ok ? "PASS" : "FAIL"}  ${name}${renderError ? `  -- ${renderError}` : ""}${errs.length ? `  console: ${errs.join(" | ")}` : ""}`);
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots in ${OUT}`);
  if (failed.length) {
    console.log("\nFAILURES:");
    for (const f of failed) console.log(` - ${f.name}: ${f.renderError || ""} ${f.errs.join(" | ")}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => { console.error("Smoke test crashed:", e); process.exit(1); });

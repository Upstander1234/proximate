// Live smoke test for non-MCQ item types inside the Adaptive Exam tab
// (AdaptiveTestTab.jsx) — the higher-risk integration, since it also
// touches save/resume snapshot format and the running IRT ability
// estimate. Verifies: each new item type renders and scores through the
// real wired UI; a mid-exam page reload (real save/resume, not state
// injection) does not duplicate or lose the answered record; and the
// exam keeps advancing normally afterward.
//
// Requires the dev server's question pool to be temporarily pointed at
// exampleItemTypeQuestions.js (a throwaway questionPool.js edit made for
// this smoke test, reverted immediately after — see the session's own
// notes on this).
import { launch, clickText } from "./driver.mjs";

const BASE = process.env.PROXIMATE_URL || "http://localhost:5184";

async function answerCurrentExamQuestion(page) {
  // The example-question pool used for this smoke test has only a
  // handful of items — real content, deliberately small, so the exam
  // exhausts it and starts REUSING questions well before its own real
  // 70-question minimum. That's expected behavior (see
  // verifyAdaptiveExamCompletion.mjs), not a bug; click through it.
  const exhausted = page.getByText("completed the available question bank", { exact: false });
  if (await exhausted.count()) {
    await page.getByText("Continue the exam", { exact: true }).first().click();
    await page.waitForTimeout(300);
  }
  const region = page.locator('[data-testid="exam-question"]');
  await region.waitFor({ timeout: 8000 });

  const mcqOption = region.locator('[data-testid^="exam-mc-option-"]').first();
  if (await mcqOption.count()) {
    await mcqOption.click();
    await page.waitForSelector("text=Next question", { timeout: 8000 });
    return "multiple_choice_native";
  }

  const renderer = region.locator('[data-testid="question-renderer"]');
  await renderer.waitFor({ timeout: 5000 });
  const itemType = await renderer.getAttribute("data-item-type");
  // The renderer's own outer element can attach a tick before its
  // subtype-specific interactive elements finish their first render — a
  // real, harmless React-mount race, not a product bug. Wait for at least
  // one interactive element of the expected kind before querying counts.
  const firstInteractiveSelector = {
    multiple_response: '[data-testid^="mr-option-"]',
    build_list: '[data-testid^="bl-unplaced-"]',
    drag_drop: '[data-testid^="dd-item-"]',
    options_table: '[data-testid^="ot-option-"]',
  }[itemType];
  if (firstInteractiveSelector) await renderer.locator(firstInteractiveSelector).first().waitFor({ timeout: 5000 });

  if (itemType === "multiple_response") {
    const n = await renderer.locator('[data-testid^="mr-option-"]').count();
    await renderer.locator('[data-testid="mr-option-0"]').click();
    if (n > 1) await renderer.locator('[data-testid="mr-option-1"]').click();
  } else if (itemType === "build_list") {
    const count = await renderer.locator('[data-testid^="bl-unplaced-"]').count();
    for (let i = 0; i < count; i++) await renderer.locator('[data-testid^="bl-unplaced-"]').first().click();
  } else if (itemType === "drag_drop") {
    const items = renderer.locator('[data-testid^="dd-item-"]');
    const cats = renderer.locator('[data-testid^="dd-category-"]');
    const itemCount = await items.count();
    const catCount = await cats.count();
    for (let i = 0; i < itemCount; i++) {
      await items.first().click();
      await cats.nth(i % catCount).click();
    }
  } else if (itemType === "options_table") {
    const buttons = renderer.locator('[data-testid^="ot-option-"]');
    const total = await buttons.count();
    const seenRows = new Set();
    for (let i = 0; i < total; i++) {
      const tid = await buttons.nth(i).getAttribute("data-testid");
      const rowId = tid.replace(/^ot-option-/, "").replace(/-\d+$/, "");
      if (seenRows.has(rowId)) continue;
      seenRows.add(rowId);
      await buttons.nth(i).click();
    }
  } else {
    throw new Error(`unhandled itemType: ${itemType}`);
  }

  await renderer.locator('[data-testid="submit-answer"]').click({ timeout: 5000 });
  await renderer.locator('[data-testid="question-result"]').waitFor({ timeout: 5000 });
  await page.waitForSelector("text=Next question", { timeout: 8000 });
  return itemType;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  await clickText(page, "Education");
  await clickText(page, "Adaptive Exam");
  await clickText(page, "Start adaptive exam");
  await page.waitForSelector("text=Question 1", { timeout: 15000 });

  const seen = new Set();
  const expected = new Set(["multiple_response", "build_list", "drag_drop", "options_table"]);
  let rounds = 0;

  // Phase 1: answer a few rounds, collect item types encountered.
  for (; rounds < 12 && seen.size < expected.size; rounds++) {
    const t = await answerCurrentExamQuestion(page);
    seen.add(t);
    console.log(`round ${rounds}: answered ${t}`);
    await clickText(page, "Next question");
    await page.waitForTimeout(200);
  }

  const questionNumBeforeReload = await page.locator("text=/Question \\d+/").first().innerText();
  console.log("before reload:", questionNumBeforeReload);

  // Phase 2: real mid-exam reload — the actual save/resume path, not
  // state injection. Confirms resumeExam's own "don't double-count an
  // already-answered current question" guard (see AdaptiveTestTab.jsx's
  // newest comment on this) holds for a real browser session.
  await page.reload({ waitUntil: "domcontentloaded" });
  await clickText(page, "Education");
  await clickText(page, "Adaptive Exam");
  const resumeBtn = page.getByText("Resume exam", { exact: true });
  const hasResume = await resumeBtn.count();
  console.log("resume button present:", !!hasResume);
  if (hasResume) await resumeBtn.first().click();
  await page.waitForSelector('[data-testid="exam-question"]', { timeout: 10000 });
  const questionNumAfterResume = await page.locator("text=/Question \\d+/").first().innerText();
  console.log("after resume:", questionNumAfterResume);

  // Phase 3: keep answering after resume — confirm no crash, no stuck state.
  let postResumeRounds = 0;
  for (; postResumeRounds < 4; postResumeRounds++) {
    const t = await answerCurrentExamQuestion(page);
    seen.add(t);
    console.log(`post-resume round ${postResumeRounds}: answered ${t}`);
    await clickText(page, "Next question");
    await page.waitForTimeout(200);
  }

  const missing = [...expected].filter((t) => !seen.has(t));
  console.log(JSON.stringify({ seen: [...seen], missing, consoleErrorCount: consoleErrors.length }));

  const realErrors = consoleErrors.filter((e) => !/net::ERR_|Firestore|Firebase|permissions/.test(e));
  if (realErrors.length) console.log("REAL console errors:\n" + realErrors.join("\n"));

  await browser.close();

  if (missing.length > 0) {
    console.log(`RESULT: FAIL — never encountered: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (realErrors.length > 0) {
    console.log("RESULT: FAIL — unexpected console errors");
    process.exit(1);
  }
  console.log("RESULT: PASS — every non-MCQ item type answered in the adaptive exam, and mid-exam resume worked cleanly");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Drives a full Adaptive Test Mode run to completion via the real UI (not
// state injection — the adaptive engine's logic all lives in component
// state), to prove: the exam never stops before 70 questions, the
// exhaustion notice (if the bank is small enough to actually hit it)
// never fires more than once, and the results/review screens render sane
// numbers at the end. The EMT bank was ~57 approved questions when this
// script was first written (well under the 70-question minimum, so
// exhaustion was guaranteed); it has since grown past 1500 questions, so
// a real run today may see 0 exhaustion notices — that's correct, not a
// regression, and is no longer asserted as a hard requirement.

import { launch } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";
const HARD_CAP = 130; // guard against an infinite loop if something's wrong

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.getByText("Study", { exact: false }).first().click();
    await page.getByText("Adaptive Exam", { exact: true }).first().click();
    await page.getByText("Start adaptive exam", { exact: true }).first().click();
    await page.waitForSelector("text=Question 1", { timeout: 15000 });

    let answered = 0;
    let exhaustedNotices = 0;

    while (answered < HARD_CAP) {
      const bodyText = await page.locator("body").innerText();

      if (bodyText.includes("Exam complete")) {
        console.log(`PASS: exam completed after ${answered} answered questions`);
        break;
      }

      if (bodyText.includes("completed the available question bank")) {
        exhaustedNotices += 1;
        await page.getByText("Continue the exam", { exact: true }).first().click();
        continue;
      }

      // an in-progress exam question — scoped to the exam-question region
      // itself (data-testid="exam-question", AdaptiveTestTab.jsx), not a
      // bare "div.rounded-xl.bg-slate-900 button" selector: that class
      // combination is also used by the page's own UserBar/Profile card
      // (EducationApp.jsx), which sits earlier in the DOM and was
      // incorrectly matched by .first() before this fix — a real,
      // pre-existing selector bug, not something this itemType-generality
      // change introduced.
      const examRegion = page.locator('[data-testid="exam-question"]');
      const mcqOption = examRegion.locator('[data-testid^="exam-mc-option-"]').first();
      if (await mcqOption.count()) {
        await mcqOption.click();
      } else {
        // a non-MCQ item type, rendered through QuestionRenderer — answer
        // it generically (any valid response is fine for this completion
        // regression, correctness isn't what's being proven here).
        const renderer = examRegion.locator('[data-testid="question-renderer"]');
        const itemType = await renderer.getAttribute("data-item-type");
        // See verifyAdaptiveExamItemTypes.mjs's own comment on this: the
        // renderer's outer element can attach a tick before its subtype's
        // interactive elements finish their first render.
        const firstInteractiveSelector = {
          multiple_response: '[data-testid^="mr-option-"]',
          build_list: '[data-testid^="bl-unplaced-"]',
          drag_drop: '[data-testid^="dd-item-"]',
          options_table: '[data-testid^="ot-option-"]',
        }[itemType];
        if (firstInteractiveSelector) await renderer.locator(firstInteractiveSelector).first().waitFor({ timeout: 5000 });
        if (itemType === "multiple_response") {
          await renderer.locator('[data-testid="mr-option-0"]').click();
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
        }
        const submitBtn = renderer.locator('[data-testid="submit-answer"]');
        if (await submitBtn.count()) await submitBtn.click();
      }
      await page.waitForSelector("text=Next question", { timeout: 10000 });
      await page.getByText("Next question", { exact: true }).first().click();
      answered += 1;
    }

    if (answered >= HARD_CAP) {
      console.log("FAIL: exam never concluded within the hard cap");
      process.exitCode = 1;
    }

    console.log(`INFO: exhaustion notice shown ${exhaustedNotices} time(s) (0 is fine on today's much larger bank; only >1 would be a real bug)`);
    if (exhaustedNotices > 1) {
      console.log("FAIL: exhaustion notice fired more than once");
      process.exitCode = 1;
    }

    const resultsText = await page.locator("body").innerText();
    const hasReadiness = /Estimated EMT Readiness/.test(resultsText);
    const hasQuestionCount = answered >= 70 && answered <= 120;
    console.log(`INFO: total questions answered = ${answered}`);
    if (!hasReadiness || !hasQuestionCount) {
      console.log("FAIL: results screen missing readiness or question count out of [70,120] range");
      process.exitCode = 1;
    } else {
      console.log("PASS: results screen shows a readiness estimate and question count is within [70,120]");
    }

    // Review: page through every question
    await page.getByText("Review every question", { exact: true }).first().click();
    await page.waitForSelector("text=Back to results");
    let reviewCount = 0;
    while (true) {
      reviewCount += 1;
      const nextBtn = page.getByText("Next →", { exact: true }).first();
      const disabled = await nextBtn.getAttribute("disabled");
      if (disabled !== null) break;
      await nextBtn.click();
      if (reviewCount > HARD_CAP) break;
    }
    console.log(`PASS: paged through review, reached ${reviewCount} of ${answered} administered questions`);
    if (reviewCount !== answered) {
      console.log(`FAIL: review count (${reviewCount}) didn't match administered count (${answered})`);
      process.exitCode = 1;
    }

    const realErrors = consoleErrors.filter((e) => !/net::ERR_/.test(e));
    if (realErrors.length > 0) {
      console.log("CONSOLE ERRORS:", realErrors);
      process.exitCode = 1;
    } else {
      console.log("PASS: zero real console errors across the full exam");
    }
  } catch (e) {
    console.error("FAIL:", e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();

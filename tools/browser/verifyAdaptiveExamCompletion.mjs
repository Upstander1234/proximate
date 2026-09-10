// Drives a full Adaptive Test Mode run to completion via the real UI (not
// state injection — the adaptive engine's logic all lives in component
// state), to prove: the exam never stops before 70 questions even though
// the bank has only ~57 approved EMT questions (so it must hit the
// "you've exhausted the bank" notice and continue reusing items), the
// exhaustion notice fires exactly once, and the results/review screens
// render sane numbers at the end.

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

      // an in-progress exam question
      const choiceButtons = page.locator("div.rounded-xl.bg-slate-900 button");
      await choiceButtons.first().click();
      await page.waitForSelector("text=Next question", { timeout: 10000 });
      await page.getByText("Next question", { exact: true }).first().click();
      answered += 1;
    }

    if (answered >= HARD_CAP) {
      console.log("FAIL: exam never concluded within the hard cap");
      process.exitCode = 1;
    }

    console.log(`INFO: exhaustion notice shown ${exhaustedNotices} time(s) (expected exactly 1, since the bank has ~57 EMT questions, well under the 70-question minimum)`);
    if (exhaustedNotices !== 1) {
      console.log("FAIL: expected the exhaustion notice exactly once");
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

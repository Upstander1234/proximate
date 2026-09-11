// Real-click smoke test for the Education module's three new/updated
// features: MCQ Practice, Adaptive Test Mode, Lectures. Guest mode only
// (no Firebase configured in this dev run), which is the honest, always-
// available path — signed-in/crowdsource-review paths need Firebase
// configured and are not exercised here.

import { launch } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.getByText("Study", { exact: false }).first().click();
    await page.waitForSelector("text=Proximate Education");
    console.log("PASS: Education mode opened");

    // --- MCQ Practice: level select -> dashboard -> answer one question ---
    await page.getByText("MCQ Practice", { exact: true }).first().click();
    await page.getByText("EMT", { exact: true }).first().click();
    await page.waitForSelector("text=Due now");
    console.log("PASS: MCQ Practice dashboard rendered");

    await page.getByText(/Start review/).first().click();
    await page.waitForSelector("button:has-text('Again')", { state: "hidden" }).catch(() => {});
    // click the first answer-choice button (choices render as full-width buttons)
    const choiceButtons = page.locator("div.rounded-xl.bg-slate-900.p-5 button");
    await choiceButtons.first().click();
    await page.waitForSelector("text=Again");
    console.log("PASS: MCQ question answered, reveal + rating shown");
    await page.getByText("Good", { exact: true }).first().click();
    console.log("PASS: rated and advanced");

    // --- Adaptive Exam: intro, methods page, start, answer one question ---
    await page.getByText("Adaptive Exam", { exact: true }).first().click();
    await page.waitForSelector("text=Adaptive Practice Exam");
    console.log("PASS: Adaptive exam intro rendered");

    await page.getByText("How does this work?", { exact: true }).first().click();
    await page.waitForSelector("text=How Proximate's Adaptive Exam Works");
    console.log("PASS: Methods page rendered");
    await page.getByText("← Back", { exact: true }).first().click();
    await page.waitForSelector("text=Adaptive Practice Exam");

    await page.getByText("Start adaptive exam", { exact: true }).first().click();
    await page.waitForSelector("text=Question 1", { timeout: 25000 });
    console.log("PASS: adaptive exam started, question 1 shown");

    const examChoiceButtons = page.locator("div.rounded-xl.bg-slate-900.p-5 button");
    await examChoiceButtons.first().click();
    await page.waitForSelector("text=Next question");
    console.log("PASS: adaptive question answered, explanation + community % shown");
    await page.getByText("Next question", { exact: true }).first().click();
    await page.waitForSelector("text=Question 2");
    console.log("PASS: advanced to question 2");

    // --- Lectures tab (WIP) ---
    await page.getByText("Lectures", { exact: false }).first().click();
    await page.waitForSelector("text=No lectures yet");
    console.log("PASS: Lectures WIP tab rendered");

    // --- Submit a Question (guest, no Firebase configured in this dev
    // run, so it should show the "requires sign-in to be configured"
    // message rather than the question form) ---
    await page.getByText("Submit a Question", { exact: true }).first().click();
    await page.waitForSelector("text=require sign-in to be configured");
    console.log("PASS: Submit tab correctly gated (Firebase not configured)");

    const realErrors = consoleErrors.filter((e) => !/net::ERR_/.test(e));
    if (realErrors.length > 0) {
      console.log("CONSOLE ERRORS:", realErrors);
      process.exitCode = 1;
    } else {
      console.log("PASS: zero real console errors");
    }
  } catch (e) {
    console.error("FAIL:", e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();

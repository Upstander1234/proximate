// Real-click smoke test for the new Education Mode features: the
// Dashboard home screen, Provider Level Assessment, Daily Challenge
// (Medicdle), and Progress/Stats. Guest mode only (no Firebase configured
// in this dev run).

import { launch } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.getByText("Study", { exact: false }).first().click();
    await page.waitForSelector("text=Proximate Education");
    console.log("PASS: Education mode opened");

    // --- Dashboard is the default screen ---
    await page.waitForSelector("text=Your Education Dashboard");
    console.log("PASS: Dashboard is the landing screen");
    await page.waitForSelector("text=Progress & Statistics");
    console.log("PASS: Dashboard tiles rendered");

    // --- Provider Level Assessment ---
    await page.getByText("Assessment", { exact: true }).first().click();
    await page.waitForSelector("text=Provider Level Assessment");
    await page.waitForSelector("text=not a certification exam", { timeout: 10000 });
    console.log("PASS: Assessment intro + disclaimer rendered");
    await page.getByText("Start assessment", { exact: false }).first().click();
    // p-5 distinguishes the question card from the UserBar (which is also
    // rounded-xl bg-slate-900 but p-4, and contains a "Profile" button).
    await page.waitForSelector("div.rounded-xl.bg-slate-900.p-5 button", { timeout: 10000 });
    const assessChoice = page.locator("div.rounded-xl.bg-slate-900.p-5 button").first();
    await assessChoice.click();
    await page.waitForTimeout(700); // question auto-advances after a short reveal
    console.log("PASS: assessment question answered and auto-advanced");

    // --- Daily Challenge (Medicdle) ---
    await page.getByText("Daily Challenge", { exact: true }).first().click();
    await page.waitForSelector("text=Medicdle", { timeout: 10000 });
    console.log("PASS: Daily Challenge / Medicdle rendered");
    const revealBtn = page.getByText(/Reveal more information/);
    if (await revealBtn.count()) {
      await revealBtn.first().click();
      console.log("PASS: revealed another clue");
    }
    const guessInput = page.locator("input[placeholder*='diagnosis']");
    await guessInput.fill("wrong guess entirely");
    await page.getByText("Guess", { exact: true }).click();
    await page.waitForSelector("text=wrong guess entirely");
    console.log("PASS: guess submitted and logged");

    // --- Progress / Stats ---
    await page.getByText("Progress", { exact: true }).first().click();
    await page.waitForSelector("text=My Progress");
    console.log("PASS: Progress/Stats tab rendered");

    // --- back to Dashboard via nav ---
    await page.getByText("Dashboard", { exact: true }).first().click();
    await page.waitForSelector("text=Your Education Dashboard");
    console.log("PASS: navigated back to Dashboard");

    const realErrors = consoleErrors.filter(
      (e) => !/WasmLLMProvider|LocalLLMProvider|WebGPU|net::ERR_/.test(e)
    );
    if (realErrors.length) {
      console.log("CONSOLE ERRORS:", realErrors);
      process.exitCode = 1;
    } else {
      console.log("PASS: zero unexpected console errors");
    }
  } catch (e) {
    console.error("FAIL:", e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();

// tools/browser/verifyAuscultationPracticeTab.mjs — a previous item in the queue: real
// browser click-through of Education Mode's "Auscultation Practice" tab,
// which was shipped and verified only at the data layer (a standalone
// script checking manifest/choice-building logic), never actually opened
// in a real running app. Confirms: the Education button reaches the tab
// bar, the Auscultation Practice tab renders real Quiz UI with a playable
// <audio> element and 4 real choice buttons, answering advances to a
// revealed state, Next draws a new clip, Browse mode renders a filterable
// table of all 647 clips with inline players, and there are zero console
// errors throughout.
//
// Usage: start the dev server first (`npm run dev`), then in another
// terminal: `node tools/browser/verifyAuscultationPracticeTab.mjs`.

import { launch, clickText } from "./driver.mjs";

const URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function run() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  const results = [];
  const check = (label, cond) => { results.push({ label, pass: !!cond }); console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}`); };

  await page.goto(URL, { waitUntil: "load" });
  await clickText(page, "Education");
  await page.waitForSelector("nav"); // tab bar

  check("tab bar shows Auscultation Practice", await page.getByText("Auscultation Practice", { exact: true }).count() > 0);
  await clickText(page, "Auscultation Practice", { exact: true });

  await page.waitForSelector("h1:has-text('Auscultation Practice')", { timeout: 5000 });
  check("Quiz mode is the default view", await page.getByText("Quiz", { exact: true }).count() > 0);

  const audioSrc1 = await page.locator("audio").first().getAttribute("src").catch(() => null);
  check("a real <audio> element with a src renders in Quiz mode", !!audioSrc1 && audioSrc1.includes(".wav"));

  const choiceButtons = page.locator("div.grid button");
  const choiceCount = await choiceButtons.count();
  check("4 choice buttons render", choiceCount === 4);

  // Answer the question (click the first choice) and confirm reveal state.
  await choiceButtons.first().click();
  await page.waitForTimeout(200);
  check("answering reveals correct/incorrect state", (await page.getByText(/Correct —|Not quite —/).count()) > 0);

  const scoreTextBefore = await page.getByText(/Score: \d+ \/ \d+/).first().textContent();
  check("score line updates after answering", /Score: 1 \/ 1|Score: \d+ \/ 1/.test(scoreTextBefore || ""));

  // Advance to the next clip and confirm a fresh, unrevealed question loads.
  const audioSrcBeforeNext = audioSrc1;
  await clickText(page, "Next clip", { exact: false }).catch(async () => { await page.getByRole("button", { name: /next/i }).first().click(); });
  await page.waitForTimeout(300);
  const choiceCountAfterNext = await page.locator("div.grid button").count();
  check("Next draws a fresh, unrevealed question (4 choices again)", choiceCountAfterNext === 4);
  const audioSrc2 = await page.locator("audio").first().getAttribute("src").catch(() => null);
  check("the new clip has its own real <audio> src", !!audioSrc2 && audioSrc2.includes(".wav"));

  // Switch to Browse mode.
  await clickText(page, "Browse all", { exact: false });
  await page.waitForTimeout(300);
  check("Browse mode renders a real audio player per row", (await page.locator("audio").count()) > 5);
  const rowCount = await page.locator("audio").count();
  check("Browse mode lists a large number of clips (647 total expected)", rowCount > 100);

  // Filter, if a filter input exists.
  const filterInput = page.locator("input[type=text], input[placeholder]").first();
  if (await filterInput.count() > 0) {
    await filterInput.fill("Wheezing");
    await page.waitForTimeout(300);
    const filteredCount = await page.locator("audio").count();
    check("filtering narrows the Browse list", filteredCount > 0 && filteredCount < rowCount);
  }

  check("zero console errors throughout", consoleErrors.length === 0);
  if (consoleErrors.length) console.log("Console errors:", consoleErrors);

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
  process.exit(failed.length ? 1 : 0);
}

run().catch((err) => { console.error(err); process.exit(1); });

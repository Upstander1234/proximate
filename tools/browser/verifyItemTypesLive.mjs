// Live, real-click verification that QuestionRenderer's non-MCQ item
// types actually work end to end through MCQPracticeTab.jsx — the real
// wired code path, not a direct-function test. Driven entirely by the
// data-testid hooks QuestionRenderer exposes, so it works regardless of
// which question the shuffled due-queue happens to show first.
//
// Requires the dev server's question pool to be temporarily pointed at
// exampleItemTypeQuestions.js (a throwaway questionPool.js edit made for
// this smoke test, reverted immediately after — see the session's own
// notes on this).
import { launch, clickText } from "./driver.mjs";

const BASE = process.env.PROXIMATE_URL || "http://localhost:5183";

async function answerCurrentQuestion(page) {
  // MCQPracticeTab.jsx routes every multiple_choice question through its
  // own pre-existing inline rendering (unchanged, per the minimal-diff
  // extension), NOT through QuestionRenderer — QuestionRenderer only
  // renders non-MCQ types there. So "no question-renderer testid appeared"
  // means "this is a native MCQ card," not a failure.
  const root = page.locator('[data-testid="question-renderer"]');
  const appeared = await root
    .waitFor({ timeout: 1500 })
    .then(() => true)
    .catch(() => false);

  if (!appeared) {
    const nativeChoice = page.locator("div.space-y-2 > button").first();
    await nativeChoice.waitFor({ timeout: 5000 });
    await nativeChoice.click();
    return "multiple_choice_native";
  }

  const itemType = await root.getAttribute("data-item-type");

  if (itemType === "multiple_response") {
    // pick the correct set: the hint states how many are correct, but we
    // don't know WHICH without reading canonical data — instead just pick
    // that many options (arbitrary ones), submit, and confirm it scores
    // (correct or incorrect, either is a valid "it works" signal) — a
    // second pass re-answers correctly is unnecessary for wiring proof.
    const hint = await page.locator("text=/Select all that apply/").innerText();
    const n = parseInt(hint.match(/\((\d+) correct/)?.[1] || "2", 10);
    for (let i = 0; i < n; i++) {
      await page.locator(`[data-testid="mr-option-${i}"]`).click();
    }
  } else if (itemType === "build_list") {
    const count = await page.locator('[data-testid^="bl-unplaced-"]').count();
    for (let i = 0; i < count; i++) {
      // always click the FIRST remaining unplaced button — index shifts
      // as items are placed, so re-query each time rather than using the
      // original display indices.
      await page.locator('[data-testid^="bl-unplaced-"]').first().click();
    }
  } else if (itemType === "drag_drop") {
    const itemCount = await page.locator('[data-testid^="dd-item-"]').count();
    const catButtons = page.locator('[data-testid^="dd-category-"]');
    const catCount = await catButtons.count();
    for (let i = 0; i < itemCount; i++) {
      await page.locator('[data-testid^="dd-item-"]').first().click();
      await catButtons.nth(i % catCount).click();
    }
  } else if (itemType === "options_table") {
    // click option index 0 in every distinct row id present
    const buttons = page.locator('[data-testid^="ot-option-"]');
    const total = await buttons.count();
    const seenRows = new Set();
    for (let i = 0; i < total; i++) {
      const testId = await buttons.nth(i).getAttribute("data-testid");
      const rowId = testId.replace(/^ot-option-/, "").replace(/-\d+$/, "");
      if (seenRows.has(rowId)) continue;
      seenRows.add(rowId);
      await buttons.nth(i).click();
    }
  } else if (itemType === "multiple_choice") {
    await page.locator('[data-testid="mc-option-0"]').click();
    // multiple_choice commits instantly on click — no submit button
    await root.locator('[data-testid="question-result"]').waitFor({ timeout: 5000 });
    return itemType;
  } else {
    throw new Error(`unhandled itemType in smoke test: ${itemType}`);
  }

  await page.locator('[data-testid="submit-answer"]').click();
  await root.locator('[data-testid="question-result"]').waitFor({ timeout: 5000 });
  return itemType;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  await clickText(page, "Education");
  await clickText(page, "MCQ Practice");
  await clickText(page, "EMT");
  await page.waitForTimeout(300);
  await clickText(page, "Start review");
  await page.waitForTimeout(300);

  const seen = new Set();
  const expected = new Set(["multiple_response", "build_list", "drag_drop", "options_table"]);

  for (let round = 0; round < 8 && seen.size < expected.size + 2; round++) {
    let itemType;
    try {
      itemType = await answerCurrentQuestion(page);
      seen.add(itemType);
      console.log(`round ${round}: answered ${itemType}`);
    } catch (e) {
      console.log(`round ${round}: no more questions or error: ${e.message}`);
      break;
    }
    await page.waitForTimeout(250);
    const goodBtn = page.getByText("Good", { exact: false }).first();
    if (await goodBtn.count()) {
      await goodBtn.click();
      await page.waitForTimeout(300);
    } else {
      break;
    }
  }

  const missing = [...expected].filter((t) => !seen.has(t));
  console.log(JSON.stringify({ seen: [...seen], missing, consoleErrorCount: consoleErrors.length }));
  if (consoleErrors.length) console.log("console errors:\n" + consoleErrors.join("\n"));

  await browser.close();

  if (missing.length > 0) {
    console.log(`RESULT: FAIL — never encountered: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log("RESULT: PASS — every non-MCQ item type answered successfully through the real wired UI");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

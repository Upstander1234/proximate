// tools/browser/verifyMinigameNoTimeBadge.mjs — Hyper-realism pass, Batch 2:
// actions that route into a mini-game popup used to show a flat "Xs" time
// badge next to their label even though the real time cost is "however long
// the player takes in the mini-game, plus a fixed confirm window" — a stale,
// misleading number. Confirms the badge is now suppressed for a minigame-
// routed action ("Blood glucose" -> gluc -> GlucometerMinigame) while an
// ordinary, non-minigame action ("Ask for ID") still shows its real cost.
//
// Run: node tools/browser/verifyMinigameNoTimeBadge.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  const playLink = page.getByText("Play →", { exact: false }).first();
  if (await playLink.count()) await playLink.click({ timeout: 10000 });
  const creditsContinue = page.getByText("Continue", { exact: true }).first();
  if (await creditsContinue.count().catch(() => 0)) await creditsContinue.click({ timeout: 5000 }).catch(() => {});
  await clickText(page, "CONTINUE WITHOUT AI");
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Badge");
  await page.fill('input[placeholder="Last"]', "Test");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await page.evaluate(() => { try { localStorage.clear(); } catch {} }).catch(() => {});
    await freshCharacter(page);

    const findings = [];

    await setState(page, {
      phase: "scene", gmode: "sandbox", scen: "abdPain", level: "paramedic",
      t: 5, onSceneAt: 0, tab: "assess", region: "armR",
      pockets: ["glucometer"], bags: ["monitor"], speed: 12,
    });
    await page.waitForTimeout(300);

    // The minigame-routed action ("Blood glucose") must show NO time badge.
    const glucRow = page.locator("button", { hasText: "Blood glucose" }).first();
    if (!(await glucRow.count())) {
      findings.push('"Blood glucose" action button not found — check gating (pockets/bags/region) still matches actions.js.');
    } else {
      const glucText = await glucRow.innerText();
      if (/\b\d+s\b/.test(glucText)) findings.push(`"Blood glucose" still shows a time badge: "${glucText}"`);
      else console.log('PASS: "Blood glucose" (minigame-routed) shows no time badge.');
    }

    // An ordinary action ("Ask for ID") must still show its real cost —
    // lives under the "general" tab, not "assess".
    await setState(page, { tab: "general" });
    await page.waitForTimeout(200);
    const askIdRow = page.locator("button", { hasText: "Ask for ID" }).first();
    if (!(await askIdRow.count())) {
      findings.push('"Ask for ID" action button not found.');
    } else {
      const askIdText = await askIdRow.innerText();
      if (!/\b5s\b/.test(askIdText)) findings.push(`"Ask for ID" (ordinary action) should still show "5s", got: "${askIdText}"`);
      else console.log('PASS: "Ask for ID" (ordinary, non-minigame action) still shows its real "5s" cost.');
    }

    if (consoleErrors.length) findings.push(`console errors — ${consoleErrors.join(" | ")}`);

    console.log("\n--- RESULTS ---");
    if (findings.length) {
      console.log(`${findings.length} FINDING(S):`);
      findings.forEach(f => console.log(" - " + f));
      process.exitCode = 1;
    } else {
      console.log("Minigame-routed actions no longer show a stale time badge; ordinary actions are unaffected.");
    }
  } finally {
    await browser.close();
  }
}

const hardDeadline = setTimeout(() => {
  console.error("FAIL: hard timeout — something hung without throwing.");
  process.exit(1);
}, 60000);

main()
  .catch((err) => { console.error("FAIL:", err); process.exitCode = 1; })
  .finally(() => { clearTimeout(hardDeadline); process.exit(process.exitCode || 0); });

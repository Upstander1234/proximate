// tools/browser/verifyEcgAcquireNoSpoonFeed.mjs — Hyper-realism pass, Batch 1:
// "ecgAcquire" used to hand the player the diagnosis directly ("Twelve-lead:
// <rhythm/finding>") both in the log and in a monitor-tab panel gated on
// g.ecgRead. That defeated the game's own real self-quiz mechanism
// (TwelveLeadPrint — the player picks a rhythm/finding, then finds out if
// they were right). This confirms: after acquiring a 12-lead on a STEMI
// scenario, no rhythm/finding word ever appears in the log or live state,
// until the player explicitly uses Transmit (a genuine physician-readback
// path) or the Print self-quiz (checked separately, since it's designed to
// reveal the answer only after a commitment).
//
// Run: node tools/browser/verifyEcgAcquireNoSpoonFeed.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

// Words that would only appear if the answer were spoon-fed.
const ANSWER_WORDS = ["STEMI", "elevation", "ST elevation", "infarct", "Twelve-lead:", "ECG:"];

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  // A launcher picker ("Game" / "Education") sits in front of the app's own
  // boot screen in this environment — click through to the game first.
  const playLink = page.getByText("Play →", { exact: false }).first();
  if (await playLink.count()) await playLink.click({ timeout: 10000 });
  // First-run credits screen precedes boot on a fresh session.
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
  await page.fill('input[placeholder="First"]', "Ecg");
  await page.fill('input[placeholder="Last"]', "Blind");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  const findings = [];

  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "ami", level: "paramedic",
    t: 5, onSceneAt: 0, tab: "procedures", region: "torso",
    bags: ["monitor"], exposed: { torso: true },
    speed: 12,
  });
  await page.waitForTimeout(300);

  await clickText(page, "12-lead — acquire and transmit");
  await page.waitForTimeout(2500);

  const afterState = await getState(page);
  const logText = (afterState.log || []).map(l => l.text || "").join(" | ");

  const leaked = ANSWER_WORDS.filter(w => logText.toLowerCase().includes(w.toLowerCase()));
  if (leaked.length) {
    findings.push(`Answer word(s) leaked into the log after acquiring: ${leaked.join(", ")} — full log tail: ${logText.slice(-400)}`);
  } else {
    console.log("PASS: acquiring the 12-lead logged no rhythm/finding words.");
  }
  if (afterState.ecgRead) findings.push("g.ecgRead is still being set true — the removed spoon-feed flag is back.");
  if (!afterState.leadsOn) findings.push("leadsOn was not set — acquiring should still make the strip live.");

  if (consoleErrors.length) findings.push(`console errors — ${consoleErrors.join(" | ")}`);

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("ecgAcquire no longer spoon-feeds the diagnosis; leadsOn set correctly, zero console errors.");
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

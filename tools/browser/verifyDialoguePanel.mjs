// tools/browser/verifyDialoguePanel.mjs — real setState verification of the
// F0 dialogue-system first slice: the DialoguePanel renders a real, queued
// line, the panel is scoped to scene/transport phases only, and the tick
// loop's own unprompted-dialogue path (personality/distress-gated) produces
// a real line unassisted, the same "let the real engine drive it" pattern
// verifyClinicalEventAlert.mjs already established for eventAlertQueue.
//
// Run: node tools/browser/verifyDialoguePanel.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5174";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Dia");
  await page.fill('input[placeholder="Last"]', "Logue");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  // 1) A directly-queued dialogue line renders on screen during a live scene.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 0, tab: "assess",
      dialogueLog: [{ id: "test1", speaker: "patient", text: "It really hurts, doc.", tier: "template" }],
    });
  });
  await page.waitForTimeout(300);
  let bodyText = await page.locator("body").innerText();
  if (!bodyText.includes("It really hurts, doc.")) throw new Error("Expected the queued dialogue line to render on screen");
  console.log("PASS: a queued dialogueLog entry renders as a real on-screen line");

  // 2) The panel is scoped to scene/transport — it must NOT render on an
  // unrelated screen even with stale dialogueLog entries still present.
  await page.evaluate(() => {
    window.__proximateTestSetState({ phase: "gmodePick" });
  });
  await page.waitForTimeout(200);
  bodyText = await page.locator("body").innerText();
  if (bodyText.includes("It really hurts, doc.")) throw new Error("Expected the dialogue panel to NOT render outside scene/transport");
  console.log("PASS: the dialogue panel is correctly scoped to scene/transport phases");

  // 3) The real thing: force high pain + a talkative/anxious-leaning seed on
  // a live patient and let the tick loop's own unprompted-dialogue path
  // (App.jsx, dialogueManager.js) pick it up on its own, unassisted — the
  // same "flip real state, don't inject the outcome" discipline
  // verifyClinicalEventAlert.mjs already established.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 4, tab: "assess", dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, speed: 1,
    });
  });
  await page.waitForTimeout(300);
  const forced = await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    if (!s.patient) return false;
    // pk.js reseeds pat.drugPain from pat.intrinsicPain*painSensitivity every
    // tick (queue item 20's mechanism) — setting drugPain directly would be
    // overwritten on the very next tick, so intrinsicPain is the real,
    // persistent lever (same "don't fight the engine's own reseed" lesson
    // this project's own history already has on record for magToxicity etc).
    s.patient.intrinsicPain = 9;
    s.patient.consciousness = "awake";
    return true;
  });
  if (!forced) throw new Error("Expected a live s.patient to exist to mutate");
  // The cooldown-gated probability check runs every 100ms tick; give it a
  // generous real window across many tick draws rather than assuming a
  // single roll — the same repeated-trial discipline this project's own
  // physiology suites use for stochastic checks (CLAUDE.md lesson 9).
  let sawLine = false;
  for (let i = 0; i < 40 && !sawLine; i++) {
    await page.waitForTimeout(250);
    const text = await page.locator("body").innerText();
    if (text.includes("CONTEXTUAL DIALOGUE")) sawLine = true;
  }
  if (!sawLine) throw new Error("Expected the tick loop's own unprompted-dialogue path to produce a real line within 10s at high pain");
  console.log("PASS: real physiology (high pain, conscious patient) drives an unprompted dialogue line via the tick loop, unassisted");

  if (consoleErrors.length) {
    console.error("Console errors:", consoleErrors);
    process.exitCode = 1;
  } else {
    console.log("\nALL CHECKS PASSED, zero console errors");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

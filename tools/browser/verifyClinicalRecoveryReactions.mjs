// tools/browser/verifyClinicalRecoveryReactions.mjs — real setState
// verification of the two REVERSE edges added to the seizing/unresponsive
// edge-detection block (App.jsx): the forward edges ("begins seizing",
// "stops responding", plus crew_seizure_reaction/crew_unresponsive_reaction)
// already had real coverage (verifyClinicalEventAlert.mjs,
// verifyCrewDialogueReaction.mjs) — the reverse edges (seizure stopping,
// consciousness returning) were previously silent on BOTH channels (the
// on-screen banner and the crew-voiced dialogue line), a real, previously-
// unhandled transition, not a duplicate of the forward-edge coverage.
//
// Run: node tools/browser/verifyClinicalRecoveryReactions.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

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
  await page.fill('input[placeholder="First"]', "Rec");
  await page.fill('input[placeholder="Last"]', "Overy");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 4, tab: "assess", speed: 1,
      dialogueLog: [], dialogueMemory: [], dialogueLastAt: null,
      eventAlertQueue: [],
      crew: [{ id: "crewA", name: "Test Partner", level: "emt" }],
    });
  });
  await page.waitForTimeout(300);

  // 1) SEIZURE ENDING — start a real, sustained seizure (same combined
  // epilepticDrive+seizing mutation verifyCrewDialogueReaction.mjs already
  // established as the reliable lever), let the forward edge settle, then
  // clear epilepticDrive to zero and force seizing=false — a real, distinct
  // edge, not just reading the already-true flag back.
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.epilepticDrive = 1;
    s.patient.seizing = true;
  });
  await page.waitForTimeout(500);
  // Clear both channels so this check is isolated to the NEXT transition.
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, eventAlertQueue: [] });
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.epilepticDrive = 0;
    s.patient.seizing = false;
  });

  let sawSeizeEndBanner = false, sawSeizeEndCrewLine = false;
  for (let i = 0; i < 20 && !(sawSeizeEndBanner && sawSeizeEndCrewLine); i++) {
    await page.waitForTimeout(200);
    const st = await page.evaluate(() => window.__proximateTestGetState());
    if ((st?.eventAlertQueue || []).some((e) => e.text === "The seizure has stopped.")) sawSeizeEndBanner = true;
    if ((st?.dialogueLog || []).some((l) => l.speaker === "crew")) sawSeizeEndCrewLine = true;
  }
  if (!sawSeizeEndBanner) throw new Error("Expected a 'The seizure has stopped.' banner in eventAlertQueue");
  if (!sawSeizeEndCrewLine) throw new Error("Expected a crew-voiced seizure-ended line in dialogueLog");
  console.log("PASS: seizure ending fires both a real banner and a real crew-voiced line");

  // 2) RECOVERY — force the patient unconscious for real (not via the
  // seizure path, so this is a genuinely independent edge), clear both
  // channels, then let consciousness return.
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.consciousness = "unconscious";
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, eventAlertQueue: [] });
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.consciousness = "awake";
  });

  let sawRecoverBanner = false, sawRecoverCrewLine = false;
  for (let i = 0; i < 20 && !(sawRecoverBanner && sawRecoverCrewLine); i++) {
    await page.waitForTimeout(200);
    const st = await page.evaluate(() => window.__proximateTestGetState());
    if ((st?.eventAlertQueue || []).some((e) => e.text === "The patient starts responding again.")) sawRecoverBanner = true;
    if ((st?.dialogueLog || []).some((l) => l.speaker === "crew")) sawRecoverCrewLine = true;
  }
  if (!sawRecoverBanner) throw new Error("Expected a 'The patient starts responding again.' banner in eventAlertQueue");
  if (!sawRecoverCrewLine) throw new Error("Expected a crew-voiced recovery line in dialogueLog");
  console.log("PASS: regaining consciousness fires both a real banner and a real crew-voiced line");

  // 3) Negative control — the reverse edges must NOT fire on an ordinary,
  // steady-state tick with nothing changing (i.e. this isn't just spamming
  // on every tick regardless of a real transition).
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, eventAlertQueue: [] });
  });
  await page.waitForTimeout(1500);
  const steadyState = await page.evaluate(() => window.__proximateTestGetState());
  if ((steadyState?.eventAlertQueue || []).length) throw new Error("Expected no spurious banner on a steady-state tick with nothing changing");
  if ((steadyState?.dialogueLog || []).some((l) => l.speaker === "crew")) throw new Error("Expected no spurious crew line on a steady-state tick with nothing changing");
  console.log("PASS: no spurious banner/crew line on an ordinary steady-state tick");

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

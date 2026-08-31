// tools/browser/verifyCrewDialogueReaction.mjs — real setState verification
// of F0's crew-voiced dialogue reaction: DialoguePanel already styled a
// "CREW" speaker (SPEAKER_LABEL) with nothing ever feeding it through the
// dialogue manager — a real "written but unread" gap, closed by wiring crew
// reactions into the SAME seizing/consciousness edge-detection that already
// drives the visible eventAlertQueue banner (App.jsx).
//
// Run: node tools/browser/verifyCrewDialogueReaction.mjs   (needs `npm run dev`)

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

  // A live scene with a real crew member present — the edge-detection block
  // in App.jsx guards on n.crew.length, so this must be a real crew entry,
  // not an empty roster.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 5, onSceneAt: 4, tab: "assess", speed: 1,
      dialogueLog: [], dialogueMemory: [], dialogueLastAt: null,
      crew: [{ id: "crewA", name: "Test Partner", level: "emt" }],
    });
  });
  await page.waitForTimeout(300);

  // 1) A REAL, live seizure onset should produce a crew-voiced line. Forcing
  // ONLY pat.seizing=true is NOT reliable here — neuro.js's own sustain
  // logic (SUSTAIN=0.15) resets seizing back to false the instant
  // seizureDrive reads below threshold, and for a plain "chest" patient
  // that drive is genuinely 0, so a bare boolean flip races the very next
  // tick's reset (measured directly: it lost that race in every trial while
  // debugging this). And forcing ONLY pat.epilepticDrive=1 (the real,
  // condition-level handle that keeps seizureDrive persistently above
  // SUSTAIN, held across ticks unlike pk.js's own reset fields) still only
  // makes onset PROBABILISTIC (Math.random() < seizureDrive*dt*2, with dt
  // in minutes — at speed 1 that's roughly 0.0017 min/tick, so onset within
  // any short real-time window is a real coin flip, not a given). Setting
  // BOTH together is the honest, reliable lever: seizing=true starts the
  // seizure immediately, and epilepticDrive=1 keeps seizureDrive above
  // SUSTAIN so the very same sustain check that would otherwise reset a
  // bare boolean flip instead confirms it and leaves it alone — the real
  // "sustained seizure with a real cause" case status epilepticus/
  // activeSeizureGTC already produce, not a synthetic one-tick blip.
  const seeded = await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    if (!s.patient) return false;
    s.patient.epilepticDrive = 1;
    s.patient.seizing = true;
    return true;
  });
  if (!seeded) throw new Error("Expected a live s.patient to exist to mutate");

  // Read g.dialogueLog directly rather than scraping page text — "CREW" is
  // also a real, generic fallback role label rendered elsewhere on the crew
  // roster panel (App.jsx's `(p.title||p.role||"CREW")`), so a plain text
  // scrape for /CREW/ is a false-positive trap independent of whether the
  // dialogue system ever fires anything (caught by hand while debugging
  // this: the negative control below passed the DOM-text version even with
  // an empty crew array, because that unrelated label is always on screen).
  let sawCrewLine = false;
  for (let i = 0; i < 20 && !sawCrewLine; i++) {
    await page.waitForTimeout(200);
    const log = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
    // Not every crew_seizure_reaction variant contains the literal word
    // "seizing" ("Full body, right now. Watch the airway." doesn't) — the
    // speaker tag alone is the real, unambiguous signal, since nothing else
    // in this scenario feeds speaker:"crew" into dialogueLog.
    if (log.some((l) => l.speaker === "crew")) sawCrewLine = true;
  }
  if (!sawCrewLine) throw new Error("Expected a crew-voiced seizure-reaction line to appear in dialogueLog");
  console.log("PASS: a real seizure onset with crew present produces a crew-voiced dialogue line");

  // 2) Negative control: the SAME real, sustained onset with NO crew present
  // must stay silent on this channel (the eventAlertQueue banner is
  // unaffected either way — this only checks the new crew-dialogue path).
  // Clear the drive first and let the sustain check genuinely settle
  // seizing back to false before re-triggering a fresh onset, so this is a
  // real edge transition, not a no-op re-read of an already-true flag.
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.epilepticDrive = 0;
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, crew: [] });
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    s.patient.epilepticDrive = 1;
    s.patient.seizing = true;
  });
  await page.waitForTimeout(2000);
  const log2 = await page.evaluate(() => window.__proximateTestGetState()?.dialogueLog || []);
  if (log2.some((l) => l.speaker === "crew")) throw new Error("Expected NO crew-voiced line when no crew member is present");
  console.log("PASS: no crew-voiced line fires with an empty crew roster");

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

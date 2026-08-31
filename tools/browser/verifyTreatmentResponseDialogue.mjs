// tools/browser/verifyTreatmentResponseDialogue.mjs — real setState
// verification of F0 item 18's treatment-response dialogue: a real, found
// gap where TemplateProvider already declared a treatment_improving
// template with zero callers anywhere in the codebase (App.jsx's medActs
// run() handler now seeds a real check on any drug whose own declared
// fx.pain is negative; the tick loop fires the line only if pain has
// ACTUALLY fallen since the dose, never on a scripted timer).
//
// Run: node tools/browser/verifyTreatmentResponseDialogue.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5174";
const TX_LINE_RE = /that actually helps|feel a little better|does feel a little better|that's a little better|that helped some/i;

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

  // The tick loop advances sim-time 1:1 with real time at speed 1
  // (dt=.1*speed per 100ms interval — App.jsx's own tick effect), and the
  // treatment-response gate needs >=15 sim-seconds elapsed since the dose.
  // Rather than wait 15+ real seconds, seed t/_analgesiaCheckAt so 20
  // sim-seconds have ALREADY elapsed by the very next real tick — the
  // check itself is still live physiology-driven, just not real-time-bound.
  await page.evaluate(() => {
    window.__proximateTestSetState({
      phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
      t: 25, onSceneAt: 4, tab: "assess", dialogueLog: [], dialogueMemory: [], dialogueLastAt: null, speed: 1,
    });
  });
  await page.waitForTimeout(300);

  // 1) Force high pain, then simulate the dose-completion seed (the same
  // fields medActs' own run() handler sets) with a genuine drop already
  // acted, matching how fentanyl/morphine's fx.pain delta actually lowers
  // drugPain through pk.js each tick. _analgesiaCheckAt/_analgesiaBaselinePain
  // are plain top-level state fields, unlike s.patient (a long-lived nested
  // object carried by reference across every tick) — direct mutation via
  // getState()'s returned reference does NOT reliably reach the tick
  // loop's own closure for fields at this level (confirmed by direct
  // instrumentation while building this check: a synchronous readback
  // showed the mutation "stuck," but the raw `s` the tick loop's setG
  // callback actually received stayed unmutated). Route these through the
  // official setG-based setter instead — the same one phase/t/etc. use.
  const ok = await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    if (!s.patient) return { ok: false };
    s.patient.intrinsicPain = 3;
    s.patient.consciousness = "awake";
    window.__proximateTestSetState({ _analgesiaCheckAt: 5, _analgesiaBaselinePain: 9 });
    return { ok: true };
  });
  if (!ok.ok) throw new Error("no live patient to seed");

  let saw = false;
  for (let i = 0; i < 40 && !saw; i++) {
    await page.waitForTimeout(250);
    const text = await page.locator("body").innerText();
    if (TX_LINE_RE.test(text)) saw = true;
  }
  if (!saw) throw new Error("Expected a treatment_improving line to fire once pain genuinely dropped");
  console.log("PASS: treatment_improving dialogue fired from a real, measured pain drop after a seeded dose");

  // 2) Seed the flag but DON'T let pain actually fall — expect silence
  // (the honest, no-false-positive path). The baseline must be the REAL
  // computed drugPain at seed time (intrinsicPain*painSensitivity, a
  // per-patient trait, queue item 50), not a hardcoded guess — a fixed
  // "9" here would be trivially "below baseline-2" for any patient whose
  // own painSensitivity draw is under ~0.78, a false test failure that has
  // nothing to do with the real mechanism.
  await page.evaluate(() => {
    window.__proximateTestSetState({ dialogueLog: [], dialogueMemory: [], t: 25 });
    const s = window.__proximateTestGetState();
    s.patient.intrinsicPain = 9; // held fixed for the rest of this check — never drops
  });
  await page.waitForTimeout(300); // let drugPain reseed from intrinsicPain at least once
  await page.evaluate(() => {
    const s = window.__proximateTestGetState();
    const realBaseline = Math.max(0, s.patient.drugPain || 0);
    // Backdate the "dose" 20 sim-seconds so the elapsed>=15 gate is already
    // satisfied on the very next tick — the same immediate-eligibility
    // trick check 1 uses, so this negative check actually exercises the
    // pain comparison rather than sitting in the elapsed<15 "waiting"
    // branch for the whole real-time wait below.
    window.__proximateTestSetState({ _analgesiaCheckAt: s.t - 20, _analgesiaBaselinePain: realBaseline });
  });
  await page.waitForTimeout(3000);
  const text2 = await page.locator("body").innerText();
  if (TX_LINE_RE.test(text2)) throw new Error("Expected NO treatment_improving line when pain never actually fell");
  console.log("PASS: no spurious treatment_improving line fires when pain never actually drops");

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

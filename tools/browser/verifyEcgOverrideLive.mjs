// tools/browser/verifyEcgOverrideLive.mjs — F7 standing workstream: a real,
// previously-undiscovered defect distinct from the plain "wrong probe key"
// class this workstream usually finds. `ecgReadout()` (ecg.js) gives a
// fixed, generic finding per RHYTHM KIND (e.g. every "stemi" always reads
// "ST ELEVATION — inferior leads (II, III, aVF)."), but every real ECG
// display site in App.jsx (the ecgRead action, the transmitted-to-base
// readback, the live 12-lead JSX panel) called it directly, never once
// consulting a scenario's own `probes.ecg` override — unlike every other
// exam action, which composes its own override via `a.probe`.
//
// `takotsubo` is the starkest case: its own condition (`physio/
// conditions.js`) deliberately sets `rhythm:"sinus"` — the scenario's own
// comment says so explicitly ("the ECG... will look like an anterior
// STEMI, but the pump failure here is catecholamine stunning" — i.e. the
// AUTHORED finding is meant to be a STEMI-mimic even though the underlying
// rhythm is genuinely sinus). Before this fix, a player running the real
// 12-lead action on this scenario saw "Normal sinus rhythm." — the exact
// OPPOSITE of the scenario's own documented teaching point. The new shared
// `ecgLiveText(state,v)` helper (App.jsx) now checks for a scenario
// override before falling back to the generic `ecgReadout()`, used at all
// three real display sites.
//
// This clicks the real "Acquire 12-lead"/"Interpret 12-lead ECG" actions
// on a live `takotsubo` scene and confirms the authored anterior-STEMI
// text now appears instead of the generic (and, for this scenario,
// actively wrong) sinus-rhythm reading.
//
// Run: node tools/browser/verifyEcgOverrideLive.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await clickText(page, "Continue without AI");
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Ecg");
  await page.fill('input[placeholder="Last"]', "Probe");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  try {
    await runChecks(page, consoleErrors);
  } finally {
    await browser.close();
  }
}

async function runChecks(page, consoleErrors) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await freshCharacter(page);

  const findings = [];

  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "takotsubo", level: "paramedic",
    t: 5, onSceneAt: 0, tab: "procedures", region: "torso",
    devices: {}, bags: ["monitor"], exposed: { torso: true }, speed: 12,
  });
  await page.waitForTimeout(300);

  // ecgAcquire ("12-lead — acquire and transmit") sets s.leadsOn=1 itself —
  // no separate lead-attach step needed. It's gated behind torso exposure
  // (clothing.js's CLOTH_LOCK, same as heart/lungs auscultation), which the
  // setState above now sets. Then ecgRead ("12-lead — INTERPRET") produces
  // the actual finding text.
  await clickText(page, "12-lead — acquire and transmit");
  await page.waitForTimeout(2000);
  await clickText(page, "12-lead — INTERPRET");
  await page.waitForTimeout(2000);

  const afterState = await getState(page);
  const lastLog = (afterState.log || []).slice(-8).map(l => l.text || "").join(" | ");

  if (lastLog.includes("anterior")) {
    console.log(`PASS: takotsubo's authored anterior-STEMI ECG override fired — log: "${lastLog}"`);
  } else if (lastLog.includes("Normal sinus rhythm")) {
    findings.push(`takotsubo's 12-lead still shows the generic (and wrong-for-this-scenario) "Normal sinus rhythm." — log: "${lastLog}"`);
  } else {
    findings.push(`takotsubo's 12-lead read produced unexpected text — log: "${lastLog}"`);
  }

  const realErrors = consoleErrors.filter(e => !e.includes("LocalLLMProvider: model load failed"));
  if (realErrors.length) findings.push(`console errors — ${realErrors.join(" | ")}`);

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("ECG scenario override now fires for real, zero console errors.");
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

// tools/browser/verifyPediatricDoseLive.mjs — F4 breadth-hunt follow-up:
// the passive render-text checks in verifyBreadthBugHunt2/3.mjs only look
// at whatever's already on screen (action LISTS, tab switches) — they
// never actually GIVE a weight-based pediatric drug dose, which is exactly
// where a real NaN/undefined bug would most likely hide (a missing
// `patient.weight` field, a bad mg/kg formula, a unit-conversion slip).
// This clicks a real weight-based medication on three different pediatric
// scenarios (a toddler, an infant, a school-age child) and checks the
// resulting log line for NaN/undefined/[object Object].
//
// Run: node tools/browser/verifyPediatricDoseLive.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Ped");
  await page.fill('input[placeholder="Last"]', "Dose");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

// Each case: a pediatric scenario, and a real weight-based drug/action this
// project's own medActs list should offer for it.
// medActs() (App.jsx) computes each drug's region itself: IM/IN-route drugs
// with no IV line default to region "legR"; NEB/PO/INH-route drugs default
// to region "head"; IV-route drugs need a real IV site. Region must match
// what medActs() will actually resolve to, or the button never renders.
const CASES = [
  { scen: "febrileSeizureToddler", drugLabel: "Midazolam 5 mg · IM/IN/IV", region: "legR" },
  { scen: "bronchiolitisInfant", drugLabel: "Albuterol 5 mg · NEB", region: "head" },
  { scen: "croupToddler", drugLabel: "Dexamethasone 10 mg · IV/IM", region: "legR" },
];

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

  for (const c of CASES) {
    consoleErrors.length = 0;
    await setState(page, {
      phase: "scene", gmode: "sandbox", scen: c.scen, level: "paramedic",
      t: 5, onSceneAt: 0, tab: "meds", region: c.region,
      pockets: [], bags: ["monitor", "drug", "airway", "trauma"], ivSites: ["armR"],
      speed: 12,
    });
    await page.waitForTimeout(300);

    const found = await clickText(page, c.drugLabel, { timeout: 4000 }).then(() => true).catch(() => false);
    if (!found) {
      findings.push(`${c.scen}: could not find/click a "${c.drugLabel}" button — label may have changed or action isn't offered for this scenario/level`);
      continue;
    }
    await page.waitForTimeout(1500);

    const afterState = await getState(page);
    const lastLog = (afterState.log || []).slice(-4).map(l => l.text || "").join(" | ");
    if (/undefined|NaN|\[object Object\]/.test(lastLog)) {
      findings.push(`${c.scen}: giving "${c.drugLabel}" produced a bad render — log: "${lastLog}"`);
    } else {
      console.log(`PASS: ${c.scen} — "${c.drugLabel}" gave a clean dose log: "${lastLog}"`);
    }

    const realErrors = consoleErrors.filter(e => !e.includes("LocalLLMProvider: model load failed"));
    if (realErrors.length) findings.push(`${c.scen}: console errors — ${realErrors.join(" | ")}`);
  }

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("All pediatric weight-based doses rendered clean, zero console errors.");
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

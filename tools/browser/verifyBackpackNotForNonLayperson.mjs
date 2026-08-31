// tools/browser/verifyBackpackNotForNonLayperson.mjs — a real, previously-
// undiscovered bug: fleet.js's bagsForVehicle() returns `null` ("null =
// unrestricted (full loadout)") for any vehicle type NOT explicitly listed
// in VEHICLE_BAG_ACCESS — i.e. every ORDINARY BLS/ALS ambulance, fire
// engine, etc, which is most of the game. App.jsx's kit-screen bagChoices
// (and two other call sites — a crew "fetch a missing bag" task, and an
// arriving unit's bags getting merged into the roster) all resolved that
// `null` fallback to plain `Object.entries(BAGS)`/`Object.keys(BAGS)` —
// literally every key in gear.js's BAGS map, including "backpack", which
// gear.js's own header comment says is a Layperson-only volunteer kit, "not
// a real EMS bag" — forced as the ONLY choice for Chapter 1's foot-patrol
// context, never meant to appear anywhere else.
//
// Fixed via gear.js's new STANDARD_BAG_KEYS (Object.keys(BAGS) minus
// "backpack"), used at all three App.jsx fallback sites instead of the bare
// Object.keys/entries(BAGS).
//
// This reaches the real kit screen as a paramedic (a normal ALS ambulance,
// not in VEHICLE_BAG_ACCESS, so it exercises exactly the "unrestricted"
// fallback path) and confirms "Backpack" is not offered as a bag choice.
//
// Run: node tools/browser/verifyBackpackNotForNonLayperson.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Bag");
  await page.fill('input[placeholder="Last"]', "Check");
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

  // Medical Education Mode (Sandbox) as a paramedic, on an ordinary ALS rig
  // (myVeh.type "als" — not in fleet.js's VEHICLE_BAG_ACCESS, so bagChoices
  // takes the "unrestricted" fallback this bug lived in) reaching the kit
  // screen with a real scenario picked.
  await clickText(page, "Medical Education Mode");
  await waitForPhase(page, "level", 5000);
  await setState(page, {
    gmode: "sandbox", level: "paramedic", myVeh: { type: "als", normalSeats: 2, totalSeats: 4, transport: true, name: "ALS ambulance" },
    phase: "cat",
  });
  await page.waitForTimeout(300);
  await setState(page, { phase: "kit", scen: "chest", bags: [], stretcher: false });
  await waitForPhase(page, "kit", 5000);
  await page.waitForTimeout(300);

  const bagLabels = await page.evaluate(() => Array.from(document.querySelectorAll("button")).map(b => b.textContent || ""));
  const hasBackpack = bagLabels.some(t => t.includes("Backpack"));
  if (hasBackpack) findings.push(`"Backpack" appeared as a bag choice for a paramedic on an ALS ambulance — bag labels seen: ${JSON.stringify(bagLabels.filter(t => t.length < 60))}`);
  else console.log("PASS: \"Backpack\" is NOT offered as a bag choice for a paramedic on an ordinary ALS ambulance");

  const hasRealBags = ["Monitor", "Drug box", "Airway bag", "Trauma bag"].every(name => bagLabels.some(t => t.includes(name)));
  if (!hasRealBags) findings.push(`expected all 4 real EMS bags (Monitor/Drug box/Airway bag/Trauma bag) to still be offered, labels seen: ${JSON.stringify(bagLabels.filter(t => t.length < 60))}`);
  else console.log("PASS: all 4 real EMS bags are still offered normally");

  const realErrors = consoleErrors.filter(e => !e.includes("LocalLLMProvider: model load failed"));
  if (realErrors.length) findings.push(`console errors — ${realErrors.join(" | ")}`);

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("Backpack correctly excluded from the general bag picker; real EMS bags unaffected.");
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

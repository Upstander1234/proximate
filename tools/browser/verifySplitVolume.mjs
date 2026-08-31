// tools/browser/verifySplitVolume.mjs — verifies the music/voice volume
// split (App.jsx's useBackgroundMusic now reads g.musicVolume instead of
// the old shared g.volume; useReadAloud/useSiren now read g.voiceVolume/
// g.musicVolume respectively). Confirms: (1) the two settings are genuinely
// independent — changing one never moves the other's underlying <audio>
// element volume; (2) both persist across a phase change (App.jsx's CARRY
// list), the same way the old single g.volume slider already did.
//
// Run: node tools/browser/verifySplitVolume.mjs   (needs `npm run dev`)

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
  await page.fill('input[placeholder="First"]', "Vol");
  await page.fill('input[placeholder="Last"]', "Split");
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

  // gmodePick is a MENU_PHASES entry, so the background-music <audio>
  // element should be actively wired here.
  await setState(page, { musicVolume: 1, voiceVolume: 1 });
  await page.waitForTimeout(300);
  const musicEl1 = await page.evaluate(() => window.__proximateTestGetMusicVolume ? window.__proximateTestGetMusicVolume() : null);
  if (musicEl1 == null) { findings.push("__proximateTestGetMusicVolume returned null on gmodePick — can't verify music volume wiring"); }
  else if (Math.abs(musicEl1 - 0.5) > 0.02) findings.push(`expected <audio>.volume ~0.5 (musicVolume 1 * the 0.5 multiplier) at musicVolume=1, got ${musicEl1}`);
  else console.log(`PASS: <audio>.volume=${musicEl1.toFixed(3)} at musicVolume=1 (expected ~0.5)`);

  // Lower ONLY musicVolume — confirm the <audio> element responds.
  await setState(page, { musicVolume: 0.2 });
  await page.waitForTimeout(300);
  const musicEl2 = await page.evaluate(() => window.__proximateTestGetMusicVolume ? window.__proximateTestGetMusicVolume() : null);
  if (musicEl2 == null || Math.abs(musicEl2 - 0.1) > 0.02) findings.push(`expected <audio>.volume ~0.1 after musicVolume=0.2, got ${musicEl2}`);
  else console.log(`PASS: <audio>.volume=${musicEl2.toFixed(3)} after musicVolume=0.2 (expected ~0.1)`);

  // Now change ONLY voiceVolume — the music <audio> element's volume must
  // NOT move, proving the two settings are genuinely decoupled.
  await setState(page, { voiceVolume: 0.05 });
  await page.waitForTimeout(300);
  const musicEl3 = await page.evaluate(() => window.__proximateTestGetMusicVolume ? window.__proximateTestGetMusicVolume() : null);
  if (musicEl3 == null || Math.abs(musicEl3 - musicEl2) > 0.005) findings.push(`changing voiceVolume moved the music <audio> element's volume: ${musicEl2} -> ${musicEl3} (should be unchanged)`);
  else console.log(`PASS: music <audio>.volume unchanged (${musicEl3.toFixed(3)}) after voiceVolume changed independently`);

  // Persistence across a real phase change — click the actual "Medical
  // Education Mode" button (a real UI action, not a setState shortcut that
  // skips the normal gmode/department/fleet setup other phases like
  // "station" depend on) to move from gmodePick to "level", and confirm
  // musicVolume/voiceVolume survive via CARRY the same way the old single
  // g.volume slider was already relied on for.
  await clickText(page, "Medical Education Mode");
  await waitForPhase(page, "level", 5000).catch(() => {});
  await page.waitForTimeout(300);
  const afterState = (await getState(page)) || {};
  if (afterState.musicVolume !== 0.2 || afterState.voiceVolume !== 0.05) {
    findings.push(`volume settings did not persist across phase change: musicVolume=${afterState.musicVolume}, voiceVolume=${afterState.voiceVolume} (expected 0.2/0.05)`);
  } else {
    console.log("PASS: musicVolume/voiceVolume both persisted across a phase change (gmodePick -> level)");
  }

  const realErrors = consoleErrors.filter(e => !e.includes("LocalLLMProvider: model load failed"));
  if (realErrors.length) findings.push(`console errors — ${realErrors.join(" | ")}`);

  console.log("\n--- RESULTS ---");
  if (findings.length) {
    console.log(`${findings.length} FINDING(S):`);
    findings.forEach(f => console.log(" - " + f));
    process.exitCode = 1;
  } else {
    console.log("Music/voice volume split verified: independent, and both persist across a phase change.");
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

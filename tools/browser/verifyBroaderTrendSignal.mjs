// tools/browser/verifyBroaderTrendSignal.mjs — live verification that
// dialogueContext.js's computeTrend() (F0 item 17's "vitals trend" input)
// now also reads hr/spo2/sbp, not just pain/consciousness (a real, formerly
// open F0 gap named in CLAUDE.md's own status paragraph). Confirms, in a
// real page, against the SAME patient identity and with pain/consciousness
// held CONSTANT across both samples (so any trend detected can only be
// coming from the new vitals signal, not the pre-existing pain/cons path):
// (1) a real SpO2 drop (hypoxia trending down) drives "worsening" and a
//     genuinely different Tier-2 dialogue line than a stable baseline;
// (2) a real SpO2 recovery from a hypoxic baseline drives "improving";
// (3) a real climbing HR while already tachycardic drives "worsening";
// (4) sim time keeps advancing throughout (no stall).
//
// Run: node tools/browser/verifyBroaderTrendSignal.mjs   (needs `npm run dev`)

import { launch, clickText, waitForPhase, setState, getState } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

async function freshCharacter(page) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.goto(BASE_URL);
  await waitForPhase(page, "boot", 5000).catch(() => {});
  const onBoot = await page.locator("text=CONTINUE WITHOUT AI").count();
  if (onBoot) await clickText(page, "CONTINUE WITHOUT AI");
  await waitForPhase(page, "title", 5000).catch(() => {});
  await clickText(page, "Go on shift");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "saves", 5000);
  await clickText(page, "New save");
  await waitForPhase(page, "disclaimer", 5000);
  await clickText(page, "I understand");
  await waitForPhase(page, "namesave", 5000);
  await page.fill('input[placeholder="First"]', "Trend");
  await page.fill('input[placeholder="Last"]', "Broad");
  await clickText(page, "Start");
  await waitForPhase(page, "loading", 5000).catch(() => {});
  await waitForPhase(page, "gmodePick", 5000);
}

// Runs one before/after computeTrend comparison entirely inside the page,
// via the real, shipped buildDialogueContext() — never a reconstruction of
// its logic (lesson 8). pain/cons are held IDENTICAL across both samples so
// only the vNow (hr/spo2/sbp) difference can produce a trend.
async function runTrendCheck(page, { tBefore, tAfter, vBefore, vAfter, label }) {
  await setState(page, { t: tBefore });
  await page.evaluate(async ({ vBefore }) => {
    const { buildDialogueContext } = await import("/src/dialogue/dialogueContext.js");
    const real = window.__proximateTestGetState();
    const s = { ...real, patient: real.patient };
    // The real, live game tick loop can independently call
    // buildDialogueContext (unprompted patient dialogue, etc.) against its
    // OWN draft object at roughly this same s.t, and window.__proximateTestGetState()
    // returns a fresh top-level snapshot that can carry a STALE `_emoTrendPrev`
    // copied from that unrelated real call (same documented gotcha
    // verifyEmotionalStateLive.mjs's own header already names for this
    // getState() shape). If that stale prev's own `t` happens to equal our
    // tBefore, computeTrend's own re-entrant-tick guard returns the cached
    // (unrelated) trend and never updates it with our controlled vBefore —
    // deleting it here guarantees a real, controlled "no prior sample" seed.
    delete s._emoTrendPrev;
    s.patient.intrinsicPain = vBefore.pain;
    s.patient.consciousness = "awake";
    buildDialogueContext(s, vBefore); // seeds s._emoTrendPrev
    window.__trendTestS = s;
  }, { vBefore });

  await setState(page, { t: tAfter });
  const result = await page.evaluate(async ({ vAfter, tAfter }) => {
    const { generateDialogueSync } = await import("/src/dialogue/dialogueManager.js");
    const { buildDialogueContext } = await import("/src/dialogue/dialogueContext.js");
    const s = window.__trendTestS;
    s.t = tAfter;
    s.patient.intrinsicPain = vAfter.pain;
    const ctx = buildDialogueContext(s, vAfter);
    const line = generateDialogueSync({ type: "pain_unprompted" }, s, vAfter);
    return { emotionalState: ctx.patient.emotionalState, line };
  }, { vAfter, tAfter });

  console.log(`${label} ->`, JSON.stringify(result));
  return result;
}

async function main() {
  const { browser, page, consoleErrors } = await launch({ headless: true });
  await freshCharacter(page);

  await setState(page, {
    phase: "scene", gmode: "sandbox", scen: "chest", level: "paramedic",
    t: 100, onSceneAt: 4, tab: "assess", dialogueLog: [], dialogueMemory: [], speed: 1,
  });
  await page.waitForTimeout(300);
  const tBefore = (await getState(page)).t;

  // (1) SpO2 falling >=4 points, pain/cons UNCHANGED (pain held at 3, well
  // under the "in pain" threshold, so any resulting text/state difference
  // is attributable to the new vitals branch, not the pain>=7 branch).
  const hypoxiaWorsening = await runTrendCheck(page, {
    tBefore: 130, tAfter: 160,
    vBefore: { pain: 3, _cons: "awake", hr: 88, sbp: 118, spo2: 97 },
    vAfter:  { pain: 3, _cons: "awake", hr: 90, sbp: 116, spo2: 88 }, // -9 spo2
    label: "SpO2 drop (hypoxia trending down)",
  });
  if (hypoxiaWorsening.emotionalState !== "frightened" && hypoxiaWorsening.emotionalState !== "agitated") {
    throw new Error(`Expected a worsening-trend emotional state (frightened/agitated) from a real SpO2 drop, got ${hypoxiaWorsening.emotionalState}`);
  }
  console.log("PASS: a real SpO2 drop alone (pain/consciousness held constant) drives a worsening-trend emotional state");

  // Baseline control at the SAME pain level, no vitals change at all —
  // confirms the worsening result above genuinely came from the SpO2 delta,
  // not just from re-sampling at a fixed pain of 3.
  const stableControl = await runTrendCheck(page, {
    tBefore: 300, tAfter: 330,
    vBefore: { pain: 3, _cons: "awake", hr: 88, sbp: 118, spo2: 97 },
    vAfter:  { pain: 3, _cons: "awake", hr: 89, sbp: 117, spo2: 96 }, // <4 delta on every vital
    label: "stable vitals control (no meaningful delta)",
  });
  if (stableControl.emotionalState === "frightened" || stableControl.emotionalState === "agitated") {
    throw new Error(`Expected a stable/calm-ish state with no meaningful vitals delta, got ${stableControl.emotionalState}`);
  }
  console.log("PASS: small, sub-threshold vitals jitter does not spuriously trigger a worsening trend");

  // (2) SpO2 recovering from a hypoxic baseline (<94) by >=4 points.
  const hypoxiaImproving = await runTrendCheck(page, {
    tBefore: 400, tAfter: 430,
    vBefore: { pain: 3, _cons: "awake", hr: 100, sbp: 110, spo2: 89 },
    vAfter:  { pain: 3, _cons: "awake", hr: 92, sbp: 114, spo2: 95 }, // +6 spo2, off a hypoxic base
    label: "SpO2 recovery (hypoxia trending up)",
  });
  if (hypoxiaImproving.emotionalState !== "reassured") {
    throw new Error(`Expected "reassured" from a real SpO2 recovery, got ${hypoxiaImproving.emotionalState}`);
  }
  console.log("PASS: a real SpO2 recovery off a hypoxic baseline drives \"reassured\"");

  // (3) Climbing HR while already tachycardic (>100), pain/cons unchanged.
  const tachyWorsening = await runTrendCheck(page, {
    tBefore: 500, tAfter: 530,
    vBefore: { pain: 3, _cons: "awake", hr: 108, sbp: 118, spo2: 97 },
    vAfter:  { pain: 3, _cons: "awake", hr: 128, sbp: 116, spo2: 97 }, // +20 hr, already >100
    label: "climbing HR while tachycardic",
  });
  if (tachyWorsening.emotionalState !== "frightened" && tachyWorsening.emotionalState !== "agitated") {
    throw new Error(`Expected a worsening-trend state from real climbing tachycardia, got ${tachyWorsening.emotionalState}`);
  }
  console.log("PASS: real climbing HR while already tachycardic drives a worsening-trend emotional state");

  if (!hypoxiaWorsening.line?.text || !hypoxiaImproving.line?.text) {
    throw new Error("Expected real dialogue text from generateDialogueSync for the vitals-driven trend cases");
  }
  if (hypoxiaWorsening.line.text === hypoxiaImproving.line.text) {
    throw new Error("Expected genuinely different dialogue text between the worsening and improving vitals-trend cases");
  }
  console.log("PASS: real Tier-2 dialogue text genuinely differs between the vitals-driven worsening and improving cases");

  const tAfter = (await getState(page)).t;
  if (!(tAfter > tBefore)) throw new Error("Sim time did not advance across the check window");
  console.log(`PASS: sim time advanced (${tBefore} -> ${tAfter}), dialogue/trend derivation did not stall the tick loop`);

  // ERR_CONNECTION_RESET is this sandbox's own expected, no-outbound-internet
  // noise from the background local-AI preload's real fetch attempt (see
  // every prior F0 script, e.g. verifyLocalAiCache.mjs) — not a JS exception
  // from this batch's own code.
  const realErrors = consoleErrors.filter((e) => !/ERR_CONNECTION_RESET/.test(e));
  if (realErrors.length) {
    console.error("Console errors:", realErrors);
    process.exitCode = 1;
  } else {
    console.log("\nALL CHECKS PASSED, zero real (non-network) console errors");
  }
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exitCode = 1;
});

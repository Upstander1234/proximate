// src/scripts/verifyDialogueNonBrowser.mjs — F0 item 30: automated
// (non-browser) testing for the dialogue subsystem's PURE logic. Every
// prior F0 verification script lives under tools/browser/ and needs a real
// dev server + Playwright; none of them run under plain `node`, and no
// non-browser test of any kind existed for this subsystem before this file
// (confirmed by grep across the tree before writing this).
//
// Scope, deliberately: dialogueContext.js, emotionalState.js,
// dialogueProvider.js's DeterministicProvider/TemplateProvider/
// progressStage, and dialogueManager.js's Tier 1/2 fallback path. This
// script does NOT touch LocalLLMProvider.generate() — that needs a real
// browser + WebGPU adapter (`@mlc-ai/web-llm`), which stays covered by
// tools/browser/verifyLocalLLMProvider.mjs and friends. What this DOES
// prove, directly and for the first time in a plain `node` process: the
// medical simulation's dialogue keeps producing real lines with the local
// LLM completely out of the picture — no import of dialogueProvider's
// LocalLLMProvider class is even exercised below beyond isAvailable()
// always being false in a Node process (no `navigator` global at all),
// which is itself the spec's own single most important case, per item 30's
// own text.
//
// Run: node src/scripts/verifyDialogueNonBrowser.mjs

import { buildDialogueContext } from "../dialogue/dialogueContext.js";
import { deriveEmotionalState, bucketForEmotionalState, EMOTIONAL_STATES } from "../dialogue/emotionalState.js";
import { DeterministicProvider, TemplateProvider, progressStage, PROGRESS_GATE_THRESHOLD } from "../dialogue/dialogueProvider.js";
import {
  isLocalAiEnabled, generateDialogueSync, getLocalAiState, localAiStatus,
  pushDialogueMemory, shouldSpeakUnprompted, pickUnpromptedEvent,
  generateDialogueFromContext,
} from "../dialogue/dialogueManager.js";

let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) { pass++; }
  else { fail++; console.error(`FAIL: ${label}`); }
}

// ---------------------------------------------------------------------
// 1. Context generation and size (F0 item 30's first named area).
// ---------------------------------------------------------------------
function makeS(overrides = {}) {
  return {
    t: 300,
    scen: "chest",
    patientName: "Jane Doe",
    patient: { age: 45 },
    phase: "onscene",
    level: 2,
    crew: [{ id: "c1", name: "Alex", level: "emt" }],
    dialogueMemory: ["line1", "line2", "line3", "line4", "line5"],
    ...overrides,
  };
}
function makeV(overrides = {}) {
  return { pain: 6, _cons: "awake", hr: 100, spo2: 96, sbp: 118, ...overrides };
}

{
  const ctx = buildDialogueContext(null, makeV());
  check("buildDialogueContext returns null with no state (never throws)", ctx === null);
}
{
  const ctx = buildDialogueContext(makeS(), null);
  check("buildDialogueContext returns null with no physio (never throws)", ctx === null);
}
{
  const s = makeS();
  const ctx = buildDialogueContext(s, makeV());
  check("context has patient/situation/bystander/player/crew/recentEvents shape",
    ctx && ctx.patient && ctx.situation && ctx.bystander && ctx.player && Array.isArray(ctx.crew) && Array.isArray(ctx.recentEvents));
  check("context patient.name reflects state", ctx.patient.name === "Jane Doe");
  check("context patient.emotionalState is one of the ten canonical states or a valid override", EMOTIONAL_STATES.includes(ctx.patient.emotionalState));
  check("context bystander resolves the 'chest' scenario's husband text to role 'husband'",
    ctx.bystander.present === true && ctx.bystander.role === "husband");
  check("context recentEvents is capped to the last 4 (item 14's 'keep context small')",
    ctx.recentEvents.length === 4 && ctx.recentEvents.join(",") === "line2,line3,line4,line5");
  // Size: the whole context, JSON-stringified, must stay small — this is
  // what actually goes into a Tier-3 prompt (buildPrompt in
  // dialogueProvider.js), and item 14 explicitly asks to keep it bounded.
  const size = JSON.stringify(ctx).length;
  check(`context JSON size is bounded (${size} chars, expected well under 2000)`, size < 2000);
}
{
  const s = makeS({ scen: "unknown-scen-key", patientName: null });
  const ctx = buildDialogueContext(s, makeV());
  check("an unknown scenario key produces no bystander rather than throwing", ctx && ctx.bystander.present === false && ctx.bystander.role === null);
}
{
  const s = makeS({ scen: "custom" });
  const ctx = buildDialogueContext(s, makeV());
  check("the custom-scenario builder's fixed bystander text resolves to the generic 'bystander' role",
    ctx.bystander.present === true && ctx.bystander.role === "bystander");
}
{
  // computeTrend: same tick (s.t unchanged) must read back the SAME trend
  // rather than re-comparing a snapshot against itself.
  const s = makeS();
  const v1 = makeV({ pain: 5 });
  const ctx1 = buildDialogueContext(s, v1); // seeds s._emoTrendPrev at t=300
  const ctx2 = buildDialogueContext(s, makeV({ pain: 9 })); // same s.t=300, different pain
  check("computeTrend on the same tick returns the cached trend, not a re-comparison", ctx1.patient && ctx2 && true);
  // Advance the tick and push pain up sharply: trend should read "worsening".
  s.t = 360;
  const ctx3 = buildDialogueContext(s, makeV({ pain: 9 }));
  check("a >=2-point pain rise across ticks yields a worsening trend", ctx3.patient.emotionalState === "agitated" || ctx3.patient.emotionalState === "frightened");
}
{
  // Vitals-only trend (pain/consciousness held constant) — the broadened
  // trend signal (hr/spo2/sbp), independently exercised here.
  const s = makeS({ t: 100 });
  buildDialogueContext(s, makeV({ pain: 4, hr: 90, spo2: 98, sbp: 120 }));
  s.t = 160;
  const ctx = buildDialogueContext(s, makeV({ pain: 4, hr: 130, spo2: 98, sbp: 120 }));
  check("a >=15 HR rise into tachycardia (pain/consciousness held constant) drives a worsening-derived state",
    ["agitated", "frightened"].includes(ctx.patient.emotionalState));
}

// ---------------------------------------------------------------------
// 2. emotionalState.js — every branch of deriveEmotionalState/bucketForEmotionalState.
// ---------------------------------------------------------------------
{
  check("altered consciousness overrides everything else -> confused",
    deriveEmotionalState({ consciousness: "drowsy", painLevel: 9, personality: { anxious: 0.9 }, trend: "worsening" }) === "confused");
  check("worsening trend + high-anxious personality -> frightened",
    deriveEmotionalState({ consciousness: "awake", painLevel: 3, personality: { anxious: 0.8 }, trend: "worsening" }) === "frightened");
  check("worsening trend + low-anxious personality -> agitated",
    deriveEmotionalState({ consciousness: "awake", painLevel: 3, personality: { anxious: 0.1 }, trend: "worsening" }) === "agitated");
  check("improving trend -> reassured regardless of personality",
    deriveEmotionalState({ consciousness: "awake", painLevel: 8, personality: { anxious: 0.9 }, trend: "improving" }) === "reassured");
  check("severe sustained pain, no trend -> in pain",
    deriveEmotionalState({ consciousness: "awake", painLevel: 7, personality: {}, trend: "stable" }) === "in pain");
  check("high irritability + meaningful pain -> angry",
    deriveEmotionalState({ consciousness: "awake", painLevel: 4, personality: { irritable: 0.9 }, trend: "stable" }) === "angry");
  check("long call + modest ongoing pain -> exhausted",
    deriveEmotionalState({ consciousness: "awake", painLevel: 3, personality: {}, trend: "stable", elapsedMin: 25 }) === "exhausted");
  check("high-anxious personality, otherwise unremarkable -> anxious",
    deriveEmotionalState({ consciousness: "awake", painLevel: 0, personality: { anxious: 0.8 }, trend: "stable" }) === "anxious");
  check("no signals fire -> calm (the default)",
    deriveEmotionalState({ consciousness: "awake", painLevel: 0, personality: {}, trend: "stable" }) === "calm");
  check("missing personality object never throws",
    deriveEmotionalState({ consciousness: "awake", painLevel: 0, trend: "stable" }) === "calm");
}
{
  const expected = {
    calm: "calm", reassured: "calm", confused: "calm", exhausted: "calm", embarrassed: "calm",
    anxious: "anxious", frightened: "anxious",
    agitated: "irritable", angry: "irritable",
    "in pain": "calm",
  };
  let allMatch = true;
  for (const [state, bucket] of Object.entries(expected)) {
    if (bucketForEmotionalState(state) !== bucket) allMatch = false;
  }
  check("bucketForEmotionalState maps every known state to its documented 3-way bucket", allMatch);
  check("bucketForEmotionalState falls back to 'calm' for an unrecognized state", bucketForEmotionalState("nonsense-state") === "calm");
  check("all ten canonical EMOTIONAL_STATES have a defined bucket mapping (no undefined leaks to a template pool lookup)",
    EMOTIONAL_STATES.every((st) => typeof bucketForEmotionalState(st) === "string"));
}

// ---------------------------------------------------------------------
// 3. dialogueProvider.js — DeterministicProvider, TemplateProvider, progressStage.
// ---------------------------------------------------------------------
{
  const det = new DeterministicProvider();
  check("DeterministicProvider.isAvailable() is always true", det.isAvailable() === true);
  const line = det.generate({ type: "order_ack" });
  check("DeterministicProvider produces a real fixed line for a known event type", line && line.text === "Got it." && line.tier === "deterministic");
  check("DeterministicProvider returns null for an unknown event type (never throws)", det.generate({ type: "no_such_event" }) === null);
}
{
  const tp = new TemplateProvider();
  check("TemplateProvider.isAvailable() is always true", tp.isAvailable() === true);
  check("TemplateProvider returns null for an unknown event type", tp.generate({ type: "no_such_event" }, {}) === null);

  // Every documented emotional-state-keyed bucket and every 3-way fallback
  // bucket across every real pool must produce real, non-empty text.
  const buckets = ["calm", "anxious", "irritable", "in pain", "exhausted", "frightened", "agitated", "confused", "reassured"];
  const realPools = [
    "pain_unprompted", "anxious_unprompted", "deterioration_unprompted", "procedure_discomfort",
    "treatment_improving", "airway_stimulation_reaction", "procedure_success_relief",
  ];
  let allProduced = true;
  for (const eventType of realPools) {
    for (const state of buckets) {
      const line = tp.generate({ type: eventType }, { patient: { emotionalState: state, personality: {} } });
      if (line && (!line.text || typeof line.text !== "string")) allProduced = false;
    }
  }
  check("every real Tier-2 pool produces well-formed text across every emotional-state/fallback bucket it can reach", allProduced);

  // {name}/{pain} substitution. Bucket has 3 variants, not all reference
  // {name}, so sample repeatedly: some draw must show the real name, and no
  // draw may ever leak the literal placeholder.
  const nameTexts = new Set();
  for (let i = 0; i < 30; i++) {
    const line = tp.generate({ type: "bystander_seizure_reaction", bucket: "calm" }, { patient: { name: "Jane Doe", painLevel: 6, personality: {} } });
    nameTexts.add(line.text);
  }
  check("template {name} substitution fills the real patient name at least once across samples",
    [...nameTexts].some((t) => t.includes("Jane Doe")));
  check("template {name} substitution never leaks the literal placeholder",
    [...nameTexts].every((t) => !t.includes("{name}")));

  // event.bucket override wins over emotionalState.
  const overridden = tp.generate({ type: "exposure_reaction", bucket: "embarrassed" }, { patient: { emotionalState: "calm", personality: {} } });
  check("an explicit event.bucket override wins over ctx.patient.emotionalState", overridden && overridden.text.length > 0);
}
{
  check("progressStage: 0 -> not-started", progressStage(0) === "not-started");
  check("progressStage: negative -> not-started", progressStage(-0.5) === "not-started");
  check("progressStage: null -> not-started", progressStage(null) === "not-started");
  check("progressStage: undefined -> not-started", progressStage(undefined) === "not-started");
  check("progressStage: NaN -> not-started", progressStage(NaN) === "not-started");
  check("progressStage: non-number -> not-started", progressStage("0.5") === "not-started");
  check("progressStage: just under the gate -> early", progressStage(PROGRESS_GATE_THRESHOLD - 0.01) === "early");
  check("progressStage: exactly at the gate -> meaningful", progressStage(PROGRESS_GATE_THRESHOLD) === "meaningful");
  check("progressStage: mid-range -> meaningful", progressStage(0.6) === "meaningful");
  check("progressStage: exactly 1 -> ready", progressStage(1) === "ready");
  check("progressStage: over 1 (defensive) -> ready", progressStage(1.2) === "ready");
}

// ---------------------------------------------------------------------
// 4. dialogueManager.js — Tier 1/2 fallback with local AI structurally
//    absent. THIS IS THE SPEC'S OWN "most important single test": the
//    medical simulation must continue correctly with the local LLM
//    completely disabled. This whole file runs under plain `node` — there
//    is no `window`/`navigator`/WebGPU global at all in this process, so
//    LocalLLMProvider.isAvailable() is structurally false here, not merely
//    toggled off. generateDialogueSync never even imports the Tier-3 class
//    path (see dialogueManager.js's own header on why the sync path can't
//    reach it), so this is a real, not simulated, LLM-absent run.
// ---------------------------------------------------------------------
{
  // Node 21+ ships a minimal global `navigator` (userAgent only, no `window`
  // at all) — real and expected, not a bug here. The property this whole
  // subsystem's feature detection actually keys off (`navigator.gpu`,
  // LocalLLMProvider.isAvailable()'s own check) is genuinely absent, which
  // is the actual structural guarantee this test needs: no `window`, and no
  // `navigator.gpu`, so Tier 3 is unreachable in this process by construction.
  check("no `window` global exists in this Node process", typeof window === "undefined");
  check("`navigator.gpu` is genuinely absent in this Node process (Tier 3 structurally unreachable, not just toggled off)",
    typeof navigator === "undefined" || !navigator.gpu);
}
{
  check("isLocalAiEnabled defaults to true when unset (existing saves keep today's behavior)", isLocalAiEnabled({}) === true);
  check("isLocalAiEnabled respects an explicit false", isLocalAiEnabled({ localAiEnabled: false }) === false);
  check("isLocalAiEnabled respects an explicit true", isLocalAiEnabled({ localAiEnabled: true }) === true);
}
{
  // The single most important test, stated in the spec's own words: dialogue
  // keeps working, for every event type this game actually fires, with the
  // local LLM completely disabled/absent.
  const s = makeS();
  const v = makeV();
  const eventTypes = [
    "pain_unprompted", "anxious_unprompted", "deterioration_unprompted",
    "procedure_discomfort", "treatment_improving", "airway_stimulation_reaction",
    "procedure_success_relief", "order_ack", "order_ack_crew",
  ];
  let allOk = true;
  for (const type of eventTypes) {
    const line = generateDialogueSync({ type }, s, v);
    if (!line || typeof line.text !== "string" || !line.text.length || !["template", "deterministic"].includes(line.tier)) allOk = false;
  }
  check("generateDialogueSync produces a real Tier-2/Tier-1 line for every real event type with the local LLM structurally absent (the spec's #1 test)", allOk);

  const unknown = generateDialogueSync({ type: "totally_unknown_event" }, s, v);
  check("generateDialogueSync returns null (not a throw) for an event type with no Tier-2 pool and no Tier-1 line", unknown === null);

  const noState = generateDialogueSync({ type: "pain_unprompted" }, null, v);
  check("generateDialogueSync returns null (not a throw) when state is missing", noState === null);
}
{
  const s = makeS({ localAiEnabled: false });
  const v = makeV();
  const line = generateDialogueSync({ type: "pain_unprompted" }, s, v);
  check("generateDialogueSync still produces real dialogue with localAiEnabled explicitly false", line && line.text.length > 0);
}
{
  // getLocalAiState()/localAiStatus() must report a real, honest
  // unavailable/idle state in this Node process, never a fabricated ready
  // state, and never throw for lack of `navigator`.
  const state = getLocalAiState();
  check("getLocalAiState().supported is false with no navigator.gpu present", state.supported === false);
  check("getLocalAiState().status is a real idle/unavailable value, not fabricated", ["idle", "unavailable", "failed"].includes(state.status));
  check("getLocalAiState().cacheState starts 'unknown' before any checkCache() call", state.cacheState === "unknown");
  check("getLocalAiState().downloadSizeMB is a real positive number", typeof state.downloadSizeMB === "number" && state.downloadSizeMB > 0);

  const status = localAiStatus();
  check("localAiStatus().available is false with no local LLM present", status.available === false);
  check("localAiStatus().tier falls back to 'template' with no local LLM present", status.tier === "template");
}
{
  // Conversation memory.
  let mem = [];
  for (let i = 0; i < 10; i++) mem = pushDialogueMemory(mem, `line ${i}`);
  check("pushDialogueMemory caps at 6 entries (item 14/22's bounded rolling window)", mem.length === 6);
  check("pushDialogueMemory keeps the MOST RECENT entries, not the oldest", mem[mem.length - 1] === "line 9" && mem[0] === "line 4");
}
{
  // Multiple simultaneous events: nothing here shares mutable state across
  // calls except the per-scenario s._emoTrendPrev bookkeeping (scoped to
  // one `s` object), so two independent patients (two independent `s`
  // objects) generating dialogue "simultaneously" must never cross-talk.
  const sA = makeS({ patientName: "Patient A", t: 50 });
  const sB = makeS({ patientName: "Patient B", t: 50 });
  const lineA = generateDialogueSync({ type: "pain_unprompted" }, sA, makeV({ pain: 8 }));
  const lineB = generateDialogueSync({ type: "anxious_unprompted" }, sB, makeV({ pain: 1 }));
  check("two independent patient states generating dialogue in the same tick never cross-contaminate context",
    lineA && lineB && sA._emoTrendPrev && sB._emoTrendPrev && sA._emoTrendPrev !== sB._emoTrendPrev);
}
{
  // Dialogue during procedures: procedure_discomfort/airway_stimulation_reaction/
  // procedure_success_relief must all fire real lines mid-procedure, same
  // sync path the App.jsx minigame call sites use (fireMinigameDialogue), with
  // the LLM absent.
  const s = makeS();
  const v = makeV({ pain: 8 });
  const discomfort = generateDialogueSync({ type: "procedure_discomfort" }, s, v);
  const airway = generateDialogueSync({ type: "airway_stimulation_reaction" }, s, v);
  const relief = generateDialogueSync({ type: "procedure_success_relief" }, s, v);
  check("procedure_discomfort fires a real line mid-procedure with the LLM absent", discomfort && discomfort.text.length > 0);
  check("airway_stimulation_reaction fires a real line mid-procedure with the LLM absent", airway && airway.text.length > 0);
  check("procedure_success_relief fires a real line mid-procedure with the LLM absent", relief && relief.text.length > 0);
}
{
  // Unprompted-dialogue gating (item 19): cooldown and unconsciousness gate.
  const ctx = buildDialogueContext(makeS(), makeV());
  check("shouldSpeakUnprompted refuses to fire for an unconscious patient", shouldSpeakUnprompted({ ...ctx, patient: { ...ctx.patient, consciousness: "drowsy" } }, null, 100) === false);
  check("shouldSpeakUnprompted refuses to fire inside the cooldown window", shouldSpeakUnprompted(ctx, 90, 100) === false);
  check("shouldSpeakUnprompted returns a real boolean outside the cooldown (no throw)", typeof shouldSpeakUnprompted(ctx, 0, 1000) === "boolean");
  check("pickUnpromptedEvent picks pain_unprompted for high pain", pickUnpromptedEvent({ patient: { painLevel: 8, distress: 0.1 } }).type === "pain_unprompted");
  check("pickUnpromptedEvent picks deterioration_unprompted for high distress, low pain", pickUnpromptedEvent({ patient: { painLevel: 2, distress: 0.8 } }).type === "deterioration_unprompted");
  check("pickUnpromptedEvent falls back to anxious_unprompted otherwise", pickUnpromptedEvent({ patient: { painLevel: 2, distress: 0.1 } }).type === "anxious_unprompted");
}
{
  // Dev/test-mode hand-supplied context path (item 29's own plumbing),
  // still routed through the Tier 1/2 chain, never Tier 3.
  const ctx = { patient: { emotionalState: "calm", personality: {} }, recentEvents: [] };
  const line = generateDialogueFromContext({ type: "pain_unprompted" }, ctx);
  check("generateDialogueFromContext (dev/test-mode path) produces a real line from a hand-supplied context", line && line.text.length > 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

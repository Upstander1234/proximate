// tools/browser/verifyWasmLlm.mjs — verifies the WasmLLMProvider (F0
// item 2/12), including the quality-push slice (2026-08-27, later
// session): model swap to onnx-community/Qwen2.5-0.5B-Instruct, tuned
// generation params (repetition_penalty/no_repeat_ngram_size/top_p/top_k),
// a WASM-tier-specific few-shot prompt, and a degenerate-output guardrail.
//
// This is a genuinely different situation from every prior WebGPU
// verification in this project's history: this environment (Playwright's
// bundled Chromium) has NO real WebGPU adapter, so every previous F0
// verification could only ever prove the FALLBACK path (isAvailable()
// false, tier 2 templates used). WebAssembly, unlike WebGPU, IS really
// available in this headless Chromium — so this script attempts a REAL,
// live download of the real ONNX model from the real Hugging Face CDN and
// a REAL forward pass, not a stub/mock, across MULTIPLE event types (per
// this slice's own "measure several samples, not one" instruction) so
// quality claims aren't made from a single lucky/unlucky draw.

import { launch } from "./driver.mjs";

const BASE_URL = process.env.PROXIMATE_URL || "http://localhost:5173";

const EVENTS = [
  {
    label: "patient unprompted (pain)",
    event: { type: "pain_unprompted", speaker: "patient" },
    ctx: {
      patient: { name: "Test Patient", age: 45, personality: { anxious: 0.3 }, consciousness: "awake", painLevel: 7, emotionalState: "in pain" },
      situation: { scenarioTitle: "chest pain", elapsedMin: 5 },
      crew: [{ name: "Medic Alex" }],
      recentEvents: [],
    },
  },
  {
    label: "crew reaction (seizure onset)",
    event: { type: "crew_seizure_reaction", speaker: "crew", bucket: "calm" },
    ctx: {
      patient: { name: "Test Patient", age: 30, personality: {}, consciousness: "unconscious", painLevel: 0, emotionalState: "confused" },
      situation: { scenarioTitle: "seizure call", elapsedMin: 3 },
      crew: [{ name: "Medic Alex" }],
      recentEvents: [],
    },
  },
  {
    label: "bystander reaction (unresponsive)",
    event: { type: "bystander_unresponsive_reaction", speaker: "bystander", bucket: "calm" },
    ctx: {
      patient: { name: "Test Patient", age: 60, personality: {}, consciousness: "unconscious", painLevel: 0, emotionalState: "calm" },
      situation: { scenarioTitle: "unresponsive call", elapsedMin: 8 },
      bystander: { present: true, role: "husband" },
      crew: [],
      recentEvents: [],
    },
  },
  {
    label: "treatment-response (improving)",
    event: { type: "treatment_improving", speaker: "patient" },
    ctx: {
      patient: { name: "Test Patient", age: 52, personality: { anxious: 0.6 }, consciousness: "awake", painLevel: 3, emotionalState: "reassured" },
      situation: { scenarioTitle: "asthma attack", elapsedMin: 12 },
      crew: [{ name: "Medic Alex" }],
      recentEvents: ["Patient given albuterol"],
    },
  },
];

async function main() {
  const { browser, page } = await launch({ headless: true });
  page.setDefaultTimeout(180000);
  try {
    await page.goto(BASE_URL);

    console.log("Loading WasmLLMProvider module and checking isAvailable()...");
    const avail = await page.evaluate(async () => {
      const mod = await import("/src/dialogue/dialogueProvider.js");
      const p = new mod.WasmLLMProvider();
      return { isAvailable: p.isAvailable(), hasWasm: typeof WebAssembly !== "undefined" };
    });
    console.log("isAvailable():", JSON.stringify(avail));
    if (!avail.isAvailable) throw new Error("WasmLLMProvider.isAvailable() was false in a real Chromium with WebAssembly present");

    console.log("Loading model once (real network download, may take a couple minutes)...");
    const loadResult = await page.evaluate(async () => {
      const mod = await import("/src/dialogue/dialogueProvider.js");
      window.__wasmProvider = new mod.WasmLLMProvider();
      const t0 = performance.now();
      await window.__wasmProvider._ensurePipeline();
      return { loadMs: performance.now() - t0, status: window.__wasmProvider.status() };
    });
    console.log("Model load:", JSON.stringify(loadResult));

    const results = [];
    for (const sample of EVENTS) {
      console.log(`\nGenerating: ${sample.label} ...`);
      const result = await page.evaluate(async ({ event, ctx }) => {
        const t0 = performance.now();
        try {
          const line = await window.__wasmProvider.generate(event, ctx);
          return { ok: true, line, ms: performance.now() - t0 };
        } catch (e) {
          return { ok: false, error: String(e && e.message || e), ms: performance.now() - t0 };
        }
      }, { event: sample.event, ctx: sample.ctx });
      results.push({ label: sample.label, ...result });
      if (result.ok) {
        console.log(`  -> [${Math.round(result.ms)}ms] "${result.line.text}" (tier=${result.line.tier})`);
      } else {
        console.log(`  -> REJECTED/FAILED [${Math.round(result.ms)}ms]: ${result.error}`);
      }
    }

    console.log("\n=== SUMMARY (real, live-observed samples) ===");
    for (const r of results) {
      console.log(`${r.label}: ${r.ok ? `"${r.line.text}"` : `(fell through: ${r.error})`}`);
    }

    const anyOk = results.some((r) => r.ok);
    if (!anyOk) throw new Error("Every sample failed/was rejected — no real generated line was produced at all");

    console.log(`\nPASS: ${results.filter((r) => r.ok).length}/${results.length} samples produced real, non-degenerate WASM-tier generated dialogue.`);
  } catch (e) {
    console.error("VERIFICATION OUTCOME (may be an honest environment limitation, not necessarily a code bug):", e.message || e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();

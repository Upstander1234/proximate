// Builds the single-file offline package for the local AI model, which players
// can import from Settings > LOCAL AI DIALOGUE when Hugging Face downloads keep
// failing for them. Run: node scripts/build_local_ai_model_zip.mjs [outFile]
//
// The zip holds exactly what @mlc-ai/web-llm would have downloaded, stored
// UNCOMPRESSED (the weights don't compress) under three folders that mirror
// web-llm's three browser cache scopes:
//   config/  -> "webllm/config"  (mlc-chat-config.json)
//   wasm/    -> "webllm/wasm"    (the compiled model library)
//   model/   -> "webllm/model"   (tensor-cache.json, params shards, tokenizer.json)
// plus manifest.json. src/dialogue/modelImport.js reads this same layout.
import { prebuiltAppConfig } from "@mlc-ai/web-llm";
import { zipSync } from "fflate";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"; // keep in sync with dialogueProvider.js
const out = process.argv[2] || "model-zip/proximate-local-ai-model.zip";

const rec = prebuiltAppConfig.model_list.find((m) => m.model_id === MODEL_ID);
if (!rec) throw new Error(`model ${MODEL_ID} not in installed web-llm's prebuilt list`);
// Same normalization as web-llm's cleanModelUrl().
let base = rec.model.endsWith("/") ? rec.model : rec.model + "/";
if (!base.match(/.+\/resolve\/.+\//)) base += "resolve/main/";

async function get(url, tries = 12) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(180000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return new Uint8Array(await r.arrayBuffer());
    } catch (e) {
      console.log(`  retry ${i}/${tries} for ${url.split("/").pop()}: ${e.message}`);
      await new Promise((res) => setTimeout(res, Math.min(2000 * i, 15000)));
    }
  }
  throw new Error(`gave up on ${url}`);
}

const files = {};
const add = async (folder, name, url) => {
  process.stdout.write(`${folder}/${name} ... `);
  const data = await get(url);
  files[`${folder}/${name}`] = [data, { level: 0 }];
  console.log(`${(data.length / 1e6).toFixed(1)} MB`);
  return data;
};

await add("config", "mlc-chat-config.json", new URL("mlc-chat-config.json", base).href);
const wasmName = rec.model_lib.split("/").pop();
await add("wasm", wasmName, rec.model_lib);
const tc = await add("model", "tensor-cache.json", new URL("tensor-cache.json", base).href);
const shards = JSON.parse(new TextDecoder().decode(tc)).records.map((r) => r.dataPath);
for (const s of shards) await add("model", s, new URL(s, base).href);
await add("model", "tokenizer.json", new URL("tokenizer.json", base).href);

const manifest = { format: 1, modelId: MODEL_ID, builtAt: new Date().toISOString() };
files["manifest.json"] = [new TextEncoder().encode(JSON.stringify(manifest, null, 2)), { level: 0 }];

const zipped = zipSync(files);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, zipped);
console.log(`\nwrote ${out} (${(zipped.length / 1e6).toFixed(1)} MB, ${Object.keys(files).length} entries)`);

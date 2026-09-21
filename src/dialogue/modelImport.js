// src/dialogue/modelImport.js — offline import of the local AI model.
//
// Hugging Face's download endpoint randomly resets connections for some
// players, so the WebGPU tier can fail to download no matter how often it
// retries. This lets a player download ONE zip through their browser (which
// resumes properly), then import it here. We unpack it and write each file into
// the exact browser Cache API entries @mlc-ai/web-llm looks for, keyed by the
// exact URLs it would have fetched, so its normal load path finds everything
// cached and never touches the network for the model.
//
// The zip layout is produced by scripts/build_local_ai_model_zip.mjs:
//   config/<file>  -> cache "webllm/config"
//   wasm/<file>    -> cache "webllm/wasm"
//   model/<file>   -> cache "webllm/model"
//   manifest.json  -> { format, modelId }
import { unzipSync } from "fflate";

// Where the built zip is published for players to download. It is a plain link
// the player clicks (opened in a new tab), never fetched by the app, because
// GitHub release files can't be fetched cross-site.
export const MODEL_ZIP_URL =
  "https://github.com/Upstander1234/proximate/releases/download/local-ai-model-v1/proximate-local-ai-model.zip";

const SCOPES = { config: "webllm/config", wasm: "webllm/wasm", model: "webllm/model" };

function fail(msg) {
  const e = new Error(msg);
  e.userFacing = true;
  return e;
}

// file: a File from an <input type="file">. modelId: the web-llm model id this
// build uses. onProgress(text): called with short status strings.
export async function importModelZip(file, modelId, onProgress = () => {}) {
  if (typeof caches === "undefined") throw fail("This browser has no Cache API, so the model can't be stored.");

  const webllm = await import("@mlc-ai/web-llm");
  const rec = webllm.prebuiltAppConfig.model_list.find((m) => m.model_id === modelId);
  if (!rec) throw fail("This build doesn't know the model it should import.");
  let base = rec.model.endsWith("/") ? rec.model : rec.model + "/";
  if (!base.match(/.+\/resolve\/.+\//)) base += "resolve/main/";

  onProgress("Reading file…");
  let entries;
  try {
    entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    throw fail("That file isn't a valid zip. Use the model file from the download link.");
  }

  let manifest;
  try {
    manifest = JSON.parse(new TextDecoder().decode(entries["manifest.json"]));
  } catch {
    throw fail("That zip isn't a Proximate model file (no manifest).");
  }
  if (manifest.modelId !== modelId) {
    throw fail(`That model file is for a different model (${manifest.modelId}). Download the current one.`);
  }

  // Work out exactly which entries are required, and check each is present and
  // the right size, before writing anything, so a bad file never leaves a
  // half-imported cache behind.
  const wasmName = rec.model_lib.split("/").pop();
  const tcBytes = entries["model/tensor-cache.json"];
  if (!tcBytes) throw fail("The model file is incomplete (missing tensor-cache.json).");
  const shardRecords = JSON.parse(new TextDecoder().decode(tcBytes)).records;
  const plan = [
    { key: "config/mlc-chat-config.json", scope: SCOPES.config, url: new URL("mlc-chat-config.json", base).href, type: "application/json" },
    { key: `wasm/${wasmName}`, scope: SCOPES.wasm, url: rec.model_lib, type: "application/wasm" },
    { key: "model/tensor-cache.json", scope: SCOPES.model, url: new URL("tensor-cache.json", base).href, type: "application/json" },
    { key: "model/tokenizer.json", scope: SCOPES.model, url: new URL("tokenizer.json", base).href, type: "application/json" },
    ...shardRecords.map((r) => ({
      key: `model/${r.dataPath}`, scope: SCOPES.model, url: new URL(r.dataPath, base).href,
      type: "application/octet-stream", size: r.nbytes,
    })),
  ];
  for (const p of plan) {
    const data = entries[p.key];
    if (!data) throw fail(`The model file is incomplete (missing ${p.key}). Re-download it.`);
    if (p.size && data.length !== p.size) {
      throw fail(`${p.key} is the wrong size (the download may be cut off). Re-download the model file.`);
    }
  }

  let done = 0;
  for (const p of plan) {
    onProgress(`Installing ${++done}/${plan.length}…`);
    const cache = await caches.open(p.scope);
    await cache.put(new Request(p.url), new Response(entries[p.key], { headers: { "Content-Type": p.type } }));
  }
  onProgress("Done");
}

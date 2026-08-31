// src/dialogue/localLlmWorker.js — dedicated Worker entry point for the
// WebGPU local-LLM tier (LocalLLMProvider, dialogueProvider.js).
//
// Everything @mlc-ai/web-llm's CreateMLCEngine used to do on the main thread
// (WASM/shader compilation, model-shard fetch, Cache API reads/writes, the
// actual token-generation forward pass) now happens here instead, on a
// separate thread with its own event loop — this is the whole point: a slow
// or failing Cache.add() call, or a shader compile, can no longer share a
// thread with React's reconciler or an onClick/onChange handler, which is
// what was causing UI freezes (see CLAUDE.md's LocalLLMProvider-lifecycle
// investigation for the measured before/after).
//
// This is the exact, documented worker-side pattern from @mlc-ai/web-llm's
// own JSDoc example (node_modules/@mlc-ai/web-llm/lib/index.js, the
// WebWorkerMLCEngineHandler class comment) — WebWorkerMLCEngineHandler
// constructs its own internal MLCEngine and wires its own progress callback
// to postMessage; this file's only job is to route the worker's global
// onmessage to the handler's onmessage, nothing else.
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg) => {
  handler.onmessage(msg);
};

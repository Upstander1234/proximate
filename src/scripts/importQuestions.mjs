// Question-bank importer — validates and normalizes a batch of questions
// (any mix of the NREMT item types, per src/education/itemTypes.js)
// before any of them reach the real question bank, per queue item 22:
// "the importer should validate and normalize consistently... not
// require manual editing of every question after import."
//
// Usage:
//   node src/scripts/importQuestions.mjs <input.json> [--out=<file.js>] [--level=EMT]
//
// <input.json> is a plain JSON array of question objects (any mix of item
// types — no manual pre-sorting by type required, per the spec's own
// "100 MCQ, 40 multiple response, 20 build list, ..." example). A .mjs/.js
// input is also accepted, imported for its default export or a named
// `QUESTIONS`/`EXAMPLE_ITEM_TYPE_QUESTIONS` export (a real, importable
// module, not just a JSON blob).
//
// --level, if given, is used ONLY to validate domain values against
// DOMAINS_BY_LEVEL for any question that doesn't already declare its own
// `level` field (each question's own `level` always wins when present).
//
// --out, if given, writes every VALID question (normalized, invalid ones
// excluded — "an invalid TEI should never enter the approved question
// pool," the same rule crowdsource.js's reviewQuestion enforces) to a real
// ES module (`export const IMPORTED_QUESTIONS = [...]`) ready to import
// and splice into questions.js the same way questionsEMR.js/questionsEMT.js
// already are. Without --out, this only reports — a dry run.
//
// Exit code is non-zero if ANY question failed validation, so this is
// safe to wire into a CI/pre-merge check later without extra plumbing.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { LEVELS, DOMAINS_BY_LEVEL, QUESTIONS as EXISTING_QUESTIONS } from "../education/questions.js";
import { validateItemTypeShape, itemTypeOf, ITEM_TYPES } from "../education/itemTypes.js";
import { validateBlueprintQuestion } from "../education/contentBlueprint.js";

function parseArgs(argv) {
  const args = { input: null, out: null, level: null };
  for (const a of argv) {
    if (a.startsWith("--out=")) args.out = a.slice("--out=".length);
    else if (a.startsWith("--level=")) args.level = a.slice("--level=".length);
    else if (!a.startsWith("--")) args.input = a;
  }
  return args;
}

async function loadBatch(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === ".json") {
    const raw = await readFile(inputPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("input JSON must be a top-level array of question objects");
    return parsed;
  }
  if (ext === ".mjs" || ext === ".js") {
    const mod = await import(pathToFileURL(path.resolve(inputPath)).href);
    const candidate = mod.default || mod.QUESTIONS || mod.EXAMPLE_ITEM_TYPE_QUESTIONS || Object.values(mod).find(Array.isArray);
    if (!Array.isArray(candidate)) {
      throw new Error(`${inputPath} has no array export (looked for default, QUESTIONS, EXAMPLE_ITEM_TYPE_QUESTIONS, or any array export)`);
    }
    return candidate;
  }
  throw new Error(`unsupported input file extension: ${ext} (expected .json, .mjs, or .js)`);
}

// Trims every string-valued field a question is likely to author as free
// text, without touching structural fields (ids, indices, arrays of
// objects). Per-item-type nested strings (choices, steps, categories[].
// label, etc.) are trimmed too — an author pasting from a word processor
// is the realistic source of the stray-whitespace defect this exists to
// catch, and it would otherwise ship silently into a real question.
function normalizeQuestion(raw) {
  const q = { ...raw };
  if (typeof q.question === "string") q.question = q.question.trim();
  if (typeof q.explanation === "string") q.explanation = q.explanation.trim();
  if (!q.itemType) q.itemType = "multiple_choice";

  if (Array.isArray(q.choices)) q.choices = q.choices.map((c) => (typeof c === "string" ? c.trim() : c));
  if (Array.isArray(q.steps)) q.steps = q.steps.map((s) => (typeof s === "string" ? s.trim() : s));
  if (Array.isArray(q.categories)) {
    q.categories = q.categories.map((c) => (c && typeof c.label === "string" ? { ...c, label: c.label.trim() } : c));
  }
  if (Array.isArray(q.items)) {
    q.items = q.items.map((it) => (it && typeof it.label === "string" ? { ...it, label: it.label.trim() } : it));
  }
  if (Array.isArray(q.rows)) {
    q.rows = q.rows.map((r) => (r && typeof r.finding === "string" ? { ...r, finding: r.finding.trim() } : r));
  }
  if (Array.isArray(q.options)) q.options = q.options.map((o) => (typeof o === "string" ? o.trim() : o));

  return q;
}

// Base-schema checks that apply to every question regardless of item
// type — the fields questions.js's own template comment has always
// required (id/domain/level/question/explanation) — kept separate from
// itemTypes.js's own shape validation, which is deliberately scoped to
// just the answer-key structure.
function validateBaseSchema(q, defaultLevel) {
  const errors = [];
  if (!q.id || typeof q.id !== "string") errors.push("missing or non-string id");
  if (!q.question || typeof q.question !== "string") errors.push("missing or empty question text");
  if (!q.explanation || typeof q.explanation !== "string") errors.push("missing or empty explanation");

  const level = q.level || defaultLevel;
  if (!level) {
    errors.push("missing level, and no --level default was given");
  } else if (!LEVELS.includes(level)) {
    errors.push(`unknown level: ${JSON.stringify(level)} (expected one of ${LEVELS.join(", ")})`);
  } else {
    const validDomains = DOMAINS_BY_LEVEL[level] || [];
    if (!validDomains.includes(q.domain)) {
      errors.push(`domain ${JSON.stringify(q.domain)} is not valid for level "${level}" (expected one of ${validDomains.join(", ")})`);
    }
  }
  return errors;
}

async function main() {
  const { input, out, level: defaultLevel } = parseArgs(process.argv.slice(2));
  if (!input) {
    console.error("Usage: node src/scripts/importQuestions.mjs <input.json|input.mjs> [--out=<file.js>] [--level=EMT]");
    process.exit(1);
  }

  const batch = await loadBatch(input);
  console.log(`Loaded ${batch.length} question(s) from ${input}`);

  const existingIds = new Set(EXISTING_QUESTIONS.map((q) => q.id));
  const batchIds = new Set();
  const byType = Object.fromEntries(ITEM_TYPES.map((t) => [t, 0]));
  byType.unknown = 0;

  const valid = [];
  const invalid = []; // { index, id, errors }

  batch.forEach((raw, index) => {
    const q = normalizeQuestion(raw);
    const errors = [];

    errors.push(...validateBaseSchema(q, defaultLevel));

    // Duplicate-id detection — both within this batch and against the
    // ALREADY-SHIPPED bank. This is not a hypothetical: questionsEMT.js's
    // own real, previously-shipped id collisions (123 distinct ids each
    // reused 2-3 times across genuinely different questions) are exactly
    // this defect class, found and fixed by hand earlier in this
    // project's history. An importer is the right place to catch it
    // before it ever ships again, per the template's own "never reuse/
    // change [an id] once a card exists" rule.
    if (q.id) {
      if (existingIds.has(q.id)) errors.push(`id "${q.id}" already exists in the shipped question bank`);
      if (batchIds.has(q.id)) errors.push(`id "${q.id}" is duplicated within this import batch`);
      else batchIds.add(q.id);
    }

    // Only the blueprintCategory-specific half of validateBlueprintQuestion
    // is genuinely new information here — its own level/domain checks
    // would just re-report exactly what validateBaseSchema already found,
    // which showed up as a literal duplicate line during testing. Only
    // add its errors when the base schema's own domain check passed, so
    // an already-reported bad domain doesn't print twice.
    const domainAlreadyFlagged = errors.some((e) => e.startsWith("domain "));
    if (LEVELS.includes(q.level) && !domainAlreadyFlagged) {
      const bp = validateBlueprintQuestion(q);
      errors.push(...bp.errors);
    }

    const shape = validateItemTypeShape(q);
    errors.push(...shape.errors);

    const type = ITEM_TYPES.includes(itemTypeOf(q)) ? itemTypeOf(q) : "unknown";
    byType[type] = (byType[type] || 0) + 1;

    if (errors.length === 0) {
      valid.push(q);
    } else {
      invalid.push({ index, id: raw.id || `(index ${index})`, errors });
    }
  });

  console.log("\nBy item type:");
  for (const [type, count] of Object.entries(byType)) {
    if (count > 0) console.log(`  ${type}: ${count}`);
  }

  console.log(`\n${valid.length} valid, ${invalid.length} invalid`);
  if (invalid.length > 0) {
    console.log("\nInvalid questions:");
    for (const { index, id, errors } of invalid) {
      console.log(`  [${index}] ${id}`);
      for (const e of errors) console.log(`      - ${e}`);
    }
  }

  if (out) {
    const header =
      `// Auto-generated by src/scripts/importQuestions.mjs from ${JSON.stringify(input)}.\n` +
      `// ${valid.length} of ${batch.length} imported questions passed validation; invalid ones were\n` +
      `// excluded, never silently included — see this run's own console report for why each\n` +
      `// excluded question failed. Review before merging into a real question bank file.\n\n` +
      `export const IMPORTED_QUESTIONS = ${JSON.stringify(valid, null, 2)};\n`;
    await writeFile(out, header, "utf8");
    console.log(`\nWrote ${valid.length} validated question(s) to ${out}`);
  } else if (valid.length > 0) {
    console.log("\n(dry run — pass --out=<file.js> to write the validated questions to a real module)");
  }

  process.exit(invalid.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

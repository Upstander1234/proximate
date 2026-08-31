// ─── PROTOCOL AUTHORING TEMPLATE ───────────────────────────────────────────
// Copy this file to a new name in this same folder (e.g. `myAgency.js`) and
// fill in `rules`. Any file in src/protocols/ that default-exports a
// {id, name, rules} object is picked up automatically — dropping the file in
// is the whole installation step. Files starting with "_" (like this one)
// and engine.js/index.js are the only names that don't get auto-registered.
//
// ── THE SHAPE, EXACTLY ─────────────────────────────────────────────────────
//   export default {
//     id:   "unique_snake_case_id",   // used as the Settings selection key
//     name: "Human-Readable Name",    // shown in the Settings chip/dropdown
//     rules: [
//       { id:"short_id", when: someCondition, task:"cpr", note:"why this fires" },
//       ...
//     ]
//   };
//
// Rules are evaluated TOP TO BOTTOM every few seconds against the live call —
// list order is priority order, not just a bag of conditions. The engine
// (protocols/engine.js) hands each rule a `ctx` object and checks
// `when(ctx)`; every rule whose `when` is currently true, and whose `task`
// isn't already being carried out by someone, gets its task assigned to the
// next free, capable crew member.
//
// `ctx` has exactly two keys:
//   ctx.v   — live physiology for the current patient, e.g.:
//             ctx.v.hr, ctx.v.rr, ctx.v.spo2, ctx.v.sbp, ctx.v.dbp,
//             ctx.v.etco2, ctx.v.temp, ctx.v.glu (blood glucose, mg/dL),
//             ctx.v.rhythm, ctx.v._cons ("awake" or an altered state), ...
//             (anything physio(patient) publishes — see physiology.js)
//   ctx.s   — the FULL live patient/call object (same one crew-task
//             handlers mutate), so anything on it is fair game, e.g.:
//             ctx.s.vomited, ctx.s.rolled, ctx.s.vitals, ctx.s.monitorBy,
//             ctx.s.leadsOn, ctx.s.devices, ctx.s.given (drugs given so far),
//             ctx.s.doses, ctx.s.t (call clock, seconds), ctx.s.ivSites,
//             ctx.s.done (completed action/task ids, keyed by doneKey)
//
// `task` MUST be one of the ids TASKS declares in gear.js — a rule naming any
// other string will simply never match a hand and never fire:
//   cpr, bvm, mouthMask, suction, vitals, monitor, leads, prep, cspine,
//   fetch, iv, tq, airwayKit, report, crowd
//
// `note` is a short clause logged as "<crew member> directs <hand>: <task> —
// <note>." — write it as the reason a real medic would give the order.
//
// engine.js exports reusable predicates (pulseless, apnoeic, hypoxic,
// soiledAir, noVitals, notMonitored, noLeads) — import what you need rather
// than re-deriving them, and add a new one there (not in your agency file)
// if it's genuinely reusable across protocols.
//
// ── VERIFYING IT ACTUALLY CHANGED SOMETHING ────────────────────────────────
// A rule that never fires, or whose task never finds a capable free hand, is
// invisible — it will sit in the file looking correct forever. Before
// trusting a new protocol, run a call with it selected (Settings → CREW
// TREATMENT PROTOCOL) with a partner on scene capable of the task, put the
// patient into the state your `when` checks for, and confirm the log line
// "<name> directs <hand>: <task> — <note>" actually appears within a few
// seconds — not just that the file loads without error.
//
// ── READY-TO-PASTE AI PROMPT ────────────────────────────────────────────────
// If you have a real, written EMS protocol (an agency field guide, a state
// or regional treatment protocol PDF, a personal cheat sheet) and want it
// turned into a file in this exact format, paste the protocol text into an
// AI assistant together with the block below.
//
// """
// Convert the EMS protocol I'm about to paste into a JavaScript module in
// this EXACT shape:
//
//   export default {
//     id: "snake_case_id",
//     name: "Human-Readable Agency/Protocol Name",
//     rules: [
//       { id:"short_id", when: (ctx)=> <boolean expression>, task:"TASK_ID", note:"short reason" },
//       ...
//     ]
//   };
//
// Rules:
// - `when` is a JS arrow function of a single `ctx` argument. It may only
//   read ctx.v.<field> (live vitals: hr, rr, spo2, sbp, dbp, etco2, temp,
//   glucose, rhythm) and ctx.s.<field> (game/call state: vomited, rolled,
//   vitals, monitorBy, leadsOn, devices, given, doses, t). Do not invent
//   other ctx fields.
// - `task` must be exactly one of: cpr, bvm, mouthMask, suction, vitals,
//   monitor, leads, prep, cspine, fetch, iv, tq, airwayKit, report, crowd —
//   pick the closest match to what the protocol step actually calls for;
//   don't invent a new task id.
// - List rules in the protocol's own priority order — the engine walks them
//   top to bottom and the first matching, not-already-running task per
//   evaluation cycle wins for each free hand.
// - Keep `note` to a short clause (under ~10 words) a medic would actually
//   say out loud when giving the order.
// - Only emit the module — no explanation, no markdown fences, just the
//   JavaScript. If a protocol step doesn't map to any available task, leave
//   it out rather than forcing a bad fit.
//
// Here is the protocol text to convert:
// <PASTE YOUR AGENCY/REGIONAL PROTOCOL TEXT HERE>
// """
//
// Save the AI's output as a new file in src/protocols/ and it will appear in
// Settings the next time the app reloads.

import { pulseless, apnoeic } from "./engine.js";

export default {
  id:"_template_example", name:"Template Example (not a real protocol)",
  rules:[
    {id:"cpr",  when:pulseless, task:"cpr", note:"no pulse — compressions"},
    {id:"vent", when:apnoeic,   task:"bvm", note:"inadequate breathing — bag them"},
  ],
};

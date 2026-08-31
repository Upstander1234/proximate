// ─── Protocol engine — shared by every protocol file in this folder ───────
// A protocol is a named, ORDERED list of rules. Each rule fires when its
// `when(ctx)` predicate is true of the current patient/scene, and names a crew
// TASK (by id, from gear.js TASKS) that should be running. evaluateProtocol
// walks the rules top-to-bottom (so list order = priority) and returns the
// tasks that SHOULD be happening right now but aren't yet.
//
// The higher-level provider on scene is the one who "runs the protocol": the
// game loop (App.jsx) takes this module's output and directs free, capable
// crew members to carry those tasks out — a paramedic on scene will put the
// EMT on the BVM and the first responder on compressions, straight off
// whichever protocol is selected in Settings. Swap the selected protocol and
// the crew's priorities change with it.
//
// Rule shape:
//   { id, when(ctx), task, note }
//     ctx = { v (live physiology, from physio(patient)), s (game state) }
//     task = a TASKS id the crew can be ordered to do (see gear.js)
//     note = short line logged when the crew is directed onto it
//
// This file holds the mechanism (the context-predicate helpers every agency
// protocol reuses, plus evaluateProtocol itself) — never per-agency content.
// See _template.js for the annotated skeleton an agency file is built from.

export const pulseless    = (ctx)=> ctx.v.hr===0;
export const apnoeic      = (ctx)=> ctx.v.rr>0 && ctx.v.rr<8 || ctx.v.hr===0;
export const hypoxic      = (ctx)=> ctx.v.spo2>0 && ctx.v.spo2<90;
export const soiledAir    = (ctx)=> !!ctx.s.vomited && !ctx.s.rolled;
export const noVitals     = (ctx)=> !ctx.s.vitals || !ctx.s.vitals["HR"];
export const notMonitored = (ctx)=> !ctx.s.monitorBy;
export const noLeads      = (ctx)=> !ctx.s.leadsOn && !(ctx.s.devices&&ctx.s.devices.leads);
// SpO2 <94% is the abnormal-vital-sign threshold several county protocols
// use for "administer oxygen prn" / a mandatory ALS assessment (e.g. LA
// County Ref. 1200.4's own adult abnormal-vitals list) — a real, cited
// clinical cutoff, distinct from `hypoxic` (<90) which several other rules
// already use as a more severe threshold.
export const lowSpo2      = (ctx)=> ctx.v.spo2>0 && ctx.v.spo2<94;
// A cheap, reusable "is this patient altered" check for any rule gating on
// mental status (glucose checks to rule out hypoglycemia, stroke screens,
// etc.) rather than every protocol file re-deriving it from _cons.
export const altered      = (ctx)=> !!ctx.v._cons && ctx.v._cons!=="awake";

// Returns the ordered list of {task, note, ruleId} that the protocol says
// should be running right now. `running` is a Set (or array) of task ids
// already in progress, so we don't re-recommend them. A rule whose `when`
// throws is treated as not firing rather than crashing the whole evaluation —
// a bad hand-authored predicate should degrade to "no recommendation," not
// take down crew direction for every other rule in the file.
export function evaluateProtocol(protocol, ctx, running){
  const done = running instanceof Set ? running : new Set(running||[]);
  const out=[];
  (protocol?.rules||[]).forEach(r=>{
    let fire; try{ fire=!!r.when(ctx); }catch{ fire=false; }
    if(fire && !done.has(r.task)) out.push({task:r.task, note:r.note, ruleId:r.id});
  });
  return out;
}

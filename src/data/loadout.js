// Limited-items / supply-logistics system.
//
// Real EMS units do not carry infinite quantities of anything — a drug box
// has a handful of vials of each drug, a trauma bag has a handful of
// dressings and tourniquets, not an unlimited number. Before this module,
// once a bag/pocket was carried into a call (gear.js's BAGS/POCKETS — a
// binary "is this category on the rig" choice) everything it unlocked was
// usable an unbounded number of times, bounded only by each drug's own
// `max` (a PER-CALL safety-dose cap, not a supply constraint).
//
// This module tracks actual carried QUANTITY per consumable item, split
// into two pools the player configures on the loadout page:
//   - "carried" — what's loaded into the hand-carried bags/pockets this
//     shift. This becomes g.supplyStock, decremented as items are used.
//   - "truck" — backup reserve left on the rig, not hand-carried. Pulled
//     into supplyStock mid-call via the existing "Fetch a bag from the
//     truck" crew task (gear.js TASKS, id:"fetch") once the crew has
//     nothing left to fetch bag-wise.
//
// Reusable EQUIPMENT (stethoscope, penlight, shears, the monitor unit
// itself, a BVM mask, a laryngoscope, a glucometer device) is NOT tracked
// here — carrying it is already a binary choice via gear.js's BAGS/POCKETS,
// and it does not run out. Only genuinely disposable supplies — drug
// vials/doses and single-use procedural consumables — get a quantity.

import { DRUGS } from "./drugs.js";
import { PROCS } from "./procedures.js";

// Every drug is a stock item — one unit is one dose/vial/auto-injector.
// Default carried quantity mirrors the drug's own per-call `max` (already
// the documented "how many times would you realistically push this in one
// call" safety cap — see drugs.js), which doubles as a reasonable proxy for
// how many are actually stocked. A handful of high-volume items real ALS
// trucks carry MORE of than a single call's max (crystalloid, nitrous) are
// hand-adjusted upward; blood products are carried in genuinely small
// numbers on the units that carry them at all, so they stay at their max.
const FLUID_OVERRIDE = { saline: 6, plasmalyte: 6, nitrous: 4 };
const DRUG_STOCK = Object.fromEntries(Object.entries(DRUGS).map(([id, d]) => {
  const carried = FLUID_OVERRIDE[id] ?? Math.max(1, d.max || 1);
  return [id, { cat: "drug", label: d.name, lvl: d.lvl, carried, truck: Math.max(1, Math.ceil(carried * 0.5)) }];
}));

function catOf(def) { return def.bag || (def.pocket ? "pockets" : "truck"); }

// Curated subset of PROCS that are genuinely single-use disposable supplies
// rather than reusable equipment. Quantities are the realistic count a rig
// stocks (multiple sizes/backups for airway adjuncts and IV catheters,
// since real kits carry several sizes; a single traction splint/pelvic
// binder/cricothyrotomy kit, since those are large, rarely-needed, one-
// per-patient items).
const PROC_STOCK_QTY = {
  tq: 3, pack: 4, chestSeal: 2, cCollar: 2, splint: 2, traction: 1, pelvicBinder: 1,
  needleD: 2, opa: 3, npa: 3, sga: 2, ett: 2, cric: 1, iv: 4, io: 3, pads: 2,
  chestTube: 1, reboa: 1, artLine: 1, warm: 2,
};
const PROC_STOCK = Object.fromEntries(Object.entries(PROC_STOCK_QTY).map(([id, qty]) => [id, {
  cat: catOf(PROCS[id]), label: PROCS[id].name, lvl: PROCS[id].lvl, carried: qty, truck: Math.max(1, Math.ceil(qty * 0.5)),
}]));

// Non-drug, non-PROCS consumables (a glucometer is reusable equipment; the
// test strips it uses are not). lvl:2 matches gear.js's own POCKETS.glucometer.min.
const MISC_STOCK = {
  glucoseStrips: { cat: "pockets", label: "Glucose test strips", lvl: 2, carried: 10, truck: 10 },
};

export const STOCK_ITEMS = { ...DRUG_STOCK, ...PROC_STOCK, ...MISC_STOCK };
export const CONSUMES_STOCK = new Set(Object.keys(STOCK_ITEMS));
export const STOCK_CATEGORIES = ["monitor", "drug", "airway", "trauma", "pockets", "truck"];
// "truck" here is a CARRIED-pool category (items with no bag/pocket gate —
// currently just active warming — always available regardless of which
// bags you picked). Do not confuse with the separate truck-RESERVE pool
// below (truckBudget/g.truckReserve) — different concept, same rig.
export const CATEGORY_LABEL = { monitor: "Monitor bag", drug: "Drug box", airway: "Airway bag",
  trauma: "Trauma bag", pockets: "Pockets / on-body", truck: "General (no bag needed)" };

// Scope gate (F32) — a rig doesn't get to pack a drug/procedure above its
// own crew's certification. `L` is the player's own numeric provider level
// (LEVELS[...].n, 0-5 — see src/scope.js/App.jsx's own `L`). L==null means
// "no gate" (used by the few pure budget-accounting call sites below, which
// need the UNGATED physical bag/truck capacity regardless of who's packing
// it — a bag is the same size no matter who carries it).
export function isLocked(id, L) {
  if (L == null || L >= 5) return false; // unlimited scope, or no gate requested
  const def = STOCK_ITEMS[id]; if (!def) return true;
  return (def.lvl || 0) > L;
}

// Hard per-item cap on the loadout page — cannot select more than this even
// with slack in the category budget (keeps the picker bounded; nobody
// carries fifty tourniquets). Zero for anything above the given scope.
export function maxCapacity(id, L) {
  const def = STOCK_ITEMS[id]; if (!def) return 0;
  if (isLocked(id, L)) return 0;
  return def.carried * 3 + 2;
}

// The default selection every new shift (Career) or new game (Sandbox with
// Limited Items on) starts with — what CLAUDE.md calls "a realistic amount
// ... and they can't carry everything." Two pools: carried (in the bags,
// becomes g.supplyStock) and truck (unbagged reserve, becomes
// g.truckReserve, reachable mid-call only via the "fetch" crew task).
// Scope-locked items (F32) default to 0 in both pools — a Layperson rig
// isn't pre-loaded with paramedic-only drugs just because the data table
// has a default quantity for them.
export function defaultLoadout(L) {
  const carried = {}, truck = {};
  Object.entries(STOCK_ITEMS).forEach(([id, def]) => {
    const locked = isLocked(id, L);
    carried[id] = locked ? 0 : def.carried; truck[id] = locked ? 0 : def.truck;
  });
  return { carried, truck };
}

// Per-category "carried" budget (bag/pocket capacity) and one flat "truck"
// budget (the rig's general unbagged storage is a bigger, less-partitioned
// space than any one hand-carried bag). Both are the sum of that category's
// defaults plus 15% slack — enough that the default loadout always fits
// exactly, but maxing out every item at once does not.
function sumBy(pool, filterCat) {
  return Object.entries(STOCK_ITEMS).filter(([, d]) => !filterCat || d.cat === filterCat)
    .reduce((s, [id]) => s + (pool[id] || 0), 0);
}
export function categoryBudget(cat) {
  const def = defaultLoadout();
  return Math.ceil(sumBy(def.carried, cat) * 1.15);
}
export function truckBudget() {
  const def = defaultLoadout();
  return Math.ceil(sumBy(def.truck, null) * 1.15);
}
export function carriedUsed(carried, cat) { return sumBy(carried, cat); }
export function truckUsed(truck) { return sumBy(truck, null); }

// ─── Scope engine — shared by every scope-of-practice file in this folder ──
// A "scope" is a named, INDEPENDENT table of which certification LEVEL (0-5,
// see scope.js's LEVELS) a given drug or procedure requires in THIS scope's
// real-world jurisdiction. Each scope file declares its OWN complete `levels`
// map — it does not diff against, inherit from, or otherwise depend on
// national2019.js or any other scope file. national2019.js is not special
// code-wise; it is simply the one scope file whose table happens to match the
// US National EMS Scope of Practice Model 2019 (and it declares that table in
// full, the same as every other scope does — see its own file).
//
// Scope shape:
//   { id, name, levels: { itemId: lvl, ... } }
//     itemId = any key in DRUGS or PROCS (src/data/drugs.js / procedures.js)
//     lvl    = the certification level (0-5) THIS scope requires for it.
//              A complete, independently-authored scope lists EVERY item.
//
// effectiveLvl is the one function everything reads through — App.jsx builds
// every drug/procedure action's `lvl` field by calling this instead of
// reading `.lvl` off the registry entry directly, so a selected scope
// actually changes what's locked, what shows as out-of-scope, and every
// scope-gated screen (FAQ, the scope editor, the Rural-BLS preset) at once.
//
// The `baseLvl` fallback below is a CRASH SAFETY NET only, not a design
// feature to author against — a scope file is expected to name every item,
// per _template.js's own instructions. If a scope's table is missing an id
// (an authoring gap, not a deliberate "same as national" statement), falling
// back to that item's raw drugs.js/procedures.js `.lvl` keeps the game from
// breaking instead of throwing, but it means that one item is silently NOT
// independent of the national baseline until the gap is fixed.
export function effectiveLvl(id, baseLvl, scope){
  const v=scope?.levels?.[id];
  return v==null?baseLvl:v;
}

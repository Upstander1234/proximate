// Small, plain-function visual-style helpers shared across components -- not a
// UI library or component framework, matching this project's existing
// convention (no CSS-in-JS, no icon library, inline style objects reading
// from src/theme.js). Use these when creating new UI, touching an existing
// component for another reason, or fixing a known inconsistency -- this is a
// tool for reducing future copy-paste drift, not a mandate to migrate the
// existing App.jsx panel/button styles that already work.
//
// `Btn` in App.jsx was audited before writing this file: it is not a pure
// visual primitive -- it's tightly coupled to gameplay-gating closures
// (`why()`, `busyBlocks()`, `g.done`), so extracting it into a shared,
// context-free component would mean restructuring how every call site
// supplies that gating context, which is the large-scale refactor this pass
// is scoped to avoid. It stays where it is.

import { C, RADIUS } from "../theme.js";

// The standard panel/card chrome already used throughout App.jsx
// (background:C.panel, 1px border:C.line, small radius) -- most panels are
// this exact shape; `variant` picks a slightly different surface for
// elevated/inset content without inventing a new visual language.
export function panelStyle(variant = "panel") {
  const bg = variant === "elevated" ? C.panelHi : variant === "inset" ? C.bg : C.panel;
  return {
    background: bg,
    border: `1px solid ${C.line}`,
    borderRadius: RADIUS.md,
  };
}

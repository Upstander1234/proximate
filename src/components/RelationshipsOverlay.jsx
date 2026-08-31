// F23 follow-up — a real "Relationships" status screen. Previously the
// only visible surface for g.relationships was the off-duty "Call {name}"
// button (App.jsx) — real, but minimal, and only reachable off-shift.
// Mounted globally in Shell (matching AchievementsOverlay/SettingsOverlay's
// own pattern) but self-gates to zth saves with at least one met
// relationship, since relationships.js's whole system is campaign-scoped
// (see relationships.js's own header comment) — a non-campaign save has
// g.relationships:{} forever, so the trigger button simply never renders.
// Never shows romance (relationships.js's own rule: "a hidden sub-stat...
// nothing in the UI ever renders it, only friendship's tier label").
import { C, MONO } from "../theme.js";
import { friendshipTier } from "../relationships.js";
import { firstName } from "../names.js";
import { portraitFor, onImgError } from "../assets.js";

export default function RelationshipsOverlay({ g, setG }) {
  if (!g || !setG) return null;
  if (g.learningMode !== "zth") return null;
  const rels = Object.entries(g.relationships || {}).filter(([, r]) => r?.met);
  if (rels.length === 0) return null;
  return (<>
    <button onClick={() => setG(s => ({ ...s, relationshipsOpen: 1 }))} title="Relationships"
      style={{ position: "fixed", top: 12, right: 108, zIndex: 60, background: "rgba(10,14,12,.85)",
        border: `1px solid ${C.line}`, borderRadius: 8, color: C.amber, fontFamily: MONO, fontSize: 12,
        padding: "7px 11px", cursor: "pointer", backdropFilter: "blur(4px)" }}>💞</button>

    {/* !! guards against the React "stray 0" render — see SettingsOverlay.jsx's
        matching comment; same numeric-flag defect, part of the F4 fix. */}
    {!!g.relationshipsOpen && <div onClick={() => setG(s => ({ ...s, relationshipsOpen: 0 }))}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 61, display: "flex",
        alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} className="p-5 rounded"
        style={{ background: C.panel, border: `1px solid ${C.line}`, maxWidth: 480, width: "92%", maxHeight: "86vh", overflowY: "auto" }}>
        <div className="flex justify-between items-baseline" style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Relationships</div>
          <button onClick={() => setG(s => ({ ...s, relationshipsOpen: 0 }))} style={{ background: "transparent",
            border: `1px solid ${C.line}`, borderRadius: 5, color: C.dim, fontFamily: MONO, fontSize: 11, padding: "4px 9px", cursor: "pointer" }}>close</button></div>
        <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 14, lineHeight: 1.6 }}>
          People you've met this campaign, and how they'd say things are going.
        </div>
        <div className="flex flex-col gap-2">
          {rels.map(([id, r]) => {
            const src = portraitFor({ role: r.role, gender: r.gender, name: r.name });
            const tier = friendshipTier(r.friendship);
            return (<div key={id} className="flex items-center gap-3 p-3 rounded" style={{ background: C.panelHi, border: `1px solid ${C.line}` }}>
              <img src={src} onError={onImgError} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: `1px solid ${C.line}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{firstName(r.name) || r.name}</div>
                <div style={{ fontSize: 11.5, color: C.dim, marginTop: 2 }}>{r.role || "—"}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: r.friendship < 0 ? C.red : r.friendship >= 60 ? C.hr : C.amber }}>{tier}</div>
            </div>);
          })}
        </div>
      </div>
    </div>}
  </>);
}

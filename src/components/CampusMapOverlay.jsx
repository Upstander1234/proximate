// A real, viewable Northwood University campus map (Zero-To-Hero prologue)
// — the "crooked campus map" the PATROL station's own background art
// already shows on the wall (src/assets/backgrounds/README.md). Controlled
// (open/onClose props), not self-managing like AchievementsOverlay/
// SettingsOverlay, since it's only relevant from station-adjacent screens,
// not floating globally over every phase in the game.
//
// Pin positions are hand-placed percentages, not a real coordinate system —
// same convention the Sandbox dispatch map (App.jsx's "cat" phase Map view)
// already uses for its body-system pins.
import { C, MONO } from "../theme.js";
import { BACKGROUNDS, onImgError } from "../assets.js";

const LOCATIONS = [
  { id: "dorm", label: "Dorms", x: 12, y: 20, note: "Move-in day, §2.2." },
  { id: "quad", label: "Main Quad", x: 46, y: 42, note: "Scene 4 — the heat-stroke incident." },
  { id: "science", label: "Science Building", x: 62, y: 24, note: "Where you were headed when it happened." },
  { id: "library", label: "Library", x: 78, y: 55, note: "The second-chance recruitment scene, §2.5.1." },
  { id: "dining", label: "Dining Hall", x: 30, y: 62, note: "Scene 2.7.1's pre-call bench scene." },
  { id: "studentcenter", label: "Student Center — PATROL Station (basement)", x: 55, y: 78, note: "Scene 5. You're here now." },
  { id: "morrison", label: "Morrison Hall", x: 20, y: 82, note: "Scene 2.7.3 — the overdose call." },
];

export default function CampusMapOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 70,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="rounded"
        style={{ background: C.panel, border: `1px solid ${C.line}`, maxWidth: 720, width: "100%", padding: 16 }}>
        <div className="flex justify-between items-baseline" style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: C.amber }}>NORTHWOOD UNIVERSITY — CAMPUS MAP</div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.line}`, borderRadius: 5,
            color: C.dim, fontFamily: MONO, fontSize: 11, padding: "4px 9px", cursor: "pointer" }}>close</button>
        </div>
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.line}` }}>
          <img src={BACKGROUNDS.campusMap} onError={onImgError} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {LOCATIONS.map(l => (
            <div key={l.id} title={l.note} style={{ position: "absolute", left: `${l.x}%`, top: `${l.y}%`,
              transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.red, border: "2px solid #fff",
                boxShadow: "0 0 6px rgba(0,0,0,.6)" }} />
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#fff", background: "rgba(0,0,0,.65)",
                padding: "2px 5px", borderRadius: 4, marginTop: 3, whiteSpace: "nowrap" }}>{l.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.6 }}>
          Hand-placed reference locations, not a real coordinate system — same convention as the Sandbox dispatch map.
        </div>
      </div>
    </div>
  );
}

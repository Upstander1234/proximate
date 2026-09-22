import { useState } from "react";
import { C } from "../theme.js";

// "Hand off to a provider" control shared by the continuous CPR and BVM
// minigames. `crew` is [{id, name}]; onHandoff(crewId) ends the player's session
// and orders that crew member to take over.
export default function HandoffRow({ crew, verb, onHandoff }) {
  const [cid, setCid] = useState("");
  if (!crew || crew.length === 0) {
    return <div style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>No one else on scene to hand off to.</div>;
  }
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
      <select value={cid} onChange={(e) => setCid(e.target.value)}
        style={{ flex: 1, background: "#10151A", border: `1px solid ${C.line}`, color: C.text, borderRadius: 6, padding: "7px 8px", fontSize: 12 }}>
        <option value="">Hand off {verb} to...</option>
        {crew.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button disabled={!cid} onClick={() => onHandoff(cid)}
        style={{ background: "#122A18", border: `1px solid ${C.hr}`, color: C.hr, borderRadius: 6, padding: "7px 12px", fontSize: 12,
          cursor: cid ? "pointer" : "not-allowed", opacity: cid ? 1 : 0.5 }}>Swap in</button>
    </div>
  );
}

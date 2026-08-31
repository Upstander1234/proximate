import { C, MONO } from "../theme.js";
import { ACHIEVEMENTS } from "../achievements.js";
import { ACHIEVEMENT_ART, ICON_ART, onImgError } from "../assets.js";

// F15 — a self-contained achievements screen, mounted from Shell exactly like
// SettingsOverlay so it's reachable from every phase (title through debrief),
// in both Sandbox and Career alike — no learning-mode gate. Reads g.achievements
// (unlocked ids) and g.lifetimeStats (for progress text on locked ones);
// writes nothing itself.
export default function AchievementsOverlay({g,setG}){
  if(!g||!setG) return null;
  const unlocked=new Set(g.achievements||[]);
  const stats=g.lifetimeStats||{};
  return (<>
    <button onClick={()=>setG(s=>({...s,achievementsOpen:1}))} title="Achievements"
      style={{position:"fixed",top:12,right:64,zIndex:60,background:"rgba(10,14,12,.85)",
        border:`1px solid ${C.line}`,borderRadius:8,color:C.amber,fontFamily:MONO,fontSize:12,
        padding:"7px 11px",cursor:"pointer",backdropFilter:"blur(4px)"}}>🏆</button>

    {/* !! guards against the React "stray 0" render — see SettingsOverlay.jsx's
        matching comment. achievementsOpen is numeric and this component is
        mounted on every screen, so this was a real, systemic source of the
        F4 "stray 00" report. */}
    {!!g.achievementsOpen&&<div onClick={()=>setG(s=>({...s,achievementsOpen:0}))}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:61,display:"flex",
        alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="p-5 rounded"
        style={{background:C.panel,border:`1px solid ${C.line}`,maxWidth:560,width:"92%",maxHeight:"86vh",overflowY:"auto"}}>
        <div className="flex justify-between items-baseline" style={{marginBottom:6}}>
          <div style={{fontSize:16,fontWeight:600}}>Achievements</div>
          <button onClick={()=>setG(s=>({...s,achievementsOpen:0}))} style={{background:"transparent",
            border:`1px solid ${C.line}`,borderRadius:5,color:C.dim,fontFamily:MONO,fontSize:11,padding:"4px 9px",cursor:"pointer"}}>close</button></div>
        <div style={{fontSize:11.5,color:C.faint,marginBottom:14,lineHeight:1.6,display:"flex",alignItems:"center",gap:6}}>
          <img src={ICON_ART.badge} onError={onImgError} alt="" width={13} height={13} style={{opacity:.8}}/>
          {unlocked.size}/{ACHIEVEMENTS.filter(a=>!a.locked).length} unlocked this save — Sandbox and Career calls both count.
        </div>
        <div className="flex flex-col gap-2">
          {/* Unearned achievements are hidden — name/description only reveal
              once g.achievements actually contains the id. Keeps the list
              from just being a walkthrough of every unlock condition in the
              game; a.locked (system-not-wired-yet entries like
              became_captain) is a separate, pre-existing concept and still
              renders through the same "hidden until earned" treatment. */}
          {ACHIEVEMENTS.map(a=>{const on=unlocked.has(a.id);
            return (<div key={a.id} className="flex items-center gap-3 p-3 rounded"
              style={{background:on?"#16241C":C.panelHi,border:`1px solid ${on?C.hr:C.line}`,opacity:a.locked?0.55:1}}>
              {on?<img src={ACHIEVEMENT_ART[a.id]} onError={onImgError} alt="" width={36} height={36}
                style={{borderRadius:6,objectFit:"cover",border:`1px solid ${C.line}`}}/>
              :<div style={{width:36,height:36,borderRadius:6,border:`1px solid ${C.line}`,background:"#0B0F12",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <img src={ICON_ART.locked} onError={onImgError} alt="" width={15} height={15} style={{opacity:.55}}/></div>}
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,fontWeight:600,color:on?C.hr:C.faint}}>{on?a.name:"???"}</div>
                <div style={{fontSize:11,color:C.dim,marginTop:2,lineHeight:1.5}}>
                  {on?a.desc:"Hidden — unlock this one in a call to reveal what it was for."}</div>
              </div>
              <div style={{fontFamily:MONO,fontSize:9.5,color:on?C.hr:C.faint,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                {a.locked?<><img src={ICON_ART.locked} onError={onImgError} alt="" width={9} height={9} style={{opacity:.7}}/>LOCKED</>
                  :on?<><img src={ICON_ART.checkmark} onError={onImgError} alt="" width={9} height={9} style={{opacity:.85}}/>UNLOCKED</>
                  :"—"}</div>
            </div>);})}
        </div>
        <div style={{fontFamily:MONO,fontSize:9,color:C.faint,marginTop:14,lineHeight:1.6}}>
          Lifetime (this save): {stats.callsRun||0} calls run · {stats.callsSurvived||0} survived ·
          {" "}best streak {stats.bestSurvivalStreak||0}.
        </div>
      </div></div>}
  </>);
}

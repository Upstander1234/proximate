import { useState } from "react";
import { C, MONO } from "../theme.js";
import { LEVELS, LNAME } from "../scope.js";
import { DRUGS } from "../data/drugs.js";
import { PROCS } from "../data/procedures.js";
import { DRUG_CATEGORIES, PROC_CATEGORIES } from "../data/categories.js";
import { SCOPES, SCOPE_ORDER, getScope, effectiveLvl } from "../scopes/index.js";
import { listCustomScopes, getCustomScope, saveCustomScope, deleteCustomScope, newCustomScopeId } from "../customScopes.js";

const ALL_IDS=[...Object.keys(DRUGS),...Object.keys(PROCS)];
const GROUPS={...PROC_CATEGORIES,
  ...Object.fromEntries(Object.entries(DRUG_CATEGORIES).map(([cat,ids])=>[`Medications — ${cat}`,ids]))};
const QUICK_PRESETS={
  "Rural BLS only":(activeScope)=>Object.fromEntries(ALL_IDS.filter(k=>effectiveLvl(k,(DRUGS[k]||PROCS[k]).lvl,activeScope)>2).map(k=>[k,1])),
  "No RSI / no blood":()=>({ett:1,cric:1,rocuronium:1,etomidate:1,blood:1,plasma:1}),
  "Unrestricted":()=>({}),
};

// The manual per-item scope grid — moved here from the one-time setup wizard
// (App.jsx's old "scope" phase) so it's reachable from Settings any time
// BEFORE a save locks it in (see the `locked` prop). Presets are every
// developer-shipped scope file (src/scopes/*.js, auto-discovered) plus every
// scope the player has saved themselves (src/customScopes.js, localStorage —
// permanent across saves and sessions, distinct from any one character).
export default function ScopeEditor({g,setG,locked}){
  const [customName,setCustomName]=useState("");
  const [confirmSave,setConfirmSave]=useState(false);
  const [confirmDeleteId,setConfirmDeleteId]=useState(null);
  const [gridOpen,setGridOpen]=useState(false);

  const L=g.level?LEVELS[g.level].n:0;
  const scopeOff=g.scopeOff||{}, scopeOverride=g.scopeOverride||{};
  const activeScope=getScope(g.scopeProfile||"national2019");
  const customList=listCustomScopes();
  const offCount=Object.values(scopeOff).filter(Boolean).length;
  const overCount=Object.values(scopeOverride).filter(Boolean).length;

  const selectProfile=(id)=>{
    if(locked) return;
    const custom=getCustomScope(id);
    setG(s=>({...s,scopeProfile:id,
      scopeOff:custom?Object.fromEntries((custom.off||[]).map(x=>[x,1])):{},
      scopeOverride:{}}));
  };

  const doDeleteCustom=(id)=>{
    deleteCustomScope(id);
    setG(s=>s.scopeProfile===id?{...s,scopeProfile:"national2019",scopeOff:{},scopeOverride:{}}:s);
    setConfirmDeleteId(null);
  };

  const doSaveCustom=()=>{
    const levels={};
    ALL_IDS.forEach(id=>{
      const src=DRUGS[id]||PROCS[id];
      const base=effectiveLvl(id,src.lvl,activeScope);
      // A player override is baked in as level 0 — "available regardless of
      // certification," the most portable meaning of "I overrode this,"
      // rather than the player's CURRENT level (which wouldn't make sense to
      // reuse in a future save at a different level).
      levels[id]=scopeOverride[id]?0:base;
    });
    const off=ALL_IDS.filter(id=>scopeOff[id]);
    const id=newCustomScopeId(customName);
    const scope={id,name:customName.trim()||"My Scope",levels,off};
    saveCustomScope(scope);
    setG(s=>({...s,scopeProfile:scope.id,scopeOverride:{},
      scopeOff:Object.fromEntries(off.map(x=>[x,1]))}));
    setCustomName(""); setConfirmSave(false);
  };

  if(locked){
    const name=activeScope.name;
    return (<div>
      <div style={{fontSize:14,fontWeight:600,color:C.text}}>{name}</div>
      <div style={{fontSize:12,color:C.dim,marginTop:6,lineHeight:1.6}}>
        {offCount>0&&`${offCount} item${offCount>1?"s":""} disabled. `}
        {overCount>0&&`${overCount} item${overCount>1?"s":""} overridden above your level. `}
        {offCount===0&&overCount===0&&"No changes from this scope's own defaults."}
      </div>
      <div style={{fontSize:11,color:C.faint,marginTop:8,lineHeight:1.6}}>
        This save's scope is locked — it was fixed at the moment the character was created and can't
        be changed mid-career.
      </div>
    </div>);
  }

  return (<div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
      {SCOPE_ORDER.map(sid=>{const sel=(g.scopeProfile||"national2019")===sid,
        n=Object.keys(SCOPES[sid].levels||{}).length,empty=sid!=="national2019"&&n===0;
        return (<button key={sid} onClick={()=>selectProfile(sid)} style={{background:sel?"#16241C":"transparent",
          border:`1px solid ${sel?C.hr:C.line}`,color:sel?C.hr:C.dim,fontSize:11.5,padding:"6px 10px",borderRadius:6,cursor:"pointer"}}>
          {sid==="national2019"?"◆ ":""}{SCOPES[sid].name}{empty?" (empty)":""}</button>);})}
      {customList.map(cs=>{const sel=(g.scopeProfile||"national2019")===cs.id;
        return (<span key={cs.id} style={{display:"inline-flex",alignItems:"stretch",gap:2}}>
          <button onClick={()=>selectProfile(cs.id)} style={{background:sel?"#211A2E":"transparent",
            border:`1px solid ${sel?C.violet:C.line}`,borderRight:confirmDeleteId===cs.id?`1px solid ${sel?C.violet:C.line}`:"none",
            color:sel?C.violet:C.dim,fontSize:11.5,padding:"6px 10px",
            borderRadius:confirmDeleteId===cs.id?"6px 0 0 6px":6,cursor:"pointer"}}>★ {cs.name}</button>
          {confirmDeleteId===cs.id
            ?<>
              <button onClick={()=>doDeleteCustom(cs.id)} style={{background:"#2A1418",border:`1px solid ${C.red}`,
                borderLeft:"none",color:C.red,fontSize:10.5,padding:"6px 8px",cursor:"pointer"}}>Delete?</button>
              <button onClick={()=>setConfirmDeleteId(null)} style={{background:"transparent",border:`1px solid ${C.line}`,
                borderLeft:"none",borderRadius:"0 6px 6px 0",color:C.faint,fontSize:10.5,padding:"6px 8px",cursor:"pointer"}}>✕</button>
            </>
            :<button onClick={()=>setConfirmDeleteId(cs.id)} title="Delete this custom scope"
              style={{background:"transparent",border:`1px solid ${C.line}`,borderLeft:"none",borderRadius:"0 6px 6px 0",
                color:C.faint,fontSize:10.5,padding:"6px 8px",cursor:"pointer"}}>🗑</button>}
        </span>);})}
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
      {Object.entries(QUICK_PRESETS).map(([n,fn])=>(<button key={n} onClick={()=>setG(s=>({...s,scopeOff:fn(activeScope)}))}
        className="px-3 py-1.5 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontFamily:MONO,fontSize:10,cursor:"pointer"}}>{n}</button>))}
      <button onClick={()=>setG(s=>({...s,scopeOff:{},scopeOverride:{}}))}
        className="px-3 py-1.5 rounded" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.dim,fontFamily:MONO,fontSize:10,cursor:"pointer"}}>
        Clear all changes</button>
    </div>

    <button onClick={()=>setGridOpen(o=>!o)} style={{background:"transparent",border:`1px solid ${C.line}`,color:C.spo2,
      fontSize:12,padding:"6px 11px",borderRadius:6,cursor:"pointer",marginBottom:10}}>
      {gridOpen?"▲ Hide":"▼ Show"} every drug &amp; procedure {offCount||overCount?`(${offCount+overCount} changed)`:""}</button>

    {gridOpen&&<>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:8}}>
        {[["available",C.hr,"☑"],["you disabled",C.red,"☐"],["above your level",C.faint,"—"],["overridden — out of scope",C.violet,"⚠"]].map(([lab,col,sym])=>(
          <span key={lab} style={{fontFamily:MONO,fontSize:9.5,color:C.dim,display:"inline-flex",alignItems:"center",gap:5}}>
            <span style={{color:col}}>{sym}</span>{lab}</span>))}
      </div>
      <div style={{fontSize:11,color:C.dim,marginBottom:10,lineHeight:1.5}}>
        Items above your level show an OVERRIDE button — add them to your kit anyway. Every overridden
        item you actually use in a call is logged as out-of-scope practice and costs points on the
        debrief's scope-compliance axis.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:360,overflowY:"auto"}}>
        {Object.entries(GROUPS).map(([grp,ids])=>(
          <div key={grp} className="p-2.5 rounded" style={{background:C.panel,border:`1px solid ${C.line}`}}>
            <div style={{fontFamily:MONO,fontSize:9.5,letterSpacing:".12em",color:C.amber,marginBottom:6}}>{grp.toUpperCase()}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {ids.map(id=>{const src=DRUGS[id]||PROCS[id]; if(!src) return null;
                const eLvl=effectiveLvl(id,src.lvl,activeScope);
                const override=scopeOverride[id], lock=eLvl>L&&L<5&&!override, off=scopeOff[id];
                const col=lock?C.faint:override?C.violet:off?C.red:C.hr;
                return (<div key={id} className="flex items-stretch gap-1">
                  <button disabled={lock} onClick={()=>{if(lock)return; setG(s=>({...s,scopeOff:{...s.scopeOff,[id]:off?0:1}}))}}
                    className="text-left rounded flex-1" style={{background:lock?"transparent":off?"#1F1315":override?"#211A2E":"#101C18",
                      border:`1px solid ${lock?C.line:off?"#4A2226":override?C.violet:"#223A2E"}`,borderLeft:`3px solid ${col}`,
                      padding:"5px 9px",fontSize:11,opacity:lock?.4:1,cursor:lock?"not-allowed":"pointer",
                      color:lock?C.faint:C.text}}>
                    <span style={{color:col,fontFamily:MONO}}>{lock?"—":override?"⚠":off?"☐":"☑"}</span> {src.name}
                    <span style={{color:C.faint,fontFamily:MONO,fontSize:9}}> · {LNAME(eLvl)}</span>
                  </button>
                  {eLvl>L&&L<5&&<button onClick={()=>setG(s=>({...s,scopeOverride:{...s.scopeOverride,[id]:override?0:1},
                      scopeOff:override?s.scopeOff:{...s.scopeOff,[id]:0}}))}
                    title="Override — add this item to your kit despite being above your certification level. Logged as out-of-scope practice if used."
                    style={{fontFamily:MONO,fontSize:9,padding:"0 7px",borderRadius:6,cursor:"pointer",
                      background:override?"#2E2140":"transparent",border:`1px solid ${override?C.violet:C.line}`,
                      color:override?C.violet:C.faint}}>{override?"UNDO":"OVERRIDE"}</button>}
                </div>);})}
            </div></div>))}
      </div>
    </>}

    <div className="mt-4 pt-4" style={{borderTop:`1px solid ${C.line}`}}>
      <div style={{fontFamily:MONO,fontSize:9.5,letterSpacing:".14em",color:C.dim,marginBottom:8}}>SAVE THIS AS A CUSTOM SCOPE</div>
      <div style={{fontSize:11,color:C.faint,marginBottom:8,lineHeight:1.5}}>
        Permanent for you — it'll show up as a preset (marked ★) in every save from now on, until you delete it.
      </div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="Name this scope…"
          className="px-3 py-2 rounded flex-1" style={{background:C.panelHi,border:`1px solid ${C.line}`,color:C.text,fontSize:13}}/>
      </div>
      {!confirmSave
        ?<button onClick={()=>setConfirmSave(true)} disabled={!customName.trim()}
            className="px-5 py-2.5 rounded" style={{background:customName.trim()?"#2A1418":"transparent",
              border:`1px solid ${customName.trim()?C.red:C.line}`,color:customName.trim()?C.red:C.faint,
              fontSize:14,fontWeight:600,cursor:customName.trim()?"pointer":"default"}}>
            💾 SAVE CUSTOM SCOPE</button>
        :<div className="p-3 rounded" style={{background:"#1A1013",border:`1px solid ${C.red}`}}>
          <div style={{fontSize:13,color:C.text,marginBottom:10}}>
            Save "{customName.trim()||"My Scope"}" as a permanent custom scope? Are you sure?</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={doSaveCustom} className="px-4 py-2 rounded"
              style={{background:"#2A1418",border:`1px solid ${C.red}`,color:C.red,fontSize:12.5,cursor:"pointer"}}>Yes, save it</button>
            <button onClick={()=>setConfirmSave(false)} className="px-4 py-2 rounded"
              style={{background:"transparent",border:`1px solid ${C.line}`,color:C.dim,fontSize:12.5,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>}
    </div>
  </div>);
}

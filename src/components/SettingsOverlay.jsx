import { useEffect, useState } from "react";
import { C, MONO } from "../theme.js";
import { PROTOCOLS, PROTOCOL_ORDER } from "../protocols/index.js";
import { writeSave } from "../saves.js";
import ScopeEditor from "./ScopeEditor.jsx";
import { speechRecognitionAvailable } from "../hooks/useVoiceCommands.js";
import { isTesterUnlocked } from "../testerGate.js";
import { ASSIST_LEVELS, ASSIST_LABELS } from "../procedureAssist.js";
import { getLocalAiState, subscribeLocalAiProgress, retryLocalAi, preloadLocalAi, importLocalAiModel } from "../dialogue/dialogueManager.js";
import { MODEL_ZIP_URL } from "../dialogue/modelImport.js";

// Checked once at module load (not per-render) — browser support doesn't
// change mid-session. Effectively Chrome/Edge/Chromium-based browsers only;
// Safari and Firefox lack SpeechRecognition entirely, so the row below is
// simply absent there rather than shown broken.
const VOICE_SUPPORTED=speechRecognitionAvailable();

// A single, always-mounted settings surface. Rendered from Shell so it is
// available on EVERY screen (title, setup wizard, live call, debrief…). It
// reads and writes the top-level game state through {g, setG}. Sections that
// only make sense inside a shift (protocol, first-on-scene, sandbox weather)
// simply hide themselves when they don't apply.
const SPEEDS=[[0.5,"0.5×"],[1,"1× (real time)"],[2,"2×"],[3,"3×"],[4,"4×"]];

// Hoisted OUT of SettingsOverlay — it was previously declared inside the
// component's render body, so every render created a brand-new `Row`
// function, and React treats that as a brand-new component TYPE each time,
// forcing a full remount of everything inside it (losing focus on the
// volume slider mid-drag, resetting any local state in its children) rather
// than reconciling. Row closes over nothing from SettingsOverlay's scope
// (only its own props), so hoisting it changes nothing about its behavior.
const Row=({label,children,note})=>(
  <div style={{marginBottom:16}}>
    <div style={{fontFamily:MONO,fontSize:10,letterSpacing:".16em",color:C.dim,marginBottom:6}}>{label}</div>
    {note&&<div style={{fontSize:11.5,color:C.faint,marginBottom:8,lineHeight:1.6}}>{note}</div>}
    {children}
  </div>);

export default function SettingsOverlay({g,setG}){
  // F0 item 10: reads the SAME real status plumbing the boot screen and
  // AiDownloadIndicator already use (getLocalAiState/subscribeLocalAiProgress)
  // — no second, parallel status system for this row to fall out of sync
  // with. Subscribed unconditionally (hooks can't be called after the
  // early-return below) but cheap: subscribeLocalAiProgress fires once
  // synchronously and otherwise only on real progress events.
  const [aiState,setAiState]=useState(()=>getLocalAiState());
  const [importMsg,setImportMsg]=useState("");
  useEffect(()=>subscribeLocalAiProgress(setAiState),[]);
  if(!g||!setG) return null;
  const inShift=!!g.scen||["response","approach","scene","transport","arrived"].includes(g.phase);
  const isSandbox=g.gmode==="sandbox";
  const canSave=!!g.saveId;
  const saveNow=()=>{
    if(!g.saveId) return;
    writeSave(g.saveId,g,{name:g.saveName,gmode:g.gmode,level:g.level,careerIdx:g.career?.idx??0});
    setG(s=>({...s,lastSaveAt:Date.now()}));
  };
  const Chip=(active,onClick,text,key)=>(
    <button key={key} onClick={onClick} style={{background:active?"#16241C":"transparent",
      border:`1px solid ${active?C.hr:C.line}`,color:active?C.hr:C.dim,fontSize:11.5,padding:"6px 10px",
      borderRadius:6,cursor:"pointer"}}>{text}</button>);

  return (<>
    {/* Always-visible gear, fixed to the viewport corner */}
    <button onClick={()=>setG(s=>({...s,settingsOpen:1}))} title="Settings"
      style={{position:"fixed",top:12,right:12,zIndex:60,background:"rgba(10,14,12,.85)",
        border:`1px solid ${C.line}`,borderRadius:8,color:C.dim,fontFamily:MONO,fontSize:12,
        padding:"7px 11px",cursor:"pointer",backdropFilter:"blur(4px)"}}>⚙</button>

    {/* !! guards against the React "stray 0" render (same bug class as
        confirmDeath, App.jsx): settingsOpen is a numeric 0/1 flag, and this
        component is mounted unconditionally on EVERY screen via Shell.jsx,
        so `{g.settingsOpen&&<div>}` rendered a literal "0" text node on
        every page whenever settings was closed — found while chasing the
        long-standing F4 "stray 00s all over the UI" report; AchievementsOverlay
        and RelationshipsOverlay (also globally/conditionally mounted) and the
        station screen's statsOpen panel had the identical defect. */}
    {!!g.settingsOpen&&<div onClick={()=>setG(s=>({...s,settingsOpen:0}))}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:61,display:"flex",
        alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="p-5 rounded"
        style={{background:C.panel,border:`1px solid ${C.line}`,maxWidth:460,width:"92%",maxHeight:"86vh",overflowY:"auto"}}>
        <div className="flex justify-between items-baseline" style={{marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:600}}>Settings</div>
          <button onClick={()=>setG(s=>({...s,settingsOpen:0}))} style={{background:"transparent",
            border:`1px solid ${C.line}`,borderRadius:5,color:C.dim,fontFamily:MONO,fontSize:11,padding:"4px 9px",cursor:"pointer"}}>close</button></div>

        {/* Saving */}
        <Row label="SAVE" note={canSave?"Autosaves every 5 minutes and around each call. You can also save right now.":"No save slot active yet — start or load a save to enable saving."}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button disabled={!canSave} onClick={saveNow} style={{background:canSave?C.panelHi:"transparent",
              border:`1px solid ${canSave?C.hr:C.line}`,color:canSave?C.hr:C.faint,fontSize:12.5,padding:"7px 12px",borderRadius:6,cursor:canSave?"pointer":"default"}}>
              Save now</button>
            {g.lastSaveAt&&<span style={{fontFamily:MONO,fontSize:10,color:C.faint}}>saved {new Date(g.lastSaveAt).toLocaleTimeString()}</span>}
          </div>
        </Row>

        {/* Volume — split into two independent controls: MUSIC (background
            music/ambience plus the siren, both ambient sound rather than
            speech) and VOICE (the spoken read-aloud dialogue/dispatch
            narration). Previously one shared `g.volume` slider controlled
            all three at once, so turning music down also silenced spoken
            dialogue and vice versa. Both persist across a "new call, same
            shift" reset via CARRY (App.jsx), the same as the old single
            slider did. */}
        <Row label="MUSIC VOLUME" note="Background music, station ambience, and the siren.">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="range" min="0" max="1" step="0.05" value={g.musicVolume??1}
              onChange={e=>setG(s=>({...s,musicVolume:parseFloat(e.target.value)}))} style={{flex:1}}/>
            <span style={{fontFamily:MONO,fontSize:12,color:C.text,width:44,textAlign:"right"}}>{Math.round((g.musicVolume??1)*100)}%</span></div>
        </Row>
        <Row label="VOICE VOLUME" note="Spoken read-aloud dialogue and dispatch narration.">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="range" min="0" max="1" step="0.05" value={g.voiceVolume??1}
              onChange={e=>setG(s=>({...s,voiceVolume:parseFloat(e.target.value)}))} style={{flex:1}}/>
            <span style={{fontFamily:MONO,fontSize:12,color:C.text,width:44,textAlign:"right"}}>{Math.round((g.voiceVolume??1)*100)}%</span></div>
        </Row>

        {/* Driving mode toggle — map-expansion batch, CLAUDE.md. Real,
            map-derived travel time (src/scope.js's travelTimes(), via
            src/mapGraph.js's shortestPath over src/data/maps.js) is computed
            identically whether or not the interactive 3D scene renders — see
            that function's own header comment. Off skips DrivingScene
            entirely (App.jsx sets driveMiniDone at dispatch) and
            fast-forwards using that same computed time; a real optimization/
            accessibility option, not a difficulty toggle. ALSO gates
            Coop3DWalk (the co-op-only first-person walk-in) the same way —
            both are real-time WebGL scenes, so a player on weaker hardware
            can turn off the 3D rendering entirely and still play the whole
            game, since neither scene ever gates the underlying
            response/approach phase timing (App.jsx's tick loop drives that
            regardless — see each component's own header comment). Stored as
            a flat g.drivingModeEnabled, matching every other preference on
            this screen (g.volume/g.speed/g.protocol) — g IS the autosaved
            save, not ephemeral runtime state, so this needs no separate
            namespace.

            Tester-gated the same way Career/Co-op are (App.jsx's
            isTesterUnlocked(), shared via ../testerGate.js to avoid a
            circular import back through App.jsx — see that module's own
            header). The 3D scenes themselves are gated at every render
            site in App.jsx regardless of this toggle's stored value, so
            this row is belt-and-suspenders: a locked (public) player never
            even sees a control that would do nothing for them. */}
        <Row label="DRIVING MODE" note={isTesterUnlocked()
          ?"The interactive 3D drive-in and co-op walk-in segments. Turning it off skips straight to the scene — the actual response TIME is unaffected either way. Worth turning off on weaker hardware."
          :"The interactive 3D drive-in and walk-in segments are still in development and only available to authorized testers right now."}>
          {isTesterUnlocked()
            ?<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[["on",true],["off",false]].map(([l,val])=>Chip((g.drivingModeEnabled??true)===val,()=>setG(s=>({...s,drivingModeEnabled:val})),l,l))}
            </div>
            :<div style={{fontFamily:MONO,fontSize:10,color:C.faint,letterSpacing:".08em"}}>🔒 TESTERS ONLY</div>}
        </Row>

        {/* 2D/3D render preference — store-only today, see App.jsx's
            campaignRenderPref phase comment. Only shown once the player has
            actually made the prologue pick (g.prologueRenderPref is
            non-null), same "only show what applies" convention as this
            file's other conditionally-hidden rows. */}
        {g.prologueRenderPref&&<Row label="RENDER STYLE" note="2D visual-novel or 3D where available. Most scenes are 2D regardless of this setting for now.">
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["2D","2d"],["3D","3d"]].map(([l,val])=>Chip(g.prologueRenderPref===val,()=>setG(s=>({...s,prologueRenderPref:val})),l,l))}
          </div>
        </Row>}

        {/* Call speed */}
        <Row label="CALL SPEED" note="How fast the clock and physiology run. 1× is real time — one real second is one second in the game.">
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {SPEEDS.map(([v,l])=>Chip((g.speed??1)===v,()=>setG(s=>({...s,speed:v})),l,l))}
          </div>
        </Row>

        {/* "Procedure Gameplay" spec 2.9 — Assisted/Standard/Advanced
            accessibility tiers for the interactive IV/IO/airway/cric/SGA
            mini-games. A player-chosen margin-of-error scale, deliberately
            NOT a physiology signal (see procedureAssist.js's own header) —
            the real difficulty band (vein size, view grade, landmark
            tolerance) still comes entirely from the patient; this only
            widens or narrows how forgiving the target is around it. */}
        <Row label="PROCEDURE ASSIST" note="How forgiving the IV/IO/airway/cric/SGA mini-games are around the real target. The underlying difficulty (vein size, airway anatomy) still comes from the patient either way.">
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ASSIST_LEVELS.map(lvl=>Chip((g.procedureAssist||"standard")===lvl,()=>setG(s=>({...s,procedureAssist:lvl})),ASSIST_LABELS[lvl],lvl))}
          </div>
        </Row>

        {/* F0 item 10 — "an Local AI Dialogue settings toggle describing what
            it does, showing AI/model status, download size, support/
            readiness, with Enable/Disable. Disabled -> deterministic/
            contextual fallback dialogue." g.localAiEnabled is the real flag:
            dialogueManager.js's isLocalAiEnabled(s) reads this SAME field off
            the game state passed into requestLocalUpgrade/generateDialogue
            and short-circuits before Tier 3 ever runs when it's false — this
            row is not a display-only checkbox, see that function's own
            comment for the gate. Status/size text below is genuinely derived
            from aiState (getLocalAiState()), never hand-written. */}
        <Row label="LOCAL AI DIALOGUE" note={`Lets patients and crew speak with AI-generated, in-the-moment dialogue instead of only fixed/template lines, entirely on your own device — nothing about a call is ever sent anywhere. Disabling this always falls back to the deterministic/template dialogue the game already uses. Download size: ~${aiState.downloadSizeMB} MB, cached after the first download.`}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontFamily:MONO,fontSize:10.5,color:C.faint}}>
              {/* aiState.backend ("webgpu"|"wasm"|"none") says which real
                  backend this status describes — getLocalAiState() reports
                  whichever one a dialogue call would actually use right
                  now, per dialogueManager.js's own real fallback order.
                  A device with no WebGPU but real WASM support (the common
                  case) is NOT unsupported: it just runs the broader-
                  compatibility WASM tier, which used to be misreported here
                  as "no WebGPU, fallback dialogue only" even though real
                  local-model dialogue was working fine via WASM. */}
              {aiState.supported
                ?(()=>{const via=aiState.backend==="wasm"?" (via WebAssembly)":"";
                  const isWebgpu=aiState.backend==="webgpu";
                  return aiState.status==="ready"?`Status: model ready on this device${via}`
                  :aiState.status==="downloading"?`Status: downloading${via}${typeof aiState.progress?.progress==="number"?` (${Math.round(aiState.progress.progress*100)}%)`:""}`
                  :aiState.status==="loading-from-cache"?`Status: loading cached model${via}`
                  :aiState.status==="loading"?"Status: checking cache"
                  :aiState.status==="failed"?`Status: failed to load on this device${via}${
                      aiState.errorKind==="timeout"?" (timed out)"
                      :aiState.errorKind==="network"?" (network problem)"
                      :(aiState.errorKind==="device"&&isWebgpu)?" (device rejected local AI)"
                      :""}, using fallback dialogue. This never affects the medical simulation itself.${
                      // "device" investigation (see dialogueProvider.js's
                      // classifyLoadError comment and CLAUDE.md's dated entry):
                      // web-llm exposes no way to vary the GPU adapter request
                      // or hand it a pre-made device, so a retry can't help a
                      // real adapter rejection. This is a genuine, actionable
                      // alternative, not a substitute for a fix that doesn't
                      // exist. Only shown for a WebGPU failure — the WASM
                      // fallback failing has no GPU-driver angle to advise on.
                      (aiState.errorKind==="device"&&isWebgpu)?" Try checking that hardware acceleration is on in your browser settings, updating your GPU drivers, or checking edge://gpu / chrome://gpu.":""}`
                  :aiState.cacheState==="cached"?"Status: model cached, not yet loaded this session"
                  :`Status: not yet downloaded${via}`;})()
                :"Status: this device/browser supports neither WebGPU nor WebAssembly, fallback dialogue only"}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {/* Opt-in by default (reliability fix — see dialogueManager.js's
                  isLocalAiEnabled comment): an unset g.localAiEnabled means
                  disabled, so the chip highlighting here must match that
                  same ??false default, not the old ??true. */}
              {/* Enabling must also START the load: the boot screen's own
                  preloadLocalAi() is a one-shot on mount and is a no-op while
                  the flag is unset, so without this the flag flips but nothing
                  downloads until a dialogue event lazily triggers it (status
                  sits at "not yet downloaded" indefinitely). preload is
                  idempotent, so re-clicking Enable is harmless. */}
              {[["enable",true],["disable",false]].map(([l,val])=>Chip((g.localAiEnabled??false)===val,()=>{setG(s=>({...s,localAiEnabled:val}));if(val)preloadLocalAi({localAiEnabled:true});},l,l))}
              {/* Reliability fix: a real Retry control, only shown once a
                  load has genuinely failed (never decorative — clicking it
                  calls the real dialogueManager.retryLocalAi(), which
                  clears the LocalLLMProvider singleton's own _failed latch
                  and stale _loadPromise and re-attempts a real engine
                  load; see dialogueProvider.js's retry()). aiState updates
                  live via the existing subscribeLocalAiProgress
                  subscription the moment the retry resolves or fails
                  again — no extra local state needed here. */}
              {aiState.status==="failed"&&Chip(false,()=>retryLocalAi(),"retry","retry")}
            </div>
            {/* Offline fallback for when the model download keeps failing
                (Hugging Face resets connections for some players). The player
                downloads one zip in their browser, then imports it here;
                modelImport.js writes it into the cache web-llm reads from.
                WebGPU tier only, so hidden on a WASM-only browser. */}
            {aiState.backend==="webgpu"&&(
              <div style={{fontFamily:MONO,fontSize:10.5,color:C.faint,display:"flex",flexDirection:"column",gap:6}}>
                <div>Downloads failing? <a href={MODEL_ZIP_URL} target="_blank" rel="noreferrer" style={{color:C.faint,textDecoration:"underline"}}>Download the model file</a> (about 290 MB), then import it:</div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <label style={{cursor:"pointer"}}>
                    <input type="file" accept=".zip,application/zip" style={{display:"none"}}
                      onChange={async(e)=>{
                        const f=e.target.files?.[0];e.target.value="";
                        if(!f)return;
                        try{
                          await importLocalAiModel(f,setImportMsg);
                          setG(s=>({...s,localAiEnabled:true}));
                          setImportMsg("Imported. Loading the model…");
                        }catch(err){
                          setImportMsg(err?.userFacing?err.message:"Import failed. Try downloading the file again.");
                        }
                      }}/>
                    {Chip(false,()=>{},"import model file","import")}
                  </label>
                  {importMsg&&<span>{importMsg}</span>}
                </div>
              </div>
            )}
          </div>
        </Row>

        {/* Voice-activated crew commands (crew-AI batch). Only meaningful
            within a shift (same gate as the protocol row below), and only
            shown at all on a browser that actually supports
            SpeechRecognition — hidden, not shown-and-broken, everywhere
            else. Off by default: this is an opt-in enhancement dependent on
            mic permission, not a behavior change every save should get. */}
        {/* Shown on every device now, not hidden on an unsupported browser —
            a missing row read as "voice commands don't exist" rather than
            "this browser can't do them." Chrome/Edge (desktop and Android)
            and recent Safari support the underlying SpeechRecognition API;
            Firefox does not, at all, as of this writing. */}
        {inShift&&<Row label="VOICE COMMANDS" note={VOICE_SUPPORTED
          ?'Say a crew member’s name then a task, "Reyes, start compressions" — or command yourself directly, "Push epinephrine" (you’ll be asked to confirm before it actually happens). Requires microphone permission.'
          :"This browser doesn't support voice commands (no SpeechRecognition API). Try Chrome, Edge, or Safari."}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {VOICE_SUPPORTED
              ?[["on",true],["off",false]].map(([l,val])=>Chip((g.voiceCommandsEnabled??false)===val,()=>setG(s=>({...s,voiceCommandsEnabled:val})),l,l))
              :<span style={{fontSize:11,color:C.faint}}>unavailable on this device</span>}
          </div>
        </Row>}

        {/* Treatment protocol — only meaningful within a shift */}
        {inShift&&<Row label="CREW TREATMENT PROTOCOL" note="Which protocol a higher-level provider on scene runs when directing the crew. Default is a simple universal BLS set; the agency files ship empty, ready to author.">
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
            {PROTOCOL_ORDER.map(pid=>{const sel=(g.protocol||"default")===pid,empty=pid!=="default"&&(PROTOCOLS[pid].rules||[]).length===0;
              return Chip(sel,()=>setG(s=>({...s,protocol:pid})),`${pid==="default"?"◆ ":""}${PROTOCOLS[pid].name}${empty?" (empty)":""}`,pid);})}
          </div>
          <button onClick={()=>setG(s=>({...s,protocol:"default"}))} style={{background:C.panelHi,border:`1px solid ${C.hr}`,color:C.hr,fontSize:12,padding:"7px 12px",borderRadius:6,cursor:"pointer"}}>
            Use Default Protocol</button>
          {/* F19: community-facing invite, not a technical control — the folder
              this list is generated from (src/protocols/) ships an authoring
              template (_template.js) with a paste-ready AI prompt for exactly
              this purpose. */}
          <div style={{fontSize:11,color:C.faint,marginTop:10,lineHeight:1.6}}>
            Have a real written protocol from your own agency or region? We'd love to ship it as an option here —
            send it our way and we'll add it for everyone.
          </div>
        </Row>}

        {/* Scope-of-practice profile — which certification level each drug/
            procedure actually requires, PLUS the manual per-item add/remove
            grid (moved here from the one-time setup wizard so it's reachable
            any time before a save locks it in — see ScopeEditor's own
            `locked` prop and App.jsx's g.scopeLocked). */}
        <Row label="SCOPE OF PRACTICE" note="Which real-world scope this save uses, and which certification level a given drug or procedure actually requires. Pick a preset, then override individual items and optionally save your own permanent custom scope.">
          <ScopeEditor g={g} setG={setG} locked={!!g.scopeLocked}/>
          <div style={{fontSize:11,color:C.faint,marginTop:12,lineHeight:1.6}}>
            Have a real written scope-of-practice document from your own state or agency? We'd love to ship it as an
            option here — send it our way and we'll add it for everyone.
          </div>
        </Row>

        {/* First-on-scene multiplier */}
        <Row label="CHANCE TO SHOW UP FIRST" note="Global multiplier on your odds of being first on scene (streak, region and vehicle still apply on top).">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="range" min="0" max="3" step="0.1" value={g.firstVar??1}
              onChange={e=>setG(s=>({...s,firstVar:parseFloat(e.target.value)}))} style={{flex:1}}/>
            <span style={{fontFamily:MONO,fontSize:12,color:C.text,width:44,textAlign:"right"}}>{(g.firstVar??1).toFixed(1)}×</span></div>
        </Row>

        {/* Sandbox-only: weather / time of day + first-on-scene choice */}
        {isSandbox&&<>
          <Row label="WEATHER · TIME OF DAY (SANDBOX)" note="Both stretch other units' response times. Applied when a call is rolled.">
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
              {["clear","rain","fog","snow","heat"].map(w=>Chip((g.weather||"clear")===w,()=>setG(s=>({...s,weather:w})),w,w))}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[["day","day"],["night","night"],["rush","rush hour"]].map(([w,l])=>Chip((g.timeOfDay||"day")===w,()=>setG(s=>({...s,timeOfDay:w})),l,w))}
            </div>
          </Row>
          <Row label="SANDBOX — FIRST ON SCENE" note="Takes effect on the next call you roll.">
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[["auto",null],["always first",true],["never first",false]].map(([l,val])=>Chip((g.sandboxFirst??null)===val,()=>setG(s=>({...s,sandboxFirst:val})),l,l))}
            </div>
          </Row>
        </>}
      </div></div>}
  </>);
}

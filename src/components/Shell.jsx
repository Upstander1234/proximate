import { C, SANS } from "../theme.js";
import SettingsOverlay from "./SettingsOverlay.jsx";
import AchievementsOverlay from "./AchievementsOverlay.jsx";
import RelationshipsOverlay from "./RelationshipsOverlay.jsx";
import AchievementToast from "./AchievementToast.jsx";
import ClinicalEventAlert from "./ClinicalEventAlert.jsx";
import AiDownloadIndicator from "./AiDownloadIndicator.jsx";
import AiReadyNotice from "./AiReadyNotice.jsx";
import DialogueDevPanel from "./DialogueDevPanel.jsx";
import TutorialCoachmark from "./TutorialCoachmark.jsx";
import { TUTORIAL_STEPS } from "../tutorialSteps.js";

export default function Shell({children,css,lights,full,g,setG}){
  return (<div style={{background:C.bg,color:C.text,fontFamily:SANS,minHeight:"100dvh",width:"100%",position:"relative",overflowX:"hidden",padding:"clamp(12px,2vw,24px)"}}>
    <style>{css}</style>
    {g&&setG&&<SettingsOverlay g={g} setG={setG}/>}
    {g&&setG&&<AchievementsOverlay g={g} setG={setG}/>}
    {g&&setG&&<RelationshipsOverlay g={g} setG={setG}/>}
    {g&&setG&&<AchievementToast g={g} setG={setG}/>}
    {g&&setG&&<ClinicalEventAlert g={g} setG={setG}/>}
    <AiDownloadIndicator/>
    <AiReadyNotice/>
    {import.meta.env.DEV&&<DialogueDevPanel/>}
    {g&&setG&&<TutorialCoachmark active={!!g.ch1TutorialActive} step={g.ch1TutorialStep||0}
      onNext={()=>setG(s=>{
        const next=(s.ch1TutorialStep||0)+1;
        if(next>=TUTORIAL_STEPS.length) return {...s,ch1TutorialActive:false,ch1TutorialStep:0,ch1TutorialDone:true};
        return {...s,ch1TutorialStep:next};
      })}
      onSkip={()=>setG(s=>({...s,ch1TutorialActive:false,ch1TutorialStep:0,ch1TutorialDone:true}))}/>}
    {lights&&<><div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 8% 0%, ${C.red}22, transparent 45%)`,animation:"fR 1s steps(1) infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 92% 0%, ${C.blue}22, transparent 45%)`,animation:"fB 1s steps(1) infinite",pointerEvents:"none"}}/></>}
    <div style={{position:"relative",width:"100%",maxWidth:full?"none":"80rem",margin:"0 auto"}}>{children}</div>
  </div>);
}

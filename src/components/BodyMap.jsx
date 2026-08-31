import { C } from "../theme.js";

export default function BodyMap({active,touched,onPick,ivSites,woundColors}){
  const f=(k)=>active===k?"#33454F":touched(k)?"#1F2C34":"#182027";
  const st=(k)=>ivSites?.includes(k)?C.hr:active===k?C.amber:touched(k)?"#2E4A3A":C.line;
  const wc=(k)=>woundColors?.[k]==="red"?C.red:woundColors?.[k]==="yellow"?C.amber:null;
  const R=(k,p)=>{const w=wc(k);
    return (<g className="rg" onClick={()=>onPick(k)}>
      <rect {...p} rx={p.rx??6} fill={f(k)} stroke={st(k)} strokeWidth={ivSites?.includes(k)?2.2:1.4}/>
      {w&&<circle cx={p.x+p.width/2} cy={p.y+p.height/2} r={Math.min(p.width,p.height)*0.22} fill={w} stroke="#0008"/>}
    </g>);};
  return (<svg viewBox="0 0 160 300" style={{width:"100%",maxHeight:300}}>
    <g className="rg" onClick={()=>onPick("head")}>
      <ellipse cx="80" cy="26" rx="19" ry="22" fill={f("head")} stroke={st("head")} strokeWidth="1.4"/></g>
    {R("neck",{x:71,y:47,width:18,height:13,rx:3})}{R("torso",{x:55,y:61,width:50,height:60})}
    {R("abdo",{x:58,y:123,width:44,height:40})}{R("armR",{x:27,y:63,width:24,height:92,rx:11})}
    {R("armL",{x:109,y:63,width:24,height:92,rx:11})}{R("legR",{x:57,y:167,width:21,height:118,rx:10})}
    {R("legL",{x:82,y:167,width:21,height:118,rx:10})}
  </svg>);
}

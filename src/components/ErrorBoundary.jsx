import React from "react";

// Catches crashes that happen while rendering (as opposed to inside a
// click handler — those are caught by the window.onerror/unhandledrejection
// listeners wired up in main.jsx instead). Logs everything useful to the
// console — message, stack, component stack, and a snapshot of whatever
// game state was current — and shows a small in-app fallback instead of a
// blank white screen, with a button to reload back to the title screen.
export default class ErrorBoundary extends React.Component{
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(error,info){
    console.error(
      "[Proximate crash] Render error caught by ErrorBoundary\n"+
      "Message: "+(error&&error.message)+"\n"+
      "Stack:\n"+(error&&error.stack)+"\n"+
      "Component stack:\n"+(info&&info.componentStack)
    );
    try{
      window.__PROX_LAST_CRASH={
        message:error&&error.message, stack:error&&error.stack,
        componentStack:info&&info.componentStack, at:new Date().toISOString(),
      };
    }catch{/* ignore */}
  }
  render(){
    if(this.state.error){
      return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
          background:"#0B0F0D",color:"#D8DDDA",fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",padding:24}}>
          <div style={{maxWidth:520}}>
            <div style={{fontSize:13,letterSpacing:".2em",color:"#E85C5C"}}>SOMETHING CRASHED</div>
            <div style={{fontSize:13,marginTop:12,lineHeight:1.6,color:"#9BA39D"}}>
              Proximate hit an error it couldn't recover from. The details have been logged
              to the browser console (press F12 → Console) — please share that message when reporting the bug.
            </div>
            <div style={{fontSize:11.5,marginTop:14,padding:10,background:"#151A17",border:"1px solid #2A322D",
              borderRadius:6,color:"#E85C5C",wordBreak:"break-word"}}>
              {String(this.state.error && this.state.error.message || this.state.error)}
            </div>
            <button onClick={()=>{ try{ localStorage.removeItem("proximate.crashRecoveryReload"); }catch{/* ignore */} window.location.reload(); }}
              style={{marginTop:16,padding:"9px 18px",borderRadius:6,background:"#2A1418",
                border:"1px solid #E85C5C",color:"#E85C5C",fontSize:13,cursor:"pointer"}}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

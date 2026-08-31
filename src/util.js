export const clk=(s)=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,"0")}:${String(Math.floor(Math.max(0,s))%60).padStart(2,"0")}`;
export const T=(s)=>Math.max(0,(s.t-(s.onSceneAt??s.t))/60);      // MINUTES ON SCENE
export const curve=(dt,on,dur)=>dt<0?0:dt<on?dt/Math.max(1,on):dt<dur?1:Math.max(0,1-(dt-dur)/Math.max(1,on*3));
export const sat=(p,sh)=>{const x=Math.max(1,p+sh);return 100/(1+23400/(x*x*x+150*x));};
export const cyan=(s)=>s>=90?"none":s>=75?"slight":s>=66?"mild":"severe";

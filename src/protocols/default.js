import { soiledAir, pulseless, apnoeic, noLeads, notMonitored, noVitals } from "./engine.js";

// A deliberately simple, universal, mostly-BLS starting protocol. It is the
// "Default Protocol" button in Settings, and it is safe on any patient —
// selected automatically until the user picks a real agency file.
export default {
  id:"default", name:"Default (universal BLS)",
  rules:[
    {id:"airway",  when:soiledAir,   task:"suction", note:"clear the soiled airway first"},
    {id:"cpr",     when:pulseless,   task:"cpr",     note:"no pulse — compressions"},
    {id:"vent",    when:apnoeic,     task:"bvm",     note:"inadequate breathing — bag them"},
    {id:"leads",   when:noLeads,     task:"leads",   note:"get them on the monitor"},
    {id:"monitor", when:notMonitored,task:"monitor", note:"keep the numbers live"},
    {id:"vitals",  when:noVitals,    task:"vitals",  note:"full set of vitals"},
  ],
};

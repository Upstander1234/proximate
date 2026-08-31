// ─── Attachable / removable monitoring equipment ──────────────────────────
// Devices are a persistent layer on top of the one-shot action model: once
// ATTACHED they live in g.devices[id] and the game loop refreshes their
// readings (and drives their waveform on the Monitor tab) once per second.
// REMOVING a device deletes it from g.devices, which immediately stops both
// its live readings and its waveform (the trace goes flat / disappears).
//
// Each entry:
//   name        display name
//   attach      label for the "attach" action button
//   region      body region the attach action lives under (BodyMap)
//   tab         action tab it appears in
//   lvl         scope level required to attach
//   bag         equipment bag required (undefined = none)
//   wave        which Monitor waveform this device drives (null = no trace)
//   monitorReq  true if this device requires the cardiac monitor unit present
//   reads(v)    optional — vitals object pushed live every second while attached
//
// The pulse-ox pulse rate is intentionally derived (not just v.hr): in shock
// the peripheral waveform under-reads the true rate, which is a real finding.
export const pulseRateFrom=(v)=> (v.hr>0? Math.max(0, v.hr+(v.sbp<90?-14:0)) : 0);

export const DEVICES={
  pulseox:{ name:"Pulse oximeter", attach:"Attach pulse oximeter", region:"armR", tab:"assess",
    lvl:2, bag:"monitor", wave:"pleth",
    reads:(v)=> (v.hr>0&&v.sbp>=60) ? {"SpO₂":`${v.spo2}%`, PR:`${pulseRateFrom(v)}`} : null },
  capno:{ name:"Capnography", attach:"Attach capnography (nasal / inline)", region:"head", tab:"assess",
    lvl:3, bag:"monitor", wave:"capno",
    reads:(v)=> ({"EtCO₂":`${v.etco2}`}) },
  artline:{ name:"Arterial line", attach:"Arterial line — transduce", region:"armR", tab:"procedures",
    lvl:4, bag:"monitor", wave:"art",
    reads:(v)=> ({"BP (R)":`${v.sbp}/${v.dbp}`}) },
  bpcuff:{ name:"BP cuff", attach:"Apply the BP cuff", region:"armR", tab:"assess",
    lvl:1, bag:"monitor", wave:null },
  leads:{ name:"ECG leads", attach:"Apply monitor leads", region:"torso", tab:"procedures",
    lvl:2, bag:"monitor", wave:"ecg", monitorReq:true },
  pads:{ name:"Defib pads", attach:"Apply defib/AED pads", region:"torso", tab:"procedures",
    lvl:0, bag:"monitor", wave:null, monitorReq:true },
};

// Which waveforms are currently live, given the attached devices. Order is the
// draw order on the Monitor tab.
export const WAVE_ORDER=["ecg","pleth","capno","art","resp"];
export const WAVE_META={
  ecg:  {label:"ECG II",        color:"hr",    dev:"leads"},
  pleth:{label:"SpO₂ · Pleth",  color:"spo2",  dev:"pulseox"},
  capno:{label:"EtCO₂ · Capno", color:"violet",dev:"capno"},
  art:  {label:"ABP · Art line", color:"bp",    dev:"artline"},
  resp: {label:"Resp",          color:"rr",    dev:null},  // shown whenever ECG leads or pulse-ox on
};

// Standard biphasic manual-defibrillation energy steps (Joules).
export const DEFIB_ENERGIES=[120,150,200,300,360];

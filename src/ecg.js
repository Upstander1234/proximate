export const BEATS={
  sinus:[[0,0],[6,0],[9,-3],[12,0],[16,0],[18,2],[20,-14],[22,7],[24,0],[30,0],[34,-5],[38,0],[46,0]],
  sinusTach:[[0,0],[4,0],[6,-3],[8,0],[11,0],[13,2],[15,-14],[17,7],[19,0],[24,0],[27,-5],[30,0],[34,0]],
  sinusBrad:[[0,0],[8,0],[12,-3],[16,0],[22,0],[24,2],[26,-14],[28,7],[30,0],[38,0],[43,-5],[48,0],[62,0]],
  stemi:[[0,0],[6,0],[9,-3],[12,0],[16,0],[18,2],[20,-14],[22,7],[24,-6],[30,-6],[34,-11],[38,-6],[46,-2]],
  peakedT:[[0,0],[6,0],[9,-2],[12,0],[16,0],[18,2],[20,-14],[24,9],[27,0],[31,0],[35,-16],[39,0],[46,0]],
  wideQRS:[[0,0],[8,0],[12,0],[16,2],[20,-13],[26,10],[32,0],[38,0],[43,-6],[48,0],[56,0]],
  afib:[[0,0],[4,1],[8,-1],[12,1],[15,0],[17,2],[19,-14],[21,7],[23,0],[29,0],[33,-4],[37,0],[41,0]],
  svt:[[0,0],[3,0],[5,2],[7,-13],[9,6],[11,0],[15,0],[18,-4],[21,0],[24,0]],
  VT:[[0,0],[6,-12],[12,10],[18,-10],[24,12],[30,-8],[36,0]],
  // Junctional escape: no P wave, narrow QRS, slow.
  junctional:[[0,0],[10,0],[12,2],[14,-13],[16,7],[18,0],[26,0],[31,-5],[36,0],[52,0]],
  // Complete heart block: wide slow ventricular escape (P/QRS dissociation
  // rendered as a slow wide complex with a wandering baseline bump).
  chb:[[0,0],[6,2],[10,0],[18,0],[22,-11],[30,9],[38,0],[46,0],[54,-5],[62,0],[80,0]],
  // Torsades de pointes: polymorphic, amplitude waxing and waning around the
  // baseline.
  torsades:[[0,0],[4,-6],[8,8],[12,-12],[16,14],[20,-16],[24,12],[28,-9],[32,5],[36,-3],[40,2],[44,0]],
  VF:null, asystole:null, PEA:[[0,0],[8,0],[12,-2],[16,0],[22,0],[24,1],[26,-9],[28,5],[30,0],[40,0],[46,-3],[52,0],[70,0]],
  // Sinus rhythm with an interposed wide, early, no-P-wave complex (a PVC)
  // followed by a compensatory pause — cardiac conditions batch, queue item 7
  // (prematureVentricularContractions). Two normal beats, then the ectopic.
  sinusPVC:[[0,0],[6,0],[9,-3],[12,0],[16,0],[18,2],[20,-14],[22,7],[24,0],[30,0],[34,-5],[38,0],[46,0],
    [52,0],[58,-18],[64,16],[70,-9],[76,0],[104,0]],
  // Sinus rhythm with an early, narrow (no true P-wave morphology change
  // visible at this resolution) beat followed by a short, incomplete pause —
  // prematureAtrialContractions.
  sinusPAC:[[0,0],[6,0],[9,-3],[12,0],[16,0],[18,2],[20,-14],[22,7],[24,0],[30,0],[34,-5],[38,0],[46,0],
    [58,0],[61,-3],[64,0],[68,0],[70,2],[72,-12],[74,6],[76,0],[96,0]],
  // Sinus rhythm, first-degree AV block (queue item 5 — pat.firstDegreeBlock
  // was computed every tick and read by nothing). Same QRS/ST/T as a normal
  // sinus beat (P is still always followed by a QRS — unlike Wenckebach/
  // Mobitz II, no beat is ever dropped), but the P wave sits earlier relative
  // to the QRS, doubling the isoelectric PR segment (6 units -> 12) to draw a
  // visibly prolonged PR interval. Total beat width unchanged from `sinus`
  // (46) so the tiling rate is identical — first-degree block does not
  // change heart rate.
  firstDegreeBlock:[[0,0],[3,0],[4,-3],[6,0],[18,2],[20,-14],[22,7],[24,0],[30,0],[34,-5],[38,0],[46,0]],
  // Osborn (J) wave — accidentalHypothermia, queue item 7's suggested batch.
  // A positive deflection immediately following the QRS (at the J point),
  // from delayed epicardial repolarisation in the cold myocardium — the same
  // repolarisation heterogeneity that feeds a.hypothermic's VF-substrate term
  // in cardiovascular.js. This engine has no continuous per-lead amplitude
  // model, so severity is represented as one qualitative waveform (a single
  // hump right after the QRS) rather than a graded J-point height.
  osborn:[[0,0],[3,0],[4,-3],[6,0],[18,2],[20,-14],[22,7],[24,0],[26,-5],[28,-2],[34,-5],[38,0],[46,0]],
};
export const ECG_READ={
  sinus:"Normal sinus rhythm.", sinusTach:"Sinus tachycardia.", sinusBrad:"Sinus bradycardia.",
  stemi:"ST ELEVATION — inferior leads (II, III, aVF).",
  peakedT:"Tall, peaked, narrow T waves. QRS widening. HYPERKALAEMIA.",
  wideQRS:"Wide-complex rhythm. Terminal R in aVR.",
  afib:"Irregularly irregular. No discernible P waves. ATRIAL FIBRILLATION.",
  svt:"Narrow-complex tachycardia, rate >150. No visible P waves. SVT.",
  VT:"Wide-complex tachycardia. VENTRICULAR TACHYCARDIA — pulseless.",
  junctional:"Narrow-complex escape, ~40–60/min. No P waves. JUNCTIONAL RHYTHM.",
  chb:"P waves and QRS marching independently. COMPLETE (3RD DEGREE) HEART BLOCK.",
  torsades:"Polymorphic VT, axis twisting about the baseline. TORSADES DE POINTES.",
  VF:"Chaotic, disorganized. VENTRICULAR FIBRILLATION. SHOCK IT.",
  asystole:"Asystole. Confirm in a second lead.",
  PEA:"Organized electrical activity. And no pulse. That is PEA — a shock will not help it.",
  sinusPVC:"Sinus rhythm with frequent unifocal PVCs (>1/min).",
  sinusPAC:"Sinus rhythm with frequent PACs (premature atrial complexes).",
  firstDegreeBlock:"Sinus rhythm. PR interval prolonged (>0.20s), but every P wave conducts. FIRST-DEGREE AV BLOCK.",
  osborn:"Positive deflection at the J point, immediately after the QRS (Osborn / J wave). SEVERE HYPOTHERMIA.",
};
// `ecgReadout(kind, v)` — a rate/severity-scaled variant of ECG_READ, per
// queue item F7's own "still open" note: the plain ECG_READ lookup gives
// every patient in a given rhythm CATEGORY the identical line regardless of
// rate or severity (e.g. afib at 92/min reads the same as afib at 178/min).
// Falls back to the exact ECG_READ text when `v` doesn't carry the relevant
// field (kind not in this switch, or the field is null/undefined) — every
// existing caller's behavior for every OTHER category is unchanged.
export function ecgReadout(kind, v = {}) {
  const base = ECG_READ[kind] || "Rhythm unclear.";
  switch (kind) {
    case "stemi": {
      const t = v.infarctTerritory;
      if (!t) return base;
      const leads = { inferior: "inferior leads (II, III, aVF)", anterior: "anterior leads (V1-V4)", septal: "septal leads (V1-V2)",
        lateral: "lateral leads (I, aVL, V5-V6)", anterolateral: "anterolateral leads (V3-V6, I, aVL)" };
      if (t === "posterior") return "ST DEPRESSION with tall R waves in V1-V3. Posterior STEMI until proven otherwise.";
      return `ST ELEVATION - ${leads[t] || t}.`;
    }
    case "afib": {
      const hr = v.hr;
      if (hr == null) return base;
      const tag = hr >= 150 ? ` with RVR, rate ${hr}`
        : hr < 100 ? `, rate-controlled at ${hr}`
        : `, rate ${hr}`;
      return `Irregularly irregular. No discernible P waves. ATRIAL FIBRILLATION${tag}.`;
    }
    case "svt": {
      const hr = v.hr;
      if (hr == null) return base;
      return `Narrow-complex tachycardia, rate ${hr}. No visible P waves. SVT.`;
    }
    case "wideQRS": {
      const qrs = v.qrsWidth;
      if (qrs == null) return base;
      return `Wide-complex rhythm, QRS ${Math.round(qrs * 1000)} ms. Terminal R in aVR.`;
    }
    case "peakedT": {
      const k = v.k;
      if (k == null) return base;
      return `Tall, peaked, narrow T waves. QRS widening. HYPERKALAEMIA, K ${k} mEq/L.`;
    }
    default:
      return base;
  }
}
// `artifact` (0..1) layers real-world monitor noise on top of the underlying
// rhythm — loose lead contact, patient movement, 60Hz mains interference —
// the same physical causes a crew troubleshoots by reseating leads rather
// than reading it as a rhythm change. 0 is the original, clean trace.
export function ecgPoints(kind,w=380,h=70,artifact=0){
  const mid=h/2, pts=[];
  const jit=(y)=>artifact>0?y+(Math.random()-.5)*artifact*30:y;
  if(kind==="VF"){ let x=0; while(x<w){ pts.push([x, mid+(Math.random()-.5)*38]); x+=3; } return pts; }
  if(kind==="asystole"){ let x=0; while(x<w){ pts.push([x, jit(mid+(Math.random()-.5)*1.6)]); x+=6; } return pts; }
  const b=BEATS[kind]||BEATS.sinus; const bw=b[b.length-1][0];
  let ox=0;
  while(ox<w){ b.forEach(([x,y])=>{ if(ox+x<=w) pts.push([ox+x, jit(mid+y*1.35)]); });
    ox+=bw + (kind==="afib"?(Math.random()*16-4):0); }
  return pts;
}

// ─── Non-ECG monitor waveforms ────────────────────────────────────────────
// Each returns an SVG polyline point list for a strip of width w / height h.
// `hr`/`rr` set the cycle length so the traces track the live patient; a flat
// line is returned when the parameter that drives the trace is absent (no
// pulse → flat pleth/art; apnea → flat capno/resp), which is what makes a
// removed or non-perfusing device read as a flat line on the monitor.

// Photoplethysmograph — the pulse-ox waveform. A sharp systolic upstroke,
// dicrotic notch, and diastolic runoff, one per cardiac cycle.
export function plethPoints(hr,w=380,h=70,perf=1){
  const mid=h/2, pts=[]; if(!hr||hr<=0||perf<=0){for(let x=0;x<=w;x+=8)pts.push([x,mid]);return pts;}
  const cyc=Math.max(14,Math.round(1800/hr)); const amp=16*Math.min(1,perf);
  for(let x=0;x<=w;x++){ const p=(x%cyc)/cyc;
    let y; if(p<0.18) y=-amp*Math.sin((p/0.18)*Math.PI/2);
    else if(p<0.34) y=-amp*Math.cos(((p-0.18)/0.16)*Math.PI/2)*0.55-amp*0.2;
    else if(p<0.44) y=-amp*0.28+amp*0.12*Math.sin(((p-0.34)/0.10)*Math.PI); // dicrotic notch
    else y=-amp*0.28*Math.exp(-(p-0.44)*4);
    pts.push([x,mid+y]); }
  return pts;
}
// Arterial line — a true pressure waveform scaled between diastolic and
// systolic, sharp upstroke with a dicrotic notch on the downslope.
export function artPoints(sbp,dbp,hr,w=380,h=70){
  const mid=h/2, pts=[]; if(!hr||hr<=0||!sbp){for(let x=0;x<=w;x+=8)pts.push([x,mid]);return pts;}
  const cyc=Math.max(14,Math.round(1800/hr)); const span=Math.max(6,Math.min(28,(sbp-dbp)*0.5));
  for(let x=0;x<=w;x++){ const p=(x%cyc)/cyc; let f;
    if(p<0.14) f=Math.sin((p/0.14)*Math.PI/2);
    else if(p<0.30) f=1-((p-0.14)/0.16)*0.5;
    else if(p<0.38) f=0.5+0.12*Math.sin(((p-0.30)/0.08)*Math.PI); // dicrotic notch
    else f=0.5*Math.exp(-(p-0.38)*3.2);
    pts.push([x,mid+span*0.5-f*span]); }
  return pts;
}
// Capnograph — the square-ish expiratory plateau of EtCO2 in mmHg, one per
// breath. Flat at zero when apnoeic (rr<=0).
export function capnoPoints(etco2,rr,w=380,h=70){
  const base=h-6, pts=[]; if(!rr||rr<=0||!etco2){for(let x=0;x<=w;x+=8)pts.push([x,base]);return pts;}
  const cyc=Math.max(30,Math.round(6000/Math.max(4,rr))); const amp=Math.min(base-8,etco2*0.55);
  for(let x=0;x<=w;x++){ const p=(x%cyc)/cyc; let y;
    if(p<0.10) y=0;                                   // inspiratory baseline
    else if(p<0.22) y=amp*((p-0.10)/0.12);            // sharp upstroke
    else if(p<0.72) y=amp*(0.9+0.1*((p-0.22)/0.50));  // alveolar plateau (slight rise)
    else if(p<0.80) y=amp*(1-(p-0.72)/0.08);          // inspiratory downstroke
    else y=0;
    pts.push([x,base-y]); }
  return pts;
}
// Respiration — a smooth sinusoid at the respiratory rate; flat when apnoeic.
export function respPoints(rr,w=380,h=70){
  const mid=h/2, pts=[]; if(!rr||rr<=0){for(let x=0;x<=w;x+=8)pts.push([x,mid]);return pts;}
  const cyc=Math.max(40,Math.round(6000/rr));
  for(let x=0;x<=w;x++) pts.push([x,mid-14*Math.sin((x%cyc)/cyc*Math.PI*2)]);
  return pts;
}

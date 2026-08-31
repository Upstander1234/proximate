// Age/weight-derived baseline physiology (pediatric through geriatric).
export class AgeProfile {
  // `sex` ("male" | "female") selects sex-specific reference physiology. It is a
  // BASELINE property, not a disease and not something a scenario should have to
  // compensate for. Defaults to "male" so patients that never declare a sex keep
  // the engine's historical reference values unchanged.
  constructor(age, weight = null, sex = "male", height = null) {
    this.age = Math.max(0, age);
    this.sex = sex === "female" ? "female" : "male";
    this.weight = weight || this.defaultWeight(this.age);
    // Measured height wins over the age-derived default; BSA (and therefore
    // cardiac index) depends on it, so a patient who states their height should
    // not be given a population average.
    this.height = height || this.heightCm();
    this.bsa = Math.sqrt((this.height * this.weight) / 3600);
  }
  isFemale() { return this.sex === "female" && this.age >= 12; }  // pre-pubertal values are shared
  // Sex-specific hematology reference values (adults). Before puberty male and
  // female hemoglobin/hematocrit are the same; the divergence appears with
  // androgen-driven erythropoiesis. Adult male ~15 g/dL / 45%, adult female
  // ~13.5 g/dL / 41%. Using the male reference for a woman makes her read as
  // polycythemic at baseline and masks anemia.
  normalHb() { return this.isFemale() ? 13.5 : 15; }
  normalHct() { return this.isFemale() ? 0.41 : 0.45; }
  defaultWeight(age) {
    if (age < 0.08) return 1.0;
    if (age < 0.25) return 3.5;
    if (age < 1)   return 8;
    if (age < 3)   return 14;
    if (age < 6)   return 20;
    if (age < 10)  return 30;
    if (age < 14)  return 45;
    if (age < 18)  return 60;
    return 70;
  }
  heightCm() {
    if (this.age < 0.08) return 40;
    if (this.age < 0.25) return 50;
    if (this.age < 1)   return 65;
    if (this.age < 3)   return 90;
    if (this.age < 6)   return 110;
    if (this.age < 10)  return 130;
    if (this.age < 14)  return 150;
    if (this.age < 18)  return 165;
    return 170;
  }
  // Blood volume is derived from PRE-PREGNANCY anatomical mass. Gestational
  // weight gain is uterus, fetus, placenta and amniotic fluid — it is not lean
  // vascularized tissue, so it must not inflate the anatomical baseline (and
  // then be expanded again by the pregnancy adaptation, double-counting it).
  // `weight` itself is left alone because drug dosing must still use the
  // patient's ACTUAL current body weight.
  anatomicalWeight() { return Math.max(1, this.weight - (this.gestationalWeightGainKg || 0)); }
  bloodVolumeL() { return (this.bloodVolumeMlKg() * this.anatomicalWeight()) / 1000; }
  bloodVolumeMlKg() {
    const a = this.age;
    if (a < 0.08) return 95;
    if (a < 0.25) return 85;
    if (a < 13)   return 75;
    if (a < 18)   return 70;
    // Adult women have a lower blood volume per kg than men (~65 vs ~70 mL/kg),
    // reflecting higher body-fat fraction (fat is poorly vascularized).
    if (a < 65)   return this.isFemale() ? 65 : 70;
    return this.isFemale() ? 60 : 65;
  }
  baselineVitals() {
    const a = this.age;
    if (a < 0.25) return { hr: 140, sbp: 70,  rr: 40 };
    if (a < 0.5)  return { hr: 130, sbp: 75,  rr: 35 };
    if (a < 1)    return { hr: 120, sbp: 80,  rr: 30 };
    if (a < 2)    return { hr: 110, sbp: 85,  rr: 28 };
    if (a < 5)    return { hr: 100, sbp: 90,  rr: 24 };
    if (a < 8)    return { hr: 90,  sbp: 95,  rr: 22 };
    if (a < 12)   return { hr: 80,  sbp: 105, rr: 20 };
    if (a < 18)   return { hr: 75,  sbp: 115, rr: 16 };
    if (a < 65)   return { hr: 75,  sbp: 120, rr: 14 };
    if (a < 80)   return { hr: 72,  sbp: 135, rr: 16 };
    return          { hr: 70,  sbp: 140, rr: 18 };
  }
  // Age-appropriate resting mean arterial pressure. This is the baroreflex
  // *setpoint*, so it must match the age's normal MAP — otherwise a child whose
  // normal MAP is 50-65 is read as catastrophically hypotensive and the reflex
  // pins sympathetic drive at maximum (runaway tachycardia + vasoconstriction).
  baselineMAP() {
    const a = this.age;
    if (a < 0.25) return 50;
    if (a < 0.5)  return 52;
    if (a < 1)    return 55;
    if (a < 2)    return 58;
    if (a < 5)    return 62;
    if (a < 8)    return 66;
    if (a < 12)   return 73;
    if (a < 18)   return 82;
    if (a < 65)   return 93;
    return 97;
  }
  // Body surface area of a REFERENCE patient of this age and default build.
  // Used to convert the indexed resistance below into this individual's
  // absolute resistance.
  _svrScaled(v) {
    const ref = this.referenceBSA();
    const act = this.bsa || ref;
    return v * (act > 0 ? ref / act : 1);
  }
  referenceBSA() {
    const w = this.defaultWeight(this.age);
    return Math.sqrt((this.heightCm() * w) / 3600);
  }
  baseSVR() {
    // Systemic vascular resistance scales INVERSELY with body size: a larger
    // person has more vascular beds in parallel. The size-independent quantity
    // is the resistance INDEX, SVRI = SVR x BSA (documented adult range
    // ~1970-2390 dyn.s.cm-5.m2), so absolute SVR = SVRI / BSA.
    //
    // The table below is the age-appropriate resistance for a REFERENCE build at
    // each age; it is then rescaled by referenceBSA/actualBSA so that an
    // individual's own size is respected. Previously the table was used
    // directly, so every adult received the same absolute resistance regardless
    // of body size while cardiac output scaled with size — measured SVR ran 1997
    // dyn.s.cm-5 in a 50 kg adult against 980 in a 100 kg adult, and mean
    // arterial pressure therefore drifted upward with body mass. A
    // default-build patient is unchanged (the ratio is exactly 1).
    const a = this.age;
    if (a < 0.25) return this._svrScaled(4600);
    if (a < 0.5)  return this._svrScaled(3900);
    if (a < 1)    return this._svrScaled(3200);
    if (a < 2)    return this._svrScaled(2600);
    if (a < 5)    return this._svrScaled(2050);
    if (a < 8)    return this._svrScaled(1650);
    if (a < 12)   return this._svrScaled(1400);
    if (a < 18)   return this._svrScaled(1260);
    if (a < 65)   return this._svrScaled(1200);
    return 1200 + (a - 65) * 15;
  }
  vo2MlKgMin() {
    const a = this.age;
    if (a < 0.5)  return 9.0;
    if (a < 2)    return 8.0;
    if (a < 6)    return 7.0;
    if (a < 12)   return 6.0;
    if (a < 18)   return 4.5;
    if (a < 70)   return 3.5;
    return 3.0;
  }
  totalVO2() { return this.vo2MlKgMin() * this.weight; }
  baseGFR() {
    const a = this.age;
    if (a < 0.02) return 20;
    if (a < 0.25) return 60;
    if (a < 1)    return 100;
    if (a < 30)   return 120;
    return Math.max(40, 120 - (a - 30) * 1.0);
  }
  respiratoryParams() {
    const vt = 0.007 * this.weight;
    const deadSpace = 0.002 * this.weight;
    let frc;
    if (this.age < 1) frc = 0.023 * this.weight;
    else if (this.age < 18) frc = 0.030 * this.weight;
    else frc = 0.034 * this.weight;
    return { vt, deadSpace, frc };
  }
  acidBaseBaseline() {
    if (this.age < 65) return { ph: 7.40, hco3: 24, paco2: 40 };
    const decades = Math.max(0, (this.age - 20) / 10);
    return { ph: 7.40 - decades * 0.005, hco3: 24 - decades * 0.2, paco2: 40 - decades * 1.2 };
  }
  coagFactorMod() {
    if (this.age < 0.5) return 0.7;
    if (this.age < 1)   return 0.85;
    if (this.age < 18)  return 1.0;
    if (this.age < 65)  return 1.0;
    return Math.max(0.8, 1 - (this.age - 65) * 0.005);
  }
  isNeonate() { return this.age < 0.25; }
  isElderly() { return this.age > 65; }
}

// ─── Patient pronouns ─────────────────────────────────────────────────────
// Each scenario declares its patient's pronouns with a `pronouns` field of
// "he" | "she" | "they" (defaulting sensibly if omitted). Crew members and
// narrative that refer to the patient pull the right set from here so nobody
// gets called "she" when the patient is a man. Singular "they" is fully
// supported (correct verb agreement), and is also the graceful default when a
// scenario's patient has no specified gender.
export const PRONOUN_SETS={
  he:  {subj:"he",   obj:"him",  poss:"his",   possPron:"his",   reflex:"himself",    plural:false},
  she: {subj:"she",  obj:"her",  poss:"her",   possPron:"hers",  reflex:"herself",    plural:false},
  they:{subj:"they", obj:"them", poss:"their", possPron:"theirs",reflex:"themselves", plural:true},
};

const cap=(s)=> s ? s[0].toUpperCase()+s.slice(1) : s;

// Resolve a pronoun-set key for a scenario: explicit field first, then the
// patient's gender, then a light inference from the title, then "they".
export function pronounKeyFor(scen){
  if(!scen) return "they";
  if(scen.pronouns && PRONOUN_SETS[scen.pronouns]) return scen.pronouns;
  const g=scen.patient?.gender;
  if(g==="male") return "he";
  if(g==="female") return "she";
  if(g==="nonbinary"||g==="other") return "they";
  const t=(scen.title||"");
  if(/\bfemale\b|\bwoman\b|\bgirl\b/i.test(t)) return "she";
  if(/\bmale\b|\bman\b|\bboy\b/i.test(t)) return "he";
  return "they";
}

// Returns a ready-to-use pronoun object with capitalized variants and verb
// agreement helpers, e.g. pr.subj, pr.Subj, pr.is ("is"/"are"), pr.was, pr.has,
// and pr.v(base) for a 3rd-person verb ("breathe" → "breathes" / "breathe").
export function pron(scen){
  const set=PRONOUN_SETS[pronounKeyFor(scen)]||PRONOUN_SETS.they;
  return {
    ...set,
    Subj:cap(set.subj), Obj:cap(set.obj), Poss:cap(set.poss), PossPron:cap(set.possPron), Reflex:cap(set.reflex),
    is:  set.plural?"are":"is",
    was: set.plural?"were":"was",
    has: set.plural?"have":"has",
    does:set.plural?"do":"does",
    v:(base)=> set.plural?base:base+"s",
  };
}

// Substitute {subj}{obj}{poss}{possPron}{reflex}{is}{was}{has} (and their
// Capitalized forms) inside a narrative string. Lets static text — including
// crew task reports — carry pronoun tokens instead of hard-coded gender.
export function applyPron(text, pr){
  if(!text||!pr) return text;
  return text.replace(/\{(Subj|subj|Obj|obj|Poss|poss|possPron|PossPron|reflex|Reflex|is|was|has|does)\}/g,
    (_,k)=> (pr[k]!=null?pr[k]:_));
}

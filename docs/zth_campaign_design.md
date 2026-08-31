# Zero-To-Hero Campaign — Expanded Design Document

**Status:** design only — nothing in this file has been implemented yet. It
expands and supersedes the previously-terse §1.6-1.8 and writes Chapters 1-10
in full for the first time; §1.1-1.5 (attributes/fatigue/morale/reputation/
relationships core) and §2.1-2.7 (the Prologue) already shipped in the game
and are described only briefly here, with a short polish addendum. Field
names below (`g.chapter3Path`, `g.patrolVehicle`, `g.calls911`, `g.iftCalls`,
relationship ids, achievement ids, `fitness`/`confidence`/`knowledge`/
`ambition`/`fatigue`/`morale`/`reputation`) match what `campaign.js`,
`relationships.js`, and `achievements.js` already use — anything new below
is named to fit that convention, not invented fresh.

**Why this reads the way it does.** Two things drove every choice in this
document. First, realism has to survive contact with how EMS actually works
in the U.S. — hour counts, the National EMS Scope of Practice Model tiers,
NREMT-style cognitive/psychomotor exams, FTO precepting, medical direction,
QA/QI chart review, CISM peer support — because a simulator whose value is
"physiology is real" loses credibility fast if its career ladder is fantasy.
Second, it has to be *relatable* to someone who has actually done this job:
the gallows humor, the exhaustion, the frequent flyers, the one call that
follows you home, the fact that the pay is bad and everyone knows it, the
politics of who gets to ride with whom. The disclaimer in §2.0 already tells
the player this exact pathway doesn't exist in reality (nobody goes
EMR→EMT→AEMT→Medic through one campus program with one recurring cast) — the
liberty is in the *compression*, not in getting any individual step wrong.

---

## 1.6 Certifications, Exams, and Job Progression

### 1.6.1 Design philosophy

Every certification gate in real EMS has three things this campaign should
model explicitly, because leaving any one out is what makes a "career ladder"
feel like a menu instead of a career:

1. **A floor of required hours/experience that cannot be shortcut by being
   good at simulations alone.** A brilliant EMR who has run three calls does
   not sit the EMT exam next week in real life, and shouldn't here either.
2. **A real cognitive/psychomotor exam with a real failure mode**, not a
   formality. NREMT's actual EMT/AEMT/Paramedic cognitive exam is a
   Computer Adaptive Test (CAT) that can end anywhere from 70 to 120
   questions once it's statistically confident you're above or below the
   cut score; the psychomotor exam is a set of skills stations (patient
   assessment-trauma, patient assessment-medical, cardiac arrest
   management/AED, spinal immobilization, bleeding control/shock,
   long-bone/joint immobilization, and — the one everyone remembers —
   oral/practical airway). This campaign can't simulate a CAT algorithm
   for real, but it should *feel* like one: variable length, weighted
   toward your weak areas, and capable of ending early in either direction.
3. **A real consequence for failing that is not a soft "try again next
   week."** Nationally, most students who fail an NREMT exam can retake
   after a mandatory remediation period (currently as few as 24-48 hours
   for a first retake in many jurisdictions, longer with each subsequent
   attempt, capped at a limited number of total attempts before a full
   remediation course is required). That rhythm — a real but survivable
   cost, escalating on repeat failure — is what §1.6.10 formalizes.

Every gate below is also written to be **honest about the compression**: the
real EMR→Paramedic ladder can take anywhere from 3 to 8+ years depending on
full-time/part-time status, program availability, and how long someone works
at each level before advancing (many career medics spend years as an EMT or
AEMT first, some by choice, some because 911 paramedic seats are competitive).
The campaign compresses this into one continuous playthrough — which is
exactly the liberty the disclaimer already names — but the *order* and the
*gates themselves* stay true to how the real system is structured, because
that structure is the whole teaching value of the chapter.

**A hard, explicit compression ratio — this has to stay playable by a
layperson in a reasonable number of sessions, not model a real multi-year
timeline.** Every in-fiction calendar duration this document names (course
length, weeks/months between chapters, time-skip narration) is **real-world
duration ÷ 10**, rounded to a sensible narrative unit. This is not a vague
"condensed for pacing" gesture — it's a fixed ratio, applied consistently,
so a future implementer has one rule to check every duration against
instead of guessing per-chapter. §1.6.2's table below states the resulting
in-fiction figure for every certification tier; any duration mentioned
elsewhere in this document (course lengths, "compressed" phrasing in the
chapter scripts) should be read against that same ÷10 rule, not
re-derived independently. **What does NOT compress:** call-count
thresholds (`calls911 >= 30`, the combined-60 paramedic-admission math,
practice-scenario caps) — those are already gameplay-tuned milestones, not
literal hour conversions, and shrinking them further would trivialize the
exact accomplishments the ladder is supposed to make feel earned. Only
CALENDAR time compresses; the volume of practiced skill required does not.

### 1.6.2 The certification ladder at a glance

| Level | Real-world calendar length | In-fiction length (÷10) | Campaign gate | Unlocks |
|---|---|---|---|---|
| EMR | ~6-8 wks part-time | ~4-6 in-fiction days | Ch.2 exam (5 calls, 70% acc., 5-Q quiz) | Ch.3 path choice, PATROL/volunteer-fire promotion track |
| EMT | ~10-14 wks part-time | ~1-1.5 in-fiction weeks | Ch.4 exam (5 scenarios ≥85% avg, 4/5 quiz) | Ch.5 job choice (IFT/911/Event), fire dept access if volunteering |
| AEMT | ~8-12 wks bridge | ~1 in-fiction week | Ch.6: EMT cert + supervisor recommendation (reputation-gated) | IV/IO, limited meds, supraglottic airway |
| Paramedic | ~12-18 months | ~5-7 in-fiction weeks | Ch.8: a probability roll (§1.6.8.1) — AEMT optional but by far the biggest single factor in it, plus reputation/calls/optional certs/entrance exam/advocate, then the exam gauntlet | Open world, Ch.10 advanced tracks |
| Critical Care / Flight | Post-cert, additional certification, ~2-4 months | ~1-2 in-fiction weeks | Ch.10, optional | CCT rig / AirLink helicopter |
| **Whole ladder, EMR→Medic** | **~3-8 real years** (typical, working through each tier) | **~4-8 in-fiction months total campaign span** | — | — |

This table is the spine — every sub-section below expands one row. The
"in-fiction length" column is the ÷10 rule from §1.6.1 applied; nothing
below should quote a different figure for the same tier's course length.

### 1.6.2.1 Money — the real backbone of this ladder (operator revision)

Per explicit operator direction, money stops being a side stat and becomes
the thing that actually decides HOW a player climbs this ladder, not just
how comfortable they are while doing it. This is realistic: cost is one of
the most-cited real reasons EMS careers stall out between tiers (people get
EMT-certified and never go further not because they can't pass AEMT/medic,
but because they can't afford the tuition and the lost work-hours at the
same time), and a campaign this focused on relatability shouldn't soften
that into background flavor.

**Real tuition, due at enrollment, gating the course outright if unaffordable:**

| Certification | Tuition | Why |
|---|---|---|
| EMR | **$0** | Covered outright by Northwood PATROL as a recruitment investment in its own volunteers — real, common practice for campus/volunteer squads (see §1.6.3) — which is also why Chapters 1-3 don't feel financially tense yet. |
| EMT | **$1,300** | The first real out-of-pocket cost in the campaign — mid-range of the real $800-1,500 national band. |
| AEMT | **$2,400** | Mid-range of the real $1,500-3,000 bridge-program band. |
| Paramedic | **$9,500** | Mid-range of the real $5,000-15,000+ band — deliberately the campaign's single largest expense, matching §1.6.8's framing as the heaviest gate. |
| ACLS (optional, §1.6.8.2) | **$150** | Real AHA-provider-course range. |
| PALS (optional, §1.6.8.2) | **$200** | Real AHA-provider-course range. |

**Starting money:** `g.money` begins at **$250** — a broke incoming
freshman with a little savings, not nothing and not comfortable. EMR being
free means this doesn't matter yet in Chapter 2; it starts mattering the
moment EMT tuition is on the table in Chapter 4.

**Enrollment is a real gate, not a suggestion:** a player cannot start EMT/
AEMT/Paramedic coursework with `g.money < tuition` for that tier. When
that's the case, the game must offer a real resolution, not silently block
progress — see the loan and scholarship mechanics below, and §1.6.12's
funding-strain incident (which is the DRAMATIC, randomly-timed version of
this same pressure; the tuition gate itself is deterministic and checked
every single time, incident or not).

**Loans/debt — new `g.debt` field.** At any tuition gate, if the player is
short, they can borrow the shortfall (or the full tuition) rather than
delay. `g.debt` accrues no interest (a game-balance simplification, stated
honestly rather than pretending otherwise) but is real, visible, ongoing
pressure: once employed, **15% of every paycheck auto-deducts toward
`g.debt`** until it's paid off, and the player can also make voluntary
lump-sum payments. This is deliberately the mechanic that carries EMS's
famous debt-vs-pay mismatch through the whole back half of the campaign —
a Chapter 9 downtime event referencing a loan payment still going years
into a paramedic's career is exactly the kind of detail real EMS
professionals recognize immediately. Achievement `debt_free` **(new)** —
paid off all debt after having carried it (not awarded to a player who
never borrowed in the first place, since there's nothing to have overcome).

**Employer tuition assistance / scholarships — new `g.serviceCommitment`
field, and the mechanical heart of the Fire-vs-PATROL tradeoff.** Once
employed at a PAYING EMS job (IFT, county 911, Event, or paid city fire —
see §1.6.6 for exactly which employers those are) with enough tenure
(≥15 calls at that job) and reputation (≥15), the employer can offer to
cover AEMT and/or Paramedic tuition — coverage percentage scales with
reputation (`clamp(30 + reputation*0.7, 30, 100)`, §1.6.10), so a
higher-reputation employee gets closer to full coverage. **The cost is a
service commitment**, not free money: accepting it sets
`g.serviceCommitment = {employer, monthsRemaining}` (a real in-fiction
duration, e.g. the equivalent of "two real years," ÷10-compressed per
§1.6.1). Leaving that employer before the commitment is fulfilled converts
the UNSERVED portion, pro-rated, straight into `g.debt` — the real,
well-known EMS "golden handcuffs" arrangement, and a genuine source of
later strategic tension (a Chapter 9/10 player eyeing a flight-medic
transfer or a better-paying agency has to actually reckon with an unpaid
commitment, not just narrate around it). Achievement `golden_handcuffs`
**(new)** — accepted a scholarship. A second, quieter achievement,
`paid_my_own_way` **(new — distinct from §1.6.12's `paying_my_own_way`,
that chapter's part-time-job resolution; this one is the CAREER-long
version)**, for reaching Paramedic certification having never carried
`g.debt` and never accepted a scholarship — a real, harder-mode point of
pride some real EMS providers do also feel.

**This is the mechanical shape of the Fire-vs-PATROL tradeoff the operator
asked for, stated in one place:** Fire (§1.6.4/§3.3) is **unpaid** for as
long as the player stays a volunteer — genuinely $0 income the whole time,
meaning every certification tier past EMR has to be paid out of pocket via
savings, loans, or a non-EMS part-time job (§1.6.12), with **no scholarship
access at all** until/unless the player wins a competitive PAID city-fire
hire (§1.6.6) — but volunteering itself is never competitive: nobody gets
turned away from putting in hours and racking up experience, so the fire
path's real guarantee is uninterrupted ACCESS to progression, not money.
PATROL (§1.6.4/§3.2) pays a real, if modest, wage from Chapter 3 onward, and
the EMT-tier jobs it leads toward (§1.6.6) open real scholarship
eligibility once the player is actually hired somewhere paying — but
getting hired anywhere beyond PATROL itself (especially county 911) is a
genuinely competitive, not-guaranteed process (§1.6.6's three-tier hire
outcome). Neither path is strictly easier; they're easier in DIFFERENT
currencies, which is exactly the tradeoff worth making the player feel.

### 1.6.2.2 Off-duty lifestyle purchases — housing and beyond (operator addition)

Money needs somewhere to go besides tuition, or it stops feeling like a
real resource the moment a player has cleared whatever the next cert gate
costs. This section gives it a second, ongoing purpose: a housing ladder
and a handful of smaller lifestyle purchases, surfaced through the
EXISTING off-duty menu (`OFF_DUTY`, already shipping Rest/Train/Family per
CLAUDE.md's F17 writeup) as new options rather than a separate screen.

**Housing tiers**, each a real, felt step up, gated by `g.money` at
purchase and (past the first upgrade) carrying a recurring cost:

| Tier | One-time cost | Recurring cost | Effect |
|---|---|---|---|
| Dorm (default, Ch.1-ish start) | $0 | $0 | Baseline — no bonus, no drain. |
| Shared apartment | $600 deposit | $60/in-fiction week, auto-deducted like debt (§1.6.2.1) | Rest actions recover 15% more fatigue (a real bed beats a dorm mattress); unlocks a roommate-flavor downtime event pool. |
| Solo apartment | $1,800 deposit | $140/week | Rest recovers 25% more fatigue; unlocks private-space romance scenes (§1.10.3) that a shared living situation can't host believably. |
| Starter house | $8,000 down payment | `g.mortgage` (§1.6.2.1-style deduction, 10%/paycheck, reused formula) | Rest recovers 35% more fatigue, a small standing `morale` bonus (having a stable home base is real, measurable stress relief), and the achievement `first_house` **(new)**. Realistically only reachable Ch.7 onward given the tuition load ahead of it (§1.6.2.1) competing for the same money. |

**A few smaller purchases, same off-duty menu, lower stakes:**
- **A personal vehicle** ($2,500-$6,000 depending on condition, flavor
  choice not a stat-tier) — removes reliance on campus/public transit for
  off-duty activities, and is realistically necessary once the player has
  moved off campus into an apartment/house above.
- **A pet** ($50-150 adoption cost, small ongoing care cost) — a real,
  extremely common EMS coping mechanism worth including for exactly that
  reason; a small standing `morale` bonus and a recurring, low-stakes
  "the pet did something" downtime-event flavor pool. Achievement
  `off_duty_best_friend` **(new)**.
- **A home gym or a proper desk/study setup** ($300-500 each) — a direct,
  permanent small percentage boost to `fitness` or `knowledge` gains from
  the relevant off-duty Train-style activity respectively, giving the
  player a genuine strategic reason to spend savings on themselves instead
  of only ever saving toward the next tuition gate.

**Why this belongs in the design, not just as flavor:** every one of these
pulls directly against the same `g.money` pool tuition and scholarship
service-commitments (§1.6.2.1) already compete for, which is the actual
point. Buying a starter house earlier means slower Paramedic-tuition
savings, a real "do I invest in my life or my career" tension, the kind of
tradeoff EMS professionals describe living with for real. None of these
purchases are required to progress the campaign; all of them are genuine,
optional uses for money that would otherwise just accumulate with nothing
to spend it on once tuition gates are behind the player.

### 1.6.3 EMR Certification (Chapter 2 gate)

**Cost:** $0 — covered by Northwood PATROL as a recruitment investment
(§1.6.2.1). This is deliberate: it's the one tier in the whole ladder where
money genuinely isn't a factor, which is exactly why Chapter 4's EMT
tuition should land as a real, first-time gut-punch rather than "more of
the same."

**Prerequisite:** enrolled via Ch.1's end-of-chapter push (player accepts or
delays; delaying just re-offers the prompt after a few more shifts, per the
existing shipped text — no penalty for waiting, since plenty of real PATROL/
campus-safety volunteers never go further, and that's a legitimate choice,
not a failure state).

**Course structure (in-fiction, ~6 weeks compressed):** lecture VN segments
interleaved with hands-on skill checks (CPR/AED, bleeding control, splinting,
recovery position, OPA insertion once the course reaches airway week). This
matches EMR's real scope ceiling almost exactly — EMR nationally does NOT
include IV access, medication administration beyond a short defined list
(oxygen, oral glucose in many states, epinephrine auto-injector and naloxone
in an increasing number of states, aspirin for suspected ACS in some), or
advanced airways. The course should not teach the player anything EMR scope
doesn't actually cover — a skill taught here and then locked out at Ch.3
would read as a broken promise.

**The exam, in full:**
- **Field component:** 5 EMR-scope simulation scenarios, drawn from a
  dedicated `EMR_EXAM_POOL` (a subset of the existing scenario library
  filtered to Layperson/EMR-completable — the same scope-gate logic
  `why()` already uses). Average score across all 5 must be ≥70%.
- **Written component:** 5 multiple-choice questions, VN-style, covering
  scene safety, BSI/PPE, basic anatomy/physiology terminology, the
  EMR scope-of-practice boundary itself (a question that presents a
  borderline scenario and asks "is this within your scope," because
  knowing the EDGE of your scope is the actual EMR competency being
  tested), and one CPR/AED ratio-and-sequence question. Pass mark 4/5.
- **Weighting:** field score counts double the written score in the
  combined pass/fail (70/30 split) — this mirrors NREMT's own emphasis on
  psychomotor competency over pure recall at the EMR/EMT tiers, where the
  cognitive exam gets proportionally more decisive at the Paramedic tier
  (see §1.6.8).

**Passing:** EMR certification, `knowledge +5`, `confidence +5`,
`reputation +10`. Achievement `moving_up`. Unlocks Ch.3.

**Failing (first attempt):** `reputation -3`, `knowledge -1` (the "you
thought you were ready and weren't" hit), a 24-hour in-fiction remediation
period (one skipped shift, narrated as a study weekend), then automatic
re-enrollment for a retake — mirrors the real short mandatory wait before a
first NREMT retake.

**Failing twice:** the remediation period extends (narrated as "a few more
weeks," a longer time-skip with 2 extra fatigue and a `reputation -2` stack),
and — per the operator's own resolution of this ambiguity — the player is
**not** locked out. They keep working PATROL shifts at EMR-in-training level
(still Layperson scope in practice), can keep retaking indefinitely, and the
game does not force a bad ending here. This deliberately does NOT match real
NREMT's hard attempt cap (most states require a full remediation course after
3 failed cognitive attempts) — the design reasoning, stated honestly rather
than glossed over: a hard lockout this early would either force a second
scripted bad ending nobody asked for, or require building a whole remediation-
course side-track for a single gate. The cost is reputation and time, not a
game over. `needsRemedialTraining()` (already in `campaign.js`, currently a
stub gated on `reputation <= -20`) is the natural hook for a visible warning
banner once reputation drifts that low from repeated failures — still just a
warning, not a forced consequence, consistent with how it's scoped today.

**A realistic texture note for whoever writes the exam scenario pool:** real
EMR/EMT students' most common practical-exam failure isn't a missed
diagnosis, it's a missed **scene-safety or BSI step done out of order** (glove
before touching the patient, scene safety stated before approach) — automatic
failure on the NREMT psychomotor rubric regardless of everything after. The
EMR exam's scoring should weight the *first two actions taken* in each
scenario, not just the outcome, so a player who nails the physiology but
skips gloves still visibly loses points — teaching the actual habit, not
just the actual medicine.

### 1.6.4 Chapter 3 Path Choice (not a certification gate, but load-bearing)

Staying with Northwood PATROL as a certified EMR and Volunteer Fire are **not** two versions of the same
content re-skinned — they diverge in a way real campus EMS/fire dynamics
actually do:

- **PATROL path** stays inside the university's own employment structure. It is
  the one path in the whole campaign that pays the player directly
  (`g.money` accrual per shift, distinct from the unpaid-volunteer framing of
  the Prologue) — realistic, since many campus EMS/PD-adjacent safety
  positions are genuinely paid student jobs, unlike most collegiate EMS
  squads which are volunteer. This is the path that leads, via Ch.5's
  employers (§1.6.6), toward real income and eventual scholarship
  eligibility (§1.6.2.1) — but every one of those employers, county 911
  above all, is a genuinely competitive hire, not a guarantee.
- **Fire path** is unpaid (volunteer fire departments overwhelmingly are,
  nationally — this is not a simplification, it's the actual norm) but
  opens the fire-service career track: NFPA 1001 Firefighter I/II content is
  explicitly NOT simulated (this campaign is an EMS simulator, not a fire
  simulator — trying to model interior attack would be its own engine), but
  the volunteer department membership itself becomes the gateway to the
  **Fire EMT-level entrance exam** referenced in Ch.5 (50% base chance +
  reputation scaling + its own written/practical gate, per the operator's
  addition), because fire-based EMS hiring in the real U.S. very commonly
  does favor internal volunteer/paid-on-call candidates over open-pool
  applicants — a real, well-documented hiring pattern, not an invented
  advantage. This is the path with the real guarantee, just not a financial
  one: chronic volunteer understaffing means nobody who shows up and trains
  gets turned away, so a Fire-path player can always keep serving and
  racking up genuine call experience without ever facing a competitive
  rejection — they just do it for $0 the entire time, self-funding every
  certification tier past EMR out of savings, loans, or a side job
  (§1.6.2.1/§1.6.12), with no employer scholarship in reach unless and
  until they separately win a PAID city-fire hire (§1.6.6) — which, unlike
  volunteering itself, IS competitive.

**Stated plainly, since this is the tradeoff the whole fork exists to
teach:** PATROL trades a harder, genuinely uncertain hiring ladder for real
money and a shot at someone else paying for AEMT/Paramedic school. Fire
trades certain, always-available experience for a self-funded ladder with
no financial safety net until a competitive paid hire finally lands. Both
are real, common EMS on-ramps; neither is the "correct" choice, and the
fork scene (§3.1) should let the player feel BOTH costs plainly rather than
making one path read as obviously better.

This choice should be framed to the player as genuinely irreversible for a
long stretch (it locks `g.chapter3Path` for the rest of the campaign's
early-career content) but not permanently — Ch.5's "switching paths" already
allows a 911/IFT/Event pivot later, and a PATROL-path player can still volunteer
for fire on the side once EMT-certified, the same way real people do
(a huge fraction of volunteer firefighters hold day jobs elsewhere,
including full-time EMS jobs).

### 1.6.5 EMT Certification (Chapter 4 gate)

**Cost:** **$1,300** (§1.6.2.1), due at enrollment — the first tuition the
player actually has to find the money for. Blocked if `g.money < 1300`
unless the player takes a loan (`g.debt`) or the funding-cut incident
(§1.6.12) is resolved some other way; no scholarship exists at this tier
(too early — no employer relationship yet to sponsor one).

**Prerequisite:** EMR certified, some number of Ch.3 shifts completed (path-
dependent — PATROL promotions or fire department seasoning, whichever track).

**Course structure:** longer than EMR (the ~150-190 hour gap is real and
worth narrating explicitly — Ch.4's opening VN should have a classmate
remark on how much longer this program is than EMR, a genuine, common piece
of student small talk). Adds: OPA/NPA, BVM with supplemental O2, suction,
epinephrine auto-injector, oral glucose, aspirin for suspected ACS, nebulized
albuterol assist (patient's own prescribed inhaler/nebulizer in most states),
naloxone (increasingly EMT-scope nationally), spinal motion restriction per
current selective-immobilization protocols (not blanket backboarding — a
real, relatively recent shift in EMS practice worth teaching accurately
rather than the outdated "backboard everyone" version), splinting/traction,
and — critically — a first real exposure to **12-lead ECG acquisition**
(not interpretation, which stays a Paramedic-tier skill; EMTs in many systems
are trained to acquire and transmit a 12-lead even though interpreting it
isn't in scope, a real and slightly ironic detail worth including because
students find it memorable).

**The exam, in full:**
- **Field component:** 5 EMT-scope scenarios, ≥85% average — a meaningfully
  higher bar than EMR's 70%, matching the real jump in psychomotor rigor
  between the two NREMT exam levels.
- **Written component:** 5-question quiz, now covering pharmacology basics
  (the five rights of medication administration), 12-lead acquisition
  procedure (not interpretation), and a spinal-motion-restriction
  decision-tree question (mechanism + reliable exam vs. not) — this is
  deliberately the first written question in the whole ladder that requires
  a *clinical decision tree*, not just a fact, foreshadowing how much more
  decision-heavy the AEMT/Paramedic quizzes get.

**Passing:** EMT certification, `knowledge +10`, `confidence +5`,
`reputation +15`. Achievement `the_patch`.

**Failing:** same escalating-remediation shape as EMR (§1.6.3's mechanics,
scaled — a "remediation semester" on a second failure, matching the
operator's own framing, with proportionally larger fatigue/reputation cost
since this is a longer, more expensive course to redo in real terms).

### 1.6.6 Employment: IFT, 911, or Event EMT (Chapter 5)

This is the first chapter where the game should make the player feel the
**actual labor-market reality of entry-level EMS**, which is blunt: 911
seats are competitive and IFT is the overwhelming on-ramp for new EMTs
nationally, not a lesser option — it's how most new EMTs build the call
volume and comfort that make them competitive 911 hires later. The design
should never frame IFT as a "consolation prize" in its own text, even though
the player's inner monologue can express that frustration if the writing
wants that beat (a realistic, common new-EMT feeling worth including
honestly).

**The employers, named (operator addition — a real roster, no real-world
names).** Each job type in this chapter has a genuine ownership structure
behind it, per explicit operator direction — IFT and Event are **private**,
911 is **county**, and career fire is **city** — because who signs the
paycheck changes how competitive hiring is, how stable the job is, and
whether scholarship money is realistically on the table:

- **Crosswind Medical Transport** — a private, for-profit interfacility
  transport company; the campaign's default IFT employer. Reliable,
  unglamorous, chronically hiring.
- **Kestrel Ridge Medical Transport** — a private IFT competitor, worth naming
  purely as background texture (a line of dialogue warning the player off
  them, or a downtime event about a friend who works there) — flashier
  marketing, a well-known-in-fiction reputation for high turnover. Never a
  playable employer, just makes the private-IFT market feel like a market.
- **Hearthside Care Transit** — a second private IFT competitor, the
  opposite flavor: small, slow-paced, older near-retirement crews, lower
  pay than even Crosswind. Same purpose as Kestrel Ridge, texture, not a
  second playable path.
- **Northwood County EMS** — the county-government 911 provider (§5.3's
  own text already names it); the campaign's 911 employer. Government
  hiring realism applies here directly: a genuine competitive process
  (§1.6.6's three-tier exam), civil-service-flavored stability once hired,
  and — per §1.6.2.1 — realistically the strongest scholarship program in
  the roster, since government EMS agencies investing in their own future
  medics is a real, well-documented practice. A neighboring county's
  agency, **Thistlewood County EMS**, can be named in passing (mutual aid,
  inter-agency rivalry banter) without ever being playable.
- **EventMed** — a private event-medicine company (§5.4's own text already
  names Jenna's company); the campaign's Event employer.
- **Marquee Event Medical** — a private Event competitor, texture
  only, the more corporate/festival-circuit-focused counterpart to
  EventMed's presumably scrappier operation.
- **City of Northwood Fire-Rescue** — the CITY-government career fire
  department, distinct from the unpaid **Northwood Volunteer Fire Company**
  (Engine 42, §3.3) — this is who the Ch.5 "Fire-track equivalent" entrance
  exam below is actually applying to. Real career-fire hiring is famously
  competitive nationally (many applicants per opening) even with the
  volunteer-department internal-candidate advantage §1.6.4 already
  establishes — worth keeping that tension rather than making a paid fire
  job feel automatic once volunteering.

**IFT (Interfacility Transport):** always accepted, no exam — real, since
IFT services are chronically understaffed and hire almost anyone certified.
`g.iftCalls` increments per shift. Calls are non-emergent (nursing-home
transfers, dialysis runs, discharge transports, hospital-to-hospital
transfers of stable patients) — genuinely lower acuity, but real teaching
value: bedside manner, documentation discipline (a stable-patient PCR is
still a legal document), time management across a full shift of back-to-back
transports, and — a detail worth including for relatability — the reality
that IFT is often where new EMTs learn to manage boredom and fatigue on
overnight shifts, a distinct skill from acute-call adrenaline management.

**911 (emergency ambulance):** gated on a real entrance exam simulation
(a scored high-acuity scenario set, not just a quiz), modified by:
- **`g.emrCalls`** — a new, distinct counter from `g.calls911` (which only
  starts once actually HIRED at the 911 tier — see §1.6.6's job-tracking
  note below), tallying every call the player ran as an EMR back in
  Chapters 1-3 (PATROL and/or volunteer-fire calls, whichever the
  `g.chapter3Path` fork produced). This is the operator's "successful EMR
  calls also help" — real credit, but at **half the per-call weight** of
  `g.iftCalls`/`g.eventCalls` below (§1.6.10's formula), since EMR-tier
  exposure is genuinely lower-scope and lower-acuity than either — a hiring
  panel values it, but not as much as an EMT already running IFT or event
  transports at full EMT scope,
- `g.iftCalls` if the player did IFT first,
- `g.eventCalls` if the player did Event first,
- `g.reputation`,
- a hidden base competitiveness roll representing the labor market itself
  (911 seats being genuinely scarce even for qualified candidates is real
  and worth keeping, not smoothing away).

**Job-call counters, named precisely (so a future implementer isn't left
guessing which counter is which):** `g.emrCalls` (Ch.1-3, EMR scope — feeds
the 911/fire entrance formulas below AND, per §1.6.8.1's revision, the
paramedic-admission formula too, but at a deliberately tiny weight there —
"barely counts," not "doesn't count"), `g.iftCalls`, `g.eventCalls`,
`g.calls911` (starts at zero on the day the player is actually HIRED
911 — pre-hire EMR experience is `emrCalls`, not a head start on this
counter), and `g.aemtCalls` (starts at zero on AEMT certification, tallies
any call run at AEMT scope regardless of job type — the single
highest-weighted call counter in the paramedic-admission formula, §1.6.10).
Keeping these five separate, rather than collapsing "calls" into one
number, is what makes both this section's formula and §1.6.8.1's
paramedic-admission formula honest about which experience actually counts
toward which gate, and by how much.

Three outcomes: **immediate hire** (top band), **conditional hire** (middle
band — explicit written feedback: "come back with N more IFT/Event calls,"
giving the player a concrete, fair target rather than a vague rejection),
**rejected** (bottom band — can reapply after more experience, no permanent
lockout). This three-tier structure is itself realistic: real EMS agencies
very commonly issue conditional offers pending experience, not just binary
accept/reject.

**Event EMT:** part-time, base 80% acceptance + reputation scaling (per the
operator's addition) — real, since event medicine (stadiums, concerts,
festivals) is chronically short-staffed and often accepts newer EMTs
specifically because acuity is lower and a full-time EMS partner or standing
orders/medical control backstop is usually present. Can combine with IFT
(both part-time-compatible) but not 911 (911's full-time/on-call demands are
realistically incompatible with a second EMS job in most systems, and this
exclusion should be stated to the player plainly when they try, not silently
blocked).

**Fire-track equivalent (operator addition):** if the player volunteered
fire in Ch.3, a parallel entrance exam to **City of Northwood Fire-Rescue**
exists: 50% base acceptance + reputation scaling + its own written/
practical gate, modeled identically to the EMT 911 exam's three-tier
structure but keyed to `g.chapter3Path==="fire"` and the volunteer
department's own internal-hire advantage named in §1.6.4. This is the
ONLY route to a paid fire-service wage or fire-employer scholarship
eligibility (§1.6.2.1) — continuing to volunteer at Northwood Volunteer
Fire Company without ever attempting or winning this exam is a fully valid,
even common, choice, but it means staying at $0 EMS income indefinitely.

**Pay differential (operator addition — IFT pays less than 911).** This
matters enough to state as its own rule rather than leave implicit, because
it's one of the most consistently-cited real EMS pay facts and should be
felt in `g.money`/`shiftPay`, not just mentioned in dialogue:

- **IFT pays the least** of the three, and should — private interfacility
  transport is well-documented nationally as the lowest-paying tier of EMS
  work, which is exactly why it functions as the accessible on-ramp rather
  than a competitive one.
- **911 pays meaningfully more** — roughly 1.3-1.6x IFT's per-shift rate in
  a private/third-service system, and **fire-based 911** (if the player's
  `g.chapter3Path==="fire"` volunteer standing converted into a paid fire-EMT
  hire per §1.6.6's fire-track exam) pays more again — commonly 1.8-2.2x
  IFT, reflecting fire-based EMS's real, well-documented compensation and
  benefits advantage over private-sector EMS in most U.S. regions.
- **Event EMT pays a reasonable hourly rate but is inconsistent/part-time**
  — no guaranteed shift volume, no benefits, so total EARNED income across a
  chapter should land lower than steady IFT despite a comparable or even
  higher per-shift rate, which is itself a real, common event-medicine
  complaint worth the game reflecting honestly rather than just naming.

**Concrete per-shift figures**, anchored to §1.6.2.1's tuition table so the
player can feel exactly how much grinding each tuition tier actually costs
in shifts worked, not just an abstract multiplier:

| Employer | Per-shift pay | Shifts to cover EMT ($1,300) | Shifts to cover AEMT ($2,400) |
|---|---|---|---|
| Northwood PATROL (PATROL, §3.2) | $80 | 17 | 30 |
| Crosswind (IFT) | $120 | 11 | 20 |
| Northwood County EMS (911) | $170 | 8 | 15 |
| City of Northwood Fire-Rescue (paid) | $240 | 6 | 10 |
| EventMed (Event) | $145/shift, ~0.6x frequency (effective ~$87/week-equivalent) | slowest of the four working options |

(Volunteer Northwood Volunteer Fire Company: **$0** — not in this table
because it isn't income, which is the entire point of §1.6.2.1/§1.6.4's
tradeoff.) These are per-shift, not per-hour, matching how `g.money`/
`shiftPay` already accrue elsewhere in the game — `shiftPayMultiplier`
(§1.6.10) is IFT-baselined `1.0` for exactly this $120 figure, so a future
implementer can derive every other number in this table from that one
constant rather than hardcoding five separate values.

Note how far short even fast, focused grinding falls of Paramedic's
$9,500 — at City Fire-Rescue's best-in-roster $240/shift, that's ~40
shifts of pure saving with zero other expenses, which is exactly why
§1.6.2.1's loan and scholarship mechanics exist rather than being optional
flavor: for most playthroughs, reaching Paramedic tier without touching at
least one of them isn't realistic, and the game shouldn't pretend
otherwise.

**Switching paths:** explicit, always available, not a one-time choice —
`g.calls911`/`g.iftCalls`/reputation feed the same 911-exam formula whenever
re-attempted, so a player who started IFT and later wants 911 is neither
punished nor given a discount past what their accumulated calls honestly
earn.

### 1.6.7 AEMT Certification (Chapter 6 gate)

**Cost:** **$2,400** (§1.6.2.1). This is the FIRST tier where an employer
scholarship (§1.6.2.1) can realistically apply, since it's the first cost
incurred after the player has had time to actually build tenure/reputation
at a paying employer (§1.6.6) — a meaningful, felt payoff for having chosen
PATROL→EMT-job over Fire, if the player did.

**Prerequisite:** EMT certification in good standing + supervisor
recommendation, gated on `reputation > 10` — a genuinely lower bar than
Paramedic's medical-director recommendation (§1.6.8), matching AEMT's real
position as a shorter, more accessible bridge cert rather than a fully
separate program.

**Course structure:** the bridge curriculum's real content — peripheral IV
and IO access, blood glucose monitoring, a defined medication set (commonly
dextrose, glucagon, naloxone, and in many states nitrous oxide or a limited
nebulized/inhaled set), and supraglottic airway devices (King LT / i-gel
class devices — NOT endotracheal intubation, which stays Paramedic-tier;
this boundary is one of the more commonly *misunderstood* real scope lines
and is worth the game stating explicitly rather than blurring, since a
player who's absorbed "AEMTs can manage advanced airways" as true-but-vague
should come away knowing exactly which device class that means).

**Workplace friction (operator's "Shitty Supervisor subplot" applies here
directly):** many AEMT bridge students are already working full-time EMTs
trying to schedule night/weekend coursework around shifts — a genuinely
common, often-cited source of real EMS burnout. A short "office politics"
beat (a supervisor unwilling to accommodate the class schedule, resolved via
confront/comply/appeal exactly like the existing Shitty Supervisor mechanic)
belongs here rather than being invented as new machinery.

**The exam:** same two-component shape as EMT (field scenarios + written
quiz), now testing IV/IO psychomotor skill directly (a scenario cannot be
"passed" without successful vascular access attempted in the correct
priority order) and adding a pharmacology-calculation question to the
written component (a weight-based dose calculation — AEMT's medication set
is small but this is exactly where dosage-math competency starts mattering
for real, and it's a notoriously common real failure point worth reflecting).

**Passing:** AEMT certification, `knowledge +15`, `reputation +20`.
Achievement `advanced`.

### 1.6.8 Paramedic Certification (Chapter 8 gate)

**Cost:** **$9,500** (§1.6.2.1) — the single largest expense in the
campaign, gating enrollment outright same as every other tier, but this is
the tier where §1.6.2.1's scholarship system is realistically meant to
carry real weight: a player who's spent Chapters 5-7 building tenure and
reputation at Northwood County EMS, Crosswind Medical Transport, EventMed, or City of
Northwood Fire-Rescue should walk into this chapter with a genuine shot at
substantial employer coverage, while a Fire-volunteer player who never won
a paid hire faces this number entirely out of pocket. This is the single
biggest number the whole Fire-vs-PATROL tradeoff (§1.6.4) was built to lead to.

This is the campaign's heaviest gate and should be written to feel like it —
real paramedic programs are the first tier that functions like an actual
degree program (often an accredited associate's degree or certificate,
commonly CoAEMSP-accredited in the real system), with three distinct
components the campaign should model as three distinct beats, not one exam:

1. **Didactic/classroom** — advanced pharmacology, 12-lead *interpretation*
   (the missing half of what EMT only acquired), cardiology, advanced
   airway (endotracheal intubation, surgical/needle cricothyrotomy as a
   last-resort skill), OB/peds emergencies at depth, toxicology, and
   incident command basics.
2. **Clinical rotations** — hospital-based, typically ED, ICU, L&D/OB, and
   an OR/anesthesia rotation specifically for supervised live intubations
   (this is real and a famous rite of passage in paramedic education —
   students commonly need a set NUMBER of successful live intubations,
   not just simulated ones, before the program will sign off). A psych
   rotation is also common. Each rotation should be its own short VN beat
   with a preceptor character (drawn from the name pool), not folded into
   generic "clinical time passed" text.
3. **Field internship** — a preceptor paramedic (an FTO-equivalent role,
   NOT the same character as a hospital clinical preceptor) evaluates the
   player across a defined number of team-lead calls, with a real
   competency checklist the player can see building (this is the natural
   home for a genuine field-training-officer evaluation UI element,
   distinct from the exam scoring elsewhere in the game).

#### 1.6.8.1 Admission — a probability, not a flat gate (operator revision)

The original design treated AEMT + a call-count floor + a recommendation as
a hard AND-gate. Per explicit operator revision, admission is now a
**probability roll**, and AEMT is the single biggest lever pulling that
probability up but is **no longer a strict prerequisite** — a player can, in
theory, apply straight from EMT and skip Chapters 6-7 entirely. This is
realistic in spirit even where it takes a liberty: real paramedic programs
do occasionally admit straight-EMT applicants with an unusually strong
record (heavy 911 call volume, strong references, a clean entrance-exam
performance), even though AEMT-first is by far the more common and more
reliable on-ramp — which is exactly why the odds below are stacked so
heavily in AEMT's favor without making EMT-only a hard impossibility.

**Eligibility floor to even submit an application (unchanged in spirit,
lowered in number since the real gate is now the probability roll, not
this floor):** EMT certification, and a modest minimum experience floor —
`paramedicApplicationFloor(calls911, aemtCalls, iftCalls, eventCalls) >= 15`
using the same half-weight IFT/Event blending as before (§1.6.10) — just
enough to establish the player has actually been working, not a
meaningful gate on its own anymore.

**The actual admission decision** is `paramedicAdmissionChance(...)`
(§1.6.10, in full) — a single formula combining reputation, certification
tier, calls (weighted very differently by both TIER and, within EMT tier,
by JOB TYPE — see below), optional certifications (§1.6.8.2), the entrance
exam (below), and the advocate system (§1.6.8.3). Base value, with every
other input at zero, is a genuinely discouraging **0.5%** — nobody reaches
Chapter 8 with literally nothing else going for them, so this floor is
mostly there to make the formula honest at its own extremes, not something
a real playthrough will ever be evaluated at.

**Certification tier is the single largest lever:** EMT is the formula's
baseline (contributes nothing extra); **AEMT contributes a huge flat jump**
(+35 of the formula's 0-to-clamped-97 range — see §1.6.10) — reflecting how
much more a real admissions committee trusts a candidate who's already
demonstrated advanced-scope competence. An EMT-only applicant CAN still
reach a competitive chance, but only by stacking every other lever hard
(reputation, exam score, optional certs, an advocate) — the formula is
built so that's possible, not so that it's easy.

**Calls, weighted by both tier and job type, matching the operator's exact
spec:** past `g.emrCalls` barely count at all (a tiny per-call coefficient,
capped low); EMT-tier calls count for real but differently by job —
`g.calls911` (real 911 exposure) counts far more per call than `g.iftCalls`
or `g.eventCalls`; and `g.aemtCalls` (calls run while AEMT-certified, any
job) are weighted much better than any EMT-tier call, reinforcing the same
"AEMT is the strong path" signal the flat certification bonus above
already sends. Full coefficients and caps in §1.6.10's `callScore` formula.

**The entrance exam** (renamed and formalized from the original "admission
interview" — this is now a real scored component, not flavor-only): a
moderate scenario battery plus a short written/reasoning component,
structurally similar in shape to the EMT/AEMT exams (§1.6.5/§1.6.7) but
explicitly NOT pass/fail — its score feeds `paramedicAdmissionChance`
directly (§1.6.10's `entranceExamScore` term). The player's `confidence`/
`ambition` stats should still visibly color how the accompanying interview
VN scene reads, as originally specified, but the mechanical weight now
comes from the scored scenario/written components sitting alongside it,
not from the interview's prose alone.

**Rejection is not permanent.** If the roll fails, the player can reapply
after accumulating more of any of the above (more calls, a higher
reputation, a new optional cert, a stronger advocate relationship, or —
the highest-leverage single move available — going and getting AEMT if they
hadn't already) — matching this document's standing "no permanent
lockouts" pattern for every other exam/gate. A short in-fiction cooldown
(a handful of additional shifts, not a hard time-lock) between attempts
keeps this from being trivially rapid-fire re-rolled.

**A dedicated, rare achievement for the theoretical path:** `straight_to_medic`
**(new)** — admitted to paramedic school without ever certifying AEMT. This
should be genuinely hard to earn given the formula's weighting, which is
the point — it's meant to read as an impressive outlier result, not a
routine alternate route.

#### 1.6.8.2 Optional certifications — ACLS, PALS, and beyond (new)

A real, common thing working EMTs/AEMTs actually do to strengthen a
paramedic-school application before they're even eligible for the program
itself: sitting for AHA (or equivalent) provider-level certifications ahead
of schedule. Two are named explicitly per the operator's spec, with the
system built to extend cleanly to more later:

- **ACLS (Advanced Cardiovascular Life Support)** — cardiac arrest and
  peri-arrest dysrhythmia algorithms, standard for ED/ICU staff and
  paramedics, but genuinely obtainable earlier by a motivated EMT/AEMT.
- **PALS (Pediatric Advanced Life Support)** — the pediatric-arrest/
  emergency equivalent.
- *(Extensible slots for later, real and equally plausible: PHTLS/ITLS
  for trauma, NRP for neonatal resuscitation — not built now, but the
  system below should be data-driven enough that adding one is a content
  addition, not an engine change.)*

**Mechanically:** available any time from Chapter 4 onward (EMT-certified),
via a short optional course-and-test beat reusing the existing
practice-scenario machinery (§1.6.11) rather than inventing new
infrastructure. Each has a real, grounded cost — `money` (AHA provider
courses genuinely cost roughly $80-150 in real life; keep that texture,
don't make it free), a modest `fatigue`, and a short in-fiction time cost
per §1.6.1's ÷10 rule (a day or two) — and grants a small permanent
`knowledge` bump plus membership in a new `g.certifications` set, which
`optionalCertScore` (§1.6.10) reads directly. Achievements `acls_provider`
**(new)** and `pals_provider` **(new)**.

#### 1.6.8.3 The advocate system — who ends up writing your recommendation (new)

The original spec's "medical director recommendation... Dr. Okonkwo or Dr.
Patel" is replaced with something with real per-playthrough variance, per
the operator's explicit request: the medical director isn't a fixed
character — **who holds that role is randomly drawn, once per campaign**,
from a pool of plausible real-world advocate archetypes, filtered to only
the roles this specific playthrough could actually have produced a
relationship with:

- **ER physician** — drawn from the game's existing recurring hospital
  staff roster (a Medical Director + ER roster already exists in the game
  per prior front-end work — reuse it rather than inventing a new
  character), met through hospital hand-offs and hospital-adjacent
  downtime content. Always eligible, regardless of path.
- **Fire chief/supervisor** — only eligible if `g.chapter3Path==="fire"`;
  the volunteer department's own chief (Chief Alvarez, named in Ch.3).
- **Current job supervisor** — the 911/IFT/Event job's own supervising
  figure from Ch.5-7, a NEW relationship id (`job_supervisor`) distinct
  from the campus-era `partner_patrol`/`supervisor`.
- **A course instructor** — reuses the EXISTING `instructor` relationship
  id (Ch.2/4/6's classroom instructors), rather than inventing a new one.
- **Explicitly excluded:** `shitty_supervisor` (Lt. Kozlov). Even at a
  decent relationship value he should never functionally read as a
  proponent — nobody wants Kozlov's letter, and that's consistent
  characterization, not an oversight.

**The random draw happens once, narratively placed in Chapter 7** (late
enough that most of the pool has had a real chance to become a relationship,
early enough to matter before Chapter 8's admission math starts getting
checked). Whichever role is drawn becomes, in-fiction, "the medical
director of the paramedic program" — a genuine surprise reveal worth its
own short scene (the player finding out, for instance, that their own fire
chief or a familiar ER doc from a dozen transports is the person whose
signature matters most).

**Only if the player has actually "befriended" this person** — a real
friendship threshold, not a continuous bonus starting from zero — does the
relationship contribute to `paramedicAdmissionChance` (§1.6.10's
`advocateBonus`). Below the threshold, the relationship contributes
nothing extra to admission (it can still matter for its own normal
relationship-system reasons). **Any OTHER pool role the player also has a
strong relationship with** contributes a smaller secondary bonus, capped —
representing supplementary letters of recommendation, and the reason the
operator's "etc etc for whoever else could be a large proponent" gets
honored as more than just the one randomly-chosen person.

**The exam gauntlet:** the campaign's largest single exam, matching real
Paramedic NREMT's own step-up in rigor — a longer field-scenario battery
(high-acuity: cardiac arrest with team-lead responsibilities, pediatric
drowning, multi-casualty triage) weighted more heavily toward the *written*
component than any prior tier (this mirrors the real emphasis shift — the
Paramedic cognitive exam is longer and more clinically reasoning-heavy than
EMR/EMT/AEMT's), including differential-diagnosis-style questions (present a
vignette, ask for the most likely field impression) rather than pure recall.

**Failing:** repeating the field internship specifically (not the whole
program) — this is realistic; students who don't pass their field internship
capstone in real paramedic programs are far more commonly required to
extend/repeat internship hours than to redo classroom coursework, so the
retry cost should hit `fatigue` and time (a real in-fiction number of
additional shifts) rather than reputation alone, and should NOT force the
player to re-sit clinical rotations already completed.

**Passing:** Paramedic certification, `knowledge +20`, `confidence +10`,
`reputation +30`. Achievement `gold_patch`. The open world unlocks (Ch.9).

### 1.6.9 Post-Paramedic

No forced ending. Sandbox-style continuation with all of Chapters 9-10's
content layered on top, matching the operator's own framing exactly — this
section exists in the doc mainly to record WHY that's the right call rather
than to add new mechanics: real paramedic careers don't have a narrative
"end," and forcing one here would misrepresent the actual shape of the job
this campaign is built to be relatable about.

### 1.6.10 Exam scoring & progression formulas (implementation-facing)

Stated as formulas, not prose, so a future batch can implement directly —
consistent with this project's "identify numbers, do not tune them" ethos
(CLAUDE.md §4): every constant below is picked to match a stated real-world
proportion (pass-rate bands, weighting ratios named in §1.6.3-1.6.8), not
tuned blind to make a test pass.

```
examFieldScore(scenarioResults)   // scenarioResults: array of 0-100 per scenario
  = average(scenarioResults)

examCombinedScore(fieldScore, writtenCorrect, writtenTotal, fieldWeight)
  = fieldScore * fieldWeight + (writtenCorrect / writtenTotal * 100) * (1 - fieldWeight)
  // fieldWeight: EMR 0.70, EMT 0.70, AEMT 0.65, Paramedic 0.55
  //   (the Paramedic exam is the only one where written/cognitive
  //   reasoning outweighs psychomotor score, matching §1.6.8's own
  //   real-world justification)

examPass(combinedScore, passThreshold)
  = combinedScore >= passThreshold
  // EMR 70, EMT 85, AEMT 82, Paramedic 88 — thresholds climb with tier,
  // matching the real, well-documented drop in national first-attempt
  // pass rates as certification level rises

paramedicApplicationFloor(calls911, aemtCalls, iftCalls, eventCalls)
  = calls911 + aemtCalls + 0.5 * (iftCalls + eventCalls)
  // ELIGIBILITY only — must be >= 15 to submit an application at all.
  // This is deliberately a low bar now that §1.6.8.1 replaced the old
  // flat "calls911>=30 OR combined>=60" requirement with the probability
  // roll below; this floor just proves the player has actually been
  // working, not whether they're competitive.

paramedicAdmissionChance(
    reputation, certLevel,              // certLevel: "emt" | "aemt"
    emrCalls, iftCalls, eventCalls, calls911, aemtCalls,
    certifications,                     // set, e.g. {"acls","pals"}
    entranceExamScore,                  // 0-100, §1.6.8.1's entrance exam
    primaryAdvocateFriendship,          // 0-100, or null if not yet met
    secondaryAdvocateFriendships)       // array of 0-100
  = clamp(
      0.5                                             // base — §1.6.8.1's floor
      + reputation * 0.25                              // up to +25 at rep 100
      + (certLevel === "aemt" ? 35 : 0)                 // the huge jump
      + min(callScore(emrCalls, iftCalls, eventCalls, calls911, aemtCalls), 45)
      + optionalCertScore(certifications)               // up to +15 (ACLS+PALS)
      + entranceExamScore * 0.2                         // up to +20
      + advocateBonus(primaryAdvocateFriendship, secondaryAdvocateFriendships),
      0.5, 97)   // never a literal 0% or a literal lock — always some chance

callScore(emrCalls, iftCalls, eventCalls, calls911, aemtCalls)
  = min(emrCalls, 60)   * 0.02   // barely counts, per operator spec — 60 calls
                                 //   (the practical cap) is worth only +1.2
  + min(iftCalls, 40)   * 0.15   // modest — routine, lower-acuity transport
  + min(eventCalls, 30) * 0.2    // modest, slightly above IFT — more
                                 //   presentation variety, occasional real acuity
  + min(calls911, 40)   * 0.5    // real weight — genuine EMT-scope 911 experience
  + min(aemtCalls, 40)  * 1.1    // weighted much better than any EMT-tier call —
                                 //   the same "AEMT is the strong path" signal
                                 //   the flat certLevel bonus above already sends
  // NOTE: raw sum can exceed the +45 cap paramedicAdmissionChance applies —
  // that's intentional. A heavy-aemtCalls applicant should saturate this
  // term easily; the cap keeps ANY single input from single-handedly
  // dominating the whole formula the way certLevel's flat +35 deliberately can.

optionalCertScore(certifications)
  = (certifications.has("acls") ? 8 : 0) + (certifications.has("pals") ? 6 : 0)
    + 4 * (other future certs in the set, e.g. PHTLS/ITLS/NRP — extensible)
  // capped at +15 in practice with just ACLS+PALS; a third future cert
  // should keep the combined total from running away — clamp this whole
  // term at 20 once a third optional cert is actually implemented

advocateBonus(primaryFriendship, secondaryFriendships)
  = (primaryFriendship != null && primaryFriendship >= 40
       ? (primaryFriendship - 40) * 0.4 : 0)      // up to +24 at friendship 100
    + min(15, 5 * count(secondaryFriendships.filter(f => f >= 60)))
      // +5 per additional strong (>=60) relationship among the OTHER
      // advocate-pool roles, capped at 3 counted (+15 max) — §1.6.8.3's
      // "supplementary letters of recommendation"

nine11EntranceScore(emrCalls, iftCalls, eventCalls, reputation)
  = baseRoll(0..100)
    + min(emrCalls, 40) * 0.5   // EMR-tier call volume (Ch.1-3's PATROL/fire
                                 // calls) helps — real assessment reps and
                                 // scene-management exposure a hiring panel
                                 // does value — but at HALF the per-call
                                 // weight of IFT/Event, since it's lower-scope,
                                 // lower-acuity experience than either
    + min(iftCalls, 20) * 1     // diminishing: IFT experience helps but caps out
    + min(eventCalls, 10) * 1
    + reputation * 0.5
  // >=75 immediate hire, 45-74 conditional (states the specific gap the
  // player is short by), <45 rejected, reapply after >=5 more qualifying calls

fireEntranceScore(reputation)
  = 50 (base) + reputation * 0.6 + examComponent(field+written, same shape as EMT tier)

shiftPayMultiplier(jobType)
  = { ift: 1.0, event911private: 1.4, fire911: 2.0, event: 1.2 }[jobType]
  // event's effective per-week income should additionally be scaled by a
  // lower shift-frequency factor (~0.6) wherever weekly/chapter income is
  // aggregated, not just the multiplier above, so "decent hourly but
  // inconsistent" is true in the actual numbers, not just the flavor text

examFailurePenalty(attemptNumber)
  = { reputation: -3 - attemptNumber, knowledge: -1, remediationShiftsSkipped: attemptNumber }
  // escalates per consecutive failure at the SAME tier; resets to 0 once
  // that tier is passed, so an AEMT-exam failure doesn't echo into the
  // Paramedic exam's own failure count later

// ── §1.6.2.1 money formulas ─────────────────────────────────────────────

canEnroll(money, tuition)
  = money >= tuition
  // the hard gate itself — EMR tuition is always 0, so this is always true
  // for EMR regardless of money; EMT/AEMT/Paramedic use their §1.6.2.1 costs

takeLoan(money, tuition, borrowAmount)
  = { money: money + borrowAmount, debt: debt + borrowAmount }
  // borrowAmount can be the full shortfall or the full tuition; no interest
  // (stated as a deliberate game-balance simplification in §1.6.2.1, not a
  // claim about real student-loan interest rates)

debtDeduction(paycheck, debt)
  = { paycheckAfterDeduction: paycheck * 0.85, debtAfter: max(0, debt - paycheck*0.15) }
  // auto-applied to every paycheck once employed AND g.debt > 0; stops
  // deducting the instant debt hits 0 rather than continuing to skim

scholarshipEligible(employer, tenureCalls, reputation)
  = employer != null && employer !== "volunteer_fire"
    && tenureCalls >= 15 && reputation >= 15

scholarshipCoverage(reputation)
  = clamp(30 + reputation * 0.7, 30, 100)
  // percentage of tuition covered; higher reputation buys closer to full
  // coverage, never below 30% once eligible at all, never a guaranteed 100%

recurringDeduction(paycheck, balance, rate)
  = { paycheckAfterDeduction: paycheck * (1 - rate), balanceAfter: max(0, balance - paycheck*rate) }
  // the SAME shape as debtDeduction above, generalized so g.debt (rate
  // 0.15) and g.mortgage (§1.6.2.2, rate 0.10) share one implementation
  // rather than two near-duplicate deduction functions

serviceCommitmentPayback(monthsRemaining, totalMonths, tuitionCovered)
  = tuitionCovered * (monthsRemaining / totalMonths)
  // pro-rated: leaving with the commitment half-served converts half the
  // covered tuition into g.debt; leaving with 0 months remaining (served in
  // full) converts nothing — this is what makes the scholarship a real
  // commitment rather than free money with no downside
```

### 1.6.11 Practice scenarios and knowledge boosts

Every certification chapter's classroom segment should expose a small bank
of **replayable, explicitly zero-stakes** practice scenarios (matching the
final line of the operator's own §1.6: "Every certification step includes
practice scenarios that can be replayed for knowledge boosts"). Mechanically
these are ordinary scenario-engine runs, no different from a Sandbox call,
but flagged `practice:true` so they:
- never touch `reputation`/`calls911`/`iftCalls`,
- grant a small, capped `knowledge`/`confidence` bump on a successful run
  (capped per scenario per chapter, so a player can't infinitely farm one
  easy practice scenario for stats — a real design guard, not a physiology
  concern),
- are explicitly re-offered after an exam failure as part of the
  remediation beat (§1.6.3's "study weekend" narration has a natural,
  concrete gameplay action to point to instead of being pure text).

### 1.6.12 Financial Strain — the Funding-Cut Incident (new)

This is a deliberately common, not-scripted-to-a-fixed-point incident,
because "can I actually afford to keep doing this" is one of the single
most universal real EMS-student experiences, and a document arguing for
relatability shouldn't reduce it to one guaranteed cutscene. It's a rolling
chance checked at the start of Chapters 2, 3, and 4 (the exact window the
operator specified — each one because it lands differently: Ch.2 because it
complicates the Ch.3 path fork before that fork even happens, Ch.3 because
it can collide with the fork directly, Ch.4 because by then it's EMT
tuition on the line and it colors the Ch.5 job choice). It fires at most
once per campaign — the first chapter it rolls true in is the one it plays
out in; if it never rolls true across all three checks, that playthrough
simply never faces it, which is itself honest (not every real student's aid
gets cut).

Trigger chances, checked in order, each only rolled if the incident hasn't
already fired: Ch.2 25%, Ch.3 35%, Ch.4 45% (rising, since the longer a
playthrough goes without hitting it, the more narratively earned it is that
the pressure catches up — and because EMT tuition, the real cost this
incident is grounded in by Ch.4, is genuinely the bigger of the two
figures). Cumulative chance of firing somewhere in the window: ~73%; ~27%
of playthroughs never face it.

The cause is kept flexible for whoever writes the actual scene: a
financial-aid restructuring, a scholarship renewal denied, a work-study
allocation cut, or a family financial-situation change are all real,
common, and equally valid; the document deliberately doesn't pick one,
since the specific cause matters less than the shape of the choice it
forces.

**The three-way choice, identical mechanical shape everywhere it fires:**

1. **Work a part-time job to pay for it.** The safe, slow option. A
   modest, ordinary campus job (dining hall, retail, tutoring —
   deliberately NOT EMS-adjacent, which is part of the point: it's a job
   taken purely for money, not vocation). Costs: a real in-fiction pacing
   delay to whichever course/chapter is current (an extra ~1-2 in-fiction
   days per §1.6.1's ÷10 rule), `fatigue +modest`, `money` accrues to cover
   the gap. No reputation or path risk. Achievement `paying_my_own_way`
   **(new)**.
2. **Drop out of school, work full-time.** The big, permanent-feeling
   choice — framed honestly as a real, common EMS-community story (plenty
   of working paramedics never finished the degree they started, because
   the job took over first), not a failure state. Effects: `money` gain is
   the largest of the three options; `reputation`/`confidence` mostly
   unaffected (this is a pragmatic decision, not a competency one); a
   real, mechanical consequence, not just flavor: it permanently
   forecloses the PATROL branch of the Ch.3 fork if this resolution happens
   in Ch.2 or as part of the Ch.3 scene itself (PATROL is a campus-employment
   role, realistically enrollment-gated — see the Ch.3 interaction note
   below). It does NOT block Fire (a volunteer role, not
   enrollment-gated — the "full-time job" this option represents is
   realistically a non-EMS job taken purely for income, which leaves
   evenings/weekends free to still volunteer fire, a genuine, common real
   pattern). Some campus-specific downtime-event content becomes
   permanently unavailable (the player is no longer living the "college
   student" side of the story) — a real, felt cost, not just a stat.
   Achievement `working_medic` **(new)**.
3. **Try to balance both.** The risky option, resolved by the stat-gated
   roll the operator asked for:

```
balanceBothSuccessChance(ambition, fitness, confidence, fatigue)
  = clamp( 40 + (ambition-10)*2 + (fitness-10)*1 + (confidence-10)*0.5
           - fatigue*0.3,  5, 90 )
  // ambition is the dominant term (drive/grit is the actual real-world
  // predictor here), fitness a secondary stamina factor, confidence a
  // minor coping factor, current fatigue works directly against success —
  // a player who already let fatigue run high going into this incident is
  // genuinely less likely to pull off the balancing act, which is both
  // realistic and a real payoff for having managed fatigue earlier
```

   **Success:** no course delay, a real relief beat, `ambition +2`,
   `confidence +2`. Achievement `burning_the_candle` **(new)**.
   **Failure:** does NOT dead-end the player — triggers a forced follow-up
   scene (a burnout beat: missed a shift, missed a class, something had to
   give) that resolves into a choice between options 1 and 2 above, now
   carrying an added `fatigue` and small `reputation` cost from having
   tried and stretched too thin first. Achievement `stretched_thin`
   **(new)** — framed the same non-judgmental way `wet_behind_the_ears`
   (§1.7) is: a badge for a real, common experience, not a shame marker.

**Per-chapter staging and interaction — the part worth building carefully,
since the same three-way choice should land differently depending on when
it fires:**

- **Fires in Chapter 2:** plays out mid-EMR-school, resolved before the
  Ch.3 fork. Its outcome then colors HOW the Ch.3 fork scene is written:
  if "drop out" was chosen, the fork scene should say so explicitly —
  {supervisorName}'s "PATROL or stay with fire" framing changes to
  acknowledge PATROL isn't available to a non-enrolled player, and should say
  WHY (a campus job realistically requires current enrollment) rather than
  silently graying out an option. If "part-time job" or a successful
  "balance both" was the resolution, the fork proceeds normally, but
  should still surface the financial context lightly — PATROL's real
  paycheck (§1.6.4) is worth naming out loud as the financially safer
  pick, without forcing it.
- **Fires in Chapter 3:** the highest-tension placement, per the
  operator's own note — the funding letter and {supervisorName}'s PATROL/Fire
  question should land in the SAME scene, not two separate beats. Choosing
  "drop out, work full-time" here effectively resolves the fork
  simultaneously: it reads as the player choosing an outside full-time job
  over the campus PATROL role on the spot, foreclosing PATROL for the same
  enrollment-gated reason above, while still leaving Fire open (the
  volunteer, non-enrollment path) — a financially-strained player who
  still wants the Fire story can have it, just not PATROL. "Part-time job" or
  "balance both" leave the fork open and unforced, just emotionally
  weighted by the letter arriving at the same moment.
- **Fires in Chapter 4:** the Ch.3 fork has already resolved by now, so
  there's no path-availability consequence — instead this occurrence is
  framed around real EMT tuition specifically (the bigger of the two
  course costs named in §1.6.2's table), and its resolution should color
  Chapter 5's job choice directly: a player who just took on a part-time
  job or dropped out for income reasons is realistically primed to want
  guaranteed, immediate income, which is precisely where §1.6.6's new
  IFT-pays-least-but-is-always-accepted framing should get an explicit
  callback — a financially-strained player choosing IFT specifically
  BECAUSE it's the sure thing, despite knowing it pays the least of the
  three options, is a real, bittersweet, well-worn EMS story, and the
  Ch.4→Ch.5 connective text should say so plainly rather than leaving the
  player to infer it.

Regardless of which chapter it fires in, a resolved incident should keep
echoing lightly afterward through the existing §1.8.2 "financial-reality"
downtime-event category (a lunch-money joke, a tuition-for-the-next-tier
conversation) — the hard three-way choice itself fires once, but the
financial-reality texture it establishes doesn't have to disappear.

---

## 1.7 Achievements

Expanded beyond the operator's original list — new entries are marked
**(new)**; all IDs follow the existing snake_case convention from
`achievements.js`. Grouped by the milestone they mark, since a flat
alphabetical list undersells how these cluster around the ladder in §1.6.

**Prologue (existing, unchanged):**
`ems_wannabe`, `not_so_ems`, `booooo`, `really_not_feeling_it`,
`normie_ending`, `first_call_jitters`, `a_shift_to_remember`.

**EMR tier:**
- `moving_up` — EMR certified.
- `bookworm` **(new)** — passed the EMR written component with a perfect
  5/5 on the first attempt (rewards `knowledge`-heavy builds specifically,
  giving that stat a visible payoff beyond the exam pass/fail itself).
- `wet_behind_the_ears` **(new)**, ironic/self-aware — failed the EMR exam
  at least once before passing. Deliberately framed as a *badge*, not a
  shame marker — a design choice matching how real EMS culture actually
  treats a first-attempt fail (extremely common, rarely stigmatized among
  peers) rather than punishing the player narratively for something most
  real EMTs also went through.

**Partner departure / relationship:**
- `quiet_goodbye`, `bittersweet` — existing, unchanged conditions.

**PATROL path:**
- `eco_responder` — e-bike unlocked.
- `cart_start` — golf cart unlocked.
- `by_the_book` **(new)** — resolved a Shitty Supervisor incident via the
  Appeal option successfully at least twice across the campaign.

**Fire path:**
- `hell_on_wheels` — Engine 42 access.
- `probie_no_more` **(new)** — completed the volunteer department's fire
  entrance-exam equivalent (§1.6.6) on the first attempt.

**Financial strain (new, Ch.2-4 window — §1.6.12):**
- `paying_my_own_way` **(new)** — resolved the funding-cut incident by
  taking a part-time job.
- `working_medic` **(new)** — resolved it by dropping out of school to
  work full-time.
- `burning_the_candle` **(new)** — resolved it by successfully balancing
  both (the stat-gated roll succeeded).
- `stretched_thin` **(new)** — attempted to balance both and failed —
  framed as a badge, not a shame marker, same spirit as
  `wet_behind_the_ears` above.

**Career-long money (new — §1.6.2.1, not tied to a single chapter):**
- `debt_free` **(new)** — paid off all `g.debt` after having carried it.
- `golden_handcuffs` **(new)** — accepted an employer tuition-assistance
  scholarship (`g.serviceCommitment` set at least once).
- `paid_my_own_way` **(new)** — reached Paramedic certification having
  never carried `g.debt` and never accepted a scholarship — distinct from
  the Ch.2-4 `paying_my_own_way` incident achievement above, this is the
  career-long version.
- `first_house` **(new)** — bought a starter house (§1.6.2.2).
- `off_duty_best_friend` **(new)** — adopted a pet (§1.6.2.2).

**Social layer (new — §1.10):**
- `swept_off_their_feet` **(new)** — reached a confirmed romance
  (`romance >= 70`, resolved positively) with any eligible cast member.
- `keeping_it_professional` **(new)** — reached Paramedic certification
  with at least three friendships at `friendship >= 65` and no romance
  ever crossing `romance >= 35`.

**EMT tier:**
- `the_patch` — EMT certified.
- `two_for_two` **(new)** — passed both EMR and EMT exams on the first
  attempt, no retakes at either tier (a clean-record achievement, the kind
  real students genuinely compare notes about).

**Employment:**
- `amberlamps` — first IFT shift.
- `boo_boo_bus_driver` — hired as 911 EMT. *(operator's list spelled this
  "Boo boo bus driver" with a space/capitals — normalized to snake_case
  `boo_boo_bus_driver` for consistency with every other id in the file;
  flagging the normalization here rather than silently changing intent.)*
- `party_medic` — first Event shift.
- `cross_trained` — switched job paths successfully.
- `moonlighter` **(new)** — held two concurrent EMS-adjacent roles at once
  (IFT+Event, the only combination the design allows per §1.6.6) — a real,
  common EMS income-supplementing pattern worth naming explicitly.

**AEMT tier:**
- `advanced` — AEMT certified.
- `line_in_one` **(new)** — successful IV/IO access on the first attempt
  during the AEMT exam's field component (a real, specific point of pride
  among AEMTs/paramedics — "got it in one stick" is genuine EMS shop talk).

**Optional certifications (new, obtainable Ch.4 onward — §1.6.8.2):**
- `acls_provider` **(new)** — earned ACLS.
- `pals_provider` **(new)** — earned PALS.

**Paramedic tier:**
- `gold_patch` — Paramedic certified.
- `straight_to_medic` **(new)** — admitted to paramedic school without ever
  certifying AEMT (§1.6.8.1) — deliberately rare given how heavily the
  admission formula weights AEMT.
- `tubes_and_tubes` **(new)** — completed the required number of supervised
  live intubations during the OR/anesthesia clinical rotation without
  needing an extension.
- `preceptor_approved` **(new)** — finished the field internship with no
  repeated shifts (a clean capstone, mirroring `two_for_two`'s shape one
  tier up).

**Post-paramedic / Chapter 9-10:**
- `still_here` **(new)** — logged a defined large number of career-total
  calls post-certification (a long-haul achievement with no other gate,
  rewarding continued sandbox-style play rather than a story beat).
- `super_boo_boo_bus` — Critical Care Paramedic unlocked (operator's id,
  kept as written).
- `wings` — Flight Medic unlocked (operator's id, kept as written).
- `taught_the_teacher` **(new)** — precepted or taught at least one
  practice-scenario session for a lower-tier classmate during Ch.9's open
  world (a natural, low-build-cost way to give "teach" — named as a
  Ch.9 option in the operator's own outline — a concrete achievement
  payoff instead of being purely narrative).

---

## 1.8 Simulation Integration and Downtime Events

### 1.8.1 Shift structure (confirmed, expanded)

Every shift: **pre-shift VN beat** (equipment check, crew banter, one brief
station action where applicable) → **simulation calls** (3-7, randomized
except where a chapter's own deterministic queue overrides it, per the
Prologue's existing precedent) → **per-call debrief VN**, reading the
*actual* simulation outcome (patient survived/died/complications, whether
the player stayed in scope, whether treatment was appropriate) rather than a
scripted reaction — this is already how the Prologue's `benignFaint`/`od`/
`seizure` debriefs work and should stay the load-bearing pattern for every
future call, not a special case.

**A realistic addition worth specifying explicitly: the post-call
documentation beat.** Real EMS shifts are not done when the patient is
handed off — the PCR (patient care report) still has to get written, and a
late/incomplete PCR is a genuine, common source of workplace friction (QA/QI
review flags, supervisor follow-up). A lightweight version of this — not a
full charting minigame, just a short VN beat every several calls where a
supervisor or QA reviewer flags a documentation gap tied to something the
player actually did or didn't do in the simulation (e.g., vitals not
reassessed within protocol interval, a treatment given without the matching
narrative note) — would give the existing `pat.` mechanism-tracking
discipline this project already has (CLAUDE.md §1) a second, narrative
payoff: the debrief can reference the SAME fields the physiology engine
tracked, not an invented documentation score.

### 1.8.2 Downtime event taxonomy (expanded)

The existing `downtimeEvents.js` system (7 template events, roster morale/
fatigue/money effects) is the base layer. Campaign-only events
(`campaignOnly:true`) layer on top at story beats, per the operator's spec.
Organizing the *kinds* of campaign downtime events worth building, since the
existing system is currently thin on variety:

- **Relationship-building** — the existing pattern (coffee, equipment
  review, vehicle tour, quiet rest from §2.7.2/2.7.4) extended per-chapter:
  classmate study sessions (Ch.2/Ch.4/Ch.6/Ch.8), off-duty hangouts with
  whichever partner is currently active, and — once `radio_crew`/
  `fire_partner`/`ift_partner`/`event_coord` exist as real NPCs
  (CLAUDE.md's own open item F5) — parallel versions of the same pattern
  for each.
- **Crew mishap / humor** — genuinely funny, low-stakes station-life beats:
  a prank between crew members, a supply-closet disaster, a "who ate my
  lunch from the station fridge" bit (a real, near-universal EMS station
  culture joke worth including precisely because it's so mundane and
  recognizable).
- **The Shitty Supervisor** (Lt. Kozlov) — §1.8.3 below, expanded.
- **Burnout/mental-health beats** — a genuinely under-served category in
  the operator's original list, and one that matters for relatability: a
  downtime event triggered after a shift containing a fatality or a
  pediatric call, offering the player a CISM-style peer-support scene (talk
  to a crew member, decline and isolate, or — once available — use an
  official peer-support/EAP resource named in-fiction). This should exist
  as its own small event family, not be folded into the generic
  "crew_argument" morale event, because the emotional shape of "we're
  short-staffed and irritable" and "someone on this crew is still shaken
  from a call three days ago" are genuinely different EMS experiences and
  collapsing them would flatten the exact thing this document is arguing
  for.
- **Financial-reality beats** — a downtime event acknowledging EMS pay
  realities directly (a crew member picking up a second job, a
  conversation about tuition for the next cert tier, a light "should I
  just go be a nurse instead" joke that a lot of real EMTs make) — cheap to
  write, and one of the most consistently-cited relatability points EMS
  professionals raise about media depictions of the job (either it's
  ignored entirely or played as pure tragedy; the honest version is mostly
  wry, ongoing background noise).

### 1.8.3 The Shitty Supervisor subplot (expanded)

Lt. Kozlov's hidden-roll mechanic already exists in outline (confront/comply/
appeal). Worth specifying the realistic texture of *what he actually does*,
since "he criticizes your work and forces extra paperwork" is a
placeholder-grade description:

- Nitpicks PCR documentation on calls that were clinically fine (a real,
  common supervisor archetype — the one who cares more about box-checking
  than patient care, which is exactly what makes him grating rather than a
  cartoon villain).
- Second-guesses a treatment decision in front of the patient or bystanders
  (a genuine, specifically humiliating real-world supervisor failure mode —
  undermining a provider's field authority in the moment rather than
  privately afterward).
- Assigns punitive extra shifts or equipment-restocking duty framed as
  routine.

**Confront:** `confidence +2`, `reputation -1` (temporary — he outranks the
player, so there's a real short-term cost), crew morale rises (the crew
respects someone willing to push back).
**Comply:** `fatigue +1`, `morale -1` (grinding, not a sudden event).
**Appeal** (needs `reputation > 20`): Kozlov reassigned, `reputation +3` —
the highest-value outcome, gated behind the exact stat this whole subplot
otherwise erodes, which is the point: appealing effectively requires having
NOT let previous Kozlov incidents (or general reputation drift) tank your
standing first.

### 1.8.4 Scope enforcement in simulation

Per the operator's closing line ("All simulation calls respect the player's
current scope; out-of-scope actions are greyed out"): this should be
implemented as a single source of truth, not a parallel system —
`App.jsx`'s existing `why()` scope-gate function already does exactly this
for ordinary Career/Sandbox play, and the campaign should call the SAME
function with the player's current campaign certification level mapped onto
the existing `lvl` values (`Layperson` pre-EMR, `EMR`, `EMT`, `AEMT`,
`Paramedic`), rather than a second gating mechanism that could silently
drift out of sync with it — exactly the "one rule, not two that could
disagree" principle CLAUDE.md's own F16/F17 write-up already established
for the loadout-scope-lock feature.

---

## 1.9 The Cast — a concrete, gender-paired name roster (operator revision)

The original instinct here was to keep every secondary character on
`campaign.js`'s existing name-pool-draw convention (`{partnerName}`-style
placeholders, resolved at runtime, no fixed identity) — good for save
variety, bad for the moment sprite art enters the picture, since art needs
something concrete to draw. Per explicit operator direction, the resolution
is a split, not a blanket rule either way:

- **Major, recurring, relationship-tracked characters** (every id in
  `relationships.js`, plus the paramedic-program advocate pool and the
  Ch.8 clinical-rotation preceptors) get a **fixed, concrete, gender-paired
  name** below — real enough to hang a sprite spec on, exactly the way the
  two `STATIC_CAMPAIGN_CHARACTERS` Easter eggs (`paramedicStoriesHost`,
  `lightningmedic`) already work in `campaign.js`, just extended to the
  whole recurring cast rather than only those two.
- **One-off, background, or generically-drawn characters** (a random
  bystander, an unnamed second patrol responder in a given call, filler
  crew on a shift roster) stay on the existing pool-draw convention and
  never need a dedicated sprite — reuse the existing `portraitFor()`
  generic-portrait system.

Every name below pairs a first+last name with an explicit pronoun set,
matching `names.js`'s own existing "~135 names each carrying a real gender
tag" convention — nothing here should be read as, or replaced with, a real
person's name. **Implementation note:** wherever a first name below happens
to already exist in `names.js`'s pool under the matching gender tag, reuse
that exact entry rather than adding a near-duplicate spelling — the pool
already carries the gender association this table needs, so pulling from
it (and only inventing a last name, as needed, to make the character feel
distinct from an ordinary random draw) keeps this fixed cast visually and
tonally consistent with every other pool-drawn character in the game
rather than standing slightly apart from it.

| Relationship id / role | Name | Pronouns | First appears |
|---|---|---|---|
| `partner_patrol` | **Grace Turner** | she/her | Scene 4 (Prologue) |
| Fire chief (advocate-pool candidate) | **Chief Dana Alvarez** | she/her | Ch.3 (Fire path) |
| `fire_partner` | **Priya Anand** | she/her | Ch.3 (Fire path) |
| `radio_crew` | **Sofia Marchetti** | she/her | §2.7.4 interlude |
| `classmate_emr` | **Devon Blackwell** | he/him | Ch.2 |
| `classmate_emt` | **Harper Nakamura** | she/her | Ch.4 |
| Rival classmate (flavor only, not relationship-tracked) | **Derek Voss** | he/him | Ch.4 |
| `ift_partner` | **Leo Bautista** | he/him | Ch.5 (IFT) |
| `event_coord` | **Jenna Whitfield** | she/her | Ch.5 (Event) — also owns EventMed |
| `job_supervisor` (911) | **Captain Renee Fischer** | she/her | Ch.5-7 (Northwood County EMS) |
| `job_supervisor` (IFT) | **Nathan Cole** | he/him | Ch.5-7 (Crosswind Medical Transport) |
| `instructor` | **Instructor Yolanda Briggs** | she/her | Ch.2, recurs Ch.4/Ch.6 |
| `shitty_supervisor` | **Lt. Viktor Kozlov** | he/him | Ch.3 onward |
| Advocate-pool ER physician (§1.6.8.3) | **Dr. Adaeze Okonkwo** | she/her | Ch.5+ (hospital hand-offs) |
| Advocate-pool ER physician (§1.6.8.3) | **Dr. Raj Patel** | he/him | Ch.5+ (hospital hand-offs) |
| Ch.8 ICU rotation preceptor | **RN Owen Delacroix** | he/him | Ch.8 |
| Ch.8 L&D/OB rotation preceptor | **CNM Renata Cruz** | she/her | Ch.8 |
| Ch.8 OR/anesthesia rotation preceptor | **Dr. Felix Ahn** | he/him | Ch.8 |
| Ch.8 psych rotation preceptor | **Dr. Miriam Osei** | she/her | Ch.8 |
| Ch.8 field-internship preceptor paramedic | **FTO Diego Salcedo** | he/him | Ch.8 |

**Several names already existed in the operator's own original outline.**
Most are kept verbatim: Chief Alvarez/Jenna/Leo/Derek/Lt. Kozlov/Dr.
Okonkwo/Dr. Patel (all named in the operator's original Chapter 3/4/5/8
text) — this table just gives each a full name, a stated pronoun set, and
a fixed role so sprite work has something to anchor to. `partner_patrol`
is the one exception: the operator's original §9.3 text named her
"Tiffany," but per a later operator revision that name is swapped for
**Grace Turner**, drawn directly from `names.js`'s own existing pool
(§1.9's "reuse existing pool entries" note) rather than an invented name —
it isn't overriding the operator's
choices, it's completing them. `Dr. Okonkwo`/`Dr. Patel` deliberately double
as BOTH the paramedic-program advocate-pool candidates (§1.6.8.3) AND the
hospital's own existing recurring ER staff (the "Medical Director + ER
roster" already shipped per prior front-end work) — one consistent pair of
people, not two separate sets of doctors who happen to share names.

### 1.9.1 Sprite asset specs

Per this project's own standing convention (`src/assets/<category>/<Name>.md`
spec files, Purpose/Intended appearance/Theme/Important visual elements/
Notes — see `src/assets/audio/README.md` for the pattern this extends):
**specs only, no actual art generated**, one file per named character
above, at `src/assets/characters/<FirstLast>.md`. Two fully worked examples
to establish the template; the remaining ~17 follow the identical shape:

**`src/assets/characters/GraceTurner.md`**
> **Purpose:** Player's PATROL partner and first real EMS mentor figure,
> Scene 4 through the Chapter 2 departure. The single most screen-time-heavy
> sprite in the Prologue.
> **Intended appearance:** Early-to-mid 20s, athletic build (fitness is
> explicitly part of her characterization — she outruns the player early
> on). Northwood PATROL green polo over the shift, casual civilian
> clothing in off-duty/downtime scenes.
> **Theme/style:** Warm, capable, a little sardonic — should read as
> competent-and-tired rather than stiff-and-official even in uniform.
> **Important visual elements:** A visible PATROL badge/patch; an
> expression set that needs to cover calm-during-a-call, warm-off-duty,
> and the quiet, bittersweet Ch.2 departure scene specifically — that last
> one is the emotional high point of her arc and needs its own distinct
> pose/expression, not a reused "sad" default.
> **Notes:** Three friendship-tier variants are NOT needed as separate
> sprites — tone should come from dialogue and expression swaps within one
> consistent character design, not a wardrobe change per tier.

**`src/assets/characters/LtViktorKozlov.md`**
> **Purpose:** The Shitty Supervisor (§1.8.3) — a recurring, intentionally
> grating authority figure, NOT a romance or close-friendship candidate.
> **Intended appearance:** Immaculately, almost excessively pressed
> uniform — the visual joke is that he cares more about the crease in his
> pants than the patient care around him. Clipboard as a near-permanent
> prop.
> **Theme/style:** Petty-bureaucrat energy, not menacing — he should read
> as exhausting, not dangerous.
> **Important visual elements:** An expression built for "quietly
> disappointed," the character's dominant emotional register.
> **Notes:** No romance/high-friendship art variant needed — see §1.10's
> note on why he's deliberately excluded from the romanceable/close-friend
> pool.

The remaining ~17 entries in §1.9's table each get the same five-field
treatment; role, pronouns, and the one-line characterization already
present for each of them in this document (search their name above) is
enough raw material to write the spec without inventing new
characterization first.

---

## 1.10 The Social Layer — dialogue, friendship, and romance depth (operator revision)

Per explicit operator direction: the campaign should feel like a real,
talkative, populated world, not a sequence of gated story beats with a
relationship stat quietly ticking in the background. This section is the
system that makes that true across the ENTIRE cast in §1.9, not just the
one or two characters who happened to get a full arc written for them
already ({partnerName}/Grace Turner in the Prologue).

### 1.10.0 Dialogue style: no dashes

A standing writing rule for every line of actual spoken dialogue in this
campaign, VN prose and design-doc commentary are exempt, only what a
character says out loud: **write around dashes rather than using one**,
whether as a parenthetical aside or as a trailing interruption. Use a
period, a comma, or an ellipsis where the instinct is to reach for a dash.
This document's own dialogue was largely written before this rule was
set, so a small number of earlier blockquotes may still need a pass, worth
a quick scan before any of this ships rather than assuming every quoted
line already complies.

### 1.10.1 The house rule: three or four options, not two

Wherever this document or a future implementer is deciding how many choices
a VN prompt gets, **default to three or four distinct options, not a bare
yes/no**, unless the source material specifically calls for fewer (a
pass/fail exam retry, a hard scope boundary). The existing Prologue script
already mostly does this (the four attribute-allocation prompts, the
three-option Scene 6 reactions); this is that same instinct, stated as a
standing rule so every chapter built after this document follows it
automatically rather than by accident. A good default shape for a
relationship-flavored choice is: one warm/earnest option, one
guarded/deflecting option, one humor/banter option, and, once friendship or
romance is high enough to unlock it, one flirtatious option (§1.10.3) —
four real tones, not four ways of saying the same thing.

### 1.10.2 The conversation topic system

Every relationship-pool NPC in §1.9's table (all ten `relationships.js`
ids, not just the ones with a scripted arc) exposes the same reusable
**topic menu** during any downtime beat where they're present, rather than
only ever speaking through hand-authored one-time scenes. This is what
makes the cast feel talkative across dozens of shifts instead of going
quiet the moment their one scripted scene ends. Topics are DATA, matching
this project's "prioritize robust, data-driven systems" convention (CLAUDE.md
§4) — one shared table, re-skinned per relationship with role-appropriate
flavor text, not ten separately hand-built dialogue trees.

**The topic categories, in the order they unlock:**

1. **Small talk** (always available) — the job, the weather, a call that
   just wrapped, campus/agency gossip. Low stakes, small friendship gains,
   the on-ramp for a relationship that hasn't gone anywhere yet.
2. **Interests and hobbies** (friendship ≥ 10) — what they do off shift.
   This is where each character's individual flavor actually lives (Sofia
   Marchetti's nursing coursework, Leo Bautista's something he's jaded
   about outside work too, Harper Nakamura's event-medicine ambitions).
3. **Backstory** (friendship ≥ 25) — why they're doing this job. Every
   named character in §1.9 should have at least one real, specific answer
   ready for this topic before it ships; "I don't know, just ended up
   here" is a valid personality for at most one character in the whole
   cast, not a fallback default for characters nobody's written yet.
4. **Hopes and fears** (friendship ≥ 45) — where they see themselves in
   five years, what actually scares them about the job. The natural home
   for burnout/mental-health texture (§1.8.2) to surface organically
   through a specific person instead of only a generic downtime event.
5. **Vulnerable/deep talk** (friendship ≥ 65) — reserved for real,
   specific disclosures, the kind of exchange that should feel earned.
   This is also where a platonic relationship's own emotional ceiling
   lives for characters who are never going to be romance options
   (§1.10.4's exclusions) — deep friendship doesn't require romance
   eligibility to feel meaningful, and the game should make sure that's
   visibly true rather than only true in theory.
6. **Flirtation** (friendship ≥ 35, romance-eligible characters only,
   §1.10.3) — layered in alongside the other tiers rather than replacing
   them; a romance-eligible character still has small talk, backstory, and
   deep talk on top of the flirt option, so pursuing a romance never
   means losing the platonic conversation depth underneath it.

Each topic, each time it's chosen, should offer the three-or-four-option
shape from §1.10.1, with real stat consequences (friendship deltas that
scale with how well the response lands, matching the existing friendship-
tier convention already in `relationships.js`) rather than a single
"correct" response.

### 1.10.3 Romance, explicitly

**Romance-eligible characters** (a separate `romance` scalar, 0-100,
distinct from `friendship`, per character): `partner_patrol` (Grace Turner
Reyes), `fire_partner` (Priya Anand), `classmate_emr` (Devon Blackwell),
`classmate_emt` (Harper Nakamura), `ift_partner` (Leo Bautista),
`event_coord` (Jenna Whitfield), `radio_crew` (Sofia Marchetti). Seven real
romance options across the campaign, spanning both Ch.3 paths and every
Ch.5 job choice, so no single playthrough's structural choices lock a
player out of every romance option, even though any one playthrough will
only have realistic access to a subset (a Fire-path player never meets
Leo/Harper/Jenna's job-context scenes the way a PATROL player does, for
instance, though classmates are met regardless of the Ch.3 fork since
Ch.2/Ch.4 school happens before and around it).

**Deliberately NOT romance-eligible, stated with reasons rather than left
to look like an oversight:** `instructor` (Yolanda Briggs) and both
`job_supervisor` entries (Renee Fischer, Nathan Cole) are excluded on
real, professional-ethics grounds, the same standard that governs actual
educator/student and supervisor/employee conduct norms, not an arbitrary
narrative rule. `shitty_supervisor` (Lt. Kozlov) is excluded because he's
written as an antagonist by design (§1.9.1's sprite note already says as
much). This is worth stating outright in dialogue at least once if a
player tries to flirt with an ineligible character (a gentle, in-character
redirect, not a hard error message) rather than silently disabling the
option with no explanation.

**Mechanics:** the flirt-topic option unlocks at friendship ≥ 35 per
§1.10.2; successful flirt exchanges raise `romance` directly (friendship
also still rises, more slowly). At `romance ≥ 70`, a "where is this going"
scene becomes available, a real confession/definition-of-the-relationship
beat, matching the shape §2.6's existing {partnerName} departure scene
already uses for its own high-romance branch. **Exclusivity:** pursuing
romance dialogue with a second character while already above the
`romance ≥ 70` threshold with a first triggers a real, felt confrontation
scene (the two characters know each other through the same small campus/
agency world, and word travels) rather than silently allowing both to
progress in parallel — this is a deliberate design choice for
relatability, not a technical limitation; a poly-relationship framing was
considered and set aside as a bigger, separately-scoped feature rather
than something to half-build here.

**New achievements:** `swept_off_their_feet` **(new)** — reached a
confirmed romance (the `romance ≥ 70` scene resolved positively) with any
eligible character. `keeping_it_professional` **(new)** — reached
Paramedic certification having built at least three friendships to
`friendship ≥ 65` (real, deep platonic relationships) while never crossing
`romance ≥ 35` with anyone, a real, valid, and rewarded way to play this
game.

### 1.10.4 One-off characters still deserve real dialogue

Not every named face needs a full relationship track. The Ch.8 clinical
preceptors (§1.9's Owen Delacroix, Renata Cruz, Felix Ahn, Miriam Osei),
the FTO (Diego Salcedo), and similar single-rotation characters should
still get **at least two or three genuine dialogue exchanges each**, not
one paragraph of narration standing in for a person. They don't need
`relationships.js` tracking to feel real; they need to sound like distinct
people for the one scene they're in. This is a general writing-quality
bar for this document's remaining chapter work, not a new mechanic.

Sections 2.1-2.7 (disclaimer through the tutorial shift) are **already
shipped** — see the game's own handoff notes for the full implementation
history. Not rewritten here. Two small realism/relatability notes for a
future polish pass, recorded rather than re-litigating shipped content:

- **2.4 (the laptop video):** the ParamedicStories skit is good relatable
  texture as-is — EMS-creator parody content is a genuine, widely-recognized
  in-culture reference point. Worth resisting the urge to make it more
  "serious" in any future pass; the humor is doing real work establishing
  tone before the heat-stroke call turns serious a scene later.
- **2.6/2.7 station intro:** {supervisorName}'s "mostly it's scraped knees,
  drunk kids, and the occasional real emergency" line is exactly the right
  register — worth using as the calibration line for how EVERY future
  chapter's day-to-day call mix should be narrated (mundane majority, real
  emergencies genuinely rare relative to call volume, which is itself one
  of the most commonly-cited "things TV gets wrong" points from actual EMS
  professionals).

---

## Chapter 1: Boots on the Ground

### 1.1 Opening — the morning after (expanded)

Keep the existing beat (calendar reminder, granola bar, walk to station) but
add one concrete texture detail worth writing in: **the first full shift's
gear-up sequence** — not a minigame, just a short observed beat where the
player checks their radio battery, confirms the patrol bag is stocked, and
clips a name badge on. This is the first time the player's role has visible
institutional weight (a badge, a radio) rather than the Prologue's "civilian
who happened to help," and the scene should let that land — a one-line MC
inner-monologue contrast ("Two weeks ago I didn't know CPR. Now I've got a
radio with my name on the roster.") does the work without needing new
mechanics.

**The arrival-time choice (new, recurring mechanic, debuts here).** Before
the gear-up beat, a real choice with a real tradeoff: how early the player
heads out. Four options (`campaign.js`'s `ARRIVAL_TIME_OPTIONS`):

| Option | Reputation | Morale (whole station) | Fatigue |
|---|---|---|---|
| 45 minutes early | +3 | +2 | +4 |
| 15 minutes early | +1 | +1 | +3 |
| On time | 0 | 0 | 0 |
| 5 minutes late | -2 | -1 | -3 |

The morale delta hits `g.morale` (§1.5.2's existing crew-wide scalar) —
"the whole station," not one individual's friendship — since PATROL runs
multiple simultaneous units (see the new station-roster note below), and
arriving earlier means more facetime with everyone on shift that morning,
not just the player's own assigned partner. Fatigue on the late option goes
NEGATIVE relative to on-time, not just "no bonus" — arriving late means the
player genuinely slept more.

This is a RECURRING mechanic, not a one-time Ch.1 moment: it's asked at the
start of every zth-campaign shift going forward. Chapter 1's debut has its
own line: "You just woke up. It's your first day as a member of the
Northwood PATROL! How early do you arrive?" Every subsequent shift asks
"It's time for your shift. How early do you head out?" instead, same four
options both times.

**Northwood PATROL runs more than one unit per shift (new).** The player's
own assignment (one Layperson trainee + one EMR partner, on foot) is only
ONE of three simultaneous PATROL units, not the whole roster:

- **Layperson crew** — one trainee (the player, pre-EMR) + one EMR partner,
  on foot. The player's own assignment throughout the Prologue and early
  Chapter 1.
- **Solo EMR, bike** — one EMR, alone, on the e-bike.
- **EMR duo, golf cart** — two EMRs, sharing the golf cart.

This isn't new content to build from scratch — it's the missing context
for Chapter 3's own e-bike/golf-cart PATROL promotions (§3.2), which already
existed as rewards without ever explaining what unit type they actually
put the player into. An e-bike promotion moves the player from the
Layperson crew into the solo-bike unit; a golf-cart promotion moves them
into the EMR-duo unit. Arriving early enough to see multiple units at the
station before a shift (rather than just the player's own partner) is
also the concrete, in-fiction reason the arrival-time choice's morale
bonus is station-wide rather than one relationship.

### 1.2 Arriving at the station (existing dialogue kept, response choice kept)

### 1.3 The first real shift — call variety and realism

The existing spec already correctly scopes calls to the Layperson-completable
pool. Worth specifying the **call-type mix** explicitly so Chapter 1 doesn't
read as an undifferentiated stream of "medical emergency #4": campus EMR/
PATROL-type calls realistically skew toward — in rough descending frequency
— minor trauma (falls, sports injuries, cuts), intoxication/alcohol-related
calls (extremely common on any real college campus response log), syncope/
near-syncope, anxiety/panic presentations, allergic reactions, and only
occasionally something acutely dangerous. The existing allergic-reaction
example call is well-chosen for exactly this reason — it's common, genuinely
teaches something (positioning, monitoring, knowing when EMR scope ends and
ALS is needed), and doesn't require inventing new physiology.

**A relatability addition:** at least one Chapter 1 call should be a
**"frequent flyer"** — campus EMS logs, like every real EMS system's,
develop a recognizable set of repeat callers (a student with anxiety who
calls PATROL semi-regularly, a known intoxication-related repeat call at the
same dorm). This is one of the most universally-recognized real EMS
experiences and costs nothing new to build: reuse an existing low-acuity
scenario, just give it a named, recurring patient and let {partnerName}
recognize them by name on arrival ("Oh — hey, it's [name] again. Let's go
say hi."). It also sets up a real, common EMS emotional beat for later:
frequent-flyer fatigue, and the discipline of treating the fifth visit with
the same care as the first.

**Stat changes per call** — as specified (reputation/confidence/friendship/
fatigue deltas) — unchanged from the operator's spec; they're already
well-formed and tied to real outcome/mistake signals rather than arbitrary.

### 1.4 The coffee break interlude (existing dialogue kept)

Worth one addition: {partnerName}'s backstory reveal ("I once wanted to be a
nurse... I found PATROL and it became my thing") is a good, realistic
motivation — campus EMS/volunteer squads are genuinely full of people who
found the work sideways rather than through a lifelong plan. Keep it as
written; it doesn't need embellishing, it needs to stay this grounded.

### 1.5 The push to EMR school (existing beat kept, feeds §1.6.3)

---

## Chapter 2: EMR School — "The First Step"

### 2.1 First day of class (expanded)

The existing description (classroom, mannequin, {classmate_emr},
{instructorName}) is a good skeleton. Expand the instructor's opening line
to set real course expectations rather than a generic "not a game" warning —
something closer to how real EMS instructors actually open a course, which
tends to be procedural and a little wry:

> {instructorName}: "Forty-eight hours over the next six weeks. That's not a
> lot of time to learn to keep someone alive until help that's better
> equipped than you shows up, because that's the whole job description at
> this level. You are not the definitive treatment. You are the bridge. Get
> comfortable with that, because a lot of people don't, and it's the thing
> that trips new EMRs up more than any skill in this binder."

This does real narrative work: it states EMR's actual clinical philosophy
(bridge care, not definitive care) in the instructor's voice instead of a
system tooltip, which is exactly the kind of "mechanism, not a stat write"
discipline this project already applies to physiology — applied here to
narrative instead.

### 2.2 Practice scenarios (existing, tie to §1.6.11's practice-scenario system)

### 2.3 Relationship building with {classmate_emr} (existing, kept)

Add one grounding scene: a study session where {classmate_emr} admits he's
retaking the course after failing once elsewhere — this normalizes the
`wet_behind_the_ears` achievement's framing (§1.7) inside the fiction itself,
not just as a UI badge, and gives the "study together" choice real emotional
stakes beyond a flat stat bump.

### 2.4 Balancing PATROL and school (existing fatigue/off-duty structure kept)

**This chapter is the first of three possible windows for the funding-cut
incident (§1.6.12).** Roll it (25% chance) somewhere in the back half of
this chapter, after the player has settled into the EMR coursework rhythm
but before §2.5's exam — the incident's own resolution needs to be settled
before the exam, not compete with it for tension in the same beat. If it
doesn't fire here, nothing else about this chapter changes; the roll simply
carries forward to Chapter 3.

A pacing note tied to §1.6.1's ÷10 compression rule: {instructorName}'s
"forty-eight hours over the next six weeks" line in §2.1 is accurate
REAL-WORLD flavor and should stay as spoken dialogue — but the actual
in-fiction time-skip out of this chapter should use vague narration ("the
weeks blur together — lecture, drills, PATROL shifts, repeat") rather than
a literal on-screen calendar counter, since the true elapsed in-fiction
time per §1.6.2's table is closer to 4-6 days. Real instructors describe
real course length; the game's own clock doesn't have to contradict them
on-screen as long as it never states a literal, conflicting number.

### 2.5 The EMR certification exam (§1.6.3's full mechanics apply here)

### 2.6 The turning point — {partnerName}'s departure (existing scene kept in full)

This scene is already strong and shouldn't be rewritten wholesale — the
friendship/romance-gated three-way branch is exactly the kind of
consequence-bearing relationship payoff this project's relationship system
(CLAUDE.md's own `relationships.js`) is built to support. One addition: the
choice of "outdoor rec center, teaching kayaking" as her exit is a genuinely
good realistic detail — it's a real, common trajectory (someone who was
good at EMS-adjacent volunteer work but recognized, honestly, that the
career track wasn't for them) rather than a contrived plot device, and is
worth flagging as a keeper rather than something to second-guess in a
future rewrite pass.

---

## Chapter 3: Fork in the Road — PATROL or Volunteer Fire

**Second window for the funding-cut incident (§1.6.12), 35% chance — only
rolled if it didn't already fire in Chapter 2.** If it fires here, per
§1.6.12's staging notes, it should be folded directly into §3.1's own scene
rather than given a separate beat: the funding letter arrives the same
week as {supervisorName}'s PATROL/Fire question, and the three-way financial
choice resolves in the same conversation the path fork does. See §1.6.12
for exactly how each of the three resolutions colors what happens to the
PATROL option below.

### 3.1 Meeting with {supervisorName} (existing, kept — see the funding-cut
note above if this is the chapter the incident rolled true in)

**A worked example of the fork scene actually stating the tradeoff out
loud**, per §1.6.4's "let the player feel BOTH costs plainly" instruction
(dialogue written without dashes, per style guidance in the implementation
notes):

> {supervisorName}: "So. PATROL or Fire. Take your time, but not too much
> time, both sides need bodies. PATROL keeps you here, keeps you paid, and
> honestly it's the safer bet if you're worried about money. Fire's a
> different animal. Chief Alvarez runs a good house, and if you put the
> hours in, she'll fight for you when a paid seat opens up. But it's
> volunteer. Nobody at that station is getting a paycheck for showing up."

Choice (three options, per this document's own "default to three or four
where the source doesn't specify fewer" rule, §1.10):

> Option A: "I need the paycheck. PATROL."
> Option B: "I want the guarantee that I'll always have a place there.
> Fire."
> Option C: "Tell me more about what each one actually costs before I
> decide."

Option C should be a real information beat, not a stall. It should surface
the actual numbers a player would otherwise have to infer: PATROL pays
roughly eighty dollars a shift and leads toward jobs that can eventually
help pay for AEMT and Paramedic school. Fire pays nothing for as long as
the player stays a volunteer, and every certification after EMR comes out
of the player's own pocket unless they later win one of the department's
rare paid seats.

### 3.2 Path A: Northwood PATROL, EMR (expanded)

**New duties, specified concretely:** with EMR certification, the player's
campus-scope calls expand slightly (still Layperson-adjacent institutionally,
but the player can now use EMR-scope interventions PATROL previously
deferred to arriving EMS for) — this should be visible in the simulation as
a real widened action set, not just narrated. Leading a small team on some
shifts (mentoring a rookie) is a genuine, well-chosen leadership beat —
recommend implementing it as a lightweight mirror of the existing crew-task
delegation system (CLAUDE.md's F14 — "protocol-driven autonomous crew
direction") rather than new machinery: the rookie is a crew-task target the
same way any other roster member is.

**The e-bike and golf cart (existing, kept)** — worth noting explicitly that
these should have a small, real gameplay effect on response-time-sensitive
calls (a scene-arrival timer, where one exists), not be purely cosmetic,
since "vehicle changes response time" is already an established mechanic
elsewhere in the game (hospital destination `distMult`, region `driveMult`)
and reusing that pattern here costs little. Worth one more beat this path
specifically earns: a promotion scene where {supervisorName} explicitly
acknowledges the player's first real paycheck bump, tying the ability to
now comfortably self-fund EMT tuition back to §1.6.2.1's own numbers rather
than leaving the payoff implicit.

### 3.3 Path B: Volunteer Fire Department (expanded)

**Firehouse life:** the existing description (Engine 42, **Priya Anand**
as the new partner, basic fire-suppression skill checks, **Chief Dana
Alvarez**, §1.9) is well-scoped, worth being explicit that the "basic fire
suppression minigames" should stay genuinely minor (a skill-check beat,
not a parallel fire-simulation engine) since this project's whole premise
is the closed-loop PHYSIOLOGY engine; fire-suppression content exists here
to texture the setting and the character relationships, not to become a
second simulator. Worth one honest beat this path specifically earns too:
a scene, maybe the player's first payday equivalent that never comes,
where the absence of a paycheck actually registers. Chief Alvarez
shouldn't apologize for it or oversell it; a single grounded line like
"nobody joins a volunteer house for the money, you already know that part"
does more work than a longer explanation would.

**A relatability addition:** volunteer fire culture has a real, specific
flavor worth including — the mix of genuine camaraderie and mild
institutional chaos (mismatched gear ages, a truck that's older than some
members, fundraising pancake breakfasts as a running background detail) that
distinguishes it from a career department. A single recurring background
joke about the department's aging engine or a fundraiser event mentioned in
passing costs nothing and does a lot for authenticity.

### 3.4 End of Chapter 3 (existing, kept — feeds Ch.4)

---

## Chapter 4: EMT School — "It Gets Real"

**Third and final window for the funding-cut incident (§1.6.12), 45%
chance — only rolled if it hasn't already fired in Ch.2 or Ch.3.** By this
point the Ch.3 fork is already resolved, so there's no path-availability
consequence; instead this occurrence is framed around real EMT tuition
specifically and its resolution should directly color Chapter 5's job
choice — see §1.6.12's Ch.4 staging note and §1.6.6's pay-differential
callback (a financially-strained player choosing IFT because it's the sure
thing, despite it paying the least of the three job options, is the
intended beat here).

### 4.1 First day of class (expanded)

{classmate_emt}'s "energetic, quirky, into event medicine" characterization
is a good, specific hook — it directly foreshadows the Event EMT job option
in Ch.5, which is exactly how a campaign this size should plant its own
branches rather than introducing job types cold. Derek's "cocky" trait is
serviceable as a minor rival-flavor character but should be written with
restraint — a genuinely common, low-stakes EMS-classroom archetype (the
student who's overconfident about skills stations and gets humbled by the
written exam, or vice versa) rather than a cartoon antagonist; keeping him
mostly off to the side, occasionally right, occasionally wrong, is more
relatable than a rivalry arc.

### 4.2 Practice scenarios and clinical exposure (expanded)

EMT-level training realistically includes at least brief clinical
observation exposure in many programs (ED ride-alongs or observation shifts)
even though the FULL clinical-rotation structure doesn't formalize until
Paramedic school (§1.6.8). A single optional Ch.4 "ED observation shift"
downtime event — narrated, low-mechanical-weight, maybe one knowledge tick —
is a nice authentic touch that also sets up the Ch.8 clinical-rotation
system as a familiar shape rather than a brand-new mechanic appearing from
nowhere.

### 4.3 Relationship with {classmate_emt} (existing, kept — concert/event-medic hook)

### 4.4 The EMT certification exam (§1.6.5's full mechanics apply here)

---

## Chapter 5: Employment — IFT, 911, or Event EMT

### 5.1-5.6 (existing structure kept in full; §1.6.6 supplies the expanded mechanics)

**Worth adding:** an explicit **first-shift-jitters beat** per job type,
since starting a first REAL paid/volunteer-adjacent EMS job (as opposed to
PATROL, which was always somewhat sheltered/campus-scoped) is a genuinely
significant transition many real EMTs describe vividly — "first 911 shift"
anxiety is a distinct, well-documented experience from "first PATROL call"
anxiety, and the game shouldn't treat them as mechanically identical beats
just because both trigger a debrief screen. A short pre-shift VN unique to
whichever job the player picked does this cheaply, and now has a concrete
cast to draw on (§1.9): **Leo Bautista** at Crosswind Medical Transport for IFT, **Captain
Renee Fischer** as the shift supervisor at Northwood County EMS for 911
(a 911 PARTNER, distinct from Fischer, can stay pool-drawn — only the
supervisor role needed a fixed identity for §1.6.8.3's advocate system),
and **Jenna Whitfield** at EventMed for Event. Each introduction should
also be the natural place to plant that employer's own personality as an
organization, not just the individual: Crosswind reads as reliable and a
little worn down, Northwood County EMS reads as bureaucratic-but-solid
(civil-service stability, §1.6.6), EventMed reads as scrappy and
schedule-chaotic (part-time, inconsistent shifts, §1.6.2.1).

---

## Chapter 6: AEMT School — "Going Advanced"

**This chapter is now optional, per §1.6.8.1's revision** — a player who
prefers to gamble on the much lower odds of skipping straight to Paramedic
school from EMT (working toward the `straight_to_medic` achievement) can
bypass Chapters 6-7 entirely once `paramedicApplicationFloor` is met (§1.6.10)
and jump straight to Ch.8's application. This should be a real, offered
choice at the end of Ch.5 or the start of Ch.6 — a short scene where
{supervisorName} or the current job supervisor explicitly raises AEMT as
the next step and the player can decline — not a hidden option a player has
to discover by ignoring the chapter. The game should be honest in that
scene about the odds: a line acknowledging that skipping AEMT is possible
but makes paramedic admission considerably harder is fair warning, not a
spoiler, the same way the exam-failure mechanics elsewhere are never hidden
from the player either. A player who skips can still come back for AEMT
later (e.g., after a Ch.8 rejection) — nothing here is a permanent fork.

### 6.1-6.4 (existing structure kept; §1.6.7 supplies the expanded mechanics)

**Worth adding, for relatability:** AEMT bridge students are very commonly
ALREADY employed full-time EMTs, which the operator's own "Workplace friction"
note already gestures at. Recommend making this explicit and mechanical: a
Ch.6 shift-scheduling conflict should be a real, repeatable friction point
(not just a single scripted Shitty-Supervisor beat) — e.g., a downtime event
type specific to this chapter where the player must choose between a
work shift and a class session, with real but modest tradeoffs either way
(missing class delays the exam readiness / practice-scenario cap; missing a
work shift costs a little reputation/money) — this is one of the most common
real complaints AEMT/paramedic students have about their programs and is
worth the game acknowledging mechanically, not just narratively.

---

## Chapter 7: AEMT — "New Responsibilities"

### 7.1 New responsibilities, expanded

The existing framing (weight of leadership, {partnerName} checking in,
burnout caution) is good. Add concrete scope-visible content: AEMT-scope
interventions (IV/IO, the limited medication set, supraglottic airway)
should now be genuinely available and MEANINGFULLY different in at least a
few Chapter 7 calls — not just theoretically unlocked. A good candidate:
a call where an EMT-scope player previously could only support an airway
with BVM, but AEMT scope now lets the player place a supraglottic device
directly — narrated as a felt difference by {partnerName} or whoever's
riding along ("Nice — that's a call where I'd have had to do that myself
last month. Good to have the extra hands that can actually do something.").

### 7.2 The 911-calls requirement, and the advocate reveal (expanded)

The `g.calls911`/`g.aemtCalls` accumulation this chapter tracks now feeds
`paramedicAdmissionChance` directly (§1.6.10), not a flat threshold — every
additional call genuinely moves the odds, which is worth letting the player
FEEL (a small, real-time-visible confidence indicator on the paramedic-
school application screen once it's reachable, rather than a hidden dice
roll, is the natural UI expression of this, though that's an implementation
detail for whoever builds it, not a design requirement here).

**This is also the chapter where §1.6.8.3's advocate draw happens.** Once
per campaign, narratively placed here, the game randomly assigns one
eligible pool role as "the medical director of the paramedic program" the
player will be applying to — a short reveal scene (the player finding out,
for instance, that it's their own fire chief, or a familiar ER doctor from
a dozen transports, or the AEMT course's own instructor) belongs here, not
buried in Ch.8's application scene, so the player has at least a little
runway to notice and act on the relationship before the admission roll.

---

## Chapter 8: Paramedic School — "The Long Haul"

### 8.1 Application and acceptance (expanded per §1.6.8.1)

This scene is where `paramedicAdmissionChance` (§1.6.10) actually gets
rolled. Structure it as: submit the application (blocked until
`paramedicApplicationFloor` is met), sit the entrance exam (§1.6.8.1),
a short interview VN beat colored by `confidence`/`ambition`, then a
genuine wait-for-the-letter beat before the roll's outcome is revealed —
worth resisting the temptation to show the percentage chance itself here
(a player should feel suspense, not read a number and immediately know the
outcome's odds) even if a rougher confidence indicator was surfaced earlier
per §7.2's note. If the advocate draw (§1.6.8.3) landed on someone the
player befriended, this is the natural place for them to appear briefly —
a phone call, a text, a hallway run-in acknowledging they put in a good
word — rather than only being an invisible number in the formula.

**On rejection:** a real, honestly-written disappointment beat, not a
game over — see §1.6.8.1's "rejection is not permanent" note. The
follow-up should point the player at whichever lever would move the needle
most (more calls, AEMT if they skipped it, an optional cert, reputation)
rather than leaving them to guess.

### 8.2 The paramedic program — three distinct beats (expanded, per §1.6.8's program-structure content below)

Recommend structuring this chapter as three visibly distinct sub-arcs rather
than one continuous "school" blob, since real paramedic programs genuinely
feel like three different experiences in sequence:

**Didactic block:** classroom VN beats, similar shape to Ch.2/Ch.4/Ch.6 but
visibly denser (more lecture topics referenced, a harder practice-scenario
pool) — this is where 12-lead INTERPRETATION (as opposed to EMT's mere
acquisition) should get its own explicit teaching beat, ideally tied to a
real mechanism payoff: a practice scenario where correctly reading a 12-lead
changes the treatment path in a way that's visible in the physiology engine
(STEMI recognition driving a "activate cath lab" decision point, reusing the
already-shipped `acs`/`nstemi` condition family rather than inventing new
physiology for a teaching moment).

**Clinical rotations, now with a named staff roster (§1.9) instead of
generic placeholders:** ED, ICU, L&D/OB, psych, and the OR/anesthesia
intubation rotation (§1.7's `tubes_and_tubes` achievement lives here).
Each is a short, DISTINCT VN scene with its own preceptor and its own
flavor, per §1.10.4's "at least two or three real exchanges" bar:

- **ED:** the rotation the player already has the most context for, since
  hospital hand-offs have been happening since Ch.1 — **Dr. Adaeze
  Okonkwo** or **Dr. Raj Patel** (§1.9), whichever the game hasn't already
  leaned on more in prior hand-off flavor text, precepts. This is also
  where the STEMI/12-lead teaching beat above should live.
- **ICU:** **RN Owen Delacroix** precepts. Real clinical texture worth
  keeping: ICU rotations for paramedic students are commonly precepted by
  ICU nurses, not physicians, and the tempo should read slower and more
  granular than the ED, tracking small trends over a whole shift instead
  of one acute decision point.
- **L&D/OB:** **CNM Renata Cruz** precepts. A good scene here can
  deliberately echo (not repeat) the physiology engine's existing
  childbirth/newborn-roster mechanism from a totally different vantage
  point, a controlled, monitored, hospital birth instead of a field call.
- **OR/anesthesia (the intubation rotation):** **Dr. Felix Ahn** precepts.
  This is the rotation with a hard numeric target (a set number of
  successful live intubations) rather than a soft "time passed" beat, and
  should be the one clinical scene that feels genuinely tense/high-stakes
  in the way the others don't need to.
- **Psych:** **Dr. Miriam Osei** precepts. Worth resisting the urge to
  play this rotation for cheap drama; a grounded, respectful psych
  rotation scene is itself a relatability point, since "the psych rotation
  was actually useful and not just a punchline" is a real, specific thing
  EMS students say about good programs.

None of these five need a `relationships.js` id (§1.10.4) — each gets
their two-or-three real exchanges within their own rotation scene and
doesn't need to persist as a trackable relationship afterward, though a
future batch could always promote one to a full id later if there's a
reason to.

**Field internship:** the FTO-style evaluation described in §1.6.8's
opening (distinct from §1.6.8.3's advocate system, which is about
ADMISSION, not this in-program capstone) — a defined number of team-lead
calls under **FTO Diego Salcedo** (§1.9), with a visible, real competency
checklist (matching items to the ACTUAL skills the
chapter has been building: 12-lead interpretation acting on a real
diagnosis, appropriate medication administration, team leadership during a
multi-provider call). `preceptor_approved` (§1.7) is the clean-completion
payoff for this specific sub-arc.

### 8.3-8.6 (existing structure kept; Shitty Supervisor return per operator's spec, existing exam gauntlet per §1.6.8)

---

## Chapter 9: Paramedic — "The Real Deal"

### 9.1-9.3 (existing sandbox/open-world structure kept in full)

**Worth specifying:** the operator's own note that {partnerName} (Grace Turner,
via downtime-event reappearance if hidden romance was high) or another
max-friendship character's "quiet moment" scene should recur here is good
and matches this project's existing relationship-system depth. Recommend
these stay genuinely RARE, weighted low in the downtime-event roll — a
once-every-several-shifts possibility at most — since their emotional
weight depends on scarcity; a frequent recurrence would cheapen exactly the
payoff the operator is going for.

**A relatability addition for the open-world stretch specifically:** this is
the natural home for the "veteran medic" texture that's genuinely
distinctive about this career stage — mentoring newer EMTs/AEMTs (tying
into the `taught_the_teacher` achievement, §1.7), noticing your own
compassion-fatigue patterns, and the specific, common real phenomenon of a
call that unexpectedly echoes an early-career call (a heat-stroke patient
years after Scene 4's tutorial incident, for instance) landing differently
now that the player has genuine experience. None of this needs new
mechanics — it's downtime-event content and the existing debrief system —
but it's worth flagging explicitly as a category, since Chapter 9's "no
forced progression" framing could otherwise drift into feeling like content
just stops rather than like a career that's still evolving.

---

## Chapter 10: Advanced Roles — Critical Care & Flight

### 10.1 Optional advanced certifications (expanded)

**Critical Care Paramedic:** real-world CCP certification (commonly via
IBSC's FP-C/CCP-C-style examinations, or state-specific critical-care
endorsements) genuinely emphasizes ventilator management, infusion pumps,
and invasive line management on LONG interfacility transports — worth
representing as a distinct call *shape* (longer duration, more monitoring-
over-time gameplay, fewer split-second decisions) rather than just a new
vehicle skin, since that tempo difference is the actual defining feature of
CCT work compared to 911.

**Flight Medic:** the existing spec (physical fitness test via the fitness
stat, psych exam, simulation gauntlet) is good. Realistic additions worth
including: a weight/size restriction beat tied to helicopter cabin
constraints (real, and a genuine point of program-specific variation worth
a single acknowledging line rather than a full mechanic), and a
altitude-physiology teaching beat — real flight programs train specifically
on how altitude affects certain patient presentations (pneumothorax
expansion, ET tube cuff pressure, IV fluid administration rates) — which,
notably, is territory this game's OWN physiology engine could genuinely
model if `pat.ambientTemp`/pressure-adjacent mechanisms were ever extended
that direction; flagged here as a natural, real future physiology-engine
hook rather than committed to, since that's a much larger, separate
undertaking than this document's scope.

### 10.2 Integration (existing framing kept — new vehicles/call types/crew layered onto the open world, no forced ending)

---

## Overall Campaign Flow Summary (restated, unchanged from the operator's original)

> Prologue: Introduction, heat stroke, join PATROL, tutorial shift,
> attribute allocation. Ch1: Regular shifts, relationship building, push to
> EMR. Ch2: EMR school, exam, partner's dramatic departure. Ch3: Branch to
> PATROL or Fire, new partner and vehicle. Ch4: EMT school, exam. Ch5: Job
> choice (IFT, 911, Event), entrance exam. Ch6: AEMT school, exam. Ch7:
> AEMT work, 911 calls requirement. Ch8: Paramedic school, exam. Ch9: Open
> world as paramedic. Ch10: Optional critical care / flight.

**One flow amendment since the original summary was written:** Ch6/Ch7
(AEMT) are now an optional branch rather than a mandatory step between Ch5
and Ch8, per §1.6.8.1's revision — a player can attempt Ch8's admission
roll straight from Ch5 once `paramedicApplicationFloor` is met, at
substantially worse odds. The chapter numbering and content are unchanged;
only the requirement to pass through them before Ch8 is lifted.

---

## Implementation notes for whoever picks this up

This document is design-only, per explicit instruction — nothing above has
been wired into code. A few notes to save the next session real time:

- **Scope enforcement, achievement ids, and the exam/scoring formulas
  (§1.6.10) are the pieces most worth building FIRST**, since almost
  everything else in Chapters 1-10 is VN content that composes on top of
  those three systems rather than requiring new engine work.
- **New state fields this document introduces, listed in one place so
  nothing gets missed:** `g.emrCalls`, `g.iftCalls`, `g.eventCalls`,
  `g.calls911`, `g.aemtCalls` (five SEPARATE counters — §1.6.6's "job-call
  counters, named precisely" note explains why collapsing them would break
  both the 911/fire entrance formulas and the paramedic-admission formula),
  `g.money` (already exists per Career's economy system — just needs the
  per-job `shiftPayMultiplier` from §1.6.6/§1.6.10 applied), a one-shot
  `g.financialStrainResolved` flag (§1.6.12) recording whether/how the
  funding-cut incident resolved, `g.certifications` (a set, §1.6.8.2 — ACLS/
  PALS/future optional certs), and `g.paramedicAdvocate` (§1.6.8.3 — the
  randomly-drawn `{role, relationshipId}` pair recorded at the Ch.7 reveal,
  so Ch.8's application scene can read back which relationship's friendship
  value is the `primaryAdvocateFriendship` input to
  `paramedicAdmissionChance`). Also one new relationship id,
  `job_supervisor` (§1.6.8.3), alongside the existing `instructor` id being
  reused as an advocate-pool member rather than duplicated.
- **Money/property fields from §1.6.2.1/§1.6.2.2, the largest single
  addition since the last implementation-notes pass:** `g.debt` (student
  loans, 15%/paycheck auto-deduction), `g.serviceCommitment` (scholarship
  payback tracking), `g.housingTier` (`"dorm"|"shared_apt"|"solo_apt"|
  "house"`), `g.mortgage` (10%/paycheck auto-deduction, same
  `recurringDeduction` helper as `g.debt` per §1.6.10, not a second
  implementation), and small boolean/flag fields for the optional
  lifestyle purchases (vehicle, pet, home gym, study desk). All tuition/
  pay/purchase dollar figures are collected in §1.6.2.1/§1.6.2.2/§1.6.6's
  tables specifically so nothing has to be re-derived from prose.
- **Social-layer fields from §1.9/§1.10:** a `romance` scalar per
  relationship (separate from the existing `friendship`), the topic-tier
  unlock thresholds in §1.10.2 (a single shared table, not per-character
  data), and the fixed-cast identities in §1.9's roster table, which
  should be seeded into `campaign.js`'s name-pool infrastructure per that
  section's own note (reuse existing pool entries by gender tag rather
  than inventing parallel names) rather than hardcoded fresh.
- **Dialogue written for this campaign should follow §1.10.0's no-dashes
  rule** — worth a lint-style pass (a simple grep for em/en dashes inside
  quoted dialogue blocks) before any batch that adds new VN script content
  ships, the same spirit as this project's own eslint-baseline discipline
  applied to prose instead of code.
- **The funding-cut incident (§1.6.12) is the one piece of this document
  with real branching-logic complexity** — it has to be checked (at most
  once) across three chapter-start hooks, and its resolution has to be
  legible to the Ch.3 fork scene and the Ch.4→Ch.5 transition. Worth
  building and testing this in isolation (all three trigger points, all
  three resolutions, both interaction cases with the Ch.3 fork) before
  wiring the surrounding chapter content around it, rather than discovering
  the branching gaps mid-way through writing Chapter 3's actual scenes.
- **Nothing here requires new physiology-engine mechanisms.** Every call
  referenced reuses the existing condition library and scope-gate system;
  the one speculative physiology hook (§10.1's altitude-physiology idea) is
  explicitly flagged as future/optional, not a dependency.
- **Reuse before you build:** the crew-task delegation system (for Ch.3's
  PATROL rookie-mentoring beat), the hospital-destination `distMult` pattern
  (for vehicle response-time effects), and the existing relationship/
  downtime-event machinery are all named above as the correct reuse targets
  — per this project's own standing front-end principle of avoiding
  large-scale refactors when an existing system already fits.
- **This should become its own numbered item in the front-end queue**
  (CLAUDE.md §6, F1) once a session is ready to implement any of it, broken
  into batches roughly along chapter boundaries — the existing queue
  discipline ("a coherent unit of work, verified, reported") applies here
  exactly as it does to the physiology-engine condition-library workstream.

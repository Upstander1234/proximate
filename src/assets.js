// assets.js — the single source of truth for every art/audio path in the
// game. Nothing else in the codebase should hardcode a path under
// /assets/... — call one of the helpers below instead. That's what makes
// the whole tree swappable: an artist replaces a file in public/assets/
// (keeping the exact filename), and every place that referenced it updates
// automatically, with zero code changes.
//
// Regenerating/adding placeholders: see scripts/generate_placeholders.py.
// Re-running it never overwrites a file that's already been replaced with
// real art (pass --force if you really want to reset everything).

// import.meta.env.BASE_URL always mirrors vite.config.js's own `base` value
// ("./" for the itch.io-compatible build, "/" in dev) and always ends in a
// trailing slash — so this resolves relative to wherever index.html itself
// was loaded from, the same reasoning as vite.config.js's own `base` comment.
// A literal "/assets" broke under itch.io's hashed CDN subpath hosting: every
// <img>/<audio> src built from it 404'd against the CDN root instead of the
// game's own folder.
const BASE = `${import.meta.env.BASE_URL}assets`;

// ── Backgrounds & overlays ────────────────────────────────────────────
export const BACKGROUNDS = {
  stationMain: `${BASE}/backgrounds/station_main.png`,
  stationOffice: `${BASE}/backgrounds/station_office.png`,
  stationGarage: `${BASE}/backgrounds/station_garage.png`,
  stationDispatch: `${BASE}/backgrounds/station_dispatch.png`,
  stationTraining: `${BASE}/backgrounds/station_training.png`,
  stationBreakroom: `${BASE}/backgrounds/station_breakroom.png`,
  cityMap: `${BASE}/backgrounds/city_map.png`,
  stationExterior: `${BASE}/backgrounds/station_exterior.png`,
  // Zero-To-Hero campaign visual-novel backgrounds (F31) — the prologue's
  // scenes (dorm move-in, the apartment laptop scene, the PATROL station,
  // the campus quad at night, the library) had no background art at all
  // before this batch, despite each scene's own narration explicitly
  // describing a place. See src/assets/backgrounds/README.md for the full
  // spec of each.
  dormRoom: `${BASE}/backgrounds/dorm_room.png`,
  apartmentStudio: `${BASE}/backgrounds/apartment_studio.png`,
  campusQuadNight: `${BASE}/backgrounds/campus_quad_night.png`,
  // F33 follow-up: the heat-stroke incident (campaignHeatStrokeSim/
  // Aftermath) is broad daylight ("oppressively hot; cicadas drone") and
  // had been deliberately reusing campusQuadNight as an acknowledged
  // placeholder shortcut — a real daytime quad background instead.
  campusQuadDay: `${BASE}/backgrounds/campus_quad_day.png`,
  campusLibrary: `${BASE}/backgrounds/campus_library.png`,
  patrolStation: `${BASE}/backgrounds/patrol_station.png`,
  // A real, viewable campus map (the "crooked campus map" Scene 5's own
  // narration already hangs on the station wall) — a stylized top-down
  // layout of Northwood University with every location the prologue
  // script actually names, labeled via CampusMapOverlay (App.jsx).
  campusMap: `${BASE}/backgrounds/campus_map.png`,
};
export const OVERLAYS = {
  night: `${BASE}/backgrounds/overlays/night.png`,
  rain: `${BASE}/backgrounds/overlays/rain.png`,
  snow: `${BASE}/backgrounds/overlays/snow.png`,
  fog: `${BASE}/backgrounds/overlays/fog.png`,
  smoke: `${BASE}/backgrounds/overlays/smoke.png`,
  dawn: `${BASE}/backgrounds/overlays/dawn.png`,
  dusk: `${BASE}/backgrounds/overlays/dusk.png`,
};
export const WEATHER = {
  rain: `${BASE}/weather/rain.png`,
  snow: `${BASE}/weather/snow.png`,
  fog: `${BASE}/weather/fog.png`,
  smoke: `${BASE}/weather/smoke.png`,
  night: `${BASE}/weather/night.png`,
  dawn: `${BASE}/weather/dawn.png`,
  dusk: `${BASE}/weather/dusk.png`,
};

// ── Characters ─────────────────────────────────────────────────────────
// Every role this game currently has a title for. Add new roles here
// (and re-run the generator) — nothing downstream needs to change.
export const CHARACTER_ROLES = ["captain", "chief", "rookie", "firefighter", "dispatcher",
  "paramedic", "engineer", "mechanic", "police_officer", "civilian", "reporter",
  "flight_medic", "flight_nurse", "cct_physician", "cct_paramedic",
  "sheriff_deputy", "campus_emr", "supervisor"];
// "nonbinary" matches names.js's own NAME_POOL gender tag exactly (not
// "enby", which this constant used to say but nothing else in the codebase
// ever used) — portraitFor() in this file reads person.gender directly
// against that tag.
export const CHARACTER_GENDERS = ["male", "female", "nonbinary"];
export const CHARACTER_VARIANTS_PER_ROLE = 4; // 01–04: swap in different looks/ethnicities per slot

export const EXPRESSIONS = ["neutral", "happy", "smiling", "concerned", "angry",
  "surprised", "embarrassed", "thinking", "sad", "laughing"];
// holding_clipboard/holding_coffee added for the ZTH campaign's VN dialogue
// (App.jsx) — VNDialogue lines used to bundle a physical action into the
// spoken text itself ("hands you a clipboard..." / "leans in the doorway,
// holding a steaming cup of coffee..." ahead of the actual quote). Actions
// belong on the character's own sprite (VNSprite's `pose` prop), not in the
// dialogue text, so every new action needed its own pose here rather than
// staying prose.
export const POSES = ["idle", "arms_crossed", "pointing", "thinking", "celebrating",
  "walking", "holding_radio", "holding_hose", "holding_bag", "holding_stretcher", "kneeling",
  "holding_clipboard", "holding_coffee",
  // PATROL field-briefing classroom scene (campaignSupervisorClass, App.jsx)
  // — the supervisor physically demonstrates each layperson skill rather
  // than the scene just describing it in prose, so each demonstrated skill
  // gets its own pose badge the same way holding_clipboard/holding_coffee
  // did for campaignStation. Generic/reusable, not scene-specific art, same
  // as every other pose here — any future teaching or skills-lab scene can
  // reuse them.
  "demonstrating_cpr", "demonstrating_aed", "applying_tourniquet",
  "giving_rescue_breath", "holding_naloxone"];

// ── "Jason" — the ParamedicStories skit (campaignLaptop, App.jsx) ────────
// A single NAMED one-off character, not a role from CHARACTER_ROLES: the
// campaignLaptop scene has him playing several personas inside one recorded
// video (firefighter, the friend, the patient, himself breaking to camera),
// distinct enough that they need their own sprites rather than one portrait
// with a pose badge (VNSprite's `pose` prop is for a single character doing
// an incidental action, not an actor in a different costume/role entirely).
// See src/assets/characters/Jason.md for the full spec.
export const JASON_PERSONAS = ["firefighter", "as_friend", "as_patient", "as_himself"];
export function jasonSpritePath(persona) { return `${BASE}/characters/jason/${persona}.png`; }

/** Path to a character's base portrait. `variant` (1-based) picks which of
 * the numbered look-alikes to use — e.g. rotate 1-4 across NPCs of the same
 * role/gender so the roster doesn't look identical, or hand-pick a specific
 * variant once an artist has themed each slot (e.g. 01=White, 02=Black,
 * 03=Asian, 04=Hispanic) without renaming anything. */
export function portraitPath(role, gender, variant = 1) {
  const v = String(((variant - 1 + CHARACTER_VARIANTS_PER_ROLE) % CHARACTER_VARIANTS_PER_ROLE) + 1).padStart(2, "0");
  return `${BASE}/characters/portraits/${role}_${gender}_${v}.png`;
}
export function expressionPath(name) { return `${BASE}/characters/expressions/${name}.png`; }
export function posePath(name) { return `${BASE}/characters/poses/${name}.png`; }

// Deterministic variant picker — same person always renders with the same
// face across a session (hash their name/id rather than rolling random).
export function variantFor(seedKey) {
  let h = 0;
  for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  return (h % CHARACTER_VARIANTS_PER_ROLE) + 1;
}

// Maps the game's internal provider/crew titles to a portrait role key.
// Extend this as new titles get added rather than hardcoding lookups
// elsewhere.
export const TITLE_TO_ROLE = {
  "Captain": "captain", "Battalion Chief": "chief", "Chief": "chief",
  "Engineer": "engineer", "Firefighter": "firefighter", "Volly Firefighter": "firefighter",
  "Paramedic": "paramedic", "EMT": "firefighter", "AEMT": "firefighter", "EMR": "firefighter",
  "Rescue Officer": "firefighter", "Supervisor": "supervisor",
  "Flight Medic": "flight_medic", "Flight Nurse": "flight_nurse",
  "CCT Physician": "cct_physician", "CCT Paramedic": "cct_paramedic",
  "Officer": "police_officer", "Sergeant": "police_officer", "Deputy": "sheriff_deputy",
  "PSO": "campus_emr", "Campus EMR": "campus_emr",
  "Dispatcher": "dispatcher", "Mechanic": "mechanic", "Reporter": "reporter",
  // Zero-To-Hero campaign relationship roles (relationships.js's `role`
  // field, e.g. `createRelationship({role:"PATROL partner",...})`) — these
  // are freeform narrative role strings, not real provider titles, but
  // portraitFor() needs a mapping to actually render a sprite for them
  // rather than always falling back to "civilian". PATROL is a campus
  // safety/volunteer program, so its named NPCs read closest to the
  // existing campus_emr/supervisor art directions already used for
  // Campus EMR/PSO and every other Supervisor.
  "PATROL partner": "campus_emr", "PATROL supervisor": "supervisor",
  // CH1_STATION_ROSTER (chapter1.js) — the bike/golf-cart station-mates are
  // the same PATROL-EMR uniform as PATROL partner/Campus EMR above; foot
  // patrol is a Layperson volunteer role with no uniform, so it reads as
  // plain civilian rather than campus_emr.
  "Bike EMR": "campus_emr", "Cart crew": "campus_emr", "Foot Patrol": "civilian",
  // Chapter 4 (EMT School) relationship roles — same reasoning as PATROL's
  // pair above: freeform narrative strings need a mapping or they silently
  // fall back to "civilian". An instructor reads closest to the existing
  // Supervisor art direction; a classmate is just another student, the
  // plain civilian look.
  "EMT instructor": "supervisor", "EMT classmate": "civilian",
};
export function roleForTitle(title) { return TITLE_TO_ROLE[title] || "civilian"; }

/** One-call helper: give it a crew/patient person object ({title or role,
 * name/id, gender}) and get back a stable portrait path. Falls back to the
 * generic civilian look if gender is unknown. */
export function portraitFor(person) {
  const role = person.role ? roleForTitle(person.role) : "civilian";
  const gender = person.gender === "female" ? "female"
    : person.gender === "nonbinary" ? "nonbinary" : "male";
  const variant = variantFor(person.id || person.name || person.fullName || role);
  return portraitPath(role, gender, variant);
}

// ── Player character portrait (F32b, expanded to a layered system) ─────
// The Zero-To-Hero "who are you" customization screen (campaignCustomize,
// App.jsx) shows one big preview image that updates live as the player
// cycles gender / skin tone / hairstyle / hair color / eye color / outfit
// with arrow buttons. This USED to be one flat file per full combination
// (gender_skin_hair_outfit.png) — fine at 180 files, but adding hair color
// and eye color as further axes on top of more hairstyles/outfits would
// have multiplied it into the thousands. Now it's four independently
// generated LAYERS (base body, outfit, hair, eyes) composited at render
// time — see playerBasePath/playerOutfitLayerPath/playerHairLayerPath/
// playerEyesLayerPath below, stacked base -> outfit -> hair -> eyes.
// Counts ADD across layers instead of multiplying (a new hairstyle only
// costs PLAYER_HAIR_COLORS.length new files, not the product of every
// other axis). See scripts/generate_placeholders.py and
// src/assets/ui/CampaignCustomize.md.
export const PLAYER_GENDERS = ["male", "female", "nonbinary"];
export const PLAYER_SKIN_TONES = ["light", "medium", "tan", "dark"];
export const PLAYER_HAIR_STYLES = ["short", "long", "curly", "buzzed", "ponytail", "halfup", "braided", "bun"];
export const PLAYER_HAIR_COLORS = ["black", "brown", "blonde", "red", "auburn", "gray"];
export const PLAYER_EYE_COLORS = ["brown", "blue", "green", "hazel", "gray", "amber"];
export const PLAYER_OUTFITS = ["hoodie", "tshirt", "lightjacket", "dress", "sweater", "tanktop", "turtleneck"];
// "turtleneck" (App.jsx's OUTFIT array label "Turtleneck") added on top of
// the original 6 — a ribbed turtleneck with suspender straps, sourced from
// female-character-sprite-creator's "Clothes 17", picked by direct visual
// review the same way every other PLAYER_OUTFITS entry was (see
// scripts/build_player_outfits_remaining_from_cc0.py's sibling script for
// this one). Customization options are meant to keep growing here as good
// source garments turn up — not a fixed, closed list.
// Outfit gets the same style x color split as hair (below), not a flat
// per-outfit color — reuses the identical "counts add, not multiply"
// reasoning for the same reason.
export const PLAYER_OUTFIT_COLORS = ["black", "gray", "navy", "white", "red", "olive"];
// A genuinely NEW 5th customization axis, not a placeholder fill for an
// already-reserved slot — added per explicit operator instruction ("more
// customization options = better, keep adding them as you come upon them").
// "none" is a real, selectable option (most characters won't wear glasses),
// not a fallback — see PLAYER_GLASSES_COLORS below and the App.jsx
// GLASSES/GLASSES COLOR rows, which only show a color row once a real style
// is picked. Reuses PLAYER_OUTFIT_COLORS as the frame-color palette rather
// than a separate array — a red or navy frame is a real, fun choice, not
// just code reuse for its own sake (see this project's own tone note about
// welcoming cuteness/fun, not just muted/serious presentation).
export const PLAYER_GLASSES_STYLES = ["none", "oval", "browline", "round", "square", "safety"];
export const PLAYER_GLASSES_COLORS = PLAYER_OUTFIT_COLORS;
// A 6th axis, same "more options = better" instruction as glasses. Unlike
// glasses, earrings use the pack's own NATIVE source-to-canvas offset with
// no override — confirmed by a real composite check that this pack's base
// body and its Earring/Glasses/Head folders already share one coordinate
// system, unlike the separately-sourced eyes layer glasses had to work
// around. Rendered UNDER hair (see the layer order in playerPortraitLayers
// below) — a real composite check showed an earring drawn ON TOP of a long
// hairstyle reads as floating on the hair rather than worn on the ear;
// letting hair occlude part of the earring, the way real hair does, reads
// correctly.
export const PLAYER_EARRING_STYLES = ["none", "stud", "hoop", "heart"];
export const PLAYER_EARRING_COLORS = PLAYER_OUTFIT_COLORS;
// A 7th axis, same instruction. Four styles picked from the pack's own 14
// (a plain cross pendant was deliberately skipped to avoid favoring one
// specific religious symbol with no equivalent representation for others;
// a second wrapped-scarf silhouette near-identical to "scarf" below was
// skipped as a near-duplicate). Uses the pack's native offset like earrings
// (no override needed — same coordinate system as the base body), and
// renders UNDER hair for the same reason earrings do (a real composite
// check found no visible difference for this pack's own hairstyles, since
// none of them drape low enough to reach the collar, but "under" is the
// safer default for any longer style added later).
export const PLAYER_NECKLACE_STYLES = ["none", "heart", "scarf", "pendant", "shell"];
export const PLAYER_NECKLACE_COLORS = PLAYER_OUTFIT_COLORS;
// An 8th axis. The female pack's own Hats folder had only one real style
// (the wide-brim sun hat below) — the other two subfolders turned out, on
// direct inspection, to be a small symmetric two-piece accessory near the
// top-sides of the head (most likely hair ties/clips despite the folder
// name), not hats, and were skipped rather than mislabeled. Three more
// real, general-purpose styles were found in the OTHER sprite-creator pack
// (male-character-sprite-creator's own Hats folder, which turned out to
// have far more genuine hat variety than the female pack's) and are built
// by a second script, scripts/build_player_hat_styles2_from_cc0.py — see
// its own header for the full sourcing/skip reasoning (a santa hat, swim
// goggles, and holiday hair-berries from that same folder were all skipped
// as seasonal/costume, wrong register for this screen) and the real,
// separately-measured positioning offset each of these three needed (that
// pack's own base body is placed by a dynamic bbox-centered transform, not
// the female pack's fixed additive offset — confirmed correct on BOTH
// genders' base bodies by a direct composite check, not assumed). Every
// style here — sun hat included — renders ON TOP of hair, like glasses.
export const PLAYER_HAT_STYLES = ["none", "sun", "cap", "beanie", "headphones"];
export const PLAYER_HAT_COLORS = PLAYER_OUTFIT_COLORS;
export function playerBasePath(gender, skin) {
  return `${BASE}/characters/player/base/${gender}_${skin}.png`;
}
export function playerOutfitLayerPath(outfit, outfitColor) {
  return `${BASE}/characters/player/outfit/${outfit}_${outfitColor}.png`;
}
export function playerHairLayerPath(hairStyle, hairColor) {
  return `${BASE}/characters/player/hair/${hairStyle}_${hairColor}.png`;
}
export function playerEyesLayerPath(eyeColor) {
  return `${BASE}/characters/player/eyes/${eyeColor}.png`;
}
// Returns null for "none" (or an unset style) — the one player layer that
// is legitimately optional; playerPortraitLayers() below filters the null
// out rather than rendering a broken <img>.
export function playerGlassesLayerPath(glassesStyle, glassesColor) {
  if (!glassesStyle || glassesStyle === "none") return null;
  return `${BASE}/characters/player/glasses/${glassesStyle}_${glassesColor}.png`;
}
// Same "none" contract as playerGlassesLayerPath above.
export function playerEarringLayerPath(earringStyle, earringColor) {
  if (!earringStyle || earringStyle === "none") return null;
  return `${BASE}/characters/player/earrings/${earringStyle}_${earringColor}.png`;
}
// Same "none" contract.
export function playerNecklaceLayerPath(necklaceStyle, necklaceColor) {
  if (!necklaceStyle || necklaceStyle === "none") return null;
  return `${BASE}/characters/player/necklaces/${necklaceStyle}_${necklaceColor}.png`;
}
// Same "none" contract.
export function playerHatLayerPath(hatStyle, hatColor) {
  if (!hatStyle || hatStyle === "none") return null;
  return `${BASE}/characters/player/hats/${hatStyle}_${hatColor}.png`;
}
// Turns a customize-screen display label ("Half Up", "T-Shirt") into the
// plain lowercase-no-punctuation tag the layer filenames use — the same
// rule campaignCustomize's own local `slug` used to duplicate inline.
function slugPlayerAttr(v) { return v.toLowerCase().replace(/[^a-z0-9]/g, ""); }
const PLAYER_GENDER_TAG = { Male: "male", Female: "female", "Non-binary": "nonbinary" };
// One-call helper: give it the raw g.playerGender label and g.campaignAppearance
// object and get back the layer paths (base, outfit, earrings, necklace,
// hair, eyes, glasses, hat — this exact order: earrings and necklace both
// sit under hair, glasses and hat both sit over everything, hat last of
// all since it's the outermost/topmost real-world layer) ready to stack
// bottom-to-top, or null if any required attribute hasn't been chosen yet.
// The single source of truth for "is the player's look fully specified"
// and "what are the layer paths" — campaignCustomize's own preview and
// F8's VNSprite `layers` reuse elsewhere in the campaign both call this
// instead of each re-deriving the same slugging/gender-tag logic.
export function playerPortraitLayers(gender, appearance) {
  const app = appearance || {};
  const genderTag = PLAYER_GENDER_TAG[gender];
  if (!genderTag || !app.skinTone || !app.hairStyle || !app.hairColor || !app.eyeColor || !app.outfit || !app.outfitColor) return null;
  const s = slugPlayerAttr;
  // `glasses`/`earrings`/`necklace`/`hat` are deliberately NOT in the
  // required-fields check above, unlike every other attribute —
  // campaignCustomize's own canConfirm gate (App.jsx) separately forces a
  // NEW character to pick a real value (including "None") before Confirm
  // enables, matching this screen's "nothing pre-answered" rule. But this
  // function is also called for every ALREADY-CONFIRMED save's portrait
  // (VNSprite reuse elsewhere in the campaign) — a save from before any of
  // these axes existed has no app.glasses/app.earrings/app.necklace/app.hat
  // field at all, and treating that as "portrait incomplete, render
  // nothing" would silently blank out an already-working, already-shipped
  // portrait. So here, missing/unset/"None" all mean the same thing: no
  // layer, not a blocked render.
  const glassesStyle = app.glasses ? s(app.glasses) : "none";
  const earringStyle = app.earrings ? s(app.earrings) : "none";
  const necklaceStyle = app.necklace ? s(app.necklace) : "none";
  const hatStyle = app.hat ? s(app.hat) : "none";
  return [
    playerBasePath(genderTag, s(app.skinTone)),
    playerOutfitLayerPath(s(app.outfit), s(app.outfitColor)),
    playerEarringLayerPath(earringStyle, app.earringsColor ? s(app.earringsColor) : null),
    playerNecklaceLayerPath(necklaceStyle, app.necklaceColor ? s(app.necklaceColor) : null),
    playerHairLayerPath(s(app.hairStyle), s(app.hairColor)),
    playerEyesLayerPath(s(app.eyeColor)),
    playerGlassesLayerPath(glassesStyle, app.glassesColor ? s(app.glassesColor) : null),
    playerHatLayerPath(hatStyle, app.hatColor ? s(app.hatColor) : null),
  ].filter(Boolean);
}

// ── Vehicles ─────────────────────────────────────────────────────────
export const VEHICLE_ART = {
  engine: `${BASE}/vehicles/fire_engine.png`,
  ladder: `${BASE}/vehicles/ladder_truck.png`,
  rescue: `${BASE}/vehicles/rescue_truck.png`,
  battalion: `${BASE}/vehicles/battalion_suv.png`,
  squad: `${BASE}/vehicles/medic_squad.png`,
  bls: `${BASE}/vehicles/bls_ambulance.png`,
  als: `${BASE}/vehicles/als_ambulance.png`,
  criticalCare: `${BASE}/vehicles/critical_care_unit.png`,
  criticalCareChase: `${BASE}/vehicles/critical_care_chase.png`,
  pdcar: `${BASE}/vehicles/pd_patrol_car.png`,
  sergeantCar: `${BASE}/vehicles/police_sergeant_car.png`,
  shercar: `${BASE}/vehicles/sheriff_patrol_car.png`,
  bike: `${BASE}/vehicles/campus_pso_bike.png`,
  pickup: `${BASE}/vehicles/volunteer_pickup.png`,
  chase: `${BASE}/vehicles/volunteer_chase_car.png`,
  golfcart: `${BASE}/vehicles/campus_golf_cart.png`,
  suv: `${BASE}/vehicles/supervisor_suv.png`,
  helo: `${BASE}/vehicles/air_medical_helicopter.png`,
  civilian: `${BASE}/vehicles/civilian_car.png`,
  // F16: fleet.js's pdMoto unit kind uses vehicle.type "motorcycle" — this
  // key was simply never declared, so vehicleArt("motorcycle") silently fell
  // back to the generic placeholder for every motorcycle unit that ever
  // appeared. See src/assets/vehicles/README.md for the full note.
  motorcycle: `${BASE}/vehicles/police_motorcycle.png`,
};
export function vehicleArt(type) { return VEHICLE_ART[type] || PLACEHOLDERS.generic; }

// ── Equipment ────────────────────────────────────────────────────────
export const EQUIPMENT_ART = Object.fromEntries(["defibrillator", "iv_bag", "o2_tank",
  "stretcher", "bvm", "cardiac_monitor", "drug_bag", "airway_bag", "trauma_bag",
  "handheld_radio", "shears", "penlight", "stethoscope", "glucometer", "pulse_oximeter",
  "backboard", "splint", "tourniquet"].map(k => [k, `${BASE}/equipment/${k}.png`]));

// ── Emergencies & story events ─────────────────────────────────────────
export const EMERGENCY_ART = Object.fromEntries(["structure_fire", "vehicle_collision",
  "medical_emergency", "hazmat_spill", "water_rescue", "cardiac_arrest", "trench_rescue",
  "wildland_fire", "mass_casualty"].map(k => [k, `${BASE}/emergencies/${k}.png`]));
export const EVENT_ART = Object.fromEntries(["promotion", "training_day", "argument",
  "birthday", "equipment_failure", "station_inspection", "storm", "graduation",
  "retirement", "funeral", "award_ceremony"].map(k => [k, `${BASE}/events/${k}.png`]));

// ── UI chrome ────────────────────────────────────────────────────────
export const UI_ART = Object.fromEntries(["dialogue_box", "notification", "loading_spinner",
  "cursor_default", "cursor_pointer", "portrait_frame", "nameplate", "speech_bubble",
  "choice_box", "button_primary", "button_secondary", "panel_background", "tooltip",
  "progress_bar", "tab_active", "tab_inactive"].map(k => [k, `${BASE}/ui/${k}.png`]));

// ── Gameplay icons ───────────────────────────────────────────────────
export const ICON_ART = Object.fromEntries(["fire", "water", "fuel", "experience",
  "promotion", "relationship", "heart", "badge", "money", "reputation", "health",
  "stress", "energy", "clock", "star", "warning", "checkmark", "locked"]
  .map(k => [k, `${BASE}/icons/${k}.png`]));

// ── Learning-mode key art (F16, per the pre-existing MasterOfYourScopeMode.md
// / ZeroToHeroMode.md specs in src/assets/ui/ — those specs existed before
// this map did) ───────────────────────────────────────────────────────
export const MODE_ART = {
  zth: `${BASE}/ui/mode_zero_to_hero.png`,
  mos: `${BASE}/ui/mode_master_of_scope.png`,
};

// ── Achievement badges ───────────────────────────────────────────────
export const ACHIEVEMENT_ART = Object.fromEntries(["first_rescue", "calls_completed_100",
  "became_captain", "perfect_shift", "heroic_action", "became_chief", "first_save",
  "no_losses_streak", "five_star_review", "ems_wannabe", "not_so_ems",
  "declined_patrol_first", "declined_patrol_twice", "gassy_food"].map(k => [k, `${BASE}/achievements/${k}.png`]));

// ── Audio ────────────────────────────────────────────────────────────
export const AUDIO = Object.fromEntries(["menu_music", "station_ambience", "fire_alarm",
  "radio_chatter", "truck_siren", "button_click", "achievement", "notification",
  "dispatch_tone", "heart_monitor_beep"].map(k => [k, `${BASE}/audio/${k}.wav`]));

// ── Fallbacks ────────────────────────────────────────────────────────
export const PLACEHOLDERS = {
  generic: `${BASE}/placeholders/generic.png`,
  missingPortrait: `${BASE}/placeholders/missing_portrait.png`,
  loading: `${BASE}/placeholders/loading.png`,
  companyLogo: `${BASE}/placeholders/company_logo.png`,
  gameLogo: `${BASE}/placeholders/game_logo.png`,
  saveIcon: `${BASE}/placeholders/save_icon.png`,
};

/** Attach to an <img onError={...}> to gracefully fall back instead of
 * showing a broken-image icon if a path is ever wrong or not yet added. */
export function onImgError(e) {
  if (e.target.src.endsWith(PLACEHOLDERS.missingPortrait)) return; // avoid loop
  e.target.src = PLACEHOLDERS.missingPortrait;
}

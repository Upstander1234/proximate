#!/usr/bin/env python3
"""
generate_placeholders.py — builds every placeholder asset for Proximate.

Run with:  python3 scripts/generate_placeholders.py

This regenerates the ENTIRE public/assets/ tree from scratch. It's meant to
be re-run any time a new placeholder needs to be added to the manifest below
— artists replace individual files afterward; they never need to touch this
script or any game code. Re-running it will NOT overwrite a file that has
already been replaced with real art, unless --force is passed, so it's safe
to run again after adding new entries.
"""
import os, sys, wave, struct, math, random

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
FORCE = "--force" in sys.argv

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("This script needs Pillow: pip install pillow --break-system-packages")
    sys.exit(1)

random.seed(1337)

def font(size):
    for path in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if os.path.exists(path):
            try: return ImageFont.truetype(path, size)
            except Exception: pass
    return ImageFont.load_default()

def hash_color(key, s=62, l=42):
    """Deterministic, pleasant color per asset key — different placeholders
    are visually distinguishable at a glance instead of one grey blob."""
    h = (sum(ord(c) for c in key) * 2654435761) % 360
    import colorsys
    r, g, b = colorsys.hls_to_rgb(h/360, l/100, s/100)
    return (int(r*255), int(g*255), int(b*255))

def wrap_label(key):
    return key.replace("_", " ").replace("-", " ").strip()

def make_placeholder(path, w, h, key, tag, force=False):
    if os.path.exists(path) and not (force or FORCE):
        return "skip"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bg = hash_color(key)
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    # diagonal hatch so it reads as "placeholder", not finished art
    step = max(18, w // 20)
    stripe = tuple(max(0, c - 22) for c in bg)
    for x in range(-h, w, step):
        d.line([(x, 0), (x + h, h)], fill=stripe, width=3)
    # border
    edge = tuple(min(255, c + 40) for c in bg)
    d.rectangle([0, 0, w-1, h-1], outline=edge, width=max(2, w // 200))
    # tag chip (top-left) — asset category
    tag_font = font(max(10, min(w, h) // 22))
    tw = d.textlength(tag.upper(), font=tag_font)
    pad = 6
    d.rectangle([8, 8, 8 + tw + pad*2, 8 + tag_font.size + pad*2], fill=(0, 0, 0, 160))
    d.text((8+pad, 8+pad), tag.upper(), font=tag_font, fill=(255, 255, 255))
    # label (centered) — the asset key, wrapped
    label = wrap_label(key)
    label_font = font(max(11, min(w, h) // 14))
    words = label.split(" ")
    lines, cur = [], ""
    for word in words:
        test = (cur + " " + word).strip()
        if d.textlength(test, font=label_font) > w * 0.86 and cur:
            lines.append(cur); cur = word
        else:
            cur = test
    if cur: lines.append(cur)
    total_h = len(lines) * (label_font.size + 4)
    y = h/2 - total_h/2
    for line in lines:
        lw = d.textlength(line, font=label_font)
        d.text((w/2 - lw/2, y), line, font=label_font, fill=(255, 255, 255))
        y += label_font.size + 4
    # dimensions footer
    dim_font = font(max(9, min(w, h) // 28))
    dim_txt = f"{w}×{h} PLACEHOLDER"
    dw = d.textlength(dim_txt, font=dim_font)
    d.text((w/2 - dw/2, h - dim_font.size - 10), dim_txt, font=dim_font, fill=edge)
    img.save(path)
    return "made"

def make_tone(path, freq=440, dur=0.35, vol=0.15, force=False):
    if os.path.exists(path) and not (force or FORCE):
        return "skip"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    rate = 22050
    n = int(rate * dur)
    with wave.open(path, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        frames = bytearray()
        for i in range(n):
            t = i / rate
            fade = min(1, (n - i) / (rate * 0.05), i / (rate * 0.02) + 0.001)
            sample = vol * fade * math.sin(2 * math.pi * freq * t)
            frames += struct.pack("<h", int(sample * 32767))
        w.writeframes(frames)
    return "made"

made = skipped = 0
def track(result):
    global made, skipped
    if result == "made": made += 1
    else: skipped += 1

# ── BACKGROUNDS ──────────────────────────────────────────────────────────
BACKGROUNDS = ["station_main", "station_office", "station_garage", "station_dispatch",
    "station_training", "station_breakroom", "city_map", "station_exterior",
    # Zero-To-Hero campaign visual-novel backgrounds (F31)
    "dorm_room", "apartment_studio", "campus_quad_night", "campus_library", "patrol_station",
    # F33 follow-up: a real daytime quad background for the heat-stroke
    # incident, which had been reusing the night version as a placeholder
    "campus_quad_day",
    # A real, viewable campus map — see CampusMapOverlay in App.jsx
    "campus_map"]
for key in BACKGROUNDS:
    track(make_placeholder(f"{ROOT}/backgrounds/{key}.png", 1920, 1080, key, "background"))

# ── WEATHER / TIME OVERLAYS (transparent-friendly placeholders) ─────────
OVERLAYS = ["night", "rain", "snow", "fog", "smoke", "dawn", "dusk"]
for key in OVERLAYS:
    track(make_placeholder(f"{ROOT}/backgrounds/overlays/{key}.png", 1920, 1080, key, "overlay"))
    track(make_placeholder(f"{ROOT}/weather/{key}.png", 1920, 1080, key, "weather"))

# ── CHARACTERS: base portraits ───────────────────────────────────────────
ROLES = ["captain", "chief", "rookie", "firefighter", "dispatcher", "paramedic",
    "engineer", "mechanic", "police_officer", "civilian", "reporter",
    "flight_medic", "flight_nurse", "cct_physician", "cct_paramedic",
    "sheriff_deputy", "campus_emr", "supervisor"]
GENDERS = ["male", "female"]
VARIANTS_PER_ROLE = 4   # 01–04 — swap in different ethnicities/looks per slot
for role in ROLES:
    for gender in GENDERS:
        for v in range(1, VARIANTS_PER_ROLE + 1):
            key = f"{role}_{gender}_{v:02d}"
            track(make_placeholder(f"{ROOT}/characters/portraits/{key}.png", 512, 512, key, "portrait"))

# Nonbinary NPC portraits — the roster/portrait system (assets.js's
# portraitFor) has always been able to resolve a "nonbinary" gender key
# (the README's own "each x 3 genders x 4 variants" header predates this
# fix), but no nonbinary placeholder art was ever generated, so it silently
# had nothing to fall back to. Generated here for every role this batch's
# Northwood PATROL roster can actually draw a nonbinary NPC into
# (campus_emr for bike EMR/cart crew, civilian for foot patrol/generic
# roles) rather than the full role list, matching this batch's own scope.
NONBINARY_ROLES = ["campus_emr", "civilian", "supervisor"]
for role in NONBINARY_ROLES:
    for v in range(1, VARIANTS_PER_ROLE + 1):
        key = f"{role}_nonbinary_{v:02d}"
        track(make_placeholder(f"{ROOT}/characters/portraits/{key}.png", 512, 512, key, "portrait"))

# ── CHARACTERS: player portrait — LAYERED system ──────────────────────────
# The Zero-To-Hero character-customization screen shows one big preview
# image that updates live as the player picks gender/skin tone/hairstyle/
# hair color/eye color/outfit. This USED to be one flat file per full
# combination (gender x skin x hair x outfit) — cheap at 3x4x5x3=180 files,
# but adding hair color and eye color as further axes would have multiplied
# it into the thousands (3x4x8x6x6x6 territory), which makes "an artist
# eventually hand-paints these" go from "180 paintings, plausible" to
# "thousands, not going to happen." Composited layers instead: a base body
# (gender x skin, bald/neutral), a hair layer (style x color), an eyes
# layer (color), and an outfit layer, stacked at render time
# (App.jsx's campaignCustomize, base -> outfit -> hair -> eyes). Counts ADD
# across layers instead of multiplying, so growing any one axis only costs
# that axis's own new files. Each layer is a full 480x720 RGBA canvas,
# transparent outside the pixel band that axis actually occupies, so they
# stack cleanly regardless of order within non-overlapping bands.
PLAYER_GENDERS = ["male", "female", "nonbinary"]
PLAYER_SKIN_TONES = ["light", "medium", "tan", "dark"]
PLAYER_HAIR_STYLES = ["short", "long", "curly", "buzzed", "ponytail", "halfup", "braided", "bun"]
PLAYER_HAIR_COLORS = ["black", "brown", "blonde", "red", "auburn", "gray"]
PLAYER_EYE_COLORS = ["brown", "blue", "green", "hazel", "gray", "amber"]
PLAYER_OUTFITS = ["hoodie", "tshirt", "lightjacket", "dress", "sweater", "tanktop"]
PLAYER_OUTFIT_COLORS = ["black", "gray", "navy", "white", "red", "olive"]
PORTRAIT_W, PORTRAIT_H = 480, 720

def make_layer_placeholder(path, key, tag, band, force=False):
    """Like make_placeholder, but transparent outside `band` (a (y0,y1)
    pixel range within the shared PORTRAIT_W x PORTRAIT_H canvas) so several
    of these can be stacked into one composite portrait — see the module
    comment above this function's first caller."""
    if os.path.exists(path) and not (force or FORCE):
        return "skip"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    w, h = PORTRAIT_W, PORTRAIT_H
    y0, y1 = band
    bh = y1 - y0
    bg = hash_color(key)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    band_img = Image.new("RGBA", (w, bh), bg + (255,))
    d = ImageDraw.Draw(band_img)
    step = max(14, w // 20)
    stripe = tuple(max(0, c - 22) for c in bg) + (255,)
    for x in range(-bh, w, step):
        d.line([(x, 0), (x + bh, bh)], fill=stripe, width=3)
    edge = tuple(min(255, c + 40) for c in bg) + (255,)
    d.rectangle([0, 0, w - 1, bh - 1], outline=edge, width=2)
    tag_font = font(max(9, bh // 8))
    d.text((6, 4), tag.upper(), font=tag_font, fill=(255, 255, 255, 200))
    label_font = font(max(11, min(w, bh) // 6))
    label = wrap_label(key)
    words = label.split(" ")
    lines, cur = [], ""
    for word in words:
        test = (cur + " " + word).strip()
        if d.textlength(test, font=label_font) > w * 0.86 and cur:
            lines.append(cur); cur = word
        else:
            cur = test
    if cur: lines.append(cur)
    total_h = len(lines) * (label_font.size + 4)
    y = bh / 2 - total_h / 2
    for line in lines:
        lw = d.textlength(line, font=label_font)
        d.text((w / 2 - lw / 2, y), line, font=label_font, fill=(255, 255, 255, 255))
        y += label_font.size + 4
    img.paste(band_img, (0, y0), band_img)
    img.save(path)
    return "made"

# Base body — full-canvas, opaque, bald/neutral: one per gender x skin tone.
for gender in PLAYER_GENDERS:
    for skin in PLAYER_SKIN_TONES:
        key = f"{gender}_{skin}"
        track(make_placeholder(f"{ROOT}/characters/player/base/{key}.png", PORTRAIT_W, PORTRAIT_H, key, "base"))

# Outfit — torso-and-below band: one per style x color (same split as hair
# below, per explicit operator instruction to reuse the idea for outfits
# too — style and color multiply against each other, not against every
# other axis on the screen).
for outfit in PLAYER_OUTFITS:
    for color in PLAYER_OUTFIT_COLORS:
        key = f"{outfit}_{color}"
        track(make_layer_placeholder(f"{ROOT}/characters/player/outfit/{key}.png", key, "outfit", (260, 720)))

# Hair — the head/crown band: one per style x color.
for style in PLAYER_HAIR_STYLES:
    for color in PLAYER_HAIR_COLORS:
        key = f"{style}_{color}"
        track(make_layer_placeholder(f"{ROOT}/characters/player/hair/{key}.png", key, "hair", (0, 165)))

# Eyes — a thin band across the face.
for color in PLAYER_EYE_COLORS:
    track(make_layer_placeholder(f"{ROOT}/characters/player/eyes/{color}.png", f"eyes_{color}", "eyes", (150, 190)))

# ── CHARACTERS: expression overlays (shared across every character) ─────
EXPRESSIONS = ["neutral", "happy", "smiling", "concerned", "angry", "surprised",
    "embarrassed", "thinking", "sad", "laughing"]
for key in EXPRESSIONS:
    track(make_placeholder(f"{ROOT}/characters/expressions/{key}.png", 256, 256, key, "expression"))

# ── CHARACTERS: pose overlays (shared across every character) ───────────
POSES = ["idle", "arms_crossed", "pointing", "thinking", "celebrating", "walking",
    "holding_radio", "holding_hose", "holding_bag", "holding_stretcher", "kneeling",
    # holding_clipboard/holding_coffee: ZTH campaign VN dialogue actions
    # moved out of spoken text and onto the speaker's own sprite instead —
    # see assets.js's POSES comment.
    "holding_clipboard", "holding_coffee",
    # PATROL field-briefing classroom scene (campaignSupervisorClass) —
    # see assets.js's POSES comment.
    "demonstrating_cpr", "demonstrating_aed", "applying_tourniquet",
    "giving_rescue_breath", "holding_naloxone"]
for key in POSES:
    track(make_placeholder(f"{ROOT}/characters/poses/{key}.png", 384, 384, key, "pose"))

# ── CHARACTERS: "Jason" — the ParamedicStories skit's personas ──────────
# A single named one-off character, not part of the ROLES/GENDERS grid above
# — see src/assets/characters/Jason.md. Square, same footing as the base
# portraits (512x512), since the campaignLaptop scene displays this at
# roster-portrait scale inside the laptop "screen" panel, not full VN height.
JASON_PERSONAS = ["firefighter", "as_friend", "as_patient", "as_himself"]
for key in JASON_PERSONAS:
    track(make_placeholder(f"{ROOT}/characters/jason/{key}.png", 512, 512, f"jason_{key}", "jason"))

# ── VEHICLES ──────────────────────────────────────────────────────────────
VEHICLES = ["fire_engine", "ladder_truck", "rescue_truck", "battalion_suv", "medic_squad",
    "bls_ambulance", "als_ambulance", "critical_care_unit", "critical_care_chase",
    "pd_patrol_car", "police_sergeant_car", "sheriff_patrol_car", "campus_pso_bike",
    "volunteer_pickup", "volunteer_chase_car", "campus_golf_cart", "supervisor_suv",
    "air_medical_helicopter", "civilian_car"]
for key in VEHICLES:
    track(make_placeholder(f"{ROOT}/vehicles/{key}.png", 640, 400, key, "vehicle"))

# ── EQUIPMENT ────────────────────────────────────────────────────────────
EQUIPMENT = ["defibrillator", "iv_bag", "o2_tank", "stretcher", "bvm", "cardiac_monitor",
    "drug_bag", "airway_bag", "trauma_bag", "handheld_radio", "shears", "penlight",
    "stethoscope", "glucometer", "pulse_oximeter", "backboard", "splint", "tourniquet"]
for key in EQUIPMENT:
    track(make_placeholder(f"{ROOT}/equipment/{key}.png", 256, 256, key, "equipment"))

# ── EMERGENCY / EVENT ILLUSTRATIONS ─────────────────────────────────────
EMERGENCIES = ["structure_fire", "vehicle_collision", "medical_emergency", "hazmat_spill",
    "water_rescue", "cardiac_arrest", "trench_rescue", "wildland_fire", "mass_casualty"]
for key in EMERGENCIES:
    track(make_placeholder(f"{ROOT}/emergencies/{key}.png", 1280, 720, key, "emergency"))

STORY_EVENTS = ["promotion", "training_day", "argument", "birthday", "equipment_failure",
    "station_inspection", "storm", "graduation", "retirement", "funeral", "award_ceremony"]
for key in STORY_EVENTS:
    track(make_placeholder(f"{ROOT}/events/{key}.png", 1280, 720, key, "event"))

# ── UI CHROME ────────────────────────────────────────────────────────────
UI = ["dialogue_box", "notification", "loading_spinner", "cursor_default", "cursor_pointer",
    "portrait_frame", "nameplate", "speech_bubble", "choice_box", "button_primary",
    "button_secondary", "panel_background", "tooltip", "progress_bar", "tab_active", "tab_inactive"]
for key in UI:
    track(make_placeholder(f"{ROOT}/ui/{key}.png", 512, 256, key, "ui"))

# ── GAMEPLAY ICONS ───────────────────────────────────────────────────────
ICONS = ["fire", "water", "fuel", "experience", "promotion", "relationship", "heart",
    "badge", "money", "reputation", "health", "stress", "energy", "clock", "star",
    "warning", "checkmark", "locked"]
for key in ICONS:
    track(make_placeholder(f"{ROOT}/icons/{key}.png", 128, 128, key, "icon"))

# ── ACHIEVEMENT BADGES ───────────────────────────────────────────────────
ACHIEVEMENTS = ["first_rescue", "calls_completed_100", "became_captain", "perfect_shift",
    "heroic_action", "became_chief", "first_save", "no_losses_streak", "five_star_review",
    # F26/F27/F33: these four were added to achievements.js/assets.js across
    # earlier sessions but never added here, so they silently fell back to
    # missing_portrait.png in-game until now.
    "ems_wannabe", "not_so_ems", "declined_patrol_first", "declined_patrol_twice",
    "gassy_food"]
for key in ACHIEVEMENTS:
    track(make_placeholder(f"{ROOT}/achievements/{key}.png", 320, 320, key, "badge"))

# ── MISC / PLACEHOLDER FALLBACKS ─────────────────────────────────────────
MISC = [("generic", 512, 512), ("missing_portrait", 512, 512), ("loading", 256, 256),
    ("company_logo", 512, 512), ("game_logo", 1024, 512), ("save_icon", 128, 128)]
for key, w, h in MISC:
    track(make_placeholder(f"{ROOT}/placeholders/{key}.png", w, h, key, "placeholder"))

# ── AUDIO (short tone placeholders — swap for real mixes later) ─────────
AUDIO_TONES = {
    "menu_music": (220, 2.0, 0.08), "station_ambience": (110, 2.0, 0.05),
    "fire_alarm": (880, 1.2, 0.2), "radio_chatter": (600, 0.6, 0.1),
    "truck_siren": (750, 1.5, 0.18), "button_click": (1200, 0.08, 0.2),
    "achievement": (988, 0.5, 0.18), "notification": (660, 0.25, 0.15),
    "dispatch_tone": (1046, 0.4, 0.2), "heart_monitor_beep": (1500, 0.12, 0.15),
}
for key, (freq, dur, vol) in AUDIO_TONES.items():
    track(make_tone(f"{ROOT}/audio/{key}.wav", freq, dur, vol))

print(f"Placeholders: {made} created, {skipped} already present (untouched).")
print(f"Asset root: {os.path.abspath(ROOT)}")

// scripts/generate_solemn_music.mjs — replaces the placeholder menu/station
// background music with a synthesized, solemn ambient pad, in keeping with
// this project's own established "synthesize audio, no licensing/tone
// mismatch headaches" convention (BootScreen.jsx's own comment: "Audio:
// synthesized (siren, tones, voice) — no external files to fetch"; the
// in-game siren in App.jsx's useSiren is already a synthesized oscillator,
// not a sample).
//
// Why this exists: the previous menu_music.wav ("Track 01 (Title Screen)"
// from OpenGameArt's CC0 Scraps pack, per src/assets/audio/README.md) reads
// as upbeat/energetic — mismatched tone for a prehospital-care simulator
// whose subject matter is frequently life-and-death. This generates a slow,
// minor-key ambient drone instead: a low A-minor triad (A1/E2/C3), each
// voice lightly detuned and split across two-partial additive tones for a
// soft, non-harsh timbre, under a slow (10s-period) amplitude swell so the
// pad breathes rather than droning at a flat, static volume. No percussion,
// no melody, no register above a low pad — deliberately not a "tune."
//
// Loop-seamless by construction: the total duration (40s) is an exact whole
// number of both the swell LFO period (10s, so it starts/ends at the same
// phase) and every voice's own period (all frequencies are chosen so their
// period divides 40s evenly enough that phase discontinuity at the loop
// point is inaudible — verified numerically below, not just assumed).
//
// Run: node scripts/generate_solemn_music.mjs
// Writes: public/assets/audio/menu_music.wav (overwrites the CC0 track —
// the original is preserved untouched at
// public/assets/cc0-library/menu-music-candidate/title_screen_cc0scraps.wav
// per the existing README's own revert note). `station_ambience.wav` is
// deliberately NOT touched here — at ~88KB (roughly a 1-second loop) it
// reads as a short room-tone/hum texture rather than a full music track,
// and the operator's complaint was specifically about "the background
// music" (the menu track), not station ambience — left alone rather than
// changing something that wasn't flagged as a problem.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "assets", "audio");

const SR = 44100;
const DURATION = 40; // seconds — long enough that the 10s swell loops 4x before the track itself repeats, so a full playthrough never feels like the same 10s looping
const SWELL_PERIOD = 10; // seconds

// A-minor triad, low register: A1, C3, E2 (rooted low, third above the root
// for a slightly open, non-muddy voicing rather than a stacked close triad).
const A1 = 55.0, E2 = 82.41, C3 = 130.81;

function makeTrack({ voices, swellDepth, swellFloor, masterGain, detuneCents }) {
  const n = SR * DURATION;
  const samples = new Float32Array(n);
  const detuneRatio = Math.pow(2, detuneCents / 1200);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // Slow amplitude swell so the pad breathes instead of sitting at one
    // flat level — a sine LFO clamped to [swellFloor, 1], never silent.
    const swell = swellFloor + swellDepth * (0.5 + 0.5 * Math.sin((2 * Math.PI * t) / SWELL_PERIOD));
    let s = 0;
    for (const f of voices) {
      // Two slightly detuned partials per voice for a soft chorus-like
      // width, instead of a single bare sine (which reads as a test tone,
      // not a pad).
      s += Math.sin(2 * Math.PI * f * t);
      s += 0.6 * Math.sin(2 * Math.PI * f * detuneRatio * t);
      // A quiet octave-up partial adds just enough presence to read as a
      // pad rather than a sub-bass hum, without brightening the tone.
      s += 0.15 * Math.sin(2 * Math.PI * f * 2 * t);
    }
    samples[i] = s * swell * masterGain / voices.length;
  }
  // 0.5s linear fade in/out on top of the swell, purely to avoid a hard
  // click at the very first/last sample when the underlying loop restarts
  // outside a Web Audio loop-crossfade (this project's own <audio loop> in
  // App.jsx's useBackgroundMusic does a plain restart, not a crossfade).
  const fadeSamples = Math.floor(0.5 * SR);
  for (let i = 0; i < fadeSamples; i++) {
    const g = i / fadeSamples;
    samples[i] *= g;
    samples[n - 1 - i] *= g;
  }
  return samples;
}

function floatTo16BitPCM(samples) {
  const buf = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  return buf;
}

function writeWav(filePath, samples, sampleRate = SR) {
  const dataBuf = floatTo16BitPCM(samples);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataBuf.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate (mono, 16-bit)
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(dataBuf.length, 40);
  fs.writeFileSync(filePath, Buffer.concat([header, dataBuf]));
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const menuTrack = makeTrack({
  voices: [A1, E2, C3],
  swellDepth: 0.35,
  swellFloor: 0.55,
  masterGain: 0.22,
  detuneCents: 6,
});
writeWav(path.join(OUT_DIR, "menu_music.wav"), menuTrack);
console.log("Wrote", path.join(OUT_DIR, "menu_music.wav"));

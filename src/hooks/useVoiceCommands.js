// src/hooks/useVoiceCommands.js — voice-activated crew commands (crew-AI
// batch, per explicit operator request: say a crew member's name plus a
// task and have them do it). A settings-gated, optional enhancement, not a
// core mechanic — every existing crew-order path (clicking a task button,
// autonomous protocol direction) is completely unaffected whether this is
// on or off.
//
// Deliberately NOT NLP. A simple, deterministic two-stage matcher: find the
// crew member whose name is the longest match in the transcript, then find
// the task whose name is the longest match in whatever's left — exported
// separately (matchCrewMember/matchTask) so they're unit-testable without a
// browser or a live SpeechRecognition instance.
import { useEffect, useRef, useState } from "react";

// Longest-match wins so a full name ("Paramedic Nakamura") beats a partial
// one, and a multi-word task name ("chest compressions") beats a shorter,
// coincidentally-contained word.
export function matchCrewMember(transcript, crew) {
  const t = (transcript || "").toLowerCase();
  let best = null, bestLen = 0;
  for (const c of crew || []) {
    if (c.pilot) continue; // never voice-orderable — same exclusion order()'s own UI already applies implicitly (pilots have no task list)
    const full = (c.name || "").toLowerCase();
    const last = full.split(" ").slice(-1)[0];
    if (full && t.includes(full) && full.length > bestLen) { best = c; bestLen = full.length; }
    else if (last && last.length >= 3 && t.includes(last) && last.length > bestLen) { best = c; bestLen = last.length; }
  }
  return best;
}

// Matches against the REAL TASKS list (src/gear.js) — the same vocabulary
// the click-based crew-order panel uses, so a spoken command can only ever
// produce a task the player could also have clicked. `visibleTasks` should
// already be filtered to what this crew member can actually do right now
// (level, not blocked, not a duplicate) — the caller (useVoiceCommands)
// passes the same filter the crew panel itself applies.
export function matchTask(transcript, visibleTasks) {
  const t = (transcript || "").toLowerCase();
  let best = null, bestLen = 0;
  for (const task of visibleTasks || []) {
    // Strip a trailing parenthetical ("...(3:1)", "...IV/IO") before the
    // whole-name check — nobody says the dosing detail aloud, and leaving
    // it in made a shorter task name that IS fully spoken (e.g.
    // "compressions") occasionally out-score a longer, more specific one
    // whose own whole name never fully matches because of the suffix.
    const name = (task.name || "").toLowerCase().replace(/\s*\([^)]*\)\s*$/, "");
    if (name && t.includes(name) && name.length > bestLen) { best = task; bestLen = name.length; continue; }
    // Fall back to individual significant words (e.g. "compressions" alone
    // should still match "Compressions", "aspirin" should match "Aspirin
    // 325mg PO") — real short words like "the"/"and" are excluded by the
    // length floor.
    for (const w of name.split(/[^a-z0-9]+/).filter((w) => w.length >= 4)) {
      if (t.includes(w) && w.length > bestLen) { best = task; bestLen = w.length; }
    }
  }
  return best;
}

// A player self-command ("Push epinephrine", "Give aspirin", "Start
// compressions") — distinct from a crew order (which always leads with a
// crew member's name). Requires one of a small set of real trigger verbs so
// an ordinary bit of ambient speech (or a crew-order transcript that just
// didn't match any crew name) doesn't get mistaken for one — a real
// clinician says "push," "give," "administer," "do," "start," or "perform"
// before naming the thing, not just the drug/procedure name alone.
const PLAYER_ACTION_VERBS = ["push", "give", "administer", "start", "do", "perform"];
export function matchPlayerAction(transcript, actions) {
  const t = (transcript || "").toLowerCase();
  const verb = PLAYER_ACTION_VERBS.find((v) => new RegExp(`\\b${v}\\b`).test(t));
  if (!verb) return null;
  // Match against whatever follows the verb, same longest-match/word-fallback
  // scoring matchTask already uses, so "push epi" still finds "Epinephrine
  // 1 mg (0.1 mg/mL)" via its own significant-word fallback.
  const after = t.slice(t.indexOf(verb) + verb.length);
  let best = null, bestLen = 0;
  for (const a of actions || []) {
    const name = (a.label || "").toLowerCase().replace(/\s*\([^)]*\)\s*$/, "");
    if (!name) continue;
    if (after.includes(name) && name.length > bestLen) { best = a; bestLen = name.length; continue; }
    for (const w of name.split(/[^a-z0-9]+/).filter((w) => w.length >= 4)) {
      if (after.includes(w) && w.length > bestLen) { best = a; bestLen = w.length; }
    }
  }
  return best;
}

export function speechRecognitionAvailable() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// enabled: g.voiceCommandsEnabled (the settings toggle).
// active: whether we're on a screen where a crew order is meaningful right
//   now and nothing is paused — the caller passes the SAME condition the
//   sim-clock pause guard already uses (App.jsx's own `live` phase list
//   plus its modal-pause checks), not a second, potentially-divergent one.
// crew / visibleTasksFor(crewMember): live crew roster and a function
//   returning that member's own currently-orderable task list (mirrors the
//   crew panel's own `visible` filter, including the redirect-while-busy
//   case from the crew-AI batch — a voice order can redirect a busy crew
//   member exactly like a click can).
// onOrder(crewMember, task): called on a confident double-match — the
//   caller wires this straight to order(), the same function every click
//   already calls. No parallel dispatch path.
// onMiss(transcript): called when we heard something but couldn't resolve
//   both a crew member and a task from it.
// playerActions: the player's own currently-available, currently-unblocked
//   action list (the same objects start() already accepts) — a voice
//   command for the PLAYER's own hands, distinct from a crew order, e.g.
//   "Push epinephrine." Optional; omit to leave player self-commands
//   entirely unrecognized (falls through to onMiss like anything else).
// pendingLabel: truthy while a player self-command is awaiting a spoken
//   Confirm/Deny (the caller owns this piece of state, since the confirm
//   banner itself is UI the caller renders) — while set, EVERY result is
//   checked against confirm/deny first and nothing else is matched.
// onPlayerAction(action): called when a player self-command is recognized;
//   the caller is expected to set pendingLabel and show the confirm prompt,
//   NOT execute the action immediately — matching the crew-order path's own
//   "no parallel dispatch," a voice command never bypasses the same start()
//   gating (cost, scope, busy-state) a click would go through.
// onConfirm() / onDeny(): called when pendingLabel is set and the spoken
//   result contains the word "confirm" or "deny" (also accepts "yes"/"no"
//   and "cancel" as the same, since a real crew radio exchange doesn't
//   insist on the exact scripted word).
export function useVoiceCommands({ enabled, active, crew, visibleTasksFor, onOrder, onMiss,
  playerActions, pendingLabel, onPlayerAction, onConfirm, onDeny }) {
  const [status, setStatus] = useState("idle"); // idle | listening | error
  const recogRef = useRef(null);
  const stateRef = useRef({});
  // Synced via its own tiny effect, not a direct assignment during render —
  // reading/writing a ref during render is disallowed; this ref is only
  // ever READ later, inside recog's own async callbacks, so deferring the
  // write to just after render/commit is safe.
  useEffect(() => { stateRef.current = { crew, visibleTasksFor, onOrder, onMiss, active,
    playerActions, pendingLabel, onPlayerAction, onConfirm, onDeny }; });

  useEffect(() => {
    if (!enabled || !active || !speechRecognitionAvailable()) {
      recogRef.current?.stop?.();
      recogRef.current = null;
      return;
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new Ctor();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "en-US";
    recog.onresult = (e) => {
      const { crew, visibleTasksFor, onOrder, onMiss, active, playerActions, pendingLabel, onPlayerAction, onConfirm, onDeny } = stateRef.current;
      if (!active) return; // a stale result arriving right after a pause opened
      const transcript = e.results[e.results.length - 1]?.[0]?.transcript || "";
      const low = transcript.toLowerCase();
      if (pendingLabel) {
        // A confirmation is already open — this result can only be an
        // answer to it, never a new order, so a crew member's own name
        // spoken here (e.g. answering "Confirm" while another line of
        // dialogue is mid-transcript) can't accidentally fire a second,
        // unrelated command.
        if (/\b(confirm|yes|affirmative)\b/.test(low)) onConfirm?.();
        else if (/\b(deny|denied|no|negative|cancel)\b/.test(low)) onDeny?.();
        else onMiss?.(transcript);
        return;
      }
      const c = matchCrewMember(transcript, crew);
      const t = c ? matchTask(transcript, visibleTasksFor(c)) : null;
      if (c && t) { onOrder(c, t); return; }
      const pa = playerActions ? matchPlayerAction(transcript, playerActions) : null;
      if (pa) { onPlayerAction?.(pa); return; }
      onMiss?.(transcript);
    };
    recog.onerror = () => setStatus("error");
    // Browsers stop a recognition session after a period of silence — keep
    // it running for as long as this effect is active, matching how a
    // radio channel stays open, not a push-to-talk button.
    recog.onend = () => { if (stateRef.current.active) { try { recog.start(); } catch { /* already starting */ } } };
    recog.onstart = () => setStatus("listening");
    // Deferred, not called synchronously in the effect body — a synchronous
    // setState there (via the catch branch) is exactly the pattern this
    // project's own lint rule flags; a start() failure is rare (mic already
    // in use, permission denied) and one tick of delay changes nothing
    // observable.
    setTimeout(() => { try { recog.start(); } catch { setStatus("error"); } }, 0);
    recogRef.current = recog;
    return () => { recog.onend = null; recog.stop(); recogRef.current = null; };
  }, [enabled, active]);

  // Derived, not stored: "idle" whenever this hook isn't actually supposed
  // to be listening, regardless of whatever the last real recog callback
  // set — avoids a synchronous setState call in the effect body itself
  // (flagged by this project's own set-state-in-effect rule) just to reset
  // status on the same render the effect tears everything down.
  return (!enabled || !active) ? "idle" : status;
}

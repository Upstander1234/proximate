// src/scripts/voiceCommandMatcherTest.mjs — a plain, no-browser regression
// check for the voice-command matcher (src/hooks/useVoiceCommands.js's
// matchCrewMember/matchTask/matchPlayerAction), the same "verify the logic
// itself, not just that it compiles" discipline mechanismWiring.mjs applies
// to the physiology engine. No SpeechRecognition/DOM involved — these
// functions are all pure.
import { matchCrewMember, matchTask, matchPlayerAction } from "../hooks/useVoiceCommands.js";

const crew = [
  { id: "p1", name: "Paramedic Nakamura" },
  { id: "p2", name: "EMT Reyes" },
  { id: "pilot1", name: "Pilot Cole", pilot: true },
];

const tasks = [
  { id: "cpr", name: "Compressions" },
  { id: "aspirinTask", name: "Aspirin 325mg PO" },
  { id: "newbornCompressions", name: "Newborn chest compressions (3:1)" },
  { id: "assessPupils", name: "Check pupils" },
];

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${ok ? "" : ` — expected ${expected}, got ${actual}`}`);
  ok ? pass++ : fail++;
}

check("full-name crew match", matchCrewMember("Nakamura start compressions", crew)?.id, "p1");
check("surname-only crew match", matchCrewMember("Reyes give aspirin", crew)?.id, "p2");
check("pilot is never voice-orderable", matchCrewMember("Cole start compressions", crew), null);
check("no crew mentioned", matchCrewMember("just start compressions", crew), null);

check("whole task-name match", matchTask("Nakamura give aspirin", tasks)?.id, "aspirinTask");
check("single-word fallback match", matchTask("Reyes compressions", tasks)?.id, "cpr");
check(
  "longest match wins over a shorter contained word",
  matchTask("Reyes newborn chest compressions", tasks)?.id,
  "newbornCompressions"
);
check("multi-word assessment task", matchTask("Nakamura check pupils", tasks)?.id, "assessPupils");
check("no task mentioned", matchTask("Nakamura hello", tasks), null);

const playerActions = [
  { id: "epiIV", label: "Epinephrine 1 mg (0.1 mg/mL)" },
  { id: "aspirin", label: "Aspirin 325mg PO" },
  { id: "cpr", label: "Compressions" },
];
check("player self-command, whole name", matchPlayerAction("push epinephrine", playerActions)?.id, "epiIV");
check("player self-command, other verb", matchPlayerAction("give aspirin", playerActions)?.id, "aspirin");
check("no trigger verb, no match (reads as a crew order instead)", matchPlayerAction("epinephrine", playerActions), null);
check("no action named", matchPlayerAction("push the button", playerActions), null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

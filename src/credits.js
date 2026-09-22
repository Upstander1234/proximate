// Credits shown to players (CreditsScreen.jsx): once, as the very first screen of
// a fresh session, and any time after from the title screen's Credits button.
//
// ONLY put an entry here once its license is verified and its required
// attribution is filled in. Do not add an audio or art entry from memory or from
// "I think this is free". Player-facing text uses no em dashes.
//
// Open-source software. Licenses read from each package's own package.json.
export const CREDITS = [
  {
    title: "Built with",
    entries: [
      { name: "React", license: "MIT" },
      { name: "Vite", license: "MIT" },
      { name: "Tailwind CSS", license: "MIT" },
      { name: "three.js", license: "MIT" },
      { name: "Firebase JS SDK", license: "Apache-2.0" },
      { name: "fflate", license: "MIT" },
    ],
  },
  {
    title: "On-device AI",
    entries: [
      { name: "WebLLM (MLC AI)", license: "Apache-2.0" },
      { name: "Transformers.js (Hugging Face)", license: "Apache-2.0" },
      { name: "kokoro-js", license: "Apache-2.0" },
      { name: "Qwen2.5-0.5B-Instruct (Alibaba Cloud)", license: "Apache-2.0" },
    ],
  },
  {
    title: "Heart and lung sounds",
    entries: [
      {
        name: "HLS-CMDS: Heart and Lung Sounds Dataset Recorded from a Clinical Manikin using Digital Stethoscope, by Yasaman Torabi, Shahram Shirani and James P. Reilly",
        source: "https://doi.org/10.17632/8972jxbpmp.3",
        license: "CC BY 4.0 (creativecommons.org/licenses/by/4.0)",
        changes: "Changes: recordings are re-timed to the patient's heart and breathing rate, and filtered or attenuated for muffled or reduced sounds",
      },
      {
        name: "HF_Lung_V1, by Hsu, Huang, Cheng and colleagues",
        source: "https://gitlab.com/techsupportHF/HF_Lung_V1",
        license: "CC BY 4.0 (creativecommons.org/licenses/by/4.0)",
        changes: "Changes: selected recordings converted to 4 kHz mono, trimmed, level-matched, and re-timed to the patient's breathing rate",
      },
      {
        name: "A dataset of lung sounds recorded from the chest wall using an electronic stethoscope, by Mohammad Fraiwan, Luay Fraiwan, Basheer Khassawneh and Ali Ibnian",
        source: "https://doi.org/10.17632/jwyy9np4gv.3",
        license: "CC BY 4.0 (creativecommons.org/licenses/by/4.0)",
        changes: "Changes: selected recordings converted to 4 kHz mono, trimmed, level-matched, and re-timed to the patient's breathing rate",
      },
      {
        name: "The CirCor DigiScope Phonocardiogram Dataset (version 1.0.3), by Oliveira, Renna, Costa, Nogueira, Oliveira, Elola, Ferreira, Jorge, Bahrami Rad, Reyna, Sameni, Clifford and Coimbra, PhysioNet",
        source: "https://doi.org/10.13026/tshs-mw03",
        license: "Open Data Commons Attribution License v1.0 (opendatacommons.org/licenses/by/1-0)",
        changes: "Changes: selected recordings converted to 4 kHz mono, trimmed, level-matched, and re-timed to the patient's heart rate",
      },
      {
        name: "Classification of Heart Sound Recordings: the PhysioNet / Computing in Cardiology Challenge 2016, by Liu, Springer, Clifford and colleagues",
        source: "https://doi.org/10.13026/C2G61N",
        license: "Open Data Commons Attribution License v1.0 (opendatacommons.org/licenses/by/1-0)",
        changes: "Changes: selected recordings converted to 4 kHz mono, trimmed, level-matched, and re-timed to the patient's heart rate",
      },
    ],
  },
  // Sound and art credits go here once verified, e.g.
  // { title: "Sounds", entries: [{ name: "Title, by Author", source: "https://...", license: "CC BY 4.0", changes: "trimmed" }] },
];

// localStorage flag: set once the first-launch credits screen has been dismissed.
export const CREDITS_SEEN_KEY = "proximate_credits_seen";

// Assets that ship in public/ with no source or license recorded in this repo.
// This only means the repo has no record, not that anything is wrong with them.
// Not shown to players. Fill in a source and license for each (and add a credit
// above if the license requires one) before the game is distributed.
export const UNVERIFIED_ASSETS = [
  "public/assets/audio/menu_music.wav",
  "public/assets/audio/station_ambience.wav",
  "public/assets/audio/radio_chatter.wav",
  "public/assets/audio/truck_siren.wav",
  "public/assets/audio/dispatch_tone.wav",
  "public/assets/audio/fire_alarm.wav",
  "public/assets/audio/button_click.wav",
  "public/assets/audio/achievement.wav",
  "public/assets/audio/notification.wav",
  "public/assets/audio/heart_monitor_beep.wav",
];

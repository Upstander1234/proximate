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
      {
        name: "ICBHI 2017 Respiratory Sound Database, compiled by Rocha, Filos, Mendes, Vogiatzis, Perantoni, Kaimakamis, Natsiavas, Oliveira, Jacome, Marques, Paiva, Serasa, Marques, Pereira and colleagues (An open access database for the evaluation of respiratory sound classification algorithms, Physiological Measurement 40 035001, 2019)",
        source: "https://bhichallenge.med.auth.gr/ICBHI_2017_Challenge",
        license: "Published by the ICBHI 2017 Challenge organizers as \"freely available for research\"; no CC/ODC license identifier is stated on the source page. Used here in good faith with full attribution; will be removed promptly on request from the database's owners.",
        changes: "Changes: selected recordings resampled to 4 kHz mono, trimmed, level-matched, and re-timed to the patient's breathing rate",
      },
      {
        name: "Not yet included: a pericardial friction rub. No open, freely redistributable recording of one could be found; this finding stays narrative only for now.",
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
  // The three below are different from the rest of this list: their origin was
  // actively asked about (the person who provided them, and whoever they got
  // them from) and nobody could identify a source to cite. Not a pending TODO —
  // leave unattributed rather than inventing a source or license for them.
  "public/assets/audio/auscultation/lung/USR_Normal_any_0.wav",
  "public/assets/audio/auscultation/lung/USR_Diminished_any_0.wav",
  "public/assets/audio/auscultation/lung/USR_Cough_any_0.wav",
];

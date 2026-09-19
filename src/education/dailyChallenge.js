// Extensible registry of Daily Challenge game types. Today this only lists
// Medicdle, but the shape lets additional lightweight daily games be added
// later (each just needs a key, label, description, and a component) with
// no restructuring of the Dashboard or this registry itself.

import MedicdleTab from "./MedicdleTab.jsx";
import QuestionOfTheDayTab from "./QuestionOfTheDayTab.jsx";

export const DAILY_CHALLENGES = [
  {
    key: "qotd",
    label: "Question of the Day",
    description: "One question, the same for everyone, once a day.",
    Component: QuestionOfTheDayTab,
  },
  {
    key: "medicdle",
    label: "Medicdle",
    description: "A daily diagnostic-reasoning case. Guess the diagnosis with as little information as possible.",
    Component: MedicdleTab,
  },
];

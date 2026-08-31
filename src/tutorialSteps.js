// tutorialSteps.js — the interactive first-call tutorial's step data
// (TutorialCoachmark.jsx). Plain data, kept in its own file (not alongside
// the component) so that .jsx file only exports the one component, per
// this project's react-refresh/only-export-components convention.
export const TUTORIAL_STEPS = [
  { target: "tabs", caption: "These tabs sort everything you can do on scene by type: Assess, Airway, Meds, IV/IO, Procedures, and General. When in doubt, start with Assess." },
  { target: "actions", caption: "Tap an action to start it. Most things in the field take real time to complete, so think before you commit to one." },
  { target: "busy-timer", caption: "This bar tracks your current action. You can't start a second one until it finishes, so plan your first few moves with that in mind." },
  { target: "crew", caption: "Your partner can work in parallel with you. Send them to start compressions or grab equipment while you handle something else." },
  { target: "monitor", caption: "This is where your patient's real vitals live. Check it often. It updates as their condition changes, for better or worse." },
  { target: "transport", caption: "Once you've done what you can on scene, this is how you get your patient moving and close out the call." },
];

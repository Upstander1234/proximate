// campaign/index.js — barrel re-export for the whole campaign/ folder, so
// every existing consumer (App.jsx, scope.js, downtimeEvents.js) can import
// from one path instead of tracking which chapter file owns which export.
// See each file's own header for what it holds; this file adds nothing new
// except the merged CAMPAIGN_NAME_SLOTS registry every chapter's own
// *_NAME_SLOTS contributes to (core.js's initializeCampaignNames consumes
// the merged result once, at campaign start).
export * from "./core.js";
export * from "./prologue.js";
export * from "./chapter1.js";
export * from "./chapter2.js";
export * from "./chapter3.js";
export * from "./chapter4.js";
export * from "./chapter5.js";
export * from "./chapter6.js";
export * from "./chapter8.js";
export * from "./chapter9_10.js";

import { CH1_NAME_SLOTS } from "./chapter1.js";
import { CH2_NAME_SLOTS } from "./chapter2.js";
import { CH3_NAME_SLOTS } from "./chapter3.js";
import { CH4_NAME_SLOTS } from "./chapter4.js";
import { CH5_NAME_SLOTS } from "./chapter5.js";
import { CH8_NAME_SLOTS } from "./chapter8.js";
import { ADVOCATE_NAME_SLOTS } from "./core.js";

export const CAMPAIGN_NAME_SLOTS = {
  ...CH1_NAME_SLOTS, ...CH2_NAME_SLOTS, ...CH3_NAME_SLOTS,
  ...CH4_NAME_SLOTS, ...CH5_NAME_SLOTS, ...CH8_NAME_SLOTS, ...ADVOCATE_NAME_SLOTS,
};

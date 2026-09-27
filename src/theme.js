export const C={bg:"#0B0F12",panel:"#141A1F",panelHi:"#1B242B",line:"#26343D",text:"#C8D3D9",
  dim:"#5C6E78",faint:"#3A4A54",hr:"#46E39B",spo2:"#56C5E8",bp:"#E8EDEF",rr:"#B79BE8",
  amber:"#F2A33C",red:"#FF4D5A",blue:"#4D7CFF",violet:"#A78BFA"};
export const MONO="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const SANS="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

// Preferred values for NEW UI and UI already being touched for another reason --
// not a mandate to rewrite existing inline styles. Values below match what's
// already predominant in App.jsx (grep-derived, not invented), collapsed onto a
// small named scale so new/touched code has a vocabulary to converge on.
export const SPACE={xs:4,sm:8,md:12,lg:16,xl:24,xxl:32};
export const RADIUS={sm:4,md:6,lg:8}; // 6 and 8 were the two most common values already in use
export const FONT_SIZE={xs:10,sm:11.5,base:13,lg:15,xl:18,display:32};

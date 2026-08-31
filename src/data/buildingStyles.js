// buildingStyles.js — building type -> icon/color, looked up generically by
// CityMap.jsx rather than a growing if/else inside the renderer. Adding a
// new type later is a new row here, not a new branch in the renderer.
//
// The 8 station types (fireStation/emsStation/privateEmsStation/
// policeStation/volunteerStation/sheriffOffice/university/airport) are the
// real home base for each of fleet.js's DEPARTMENT_ORDER entries — see
// maps.js's buildings[] (department/vehicles fields) and mapGraph.js's
// nearestStation(). Distinct colors per type (reusing the existing
// square/circle/triangle/cross icon primitives, no new render code needed)
// so departments read apart on the map even though several share a shape.

export const BUILDING_STYLES = {
  house:    { icon: "square", color: "#8a8a8a", label: "House" },
  hospital: { icon: "cross",  color: "#c0392b", label: "Hospital" },
  clinic:   { icon: "cross",  color: "#3b6fa0", label: "Clinic" },
  business: { icon: "square", color: "#a08850", label: "Business" },
  school:   { icon: "triangle", color: "#4a8a5a", label: "School" },
  park:     { icon: "circle", color: "#3fae5c", label: "Park" },
  fireStation:       { icon: "triangle", color: "#d9432b", label: "Fire Station" },
  emsStation:        { icon: "cross",    color: "#e08a1e", label: "EMS Station" },
  privateEmsStation: { icon: "cross",    color: "#c9a227", label: "Private EMS" },
  policeStation:     { icon: "square",   color: "#2f5fa8", label: "Police Station" },
  volunteerStation:  { icon: "triangle", color: "#8a5a2b", label: "Volunteer Station" },
  sheriffOffice:     { icon: "square",   color: "#4a3f8a", label: "Sheriff's Office" },
  university:        { icon: "circle",   color: "#7a2f8a", label: "University" },
  airport:           { icon: "circle",   color: "#2f8a7a", label: "Airport" },
  // Added by the map-expansion content pass — see maps.js's CITY_MAP.
  cityHall:          { icon: "triangle", color: "#b08a3a", label: "City Hall" },
  skyscraper:        { icon: "square",   color: "#5a7a9a", label: "Skyscraper" },
};

export const DEFAULT_BUILDING_STYLE = { icon: "square", color: "#666666", label: "Building" };
export const styleFor = (type) => BUILDING_STYLES[type] || DEFAULT_BUILDING_STYLE;

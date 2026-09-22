// A bare torso, front or back, drawn in SVG (viewBox 300 x 360) with no labels, so
// the player finds the heart and lung areas by anatomy: collarbones, sternum, ribs,
// nipple line and navel on the front; spine, shoulder blades and ribs on the back.
// `sex` "f" adds breast contour on the front. Children are drawn on top (the
// stethoscope). Coordinates match physio/auscultation.js (chestSpec).
const SKIN = { light: "#E8BFA3", mid: "#D6A585", dark: "#9C6B4C" };

export default function ChestBody({ view = "front", sex = "m", tone = "mid", children }) {
  const skin = SKIN[tone] || SKIN.mid;
  const shade = "#000";
  const back = view === "back";
  return (
    <>
      <defs>
        <linearGradient id="cbSide" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade} stopOpacity=".32" />
          <stop offset=".22" stopColor={shade} stopOpacity="0" />
          <stop offset=".78" stopColor={shade} stopOpacity="0" />
          <stop offset="1" stopColor={shade} stopOpacity=".32" />
        </linearGradient>
        <radialGradient id="cbGlow" cx=".5" cy=".38" r=".62">
          <stop offset="0" stopColor="#fff" stopOpacity=".2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cbBottom" x1="0" x2="0" y1="0" y2="1">
          <stop offset=".78" stopColor={shade} stopOpacity="0" />
          <stop offset="1" stopColor={shade} stopOpacity=".45" />
        </linearGradient>
        <clipPath id="cbBody">
          <path d="M126 6 L126 38 C112 46 78 52 48 62 C26 70 14 92 12 128 L10 236 L30 236 L38 150 C46 190 52 240 66 296 L72 360 L228 360 L234 296 C248 240 254 190 262 150 L270 236 L290 236 L288 128 C286 92 274 70 252 62 C222 52 188 46 174 38 L174 6 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#cbBody)">
        <rect x="0" y="0" width="300" height="360" fill={skin} />
        <rect x="0" y="0" width="300" height="360" fill="url(#cbSide)" />
        <rect x="0" y="0" width="300" height="360" fill="url(#cbGlow)" />
        <rect x="0" y="0" width="300" height="360" fill="url(#cbBottom)" />
        {!back ? (
          <g fill="none" stroke={shade} strokeLinecap="round">
            {/* neck and trapezius */}
            <path d="M126 38 C132 50 142 58 150 62 C158 58 168 50 174 38" strokeOpacity=".18" strokeWidth="2" />
            {/* collarbones */}
            <path d="M150 64 C126 58 98 60 62 72" strokeOpacity=".3" strokeWidth="2.4" />
            <path d="M150 64 C174 58 202 60 238 72" strokeOpacity=".3" strokeWidth="2.4" />
            <path d="M150 64 C126 62 98 64 62 76" stroke="#fff" strokeOpacity=".14" strokeWidth="1.5" />
            <path d="M150 64 C174 62 202 64 238 76" stroke="#fff" strokeOpacity=".14" strokeWidth="1.5" />
            {/* sternum and notch */}
            <path d="M150 64 L150 200" strokeOpacity=".16" strokeWidth="2" />
            <path d="M143 66 C147 72 153 72 157 66" strokeOpacity=".28" strokeWidth="1.8" />
            {/* ribs, fading toward the sternum */}
            {[104, 122, 140, 158, 176, 194].map((y, i) => (
              <g key={y} strokeOpacity={0.16 - i * 0.012} strokeWidth="1.6">
                <path d={`M52 ${y + 6} C80 ${y + 22} 118 ${y + 18} 148 ${y + 4}`} />
                <path d={`M248 ${y + 6} C220 ${y + 22} 182 ${y + 18} 152 ${y + 4}`} />
              </g>
            ))}
            {/* costal margin */}
            <path d="M148 206 C126 218 94 226 66 218" strokeOpacity=".22" strokeWidth="2" />
            <path d="M152 206 C174 218 206 226 234 218" strokeOpacity=".22" strokeWidth="2" />
            {/* pectoral or breast contour */}
            {sex === "f" ? (
              <>
                <path d="M62 132 C64 170 96 192 128 176 C142 168 148 150 146 128" strokeOpacity=".3" strokeWidth="2.4" />
                <path d="M238 132 C236 170 204 192 172 176 C158 168 152 150 154 128" strokeOpacity=".3" strokeWidth="2.4" />
                <circle cx="104" cy="156" r="6.5" fill="#B87F68" fillOpacity=".55" stroke="none" />
                <circle cx="196" cy="156" r="6.5" fill="#B87F68" fillOpacity=".55" stroke="none" />
              </>
            ) : (
              <>
                <path d="M62 112 C72 140 108 148 146 138" strokeOpacity=".28" strokeWidth="2.4" />
                <path d="M238 112 C228 140 192 148 154 138" strokeOpacity=".28" strokeWidth="2.4" />
                <circle cx="104" cy="146" r="5" fill="#A87260" fillOpacity=".5" stroke="none" />
                <circle cx="196" cy="146" r="5" fill="#A87260" fillOpacity=".5" stroke="none" />
              </>
            )}
            {/* abdomen: linea alba, navel, waist */}
            <path d="M150 208 L150 300" strokeOpacity=".1" strokeWidth="2" />
            <path d="M150 268 c-4 0 -6 4 -6 6 c0 4 4 6 6 6 c2 0 6 -2 6 -6 c0 -2 -2 -6 -6 -6" strokeOpacity=".32" strokeWidth="1.8" />
            <path d="M52 240 C60 262 70 282 78 300" strokeOpacity=".14" strokeWidth="2" />
            <path d="M248 240 C240 262 230 282 222 300" strokeOpacity=".14" strokeWidth="2" />
            {/* deltoid / armpit folds */}
            <path d="M46 62 C40 96 40 130 46 160" strokeOpacity=".2" strokeWidth="2" />
            <path d="M254 62 C260 96 260 130 254 160" strokeOpacity=".2" strokeWidth="2" />
          </g>
        ) : (
          <g fill="none" stroke={shade} strokeLinecap="round">
            {/* trapezius */}
            <path d="M126 38 C110 52 80 60 52 70" strokeOpacity=".2" strokeWidth="2" />
            <path d="M174 38 C190 52 220 60 248 70" strokeOpacity=".2" strokeWidth="2" />
            {/* spine and vertebrae */}
            <path d="M150 40 L150 340" strokeOpacity=".22" strokeWidth="2.6" />
            {Array.from({ length: 17 }, (_, i) => 52 + i * 17).map((y) => (
              <ellipse key={y} cx="150" cy={y} rx="5" ry="2.6" stroke="none" fill={shade} fillOpacity=".18" />
            ))}
            {/* scapulae */}
            <path d="M84 84 C74 112 78 146 96 160 C112 150 124 122 120 90 C108 84 96 82 84 84 Z" strokeOpacity=".26" strokeWidth="2" />
            <path d="M216 84 C226 112 222 146 204 160 C188 150 176 122 180 90 C192 84 204 82 216 84 Z" strokeOpacity=".26" strokeWidth="2" />
            <path d="M60 84 C90 80 120 84 132 90" strokeOpacity=".16" strokeWidth="2" />
            <path d="M240 84 C210 80 180 84 168 90" strokeOpacity=".16" strokeWidth="2" />
            {/* ribs */}
            {[168, 186, 204, 222].map((y, i) => (
              <g key={y} strokeOpacity={0.15 - i * 0.02} strokeWidth="1.6">
                <path d={`M56 ${y} C88 ${y + 12} 124 ${y + 12} 146 ${y + 2}`} />
                <path d={`M244 ${y} C212 ${y + 12} 176 ${y + 12} 154 ${y + 2}`} />
              </g>
            ))}
            {/* waist and lower back */}
            <path d="M58 250 C66 272 74 292 82 312" strokeOpacity=".14" strokeWidth="2" />
            <path d="M242 250 C234 272 226 292 218 312" strokeOpacity=".14" strokeWidth="2" />
            <circle cx="126" cy="318" r="4" stroke="none" fill={shade} fillOpacity=".14" />
            <circle cx="174" cy="318" r="4" stroke="none" fill={shade} fillOpacity=".14" />
          </g>
        )}
      </g>
      <path d="M126 6 L126 38 C112 46 78 52 48 62 C26 70 14 92 12 128 L10 236 L30 236 L38 150 C46 190 52 240 66 296 L72 360 L228 360 L234 296 C248 240 254 190 262 150 L270 236 L290 236 L288 128 C286 92 274 70 252 62 C222 52 188 46 174 38 L174 6 Z"
        fill="none" stroke="#000" strokeOpacity=".5" strokeWidth="2" />
      {children}
    </>
  );
}

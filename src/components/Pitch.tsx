import { POSITION_BY_KEY } from "@/lib/skills";

// Vertical pitch with the player's primary (orange) and secondary (blue) positions.
export function Pitch({ primary, secondary, className }: { primary: string; secondary?: string | null; className?: string }) {
  const p = POSITION_BY_KEY[primary];
  const s = secondary ? POSITION_BY_KEY[secondary] : undefined;
  const W = 68;
  const H = 100;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`Plays ${p?.label ?? primary}${s ? `, also ${s.label}` : ""}`}>
      <defs>
        <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14307e" />
          <stop offset="1" stopColor="#0b1c52" />
        </linearGradient>
        <pattern id="stripes" width={W} height="12.5" patternUnits="userSpaceOnUse">
          <rect width={W} height="6.25" fill="rgba(255,255,255,0.025)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={W} height={H} rx="4" fill="url(#turf)" />
      <rect x="0" y="0" width={W} height={H} rx="4" fill="url(#stripes)" />
      <g fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="0.45">
        <rect x="3" y="3" width={W - 6} height={H - 6} rx="1" />
        <line x1="3" y1={H / 2} x2={W - 3} y2={H / 2} />
        <circle cx={W / 2} cy={H / 2} r="8.5" />
        <rect x={W / 2 - 18} y="3" width="36" height="15" />
        <rect x={W / 2 - 8} y="3" width="16" height="5.5" />
        <rect x={W / 2 - 18} y={H - 18} width="36" height="15" />
        <rect x={W / 2 - 8} y={H - 8.5} width="16" height="5.5" />
        <path d={`M ${W / 2 - 7} 18 A 8 8 0 0 0 ${W / 2 + 7} 18`} />
        <path d={`M ${W / 2 - 7} ${H - 18} A 8 8 0 0 1 ${W / 2 + 7} ${H - 18}`} />
      </g>
      {s && (
        <g>
          <circle cx={(s.x / 100) * W} cy={(s.y / 100) * H} r="5.2" fill="#2f5bff" stroke="white" strokeOpacity=".5" strokeWidth=".4" />
          <text x={(s.x / 100) * W} y={(s.y / 100) * H + 1.2} textAnchor="middle" fontSize="3.4" fontWeight="800" fill="white">
            {s.key}
          </text>
        </g>
      )}
      {p && (
        <g>
          <circle cx={(p.x / 100) * W} cy={(p.y / 100) * H} r="9" fill="#ff6a13" opacity=".22" />
          <circle cx={(p.x / 100) * W} cy={(p.y / 100) * H} r="6" fill="#ff6a13" stroke="white" strokeWidth=".5" />
          <text x={(p.x / 100) * W} y={(p.y / 100) * H + 1.3} textAnchor="middle" fontSize="3.8" fontWeight="800" fill="#140600">
            {p.key}
          </text>
        </g>
      )}
    </svg>
  );
}

import { useId } from "react";
import type { CategoryId } from "../fixtures/categories";

// Placeholder scenes until businesses upload real photography. One scene per category family.
export function CoverArt({ hue, category, className = "" }: { hue: number; category: CategoryId; className?: string }) {
  const id = useId();
  const top = `hsl(${hue} 85% 78%)`;
  const mid = `hsl(${(hue + 20) % 360} 70% 62%)`;
  const far = `hsl(${hue} 45% 48%)`;
  const near = `hsl(${hue} 55% 28%)`;
  const night = category === "nightlife";
  const sky = night ? `hsl(${hue} 50% 16%)` : top;

  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Placeholder cover artwork">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor={night ? `hsl(${hue} 60% 30%)` : mid} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#${id}s)`} />
      <circle cx="292" cy="82" r={night ? 22 : 36} fill={night ? "#fff3e0" : "#ff5a00"} opacity={night ? 0.95 : 0.95} />
      {category === "nature" && (
        <>
          <path d="M0 175 L70 105 L130 160 L210 80 L300 170 L360 125 L400 160 V260 H0Z" fill={far} />
          <path d="M0 215 L80 160 L150 210 L240 150 L330 215 L400 185 V260 H0Z" fill={near} />
          <path d="M214 120 q-6 50 -2 140" stroke="#fff" strokeOpacity=".7" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}
      {(category === "accommodation" || category === "events") && (
        <>
          <path d="M0 175 Q80 150 170 172 T400 165 V260 H0Z" fill={far} />
          <path d="M0 205 Q50 188 100 205 T200 205 T300 205 T400 200 V260 H0Z" fill={near} />
          <path d="M0 232 Q50 218 100 232 T200 232 T300 232 T400 228 V260 H0Z" fill="#fff" opacity=".18" />
          <path d="M70 175 V120 M70 120 q-26 -4 -40 10 M70 120 q24 -10 42 4 M70 120 q-4 -22 -22 -30 M70 120 q10 -24 32 -26" stroke={near} strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}
      {(category === "dining" || category === "nightlife" || category === "recreation") && (
        <>
          <g fill={far}>
            <rect x="20" y="130" width="46" height="130" rx="3" /><rect x="76" y="95" width="56" height="165" rx="3" />
            <rect x="142" y="140" width="40" height="120" rx="3" /><rect x="192" y="110" width="62" height="150" rx="3" />
            <rect x="264" y="150" width="44" height="110" rx="3" /><rect x="318" y="100" width="64" height="160" rx="3" />
          </g>
          <g fill={night ? "#ffd9b8" : "#fff"} opacity={night ? 0.9 : 0.5}>
            {[[34, 150], [34, 175], [90, 115], [112, 115], [90, 145], [112, 175], [206, 130], [232, 130], [206, 160], [332, 120], [356, 120], [332, 150], [356, 180]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="9" height="12" rx="2" />)}
          </g>
          <rect y="226" width="400" height="34" fill={near} />
        </>
      )}
      {category === "culture" && (
        <>
          <path d="M0 200 H400 V260 H0Z" fill={near} />
          <g fill={far}>
            <path d="M80 200 V120 L200 70 L320 120 V200Z" />
          </g>
          <g fill="#fff" opacity=".55">{[110, 150, 190, 230, 270].map((x) => <rect key={x} x={x} y="125" width="14" height="75" rx="2" />)}</g>
          <path d="M70 120 H330 L200 62Z" fill={mid} />
        </>
      )}
    </svg>
  );
}

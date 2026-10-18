import type { CategoryId } from "../fixtures/categories";

// Placeholder artwork until businesses upload real photography.
export function CoverArt({ hue, category, className = "" }: { hue: number; category: CategoryId; className?: string }) {
  const sky = `hsl(${hue} 70% 82%)`;
  const far = `hsl(${hue} 45% 62%)`;
  const near = `hsl(${hue} 50% 38%)`;
  const sun = "#ff5a00";
  const waves = category === "nature" || category === "events" || category === "accommodation";
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Placeholder cover artwork">
      <rect width="400" height="260" fill={sky} />
      <circle cx="300" cy="80" r="34" fill={sun} opacity="0.9" />
      <path d="M0 170 Q70 110 150 160 T300 140 T400 165 V260 H0Z" fill={far} />
      {waves ? (
        <path d="M0 210 Q50 190 100 210 T200 210 T300 210 T400 205 V260 H0Z" fill={near} />
      ) : (
        <path d="M0 200 L60 150 L120 205 L190 140 L260 210 L330 160 L400 205 V260 H0Z" fill={near} />
      )}
    </svg>
  );
}

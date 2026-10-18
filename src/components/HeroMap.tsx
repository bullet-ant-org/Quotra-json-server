import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Coins } from "lucide-react";
import { bySlug, formatNaira } from "../fixtures/destinations";
import { Rating } from "./Stars";
import { CoverArt } from "./CoverArt";

// Hand-drawn, not geographic: pin positions are illustrative on the landing page.
const pins = [
  { slug: "palmfringe-beach-resort", x: 330, y: 330 },
  { slug: "kora-terrace-kitchen", x: 150, y: 190 },
  { slug: "waveform-water-park", x: 250, y: 120 },
  { slug: "marina-bean-cafe", x: 110, y: 380 },
  { slug: "skyline-lounge-abuja", x: 400, y: 200 },
];

export function HeroMap() {
  const [active, setActive] = useState(pins[0].slug);
  const d = bySlug(active)!;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <svg viewBox="0 0 500 460" className="w-full overflow-hidden rounded-[2rem] bg-surface" role="group" aria-label="Illustrative map with sample destinations">
        <path d="M0 330 Q90 290 160 340 T320 350 T500 300 V460 H0Z" fill="var(--c-accent-soft)" />
        <path d="M0 400 Q120 370 220 410 T500 380 V460 H0Z" fill="var(--c-accent)" opacity="0.18" />
        <ellipse cx="85" cy="110" rx="70" ry="45" fill="var(--c-accent)" opacity="0.1" />
        <ellipse cx="420" cy="90" rx="55" ry="38" fill="var(--c-accent)" opacity="0.1" />
        <g fill="none" stroke="var(--c-line)" strokeLinecap="round">
          <path d="M-10 240 L510 200" strokeWidth="14" />
          <path d="M200 -10 Q220 200 190 470" strokeWidth="12" />
          <path d="M330 -10 L360 470" strokeWidth="10" />
          <path d="M-10 120 L300 160" strokeWidth="7" />
          <path d="M60 470 L120 250" strokeWidth="7" />
          <path d="M420 470 Q380 320 510 280" strokeWidth="7" />
        </g>
        <g fill="none" stroke="var(--c-bg)" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round">
          <path d="M-10 240 L510 200" />
          <path d="M200 -10 Q220 200 190 470" />
        </g>
        {pins.map((p, i) => {
          const on = p.slug === active;
          return (
            <g key={p.slug} transform={`translate(${p.x} ${p.y})`}>
              {on && <circle r="14" fill="var(--c-accent)" className="pulse-ring" />}
              <g
                role="button"
                tabIndex={0}
                aria-label={bySlug(p.slug)!.name}
                aria-pressed={on}
                className="pin-drop cursor-pointer"
                style={{ animationDelay: `${i * 90}ms` }}
                onClick={() => setActive(p.slug)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive(p.slug))}
              >
                <path
                  d="M0 -34 a14 14 0 0 0 -14 14 c0 10 14 28 14 28 s14 -18 14 -28 a14 14 0 0 0 -14 -14Z"
                  fill={on ? "var(--c-accent)" : "var(--c-ink)"}
                  stroke="var(--c-bg)"
                  strokeWidth="3"
                  style={{ transition: "fill 200ms" }}
                />
                <circle cy="-20" r="5" fill="var(--c-bg)" />
              </g>
            </g>
          );
        })}
      </svg>

      <Link
        to={`/destinations/${d.slug}`}
        key={d.slug}
        className="absolute -bottom-6 left-3 right-3 flex gap-3 rounded-2xl border border-line bg-bg p-2.5 shadow-xl sm:left-auto sm:right-[-1.5rem] sm:w-80"
      >
        <CoverArt hue={d.hue} category={d.category} className="size-20 shrink-0 rounded-xl" />
        <div className="min-w-0 space-y-0.5 py-0.5">
          <p className="truncate font-display text-base font-bold">{d.name}</p>
          <p className="flex items-center gap-1 text-sm text-muted">
            {d.city}
            {d.verified && <BadgeCheck className="size-4 text-accent-text" aria-label="Verified" />}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Rating value={d.rating} />
            {d.priceFrom !== null && <span className="text-muted">from {formatNaira(d.priceFrom)}</span>}
          </div>
          {d.tokenOffer && (
            <p className="flex items-center gap-1 text-xs font-semibold text-accent-text">
              <Coins className="size-3.5" aria-hidden="true" /> {d.tokenOffer}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

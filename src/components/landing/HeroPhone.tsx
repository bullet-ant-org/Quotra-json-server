import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Coins, Navigation } from "lucide-react";
import { bySlug, formatNaira } from "../../fixtures/destinations";
import { CoverArt } from "../CoverArt";

// Illustrative layout, not geographic. Pins cycle like a live feed.
const stops = [
  { slug: "palmfringe-beach-resort", x: 72, y: 58, away: "12 min away" },
  { slug: "kora-terrace-kitchen", x: 34, y: 36, away: "4 min away" },
  { slug: "waveform-water-park", x: 60, y: 24, away: "9 min away" },
  { slug: "marina-bean-cafe", x: 22, y: 66, away: "2 min away" },
];

export function HeroPhone() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % stops.length), 3600);
    return () => clearInterval(t);
  }, []);
  const cur = stops[i];
  const d = bySlug(cur.slug)!;

  return (
    <div className="relative mx-auto w-[15.5rem] text-ink sm:w-[19rem]" aria-hidden="true">
      <div className="relative overflow-hidden rounded-[2.6rem] border-[7px] border-ink bg-bg shadow-2xl">
        <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
        <div className="relative h-[23rem] bg-surface sm:h-[27rem]">
          <svg viewBox="0 0 100 130" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
            <path d="M0 96 Q25 84 50 98 T100 90 V130 H0Z" fill="var(--c-accent)" opacity=".16" />
            <ellipse cx="18" cy="22" rx="16" ry="10" fill="var(--c-accent)" opacity=".1" />
            <g fill="none" stroke="var(--c-line)" strokeLinecap="round">
              <path d="M-5 62 L105 52" strokeWidth="3.4" /><path d="M42 -5 Q50 60 40 135" strokeWidth="3" />
              <path d="M78 -5 L84 135" strokeWidth="2.4" /><path d="M-5 28 L70 38" strokeWidth="1.8" /><path d="M10 135 L26 70" strokeWidth="1.8" />
            </g>
            {stops.map((s, n) => (
              <g key={s.slug} transform={`translate(${s.x} ${s.y})`}>
                {n === i && <circle r="5" fill="var(--c-accent)" opacity=".3"><animate attributeName="r" values="3;9" dur="1.6s" repeatCount="indefinite" /><animate attributeName="opacity" values=".45;0" dur="1.6s" repeatCount="indefinite" /></circle>}
                <motion.g animate={{ scale: n === i ? 1.25 : 1, y: n === i ? -2 : 0 }} transition={{ type: "spring", stiffness: 380, damping: 18 }}>
                  <path d="M0 -10 a5 5 0 0 0 -5 5 c0 3.6 5 10 5 10 s5 -6.4 5 -10 a5 5 0 0 0 -5 -5Z" fill={n === i ? "var(--c-accent)" : "var(--c-ink)"} stroke="var(--c-bg)" strokeWidth="1" />
                  <circle cy="-5" r="1.8" fill="var(--c-bg)" />
                </motion.g>
              </g>
            ))}
          </svg>

          <div className="absolute inset-x-3 bottom-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={cur.slug}
                initial={{ y: 28, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="rounded-2xl border border-line bg-bg p-2.5 shadow-xl"
              >
                <div className="flex gap-2.5">
                  <CoverArt hue={d.hue} category={d.category} className="size-16 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate font-display text-[15px] font-bold leading-tight">{d.name}{d.verified && <BadgeCheck className="size-3.5 shrink-0 text-accent-text" />}</p>
                    <p className="text-xs text-muted">{d.city} · {cur.away}</p>
                    <p className="mt-1 text-xs font-semibold">★ {d.rating.toFixed(1)}{d.priceFrom !== null && <span className="font-normal text-muted"> · from {formatNaira(d.priceFrom)}</span>}</p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center self-center rounded-full bg-accent text-accent-ink"><Navigation className="size-4" /></span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.div key={`t${i}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.25 }} className="absolute -left-10 top-20 sm:-left-6 sm:top-24 flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-xs font-bold text-ink shadow-lg">
        <Coins className="size-4 text-accent" />+{d.checkInTokens} tokens
      </motion.div>
      <div className="absolute -right-10 top-40 sm:-right-5 sm:top-44 rounded-full bg-bg px-3 py-1.5 text-xs font-bold text-ink shadow-lg">Open now</div>
    </div>
  );
}

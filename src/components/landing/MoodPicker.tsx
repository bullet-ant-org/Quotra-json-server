import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { destinations, type Destination } from "../../fixtures/destinations";
import { DestinationCard } from "../DestinationCard";

const moods: { id: string; label: string; test: (d: Destination) => boolean }[] = [
  { id: "chill", label: "Chill", test: (d) => d.category === "nature" || d.category === "accommodation" },
  { id: "date", label: "Date night", test: (d) => d.category === "dining" || d.category === "nightlife" },
  { id: "family", label: "Family day", test: (d) => d.facilities.some((f) => /family/i.test(f)) },
  { id: "adventure", label: "Adventure", test: (d) => d.category === "events" || d.category === "nature" },
  { id: "budget", label: "Under ₦3,000", test: (d) => d.priceFrom !== null && d.priceFrom <= 3000 },
];

export function MoodPicker() {
  const [mood, setMood] = useState(moods[0].id);
  const list = useMemo(() => destinations.filter(moods.find((m) => m.id === mood)!.test), [mood]);

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap" role="group" aria-label="Pick a mood">
        {moods.map((m) => (
          <button key={m.id} onClick={() => setMood(m.id)} aria-pressed={mood === m.id} className={`relative shrink-0 rounded-full px-4 py-2.5 text-sm font-bold sm:px-5 sm:py-3 sm:text-base transition-colors ${mood === m.id ? "text-accent-ink" : "bg-surface hover:bg-surface-2"}`}>
            {mood === m.id && <motion.span layoutId="mood-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
            <span className="relative">{m.label}</span>
          </button>
        ))}
      </div>
      <ul className="mt-6 grid gap-3 pb-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {list.slice(0, 3).map((d) => (
            <motion.li key={`${mood}-${d.slug}`} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}>
              <DestinationCard d={d} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <Link to="/explore" className="mt-2 inline-flex items-center gap-2 font-bold text-accent-text">See all {destinations.length} sample places <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </div>
  );
}

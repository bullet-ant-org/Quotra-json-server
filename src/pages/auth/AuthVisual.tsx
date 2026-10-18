import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Coins, Star } from "lucide-react";
import { Logo } from "../../components/Logo";
import { CoverArt } from "../../components/CoverArt";
import { destinations } from "../../fixtures/destinations";

const lines = {
  login: "Good to see you again. Your saved places missed you.",
  register: "Your next favourite place is closer than you think.",
  forgot: "Happens to everyone. Let's get you back in.",
};

const picks = destinations.filter((d) => d.tokenOffer).slice(0, 4);

export function AuthVisual({ mode }: { mode: keyof typeof lines }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setN((x) => (x + 1) % picks.length), 3200);
    return () => clearInterval(t);
  }, []);
  const d = picks[n];

  return (
    <div className="relative h-52 overflow-hidden bg-hero text-hero-ink lg:sticky lg:top-0 lg:h-dvh">
      <svg viewBox="0 0 400 600" className="absolute inset-0 size-full opacity-20" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, k) => (
          <path key={k} d={`M-20 ${20 + k * 46} Q100 ${k * 46 - 20} 200 ${30 + k * 46} T420 ${10 + k * 46}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
        ))}
      </svg>

      <div className="relative flex h-full flex-col px-5 pt-5 lg:p-14">
        <Link to="/" aria-label="Roamly home" className="lg:hidden"><span className="[&_*]:!text-hero-ink"><Logo /></span></Link>
        <p className="mt-6 max-w-sm font-display text-[1.65rem] font-extrabold leading-[1.05] lg:order-2 lg:mt-auto lg:max-w-lg lg:text-6xl">{lines[mode]}</p>

        <div className="relative mx-auto hidden h-80 w-full max-w-sm lg:order-1 lg:mt-16 lg:block" aria-hidden="true">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={d.slug}
              initial={{ y: 60, opacity: 0, rotate: 6 }}
              animate={{ y: 0, opacity: 1, rotate: -3 }}
              exit={{ y: -40, opacity: 0, rotate: -10 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              className="absolute inset-x-0 top-0 overflow-hidden rounded-3xl bg-bg text-ink shadow-2xl"
            >
              <CoverArt hue={d.hue} category={d.category} className="h-44 w-full" />
              <div className="space-y-1 p-5">
                <p className="font-display text-xl font-bold">{d.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted"><Star className="size-4 fill-accent text-accent" />{d.rating.toFixed(1)} · {d.city}</p>
                <p className="flex items-center gap-1.5 pt-1 text-sm font-semibold text-accent-text"><Coins className="size-4" />{d.tokenOffer}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute -bottom-2 -right-4 rotate-6 rounded-2xl bg-bg px-4 py-3 text-sm font-bold text-ink shadow-xl">+{d.checkInTokens} tokens for checking in</div>
        </div>
      </div>
    </div>
  );
}

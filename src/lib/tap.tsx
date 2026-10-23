import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";

// One tap → onSingle (after a short wait), two quick taps → onDouble. Works on phones where dblclick doesn't.
export function useTap(onSingle: () => void, onDouble: () => void, ms = 260) {
  const t = useRef<number | undefined>(undefined);
  return () => {
    if (t.current) { clearTimeout(t.current); t.current = undefined; onDouble(); return; }
    t.current = window.setTimeout(() => { t.current = undefined; onSingle(); }, ms);
  };
}

// Big heart that pops where you double-tapped.
export function useHeartBurst() {
  const [n, setN] = useState(0);
  const burst = () => setN((x) => x + 1);
  const el = (
    <AnimatePresence>
      {n > 0 && (
        <motion.span key={n} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 1] }} exit={{ scale: 1.3, opacity: 0 }} transition={{ duration: 0.45 }}
          onAnimationComplete={() => setTimeout(() => setN(0), 350)} className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <Heart className="size-24 fill-white text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.35)]" />
        </motion.span>
      )}
    </AnimatePresence>
  );
  return [burst, el] as const;
}

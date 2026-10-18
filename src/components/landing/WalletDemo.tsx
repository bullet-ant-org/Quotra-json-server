import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { Coins } from "lucide-react";

const rows = [
  { t: "Checked in at Palmfringe Beach Resort", v: "+50" },
  { t: "Review approved", v: "+20" },
  { t: "Redeemed: day pool pass", v: "−100" },
];

export function WalletDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const n = useMotionValue(0);
  const shown = useTransform(n, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = animate(n, 240, { duration: reduce ? 0 : 1.6, ease: "easeOut" });
    return () => c.stop();
  }, [inView, n]);

  return (
    <div ref={ref} className="rounded-[1.75rem] bg-bg p-6 text-ink shadow-2xl">
      <p className="text-sm font-semibold text-muted">Example wallet</p>
      <p className="mt-1 flex items-baseline gap-2 font-display text-6xl font-extrabold"><Coins className="size-9 self-center text-accent" aria-hidden="true" /><motion.span>{shown}</motion.span><span className="text-lg font-semibold text-muted">tokens</span></p>
      <ul className="mt-5 divide-y divide-line text-sm">
        {rows.map((r, i) => (
          <motion.li key={r.t} initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5 + i * 0.25, type: "spring", stiffness: 260, damping: 24 }} className="flex justify-between gap-4 py-3">
            <span>{r.t}</span><span className={`font-bold ${r.v.startsWith("+") ? "text-accent-text" : "text-muted"}`}>{r.v}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

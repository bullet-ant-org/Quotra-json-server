import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Coins, Loader2, MapPinOff, Navigation, X } from "lucide-react";
import { useAuth } from "../lib/auth/AuthContext";
import { isDemo } from "../lib/auth/service";
import type { Destination } from "../fixtures/destinations";

type State = { s: "idle" } | { s: "locating" } | { s: "far"; km: number } | { s: "near" } | { s: "denied" };

const km = (a: [number, number], b: [number, number]) => {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

// Device location is only a first filter; the server makes the real decision.
export function CheckInButton({ d, className = "" }: { d: Destination; className?: string }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [st, setSt] = useState<State>({ s: "idle" });
  const [open, setOpen] = useState(false);

  const start = () => {
    if (!user) return nav(`/register?next=${encodeURIComponent(`/destinations/${d.slug}`)}`);
    setOpen(true);
    setSt({ s: "locating" });
    if (!navigator.geolocation) return setSt({ s: "denied" });
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const dist = km([p.coords.latitude, p.coords.longitude], [d.lat, d.lng]);
        setSt(dist > 0.3 ? { s: "far", km: dist } : { s: "near" });
      },
      () => setSt({ s: "denied" }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <>
      <button type="button" onClick={start} className={className}>
        <Coins className="size-4" aria-hidden="true" />{user ? `Check in +${d.checkInTokens}` : "Sign up to check in"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label="Check in" onClick={(e) => e.stopPropagation()} initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: "spring", stiffness: 320, damping: 30 }} className="w-full max-w-md rounded-t-[2rem] bg-bg p-6 pb-10 sm:rounded-[2rem] sm:pb-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-extrabold">Check in at {d.name}</h2>
                <button onClick={() => setOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-full bg-surface" aria-label="Close"><X className="size-5" /></button>
              </div>
              <div className="mt-4 text-muted" aria-live="polite">
                {st.s === "locating" && <p className="flex items-center gap-2"><Loader2 className="size-5 animate-spin text-accent" />Finding your location…</p>}
                {st.s === "denied" && <p className="flex gap-2"><MapPinOff className="size-5 shrink-0 text-accent" />Outsider needs your location to check you in. Allow location access in your browser settings and try again.</p>}
                {st.s === "far" && <p className="flex gap-2"><Navigation className="size-5 shrink-0 text-accent" />You're about {st.km < 10 ? st.km.toFixed(1) : Math.round(st.km)} km away. Check-ins only work when you're at the place.</p>}
                {st.s === "near" && <p>{isDemo ? "You're here. In demo mode nothing is sent, so no tokens were added." : "You're here, but check-ins aren't available yet because the Outsider API isn't connected. No tokens were added."}</p>}
              </div>
              <button onClick={() => setOpen(false)} className="mt-6 w-full rounded-full bg-accent py-3.5 font-bold text-accent-ink">Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

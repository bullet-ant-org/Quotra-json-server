import { useEffect, useRef, useState, type ReactNode } from "react";
import { LIVE } from "../lib/store";

const MAX = 110, TRIGGER = 72;

// Is anything between the touch and the page already scrolled? Then the pull belongs to that scroller.
function nestedScrolled(el: Element | null) {
  for (; el && el !== document.body; el = el.parentElement) {
    if (el.closest('[role="dialog"], [data-no-ptr]')) return true;
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight && el.scrollTop > 0) return true;
  }
  return false;
}

// Pull down at the top of any page to refresh, with the Outsider spinner.
export function PullToRefresh({ children }: { children: ReactNode }) {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const start = useRef<{ y: number; x: number } | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    const down = (e: TouchEvent) => { start.current = !busy && scrollY <= 0 && !nestedScrolled(e.target as Element) ? { y: e.touches[0].clientY, x: e.touches[0].clientX } : null; };
    const move = (e: TouchEvent) => {
      if (!start.current) return;
      const dy = e.touches[0].clientY - start.current.y, dx = Math.abs(e.touches[0].clientX - start.current.x);
      if (dy <= 0 || dx > dy) { if (pullRef.current) { pullRef.current = 0; setPull(0); } return; }
      e.preventDefault();
      pullRef.current = Math.min(MAX, dy * 0.5); // resistance, like iOS
      setPull(pullRef.current);
    };
    const up = async () => {
      if (!start.current) return;
      start.current = null;
      if (pullRef.current < TRIGGER) { pullRef.current = 0; setPull(0); return; }
      setBusy(true); pullRef.current = 56; setPull(56);
      navigator.vibrate?.(8);
      try { if (LIVE) await (await import("../lib/remote")).reload(); else await new Promise((r) => setTimeout(r, 900)); } catch { /* offline: keep cached */ }
      window.dispatchEvent(new Event("outsider:refreshed"));
      setBusy(false); pullRef.current = 0; setPull(0);
    };
    addEventListener("touchstart", down, { passive: true });
    addEventListener("touchmove", move, { passive: false });
    addEventListener("touchend", up);
    addEventListener("touchcancel", up);
    return () => { removeEventListener("touchstart", down); removeEventListener("touchmove", move); removeEventListener("touchend", up); removeEventListener("touchcancel", up); };
  }, [busy]);

  const p = Math.min(1, pull / TRIGGER);
  const settling = !start.current;
  return (
    <>
      <div aria-hidden={!busy} role="status" aria-label={busy ? "Refreshing" : undefined} className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center"
        style={{ transform: `translateY(${pull - 48}px)`, opacity: pull ? 1 : 0, transition: settling ? "transform .35s cubic-bezier(.2,.9,.3,1.2), opacity .2s" : "none" }}>
        <span className="grid size-11 place-items-center rounded-full bg-bg shadow-lg ring-1 ring-line">
          <svg viewBox="0 0 44 44" className={`size-11 ${busy ? "animate-spin [animation-duration:.8s]" : ""}`} style={busy ? undefined : { transform: `rotate(${p * 270}deg)` }}>
            <circle cx="22" cy="22" r="15" fill="none" stroke="var(--color-accent)" strokeOpacity=".15" strokeWidth="3" />
            <circle cx="22" cy="22" r="15" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray={`${busy ? 30 : p * 80} 100`} transform="rotate(-90 22 22)" />
          </svg>
          <svg viewBox="0 0 32 32" className="absolute size-4" style={{ transform: `scale(${0.6 + p * 0.4})` }}><path d="M16 5.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 13.5 7.5 13.5s7.5-7.9 7.5-13.5A7.5 7.5 0 0 0 16 5.5Z" fill="var(--color-accent)" /></svg>
        </span>
      </div>
      <div style={{ transform: pull ? `translateY(${pull * 0.6}px)` : undefined, transition: settling ? "transform .35s cubic-bezier(.2,.9,.3,1.2)" : "none" }}>{children}</div>
    </>
  );
}

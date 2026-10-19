import { useScrollLock } from "../../lib/useScrollLock";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Media } from "../../lib/store";

export function Lightbox({ media, start, onClose }: { media: Media[]; start: number; onClose: () => void }) {
  useScrollLock();
  const [i, setI] = useState(start);
  const go = (n: number) => setI((x) => (x + n + media.length) % media.length);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const m = media[i];
  let x0 = 0;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Media viewer" className="fixed inset-0 z-[80] flex flex-col bg-black/95 text-white"
      onTouchStart={(e) => (x0 = e.touches[0].clientX)} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-semibold">{i + 1} / {media.length}</span>
        <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white/10" aria-label="Close"><X className="size-5" /></button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
        {m.type === "video" ? <video src={m.src} controls autoPlay className="max-h-full max-w-full rounded-xl" /> : <img src={m.src} alt="" className="max-h-full max-w-full rounded-xl object-contain" />}
        {media.length > 1 && <>
          <button onClick={() => go(-1)} className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur" aria-label="Previous"><ChevronLeft /></button>
          <button onClick={() => go(1)} className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur" aria-label="Next"><ChevronRight /></button>
        </>}
      </div>
      <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-4">
        {media.map((x, n) => (
          <button key={n} onClick={() => setI(n)} className={`size-14 shrink-0 overflow-hidden rounded-lg ring-2 ${n === i ? "ring-accent" : "ring-transparent opacity-60"}`} aria-label={`Show item ${n + 1}`}>
            {x.type === "video" ? <video src={x.src} className="size-full object-cover" /> : <img src={x.src} alt="" className="size-full object-cover" />}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clapperboard, Copy } from "lucide-react";
import type { Media } from "../../lib/store";
import { Lightbox } from "./Lightbox";

// Top-right badge, Instagram style: slides = stacked squares, video = reel icon.
export function MediaBadge({ media }: { media: Media[] }) {
  if (media.length > 1) return <Copy className="absolute right-3 top-3 size-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]" aria-label={`${media.length} items`} />;
  if (media[0]?.type === "video") return <Clapperboard className="absolute right-3 top-3 size-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]" aria-label="Video" />;
  return null;
}

// One item at a time; multi-item posts advance every 4s (pausing while a video plays).
export function MediaGrid({ media, postId }: { media: Media[]; postId?: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const x0 = useRef(0);
  const n = media.length;
  useEffect(() => {
    if (n < 2 || open || media[i].type === "video" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), 4000);
    return () => clearTimeout(t);
  }, [i, n, open, media]);
  if (!n) return null;
  const m = media[i];
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface" onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - x0.current; if (Math.abs(d) > 40) setI((x) => (x + (d < 0 ? 1 : -1) + n) % n); }}>
      <AnimatePresence initial={false}>
        <motion.button key={i} onClick={() => setOpen(true)} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0" aria-label="Open media">
          {m.type === "video" ? <video src={m.src} autoPlay muted loop playsInline className="size-full object-cover" onEnded={() => setI((x) => (x + 1) % n)} /> : <img src={m.src} alt="" loading="lazy" className="size-full object-cover" />}
        </motion.button>
      </AnimatePresence>
      <MediaBadge media={media} />
      {n > 1 && <>
        <span className="absolute right-3 top-10 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">{i + 1}/{n}</span>
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1">{media.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Show item ${k + 1}`} className={`size-1.5 rounded-full transition-all ${k === i ? "w-4 bg-white" : "bg-white/60"}`} />)}</div>
      </>}
      {open && <Lightbox media={media} start={i} postId={postId} onClose={() => setOpen(false)} />}
    </div>
  );
}

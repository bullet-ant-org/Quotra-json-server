import { useState } from "react";
import { Play } from "lucide-react";
import type { Media } from "../../lib/store";
import { Lightbox } from "./Lightbox";

function Tile({ m, onClick, more, className = "" }: { m: Media; onClick: () => void; more?: number; className?: string }) {
  return (
    <button onClick={onClick} className={`group relative overflow-hidden bg-surface ${className}`} aria-label={more ? `View ${more} more` : "Open media"}>
      {m.type === "video"
        ? <><video src={m.src} muted playsInline className="size-full object-cover" /><span className="absolute inset-0 grid place-items-center"><span className="grid size-12 place-items-center rounded-full bg-black/50 text-white backdrop-blur"><Play className="size-5 fill-white" /></span></span></>
        : <img src={m.src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
      {more ? <span className="absolute inset-0 grid place-items-center bg-black/50 font-display text-4xl font-extrabold text-white backdrop-blur-[2px]">+{more}</span> : null}
    </button>
  );
}

// 1: full · 2: side by side · 3+: big left, two stacked right, "+N" on the last tile.
export function MediaGrid({ media }: { media: Media[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!media.length) return null;
  const n = media.length;
  return (
    <>
      {n === 1 && <Tile m={media[0]} onClick={() => setOpen(0)} className="block max-h-[34rem] w-full [&>img]:max-h-[34rem]" />}
      {n === 2 && <div className="grid aspect-[2/1.15] grid-cols-2 gap-1">{media.map((m, i) => <Tile key={i} m={m} onClick={() => setOpen(i)} />)}</div>}
      {n >= 3 && (
        <div className="grid aspect-[4/3.2] grid-cols-[1.6fr_1fr] grid-rows-2 gap-1">
          <Tile m={media[0]} onClick={() => setOpen(0)} className="row-span-2" />
          <Tile m={media[1]} onClick={() => setOpen(1)} />
          <Tile m={media[2]} onClick={() => setOpen(2)} more={n > 3 ? n - 3 : undefined} />
        </div>
      )}
      {open !== null && <Lightbox media={media} start={open} onClose={() => setOpen(null)} />}
    </>
  );
}

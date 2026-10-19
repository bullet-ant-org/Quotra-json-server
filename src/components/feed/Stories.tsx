import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { actions, ago, person, useStore, type Story } from "../../lib/store";
import { fileToMedia } from "../../lib/media";

function Viewer({ list, start, onClose }: { list: Story[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const s = useStore((x) => x);
  useEffect(() => {
    const t = setTimeout(() => (i < list.length - 1 ? setI(i + 1) : onClose()), 5000);
    return () => clearTimeout(t);
  }, [i, list.length, onClose]);
  const st = list[i]; const a = person(s, st.authorId);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${a.name}'s story`} className="fixed inset-0 z-[80] grid place-items-center bg-black">
      <div className="relative h-full w-full max-w-md overflow-hidden sm:h-[92dvh] sm:rounded-3xl">
        <img src={st.src} alt="" className="size-full object-cover" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3">
          <div className="flex gap-1">{list.map((_, n) => <span key={n} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"><span className={`block h-full bg-white ${n < i ? "w-full" : n === i ? "animate-[grow_5s_linear_forwards]" : "w-0"}`} /></span>)}</div>
          <div className="mt-3 flex items-center gap-2 text-white"><img src={a.avatar} alt="" className="size-9 rounded-full object-cover" /><span className="font-semibold">{a.username}</span><span className="text-sm opacity-70">{ago(st.at)}</span>
            <button onClick={onClose} className="ml-auto grid size-9 place-items-center" aria-label="Close"><X /></button></div>
        </div>
        <button className="absolute inset-y-0 left-0 w-1/3" onClick={() => setI(Math.max(0, i - 1))} aria-label="Previous story" />
        <button className="absolute inset-y-0 right-0 w-1/3" onClick={() => (i < list.length - 1 ? setI(i + 1) : onClose())} aria-label="Next story" />
      </div>
    </div>,
    document.body,
  );
}

export function Stories() {
  const s = useStore((x) => x);
  const list = s.stories.filter((st) => st.authorId === s.me || person(s, st.authorId).following).filter((st) => !s.blocked.includes(st.authorId));
  const me = person(s, s.me);
  const [open, setOpen] = useState<number | null>(null);
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 pt-1 sm:mx-0 sm:px-0">
      <button onClick={() => file.current?.click()} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 text-xs">
        <span className="relative"><img src={me.avatar} alt="" className="size-[4.25rem] rounded-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-accent text-accent-ink ring-[3px] ring-bg"><Plus className="size-4" /></span></span>
        <span className="w-full truncate text-muted">Your story</span>
      </button>
      <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) actions.addStory((await fileToMedia(f)).src); e.target.value = ""; }} />
      {list.map((st, n) => { const a = person(s, st.authorId); return (
        <button key={st.id} onClick={() => setOpen(n)} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 text-xs">
          <span className="rounded-full bg-gradient-to-tr from-amber-400 via-accent to-fuchsia-600 p-[2.5px]"><img src={a.avatar} alt="" className="size-[4rem] rounded-full object-cover ring-[3px] ring-bg" /></span>
          <span className="w-full truncate">{a.id === s.me ? "You" : a.username}</span>
        </button>
      ); })}
      {open !== null && <Viewer list={list} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

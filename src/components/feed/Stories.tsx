import { useScrollLock } from "../../lib/useScrollLock";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Plus, Send, X } from "lucide-react";
import { actions, ago, person, useStore, type Story } from "../../lib/store";
import { fileToMedia } from "../../lib/media";

const SEEN = "outsider-seen-stories";
const loadSeen = (): string[] => { try { return JSON.parse(localStorage.getItem(SEEN) ?? "[]"); } catch { return []; } };

// Plays one author's stories, then moves on to the next author.
function Viewer({ groups, start, onSeen, onClose }: { groups: Story[][]; start: number; onSeen: (id: string) => void; onClose: () => void }) {
  useScrollLock();
  const [g, setG] = useState(start);
  const [i, setI] = useState(0);
  const [reply, setReply] = useState("");
  const [paused, setPaused] = useState(false);
  const nav = useNavigate();
  const s = useStore((x) => x);
  const list = groups[g]; const st = list[i]; const a = person(s, st.authorId);
  const next = () => (i < list.length - 1 ? setI(i + 1) : g < groups.length - 1 ? (setG(g + 1), setI(0)) : onClose());
  const prev = () => (i > 0 ? setI(i - 1) : g > 0 ? (setG(g - 1), setI(0)) : undefined);
  useEffect(() => { onSeen(st.id); if (paused) return; const t = setTimeout(next, 5000); return () => clearTimeout(t); }); // eslint-disable-line react-hooks/exhaustive-deps
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${a.name}'s story`} className="fixed inset-0 z-[80] grid place-items-center bg-black">
      <div className="relative h-full w-full max-w-md overflow-hidden sm:h-[92dvh] sm:rounded-3xl">
        <img key={st.id} src={st.src} alt="" className="size-full object-cover" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3">
          <div className="flex gap-1">{list.map((x, n) => <span key={x.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"><span key={`${g}-${i}`} className={`block h-full bg-white ${n < i ? "w-full" : n === i ? (paused ? "w-1/2" : "animate-[grow_5s_linear_forwards]") : "w-0"}`} /></span>)}</div>
          <div className="mt-3 flex items-center gap-2 text-white"><img src={a.avatar} alt="" className="size-9 rounded-full object-cover" /><span className="font-semibold">{a.username}</span><span className="text-sm opacity-70">{ago(st.at)}</span>
            <button onClick={onClose} className="ml-auto grid size-9 place-items-center" aria-label="Close"><X /></button></div>
        </div>
        <button className="absolute inset-y-16 left-0 w-1/3" onClick={prev} aria-label="Previous story" />
        <button className="absolute inset-y-16 right-0 w-1/3" onClick={next} aria-label="Next story" />
        {a.id !== s.me && (
          <form onSubmit={(e) => { e.preventDefault(); if (reply.trim()) { onClose(); nav("/messages"); } }} className="absolute inset-x-3 bottom-4 flex gap-2">
            <input value={reply} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${a.username}…`} aria-label="Reply" className="min-w-0 flex-1 rounded-full border border-white/60 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-white/70 outline-none backdrop-blur" />
            <button className="grid size-11 place-items-center rounded-full text-white" aria-label="Send reply"><Send /></button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function Stories() {
  const s = useStore((x) => x);
  const me = person(s, s.me);
  const [seen, setSeen] = useState<string[]>(loadSeen);
  const [open, setOpen] = useState<number | null>(null);
  const file = useRef<HTMLInputElement>(null);
  // Group by author, newest first; preview shows each author's latest story.
  const byAuthor = new Map<string, Story[]>();
  s.stories.filter((st) => (st.authorId === s.me || person(s, st.authorId).following) && !s.blocked.includes(st.authorId))
    .sort((a, b) => a.at - b.at).forEach((st) => byAuthor.set(st.authorId, [...(byAuthor.get(st.authorId) ?? []), st]));
  const groups = [...byAuthor.values()].sort((a, b) => Number(a.every((x) => seen.includes(x.id))) - Number(b.every((x) => seen.includes(x.id))) || b.at(-1)!.at - a.at(-1)!.at);
  const markSeen = (id: string) => { if (!seen.includes(id)) { const n = [...seen, id].slice(-300); setSeen(n); try { localStorage.setItem(SEEN, JSON.stringify(n)); } catch { /* */ } } };

  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-1 sm:mx-0 sm:px-0">
      <button onClick={() => file.current?.click()} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1 text-xs">
        <span className="relative"><img src={me.avatar} alt="" className="size-[4.5rem] rounded-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-accent text-accent-ink ring-[3px] ring-bg"><Plus className="size-4" /></span></span>
        <span className="w-full truncate text-muted">Add story</span>
      </button>
      <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) actions.addStory((await fileToMedia(f)).src); e.target.value = ""; }} />
      {groups.map((list, n) => {
        const latest = list.at(-1)!; const a = person(s, latest.authorId); const allSeen = list.every((x) => seen.includes(x.id));
        return (
          <button key={a.id} onClick={() => setOpen(n)} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1 text-xs">
            <span className={`relative rounded-full p-[2.5px] ${allSeen ? "bg-line" : "bg-gradient-to-tr from-amber-400 via-accent to-fuchsia-600"}`}>
              <img src={latest.src} alt="" className="size-[4.25rem] rounded-full object-cover ring-[3px] ring-bg" />
              <img src={a.avatar} alt="" className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full object-cover ring-2 ring-bg" />
            </span>
            <span className={`w-full truncate ${allSeen ? "text-muted" : ""}`}>{a.id === s.me ? "Your story" : a.username}</span>
          </button>
        );
      })}
      {open !== null && <Viewer groups={groups} start={open} onSeen={markSeen} onClose={() => setOpen(null)} />}
    </div>
  );
}

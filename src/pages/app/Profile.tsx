import { useScrollLock } from "../../lib/useScrollLock";
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { post } from "../../lib/api";
import { LIVE } from "../../lib/store";
import { createPortal } from "react-dom";
import { Clapperboard, Grid3x3, Plus, SquareUser, X } from "lucide-react";
import { MediaBadge } from "../../components/feed/MediaGrid";
import { actions, person, useStore, type Highlight, type Media } from "../../lib/store";
import { fileToMedia } from "../../lib/media";
import { Lightbox } from "../../components/feed/Lightbox";
import { useTitle } from "../../lib/useTitle";

function NewHighlight({ onClose, mine }: { onClose: () => void; mine: string[] }) {
  useScrollLock();
  const [name, setName] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const file = useRef<HTMLInputElement>(null);
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/50 sm:place-items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="New highlight" onClick={(e) => e.stopPropagation()} className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-bg p-6 sm:rounded-[2rem]">
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-extrabold">New highlight</h2><button onClick={onClose} className="grid size-9 place-items-center rounded-full bg-surface" aria-label="Close"><X className="size-5" /></button></div>
        <label className="mt-4 block text-sm font-semibold">Name<input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="e.g. Beach days" className="mt-1 w-full rounded-2xl bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent" /></label>
        <p className="mt-4 text-sm font-semibold">Pick photos</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          <button onClick={() => file.current?.click()} className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-line text-muted" aria-label="Upload photos"><Plus /></button>
          {[...new Set([...items, ...mine])].map((src) => { const on = items.includes(src); return (
            <button key={src} onClick={() => setItems((x) => on ? x.filter((y) => y !== src) : [...x, src])} className={`relative aspect-square overflow-hidden rounded-xl ring-[3px] ${on ? "ring-accent" : "ring-transparent"}`}><img src={src} alt="" className="size-full object-cover" />{on && <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-accent text-xs font-bold text-accent-ink">{items.indexOf(src) + 1}</span>}</button>
          ); })}
        </div>
        <input ref={file} type="file" accept="image/*" multiple hidden onChange={async (e) => { const out = await Promise.all([...(e.target.files ?? [])].map(fileToMedia)); setItems((x) => [...x, ...out.map((m) => m.src)]); }} />
        <button disabled={!name.trim() || !items.length} onClick={() => { actions.addHighlight(name.trim(), items); onClose(); }} className="mt-6 w-full rounded-full bg-accent py-3.5 font-bold text-accent-ink disabled:opacity-40">Add highlight</button>
      </div>
    </div>,
    document.body,
  );
}

export default function Profile() {
  const { username } = useParams();
  const nav = useNavigate();
  const s = useStore((x) => x);
  const p = username ? s.people.find((x) => x.username === username) : person(s, s.me);
  useTitle(p?.name ?? "Profile");
  const [tab, setTab] = useState<"posts" | "reels" | "tagged">("posts");
  const [newH, setNewH] = useState(false);
  const [view, setView] = useState<{ media: Media[]; i: number } | null>(null);
  if (!p) return <p className="p-10 text-center text-muted">That outsider doesn't exist.</p>;
  if (username && p.id === s.me) return <Navigate to="/profile" replace />;
  const isMe = p.id === s.me;
  const blocked = s.blocked.includes(p.id);
  const posts = s.posts.filter((x) => x.authorId === p.id);
  const media = posts.flatMap((x) => x.media);
  const highlights: Highlight[] = isMe ? s.highlights : [];

  const tabs = [["posts", Grid3x3, "Posts"], ["reels", Clapperboard, "Reels"], ["tagged", SquareUser, "Tagged"]] as const;
  const shown = tab === "tagged" ? s.posts.filter((x) => x.tags.includes(p.id) && x.media.length) : posts.filter((x) => x.media.length && (tab !== "reels" || x.media.some((m) => m.type === "video") || x.media.length > 1));
  const stats = [[posts.length, "Posts"], [isMe ? 1248 : 3410, "Followers"], [isMe ? s.people.filter((x) => x.following).length : 182, "Following"]] as const;
  return (
    <div className="mx-auto max-w-4xl pb-10">
      <div className="px-4 pt-5 sm:px-8">
        <div className="flex items-center gap-5 sm:gap-12">
          <div className="relative shrink-0">
            <span className="block rounded-full bg-gradient-to-tr from-amber-400 via-accent to-fuchsia-600 p-[3px]"><img src={p.avatar} alt="" className="size-20 rounded-full object-cover ring-4 ring-bg sm:size-36" /></span>
            {isMe && <button onClick={() => setNewH(true)} className="absolute bottom-0.5 right-0.5 grid size-6 place-items-center rounded-full bg-accent text-accent-ink ring-[3px] ring-bg sm:size-8" aria-label="Add highlight"><Plus className="size-4" /></button>}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="mb-3 hidden truncate text-xl font-bold sm:block">{p.username}</h1>
            <dl className="flex justify-around text-center sm:justify-start sm:gap-10 sm:text-left">
              {stats.map(([n, l]) => <div key={l}><dd className="font-display text-lg font-extrabold sm:text-xl">{Number(n).toLocaleString()}</dd><dt className="text-sm text-muted">{l}</dt></div>)}
            </dl>
          </div>
        </div>
        <div className="mt-3 text-sm">
          <p className="font-bold">{p.name}</p>
          <p className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-semibold">@{p.username}</p>
          {p.bio && <p className="mt-1.5 max-w-md whitespace-pre-line">{p.bio}</p>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-md">
          {isMe ? <>
            <Link to="/settings" className="rounded-lg bg-surface py-2 text-center text-sm font-bold hover:bg-surface-2">Edit profile</Link>
            <button onClick={() => navigator.clipboard?.writeText(`${location.origin}/u/${p.username}`).catch(() => {})} className="rounded-lg bg-surface py-2 text-sm font-bold hover:bg-surface-2">Share profile</button>
          </> : <>
            <button onClick={() => actions.follow(p.id)} className={`rounded-lg py-2 text-sm font-bold ${p.following ? "bg-surface" : "bg-accent text-accent-ink"}`}>{p.following ? "Following" : "Follow"}</button>
            <button onClick={async () => { if (!LIVE) return nav("/messages/c1"); try { const r = await post<{ conversation: { id: string } }>("/conversations", { members: [p.id] }); nav(`/messages/${r.conversation.id}`); } catch (e) { alert((e as Error).message); } }} className="rounded-lg bg-surface py-2 text-sm font-bold">Message</button>
            <button onClick={() => (blocked ? actions.unblock(p.id) : actions.block(p.id))} className="col-span-2 text-xs font-semibold text-red-600">{blocked ? "Unblock" : "Block"} @{p.username}</button>
          </>}
        </div>
        {(isMe || highlights.length > 0) && (
          <div className="no-scrollbar -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {isMe && <button onClick={() => setNewH(true)} className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-xs"><span className="grid size-16 place-items-center rounded-full border border-line"><Plus className="size-6" /></span>New</button>}
            {highlights.map((h) => (
              <button key={h.id} onClick={() => setView({ media: h.items.map((src) => ({ type: "image", src })), i: 0 })} className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-xs">
                <span className="rounded-full border border-line p-[3px]"><img src={h.cover} alt="" className="size-[3.6rem] rounded-full object-cover" /></span><span className="w-full truncate">{h.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {blocked ? <p className="m-4 rounded-2xl bg-surface p-6 text-center text-muted">You blocked @{p.username}. You won't see their posts or stories.</p> : <>
        <div className="mt-4 grid grid-cols-3 border-t border-line" role="tablist">
          {tabs.map(([id, I, l]) => <button key={id} role="tab" aria-selected={tab === id} aria-label={l} onClick={() => setTab(id)} className={`flex justify-center border-t-2 py-3 ${tab === id ? "border-ink" : "border-transparent text-muted"}`}><I className="size-6" /></button>)}
        </div>
        {shown.length ? (
          <ul className={`grid grid-cols-3 gap-0.5 ${tab === "reels" ? "[&>li]:aspect-[9/16]" : "[&>li]:aspect-square"}`}>
            {shown.map((x) => (
              <li key={x.id} className="relative overflow-hidden bg-surface"><button onClick={() => setView({ media: x.media, i: 0 })} className="size-full">
                {x.media[0].type === "video" ? <video src={x.media[0].src} muted className="size-full object-cover" /> : <img src={x.media[0].src} alt="" loading="lazy" className="size-full object-cover" />}
                <MediaBadge media={x.media} /></button></li>
            ))}
          </ul>
        ) : <p className="py-14 text-center text-muted">{isMe ? "Nothing yet. Go somewhere and post it." : "No posts yet."}</p>}
      </>}
      {newH && <NewHighlight mine={media.filter((m) => m.type === "image").map((m) => m.src)} onClose={() => setNewH(false)} />}
      {view && <Lightbox media={view.media} start={view.i} onClose={() => setView(null)} />}
    </div>
  );
}

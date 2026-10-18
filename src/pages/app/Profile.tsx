import { useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { Clapperboard, Grid3x3, MessageCircle, Plus, Settings, Share2, Tag, X } from "lucide-react";
import { actions, person, useStore, type Highlight, type Media } from "../../lib/store";
import { fileToMedia, photo, PH } from "../../lib/media";
import { Lightbox } from "../../components/feed/Lightbox";
import { useTitle } from "../../lib/useTitle";

function NewHighlight({ onClose, mine }: { onClose: () => void; mine: string[] }) {
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
  const tagged = s.posts.filter((x) => x.tags.includes(p.id)).flatMap((x) => x.media);
  const likes = posts.reduce((n, x) => n + x.likes.length, 0);
  const grid = tab === "tagged" ? tagged : tab === "reels" ? media.filter((m, i) => m.type === "video" || i % 2 === 0) : media;
  const banner = media[0]?.src ?? photo(PH.hills, 1600);
  const highlights: Highlight[] = isMe ? s.highlights : [];

  return (
    <div className="pb-10">
      <div className="relative h-52 sm:h-80">
        <img src={banner} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/30 to-bg" />
      </div>
      <div className="relative mx-auto -mt-20 max-w-4xl px-4 sm:-mt-24 sm:px-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
          <img src={p.avatar} alt="" className="size-32 rounded-full object-cover ring-[6px] ring-bg sm:size-40" />
          <div className="mt-3 min-w-0 flex-1 sm:pb-3">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{p.name}</h1>
            <p className="font-semibold text-muted">@{p.username}</p>
          </div>
          <div className="mt-4 flex gap-2 sm:pb-4">
            {isMe ? <>
              <Link to="/settings" className="rounded-full bg-accent px-5 py-2.5 font-bold text-accent-ink">Edit profile</Link>
              <Link to="/settings" className="grid size-11 place-items-center rounded-full bg-surface" aria-label="Settings"><Settings className="size-5" /></Link>
            </> : <>
              <button onClick={() => actions.follow(p.id)} className={`rounded-full px-6 py-2.5 font-bold ${p.following ? "bg-surface" : "bg-accent text-accent-ink"}`}>{p.following ? "Following" : "Follow"}</button>
              <Link to="/messages/c1" className="inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 font-bold"><MessageCircle className="size-4" />Message</Link>
              <button onClick={() => (blocked ? actions.unblock(p.id) : actions.block(p.id))} className="rounded-full bg-surface px-4 py-2.5 font-bold text-red-600">{blocked ? "Unblock" : "Block"}</button>
            </>}
            <button onClick={() => navigator.clipboard?.writeText(`${location.origin}/u/${p.username}`).catch(() => {})} className="grid size-11 place-items-center rounded-full bg-surface" aria-label="Copy profile link"><Share2 className="size-5" /></button>
          </div>
        </div>

        <dl className="mt-5 flex justify-center gap-8 sm:justify-start">
          {[["Following", isMe ? s.people.filter((x) => x.following).length : 182], ["Followers", isMe ? 1248 : 3410], ["Likes", likes + (isMe ? 5300 : 21000)]].map(([k, v]) => (
            <div key={k} className="text-center sm:text-left"><dd className="font-display text-2xl font-extrabold">{Number(v).toLocaleString()}</dd><dt className="text-sm text-muted">{k}</dt></div>
          ))}
        </dl>
        {p.bio && <p className="mx-auto mt-4 max-w-lg text-center sm:mx-0 sm:text-left">{p.bio}</p>}

        {(isMe || highlights.length > 0) && (
          <div className="no-scrollbar -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {isMe && <button onClick={() => setNewH(true)} className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-xs font-semibold"><span className="grid size-20 place-items-center rounded-full border-2 border-dashed border-line text-muted"><Plus className="size-7" /></span>New</button>}
            {highlights.map((h) => (
              <button key={h.id} onClick={() => setView({ media: h.items.map((src) => ({ type: "image", src })), i: 0 })} className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-xs font-semibold">
                <span className="rounded-full bg-gradient-to-tr from-accent to-accent-text p-[3px]"><img src={h.cover} alt="" className="size-[4.6rem] rounded-full object-cover ring-[3px] ring-bg" /></span><span className="w-full truncate">{h.name}</span>
              </button>
            ))}
          </div>
        )}

        {blocked ? <p className="mt-10 rounded-2xl bg-surface p-6 text-center text-muted">You blocked @{p.username}. You won't see their posts or stories.</p> : <>
          <div className="mt-6 grid grid-cols-3 border-b border-line" role="tablist">
            {([["posts", "Posts", Grid3x3], ["reels", "Reels", Clapperboard], ["tagged", "Tagged", Tag]] as const).map(([id, l, I]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-2 border-b-2 py-3 text-sm font-bold ${tab === id ? "border-accent text-accent-text" : "border-transparent text-muted"}`}><I className="size-4" />{l}</button>
            ))}
          </div>
          {grid.length ? (
            <ul className={`mt-1 grid gap-1 ${tab === "reels" ? "grid-cols-3 [&>li]:aspect-[9/16]" : "grid-cols-3 [&>li]:aspect-square"}`}>
              {grid.map((m, i) => (
                <li key={i} className="overflow-hidden bg-surface"><button onClick={() => setView({ media: grid, i })} className="size-full">{m.type === "video" ? <video src={m.src} muted className="size-full object-cover" /> : <img src={m.src} alt="" loading="lazy" className="size-full object-cover transition-transform hover:scale-105" />}</button></li>
              ))}
            </ul>
          ) : <p className="py-14 text-center text-muted">{isMe ? "Nothing here yet. Go somewhere and post it." : "No posts yet."}</p>}
        </>}
      </div>
      {newH && <NewHighlight mine={media.filter((m) => m.type === "image").map((m) => m.src)} onClose={() => setNewH(false)} />}
      {view && <Lightbox media={view.media} start={view.i} onClose={() => setView(null)} />}
    </div>
  );
}

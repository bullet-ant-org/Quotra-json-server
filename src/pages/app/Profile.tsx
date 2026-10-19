import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { post } from "../../lib/api";
import { LIVE } from "../../lib/store";
import { createPortal } from "react-dom";
import { CalendarDays, Camera, Compass, MapPin, MessageCircle, Pencil, Plus, Settings, X } from "lucide-react";
import { PostCard } from "../../components/feed/PostCard";
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
  const nav = useNavigate();
  const s = useStore((x) => x);
  const p = username ? s.people.find((x) => x.username === username) : person(s, s.me);
  useTitle(p?.name ?? "Profile");
  const [tab, setTab] = useState<"all" | "photos" | "reels" | "tagged">("all");
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

  const tabs = [["all", "All"], ["photos", "Photos"], ["reels", "Reels"], ["tagged", "Tagged"]] as const;
  const stats = [[isMe ? 1248 : 3410, "followers"], [isMe ? s.people.filter((x) => x.following).length : 182, "following"], [likes + (isMe ? 5300 : 21000), "likes"]] as const;
  return (
    <div className="pb-10">
      <div className="relative h-48 sm:h-80 lg:h-[26rem]">
        <img src={banner} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-bg" />
        {isMe && <label className="absolute bottom-4 right-4 grid size-10 cursor-pointer place-items-center rounded-full bg-surface/90 backdrop-blur" aria-label="Change cover photo"><Camera className="size-5" /><input type="file" accept="image/*" hidden /></label>}
      </div>

      <div className="mx-auto max-w-6xl">
      <div className="relative -mt-16 px-4 sm:-mt-20 sm:px-6">
        <div className="flex items-end gap-4">
          <div className="relative shrink-0">
            <img src={p.avatar} alt="" className="size-32 rounded-full object-cover ring-4 ring-bg sm:size-40" />
            {isMe && <span className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full bg-surface ring-2 ring-bg"><Camera className="size-4" /></span>}
          </div>
          <div className="min-w-0 pb-2">
            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{p.name}</h1>
            <p className="text-sm text-muted">@{p.username}</p>
          </div>
        </div>
        <p className="mt-3 text-sm">{stats.map(([n, l], i) => <span key={l}>{i > 0 && <span className="text-muted"> · </span>}<b>{Number(n).toLocaleString()}</b> <span className="text-muted">{l}</span></span>)}</p>
        {p.bio && <p className="mt-2 max-w-lg">{p.bio}</p>}

        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2 sm:max-w-xl">
          {isMe ? <>
            <button onClick={() => setNewH(true)} className="flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 font-bold text-accent-ink"><Plus className="size-5" />Add highlight</button>
            <Link to="/settings" className="flex items-center justify-center gap-2 rounded-xl bg-surface py-2.5 font-bold"><Pencil className="size-4" />Edit profile</Link>
            <Link to="/settings" className="grid w-11 place-items-center rounded-xl bg-surface" aria-label="Settings"><Settings className="size-5" /></Link>
          </> : <>
            <button onClick={() => actions.follow(p.id)} className={`rounded-xl py-2.5 font-bold ${p.following ? "bg-surface" : "bg-accent text-accent-ink"}`}>{p.following ? "Following" : "Follow"}</button>
            <button onClick={async () => { if (!LIVE) return nav("/messages/c1"); try { const r = await post<{ conversation: { id: string } }>("/conversations", { members: [p.id] }); nav(`/messages/${r.conversation.id}`); } catch (e) { alert((e as Error).message); } }} className="flex items-center justify-center gap-2 rounded-xl bg-surface py-2.5 font-bold"><MessageCircle className="size-4" />Message</button>
            <button onClick={() => (blocked ? actions.unblock(p.id) : actions.block(p.id))} className="rounded-xl bg-surface px-3 text-sm font-bold text-red-600">{blocked ? "Unblock" : "Block"}</button>
          </>}
        </div>

        {(isMe || highlights.length > 0) && (
          <div className="no-scrollbar -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {isMe && <button onClick={() => setNewH(true)} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 text-xs font-semibold"><span className="grid size-[4.5rem] place-items-center rounded-full border-2 border-dashed border-line text-muted"><Plus className="size-6" /></span>New</button>}
            {highlights.map((h) => (
              <button key={h.id} onClick={() => setView({ media: h.items.map((src) => ({ type: "image", src })), i: 0 })} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 text-xs font-semibold">
                <span className="rounded-full bg-gradient-to-tr from-accent to-accent-text p-[3px]"><img src={h.cover} alt="" className="size-[4.1rem] rounded-full object-cover ring-[3px] ring-bg" /></span><span className="w-full truncate">{h.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {blocked ? <p className="m-4 rounded-2xl bg-surface p-6 text-center text-muted">You blocked @{p.username}. You won't see their posts or stories.</p> : <>
        <div className="mt-5 flex border-y border-line px-2" role="tablist">
          {tabs.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex-1 border-b-[3px] py-3 text-sm font-bold ${tab === id ? "border-accent text-accent-text" : "border-transparent text-muted"}`}>{l}</button>)}
        </div>
        {tab === "all" ? (
          <div className="space-y-4 px-4 pt-4 sm:px-6">
            <section className="-mx-4 border-b border-line px-4 pb-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-4">
              <h2 className="mb-2 font-bold">Personal details</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-center gap-2"><MapPin className="size-4" />Lives in Port Harcourt, Nigeria</li>
                <li className="flex items-center gap-2"><Compass className="size-4" />{posts.filter((x) => x.place).length} places tagged</li>
                <li className="flex items-center gap-2"><CalendarDays className="size-4" />Outsider since 2026</li>
              </ul>
            </section>
            {posts.length ? posts.map((x) => <PostCard key={x.id} post={x} />) : <p className="py-10 text-center text-muted">{isMe ? "Nothing yet. Go somewhere and post it." : "No posts yet."}</p>}
          </div>
        ) : grid.length ? (
          <ul className={`mt-1 grid grid-cols-3 gap-0.5 ${tab === "reels" ? "[&>li]:aspect-[9/16]" : "[&>li]:aspect-square"}`}>
            {grid.map((m, i) => <li key={i} className="overflow-hidden bg-surface"><button onClick={() => setView({ media: grid, i })} className="size-full">{m.type === "video" ? <video src={m.src} muted className="size-full object-cover" /> : <img src={m.src} alt="" loading="lazy" className="size-full object-cover" />}</button></li>)}
          </ul>
        ) : <p className="py-14 text-center text-muted">Nothing here yet.</p>}
      </>}
      </div>
      {newH && <NewHighlight mine={media.filter((m) => m.type === "image").map((m) => m.src)} onClose={() => setNewH(false)} />}
      {view && <Lightbox media={view.media} start={view.i} onClose={() => setView(null)} />}
    </div>
  );
}

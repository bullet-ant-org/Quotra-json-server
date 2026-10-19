import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, Globe, Heart, ThumbsUp, MapPin, MessageCircle, MoreHorizontal, Repeat2, Send, Share2, Ticket, Users } from "lucide-react";
import { actions, ago, person, useStore, type Post } from "../../lib/store";
import { bySlug } from "../../fixtures/destinations";
import { MediaGrid } from "./MediaGrid";
import { LIVE } from "../../lib/store";

function RichText({ text }: { text: string }) {
  return <>{text.split(/(#\w+|@[\w.]+)/g).map((t, i) => /^[#@]/.test(t) ? <span key={i} className="font-semibold text-accent-text">{t}</span> : t)}</>;
}

export function PostCard({ post }: { post: Post }) {
  const nav = useNavigate();
  const s = useStore((x) => x);
  const a = person(s, post.authorId);
  const liked = post.likes.includes(s.me);
  const [showC, setShowC] = useState(false);
  const [c, setC] = useState("");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const place = post.place ? bySlug(post.place) : undefined;
  const going = post.party?.going.includes(s.me);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const send = (e: FormEvent) => { e.preventDefault(); if (c.trim()) { actions.comment(post.id, c.trim()); setC(""); } };
  const act = "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface";
  const profileLink = a.id === s.me ? "/profile" : `/u/${a.username}`;

  return (
    <article className="relative -mx-4 overflow-hidden border-y border-line bg-bg sm:mx-0 sm:rounded-2xl sm:border">
      <header className="flex items-start gap-3 p-4 pb-3">
        <Link to={profileLink}><img src={a.avatar} alt="" className="size-11 rounded-full object-cover" /></Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate"><Link to={profileLink} className="font-bold hover:underline">{a.name}</Link>{post.tags.length > 0 && <span className="text-muted"> with {post.tags.map((t) => person(s, t).name.split(" ")[0]).join(", ")}</span>}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
            <span>{ago(post.at)}</span><span aria-hidden="true">·</span><Globe className="size-3.5" aria-label="Public" />
            {place && <><span aria-hidden="true">·</span><Link to={`/destinations/${place.slug}`} className="inline-flex items-center gap-0.5 font-semibold text-accent-text hover:underline"><MapPin className="size-3.5" />{place.name}</Link></>}
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className="grid size-9 place-items-center rounded-full hover:bg-surface" aria-label="Post options" aria-expanded={menu}><MoreHorizontal className="size-5" /></button>
          {menu && (
            <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-2xl border border-line bg-bg py-1 text-sm shadow-xl">
              {a.id !== s.me && <button onClick={() => { actions.follow(a.id); setMenu(false); }} className="block w-full px-4 py-2.5 text-left hover:bg-surface">{a.following ? "Unfollow" : "Follow"} @{a.username}</button>}
              <button onClick={() => { navigator.clipboard?.writeText(location.origin + "/home#" + post.id).catch(() => {}); setMenu(false); flash("Link copied"); }} className="block w-full px-4 py-2.5 text-left hover:bg-surface">Copy link</button>
              {a.id !== s.me && <button onClick={() => { actions.block(a.id); setMenu(false); }} className="block w-full px-4 py-2.5 text-left text-red-600 hover:bg-surface">Block @{a.username}</button>}
            </div>
          )}
        </div>
      </header>

      {post.text && <p className="whitespace-pre-line px-4 pb-3 text-[15px] leading-relaxed"><RichText text={post.text} /></p>}
      <MediaGrid media={post.media} />

      {post.party && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl bg-accent-soft p-3">
          <Users className="size-9 shrink-0 rounded-full bg-accent p-2 text-accent-ink" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold">Going party · {new Date(post.party.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}</p>
            <p className="text-muted">{post.party.going.length}/{post.party.max} going{place ? ` to ${place.name}` : ""}</p>
          </div>
          {a.id !== s.me && <button onClick={() => actions.joinParty(post.id)} disabled={!going && post.party.going.length >= post.party.max} className={`rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50 ${going ? "bg-bg" : "bg-accent text-accent-ink"}`}>{going ? "Going ✓" : post.party.going.length >= post.party.max ? "Full" : "Join"}</button>}
        </div>
      )}

      <div className="flex items-center justify-between px-4 pt-3 text-sm text-muted">
        <span className="flex items-center gap-1.5">{post.likes.length > 0 && <><span className="flex -space-x-1"><span className="grid size-5 place-items-center rounded-full bg-accent ring-2 ring-bg"><ThumbsUp className="size-3 fill-white text-white" /></span><span className="grid size-5 place-items-center rounded-full bg-red-500 ring-2 ring-bg"><Heart className="size-3 fill-white text-white" /></span></span>{post.likes.length}</>}</span>
        <span className="space-x-3"><button onClick={() => setShowC(!showC)} className="hover:underline">{post.comments.length} comments</button><span>{post.reposts} shares</span></span>
      </div>

      <div className="mx-2 mt-2 flex border-t border-line py-1">
        <button onClick={() => actions.toggleLike(post.id)} className={`${act} ${liked ? "!text-accent-text" : ""}`} aria-pressed={liked}><ThumbsUp className={`size-5 ${liked ? "fill-accent text-accent" : ""}`} />Like</button>
        <button onClick={() => setShowC(!showC)} className={act}><MessageCircle className="size-5" />Comment</button>
        <button onClick={() => { actions.repost(post.id); flash("Reposted to your profile"); }} className={act}><Repeat2 className="size-5" />Share</button>
        <button onClick={async () => { try { await navigator.share?.({ text: post.text, url: location.href }); } catch { /* cancelled */ } }} className={`${act} hidden sm:flex`}><Share2 className="size-5" />Send</button>
      </div>

      {place && (
        <div className="mx-4 mb-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
          <button onClick={() => nav(`/destinations/${place.slug}`)} className="flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-bold text-accent-ink"><Ticket className="size-4" />Book a visit</button>
          <button onClick={() => { actions.requestVisit(`Hey! I'd like to come over. (from @${person(s, s.me).username})`, new Date().toISOString().slice(0, 10), 1, place.slug); nav(LIVE ? "/messages" : "/messages/c2"); }} className="flex items-center justify-center gap-2 rounded-xl bg-surface py-2.5 text-sm font-bold"><CalendarCheck className="size-4" />Message place</button>
        </div>
      )}

      {showC && (
        <div className="space-y-3 border-t border-line p-4">
          {post.comments.map((cm) => { const ca = person(s, cm.authorId); return (
            <div key={cm.id} className="flex gap-2.5"><img src={ca.avatar} alt="" className="size-8 rounded-full object-cover" />
              <div className="rounded-2xl bg-surface px-3.5 py-2 text-sm"><p className="font-bold">{ca.name} <span className="font-normal text-muted">{ago(cm.at)}</span></p><p>{cm.text}</p></div></div>
          ); })}
          <form onSubmit={send} className="flex items-center gap-2">
            <img src={person(s, s.me).avatar} alt="" className="size-8 rounded-full object-cover" />
            <label htmlFor={`c-${post.id}`} className="sr-only">Write a comment</label>
            <input id={`c-${post.id}`} value={c} onChange={(e) => setC(e.target.value)} placeholder="Write a comment" className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <button className="grid size-9 place-items-center rounded-full bg-accent text-accent-ink" aria-label="Send"><Send className="size-4" /></button>
          </form>
        </div>
      )}
      {toast && <p role="status" className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg shadow-lg">{toast}</p>}
    </article>
  );
}

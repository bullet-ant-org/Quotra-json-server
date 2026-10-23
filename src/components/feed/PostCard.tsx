import { useEffect, useRef, useState } from "react";

const fmtN = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(n));
import { Link, useNavigate } from "react-router-dom";
import { Eye, Bookmark, Heart, MessageCircle, MoreHorizontal, Send, Ticket, Users } from "lucide-react";
import { actions, ago, person, useStore, type Post , commentCount } from "../../lib/store";
import { bySlug } from "../../fixtures/destinations";
import { MediaGrid } from "./MediaGrid";
import { CommentsSheet } from "./CommentsSheet";
import { ShareSheet } from "./ShareSheet";
import { LIVE } from "../../lib/store";

function RichText({ text }: { text: string }) {
  return <>{text.split(/(#\w+|@[\w.]+)/g).map((t, i) => /^[#@]/.test(t) ? <span key={i} className="font-semibold text-accent-text">{t}</span> : t)}</>;
}

const seen = new Set<string>(); // one view per post per session

export function PostCard({ post, onVisible, priority = false }: { post: Post; onVisible?: () => void; priority?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let t0 = 0; // dwell: time on screen is sent with the first view, it drives ranking
    const flush = () => { if (t0 && !seen.has(post.id)) { seen.add(post.id); actions.view(post.id, Date.now() - t0); } t0 = 0; };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { onVisible?.(); t0 ||= Date.now(); } else flush(); }, { threshold: 0.4 });
    io.observe(el); return () => { flush(); io.disconnect(); };
  }, [post.id, onVisible]);
  const nav = useNavigate();
  const s = useStore((x) => x);
  const a = person(s, post.authorId);
  const liked = post.likes.includes(s.me);
  const [menu, setMenu] = useState(false);
  const saved = !!s.saved?.includes(post.id);
  const [sheet, setSheet] = useState<null | "comments" | "share">(null);
  const [toast, setToast] = useState<string | null>(null);
  const place = post.place ? bySlug(post.place) : undefined;
  const going = post.party?.going.includes(s.me);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const profileLink = a.id === s.me ? "/profile" : `/u/${a.username}`;

  return (
    <article ref={ref} className="relative -mx-4 bg-bg sm:mx-0 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-line">
      <header className="flex items-center gap-3 px-3 py-2.5">
        <Link to={profileLink} className="rounded-full bg-gradient-to-tr from-accent to-accent-text p-[2px]"><img src={a.avatar} alt="" className="size-9 rounded-full object-cover ring-2 ring-bg" /></Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm"><Link to={profileLink} className="font-bold hover:underline">{a.username}</Link>{post.tags.length > 0 && <span className="text-muted"> with {post.tags.map((t) => person(s, t).username).join(", ")}</span>}</p>
          {place && <Link to={`/destinations/${place.slug}`} className="block truncate text-xs hover:underline">{place.name}</Link>}
        </div>
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className="grid size-9 place-items-center rounded-full hover:bg-surface" aria-label="Post options" aria-expanded={menu}><MoreHorizontal className="size-5" /></button>
          {menu && (
            <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-2xl border border-line bg-bg py-1 text-sm shadow-xl">
              {place && <button onClick={() => nav(`/destinations/${place.slug}`)} className="block w-full px-4 py-2.5 text-left hover:bg-surface">Book a visit</button>}
              {place && <button onClick={() => { actions.requestVisit(`Hey! I'd like to come over. (from @${person(s, s.me).username})`, new Date().toISOString().slice(0, 10), 1, place.slug); nav(LIVE ? "/messages" : "/messages/c2"); }} className="block w-full px-4 py-2.5 text-left hover:bg-surface">Message place</button>}
              {a.id !== s.me && <button onClick={() => { actions.follow(a.id); setMenu(false); }} className="block w-full px-4 py-2.5 text-left hover:bg-surface">{a.following ? "Unfollow" : "Follow"}</button>}
              <button onClick={() => { actions.repost(post.id); setMenu(false); flash("Reposted to your profile"); }} className="block w-full px-4 py-2.5 text-left hover:bg-surface">Repost</button>
              {a.id !== s.me && <button onClick={() => { actions.block(a.id); setMenu(false); }} className="block w-full px-4 py-2.5 text-left text-red-600 hover:bg-surface">Block</button>}
            </div>
          )}
        </div>
      </header>

      {post.media.length ? <div onDoubleClick={() => !liked && actions.toggleLike(post.id)}><MediaGrid media={post.media} postId={post.id} priority={priority} /></div>
        : <p className="bg-gradient-to-br from-accent to-accent-text px-6 py-16 text-center font-display text-2xl font-bold text-white"><RichText text={post.text} /></p>}

      <div className="flex items-center gap-1 px-2 pt-1.5">
        <button onClick={() => actions.toggleLike(post.id)} className="grid size-10 place-items-center" aria-pressed={liked} aria-label="Like"><Heart className={`size-[26px] transition-transform active:scale-125 ${liked ? "fill-red-500 text-red-500" : ""}`} /></button>
        <button onClick={() => setSheet("comments")} className="grid size-10 place-items-center" aria-label="Comment"><MessageCircle className="size-[26px] -scale-x-100" /></button>
        <button onClick={() => setSheet("share")} className="grid size-10 place-items-center" aria-label="Share"><Send className="size-[24px]" /></button>
        {place && <button onClick={() => nav(`/destinations/${place.slug}`)} className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink"><Ticket className="size-3.5" />Book</button>}
        <button onClick={() => actions.toggleSave(post.id)} className="ml-auto grid size-10 place-items-center" aria-pressed={saved} aria-label="Save"><Bookmark className={`size-[24px] ${saved ? "fill-ink" : ""}`} /></button>
      </div>

      <div className="space-y-1 px-3.5 pb-3 text-sm">
        {post.likes.length > 0 && <p className="font-bold">{post.likes.length === 1 ? `Liked by ${person(s, post.likes[0]).username}` : `Liked by ${person(s, post.likes[0]).username} and ${post.likes.length - 1} others`}</p>}
        {post.text && post.media.length > 0 && <p><Link to={profileLink} className="mr-1.5 font-bold">{a.username}</Link><RichText text={post.text} /></p>}
        {commentCount(post) > 0 && <button onClick={() => setSheet("comments")} className="text-muted">View all {commentCount(post)} comments</button>}
        <p className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-xs text-muted" aria-label="Post stats">
          <span className="inline-flex items-center gap-1"><Eye className="size-3.5" />{fmtN(post.views ?? 0)}</span>
          <span className="inline-flex items-center gap-1"><Heart className="size-3.5" />{fmtN(post.likes.length)}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" />{fmtN(commentCount(post))}</span>
          <span className="inline-flex items-center gap-1"><Bookmark className="size-3.5" />{fmtN(post.saves ?? 0)}</span>
          <span className="inline-flex items-center gap-1"><Send className="size-3.5" />{fmtN((post.shares ?? 0) + post.reposts)}</span>
          <span className="ml-auto uppercase tracking-wide">{ago(post.at)} ago</span>
        </p>
      </div>

      {post.party && (
        <div className="mx-3 mb-3 flex items-center gap-3 rounded-2xl bg-accent-soft p-3">
          <Users className="size-9 shrink-0 rounded-full bg-accent p-2 text-accent-ink" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold">Going party · {new Date(post.party.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}</p>
            <p className="text-muted">{post.party.going.length}/{post.party.max} going{place ? ` to ${place.name}` : ""}</p>
          </div>
          {a.id !== s.me && <button onClick={() => actions.joinParty(post.id)} disabled={!going && post.party.going.length >= post.party.max} className={`rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50 ${going ? "bg-bg" : "bg-accent text-accent-ink"}`}>{going ? "Going ✓" : post.party.going.length >= post.party.max ? "Full" : "Join"}</button>}
        </div>
      )}

      {sheet === "comments" && <CommentsSheet postId={post.id} onClose={() => setSheet(null)} />}
      {sheet === "share" && <ShareSheet item={{ kind: "post", postId: post.id, image: post.media.find((x) => x.type === "image")?.src }} onClose={() => setSheet(null)} />}
      {toast && <p role="status" className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg shadow-lg">{toast}</p>}
    </article>
  );
}

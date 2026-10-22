import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Heart, MapPin, MessageCircle, Send } from "lucide-react";
import { actions, person, useStore } from "../../lib/store";
import { bySlug } from "../../fixtures/destinations";
import { useTitle } from "../../lib/useTitle";

// Full-screen vertical reels. Photo reels use a slow zoom until real video uploads exist.
export default function Reels() {
  useTitle("Reels");
  const s = useStore((x) => x);
  const reels = s.posts.filter((p) => p.media.length && !s.blocked.includes(p.authorId)).flatMap((p) => p.media.slice(0, 2).map((m, i) => ({ post: p, m, key: `${p.id}-${i}` })));
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [cur, setCur] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  // Track which reel is on screen; it gets full priority, the next 4 preload, the rest stay empty.
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCur(Number((e.target as HTMLElement).dataset.i)); }), { root: box.current, threshold: 0.6 });
    box.current?.querySelectorAll("section").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reels.length]);
  useEffect(() => { const p = reels[cur]?.post; if (p) actions.view(p.id); }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={box} className="no-scrollbar h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-auto overscroll-contain bg-black">
      {reels.map(({ post, m, key }, i) => {
        const near = i >= cur - 1 && i <= cur + 4, now = i === cur;
        const a = person(s, post.authorId); const liked = post.likes.includes(s.me); const place = post.place ? bySlug(post.place) : undefined;
        return (
          <section key={key} data-i={i} className="relative mx-auto h-full max-w-md snap-start overflow-hidden">
            {!near ? <div className="size-full animate-pulse bg-white/5" />
              : m.type === "video" ? <video src={m.src} autoPlay={now} loop muted playsInline preload={now ? "auto" : "metadata"} ref={(v) => { if (v) (now ? v.play().catch(() => {}) : v.pause()); }} className="size-full object-cover" />
              : <img src={m.src} alt="" loading={now ? "eager" : "lazy"} fetchPriority={now ? "high" : "low"} decoding="async" className={`size-full object-cover ${now ? "motion-safe:animate-[kenburns_14s_ease-in-out_infinite_alternate]" : ""}`} />}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
            <div className="absolute bottom-24 left-4 right-20 text-white lg:bottom-8">
              <Link to={a.id === s.me ? "/profile" : `/u/${a.username}`} className="flex items-center gap-2"><img src={a.avatar} alt="" className="size-10 rounded-full object-cover ring-2 ring-white" /><span className="font-bold">@{a.username}</span>
                {a.id !== s.me && <button onClick={(e) => { e.preventDefault(); actions.follow(a.id); }} className="rounded-full border border-white/70 px-3 py-1 text-xs font-bold">{a.following ? "Following" : "Follow"}</button>}</Link>
              <p className="mt-2 line-clamp-2 text-sm">{post.text}</p>
              {place && <Link to={`/destinations/${place.slug}`} className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur"><MapPin className="size-3.5" />{place.name}</Link>}
            </div>
            <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 text-white lg:bottom-8">
              <button onClick={() => actions.toggleLike(post.id)} className="flex flex-col items-center text-xs font-bold" aria-pressed={liked}><Heart className={`size-8 ${liked ? "fill-accent text-accent" : ""}`} />{post.likes.length}</button>
              <Link to="/home" className="flex flex-col items-center text-xs font-bold"><MessageCircle className="size-8" />{post.comments.length}</Link>
              <button onClick={() => setSaved((x) => { const n = new Set(x); n.has(key) ? n.delete(key) : n.add(key); return n; })} className="flex flex-col items-center text-xs font-bold"><Bookmark className={`size-8 ${saved.has(key) ? "fill-white" : ""}`} />Save</button>
              <button onClick={async () => { try { await navigator.share?.({ text: post.text }); } catch { /* */ } }} className="flex flex-col items-center text-xs font-bold"><Send className="size-8" />Share</button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

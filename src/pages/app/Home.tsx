import { Link } from "react-router-dom";
import { CalendarDays, Clapperboard, Coins, Compass, Home as HomeIcon, MessageCircle, Ticket, User } from "lucide-react";
import { Stories } from "../../components/feed/Stories";
import { Composer } from "../../components/feed/PostComposer";
import { PostCard } from "../../components/feed/PostCard";
import { actions, passSlots, person, useStore } from "../../lib/store";
import { bySlug, destPhoto } from "../../fixtures/destinations";
import { useTitle } from "../../lib/useTitle";
import { FeedSkeleton } from "../../components/FeedSkeleton";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LIVE, getState } from "../../lib/store";
import { useAuth } from "../../lib/auth/AuthContext";
import { loadFor, loadMoreFeed } from "../../lib/remote";

const side = [[HomeIcon, "Feed", "/home"], [CalendarDays, "Events", "/events"], [Clapperboard, "Reels", "/reels"], [Ticket, "Passes", "/wallet"], [Compass, "Explore", "/explore"], [MessageCircle, "Messages", "/messages"], [User, "Profile", "/profile"]] as const;

// Windowed rendering: posts far from the one on screen are swapped for an empty block of the same height.
const heights = new Map<string, number>();
function Slot({ id, live, children }: { id: string; live: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || !live) return;
    const ro = new ResizeObserver(() => heights.set(id, el.offsetHeight));
    ro.observe(el); return () => ro.disconnect();
  }, [id, live]);
  return <div ref={ref} style={live ? undefined : { height: heights.get(id) ?? 720 }}>{live ? children : null}</div>;
}

export default function Home() {
  useTitle("Feed");
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const go = () => { setRefreshing(true); loadFor(user).finally(() => setTimeout(() => setRefreshing(false), 500)); };
    window.addEventListener("outsider:refresh", go);
    return () => window.removeEventListener("outsider:refresh", go);
  }, [user]);
  const s = useStore((x) => x);
  const me = person(s, s.me);
  const posts = s.posts.filter((p) => !s.blocked.includes(p.authorId));
  const [shown, setShown] = useState(5);
  // Keep 4 posts loaded ahead of the one you are looking at; ask the API for more near the end.
  const [active, setActive] = useState(0);
  const reveal = useCallback((i: number) => { setActive(i); setShown((n) => Math.max(n, i + 5)); if (LIVE && i + 5 >= getState().posts.length) loadMoreFeed(); }, []);
  const passes = s.passes.filter((p) => p.active && p.claimed.length < passSlots(p)).slice(0, 3);
  const suggest = s.people.filter((p) => p.id !== s.me && !p.following && !s.blocked.includes(p.id)).slice(0, 3);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 pt-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,36rem)_20rem] lg:justify-center">
      <aside className="hidden lg:block">
        <nav className="sticky top-20 space-y-1">
          <Link to="/profile" className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-surface"><img src={me.avatar} alt="" className="size-9 rounded-full object-cover" /><span className="font-bold">{me.name}</span></Link>
          {side.map(([I, l, to]) => <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl p-2.5 font-semibold hover:bg-surface"><I className="size-6 text-accent" />{l}</Link>)}
        </nav>
      </aside>

      <main className="min-w-0 space-y-4">
        {posts.length === 0 && !s.stories.length && <FeedSkeleton />}
        {refreshing && <p className="text-center text-sm font-semibold text-accent-text" role="status">Refreshing…</p>}
        <Stories />
        <Composer />
        {posts.slice(0, shown).map((p, i) => (
          <Slot key={p.id} id={p.id} live={Math.abs(i - active) <= 4}>
            <PostCard post={p} priority={i === 0} onVisible={() => reveal(i)} />
          </Slot>
        ))}
        {shown < posts.length && <FeedSkeleton />}
        <p className="py-6 text-center text-sm text-muted">You're all caught up. Time to go outside.</p>
      </main>

      <aside className="hidden space-y-5 lg:block">
        <div className="sticky top-20 space-y-5">
          <section className="rounded-3xl bg-accent p-5 text-accent-ink">
            <p className="text-sm font-semibold opacity-90">Your tokens</p>
            <p className="font-display text-4xl font-extrabold">{s.balance}</p>
            <Link to="/wallet" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4"><Coins className="size-4" />See today's passes</Link>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg font-bold">Passes dropping today</h2>
            <ul className="space-y-2">{passes.map((p) => { const d = bySlug(p.place); return (
              <li key={p.id}><Link to="/wallet" className="flex items-center gap-3 rounded-2xl p-2 hover:bg-surface"><img src={destPhoto(p.place, 160)} alt="" className="size-12 rounded-xl object-cover" />
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.title}</span><span className="block truncate text-sm text-muted">{d?.name} · {passSlots(p) - p.claimed.length} left</span></span>
                <span className="text-sm font-bold text-accent-text">{p.perPerson}</span></Link></li>
            ); })}</ul>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg font-bold">Outsiders to follow</h2>
            <ul className="space-y-2">{suggest.map((p) => (
              <li key={p.id} className="flex items-center gap-3"><img src={p.avatar} alt="" className="size-10 rounded-full object-cover" /><Link to={`/u/${p.username}`} className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.name}</span><span className="text-sm text-muted">@{p.username}</span></Link>
                <button onClick={() => actions.follow(p.id)} className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-bold text-accent-text">Follow</button></li>
            ))}</ul>
          </section>
        </div>
      </aside>
    </div>
  );
}

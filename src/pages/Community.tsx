import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import { posts } from "../fixtures/posts";
import { bySlug } from "../fixtures/destinations";
import { Rating } from "../components/Stars";
import { SignInPrompt } from "../components/SignInPrompt";
import { useTitle } from "../lib/useTitle";

const tabs = [["trending", "Trending"], ["nearby", "Nearby"], ["destinations", "By place"]] as const;
const kindLabel = { review: "Review", photo: "Photo", tip: "Tip", question: "Question" };

export default function Community() {
  useTitle("Community");
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("trending");
  const list = tab === "destinations" ? [...posts].sort((a, b) => a.destinationSlug.localeCompare(b.destinationSlug)) : posts;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Community</h1>
      <p className="mt-2 text-muted">Reviews, tips and questions from people who've been. Showing sample posts.</p>

      <div className="mt-6 flex gap-2" role="tablist" aria-label="Feed">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? "bg-accent text-accent-ink" : "bg-surface hover:bg-surface-2"}`}>{label}</button>
        ))}
      </div>
      {tab === "nearby" && <p className="mt-4 rounded-xl bg-surface p-4 text-sm text-muted">Nearby posts use your location. Allow location access after you log in to see posts around you.</p>}

      <SignInPrompt action="post, like, comment and follow" className="mt-6" />

      <ul className="mt-6 space-y-4">
        {list.map((p) => {
          const d = bySlug(p.destinationSlug)!;
          return (
            <li key={p.id}>
              <article className="rounded-2xl border border-line p-5">
                <header className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-accent-soft font-display font-bold text-accent-text" aria-hidden="true">{p.author[0]}</span>
                  <div className="text-sm">
                    <p className="font-semibold">{p.author} <span className="font-normal text-muted">@{p.handle}</span></p>
                    <p className="text-muted">{p.when} · {kindLabel[p.kind]} · <Link to={`/destinations/${d.slug}`} className="font-semibold text-accent-text hover:underline">{d.name}</Link></p>
                  </div>
                </header>
                {p.rating && <div className="mt-3"><Rating value={p.rating} /></div>}
                <p className="mt-3 text-lg leading-snug">{p.body}</p>
                {p.incentivised && <p className="mt-2 text-xs text-muted">Reviewer received tokens for sharing feedback. Tokens never depend on the rating.</p>}
                <footer className="mt-4 flex gap-5 text-sm text-muted">
                  <Link to="/login" className="inline-flex items-center gap-1.5 hover:text-ink"><Heart className="size-4" aria-hidden="true" />{p.likes}<span className="sr-only"> likes, log in to like</span></Link>
                  <Link to="/login" className="inline-flex items-center gap-1.5 hover:text-ink"><MessageCircle className="size-4" aria-hidden="true" />{p.replies}<span className="sr-only"> replies, log in to reply</span></Link>
                </footer>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

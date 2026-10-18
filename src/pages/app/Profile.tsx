import { useState } from "react";
import { Link } from "react-router-dom";
import { Award, Bookmark, Grid3x3, Settings } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthContext";
import { badges } from "../../fixtures/account";
import { destinations } from "../../fixtures/destinations";
import { posts } from "../../fixtures/posts";
import { Avatar } from "../../components/Avatar";
import { DestinationCard } from "../../components/DestinationCard";
import { useTitle } from "../../lib/useTitle";

const tabs = [["posts", "Posts", Grid3x3], ["saved", "Saved", Bookmark], ["badges", "Badges", Award]] as const;

export default function Profile() {
  useTitle("Profile");
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("posts");
  const name = `${user!.firstName} ${user!.lastName}`.trim();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
      <div className="flex items-start gap-4 sm:gap-6">
        <Avatar name={user!.firstName} className="size-20 text-3xl sm:size-28 sm:text-5xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-extrabold">{name}</h1>
              <p className="text-muted">@{user!.username}</p>
            </div>
            <Link to="/settings" className="grid size-10 shrink-0 place-items-center rounded-full bg-surface" aria-label="Settings"><Settings className="size-5" /></Link>
          </div>
          <dl className="mt-4 flex gap-6 text-sm">
            {[["Places", 6], ["Followers", 48], ["Following", 31]].map(([k, n]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-display text-xl font-bold">{n}</dd></div>)}
          </dl>
        </div>
      </div>
      <p className="mt-4 max-w-lg">Weekend explorer. Waterfalls over malls. Always looking for the next good rooftop.</p>
      <Link to="/settings" className="mt-4 inline-block rounded-full border border-line px-5 py-2 text-sm font-bold">Edit profile</Link>

      <div className="mt-8 grid grid-cols-3 border-b border-line" role="tablist">
        {tabs.map(([id, l, I]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold ${tab === id ? "border-accent text-accent-text" : "border-transparent text-muted"}`}><I className="size-4" aria-hidden="true" />{l}</button>
        ))}
      </div>

      {tab === "posts" && (
        <ul className="mt-4 space-y-3">{posts.slice(0, 2).map((p) => <li key={p.id} className="rounded-2xl border border-line p-4"><p className="text-sm text-muted">{p.when}</p><p className="mt-1">{p.body}</p></li>)}</ul>
      )}
      {tab === "saved" && <ul className="mt-4 grid gap-3 sm:grid-cols-2">{destinations.slice(0, 4).map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul>}
      {tab === "badges" && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">{badges.filter((b) => b.earned).map((b) => <li key={b.id} className="flex flex-col items-center gap-2 rounded-2xl bg-accent-soft p-3 text-center text-xs font-semibold"><span className="grid size-12 place-items-center rounded-full bg-accent text-accent-ink"><Award className="size-6" aria-hidden="true" /></span>{b.name}</li>)}</ul>
      )}
    </div>
  );
}

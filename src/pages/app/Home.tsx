import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Coins, MapPin, Search, Target } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthContext";
import { destinations } from "../../fixtures/destinations";
import { posts } from "../../fixtures/posts";
import { bySlug } from "../../fixtures/destinations";
import { balance, challenges } from "../../fixtures/account";
import { DestinationCard } from "../../components/DestinationCard";
import { Avatar } from "../../components/Avatar";
import { useTitle } from "../../lib/useTitle";

const cities = ["Lagos", "Abuja", "Port Harcourt", "Calabar", "Kano"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Rail({ title, to, children }: { title: string; to?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {to && <Link to={to} className="shrink-0 text-sm font-bold text-accent-text">See all</Link>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Home() {
  useTitle("Home");
  const { user } = useAuth();
  const nav = useNavigate();
  const [city, setCity] = useState("Port Harcourt");
  const [q, setQ] = useState("");
  const nearby = [...destinations].sort((a, b) => Number(b.city === city) - Number(a.city === city)).slice(0, 3);
  const offers = destinations.filter((d) => d.tokenOffer).slice(0, 3);
  const fresh = [...destinations].reverse().slice(0, 3);
  const go = (e: FormEvent) => { e.preventDefault(); nav(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <label className="relative inline-flex items-center gap-1.5 rounded-full bg-surface py-2 pl-3 pr-8 text-sm font-semibold">
          <MapPin className="size-4 text-accent" aria-hidden="true" />
          <span className="sr-only">Your city</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="appearance-none bg-transparent outline-none">{cities.map((c) => <option key={c}>{c}</option>)}</select>
          <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-muted" aria-hidden="true" />
        </label>
        <Link to="/wallet" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-sm font-bold text-accent-ink sm:hidden"><Coins className="size-4" aria-hidden="true" />{balance}</Link>
      </div>

      <h1 className="mt-5 text-[2.2rem] font-extrabold leading-[1.02] sm:text-5xl">{greeting()}, {user!.firstName}.<br /><span className="text-muted">Where to today?</span></h1>

      <form onSubmit={go} role="search" className="mt-5 flex items-center gap-2 rounded-full border border-line bg-bg py-1.5 pl-5 pr-1.5 shadow-sm focus-within:border-accent sm:max-w-xl">
        <Search className="size-5 text-muted" aria-hidden="true" />
        <label htmlFor="home-q" className="sr-only">Search</label>
        <input id="home-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pool, rooftop, waterfall…" className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted" />
        <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink">Search</button>
      </form>

      <Link to="/wallet" className="mt-6 flex items-center gap-4 rounded-3xl bg-accent p-5 text-accent-ink">
        <Target className="size-10 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold">{challenges[0].title}: {challenges[0].progress} of {challenges[0].goal}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent-ink/25"><div className="h-full rounded-full bg-accent-ink" style={{ width: `${(challenges[0].progress / challenges[0].goal) * 100}%` }} /></div>
          <p className="mt-1.5 text-sm opacity-90">{challenges[0].detail}. +{challenges[0].reward} tokens.</p>
        </div>
      </Link>

      <Rail title={`Near ${city}`} to="/map"><ul className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{nearby.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul></Rail>
      <Rail title="Spend your tokens" to="/wallet"><ul className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{offers.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul></Rail>

      <Rail title="From people you follow" to="/community">
        <ul className="grid gap-3 md:grid-cols-2">
          {posts.slice(0, 2).map((p) => {
            const d = bySlug(p.destinationSlug)!;
            return (
              <li key={p.id} className="rounded-2xl border border-line p-4">
                <div className="flex items-center gap-3 text-sm"><Avatar name={p.author} hue={d.hue} className="size-9 text-sm" /><p><span className="font-semibold">{p.author}</span> <span className="text-muted">at</span> <Link to={`/destinations/${d.slug}`} className="font-semibold text-accent-text">{d.name}</Link></p></div>
                <p className="mt-2">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </Rail>

      <Rail title="Just added"><ul className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{fresh.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul></Rail>
    </div>
  );
}

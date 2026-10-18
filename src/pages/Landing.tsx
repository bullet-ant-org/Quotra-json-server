import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Coins, Map, MessagesSquare, Search, Sparkles, TrendingUp } from "lucide-react";
import { HeroMap } from "../components/HeroMap";
import { DestinationCard } from "../components/DestinationCard";
import { categories } from "../fixtures/categories";
import { destinations } from "../fixtures/destinations";
import { posts } from "../fixtures/posts";
import { bySlug } from "../fixtures/destinations";
import { Rating } from "../components/Stars";
import { useTitle } from "../lib/useTitle";

const quick = ["Resorts near me", "Weekend getaways", "Swimming pools", "Places with token offers"];

function HeroSearch() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const go = (e: FormEvent) => {
    e.preventDefault();
    nav(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };
  return (
    <div className="space-y-3">
      <form onSubmit={go} role="search" className="flex max-w-xl items-center gap-2 rounded-full border border-line bg-bg p-1.5 pl-5 shadow-sm focus-within:border-accent">
        <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
        <label htmlFor="hero-q" className="sr-only">Search destinations</label>
        <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “resorts in Lagos with a pool”" className="min-w-0 flex-1 bg-transparent py-2.5 outline-none placeholder:text-muted" />
        <button className="rounded-full bg-accent px-6 py-3 font-bold text-accent-ink hover:opacity-90">Search</button>
      </form>
      <ul className="flex flex-wrap gap-2">
        {quick.map((t) => (
          <li key={t}>
            <Link to={`/explore?q=${encodeURIComponent(t)}`} className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:border-accent hover:text-accent-text">{t}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const principles = [
  { name: "Discover", text: "Find places you'd never have searched for, on a map that shows what's actually nearby." },
  { name: "Experience", text: "Every listing tells you what it costs, what's there and what people really thought." },
  { name: "Connect", text: "Follow explorers and businesses, ask questions, plan the day out with friends." },
  { name: "Reward", text: "Earn Roamly Tokens for verified visits and useful contributions. Spend them on offers businesses set." },
  { name: "Grow", text: "Businesses get a free profile, honest reviews and tools to turn visitors into regulars." },
];

export default function Landing() {
  useTitle();
  const featured = destinations.slice(0, 6);

  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="space-y-8">
          <h1 className="text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
            Discover places worth experiencing.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Roamly is a map of resorts, restaurants, beaches and hidden gems, with honest reviews from people who went and rewards for getting out there.
          </p>
          <HeroSearch />
        </div>
        <div className="pb-8"><HeroMap /></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="cats">
        <div className="flex items-end justify-between gap-4">
          <h2 id="cats" className="text-3xl font-bold sm:text-4xl">What are you in the mood for?</h2>
          <Link to="/explore" className="hidden items-center gap-1 font-semibold text-accent-text hover:underline sm:inline-flex">All places <ArrowRight className="size-4" /></Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c, i) => (
            <li key={c.id} className={i === 0 ? "col-span-2 md:col-span-2" : ""}>
              <Link to={`/explore?category=${c.id}`} className="group flex h-full min-h-32 flex-col justify-between rounded-2xl bg-surface p-5 transition-colors hover:bg-accent hover:text-accent-ink">
                <span className="font-display text-xl font-bold">{c.name}</span>
                <span className="text-sm text-muted group-hover:text-accent-ink/80">{c.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6" aria-labelledby="feat">
        <div className="flex items-end justify-between gap-4">
          <h2 id="feat" className="text-3xl font-bold sm:text-4xl">Worth the trip</h2>
          <Link to="/map" className="inline-flex items-center gap-1 font-semibold text-accent-text hover:underline">See them on the map <Map className="size-4" /></Link>
        </div>
        <p className="mt-2 text-sm text-muted">Sample listings while Roamly is being built.</p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}
        </ul>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6" aria-labelledby="why">
        <h2 id="why" className="max-w-2xl text-3xl font-bold sm:text-5xl">More than a map of pins.</h2>
        <dl className="mt-10 border-t border-line">
          {principles.map((p) => (
            <div key={p.name} className="grid gap-2 border-b border-line py-6 md:grid-cols-[16rem_1fr] md:gap-10">
              <dt className="font-display text-3xl font-bold text-accent-text">{p.name}</dt>
              <dd className="max-w-xl text-lg">{p.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6" aria-labelledby="tok">
        <div className="grid gap-10 overflow-hidden rounded-[2rem] bg-accent p-8 text-accent-ink sm:p-12 lg:grid-cols-2">
          <div className="space-y-5">
            <h2 id="tok" className="text-4xl font-extrabold sm:text-5xl">Visit somewhere. Earn Roamly Tokens.</h2>
            <p className="max-w-md text-lg opacity-90">
              Check in at a place and we verify you're really there. Tokens go into your wallet and can be spent on offers that businesses publish, like pool access or a free drink.
            </p>
            <Link to="/rewards" className="inline-flex items-center gap-2 rounded-full bg-bg px-6 py-3 font-bold text-ink hover:opacity-90">How tokens work <ArrowRight className="size-4" /></Link>
          </div>
          <div className="rounded-2xl bg-bg p-6 text-ink">
            <p className="font-display text-xl font-bold">Check-in rewards by place size</p>
            <p className="text-sm text-muted">Example values. Roamly sets the real schedule.</p>
            <table className="mt-4 w-full text-left">
              <caption className="sr-only">Example check-in token rewards</caption>
              <tbody className="divide-y divide-line">
                {[["Local spot", 10], ["Established destination", 20], ["Popular destination", 30], ["Major destination", 50]].map(([l, t]) => (
                  <tr key={l}>
                    <th scope="row" className="py-3 font-medium">{l}</th>
                    <td className="py-3 text-right font-display text-xl font-bold text-accent-text">{t}<span className="ml-1 text-sm font-normal text-muted">tokens</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 flex items-start gap-2 text-xs text-muted"><Coins className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Tokens are promotional rewards, not cash.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6" aria-labelledby="comm">
        <div className="flex items-end justify-between gap-4">
          <h2 id="comm" className="text-3xl font-bold sm:text-4xl">What people are saying</h2>
          <Link to="/community" className="inline-flex items-center gap-1 font-semibold text-accent-text hover:underline">Community <MessagesSquare className="size-4" /></Link>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => {
            const d = bySlug(p.destinationSlug)!;
            return (
              <li key={p.id} className="flex flex-col rounded-2xl border border-line p-6">
                {p.rating && <Rating value={p.rating} />}
                <p className="mt-3 flex-1 text-lg leading-snug">“{p.body}”</p>
                <p className="mt-5 text-sm"><span className="font-semibold">{p.author}</span> <span className="text-muted">on</span> <Link to={`/destinations/${d.slug}`} className="font-semibold text-accent-text hover:underline">{d.name}</Link></p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6" aria-labelledby="biz">
        <div className="grid items-center gap-8 rounded-[2rem] bg-surface p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <h2 id="biz" className="text-3xl font-bold sm:text-4xl">Run a resort, restaurant or attraction?</h2>
            <p className="max-w-lg text-lg text-muted">Put your place on the map for free. Publish photos and prices, reply to reviews and message visitors, then add token offers to bring people through the door.</p>
          </div>
          <ul className="space-y-3 text-sm font-medium">
            <li className="flex items-center gap-3"><Sparkles className="size-5 text-accent-text" aria-hidden="true" />Free listing with a verified badge once approved</li>
            <li className="flex items-center gap-3"><TrendingUp className="size-5 text-accent-text" aria-hidden="true" />See views, direction taps and redemptions</li>
            <li className="flex items-center gap-3"><Coins className="size-5 text-accent-text" aria-hidden="true" />You set the offers and what they cost in tokens</li>
            <li><Link to="/for-business" className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-bold text-accent-ink hover:opacity-90">List your place <ArrowRight className="size-4" /></Link></li>
          </ul>
        </div>
      </section>
    </>
  );
}

import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import { categories, type CategoryId } from "../fixtures/categories";
import { destinations } from "../fixtures/destinations";
import { DestinationCard } from "../components/DestinationCard";
import { useTitle } from "../lib/useTitle";

export default function Explore() {
  useTitle("Explore places");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const cat = params.get("category") as CategoryId | null;
  const verified = params.get("verified") === "1";
  const tokens = params.get("tokens") === "1";
  const minRating = Number(params.get("rating") ?? 0);

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return destinations.filter((d) => {
      if (cat && d.category !== cat) return false;
      if (verified && !d.verified) return false;
      if (tokens && !d.tokenOffer) return false;
      if (d.rating < minRating) return false;
      const hay = `${d.name} ${d.city} ${d.state} ${d.subcategory} ${d.facilities.join(" ")} ${d.description}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [q, cat, verified, tokens, minRating]);

  const chip = (on: boolean) =>
    `shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${on ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-accent"}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-extrabold sm:text-5xl">What sounds good?</h1>
      <p className="mt-2 text-muted">Sample listings for now. Search names, towns and facilities.</p>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-6 flex max-w-2xl items-center gap-2 rounded-full border border-line bg-bg px-5 focus-within:border-accent">
        <Search className="size-5 text-muted" aria-hidden="true" />
        <label htmlFor="q" className="sr-only">Search places</label>
        <input id="q" value={q} onChange={(e) => set("q", e.target.value || null)} placeholder="Search by name, town or facility" className="flex-1 bg-transparent py-3 outline-none placeholder:text-muted" />
      </form>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap" role="group" aria-label="Filters">
        <button className={chip(!cat)} onClick={() => set("category", null)} aria-pressed={!cat}>All</button>
        {categories.map((c) => (
          <button key={c.id} className={chip(cat === c.id)} onClick={() => set("category", cat === c.id ? null : c.id)} aria-pressed={cat === c.id}>{c.name}</button>
        ))}
        <span className="mx-1 hidden w-px bg-line sm:block" aria-hidden="true" />
        <button className={chip(verified)} onClick={() => set("verified", verified ? null : "1")} aria-pressed={verified}>Verified only</button>
        <button className={chip(tokens)} onClick={() => set("tokens", tokens ? null : "1")} aria-pressed={tokens}>Has token offer</button>
        <button className={chip(minRating >= 4.5)} onClick={() => set("rating", minRating >= 4.5 ? null : "4.5")} aria-pressed={minRating >= 4.5}>4.5 and up</button>
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">{results.length} {results.length === 1 ? "place" : "places"}</p>
      {results.length ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}
        </ul>
      ) : (
        <div className="mt-6 grid place-items-center gap-3 rounded-2xl bg-surface px-6 py-20 text-center">
          <SearchX className="size-10 text-muted" aria-hidden="true" />
          <p className="font-display text-2xl font-bold">No places match yet</p>
          <p className="max-w-sm text-muted">Try removing a filter or searching a nearby town.</p>
          <Link to="/explore" className="rounded-full bg-accent px-5 py-2.5 font-bold text-accent-ink">Clear filters</Link>
        </div>
      )}
    </div>
  );
}

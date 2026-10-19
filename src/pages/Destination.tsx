import { Link, useParams } from "react-router-dom";
import { BadgeCheck, Clock, Coins, MapPin, MessageCircle, Navigation, Share2 } from "lucide-react";
import { bySlug, destPhoto, destinations, formatNaira } from "../fixtures/destinations";
import { categoryById } from "../fixtures/categories";
import { posts } from "../fixtures/posts";
import { Img } from "../components/Img";
import { Rating } from "../components/Stars";
import { SignInPrompt } from "../components/SignInPrompt";
import { DestinationCard } from "../components/DestinationCard";
import { useTitle } from "../lib/useTitle";
import { useStore } from "../lib/store";
import NotFound from "./NotFound";
import { CheckInButton } from "../components/CheckInButton";

export default function Destination() {
  useStore((s) => s.pv); // re-render when the live place catalogue loads
  const { slug = "" } = useParams();
  const d = bySlug(slug);
  useTitle(d?.name);
  if (!d) return <NotFound what="place" />;

  const mine = posts.filter((p) => p.destinationSlug === d.slug);
  const similar = destinations.filter((x) => x.category === d.category && x.slug !== d.slug).slice(0, 3);
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: d.name, url });
      else await navigator.clipboard.writeText(url);
    } catch { /* user cancelled or clipboard blocked */ }
  };

  return (
    <article className="mx-auto max-w-7xl px-4 pb-28 pt-0 sm:px-6 sm:pt-8 lg:pb-8">
      <div className="-mx-4 overflow-hidden sm:mx-0 sm:rounded-[1.75rem]"><Img src={destPhoto(d.slug, 1600)} alt={d.name} className="h-72 w-full sm:h-[28rem] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" /></div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <header className="space-y-3">
            <p className="text-sm text-muted">
              <Link to={`/explore?category=${d.category}`} className="hover:underline">{categoryById(d.category).name}</Link> / {d.subcategory}
            </p>
            <h1 className="flex flex-wrap items-center gap-3 text-4xl font-extrabold sm:text-5xl">
              {d.name}
              {d.verified && <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent-text"><BadgeCheck className="size-4" aria-hidden="true" />Verified</span>}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted">
              <Rating value={d.rating} count={d.reviewCount} />
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />{d.city}, {d.state}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden="true" />{d.hours}</span>
            </div>
          </header>

          <section aria-labelledby="about"><h2 id="about" className="text-2xl font-bold">About</h2><p className="mt-3 max-w-2xl text-lg">{d.description}</p></section>

          <section aria-labelledby="fac">
            <h2 id="fac" className="text-2xl font-bold">Facilities</h2>
            <ul className="mt-3 flex flex-wrap gap-2">{d.facilities.map((f) => <li key={f} className="rounded-full bg-surface px-4 py-2 text-sm font-medium">{f}</li>)}</ul>
          </section>

          <section aria-labelledby="rev">
            <h2 id="rev" className="text-2xl font-bold">Reviews and questions</h2>
            {mine.length ? (
              <ul className="mt-4 divide-y divide-line">
                {mine.map((p) => (
                  <li key={p.id} className="py-5">
                    <p className="font-semibold">{p.author} <span className="font-normal text-muted">@{p.handle} · {p.when}</span></p>
                    {p.rating && <Rating value={p.rating} />}
                    <p className="mt-1 max-w-2xl">{p.body}</p>
                    {p.incentivised && <p className="mt-2 text-xs text-muted">Reviewer received tokens for sharing feedback. Tokens never depend on the rating.</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted">No reviews yet. Be the first to share what it's like.</p>
            )}
            <SignInPrompt action="write a review or ask the business a question" className="mt-4" />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Plan your visit">
          <div className="space-y-4 rounded-2xl border border-line p-5">
            <p className="text-sm text-muted">Entry and services</p>
            <p className="font-display text-3xl font-extrabold">{d.priceFrom !== null ? <>from {formatNaira(d.priceFrom)}</> : "Ask for prices"}</p>
            <p className="text-xs text-muted">Prices are set by the business and can change. Confirm before you go.</p>
            <a href={dir} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-bold text-accent-ink"><Navigation className="size-4" aria-hidden="true" />Get directions</a>
            <div className="grid grid-cols-2 gap-2">
              <Link to={`/login?next=${encodeURIComponent(`/destinations/${d.slug}`)}`} className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-accent"><MessageCircle className="size-4" aria-hidden="true" />Message</Link>
              <button onClick={share} className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-accent"><Share2 className="size-4" aria-hidden="true" />Share</button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-accent-soft p-5">
            <p className="flex items-center gap-2 font-display text-lg font-bold"><Coins className="size-5 text-accent-text" aria-hidden="true" />Outsider Tokens</p>
            <p className="text-sm">Check in here to earn <strong>{d.checkInTokens} tokens</strong>. You'll need to be at the place when you check in.</p>
            {d.tokenOffer && <p className="rounded-lg bg-bg p-3 text-sm font-semibold">{d.tokenOffer}</p>}
            <CheckInButton d={d} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-bg" />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16" aria-labelledby="sim">
          <h2 id="sim" className="text-2xl font-bold">More like this</h2>
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <li key={s.slug}><DestinationCard d={s} /></li>)}</ul>
        </section>
      )}
      <div className="fixed inset-x-3 bottom-24 z-40 flex gap-2 lg:hidden">
        <a href={dir} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-bold text-accent-ink shadow-xl"><Navigation className="size-4" aria-hidden="true" />Directions</a>
        <CheckInButton d={d} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-bold text-bg shadow-xl" />
      </div>
    </article>
  );
}

import { Link } from "react-router-dom";
import { BadgeCheck, Coins, MapPin } from "lucide-react";
import { destPhoto, formatNaira, type Destination } from "../fixtures/destinations";
import { Img } from "./Img";
import { Rating } from "./Stars";

// The photo fades into the card on the side that faces the text: right on phone rows, bottom on cards.
export function DestinationCard({ d, stacked = false, className = "" }: { d: Destination; stacked?: boolean; className?: string }) {
  const row = !stacked;
  return (
    <Link to={`/destinations/${d.slug}`} className={`group relative overflow-hidden rounded-3xl border border-line bg-bg transition-shadow hover:shadow-xl ${row ? "flex sm:block" : "block"} ${className}`}>
      <div className={`relative shrink-0 overflow-hidden ${row ? "w-32 sm:w-auto" : ""}`}>
        <Img src={destPhoto(d.slug, 700)} alt={d.name} className={`size-full transition-transform duration-700 group-hover:scale-105 ${row ? "[mask-image:linear-gradient(to_right,#000_55%,transparent)] sm:aspect-[4/3] sm:[mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" : "aspect-[4/3] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"}`} />
        {d.tokenOffer && (
          <span className={`absolute left-3 top-3 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-ink shadow ${row ? "hidden sm:inline-flex" : "inline-flex"}`}><Coins className="size-3.5" aria-hidden="true" />Token offer</span>
        )}
      </div>
      <div className={`relative min-w-0 flex-1 space-y-1 p-3.5 ${row ? "sm:-mt-12 sm:p-5 sm:pt-0" : "-mt-12 p-5 pt-0"}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-accent-text">{d.subcategory}</p>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight sm:text-xl">{d.name}</h3>
          <Rating value={d.rating} />
        </div>
        <p className="flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{d.city}, {d.state}</span>{d.verified && <BadgeCheck className="size-4 shrink-0 text-accent-text" aria-label="Verified business" />}</p>
        <p className="flex items-center justify-between gap-2 pt-1 text-sm">
          {d.priceFrom !== null ? <span><span className="text-muted">from </span><span className="font-display text-base font-bold">{formatNaira(d.priceFrom)}</span></span> : <span className="text-muted">Ask for prices</span>}
          {d.tokenOffer && row && <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-text sm:hidden"><Coins className="size-3.5" />Offer</span>}
        </p>
      </div>
    </Link>
  );
}

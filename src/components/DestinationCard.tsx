import { Link } from "react-router-dom";
import { BadgeCheck, Coins, MapPin } from "lucide-react";
import { categoryById } from "../fixtures/categories";
import { formatNaira, type Destination } from "../fixtures/destinations";
import { CoverArt } from "./CoverArt";
import { Rating } from "./Stars";

// Row layout on phones (scannable list), tall card from sm up. `stacked` forces the tall card.
export function DestinationCard({ d, stacked = false, className = "" }: { d: Destination; stacked?: boolean; className?: string }) {
  const row = !stacked;
  return (
    <Link
      to={`/destinations/${d.slug}`}
      className={`group overflow-hidden rounded-2xl border border-line bg-bg transition-shadow hover:shadow-lg ${row ? "flex sm:block" : "block"} ${className}`}
    >
      <div className={`relative shrink-0 overflow-hidden ${row ? "w-28 sm:w-auto sm:aspect-[16/10]" : "aspect-[16/10]"}`}>
        <CoverArt hue={d.hue} category={d.category} className="size-full transition-transform duration-500 group-hover:scale-105" />
        {d.tokenOffer && (
          <span className={`absolute left-2 top-2 items-center gap-1 rounded-full bg-accent px-2 py-1 text-[11px] font-bold text-accent-ink sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs ${row ? "hidden sm:inline-flex" : "inline-flex"}`}>
            <Coins className="size-3.5" aria-hidden="true" /> Token offer
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1 p-3 sm:space-y-1.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug sm:text-lg">{d.name}</h3>
          <Rating value={d.rating} />
        </div>
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{d.city}, {d.state}</span>
          {d.verified && <BadgeCheck className="size-4 shrink-0 text-accent-text" aria-label="Verified business" />}
        </p>
        <p className="text-sm">
          <span className="text-muted">{d.subcategory}</span>
          {d.priceFrom !== null && <span className="font-semibold"> · from {formatNaira(d.priceFrom)}</span>}
        </p>
        {d.tokenOffer && row && <p className="flex items-center gap-1 text-xs font-semibold text-accent-text sm:hidden"><Coins className="size-3.5" aria-hidden="true" />Token offer</p>}
        <span className="sr-only">{categoryById(d.category).name}</span>
      </div>
    </Link>
  );
}

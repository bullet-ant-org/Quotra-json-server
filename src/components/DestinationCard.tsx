import { Link } from "react-router-dom";
import { BadgeCheck, Coins, MapPin } from "lucide-react";
import { categoryById } from "../fixtures/categories";
import { formatNaira, type Destination } from "../fixtures/destinations";
import { CoverArt } from "./CoverArt";
import { Rating } from "./Stars";

export function DestinationCard({ d, className = "" }: { d: Destination; className?: string }) {
  return (
    <Link
      to={`/destinations/${d.slug}`}
      className={`group block overflow-hidden rounded-2xl border border-line bg-bg transition-shadow hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CoverArt hue={d.hue} category={d.category} className="size-full transition-transform duration-500 group-hover:scale-105" />
        {d.tokenOffer && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-ink">
            <Coins className="size-3.5" aria-hidden="true" /> Token offer
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug">{d.name}</h3>
          <Rating value={d.rating} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {d.city}, {d.state}
          {d.verified && (
            <span className="ml-1 inline-flex items-center gap-0.5 text-accent-text" title="Verified business">
              <BadgeCheck className="size-4" aria-hidden="true" />
              <span className="sr-only">Verified business</span>
            </span>
          )}
        </p>
        <p className="text-sm">
          <span className="text-muted">{categoryById(d.category).name}, {d.subcategory.toLowerCase()}</span>
          {d.priceFrom !== null && <span className="font-semibold"> · from {formatNaira(d.priceFrom)}</span>}
        </p>
      </div>
    </Link>
  );
}

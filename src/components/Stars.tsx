import { Star } from "lucide-react";

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold" aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-normal text-muted">({count})</span>}
    </span>
  );
}

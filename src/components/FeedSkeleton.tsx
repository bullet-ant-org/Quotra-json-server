// Placeholder feed shown while data loads. Only the logo bar (rendered by Layout) is real.
const B = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-xl bg-surface-2 ${className}`} />;

export function FeedSkeleton() {
  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 pt-4" aria-busy="true" aria-label="Loading feed">
      <div className="flex gap-3 overflow-hidden">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex shrink-0 flex-col items-center gap-1.5"><B className="size-[4.5rem] !rounded-full" /><B className="h-2.5 w-12" /></div>)}</div>
      <div className="flex items-center gap-3"><B className="size-11 !rounded-full" /><B className="h-10 flex-1 !rounded-full" /><B className="size-11 !rounded-full" /></div>
      {[0, 1].map((k) => (
        <div key={k} className="-mx-4 space-y-3 sm:mx-0">
          <div className="flex items-center gap-3 px-3"><B className="size-9 !rounded-full" /><div className="space-y-1.5"><B className="h-3 w-28" /><B className="h-2.5 w-20" /></div></div>
          <B className="aspect-[4/5] w-full !rounded-none sm:!rounded-2xl" />
          <div className="space-y-2 px-3"><B className="h-3 w-24" /><B className="h-3 w-3/4" /><B className="h-3 w-1/2" /></div>
        </div>
      ))}
    </div>
  );
}

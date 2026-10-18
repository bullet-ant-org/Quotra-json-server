export function PinMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3a8.5 8.5 0 0 0-8.5 8.5C7.5 18 16 29 16 29s8.5-11 8.5-17.5A8.5 8.5 0 0 0 16 3Z" fill="currentColor" />
      <circle cx="16" cy="11.5" r="3.2" fill="var(--c-bg)" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-1.5 text-accent">
      <PinMark />
      <span className="font-display text-2xl font-extrabold tracking-tight text-ink">Outsider</span>
    </span>
  );
}

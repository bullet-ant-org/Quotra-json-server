export function Avatar({ name, hue = 24, className = "size-10 text-base" }: { name: string; hue?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full font-display font-bold text-white ${className}`} style={{ background: `hsl(${hue} 70% 45%)` }}>
      {name.trim()[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

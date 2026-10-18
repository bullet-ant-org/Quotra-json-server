import { useRef, type ReactNode } from "react";

// Pointer-following glow, the 21st.dev "spotlight card" pattern. Static on touch.
export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden rounded-[1.75rem] bg-surface ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(320px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb, var(--c-accent) 22%, transparent), transparent 70%)" }} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

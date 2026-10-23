import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Moon, Sun, X, type LucideIcon } from "lucide-react";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth/AuthContext";
import { useTheme } from "../../lib/theme";

export interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

export function Shell({ title, nav, children }: { title: string; nav: NavItem[]; children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const go = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const link = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? "bg-accent text-accent-ink" : "text-muted hover:bg-surface hover:text-ink"}`;
  const side = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between"><Link to="/"><Logo /></Link><span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-text">{title}</span></div>
      <nav className="flex-1 space-y-1">{nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={link}><n.icon className="size-5" />{n.label}</NavLink>)}</nav>
      <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
        <span className="grid size-9 place-items-center rounded-full bg-accent font-display font-bold text-accent-ink">{user?.firstName[0]}</span>
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{user?.firstName} {user?.lastName}</span><span className="block truncate text-xs text-muted">{user?.email}</span></span>
        <button onClick={async () => { await logout(); go("/"); }} className="grid size-8 place-items-center rounded-lg hover:bg-surface-2" aria-label="Log out"><LogOut className="size-4" /></button>
      </div>
    </div>
  );
  return (
    <div className="min-h-dvh bg-surface/60 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-bg lg:block">{side}</aside>
      {open && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-72 bg-bg" onClick={(e) => e.stopPropagation()}>{side}</aside></div>}
      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-surface lg:hidden" aria-label="Open menu">{open ? <X /> : <Menu />}</button>
          <h1 className="font-display text-xl font-bold">{nav.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.label}</h1>
          <button onClick={toggle} className="ml-auto grid size-10 place-items-center rounded-full hover:bg-surface" aria-label="Toggle theme">{theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}</button>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <section className={`rounded-3xl border border-line bg-bg p-5 ${className}`}>{children}</section>;
export const Stat = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <Card><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-1 font-display text-3xl font-extrabold">{typeof value === "number" ? value.toLocaleString() : value}</p>{sub && <p className="mt-1 text-xs font-semibold text-accent-text">{sub}</p>}</Card>
);
export const Badge = ({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: ReactNode }) => (
  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${tone === "ok" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : tone === "warn" ? "bg-accent-soft text-accent-text" : tone === "bad" ? "bg-red-500/15 text-red-600 dark:text-red-400" : "bg-surface text-muted"}`}>{children}</span>
);
export const inputCls = "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 outline-none focus:border-accent";
export const btn = "rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:opacity-40";
export const btn2 = "rounded-full bg-surface px-4 py-2 text-sm font-bold hover:bg-surface-2";

export function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-44 items-end gap-2" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[11px] font-semibold text-muted">{d.value}</span>
          <div className={`w-full rounded-t-lg ${i === data.length - 1 ? "bg-accent" : "bg-accent/30"}`} style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="text-[11px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Smooth area chart with a highlighted last point.
export function Area({ data, h = 120 }: { data: number[]; h?: number }) {
  const w = 300, max = Math.max(...data) * 1.1 || 1, step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - (v / max) * h] as const);
  const line = pts.map(([x, y], i) => (i ? `L${x},${y}` : `M${x},${y}`)).join(" ");
  const [lx, ly] = pts.at(-1)!;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label={data.join(", ")}>
      <defs><linearGradient id="ar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--color-accent)" stopOpacity=".35" /><stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#ar)" />
      <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="4" fill="var(--color-accent)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Donut with legend; first slice in accent, the rest in fading accent.
export function Donut({ data, center }: { data: { label: string; value: number }[]; center?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1; let acc = 0;
  const op = [1, 0.6, 0.35, 0.18, 0.1];
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 42 42" className="size-32 shrink-0 -rotate-90" role="img" aria-label={data.map((d) => `${d.label} ${d.value}`).join(", ")}>
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-surface-2)" strokeWidth="6" />
        {data.map((d, i) => { const len = (d.value / total) * 100; const el = <circle key={d.label} cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-accent)" strokeOpacity={op[i] ?? 0.1} strokeWidth="6" strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-acc} />; acc += len; return el; })}
        {center && <text x="21" y="21" transform="rotate(90 21 21)" textAnchor="middle" dominantBaseline="central" className="fill-current font-display text-[7px] font-extrabold">{center}</text>}
      </svg>
      <ul className="space-y-1.5 text-sm">{data.map((d, i) => <li key={d.label} className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-accent" style={{ opacity: op[i] ?? 0.1 }} /><span className="text-muted">{d.label}</span><b className="ml-auto pl-3">{Math.round((d.value / total) * 100)}%</b></li>)}</ul>
    </div>
  );
}

// Bento tile: a Card with a label row; spans set by className.
export const Tile = ({ label, value, sub, children, className = "", hot = false }: { label: string; value?: string | number; sub?: string; children?: ReactNode; className?: string; hot?: boolean }) => (
  <section className={`flex flex-col rounded-3xl p-5 ${hot ? "bg-accent text-accent-ink" : "border border-line bg-bg"} ${className}`}>
    <p className={`text-sm font-semibold ${hot ? "opacity-80" : "text-muted"}`}>{label}</p>
    {value !== undefined && <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</p>}
    {sub && <p className={`mt-0.5 text-xs font-semibold ${hot ? "opacity-80" : "text-accent-text"}`}>{sub}</p>}
    {children && <div className="mt-4 min-h-0 flex-1">{children}</div>}
  </section>
);

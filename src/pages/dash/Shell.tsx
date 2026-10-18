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
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted">{d.value}</span>
          <div className={`w-full rounded-t-lg ${i === data.length - 1 ? "bg-accent" : "bg-accent/30"}`} style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="text-[11px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

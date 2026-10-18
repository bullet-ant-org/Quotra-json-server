import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../lib/theme";
import { Logo } from "./Logo";
import { useEffect } from "react";

const nav = [
  { to: "/explore", label: "Explore" },
  { to: "/map", label: "Map" },
  { to: "/community", label: "Community" },
  { to: "/rewards", label: "Rewards" },
  { to: "/for-business", label: "For business" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-10 place-items-center rounded-full hover:bg-surface"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-accent-soft text-accent-text" : "hover:bg-surface"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Roamly home"><Logo /></Link>
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => <NavLink key={n.to} to={n.to} className={link}>{n.label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-surface sm:block">Log in</Link>
          <Link to="/register" className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink hover:opacity-90">Sign up</Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-surface lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-bg px-4 py-3 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            {nav.map((n) => (
              <li key={n.to}><NavLink to={n.to} className={(s) => `block ${link(s)} text-base`}>{n.label}</NavLink></li>
            ))}
            <li><NavLink to="/login" className={(s) => `block ${link(s)} text-base`}>Log in</NavLink></li>
          </ul>
        </nav>
      )}
    </header>
  );
}

const footerCols = [
  { title: "Roamly", links: [["About", "/about"], ["Explore places", "/explore"], ["Map", "/map"], ["Community", "/community"]] },
  { title: "Rewards", links: [["How tokens work", "/rewards"], ["Token terms", "/token-terms"], ["Community guidelines", "/guidelines"]] },
  { title: "Business", links: [["List your place", "/for-business"], ["Business sign up", "/register?type=business"]] },
  { title: "Legal", links: [["Terms of service", "/terms"], ["Privacy policy", "/privacy"]] },
];

function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-64 text-sm text-muted">Discover places worth experiencing. Starting in Nigeria.</p>
        </div>
        {footerCols.map((c) => (
          <div key={c.title}>
            <h2 className="font-display text-base font-bold">{c.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {c.links.map(([label, to]) => (
                <li key={to}><Link to={to} className="hover:text-ink hover:underline underline-offset-4">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">© {new Date().getFullYear()} Roamly</div>
    </footer>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
    </>
  );
}

// Auth screens get a bare layout without header/footer clutter.
export function AuthLayout() {
  const { theme, toggle } = useTheme();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Roamly home"><Logo /></Link>
          <button type="button" onClick={toggle} className="grid size-10 place-items-center rounded-full hover:bg-surface" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10"><Outlet /></div>
      </div>
      <aside className="relative hidden overflow-hidden bg-accent text-accent-ink lg:block" aria-hidden="true">
        <svg viewBox="0 0 400 600" className="absolute inset-0 size-full opacity-25" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M-20 ${40 + i * 52} Q100 ${i * 52 - 10} 200 ${50 + i * 52} T420 ${30 + i * 52}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
          ))}
        </svg>
        <div className="relative flex h-full flex-col justify-end p-14">
          <p className="font-display text-5xl font-extrabold leading-[1.05]">Your next favourite place is closer than you think.</p>
        </div>
      </aside>
    </div>
  );
}

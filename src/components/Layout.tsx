import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { Bookmark, Building2, Gift, Info, LogIn, LogOut, QrCode, Settings } from "lucide-react";
import { Bell, Coins, Compass, Home, MapPinned, Menu, MessageCircle, Moon, Sun, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../lib/auth/AuthContext";
import { conversations, notifications } from "../fixtures/account";
import { useStore, person, LIVE } from "../lib/store";
import { CalendarDays, Clapperboard } from "lucide-react";
import { useTheme } from "../lib/theme";
import { Logo } from "./Logo";
import { useEffect } from "react";

const nav = [
  { to: "/explore", label: "Explore" },
  { to: "/map", label: "Map" },
  { to: "/rewards", label: "Rewards" },
  { to: "/for-business", label: "For business" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="hidden size-10 place-items-center rounded-full hover:bg-surface sm:grid"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  );
}

function SignedInActions() {
  const balance = useStore((s) => s.balance);
  const avatar = useStore((s) => person(s, s.me).avatar);
  const liveUnread = useStore((s) => s.unread ?? 0);
  const unreadMsgs = LIVE ? 0 : conversations.reduce((n, c) => n + c.unread, 0);
  const unreadNotes = LIVE ? liveUnread : notifications.filter((n) => n.unread).length;
  const icon = "relative grid size-10 place-items-center rounded-full hover:bg-surface";
  const dot = (n: number) => n > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink">{n}</span>;
  return (
    <>
      <Link to="/wallet" className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1.5 text-sm font-bold text-accent-text" aria-label={`Wallet, ${balance} tokens`}><Coins className="size-4" aria-hidden="true" />{balance}</Link>
      <Link to="/messages" className={icon} aria-label={`Messages, ${unreadMsgs} unread`}><MessageCircle className="size-5" aria-hidden="true" />{dot(unreadMsgs)}</Link>
      <Link to="/notifications" className={icon} aria-label={`Notifications, ${unreadNotes} unread`}><Bell className="size-5" aria-hidden="true" />{dot(unreadNotes)}</Link>
      <Link to="/profile" className="ml-1 hidden lg:block" aria-label="Your profile"><img src={avatar} alt="" className="size-9 rounded-full object-cover" /></Link>
    </>
  );
}

function MenuDrawer({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const me = useStore((s) => person(s, s.me));
  const balance = useStore((s) => s.balance);
  const groups: [string, [string, string, typeof Home][]][] = user ? [
    ["Go out", [["/home", "Feed", Home], ["/map", "Map", MapPinned], ["/events", "Events", CalendarDays], ["/explore", "Explore places", Compass], ["/reels", "Reels", Clapperboard]]],
    ["Rewards", [["/wallet", "Tokens & passes", Coins], ["/referrals", "Invite friends", Gift], ["/wallet?scan=1", "Scan to check in", QrCode]]],
    ["You", [["/messages", "Messages", MessageCircle], ["/notifications", "Notifications", Bell], ["/saved", "Saved", Bookmark], ["/profile", "Profile", UserIcon], ["/settings", "Settings", Settings]]],
    ["More", [["/for-business", "Outsider for business", Building2], ["/about", "About", Info]]],
  ] : [
    ["Explore", [["/explore", "Explore places", Compass], ["/map", "Map", MapPinned], ["/rewards", "How tokens work", Coins]]],
    ["More", [["/for-business", "Outsider for business", Building2], ["/about", "About", Info], ["/login", "Log in", LogIn]]],
  ];
  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/40" onClick={onClose}>
      <nav aria-label="Menu" onClick={(e) => e.stopPropagation()} className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-bg shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line p-4">
          {user ? <><img src={me.avatar} alt="" className="size-12 rounded-full object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-bold">{me.name}</p><p className="text-sm text-accent-text">{balance} tokens</p></div></> : <span className="flex-1"><Logo /></span>}
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-surface" aria-label="Close menu"><X className="size-5" /></button>
        </div>
        {groups.map(([g, items]) => (
          <div key={g} className="px-3 pt-4">
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-muted">{g}</p>
            {items.map(([to, label, I]) => <Link key={to} to={to} onClick={onClose} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold hover:bg-surface"><span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent-text"><I className="size-5" /></span>{label}</Link>)}
          </div>
        ))}
        <div className="mt-auto space-y-1 border-t border-line p-3">
          <button onClick={toggle} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold hover:bg-surface"><span className="grid size-9 place-items-center rounded-xl bg-surface">{theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}</span>{theme === "dark" ? "Light mode" : "Dark mode"}</button>
          {user && <button onClick={async () => { onClose(); await logout(); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold text-red-600 hover:bg-surface"><span className="grid size-9 place-items-center rounded-xl bg-surface"><LogOut className="size-5" /></span>Log out</button>}
        </div>
      </nav>
    </div>,
    document.body,
  );
}

function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-accent-soft text-accent-text" : "hover:bg-surface"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to={user ? "/home" : "/"} aria-label="Outsider home"><Logo /></Link>
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {(user ? [{ to: "/home", label: "Feed" }, { to: "/events", label: "Events" }, { to: "/reels", label: "Reels" }, { to: "/wallet", label: "Tokens" }, { to: "/explore", label: "Explore" }] : nav).map((n) => <NavLink key={n.to} to={n.to} className={link}>{n.label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {user ? <SignedInActions /> : (
            <>
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:bg-surface sm:block">Log in</Link>
              <Link to="/register" className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink hover:opacity-90">Sign up</Link>
            </>
          )}
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
      {open && <MenuDrawer onClose={() => setOpen(false)} />}
    </header>
  );
}


const dockItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/map", label: "Map", icon: MapPinned, primary: true },
  { to: "/rewards", label: "Tokens", icon: Coins },
  { to: "/login", label: "Log in", icon: UserIcon },
];

const signedInDock = [
  { to: "/home", label: "Home", icon: Home, end: true },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/map", label: "Map", icon: MapPinned, primary: true },
  { to: "/reels", label: "Reels", icon: Clapperboard },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

function Dock() {
  const { user } = useAuth();
  const items = user ? signedInDock : dockItems;
  return (
    <nav aria-label="Primary" className="fixed inset-x-3 bottom-3 z-50 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[26rem]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="mx-auto flex max-w-md items-end justify-between rounded-[1.75rem] border border-line bg-bg/85 px-2 py-1.5 shadow-2xl backdrop-blur-xl">
        {items.map((i) => (
          <li key={i.to} className="flex-1">
            <NavLink
              to={i.to}
              end={i.end}
              onClick={() => { if (i.label === "Home" && location.pathname === i.to) { window.scrollTo({ top: 0, behavior: "smooth" }); window.dispatchEvent(new Event("outsider:refresh")); } }}
              className={({ isActive }) =>
                i.primary
                  ? "mx-auto -mt-6 grid size-14 place-items-center rounded-full bg-accent text-accent-ink shadow-lg ring-4 ring-bg"
                  : `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold ${isActive ? "text-accent-text" : "text-muted"}`
              }
            >
              <i.icon className={i.primary ? "size-6" : "size-5"} aria-hidden="true" />
              {i.primary ? <span className="sr-only">{i.label}</span> : i.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const footerCols = [
  { title: "Outsider", links: [["About", "/about"], ["Explore places", "/explore"], ["Map", "/map"]] },
  { title: "Rewards", links: [["How tokens work", "/rewards"], ["Token terms", "/token-terms"], ["Community guidelines", "/guidelines"]] },
  { title: "Business", links: [["List your place", "/for-business"], ["Business sign up", "/register?type=business"]] },
  { title: "Legal", links: [["Terms of service", "/terms"], ["Privacy policy", "/privacy"]] },
];

function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-64 text-sm text-muted">Go out more. Starting in Nigeria.</p>
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
      <div className="border-t border-line py-5 text-center text-xs text-muted">© {new Date().getFullYear()} Outsider</div>
    </footer>
  );
}

export function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      {user ? <div className="pb-dock" /> : <div className="pb-dock"><Footer /></div>}
      <Dock />
    </>
  );
}


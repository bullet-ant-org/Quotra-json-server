import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Award, Clock, Coins, Lock } from "lucide-react";
import { badges, balance, challenges, pending, transactions } from "../../fixtures/account";
import { destinations } from "../../fixtures/destinations";
import { useTitle } from "../../lib/useTitle";

export default function Wallet() {
  useTitle("Wallet");
  const offers = destinations.filter((d) => d.tokenOffer);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-hero p-6 text-hero-ink sm:p-10">
        <svg viewBox="0 0 200 200" className="absolute -right-10 -top-10 size-64 opacity-15" aria-hidden="true"><circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="16" /><circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="16" /></svg>
        <p className="font-semibold opacity-90">Available balance</p>
        <p className="mt-1 flex items-baseline gap-2 font-display text-6xl font-extrabold sm:text-7xl">{balance}<span className="text-xl font-semibold opacity-80">tokens</span></p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-hero-ink/15 px-3 py-1 text-sm font-semibold"><Clock className="size-4" aria-hidden="true" />{pending} pending review</p>
        <p className="mt-4 text-xs opacity-80">Tokens are promotional rewards, not cash. <Link to="/token-terms" className="underline">Token terms</Link></p>
      </div>

      <section className="mt-10" aria-labelledby="ch">
        <h2 id="ch" className="text-2xl font-bold">Challenges</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {challenges.map((c) => (
            <li key={c.id} className="rounded-2xl bg-surface p-5">
              <p className="font-display text-lg font-bold">{c.title}</p>
              <p className="text-sm text-muted">{c.detail}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={c.progress} aria-valuemax={c.goal} aria-label={`${c.title} progress`}><div className="h-full rounded-full bg-accent" style={{ width: `${(c.progress / c.goal) * 100}%` }} /></div>
              <p className="mt-2 flex justify-between text-sm"><span className="font-semibold">{c.progress}/{c.goal} · +{c.reward}</span><span className="text-muted">{c.ends}</span></p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="sp">
        <h2 id="sp" className="text-2xl font-bold">Spend tokens</h2>
        <ul className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
          {offers.map((d) => (
            <li key={d.slug} className="w-64 shrink-0 sm:w-auto">
              <Link to={`/destinations/${d.slug}`} className="block h-full rounded-2xl border border-line p-4 hover:border-accent">
                <p className="flex items-center gap-1.5 font-display text-lg font-bold"><Coins className="size-5 text-accent" aria-hidden="true" />{d.tokenOffer!.split(" for ")[1]}</p>
                <p className="mt-1 font-semibold">{d.tokenOffer!.split(" for ")[0]}</p>
                <p className="text-sm text-muted">{d.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="hi">
        <h2 id="hi" className="text-2xl font-bold">History</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-4">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${t.kind === "spend" ? "bg-surface" : t.kind === "pending" ? "bg-surface" : "bg-accent-soft text-accent-text"}`}>
                {t.kind === "spend" ? <ArrowUpRight className="size-5" aria-hidden="true" /> : t.kind === "pending" ? <Clock className="size-5 text-muted" aria-hidden="true" /> : <ArrowDownLeft className="size-5" aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.label}</p>
                <p className="truncate text-sm text-muted">{t.place ? `${t.place} · ` : ""}{t.when}</p>
              </div>
              <span className={`font-display text-lg font-bold ${t.amount > 0 && t.kind !== "pending" ? "text-accent-text" : "text-muted"}`}>{t.amount > 0 ? "+" : "−"}{Math.abs(t.amount)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="bd">
        <h2 id="bd" className="text-2xl font-bold">Badges</h2>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {badges.map((b) => (
            <li key={b.id} className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-xs font-semibold ${b.earned ? "bg-accent-soft" : "bg-surface text-muted"}`}>
              <span className={`grid size-12 place-items-center rounded-full ${b.earned ? "bg-accent text-accent-ink" : "bg-surface-2"}`}>{b.earned ? <Award className="size-6" aria-hidden="true" /> : <Lock className="size-5" aria-hidden="true" />}</span>
              {b.name}<span className="sr-only">{b.earned ? "earned" : "locked"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

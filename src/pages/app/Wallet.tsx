import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Coins, Ticket } from "lucide-react";
import { ago, passSlots, useStore, actions, type Pass } from "../../lib/store";
import { bySlug, destPhoto } from "../../fixtures/destinations";
import { QrModal } from "./Events";
import { useTitle } from "../../lib/useTitle";

function PassCard({ p, me, balance, onQr }: { p: Pass; me: string; balance: number; onQr: (p: Pass) => void }) {
  const [err, setErr] = useState<string | null>(null);
  const d = bySlug(p.place);
  const slots = passSlots(p); const left = slots - p.claimed.length;
  const mine = p.claimed.includes(me);
  const afford = balance >= p.perPerson;
  return (
    <article className="relative overflow-hidden rounded-3xl border border-line bg-bg">
      <img src={destPhoto(p.place, 700)} alt="" className="absolute inset-y-0 right-0 h-full w-3/5 object-cover [mask-image:linear-gradient(to_left,#000_35%,transparent)]" />
      <div className="relative max-w-[70%] space-y-1.5 p-5">
        <p className="text-sm font-semibold text-muted">{d?.name}</p>
        <h3 className="font-display text-2xl font-extrabold leading-tight">{p.title}</h3>
        <p className="flex items-center gap-1.5 font-display text-xl font-bold text-accent-text"><Coins className="size-5" />{p.perPerson}</p>
        <p className="text-xs font-semibold text-muted">{left > 0 ? `${left} of ${slots} left today` : "Gone for today"}</p>
        {mine ? <button onClick={() => onQr(p)} className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-bg"><Ticket className="size-4" />Show pass</button>
          : <button disabled={left <= 0 || !afford} onClick={() => setErr(actions.claimPass(p.id))} className="mt-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-ink disabled:bg-surface-2 disabled:text-muted">{left <= 0 ? "Sold out" : afford ? "Use tokens" : `Need ${p.perPerson - balance} more`}</button>}
        {err && <p role="alert" className="text-sm font-medium text-red-600">{err}</p>}
      </div>
    </article>
  );
}

export default function Wallet() {
  useTitle("Tokens");
  const s = useStore((x) => x);
  const [qr, setQr] = useState<Pass | null>(null);
  const live = s.passes.filter((p) => p.active);
  const affordable = live.filter((p) => p.perPerson <= s.balance && p.claimed.length < passSlots(p) && !p.claimed.includes(s.me));
  const mine = live.filter((p) => p.claimed.includes(s.me));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-hero p-6 text-hero-ink sm:p-10">
        <p className="font-semibold opacity-90">Your tokens</p>
        <p className="font-display text-6xl font-extrabold sm:text-7xl">{s.balance}</p>
        <p className="mt-2 max-w-md opacity-90">{affordable.length ? `You can use them at ${affordable.length} place${affordable.length > 1 ? "s" : ""} today.` : "Not enough for today's passes yet. Check in somewhere to earn more."}</p>
        <p className="mt-4 text-xs opacity-80">New passes drop every day. Tokens aren't cash. <Link to="/token-terms" className="underline">Token terms</Link></p>
      </div>

      {mine.length > 0 && (
        <section className="mt-8"><h2 className="text-2xl font-bold">Your passes</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{mine.map((p) => <PassCard key={p.id} p={p} me={s.me} balance={s.balance} onQr={setQr} />)}</div></section>
      )}

      <section className="mt-8"><h2 className="text-2xl font-bold">Today's passes</h2><p className="text-sm text-muted">Each pass has a limited number of spots set by Outsider. When they're gone, they're gone.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{live.filter((p) => !p.claimed.includes(s.me)).map((p) => <PassCard key={p.id} p={p} me={s.me} balance={s.balance} onQr={setQr} />)}</div></section>

      <section className="mt-10"><h2 className="text-2xl font-bold">History</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
          {s.txns.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-4">
              <span className={`grid size-10 place-items-center rounded-full ${t.amount > 0 ? "bg-accent-soft text-accent-text" : "bg-surface"}`}>{t.amount > 0 ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{t.label}</span><span className="text-sm text-muted">{ago(t.at)} ago</span></span>
              <span className={`font-display text-lg font-bold ${t.amount > 0 ? "text-accent-text" : "text-muted"}`}>{t.amount > 0 ? "+" : "−"}{Math.abs(t.amount)}</span>
            </li>
          ))}
        </ul>
      </section>
      {qr && <QrModal title={qr.title} sub={bySlug(qr.place)?.name ?? ""} code={`PASS-${qr.id.toUpperCase()}-${s.me.toUpperCase()}`} onClose={() => setQr(null)} />}
    </div>
  );
}

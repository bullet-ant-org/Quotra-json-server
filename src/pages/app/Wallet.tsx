import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Coins, Gift, QrCode, Sun, Ticket } from "lucide-react";
import { ScanSheet } from "../../components/ScanSheet";
import { POST_BONUS } from "../../lib/store";
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
          : <button disabled={left <= 0 || !afford} onClick={() => actions.claimPass(p.id).then(setErr)} className="mt-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-ink disabled:bg-surface-2 disabled:text-muted">{left <= 0 ? "Sold out" : afford ? "Use tokens" : `Need ${p.perPerson - balance} more`}</button>}
        {err && <p role="alert" className="text-sm font-medium text-red-600">{err}</p>}
      </div>
    </article>
  );
}

export default function Wallet() {
  useTitle("Tokens");
  const s = useStore((x) => x);
  const [qr, setQr] = useState<Pass | null>(null);
  const [scan, setScan] = useState(new URLSearchParams(location.search).has("scan"));
  const today = new Date().toISOString().slice(0, 10);
  const bounty = s.bounties?.find((b) => b.active && b.starts <= today && b.ends >= today);
  const openBonus = (s.visits ?? []).filter((v) => !v.bonus && Date.now() - v.at < 864e5);
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

      {bounty && (
        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-400 via-accent to-fuchsia-600 p-6 text-white">
          <Sun className="absolute -right-6 -top-6 size-40 opacity-20" aria-hidden="true" />
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">Top reward · ends {new Date(bounty.ends).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold">{bounty.title}</h2>
          <p className="mt-1 max-w-md opacity-95">{bounty.description}</p>
          <p className="mt-3 font-display text-4xl font-extrabold">+{bounty.reward} <span className="text-lg font-semibold">tokens</span></p>
          <button onClick={() => setScan(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-ink"><QrCode className="size-4" />Scan to start</button>
        </section>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button onClick={() => setScan(true)} className="flex items-center gap-4 rounded-3xl bg-ink p-5 text-left text-bg"><QrCode className="size-10 shrink-0" /><span><span className="block font-display text-lg font-bold">Scan to check in</span><span className="text-sm opacity-80">Find the Outsider QR at the counter</span></span></button>
        <Link to="/referrals" className="flex items-center gap-4 rounded-3xl bg-surface p-5"><Gift className="size-10 shrink-0 text-accent" /><span><span className="block font-display text-lg font-bold">Invite friends</span><span className="text-sm text-muted">+1 token every time they go out</span></span></Link>
      </div>

      {openBonus.length > 0 && (
        <section className="mt-6 rounded-3xl border-2 border-dashed border-accent p-5">
          <h2 className="font-display text-lg font-bold">Bonus waiting: post about your visit</h2>
          {openBonus.map((v) => <p key={v.id} className="mt-2 flex items-center justify-between gap-3 text-sm"><span>{bySlug(v.place)?.name}</span><Link to={`/home?post=${v.place}`} className="rounded-full bg-accent px-4 py-2 font-bold text-accent-ink">Post for +{POST_BONUS}</Link></p>)}
        </section>
      )}

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
      {scan && <ScanSheet onClose={() => setScan(false)} />}
      {qr && <QrModal title={qr.title} sub={bySlug(qr.place)?.name ?? ""} code={`PASS-${qr.id.toUpperCase()}-${s.me.toUpperCase()}`} onClose={() => setQr(null)} />}
    </div>
  );
}

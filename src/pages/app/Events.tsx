import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CalendarDays, Coins, MapPin, Ticket, X } from "lucide-react";
import { actions, useStore, type EventItem } from "../../lib/store";
import { Img } from "../../components/Img";
import { useTitle } from "../../lib/useTitle";

export function QrModal({ title, sub, code, onClose }: { title: string; sub: string; code: string; onClose: () => void }) {
  const [src, setSrc] = useState("");
  useEffect(() => { QRCode.toDataURL(code, { margin: 1, width: 520, color: { dark: "#242326", light: "#ffffff" } }).then(setSrc); }, [code]);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/50 sm:place-items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-t-[2rem] bg-bg p-6 text-center sm:rounded-[2rem]">
        <button onClick={onClose} className="ml-auto grid size-9 place-items-center rounded-full bg-surface" aria-label="Close"><X className="size-5" /></button>
        <h2 className="font-display text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{sub}</p>
        {src && <img src={src} alt={`QR code ${code}`} className="mx-auto mt-5 w-60 rounded-2xl border border-line p-2" />}
        <p className="mt-3 font-mono text-sm font-bold tracking-widest">{code}</p>
        <p className="mt-2 text-xs text-muted">Show this at the entrance. It works once.</p>
      </div>
    </div>
  );
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });

function EventCard({ e, me, onQr }: { e: EventItem; me: string; onQr: (e: EventItem) => void }) {
  const [err, setErr] = useState<string | null>(null);
  const mine = e.reserved.includes(me);
  const full = !!e.slots && e.reserved.length >= e.slots;
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-bg">
      <div className="relative aspect-[16/9]">
        <Img src={e.img} alt="" className="size-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
        {e.slots && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-ink"><Coins className="size-3.5" />Sponsored · {e.tokenCost} tokens</span>}
      </div>
      <div className="-mt-10 relative space-y-2 p-5 pt-0">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1 text-sm font-bold text-accent-text shadow-sm"><CalendarDays className="size-4" />{fmt(e.date)}</p>
        <h3 className="font-display text-xl font-bold leading-tight">{e.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted"><MapPin className="size-4" />{e.venue}</p>
        <p className="text-sm"><span className="font-semibold">{e.price}</span>{e.slots && <span className="text-muted"> · or reserve with tokens</span>}</p>
        {e.slots && (
          <div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent" style={{ width: `${(e.reserved.length / e.slots) * 100}%` }} /></div>
            <p className="mt-1 text-xs font-semibold text-muted">{full ? "All token spots taken" : `${e.slots - e.reserved.length} of ${e.slots} token spots left`}</p>
          </div>
        )}
        {e.slots ? (
          mine ? <button onClick={() => onQr(e)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 font-bold text-bg"><Ticket className="size-4" />Show my QR code</button>
            : <button disabled={full} onClick={() => setErr(actions.reserve(e.id))} className="mt-2 w-full rounded-full bg-accent py-3 font-bold text-accent-ink disabled:bg-surface-2 disabled:text-muted">{full ? "Fully reserved" : `Reserve for ${e.tokenCost} tokens`}</button>
        ) : <button className="mt-2 w-full rounded-full border-2 border-line py-3 font-bold">Interested</button>}
        {err && <p role="alert" className="text-sm font-medium text-red-600">{err}</p>}
      </div>
    </article>
  );
}

export default function Events() {
  useTitle("Events");
  const s = useStore((x) => x);
  const [tab, setTab] = useState<"all" | "sponsored" | "mine">("all");
  const [qr, setQr] = useState<EventItem | null>(null);
  const list = s.events.filter((e) => tab === "all" || (tab === "sponsored" ? e.slots : e.reserved.includes(s.me)));
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-4xl font-extrabold">Events near you</h1><p className="text-muted">Get out this week. Sponsored events have spots you can reserve with tokens.</p></div>
        <p className="rounded-full bg-accent-soft px-4 py-2 text-sm font-bold text-accent-text">{s.balance} tokens</p>
      </div>
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto" role="tablist">
        {([["all", "All events"], ["sponsored", "Sponsored"], ["mine", "My reservations"]] as const).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? "bg-accent text-accent-ink" : "bg-surface"}`}>{l}</button>
        ))}
      </div>
      {list.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((e) => <EventCard key={e.id} e={e} me={s.me} onQr={setQr} />)}</div>
        : <p className="mt-10 text-center text-muted">No reservations yet. Pick a sponsored event and claim a spot.</p>}
      {qr && <QrModal title={qr.title} sub={`${fmt(qr.date)} · ${qr.venue}`} code={`OUT-${qr.id.toUpperCase()}-${s.me.toUpperCase()}`} onClose={() => setQr(null)} />}
    </div>
  );
}

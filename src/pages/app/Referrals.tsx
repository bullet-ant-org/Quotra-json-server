import { useState } from "react";
import { Copy, Gift, Share2, Users } from "lucide-react";
import { person, useStore } from "../../lib/store";
import { useTitle } from "../../lib/useTitle";

export default function Referrals() {
  useTitle("Referrals");
  const s = useStore((x) => x);
  const r = s.referral ?? { code: "—", invited: [], earned: 0 };
  const link = `${location.origin}/register?ref=${r.code}`;
  const [copied, setCopied] = useState(false);
  const checkins = r.invited.reduce((n, i) => n + i.checkins, 0);
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-10 pt-6 sm:px-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-hero p-6 text-hero-ink sm:p-8">
        <Gift className="absolute -right-4 -top-4 size-36 opacity-15" aria-hidden="true" />
        <h1 className="font-display text-3xl font-extrabold">Bring your people outside</h1>
        <p className="mt-2 max-w-md opacity-90">Every time someone you invited checks in somewhere, you get <b>1 token</b>. Forever.</p>
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-bg/95 p-2 pl-4 text-ink">
          <span className="min-w-0 flex-1 truncate font-mono text-sm">{link}</span>
          <button onClick={() => { navigator.clipboard?.writeText(link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-ink"><Copy className="size-4" />{copied ? "Copied" : "Copy"}</button>
          <button onClick={async () => { try { await navigator.share?.({ title: "Join me on Outsider", url: link }); } catch { /* */ } }} className="grid size-9 place-items-center rounded-xl bg-surface" aria-label="Share link"><Share2 className="size-4" /></button>
        </div>
      </section>
      <dl className="grid grid-cols-3 gap-3 text-center">
        {[["Friends joined", r.invited.length], ["Their check-ins", checkins], ["Tokens earned", r.earned]].map(([k, v]) => <div key={k} className="rounded-3xl bg-surface p-4"><dd className="font-display text-3xl font-extrabold text-accent-text">{v}</dd><dt className="text-xs font-semibold text-muted">{k}</dt></div>)}
      </dl>
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Users className="size-5" />Your invites</h2>
        {r.invited.length ? <ul className="divide-y divide-line rounded-3xl border border-line">{r.invited.map((i) => { const p = person(s, i.id); return (
          <li key={i.id} className="flex items-center gap-3 p-4"><img src={p.avatar} alt="" className="size-11 rounded-full object-cover" /><span className="min-w-0 flex-1"><b className="block truncate">{p.name}</b><span className="text-sm text-muted">Joined {new Date(i.joined).toLocaleDateString("en-NG", { day: "numeric", month: "short" })} · {i.checkins} check-ins</span></span><span className="font-display font-bold text-accent-text">+{i.checkins}</span></li>
        ); })}</ul> : <p className="rounded-3xl bg-surface p-6 text-center text-muted">No invites yet. Share your link to start earning.</p>}
      </section>
      <p className="text-xs text-muted">Referral tokens come only from real, verified check-ins. Self-referrals and fake accounts are removed.</p>
    </div>
  );
}

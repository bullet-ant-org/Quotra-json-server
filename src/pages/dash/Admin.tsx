import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CalendarDays, Flag, Sun, LayoutDashboard, MapPinned, Megaphone, Ticket, Users } from "lucide-react";
import { actions, passSlots, useStore } from "../../lib/store";
import { destinations, destPhoto, bySlug, formatNaira } from "../../fixtures/destinations";
import { Badge, Bars, btn, btn2, Card, inputCls, Shell, Stat } from "./Shell";
import { useTitle } from "../../lib/useTitle";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/passes", label: "Token passes", icon: Ticket },
  { to: "/admin/bounties", label: "Bounties", icon: Sun },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/places", label: "Places & brands", icon: MapPinned },
  { to: "/admin/ads", label: "Ads review", icon: Megaphone },
  { to: "/admin/reports", label: "Reports", icon: Flag },
];

function Overview() {
  const s = useStore((x) => x);
  const claimed = s.passes.reduce((n, p) => n + p.claimed.length * p.perPerson, 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Registered users" value={18420} sub="+640 this week" />
        <Stat label="Active brands" value={312} sub={`${s.places.filter((p) => p.status === "pending").length} waiting for review`} />
        <Stat label="Tokens redeemed today" value={claimed} sub={`${s.passes.filter((p) => p.active).length} live passes`} />
        <Stat label="Event reservations" value={s.events.reduce((n, e) => n + e.reserved.length, 0)} sub={`${s.events.filter((e) => e.slots).length} sponsored events`} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card><h2 className="font-display text-lg font-bold">Check-ins this week</h2><p className="mb-4 text-sm text-muted">Verified visits across all places</p>
          <Bars data={[["Mon", 820], ["Tue", 760], ["Wed", 910], ["Thu", 1040], ["Fri", 1480], ["Sat", 2210], ["Sun", 1930]].map(([label, value]) => ({ label: label as string, value: value as number }))} /></Card>
        <Card><h2 className="font-display text-lg font-bold">Today's passes</h2>
          <ul className="mt-3 space-y-3">{s.passes.slice(0, 5).map((p) => { const sl = passSlots(p); return (
            <li key={p.id}><div className="flex justify-between text-sm"><span className="font-semibold">{bySlug(p.place)?.name ?? p.place} · {p.title}</span><span className="text-muted">{p.claimed.length}/{sl}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent" style={{ width: `${(p.claimed.length / sl) * 100}%` }} /></div></li>
          ); })}</ul></Card>
      </div>
    </div>
  );
}

function Passes() {
  const s = useStore((x) => x);
  const [place, setPlace] = useState(destinations[0].slug);
  const [title, setTitle] = useState("Day pass");
  const [per, setPer] = useState(100);
  const [budget, setBudget] = useState(2000);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const slots = per > 0 ? Math.floor(budget / per) : 0;
  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
      <Card className="h-fit space-y-4">
        <div><h2 className="font-display text-lg font-bold">Release a pass</h2><p className="text-sm text-muted">Set the budget and the cost per person. Outsider works out how many people can use it.</p></div>
        <label className="block space-y-1 text-sm font-semibold">Place<select value={place} onChange={(e) => setPlace(e.target.value)} className={inputCls}>{destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label>
        <label className="block space-y-1 text-sm font-semibold">What they get<input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm font-semibold">Tokens per person<input type="number" min={1} value={per} onChange={(e) => setPer(+e.target.value)} className={inputCls} /></label>
          <label className="space-y-1 text-sm font-semibold">Total budget (tokens)<input type="number" min={1} value={budget} onChange={(e) => setBudget(+e.target.value)} className={inputCls} /></label>
        </div>
        <label className="block space-y-1 text-sm font-semibold">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></label>
        <div className="rounded-2xl bg-accent-soft p-4"><p className="text-sm text-muted">{budget.toLocaleString()} ÷ {per.toLocaleString()} per person</p><p className="font-display text-3xl font-extrabold text-accent-text">{slots.toLocaleString()} people</p></div>
        <button disabled={slots < 1 || !title.trim()} onClick={() => actions.createPass({ place, title: title.trim(), perPerson: per, budget, date })} className={`${btn} w-full`}>Release pass</button>
      </Card>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-muted"><tr>{["Pass", "Date", "Per person", "Budget", "Claimed", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">{s.passes.map((p) => { const sl = passSlots(p); return (
            <tr key={p.id}>
              <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={destPhoto(p.place, 120)} alt="" className="size-10 rounded-lg object-cover" /><span><span className="block font-semibold">{p.title}</span><span className="text-muted">{bySlug(p.place)?.name}</span></span></div></td>
              <td className="px-5 py-3">{p.date}</td><td className="px-5 py-3">{p.perPerson}</td><td className="px-5 py-3">{p.budget.toLocaleString()}</td>
              <td className="px-5 py-3">{p.claimed.length}/{sl}</td>
              <td className="px-5 py-3">{!p.active ? <Badge tone="muted">Closed</Badge> : p.claimed.length >= sl ? <Badge tone="bad">Sold out</Badge> : <Badge tone="ok">Live</Badge>}</td>
              <td className="px-5 py-3"><button onClick={() => actions.togglePass(p.id)} className={btn2}>{p.active ? "Close" : "Reopen"}</button></td>
            </tr>
          ); })}</tbody>
        </table>
      </Card>
    </div>
  );
}

function Bounties() {
  const s = useStore((x) => x);
  const blank = { id: "", title: "2 weeks in Zanzibar", description: "Flights, villa and tours for 14 days.", reward: 10000, slots: 2, claimed: [] as string[], img: "", starts: new Date().toISOString().slice(0, 10), ends: new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10), active: true };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank, v: string | number | boolean) => setF({ ...f, [k]: v });
  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
      <Card className="h-fit space-y-3">
        <h2 className="font-display text-lg font-bold">{f.id ? "Edit top reward" : "New summer top reward"}</h2>
        <p className="text-sm text-muted">Shows at the very top of everyone's tokens page while it's active and inside its dates.</p>
        <label className="block space-y-1 text-sm font-semibold">Title<input value={f.title} onChange={(e) => set("title", e.target.value)} className={inputCls} /></label>
        <label className="block space-y-1 text-sm font-semibold">Details<textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-sm font-semibold">Ticket price (tokens)<input type="number" min={1} value={f.reward} onChange={(e) => set("reward", +e.target.value)} className={inputCls} /></label><label className="space-y-1 text-sm font-semibold">Spots<input type="number" min={1} value={f.slots} onChange={(e) => set("slots", +e.target.value)} className={inputCls} /></label></div>
        <label className="block space-y-1 text-sm font-semibold">Cover image URL<input value={f.img} onChange={(e) => set("img", e.target.value)} className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-sm font-semibold">Starts<input type="date" value={f.starts} onChange={(e) => set("starts", e.target.value)} className={inputCls} /></label>
          <label className="space-y-1 text-sm font-semibold">Ends<input type="date" value={f.ends} onChange={(e) => set("ends", e.target.value)} className={inputCls} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="size-4 accent-[var(--c-accent)]" />Active</label>
        <button onClick={() => { actions.saveBounty({ ...f, id: f.id || Math.random().toString(36).slice(2, 9) }); setF(blank); }} className={`${btn} w-full`}>{f.id ? "Save changes" : "Publish bounty"}</button>
      </Card>
      <div className="space-y-3">{(s.bounties ?? []).map((b) => (
        <Card key={b.id} className="flex flex-wrap items-center gap-4">
          <Sun className="size-8 text-accent" />
          <div className="min-w-0 flex-1"><p className="font-bold">{b.title}</p><p className="text-sm text-muted">{b.starts} → {b.ends} · {b.reward.toLocaleString()} tokens · {b.claimed.length}/{b.slots} claimed</p></div>
          <Badge tone={b.active ? "ok" : "muted"}>{b.active ? "Active" : "Off"}</Badge>
          <button onClick={() => setF({ ...b, img: b.img ?? "" })} className={btn2}>Edit</button>
        </Card>
      ))}</div>
    </div>
  );
}

function EventsAdmin() {
  const s = useStore((x) => x);
  const [draft, setDraft] = useState<Record<string, { slots: number; cost: number; max: number; desc: string }>>({});
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {s.events.map((e) => { const d = draft[e.id] ?? { slots: e.slots ?? 20, cost: e.tokenCost ?? 150, max: e.maxSpend ?? 10000, desc: e.description ?? "" }; return (
        <Card key={e.id} className="space-y-3 p-0">
          <div className="relative h-36 overflow-hidden rounded-t-3xl"><img src={e.img} alt="" className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" /></div>
          <div className="space-y-3 px-5 pb-5">
            <div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{e.title}</h3><p className="text-sm text-muted">{e.date} · {e.venue}</p></div>{e.slots ? <Badge tone="ok">Sponsored</Badge> : <Badge tone="muted">Not sponsored</Badge>}</div>
            {e.slots && <p className="text-sm"><b>{e.reserved.length}</b> of {e.slots} reserved</p>}
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-xs font-semibold">Token spots<input type="number" min={1} value={d.slots} onChange={(ev) => setDraft({ ...draft, [e.id]: { ...d, slots: +ev.target.value } })} className={inputCls} /></label>
              <label className="space-y-1 text-xs font-semibold">Tokens each<input type="number" min={1} value={d.cost} onChange={(ev) => setDraft({ ...draft, [e.id]: { ...d, cost: +ev.target.value } })} className={inputCls} /></label>
              <label className="col-span-2 space-y-1 text-xs font-semibold">Max spend per person (₦)<input type="number" min={0} value={d.max} onChange={(ev) => setDraft({ ...draft, [e.id]: { ...d, max: +ev.target.value } })} className={inputCls} /></label>
              <label className="col-span-2 space-y-1 text-xs font-semibold">Ticket details<textarea rows={2} value={d.desc} onChange={(ev) => setDraft({ ...draft, [e.id]: { ...d, desc: ev.target.value } })} className={inputCls} /></label>
            </div>
            <button onClick={() => actions.sponsorEvent(e.id, d.slots, d.cost, d.max, d.desc)} className={`${btn} w-full`}>{e.slots ? "Update sponsorship" : "Sponsor this event"}</button>
          </div>
        </Card>
      ); })}
    </div>
  );
}

function UsersAdmin() {
  const s = useStore((x) => x);
  const [q, setQ] = useState("");
  const list = useMemo(() => s.people.filter((p) => `${p.name} ${p.username}`.toLowerCase().includes(q.toLowerCase())), [s.people, q]);
  return (
    <Card className="overflow-x-auto p-0">
      <div className="border-b border-line p-4"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" aria-label="Search users" className={`${inputCls} max-w-sm`} /></div>
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="text-muted"><tr>{["User", "Type", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">{list.map((p) => (
          <tr key={p.id}>
            <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={p.avatar} alt="" className="size-9 rounded-full object-cover" /><span><span className="block font-semibold">{p.name}</span><span className="text-muted">@{p.username}</span></span></div></td>
            <td className="px-5 py-3">{p.id.startsWith("b") ? "Brand" : "Explorer"}</td>
            <td className="px-5 py-3">{p.status === "suspended" ? <Badge tone="bad">Suspended</Badge> : <Badge tone="ok">Active</Badge>}</td>
            <td className="px-5 py-3 text-right">{p.id !== "me" && <button onClick={() => actions.setUserStatus(p.id, p.status === "suspended" ? "active" : "suspended")} className={btn2}>{p.status === "suspended" ? "Restore" : "Suspend"}</button>}</td>
          </tr>
        ))}</tbody>
      </table>
    </Card>
  );
}

function PlacesAdmin() {
  const s = useStore((x) => x);
  return (
    <div className="space-y-3">
      {s.places.map((p) => (
        <Card key={p.slug} className="flex flex-wrap items-center gap-4">
          <img src={destPhoto(p.slug, 160)} alt="" className="size-14 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1"><p className="font-bold">{p.name}</p><p className="text-sm text-muted">Submitted by @{s.people.find((x) => x.id === p.owner)?.username ?? "brand"}</p></div>
          {p.status === "pending" ? <div className="flex gap-2"><button onClick={() => actions.setPlace(p.slug, "rejected")} className={btn2}>Reject</button><button onClick={() => actions.setPlace(p.slug, "live")} className={btn}>Approve</button></div>
            : <Badge tone={p.status === "live" ? "ok" : "bad"}>{p.status === "live" ? "Live" : "Rejected"}</Badge>}
        </Card>
      ))}
    </div>
  );
}

function AdsAdmin() {
  const s = useStore((x) => x);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {s.ads.map((a) => (
        <Card key={a.id} className="space-y-2">
          <div className="flex justify-between gap-2"><h3 className="font-bold">{a.title}</h3><Badge tone={a.status === "live" ? "ok" : a.status === "review" ? "warn" : "muted"}>{a.status === "review" ? "In review" : a.status}</Badge></div>
          <p className="text-sm text-muted">{a.body}</p><p className="text-sm">Budget {formatNaira(a.budget)} · reach {a.reach.toLocaleString()}</p>
          {a.status === "review" && <div className="flex gap-2 pt-1"><button onClick={() => actions.setAd(a.id, "paused")} className={btn2}>Reject</button><button onClick={() => actions.setAd(a.id, "live")} className={btn}>Approve</button></div>}
        </Card>
      ))}
    </div>
  );
}

function Reports() {
  const [items, setItems] = useState([
    { id: 1, what: "Post by @chidi.eze", why: "Spam", when: "12m" },
    { id: 2, what: "Review of Skyline Lounge", why: "Fake review", when: "1h" },
    { id: 3, what: "@zaraoutside", why: "Impersonation", when: "3h" },
  ]);
  return items.length ? (
    <div className="space-y-3">{items.map((r) => (
      <Card key={r.id} className="flex flex-wrap items-center gap-4"><Flag className="size-5 text-accent" /><div className="flex-1"><p className="font-bold">{r.what}</p><p className="text-sm text-muted">{r.why} · {r.when} ago</p></div>
        <button onClick={() => setItems(items.filter((x) => x.id !== r.id))} className={btn2}>Dismiss</button><button onClick={() => setItems(items.filter((x) => x.id !== r.id))} className={btn}>Remove content</button></Card>
    ))}</div>
  ) : <Card className="text-center text-muted">Queue is clear.</Card>;
}

export default function Admin() {
  useTitle("Admin");
  return (
    <Shell title="Admin" nav={nav}>
      <Routes>
        <Route index element={<Overview />} /><Route path="passes" element={<Passes />} /><Route path="events" element={<EventsAdmin />} />
        <Route path="bounties" element={<Bounties />} />
        <Route path="users" element={<UsersAdmin />} /><Route path="places" element={<PlacesAdmin />} /><Route path="ads" element={<AdsAdmin />} /><Route path="reports" element={<Reports />} />
      </Routes>
    </Shell>
  );
}

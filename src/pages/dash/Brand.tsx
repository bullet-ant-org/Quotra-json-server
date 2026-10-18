import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CalendarDays, Inbox, LayoutDashboard, MapPinned, Megaphone, Newspaper, UserCheck } from "lucide-react";
import { actions, person, useStore } from "../../lib/store";
import { destPhoto, formatNaira } from "../../fixtures/destinations";
import { PH, photo } from "../../lib/media";
import { Badge, Bars, btn, btn2, Card, inputCls, Shell, Stat } from "./Shell";
import Home from "../app/Home";
import Messages from "../app/Messages";
import { useTitle } from "../../lib/useTitle";

const nav = [
  { to: "/brand", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/brand/feed", label: "Feed", icon: Newspaper },
  { to: "/brand/places", label: "My places", icon: MapPinned },
  { to: "/brand/ads", label: "Ads & promotions", icon: Megaphone },
  { to: "/brand/requests", label: "Visit requests", icon: UserCheck },
  { to: "/brand/inbox", label: "Inbox", icon: Inbox },
  { to: "/brand/events", label: "Events", icon: CalendarDays },
];

function Requests({ limit }: { limit?: number }) {
  const s = useStore((x) => x);
  const list = limit ? s.requests.slice(0, limit) : s.requests;
  return (
    <div className="space-y-3">{list.map((r) => { const p = person(s, r.from); return (
      <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
        <img src={p.avatar} alt="" className="size-11 rounded-full object-cover" />
        <div className="min-w-0 flex-1"><p className="font-bold">{p.name} <span className="font-normal text-muted">· {r.people} {r.people > 1 ? "people" : "person"} · {r.date}</span></p><p className="text-sm text-muted">{r.note}</p></div>
        {r.status === "pending" ? <div className="flex gap-2"><button onClick={() => actions.setRequest(r.id, "declined")} className={btn2}>Decline</button><button onClick={() => actions.setRequest(r.id, "accepted")} className={btn}>Accept</button></div>
          : <Badge tone={r.status === "accepted" ? "ok" : "muted"}>{r.status === "accepted" ? "Accepted" : "Declined"}</Badge>}
      </div>
    ); })}</div>
  );
}

function Overview() {
  const s = useStore((x) => x);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Profile views (7 days)" value={8420} sub="+18% vs last week" />
        <Stat label="Direction taps" value={1206} />
        <Stat label="Pending visit requests" value={s.requests.filter((r) => r.status === "pending").length} />
        <Stat label="Passes redeemed" value={s.passes.filter((p) => p.place === "palmfringe-beach-resort").reduce((n, p) => n + p.claimed.length, 0)} sub="Funded by Outsider" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card><h2 className="font-display text-lg font-bold">Visitors this week</h2><p className="mb-4 text-sm text-muted">Verified check-ins at your places</p>
          <Bars data={[["Mon", 42], ["Tue", 38], ["Wed", 51], ["Thu", 47], ["Fri", 88], ["Sat", 132], ["Sun", 117]].map(([label, value]) => ({ label: label as string, value: value as number }))} /></Card>
        <Card><h2 className="mb-3 font-display text-lg font-bold">Latest requests</h2><Requests limit={2} /></Card>
      </div>
    </div>
  );
}

function Places() {
  const s = useStore((x) => x);
  const [name, setName] = useState("");
  const mine = s.places.filter((p) => p.owner === "b1");
  return (
    <div className="grid gap-5 xl:grid-cols-[22rem_1fr]">
      <Card className="h-fit space-y-3">
        <h2 className="font-display text-lg font-bold">Add a place</h2>
        <p className="text-sm text-muted">New places are reviewed by Outsider before they go live.</p>
        <label className="block space-y-1 text-sm font-semibold">Place name<input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Sandbar Island Retreat" /></label>
        <label className="block space-y-1 text-sm font-semibold">Photos<input type="file" accept="image/*" multiple className={`${inputCls} file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1 file:font-bold file:text-accent-text`} /></label>
        <button disabled={!name.trim()} onClick={() => { actions.addPlace(name.trim()); setName(""); }} className={`${btn} w-full`}>Submit for review</button>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">{mine.map((p) => (
        <Card key={p.slug} className="overflow-hidden p-0">
          <div className="relative h-36"><img src={destPhoto(p.slug, 600)} alt="" className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" /></div>
          <div className="flex items-center justify-between gap-2 px-5 pb-5"><p className="font-bold">{p.name}</p><Badge tone={p.status === "live" ? "ok" : p.status === "pending" ? "warn" : "bad"}>{p.status === "pending" ? "In review" : p.status === "live" ? "Live" : "Rejected"}</Badge></div>
        </Card>
      ))}</div>
    </div>
  );
}

function Ads() {
  const s = useStore((x) => x);
  const [f, setF] = useState({ title: "", body: "", budget: 20000 });
  return (
    <div className="grid gap-5 xl:grid-cols-[22rem_1fr]">
      <Card className="h-fit space-y-3">
        <h2 className="font-display text-lg font-bold">Create an ad</h2>
        <label className="block space-y-1 text-sm font-semibold">Headline<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></label>
        <label className="block space-y-1 text-sm font-semibold">Message<textarea rows={3} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={inputCls} /></label>
        <label className="block space-y-1 text-sm font-semibold">Budget (₦)<input type="number" min={1000} step={1000} value={f.budget} onChange={(e) => setF({ ...f, budget: +e.target.value })} className={inputCls} /></label>
        <p className="text-xs text-muted">Ads are reviewed before they show in feeds, and always marked Sponsored.</p>
        <button disabled={!f.title.trim() || !f.body.trim()} onClick={() => { actions.addAd(f); setF({ title: "", body: "", budget: 20000 }); }} className={`${btn} w-full`}>Submit ad</button>
      </Card>
      <div className="space-y-3">{s.ads.map((a) => (
        <Card key={a.id} className="flex flex-wrap items-center gap-4">
          <img src={photo(PH.pool, 200)} alt="" className="size-16 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1"><p className="font-bold">{a.title}</p><p className="text-sm text-muted">{a.body}</p><p className="text-xs font-semibold text-muted">{formatNaira(a.budget)} · {a.reach.toLocaleString()} reached</p></div>
          <Badge tone={a.status === "live" ? "ok" : a.status === "review" ? "warn" : "muted"}>{a.status === "review" ? "In review" : a.status === "live" ? "Live" : "Paused"}</Badge>
          {a.status !== "review" && <button onClick={() => actions.setAd(a.id, a.status === "live" ? "paused" : "live")} className={btn2}>{a.status === "live" ? "Pause" : "Resume"}</button>}
        </Card>
      ))}</div>
    </div>
  );
}

function BrandEvents() {
  const s = useStore((x) => x);
  const [f, setF] = useState({ title: "", date: "", price: "" });
  return (
    <div className="grid gap-5 xl:grid-cols-[22rem_1fr]">
      <Card className="h-fit space-y-3">
        <h2 className="font-display text-lg font-bold">Post an event</h2>
        <label className="block space-y-1 text-sm font-semibold">Title<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-sm font-semibold">Date<input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} /></label>
          <label className="space-y-1 text-sm font-semibold">Price<input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="₦5,000" className={inputCls} /></label>
        </div>
        <p className="text-xs text-muted">Outsider can sponsor your event with token spots.</p>
        <button disabled={!f.title || !f.date} onClick={() => { actions.addEvent({ ...f, price: f.price || "Free", venue: "Palmfringe Beach Resort, Lekki", place: "palmfringe-beach-resort", img: photo(PH.party), host: "b1" }); setF({ title: "", date: "", price: "" }); }} className={`${btn} w-full`}>Publish event</button>
      </Card>
      <div className="space-y-3">{s.events.filter((e) => e.host === "b1").map((e) => (
        <Card key={e.id} className="flex items-center gap-4"><img src={e.img} alt="" className="size-16 rounded-2xl object-cover" />
          <div className="flex-1"><p className="font-bold">{e.title}</p><p className="text-sm text-muted">{e.date} · {e.price}</p></div>
          {e.slots ? <Badge tone="ok">{e.reserved.length}/{e.slots} token spots</Badge> : <Badge tone="muted">Not sponsored</Badge>}</Card>
      ))}</div>
    </div>
  );
}

export default function Brand() {
  useTitle("Brand dashboard");
  return (
    <Shell title="Brand" nav={nav}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="feed" element={<div className="-m-4 sm:-m-6"><Home /></div>} />
        <Route path="places" element={<Places />} />
        <Route path="ads" element={<Ads />} />
        <Route path="requests" element={<Card><Requests /></Card>} />
        <Route path="inbox" element={<div className="-m-4 overflow-hidden sm:-m-6 [&>div]:h-[calc(100dvh-4rem)]"><Messages /></div>} />
        <Route path="inbox/:id" element={<div className="-m-4 overflow-hidden sm:-m-6"><Messages /></div>} />
        <Route path="events" element={<BrandEvents />} />
      </Routes>
    </Shell>
  );
}

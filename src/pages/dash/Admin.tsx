import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CalendarDays, Flag, SlidersHorizontal, Sun, LayoutDashboard, MapPinned, Megaphone, Ticket, Users } from "lucide-react";
import { actions, passSlots, PLATFORM, useStore, type Placement, type Platform } from "../../lib/store";
import { destinations, destPhoto, bySlug } from "../../fixtures/destinations";
import { Area, Badge, Bars, btn, btn2, Card, Donut, inputCls, Shell, Stat, Tile } from "./Shell";
import { useTitle } from "../../lib/useTitle";
import { useAuth } from "../../lib/auth/AuthContext";
import { LoginDetails } from "../../components/LoginDetails";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/passes", label: "Token passes", icon: Ticket },
  { to: "/admin/bounties", label: "Bounties", icon: Sun },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/places", label: "Places & brands", icon: MapPinned },
  { to: "/admin/ads", label: "Ads & credits", icon: Megaphone },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/platform", label: "Platform settings", icon: SlidersHorizontal },
];

function Overview() {
  const s = useStore((x) => x);
  const claimed = s.passes.reduce((n, p) => n + p.claimed.length * p.perPerson, 0);
  const live = s.ads.filter((a) => a.status === "live");
  // Live API numbers when connected; sample figures in demo mode.
  const st = s.stats;
  const series = st?.series ?? [820, 760, 910, 1040, 1480, 2210, 1930, 990, 870, 1120, 1260, 1690, 2480, 2140];
  const total = series.reduce((a, b) => a + b, 0), half = series.slice(7).reduce((a, b) => a + b, 0), prev = series.slice(0, 7).reduce((a, b) => a + b, 0);
  const cats = st?.categories?.length ? st.categories : st ? [{ label: "No check-ins yet", value: 1 }] : [{ label: "Food & drinks", value: 41 }, { label: "Nightlife", value: 27 }, { label: "Beaches & parks", value: 18 }, { label: "Stays", value: 9 }, { label: "Other", value: 5 }];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], week = Array(7).fill(0) as number[];
  series.forEach((n, i) => { week[(new Date(Date.now() - (series.length - 1 - i) * 864e5).getDay() + 6) % 7] += n; });
  const short = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  return (
    <div className="grid auto-rows-[minmax(7.5rem,auto)] gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <Tile hot label="Registered users" value={st ? Number(st.users) : 18420} sub={`+${st ? Number(st.newUsers) : 640} this week`} className="xl:col-span-2" />
      <Tile label="Check-ins · 14 days" value={total} sub={prev ? `${half >= prev ? "+" : ""}${Math.round(((half - prev) / prev) * 100)}% vs previous week` : "This week"} className="sm:col-span-2 sm:row-span-2 xl:col-span-4">
        <div className="h-40"><Area data={series} /></div>
      </Tile>
      <Tile label="Ad revenue" value={`₦${(st ? Number(st.adRevenue) : s.adRevenue ?? 0).toLocaleString()}`} sub={`${st ? Number(st.liveAds) : live.length} live campaigns`} />
      <Tile label="Tokens redeemed today" value={st ? Number(st.tokensRedeemedToday) : claimed} sub={`${s.passes.filter((p) => p.active).length} live passes`} />
      <Tile label="Where people go · 30 days" className="sm:col-span-2 xl:col-span-3 xl:row-span-2">
        <Donut center={short(cats.reduce((a, c) => a + c.value, 0))} data={cats.slice(0, 5).map((c) => ({ ...c, label: c.label[0].toUpperCase() + c.label.slice(1) }))} />
      </Tile>
      <Tile label="Today's passes" className="sm:col-span-2 xl:col-span-3 xl:row-span-2">
        <ul className="space-y-3">{s.passes.slice(0, 4).map((p) => { const sl = passSlots(p); return (
          <li key={p.id}><div className="flex justify-between text-sm"><span className="truncate font-semibold">{bySlug(p.place)?.name ?? p.place} · {p.title}</span><span className="text-muted">{p.claimed.length}/{sl}</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent" style={{ width: `${(p.claimed.length / sl) * 100}%` }} /></div></li>
        ); })}</ul>
      </Tile>
      <Tile label="Active brands" value={st ? Number(st.brands) : 312} sub={`${st ? Number(st.pendingPlaces) : s.places.filter((p) => p.status === "pending").length} places waiting for review`} />
      <Tile label="Event reservations" value={st ? Number(st.reservations) : s.events.reduce((n, e) => n + e.reserved.length, 0)} sub={`${s.events.filter((e) => e.slots).length} sponsored`} />
      <Tile label="Check-ins by day · 14 days" className="sm:col-span-2 xl:col-span-4"><Bars data={days.map((label, i) => ({ label, value: week[i] }))} /></Tile>
    </div>
  );
}

// Every price, reward and ranking knob on the platform.
function PlatformAdmin() {
  const { user } = useAuth();
  const cur = useStore((x) => x.platform) ?? PLATFORM;
  const [p, setP] = useState<Platform>(structuredClone(cur));
  const [saved, setSaved] = useState(false);
  const num = (label: string, v: number, on: (n: number) => void, hint?: string, step = 1) => (
    <label className="block space-y-1 text-sm font-semibold">{label}<input type="number" min={0} step={step} value={v} onChange={(e) => on(+e.target.value)} className={inputCls} />{hint && <span className="block text-xs font-normal text-muted">{hint}</span>}</label>
  );
  const pl: Placement[] = ["feed", "reel", "story"];
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-display text-lg font-bold">Ads</h2>
          <div className="grid grid-cols-2 gap-3">{num("₦ per ad credit", p.pricePerCredit, (n) => setP({ ...p, pricePerCredit: n }))}{num("Minimum purchase", p.minCredits, (n) => setP({ ...p, minCredits: n }), "credits")}</div>
          <p className="pt-1 text-sm font-semibold">Credits per 1,000 views, by placement</p>
          {pl.map((k) => (
            <div key={k} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
              <label className="flex flex-1 items-center gap-2 font-semibold capitalize"><input type="checkbox" checked={p.adFormats[k]} onChange={(e) => setP({ ...p, adFormats: { ...p.adFormats, [k]: e.target.checked } })} className="size-4 accent-[var(--color-accent)]" />{k === "reel" ? "Reels" : k === "story" ? "Stories" : "Feed"}</label>
              <input type="number" min={1} value={p.creditsPer1k[k]} onChange={(e) => setP({ ...p, creditsPer1k: { ...p.creditsPer1k, [k]: +e.target.value } })} className={`${inputCls} w-24`} aria-label={`${k} credits per 1k`} />
              <span className="w-24 text-right text-xs text-muted">₦{(p.creditsPer1k[k] * p.pricePerCredit).toLocaleString()} CPM</span>
            </div>
          ))}
          {num("Show one ad after every", p.adEvery, (n) => setP({ ...p, adEvery: Math.max(2, n) }), "organic posts or reels")}
        </Card>
        <Card className="space-y-3">
          <h2 className="font-display text-lg font-bold">Creator rewards</h2>
          <p className="text-sm text-muted">Paid hourly in tokens as posts cross milestones.</p>
          <div className="grid grid-cols-2 gap-3">
            {num("Per 1,000 views", p.creator.per1kViews, (n) => setP({ ...p, creator: { ...p.creator, per1kViews: n } }), "tokens")}
            {num("Per 1,000 likes", p.creator.per1kLikes, (n) => setP({ ...p, creator: { ...p.creator, per1kLikes: n } }), "tokens")}
            {num("Per 100 comments", p.creator.per100Comments, (n) => setP({ ...p, creator: { ...p.creator, per100Comments: n } }), "tokens")}
            {num("Cap per post per day", p.creator.maxPerPostPerDay, (n) => setP({ ...p, creator: { ...p.creator, maxPerPostPerDay: n } }), "tokens")}
          </div>
          <h2 className="pt-2 font-display text-lg font-bold">Going-out rewards</h2>
          <div className="grid grid-cols-2 gap-3">
            {num("Check-in (default)", p.checkInTokens, (n) => setP({ ...p, checkInTokens: n }), "places can override")}
            {num("Post at a place bonus", p.postBonus, (n) => setP({ ...p, postBonus: n }), "within 24h of check-in")}
            {num("Referral, per friend check-in", p.referralPerCheckin, (n) => setP({ ...p, referralPerCheckin: n }))}
            {num("Welcome bonus", p.welcomeBonus, (n) => setP({ ...p, welcomeBonus: n }))}
          </div>
        </Card>
      </div>
      <Card className="space-y-3">
        <h2 className="font-display text-lg font-bold">Feed algorithm</h2>
        <p className="text-sm text-muted">Posts rank by each person's interests (place types and hashtags they watch, like, comment, share and save) times engagement and freshness. New posts go to a test audience first; below the bar they are throttled, above it they keep spreading.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {num("Exploration share (%)", Math.round(p.exploreRate * 100), (n) => setP({ ...p, exploreRate: Math.min(50, n) / 100 }), "content outside someone's interests")}
          {num("Test audience", p.testAudience, (n) => setP({ ...p, testAudience: n }), "impressions before judging a post")}
          {num("Engagement bar (%)", +(p.minEngagementRate * 100).toFixed(1), (n) => setP({ ...p, minEngagementRate: n / 100 }), "weighted engagement per impression", 0.5)}
        </div>
      </Card>
      <Card className="max-w-md space-y-3"><h2 className="font-display text-lg font-bold">Admin login</h2><p className="text-sm text-muted">Change the email and password you use to sign in here.</p><LoginDetails email={user?.email} /></Card>
      <div className="sticky bottom-4 flex justify-end"><button onClick={() => { actions.setPlatform(p); setSaved(true); setTimeout(() => setSaved(false), 1500); }} className={`${btn} shadow-lg`}>{saved ? "Saved ✓" : "Save platform settings"}</button></div>
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
  const [st, setSt] = useState(s.adSettings ?? { pricePerCredit: 50, creditsPer1kViews: 20, minCredits: 100 });
  const [saved, setSaved] = useState(false);
  const cpm = st.pricePerCredit * st.creditsPer1kViews;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Ad credit revenue" value={`₦${(s.adRevenue ?? 0).toLocaleString()}`} />
        <Stat label="Live campaigns" value={s.ads.filter((a) => a.status === "live").length} sub={`${s.ads.filter((a) => a.status === "review").length} waiting for review`} />
        <Stat label="Cost per 1,000 views" value={`₦${cpm.toLocaleString()}`} sub="What brands pay" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[22rem_1fr]">
        <Card className="h-fit space-y-3">
          <h2 className="font-display text-lg font-bold">Ad pricing</h2>
          <label className="block space-y-1 text-sm font-semibold">Price per credit (₦)<input type="number" min={1} value={st.pricePerCredit} onChange={(e) => setSt({ ...st, pricePerCredit: +e.target.value })} className={inputCls} /></label>
          <label className="block space-y-1 text-sm font-semibold">Credits per 1,000 views<input type="number" min={1} value={st.creditsPer1kViews} onChange={(e) => setSt({ ...st, creditsPer1kViews: +e.target.value })} className={inputCls} /></label>
          <label className="block space-y-1 text-sm font-semibold">Minimum purchase (credits)<input type="number" min={1} value={st.minCredits} onChange={(e) => setSt({ ...st, minCredits: +e.target.value })} className={inputCls} /></label>
          <p className="rounded-xl bg-surface p-3 text-sm">Brands pay <b>₦{cpm.toLocaleString()}</b> per 1,000 views. 1,000 credits cost <b>₦{(1000 * st.pricePerCredit).toLocaleString()}</b>.</p>
          <button onClick={() => { actions.setAdSettings(st); setSaved(true); setTimeout(() => setSaved(false), 1500); }} className={`${btn} w-full`}>{saved ? "Saved ✓" : "Save pricing"}</button>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {s.ads.map((a) => (
            <Card key={a.id} className="space-y-2">
              {a.img && <img src={a.img} alt="" className="h-28 w-full rounded-xl object-cover" />}
              <div className="flex justify-between gap-2"><h3 className="font-bold">{a.title}</h3><Badge tone={a.status === "live" ? "ok" : a.status === "review" ? "warn" : "muted"}>{a.status === "review" ? "In review" : a.status}</Badge></div>
              <p className="text-sm text-muted">{a.body}</p><p className="text-xs text-muted">{a.objective ?? "reach"} · {a.city ?? "All"} · {a.credits ?? 0} credits · {a.reach.toLocaleString()} views</p>
              {a.status === "review" && <div className="flex gap-2 pt-1"><button onClick={() => actions.setAd(a.id, "paused")} className={btn2}>Reject</button><button onClick={() => actions.setAd(a.id, "live")} className={btn}>Approve</button></div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

const SAMPLE_REPORTS = [
  { id: "r1", what: "Post by @chidi.eze", why: "Spam", at: Date.now() - 12 * 60e3 },
  { id: "r2", what: "Review of Skyline Lounge", why: "Fake review", at: Date.now() - 36e5 },
];
function Reports() {
  const live = useStore((x) => x.reports);
  const [demo, setDemo] = useState(SAMPLE_REPORTS);
  const items = live ?? demo;
  const act = (id: string, a: "dismiss" | "remove") => (live ? actions.resolveReport(id, a) : setDemo(demo.filter((x) => x.id !== id)));
  return items.length ? (
    <div className="space-y-3">{items.map((r) => (
      <Card key={r.id} className="flex flex-wrap items-center gap-4"><Flag className="size-5 text-accent" /><div className="flex-1"><p className="font-bold">{r.what}</p><p className="text-sm text-muted">{r.why} · {new Date(r.at).toLocaleString()}</p></div>
        <button onClick={() => act(r.id, "dismiss")} className={btn2}>Dismiss</button><button onClick={() => act(r.id, "remove")} className={btn}>Remove content</button></Card>
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
        <Route path="users" element={<UsersAdmin />} /><Route path="places" element={<PlacesAdmin />} /><Route path="ads" element={<AdsAdmin />} /><Route path="reports" element={<Reports />} /><Route path="platform" element={<PlatformAdmin />} />
      </Routes>
    </Shell>
  );
}

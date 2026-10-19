import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

maplibregl.setWorkerUrl(workerUrl); // bundle MapLibre's tile worker so vector maps load
import { Link } from "react-router-dom";
import { Footprints, Car, Eye, X as XIcon, ArrowLeft, BadgeCheck, ChevronUp, Clock, LocateFixed, MapPin, Navigation, Search, SlidersHorizontal, Star, Ticket } from "lucide-react";
import { destinations, destPhoto, formatNaira, type Destination } from "../fixtures/destinations";
import { categories } from "../fixtures/categories";
import { posts as reviews } from "../fixtures/posts";
import { useStore, type Media } from "../lib/store";
import { MediaBadge } from "../components/feed/MediaGrid";
import { Lightbox } from "../components/feed/Lightbox";
import { useTitle } from "../lib/useTitle";
import { GKEY, getRoute, fmtDist, fmtTime, type Mode, type Route } from "../lib/directions";
import { GoogleMapView, type MapCmd } from "../components/GoogleMapView";

// Free OpenStreetMap vector style (street names, building outlines) used when no Google key is set.
const style = "https://tiles.openfreemap.org/styles/liberty";
const km = (a: [number, number], b: [number, number]) => {
  const r = (x: number) => (x * Math.PI) / 180;
  return 12742 * Math.asin(Math.sqrt(Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2));
};
const ICON: Record<string, string> = { accommodation: "🏨", dining: "🍽️", nature: "🌿", recreation: "🎢", culture: "🏛️", nightlife: "🍸", events: "🎉" };
const chip = (on: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg"}`;

function Detail({ d, dist, onBack, onDirections, onStreet }: { d: Destination; dist?: number; onBack: () => void; onDirections: () => void; onStreet: () => void }) {
  const [tab, setTab] = useState<"overview" | "reviews" | "spotlight">("overview");
  const [view, setView] = useState<{ media: Media[]; i: number } | null>(null);
  const spot = useStore((s) => s.posts.filter((p) => p.place === d.slug && p.media.length));
  const revs = reviews.filter((r) => r.destinationSlug === d.slug);
  return (
    <div>
      <div className="relative h-48">
        <img src={destPhoto(d.slug, 800)} alt="" className="size-full object-cover [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />
        <button onClick={onBack} className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-bg/90 shadow" aria-label="Back to results"><ArrowLeft className="size-5" /></button>
      </div>
      <div className="-mt-8 relative space-y-2 px-4">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-text">{d.subcategory}</p>
        <h2 className="flex items-center gap-1.5 font-display text-2xl font-extrabold leading-tight">{d.name}{d.verified && <BadgeCheck className="size-5 text-accent-text" aria-label="Verified" />}</h2>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1 font-semibold text-ink"><Star className="size-4 fill-accent text-accent" />{d.rating.toFixed(1)} <span className="font-normal text-muted">({d.reviewCount})</span></span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{d.city}{dist !== undefined && ` · ${dist < 10 ? dist.toFixed(1) : Math.round(dist)} km`}</span>
          {d.priceFrom !== null && <span>from <b className="text-ink">{formatNaira(d.priceFrom)}</b></span>}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button onClick={onDirections} className="flex items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-bold text-accent-ink"><Navigation className="size-4" />Directions</button>
          <Link to={`/destinations/${d.slug}`} className="flex items-center justify-center gap-2 rounded-full bg-surface py-2.5 text-sm font-bold"><Ticket className="size-4" />Book / details</Link>
          {GKEY && <button onClick={onStreet} className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-line py-2 text-sm font-bold"><Eye className="size-4" />Street View</button>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 border-b border-line text-sm font-bold" role="tablist">
        {(["overview", "reviews", "spotlight"] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`border-b-2 py-2.5 capitalize ${tab === t ? "border-accent text-accent-text" : "border-transparent text-muted"}`}>{t}{t === "spotlight" && spot.length ? ` (${spot.length})` : ""}</button>)}
      </div>
      <div className="p-4">
        {tab === "overview" && <div className="space-y-3 text-sm">
          <p>{d.description}</p>
          {d.hours && <p className="flex items-center gap-2 text-muted"><Clock className="size-4" />{d.hours}</p>}
          <ul className="flex flex-wrap gap-1.5">{d.facilities.map((f) => <li key={f} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">{f}</li>)}</ul>
          {d.tokenOffer && <p className="rounded-xl bg-accent-soft p-3 font-semibold text-accent-text">{d.tokenOffer}</p>}
        </div>}
        {tab === "reviews" && (revs.length ? <ul className="space-y-4">{revs.map((r) => (
          <li key={r.id} className="text-sm"><p className="font-bold">{r.author} <span className="font-normal text-muted">· {r.when}</span></p>
            {r.rating && <p className="text-accent">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>}<p>{r.body}</p></li>
        ))}</ul> : <p className="text-sm text-muted">No reviews yet. Visit and be the first.</p>)}
        {tab === "spotlight" && (spot.length ? <ul className="grid grid-cols-3 gap-0.5">{spot.map((p) => (
          <li key={p.id} className="relative aspect-square overflow-hidden bg-surface"><button onClick={() => setView({ media: p.media, i: 0 })} className="size-full">
            {p.media[0].type === "video" ? <video src={p.media[0].src} muted className="size-full object-cover" /> : <img src={p.media[0].src} alt="" className="size-full object-cover" />}<MediaBadge media={p.media} /></button></li>
        ))}</ul> : <p className="text-sm text-muted">No posts from here yet. Tag this place when you post.</p>)}
      </div>
      {view && <Lightbox media={view.media} start={view.i} onClose={() => setView(null)} />}
    </div>
  );
}

function RoutePanel({ d, route, mode, setMode, nav, setNav, me, onClose, error }: { d: Destination; route: Route | null; mode: Mode; setMode: (m: Mode) => void; nav: boolean; setNav: (v: boolean) => void; me: [number, number] | null; onClose: () => void; error: string | null }) {
  const cur = route && me ? route.steps.reduce((best, st, i) => (km(me, [st.lat, st.lng]) < km(me, [route.steps[best].lat, route.steps[best].lng]) ? i : best), 0) : 0;
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-sm text-muted">Directions to</p><h2 className="font-display text-xl font-bold">{d.name}</h2></div>
        <button onClick={onClose} className="grid size-9 place-items-center rounded-full bg-surface" aria-label="Close directions"><XIcon className="size-5" /></button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-surface p-1 text-sm font-bold">
        {([["driving", Car, "Drive"], ["walking", Footprints, "Walk"]] as const).map(([m, I, l]) => <button key={m} onClick={() => setMode(m)} className={`flex items-center justify-center gap-1.5 rounded-full py-2 ${mode === m ? "bg-bg shadow-sm" : "text-muted"}`}><I className="size-4" />{l}</button>)}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {!route && !error && <p className="mt-4 text-sm text-muted">Finding the best route…</p>}
      {route && <>
        <p className="mt-4"><span className="font-display text-3xl font-extrabold text-accent-text">{fmtTime(route.duration)}</span> <span className="text-muted">· {fmtDist(route.distance)}</span></p>
        <button onClick={() => setNav(!nav)} className={`mt-3 w-full rounded-full py-3 font-bold ${nav ? "bg-ink text-bg" : "bg-accent text-accent-ink"}`}>{nav ? "Stop navigation" : "Start"}</button>
        {nav && route.steps[cur] && <div className="mt-3 rounded-2xl bg-accent p-4 text-accent-ink"><p className="text-xs font-semibold opacity-80">Next</p><p className="font-display text-lg font-bold">{route.steps[Math.min(cur + 1, route.steps.length - 1)].text}</p></div>}
        <ol className="mt-4 space-y-0.5">{route.steps.map((st, i) => (
          <li key={i} className={`flex gap-3 rounded-xl p-2.5 text-sm ${nav && i === cur ? "bg-accent-soft font-semibold" : ""}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold">{i + 1}</span><span className="flex-1">{st.text}</span><span className="shrink-0 text-muted">{st.distance ? fmtDist(st.distance) : ""}</span></li>
        ))}</ol>
        <p className="mt-3 text-xs text-muted">Travel times are estimates. Follow road signs and local rules.</p>
      </>}
    </div>
  );
}

export default function MapPage() {
  useTitle("Map");
  const pv = useStore((s) => s.pv);
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [type, setType] = useState("");
  const [radius, setRadius] = useState(0);
  const [me, setMe] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [dirTo, setDirTo] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("driving");
  const [route, setRoute] = useState<Route | null>(null);
  const [routeErr, setRouteErr] = useState<string | null>(null);
  const [nav, setNav] = useState(false);
  const [cmd, setCmd] = useState<MapCmd>(null);
  const meMarker = useRef<maplibregl.Marker | null>(null);
  useEffect(() => { const to = new URLSearchParams(location.search).get("to"); if (to) { setSel(to); setDirTo(to); setOpen(true); } }, []);

  const list = useMemo(() => destinations
    .map((d) => ({ d, dist: me ? km(me, [d.lat, d.lng]) : undefined }))
    .filter(({ d, dist }) => (!q || `${d.name} ${d.city} ${d.subcategory}`.toLowerCase().includes(q.toLowerCase())) && (!cat || d.category === cat) && (!type || d.subcategory === type) && d.rating >= minRating
      && (!maxPrice || (d.priceFrom ?? 0) <= maxPrice) && (!radius || (dist ?? Infinity) <= radius))
    .sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0) || b.d.rating - a.d.rating), [q, cat, type, minRating, maxPrice, radius, me, pv]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (GKEY || !el.current) return;
    try {
      const m = new maplibregl.Map({ container: el.current, style, center: [6.5, 7.2], zoom: 5.2 });
      map.current = m;
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      const zoomClass = () => el.current?.classList.toggle("map-zoomed", m.getZoom() >= 8.5);
      m.on("zoom", zoomClass); zoomClass();
      m.on("error", (e: maplibregl.ErrorEvent & { sourceId?: string }) => { if (e.sourceId) setError(true); });
      return () => m.remove();
    } catch { setError(true); }
  }, []);

  // Pins: orange dots when zoomed out, photo previews with names when zoomed in (CSS on .map-zoomed).
  useEffect(() => {
    const m = map.current; if (!m) return;
    markers.current.forEach((x) => x.remove());
    markers.current = list.map(({ d }) => {
      const b = document.createElement("button");
      b.className = "map-pin"; b.setAttribute("aria-label", d.name);
      b.innerHTML = `<span class="map-dot">${ICON[d.category] ?? "📍"}</span><span class="map-card"><img src="${destPhoto(d.slug, 200)}" alt=""/><b></b><i>★ ${d.rating.toFixed(1)}</i></span>`;
      b.querySelector("b")!.textContent = d.name;
      b.onclick = () => { setSel(d.slug); setOpen(true); };
      return new maplibregl.Marker({ element: b, anchor: "bottom" }).setLngLat([d.lng, d.lat]).addTo(m);
    });
  }, [list]);

  useEffect(() => {
    const d = destinations.find((x) => x.slug === sel);
    if (d) setCmd({ type: "fly", lat: d.lat, lng: d.lng, zoom: 15 });
  }, [sel]);

  // Commands for the OpenStreetMap fallback map (Google handles its own in GoogleMapView).
  useEffect(() => {
    const m = map.current; if (GKEY || !m || !cmd) return;
    if (cmd.type === "fly") m.flyTo({ center: [cmd.lng, cmd.lat], zoom: cmd.zoom, essential: false });
    if (cmd.type === "fit") { const b = new maplibregl.LngLatBounds(); cmd.path.forEach(([la, ln]) => b.extend([ln, la])); m.fitBounds(b, { padding: 60 }); }
  }, [cmd]);
  useEffect(() => {
    const m = map.current; if (GKEY || !m) return;
    const draw = () => {
      if (m.getLayer("route")) m.removeLayer("route");
      if (m.getSource("route")) m.removeSource("route");
      if (!route) return;
      m.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.path.map(([la, ln]) => [ln, la]) } } });
      m.addLayer({ id: "route", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#FF5A00", "line-width": 7, "line-opacity": 0.9 } });
    };
    if (m.isStyleLoaded()) draw(); else m.once("idle", draw);
  }, [route]);
  useEffect(() => {
    if (GKEY || !map.current || !me) return;
    meMarker.current ??= new maplibregl.Marker({ color: "#2563eb" }).setLngLat([me[1], me[0]]).addTo(map.current);
    meMarker.current.setLngLat([me[1], me[0]]);
  }, [me]);

  // Route: needs your location; recalculates when mode changes.
  const target = destinations.find((x) => x.slug === dirTo);
  useEffect(() => {
    if (!target) return;
    setRoute(null); setRouteErr(null);
    const go = (from: [number, number]) => getRoute(from, [target.lat, target.lng], mode).then((r) => { setRoute(r); setCmd({ type: "fit", path: r.path }); }).catch((e) => setRouteErr(e.message));
    if (me) go(me);
    else navigator.geolocation?.getCurrentPosition((p) => { const c: [number, number] = [p.coords.latitude, p.coords.longitude]; setMe(c); go(c); }, () => setRouteErr("Allow location access so we can route you from where you are."));
  }, [dirTo, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  // Live navigation: follow your position.
  useEffect(() => {
    if (!nav) return;
    const id = navigator.geolocation?.watchPosition((p) => { const c: [number, number] = [p.coords.latitude, p.coords.longitude]; setMe(c); setCmd({ type: "fly", lat: c[0], lng: c[1], zoom: 17 }); }, undefined, { enableHighAccuracy: true });
    return () => { if (id !== undefined) navigator.geolocation.clearWatch(id); };
  }, [nav]);

  const locate = () => navigator.geolocation?.getCurrentPosition((p) => {
    const c: [number, number] = [p.coords.latitude, p.coords.longitude]; setMe(c); if (!radius) setRadius(25);
    setCmd({ type: "fly", lat: c[0], lng: c[1], zoom: 12 });
  });
  const selected = list.find((x) => x.d.slug === sel) ?? (sel ? { d: destinations.find((x) => x.slug === sel)!, dist: undefined } : null);

  const panel = (
    <>
      {target ? <RoutePanel d={target} route={route} mode={mode} setMode={setMode} nav={nav} setNav={setNav} me={me} error={routeErr} onClose={() => { setDirTo(null); setRoute(null); setNav(false); }} />
      : selected?.d ? <Detail d={selected.d} dist={selected.dist} onBack={() => setSel(null)} onDirections={() => { setDirTo(selected.d.slug); setOpen(true); }} onStreet={() => setCmd({ type: "street", lat: selected.d.lat, lng: selected.d.lng })} /> : <>
        <div className="sticky top-0 z-10 space-y-2 border-b border-line bg-bg p-3">
          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-full bg-surface px-4 py-2.5 focus-within:ring-2 focus-within:ring-accent"><Search className="size-4 text-muted" /><span className="sr-only">Search places</span>
              <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} placeholder="Search places or towns" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
            <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} className={`grid size-11 place-items-center rounded-full ${showFilters ? "bg-accent text-accent-ink" : "bg-surface"}`} aria-label="Filters"><SlidersHorizontal className="size-5" /></button>
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            <button onClick={locate} className={chip(!!me)}><LocateFixed className="mr-1 inline size-4" />Near me</button>
            <button onClick={() => setCat(null)} className={chip(!cat)}>All</button>
            {categories.map((c) => <button key={c.id} onClick={() => setCat(cat === c.id ? null : c.id)} className={chip(cat === c.id)}>{ICON[c.id]} {c.name}</button>)}
          </div>
          {showFilters && <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold sm:grid-cols-4">
            <label className="space-y-1">Type<select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-line bg-bg px-2 py-2"><option value="">All types</option>{[...new Set(destinations.map((d) => d.subcategory))].sort().map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="space-y-1">Rating<select value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="w-full rounded-lg border border-line bg-bg px-2 py-2"><option value={0}>Any</option><option value={4}>4.0+</option><option value={4.5}>4.5+</option></select></label>
            <label className="space-y-1">Budget<select value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full rounded-lg border border-line bg-bg px-2 py-2"><option value={0}>Any</option><option value={2500}>Under ₦2.5k</option><option value={10000}>Under ₦10k</option><option value={20000}>Under ₦20k</option></select></label>
            <label className="space-y-1">Distance<select value={radius} onChange={(e) => { setRadius(+e.target.value); if (+e.target.value && !me) locate(); }} className="w-full rounded-lg border border-line bg-bg px-2 py-2"><option value={0}>Any</option><option value={5}>5 km</option><option value={10}>10 km</option><option value={25}>25 km</option><option value={100}>100 km</option></select></label>
          </div>}
        </div>
        <p className="px-4 pt-3 text-xs font-semibold text-muted" aria-live="polite">{list.length} {list.length === 1 ? "place" : "places"}{me ? " · nearest first" : ""}</p>
        <ul className="divide-y divide-line">
          {list.map(({ d, dist }) => (
            <li key={d.slug}><button onClick={() => setSel(d.slug)} className="flex w-full gap-3 p-3 text-left hover:bg-surface">
              <img src={destPhoto(d.slug, 240)} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display font-bold">{d.name}</span>
                <span className="flex items-center gap-1 text-sm"><Star className="size-3.5 fill-accent text-accent" /><b>{d.rating.toFixed(1)}</b><span className="text-muted">({d.reviewCount}) · {d.subcategory}</span></span>
                <span className="block truncate text-sm text-muted">{d.city}{dist !== undefined && ` · ${dist < 10 ? dist.toFixed(1) : Math.round(dist)} km away`}</span>
                {d.priceFrom !== null && <span className="text-sm font-semibold">from {formatNaira(d.priceFrom)}</span>}
              </span>
            </button></li>
          ))}
          {!list.length && <li className="p-8 text-center text-sm text-muted">No places match. Loosen a filter.</li>}
        </ul>
      </>}
    </>
  );

  return (
    <div className="relative h-[calc(100dvh-4rem)] lg:grid lg:grid-cols-[25rem_1fr]">
      <aside className="hidden overflow-y-auto border-r border-line lg:block" aria-label="Places">{panel}</aside>
      <div className="relative h-full">
        {GKEY ? <GoogleMapView list={list.map((x) => x.d)} me={me} path={route?.path} cmd={cmd} onSelect={(slug) => { setSel(slug); setOpen(true); }} /> : <div ref={el} className="size-full" role="region" aria-label="Interactive map" />}
        {error && <div role="alert" className="absolute inset-x-4 top-4 rounded-xl bg-bg p-4 text-sm shadow-lg">The map tiles couldn't load. Check your connection and refresh. The list still works.</div>}
      </div>
      {/* Phone: draggable-style bottom sheet */}
      <section aria-label="Places" className={`absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-3xl bg-bg shadow-[0_-8px_30px_rgba(0,0,0,.15)] transition-[height] duration-300 lg:hidden ${open ? "h-[80%]" : "h-[14rem]"}`}>
        <button onClick={() => setOpen(!open)} className="flex shrink-0 flex-col items-center pt-2" aria-expanded={open} aria-label={open ? "Collapse list" : "Expand list"}>
          <span className="h-1.5 w-10 rounded-full bg-line" /><ChevronUp className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto pb-24">{panel}</div>
      </section>
    </div>
  );
}

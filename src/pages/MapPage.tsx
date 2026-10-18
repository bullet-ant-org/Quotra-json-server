import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { Link } from "react-router-dom";
import { destinations, formatNaira } from "../fixtures/destinations";
import { Rating } from "../components/Stars";
import { useTitle } from "../lib/useTitle";
import { List, MapIcon } from "lucide-react";

const style: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export default function MapPage() {
  useTitle("Map");
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!el.current) return;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({ container: el.current, style, center: [6.5, 7.2], zoom: 5.2 });
    } catch {
      setError(true);
      return;
    }
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.addControl(new maplibregl.GeolocateControl({ trackUserLocation: false }), "top-right");
    m.on("error", (e: maplibregl.ErrorEvent & { sourceId?: string }) => { if (!e.sourceId) return; setError(true); });
    destinations.forEach((d) => {
      const pin = document.createElement("button");
      pin.className = "grid size-9 place-items-center rounded-full border-[3px] border-white bg-[#ff5a00] text-xs font-bold text-white shadow-lg";
      pin.setAttribute("aria-label", d.name);
      pin.textContent = "●";
      pin.onclick = () => setSelected(d.slug);
      new maplibregl.Marker({ element: pin }).setLngLat([d.lng, d.lat]).addTo(m);
    });
    return () => m.remove();
  }, []);

  useEffect(() => {
    const d = destinations.find((x) => x.slug === selected);
    if (d) map.current?.flyTo({ center: [d.lng, d.lat], zoom: 10, essential: false });
  }, [selected]);

  const sel = destinations.find((d) => d.slug === selected);

  return (
    <div className="mx-auto grid h-[calc(100dvh-4rem)] max-w-[100rem] lg:grid-cols-[26rem_1fr]">
      <aside className={`${view === "list" ? "block" : "hidden"} overflow-y-auto border-r border-line lg:block`} aria-label="Destinations">
        <h1 className="px-5 pt-5 text-2xl font-bold">Places on the map</h1>
        <p className="px-5 pb-3 text-sm text-muted">{destinations.length} sample listings</p>
        <ul>
          {destinations.map((d) => (
            <li key={d.slug}>
              <button
                onClick={() => { setSelected(d.slug); setView("map"); }}
                aria-current={selected === d.slug}
                className={`w-full border-t border-line px-5 py-4 text-left hover:bg-surface ${selected === d.slug ? "bg-accent-soft" : ""}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-lg font-bold">{d.name}</span>
                  <Rating value={d.rating} />
                </span>
                <span className="text-sm text-muted">{d.city}, {d.state}{d.priceFrom !== null && ` · from ${formatNaira(d.priceFrom)}`}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className={`${view === "map" ? "block" : "hidden"} relative lg:block`}>
        <div ref={el} className="size-full" role="region" aria-label="Interactive map" />
        {error && (
          <div role="alert" className="absolute inset-x-4 top-4 rounded-xl bg-bg p-4 text-sm shadow-lg">
            The map tiles couldn't load. Check your connection and refresh. The list of places still works.
          </div>
        )}
        {sel && (
          <div className="absolute inset-x-3 bottom-44 rounded-2xl border border-line bg-bg p-4 shadow-xl sm:left-4 sm:right-auto sm:w-96 lg:bottom-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">{sel.name}</p>
                <p className="text-sm text-muted">{sel.city}, {sel.state}</p>
              </div>
              <Rating value={sel.rating} />
            </div>
            <Link to={`/destinations/${sel.slug}`} className="mt-3 inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink">View place</Link>
          </div>
        )}
        <p className="absolute bottom-1 left-2 hidden text-[10px] text-ink/70 lg:block">Map data © OpenStreetMap contributors</p>
      </div>

      <div className="fixed inset-x-0 bottom-28 z-30 flex justify-center lg:hidden">
        <button onClick={() => setView(view === "map" ? "list" : "map")} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-bg shadow-xl">
          {view === "map" ? <><List className="size-4" /> Show list</> : <><MapIcon className="size-4" /> Show map</>}
        </button>
      </div>
    </div>
  );
}

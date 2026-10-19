// In-app routing: Google Directions when a key is set, otherwise free OSRM (OpenStreetMap) routing.
export type Mode = "driving" | "walking";
export interface Step { text: string; distance: number; lat: number; lng: number }
export interface Route { path: [number, number][]; distance: number; duration: number; steps: Step[] } // path as [lat, lng]

export const GKEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

async function viaGoogle(from: [number, number], to: [number, number], mode: Mode): Promise<Route> {
  const { DirectionsService, TravelMode } = (await google.maps.importLibrary("routes")) as google.maps.RoutesLibrary;
  const r = await new DirectionsService().route({ origin: { lat: from[0], lng: from[1] }, destination: { lat: to[0], lng: to[1] }, travelMode: mode === "walking" ? TravelMode.WALKING : TravelMode.DRIVING });
  const leg = r.routes[0].legs[0];
  return {
    path: r.routes[0].overview_path.map((p) => [p.lat(), p.lng()]),
    distance: leg.distance?.value ?? 0, duration: leg.duration?.value ?? 0,
    steps: leg.steps.map((s) => ({ text: s.instructions.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), distance: s.distance?.value ?? 0, lat: s.start_location.lat(), lng: s.start_location.lng() })),
  };
}

const verb = (m: { type: string; modifier?: string }, road: string) => {
  const dir = m.modifier ? m.modifier.replace("uturn", "U-turn") : "";
  const on = road ? ` onto ${road}` : "";
  if (m.type === "depart") return `Head ${dir || "out"}${road ? ` on ${road}` : ""}`;
  if (m.type === "arrive") return "You've arrived";
  if (m.type === "roundabout" || m.type === "rotary") return `Take the roundabout${on}`;
  return `${dir ? `Turn ${dir}` : "Continue"}${on}`;
};

async function osrm(from: [number, number], to: [number, number], mode: Mode): Promise<Route> {
  const host = mode === "walking" ? "https://routing.openstreetmap.de/routed-foot" : "https://router.project-osrm.org";
  const res = await fetch(`${host}/route/v1/${mode === "walking" ? "foot" : "driving"}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`);
  const j = await res.json();
  if (j.code !== "Ok") throw new Error("No route found to this place.");
  const r = j.routes[0];
  return {
    path: r.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]),
    distance: r.distance, duration: r.duration,
    steps: r.legs[0].steps.map((s: { maneuver: { type: string; modifier?: string; location: number[] }; name: string; distance: number }) => ({ text: verb(s.maneuver, s.name), distance: s.distance, lat: s.maneuver.location[1], lng: s.maneuver.location[0] })),
  };
}

export const getRoute = (from: [number, number], to: [number, number], mode: Mode) => (GKEY ? viaGoogle(from, to, mode) : osrm(from, to, mode));
export const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`);
export const fmtTime = (s: number) => { const m = Math.round(s / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };

import { useEffect, useState } from "react";
import { APIProvider, AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps";
import { destPhoto, type Destination } from "../fixtures/destinations";
import { GKEY } from "../lib/directions";

export type MapCmd = { type: "fly"; lat: number; lng: number; zoom: number } | { type: "street"; lat: number; lng: number } | { type: "fit"; path: [number, number][] } | null;
const ICON: Record<string, string> = { accommodation: "🏨", dining: "🍽️", nature: "🌿", recreation: "🎢", culture: "🏛️", nightlife: "🍸", events: "🎉" };

function Controller({ cmd, path }: { cmd: MapCmd; path?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !cmd) return;
    if (cmd.type === "fly") { map.panTo({ lat: cmd.lat, lng: cmd.lng }); map.setZoom(cmd.zoom); }
    if (cmd.type === "street") { const sv = map.getStreetView(); sv.setPosition({ lat: cmd.lat, lng: cmd.lng }); sv.setVisible(true); }
    if (cmd.type === "fit") { const b = new google.maps.LatLngBounds(); cmd.path.forEach(([lat, lng]) => b.extend({ lat, lng })); map.fitBounds(b, 60); }
  }, [map, cmd]);
  useEffect(() => {
    if (!map || !path?.length) return;
    const line = new google.maps.Polyline({ map, path: path.map(([lat, lng]) => ({ lat, lng })), strokeColor: "#FF5A00", strokeWeight: 7, strokeOpacity: 0.9 });
    return () => line.setMap(null);
  }, [map, path]);
  return null;
}

export function GoogleMapView({ list, me, path, cmd, onSelect }: { list: Destination[]; me: [number, number] | null; path?: [number, number][]; cmd: MapCmd; onSelect: (slug: string) => void }) {
  const [zoom, setZoom] = useState(6);
  return (
    <APIProvider apiKey={GKEY!}>
      <Map className="size-full" defaultCenter={{ lat: 7.2, lng: 6.5 }} defaultZoom={6} mapId={import.meta.env.VITE_GOOGLE_MAP_ID || "DEMO_MAP_ID"} gestureHandling="greedy"
        mapTypeControl streetViewControl fullscreenControl={false} onZoomChanged={(e) => setZoom(e.detail.zoom)}>
        {list.map((d) => (
          <AdvancedMarker key={d.slug} position={{ lat: d.lat, lng: d.lng }} onClick={() => onSelect(d.slug)} title={d.name}>
            {zoom >= 13
              ? <span className="map-card" style={{ display: "block" }}><img src={destPhoto(d.slug, 200)} alt="" /><b>{d.name}</b><i>★ {d.rating.toFixed(1)}</i></span>
              : <span className="map-dot">{ICON[d.category] ?? "📍"}</span>}
          </AdvancedMarker>
        ))}
        {me && <AdvancedMarker position={{ lat: me[0], lng: me[1] }}><span className="block size-5 rounded-full border-[3px] border-white bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,.25)]" /></AdvancedMarker>}
        <Controller cmd={cmd} path={path} />
      </Map>
    </APIProvider>
  );
}

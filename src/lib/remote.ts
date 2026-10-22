// LIVE MODE: connects the shared store to the Outsider API when VITE_API_URL is set.
// Maps API documents into the store shapes the UI already uses.
import { io, type Socket } from "socket.io-client";
import { apiBase, get, post, request } from "./api";
import { actions, getState, LIVE, set, type Media, type Person, type State } from "./store";
import { destinations, type Destination } from "../fixtures/destinations";
import type { CategoryId } from "../fixtures/categories";
import type { User } from "./auth/service";

/* eslint-disable @typescript-eslint/no-explicit-any */
type A = any;
const placeIds = new Map<string, string>(); // slug -> id
const ts = (d: string | Date) => new Date(d).getTime();
const day = (d: string | Date) => new Date(d).toISOString().slice(0, 10);

function addPeople(s: State, list: A[]) {
  for (const u of list) {
    if (!u?.id) continue;
    const p: Person = { id: u.id, name: `${u.firstName} ${u.lastName ?? ""}`.trim(), username: u.username, avatar: u.avatar ?? `https://api.dicebear.com/9.x/initials/svg?seed=${u.username}`, bio: u.bio, following: s.people.find((x) => x.id === u.id)?.following ?? false, status: u.status };
    const i = s.people.findIndex((x) => x.id === u.id);
    if (i >= 0) s.people[i] = { ...s.people[i], ...p }; else s.people.push(p);
  }
}
const mapPost = (p: A) => ({
  id: p.id, authorId: p.author?.id, text: p.text ?? "", media: (p.media ?? []) as Media[], place: p.place?.slug, tags: (p.tags ?? []).map((t: A) => t.id),
  likes: (p.likes ?? []).map(String), comments: (p.comments ?? []).map((c: A) => ({ id: c._id ?? c.id, authorId: c.author?.id, text: c.text, at: ts(c.at) })),
  reposts: p.reposts ?? 0, at: ts(p.createdAt), party: p.party?.max ? { date: day(p.party.date), max: p.party.max, going: (p.party.going ?? []).map(String) } : undefined,
});
const mapPass = (p: A) => ({ id: p.id, place: p.place?.slug ?? "", title: p.title, perPerson: p.perPerson, budget: p.budget, date: day(p.date), claimed: (p.claimed ?? []).map(String), active: p.active });
const mapEvent = (e: A) => ({ id: e.id, title: e.title, venue: e.venue, place: e.place?.slug, date: day(e.date), img: e.img ?? "", price: e.price ?? "", slots: e.slots || undefined, tokenCost: e.tokenCost, reserved: (e.reserved ?? []).map(String), host: String(e.host ?? "") });

// Show the last known places instantly, then refresh.
try { const c = localStorage.getItem("outsider-places"); if (LIVE && c) { const list: Destination[] = JSON.parse(c); destinations.splice(0, destinations.length, ...list); list.forEach((d) => d.id && placeIds.set(d.slug, d.id)); } } catch { /* no cache */ }

export async function loadPlaces() {
  const { items } = await get<{ items: A[] }>("/places?limit=500");
  const mapped: Destination[] = items.map((p) => {
    placeIds.set(p.slug, p.id ?? p._id);
    return { id: p.id, slug: p.slug, name: p.name, category: p.category as CategoryId, subcategory: p.subcategory ?? "", city: p.city ?? "", state: p.state ?? "", lat: p.location.coordinates[1], lng: p.location.coordinates[0],
      rating: p.rating ?? 0, reviewCount: p.reviewCount ?? 0, priceFrom: p.priceFrom ?? null, verified: !!p.verified, tokenOffer: null, checkInTokens: p.checkInTokens ?? 10,
      facilities: p.facilities ?? [], description: p.description ?? "", hours: p.hours ?? "", hue: 24, photo: p.photos?.[0] };
  });
  destinations.splice(0, destinations.length, ...mapped);
  try { localStorage.setItem("outsider-places", JSON.stringify(mapped)); } catch { /* full */ }
  set((s) => { s.pv = (s.pv ?? 0) + 1; });
}

export async function loadUser(u: User) {
  const [feed, stories, wallet, passes, events, profile, notes, blocked] = await Promise.all([
    get<A>("/feed"), get<A>("/stories"), get<A>("/wallet"), get<A>("/passes"), get<A>("/events"), get<A>(`/users/${u.username}`), get<A>("/notifications"), get<A>("/me/blocked"),
  ]);
  set((s) => {
    s.me = u.id;
    addPeople(s, [profile.user, ...feed.items.flatMap((p: A) => [p.author, ...(p.tags ?? []), ...(p.comments ?? []).map((c: A) => c.author)]), ...stories.items.map((x: A) => x.author), ...blocked.items]);
    const following = new Set((profile.user.following ?? []).map(String));
    s.people.forEach((p) => { p.following = following.has(p.id); });
    s.posts = feed.items.map(mapPost);
    s.stories = stories.items.map((x: A) => ({ id: x.id, authorId: x.author?.id, src: x.src, at: ts(x.createdAt) }));
    s.highlights = profile.highlights.map((h: A) => ({ id: h.id, name: h.name, cover: h.cover, items: h.items }));
    s.balance = wallet.balance;
    s.txns = wallet.txns.map((t: A) => ({ id: t.id, label: t.label, amount: t.amount, at: ts(t.createdAt) }));
    s.passes = passes.items.map(mapPass);
    s.events = events.items.map(mapEvent);
    s.blocked = blocked.items.map((b: A) => b.id);
    s.unread = notes.unread;
  });
}

export async function loadBrand(u: User) {
  const [ads, reqs, places, events] = await Promise.all([get<A>("/brand/ads"), get<A>("/brand/requests"), get<A>("/brand/places"), get<A>("/brand/events")]);
  set((s) => {
    s.me = u.id;
    addPeople(s, [{ ...u }, ...reqs.items.map((r: A) => r.from)]);
    s.ads = ads.items.map((a: A) => ({ id: a.id, title: a.title, body: a.body, budget: a.budget, status: a.status === "rejected" ? "paused" : a.status, reach: a.reach }));
    s.requests = reqs.items.map((r: A) => ({ id: r.id, from: r.from?.id, date: day(r.date), people: r.people, note: r.note, status: r.status }));
    s.places = places.items.map((p: A) => { placeIds.set(p.slug, p.id); return { slug: p.slug, name: p.name, owner: u.id, status: p.status }; });
    s.events = events.items.map(mapEvent);
  });
}

export async function loadAdmin() {
  const [passes, events, users, places, ads] = await Promise.all([get<A>("/admin/passes"), get<A>("/admin/events"), get<A>("/admin/users"), get<A>("/admin/places"), get<A>("/admin/ads")]);
  set((s) => {
    addPeople(s, users.items);
    s.passes = passes.items.map(mapPass);
    s.events = events.items.map(mapEvent);
    s.places = places.items.map((p: A) => { placeIds.set(p.slug, p.id); return { slug: p.slug, name: p.name, owner: p.owner?.id ?? "", status: p.status }; });
    s.ads = ads.items.map((a: A) => ({ id: a.id, title: a.title, body: a.body, budget: a.budget, status: a.status === "rejected" ? "paused" : a.status, reach: a.reach }));
  });
}

let current: User | null = null;
export async function loadFor(u: User | null) {
  current = u;
  if (!LIVE || !u) return;
  if (u.role === "admin") await loadAdmin(); else if (u.role === "brand") await loadBrand(u); else await loadUser(u);
  connectSocket();
}
const reload = () => (current ? loadFor(current) : Promise.resolve());
const err = (e: unknown) => (e as Error).message;
// Run an API call, then refresh; for token actions return an error message or null.
const run = (fn: () => Promise<unknown>) => { fn().then(reload).catch((e) => alert(err(e))); };
const tryRun = async (fn: () => Promise<unknown>) => { try { await fn(); await reload(); return null; } catch (e) { return err(e); } };

// Socket.IO: live messages and notifications.
export let socket: Socket | null = null;
function connectSocket() {
  if (socket || !apiBase) return;
  socket = io(apiBase, { withCredentials: true, transports: ["websocket", "polling"] });
  socket.on("notification", () => set((s) => { s.unread = (s.unread ?? 0) + 1; }));
}
export function disconnectSocket() { socket?.disconnect(); socket = null; }

// Cloudinary signed upload; returns the hosted URL.
export async function uploadFile(file: File): Promise<Media> {
  const sig = await post<A>("/uploads/sign", {});
  const fd = new FormData();
  fd.append("file", file); fd.append("api_key", sig.apiKey); fd.append("timestamp", String(sig.timestamp)); fd.append("folder", sig.folder); fd.append("signature", sig.signature);
  const res = await fetch(sig.uploadUrl, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
  return { type: data.resource_type === "video" ? "video" : "image", src: data.secure_url };
}

if (LIVE) {
  const pid = (slug?: string) => (slug ? placeIds.get(slug) : undefined);
  Object.assign(actions, {
    addPost: (p: A) => run(() => post("/posts", { text: p.text, media: p.media, place: pid(p.place), tags: p.tags, party: p.party && { date: p.party.date, max: p.party.max } })),
    toggleLike: (id: string) => run(() => post(`/posts/${id}/like`, {})),
    comment: (id: string, text: string) => run(() => post(`/posts/${id}/comments`, { text })),
    repost: (id: string) => run(() => post(`/posts/${id}/repost`, {})),
    joinParty: (id: string) => run(() => post(`/posts/${id}/party`, {})),
    follow: (id: string) => run(() => post(`/users/${id}/follow`, {})),
    block: (id: string) => { if (!getState().blocked.includes(id)) run(() => post(`/users/${id}/block`, {})); },
    unblock: (id: string) => { if (getState().blocked.includes(id)) run(() => post(`/users/${id}/block`, {})); },
    addStory: (src: string) => run(() => post("/stories", { src })),
    addHighlight: (name: string, items: string[]) => run(() => post("/me/highlights", { name, items })),
    claimPass: (id: string) => tryRun(() => post(`/passes/${id}/claim`, {})),
    reserve: (id: string) => tryRun(() => post(`/events/${id}/reserve`, {})),
    createPass: (p: A) => run(() => post("/admin/passes", p)),
    togglePass: (id: string) => run(() => request("PATCH", `/admin/passes/${id}`, { active: !getState().passes.find((x) => x.id === id)?.active })),
    sponsorEvent: (id: string, slots: number, tokenCost: number) => run(() => request("PATCH", `/admin/events/${id}/sponsor`, { slots, tokenCost })),
    addEvent: (e: A) => run(() => post("/brand/events", { title: e.title, date: e.date, price: e.price, venue: e.venue, place: e.place, img: e.img })),
    setUserStatus: (id: string, status: string) => run(() => request("PATCH", `/admin/users/${id}`, { status })),
    setPlace: (slug: string, status: string) => run(() => request("PATCH", `/admin/places/${pid(slug)}`, { status })),
    addPlace: (p: A) => run(() => post("/brand/places", p)),
    addAd: (a: A) => run(() => post("/brand/ads", a)),
    setAd: (id: string, status: string) => run(() => request("PATCH", `/${current?.role === "admin" ? "admin" : "brand"}/ads/${id}`, { status })),
    setRequest: (id: string, status: string) => run(() => request("PATCH", `/brand/requests/${id}`, { status })),
    requestVisit: (note: string, date: string, people: number, place?: string) => run(() => post("/brand/visit-requests", { note, date, people, place })),
  });
}

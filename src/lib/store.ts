// DEMO STORE: one persisted client-side state shared by user, brand and admin views so
// actions in one role show up in the others. Replace with real APIs; never authoritative.
import { useSyncExternalStore } from "react";
import { PH, photo } from "./media";

export type Role = "user" | "brand" | "admin";
export interface Person { id: string; name: string; username: string; avatar: string; bio?: string; following: boolean; status?: "active" | "suspended" }
export interface Media { type: "image" | "video"; src: string }
export interface Comment { id: string; authorId: string; text: string; at: number; likes?: string[] }
export interface Party { date: string; max: number; going: string[] }
export interface Post { id: string; authorId: string; text: string; media: Media[]; place?: string; tags: string[]; likes: string[]; comments: Comment[]; reposts: number; at: number; party?: Party }
export interface Story { id: string; authorId: string; src: string; at: number }
export interface Highlight { id: string; name: string; cover: string; items: string[] }
export interface Pass { id: string; place: string; title: string; perPerson: number; budget: number; date: string; claimed: string[]; active: boolean }
export interface EventItem { id: string; title: string; venue: string; place?: string; date: string; img: string; price: string; slots?: number; tokenCost?: number; reserved: string[]; host: string; description?: string; maxSpend?: number }
export interface Txn { id: string; label: string; amount: number; at: number }
export interface Ad { id: string; title: string; body: string; budget: number; status: "live" | "paused" | "review"; reach: number }
export interface VisitReq { id: string; from: string; date: string; people: number; note: string; status: "pending" | "accepted" | "declined" }
export interface Place { slug: string; name: string; owner: string; status: "live" | "pending" | "rejected" }

export interface Bounty { id: string; title: string; description: string; reward: number; starts: string; ends: string; active: boolean; slots: number; claimed: string[]; img?: string }
export interface Visit { id: string; place: string; at: number; bonus: boolean }
export interface Poll { question: string; options: { label: string; place?: string; votes: string[] }[] }
export interface ChatMsg { id: string; from: string; at: number; kind: "text" | "image" | "video" | "audio" | "location" | "poll" | "post"; text?: string; src?: string; place?: string; postId?: string; poll?: Poll }
export interface Chat { id: string; name?: string; group: boolean; members: string[]; messages: ChatMsg[] }
export interface Referral { code: string; invited: { id: string; joined: number; checkins: number }[]; earned: number }

export interface State {
  me: string; people: Person[]; posts: Post[]; stories: Story[]; highlights: Highlight[];
  balance: number; txns: Txn[]; passes: Pass[]; events: EventItem[]; blocked: string[];
  ads: Ad[]; requests: VisitReq[]; places: Place[];
  saved?: string[]; bounties?: Bounty[]; visits?: Visit[]; chats?: Chat[]; referral?: Referral;
  unread?: number; pv?: number; // pv bumps when the place catalogue reloads
}

const now = Date.now(), h = 3600e3, d = 24 * h;
const today = new Date().toISOString().slice(0, 10);
const inDays = (n: number) => new Date(now + n * d).toISOString().slice(0, 10);
const img = (id: string): Media => ({ type: "image", src: photo(id, 1080) });

const seed = (): State => ({
  me: "me",
  people: [
    { id: "me", name: "Ada Obi", username: "ada.obi", avatar: photo(PH.p1, 200), bio: "Professional outsider. Waterfalls over malls. Lagos ⇄ PH.", following: false },
    { id: "u1", name: "Tunde Ade", username: "tunde_trails", avatar: photo(PH.p2, 200), following: true },
    { id: "u2", name: "Ife Okon", username: "ife.eats", avatar: photo(PH.p3, 200), following: true },
    { id: "u3", name: "Musa Kabir", username: "musa.kano", avatar: photo(PH.p4, 200), following: true },
    { id: "u4", name: "Zara Bello", username: "zaraoutside", avatar: photo(PH.p5, 200), following: false },
    { id: "u5", name: "Chidi Eze", username: "chidi.eze", avatar: photo(PH.p6, 200), following: true },
    { id: "b1", name: "Palmfringe Beach Resort", username: "palmfringe", avatar: photo(PH.resort, 200), following: true },
  ],
  posts: [
    { id: "p1", authorId: "u1", text: "Dawn hike at the ridge. Cloud inversion was gone by 8:30, so set that alarm. #outsider #obudu", media: [img(PH.camp), img(PH.mountain), img(PH.hills), img(PH.lake), img(PH.waterfall), img(PH.beach2)], place: "obudu-ridge-camp", tags: ["u5"], likes: ["u2", "u3"], comments: [{ id: "c1", authorId: "u2", text: "Adding this to my list 😍", at: now - 2 * h }], reposts: 4, at: now - 3 * h, party: { date: inDays(6), max: 8, going: ["u5", "u3"] } },
    { id: "p2", authorId: "u2", text: "Grilled croaker and a sunset. Kora Terrace never misses. Book before 7 on Fridays.", media: [img(PH.rooftop), img(PH.food)], place: "kora-terrace-kitchen", tags: [], likes: ["u1"], comments: [], reposts: 1, at: now - 7 * h },
    { id: "p3", authorId: "b1", text: "Weekday day passes are back 🌴 Pool, beach and lunch. Outsiders get it for 100 tokens.", media: [img(PH.resort), img(PH.pool), img(PH.beach)], place: "palmfringe-beach-resort", tags: [], likes: ["u1", "u2", "u4"], comments: [], reposts: 9, at: now - 20 * h },
    { id: "p4", authorId: "u5", text: "Went out alone for the first time in months. Ten out of ten, would leave the house again.", media: [img(PH.beach2)], tags: [], likes: [], comments: [], reposts: 0, at: now - 30 * h },
    { id: "m1", authorId: "me", text: "Sunday reset at the beach 🌊 #outsider", media: [img(PH.beach), img(PH.beach2), img(PH.resort)], place: "palmfringe-beach-resort", tags: [], likes: ["u1", "u2"], comments: [], reposts: 0, at: now - 4 * d },
    { id: "m2", authorId: "me", text: "Waterfall therapy.", media: [img(PH.waterfall)], place: "ogbunike-falls-lookout", tags: [], likes: ["u5"], comments: [], reposts: 0, at: now - 6 * d },
    { id: "m3", authorId: "me", text: "Rooftop dinner with the girls", media: [img(PH.rooftop), img(PH.food)], place: "kora-terrace-kitchen", tags: ["u2"], likes: [], comments: [], reposts: 0, at: now - 9 * d },
    { id: "m4", authorId: "me", text: "Camp nights", media: [img(PH.camp)], tags: [], likes: [], comments: [], reposts: 0, at: now - 12 * d },
    { id: "m5", authorId: "me", text: "Lake day", media: [img(PH.lake), img(PH.hills)], tags: [], likes: [], comments: [], reposts: 0, at: now - 15 * d },
    { id: "m6", authorId: "me", text: "Museum date", media: [img(PH.museum)], tags: [], likes: [], comments: [], reposts: 0, at: now - 20 * d },
    { id: "p5", authorId: "u3", text: "Friday crew at the lounge. Who's coming next week? #fridayout", media: [img(PH.friends), img(PH.lounge), img(PH.friends3), img(PH.party)], place: "skyline-lounge-abuja", tags: ["u1"], likes: ["u5"], comments: [], reposts: 2, at: now - 2 * d },
  ],
  stories: [
    { id: "s1", authorId: "u1", src: photo(PH.mountain, 1080), at: now - h },
    { id: "s2", authorId: "u2", src: photo(PH.food, 1080), at: now - 2 * h },
    { id: "s3", authorId: "u5", src: photo(PH.beach2, 1080), at: now - 4 * h },
    { id: "s4", authorId: "u3", src: photo(PH.lounge, 1080), at: now - 6 * h },
    { id: "s5", authorId: "b1", src: photo(PH.pool, 1080), at: now - 8 * h },
  ],
  highlights: [
    { id: "h1", name: "Obudu", cover: photo(PH.camp, 300), items: [photo(PH.camp, 1080), photo(PH.mountain, 1080)] },
    { id: "h2", name: "Beaches", cover: photo(PH.beach, 300), items: [photo(PH.beach, 1080), photo(PH.beach2, 1080)] },
    { id: "h3", name: "Food", cover: photo(PH.food, 300), items: [photo(PH.food, 1080)] },
  ],
  balance: 420,
  txns: [
    { id: "t1", label: "Checked in at Palmfringe Beach Resort", amount: 50, at: now - 2 * h },
    { id: "t2", label: "Review approved", amount: 20, at: now - d },
    { id: "t3", label: "Welcome bonus", amount: 350, at: now - 9 * d },
  ],
  passes: [
    { id: "ps1", place: "palmfringe-beach-resort", title: "Day pool pass", perPerson: 100, budget: 2000, date: today, claimed: ["u1", "u2"], active: true },
    { id: "ps2", place: "kora-terrace-kitchen", title: "Dinner for one", perPerson: 250, budget: 2500, date: today, claimed: ["u3"], active: true },
    { id: "ps3", place: "waveform-water-park", title: "Entry ticket", perPerson: 150, budget: 1500, date: today, claimed: [], active: true },
    { id: "ps4", place: "arewa-heritage-museum", title: "Guided tour", perPerson: 60, budget: 600, date: today, claimed: ["u1", "u2", "u3", "u4", "u5", "x1", "x2", "x3", "x4", "x5"], active: true },
  ],
  events: [
    { id: "e1", title: "Sunset Sessions: Beach Party", venue: "Palmfringe Beach Resort, Lekki", place: "palmfringe-beach-resort", date: inDays(2), img: photo(PH.party), price: "₦10,000", slots: 20, tokenCost: 200, reserved: ["u1", "u2", "u3"], host: "b1", maxSpend: 15000, description: "Sunset DJ set on the beach, two welcome drinks and pool access from 4 pm. Token holders get entry and the welcome drinks; anything else is on you up to the max spend." },
    { id: "e2", title: "Live at the Lounge", venue: "Skyline Lounge, Abuja", place: "skyline-lounge-abuja", date: inDays(4), img: photo(PH.concert), price: "₦8,000", reserved: [], host: "b1" },
    { id: "e3", title: "Afro Night Market", venue: "Marina, Lagos Island", date: inDays(5), img: photo(PH.crowd), price: "Free entry", slots: 20, tokenCost: 80, reserved: Array.from({ length: 20 }, (_, i) => `r${i}`), host: "b1" },
    { id: "e4", title: "Dawn Hike + Breakfast", venue: "Obudu Ridge Camp", place: "obudu-ridge-camp", date: inDays(9), img: photo(PH.hills), price: "₦12,000", slots: 12, tokenCost: 300, reserved: ["u5"], host: "b1", maxSpend: 20000, description: "Guided 5 am hike to the ridge, then a hot breakfast at camp. Wear proper shoes." },
    { id: "e5", title: "Open-air Concert", venue: "Port Harcourt Pleasure Park", date: inDays(12), img: photo(PH.stage), price: "₦5,000", reserved: [], host: "b1" },
  ],
  blocked: [],
  saved: [],
  bounties: [{ id: "bt1", title: "2 weeks in Zanzibar", description: "Flights, beach villa and island tours for 14 days. The summer top reward, only 2 spots.", reward: 10000, starts: inDays(-10), ends: inDays(60), active: true, slots: 2, claimed: [], img: photo(PH.beach2, 1200) }],
  visits: [{ id: "v1", place: "kora-terrace-kitchen", at: now - 3 * h, bonus: false }],
  referral: { code: "ADA-OUT", invited: [{ id: "u4", joined: now - 20 * d, checkins: 7 }, { id: "u5", joined: now - 9 * d, checkins: 3 }], earned: 10 },
  chats: [
    { id: "c1", group: false, members: ["me", "u1"], messages: [
      { id: "x1", from: "u1", at: now - 2 * h, kind: "text", text: "Are you still up for Obudu next weekend?" },
      { id: "x2", from: "me", at: now - 110 * 60e3, kind: "text", text: "Yes! The dawn hike looks unreal." },
      { id: "x3", from: "u1", at: now - 100 * 60e3, kind: "location", place: "obudu-ridge-camp" }] },
    { id: "c2", group: false, members: ["me", "b1"], messages: [{ id: "x4", from: "b1", at: now - 20 * h, kind: "text", text: "Hello! Day passes are available this weekend 🌴" }] },
    { id: "c3", group: true, name: "Weekend crew", members: ["me", "u1", "u2", "u5"], messages: [
      { id: "x5", from: "u2", at: now - 5 * h, kind: "text", text: "Where are we going Saturday?" },
      { id: "x6", from: "u5", at: now - 4 * h, kind: "poll", poll: { question: "Saturday plan?", options: [{ label: "Palmfringe Beach Resort", place: "palmfringe-beach-resort", votes: ["u2", "u5"] }, { label: "Kora Terrace Kitchen", place: "kora-terrace-kitchen", votes: ["u1"] }, { label: "Waveform Water Park", place: "waveform-water-park", votes: [] }] } }] },
  ],
  ads: [
    { id: "a1", title: "Weekday day pass", body: "Pool, beach and lunch. 100 tokens for outsiders.", budget: 50000, status: "live", reach: 12400 },
    { id: "a2", title: "Sunset Sessions", body: "Beach party this Saturday.", budget: 30000, status: "review", reach: 0 },
  ],
  requests: [
    { id: "r1", from: "u1", date: inDays(6), people: 4, note: "Group of 4 for the day pass, arriving around noon.", status: "pending" },
    { id: "r2", from: "u2", date: inDays(3), people: 2, note: "Birthday lunch, any chance of a table by the water?", status: "pending" },
    { id: "r3", from: "u4", date: inDays(1), people: 1, note: "Coming solo, first time!", status: "accepted" },
  ],
  places: [
    { slug: "palmfringe-beach-resort", name: "Palmfringe Beach Resort", owner: "b1", status: "live" },
    { slug: "sandbar-island-retreat", name: "Sandbar Island Retreat", owner: "b1", status: "pending" },
    { slug: "greenleaf-garden-cafe", name: "Greenleaf Garden Café", owner: "x9", status: "pending" },
  ],
});

export const POST_BONUS = 25;
export const LIVE = !!import.meta.env.VITE_API_URL;
const empty = (): State => ({ me: "", people: [], posts: [], stories: [], highlights: [], balance: 0, txns: [], passes: [], events: [], blocked: [], ads: [], requests: [], places: [], unread: 0, pv: 0 });
const KEY = "outsider-store-v4";
let state: State = LIVE ? empty() : (() => { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : seed(); } catch { return seed(); } })();
const subs = new Set<() => void>();

export function set(fn: (s: State) => void) {
  state = structuredClone(state);
  fn(state);
  if (!LIVE) try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full: keep in memory */ }
  subs.forEach((f) => f());
}
export const getState = () => state;
export function useStore<T>(sel: (s: State) => T): T {
  return sel(useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state));
}
export const uid = () => Math.random().toString(36).slice(2, 9);
export const person = (s: State, id: string): Person => s.people.find((p) => p.id === id) ?? { id, name: "Outsider", username: id, avatar: photo(PH.p4, 200), following: false };
export const passSlots = (p: Pass) => Math.floor(p.budget / p.perPerson);

const msg = (from: string, m: Omit<ChatMsg, "id" | "from" | "at">): ChatMsg => ({ id: uid(), from, at: Date.now(), ...m });

export const actions = {
  toggleSave: (id: string) => set((s) => { s.saved ??= []; s.saved = s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id]; }),
  likeComment: (postId: string, cId: string) => set((s) => { const c = s.posts.find((p) => p.id === postId)?.comments.find((x) => x.id === cId); if (c) { c.likes ??= []; c.likes = c.likes.includes(s.me) ? c.likes.filter((x) => x !== s.me) : [...c.likes, s.me]; } }),
  sendMessage: (chatId: string, m: Omit<ChatMsg, "id" | "from" | "at">) => set((s) => { s.chats?.find((c) => c.id === chatId)?.messages.push(msg(s.me, m)); }),
  shareTo: (chatIds: string[], m: Omit<ChatMsg, "id" | "from" | "at">) => set((s) => { chatIds.forEach((id) => s.chats?.find((c) => c.id === id)?.messages.push(msg(s.me, m))); }),
  vote: (chatId: string, msgId: string, i: number) => set((s) => { const p = s.chats?.find((c) => c.id === chatId)?.messages.find((x) => x.id === msgId)?.poll; if (p) p.options.forEach((o, k) => { o.votes = o.votes.filter((v) => v !== s.me); if (k === i) o.votes.push(s.me); }); }),
  openChat: (personId: string): string => {
    const s = getState(); const ex = s.chats?.find((c) => !c.group && c.members.includes(personId));
    if (ex) return ex.id;
    const id = uid(); set((st) => { st.chats ??= []; st.chats.unshift({ id, group: false, members: [st.me, personId], messages: [] }); }); return id;
  },
  createGroup: (name: string, members: string[]): string => { const id = uid(); set((s) => { s.chats ??= []; s.chats.unshift({ id, name, group: true, members: [s.me, ...members], messages: [msg(s.me, { kind: "text", text: `Created "${name}"` })] }); }); return id; },
  // Business QR check-in: earns the place's tokens, plus referral credit; posting there later earns a bonus.
  checkIn: async (slug: string, tokens: number): Promise<string | null> => {
    const s = getState();
    if (s.visits?.some((v) => v.place === slug && Date.now() - v.at < 864e5)) return "You've already checked in here today.";
    set((st) => { st.visits ??= []; st.visits.unshift({ id: uid(), place: slug, at: Date.now(), bonus: false }); st.balance += tokens; st.txns.unshift({ id: uid(), label: `Checked in (QR)`, amount: tokens, at: Date.now() }); });
    return null;
  },
  claimBounty: async (id: string): Promise<string | null> => {
    const s = getState(); const b = s.bounties?.find((x) => x.id === id);
    if (!b) return "Not found.";
    if (b.claimed.includes(s.me)) return "You already have a spot.";
    if (b.claimed.length >= b.slots) return "All spots are taken.";
    if (s.balance < b.reward) return `You need ${(b.reward - s.balance).toLocaleString()} more tokens.`;
    set((st) => { const x = st.bounties!.find((y) => y.id === id)!; x.claimed.push(st.me); st.balance -= x.reward; st.txns.unshift({ id: uid(), label: `Top reward: ${x.title}`, amount: -x.reward, at: Date.now() }); });
    return null;
  },
  saveBounty: (b: Bounty) => set((s) => { s.bounties ??= []; const i = s.bounties.findIndex((x) => x.id === b.id); if (i >= 0) s.bounties[i] = b; else s.bounties.unshift(b); }),
  addPost: (p: Omit<Post, "id" | "authorId" | "likes" | "comments" | "reposts" | "at">) => set((s) => {
    s.posts.unshift({ ...p, id: uid(), authorId: s.me, likes: [], comments: [], reposts: 0, at: Date.now() });
    const v = s.visits?.find((x) => x.place === p.place && !x.bonus && Date.now() - x.at < 864e5);
    if (v) { v.bonus = true; s.balance += POST_BONUS; s.txns.unshift({ id: uid(), label: "Posted after check-in", amount: POST_BONUS, at: Date.now() }); }
  }),
  toggleLike: (id: string) => set((s) => { const p = s.posts.find((x) => x.id === id)!; p.likes = p.likes.includes(s.me) ? p.likes.filter((x) => x !== s.me) : [...p.likes, s.me]; }),
  comment: (id: string, text: string) => set((s) => { s.posts.find((x) => x.id === id)!.comments.push({ id: uid(), authorId: s.me, text, at: Date.now() }); }),
  repost: (id: string) => set((s) => { const p = s.posts.find((x) => x.id === id)!; p.reposts++; s.posts.unshift({ ...p, id: uid(), authorId: s.me, text: `Reposted from @${person(s, p.authorId).username}: ${p.text}`, likes: [], comments: [], reposts: 0, at: Date.now(), party: undefined }); }),
  joinParty: (id: string) => set((s) => { const p = s.posts.find((x) => x.id === id)!.party!; p.going = p.going.includes(s.me) ? p.going.filter((x) => x !== s.me) : p.going.length < p.max ? [...p.going, s.me] : p.going; }),
  follow: (id: string) => set((s) => { const p = s.people.find((x) => x.id === id); if (p) p.following = !p.following; }),
  block: (id: string) => set((s) => { if (!s.blocked.includes(id)) s.blocked.push(id); const p = s.people.find((x) => x.id === id); if (p) p.following = false; }),
  unblock: (id: string) => set((s) => { s.blocked = s.blocked.filter((x) => x !== id); }),
  addStory: (src: string) => set((s) => { s.stories.unshift({ id: uid(), authorId: s.me, src, at: Date.now() }); }),
  addHighlight: (name: string, items: string[]) => set((s) => { s.highlights.push({ id: uid(), name, cover: items[0], items }); }),
  claimPass: async (id: string): Promise<string | null> => {
    const s = getState(); const p = s.passes.find((x) => x.id === id)!;
    if (p.claimed.includes(s.me)) return "You already have this pass.";
    if (p.claimed.length >= passSlots(p)) return "All passes for today are gone. New ones drop tomorrow.";
    if (s.balance < p.perPerson) return `You need ${p.perPerson - s.balance} more tokens.`;
    set((st) => { const q = st.passes.find((x) => x.id === id)!; q.claimed.push(st.me); st.balance -= q.perPerson; st.txns.unshift({ id: uid(), label: `Claimed: ${q.title}`, amount: -q.perPerson, at: Date.now() }); });
    return null;
  },
  reserve: async (id: string): Promise<string | null> => {
    const s = getState(); const e = s.events.find((x) => x.id === id)!;
    if (!e.slots || !e.tokenCost) return "This event isn't sponsored.";
    if (e.reserved.includes(s.me)) return "You already reserved a spot.";
    if (e.reserved.length >= e.slots) return "Fully reserved.";
    if (s.balance < e.tokenCost) return `You need ${e.tokenCost - s.balance} more tokens.`;
    set((st) => { const q = st.events.find((x) => x.id === id)!; q.reserved.push(st.me); st.balance -= q.tokenCost!; st.txns.unshift({ id: uid(), label: `Reserved: ${q.title}`, amount: -q.tokenCost!, at: Date.now() }); });
    return null;
  },
  createPass: (p: Omit<Pass, "id" | "claimed" | "active">) => set((s) => { s.passes.unshift({ ...p, id: uid(), claimed: [], active: true }); }),
  togglePass: (id: string) => set((s) => { const p = s.passes.find((x) => x.id === id)!; p.active = !p.active; }),
  sponsorEvent: (id: string, slots: number, tokenCost: number, maxSpend?: number, description?: string) => set((s) => { const e = s.events.find((x) => x.id === id)!; e.slots = slots; e.tokenCost = tokenCost; e.maxSpend = maxSpend; if (description) e.description = description; }),
  addEvent: (e: Omit<EventItem, "id" | "reserved">) => set((s) => { s.events.unshift({ ...e, id: uid(), reserved: [] }); }),
  setUserStatus: (id: string, status: "active" | "suspended") => set((s) => { const p = s.people.find((x) => x.id === id); if (p) p.status = status; }),
  setPlace: (slug: string, status: Place["status"]) => set((s) => { const p = s.places.find((x) => x.slug === slug); if (p) p.status = status; }),
  addPlace: (p: { name: string; category: string; address: string; city: string; state: string; lat: number; lng: number; photos: string[] }) => set((s) => { s.places.unshift({ slug: p.name.toLowerCase().replace(/\W+/g, "-"), name: p.name, owner: "b1", status: "pending" }); }),
  addAd: (a: Omit<Ad, "id" | "status" | "reach">) => set((s) => { s.ads.unshift({ ...a, id: uid(), status: "review", reach: 0 }); }),
  setAd: (id: string, status: Ad["status"]) => set((s) => { s.ads.find((x) => x.id === id)!.status = status; }),
  setRequest: (id: string, status: VisitReq["status"]) => set((s) => { s.requests.find((x) => x.id === id)!.status = status; }),
  requestVisit: (note: string, date: string, people: number, _place?: string) => set((s) => { s.requests.unshift({ id: uid(), from: s.me, date, people, note, status: "pending" }); }),
  reset: () => {
    if (LIVE) return; try { localStorage.removeItem(KEY); } catch { /* */ } state = seed(); subs.forEach((f) => f()); },
};

export const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
};

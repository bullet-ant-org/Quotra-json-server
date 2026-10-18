// DEV FIXTURE: signed-in data for demo mode. Replace with the wallet, messaging and
// notifications APIs. Balances here are display samples, never authoritative.
export interface Txn { id: string; label: string; amount: number; kind: "earn" | "spend" | "pending" | "reversal"; when: string; place?: string }
export const transactions: Txn[] = [
  { id: "t1", label: "Checked in", place: "Palmfringe Beach Resort", amount: 50, kind: "earn", when: "Today, 2:14 pm" },
  { id: "t2", label: "Review approved", place: "Kora Terrace Kitchen", amount: 20, kind: "earn", when: "Yesterday" },
  { id: "t3", label: "Weekend Wanderer challenge", amount: 75, kind: "pending", when: "Pending review" },
  { id: "t4", label: "Redeemed: complimentary drink", place: "Kora Terrace Kitchen", amount: -40, kind: "spend", when: "12 Oct" },
  { id: "t5", label: "Checked in", place: "Waveform Water Park", amount: 30, kind: "earn", when: "10 Oct" },
  { id: "t6", label: "Checked in", place: "Ogbunike Falls Lookout", amount: 30, kind: "earn", when: "4 Oct" },
  { id: "t7", label: "Welcome bonus", amount: 100, kind: "earn", when: "1 Oct" },
];
export const balance = transactions.filter((t) => t.kind !== "pending").reduce((s, t) => s + t.amount, 0);
export const pending = transactions.filter((t) => t.kind === "pending").reduce((s, t) => s + t.amount, 0);

export interface Challenge { id: string; title: string; detail: string; progress: number; goal: number; reward: number; ends: string }
export const challenges: Challenge[] = [
  { id: "c1", title: "Weekend Wanderer", detail: "Check in at 3 places this weekend", progress: 2, goal: 3, reward: 75, ends: "Ends Sunday" },
  { id: "c2", title: "Try something new", detail: "Visit a category you haven't tried", progress: 0, goal: 1, reward: 40, ends: "Ends 31 Oct" },
  { id: "c3", title: "Helpful reviewer", detail: "Get 2 reviews approved", progress: 1, goal: 2, reward: 30, ends: "Ends 15 Nov" },
];

export const badges = [
  { id: "b1", name: "First Discovery", earned: true },
  { id: "b2", name: "Local Explorer", earned: true },
  { id: "b3", name: "Verified Reviewer", earned: true },
  { id: "b4", name: "Weekend Wanderer", earned: false },
  { id: "b5", name: "Regional Explorer", earned: false },
  { id: "b6", name: "Destination Photographer", earned: false },
];

export interface Note { id: string; kind: "reward" | "social" | "message" | "business" | "challenge"; text: string; when: string; unread: boolean; to?: string }
export const notifications: Note[] = [
  { id: "n1", kind: "reward", text: "You earned 50 tokens for checking in at Palmfringe Beach Resort.", when: "2h", unread: true, to: "/wallet" },
  { id: "n2", kind: "business", text: "Kora Terrace Kitchen replied to your question about Friday reservations.", when: "5h", unread: true, to: "/messages/c2" },
  { id: "n3", kind: "social", text: "Tunde A. started following you.", when: "1d", unread: false },
  { id: "n4", kind: "challenge", text: "One more check-in to finish Weekend Wanderer.", when: "1d", unread: false, to: "/wallet" },
  { id: "n5", kind: "social", text: "Adaeze N. and 12 others liked your review of Ogbunike Falls Lookout.", when: "3d", unread: false },
  { id: "n6", kind: "reward", text: "Your review of Kora Terrace Kitchen was approved. +20 tokens.", when: "4d", unread: false, to: "/wallet" },
];

export interface Msg { id: string; from: "me" | "them"; text: string; time: string }
export interface Convo { id: string; name: string; business?: boolean; verified?: boolean; hue: number; last: string; when: string; unread: number; messages: Msg[] }
export const conversations: Convo[] = [
  { id: "c1", name: "Tunde A.", hue: 200, last: "Saturday works. Meet at the gate at 7?", when: "10:42", unread: 2, messages: [
    { id: "m1", from: "them", text: "Are you still up for Obudu next weekend?", time: "10:30" },
    { id: "m2", from: "me", text: "Yes! I saved the ridge camp. The dawn hike looks unreal.", time: "10:35" },
    { id: "m3", from: "them", text: "Saturday works. Meet at the gate at 7?", time: "10:42" },
  ] },
  { id: "c2", name: "Kora Terrace Kitchen", business: true, verified: true, hue: 12, last: "Yes, we hold tables until 7:30 pm on Fridays.", when: "Yesterday", unread: 0, messages: [
    { id: "m1", from: "me", text: "Hi! Do you take reservations for Friday evening, table for 4?", time: "16:02" },
    { id: "m2", from: "them", text: "Hello! Yes, we hold tables until 7:30 pm on Fridays. Shall we book one for you?", time: "16:20" },
  ] },
  { id: "c3", name: "Weekend crew", hue: 150, last: "Ife: I'm voting Palmfringe 🌴", when: "Mon", unread: 0, messages: [
    { id: "m1", from: "them", text: "Where are we going this weekend?", time: "09:10" },
    { id: "m2", from: "them", text: "I'm voting Palmfringe 🌴", time: "09:12" },
  ] },
];

export const interests = ["Resorts", "Nature", "Dining", "Nightlife", "Photography", "Family activities", "Adventure", "Culture", "Budget-friendly", "Romantic"];

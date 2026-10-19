import { useState } from "react";
import { Link } from "react-router-dom";
import { BellOff, Building2, Coins, Heart, MessageCircle, Target } from "lucide-react";
import { useEffect } from "react";
import { notifications as demoNotes, type Note } from "../../fixtures/account";
import { get, post } from "../../lib/api";
import { LIVE, set as setStore } from "../../lib/store";
import { useTitle } from "../../lib/useTitle";

const icons = { reward: Coins, social: Heart, message: MessageCircle, business: Building2, challenge: Target };
const filters = [["all", "All"], ["reward", "Rewards"], ["social", "Social"], ["business", "Businesses"]] as const;

export default function Notifications() {
  useTitle("Notifications");
  const [f, setF] = useState<(typeof filters)[number][0]>("all");
  const [read, setRead] = useState<Set<string>>(new Set());
  const [notifications, setNotes] = useState<Note[]>(LIVE ? [] : demoNotes);
  useEffect(() => {
    if (!LIVE) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<{ items: any[] }>("/notifications").then((r) => setNotes(r.items.map((n) => ({ id: n.id, kind: (["reward", "social", "message", "business", "challenge"].includes(n.kind) ? n.kind : "social") as Note["kind"], text: n.text, when: new Date(n.createdAt).toLocaleString(), unread: !n.read, to: n.link }))));
    post("/notifications/read", {}).then(() => setStore((s) => { s.unread = 0; })).catch(() => {});
  }, []);
  const list = notifications.filter((n) => f === "all" || n.kind === f);
  const unread = (n: Note) => n.unread && !read.has(n.id);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-6 sm:px-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-4xl font-extrabold">Notifications</h1>
        <button onClick={() => setRead(new Set(notifications.map((n) => n.id)))} className="text-sm font-bold text-accent-text">Mark all read</button>
      </div>
      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4" role="tablist">
        {filters.map(([id, l]) => <button key={id} role="tab" aria-selected={f === id} onClick={() => setF(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${f === id ? "bg-accent text-accent-ink" : "bg-surface"}`}>{l}</button>)}
      </div>
      {list.length ? (
        <ul className="mt-5 space-y-2">
          {list.map((n) => {
            const I = icons[n.kind];
            const body = (
              <>
                <span className={`grid size-11 shrink-0 place-items-center rounded-full ${unread(n) ? "bg-accent text-accent-ink" : "bg-surface"}`}><I className="size-5" aria-hidden="true" /></span>
                <p className="flex-1">{n.text}<span className="mt-0.5 block text-sm text-muted">{n.when}{LIVE ? "" : " ago"}</span></p>
                {unread(n) && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
              </>
            );
            const cls = `flex items-start gap-3 rounded-2xl p-3 ${unread(n) ? "bg-accent-soft/60" : "hover:bg-surface"}`;
            return <li key={n.id}>{n.to ? <Link to={n.to} onClick={() => setRead((s) => new Set(s).add(n.id))} className={cls}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
          })}
        </ul>
      ) : (
        <div className="mt-10 grid place-items-center gap-2 text-center text-muted"><BellOff className="size-10" aria-hidden="true" /><p className="font-semibold text-ink">Nothing here yet</p><p>Check in somewhere or follow a few explorers.</p></div>
      )}
    </div>
  );
}

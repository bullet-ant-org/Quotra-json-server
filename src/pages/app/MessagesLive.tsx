import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, MessageCircle, Search, Send } from "lucide-react";
import { conversations as demoConvos } from "../../fixtures/account";
import { Avatar } from "../../components/Avatar";
import { get, post } from "../../lib/api";
import { LIVE, getState } from "../../lib/store";
import { socket } from "../../lib/remote";
import { useTitle } from "../../lib/useTitle";

interface Msg { id: string; from: string; text: string; time: string }
interface Convo { id: string; name: string; hue: number; verified?: boolean; business?: boolean; last: string; when: string; unread: number }

const hm = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
/* eslint-disable @typescript-eslint/no-explicit-any */
const toMsg = (m: any): Msg => ({ id: m.id ?? m._id, from: m.from === getState().me ? "me" : "them", text: m.text, time: hm(m.createdAt) });
const toConvo = (c: any): Convo => {
  const other = c.members.find((m: any) => m.id !== getState().me) ?? c.members[0];
  return { id: c.id, name: c.name ?? `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim(), hue: 24, business: other?.role === "brand", verified: other?.role === "brand", last: c.lastText ?? "", when: c.lastAt ? hm(c.lastAt) : "", unread: 0 };
};

function useConversations() {
  const [list, setList] = useState<Convo[]>(LIVE ? [] : demoConvos.map((c) => ({ ...c })));
  useEffect(() => {
    if (!LIVE) return;
    const load = () => get<{ items: any[] }>("/conversations").then((r) => setList(r.items.map(toConvo))).catch(() => {});
    load();
    socket?.on("message", load);
    return () => { socket?.off("message", load); };
  }, []);
  return list;
}

function Thread({ id, convo }: { id: string; convo?: Convo }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!LIVE) { setMsgs(demoConvos.find((c) => c.id === id)?.messages ?? []); return; }
    get<{ items: any[] }>(`/conversations/${id}/messages`).then((r) => setMsgs(r.items.map(toMsg))).catch((e) => setErr(e.message));
    const onMsg = (p: any) => { if (p.conversationId === id) setMsgs((m) => (m.some((x) => x.id === (p.message.id ?? p.message._id)) ? m : [...m, toMsg(p.message)])); };
    const onTyping = (p: any) => { if (p.conversationId === id) { setTyping(p.user); setTimeout(() => setTyping(null), 2500); } };
    socket?.on("message", onMsg); socket?.on("typing", onTyping);
    return () => { socket?.off("message", onMsg); socket?.off("typing", onTyping); };
  }, [id]);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [msgs, typing]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    if (!LIVE) return setMsgs((m) => [...m, { id: String(Date.now()), from: "me", text: t, time: "now" }]);
    try { const r = await post<{ message: any }>(`/conversations/${id}/messages`, { text: t }); setMsgs((m) => (m.some((x) => x.id === r.message.id) ? m : [...m, toMsg(r.message)])); }
    catch (e2) { setErr((e2 as Error).message); setText(t); }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link to="/messages" className="grid size-9 place-items-center rounded-full hover:bg-surface lg:hidden" aria-label="Back to conversations"><ArrowLeft className="size-5" /></Link>
        <Avatar name={convo?.name ?? "?"} hue={convo?.hue} />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-semibold">{convo?.name}{convo?.verified && <BadgeCheck className="size-4 text-accent-text" aria-label="Verified business" />}</p>
          <p className="text-xs text-muted">{typing ? `${typing} is typing…` : convo?.business ? "Business" : "Explorer"}</p>
        </div>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
            <p className={`max-w-[80%] rounded-3xl px-4 py-2.5 ${m.from === "me" ? "rounded-br-lg bg-accent text-accent-ink" : "rounded-bl-lg bg-surface"}`}>{m.text}<span className="mt-0.5 block text-right text-[10px] opacity-70">{m.time}</span></p>
          </div>
        ))}
        <div ref={end} />
      </div>
      {err && <p role="alert" className="px-4 pb-1 text-sm text-red-600">{err}</p>}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <label htmlFor="msg" className="sr-only">Message</label>
        <input id="msg" value={text} onChange={(e) => { setText(e.target.value); setErr(null); socket?.emit("typing", { conversationId: id }); }} placeholder="Write a message" className="min-w-0 flex-1 rounded-full bg-surface px-5 py-3 outline-none focus:ring-2 focus:ring-accent" />
        <button className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-ink" aria-label="Send"><Send className="size-5" /></button>
      </form>
    </div>
  );
}

export default function Messages() {
  useTitle("Messages");
  const { id } = useParams();
  const [q, setQ] = useState("");
  const all = useConversations();
  const list = all.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const base = location.pathname.startsWith("/brand") ? "/brand/inbox" : "/messages";

  return (
    <div className="mx-auto grid h-[calc(100dvh-4rem)] max-w-6xl lg:grid-cols-[22rem_1fr] lg:border-x lg:border-line">
      <aside className={`${id ? "hidden" : "flex"} flex-col overflow-hidden border-line pb-24 lg:flex lg:border-r lg:pb-0`}>
        <div className="space-y-3 p-4">
          <h1 className="text-3xl font-extrabold">Messages</h1>
          <label className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5"><Search className="size-4 text-muted" aria-hidden="true" /><span className="sr-only">Search conversations</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="flex-1 bg-transparent outline-none" /></label>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {list.map((c) => (
            <li key={c.id}><Link to={`${base}/${c.id}`} aria-current={id === c.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-surface ${id === c.id ? "bg-accent-soft" : ""}`}>
              <Avatar name={c.name} hue={c.hue} className="size-12 text-lg" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-1 truncate font-semibold">{c.name}{c.verified && <BadgeCheck className="size-4 shrink-0 text-accent-text" aria-label="Verified" />}</span><span className="shrink-0 text-xs text-muted">{c.when}</span></p>
                <p className={`truncate text-sm ${c.unread ? "font-semibold" : "text-muted"}`}>{c.last}</p>
              </div>
              {c.unread > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-ink">{c.unread}</span>}
            </Link></li>
          ))}
          {!list.length && <li className="p-6 text-center text-sm text-muted">No conversations yet. Message someone from their profile or a place's page.</li>}
        </ul>
      </aside>
      <section className={`${id ? "block" : "hidden"} h-[calc(100dvh-4rem)] pb-24 lg:block lg:pb-0`}>
        {id ? <Thread id={id} convo={all.find((c) => c.id === id)} /> : (
          <div className="grid h-full place-items-center p-8 text-center text-muted"><div><MessageCircle className="mx-auto size-10" aria-hidden="true" /><p className="mt-2 font-semibold text-ink">Pick a conversation</p></div></div>
        )}
      </section>
    </div>
  );
}

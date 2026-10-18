import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, MessageCircle, Search, Send } from "lucide-react";
import { conversations, type Msg } from "../../fixtures/account";
import { Avatar } from "../../components/Avatar";
import { isDemo } from "../../lib/auth/service";
import { useTitle } from "../../lib/useTitle";

function Thread({ id }: { id: string }) {
  const c = conversations.find((x) => x.id === id);
  const [msgs, setMsgs] = useState<Msg[]>(c?.messages ?? []);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { setMsgs(c?.messages ?? []); }, [c]);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [msgs]);
  if (!c) return <p className="p-8 text-muted">Conversation not found.</p>;

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!isDemo) return setErr("Messages can't be sent yet because the Outsider API isn't connected.");
    setMsgs((m) => [...m, { id: String(Date.now()), from: "me", text: text.trim(), time: "now" }]);
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link to="/messages" className="grid size-9 place-items-center rounded-full hover:bg-surface lg:hidden" aria-label="Back to conversations"><ArrowLeft className="size-5" /></Link>
        <Avatar name={c.name} hue={c.hue} />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-semibold">{c.name}{c.verified && <BadgeCheck className="size-4 text-accent-text" aria-label="Verified business" />}</p>
          <p className="text-xs text-muted">{c.business ? "Business · usually replies within an hour" : "Explorer"}</p>
        </div>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
            <p className={`max-w-[80%] rounded-3xl px-4 py-2.5 ${m.from === "me" ? "rounded-br-lg bg-accent text-accent-ink" : "rounded-bl-lg bg-surface"}`}>
              {m.text}<span className="mt-0.5 block text-right text-[10px] opacity-70">{m.time}</span>
            </p>
          </div>
        ))}
        <div ref={end} />
      </div>
      {err && <p role="alert" className="px-4 pb-1 text-sm text-red-600 dark:text-red-400">{err}</p>}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <label htmlFor="msg" className="sr-only">Message</label>
        <input id="msg" value={text} onChange={(e) => { setText(e.target.value); setErr(null); }} placeholder="Write a message" className="min-w-0 flex-1 rounded-full bg-surface px-5 py-3 outline-none focus:ring-2 focus:ring-accent" />
        <button className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-ink" aria-label="Send"><Send className="size-5" /></button>
      </form>
    </div>
  );
}

export default function Messages() {
  useTitle("Messages");
  const { id } = useParams();
  const [q, setQ] = useState("");
  const list = conversations.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto grid h-[calc(100dvh-4rem)] max-w-6xl lg:grid-cols-[22rem_1fr] lg:border-x lg:border-line">
      <aside className={`${id ? "hidden" : "flex"} flex-col overflow-hidden border-line pb-24 lg:flex lg:border-r lg:pb-0`}>
        <div className="space-y-3 p-4">
          <h1 className="text-3xl font-extrabold">Messages</h1>
          <label className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5">
            <Search className="size-4 text-muted" aria-hidden="true" /><span className="sr-only">Search conversations</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="flex-1 bg-transparent outline-none" />
          </label>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {list.map((c) => (
            <li key={c.id}>
              <Link to={`/messages/${c.id}`} aria-current={id === c.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-surface ${id === c.id ? "bg-accent-soft" : ""}`}>
                <Avatar name={c.name} hue={c.hue} className="size-12 text-lg" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-1 truncate font-semibold">{c.name}{c.verified && <BadgeCheck className="size-4 shrink-0 text-accent-text" aria-label="Verified" />}</span><span className="shrink-0 text-xs text-muted">{c.when}</span></p>
                  <p className={`truncate text-sm ${c.unread ? "font-semibold" : "text-muted"}`}>{c.last}</p>
                </div>
                {c.unread > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-ink">{c.unread}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <section className={`${id ? "block" : "hidden"} h-[calc(100dvh-4rem)] pb-24 lg:block lg:pb-0`}>
        {id ? <Thread id={id} /> : (
          <div className="grid h-full place-items-center p-8 text-center text-muted"><div><MessageCircle className="mx-auto size-10" aria-hidden="true" /><p className="mt-2 font-semibold text-ink">Pick a conversation</p><p>Or message a business from any place's page.</p></div></div>
        )}
      </section>
    </div>
  );
}

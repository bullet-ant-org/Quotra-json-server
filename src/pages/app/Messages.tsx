import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3, Camera, Check, ImagePlus, MapPin, Mic, Plus, Search, Send, Square, UserPlus, Users, X } from "lucide-react";
import { actions, ago, LIVE, person, useStore, type Chat, type ChatMsg, type State } from "../../lib/store";
import { fileToMedia } from "../../lib/media";
import { destinations, destPhoto } from "../../fixtures/destinations";
import { Sheet } from "../../components/Sheet";
import MessagesLive from "./MessagesLive";
import { useTitle } from "../../lib/useTitle";

const title = (s: State, c: Chat) => (c.group ? c.name! : person(s, c.members.find((m) => m !== s.me)!).name);
const pic = (s: State, c: Chat) => person(s, c.members.find((m) => m !== s.me)!).avatar;
const preview = (m?: ChatMsg) => !m ? "" : m.kind === "text" ? m.text : { image: "📷 Photo", video: "🎬 Video", audio: "🎤 Voice note", location: "📍 Location", poll: "📊 Poll", post: "Shared a post", text: "" }[m.kind];

function Bubble({ m, chat }: { m: ChatMsg; chat: Chat }) {
  const s = useStore((x) => x);
  const mine = m.from === s.me;
  const d = m.place ? destinations.find((x) => x.slug === m.place) : undefined;
  const post = m.postId ? s.posts.find((p) => p.id === m.postId) : undefined;
  const box = `max-w-[78%] overflow-hidden rounded-3xl ${mine ? "rounded-br-lg bg-accent text-accent-ink" : "rounded-bl-lg bg-surface"}`;
  let body;
  if (m.kind === "image") body = <img src={m.src} alt="" className="max-h-80 w-full object-cover" />;
  else if (m.kind === "video") body = <video src={m.src} controls className="max-h-80 w-full" />;
  else if (m.kind === "audio") body = <audio src={m.src} controls className="m-2 h-10 w-60" />;
  else if (m.kind === "location" && d) body = <Link to={`/map?to=${d.slug}`} className="block w-64"><img src={destPhoto(d.slug, 400)} alt="" className="h-28 w-full object-cover" /><span className="block p-3"><b className="block">{d.name}</b><span className="text-xs opacity-80">📍 {d.city} · tap for directions</span></span></Link>;
  else if (m.kind === "post" && post) body = <span className="block w-60"><img src={post.media[0]?.src} alt="" className="h-40 w-full object-cover" /><span className="block p-3 text-sm"><b>@{person(s, post.authorId).username}</b> {post.text.slice(0, 60)}</span></span>;
  else if (m.kind === "poll" && m.poll) {
    const total = m.poll.options.reduce((n, o) => n + o.votes.length, 0) || 1;
    body = <div className="w-72 space-y-2 p-3 text-ink"><p className="flex items-center gap-1.5 font-bold"><BarChart3 className="size-4" />{m.poll.question}</p>{m.poll.options.map((o, i) => { const on = o.votes.includes(s.me); return (
      <button key={i} onClick={() => actions.vote(chat.id, m.id, i)} className={`relative w-full overflow-hidden rounded-xl border-2 p-2.5 text-left text-sm ${on ? "border-accent" : "border-line"} bg-bg`}>
        <span className="absolute inset-y-0 left-0 bg-accent-soft" style={{ width: `${(o.votes.length / total) * 100}%` }} />
        <span className="relative flex items-center justify-between gap-2"><span className="truncate font-semibold">{o.place && "📍 "}{o.label}</span><span className="text-xs font-bold">{o.votes.length}{on && <Check className="ml-1 inline size-3.5" />}</span></span>
      </button>); })}</div>;
  } else body = <p className="px-4 py-2.5">{m.text}</p>;
  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : ""}`}>
      {!mine && chat.group && <img src={person(s, m.from).avatar} alt="" className="size-7 rounded-full object-cover" />}
      <div className={m.kind === "poll" ? "max-w-[85%] rounded-3xl bg-surface" : box}>{chat.group && !mine && <p className="px-4 pt-2 text-xs font-bold opacity-70">{person(s, m.from).username}</p>}{body}</div>
    </div>
  );
}

function PollBuilder({ onSend, onClose }: { onSend: (p: NonNullable<ChatMsg["poll"]>) => void; onClose: () => void }) {
  const [q, setQ] = useState("Where should we go?");
  const [opts, setOpts] = useState<{ label: string; place?: string }[]>([]);
  const [text, setText] = useState("");
  const [placeMode, setPlaceMode] = useState(false);
  const found = destinations.filter((d) => d.name.toLowerCase().includes(text.toLowerCase())).slice(0, 6);
  return (
    <Sheet title="New poll" onClose={onClose}>
      <div className="space-y-3 p-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Question" className="w-full rounded-xl bg-surface px-4 py-3 font-semibold outline-none" />
        <ul className="space-y-1.5">{opts.map((o, i) => <li key={i} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm"><span className="flex-1">{o.place && "📍 "}{o.label}</span><button onClick={() => setOpts(opts.filter((_, k) => k !== i))} aria-label="Remove"><X className="size-4" /></button></li>)}</ul>
        <div className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1 text-sm font-bold">
          <button onClick={() => setPlaceMode(false)} className={`rounded-full py-2 ${!placeMode ? "bg-bg shadow-sm" : "text-muted"}`}>Text option</button>
          <button onClick={() => setPlaceMode(true)} className={`rounded-full py-2 ${placeMode ? "bg-bg shadow-sm" : "text-muted"}`}>📍 Location</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!placeMode && text.trim()) { setOpts([...opts, { label: text.trim() }]); setText(""); } }} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeMode ? "Search places" : "Add an option"} className="min-w-0 flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-accent" />
          {!placeMode && <button className="rounded-xl bg-surface px-4 text-sm font-bold">Add</button>}
        </form>
        {placeMode && <ul className="max-h-56 overflow-y-auto">{found.map((d) => <li key={d.slug}><button onClick={() => { setOpts([...opts, { label: d.name, place: d.slug }]); setText(""); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface"><img src={destPhoto(d.slug, 120)} alt="" className="size-10 rounded-lg object-cover" /><span className="text-sm"><b className="block">{d.name}</b><span className="text-muted">{d.city}</span></span><Plus className="ml-auto size-4" /></button></li>)}</ul>}
        <button disabled={opts.length < 2 || !q.trim()} onClick={() => onSend({ question: q.trim(), options: opts.map((o) => ({ ...o, votes: [] })) })} className="w-full rounded-full bg-accent py-3 font-bold text-accent-ink disabled:opacity-40">Send poll</button>
      </div>
    </Sheet>
  );
}

function Thread({ chat }: { chat: Chat }) {
  const s = useStore((x) => x);
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState<null | "poll" | "place">(null);
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [q, setQ] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [chat.messages.length]);
  const send = (m: Omit<ChatMsg, "id" | "from" | "at">) => actions.sendMessage(chat.id, m);
  const submit = (e: FormEvent) => { e.preventDefault(); if (text.trim()) { send({ kind: "text", text: text.trim() }); setText(""); } };
  const record = async () => {
    if (rec) { rec.stop(); setRec(null); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream); const parts: Blob[] = [];
      r.ondataavailable = (e) => parts.push(e.data);
      r.onstop = () => { stream.getTracks().forEach((t) => t.stop()); const fr = new FileReader(); fr.onload = () => send({ kind: "audio", src: String(fr.result) }); fr.readAsDataURL(new Blob(parts, { type: r.mimeType })); };
      r.start(); setRec(r);
    } catch { alert("Allow microphone access to send voice notes."); }
  };
  const item = "flex flex-col items-center gap-1.5 text-xs font-semibold";
  const circle = "grid size-14 place-items-center rounded-2xl text-white";

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5">
        <Link to="/messages" className="grid size-9 place-items-center rounded-full hover:bg-surface lg:hidden" aria-label="Back"><ArrowLeft className="size-5" /></Link>
        {chat.group ? <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-ink"><Users className="size-5" /></span> : <img src={pic(s, chat)} alt="" className="size-10 rounded-full object-cover" />}
        <div className="min-w-0"><p className="truncate font-semibold">{title(s, chat)}</p><p className="truncate text-xs text-muted">{chat.group ? `${chat.members.length} members` : `@${person(s, chat.members.find((m) => m !== s.me)!).username}`}</p></div>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-4">{chat.messages.map((m) => <Bubble key={m.id} m={m} chat={chat} />)}<div ref={end} /></div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line p-2.5">
        <button type="button" onClick={() => setMenu(true)} className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink" aria-label="Attachments"><Plus className="size-5" /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={rec ? "Recording… tap stop to send" : "Message…"} disabled={!!rec} aria-label="Message" className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent" />
        {text.trim() ? <button className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink" aria-label="Send"><Send className="size-4" /></button>
          : <button type="button" onClick={record} className={`grid size-10 shrink-0 place-items-center rounded-full ${rec ? "animate-pulse bg-red-500 text-white" : "bg-surface"}`} aria-label={rec ? "Stop and send voice note" : "Record voice note"}>{rec ? <Square className="size-4 fill-white" /> : <Mic className="size-5" />}</button>}
      </form>
      <input ref={file} type="file" accept="image/*,video/*" multiple hidden onChange={async (e) => { for (const f of [...(e.target.files ?? [])]) { const m = await fileToMedia(f); send({ kind: m.type, src: m.src }); } e.target.value = ""; }} />
      {menu && <Sheet title="Share" onClose={() => setMenu(false)}><div className="grid grid-cols-4 gap-4 p-5">
        <button className={item} onClick={() => { setMenu(false); file.current?.click(); }}><span className={`${circle} bg-violet-500`}><ImagePlus /></span>Gallery</button>
        <button className={item} onClick={() => { setMenu(false); file.current?.setAttribute("capture", "environment"); file.current?.click(); }}><span className={`${circle} bg-pink-500`}><Camera /></span>Camera</button>
        <button className={item} onClick={() => { setMenu(false); setSheet("place"); }}><span className={`${circle} bg-emerald-500`}><MapPin /></span>Location</button>
        <button className={item} onClick={() => { setMenu(false); setSheet("poll"); }}><span className={`${circle} bg-accent`}><BarChart3 /></span>Poll</button>
      </div></Sheet>}
      {sheet === "poll" && <PollBuilder onClose={() => setSheet(null)} onSend={(poll) => { send({ kind: "poll", poll }); setSheet(null); }} />}
      {sheet === "place" && <Sheet title="Send a location" onClose={() => setSheet(null)}><div className="p-4">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search places" className="mb-3 w-full rounded-xl bg-surface px-4 py-2.5 text-sm outline-none" />
        <ul>{destinations.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())).map((d) => <li key={d.slug}><button onClick={() => { send({ kind: "location", place: d.slug }); setSheet(null); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface"><img src={destPhoto(d.slug, 120)} alt="" className="size-11 rounded-lg object-cover" /><span className="text-sm"><b className="block">{d.name}</b><span className="text-muted">{d.city}</span></span></button></li>)}</ul>
      </div></Sheet>}
    </div>
  );
}

function NewChat({ onClose }: { onClose: () => void }) {
  const s = useStore((x) => x);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState(false);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const people = s.people.filter((p) => p.id !== s.me && !s.blocked.includes(p.id) && `${p.name} ${p.username}`.toLowerCase().includes(q.replace("@", "").toLowerCase()));
  return (
    <Sheet title={group ? "New group" : "New message"} onClose={onClose} tall>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1 text-sm font-bold">
          <button onClick={() => setGroup(false)} className={`rounded-full py-2 ${!group ? "bg-bg shadow-sm" : "text-muted"}`}><UserPlus className="mr-1 inline size-4" />Person</button>
          <button onClick={() => setGroup(true)} className={`rounded-full py-2 ${group ? "bg-bg shadow-sm" : "text-muted"}`}><Users className="mr-1 inline size-4" />Group</button>
        </div>
        {group && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="w-full rounded-xl bg-surface px-4 py-2.5 outline-none" />}
        <label className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5"><Search className="size-4 text-muted" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or @username" className="flex-1 bg-transparent text-sm outline-none" /></label>
        <ul>{people.map((p) => { const on = picked.includes(p.id); return (
          <li key={p.id}><button onClick={() => { if (!group) { onClose(); nav(`/messages/${actions.openChat(p.id)}`); } else setPicked(on ? picked.filter((x) => x !== p.id) : [...picked, p.id]); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface">
            <img src={p.avatar} alt="" className="size-11 rounded-full object-cover" /><span className="flex-1"><b className="block text-sm">{p.name}</b><span className="text-sm text-muted">@{p.username}</span></span>
            {group && <span className={`grid size-6 place-items-center rounded-full border-2 ${on ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>{on && <Check className="size-3.5" />}</span>}
          </button></li>
        ); })}{!people.length && <li className="p-6 text-center text-sm text-muted">No one found with that username.</li>}</ul>
        {group && <button disabled={!name.trim() || picked.length < 2} onClick={() => { onClose(); nav(`/messages/${actions.createGroup(name.trim(), picked)}`); }} className="w-full rounded-full bg-accent py-3 font-bold text-accent-ink disabled:opacity-40">Create group ({picked.length})</button>}
      </div>
    </Sheet>
  );
}

export default function Messages() {
  useTitle("Messages");
  const { id } = useParams();
  const s = useStore((x) => x);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "groups">("all");
  const [newChat, setNewChat] = useState(false);
  if (LIVE) return <MessagesLive />;
  const chats = (s.chats ?? []).filter((c) => (tab === "all" || c.group) && title(s, c).toLowerCase().includes(q.toLowerCase())).sort((a, b) => (b.messages.at(-1)?.at ?? 0) - (a.messages.at(-1)?.at ?? 0));
  const active = s.chats?.find((c) => c.id === id);
  return (
    <div className="mx-auto grid h-[calc(100dvh-4rem)] max-w-6xl lg:grid-cols-[22rem_1fr] lg:border-x lg:border-line">
      <aside className={`${id ? "hidden" : "flex"} flex-col overflow-hidden pb-24 lg:flex lg:border-r lg:border-line lg:pb-0`}>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Messages</h1><button onClick={() => setNewChat(true)} className="grid size-10 place-items-center rounded-full bg-accent text-accent-ink" aria-label="New message"><UserPlus className="size-5" /></button></div>
          <label className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5"><Search className="size-4 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search chats" className="flex-1 bg-transparent text-sm outline-none" /></label>
          <div className="flex gap-2">{(["all", "groups"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${tab === t ? "bg-ink text-bg" : "bg-surface"}`}>{t}</button>)}</div>
        </div>
        <ul className="flex-1 overflow-y-auto">{chats.map((c) => { const last = c.messages.at(-1); return (
          <li key={c.id}><Link to={`/messages/${c.id}`} className={`flex items-center gap-3 px-4 py-3 hover:bg-surface ${id === c.id ? "bg-accent-soft" : ""}`}>
            {c.group ? <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-ink"><Users className="size-5" /></span> : <img src={pic(s, c)} alt="" className="size-12 shrink-0 rounded-full object-cover" />}
            <span className="min-w-0 flex-1"><span className="flex justify-between gap-2"><b className="truncate">{title(s, c)}</b><span className="shrink-0 text-xs text-muted">{last ? ago(last.at) : ""}</span></span><span className="block truncate text-sm text-muted">{last?.from === s.me ? "You: " : ""}{preview(last)}</span></span>
          </Link></li>
        ); })}</ul>
      </aside>
      <section className={`${id ? "block" : "hidden"} h-[calc(100dvh-4rem)] pb-[4.5rem] lg:block lg:pb-0`}>
        {active ? <Thread chat={active} /> : <div className="grid h-full place-items-center p-8 text-center text-muted"><div><Send className="mx-auto size-10" /><p className="mt-2 font-semibold text-ink">Your messages</p><p>Plan your next outing with friends.</p><button onClick={() => setNewChat(true)} className="mt-3 rounded-full bg-accent px-5 py-2 font-bold text-accent-ink">Send message</button></div></div>}
      </section>
      {newChat && <NewChat onClose={() => setNewChat(false)} />}
    </div>
  );
}

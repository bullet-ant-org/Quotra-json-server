import { useState } from "react";
import { CircleCheck, CirclePlus, Link2, Repeat2, Search, Share } from "lucide-react";
import { actions, person, useStore, type ChatMsg } from "../../lib/store";
import { Sheet } from "../Sheet";

// What's being shared: a post, a place, or a story image.
export type ShareItem = { kind: "post"; postId: string; image?: string } | { kind: "place"; place: string; image?: string } | { kind: "image"; image: string };

export function ShareSheet({ item, onClose }: { item: ShareItem; onClose: () => void }) {
  const s = useStore((x) => x);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const chats = (s.chats ?? []).filter((c) => (c.group ? c.name ?? "" : person(s, c.members.find((m) => m !== s.me)!).name).toLowerCase().includes(q.toLowerCase()));
  const label = (c: (typeof chats)[number]) => (c.group ? c.name! : person(s, c.members.find((m) => m !== s.me)!).username);
  const avatar = (c: (typeof chats)[number]) => person(s, c.members.find((m) => m !== s.me)!).avatar;
  const url = `${location.origin}${item.kind === "place" ? `/destinations/${item.place}` : "/home"}`;
  const payload: Omit<ChatMsg, "id" | "from" | "at"> = item.kind === "post" ? { kind: "post", postId: item.postId } : item.kind === "place" ? { kind: "location", place: item.place } : { kind: "image", src: item.image };
  const flash = (m: string) => { if (item.kind === "post") actions.shared(item.postId); setDone(m); setTimeout(onClose, 900); };
  const action = "flex flex-col items-center gap-1.5 text-xs font-semibold";
  const circle = "grid size-14 place-items-center rounded-full bg-surface";

  return (
    <Sheet title="Share" onClose={onClose}>
      <div className="p-4">
        <label className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5"><Search className="size-4 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search chats" className="flex-1 bg-transparent text-sm outline-none" /></label>
        <ul className="mt-4 grid grid-cols-4 gap-y-4">
          {chats.map((c) => { const on = picked.includes(c.id); return (
            <li key={c.id}><button onClick={() => setPicked((p) => (on ? p.filter((x) => x !== c.id) : [...p, c.id]))} className="flex w-full flex-col items-center gap-1.5 text-xs">
              <span className="relative"><img src={avatar(c)} alt="" className="size-14 rounded-full object-cover" />{on && <CircleCheck className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full bg-bg fill-accent text-bg" />}</span>
              <span className="w-full truncate text-center">{label(c)}</span></button></li>
          ); })}
        </ul>
      </div>
      {picked.length > 0 ? (
        <div className="space-y-2 border-t border-line p-4">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a message…" className="w-full rounded-xl bg-surface px-4 py-2.5 text-sm outline-none" />
          <button onClick={() => { actions.shareTo(picked, payload); if (note.trim()) actions.shareTo(picked, { kind: "text", text: note.trim() }); flash(`Sent to ${picked.length}`); }} className="w-full rounded-xl bg-accent py-3 font-bold text-accent-ink">Send{picked.length > 1 ? " separately" : ""}</button>
        </div>
      ) : (
        <div className="no-scrollbar flex justify-around gap-4 overflow-x-auto border-t border-line px-4 py-4">
          {item.image && <button className={action} onClick={() => { actions.addStory(item.image!); flash("Added to your story"); }}><span className={circle}><CirclePlus className="size-6" /></span>Add to story</button>}
          {item.kind === "post" && <button className={action} onClick={() => { actions.repost(item.postId); flash("Reposted to your timeline"); }}><span className={circle}><Repeat2 className="size-6" /></span>Repost</button>}
          <button className={action} onClick={() => { navigator.clipboard?.writeText(url).catch(() => {}); flash("Link copied"); }}><span className={circle}><Link2 className="size-6" /></span>Copy link</button>
          <button className={action} onClick={async () => { try { await navigator.share?.({ url }); } catch { /* cancelled */ } }}><span className={circle}><Share className="size-6" /></span>More</button>
          <a className={action} href={`https://wa.me/?text=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"><span className={`${circle} bg-[#25D366] text-white`}>W</span>WhatsApp</a>
        </div>
      )}
      {done && <p role="status" className="pb-4 text-center text-sm font-bold text-accent-text">{done} ✓</p>}
    </Sheet>
  );
}

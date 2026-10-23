import { useScrollLock } from "../../lib/useScrollLock";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AtSign, CalendarPlus, Hash, ImagePlus, Loader2, MapPin, Search, Video, X } from "lucide-react";
import { actions, person, useStore, type Media } from "../../lib/store";
import { fileToMedia } from "../../lib/media";
import { destinations, destPhoto } from "../../fixtures/destinations";

type Panel = null | "place" | "people";

function Modal({ onClose, autoPick, initialPlace }: { onClose: () => void; autoPick: boolean; initialPlace?: string }) {
  useScrollLock();
  const people = useStore((s) => s.people.filter((p) => p.id !== s.me));
  const me = useStore((s) => person(s, s.me));
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [place, setPlace] = useState<string | undefined>(initialPlace);
  const [tags, setTags] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [q, setQ] = useState("");
  const [party, setParty] = useState(false);
  const [pdate, setPdate] = useState(new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10));
  const [pmax, setPmax] = useState(6);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const picked = useRef(false);
  const hashtags = useMemo(() => [...new Set(text.match(/#\w+/g) ?? [])], [text]);
  const can = (text.trim() || media.length) && !busy;

  const add = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const out = await Promise.all([...files].slice(0, 20).map((f) => fileToMedia(f).catch(() => null)));
    setMedia((m) => [...m, ...(out.filter(Boolean) as Media[])]);
    setBusy(false);
  };
  const submit = () => {
    actions.addPost({ text: text.trim(), media, place, tags, party: party && place ? { date: pdate, max: pmax, going: [] } : undefined });
    onClose();
  };
  const placeList = destinations.filter((d) => `${d.name} ${d.city}`.toLowerCase().includes(q.toLowerCase()));
  const peopleList = people.filter((p) => `${p.name} ${p.username}`.toLowerCase().includes(q.toLowerCase()));
  const chip = "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors";

  return createPortal(
    <div className="vv-fill z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Create post" onClick={(e) => e.stopPropagation()} className="flex max-h-[min(94dvh,var(--vvh,100dvh))] w-full max-w-xl flex-col overflow-hidden rounded-t-[1.75rem] bg-bg shadow-2xl sm:rounded-[1.75rem]">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-surface" aria-label="Close"><X className="size-5" /></button>
          <h2 className="font-display text-lg font-bold">New post</h2>
          <button onClick={submit} disabled={!can} className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-ink disabled:opacity-40">Post</button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex gap-3">
            <img src={me.avatar} alt="" className="size-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{me.name}</p>
              <p className="flex flex-wrap gap-x-2 text-sm text-muted">
                {place && <span className="text-accent-text">at {destinations.find((d) => d.slug === place)?.name}</span>}
                {tags.length > 0 && <span>with {tags.map((t) => person({ people } as never, t).name.split(" ")[0]).join(", ")}</span>}
              </p>
            </div>
          </div>
          <label htmlFor="post-text" className="sr-only">Write something</label>
          <textarea id="post-text" autoFocus={!autoPick} value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Where did you go? Add #hashtags if you like" className="mt-3 w-full resize-none bg-transparent text-lg outline-none placeholder:text-muted" />
          {hashtags.length > 0 && <p className="mb-2 flex flex-wrap gap-1.5">{hashtags.map((h) => <span key={h} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent-text">{h}</span>)}</p>}

          {media.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {media.map((m, i) => (
                <li key={i} className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                  {m.type === "video" ? <video src={m.src} className="size-full object-cover" muted /> : <img src={m.src} alt="" className="size-full object-cover" />}
                  <button onClick={() => setMedia((x) => x.filter((_, n) => n !== i))} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white" aria-label="Remove"><X className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => file.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-6 font-semibold text-muted hover:border-accent hover:text-accent-text">
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}{media.length ? "Add more photos or videos" : "Add photos or videos"}
          </button>
          <input ref={file} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }}
            onFocus={() => { if (autoPick && !picked.current) picked.current = true; }} />

          {party && place && (
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-accent-soft p-4 text-sm">
              <p className="col-span-2 font-bold text-accent-text">Going party: others can join you</p>
              <label className="space-y-1"><span className="font-semibold">Date</span><input type="date" value={pdate} onChange={(e) => setPdate(e.target.value)} className="w-full rounded-xl bg-bg px-3 py-2" /></label>
              <label className="space-y-1"><span className="font-semibold">Spots</span><input type="number" min={1} max={50} value={pmax} onChange={(e) => setPmax(+e.target.value || 1)} className="w-full rounded-xl bg-bg px-3 py-2" /></label>
            </div>
          )}

          {panel && (
            <div className="mt-4 rounded-2xl border border-line">
              <label className="flex items-center gap-2 border-b border-line px-4 py-3"><Search className="size-4 text-muted" /><span className="sr-only">Search</span>
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={panel === "place" ? "Search places" : "Search people"} className="flex-1 bg-transparent outline-none" />
                <button onClick={() => { setPanel(null); setQ(""); }} className="text-sm font-semibold text-accent-text">Done</button></label>
              <ul className="max-h-60 overflow-y-auto py-1">
                {panel === "place" && placeList.map((d) => (
                  <li key={d.slug}><button onClick={() => { setPlace(d.slug); setPanel(null); setQ(""); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface">
                    <img src={destPhoto(d.slug, 120)} alt="" className="size-10 rounded-lg object-cover" /><span><span className="block font-semibold">{d.name}</span><span className="text-sm text-muted">{d.city}, {d.state}</span></span></button></li>
                ))}
                {panel === "people" && peopleList.map((p) => { const on = tags.includes(p.id); return (
                  <li key={p.id}><button onClick={() => setTags((t) => on ? t.filter((x) => x !== p.id) : [...t, p.id])} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface">
                    <img src={p.avatar} alt="" className="size-10 rounded-full object-cover" /><span className="flex-1"><span className="block font-semibold">{p.name}</span><span className="text-sm text-muted">@{p.username}</span></span>
                    <span className={`grid size-6 place-items-center rounded-full border-2 ${on ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>{on && "✓"}</span></button></li>
                ); })}
              </ul>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
          <button onClick={() => setPanel(panel === "place" ? null : "place")} className={`${chip} ${place ? "bg-accent text-accent-ink" : "bg-surface"}`}><MapPin className="size-4" />{place ? "Location tagged" : "Tag location"}</button>
          <button onClick={() => setPanel(panel === "people" ? null : "people")} className={`${chip} ${tags.length ? "bg-accent text-accent-ink" : "bg-surface"}`}><AtSign className="size-4" />{tags.length ? `${tags.length} tagged` : "Tag people"}</button>
          <button onClick={() => setText((t) => (t && !t.endsWith(" ") ? t + " #" : t + "#"))} className={`${chip} bg-surface`}><Hash className="size-4" />Hashtag</button>
          <button onClick={() => { if (!place) setPanel("place"); setParty((p) => !p); }} className={`${chip} ${party ? "bg-accent text-accent-ink" : "bg-surface"}`}><CalendarPlus className="size-4" />Going party</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

export function Composer() {
  const me = useStore((s) => person(s, s.me));
  const initialPlace = new URLSearchParams(location.search).get("post") ?? undefined;
  const [open, setOpen] = useState<null | "text" | "media">(initialPlace ? "media" : null);
  return (
    <div className="py-1">
      <div className="flex items-center gap-3">
        <Link to="/profile" aria-label="Your profile"><img src={me.avatar} alt="" className="size-11 rounded-full object-cover ring-2 ring-accent/30" /></Link>
        <button onClick={() => setOpen("text")} className="min-w-0 flex-1 truncate rounded-full bg-surface px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-2">Where did you go?</button>
        <button onClick={() => setOpen("media")} className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent-text hover:bg-accent hover:text-accent-ink" aria-label="Add photos or video"><ImagePlus className="size-5" /></button>
      </div>
      <div className="mt-2 hidden gap-1 sm:flex">
        {[[ImagePlus, "Photo"], [Video, "Video"], [MapPin, "Check in"], [CalendarPlus, "Going party"]].map(([I, l]) => {
          const Icon = I as typeof ImagePlus;
          return <button key={l as string} onClick={() => setOpen("media")} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-muted hover:bg-surface"><Icon className="size-5 text-accent" />{l as string}</button>;
        })}
      </div>
      {open && <Modal autoPick={open === "media"} initialPlace={initialPlace} onClose={() => { setOpen(null); if (initialPlace) history.replaceState(null, "", "/home"); }} />}
    </div>
  );
}

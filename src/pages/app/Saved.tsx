import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useStore, type Media } from "../../lib/store";
import { MediaBadge } from "../../components/feed/MediaGrid";
import { Lightbox } from "../../components/feed/Lightbox";
import { useTitle } from "../../lib/useTitle";

export default function Saved() {
  useTitle("Saved");
  const s = useStore((x) => x);
  const posts = s.posts.filter((p) => s.saved?.includes(p.id) && p.media.length);
  const [view, setView] = useState<{ media: Media[]; id: string } | null>(null);
  return (
    <div className="mx-auto max-w-4xl pb-10 pt-6">
      <h1 className="px-4 text-3xl font-extrabold sm:px-6">Saved</h1>
      {posts.length ? <ul className="mt-4 grid grid-cols-3 gap-0.5">{posts.map((p) => (
        <li key={p.id} className="relative aspect-square overflow-hidden bg-surface"><button onClick={() => setView({ media: p.media, id: p.id })} className="size-full"><img src={p.media[0].src} alt="" className="size-full object-cover" /><MediaBadge media={p.media} /></button></li>
      ))}</ul> : <div className="mt-16 text-center text-muted"><Bookmark className="mx-auto size-10" /><p className="mt-2 font-semibold text-ink">Nothing saved yet</p><p>Tap the bookmark on any post to keep it here.</p></div>}
      {view && <Lightbox media={view.media} start={0} postId={view.id} onClose={() => setView(null)} />}
    </div>
  );
}

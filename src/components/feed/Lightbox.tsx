import { vsrc } from "../../lib/media";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, X } from "lucide-react";
import { actions, ago, person, useStore, type Media , commentCount } from "../../lib/store";
import { useScrollLock } from "../../lib/useScrollLock";
import { CommentsList, CommentsSheet } from "./CommentsSheet";
import { ShareSheet } from "./ShareSheet";

// Full-screen media viewer. With a postId it becomes an Instagram-style post view.
export function Lightbox({ media, start, onClose, postId }: { media: Media[]; start: number; onClose: () => void; postId?: string }) {
  useScrollLock();
  const s = useStore((x) => x);
  const post = postId ? s.posts.find((p) => p.id === postId) : undefined;
  const a = post ? person(s, post.authorId) : undefined;
  const [i, setI] = useState(start);
  const [sheet, setSheet] = useState<null | "comments" | "share">(null);
  const go = (n: number) => setI((x) => (x + n + media.length) % media.length);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const m = media[i];
  const liked = post?.likes.includes(s.me);
  const saved = post && s.saved?.includes(post.id);
  let x0 = 0;
  const icon = "grid size-10 place-items-center";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Post" className="fixed inset-0 z-[80] flex bg-black text-white" style={{ touchAction: "none" }}>
      <div className="relative flex min-w-0 flex-1 flex-col" onTouchStart={(e) => (x0 = e.touches[0].clientX)} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
        {m.type === "image" && <img src={m.src} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-2xl" />}
        <header className="relative z-10 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent p-3">
          {a && <><img src={a.avatar} alt="" className="size-9 rounded-full object-cover ring-2 ring-white/60" /><div className="min-w-0 flex-1 leading-tight"><p className="truncate font-semibold">{a.username}</p>{post && <p className="text-xs opacity-75">{ago(post.at)} ago</p>}</div></>}
          {!a && <span className="flex-1 text-sm font-semibold">{i + 1} / {media.length}</span>}
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur" aria-label="Close"><X className="size-5" /></button>
        </header>
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          {m.type === "video" ? <video key={m.src} src={vsrc(m.src)} preload="metadata" controls autoPlay playsInline className="max-h-full max-w-full" /> : <img key={m.src} src={m.src} alt="" className="max-h-full max-w-full object-contain" />}
          {media.length > 1 && <>
            <button onClick={() => go(-1)} className="absolute left-3 hidden size-10 place-items-center rounded-full bg-white/80 text-black sm:grid" aria-label="Previous"><ChevronLeft /></button>
            <button onClick={() => go(1)} className="absolute right-3 hidden size-10 place-items-center rounded-full bg-white/80 text-black sm:grid" aria-label="Next"><ChevronRight /></button>
            <div className="absolute bottom-3 flex gap-1">{media.map((_, k) => <span key={k} className={`size-1.5 rounded-full ${k === i ? "bg-white" : "bg-white/40"}`} />)}</div>
          </>}
        </div>
        {post && (
          <footer className="relative z-10 bg-gradient-to-t from-black/80 to-transparent px-3 pb-5 pt-6 lg:hidden">
            <div className="flex items-center">
              <button onClick={() => actions.toggleLike(post.id)} className={icon} aria-label="Like"><Heart className={`size-7 ${liked ? "fill-red-500 text-red-500" : ""}`} /></button>
              <button onClick={() => setSheet("comments")} className={icon} aria-label="Comments"><MessageCircle className="size-7 -scale-x-100" /></button>
              <button onClick={() => setSheet("share")} className={icon} aria-label="Share"><Send className="size-6" /></button>
              <button onClick={() => actions.toggleSave(post.id)} className={`${icon} ml-auto`} aria-label="Save"><Bookmark className={`size-6 ${saved ? "fill-white" : ""}`} /></button>
            </div>
            <p className="px-1 text-sm font-semibold">{post.likes.length} likes</p>
            {post.text && <p className="line-clamp-2 px-1 text-sm"><b>{a!.username}</b> {post.text}</p>}
            <button onClick={() => setSheet("comments")} className="px-1 text-sm opacity-75">{commentCount(post) ? `View all ${commentCount(post)} comments` : "Add a comment…"}</button>
          </footer>
        )}
      </div>
      {post && (
        <aside className="hidden w-[24rem] shrink-0 flex-col bg-bg text-ink lg:flex">
          <div className="flex items-center gap-3 border-b border-line p-3"><img src={a!.avatar} alt="" className="size-9 rounded-full object-cover" /><b className="flex-1">{a!.username}</b></div>
          <div className="min-h-0 flex-1"><CommentsList postId={post.id} /></div>
          <div className="flex items-center border-t border-line px-2 py-1">
            <button onClick={() => actions.toggleLike(post.id)} className={icon} aria-label="Like"><Heart className={`size-6 ${liked ? "fill-red-500 text-red-500" : ""}`} /></button>
            <button onClick={() => setSheet("share")} className={icon} aria-label="Share"><Send className="size-5" /></button>
            <span className="text-sm font-semibold">{post.likes.length} likes</span>
            <button onClick={() => actions.toggleSave(post.id)} className={`${icon} ml-auto`} aria-label="Save"><Bookmark className={`size-5 ${saved ? "fill-ink" : ""}`} /></button>
          </div>
        </aside>
      )}
      {sheet === "comments" && post && <CommentsSheet postId={post.id} onClose={() => setSheet(null)} />}
      {sheet === "share" && post && <ShareSheet item={{ kind: "post", postId: post.id, image: m.type === "image" ? m.src : undefined }} onClose={() => setSheet(null)} />}
    </div>,
    document.body,
  );
}

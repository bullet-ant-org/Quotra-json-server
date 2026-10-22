import { useState, type FormEvent } from "react";
import { Heart, Send } from "lucide-react";
import { actions, ago, person, useStore } from "../../lib/store";
import { Sheet } from "../Sheet";

const quick = ["❤️", "🙌", "🔥", "👏", "😍", "😂", "🌴", "📍"];

export function CommentsList({ postId, autoFocus = false }: { postId: string; autoFocus?: boolean }) {
  const s = useStore((x) => x);
  const post = s.posts.find((p) => p.id === postId);
  const [text, setText] = useState("");
  if (!post) return null;
  const send = (e?: FormEvent) => { e?.preventDefault(); if (text.trim()) { actions.comment(post.id, text.trim()); setText(""); } };
  const a = person(s, post.authorId);
  return (
    <div className="flex h-full flex-col">
      <ul className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
        {post.text && <li className="flex gap-3 border-b border-line pb-4"><img src={a.avatar} alt="" className="size-9 rounded-full object-cover" /><p className="text-sm"><b>{a.username}</b> {post.text}<span className="mt-1 block text-xs text-muted">{ago(post.at)}</span></p></li>}
        {post.comments.map((c) => { const ca = person(s, c.authorId); const liked = c.likes?.includes(s.me); return (
          <li key={c.id} className="flex gap-3">
            <img src={ca.avatar} alt="" className="size-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1 text-sm"><p><b>{ca.username}</b> <span className="text-xs text-muted">{ago(c.at)}</span></p><p>{c.text}</p>
              <button onClick={() => setText(`@${ca.username} `)} className="mt-1 text-xs font-semibold text-muted">Reply</button></div>
            <button onClick={() => actions.likeComment(post.id, c.id)} className="flex flex-col items-center text-[11px] text-muted" aria-label="Like comment"><Heart className={`size-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />{c.likes?.length || ""}</button>
          </li>
        ); })}
        {!post.comments.length && <li className="py-10 text-center"><p className="font-display text-lg font-bold">No comments yet</p><p className="text-sm text-muted">Start the conversation.</p></li>}
      </ul>
      <div className="border-t border-line bg-bg p-3">
        <div className="mb-2 flex justify-between px-1 text-2xl">{quick.map((q) => <button key={q} onClick={() => setText((t) => t + q)} aria-label={`Add ${q}`}>{q}</button>)}</div>
        <form onSubmit={send} className="flex items-center gap-2">
          <img src={person(s, s.me).avatar} alt="" className="size-9 rounded-full object-cover" />
          <input autoFocus={autoFocus} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Add a comment for ${a.username}…`} aria-label="Add a comment" className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-accent" />
          <button disabled={!text.trim()} className="grid size-10 place-items-center rounded-full bg-accent text-accent-ink disabled:opacity-40" aria-label="Post comment"><Send className="size-4" /></button>
        </form>
      </div>
    </div>
  );
}

export const CommentsSheet = ({ postId, onClose }: { postId: string; onClose: () => void }) => (
  <Sheet title="Comments" onClose={onClose} tall><CommentsList postId={postId} autoFocus /></Sheet>
);

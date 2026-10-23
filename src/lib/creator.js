// Creator rewards: pays authors tokens as their posts cross view/like/comment milestones.
// `rewarded` stores the milestones already paid, so each run only pays the difference (idempotent refs).
import { Post } from "../models/index.js";
import { getSettings } from "./settings.js";
import { moveTokens, tx } from "./ledger.js";

export async function payCreators() {
  const { creator: c } = await getSettings();
  const since = new Date(Date.now() - 30 * 864e5);
  const posts = await Post.find({ removed: false, createdAt: { $gt: since }, $or: [{ views: { $gte: 1000 } }, { "likes.999": { $exists: true } }, { commentCount: { $gte: 100 } }] }).select("author views likes commentCount rewarded").lean();
  for (const p of posts) {
    const r = p.rewarded ?? {};
    const now = { views: Math.floor(p.views / 1000), likes: Math.floor(p.likes.length / 1000), comments: Math.floor(p.commentCount / 100) };
    const due = Math.min(c.maxPerPostPerDay, (now.views - (r.views ?? 0)) * c.per1kViews + (now.likes - (r.likes ?? 0)) * c.per1kLikes + (now.comments - (r.comments ?? 0)) * c.per100Comments);
    if (due <= 0) continue;
    await tx(async (s) => {
      await moveTokens(s, p.author, due, "creator", "Creator reward", `creator:${p._id}:${now.views}:${now.likes}:${now.comments}`);
      await Post.updateOne({ _id: p._id }, { $set: { rewarded: now } }, { session: s });
    }).catch(() => {});
  }
}

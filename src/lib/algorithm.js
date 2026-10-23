// Outsider feed ranking.
// 1. Each user has an interest profile (topic → weight) learned from what they watch, like, comment, share and save.
// 2. Each post has topics (its place category + hashtags) and live performance stats.
// 3. New posts are shown to a test audience; if weighted engagement per impression stays low after that,
//    distribution is throttled, if it keeps climbing it keeps spreading.
// 4. ~exploreRate of the feed is deliberately outside your interests so tastes can grow.
import { Post, User } from "../models/index.js";
import { getSettings } from "./settings.js";

const W = { like: 1, comment: 3, share: 4, save: 3, repost: 4, dwell: 0.5 }; // dwell weight per 10s watched

export const topicsOf = (post) => [...new Set([post.placeCategory, ...(post.hashtags ?? [])].filter(Boolean))];

export function engagementRate(p) {
  const s = p.stats ?? {};
  const imp = Math.max(1, s.impressions ?? 0);
  const score = (p.likes?.length ?? 0) * W.like + (p.commentCount ?? 0) * W.comment + (p.shares ?? 0) * W.share + (p.saves ?? 0) * W.save + (p.reposts ?? 0) * W.repost + ((s.dwellMs ?? 0) / 10000) * W.dwell;
  return score / imp;
}

// Learn: nudge the viewer's interest in the post's topics.
export async function learn(userId, post, signal, amount = 1) {
  const inc = {};
  for (const t of topicsOf(post)) inc[`interests.${t.replace(/[.$]/g, "_")}`] = (W[signal] ?? 1) * amount;
  if (Object.keys(inc).length) await User.updateOne({ _id: userId }, { $inc: inc });
}

function score(p, me, set, now) {
  const s = p.stats ?? {};
  const ageH = (now - p.createdAt) / 36e5;
  const fresh = Math.pow(0.5, ageH / 24);                      // halves every day
  const er = engagementRate(p);
  const tested = (s.impressions ?? 0) >= set.testAudience;
  const throttle = tested && er < set.minEngagementRate ? 0.15 : 1; // failed the test → mostly stop pushing
  const interests = me.interests ? Object.fromEntries(me.interests) : {};
  const total = Object.values(interests).reduce((a, b) => a + b, 0) || 1;
  const affinity = topicsOf(p).reduce((a, t) => a + (interests[t.replace(/[.$]/g, "_")] ?? 0) / total, 0);
  const follow = me.following.some((f) => f.equals(p.author._id ?? p.author)) ? 1.6 : 1;
  return (0.4 + affinity * 3) * (0.3 + Math.min(er, 1) * 2) * fresh * throttle * follow;
}

// Returns ranked posts for a page; `seen` lets clients skip what they already have.
export async function rankFeed(me, { limit = 10, seen = [], reels = false }) {
  const set = await getSettings();
  const since = new Date(Date.now() - 14 * 864e5);
  const base = { removed: false, author: { $nin: me.blocked }, _id: { $nin: seen }, createdAt: { $gt: since }, ...(reels ? { "media.0": { $exists: true } } : {}) };
  const pool = await Post.find(base).select("-comments").sort({ createdAt: -1 }).limit(400).lean();
  const now = Date.now();
  const interests = me.interests ? Object.fromEntries(me.interests) : {};
  const liked = new Set(Object.entries(interests).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k));
  const scored = pool.map((p) => ({ p, s: score(p, me, set, now), inTaste: topicsOf(p).some((t) => liked.has(t.replace(/[.$]/g, "_"))) }));
  const main = scored.filter((x) => x.inTaste || !liked.size).sort((a, b) => b.s - a.s);
  const explore = scored.filter((x) => !x.inTaste && liked.size).sort((a, b) => b.s - a.s);
  const out = [];
  while (out.length < limit && (main.length || explore.length)) {
    const pickExplore = explore.length && (Math.random() < set.exploreRate || !main.length);
    out.push((pickExplore ? explore : main).shift().p);
  }
  return out;
}

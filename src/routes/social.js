import { Router } from "express";
import { z } from "zod";
import { Highlight, Post, Report, Story, User, oid } from "../models/index.js";
import { bad, forbidden, h, notFound, page } from "../lib/http.js";
import { requireAuth } from "../lib/auth.js";
import { notify } from "../lib/notify.js";
import { Ad } from "../models/index.js";
import { learn, rankFeed } from "../lib/algorithm.js";
import { getSettings } from "../lib/settings.js";
import { Place } from "../models/index.js";

const r = Router();
// Public: prices and rewards the app displays.
r.get("/settings", h(async (_req, res) => { const { creator, pricePerCredit, minCredits, creditsPer1k, checkInTokens, postBonus, referralPerCheckin, welcomeBonus, adEvery } = await getSettings(); res.json({ settings: { creator, pricePerCredit, minCredits, creditsPer1k, checkInTokens, postBonus, referralPerCheckin, welcomeBonus, adEvery } }); }));
r.use(requireAuth);
const pub = "firstName lastName username avatar role";
const mediaZ = z.array(z.object({ type: z.enum(["image", "video"]), src: z.string().url().max(2048) })).max(20).default([]);
// Lists never ship comments; they are paged separately when someone opens them.
const populate = (q) => q.select("-comments").populate("author", pub).populate("tags", pub).populate("place", "slug name city");

// Re-fetch ranked ids as full documents (keeps toJSON/id) in ranked order.
const pop = async (ranked) => { const m = new Map((await populate(Post.find({ _id: { $in: ranked.map((p) => p._id) } }))).map((d) => [d.id, d])); return ranked.map((p) => m.get(String(p._id))).filter(Boolean); };
const seenIds = (q) => String(q.seen ?? "").split(",").filter((x) => /^[a-f\d]{24}$/i.test(x)).slice(0, 500);

// Live ads of a format, interleaved every `adEvery` items. Each served ad is one impression.
async function withAds(items, format, me) {
  const set = await getSettings();
  if (!set.adFormats?.[format] && set.adFormats) return items;
  const ads = await Ad.find({ status: "live", format, $expr: { $lt: ["$spent", "$credits"] } }).sort({ spent: 1 }).limit(Math.ceil(items.length / set.adEvery)).populate("brand", pub).populate("place", "slug name city").lean();
  const out = []; let a = 0;
  items.forEach((p, i) => { out.push(p); if ((i + 1) % set.adEvery === 0 && ads[a]) { const { _id, ...ad } = ads[a++]; out.push({ sponsored: true, id: String(_id), ...ad }); }; });
  return out;
}

// Feed: ranked by interests + engagement with ~20% exploration. Client passes ids already seen.
r.get("/feed", h(async (req, res) => {
  const { limit } = page(req.query);
  const items = await pop(await rankFeed(req.user, { limit, seen: seenIds(req.query) }));
  res.json({ items: await withAds(items, "feed", req.user), next: items.length ? "more" : null });
}));

r.get("/reels", h(async (req, res) => {
  const items = await pop(await rankFeed(req.user, { limit: 12, seen: seenIds(req.query), reels: true }));
  res.json({ items: await withAds(items, "reel", req.user) });
}));

r.post("/posts", h(async (req, res) => {
  const d = z.object({ text: z.string().max(5000).default(""), media: mediaZ, place: z.string().optional(), tags: z.array(z.string()).max(30).default([]),
    party: z.object({ date: z.coerce.date(), max: z.number().int().min(1).max(200) }).optional() }).parse(req.body);
  if (!d.text.trim() && !d.media.length) throw bad("Add some text or a photo.");
  if (d.party && !d.place) throw bad("Tag a place to start a going party.");
  const placeCategory = d.place ? (await Place.findById(d.place).select("category").lean())?.category : undefined;
  const p = await Post.create({ ...d, placeCategory, author: req.user._id, hashtags: [...new Set((d.text.match(/#\w+/g) ?? []).map((x) => x.slice(1).toLowerCase()))], party: d.party && { ...d.party, going: [] } });
  d.tags.forEach((t) => notify(t, "social", `@${req.user.username} tagged you in a post`, `/home#${p.id}`));
  res.status(201).json({ post: await populate(Post.findById(p._id)) });
}));

r.delete("/posts/:id", h(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) throw notFound();
  if (!p.author.equals(req.user._id) && req.user.role !== "admin") throw forbidden();
  p.removed = true; await p.save();
  res.json({ ok: true });
}));

r.post("/posts/:id/like", h(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) throw notFound();
  const on = !p.likes.some((x) => x.equals(req.user._id));
  await Post.updateOne({ _id: p._id }, on ? { $addToSet: { likes: req.user._id } } : { $pull: { likes: req.user._id } });
  if (on) learn(req.user._id, p, "like").catch(() => {});
  if (on && !p.author.equals(req.user._id)) notify(p.author, "social", `@${req.user.username} liked your post`, `/home#${p.id}`);
  res.json({ liked: on, likes: p.likes.length + (on ? 1 : -1) });
}));

r.post("/posts/:id/comments", h(async (req, res) => {
  const { text } = z.object({ text: z.string().trim().min(1).max(2000) }).parse(req.body);
  const p = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: { author: req.user._id, text } }, $inc: { commentCount: 1 } }, { returnDocument: "after" });
  if (!p) throw notFound();
  learn(req.user._id, p, "comment").catch(() => {});
  if (!p.author.equals(req.user._id)) notify(p.author, "social", `@${req.user.username} commented: ${text.slice(0, 60)}`, `/home#${p.id}`);
  const c = p.comments.at(-1);
  res.status(201).json({ comment: { id: c._id, text: c.text, at: c.at, author: { id: req.user.id, firstName: req.user.firstName, lastName: req.user.lastName, username: req.user.username, avatar: req.user.avatar } } });
}));

// Lightweight counters; the client sends one view per post per session.
r.post("/posts/:id/view", h(async (req, res) => {
  const ms = Math.min(120000, Math.max(0, Number(req.body?.ms) || 0));
  const p = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1, "stats.impressions": 1, "stats.dwellMs": ms } }).select("hashtags placeCategory").lean();
  if (p && ms > 2000) learn(req.user._id, p, "dwell", ms / 10000).catch(() => {});
  res.json({ ok: true });
}));
r.post("/posts/:id/save", h(async (req, res) => {
  const on = req.body?.on !== false;
  const p = await Post.findByIdAndUpdate(req.params.id, { $inc: { saves: on ? 1 : -1 } }).select("hashtags placeCategory").lean();
  if (p && on) learn(req.user._id, p, "save").catch(() => {});
  res.json({ ok: true });
}));
r.post("/ads/:id/click", h(async (req, res) => { await Ad.updateOne({ _id: req.params.id }, { $inc: { clicks: 1 } }); res.json({ ok: true }); }));
// Ad impressions: credits are spent per 1k impressions at the format's rate.
r.post("/ads/:id/impression", h(async (req, res) => {
  const a = await Ad.findById(req.params.id).select("format credits spent status").lean();
  if (a && a.status === "live") {
    const rate = (await getSettings()).creditsPer1k[a.format] ?? 20;
    const spent = Math.min(a.credits, (a.spent ?? 0) + rate / 1000);
    await Ad.updateOne({ _id: a._id }, { $inc: { reach: 1 }, $set: { spent, ...(spent >= a.credits ? { status: "paused" } : {}) } });
  }
  res.json({ ok: true });
}));
r.post("/posts/:id/share", h(async (req, res) => { await Post.updateOne({ _id: req.params.id }, { $inc: { shares: 1 } }); Post.findById(req.params.id).select("hashtags placeCategory").lean().then((p) => p && learn(req.user._id, p, "share")).catch(() => {}); res.json({ ok: true }); }));

// Newest first, 10 at a time: GET /posts/:id/comments?skip=0&limit=10
r.get("/posts/:id/comments", h(async (req, res) => {
  const skip = Math.max(0, +(req.query.skip ?? 0)), limit = Math.min(30, +(req.query.limit ?? 10));
  const meta = await Post.findById(req.params.id, { commentCount: 1 });
  if (!meta) throw notFound();
  const take = Math.min(limit, meta.commentCount - skip);
  if (take <= 0) return res.json({ items: [], total: meta.commentCount });
  const p = await Post.findById(req.params.id, { comments: { $slice: [meta.commentCount - skip - take, take] }, commentCount: 1 }).populate("comments.author", pub);
  res.json({ items: p.comments.reverse().map((c) => ({ id: c._id, text: c.text, at: c.at, author: c.author })), total: p.commentCount });
}));

r.post("/posts/:id/repost", h(async (req, res) => {
  const o = await Post.findByIdAndUpdate(req.params.id, { $inc: { reposts: 1 } });
  if (o) learn(req.user._id, o, "repost").catch(() => {});
  if (!o) throw notFound();
  const p = await Post.create({ author: req.user._id, text: o.text, media: o.media, place: o.place, repostOf: o._id });
  res.status(201).json({ post: await populate(Post.findById(p._id)) });
}));

r.post("/posts/:id/party", h(async (req, res) => {
  const me = req.user._id;
  const joined = await Post.findOneAndUpdate({ _id: req.params.id, "party.going": { $ne: me }, $expr: { $lt: [{ $size: "$party.going" }, "$party.max"] } }, { $push: { "party.going": me } }, { returnDocument: "after" });
  if (joined) return res.json({ going: true, count: joined.party.going.length });
  const left = await Post.findOneAndUpdate({ _id: req.params.id, "party.going": me }, { $pull: { "party.going": me } }, { returnDocument: "after" });
  if (left) return res.json({ going: false, count: left.party.going.length });
  throw bad("This going party is full.");
}));

r.get("/stories", h(async (req, res) => {
  res.json({ items: await Story.find({ author: { $in: [...req.user.following, req.user._id], $nin: req.user.blocked } }).sort({ createdAt: -1 }).populate("author", pub) });
}));
r.post("/stories", h(async (req, res) => {
  const { src } = z.object({ src: z.string().url() }).parse(req.body);
  res.status(201).json({ story: await Story.create({ author: req.user._id, src, expiresAt: new Date(Date.now() + 864e5) }) });
}));

r.get("/users/:username", h(async (req, res) => {
  const u = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!u || u.blocked.some((x) => x.equals(req.user._id))) throw notFound("User not found");
  const [posts, highlights, followers, likes] = await Promise.all([
    populate(Post.find({ author: u._id, removed: false }).sort({ createdAt: -1 }).limit(30)),
    Highlight.find({ owner: u._id }),
    User.countDocuments({ following: u._id }),
    Post.aggregate([{ $match: { author: u._id } }, { $group: { _id: null, n: { $sum: { $size: "$likes" } } } }]),
  ]);
  const { balance, email, blocked, settings, ...profile } = u.toJSON();
  res.json({ user: req.user._id.equals(u._id) ? u : profile, posts, highlights, stats: { followers, following: u.following.length, likes: likes[0]?.n ?? 0 }, following: req.user.following.some((x) => x.equals(u._id)) });
}));

r.post("/users/:id/follow", h(async (req, res) => {
  const t = oid(req.params.id);
  if (t.equals(req.user._id)) throw bad("You can't follow yourself.");
  const on = !req.user.following.some((x) => x.equals(t));
  await User.updateOne({ _id: req.user._id }, on ? { $addToSet: { following: t } } : { $pull: { following: t } });
  if (on) notify(t, "social", `@${req.user.username} started following you`, `/u/${req.user.username}`);
  res.json({ following: on });
}));

r.post("/users/:id/block", h(async (req, res) => {
  const t = oid(req.params.id);
  const on = !req.user.blocked.some((x) => x.equals(t));
  await User.updateOne({ _id: req.user._id }, on ? { $addToSet: { blocked: t }, $pull: { following: t } } : { $pull: { blocked: t } });
  res.json({ blocked: on });
}));

r.get("/me/blocked", h(async (req, res) => res.json({ items: await User.find({ _id: { $in: req.user.blocked } }).select(pub) })));

r.patch("/me", h(async (req, res) => {
  const d = z.object({ firstName: z.string().trim().min(1).max(40), lastName: z.string().trim().max(40), bio: z.string().max(300), city: z.string().max(60), avatar: z.string().url(), cover: z.string().url(), interests: z.array(z.string()).max(20),
    settings: z.object({ publicProfile: z.boolean(), showCheckins: z.boolean(), openMessages: z.boolean() }).partial() }).partial().parse(req.body);
  const set = { ...d }; delete set.settings;
  for (const [k, v] of Object.entries(d.settings ?? {})) set[`settings.${k}`] = v;
  res.json({ user: await User.findByIdAndUpdate(req.user._id, { $set: set }, { returnDocument: "after" }) });
}));

r.get("/me/highlights", h(async (req, res) => res.json({ items: await Highlight.find({ owner: req.user._id }) })));
r.post("/me/highlights", h(async (req, res) => {
  const { name, items } = z.object({ name: z.string().trim().min(1).max(20), items: z.array(z.string().url()).min(1).max(50) }).parse(req.body);
  res.status(201).json({ highlight: await Highlight.create({ owner: req.user._id, name, items, cover: items[0] }) });
}));
r.delete("/me/highlights/:id", h(async (req, res) => { await Highlight.deleteOne({ _id: req.params.id, owner: req.user._id }); res.json({ ok: true }); }));

r.post("/reports", h(async (req, res) => {
  const d = z.object({ target: z.enum(["post", "user", "place", "comment"]), targetId: z.string(), reason: z.string().max(500) }).parse(req.body);
  await Report.create({ ...d, by: req.user._id });
  res.status(201).json({ ok: true });
}));

export default r;

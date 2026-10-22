import { Router } from "express";
import { z } from "zod";
import { Setting, getAdSettings, Ad, CheckIn, Event, Pass, Place, Post, Report, Subscription, Txn, User } from "../models/index.js";
import { bad, h, notFound } from "../lib/http.js";
import { requireRole } from "../lib/auth.js";
import { moveTokens, tx } from "../lib/ledger.js";
import { notify } from "../lib/notify.js";
import { placeStatusEmail, sendMail } from "../lib/mail.js";

const r = Router();
r.use(requireRole("admin"));

r.get("/overview", h(async (_req, res) => {
  const day = new Date(Date.now() - 864e5), week = new Date(Date.now() - 7 * 864e5);
  const [users, brands, pendingPlaces, redeemedToday, reservations, activeSubs, checkins] = await Promise.all([
    User.countDocuments({ role: "user" }), User.countDocuments({ role: "brand" }), Place.countDocuments({ status: "pending" }),
    Txn.aggregate([{ $match: { amount: { $lt: 0 }, createdAt: { $gt: day } } }, { $group: { _id: null, n: { $sum: "$amount" } } }]),
    Event.aggregate([{ $group: { _id: null, n: { $sum: { $size: "$reserved" } } } }]),
    Subscription.countDocuments({ status: "active" }),
    CheckIn.aggregate([{ $match: { createdAt: { $gt: week } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  res.json({ users, brands, pendingPlaces, tokensRedeemedToday: -(redeemedToday[0]?.n ?? 0), reservations: reservations[0]?.n ?? 0, activeSubs, checkins });
}));

// Passes: spots = floor(budget / perPerson)
r.get("/passes", h(async (_req, res) => res.json({ items: await Pass.find().sort({ date: -1 }).limit(200).populate("place", "name slug") })));
r.post("/passes", h(async (req, res) => {
  const d = z.object({ place: z.string(), title: z.string().trim().min(2).max(80), perPerson: z.number().int().min(1), budget: z.number().int().min(1), date: z.coerce.date() }).parse(req.body);
  const p = await Place.findOne({ slug: d.place, status: "live" });
  if (!p) throw notFound("Place not found or not live");
  const slots = Math.floor(d.budget / d.perPerson);
  if (slots < 1) throw bad("Budget must cover at least one person.");
  const day = new Date(d.date); day.setUTCHours(0, 0, 0, 0);
  res.status(201).json({ pass: await Pass.create({ ...d, date: day, place: p._id, slots, createdBy: req.user._id }) });
}));
r.patch("/passes/:id", h(async (req, res) => {
  const { active } = z.object({ active: z.boolean() }).parse(req.body);
  res.json({ pass: await Pass.findByIdAndUpdate(req.params.id, { active }, { returnDocument: "after" }) });
}));

r.get("/events", h(async (_req, res) => res.json({ items: await Event.find().sort({ date: -1 }).limit(200) })));
r.patch("/events/:id/sponsor", h(async (req, res) => {
  const { slots, tokenCost } = z.object({ slots: z.number().int().min(0), tokenCost: z.number().int().min(1) }).parse(req.body);
  const e = await Event.findById(req.params.id);
  if (!e) throw notFound();
  if (slots < e.reserved.length) throw bad(`${e.reserved.length} people already reserved. Spots can't go below that.`);
  e.slots = slots; e.tokenCost = tokenCost; await e.save();
  res.json({ event: e });
}));

r.get("/users", h(async (req, res) => {
  const q = String(req.query.q ?? "");
  const f = q ? { $or: [{ username: new RegExp(q.replace(/\W/g, ""), "i") }, { email: new RegExp(q.replace(/[^\w@.]/g, ""), "i") }] } : {};
  if (req.query.role) f.role = String(req.query.role);
  res.json({ items: await User.find(f).sort({ createdAt: -1 }).limit(100).select("firstName lastName username email role status avatar balance createdAt") });
}));
r.patch("/users/:id", h(async (req, res) => {
  const d = z.object({ status: z.enum(["active", "suspended"]).optional(), role: z.enum(["user", "brand", "admin"]).optional() }).parse(req.body);
  if (req.params.id === req.user.id) throw bad("You can't change your own account here.");
  const u = await User.findByIdAndUpdate(req.params.id, { ...d, $inc: { tokenVersion: d.status === "suspended" ? 1 : 0 } }, { returnDocument: "after" });
  if (!u) throw notFound();
  res.json({ user: u });
}));
// Manual token adjustment, logged in the ledger with the admin's reason.
r.post("/users/:id/tokens", h(async (req, res) => {
  const { amount, reason } = z.object({ amount: z.number().int().refine((n) => n !== 0), reason: z.string().trim().min(3).max(200) }).parse(req.body);
  await tx((s) => moveTokens(s, req.params.id, amount, "adjustment", `Adjustment: ${reason} (by @${req.user.username})`, `adj:${req.params.id}:${Date.now()}`));
  res.json({ ok: true });
}));

r.get("/places", h(async (req, res) => res.json({ items: await Place.find(req.query.status ? { status: String(req.query.status) } : {}).sort({ createdAt: -1 }).limit(200).populate("owner", "username email") })));
r.patch("/places/:id", h(async (req, res) => {
  const d = z.object({ status: z.enum(["live", "rejected", "closed", "pending"]).optional(), verified: z.boolean().optional(), checkInTokens: z.number().int().min(0).max(500).optional() }).parse(req.body);
  const p = await Place.findByIdAndUpdate(req.params.id, d, { returnDocument: "after" });
  if (!p) throw notFound();
  if (d.status && p.owner) User.findById(p.owner).select("email").then((o) => o && sendMail(o.email, `${p.name}: ${d.status}`, placeStatusEmail(p.name, d.status))).catch(() => {});
  if (d.status && p.owner) notify(p.owner, "business", `${p.name} is now ${d.status}`, "/brand/places");
  res.json({ place: p });
}));

r.get("/ad-settings", h(async (_req, res) => res.json({ settings: await getAdSettings() })));
r.put("/ad-settings", h(async (req, res) => {
  const value = z.object({ pricePerCredit: z.number().min(1), creditsPer1kViews: z.number().min(1), minCredits: z.number().int().min(1) }).parse(req.body);
  await Setting.updateOne({ key: "ads" }, { value }, { upsert: true });
  res.json({ settings: value });
}));

r.get("/ads", h(async (_req, res) => res.json({ items: await Ad.find().sort({ createdAt: -1 }).limit(200).populate("brand", "username") })));
r.patch("/ads/:id", h(async (req, res) => {
  const { status } = z.object({ status: z.enum(["live", "rejected", "paused"]) }).parse(req.body);
  const a = await Ad.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
  if (!a) throw notFound();
  notify(a.brand, "business", `Your ad "${a.title}" was ${status === "live" ? "approved" : status}`, "/brand/ads");
  res.json({ ad: a });
}));

r.get("/reports", h(async (_req, res) => res.json({ items: await Report.find({ status: "open" }).sort({ createdAt: -1 }).populate("by", "username") })));
r.patch("/reports/:id", h(async (req, res) => {
  const { action } = z.object({ action: z.enum(["dismiss", "remove"]) }).parse(req.body);
  const rep = await Report.findById(req.params.id);
  if (!rep) throw notFound();
  if (action === "remove" && rep.target === "post") await Post.updateOne({ _id: rep.targetId }, { removed: true });
  rep.status = action === "remove" ? "actioned" : "dismissed"; await rep.save();
  res.json({ ok: true });
}));

export default r;

import { Router } from "express";
import { z } from "zod";
import { Ad, CheckIn, CreditPurchase, Event, Pass, Place, Subscription, User, VisitRequest, getAdSettings } from "../models/index.js";
import { paystack } from "../lib/paystack.js";
import { env } from "../lib/env.js";
import { bad, forbidden, h, notFound } from "../lib/http.js";
import { requireAuth, requireRole } from "../lib/auth.js";
import { notify } from "../lib/notify.js";
import { sendMail, visitStatusEmail } from "../lib/mail.js";

const r = Router();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

// Explorers send visit requests to a place's brand.
r.post("/visit-requests", requireAuth, h(async (req, res) => {
  const d = z.object({ place: z.string(), date: z.coerce.date(), people: z.number().int().min(1).max(100), note: z.string().max(500).default("") }).parse(req.body);
  const p = await Place.findOne({ slug: d.place, status: "live" });
  if (!p?.owner) throw notFound("Place not found");
  const v = await VisitRequest.create({ ...d, place: p._id, brand: p.owner, from: req.user._id });
  notify(p.owner, "business", `@${req.user.username} wants to visit ${p.name}`, "/brand/requests");
  res.status(201).json({ request: v });
}));

r.use(requireRole("brand"));

async function planLimits(brandId) {
  const sub = await Subscription.findOne({ brand: brandId, status: "active" }).populate("plan");
  return sub?.plan?.limits ?? { places: 1, ads: 1, staff: 1 }; // free tier
}

r.get("/overview", h(async (req, res) => {
  const places = await Place.find({ owner: req.user._id }).select("_id");
  const ids = places.map((p) => p._id);
  const since = new Date(Date.now() - 7 * 864e5);
  const [checkins, pending, passes, daily] = await Promise.all([
    CheckIn.countDocuments({ place: { $in: ids }, createdAt: { $gt: since } }),
    VisitRequest.countDocuments({ brand: req.user._id, status: "pending" }),
    Pass.aggregate([{ $match: { place: { $in: ids } } }, { $group: { _id: null, n: { $sum: { $size: "$claimed" } } } }]),
    CheckIn.aggregate([{ $match: { place: { $in: ids }, createdAt: { $gt: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  res.json({ checkins, pendingRequests: pending, passesRedeemed: passes[0]?.n ?? 0, daily, limits: await planLimits(req.user._id) });
}));

r.get("/places", h(async (req, res) => res.json({ items: await Place.find({ owner: req.user._id }).sort({ createdAt: -1 }) })));
const placeZ = z.object({ name: z.string().trim().min(2).max(80), category: z.string(), subcategory: z.string().optional(), description: z.string().max(3000).optional(),
  address: z.string().max(200), city: z.string(), state: z.string(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  photos: z.array(z.string().url()).max(30).default([]), facilities: z.array(z.string()).max(40).default([]), hours: z.string().optional(), priceFrom: z.number().min(0).optional(),
  phone: z.string().optional(), website: z.string().url().optional() });
r.post("/places", h(async (req, res) => {
  const d = placeZ.parse(req.body);
  if ((await Place.countDocuments({ owner: req.user._id, status: { $ne: "rejected" } })) >= (await planLimits(req.user._id)).places) throw bad("Your plan's place limit is reached. Upgrade to add more.");
  let slug = slugify(d.name); if (await Place.exists({ slug })) slug += `-${Date.now().toString(36)}`;
  const { lat, lng, ...rest } = d;
  res.status(201).json({ place: await Place.create({ ...rest, slug, owner: req.user._id, location: { type: "Point", coordinates: [lng, lat] }, status: "pending" }) });
}));
r.patch("/places/:id", h(async (req, res) => {
  const p = await Place.findById(req.params.id);
  if (!p) throw notFound(); if (!p.owner?.equals(req.user._id)) throw forbidden();
  const { lat, lng, ...rest } = placeZ.partial().parse(req.body);
  Object.assign(p, rest);
  if (lat !== undefined && lng !== undefined) { p.location = { type: "Point", coordinates: [lng, lat] }; if (p.status === "live") p.status = "pending"; } // moved pins get re-reviewed
  await p.save();
  res.json({ place: p });
}));

r.get("/ads", h(async (req, res) => res.json({ items: await Ad.find({ brand: req.user._id }).sort({ createdAt: -1 }), credits: req.user.adCredits, settings: await getAdSettings() })));

// Buy ad credits: one-off Paystack payment; credits land via verify or the signed webhook.
r.post("/ad-credits/buy", h(async (req, res) => {
  const st = await getAdSettings();
  const { credits } = z.object({ credits: z.number().int().min(st.minCredits).max(1e6) }).parse(req.body);
  const amount = credits * st.pricePerCredit;
  const init = await paystack.initialize({ email: req.user.email, amount: amount * 100, callback_url: `${env.clientUrl}/brand/ads`, metadata: { type: "adcredits", brandId: req.user.id, credits } });
  await CreditPurchase.create({ brand: req.user._id, credits, amount, reference: init.reference });
  res.json({ authorizationUrl: init.authorization_url, reference: init.reference });
}));
r.get("/ad-credits/verify/:reference", h(async (req, res) => {
  const t = await paystack.verify(req.params.reference);
  if (t.status === "success") await creditPurchase(req.params.reference);
  res.json({ credits: (await User.findById(req.user._id)).adCredits });
}));
r.post("/ads", h(async (req, res) => {
  const d = z.object({ title: z.string().trim().min(2).max(60), body: z.string().trim().min(2).max(200), img: z.string().url().optional(), credits: z.number().int().min(1),
    objective: z.enum(["reach", "visits", "engagement"]).default("reach"), days: z.number().int().min(1).max(90).default(7), city: z.string().optional(), interests: z.array(z.string()).max(20).default([]),
    ages: z.array(z.number().int()).length(2).optional(), cta: z.string().max(30).optional(), place: z.string().optional() }).parse(req.body);
  // Reserve the campaign's credits up front; the ad then goes to review.
  const r = await User.updateOne({ _id: req.user._id, adCredits: { $gte: d.credits } }, { $inc: { adCredits: -d.credits } });
  if (!r.modifiedCount) throw bad("Not enough ad credits. Buy more to launch this campaign.");
  const p = d.place ? await Place.findOne({ slug: d.place, owner: req.user._id }) : null;
  const st = await getAdSettings();
  res.status(201).json({ ad: await Ad.create({ ...d, place: p?._id, budget: d.credits * st.pricePerCredit, brand: req.user._id }) });
}));
r.patch("/ads/:id", h(async (req, res) => {
  const { status } = z.object({ status: z.enum(["live", "paused"]) }).parse(req.body);
  const a = await Ad.findOneAndUpdate({ _id: req.params.id, brand: req.user._id, status: { $in: ["live", "paused"] } }, { status }, { returnDocument: "after" });
  if (!a) throw bad("Only approved ads can be paused or resumed.");
  res.json({ ad: a });
}));

r.get("/requests", h(async (req, res) => res.json({ items: await VisitRequest.find({ brand: req.user._id }).sort({ createdAt: -1 }).populate("from", "firstName lastName username avatar").populate("place", "name slug") })));
r.patch("/requests/:id", h(async (req, res) => {
  const { status } = z.object({ status: z.enum(["accepted", "declined"]) }).parse(req.body);
  const v = await VisitRequest.findOneAndUpdate({ _id: req.params.id, brand: req.user._id }, { status }, { returnDocument: "after" }).populate("place", "name");
  if (!v) throw notFound();
  v.populate("from", "email").then((x) => sendMail(x.from.email, `Visit ${status}`, visitStatusEmail(v.place?.name ?? "The place", status))).catch(() => {});
  notify(v.from, "business", `${v.place?.name ?? "The place"} ${status} your visit request`, "/messages");
  res.json({ request: v });
}));

r.get("/events", h(async (req, res) => res.json({ items: await Event.find({ host: req.user._id }).sort({ date: 1 }) })));
r.post("/events", h(async (req, res) => {
  const d = z.object({ title: z.string().trim().min(2).max(100), date: z.coerce.date(), price: z.string().max(40).default("Free"), place: z.string().optional(), venue: z.string().max(200), img: z.string().url().optional() }).parse(req.body);
  const p = d.place ? await Place.findOne({ slug: d.place, owner: req.user._id }) : null;
  res.status(201).json({ event: await Event.create({ ...d, place: p?._id, location: p?.location, host: req.user._id }) });
}));

export async function creditPurchase(reference) {
  const p = await CreditPurchase.findOneAndUpdate({ reference, status: "pending" }, { status: "paid" });
  if (p) await User.updateOne({ _id: p.brand }, { $inc: { adCredits: p.credits } });
}

export default r;

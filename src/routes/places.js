import { Router } from "express";
import { z } from "zod";
import { CheckIn, Place } from "../models/index.js";
import { bad, h, notFound } from "../lib/http.js";
import { requireAuth } from "../lib/auth.js";
import { moveTokens, tx } from "../lib/ledger.js";

const r = Router();
const num = z.coerce.number();

// GET /places?bbox=minLng,minLat,maxLng,maxLat | near=lng,lat&radiusKm=10 | q= | category= | tokens=1 | verified=1
r.get("/", h(async (req, res) => {
  const q = req.query;
  const f = { status: "live" };
  if (q.category) f.category = String(q.category);
  if (q.verified === "1") f.verified = true;
  if (q.minRating) f.rating = { $gte: +q.minRating };
  if (q.maxPrice) f.priceFrom = { $lte: +q.maxPrice };
  if (q.bbox) {
    const [a, b, c, d] = String(q.bbox).split(",").map(Number);
    if ([a, b, c, d].some(Number.isNaN)) throw bad("bbox must be minLng,minLat,maxLng,maxLat");
    f.location = { $geoWithin: { $box: [[a, b], [c, d]] } };
  }
  const limit = Math.min(500, +(q.limit ?? 200));
  if (q.near) {
    const [lng, lat] = String(q.near).split(",").map(Number);
    const maxDistance = Math.min(500, +(q.radiusKm ?? 25)) * 1000;
    const pipeline = [{ $geoNear: { near: { type: "Point", coordinates: [lng, lat] }, distanceField: "distanceM", maxDistance, query: f, spherical: true } }];
    if (q.q) pipeline.push({ $match: { $or: ["name", "city", "subcategory", "facilities"].map((k) => ({ [k]: { $regex: String(q.q), $options: "i" } })) } });
    pipeline.push({ $limit: limit });
    const items = (await Place.aggregate(pipeline)).map(({ _id, ...p }) => ({ id: _id, ...p }));
    return res.json({ items });
  }
  if (q.q) f.$text = { $search: String(q.q) };
  res.json({ items: await Place.find(f).limit(limit).sort(q.q ? { score: { $meta: "textScore" } } : { rating: -1 }) });
}));

r.get("/:slug", h(async (req, res) => {
  const p = await Place.findOne({ slug: req.params.slug, status: { $in: ["live", "closed"] } });
  if (!p) throw notFound("Place not found");
  res.json({ place: p });
}));

// Check-in: server compares device position to the venue and rewards once per 24h.
r.post("/:slug/check-in", requireAuth, h(async (req, res) => {
  const { lat, lng, accuracy } = z.object({ lat: num, lng: num, accuracy: num.optional() }).parse(req.body);
  const p = await Place.findOne({ slug: req.params.slug, status: "live" });
  if (!p) throw notFound("Place not found");
  const [plng, plat] = p.location.coordinates;
  const rad = (x) => (x * Math.PI) / 180;
  const dist = 12742e3 * Math.asin(Math.sqrt(Math.sin(rad(plat - lat) / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(plat)) * Math.sin(rad(plng - lng) / 2) ** 2));
  if (accuracy && accuracy > 150) throw bad("Your location isn't precise enough. Move outside or try again.");
  if (dist > p.checkInRadiusM) throw bad(`You're about ${(dist / 1000).toFixed(1)} km away. Check in when you're at the place.`);
  const recent = await CheckIn.exists({ user: req.user._id, place: p._id, status: "rewarded", createdAt: { $gt: new Date(Date.now() - 864e5) } });
  if (recent) throw bad("You've already checked in here today.");
  const day = new Date().toISOString().slice(0, 10);
  await tx(async (s) => {
    await CheckIn.create([{ user: req.user._id, place: p._id, distanceM: Math.round(dist), accuracyM: accuracy, status: "rewarded" }], { session: s });
    await moveTokens(s, req.user._id, p.checkInTokens, "checkin", `Checked in at ${p.name}`, `checkin:${req.user._id}:${p._id}:${day}`);
  });
  res.json({ ok: true, tokens: p.checkInTokens });
}));

export default r;

import { Router } from "express";
import { Event, Pass, Txn } from "../models/index.js";
import { bad, h, notFound } from "../lib/http.js";
import { requireAuth, requireRole } from "../lib/auth.js";
import { moveTokens, tx } from "../lib/ledger.js";
import { notify } from "../lib/notify.js";
import { passEmail, reservationEmail, sendMail } from "../lib/mail.js";

const r = Router();
const today = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; };

r.get("/wallet", requireAuth, async (req, res, next) => {
  try { res.json({ balance: req.user.balance, txns: await Txn.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100) }); } catch (e) { next(e); }
});

// Passes are claimable on their date; spots = floor(budget / perPerson).
r.get("/passes", h(async (req, res) => {
  const from = today(), to = new Date(+from + 864e5);
  res.json({ items: await Pass.find({ active: true, date: { $gte: from, $lt: to } }).populate("place", "slug name city photos").sort({ perPerson: 1 }) });
}));

r.post("/passes/:id/claim", requireAuth, h(async (req, res) => {
  const me = req.user._id;
  const pass = await tx(async (s) => {
    const p = await Pass.findOneAndUpdate(
      { _id: req.params.id, active: true, claimed: { $ne: me }, $expr: { $lt: [{ $size: "$claimed" }, "$slots"] } },
      { $push: { claimed: me } }, { returnDocument: "after", session: s });
    if (!p) throw bad("This pass is sold out or you already have it.");
    await moveTokens(s, me, -p.perPerson, "pass", `Claimed: ${p.title}`, `pass:${p._id}:${me}`);
    return p;
  });
  const place = (await pass.populate("place", "name")).place?.name ?? "";
  sendMail(req.user.email, `Your pass: ${pass.title}`, passEmail(pass.title, place, `PASS-${pass.id}-${me}`)).catch(() => {});
  res.json({ ok: true, code: `PASS-${pass.id}-${me}` });
}));

r.get("/events", h(async (req, res) => {
  const f = { date: { $gte: today() } };
  if (req.query.sponsored === "1") f.slots = { $gt: 0 };
  if (req.query.near) {
    const [lng, lat] = String(req.query.near).split(",").map(Number);
    f.location = { $nearSphere: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: (+(req.query.radiusKm ?? 50)) * 1000 } };
  }
  res.json({ items: await Event.find(f).sort(req.query.near ? undefined : { date: 1 }).limit(100).populate("place", "slug name") });
}));

r.post("/events/:id/reserve", requireAuth, h(async (req, res) => {
  const me = req.user._id;
  const ev = await tx(async (s) => {
    const e = await Event.findOneAndUpdate(
      { _id: req.params.id, slots: { $gt: 0 }, reserved: { $ne: me }, $expr: { $lt: [{ $size: "$reserved" }, "$slots"] } },
      { $push: { reserved: me } }, { returnDocument: "after", session: s });
    if (!e) throw bad("Fully reserved, not sponsored, or you already have a spot.");
    await moveTokens(s, me, -e.tokenCost, "event", `Reserved: ${e.title}`, `event:${e._id}:${me}`);
    return e;
  });
  notify(me, "reward", `You're in for ${ev.title}. Show your QR code at the door.`, "/events");
  sendMail(req.user.email, `Reserved: ${ev.title}`, reservationEmail(ev.title, ev.date, `OUT-${ev.id}-${me}`)).catch(() => {});
  res.json({ ok: true, code: `OUT-${ev.id}-${me}` });
}));

// Staff scan (brand/admin): check a code belongs to a real claim.
r.get("/verify/:code", requireRole("brand", "admin"), h(async (req, res) => {
  const [kind, a, b] = String(req.params.code).split("-");
  const doc = kind === "PASS" ? await Pass.findById(a).select("title claimed") : kind === "OUT" ? await Event.findById(a).select("title reserved") : null;
  if (!doc) throw notFound("Unknown code");
  const list = doc.claimed ?? doc.reserved ?? [];
  res.json({ valid: list.some((u) => String(u) === b), title: doc.title });
}));

export default r;

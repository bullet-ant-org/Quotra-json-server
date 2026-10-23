import { Router } from "express";
import { Bounty, CheckIn, Event, Pass, Txn, User } from "../models/index.js";
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

// Top rewards: token-priced, limited spots, only inside their season window.
r.get("/bounties", h(async (_req, res) => res.json({ items: await Bounty.find({ active: true, ends: { $gt: new Date() } }).sort({ ends: 1 }) })));
r.post("/bounties/:id/claim", requireAuth, h(async (req, res) => {
  const now = new Date();
  const b = await tx(async (s) => {
    const x = await Bounty.findOneAndUpdate({ _id: req.params.id, active: true, starts: { $lte: now }, ends: { $gt: now }, claimed: { $ne: req.user._id }, $expr: { $lt: [{ $size: "$claimed" }, "$slots"] } },
      { $push: { claimed: req.user._id } }, { returnDocument: "after", session: s });
    if (!x) throw bad("This reward isn't available: it's closed, full, or already yours.");
    await moveTokens(s, req.user._id, -x.reward, "bounty", `Top reward: ${x.title}`, `bounty:${x._id}:${req.user._id}`);
    return x;
  });
  notify(req.user._id, "rewards", `You got a spot: ${b.title}`, "/wallet");
  res.json({ bounty: b });
}));

r.get("/me/referrals", requireAuth, h(async (req, res) => {
  const u = req.user;
  if (!u.referralCode) { u.referralCode = `${u.username}${Math.floor(100 + Math.random() * 900)}`.toLowerCase(); await User.updateOne({ _id: u._id }, { referralCode: u.referralCode }); }
  const invited = await User.find({ referredBy: u._id }).select("firstName lastName username avatar createdAt").lean();
  const counts = await CheckIn.aggregate([{ $match: { user: { $in: invited.map((i) => i._id) }, status: "rewarded" } }, { $group: { _id: "$user", n: { $sum: 1 } } }]);
  const n = new Map(counts.map((c) => [String(c._id), c.n]));
  const [earned] = await Txn.aggregate([{ $match: { user: u._id, kind: "referral" } }, { $group: { _id: null, t: { $sum: "$amount" } } }]);
  res.json({ code: u.referralCode, earned: earned?.t ?? 0, invited: invited.map((i) => ({ id: String(i._id), username: i.username, firstName: i.firstName, avatar: i.avatar, joined: i.createdAt, checkins: n.get(String(i._id)) ?? 0 })) });
}));

export default r;

import { Router } from "express";
import { z } from "zod";
import { Conversation, Message, Notification, User, oid } from "../models/index.js";
import { bad, forbidden, h, notFound } from "../lib/http.js";
import { requireAuth } from "../lib/auth.js";
import { notify } from "../lib/notify.js";

const r = Router();
r.use(requireAuth);
const pub = "firstName lastName username avatar role";

r.get("/conversations", h(async (req, res) => {
  res.json({ items: await Conversation.find({ members: req.user._id }).sort({ lastAt: -1 }).populate("members", pub) });
}));

// Start (or reuse) a 1:1 conversation, or create a group with name + members.
r.post("/conversations", h(async (req, res) => {
  const { members, name } = z.object({ members: z.array(z.string()).min(1).max(50), name: z.string().max(60).optional() }).parse(req.body);
  const ids = [...new Set(members)].map(oid).filter((x) => !x.equals(req.user._id));
  const others = await User.find({ _id: { $in: ids } }).select("blocked");
  if (others.length !== ids.length) throw notFound("User not found");
  if (others.some((o) => o.blocked.some((b) => b.equals(req.user._id)))) throw forbidden("You can't message this person.");
  if (ids.length === 1 && !name) {
    const existing = await Conversation.findOne({ members: { $all: [req.user._id, ids[0]], $size: 2 } });
    if (existing) return res.json({ conversation: existing });
  }
  res.status(201).json({ conversation: await Conversation.create({ members: [req.user._id, ...ids], name, lastAt: new Date() }) });
}));

const member = async (req) => {
  const c = await Conversation.findById(req.params.id);
  if (!c || !c.members.some((m) => m.equals(req.user._id))) throw notFound("Conversation not found");
  return c;
};

r.get("/conversations/:id/messages", h(async (req, res) => {
  const c = await member(req);
  const before = req.query.before ? { createdAt: { $lt: new Date(String(req.query.before)) } } : {};
  const items = await Message.find({ conversation: c._id, ...before }).sort({ createdAt: -1 }).limit(50);
  await Message.updateMany({ conversation: c._id, readBy: { $ne: req.user._id } }, { $addToSet: { readBy: req.user._id } });
  res.json({ items: items.reverse() });
}));

r.post("/conversations/:id/messages", h(async (req, res) => {
  const c = await member(req);
  const { text } = z.object({ text: z.string().trim().min(1).max(4000) }).parse(req.body);
  const m = await Message.create({ conversation: c._id, from: req.user._id, text, readBy: [req.user._id] });
  await Conversation.updateOne({ _id: c._id }, { lastText: text.slice(0, 120), lastAt: m.createdAt });
  c.members.filter((x) => !x.equals(req.user._id)).forEach((x) => notify(x, "message", `@${req.user.username}: ${text.slice(0, 60)}`, `/messages/${c.id}`));
  res.status(201).json({ message: m });
}));

r.get("/notifications", h(async (req, res) => {
  res.json({ items: await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100), unread: await Notification.countDocuments({ user: req.user._id, read: false }) });
}));
r.post("/notifications/read", h(async (req, res) => {
  const { ids } = z.object({ ids: z.array(z.string()).optional() }).parse(req.body ?? {});
  await Notification.updateMany({ user: req.user._id, ...(ids ? { _id: { $in: ids } } : {}) }, { read: true });
  res.json({ ok: true });
}));

export default r;

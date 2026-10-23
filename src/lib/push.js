// Web push (VAPID). Without VAPID keys this is a no-op, so the app still works.
import webpush from "web-push";
import { PushSub } from "../models/index.js";

const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
if (pub && priv) webpush.setVapidDetails(`mailto:${process.env.MAIL_FROM_EMAIL ?? "hello@outsider.app"}`, pub, priv);
export const vapidPublicKey = pub ?? null;

// payload: { title, body, image?, icon?, url, tag? }
export async function push(userIds, payload) {
  if (!pub || !priv || !userIds.length) return;
  const subs = await PushSub.find({ user: { $in: userIds } }).lean();
  await Promise.all(subs.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(payload), { TTL: 3600 })
    .catch((e) => { if (e.statusCode === 404 || e.statusCode === 410) return PushSub.deleteOne({ _id: s._id }); })));
}

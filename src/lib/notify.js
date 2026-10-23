import { Notification } from "../models/index.js";
import { emitTo } from "./realtime.js";
import { push } from "./push.js";

export async function notify(user, kind, text, link) {
  try { emitTo([user], "notification", await Notification.create({ user, kind, text, link })); } catch { /* best effort */ }
  push([user], { title: "Outsider", body: text, url: link ?? "/notifications", tag: kind }).catch(() => {});
}

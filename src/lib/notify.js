import { Notification } from "../models/index.js";
export const notify = (user, kind, text, link) => Notification.create({ user, kind, text, link }).catch(() => {});

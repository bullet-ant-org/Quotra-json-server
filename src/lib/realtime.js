import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { Conversation, User } from "../models/index.js";

let io = null;

// Each socket joins u:<userId>; events go to members' user rooms.
export function attach(server) {
  io = new Server(server, { cors: { origin: env.origins, credentials: true } });
  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.auth?.token ?? (socket.handshake.headers.cookie ?? "").match(/outsider_session=([^;]+)/)?.[1];
      const { sub, v } = jwt.verify(decodeURIComponent(raw ?? ""), env.jwt);
      const u = await User.findById(sub).select("tokenVersion status username");
      if (!u || (u.tokenVersion ?? 0) !== v || u.status === "suspended") return next(new Error("unauthorized"));
      socket.data.user = u; next();
    } catch { next(new Error("unauthorized")); }
  });
  io.on("connection", (socket) => {
    const me = socket.data.user;
    socket.join(`u:${me.id}`);
    socket.on("typing", async ({ conversationId }) => {
      const c = await Conversation.findOne({ _id: conversationId, members: me._id }).select("members").catch(() => null);
      c?.members.filter((m) => !m.equals(me._id)).forEach((m) => io.to(`u:${m}`).emit("typing", { conversationId, user: me.username }));
    });
  });
}

export const emitTo = (ids, event, payload) => { if (io) ids.forEach((id) => io.to(`u:${id}`).emit(event, payload)); };

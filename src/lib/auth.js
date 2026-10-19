import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { HttpError, forbidden } from "./http.js";
import { User } from "../models/index.js";

const COOKIE = "outsider_session";
const opts = { httpOnly: true, secure: env.prod, sameSite: env.prod ? "none" : "lax", maxAge: 30 * 864e5, path: "/" };

export function setSession(res, user) {
  const token = jwt.sign({ sub: user._id.toString(), v: user.tokenVersion ?? 0 }, env.jwt, { expiresIn: "30d" });
  res.cookie(COOKIE, token, opts);
}
export const clearSession = (res) => res.clearCookie(COOKIE, { ...opts, maxAge: undefined });

// Accepts the cookie or a Bearer token (for mobile clients).
export async function loadUser(req, _res, next) {
  const raw = req.cookies?.[COOKIE] ?? req.headers.authorization?.replace(/^Bearer /, "");
  if (!raw) return next();
  try {
    const { sub, v } = jwt.verify(raw, env.jwt);
    const u = await User.findById(sub);
    if (u && (u.tokenVersion ?? 0) === v && u.status !== "suspended") req.user = u;
  } catch { /* invalid or expired token: treat as signed out */ }
  next();
}

export const requireAuth = (req, _res, next) => (req.user ? next() : next(new HttpError(401, "Log in to continue.")));
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new HttpError(401, "Log in to continue."));
  if (!roles.includes(req.user.role)) return next(forbidden());
  next();
};

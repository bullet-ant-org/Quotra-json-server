import { getSettings } from "../lib/settings.js";
import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { Otp, User } from "../models/index.js";
import { bad, h, HttpError } from "../lib/http.js";
import { clearSession, requireAuth, setSession } from "../lib/auth.js";
import { otpEmail, sendMail, welcomeEmail } from "../lib/mail.js";
import { env } from "../lib/env.js";
import { moveTokens, tx } from "../lib/ledger.js";

const r = Router();
r.use(rateLimit({ windowMs: 15 * 60e3, limit: 60, standardHeaders: true, legacyHeaders: false }));

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const username = z.string().trim().toLowerCase().regex(/^[a-z0-9._]{3,20}$/, "Use 3 to 20 lowercase letters, numbers, dots or underscores.");
const WELCOME = 100;

async function issueOtp(addr, purpose, draft) {
  const code = String(crypto.randomInt(0, 1e6)).padStart(6, "0");
  await Otp.deleteMany({ email: addr, purpose });
  await Otp.create({ email: addr, purpose, draft, codeHash: await bcrypt.hash(code, 8), expiresAt: new Date(Date.now() + 10 * 60e3) });
  await sendMail(addr, purpose === "signup" ? "Your Outsider code" : "Your Outsider sign-in code", otpEmail(code, purpose));
}
async function checkOtp(addr, purpose, code) {
  const o = await Otp.findOne({ email: addr, purpose });
  if (!o || o.expiresAt < new Date()) throw bad("That code has expired. Ask for a new one.");
  if (o.attempts >= 5) throw bad("Too many tries. Ask for a new code.");
  if (!(await bcrypt.compare(String(code), o.codeHash))) { o.attempts++; await o.save(); throw bad("That code isn't right. Check your email and try again."); }
  await o.deleteOne();
  return o;
}
async function createUser(data) {
  return tx(async (s) => {
    const inviter = data.ref ? await User.findOne({ referralCode: String(data.ref).toLowerCase() }).select("_id").session(s) : null;
    const { ref: _ref, ...rest } = data;
    const [u] = await User.create([{ ...rest, emailVerified: true, referredBy: inviter?._id, referralCode: `${rest.username}${crypto.randomInt(100, 999)}`.toLowerCase() }], { session: s });
    await moveTokens(s, u._id, (await getSettings()).welcomeBonus, "bonus", "Welcome bonus", `welcome:${u._id}`);
    return u;
  }).then((u) => { sendMail(u.email, "Welcome to Outsider", welcomeEmail(u.firstName)).catch(() => {}); return u; });
}

r.get("/me", (req, res) => res.json({ user: req.user ?? null }));

// Change your own login email and/or password (current password required).
r.patch("/account", requireAuth, h(async (req, res) => {
  const d = z.object({ currentPassword: z.string().min(1), email: email.optional(), password: z.string().min(8, "Use at least 8 characters.").optional() }).parse(req.body);
  const u = await User.findById(req.user._id);
  if (!u.passwordHash || !(await bcrypt.compare(d.currentPassword, u.passwordHash))) throw bad("Your current password isn't right.");
  if (d.email && d.email !== u.email) { if (await User.exists({ email: d.email })) throw bad("That email is already used by another account."); u.email = d.email; }
  if (d.password) { u.passwordHash = await bcrypt.hash(d.password, 11); u.tokenVersion = (u.tokenVersion ?? 0) + 1; }
  await u.save();
  setSession(res, u);
  res.json({ user: u });
}));

r.post("/login", h(async (req, res) => {
  const { email: e, password } = z.object({ email, password: z.string().min(1) }).parse(req.body);
  const u = await User.findOne({ email: e });
  if (!u?.passwordHash || !(await bcrypt.compare(password, u.passwordHash))) throw new HttpError(401, "That email and password don't match.");
  if (u.status === "suspended") throw new HttpError(403, "This account is suspended.");
  setSession(res, u);
  res.json({ user: u });
}));

r.post("/logout", (_req, res) => { clearSession(res); res.json({ ok: true }); });

r.post("/username-available", h(async (req, res) => {
  const { username: n } = z.object({ username }).parse(req.body);
  res.json({ available: !(await User.exists({ username: n })) });
}));

r.post("/register/request-otp", h(async (req, res) => {
  const d = z.object({ firstName: z.string().trim().min(1).max(40), lastName: z.string().trim().max(40).default(""), username, email, password: z.string().min(10, "Use at least 10 characters."), ref: z.string().max(40).optional() }).parse(req.body);
  if (await User.exists({ email: d.email })) throw bad("An account with that email already exists. Log in instead.");
  if (await User.exists({ username: d.username })) throw bad(`@${d.username} is taken. Try another.`);
  const { password, ...rest } = d;
  await issueOtp(d.email, "signup", { ...rest, passwordHash: await bcrypt.hash(password, 11) });
  res.json({ ok: true });
}));

r.post("/register/verify-otp", h(async (req, res) => {
  const { email: e, code } = z.object({ email, code: z.string().length(6) }).parse(req.body);
  const o = await checkOtp(e, "signup", code);
  const u = await createUser(o.draft);
  setSession(res, u);
  res.status(201).json({ user: u });
}));

r.post("/password/request-otp", h(async (req, res) => {
  const { email: e } = z.object({ email }).parse(req.body);
  if (await User.exists({ email: e })) await issueOtp(e, "password");
  res.json({ ok: true }); // same answer either way so emails can't be probed
}));

r.post("/password/verify-otp", h(async (req, res) => {
  const { email: e, code, newPassword } = z.object({ email, code: z.string().length(6), newPassword: z.string().min(10).optional() }).parse(req.body);
  await checkOtp(e, "password", code);
  const u = await User.findOne({ email: e });
  if (!u) throw bad("Account not found.");
  if (newPassword) { u.passwordHash = await bcrypt.hash(newPassword, 11); u.tokenVersion++; await u.save(); }
  setSession(res, u);
  res.json({ user: u });
}));

// Google OAuth (authorization code flow). New Google users become explorers.
r.get("/google", (req, res) => {
  if (!env.googleId) return res.status(503).json({ message: "Google sign-in isn't configured." });
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("g_state", JSON.stringify({ state, next: String(req.query.next ?? "/home"), ref: req.query.ref ? String(req.query.ref).slice(0, 40) : undefined }), { httpOnly: true, maxAge: 600e3, sameSite: "lax", secure: env.prod });
  const q = new URLSearchParams({ client_id: env.googleId, redirect_uri: `${env.apiUrl}/v1/auth/google/callback`, response_type: "code", scope: "openid email profile", state, prompt: "select_account" });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
});

r.get("/google/callback", h(async (req, res) => {
  const saved = JSON.parse(req.cookies.g_state ?? "{}");
  res.clearCookie("g_state");
  if (!req.query.code || req.query.state !== saved.state) return res.redirect(`${env.clientUrl}/login?error=google`);
  const tok = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: String(req.query.code), client_id: env.googleId, client_secret: env.googleSecret, redirect_uri: `${env.apiUrl}/v1/auth/google/callback`, grant_type: "authorization_code" }) }).then((x) => x.json());
  const info = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tok.access_token}` } }).then((x) => x.json());
  if (!info.email || !info.email_verified) return res.redirect(`${env.clientUrl}/login?error=google`);
  let u = await User.findOne({ $or: [{ googleId: info.sub }, { email: info.email.toLowerCase() }] });
  if (!u) {
    let base = info.email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 14) || "outsider";
    if (base.length < 3) base += "out";
    let name = base; while (await User.exists({ username: name })) name = `${base}${crypto.randomInt(100, 9999)}`;
    u = await createUser({ email: info.email, googleId: info.sub, firstName: info.given_name ?? "Outsider", lastName: info.family_name ?? "", username: name, avatar: info.picture, ref: saved.ref });
  } else if (!u.googleId) { u.googleId = info.sub; await u.save(); }
  if (u.status === "suspended") return res.redirect(`${env.clientUrl}/login?error=suspended`);
  setSession(res, u);
  const home = u.role === "admin" ? "/admin" : u.role === "brand" ? "/brand" : saved.next?.startsWith("/") ? saved.next : "/home";
  res.redirect(env.clientUrl + home);
}));

export default r;

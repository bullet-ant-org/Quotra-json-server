import { Router } from "express";
import crypto from "node:crypto";
import { env } from "../lib/env.js";
import { h, HttpError } from "../lib/http.js";
import { requireAuth } from "../lib/auth.js";

const r = Router();
// Signed direct upload: the file goes browser → Cloudinary; the secret stays here.
r.post("/sign", requireAuth, h(async (req, res) => {
  const { cloud, key, secret } = env.cloudinary;
  if (!cloud || !key || !secret) throw new HttpError(503, "Uploads aren't configured yet.");
  const timestamp = Math.floor(Date.now() / 1000), folder = `outsider/${req.user.id}`;
  const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  res.json({ apiKey: key, timestamp, folder, signature, uploadUrl: `https://api.cloudinary.com/v1_1/${cloud}/auto/upload` });
}));
export default r;

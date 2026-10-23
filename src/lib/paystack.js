import crypto from "node:crypto";
import { env } from "./env.js";

async function call(method, path, body) {
  if (!env.paystackKey) throw Object.assign(new Error("Payments aren't configured yet."), { status: 503 });
  const res = await fetch(`https://api.paystack.co${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.paystackKey}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || data.status === false) throw Object.assign(new Error(data.message ?? "Paystack request failed"), { status: 502 });
  return data.data;
}

export const paystack = {
  createPlan: (p) => call("POST", "/plan", p),
  updatePlan: (code, p) => call("PUT", `/plan/${code}`, p),
  initialize: (p) => call("POST", "/transaction/initialize", p),
  verify: (ref) => call("GET", `/transaction/verify/${encodeURIComponent(ref)}`),
  disableSubscription: (code, token) => call("POST", "/subscription/disable", { code, token }),
  manageLink: (code) => call("GET", `/subscription/${code}/manage/link`),
};

// Paystack signs webhooks with HMAC-SHA512 of the raw body using the secret key.
export function validSignature(raw, sig) {
  if (!env.paystackKey || !sig) return false;
  const expected = crypto.createHmac("sha512", env.paystackKey).update(raw).digest("hex");
  return expected.length === sig.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

// Creates Paystack plans for any local plan missing a plan_code. Runs on start; skipped without a key.
export async function syncPaystackPlans() {
  if (!env.paystackKey) return;
  const { Plan } = await import("../models/index.js");
  for (const p of await Plan.find({ code: { $exists: false } })) {
    try { const ps = await paystack.createPlan({ name: `Outsider ${p.name}`, amount: p.amount * 100, interval: p.interval, currency: "NGN" }); p.code = ps.plan_code; await p.save(); }
    catch (e) { console.error(`Paystack plan ${p.name}:`, e.message); }
  }
}

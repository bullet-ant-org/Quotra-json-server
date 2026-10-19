import { Router } from "express";
import express from "express";
import { z } from "zod";
import { Plan, Subscription, User } from "../models/index.js";
import { bad, h, notFound } from "../lib/http.js";
import { requireRole } from "../lib/auth.js";
import { paystack, validSignature } from "../lib/paystack.js";
import { env } from "../lib/env.js";
import { sendMail, simpleEmail } from "../lib/mail.js";

const r = Router();

r.get("/plans", h(async (_req, res) => res.json({ items: await Plan.find({ active: true }).sort({ amount: 1 }) })));

// Admin: create/update a plan locally and on Paystack (amount in naira).
r.post("/plans", requireRole("admin"), h(async (req, res) => {
  const d = z.object({ name: z.string().min(2), amount: z.number().int().min(100), interval: z.enum(["monthly", "quarterly", "annually"]), features: z.array(z.string()).default([]),
    limits: z.object({ places: z.number().int().min(1), staff: z.number().int().min(1), ads: z.number().int().min(0) }) }).parse(req.body);
  const ps = await paystack.createPlan({ name: `Outsider ${d.name}`, amount: d.amount * 100, interval: d.interval, currency: "NGN" });
  res.status(201).json({ plan: await Plan.create({ ...d, code: ps.plan_code }) });
}));

r.get("/subscription", requireRole("brand"), h(async (req, res) => {
  res.json({ subscription: await Subscription.findOne({ brand: req.user._id }).sort({ createdAt: -1 }).populate("plan") });
}));

// Start checkout. Paystack returns a hosted payment URL; the subscription activates only via webhook/verify.
r.post("/subscribe", requireRole("brand"), h(async (req, res) => {
  const { planId } = z.object({ planId: z.string() }).parse(req.body);
  const plan = await Plan.findOne({ _id: planId, active: true });
  if (!plan?.code) throw notFound("Plan not found");
  if (await Subscription.exists({ brand: req.user._id, status: "active" })) throw bad("You already have an active plan. Manage it to change plans.");
  const init = await paystack.initialize({ email: req.user.email, amount: plan.amount * 100, plan: plan.code, callback_url: `${env.clientUrl}/brand/billing`, metadata: { brandId: req.user.id, planId: plan.id } });
  await Subscription.create({ brand: req.user._id, plan: plan._id, status: "pending", reference: init.reference });
  res.json({ authorizationUrl: init.authorization_url, reference: init.reference });
}));

// Called by the frontend after redirect. Never trusts the redirect itself; asks Paystack.
r.get("/verify/:reference", requireRole("brand"), h(async (req, res) => {
  const t = await paystack.verify(req.params.reference);
  const sub = await Subscription.findOne({ reference: req.params.reference, brand: req.user._id });
  if (!sub) throw notFound();
  if (t.status === "success" && sub.status === "pending") { sub.status = "active"; sub.customerCode = t.customer?.customer_code; await sub.save(); }
  res.json({ status: sub.status });
}));

r.post("/manage", requireRole("brand"), h(async (req, res) => {
  const sub = await Subscription.findOne({ brand: req.user._id, status: "active" });
  if (!sub?.paystackCode) throw bad("No active subscription to manage yet.");
  res.json({ link: (await paystack.manageLink(sub.paystackCode)).link });
}));

r.post("/cancel", requireRole("brand"), h(async (req, res) => {
  const sub = await Subscription.findOne({ brand: req.user._id, status: "active" });
  if (!sub?.paystackCode || !sub.emailToken) throw bad("No active subscription to cancel.");
  await paystack.disableSubscription(sub.paystackCode, sub.emailToken);
  sub.status = "cancelled"; await sub.save();
  res.json({ ok: true });
}));

// Paystack webhook: mounted with a raw body parser so the signature can be checked.
export const webhook = [express.raw({ type: "application/json" }), h(async (req, res) => {
  if (!validSignature(req.body, req.headers["x-paystack-signature"])) return res.sendStatus(401);
  const { event, data } = JSON.parse(req.body.toString());
  const user = data?.customer?.email ? await User.findOne({ email: data.customer.email.toLowerCase() }) : null;
  if (!user) return res.sendStatus(200);
  const plan = data.plan?.plan_code ? await Plan.findOne({ code: data.plan.plan_code }) : null;
  const latest = () => Subscription.findOne({ brand: user._id, ...(plan ? { plan: plan._id } : {}) }).sort({ createdAt: -1 });

  if (event === "subscription.create") {
    const sub = (await latest()) ?? new Subscription({ brand: user._id, plan: plan?._id });
    Object.assign(sub, { status: "active", paystackCode: data.subscription_code, emailToken: data.email_token, customerCode: data.customer.customer_code, nextPaymentDate: data.next_payment_date });
    await sub.save();
    sendMail(user.email, "Your Outsider plan is active", simpleEmail("You're subscribed", `Your ${plan?.name ?? ""} plan is active. Thanks for growing with Outsider.`)).catch(() => {});
  } else if (event === "charge.success" && plan) {
    const sub = await latest();
    if (sub && sub.status !== "cancelled") { sub.status = "active"; await sub.save(); }
  } else if (["subscription.disable", "subscription.not_renew"].includes(event)) {
    await Subscription.updateOne({ paystackCode: data.subscription_code }, { status: event === "subscription.disable" ? "cancelled" : "non-renewing" });
  } else if (event === "invoice.payment_failed") {
    await Subscription.updateOne({ paystackCode: data.subscription?.subscription_code }, { status: "past_due" });
    sendMail(user.email, "Payment failed", simpleEmail("We couldn't renew your plan", "Update your card in billing to keep your plan active.")).catch(() => {});
  }
  res.sendStatus(200);
})];

export default r;

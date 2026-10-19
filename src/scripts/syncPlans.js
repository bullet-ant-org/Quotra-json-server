// Creates any local plan without a Paystack plan_code on Paystack. Run after `npm run seed`.
import mongoose from "mongoose";
import { env } from "../lib/env.js";
import { Plan } from "../models/index.js";
import { paystack } from "../lib/paystack.js";

await mongoose.connect(env.mongo);
for (const p of await Plan.find({ code: { $exists: false } })) {
  const ps = await paystack.createPlan({ name: `Outsider ${p.name}`, amount: p.amount * 100, interval: p.interval, currency: "NGN" });
  p.code = ps.plan_code; await p.save();
  console.log(`${p.name} → ${p.code}`);
}
await mongoose.disconnect();

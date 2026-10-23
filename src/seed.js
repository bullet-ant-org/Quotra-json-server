// Manual seed: `npm run seed`. Same as first-run setup, plus optional demo user/brand accounts (SEED_DEMO_ACCOUNTS=true).
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./lib/env.js";
import { Place, User, Txn } from "./models/index.js";
import { ensureAdmin, seedBase } from "./lib/bootstrap.js";

await mongoose.connect(env.mongo);
await ensureAdmin();
let brand = null;
if (process.env.SEED_DEMO_ACCOUNTS === "true") {
  const hash = await bcrypt.hash("12345678", 11);
  for (const [email, role, firstName, lastName, username] of [["user@gmail.com", "user", "Ada", "Obi", "ada.obi"], ["brand@gmail.com", "brand", "Palmfringe", "Resort", "palmfringe"]]) {
    const u = await User.findOneAndUpdate({ email }, { $setOnInsert: { email, role, firstName, lastName, username, passwordHash: hash, emailVerified: true, balance: role === "user" ? 420 : 0 } }, { upsert: true, returnDocument: "after" });
    if (role === "user") await Txn.updateOne({ ref: `seed:${u._id}` }, { $setOnInsert: { user: u._id, amount: 420, kind: "bonus", label: "Welcome bonus", ref: `seed:${u._id}` } }, { upsert: true });
    if (role === "brand") brand = u;
    console.log(`demo ${role}: ${email}`);
  }
}
await seedBase({ owner: brand?._id });
if (brand) await Place.updateOne({ slug: "palmfringe-beach-resort", owner: { $exists: false } }, { owner: brand._id });
console.log("seed done");
await mongoose.disconnect();

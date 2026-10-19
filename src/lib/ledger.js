import mongoose from "mongoose";
import { Txn, User } from "../models/index.js";
import { bad } from "./http.js";

// All balance changes go through here, inside a transaction, with a unique ref for idempotency.
export async function moveTokens(session, userId, amount, kind, label, ref) {
  const filter = amount < 0 ? { _id: userId, balance: { $gte: -amount } } : { _id: userId };
  const r = await User.updateOne(filter, { $inc: { balance: amount } }, { session });
  if (!r.modifiedCount) throw bad(amount < 0 ? "You don't have enough tokens." : "Account not found.");
  await Txn.create([{ user: userId, amount, kind, label, ref }], { session });
}

export async function tx(fn) {
  const s = await mongoose.startSession();
  try { let out; await s.withTransaction(async () => { out = await fn(s); }); return out; }
  finally { await s.endSession(); }
}

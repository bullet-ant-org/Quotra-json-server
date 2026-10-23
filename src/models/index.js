import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;
const id = (ref) => ({ type: Schema.Types.ObjectId, ref });
const point = new Schema({ type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], required: true } }, { _id: false }); // [lng, lat]
const opts = { timestamps: true, toJSON: { virtuals: true, versionKey: false, transform: (_d, r) => { delete r._id; delete r.passwordHash; delete r.tokenVersion; return r; } } };

export const User = model("User", new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: String,
  googleId: { type: String, index: true, sparse: true },
  role: { type: String, enum: ["user", "brand", "admin"], default: "user", index: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, default: "", trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9._]{3,20}$/ },
  avatar: String, cover: String, bio: { type: String, maxlength: 300 }, city: String,
  interests: { type: Map, of: Number, default: {} }, // learned topic affinity used by the feed algorithm
  referredBy: id("User"), referralCode: { type: String, unique: true, sparse: true },
  balance: { type: Number, default: 0, min: 0 },
  adCredits: { type: Number, default: 0, min: 0 }, // brands only; bought with Paystack, separate from plans // token wallet; only changed through ledger helpers
  following: [id("User")], blocked: [id("User")],
  settings: { publicProfile: { type: Boolean, default: true }, showCheckins: { type: Boolean, default: false }, openMessages: { type: Boolean, default: false } },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  emailVerified: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0 },
}, opts));

export const Otp = model("Otp", new Schema({
  email: { type: String, index: true }, purpose: { type: String, enum: ["signup", "password"] },
  codeHash: String, attempts: { type: Number, default: 0 }, draft: Object,
  expiresAt: { type: Date, index: { expires: 0 } },
}, { timestamps: true }));

export const Place = model("Place", new Schema({
  slug: { type: String, unique: true }, name: { type: String, required: true }, owner: id("User"),
  category: { type: String, index: true }, subcategory: String, description: String,
  address: String, city: { type: String, index: true }, state: String, location: { type: point, required: true },
  photos: [String], facilities: [String], hours: String, priceFrom: Number, phone: String, website: String,
  rating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 },
  checkInTokens: Number /* unset → platform default */, checkInRadiusM: { type: Number, default: 200 },
  verified: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "live", "rejected", "closed"], default: "pending", index: true },
}, opts).index({ location: "2dsphere" }).index({ name: "text", city: "text", description: "text", facilities: "text" }));

const media = new Schema({ type: { type: String, enum: ["image", "video"] }, src: String }, { _id: false });
export const Post = model("Post", new Schema({
  author: id("User"), text: { type: String, maxlength: 5000 }, media: [media],
  place: id("Place"), placeCategory: String, tags: [id("User")], hashtags: { type: [String], index: true },
  stats: { impressions: { type: Number, default: 0 }, dwellMs: { type: Number, default: 0 } }, rewarded: { views: { type: Number, default: 0 }, likes: { type: Number, default: 0 }, comments: { type: Number, default: 0 } },
  likes: [id("User")], reposts: { type: Number, default: 0 }, views: { type: Number, default: 0 }, commentCount: { type: Number, default: 0 }, shares: { type: Number, default: 0 }, saves: { type: Number, default: 0 }, repostOf: id("Post"),
  comments: [{ author: id("User"), text: String, at: { type: Date, default: Date.now } }],
  party: { date: Date, max: Number, going: [id("User")] },
  sponsored: { type: Boolean, default: false }, removed: { type: Boolean, default: false },
}, opts).index({ createdAt: -1 }));

export const Story = model("Story", new Schema({ author: id("User"), src: String, expiresAt: { type: Date, index: { expires: 0 } } }, opts));
export const Highlight = model("Highlight", new Schema({ owner: id("User"), name: String, cover: String, items: [String] }, opts));

export const Event = model("Event", new Schema({
  title: String, venue: String, place: id("Place"), host: id("User"), date: { type: Date, index: true }, img: String, price: String,
  location: { type: point, default: undefined }, slots: Number, tokenCost: Number, reserved: [id("User")],
}, opts).index({ location: "2dsphere" }, { sparse: true }));

export const Pass = model("Pass", new Schema({
  place: id("Place"), title: String, perPerson: Number, budget: Number, slots: Number,
  date: { type: Date, index: true }, claimed: [id("User")], active: { type: Boolean, default: true }, createdBy: id("User"),
}, opts));

// Immutable token ledger. Corrections are new rows, never edits.
export const Txn = model("Txn", new Schema({
  user: { ...id("User"), index: true }, amount: Number, kind: String, label: String, ref: { type: String, unique: true, sparse: true },
}, opts));

export const CheckIn = model("CheckIn", new Schema({ user: id("User"), place: id("Place"), distanceM: Number, accuracyM: Number, status: String, bonus: { type: Boolean, default: false } }, opts).index({ user: 1, place: 1, createdAt: -1 }));
export const Ad = model("Ad", new Schema({ format: { type: String, enum: ["feed", "reel", "story"], default: "feed" }, brand: id("User"), title: String, body: String, img: String, budget: Number, reach: { type: Number, default: 0 }, clicks: { type: Number, default: 0 }, credits: Number, spent: { type: Number, default: 0 }, objective: String, days: Number, city: String, interests: [String], ages: [Number], cta: String, place: id("Place"), status: { type: String, enum: ["review", "live", "paused", "rejected"], default: "review" } }, opts));
export const VisitRequest = model("VisitRequest", new Schema({ from: id("User"), place: id("Place"), brand: id("User"), date: Date, people: Number, note: String, status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" } }, opts));
export const Conversation = model("Conversation", new Schema({ members: [{ ...id("User"), index: true }], name: String, lastText: String, lastAt: Date }, opts));
export const Message = model("Message", new Schema({ conversation: { ...id("Conversation"), index: true }, from: id("User"),
  kind: { type: String, enum: ["text", "image", "video", "audio", "location", "poll", "post"], default: "text" }, text: String, src: String, media: [media],
  place: String, post: id("Post"), poll: { question: String, options: [{ _id: false, label: String, place: String, votes: [id("User")] }] }, readBy: [id("User")] }, opts));
export const PushSub = model("PushSub", new Schema({ user: { ...id("User"), index: true }, endpoint: { type: String, unique: true }, keys: { p256dh: String, auth: String } }, opts));
// Seasonal top reward bought with tokens (e.g. a trip), limited spots.
export const Bounty = model("Bounty", new Schema({ title: String, description: String, reward: Number, starts: Date, ends: Date, active: { type: Boolean, default: true }, slots: Number, claimed: [id("User")], img: String }, opts));
export const Notification = model("Notification", new Schema({ user: { ...id("User"), index: true }, kind: String, text: String, link: String, read: { type: Boolean, default: false } }, opts));
export const Report = model("Report", new Schema({ by: id("User"), target: String, targetId: String, reason: String, status: { type: String, default: "open" } }, opts));

export const Plan = model("Plan", new Schema({
  name: String, code: { type: String, unique: true, sparse: true }, // Paystack plan_code
  amount: Number, interval: { type: String, enum: ["monthly", "quarterly", "annually"], default: "monthly" },
  features: [String], limits: { places: Number, staff: Number, ads: Number }, active: { type: Boolean, default: true },
}, opts));
export const Subscription = model("Subscription", new Schema({
  brand: { ...id("User"), index: true }, plan: id("Plan"), status: { type: String, default: "pending" },
  paystackCode: String, emailToken: String, customerCode: String, nextPaymentDate: Date, reference: String,
}, opts));

export const Setting = model("Setting", new Schema({ key: { type: String, unique: true }, value: Object }, opts));
export const CreditPurchase = model("CreditPurchase", new Schema({ brand: id("User"), credits: Number, amount: Number, reference: { type: String, unique: true }, status: { type: String, default: "pending" } }, opts));
export const getAdSettings = async () => { const s = await (await import("../lib/settings.js")).getSettings(); return { pricePerCredit: s.pricePerCredit, minCredits: s.minCredits, creditsPer1k: s.creditsPer1k, creditsPer1kViews: s.creditsPer1k.feed }; };

export const oid = (s) => new Types.ObjectId(s);

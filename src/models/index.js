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
  interests: [String],
  balance: { type: Number, default: 0, min: 0 }, // token wallet; only changed through ledger helpers
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
  checkInTokens: { type: Number, default: 10 }, checkInRadiusM: { type: Number, default: 200 },
  verified: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "live", "rejected", "closed"], default: "pending", index: true },
}, opts).index({ location: "2dsphere" }).index({ name: "text", city: "text", description: "text", facilities: "text" }));

const media = new Schema({ type: { type: String, enum: ["image", "video"] }, src: String }, { _id: false });
export const Post = model("Post", new Schema({
  author: id("User"), text: { type: String, maxlength: 5000 }, media: [media],
  place: id("Place"), tags: [id("User")], hashtags: { type: [String], index: true },
  likes: [id("User")], reposts: { type: Number, default: 0 }, repostOf: id("Post"),
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

export const CheckIn = model("CheckIn", new Schema({ user: id("User"), place: id("Place"), distanceM: Number, accuracyM: Number, status: String }, opts).index({ user: 1, place: 1, createdAt: -1 }));
export const Ad = model("Ad", new Schema({ brand: id("User"), title: String, body: String, img: String, budget: Number, reach: { type: Number, default: 0 }, status: { type: String, enum: ["review", "live", "paused", "rejected"], default: "review" } }, opts));
export const VisitRequest = model("VisitRequest", new Schema({ from: id("User"), place: id("Place"), brand: id("User"), date: Date, people: Number, note: String, status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" } }, opts));
export const Conversation = model("Conversation", new Schema({ members: [{ ...id("User"), index: true }], name: String, lastText: String, lastAt: Date }, opts));
export const Message = model("Message", new Schema({ conversation: { ...id("Conversation"), index: true }, from: id("User"), text: String, media: [media], readBy: [id("User")] }, opts));
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

export const oid = (s) => new Types.ObjectId(s);

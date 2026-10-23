import { Setting } from "../models/index.js";

// Every price and reward on the platform, editable by admins. Defaults apply until changed.
export const DEFAULTS = {
  // Ads
  pricePerCredit: 50,            // ₦ per ad credit
  minCredits: 100,               // minimum purchase
  creditsPer1k: { feed: 20, reel: 30, story: 15 }, // credits spent per 1,000 ad views, by placement
  adEvery: 5,                    // one ad after every N organic items
  adFormats: { feed: true, reel: true, story: false },
  // Rewards
  checkInTokens: 10,             // default per place (places can override)
  postBonus: 25,                 // posting at a place within 24h of checking in
  referralPerCheckin: 1,         // inviter earns per invitee check-in
  welcomeBonus: 100,
  creator: { per1kViews: 5, per1kLikes: 40, per100Comments: 20, maxPerPostPerDay: 500 },
  // Algorithm
  exploreRate: 0.2,              // share of the feed reserved for outside-your-interests posts
  testAudience: 100,             // impressions before a post must prove itself
  minEngagementRate: 0.04,       // weighted engagement / impressions needed to keep spreading
};

let cache = null, at = 0;
export async function getSettings() {
  if (cache && Date.now() - at < 30e3) return cache;
  const doc = await Setting.findOne({ key: "platform" });
  cache = deepMerge(structuredClone(DEFAULTS), doc?.value ?? {}); at = Date.now();
  return cache;
}
export async function saveSettings(patch) {
  const merged = deepMerge(await getSettings(), patch);
  await Setting.updateOne({ key: "platform" }, { value: merged }, { upsert: true });
  cache = merged; at = Date.now();
  return merged;
}
function deepMerge(a, b) {
  for (const [k, v] of Object.entries(b ?? {})) a[k] = v && typeof v === "object" && !Array.isArray(v) ? deepMerge(a[k] ?? {}, v) : v;
  return a;
}

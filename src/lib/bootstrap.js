// First-run setup, called on every server start (all steps are idempotent).
// 1. Creates the admin login from ADMIN_EMAIL / ADMIN_PASSWORD if no admin exists yet. Change it later in the admin panel.
// 2. Seeds starter places, subscription plans and the summer top reward if those collections are empty.
import bcrypt from "bcryptjs";
import { Bounty, Place, Plan, User } from "../models/index.js";

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;
const places = [
  ["palmfringe-beach-resort", "Palmfringe Beach Resort", "accommodation", "Resort", "Lekki", "Lagos", 6.4698, 3.6, 45000, 50, "1540541338287-41700207dee6", ["Swimming pool", "Beachfront", "Restaurant", "Parking"]],
  ["ogbunike-falls-lookout", "Ogbunike Falls Lookout", "nature", "Waterfall", "Ogbunike", "Anambra", 6.1587, 6.8777, 2000, 30, "1432405972618-c60b0225b8f9", ["Guided walks", "Viewpoint"]],
  ["kora-terrace-kitchen", "Kora Terrace Kitchen", "dining", "Rooftop dining", "Port Harcourt", "Rivers", 4.8156, 7.0498, 6500, 20, "1517248135467-4c7edcad34c4", ["Rooftop", "Reservations"]],
  ["lakeside-gardens-calabar", "Lakeside Gardens Calabar", "nature", "Gardens", "Calabar", "Cross River", 4.9757, 8.3417, 1500, 20, "1501594907352-04cda38ebc29", ["Picnic area", "Boat rides"]],
  ["arewa-heritage-museum", "Arewa Heritage Museum", "culture", "Museum", "Kano", "Kano", 12.0022, 8.5919, 1000, 30, "1554907984-15263bfd63bd", ["Guided tours", "Gift shop"]],
  ["skyline-lounge-abuja", "Skyline Lounge", "nightlife", "Lounge", "Abuja", "FCT", 9.0765, 7.3986, 8000, 20, "1470337458703-46ad1756a187", ["Live DJ", "Reservations"]],
  ["waveform-water-park", "Waveform Water Park", "recreation", "Amusement park", "Port Harcourt", "Rivers", 4.8472, 7.0, 5000, 30, "1520250497591-112f2f40a3f4", ["Water slides", "Lockers"]],
  ["harbour-view-boat-club", "Harbour View Boat Club", "events", "Boat excursions", "Victoria Island", "Lagos", 6.4281, 3.4219, 15000, 30, "1544551763-46a013bb70d5", ["Private charters"]],
  ["obudu-ridge-camp", "Obudu Ridge Camp", "events", "Camping", "Obudu", "Cross River", 6.3833, 9.3667, 12000, 50, "1504280390367-361c6d9f38f4", ["Tents provided", "Guided hikes"]],
  ["marina-bean-cafe", "Marina Bean Café", "dining", "Café", "Lagos Island", "Lagos", 6.4531, 3.3958, 2500, 10, "1495474472287-4d71bcdd2085", ["Wi-Fi", "Takeaway"]],
];
const plans = [
  { name: "Starter", amount: 5000, interval: "monthly", features: ["2 places", "2 live ads", "Visit requests"], limits: { places: 2, staff: 2, ads: 2 } },
  { name: "Growth", amount: 15000, interval: "monthly", features: ["5 places", "10 live ads", "Analytics", "Priority review"], limits: { places: 5, staff: 5, ads: 10 } },
  { name: "Pro", amount: 40000, interval: "monthly", features: ["20 places", "Unlimited ads", "Team accounts", "Sponsored placement"], limits: { places: 20, staff: 20, ads: 1000 } },
];


export async function ensureAdmin() {
  if (await User.exists({ role: "admin" })) return;
  const email = (process.env.ADMIN_EMAIL ?? "admin@gmail.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "12345678";
  await User.updateOne({ email }, { $set: { role: "admin" }, $setOnInsert: { email, firstName: "Outsider", lastName: "Admin", username: "admin", passwordHash: await bcrypt.hash(password, 11), emailVerified: true } }, { upsert: true });
  console.log(`Created admin login ${email}. Change the password in Admin → Platform settings.`);
}

export async function seedBase({ owner } = {}) {
  if (!(await Place.exists({}))) {
    for (const [slug, name, category, subcategory, city, state, lat, lng, priceFrom, checkInTokens, photo, facilities] of places)
      await Place.updateOne({ slug }, { $set: { name, category, subcategory, city, state, priceFrom, checkInTokens, facilities, photos: [U(photo)], status: "live", verified: true, location: { type: "Point", coordinates: [lng, lat] }, ...(slug === "palmfringe-beach-resort" && owner ? { owner } : {}) } }, { upsert: true });
  }
  if (!(await Plan.exists({}))) for (const p of plans) await Plan.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
  if (!(await Bounty.exists({}))) {
    const y = new Date().getUTCFullYear();
    await Bounty.create({ title: "Zanzibar summer trip for two", description: "Flights and 3 nights in Zanzibar for you and a friend.", reward: 10000, slots: 2, starts: new Date(Date.UTC(y, 5, 1)), ends: new Date(Date.UTC(y, 8, 1)), active: true });
  }
}

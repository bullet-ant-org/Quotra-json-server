// DEV FIXTURE: sample listings with fictional business names so nothing here
// can be mistaken for a real venue. Replace with the destinations API.
import type { CategoryId } from "./categories";

export interface Destination {
  slug: string;
  name: string;
  category: CategoryId;
  subcategory: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  priceFrom: number | null;
  verified: boolean;
  tokenOffer: string | null;
  checkInTokens: number;
  facilities: string[];
  description: string;
  hours: string;
  hue: number;
}

export const destinations: Destination[] = [
  {
    slug: "palmfringe-beach-resort", name: "Palmfringe Beach Resort", category: "accommodation", subcategory: "Resort",
    city: "Lekki", state: "Lagos", lat: 6.4698, lng: 3.6, rating: 4.6, reviewCount: 212, priceFrom: 45000, verified: true,
    tokenOffer: "Day pool pass for 100 tokens", checkInTokens: 50,
    facilities: ["Swimming pool", "Beachfront", "Restaurant", "Parking", "Family friendly", "Wi-Fi"],
    description: "A beachfront resort with two pools, a shaded boardwalk and a kitchen that serves until late. Day passes are open to non-guests on weekdays.",
    hours: "Daily, 8:00 am to 10:00 pm", hue: 28,
  },
  {
    slug: "ogbunike-falls-lookout", name: "Ogbunike Falls Lookout", category: "nature", subcategory: "Waterfall",
    city: "Ogbunike", state: "Anambra", lat: 6.1587, lng: 6.8777, rating: 4.8, reviewCount: 340, priceFrom: 2000, verified: true,
    tokenOffer: null, checkInTokens: 30,
    facilities: ["Guided walks", "Viewpoint", "Parking", "Photography"],
    description: "A stepped descent through forest to a cascade you hear before you see. Wear shoes with grip; the final stairs are slick after rain.",
    hours: "Daily, 8:00 am to 5:00 pm", hue: 150,
  },
  {
    slug: "kora-terrace-kitchen", name: "Kora Terrace Kitchen", category: "dining", subcategory: "Rooftop dining",
    city: "Port Harcourt", state: "Rivers", lat: 4.8156, lng: 7.0498, rating: 4.4, reviewCount: 158, priceFrom: 6500, verified: true,
    tokenOffer: "Complimentary drink for 40 tokens", checkInTokens: 20,
    facilities: ["Rooftop", "Reservations", "Outdoor seating", "Card payments"],
    description: "Charcoal-grilled fish and small plates on a rooftop that catches the evening breeze. Book ahead on Fridays.",
    hours: "Tue to Sun, 12:00 pm to 11:00 pm", hue: 12,
  },
  {
    slug: "lakeside-gardens-calabar", name: "Lakeside Gardens Calabar", category: "nature", subcategory: "Gardens",
    city: "Calabar", state: "Cross River", lat: 4.9757, lng: 8.3417, rating: 4.3, reviewCount: 96, priceFrom: 1500, verified: false,
    tokenOffer: null, checkInTokens: 20,
    facilities: ["Picnic area", "Boat rides", "Family friendly", "Parking"],
    description: "Landscaped gardens along a quiet lake with picnic lawns and pedal boats. Quietest on weekday mornings.",
    hours: "Daily, 9:00 am to 6:00 pm", hue: 95,
  },
  {
    slug: "arewa-heritage-museum", name: "Arewa Heritage Museum", category: "culture", subcategory: "Museum",
    city: "Kano", state: "Kano", lat: 12.0022, lng: 8.5919, rating: 4.7, reviewCount: 121, priceFrom: 1000, verified: true,
    tokenOffer: "Free guided tour for 60 tokens", checkInTokens: 30,
    facilities: ["Guided tours", "Gift shop", "Accessible entrance", "Air conditioned"],
    description: "Textiles, metalwork and oral-history recordings from across the region, with guides who know the stories behind each room.",
    hours: "Mon to Sat, 9:00 am to 5:00 pm", hue: 40,
  },
  {
    slug: "skyline-lounge-abuja", name: "Skyline Lounge", category: "nightlife", subcategory: "Lounge",
    city: "Abuja", state: "FCT", lat: 9.0765, lng: 7.3986, rating: 4.1, reviewCount: 83, priceFrom: 8000, verified: true,
    tokenOffer: null, checkInTokens: 20,
    facilities: ["Live DJ", "Bottle service", "Reservations", "Valet parking"],
    description: "A two-floor lounge with a live DJ from Thursday. Smart-casual dress code after 9 pm.",
    hours: "Wed to Sun, 6:00 pm to 2:00 am", hue: 280,
  },
  {
    slug: "waveform-water-park", name: "Waveform Water Park", category: "recreation", subcategory: "Amusement park",
    city: "Port Harcourt", state: "Rivers", lat: 4.8472, lng: 7.0, rating: 4.5, reviewCount: 274, priceFrom: 5000, verified: true,
    tokenOffer: "Entry ticket for 150 tokens", checkInTokens: 30,
    facilities: ["Water slides", "Lockers", "Food court", "Lifeguards", "Family friendly"],
    description: "Eight slides, a lazy river and a toddler splash area. Lockers and towels are available at the gate.",
    hours: "Daily, 10:00 am to 7:00 pm", hue: 200,
  },
  {
    slug: "harbour-view-boat-club", name: "Harbour View Boat Club", category: "events", subcategory: "Boat excursions",
    city: "Victoria Island", state: "Lagos", lat: 6.4281, lng: 3.4219, rating: 4.2, reviewCount: 64, priceFrom: 15000, verified: false,
    tokenOffer: null, checkInTokens: 30,
    facilities: ["Private charters", "Life jackets", "Catering", "Sunset cruises"],
    description: "Sunset cruises and private charters across the lagoon, with catering on request.",
    hours: "Daily, 10:00 am to 8:00 pm", hue: 215,
  },
  {
    slug: "obudu-ridge-camp", name: "Obudu Ridge Camp", category: "events", subcategory: "Camping",
    city: "Obudu", state: "Cross River", lat: 6.3833, lng: 9.3667, rating: 4.9, reviewCount: 187, priceFrom: 12000, verified: true,
    tokenOffer: "Campfire evening for 120 tokens", checkInTokens: 50,
    facilities: ["Tents provided", "Guided hikes", "Campfire", "Cable car access"],
    description: "Pitch or borrow a tent on the plateau, hike at dawn and watch cloud roll through the valley below.",
    hours: "Daily, check in from 2:00 pm", hue: 140,
  },
  {
    slug: "marina-bean-cafe", name: "Marina Bean Café", category: "dining", subcategory: "Café",
    city: "Lagos Island", state: "Lagos", lat: 6.4531, lng: 3.3958, rating: 4.0, reviewCount: 52, priceFrom: 2500, verified: false,
    tokenOffer: null, checkInTokens: 10,
    facilities: ["Wi-Fi", "Power sockets", "Vegetarian options", "Takeaway"],
    description: "A small café that opens early, roasts its own beans and doesn't mind if you stay all afternoon.",
    hours: "Daily, 7:00 am to 8:00 pm", hue: 20,
  },
];

export const bySlug = (slug: string) => destinations.find((d) => d.slug === slug);

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

import { PH, photo } from "../lib/media";
const photoBySlug: Record<string, string> = {
  "palmfringe-beach-resort": PH.resort, "ogbunike-falls-lookout": PH.waterfall, "kora-terrace-kitchen": PH.rooftop,
  "lakeside-gardens-calabar": PH.lake, "arewa-heritage-museum": PH.museum, "skyline-lounge-abuja": PH.lounge,
  "waveform-water-park": PH.waterpark, "harbour-view-boat-club": PH.boat, "obudu-ridge-camp": PH.camp, "marina-bean-cafe": PH.cafe,
};
export const destPhoto = (slug: string, w = 900) => photo(photoBySlug[slug] ?? PH.beach, w);

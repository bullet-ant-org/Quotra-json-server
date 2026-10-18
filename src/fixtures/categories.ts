// DEV FIXTURE: replace with GET /v1/categories once the API exists.
export type CategoryId =
  | "accommodation"
  | "dining"
  | "nature"
  | "recreation"
  | "culture"
  | "nightlife"
  | "events";

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
  examples: string[];
}

export const categories: Category[] = [
  { id: "accommodation", name: "Stay", blurb: "Resorts, hotels, lodges and short-lets", examples: ["Resorts", "Hotels", "Guesthouses", "Short-lets"] },
  { id: "dining", name: "Eat and drink", blurb: "Restaurants, cafés and rooftop tables", examples: ["Restaurants", "Cafés", "Waterfront", "Rooftops"] },
  { id: "nature", name: "Outdoors", blurb: "Beaches, waterfalls, gardens and viewpoints", examples: ["Beaches", "Waterfalls", "Lakes", "Viewpoints"] },
  { id: "recreation", name: "Play", blurb: "Pools, parks, cinemas and sports", examples: ["Swimming pools", "Amusement parks", "Cinemas", "Sports"] },
  { id: "culture", name: "Culture", blurb: "Museums, galleries and heritage sites", examples: ["Museums", "Galleries", "Landmarks", "Heritage"] },
  { id: "nightlife", name: "Nightlife", blurb: "Lounges, clubs and live entertainment", examples: ["Lounges", "Clubs", "Bars", "Live venues"] },
  { id: "events", name: "Events", blurb: "Venues, picnics, boat trips and camping", examples: ["Event centres", "Boat trips", "Camping", "Picnics"] },
];

export const categoryById = (id: CategoryId) => categories.find((c) => c.id === id)!;

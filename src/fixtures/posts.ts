// DEV FIXTURE: sample public posts for the guest community preview.
export interface Post {
  id: string;
  author: string;
  handle: string;
  destinationSlug: string;
  kind: "review" | "photo" | "tip" | "question";
  body: string;
  rating?: number;
  likes: number;
  replies: number;
  when: string;
  incentivised?: boolean;
}

export const posts: Post[] = [
  { id: "p1", author: "Adaeze N.", handle: "adaeze.goes", destinationSlug: "ogbunike-falls-lookout", kind: "review", rating: 5, body: "Went at 8 am and had the lower pool almost to ourselves. The stairs are steep and slippery, so bring proper shoes. Worth every step.", likes: 128, replies: 14, when: "2 days ago" },
  { id: "p2", author: "Tunde A.", handle: "tunde_trails", destinationSlug: "obudu-ridge-camp", kind: "tip", body: "Book the dawn hike when you reserve. The cloud inversion is gone by 8:30, and the guides know exactly where to stand.", likes: 96, replies: 9, when: "4 days ago" },
  { id: "p3", author: "Ife O.", handle: "ife.eats", destinationSlug: "kora-terrace-kitchen", kind: "review", rating: 4, body: "Grilled croaker and plantain were the standout. Service slowed down after 8 on a Friday, so reserve a table before 7.", likes: 54, replies: 6, when: "1 week ago", incentivised: true },
  { id: "p4", author: "Musa K.", handle: "musa.kano", destinationSlug: "arewa-heritage-museum", kind: "question", body: "Is the textiles gallery open on Saturdays? Planning a family visit with kids under 10.", likes: 12, replies: 3, when: "3 hours ago" },
];

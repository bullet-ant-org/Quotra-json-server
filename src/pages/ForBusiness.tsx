import { Link } from "react-router-dom";
import { BarChart3, BadgeCheck, Coins, Inbox, Megaphone, Users } from "lucide-react";
import { useTitle } from "../lib/useTitle";

const features = [
  { icon: BadgeCheck, title: "A profile people trust", text: "Photos, prices, hours and facilities in one place, with a verified badge once we've checked your business." },
  { icon: Megaphone, title: "Publish updates", text: "Share offers, events and new menus with people who follow you." },
  { icon: Inbox, title: "One shared inbox", text: "Answer visitor questions as a team, assign conversations and save replies." },
  { icon: Coins, title: "Token offers you control", text: "Set what a visitor can redeem, how many are available and the rules. Staff confirm each code." },
  { icon: BarChart3, title: "Numbers you can read", text: "Profile views, direction taps and redemptions, clearly marked as measured or estimated." },
  { icon: Users, title: "Your team, your permissions", text: "Give marketing, support and front-desk staff only the access they need, per branch." },
];

export default function ForBusiness() {
  useTitle("For business");
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6">
        <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.04] sm:text-7xl">Get found by people who are ready to go.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">List your resort, restaurant or attraction on Roamly for free. Build a following, answer questions and bring visitors in with token offers.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register?type=business" className="rounded-full bg-accent px-7 py-3.5 font-bold text-accent-ink">List your place</Link>
          <Link to="/explore" className="rounded-full border border-line px-7 py-3.5 font-semibold">See how listings look</Link>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="f">
        <h2 id="f" className="sr-only">Features for businesses</h2>
        <ul className="grid gap-px overflow-hidden rounded-3xl bg-line md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="space-y-3 bg-bg p-7">
              <f.icon className="size-7 text-accent" aria-hidden="true" />
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6" aria-labelledby="how">
        <h2 id="how" className="text-3xl font-bold sm:text-4xl">Getting listed</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {["Create your owner account", "Add your place, location pin and photos", "Submit for review. We verify ownership and details", "Go live and start publishing"].map((t, i) => (
            <li key={t} className="border-t-2 border-accent pt-4">
              <span className="font-display text-sm font-bold text-accent-text">Step {i + 1}</span>
              <p className="mt-1 text-lg font-semibold">{t}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl text-sm text-muted">Basic listings are free. Paid plans for extra locations, staff seats and promotion tools will be added later. Token redemptions are a promotional rewards feature, not a cash payout.</p>
      </section>
    </>
  );
}

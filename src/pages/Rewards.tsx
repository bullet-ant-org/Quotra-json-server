import { Link } from "react-router-dom";
import { Coins, MapPinCheck, QrCode, ShieldCheck } from "lucide-react";
import { destinations } from "../fixtures/destinations";
import { DestinationCard } from "../components/DestinationCard";
import { useTitle } from "../lib/useTitle";

const steps = [
  { icon: MapPinCheck, title: "Check in at a place", text: "Open the place in Outsider while you're there. We compare your location with the venue and may ask for a quick retry if GPS is weak." },
  { icon: Coins, title: "Tokens land in your wallet", text: "Verified visits earn tokens once per place within the visit window. Every movement is listed in your history." },
  { icon: QrCode, title: "Redeem with the business", text: "Pick an offer, confirm the token cost and show your one-time code or QR to staff." },
];

export default function Rewards() {
  useTitle("Rewards");
  const offers = destinations.filter((d) => d.tokenOffer);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="max-w-3xl text-4xl font-extrabold sm:text-6xl">Go out. Earn tokens. Spend them on passes.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Outsider Tokens are promotional rewards for real visits and useful contributions. You can spend them on offers published by participating businesses.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/register" className="rounded-full bg-accent px-6 py-3 font-bold text-accent-ink">Start earning</Link>
        <Link to="/token-terms" className="rounded-full border border-line px-6 py-3 font-semibold">Read the token terms</Link>
      </div>

      <ol className="mt-16 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl bg-surface p-6">
            <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-ink"><s.icon className="size-5" aria-hidden="true" /><span className="sr-only">Step {i + 1}</span></span>
            <h2 className="mt-4 text-2xl font-bold">{s.title}</h2>
            <p className="mt-2 text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      <section className="mt-16 grid gap-6 md:grid-cols-2" aria-labelledby="fair">
        <div className="space-y-3">
          <h2 id="fair" className="text-3xl font-bold">Fair by design</h2>
          <p className="text-muted">Rewards only work if they're earned honestly, so we build in safeguards.</p>
        </div>
        <ul className="space-y-3">
          {[
            "Check-ins need your location to match the venue, and some venues also use short-lived QR codes.",
            "Each visit is rewarded once, even if a request is retried.",
            "Reviews earn tokens whether they're positive or negative. Incentives are always disclosed.",
            "Tokens aren't cash and can't be withdrawn or transferred.",
          ].map((t) => (
            <li key={t} className="flex gap-3"><ShieldCheck className="mt-1 size-5 shrink-0 text-accent-text" aria-hidden="true" />{t}</li>
          ))}
        </ul>
      </section>

      <section className="mt-16" aria-labelledby="offers">
        <h2 id="offers" className="text-3xl font-bold">Places with token offers</h2>
        <p className="mt-1 text-sm text-muted">Sample offers. Offers and token costs are set by each business.</p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{offers.map((d) => <li key={d.slug}><DestinationCard d={d} /></li>)}</ul>
      </section>
    </div>
  );
}

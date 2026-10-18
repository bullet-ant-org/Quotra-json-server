import { Link, Navigate } from "react-router-dom";
import { homeFor, useAuth } from "../lib/auth/AuthContext";
import { ArrowRight, Building2, Navigation } from "lucide-react";
import { HeroPhone } from "../components/landing/HeroPhone";
import { ProblemFlip } from "../components/landing/ProblemFlip";
import { MoodPicker } from "../components/landing/MoodPicker";
import { Bento } from "../components/landing/Bento";
import { WalletDemo } from "../components/landing/WalletDemo";
import { useTitle } from "../lib/useTitle";

const vibes = ["Pool days", "Rooftop dinners", "Waterfalls", "Quiet cafés", "Beach resorts", "Boat rides", "Live music", "Camping under stars", "Museums", "Sunset spots"];
const cities = ["Lagos", "Abuja", "Port Harcourt", "Calabar", "Kano", "Enugu", "Ibadan"];

function Marquee() {
  const row = vibes.map((v) => <li key={v} className="rounded-full border border-hero-ink/25 px-5 py-2.5 text-base font-semibold whitespace-nowrap">{v}</li>);
  return (
    <div className="marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]" aria-hidden="true">
      <ul className="marquee-track flex gap-3">{row}{row}</ul>
    </div>
  );
}

export default function Landing() {
  useTitle();
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return (
    <>
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-hero text-hero-ink lg:rounded-b-[4rem]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-20">
          <div className="space-y-6 lg:pb-24">
            <h1 className="text-[2.6rem] font-extrabold leading-[0.98] sm:text-6xl lg:text-7xl">
              Be an outsider. Go out more.
            </h1>
            <p className="max-w-md text-lg opacity-90 sm:text-xl">
              Your week shouldn't be home, work, phone, repeat. Outsider shows you the beaches, rooftops, events and hidden spots near you, and rewards you every time you step out.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/map" className="inline-flex items-center justify-center gap-2 rounded-full bg-bg px-7 py-4 text-lg font-bold text-ink shadow-lg active:scale-[0.98]"><Navigation className="size-5 text-accent" aria-hidden="true" />Find somewhere to go</Link>
              <Link to="/explore" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-hero-ink/40 px-7 py-4 text-lg font-bold">Browse by mood</Link>
            </div>
            <p className="text-sm opacity-80">Free. Getting out is good for you, we just make it easier.</p>
          </div>
          <div className="pt-2 lg:-mb-16"><HeroPhone /></div>
        </div>
        <div className="relative z-10 pb-6 pt-8 lg:pt-20"><Marquee /></div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6" aria-labelledby="prob">
        <h2 id="prob" className="max-w-3xl text-[2.1rem] font-extrabold leading-[1.02] sm:text-6xl">Staying in is easy. That's the problem.</h2>
        <p className="mt-3 text-lg text-muted">Four reasons people never leave the house. Tap a card to see how outsiders beat them.</p>
        <div className="mt-8"><ProblemFlip /></div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl sm:mt-24 px-4 sm:px-6" aria-labelledby="mood">
        <h2 id="mood" className="max-w-3xl text-[2.1rem] font-extrabold leading-[1.02] sm:text-6xl">Pick a vibe. We'll get you out the door.</h2>
        <p className="mb-8 mt-3 text-lg text-muted">Try it. Sample places for now.</p>
        <MoodPicker />
      </section>

      <section className="mx-auto mt-20 max-w-7xl sm:mt-24 px-4 sm:px-6" aria-labelledby="what">
        <h2 id="what" className="max-w-3xl text-[2.1rem] font-extrabold leading-[1.02] sm:text-6xl">Everything an outsider needs.</h2>
        <div className="mt-8"><Bento /></div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl sm:mt-24 px-4 sm:px-6" aria-labelledby="tok">
        <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-accent p-6 text-accent-ink sm:p-12 lg:grid-cols-2">
          <div className="space-y-5">
            <h2 id="tok" className="text-[2.1rem] font-extrabold leading-[1.02] sm:text-6xl">Step out. Get paid in passes.</h2>
            <p className="max-w-md text-lg opacity-95">Check in at a place and we verify you're really there. Tokens land in your wallet and pay for pool access, a free drink or a guided tour, whatever the business offers.</p>
            <Link to="/rewards" className="inline-flex items-center gap-2 rounded-full bg-bg px-6 py-3.5 font-bold text-ink active:scale-[0.98]">How tokens work <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <p className="text-sm opacity-90">Tokens are promotional rewards, not cash.</p>
          </div>
          <WalletDemo />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl sm:mt-24 px-4 sm:px-6" aria-labelledby="where">
        <h2 id="where" className="max-w-3xl text-[2.1rem] font-extrabold leading-[1.02] sm:text-6xl">Outsiders are already out in.</h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {cities.map((c) => <li key={c} className="rounded-full bg-surface px-5 py-3 font-semibold">{c}</li>)}
          <li className="rounded-full border border-dashed border-line px-5 py-3 text-muted">More soon</li>
        </ul>
      </section>

      <section className="mx-auto mt-20 max-w-7xl sm:mt-24 px-4 sm:px-6" aria-labelledby="biz">
        <div className="rounded-[2rem] bg-ink p-7 text-bg sm:p-12">
          <Building2 className="size-9 text-accent" aria-hidden="true" />
          <h2 id="biz" className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.02] sm:text-5xl">Own a place worth finding?</h2>
          <p className="mt-3 max-w-xl text-lg opacity-80">Get a free listing, answer questions, reply to reviews and bring people through the door with token offers you control.</p>
          <Link to="/for-business" className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-lg font-bold text-accent-ink active:scale-[0.98]">List your place <ArrowRight className="size-5" aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-4 text-center sm:px-6" aria-labelledby="end">
        <h2 id="end" className="text-5xl font-extrabold leading-[1] sm:text-7xl">Your couch will be fine without you.</h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/map" className="rounded-full bg-accent px-8 py-4 text-lg font-bold text-accent-ink active:scale-[0.98]">Open the map</Link>
          <Link to="/register" className="rounded-full border-2 border-line px-8 py-4 text-lg font-bold">Create free account</Link>
        </div>
      </section>
    </>
  );
}

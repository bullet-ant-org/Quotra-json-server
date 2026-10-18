import { Link } from "react-router-dom";
import { useTitle } from "../lib/useTitle";
import { PinMark } from "../components/Logo";

export default function NotFound({ what = "page" }: { what?: string }) {
  useTitle("Not found");
  return (
    <div className="mx-auto grid max-w-xl place-items-center gap-4 px-4 py-28 text-center">
      <PinMark className="size-14 -rotate-12 text-accent" />
      <h1 className="text-4xl font-extrabold">We couldn't find that {what}</h1>
      <p className="text-muted">It may have moved, closed or never existed. Try exploring instead.</p>
      <div className="flex gap-3">
        <Link to="/explore" className="rounded-full bg-accent px-5 py-2.5 font-bold text-accent-ink">Explore places</Link>
        <Link to="/" className="rounded-full border border-line px-5 py-2.5 font-semibold">Home</Link>
      </div>
    </div>
  );
}

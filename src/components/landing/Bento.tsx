import { BadgeCheck, MapPin, Send } from "lucide-react";
import { Spotlight } from "./Spotlight";

const pill = "rounded-full bg-bg px-3 py-1.5 text-xs font-semibold shadow-sm";

export function Bento() {
  return (
    <div className="grid gap-4 md:grid-cols-6">
      <Spotlight className="md:col-span-4">
        <div className="flex h-full flex-col gap-6 p-6 sm:p-8">
          <div className="max-w-md">
            <h3 className="text-3xl font-extrabold leading-tight">A map that tells you what's worth it</h3>
            <p className="mt-2 text-muted">Price, distance, rating and open hours on every pin. Filter by what matters and the map follows.</p>
          </div>
          <div className="relative mt-auto h-40 overflow-hidden rounded-2xl bg-bg">
            <svg viewBox="0 0 400 160" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <g fill="none" stroke="var(--c-line)" strokeLinecap="round" strokeWidth="6"><path d="M-10 90 L410 60" /><path d="M120 -10 Q140 80 110 170" /><path d="M280 -10 L300 170" strokeWidth="4" /></g>
              {[[70, 60], [190, 100], [330, 50], [250, 130]].map(([x, y], n) => (
                <g key={n} transform={`translate(${x} ${y})`}><path d="M0 -22 a10 10 0 0 0 -10 10 c0 7 10 20 10 20 s10 -13 10 -20 a10 10 0 0 0 -10 -10Z" fill={n === 1 ? "var(--c-accent)" : "var(--c-ink)"} /><circle cy="-12" r="3.5" fill="var(--c-bg)" /></g>
              ))}
            </svg>
            <span className={`${pill} absolute left-[34%] top-3`}>₦6,500 · 4.4 ★</span>
            <span className={`${pill} absolute bottom-3 right-4`}>Open until 11 pm</span>
          </div>
        </div>
      </Spotlight>

      <Spotlight className="md:col-span-2">
        <div className="flex h-full flex-col gap-4 p-6 sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-ink"><MapPin className="size-6" aria-hidden="true" /></span>
          <h3 className="text-2xl font-extrabold leading-tight">Check in, get rewarded</h3>
          <p className="text-muted">Prove you're there and earn tokens you can spend at the places you love.</p>
        </div>
      </Spotlight>

      <Spotlight className="md:col-span-3">
        <div className="space-y-4 p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold leading-tight">Ask before you go</h3>
          <div className="space-y-2 text-sm">
            <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-accent-ink">Is the pool open on Sundays?</p>
            <p className="w-fit max-w-[80%] rounded-2xl rounded-bl-md bg-bg px-4 py-2.5">Yes, 9 am to 7 pm. Kids' pool closes at 5.</p>
            <p className="flex items-center gap-1.5 text-xs text-muted"><BadgeCheck className="size-3.5 text-accent-text" aria-hidden="true" />Answered by the business</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-bg px-4 py-2.5 text-sm text-muted"><span className="flex-1">Message the venue</span><Send className="size-4 text-accent" aria-hidden="true" /></div>
        </div>
      </Spotlight>

      <Spotlight className="md:col-span-3">
        <div className="space-y-4 p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold leading-tight">Reviews you can trust</h3>
          <p className="text-muted">Written by people who visited. If someone was rewarded for feedback, it says so, and tokens never depend on the rating.</p>
          <div className="flex flex-wrap gap-2"><span className={pill}>Verified visit</span><span className={pill}>Incentive disclosed</span><span className={pill}>Business can reply, not delete</span></div>
        </div>
      </Spotlight>
    </div>
  );
}

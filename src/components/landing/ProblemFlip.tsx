import { useState } from "react";
import { motion } from "motion/react";
import { RotateCw } from "lucide-react";

const cards = [
  { q: "“Where should we go?”", qa: "“Idk, you pick.”", a: "Browse by mood, budget and distance, save places to a collection and send the link to the group chat." },
  { q: "Google says it's open.", qa: "It's not.", a: "Hours, prices and answers come from the business itself, with the date they last confirmed." },
  { q: "The “hidden gem” was a two-hour drive.", qa: "And a letdown.", a: "Real distance, real prices and reviews from people who went, with photos of what it's actually like." },
  { q: "You went. You spent.", qa: "You got nothing back.", a: "Check in at a place and earn Roamly Tokens toward free entry, a drink or an experience." },
];

function Flip({ c }: { c: (typeof cards)[number] }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className="group relative block h-64 w-[78vw] max-w-80 shrink-0 snap-center text-left [perspective:1200px] sm:w-auto sm:max-w-none"
    >
      <motion.div className="relative size-full [transform-style:preserve-3d]" animate={{ rotateY: on ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}>
        <div className="absolute inset-0 flex flex-col justify-between rounded-[1.75rem] bg-surface p-6 [backface-visibility:hidden]">
          <p className="font-display text-3xl font-bold leading-[1.05]">{c.q}<br /><span className="text-muted">{c.qa}</span></p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-text"><RotateCw className="size-4" aria-hidden="true" />Tap to fix it</span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between rounded-[1.75rem] bg-accent p-6 text-accent-ink [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="font-display text-sm font-bold opacity-80">With Roamly</p>
          <p className="font-display text-2xl font-bold leading-tight">{c.a}</p>
        </div>
      </motion.div>
    </button>
  );
}

export function ProblemFlip() {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {cards.map((c) => <li key={c.q} className="contents sm:block"><Flip c={c} /></li>)}
    </ul>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthContext";
import { interests } from "../../fixtures/account";
import { actions, person, useStore } from "../../lib/store";
import { useTitle } from "../../lib/useTitle";

function Toggle({ label, hint, defaultOn = false }: { label: string; hint?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
      <span><span className="block font-semibold">{label}</span>{hint && <span className="block text-sm text-muted">{hint}</span>}</span>
      <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-surface-2"}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

const group = "divide-y divide-line overflow-hidden rounded-2xl border border-line";

export default function Settings() {
  useTitle("Settings");
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const blocked = useStore((s) => s.blocked.map((id) => person(s, id)));
  const [picked, setPicked] = useState<string[]>(["Nature", "Dining", "Resorts"]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 pb-10 pt-6 sm:px-6">
      <h1 className="text-4xl font-extrabold">Settings</h1>

      <section className="space-y-3"><h2 className="text-lg font-bold">Account</h2>
        <div className={group}>
          {[["Name", `${user!.firstName} ${user!.lastName}`], ["Username", `@${user!.username}`], ["Email", user!.email], ["Password", "••••••••••"]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 px-4 py-4"><span className="font-semibold">{k}</span><span className="flex min-w-0 items-center gap-1 truncate text-muted">{v}<ChevronRight className="size-4 shrink-0" aria-hidden="true" /></span></div>
          ))}
        </div>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-bold">Interests</h2>
        <p className="text-sm text-muted">We use these to recommend places. Change them any time.</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((i) => { const on = picked.includes(i); return <button key={i} aria-pressed={on} onClick={() => setPicked((p) => on ? p.filter((x) => x !== i) : [...p, i])} className={`rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-accent text-accent-ink" : "bg-surface"}`}>{i}</button>; })}
        </div>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-bold">Privacy</h2>
        <div className={group}>
          <Toggle label="Public profile" hint="Anyone can see your posts and badges" defaultOn />
          <Toggle label="Show my check-ins" hint="Places you check in at appear on your profile" />
          <Toggle label="Allow messages from anyone" hint="Otherwise only people you follow" />
          <Toggle label="Personalised recommendations" defaultOn />
        </div>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-bold">Notifications</h2>
        <div className={group}>
          <Toggle label="Rewards and challenges" defaultOn />
          <Toggle label="Messages" defaultOn />
          <Toggle label="Likes, comments and follows" defaultOn />
          <Toggle label="Offers and promotions" hint="Optional marketing from Outsider" />
        </div>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-bold">Blocked accounts</h2>
        {blocked.length ? <div className={group}>{blocked.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3"><img src={p.avatar} alt="" className="size-10 rounded-full object-cover" /><span className="flex-1"><span className="block font-semibold">{p.name}</span><span className="text-sm text-muted">@{p.username}</span></span>
            <button onClick={() => actions.unblock(p.id)} className="rounded-full bg-surface px-4 py-2 text-sm font-bold">Unblock</button></div>
        ))}</div> : <p className="text-sm text-muted">You haven't blocked anyone. Use the ⋯ menu on a post or a profile to block someone.</p>}
      </section>

      <section className="space-y-3"><h2 className="text-lg font-bold">Security</h2>
        <div className={group}>
          <Toggle label="Two-step verification" hint="Ask for a code when you log in on a new device" />
          <div className="flex items-center justify-between px-4 py-4"><span><span className="block font-semibold">Active sessions</span><span className="text-sm text-muted">This browser</span></span><button className="text-sm font-bold text-accent-text">Log out others</button></div>
        </div>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-bold">Your data</h2>
        <div className={group}>
          <button className="flex w-full justify-between px-4 py-4 text-left font-semibold">Download my data<ChevronRight className="size-4 text-muted" /></button>
          <button onClick={() => { if (confirm("Reset all demo data on this device?")) actions.reset(); }} className="flex w-full justify-between px-4 py-4 text-left font-semibold">Reset demo data<ChevronRight className="size-4 text-muted" /></button>
          <button className="flex w-full justify-between px-4 py-4 text-left font-semibold text-red-600">Deactivate account<ChevronRight className="size-4" /></button>
        </div>
      </section>

      <p className="text-xs text-muted">Changes here aren't saved yet. They'll sync once the account API is connected.</p>

      <button onClick={async () => { await logout(); nav("/", { replace: true }); }} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-line py-3.5 font-bold text-red-600 dark:text-red-400"><LogOut className="size-5" aria-hidden="true" />Log out</button>
    </div>
  );
}

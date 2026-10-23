import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthContext";
import { interests } from "../../fixtures/account";
import { actions, person, useStore } from "../../lib/store";
import { useTitle } from "../../lib/useTitle";
import { LoginDetails } from "../../components/LoginDetails";
import { request } from "../../lib/api";
import { LIVE } from "../../lib/store";
import { enablePush, pushState } from "../../lib/push";
import type { FormEvent } from "react";

function PushToggle() {
  const [st, setSt] = useState(pushState());
  const [msg, setMsg] = useState<string | null>(null);
  if (st === "unsupported") return null;
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <span><span className="block font-semibold">Push notifications</span><span className="text-sm text-muted">{msg ?? (st === "granted" ? "On for this device" : st === "denied" ? "Blocked in your browser settings" : "New posts from people you follow, replies and rewards")}</span></span>
      {st !== "granted" && <button disabled={st === "denied"} onClick={async () => { const e = await enablePush().catch((x) => (x as Error).message); setMsg(e); setSt(pushState()); }} className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink disabled:opacity-40">Turn on</button>}
    </div>
  );
}

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
  const me = useStore((s) => person(s, s.me));
  const [prof, setProf] = useState({ firstName: user!.firstName, lastName: user!.lastName ?? "", bio: me.bio ?? "" });
  const [saved, setSaved] = useState(false);
  const field = "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-normal outline-none focus:border-accent";
  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try { if (LIVE) await request("PATCH", "/me", prof); actions.updateProfile(`${prof.firstName} ${prof.lastName}`.trim(), prof.bio); setSaved(true); setTimeout(() => setSaved(false), 1500); }
    catch (e2) { alert((e2 as Error).message); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 pb-10 pt-6 sm:px-6">
      <h1 className="text-4xl font-extrabold">Settings</h1>

      <section className="space-y-3"><h2 className="text-lg font-bold">Account</h2>
        <form onSubmit={saveProfile} className={`${group} space-y-3 p-4`}>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1 text-sm font-semibold">First name<input value={prof.firstName} onChange={(e) => setProf({ ...prof, firstName: e.target.value })} required maxLength={40} className={field} /></label>
            <label className="block space-y-1 text-sm font-semibold">Last name<input value={prof.lastName} onChange={(e) => setProf({ ...prof, lastName: e.target.value })} maxLength={40} className={field} /></label>
          </div>
          <label className="block space-y-1 text-sm font-semibold">Bio<textarea rows={3} maxLength={300} value={prof.bio} onChange={(e) => setProf({ ...prof, bio: e.target.value })} className={field} /></label>
          <p className="text-sm text-muted">Username <b>@{user!.username}</b>. Change your photo and banner from your profile.</p>
          <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink">{saved ? "Saved ✓" : "Save profile"}</button>
        </form>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-bold">Interests</h2>
        <p className="text-sm text-muted">We use these to recommend places. Change them any time.</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((i) => { const on = picked.includes(i); return <button key={i} aria-pressed={on} onClick={() => { const next = on ? picked.filter((x) => x !== i) : [...picked, i]; setPicked(next); if (LIVE) request("PATCH", "/me", { interests: next }).catch(() => {}); }} className={`rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-accent text-accent-ink" : "bg-surface"}`}>{i}</button>; })}
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
          <PushToggle />
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
        <div className={`${group} p-4`}><LoginDetails email={user?.email} /></div>
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

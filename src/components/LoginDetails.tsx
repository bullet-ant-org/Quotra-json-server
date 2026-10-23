import { useState, type FormEvent } from "react";
import { request } from "../lib/api";
import { LIVE } from "../lib/store";

// Change login email and/or password. The server asks for the current password.
export function LoginDetails({ email }: { email?: string }) {
  const [f, setF] = useState({ email: email ?? "", password: "", currentPassword: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const cls = "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 outline-none focus:border-accent";
  const save = async (e: FormEvent) => {
    e.preventDefault(); setMsg(null);
    if (!LIVE) return setMsg({ ok: false, text: "Login details can only be changed when connected to the server." });
    setBusy(true);
    try {
      await request("PATCH", "/auth/account", { currentPassword: f.currentPassword, ...(f.email && f.email !== email ? { email: f.email } : {}), ...(f.password ? { password: f.password } : {}) });
      setF({ ...f, password: "", currentPassword: "" }); setMsg({ ok: true, text: "Saved. Use the new details next time you log in." });
    } catch (e2) { setMsg({ ok: false, text: (e2 as Error).message }); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block space-y-1 text-sm font-semibold">Email<input type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={cls} /></label>
      <label className="block space-y-1 text-sm font-semibold">New password<input type="password" autoComplete="new-password" minLength={8} placeholder="Leave blank to keep it" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={cls} /></label>
      <label className="block space-y-1 text-sm font-semibold">Current password<input type="password" autoComplete="current-password" required value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} className={cls} /></label>
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>}
      <button disabled={busy || !f.currentPassword} className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:opacity-40">{busy ? "Saving…" : "Save login details"}</button>
    </form>
  );
}

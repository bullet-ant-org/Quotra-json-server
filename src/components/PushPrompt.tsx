import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { enablePush, pushState, refreshPush } from "../lib/push";

// Friendly opt-in card shown on the feed until the person decides.
export function PushPrompt() {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const st = pushState();
    if (st === "granted") refreshPush();
    let dismissed = false; try { dismissed = !!localStorage.getItem("outsider-push-dismissed"); } catch { /* */ }
    setShow(st === "default" && !dismissed);
  }, []);
  if (!show) return null;
  const close = () => { try { localStorage.setItem("outsider-push-dismissed", "1"); } catch { /* */ } setShow(false); };
  return (
    <div className="relative mt-3 flex items-center gap-3 overflow-hidden rounded-2xl bg-accent p-4 text-accent-ink">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/20"><BellRing className="size-5" /></span>
      <div className="min-w-0 flex-1"><p className="font-bold leading-tight">Don't miss where friends go</p><p className="text-sm opacity-90">{msg ?? "Get a ping when people you follow post."}</p></div>
      <button onClick={async () => { const e = await enablePush().catch((x) => (x as Error).message); if (e) setMsg(e); else close(); }} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-accent">Turn on</button>
      <button onClick={close} aria-label="Dismiss" className="absolute right-1.5 top-1.5 opacity-70"><X className="size-4" /></button>
    </div>
  );
}

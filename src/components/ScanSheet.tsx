import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, QrCode } from "lucide-react";
import { Sheet } from "./Sheet";
import { actions, POST_BONUS } from "../lib/store";
import { destinations } from "../fixtures/destinations";

// Business check-in QR codes read "outsider:checkin:<place-slug>". Uses the camera where the browser supports it.
export function ScanSheet({ onClose }: { onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [cam, setCam] = useState(true);
  const nav = useNavigate();

  const submit = async (raw: string) => {
    const slug = raw.trim().replace(/^outsider:checkin:/i, "");
    const d = destinations.find((x) => x.slug === slug);
    if (!d) return setErr("That code isn't an Outsider check-in code.");
    const e = await actions.checkIn(d.slug, d.checkInTokens);
    if (e) setErr(e); else setDone(d.slug);
  };

  useEffect(() => {
    let stream: MediaStream | null = null, stop = false;
    const Detector = (window as unknown as { BarcodeDetector?: new (o: object) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices) { setCam(false); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(async (s) => {
      stream = s; if (!video.current) return;
      video.current.srcObject = s; await video.current.play();
      const det = new Detector({ formats: ["qr_code"] });
      const loop = async () => { if (stop || !video.current) return; const r = await det.detect(video.current).catch(() => []); if (r[0]) { stop = true; submit(r[0].rawValue); } else requestAnimationFrame(loop); };
      loop();
    }).catch(() => setCam(false));
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const d = destinations.find((x) => x.slug === done);
  return (
    <Sheet title="Check in" onClose={onClose}>
      <div className="space-y-4 p-5">
        {d ? (
          <div className="space-y-3 text-center">
            <CheckCircle2 className="mx-auto size-14 text-accent" />
            <p className="font-display text-2xl font-extrabold">You're checked in at {d.name}</p>
            <p className="text-muted">+{d.checkInTokens} tokens added. Post about it in the next 24 hours for <b className="text-accent-text">+{POST_BONUS} bonus tokens</b>.</p>
            <button onClick={() => { onClose(); nav(`/home?post=${d.slug}`); }} className="w-full rounded-full bg-accent py-3 font-bold text-accent-ink">Post now for +{POST_BONUS}</button>
            <button onClick={onClose} className="w-full rounded-full bg-surface py-3 font-bold">Later</button>
          </div>
        ) : <>
          {cam ? <div className="relative aspect-square overflow-hidden rounded-3xl bg-black"><video ref={video} muted playsInline className="size-full object-cover" /><div className="absolute inset-10 rounded-3xl border-4 border-white/80" /></div>
            : <div className="grid aspect-[2/1] place-items-center rounded-3xl bg-surface text-center text-sm text-muted"><div><QrCode className="mx-auto size-10" /><p className="mt-2">Camera scanning isn't available in this browser. Enter the code under the QR instead.</p></div></div>}
          <p className="text-center text-sm text-muted">Point your camera at the Outsider QR at the counter.</p>
          <form onSubmit={(e) => { e.preventDefault(); setErr(null); submit(code); }} className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Or type the place code" aria-label="Place code" className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2.5 text-sm outline-none" />
            <button className="rounded-full bg-accent px-5 font-bold text-accent-ink">Check in</button>
          </form>
          {err && <p role="alert" className="text-center text-sm font-medium text-red-600">{err}</p>}
        </>}
      </div>
    </Sheet>
  );
}

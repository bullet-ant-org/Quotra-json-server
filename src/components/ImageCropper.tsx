import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Drag to position, slide to zoom. The bright frame is exactly what gets saved; the dimmed part is cut off.
export function ImageCropper({ file, aspect, round = false, title, onDone, onClose }: { file: File; aspect: number; round?: boolean; title: string; onDone: (f: File) => void; onClose: () => void }) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [W, setW] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  useEffect(() => { const i = new Image(); i.onload = () => setImg(i); i.src = url; return () => URL.revokeObjectURL(url); }, [url]);
  useEffect(() => { const el = frame.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  const H = W / aspect;
  const scale = img ? Math.max(W / img.width, H / img.height) * zoom : 1;
  const dw = (img?.width ?? 0) * scale, dh = (img?.height ?? 0) * scale;
  const clamp = (p: { x: number; y: number }) => ({ x: Math.min(0, Math.max(W - dw, p.x)), y: Math.min(0, Math.max(H - dh, p.y)) });
  // Keep the picture centred when it first loads or the frame resizes; keep it inside the frame when zooming.
  useEffect(() => { if (img && W) setPos((p) => (p.x === 0 && p.y === 0 ? clamp({ x: (W - dw) / 2, y: (H - dh) / 2 }) : clamp(p))); }, [img, W, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    if (!img) return;
    const outW = aspect >= 1 ? 1600 : 800, outH = Math.round(outW / aspect);
    const c = document.createElement("canvas"); c.width = outW; c.height = outH;
    c.getContext("2d")!.drawImage(img, -pos.x / scale, -pos.y / scale, W / scale, H / scale, 0, 0, outW, outH);
    c.toBlob((b) => b && onDone(new File([b], round ? "avatar.jpg" : "banner.jpg", { type: "image/jpeg" })), "image/jpeg", 0.9);
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between p-4"><button onClick={onClose} aria-label="Cancel" className="grid size-10 place-items-center rounded-full bg-white/10"><X className="size-5" /></button><p className="font-bold">{title}</p><button onClick={save} disabled={!img} className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-ink">Save</button></div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <div ref={frame} className={`relative w-full max-w-2xl touch-none select-none ${round ? "max-w-xs" : ""}`} style={{ aspectRatio: aspect }}
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; }}
          onPointerMove={(e) => { const d = drag.current; if (d) setPos(clamp({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y })); }}
          onPointerUp={() => { drag.current = null; }}>
          {img && <img src={url} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ left: pos.x, top: pos.y, width: dw, height: dh }} />}
          <div className={`pointer-events-none absolute inset-0 ring-2 ring-white ${round ? "rounded-full" : "rounded-xl"}`} style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,.62)" }} />
        </div>
      </div>
      <div className="mx-auto w-full max-w-md space-y-2 p-6 pb-10">
        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(+e.target.value)} aria-label="Zoom" className="w-full accent-[var(--color-accent)]" />
        <p className="text-center text-sm text-white/70">Drag to move · slide to zoom. Only what's inside the frame shows.</p>
      </div>
    </div>,
    document.body,
  );
}

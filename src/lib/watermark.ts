// Downloads a post's photo or video with an Outsider watermark (logo + @username), Instagram-style.
const PIN = new Path2D("M16 5.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 13.5 7.5 13.5s7.5-7.9 7.5-13.5A7.5 7.5 0 0 0 16 5.5Z");

function stamp(ctx: CanvasRenderingContext2D, w: number, h: number, user: string) {
  const u = Math.max(14, Math.round(w / 28)); // scales with the media
  const x = u, y = h - u * 1.4;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = u * 0.5;
  ctx.translate(x, y - u * 1.6); ctx.scale(u / 16, u / 16); ctx.fillStyle = "#fff"; ctx.fill(PIN);
  ctx.beginPath(); ctx.arc(16, 13, 2.8, 0, Math.PI * 2); ctx.fillStyle = "#FF5A00"; ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#fff"; ctx.font = `800 ${u * 1.15}px system-ui, sans-serif`; ctx.textBaseline = "alphabetic";
  ctx.fillText("Outsider", x + u * 2.3, y - u * 0.35);
  ctx.font = `600 ${u * 0.85}px system-ui, sans-serif`; ctx.globalAlpha = 0.92;
  ctx.fillText(`@${user}`, x + u * 2.3, y + u * 0.75);
  ctx.restore();
}

// Fresh CORS request: a copy already cached by an <img> tag has no CORS headers and would taint the canvas.
const fresh = (src: string) => (src.startsWith("data:") || src.startsWith("blob:") ? src : `${src}${src.includes("?") ? "&" : "?"}dl=1`);

async function save(blob: Blob, name: string) {
  const file = new File([blob], name, { type: blob.type });
  // On phones the share sheet has "Save image/video"; elsewhere fall back to a normal download.
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file] }); return; } catch (e) { if ((e as Error).name === "AbortError") return; } }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export async function downloadImage(src: string, user: string) {
  const img = new Image(); img.crossOrigin = "anonymous";
  await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = fresh(src); });
  const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d")!; ctx.drawImage(img, 0, 0); stamp(ctx, c.width, c.height, user);
  const blob = await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), "image/jpeg", 0.92));
  await save(blob, `outsider-${user}.jpg`);
}

// Re-records the video through a canvas with the watermark drawn on every frame (keeps audio where the browser allows).
export async function downloadVideo(src: string, user: string, onProgress?: (p: number) => void) {
  const v = document.createElement("video"); v.crossOrigin = "anonymous"; v.playsInline = true; v.src = fresh(src); v.muted = true;
  await new Promise((ok, bad) => { v.onloadedmetadata = ok; v.onerror = bad; });
  const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext("2d")!;
  const stream = c.captureStream(30);
  const audio = (v as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.().getAudioTracks() ?? [];
  audio.forEach((t) => stream.addTrack(t));
  const type = ["video/mp4", "video/webm;codecs=vp9", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 5e6 });
  const chunks: Blob[] = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((ok) => (rec.onstop = () => ok()));
  const draw = () => { ctx.drawImage(v, 0, 0, c.width, c.height); stamp(ctx, c.width, c.height, user); onProgress?.(v.currentTime / (v.duration || 1)); if (!v.ended) requestAnimationFrame(draw); };
  rec.start(250); await v.play(); draw();
  await new Promise((ok) => (v.onended = ok)); rec.stop(); await done;
  await save(new Blob(chunks, { type: type.split(";")[0] }), `outsider-${user}.${type.includes("mp4") ? "mp4" : "webm"}`);
}

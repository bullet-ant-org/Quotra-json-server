import { get, post } from "./api";
import { LIVE } from "./store";

// Web push: ask permission, subscribe through the service worker, register with the API.
export const pushSupported = () => LIVE && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
export const pushState = (): NotificationPermission | "unsupported" => (pushSupported() ? Notification.permission : "unsupported");

const b64 = (s: string) => { const p = "=".repeat((4 - (s.length % 4)) % 4); const raw = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(raw, (c) => c.charCodeAt(0)); };

export async function enablePush(): Promise<string | null> {
  if (!pushSupported()) return "This browser can't show notifications. On iPhone, add Outsider to your Home Screen first.";
  const { key } = await get<{ key: string | null }>("/push/key");
  if (!key) return "Notifications aren't set up on the server yet.";
  if ((await Notification.requestPermission()) !== "granted") return "Notifications are blocked. Allow them in your browser settings.";
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(key) }));
  await post("/push/subscribe", sub.toJSON());
  return null;
}

// Re-register silently if permission was already granted (subscriptions can rotate).
export async function refreshPush() {
  if (pushState() !== "granted") return;
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await post("/push/subscribe", sub.toJSON()); else await enablePush(); } catch { /* ignore */ }
}

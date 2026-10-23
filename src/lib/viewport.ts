// Tracks the visible area of the screen (it shrinks when the on-screen keyboard opens).
// Exposes --vvh / --vvt CSS vars so sheets, chats and dialogs keep their text field just above the keyboard,
// and toggles .kb-open on <html> so the bottom dock can hide while typing.
export function trackViewport() {
  const vv = window.visualViewport;
  const root = document.documentElement;
  const update = () => {
    const h = vv?.height ?? innerHeight, top = vv?.offsetTop ?? 0;
    root.style.setProperty("--vvh", `${h}px`);
    root.style.setProperty("--vvt", `${top}px`);
    root.classList.toggle("kb-open", innerHeight - h > 140);
  };
  update();
  vv?.addEventListener("resize", update);
  vv?.addEventListener("scroll", update);
  addEventListener("resize", update);
  // When a field gets focus, keep it in view once the keyboard has finished opening.
  addEventListener("focusin", (e) => {
    const el = e.target as HTMLElement;
    if (!el.matches?.("input, textarea, [contenteditable]")) return;
    setTimeout(() => el.scrollIntoView({ block: "nearest" }), 300);
  });
}
